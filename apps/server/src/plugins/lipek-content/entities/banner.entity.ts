import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

import { ContentStatus } from './content-status';

/**
 * A promotional banner, optionally windowed by `scheduledAt`/`expiresAt`.
 *
 * A banner is "live" only when it is PUBLISHED *and* inside that window --
 * see `ContentService.getActiveBanners`, which applies the window in SQL so
 * an expired banner can never reach the storefront.
 */
@Entity()
export class Banner extends VendureEntity {
    constructor(input?: DeepPartial<Banner>) {
        super(input);
    }

    @Column()
    title: string;

    @Column({ type: 'text', default: '' })
    message: string;

    @Column({ type: 'varchar', nullable: true })
    ctaLabel: string | null;

    @Column({ type: 'varchar', nullable: true })
    ctaUrl: string | null;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;

    /** Start of the display window; null means "as soon as published". */
    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date | null;

    /** End of the display window; null means "no expiry". */
    @Column({ type: 'timestamp', nullable: true })
    expiresAt: Date | null;

    @EntityId({ nullable: true })
    imageAssetId: ID | null;
}
