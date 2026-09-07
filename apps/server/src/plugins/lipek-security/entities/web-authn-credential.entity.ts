import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, User, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

/**
 * A registered passkey / security key (`SEC-002`, `ADR-0006`).
 *
 * Only public key material is stored, so a database disclosure does not let
 * an attacker authenticate as the user.
 *
 * Surviving-schema constraints (authoritative over the entity design):
 * `credentialId` is UNIQUE — a credential can only ever be registered once,
 * platform-wide — and there is deliberately **no** index on `userId` and no
 * `ON DELETE` action on the user relation, so deleting a user with live
 * passkeys is blocked rather than silently cascading; credentials must be
 * removed first.
 */
@Entity()
export class WebAuthnCredential extends VendureEntity {
    constructor(input?: DeepPartial<WebAuthnCredential>) {
        super(input);
    }

    /** Base64url credential id issued by the authenticator. */
    @Index({ unique: true })
    @Column()
    credentialId: string;

    @Column({ type: 'text' })
    publicKeyBase64: string;

    /**
     * Authenticator signature counter. A value that fails to increase between
     * assertions indicates a cloned authenticator, so this is compared on
     * every login rather than merely stored.
     */
    @Column({ type: 'int' })
    counter: number;

    /** `singleDevice` or `multiDevice`, as reported at registration. */
    @Column()
    deviceType: string;

    /** Whether the credential is synced to a passkey provider. */
    @Column()
    backedUp: boolean;

    /** JSON array of transports (`usb`, `nfc`, `ble`, `internal`, `hybrid`). */
    @Column({ type: 'simple-json', nullable: true })
    transports: string[] | null;

    /** User-supplied label, so a person can tell their keys apart. */
    @Column()
    nickname: string;

    @ManyToOne(() => User)
    user: User;

    @EntityId()
    userId: ID;
}
