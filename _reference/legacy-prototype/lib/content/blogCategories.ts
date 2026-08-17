export interface BlogCategoryMeta {
  slug: string;
  name: string;
  description: string;
}

export const BLOG_CATEGORIES: BlogCategoryMeta[] = [
  {
    slug: 'fashion-tips',
    name: 'Fashion Tips',
    description: 'Practical guidance on fit, wardrobe building and dressing well day to day.',
  },
  {
    slug: 'fabric-care',
    name: 'Fabric Care',
    description: 'How to wash, store and maintain tailored and delicate garments.',
  },
  {
    slug: 'style-guides',
    name: 'Style Guides',
    description: 'Deeper guides on tailoring details, silhouettes and choosing the right cut.',
  },
  {
    slug: 'african-fashion',
    name: 'African Fashion',
    description: 'The stories, fabrics and techniques behind traditional and African-print fashion.',
  },
];

export function getBlogCategoryBySlug(slug: string): BlogCategoryMeta | undefined {
  return BLOG_CATEGORIES.find((category) => category.slug === slug);
}
