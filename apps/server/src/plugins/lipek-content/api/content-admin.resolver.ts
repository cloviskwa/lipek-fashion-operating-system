import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { Allow, Ctx, ListQueryOptions, RequestContext, Transaction, VendureEntity } from '@vendure/core';

import { contentPermission } from '../content-permissions';
import { Article } from '../entities/article.entity';
import { ArticleCategory } from '../entities/article-category.entity';
import { Banner } from '../entities/banner.entity';
import { ContentPage } from '../entities/content-page.entity';
import { FaqItem } from '../entities/faq-item.entity';
import { PageSection } from '../entities/page-section.entity';
import { PolicyDocument } from '../entities/policy-document.entity';
import { ServiceDefinition } from '../entities/service-definition.entity';
import { StoreLocation } from '../entities/store-location.entity';
import { Testimonial } from '../entities/testimonial.entity';
import { ContentAdminService, DeletionResponse } from '../services/content-admin.service';

/**
 * Admin API for editorial content (rebuild task R-02).
 *
 * Every operation is gated on the plugin's own `Content` CRUD permission, so
 * a content editor role can be granted authoring rights without any wider
 * catalogue or order access.
 *
 * The methods are thin by design: all CRUD behaviour lives in
 * `ContentAdminService`, which is generic over the entity. What varies here
 * is only which entity class each operation addresses.
 */
@Resolver()
export class ContentAdminResolver {
    constructor(private service: ContentAdminService) {}

    // --- Pages ------------------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    contentPages(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<ContentPage> | null },
    ): Promise<PaginatedList<ContentPage>> {
        return this.service.findAll(ctx, ContentPage, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    contentPage(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, ContentPage, args.id);
    }

    @Query()
    @Allow(contentPermission.Read)
    contentPageSections(@Ctx() ctx: RequestContext, @Args() args: { pageId: ID }) {
        return this.service.findSectionsForPage(ctx, args.pageId);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createContentPage(@Ctx() ctx: RequestContext, @Args() args: { input: Record<string, unknown> }) {
        return this.service.create(ctx, ContentPage, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateContentPage(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, ContentPage, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteContentPage(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.service.delete(ctx, ContentPage, args.id);
    }

    // --- Page sections ----------------------------------------------------

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createContentPageSection(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> },
    ) {
        return this.service.create(ctx, PageSection, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateContentPageSection(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, PageSection, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteContentPageSection(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
    ): Promise<DeletionResponse> {
        return this.service.delete(ctx, PageSection, args.id);
    }

    // --- Article categories -----------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    articleCategories(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<ArticleCategory> | null },
    ) {
        return this.service.findAll(ctx, ArticleCategory, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    articleCategory(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, ArticleCategory, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createArticleCategory(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> },
    ) {
        return this.service.create(ctx, ArticleCategory, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateArticleCategory(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, ArticleCategory, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteArticleCategory(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
    ): Promise<DeletionResponse> {
        return this.service.delete(ctx, ArticleCategory, args.id);
    }

    // --- Articles ---------------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    articles(@Ctx() ctx: RequestContext, @Args() args: { options?: ListQueryOptions<Article> | null }) {
        return this.service.findAll(ctx, Article, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    article(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, Article, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createArticle(@Ctx() ctx: RequestContext, @Args() args: { input: Record<string, unknown> }) {
        return this.service.create(ctx, Article, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateArticle(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, Article, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteArticle(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.service.delete(ctx, Article, args.id);
    }

    // --- Banners ----------------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    banners(@Ctx() ctx: RequestContext, @Args() args: { options?: ListQueryOptions<Banner> | null }) {
        return this.service.findAll(ctx, Banner, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    banner(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, Banner, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createBanner(@Ctx() ctx: RequestContext, @Args() args: { input: Record<string, unknown> }) {
        return this.service.create(ctx, Banner, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateBanner(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, Banner, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteBanner(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.service.delete(ctx, Banner, args.id);
    }

    // --- FAQs -------------------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    faqItems(@Ctx() ctx: RequestContext, @Args() args: { options?: ListQueryOptions<FaqItem> | null }) {
        return this.service.findAll(ctx, FaqItem, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    faqItem(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, FaqItem, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createFaqItem(@Ctx() ctx: RequestContext, @Args() args: { input: Record<string, unknown> }) {
        return this.service.create(ctx, FaqItem, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateFaqItem(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, FaqItem, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteFaqItem(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.service.delete(ctx, FaqItem, args.id);
    }

    // --- Policies ---------------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    policyDocuments(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<PolicyDocument> | null },
    ) {
        return this.service.findAll(ctx, PolicyDocument, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    policyDocument(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, PolicyDocument, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createPolicyDocument(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> },
    ) {
        return this.service.create(ctx, PolicyDocument, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updatePolicyDocument(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, PolicyDocument, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deletePolicyDocument(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
    ): Promise<DeletionResponse> {
        return this.service.delete(ctx, PolicyDocument, args.id);
    }

    // --- Services ---------------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    serviceDefinitions(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<ServiceDefinition> | null },
    ) {
        return this.service.findAll(ctx, ServiceDefinition, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    serviceDefinition(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, ServiceDefinition, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createServiceDefinition(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> },
    ) {
        return this.service.create(ctx, ServiceDefinition, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateServiceDefinition(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, ServiceDefinition, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteServiceDefinition(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
    ): Promise<DeletionResponse> {
        return this.service.delete(ctx, ServiceDefinition, args.id);
    }

    // --- Locations --------------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    storeLocations(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<StoreLocation> | null },
    ) {
        return this.service.findAll(ctx, StoreLocation, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    storeLocation(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, StoreLocation, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createStoreLocation(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> },
    ) {
        return this.service.create(ctx, StoreLocation, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateStoreLocation(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, StoreLocation, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteStoreLocation(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
    ): Promise<DeletionResponse> {
        return this.service.delete(ctx, StoreLocation, args.id);
    }

    // --- Testimonials -----------------------------------------------------

    @Query()
    @Allow(contentPermission.Read)
    testimonials(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<Testimonial> | null },
    ) {
        return this.service.findAll(ctx, Testimonial, args.options);
    }

    @Query()
    @Allow(contentPermission.Read)
    testimonial(@Ctx() ctx: RequestContext, @Args() args: { id: ID }) {
        return this.service.findOne(ctx, Testimonial, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Create)
    createTestimonial(@Ctx() ctx: RequestContext, @Args() args: { input: Record<string, unknown> }) {
        return this.service.create(ctx, Testimonial, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Update)
    updateTestimonial(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: Record<string, unknown> & { id: ID } },
    ) {
        return this.service.update(ctx, Testimonial, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(contentPermission.Delete)
    deleteTestimonial(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
    ): Promise<DeletionResponse> {
        return this.service.delete(ctx, Testimonial, args.id);
    }
}

/**
 * `ContentPage.sections` is not a loaded relation on the Admin list query, so
 * it is resolved on demand rather than eagerly joined for every row.
 */
@Resolver('ContentPage')
export class ContentPageAdminResolver {
    constructor(private service: ContentAdminService) {}

    @ResolveField()
    @Allow(contentPermission.Read)
    sections(@Ctx() ctx: RequestContext, @Parent() page: ContentPage): Promise<PageSection[]> {
        return this.service.findSectionsForPage(ctx, page.id);
    }
}
