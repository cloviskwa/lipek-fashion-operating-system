export interface SeoFields {
  title: string;
  description: string;
}

export interface ServiceContent {
  slug: string;
  name: string;
  shortDescription: string;
  heroImage: string;
  turnaround: string;
  priceFrom: number;
  currency: string;
  highlights: string[];
  body: string[];
  seo: SeoFields;
}

export interface CustomTailoringSubService extends ServiceContent {
  category: 'custom-tailoring';
  fabricNotes: string;
}

export interface ProcessStep {
  slug: string;
  order: number;
  name: string;
  duration: string;
  summary: string;
  body: string[];
  seo: SeoFields;
}

export interface GalleryCategory {
  slug: string;
  name: string;
  summary: string;
  accentColor: string;
  itemCount: number;
  items: { caption: string }[];
  seo: SeoFields;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqTopic {
  slug: string;
  name: string;
  summary: string;
  items: FaqItem[];
  seo: SeoFields;
}

export interface LegalDoc {
  slug: string;
  title: string;
  effectiveDate: string;
  sections: { heading: string; body: string[] }[];
  seo: SeoFields;
}

export interface BlogPost {
  slug: string;
  category: 'fashion-tips' | 'fabric-care' | 'style-guides' | 'african-fashion';
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
  body: string[];
  seo: SeoFields;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  service: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  sizes: string[];
}

export interface ShopCategory {
  slug: string;
  name: string;
  summary: string;
  products: ShopProduct[];
  seo: SeoFields;
}
