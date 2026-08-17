import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import ServiceCardGrid from '@/components/sections/ServiceCardGrid';
import { getCustomTailoringOverview, getCustomTailoringSubServices } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

const overview = getCustomTailoringOverview();

export const metadata: Metadata = buildPageMetadata({
  title: overview.seo.title,
  description: overview.seo.description,
  path: '/services/custom-tailoring',
});

export default function CustomTailoringPage() {
  const subServices = getCustomTailoringSubServices();

  return (
    <>
      <PageHeader
        eyebrow="Service"
        title={overview.name}
        description={overview.shortDescription}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: overview.name, path: '/services/custom-tailoring' },
        ]}
      />

      <Section tone="white">
        <Container>
          <div className="mb-10 max-w-2xl space-y-4 text-sm leading-relaxed text-ink/75">
            {overview.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ServiceCardGrid
            items={subServices.map((service) => ({
              slug: service.slug,
              href: `/services/custom-tailoring/${service.slug}`,
              name: service.name,
              shortDescription: service.shortDescription,
              priceFrom: service.priceFrom,
              currency: service.currency,
            }))}
          />
        </Container>
      </Section>
    </>
  );
}
