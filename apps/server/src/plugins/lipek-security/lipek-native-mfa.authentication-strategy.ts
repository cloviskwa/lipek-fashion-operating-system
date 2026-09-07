import { Injector, NativeAuthenticationStrategy, RequestContext, User } from '@vendure/core';
import { ID } from '@vendure/common/lib/shared-types';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

import { MfaCodeService } from './services/mfa-code.service';
import { MfaService } from './services/mfa.service';
import { TotpService } from './services/totp.service';
import { WebAuthnService } from './services/web-authn.service';

/**
 * Distinguishing failure codes surfaced to clients. `AuthService` wraps any
 * string return from `authenticate()` in an `InvalidCredentialsError`, with
 * our code carried in the `authenticationError` field. Clients (storefront,
 * Dashboard, mobile) branch on these values to drive the second-step UI.
 *
 * They deliberately carry no information beyond "a second factor is now
 * expected": they are only ever returned *after* the correct password has
 * been presented, so there is no account-existence leak.
 */
export const MFA_SECOND_FACTOR_REQUIRED = 'MFA_SECOND_FACTOR_REQUIRED';
export const MFA_SECOND_FACTOR_INVALID = 'MFA_SECOND_FACTOR_INVALID';
export const MFA_WEBAUTHN_REQUIRED = 'MFA_WEBAUTHN_REQUIRED';
export const MFA_WEBAUTHN_INVALID = 'MFA_WEBAUTHN_INVALID';

interface WebAuthnLoginData {
    correlationKey: string;
    /** JSON-serialized `AuthenticationResponseJSON` from `@simplewebauthn/browser`. */
    assertion: string;
}

export interface NativeMfaAuthenticationData {
    username: string;
    password: string;
    /** TOTP, backup or recovery code — whichever applies to the account. */
    secondFactorCode?: string | null;
    /** A completed passkey assertion, from the anonymous challenge endpoint. */
    webAuthn?: WebAuthnLoginData | null;
}

/**
 * The platform's only authentication strategy, replacing Vendure's
 * `NativeAuthenticationStrategy` under the same `'native'` name (`SEC-001`,
 * `ADR-0006`).
 *
 * Keeping the name `'native'` is load-bearing:
 * - the deprecated `login(username, password)` mutation and the Dashboard's
 *   sign-in both hardcode the native strategy name;
 * - `AuthService.verifyUserPassword` (used by `updatePassword`) resolves the
 *   strategy *by name* and calls `verifyUserPassword` on it;
 * - `AttemptedLoginEvent` extracts the username only for the native name.
 *
 * Replacing (not supplementing) the built-in strategy is what makes MFA
 * enforceable: if the stock native strategy remained registered, it would be
 * a complete MFA bypass via `authenticate(input: { native: ... })`.
 *
 * Login flow (`ADR-0006`):
 * 1. password verification (same timing protections as the native strategy);
 * 2. if a WebAuthn assertion is presented, it must verify — done;
 * 3. privileged accounts under `privileged` enforcement must present a
 *    WebAuthn assertion; no code satisfies them;
 * 4. accounts with an enrolled factor must present a second factor, checked
 *    as TOTP → backup code → recovery code;
 * 5. otherwise the plain password login proceeds unchanged.
 */
export class LipekNativeMfaAuthenticationStrategy {
    readonly name = 'native';

    private native: NativeAuthenticationStrategy | undefined;
    private mfa: MfaService | undefined;
    private totp: TotpService | undefined;
    private webAuthn: WebAuthnService | undefined;
    private codes: MfaCodeService | undefined;

    /**
     * The strategy instance is constructed outside the Nest container (in
     * `vendure-config.ts`), so every dependency is resolved here, in
     * `init()`, exactly as the built-in strategies do.
     */
    async init(injector: Injector): Promise<void> {
        // The composed native strategy provides the battle-tested password
        // verification path (dummy-hash timing protection, selective hash
        // loading) without reimplementing any of it.
        this.native = new NativeAuthenticationStrategy();
        await this.native.init(injector);
        this.mfa = injector.get(MfaService);
        this.totp = injector.get(TotpService);
        this.webAuthn = injector.get(WebAuthnService);
        this.codes = injector.get(MfaCodeService);
    }

    private deps() {
        if (!this.native || !this.mfa || !this.totp || !this.webAuthn || !this.codes) {
            throw new Error('LipekNativeMfaAuthenticationStrategy used before init()');
        }
        return {
            native: this.native,
            mfa: this.mfa,
            totp: this.totp,
            webAuthn: this.webAuthn,
            codes: this.codes,
        };
    }

    defineInputType(): DocumentNode {
        // Same input type name and `username`/`password` fields as the
        // built-in strategy, so existing clients keep working; the second
        // factor fields are additive and optional.
        return gql`
            input NativeAuthInput {
                username: String!
                password: String!
                """TOTP, backup or recovery code, when the account has MFA enrolled."""
                secondFactorCode: String
                """A completed passkey assertion (from the anonymous challenge query)."""
                webAuthn: WebAuthnLoginInput
            }
            input WebAuthnLoginInput {
                correlationKey: String!
                """
                The AuthenticationResponseJSON from the browser's
                startAuthentication(), JSON-serialized. (String rather than the
                JSON scalar: strategy input SDL is validated before the schema's
                custom scalars are registered.)
                """
                assertion: String!
            }
        `;
    }

    async authenticate(ctx: RequestContext, data: NativeMfaAuthenticationData): Promise<User | false | string> {
        const { mfa, totp, webAuthn, codes } = this.deps();
        const user = await mfa.verifyPassword(ctx, data.username, data.password);
        if (!user) {
            await mfa.auditLoginFailed(ctx, data.username);
            return false;
        }

        // 1. A presented passkey assertion decides the login outright.
        if (data.webAuthn) {
            let assertion: unknown;
            try {
                assertion = JSON.parse(data.webAuthn.assertion);
            } catch {
                return MFA_WEBAUTHN_INVALID;
            }
            const ok = await webAuthn.verifyAuthentication(ctx, user, data.webAuthn.correlationKey, assertion);
            if (!ok) {
                return MFA_WEBAUTHN_INVALID;
            }
            return user;
        }

        // 2. Privileged enforcement: codes never satisfy these accounts.
        const userWithRoles = (await mfa.getUserWithRoles(ctx, user.id)) ?? user;
        const enforcement = mfa.evaluateEnforcement(userWithRoles);
        if (enforcement.webAuthnRequired) {
            await mfa.recordEnforcementDenial(ctx, user);
            return MFA_WEBAUTHN_REQUIRED;
        }

        // 3. Any enrolled factor demands a second step.
        const profile = await mfa.getProfile(ctx, user);
        if (!profile.totpEnrolled && profile.webAuthnCredentialCount === 0) {
            return user;
        }
        if (!data.secondFactorCode) {
            await mfa.auditSecondFactorRequired(ctx, data.username);
            return MFA_SECOND_FACTOR_REQUIRED;
        }

        // 4. Second-factor chain: TOTP first (it is the enrolled factor),
        //    then the standing backup codes, then a support-issued recovery
        //    code. Each check is single-use by construction.
        if (profile.totpEnrolled) {
            const totpResult = await totp.verify(ctx, user, data.secondFactorCode);
            if (totpResult.ok) {
                return user;
            }
        }
        if (await codes.consumeBackupCode(ctx, user, data.secondFactorCode)) {
            return user;
        }
        if (await codes.consumeRecoveryCode(ctx, user, data.secondFactorCode)) {
            return user;
        }
        await mfa.auditSecondFactorRejected(ctx, data.username);
        return MFA_SECOND_FACTOR_INVALID;
    }

    /**
     * Delegates to the composed native strategy. Required because
     * `AuthService.verifyUserPassword` resolves *this* strategy by the
     * `'native'` name when servicing `updatePassword`.
     */
    async verifyUserPassword(ctx: RequestContext, userId: ID, password: string): Promise<boolean> {
        const { native } = this.deps();
        return native.verifyUserPassword(ctx, userId, password);
    }
}