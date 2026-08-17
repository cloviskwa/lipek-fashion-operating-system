import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Card from '@/components/ui/primitives/Card';
import PageHeader from '@/components/sections/PageHeader';
import { getShopCategories } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Shop',
  description: 'Ready-to-wear pieces and accessories from Lipek Fashion, no fitting appointment required.',
  path: '/shop',
});

export default function ShopPage() {
  const categories = getShopCategories();

  return (
    <>
      <PageHeader
        title="Shop"
        description="Prefer to buy off the shelf? Browse ready-to-wear pieces and accessories cut from the same fabric library as our custom orders."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {categories.map((category) => (
              <Card key={category.slug}>
                <h2 className="font-heading text-2xl font-semibold text-ink">{category.name}</h2>
                <p className="mt-2 text-sm text-ink/70">{category.summary}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gold-dark">
                  {category.products.length} items
                </p>
                <Link
                  href={`/shop/${category.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
                >
                  Browse {category.name} →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
