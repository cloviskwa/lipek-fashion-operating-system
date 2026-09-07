import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, User, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

/**
 * A registered passkey / security key (`SEC-003`, `ADR-0006`).
 *
 * Only public key material is stored, so a database disclosure does not let
 * an attacker authenticate as the user.
 */
@Entity()
export class WebAuthnCredential extends VendureEntity {
    constructor(input?: DeepPartial<WebAuthnCredential>) {
        super(input);
    }

    /** Base64url credential id issued by the authenticator. */
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

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @EntityId()
    userId: ID;
}
