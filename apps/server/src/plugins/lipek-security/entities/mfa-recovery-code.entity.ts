import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, User, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

/**
 * A one-time code issued to re-establish access when a factor is unavailable
 * (`SEC-004`).
 *
 * Distinct from {@link BackupCode}: a recovery code is issued on demand
 * during a support interaction and **expires**, whereas backup codes are the
 * standing set handed over at enrolment. The expiry is what makes this one
 * safe to read out over a support channel.
 *
 * Stored as a hash — the plaintext exists only in the response that issues it.
 */
@Entity()
export class MfaRecoveryCode extends VendureEntity {
    constructor(input?: DeepPartial<MfaRecoveryCode>) {
        super(input);
    }

    @Column({ type: 'text' })
    codeHash: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @EntityId()
    userId: ID;
}
