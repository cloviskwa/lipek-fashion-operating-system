import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import { getLegalDocBySlug, getLegalDocs } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getLegalDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDocBySlug(slug);
  if (!doc) return {};

  return buildPageMetadata({
    title: doc.seo.title,
    description: doc.seo.description,
    path: `/legal/${slug}`,
  });
}

export default async function LegalDocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getLegalDocBySlug(slug);
  if (!doc) notFound();

  return (
    <>
      <PageHeader
        eyebrow={`Effective ${doc.effectiveDate}`}
        title={doc.title}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Legal', path: '/legal' },
          { name: doc.title, path: `/legal/${slug}` },
        ]}
      />
      <Section tone="white">
        <Container className="max-w-3xl space-y-10">
          {doc.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/75">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
