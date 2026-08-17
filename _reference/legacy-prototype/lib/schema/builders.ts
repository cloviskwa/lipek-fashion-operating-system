import { CONTACT, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/config/site';

export type JsonLdNode = Record<string, unknown>;

export function buildLocalBusinessSchema(): JsonLdNode {
  return {
    '@type': 'ClothingStore',
    '@id': `${SITE_URL}#business`,
    name: SITE_NAME,
    url: SITE_URL,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address,
    },
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[],
): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).toString(),
    })),
  };
}

export function buildFaqSchema(items: { question: string; answer: string }[]): JsonLdNode {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildArticleSchema(input: {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  path: string;
}): JsonLdNode {
  return {
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    author: { '@type': 'Person', name: input.author },
    datePublished: input.publishedAt,
    mainEntityOfPage: new URL(input.path, SITE_URL).toString(),
  };
}

export function mergeJsonLdGraph(...nodes: JsonLdNode[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
