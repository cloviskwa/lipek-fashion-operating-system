import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, User, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

/**
 * One of the standing single-use codes issued when a user enrols in MFA
 * (`SEC-004`).
 *
 * No expiry, by design — a backup code is what a user falls back on after
 * losing a device, which may be long after enrolment. Consumption is by
 * deletion, so the remaining row count is the number of codes left.
 *
 * Stored as a hash; the plaintext is shown once at enrolment and never again.
 */
@Entity()
export class BackupCode extends VendureEntity {
    constructor(input?: DeepPartial<BackupCode>) {
        super(input);
    }

    @Column({ type: 'text' })
    codeHash: string;

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @EntityId()
    userId: ID;
}
