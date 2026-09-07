import gql from 'graphql-tag';

/**
 * Admin API surface for staff-managed editorial content (`CONTENT-002`…`CONTENT-006`,
 * rebuild task R-02).
 *
 * Unlike the Shop API in `api-extensions.ts`, this exposes **drafts as well as
 * published records** — that is the whole point of an authoring surface — and
 * every operation is gated on the `Content` CRUD permission.
 *
 * The list queries below take no arguments on purpose. Vendure's
 * `generateListOptions` pass finds every query returning a type that
 * implements `PaginatedList` and *appends* an `options` argument typed
 * `<Type>ListOptions`, generating that input along with its `FilterParameter`
 * and `SortParameter` companions. Declaring `options` by hand fails at parse
 * time with "Unknown type ...ListOptions", because the generated type does
 * not exist yet when this document is read.
 */
export const adminApiExtensions = gql`
    type ContentPageSection implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        sectionType: String!
        position: Int!
        config: JSON
        status: String!
        scheduledAt: DateTime
        pageId: ID!
    }

    type ContentPage implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        slug: String!
        body: String!
        status: String!
        scheduledAt: DateTime
        publishedAt: DateTime
        sections: [ContentPageSection!]!
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    type ContentPageList implements PaginatedList {
        items: [ContentPage!]!
        totalItems: Int!
    }

    type ArticleCategory implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        name: String!
        slug: String!
    }

    type ArticleCategoryList implements PaginatedList {
        items: [ArticleCategory!]!
        totalItems: Int!
    }

    type Article implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        slug: String!
        excerpt: String!
        body: String!
        status: String!
        publishedAt: DateTime
        articleCategoryId: ID
        featuredAssetId: ID
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    type ArticleList implements PaginatedList {
        items: [Article!]!
        totalItems: Int!
    }

    type Banner implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        message: String!
        ctaLabel: String
        ctaUrl: String
        status: String!
        scheduledAt: DateTime
        expiresAt: DateTime
        imageAssetId: ID
    }

    type BannerList implements PaginatedList {
        items: [Banner!]!
        totalItems: Int!
    }

    type FaqItem implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        question: String!
        answer: String!
        category: String
        position: Int!
        status: String!
    }

    type FaqItemList implements PaginatedList {
        items: [FaqItem!]!
        totalItems: Int!
    }

    type PolicyDocument implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        slug: String!
        body: String!
        status: String!
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    type PolicyDocumentList implements PaginatedList {
        items: [PolicyDocument!]!
        totalItems: Int!
    }

    type ServiceDefinition implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        name: String!
        slug: String!
        description: String!
        priceFrom: Int
        category: String!
        status: String!
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    type ServiceDefinitionList implements PaginatedList {
        items: [ServiceDefinition!]!
        totalItems: Int!
    }

    type StoreLocation implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        name: String!
        addressLine1: String!
        addressLine2: String
        city: String!
        region: String
        postalCode: String
        country: String!
        phone: String
        email: String
        openingHours: String
        status: String!
    }

    type StoreLocationList implements PaginatedList {
        items: [StoreLocation!]!
        totalItems: Int!
    }

    type Testimonial implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        authorName: String!
        quote: String!
        rating: Int
        status: String!
    }

    type TestimonialList implements PaginatedList {
        items: [Testimonial!]!
        totalItems: Int!
    }

    # --- Inputs -----------------------------------------------------------
    # "status" is a String rather than an enum so a future workflow state can
    # be added without a breaking schema change; the service validates it.

    input CreateContentPageInput {
        title: String!
        slug: String!
        body: String
        status: String
        scheduledAt: DateTime
        publishedAt: DateTime
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }
    input UpdateContentPageInput {
        id: ID!
        title: String
        slug: String
        body: String
        status: String
        scheduledAt: DateTime
        publishedAt: DateTime
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    input CreateContentPageSectionInput {
        pageId: ID!
        sectionType: String!
        position: Int
        config: JSON
        status: String
        scheduledAt: DateTime
    }
    input UpdateContentPageSectionInput {
        id: ID!
        sectionType: String
        position: Int
        config: JSON
        status: String
        scheduledAt: DateTime
    }

    input CreateArticleCategoryInput {
        name: String!
        slug: String!
    }
    input UpdateArticleCategoryInput {
        id: ID!
        name: String
        slug: String
    }

    input CreateArticleInput {
        title: String!
        slug: String!
        excerpt: String
        body: String
        status: String
        publishedAt: DateTime
        articleCategoryId: ID
        featuredAssetId: ID
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }
    input UpdateArticleInput {
        id: ID!
        title: String
        slug: String
        excerpt: String
        body: String
        status: String
        publishedAt: DateTime
        articleCategoryId: ID
        featuredAssetId: ID
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    input CreateBannerInput {
        title: String!
        message: String
        ctaLabel: String
        ctaUrl: String
        status: String
        scheduledAt: DateTime
        expiresAt: DateTime
        imageAssetId: ID
    }
    input UpdateBannerInput {
        id: ID!
        title: String
        message: String
        ctaLabel: String
        ctaUrl: String
        status: String
        scheduledAt: DateTime
        expiresAt: DateTime
        imageAssetId: ID
    }

    input CreateFaqItemInput {
        question: String!
        answer: String!
        category: String
        position: Int
        status: String
    }
    input UpdateFaqItemInput {
        id: ID!
        question: String
        answer: String
        category: String
        position: Int
        status: String
    }

    input CreatePolicyDocumentInput {
        title: String!
        slug: String!
        body: String
        status: String
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }
    input UpdatePolicyDocumentInput {
        id: ID!
        title: String
        slug: String
        body: String
        status: String
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    input CreateServiceDefinitionInput {
        name: String!
        slug: String!
        description: String
        priceFrom: Int
        category: String!
        status: String
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }
    input UpdateServiceDefinitionInput {
        id: ID!
        name: String
        slug: String
        description: String
        priceFrom: Int
        category: String
        status: String
        metaTitle: String
        metaDescription: String
        ogImageAssetId: ID
    }

    input CreateStoreLocationInput {
        name: String!
        addressLine1: String!
        addressLine2: String
        city: String!
        region: String
        postalCode: String
        country: String!
        phone: String
        email: String
        openingHours: String
        status: String
    }
    input UpdateStoreLocationInput {
        id: ID!
        name: String
        addressLine1: String
        addressLine2: String
        city: String
        region: String
        postalCode: String
        country: String
        phone: String
        email: String
        openingHours: String
        status: String
    }

    input CreateTestimonialInput {
        authorName: String!
        quote: String!
        rating: Int
        status: String
    }
    input UpdateTestimonialInput {
        id: ID!
        authorName: String
        quote: String
        rating: Int
        status: String
    }

    # --- Operations -------------------------------------------------------

    extend type Query {
        contentPages: ContentPageList!
        contentPage(id: ID!): ContentPage
        contentPageSections(pageId: ID!): [ContentPageSection!]!

        articleCategories: ArticleCategoryList!
        articleCategory(id: ID!): ArticleCategory

        articles: ArticleList!
        article(id: ID!): Article

        banners: BannerList!
        banner(id: ID!): Banner

        faqItems: FaqItemList!
        faqItem(id: ID!): FaqItem

        policyDocuments: PolicyDocumentList!
        policyDocument(id: ID!): PolicyDocument

        serviceDefinitions: ServiceDefinitionList!
        serviceDefinition(id: ID!): ServiceDefinition

        storeLocations: StoreLocationList!
        storeLocation(id: ID!): StoreLocation

        testimonials: TestimonialList!
        testimonial(id: ID!): Testimonial
    }

    extend type Mutation {
        createContentPage(input: CreateContentPageInput!): ContentPage!
        updateContentPage(input: UpdateContentPageInput!): ContentPage!
        deleteContentPage(id: ID!): DeletionResponse!

        createContentPageSection(input: CreateContentPageSectionInput!): ContentPageSection!
        updateContentPageSection(input: UpdateContentPageSectionInput!): ContentPageSection!
        deleteContentPageSection(id: ID!): DeletionResponse!

        createArticleCategory(input: CreateArticleCategoryInput!): ArticleCategory!
        updateArticleCategory(input: UpdateArticleCategoryInput!): ArticleCategory!
        deleteArticleCategory(id: ID!): DeletionResponse!

        createArticle(input: CreateArticleInput!): Article!
        updateArticle(input: UpdateArticleInput!): Article!
        deleteArticle(id: ID!): DeletionResponse!

        createBanner(input: CreateBannerInput!): Banner!
        updateBanner(input: UpdateBannerInput!): Banner!
        deleteBanner(id: ID!): DeletionResponse!

        createFaqItem(input: CreateFaqItemInput!): FaqItem!
        updateFaqItem(input: UpdateFaqItemInput!): FaqItem!
        deleteFaqItem(id: ID!): DeletionResponse!

        createPolicyDocument(input: CreatePolicyDocumentInput!): PolicyDocument!
        updatePolicyDocument(input: UpdatePolicyDocumentInput!): PolicyDocument!
        deletePolicyDocument(id: ID!): DeletionResponse!

        createServiceDefinition(input: CreateServiceDefinitionInput!): ServiceDefinition!
        updateServiceDefinition(input: UpdateServiceDefinitionInput!): ServiceDefinition!
        deleteServiceDefinition(id: ID!): DeletionResponse!

        createStoreLocation(input: CreateStoreLocationInput!): StoreLocation!
        updateStoreLocation(input: UpdateStoreLocationInput!): StoreLocation!
        deleteStoreLocation(id: ID!): DeletionResponse!

        createTestimonial(input: CreateTestimonialInput!): Testimonial!
        updateTestimonial(input: UpdateTestimonialInput!): Testimonial!
        deleteTestimonial(id: ID!): DeletionResponse!
    }
`;
