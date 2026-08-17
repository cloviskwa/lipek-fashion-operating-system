import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site';
import {
  getBlogPosts,
  getCustomTailoringSubServices,
  getFaqTopics,
  getGalleryCategories,
  getLegalDocs,
  getProcessSteps,
  getShopCategories,
} from '@/lib/content/reader';

const STATIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/services/custom-tailoring',
  '/services/alterations',
  '/services/laundry',
  '/process',
  '/gallery',
  '/shop',
  '/book-fitting',
  '/book-fitting/calendar',
  '/testimonials',
  '/testimonials/video-testimonials',
  '/blog',
  '/faq',
  '/contact',
  '/contact/location',
  '/contact/wholesale',
  '/legal',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const dynamicRoutes = [
    ...getCustomTailoringSubServices().map((s) => `/services/custom-tailoring/${s.slug}`),
    ...getProcessSteps().map((s) => `/process/${s.slug}`),
    ...getGalleryCategories().map((c) => `/gallery/${c.slug}`),
    ...getShopCategories().map((c) => `/shop/${c.slug}`),
    ...getFaqTopics().map((t) => `/faq/${t.slug}`),
    ...getLegalDocs().map((d) => `/legal/${d.slug}`),
    ...getBlogPosts().map((p) => `/blog/${p.category}/${p.slug}`),
  ];

  return [...STATIC_ROUTES, ...dynamicRoutes].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: new Date(0),
  }));
}
