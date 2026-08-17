import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type {
  BlogPost,
  CustomTailoringSubService,
  FaqTopic,
  GalleryCategory,
  LegalDoc,
  ProcessStep,
  ServiceContent,
  ShopCategory,
  Testimonial,
} from './types';

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content');

function readJsonFile<T>(...segments: string[]): T {
  const filePath = path.join(CONTENT_ROOT, ...segments);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function readJsonDir<T>(dirSegments: string[], excludeFiles: string[] = []): T[] {
  const dirPath = path.join(CONTENT_ROOT, ...dirSegments);
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.json') && !excludeFiles.includes(file));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
    return JSON.parse(raw) as T;
  });
}

// ---- Services ----
export function getServiceBySlug(slug: 'alterations' | 'laundry'): ServiceContent {
  return readJsonFile<ServiceContent>('services', `${slug}.json`);
}

export function getCustomTailoringOverview(): ServiceContent {
  return readJsonFile<ServiceContent>('services', 'custom-tailoring', 'index.json');
}

export function getCustomTailoringSubServices(): CustomTailoringSubService[] {
  return readJsonDir<CustomTailoringSubService>(['services', 'custom-tailoring'], ['index.json']).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
}

export function getCustomTailoringSubServiceBySlug(
  slug: string,
): CustomTailoringSubService | undefined {
  return getCustomTailoringSubServices().find((service) => service.slug === slug);
}

// ---- Process ----
export function getProcessSteps(): ProcessStep[] {
  return readJsonDir<ProcessStep>(['process']).sort((a, b) => a.order - b.order);
}

export function getProcessStepBySlug(slug: string): ProcessStep | undefined {
  return getProcessSteps().find((step) => step.slug === slug);
}

// ---- Gallery ----
export function getGalleryCategories(): GalleryCategory[] {
  return readJsonDir<GalleryCategory>(['gallery']);
}

export function getGalleryCategoryBySlug(slug: string): GalleryCategory | undefined {
  return getGalleryCategories().find((category) => category.slug === slug);
}

// ---- FAQ ----
export function getFaqTopics(): FaqTopic[] {
  return readJsonDir<FaqTopic>(['faq']);
}

export function getFaqTopicBySlug(slug: string): FaqTopic | undefined {
  return getFaqTopics().find((topic) => topic.slug === slug);
}

// ---- Legal ----
export function getLegalDocs(): LegalDoc[] {
  return readJsonDir<LegalDoc>(['legal']);
}

export function getLegalDocBySlug(slug: string): LegalDoc | undefined {
  return getLegalDocs().find((doc) => doc.slug === slug);
}

// ---- Blog ----
export function getBlogPosts(): BlogPost[] {
  return readJsonDir<BlogPost>(['blog']).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return getBlogPosts().filter((post) => post.category === category);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

// ---- Testimonials ----
export function getTestimonials(): Testimonial[] {
  return readJsonFile<Testimonial[]>('testimonials', 'testimonials.json');
}

// ---- Shop ----
export function getShopCategories(): ShopCategory[] {
  return readJsonDir<ShopCategory>(['shop']);
}

export function getShopCategoryBySlug(slug: string): ShopCategory | undefined {
  return getShopCategories().find((category) => category.slug === slug);
}

// ---- Business data ----
export interface BusinessData {
  hours: { days: string; open: string | null; close: string | null; note?: string }[];
  locations: {
    id: string;
    name: string;
    address: string;
    phone: string;
    mapUrl: string;
    isFlagship: boolean;
  }[];
  priceRanges: { service: string; from: number; to: number; currency: string }[];
}

export function getBusinessData(): BusinessData {
  return readJsonFile<BusinessData>('data', 'business.json');
}
