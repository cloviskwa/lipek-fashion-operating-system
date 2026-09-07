import { LessThan } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection } from '@vendure/core';

import { MfaCryptoService } from './mfa-crypto.service';
import { mfaConfig } from '../mfa-config';
import { WebAuthnChallenge } from '../entities/web-authn-challenge.entity';

/**
 * Lifecycle for short-lived WebAuthn challenges (`SEC-002`, `ADR-0006`).
 *
 * A challenge is a single-use nonce: issued here, signed by the
 * authenticator, verified exactly once. Rows are deliberately **not** tied to
 * a `User` — an authentication ceremony begins before the user is known
 * (usernameless/discoverable-credential flows) — so the row is keyed by an
 * opaque `subjectKey`:
 *
 * - a random correlation key for the anonymous login ceremony;
 * - `user:<id>` for enrollment by an already-authenticated user;
 * - `recovery:<id>` for the recovery-code re-enrollment ceremony.
 *
 * The `purpose` column (`registration` | `authentication`) stops a challenge
 * minted for one ceremony being replayed into the other.
 */
@Injectable()
export class WebAuthnChallengeService {
    constructor(
        private connection: TransactionalConnection,
        private crypto: MfaCryptoService,
    ) {}

    /**
     * Mint a challenge. Returns the challenge value to embed in the
     * WebAuthn options plus the correlation key the client must echo back.
     */
    async create(
        ctx: RequestContext,
        purpose: 'registration' | 'authentication',
        subjectKey: string,
    ): Promise<{ challenge: string; correlationKey: string }> {
        const repo = this.connection.getRepository(ctx, WebAuthnChallenge);
        // Opportunistic cleanup keeps the table from growing without bound in
        // a long-running dev process; expired rows are dead weight.
        await repo.delete({ expiresAt: LessThan(new Date()) });

        const correlationKey = this.crypto.generateCorrelationKey();
        const challenge = this.crypto.generateChallenge();
        await repo.save(
            new WebAuthnChallenge({
                subjectKey: correlationKey,
                purpose,
                challenge,
                expiresAt: new Date(Date.now() + this.ttlMs),
            }),
        );
        return { challenge, correlationKey };
    }

    /**
     * Consume the challenge addressed by `correlationKey`, requiring it to be
     * live and minted for `purpose`. Single-use: the row is deleted whether
     * or not the caller's subsequent cryptographic verification succeeds, so
     * a failed verification cannot be retried against the same challenge.
     */
    async consume(
        ctx: RequestContext,
        correlationKey: string,
        purpose: 'registration' | 'authentication',
    ): Promise<string | undefined> {
        const repo = this.connection.getRepository(ctx, WebAuthnChallenge);
        const row = await repo.findOne({ where: { subjectKey: correlationKey, purpose } });
        if (!row || row.expiresAt.getTime() <= Date.now()) {
            return undefined;
        }
        await repo.delete({ id: row.id });
        return row.challenge;
    }

    private get ttlMs(): number {
        return mfaConfig.webAuthnChallengeTtlSeconds * 1000;
    }
}
