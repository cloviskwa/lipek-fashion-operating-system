import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { adminApiExtensions } from './api/admin-api-extensions';
import { shopApiExtensions } from './api/api-extensions';
import { ContentAdminResolver, ContentPageAdminResolver } from './api/content-admin.resolver';
import {
    ArticleResolver,
    BannerResolver,
    ContentPageResolver,
    ContentPageSectionResolver,
    ContentQueryResolver,
    ServiceDefinitionResolver,
    TestimonialResolver,
} from './api/content.resolver';
import { NavigationItemResolver, NavigationMenuResolver } from './api/navigation.resolver';
import { Article } from './entities/article.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { Banner } from './entities/banner.entity';
import { ContentPage } from './entities/content-page.entity';
import { FaqItem } from './entities/faq-item.entity';
import { NavigationItem } from './entities/navigation-item.entity';
import { NavigationMenu } from './entities/navigation-menu.entity';
import { PageSection } from './entities/page-section.entity';
import { PolicyDocument } from './entities/policy-document.entity';
import { ServiceDefinition } from './entities/service-definition.entity';
import { StoreLocation } from './entities/store-location.entity';
import { Testimonial } from './entities/testimonial.entity';
import { contentPermission } from './content-permissions';
import { ContentAdminService } from './services/content-admin.service';
import { ContentService } from './services/content.service';
import { NavigationService } from './services/navigation.service';

/**
 * Staff-managed storefront content (SOT §0B.3, `CONTENT-001`).
 *
 * Scope today is navigation only (`CONTENT-005`): the `NavigationMenu` /
 * `NavigationItem` entities and the read-only Shop API the storefront uses
 * to render its header and footer menus. This directly satisfies the
 * Do-Not-list rule against hard-coding catalog categories in navigation
 * components -- adding a category is a Dashboard edit, not a deploy.
 *
 * As of rebuild task `R-02` this covers the full SOT §0B.3 content set:
 * navigation, pages and sections, articles, banners, FAQs, policies, service
 * definitions, store locations and testimonials. Every entity was written to
 * match a table that already existed in the LIPEK database.
 *
 * The Shop API here is read-only and published-only. Staff-facing writes --
 * the Admin API extension and the colocated `dashboard/` screens -- are the
 * remaining half of `R-02`; see `docs/implementation/BACKEND_REBUILD_PLAN.md`.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
    entities: [
        NavigationMenu,
        NavigationItem,
        ContentPage,
        PageSection,
        Article,
        ArticleCategory,
        Banner,
        FaqItem,
        PolicyDocument,
        ServiceDefinition,
        StoreLocation,
        Testimonial,
    ],
    providers: [NavigationService, ContentService, ContentAdminService],
    configuration: config => {
        // Registers CreateContent/ReadContent/UpdateContent/DeleteContent so
        // they can be assigned to roles in the Dashboard.
        config.authOptions.customPermissions.push(contentPermission);
        return config;
    },
    dashboard: './dashboard/index.tsx',
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [ContentAdminResolver, ContentPageAdminResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [
            NavigationMenuResolver,
            NavigationItemResolver,
            ContentQueryResolver,
            ContentPageResolver,
            ContentPageSectionResolver,
            ArticleResolver,
            BannerResolver,
            ServiceDefinitionResolver,
            TestimonialResolver,
        ],
    },
})
export class LipekContentPlugin {}
