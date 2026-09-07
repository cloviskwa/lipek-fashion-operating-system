import { defineDashboardExtension, DetailPage, ListPage } from '@vendure/dashboard';
import { AnyRoute } from '@tanstack/react-router';
import { FileText } from 'lucide-react';

import { PageSectionConfigInput } from './page-section-config-input';
import * as docs from './content.graphql';

/**
 * Dashboard screens for staff-managed editorial content (rebuild task R-02).
 *
 * Ten entities share one list/detail shape, so the screens are generated from
 * the table below rather than written out ten times. `DetailPage` builds its
 * own form from the update input type, so only the fields that need special
 * handling — `PageSection.config` — get a custom component.
 *
 * Colocated with the plugin per `ADR-0013`; there is no separate extensions app.
 */

interface ContentResource {
    /** URL segment and page id, e.g. "articles" → /content/articles. */
    key: string;
    /** Nav menu label, and the list page title. */
    title: string;
    /** Singular name shown on the detail page. */
    entityName: string;
    listQuery: unknown;
    detailQuery: unknown;
    createMutation: unknown;
    updateMutation: unknown;
    /** Which field labels the row in the detail page header. */
    titleField: string;
    /** Field searched by the list page's search box. */
    searchField?: string;
}

const RESOURCES: ContentResource[] = [
    {
        key: 'pages',
        title: 'Pages',
        entityName: 'ContentPage',
        listQuery: docs.contentPageListQuery,
        detailQuery: docs.contentPageDetailQuery,
        createMutation: docs.createContentPageMutation,
        updateMutation: docs.updateContentPageMutation,
        titleField: 'title',
        searchField: 'title',
    },
    {
        key: 'articles',
        title: 'Journal',
        entityName: 'Article',
        listQuery: docs.articleListQuery,
        detailQuery: docs.articleDetailQuery,
        createMutation: docs.createArticleMutation,
        updateMutation: docs.updateArticleMutation,
        titleField: 'title',
        searchField: 'title',
    },
    {
        key: 'article-categories',
        title: 'Journal categories',
        entityName: 'ArticleCategory',
        listQuery: docs.articleCategoryListQuery,
        detailQuery: docs.articleCategoryDetailQuery,
        createMutation: docs.createArticleCategoryMutation,
        updateMutation: docs.updateArticleCategoryMutation,
        titleField: 'name',
        searchField: 'name',
    },
    {
        key: 'banners',
        title: 'Banners',
        entityName: 'Banner',
        listQuery: docs.bannerListQuery,
        detailQuery: docs.bannerDetailQuery,
        createMutation: docs.createBannerMutation,
        updateMutation: docs.updateBannerMutation,
        titleField: 'title',
        searchField: 'title',
    },
    {
        key: 'faqs',
        title: 'FAQs',
        entityName: 'FaqItem',
        listQuery: docs.faqItemListQuery,
        detailQuery: docs.faqItemDetailQuery,
        createMutation: docs.createFaqItemMutation,
        updateMutation: docs.updateFaqItemMutation,
        titleField: 'question',
        searchField: 'question',
    },
    {
        key: 'policies',
        title: 'Policies',
        entityName: 'PolicyDocument',
        listQuery: docs.policyDocumentListQuery,
        detailQuery: docs.policyDocumentDetailQuery,
        createMutation: docs.createPolicyDocumentMutation,
        updateMutation: docs.updatePolicyDocumentMutation,
        titleField: 'title',
        searchField: 'title',
    },
    {
        key: 'services',
        title: 'Services',
        entityName: 'ServiceDefinition',
        listQuery: docs.serviceDefinitionListQuery,
        detailQuery: docs.serviceDefinitionDetailQuery,
        createMutation: docs.createServiceDefinitionMutation,
        updateMutation: docs.updateServiceDefinitionMutation,
        titleField: 'name',
        searchField: 'name',
    },
    {
        key: 'locations',
        title: 'Store locations',
        entityName: 'StoreLocation',
        listQuery: docs.storeLocationListQuery,
        detailQuery: docs.storeLocationDetailQuery,
        createMutation: docs.createStoreLocationMutation,
        updateMutation: docs.updateStoreLocationMutation,
        titleField: 'name',
        searchField: 'name',
    },
    {
        key: 'testimonials',
        title: 'Testimonials',
        entityName: 'Testimonial',
        listQuery: docs.testimonialListQuery,
        detailQuery: docs.testimonialDetailQuery,
        createMutation: docs.createTestimonialMutation,
        updateMutation: docs.updateTestimonialMutation,
        titleField: 'authorName',
        searchField: 'authorName',
    },
];

/**
 * Strip the read-only fields the detail query returns but the update input
 * does not accept. Sending them back would fail input validation.
 */
function updateValuesFrom(entity: Record<string, unknown>): Record<string, unknown> {
    const { createdAt, updatedAt, sections, __typename, ...rest } = entity ?? {};
    return rest;
}

export default defineDashboardExtension({
    navSections: [
        {
            id: 'lipek-content',
            title: 'Content',
            icon: FileText,
            order: 250,
        },
    ],
    routes: RESOURCES.flatMap(resource => [
        {
            path: `/content/${resource.key}`,
            navMenuItem: {
                sectionId: 'lipek-content',
                id: resource.key,
                title: resource.title,
            },
            loader: () => ({ breadcrumb: () => resource.title }),
            component: (route: AnyRoute) => (
                <ListPage
                    pageId={`${resource.key}-list`}
                    route={route}
                    title={resource.title}
                    listQuery={resource.listQuery as never}
                    onSearchTermChange={
                        resource.searchField
                            ? (searchTerm: string) =>
                                  searchTerm === ''
                                      ? {}
                                      : { [resource.searchField as string]: { contains: searchTerm } }
                            : undefined
                    }
                />
            ),
        },
        {
            path: `/content/${resource.key}/$id`,
            loader: () => ({ breadcrumb: () => resource.title }),
            component: (route: AnyRoute) => (
                <DetailPage
                    pageId={`${resource.key}-detail`}
                    route={route}
                    entityName={resource.entityName}
                    queryDocument={resource.detailQuery as never}
                    createDocument={resource.createMutation as never}
                    updateDocument={resource.updateMutation as never}
                    setValuesForUpdate={updateValuesFrom as never}
                    title={(entity: Record<string, unknown>) =>
                        String(entity?.[resource.titleField] ?? `New ${resource.entityName}`)
                    }
                />
            ),
        },
    ]),
    detailForms: [
        {
            pageId: 'pages-detail',
            inputs: [
                {
                    // A page section's JSON payload varies by sectionType, so the
                    // auto-form's plain text input cannot edit it correctly.
                    blockId: 'main-form',
                    field: 'config',
                    component: PageSectionConfigInput,
                },
            ],
        },
    ],
});
