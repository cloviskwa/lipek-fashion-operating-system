import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Card from '@/components/ui/primitives/Card';
import PageHeader from '@/components/sections/PageHeader';
import { getShopCategories, getShopCategoryBySlug } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getShopCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getShopCategoryBySlug(slug);
  if (!category) return {};

  return buildPageMetadata({
    title: category.seo.title,
    description: category.seo.description,
    path: `/shop/${slug}`,
  });
}

export default async function ShopCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getShopCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title={category.name}
        description={category.summary}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: category.name, path: `/shop/${slug}` },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.products.map((product) => (
              <Card key={product.id}>
                <div className="mb-4 h-40 rounded-md bg-cream-deep" />
                <h3 className="font-heading text-lg font-semibold text-ink">{product.name}</h3>
                <p className="mt-2 text-sm text-ink/70">{product.description}</p>
                <p className="mt-3 text-sm font-semibold text-gold-dark">
                  {product.currency} {product.price}
                </p>
                <p className="mt-1 text-xs text-ink/50">Sizes: {product.sizes.join(', ')}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
