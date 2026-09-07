import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

import { ContentStatus } from './content-status';

/**
 * A physical store or atelier (design spec §30 "Locations").
 *
 * Note the default `status` is PUBLISHED, unlike every other entity in this
 * plugin -- a location that exists is normally one customers may visit. That
 * default is in the surviving schema; do not "correct" it to DRAFT.
 *
 * `openingHours` is free text rather than structured data, so it is rendered
 * as-authored and never parsed.
 */
@Entity()
export class StoreLocation extends VendureEntity {
    constructor(input?: DeepPartial<StoreLocation>) {
        super(input);
    }

    @Column()
    name: string;

    @Column()
    addressLine1: string;

    @Column({ type: 'varchar', nullable: true })
    addressLine2: string | null;

    @Column()
    city: string;

    @Column({ type: 'varchar', nullable: true })
    region: string | null;

    @Column({ type: 'varchar', nullable: true })
    postalCode: string | null;

    @Column()
    country: string;

    @Column({ type: 'varchar', nullable: true })
    phone: string | null;

    @Column({ type: 'varchar', nullable: true })
    email: string | null;

    @Column({ type: 'text', nullable: true })
    openingHours: string | null;

    @Column({ default: ContentStatus.Published })
    status: ContentStatus;
}
