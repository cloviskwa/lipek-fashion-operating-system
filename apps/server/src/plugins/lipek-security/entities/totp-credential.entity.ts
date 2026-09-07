import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, User, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

/**
 * A user's TOTP authenticator enrolment (`SEC-003`, `ADR-0006`).
 *
 * The shared secret is stored encrypted, never in plaintext and never hashed —
 * TOTP verification needs the original value, so a one-way hash is not an
 * option and encryption at rest is the control. Hence `secretCiphertext`
 * rather than `secret`.
 *
 * `userId` is UNIQUE in the surviving schema — exactly one credential row per
 * user, ever. Re-enrollment replaces; the service enforces the same invariant.
 */
@Entity()
export class TotpCredential extends VendureEntity {
    constructor(input?: DeepPartial<TotpCredential>) {
        super(input);
    }

    @Column({ type: 'text' })
    secretCiphertext: string;

    /**
     * The last time-step successfully used, which makes a code single-use:
     * replaying an intercepted code within its 30-second window is rejected
     * because the step is no longer greater than this value.
     */
    @Column({ type: 'int', nullable: true })
    lastUsedTimeStep: number | null;

    @Index({ unique: true })
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @EntityId()
    userId: ID;
}
