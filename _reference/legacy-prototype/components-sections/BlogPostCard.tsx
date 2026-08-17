import Link from 'next/link';
import Card from '@/components/ui/primitives/Card';
import type { BlogPost } from '@/lib/content/types';

export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
        {new Date(post.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}{' '}
        · {post.readMinutes} min read
      </p>
      <h3 className="mt-2 font-heading text-xl font-semibold text-ink">{post.title}</h3>
      <p className="mt-2 flex-1 text-sm text-ink/70">{post.excerpt}</p>
      <Link
        href={`/blog/${post.category}/${post.slug}`}
        className="mt-4 inline-flex items-center text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
      >
        Read article →
      </Link>
    </Card>
  );
}
