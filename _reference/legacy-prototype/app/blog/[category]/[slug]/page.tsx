import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import JsonLdScript from '@/components/schema/JsonLdScript';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/content/reader';
import { getBlogCategoryBySlug } from '@/lib/content/blogCategories';
import { buildArticleSchema, mergeJsonLdGraph } from '@/lib/schema/builders';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ category: post.category, slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return buildPageMetadata({
    title: post.seo.title,
    description: post.seo.description,
    path: `/blog/${post.category}/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { category: categorySlug, slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post || post.category !== categorySlug) notFound();

  const category = getBlogCategoryBySlug(post.category);
  const schema = mergeJsonLdGraph(
    buildArticleSchema({
      title: post.title,
      description: post.excerpt,
      author: post.author,
      publishedAt: post.publishedAt,
      path: `/blog/${post.category}/${post.slug}`,
    }),
  );

  return (
    <>
      <PageHeader
        eyebrow={category?.name ?? 'Blog'}
        title={post.title}
        description={post.excerpt}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: category?.name ?? post.category, path: `/blog/${post.category}` },
          { name: post.title, path: `/blog/${post.category}/${post.slug}` },
        ]}
      />
      <Section tone="white">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
            By {post.author} ·{' '}
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · {post.readMinutes} min read
          </p>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </Section>
      <JsonLdScript schema={schema} />
    </>
  );
}
