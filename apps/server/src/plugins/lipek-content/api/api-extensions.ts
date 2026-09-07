import gql from 'graphql-tag';

/**
 * Shop API surface for staff-managed navigation (`CONTENT-005`).
 *
 * Read-only by design: the storefront renders menus, staff edit them in the
 * Dashboard. `collection` is resolved lazily so the storefront can select as
 * much or as little of the target Collection as a given menu needs.
 */
const navigationApiExtensions = gql`
    type NavigationItem {
        id: ID!
        label: String!
        """
        Literal href. Only set when the item points at neither a Collection
        nor a ContentPage.
        """
        url: String
        position: Int!
        collection: Collection
        children: [NavigationItem!]!
    }

    type NavigationMenu {
        id: ID!
        identifier: String!
        name: String!
        items: [NavigationItem!]!
    }

    extend type Query {
        """
        Look up an enabled navigation menu by its stable identifier, e.g.
        "header" or "footer". Returns null when no such enabled menu exists.
        """
        navigationMenu(identifier: String!): NavigationMenu
    }
`;

/**
 * Shop API surface for staff-managed editorial content (`CONTENT-002`…`CONTENT-006`).
 *
 * Read-only, and published-only: `ContentService` filters every query to
 * PUBLISHED, so draft content is unreachable here by construction.
 *
 * Asset fields resolve to Vendure's own `Asset` type so the storefront can
 * select whichever preview/dimensions it needs, rather than receiving a bare id.
 */
const contentApiExtensions = gql`
    type ContentPageSection {
        id: ID!
        sectionType: String!
        position: Int!
        """
        Per-type payload whose shape depends on sectionType. For example a
        "hero" carries headline/subheadline/ctaLabel/ctaUrl, while
        "categoryCards" carries collectionSlugs. Unknown types are returned
        as-is and simply not rendered.
        """
        config: JSON
    }

    type ContentPage {
        id: ID!
        title: String!
        slug: String!
        body: String!
        publishedAt: DateTime
        sections: [ContentPageSection!]!
        metaTitle: String
        metaDescription: String
        ogImage: Asset
    }

    type ArticleCategory {
        id: ID!
        name: String!
        slug: String!
    }

    type Article {
        id: ID!
        title: String!
        slug: String!
        excerpt: String!
        body: String!
        publishedAt: DateTime
        category: ArticleCategory
        featuredAsset: Asset
        metaTitle: String
        metaDescription: String
        ogImage: Asset
    }

    type Banner {
        id: ID!
        title: String!
        message: String!
        ctaLabel: String
        ctaUrl: String
        image: Asset
    }

    type FaqItem {
        id: ID!
        question: String!
        answer: String!
        category: String
        position: Int!
    }

    type PolicyDocument {
        id: ID!
        title: String!
        slug: String!
        body: String!
        metaTitle: String
        metaDescription: String
    }

    type ServiceDefinition {
        id: ID!
        name: String!
        slug: String!
        description: String!
        """Minor units in the channel currency; null means price on request."""
        priceFrom: Int
        category: String!
        metaTitle: String
        metaDescription: String
        ogImage: Asset
    }

    type StoreLocation {
        id: ID!
        name: String!
        addressLine1: String!
        addressLine2: String
        city: String!
        region: String
        postalCode: String
        country: String!
        phone: String
        email: String
        """Free text, rendered as authored."""
        openingHours: String
    }

    type Testimonial {
        id: ID!
        authorName: String!
        quote: String!
        rating: Int
    }

    extend type Query {
        """A published page and its published sections, by slug."""
        contentPage(slug: String!): ContentPage

        """Published articles, newest first."""
        articles(categorySlug: String, take: Int): [Article!]!
        article(slug: String!): Article
        articleCategories: [ArticleCategory!]!

        """Banners that are published and inside their schedule window right now."""
        activeBanners: [Banner!]!

        faqItems(category: String): [FaqItem!]!
        policyDocument(slug: String!): PolicyDocument
        serviceDefinitions(category: String): [ServiceDefinition!]!
        serviceDefinition(slug: String!): ServiceDefinition
        storeLocations: [StoreLocation!]!
        testimonials(take: Int): [Testimonial!]!
    }
`;

/**
 * The plugin's complete Shop API schema.
 *
 * `shopApiExtensions` accepts a single document, so the navigation and
 * content halves are composed here rather than passed as an array. Repeating
 * `extend type Query` across the two is valid SDL -- the fields merge.
 */
export const shopApiExtensions = gql`
    ${navigationApiExtensions}
    ${contentApiExtensions}
`;
