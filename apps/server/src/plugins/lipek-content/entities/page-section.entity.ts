import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { ContentPage } from './content-page.entity';
import { ContentStatus } from './content-status';

/**
 * One ordered block of a composed {@link ContentPage}.
 *
 * `sectionType` is deliberately a plain string, not an enum: SOT §5A puts
 * section component types and rendering rules in the *storefront's* rendering
 * layer, so the backend stores the chosen type and its configuration without
 * constraining the vocabulary. A section type the storefront does not know
 * simply does not render; it never breaks the API.
 *
 * Types present in the live data: `hero`, `categoryCards`, `newArrivals`,
 * `promotionalBanner`, `newsletterCta`.
 *
 * `config` is the per-type payload, stored as JSON in a text column. Its
 * shape varies by `sectionType` and is therefore untyped here -- for example
 * `hero` carries `{headline, subheadline, ctaLabel, ctaUrl}` while
 * `categoryCards` carries `{collectionSlugs: string[]}`. Note that the live
 * data references collections by *slug*, not id.
 */
@Entity()
export class PageSection extends VendureEntity {
    constructor(input?: DeepPartial<PageSection>) {
        super(input);
    }

    @Column()
    sectionType: string;

    /** Sort order within the page. */
    @Column({ default: 0 })
    position: number;

    @Column({ type: 'simple-json', nullable: true })
    config: Record<string, unknown> | null;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;

    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date | null;

    @Index()
    @ManyToOne(() => ContentPage, page => page.sections, { onDelete: 'CASCADE' })
    page: ContentPage;

    @EntityId()
    pageId: ID;
}
