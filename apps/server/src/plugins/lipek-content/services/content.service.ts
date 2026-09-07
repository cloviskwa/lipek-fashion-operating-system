import { Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection } from '@vendure/core';
import { IsNull, LessThanOrEqual, MoreThan } from 'typeorm';

import { Article } from '../entities/article.entity';
import { ArticleCategory } from '../entities/article-category.entity';
import { Banner } from '../entities/banner.entity';
import { ContentPage } from '../entities/content-page.entity';
import { ContentStatus } from '../entities/content-status';
import { FaqItem } from '../entities/faq-item.entity';
import { PageSection } from '../entities/page-section.entity';
import { PolicyDocument } from '../entities/policy-document.entity';
import { ServiceDefinition } from '../entities/service-definition.entity';
import { StoreLocation } from '../entities/store-location.entity';
import { Testimonial } from '../entities/testimonial.entity';

/**
 * Storefront-facing reads for staff-managed content (`CONTENT-002`…`CONTENT-006`).
 *
 * Every method here filters to `PUBLISHED`. Draft content must never reach a
 * storefront query -- that guarantee lives in this service rather than in the
 * resolvers, so a future resolver cannot accidentally omit it.
 *
 * Write operations belong to the Admin API and Dashboard extension, which are
 * the remaining half of rebuild task R-02 and are not implemented here.
 */
@Injectable()
export class ContentService {
    constructor(private connection: TransactionalConnection) {}

    // --- Pages ------------------------------------------------------------

    /**
     * A published page with its published sections, ordered for rendering.
     *
     * Sections are ordered here rather than in the resolver so every caller
     * gets the same order; the storefront renders the array as given.
     */
    async getPageBySlug(ctx: RequestContext, slug: string): Promise<ContentPage | undefined> {
        const page = await this.connection.getRepository(ctx, ContentPage).findOne({
            where: { slug, status: ContentStatus.Published },
        });
        if (!page) {
            return undefined;
        }

        page.sections = await this.connection.getRepository(ctx, PageSection).find({
            where: { pageId: page.id, status: ContentStatus.Published },
            order: { position: 'ASC' },
        });
        return page;
    }

    // --- Journal ----------------------------------------------------------

    /**
     * Published articles, newest first.
     *
     * Ordered by `publishedAt` with `createdAt` as the tie-break, because an
     * article scheduled for a past date must not sort above one published now.
     */
    async getArticles(
        ctx: RequestContext,
        options?: { categorySlug?: string | null; take?: number | null },
    ): Promise<Article[]> {
        const take = Math.min(Math.max(options?.take ?? 20, 1), 100);

        let articleCategoryId: unknown;
        if (options?.categorySlug) {
            const category = await this.connection.getRepository(ctx, ArticleCategory).findOne({
                where: { slug: options.categorySlug },
            });
            // An unknown category yields no articles rather than every article.
            if (!category) {
                return [];
            }
            articleCategoryId = category.id;
        }

        return this.connection.getRepository(ctx, Article).find({
            where: {
                status: ContentStatus.Published,
                ...(articleCategoryId != null ? { articleCategoryId: articleCategoryId as never } : {}),
            },
            relations: { articleCategory: true },
            order: { publishedAt: 'DESC', createdAt: 'DESC' },
            take,
        });
    }

    async getArticleBySlug(ctx: RequestContext, slug: string): Promise<Article | undefined> {
        return (
            (await this.connection.getRepository(ctx, Article).findOne({
                where: { slug, status: ContentStatus.Published },
                relations: { articleCategory: true },
            })) ?? undefined
        );
    }

    async getArticleCategories(ctx: RequestContext): Promise<ArticleCategory[]> {
        return this.connection.getRepository(ctx, ArticleCategory).find({ order: { name: 'ASC' } });
    }

    // --- Banners ----------------------------------------------------------

    /**
     * Banners that are live *now*.
     *
     * Published alone is not enough: the schedule window is applied in SQL so
     * an expired or not-yet-started banner cannot reach the storefront even if
     * a caller forgets to check. `scheduledAt IS NULL` means "live as soon as
     * published"; `expiresAt IS NULL` means "no expiry".
     */
    async getActiveBanners(ctx: RequestContext): Promise<Banner[]> {
        const now = new Date();
        const repository = this.connection.getRepository(ctx, Banner);

        // TypeORM treats an array of where-objects as OR, so each combination
        // of open/closed window bounds is expressed explicitly.
        return repository.find({
            where: [
                { status: ContentStatus.Published, scheduledAt: IsNull(), expiresAt: IsNull() },
                { status: ContentStatus.Published, scheduledAt: IsNull(), expiresAt: MoreThan(now) },
                {
                    status: ContentStatus.Published,
                    scheduledAt: LessThanOrEqual(now),
                    expiresAt: IsNull(),
                },
                {
                    status: ContentStatus.Published,
                    scheduledAt: LessThanOrEqual(now),
                    expiresAt: MoreThan(now),
                },
            ],
            order: { createdAt: 'DESC' },
        });
    }

    // --- Reference content ------------------------------------------------

    /** Published FAQs, optionally narrowed to one free-form category key. */
    async getFaqItems(ctx: RequestContext, category?: string | null): Promise<FaqItem[]> {
        return this.connection.getRepository(ctx, FaqItem).find({
            where: {
                status: ContentStatus.Published,
                ...(category ? { category } : {}),
            },
            order: { position: 'ASC' },
        });
    }

    async getPolicyBySlug(ctx: RequestContext, slug: string): Promise<PolicyDocument | undefined> {
        return (
            (await this.connection.getRepository(ctx, PolicyDocument).findOne({
                where: { slug, status: ContentStatus.Published },
            })) ?? undefined
        );
    }

    async getServiceDefinitions(
        ctx: RequestContext,
        category?: string | null,
    ): Promise<ServiceDefinition[]> {
        return this.connection.getRepository(ctx, ServiceDefinition).find({
            where: {
                status: ContentStatus.Published,
                ...(category ? { category } : {}),
            },
            order: { name: 'ASC' },
        });
    }

    async getServiceDefinitionBySlug(
        ctx: RequestContext,
        slug: string,
    ): Promise<ServiceDefinition | undefined> {
        return (
            (await this.connection.getRepository(ctx, ServiceDefinition).findOne({
                where: { slug, status: ContentStatus.Published },
            })) ?? undefined
        );
    }

    async getStoreLocations(ctx: RequestContext): Promise<StoreLocation[]> {
        return this.connection.getRepository(ctx, StoreLocation).find({
            where: { status: ContentStatus.Published },
            order: { name: 'ASC' },
        });
    }

    async getTestimonials(ctx: RequestContext, take?: number | null): Promise<Testimonial[]> {
        return this.connection.getRepository(ctx, Testimonial).find({
            where: { status: ContentStatus.Published },
            order: { createdAt: 'DESC' },
            take: Math.min(Math.max(take ?? 12, 1), 100),
        });
    }
}
