import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index } from 'typeorm';

import { ContentStatus } from './content-status';

/**
 * A staff-editable description of a service LIPEK offers.
 *
 * This is the *marketing* record for a service, not its workflow: the
 * operational entities live in the Tailoring, Alterations and Laundry plugins
 * (rebuild tasks R-06, R-08, R-09). `category` groups them and holds
 * `tailoring`, `alteration` or `laundry` in the live data.
 *
 * `priceFrom` is a minor-unit integer in the channel's currency, matching
 * Vendure's money convention, and is nullable for "price on request".
 */
@Entity()
export class ServiceDefinition extends VendureEntity {
    constructor(input?: DeepPartial<ServiceDefinition>) {
        super(input);
    }

    @Column()
    name: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column({ type: 'text', default: '' })
    description: string;

    @Column({ type: 'int', nullable: true })
    priceFrom: number | null;

    @Column()
    category: string;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;

    // --- SEO ---
    @Column({ type: 'varchar', nullable: true })
    metaTitle: string | null;

    @Column({ type: 'text', nullable: true })
    metaDescription: string | null;

    @EntityId({ nullable: true })
    ogImageAssetId: ID | null;
}
