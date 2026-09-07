import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, OneToMany } from 'typeorm';

import { ContentStatus } from './content-status';
import { PageSection } from './page-section.entity';

/**
 * A staff-authored page addressed by slug.
 *
 * `body` holds standalone copy; composed pages instead assemble ordered
 * {@link PageSection} rows, which is the backend-driven composition SOT §5A
 * requires. A page may use either or both.
 */
@Entity()
export class ContentPage extends VendureEntity {
    constructor(input?: DeepPartial<ContentPage>) {
        super(input);
    }

    @Column()
    title: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column({ type: 'text', default: '' })
    body: string;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;

    /** Publish-at time for scheduled release; null means publish immediately on status change. */
    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt: Date | null;

    @OneToMany(() => PageSection, section => section.page)
    sections: PageSection[];

    // --- SEO ---
    @Column({ type: 'varchar', nullable: true })
    metaTitle: string | null;

    @Column({ type: 'text', nullable: true })
    metaDescription: string | null;

    @EntityId({ nullable: true })
    ogImageAssetId: ID | null;
}
