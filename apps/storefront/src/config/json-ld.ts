/**
 * schema.org JSON-LD structured-data builders.
 *
 * `src/config/metadata.ts` (official starter, generated) already covers the
 * Next.js `Metadata` API (title/description/canonical/OG/robots). This file
 * covers the separate concern of `<script type="application/ld+json">`
 * structured data, which the official starter does not yet have.
 *
 * FOUND-020 (Phase 1B): ported from the prior static-prototype repository's
 * `lib/schema/builders.ts` pattern, adapted so every builder takes its data
 * as parameters rather than importing hard-coded business constants -- the
 * original pattern read `SITE_NAME`/`CONTACT`/`SOCIAL_LINKS` from a static
 * config module, which is exactly the "hard-coded business content" the SOT
 * forbids (source of truth §52E). These builders are pure functions; the
 * real business data (store name, address, hours, social links, FAQ/article
 * content) is wired in once it has a real source -- the CMS content plugin
 * (`CONTENT-*`, Phase 2) and catalog data, not before.
 */

export type JsonLdNode = Record<string, unknown>;

export interface LocalBusinessInput {
    name: string;
    url: string;
    telephone?: string;
    email?: string;
    streetAddress?: string;
    sameAs?: string[];
}

export function buildLocalBusinessSchema(input: LocalBusinessInput): JsonLdNode {
    return {
        '@type': 'ClothingStore',
        '@id': `${input.url}#business`,
        name: input.name,
        url: input.url,
        ...(input.telephone ? {telephone: input.telephone} : {}),
        ...(input.email ? {email: input.email} : {}),
        ...(input.streetAddress
            ? {address: {'@type': 'PostalAddress', streetAddress: input.streetAddress}}
            : {}),
        ...(input.sameAs?.length ? {sameAs: input.sameAs} : {}),
    };
}

export function buildBreadcrumbSchema(items: Array<{name: string; url: string}>): JsonLdNode {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function buildFaqSchema(items: Array<{question: string; answer: string}>): JsonLdNode {
    return {
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {'@type': 'Answer', text: item.answer},
        })),
    };
}

export interface ArticleInput {
    title: string;
    description: string;
    author: string;
    publishedAt: string;
    url: string;
}

export function buildArticleSchema(input: ArticleInput): JsonLdNode {
    return {
        '@type': 'Article',
        headline: input.title,
        description: input.description,
        author: {'@type': 'Person', name: input.author},
        datePublished: input.publishedAt,
        mainEntityOfPage: input.url,
    };
}

/** Combines one or more nodes into a single `@graph`, ready to serialize into one `<script type="application/ld+json">` tag. */
export function mergeJsonLdGraph(...nodes: JsonLdNode[]): JsonLdNode {
    return {
        '@context': 'https://schema.org',
        '@graph': nodes,
    };
}
