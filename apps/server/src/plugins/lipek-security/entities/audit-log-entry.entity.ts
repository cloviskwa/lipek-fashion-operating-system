import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, User, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

/**
 * An append-only record of a security-relevant action (`SEC-006`).
 *
 * `actorIdentifier` is denormalised alongside the `actorUserId` relation on
 * purpose: an audit trail must stay readable after the user row is deleted or
 * renamed, so the identifier is captured as it was at the time. `actorUserId`
 * is nullable for the same reason, and for actions with no signed-in actor
 * such as a failed login.
 *
 * Nothing in this plugin updates or deletes these rows.
 */
@Entity()
export class AuditLogEntry extends VendureEntity {
    constructor(input?: DeepPartial<AuditLogEntry>) {
        super(input);
    }

    /** The actor's identifier as it stood when the action happened. */
    @Column()
    actorIdentifier: string;

    @Column({ type: 'varchar', nullable: true })
    ipAddress: string | null;

    /** Dotted action key, e.g. `mfa.totp.enrolled`, `auth.login.failed`. */
    @Index()
    @Column()
    action: string;

    /** Entity type acted upon, when the action targets one. */
    @Column({ type: 'varchar', nullable: true })
    targetType: string | null;

    @Column({ type: 'varchar', nullable: true })
    targetId: string | null;

    /** Action-specific detail. Must never contain secrets or credentials. */
    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, unknown> | null;

    @Index()
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    actorUser: User | null;

    @EntityId({ nullable: true })
    actorUserId: ID | null;
}
