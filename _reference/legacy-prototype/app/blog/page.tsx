import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Badge from '@/components/ui/primitives/Badge';
import PageHeader from '@/components/sections/PageHeader';
import BlogPostCard from '@/components/sections/BlogPostCard';
import { getBlogPosts } from '@/lib/content/reader';
import { BLOG_CATEGORIES } from '@/lib/content/blogCategories';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog',
  description: 'Fashion tips, fabric care, style guides and African fashion features from Lipek Fashion.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <>
      <PageHeader
        title="Blog"
        description="Notes from the atelier — fit tips, fabric care and the stories behind the styles we cut."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]}
      />

      <Section tone="white">
        <Container>
          <div className="mb-10">
            <Badge>Browse By Topic</Badge>
            <div className="mt-4 flex flex-wrap gap-3">
              {BLOG_CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog/${category.slug}`}
                  className="rounded-pill border border-line px-4 py-2 text-sm font-medium text-ink hover:border-gold hover:text-gold-dark"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
