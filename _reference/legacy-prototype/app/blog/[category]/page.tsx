import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import BlogPostCard from '@/components/sections/BlogPostCard';
import { getBlogPostsByCategory } from '@/lib/content/reader';
import { BLOG_CATEGORIES, getBlogCategoryBySlug } from '@/lib/content/blogCategories';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getBlogCategoryBySlug(categorySlug);
  if (!category) return {};

  return buildPageMetadata({
    title: category.name,
    description: category.description,
    path: `/blog/${categorySlug}`,
  });
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = getBlogCategoryBySlug(categorySlug);
  if (!category) notFound();

  const posts = getBlogPostsByCategory(categorySlug);

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: category.name, path: `/blog/${categorySlug}` },
        ]}
      />
      <Section tone="white">
        <Container>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/60">New articles in this category are on the way.</p>
          )}
        </Container>
      </Section>
    </>
  );
}
