import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import { getGalleryCategories, getGalleryCategoryBySlug } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getGalleryCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getGalleryCategoryBySlug(slug);
  if (!category) return {};

  return buildPageMetadata({
    title: category.seo.title,
    description: category.seo.description,
    path: `/gallery/${slug}`,
  });
}

export default async function GalleryCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getGalleryCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title={category.name}
        description={category.summary}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Gallery', path: '/gallery' },
          { name: category.name, path: `/gallery/${slug}` },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <figure
                key={item.caption}
                className="flex h-64 flex-col justify-end rounded-lg p-5 text-white"
                style={{ backgroundColor: category.accentColor }}
              >
                <figcaption className="rounded-md bg-black/30 px-3 py-2 text-sm backdrop-blur">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
