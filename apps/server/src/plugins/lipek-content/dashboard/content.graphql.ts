import { graphql } from '@/gql';

/**
 * Typed documents for the content Dashboard screens (rebuild task R-02).
 *
 * `ListPage` needs a query returning `items` + `totalItems`; `DetailPage`
 * needs a single-entity query plus create and update mutations, and generates
 * its form fields from the update input type. Field sets are therefore chosen
 * for what staff need to see and edit, not for completeness.
 */

// --- Pages ----------------------------------------------------------------

export const contentPageListQuery = graphql(`
    query ContentPageList($options: ContentPageListOptions) {
        contentPages(options: $options) {
            items {
                id
                createdAt
                updatedAt
                title
                slug
                status
                publishedAt
            }
            totalItems
        }
    }
`);

export const contentPageDetailQuery = graphql(`
    query ContentPageDetail($id: ID!) {
        contentPage(id: $id) {
            id
            createdAt
            updatedAt
            title
            slug
            body
            status
            scheduledAt
            publishedAt
            metaTitle
            metaDescription
            sections {
                id
                sectionType
                position
                status
                config
            }
        }
    }
`);

export const createContentPageMutation = graphql(`
    mutation CreateContentPage($input: CreateContentPageInput!) {
        createContentPage(input: $input) {
            id
        }
    }
`);

export const updateContentPageMutation = graphql(`
    mutation UpdateContentPage($input: UpdateContentPageInput!) {
        updateContentPage(input: $input) {
            id
        }
    }
`);

// --- Articles -------------------------------------------------------------

export const articleListQuery = graphql(`
    query ArticleList($options: ArticleListOptions) {
        articles(options: $options) {
            items {
                id
                createdAt
                updatedAt
                title
                slug
                status
                publishedAt
            }
            totalItems
        }
    }
`);

export const articleDetailQuery = graphql(`
    query ArticleDetail($id: ID!) {
        article(id: $id) {
            id
            createdAt
            updatedAt
            title
            slug
            excerpt
            body
            status
            publishedAt
            articleCategoryId
            featuredAssetId
            metaTitle
            metaDescription
        }
    }
`);

export const createArticleMutation = graphql(`
    mutation CreateArticle($input: CreateArticleInput!) {
        createArticle(input: $input) {
            id
        }
    }
`);

export const updateArticleMutation = graphql(`
    mutation UpdateArticle($input: UpdateArticleInput!) {
        updateArticle(input: $input) {
            id
        }
    }
`);

// --- Article categories ---------------------------------------------------

export const articleCategoryListQuery = graphql(`
    query ArticleCategoryList($options: ArticleCategoryListOptions) {
        articleCategories(options: $options) {
            items {
                id
                createdAt
                updatedAt
                name
                slug
            }
            totalItems
        }
    }
`);

export const articleCategoryDetailQuery = graphql(`
    query ArticleCategoryDetail($id: ID!) {
        articleCategory(id: $id) {
            id
            createdAt
            updatedAt
            name
            slug
        }
    }
`);

export const createArticleCategoryMutation = graphql(`
    mutation CreateArticleCategory($input: CreateArticleCategoryInput!) {
        createArticleCategory(input: $input) {
            id
        }
    }
`);

export const updateArticleCategoryMutation = graphql(`
    mutation UpdateArticleCategory($input: UpdateArticleCategoryInput!) {
        updateArticleCategory(input: $input) {
            id
        }
    }
`);

// --- Banners --------------------------------------------------------------

export const bannerListQuery = graphql(`
    query BannerList($options: BannerListOptions) {
        banners(options: $options) {
            items {
                id
                createdAt
                updatedAt
                title
                status
                scheduledAt
                expiresAt
            }
            totalItems
        }
    }
`);

export const bannerDetailQuery = graphql(`
    query BannerDetail($id: ID!) {
        banner(id: $id) {
            id
            createdAt
            updatedAt
            title
            message
            ctaLabel
            ctaUrl
            status
            scheduledAt
            expiresAt
            imageAssetId
        }
    }
`);

export const createBannerMutation = graphql(`
    mutation CreateBanner($input: CreateBannerInput!) {
        createBanner(input: $input) {
            id
        }
    }
`);

export const updateBannerMutation = graphql(`
    mutation UpdateBanner($input: UpdateBannerInput!) {
        updateBanner(input: $input) {
            id
        }
    }
`);

// --- FAQs -----------------------------------------------------------------

export const faqItemListQuery = graphql(`
    query FaqItemList($options: FaqItemListOptions) {
        faqItems(options: $options) {
            items {
                id
                createdAt
                updatedAt
                question
                category
                position
                status
            }
            totalItems
        }
    }
`);

export const faqItemDetailQuery = graphql(`
    query FaqItemDetail($id: ID!) {
        faqItem(id: $id) {
            id
            createdAt
            updatedAt
            question
            answer
            category
            position
            status
        }
    }
`);

export const createFaqItemMutation = graphql(`
    mutation CreateFaqItem($input: CreateFaqItemInput!) {
        createFaqItem(input: $input) {
            id
        }
    }
`);

export const updateFaqItemMutation = graphql(`
    mutation UpdateFaqItem($input: UpdateFaqItemInput!) {
        updateFaqItem(input: $input) {
            id
        }
    }
`);

// --- Policies -------------------------------------------------------------

export const policyDocumentListQuery = graphql(`
    query PolicyDocumentList($options: PolicyDocumentListOptions) {
        policyDocuments(options: $options) {
            items {
                id
                createdAt
                updatedAt
                title
                slug
                status
            }
            totalItems
        }
    }
`);

export const policyDocumentDetailQuery = graphql(`
    query PolicyDocumentDetail($id: ID!) {
        policyDocument(id: $id) {
            id
            createdAt
            updatedAt
            title
            slug
            body
            status
            metaTitle
            metaDescription
        }
    }
`);

export const createPolicyDocumentMutation = graphql(`
    mutation CreatePolicyDocument($input: CreatePolicyDocumentInput!) {
        createPolicyDocument(input: $input) {
            id
        }
    }
`);

export const updatePolicyDocumentMutation = graphql(`
    mutation UpdatePolicyDocument($input: UpdatePolicyDocumentInput!) {
        updatePolicyDocument(input: $input) {
            id
        }
    }
`);

// --- Services -------------------------------------------------------------

export const serviceDefinitionListQuery = graphql(`
    query ServiceDefinitionList($options: ServiceDefinitionListOptions) {
        serviceDefinitions(options: $options) {
            items {
                id
                createdAt
                updatedAt
                name
                slug
                category
                priceFrom
                status
            }
            totalItems
        }
    }
`);

export const serviceDefinitionDetailQuery = graphql(`
    query ServiceDefinitionDetail($id: ID!) {
        serviceDefinition(id: $id) {
            id
            createdAt
            updatedAt
            name
            slug
            description
            priceFrom
            category
            status
            metaTitle
            metaDescription
        }
    }
`);

export const createServiceDefinitionMutation = graphql(`
    mutation CreateServiceDefinition($input: CreateServiceDefinitionInput!) {
        createServiceDefinition(input: $input) {
            id
        }
    }
`);

export const updateServiceDefinitionMutation = graphql(`
    mutation UpdateServiceDefinition($input: UpdateServiceDefinitionInput!) {
        updateServiceDefinition(input: $input) {
            id
        }
    }
`);

// --- Store locations ------------------------------------------------------

export const storeLocationListQuery = graphql(`
    query StoreLocationList($options: StoreLocationListOptions) {
        storeLocations(options: $options) {
            items {
                id
                createdAt
                updatedAt
                name
                city
                country
                status
            }
            totalItems
        }
    }
`);

export const storeLocationDetailQuery = graphql(`
    query StoreLocationDetail($id: ID!) {
        storeLocation(id: $id) {
            id
            createdAt
            updatedAt
            name
            addressLine1
            addressLine2
            city
            region
            postalCode
            country
            phone
            email
            openingHours
            status
        }
    }
`);

export const createStoreLocationMutation = graphql(`
    mutation CreateStoreLocation($input: CreateStoreLocationInput!) {
        createStoreLocation(input: $input) {
            id
        }
    }
`);

export const updateStoreLocationMutation = graphql(`
    mutation UpdateStoreLocation($input: UpdateStoreLocationInput!) {
        updateStoreLocation(input: $input) {
            id
        }
    }
`);

// --- Testimonials ---------------------------------------------------------

export const testimonialListQuery = graphql(`
    query TestimonialList($options: TestimonialListOptions) {
        testimonials(options: $options) {
            items {
                id
                createdAt
                updatedAt
                authorName
                rating
                status
            }
            totalItems
        }
    }
`);

export const testimonialDetailQuery = graphql(`
    query TestimonialDetail($id: ID!) {
        testimonial(id: $id) {
            id
            createdAt
            updatedAt
            authorName
            quote
            rating
            status
        }
    }
`);

export const createTestimonialMutation = graphql(`
    mutation CreateTestimonial($input: CreateTestimonialInput!) {
        createTestimonial(input: $input) {
            id
        }
    }
`);

export const updateTestimonialMutation = graphql(`
    mutation UpdateTestimonial($input: UpdateTestimonialInput!) {
        updateTestimonial(input: $input) {
            id
        }
    }
`);
