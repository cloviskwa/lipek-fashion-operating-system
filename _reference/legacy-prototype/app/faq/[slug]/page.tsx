import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import FaqAccordion from '@/components/sections/FaqAccordion';
import JsonLdScript from '@/components/schema/JsonLdScript';
import { getFaqTopicBySlug, getFaqTopics } from '@/lib/content/reader';
import { buildFaqSchema, mergeJsonLdGraph } from '@/lib/schema/builders';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getFaqTopics().map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getFaqTopicBySlug(slug);
  if (!topic) return {};

  return buildPageMetadata({
    title: topic.seo.title,
    description: topic.seo.description,
    path: `/faq/${slug}`,
  });
}

export default async function FaqTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getFaqTopicBySlug(slug);
  if (!topic) notFound();

  const schema = mergeJsonLdGraph(buildFaqSchema(topic.items));

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title={topic.name}
        description={topic.summary}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
          { name: topic.name, path: `/faq/${slug}` },
        ]}
      />
      <Section tone="white">
        <Container className="max-w-3xl">
          <FaqAccordion items={topic.items} />
        </Container>
      </Section>
      <JsonLdScript schema={schema} />
    </>
  );
}
