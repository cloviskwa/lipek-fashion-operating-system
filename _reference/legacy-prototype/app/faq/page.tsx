import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Card from '@/components/ui/primitives/Card';
import PageHeader from '@/components/sections/PageHeader';
import { getFaqTopics } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'FAQ',
  description: 'Answers to common questions about tailoring, pricing and garment care at Lipek Fashion.',
  path: '/faq',
});

export default function FaqPage() {
  const topics = getFaqTopics();

  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        description="Browse by topic, or reach out directly if you can't find what you're looking for."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {topics.map((topic) => (
              <Card key={topic.slug}>
                <h2 className="font-heading text-xl font-semibold text-ink">{topic.name}</h2>
                <p className="mt-2 text-sm text-ink/70">{topic.summary}</p>
                <Link
                  href={`/faq/${topic.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
                >
                  View questions →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
