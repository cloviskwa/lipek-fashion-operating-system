import { Injectable } from '@nestjs/common';
import { ID, RequestContext, TransactionalConnection, User } from '@vendure/core';
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
    AuthenticationResponseJSON,
    RegistrationResponseJSON,
    WebAuthnCredential as SimpleWebAuthnCredential,
} from '@simplewebauthn/server';

import { AuditLogService } from './audit-log.service';
import { WebAuthnChallengeService } from './web-authn-challenge.service';
import { mfaConfig } from '../mfa-config';
import { WebAuthnCredential } from '../entities/web-authn-credential.entity';

/**
 * WebAuthn/passkey ceremonies (`SEC-002`, `ADR-0006`) — the primary,
 * phishing-resistant factor.
 *
 * Flow notes:
 * - **No allowCredentials at login.** Authentication options are issued
 *   anonymously with an empty allow-list, relying on discoverable
 *   credentials (passkeys). The assertion's credential is then matched
 *   against the *already password-verified* user's registrations, so the
 *   server never has to reveal whether an identifier exists before login.
 * - **Single-use challenges** come from `WebAuthnChallengeService`; a
 *   ceremony cannot be retried against a consumed challenge.
 * - **Counter monotonicity** is delegated to `verifyAuthenticationResponse`
 *   (the stored counter is supplied), and the new counter is persisted — a
 *   non-increasing counter indicates a cloned authenticator.
 * - `publicKeyBase64` stores the SubjectPublicKeyInfo bytes as standard
 *   base64, matching the surviving schema's `text` column; the entity layer
 *   converts to the `Uint8Array` SimpleWebAuthn v13 expects.
 */
@Injectable()
export class WebAuthnService {
    constructor(
        private connection: TransactionalConnection,
        private challenges: WebAuthnChallengeService,
        private auditLog: AuditLogService,
    ) {}

    /**
     * Begin registration for an authenticated user. Challenge is stored
     * against `user:<id>`, so a response can only complete for that user.
     */
    async startRegistration(ctx: RequestContext, user: User) {
        const existing = await this.connection
            .getRepository(ctx, WebAuthnCredential)
            .find({ where: { userId: user.id } });
        const { challenge, correlationKey } = await this.challenges.create(ctx, 'registration', `user:${user.id}`);
        const publicKeyOptions = await generateRegistrationOptions({
            rpName: mfaConfig.webAuthnRpName,
            rpID: mfaConfig.webAuthnRpId,
            userName: user.identifier,
            userID: Uint8Array.from(String(user.id), c => c.charCodeAt(0)),
            challenge,
            excludeCredentials: existing.map(cred => ({ id: cred.credentialId })),
            authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
        });
        await this.auditLog.record(ctx, {
            action: 'mfa.webauthn.registration_started',
            targetType: 'User',
            targetId: user.id,
        });
        return { publicKeyOptions, correlationKey };
    }

    /**
     * Verify a registration response and persist the credential.
     * Returns `true` when the credential is stored.
     */
    async verifyRegistration(
        ctx: RequestContext,
        user: User,
        correlationKey: string,
        registrationJson: unknown,
        nickname: string,
    ): Promise<boolean> {
        const registration = this.asRegistrationResponse(registrationJson);
        if (!registration) {
            return false;
        }
        const expectedChallenge = await this.challenges.consume(ctx, correlationKey, 'registration');
        // A challenge minted for `user:<id>` is only consumable here because
        // the caller resolved the user from their authenticated session.
        if (expectedChallenge === undefined) {
            return false;
        }
        let verification;
        try {
            verification = await verifyRegistrationResponse({
                response: registration,
                expectedChallenge,
                expectedOrigin: [...mfaConfig.webAuthnOrigins],
                expectedRPID: mfaConfig.webAuthnRpId,
                requireUserVerification: false,
            });
        } catch {
            return false;
        }
        if (!verification.verified || !verification.registrationInfo) {
            await this.auditLog.record(ctx, {
                action: 'mfa.webauthn.registration_rejected',
                targetType: 'User',
                targetId: user.id,
            });
            return false;
        }
        const info = verification.registrationInfo;
        const repo = this.connection.getRepository(ctx, WebAuthnCredential);
        // Replace any row with the same credentialId (re-registration of a
        // replaced passkey) rather than accumulating duplicates.
        await repo.delete({ userId: user.id, credentialId: info.credential.id });
        await repo.save(
            new WebAuthnCredential({
                userId: user.id,
                credentialId: info.credential.id,
                publicKeyBase64: Buffer.from(info.credential.publicKey).toString('base64'),
                counter: info.credential.counter,
                deviceType: info.credentialDeviceType,
                backedUp: info.credentialBackedUp,
                transports: info.credential.transports ?? null,
                nickname,
            }),
        );
        await this.auditLog.record(ctx, {
            action: 'mfa.webauthn.registered',
            targetType: 'User',
            targetId: user.id,
            metadata: { nickname, deviceType: info.credentialDeviceType },
        });
        return true;
    }

    /**
     * Begin the anonymous login ceremony. No user information is taken or
     * returned: options carry an empty allow-list and the challenge is keyed
     * by a random correlation key the client echoes back.
     */
    async startAuthentication(ctx: RequestContext) {
        const { challenge, correlationKey } = await this.challenges.create(ctx, 'authentication', 'login');
        const publicKeyOptions = await generateAuthenticationOptions({
            rpID: mfaConfig.webAuthnRpId,
            challenge,
            userVerification: 'preferred',
        });
        return { publicKeyOptions, correlationKey };
    }

    /**
     * Verify a login assertion for an already password-verified user. The
     * asserted credential must be one of *this* user's registrations.
     */
    async verifyAuthentication(
        ctx: RequestContext,
        user: User,
        correlationKey: string,
        assertionJson: unknown,
    ): Promise<boolean> {
        const assertion = this.asAuthenticationResponse(assertionJson);
        if (!assertion) {
            return false;
        }
        const expectedChallenge = await this.challenges.consume(ctx, correlationKey, 'authentication');
        if (expectedChallenge === undefined) {
            return false;
        }
        const repo = this.connection.getRepository(ctx, WebAuthnCredential);
        // Look up by credentialId (the surviving schema's UNIQUE index) and
        // then verify ownership — the assertion must belong to the already
        // password-verified user.
        const stored = await repo.findOne({ where: { credentialId: assertion.id } });
        if (!stored || String(stored.userId) !== String(user.id)) {
            await this.auditLog.record(ctx, {
                action: 'mfa.webauthn.assertion_rejected',
                targetType: 'User',
                targetId: user.id,
                metadata: { reason: 'unknown_credential' },
            });
            return false;
        }
        let verification;
        try {
            verification = await verifyAuthenticationResponse({
                response: assertion,
                expectedChallenge,
                expectedOrigin: [...mfaConfig.webAuthnOrigins],
                expectedRPID: mfaConfig.webAuthnRpId,
                requireUserVerification: false,
                credential: this.toSimpleWebAuthnCredential(stored),
            });
        } catch {
            await this.auditLog.record(ctx, {
                action: 'mfa.webauthn.assertion_rejected',
                targetType: 'User',
                targetId: user.id,
                metadata: { reason: 'verification_error' },
            });
            return false;
        }
        if (!verification.verified) {
            await this.auditLog.record(ctx, {
                action: 'mfa.webauthn.assertion_rejected',
                targetType: 'User',
                targetId: user.id,
                metadata: { reason: 'signature_invalid' },
            });
            return false;
        }
        // Persist the new signature counter; verifyAuthenticationResponse has
        // already enforced that it did not go backwards (clone detection).
        stored.counter = verification.authenticationInfo.newCounter;
        stored.backedUp = verification.authenticationInfo.credentialBackedUp;
        stored.deviceType = verification.authenticationInfo.credentialDeviceType;
        await repo.save(stored);
        await this.auditLog.record(ctx, {
            action: 'mfa.webauthn.asserted',
            targetType: 'User',
            targetId: user.id,
        });
        return true;
    }

    async countCredentials(ctx: RequestContext, userId: ID): Promise<number> {
        return this.connection.getRepository(ctx, WebAuthnCredential).count({ where: { userId } });
    }

    private toSimpleWebAuthnCredential(stored: WebAuthnCredential): SimpleWebAuthnCredential {
        return {
            id: stored.credentialId,
            publicKey: new Uint8Array(Buffer.from(stored.publicKeyBase64, 'base64')),
            counter: stored.counter,
            transports: (stored.transports ?? undefined) as SimpleWebAuthnCredential['transports'],
        };
    }

    /** Structural validation before trusting client JSON as a registration response. */
    private asRegistrationResponse(value: unknown): RegistrationResponseJSON | undefined {
        const v = value as {
            id?: unknown;
            rawId?: unknown;
            type?: unknown;
            response?: { clientDataJSON?: unknown; attestationObject?: unknown };
        };
        if (
            typeof v?.id !== 'string' ||
            typeof v?.rawId !== 'string' ||
            typeof v?.type !== 'string' ||
            typeof v?.response?.clientDataJSON !== 'string' ||
            typeof v?.response?.attestationObject !== 'string'
        ) {
            return undefined;
        }
        return value as RegistrationResponseJSON;
    }

    /** Structural validation before trusting client JSON as an assertion. */
    private asAuthenticationResponse(value: unknown): AuthenticationResponseJSON | undefined {
        const v = value as {
            id?: unknown;
            rawId?: unknown;
            type?: unknown;
            response?: { clientDataJSON?: unknown; authenticatorData?: unknown; signature?: unknown };
        };
        if (
            typeof v?.id !== 'string' ||
            typeof v?.rawId !== 'string' ||
            typeof v?.type !== 'string' ||
            typeof v?.response?.clientDataJSON !== 'string' ||
            typeof v?.response?.authenticatorData !== 'string' ||
            typeof v?.response?.signature !== 'string'
        ) {
            return undefined;
        }
        return value as AuthenticationResponseJSON;
    }
}