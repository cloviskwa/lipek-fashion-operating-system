import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { EntityId, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

import { ArticleCategory } from './article-category.entity';
import { ContentStatus } from './content-status';

/**
 * A journal/editorial article (design spec §31 "Journal", SOT §0B.3).
 *
 * Asset references are plain id columns rather than relations to Vendure's
 * `Asset`: the surviving schema carries no foreign keys to `asset`, and the
 * plugin resolves them through `AssetService` at the API layer instead --
 * the same boundary rule the navigation entities follow for `Collection`.
 */
@Entity()
export class Article extends VendureEntity {
    constructor(input?: DeepPartial<Article>) {
        super(input);
    }

    @Column()
    title: string;

    @Index({ unique: true })
    @Column()
    slug: string;

    @Column({ type: 'text', default: '' })
    excerpt: string;

    @Column({ type: 'text', default: '' })
    body: string;

    @Column({ default: ContentStatus.Draft })
    status: ContentStatus;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt: Date | null;

    @Index()
    @ManyToOne(() => ArticleCategory, category => category.articles, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    articleCategory: ArticleCategory | null;

    @EntityId({ nullable: true })
    articleCategoryId: ID | null;

    @EntityId({ nullable: true })
    featuredAssetId: ID | null;

    // --- SEO (SeoFields migration) ---
    @Column({ type: 'varchar', nullable: true })
    metaTitle: string | null;

    @Column({ type: 'text', nullable: true })
    metaDescription: string | null;

    @EntityId({ nullable: true })
    ogImageAssetId: ID | null;
}
