import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * A short-lived WebAuthn challenge awaiting its ceremony response.
 *
 * Deliberately not tied to a `User`: an authentication ceremony begins before
 * the user is known (usernameless flows), so the row is keyed by an opaque
 * `subjectKey` — a session or email identifier — rather than a foreign key.
 * Rows are single-use and expire; see `WebAuthnChallengeService`.
 */
@Entity()
export class WebAuthnChallenge extends VendureEntity {
    constructor(input?: DeepPartial<WebAuthnChallenge>) {
        super(input);
    }

    @Index()
    @Column()
    subjectKey: string;

    /** `registration` or `authentication`; a challenge is not valid across both. */
    @Column()
    purpose: string;

    @Column()
    challenge: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;
}
