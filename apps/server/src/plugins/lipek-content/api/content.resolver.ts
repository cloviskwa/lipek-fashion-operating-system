import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ID } from '@vendure/common/lib/shared-types';
import { Asset, AssetService, Ctx, RequestContext } from '@vendure/core';

import { Article } from '../entities/article.entity';
import { Banner } from '../entities/banner.entity';
import { ContentPage } from '../entities/content-page.entity';
import { PolicyDocument } from '../entities/policy-document.entity';
import { ServiceDefinition } from '../entities/service-definition.entity';
import { StoreLocation } from '../entities/store-location.entity';
import { Testimonial } from '../entities/testimonial.entity';
import { ArticleCategory } from '../entities/article-category.entity';
import { FaqItem } from '../entities/faq-item.entity';
import { ContentService } from '../services/content.service';

@Resolver()
export class ContentQueryResolver {
    constructor(private contentService: ContentService) {}

    @Query()
    async contentPage(
        @Ctx() ctx: RequestContext,
        @Args() args: { slug: string },
    ): Promise<ContentPage | undefined> {
        return this.contentService.getPageBySlug(ctx, args.slug);
    }

    @Query()
    async articles(
        @Ctx() ctx: RequestContext,
        @Args() args: { categorySlug?: string | null; take?: number | null },
    ): Promise<Article[]> {
        return this.contentService.getArticles(ctx, args);
    }

    @Query()
    async article(
        @Ctx() ctx: RequestContext,
        @Args() args: { slug: string },
    ): Promise<Article | undefined> {
        return this.contentService.getArticleBySlug(ctx, args.slug);
    }

    @Query()
    async articleCategories(@Ctx() ctx: RequestContext): Promise<ArticleCategory[]> {
        return this.contentService.getArticleCategories(ctx);
    }

    @Query()
    async activeBanners(@Ctx() ctx: RequestContext): Promise<Banner[]> {
        return this.contentService.getActiveBanners(ctx);
    }

    @Query()
    async faqItems(
        @Ctx() ctx: RequestContext,
        @Args() args: { category?: string | null },
    ): Promise<FaqItem[]> {
        return this.contentService.getFaqItems(ctx, args.category);
    }

    @Query()
    async policyDocument(
        @Ctx() ctx: RequestContext,
        @Args() args: { slug: string },
    ): Promise<PolicyDocument | undefined> {
        return this.contentService.getPolicyBySlug(ctx, args.slug);
    }

    @Query()
    async serviceDefinitions(
        @Ctx() ctx: RequestContext,
        @Args() args: { category?: string | null },
    ): Promise<ServiceDefinition[]> {
        return this.contentService.getServiceDefinitions(ctx, args.category);
    }

    @Query()
    async serviceDefinition(
        @Ctx() ctx: RequestContext,
        @Args() args: { slug: string },
    ): Promise<ServiceDefinition | undefined> {
        return this.contentService.getServiceDefinitionBySlug(ctx, args.slug);
    }

    @Query()
    async storeLocations(@Ctx() ctx: RequestContext): Promise<StoreLocation[]> {
        return this.contentService.getStoreLocations(ctx);
    }

    @Query()
    async testimonials(
        @Ctx() ctx: RequestContext,
        @Args() args: { take?: number | null },
    ): Promise<Testimonial[]> {
        return this.contentService.getTestimonials(ctx, args.take);
    }
}

/**
 * Asset ids are stored as plain columns (the surviving schema carries no
 * foreign keys to `asset`), so they are resolved lazily here through
 * `AssetService`. A dangling id resolves to null rather than erroring -- a
 * deleted asset should blank an image, not break the page.
 */
async function resolveAsset(
    assetService: AssetService,
    ctx: RequestContext,
    assetId: ID | null,
): Promise<Asset | undefined> {
    if (assetId == null) {
        return undefined;
    }
    return assetService.findOne(ctx, assetId);
}

@Resolver('ContentPage')
export class ContentPageResolver {
    constructor(private assetService: AssetService) {}

    @ResolveField()
    async ogImage(@Ctx() ctx: RequestContext, @Parent() page: ContentPage) {
        return resolveAsset(this.assetService, ctx, page.ogImageAssetId);
    }
}

@Resolver('Article')
export class ArticleResolver {
    constructor(private assetService: AssetService) {}

    /** Exposed as `category` in the schema; the column is `articleCategory`. */
    @ResolveField()
    category(@Parent() article: Article): ArticleCategory | null {
        return article.articleCategory ?? null;
    }

    @ResolveField()
    async featuredAsset(@Ctx() ctx: RequestContext, @Parent() article: Article) {
        return resolveAsset(this.assetService, ctx, article.featuredAssetId);
    }

    @ResolveField()
    async ogImage(@Ctx() ctx: RequestContext, @Parent() article: Article) {
        return resolveAsset(this.assetService, ctx, article.ogImageAssetId);
    }
}

@Resolver('Banner')
export class BannerResolver {
    constructor(private assetService: AssetService) {}

    @ResolveField()
    async image(@Ctx() ctx: RequestContext, @Parent() banner: Banner) {
        return resolveAsset(this.assetService, ctx, banner.imageAssetId);
    }
}

@Resolver('ServiceDefinition')
export class ServiceDefinitionResolver {
    constructor(private assetService: AssetService) {}

    @ResolveField()
    async ogImage(@Ctx() ctx: RequestContext, @Parent() service: ServiceDefinition) {
        return resolveAsset(this.assetService, ctx, service.ogImageAssetId);
    }
}

@Resolver('ContentPageSection')
export class ContentPageSectionResolver {}

@Resolver('Testimonial')
export class TestimonialResolver {}
