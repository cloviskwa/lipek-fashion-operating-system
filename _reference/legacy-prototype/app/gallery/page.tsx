import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import GalleryGrid from '@/components/sections/GalleryGrid';
import { getGalleryCategories } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Gallery',
  description: 'A look at recent Lipek Fashion work across weddings, corporate, traditional and casual wear.',
  path: '/gallery',
});

export default function GalleryPage() {
  const categories = getGalleryCategories();

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Browse recent work by category, from bridal gowns to everyday tailored separates."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
        ]}
      />
      <Section tone="white">
        <Container>
          <GalleryGrid categories={categories} />
        </Container>
      </Section>
    </>
  );
}
