import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Card from '@/components/ui/primitives/Card';
import PageHeader from '@/components/sections/PageHeader';
import Cta from '@/components/ui/primitives/Cta';
import { getProcessStepBySlug, getProcessSteps } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProcessSteps().map((step) => ({ slug: step.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const step = getProcessStepBySlug(slug);
  if (!step) return {};

  return buildPageMetadata({
    title: step.seo.title,
    description: step.seo.description,
    path: `/process/${slug}`,
  });
}

export default async function ProcessStepPage({ params }: PageProps) {
  const { slug } = await params;
  const step = getProcessStepBySlug(slug);
  if (!step) notFound();

  const allSteps = getProcessSteps();

  return (
    <>
      <PageHeader
        eyebrow={`Step ${step.order} of ${allSteps.length}`}
        title={step.name}
        description={step.summary}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Process', path: '/process' },
          { name: step.name, path: `/process/${slug}` },
        ]}
      />
      <Section tone="white">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-4 text-sm leading-relaxed text-ink/75 lg:col-span-2">
            {step.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                Typical Duration
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">{step.duration}</p>
              <Cta href="/book-fitting" variant="primary" className="mt-6 w-full">
                Book a Fitting
              </Cta>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
