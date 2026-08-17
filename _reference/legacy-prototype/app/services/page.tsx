import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Badge from '@/components/ui/primitives/Badge';
import PageHeader from '@/components/sections/PageHeader';
import ServiceCardGrid from '@/components/sections/ServiceCardGrid';
import {
  getCustomTailoringOverview,
  getCustomTailoringSubServices,
  getServiceBySlug,
} from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Services',
  description:
    'Custom tailoring, alterations and garment laundry & care from Lipek Fashion — every service fitted on you, not guessed from a chart.',
  path: '/services',
});

export default function ServicesPage() {
  const customTailoring = getCustomTailoringOverview();
  const alterations = getServiceBySlug('alterations');
  const laundry = getServiceBySlug('laundry');
  const subServices = getCustomTailoringSubServices();

  return (
    <>
      <PageHeader
        title="Services"
        description="Three core services, each built around the same principle: measured on you, fitted on you, finished by hand."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ]}
      />

      <Section tone="white">
        <Container>
          <ServiceCardGrid
            items={[
              {
                slug: customTailoring.slug,
                href: '/services/custom-tailoring',
                name: customTailoring.name,
                shortDescription: customTailoring.shortDescription,
                priceFrom: customTailoring.priceFrom,
                currency: customTailoring.currency,
              },
              {
                slug: alterations.slug,
                href: '/services/alterations',
                name: alterations.name,
                shortDescription: alterations.shortDescription,
                priceFrom: alterations.priceFrom,
                currency: alterations.currency,
              },
              {
                slug: laundry.slug,
                href: '/services/laundry',
                name: laundry.name,
                shortDescription: laundry.shortDescription,
                priceFrom: laundry.priceFrom,
                currency: laundry.currency,
              },
            ]}
          />
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <div className="mb-10">
            <Badge>Custom Tailoring Categories</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">
              Explore Custom Tailoring
            </h2>
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
