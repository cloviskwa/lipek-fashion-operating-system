import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Badge from '@/components/ui/primitives/Badge';
import Hero from '@/components/sections/Hero';
import ServiceCardGrid from '@/components/sections/ServiceCardGrid';
import ProcessSteps from '@/components/sections/ProcessSteps';
import GalleryGrid from '@/components/sections/GalleryGrid';
import TestimonialCard from '@/components/sections/TestimonialCard';
import Newsletter from '@/components/sections/Newsletter';
import Cta from '@/components/ui/primitives/Cta';
import {
  getCustomTailoringOverview,
  getGalleryCategories,
  getProcessSteps,
  getServiceBySlug,
  getTestimonials,
} from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Lipek Fashion — Bespoke Tailoring, Perfectly Fitted',
  description:
    'Made-to-measure suits, occasion wear, traditional fashion, alterations and garment care from Lipek Fashion’s Douala and Yaoundé ateliers.',
  path: '/',
});

export default function HomePage() {
  const customTailoring = getCustomTailoringOverview();
  const alterations = getServiceBySlug('alterations');
  const laundry = getServiceBySlug('laundry');
  const processSteps = getProcessSteps();
  const galleryCategories = getGalleryCategories();
  const testimonials = getTestimonials().slice(0, 3);

  return (
    <>
      <Hero
        eyebrow="Lipek Fashion Atelier"
        title="Bespoke tailoring, perfectly fitted."
        description="From boardroom suits to bridal gowns and traditional ceremony wear — every piece is cut from your own measurements, fitted on you, and finished by hand."
        primaryCta={{ label: 'Book a Fitting', href: '/book-fitting' }}
        secondaryCta={{ label: 'Explore Services', href: '/services' }}
        stats={[
          { label: 'Years tailoring', value: '15+' },
          { label: 'Garments delivered', value: '6,000+' },
          { label: 'Fitting sessions', value: '2 per order' },
          { label: 'Ateliers', value: 'Douala & Yaoundé' },
        ]}
      />

      <Section tone="cream">
        <Container>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge>What We Do</Badge>
              <h2 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">Our Services</h2>
            </div>
            <Link href="/services" className="text-sm font-semibold text-gold-dark hover:underline">
              View all services →
            </Link>
          </div>
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

      <Section tone="white">
        <Container>
          <div className="mb-10 text-center">
            <Badge>How It Works</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">Our Process</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink/70">
              Four steps, two fittings, one garment built around your body — not a size chart.
            </p>
          </div>
          <ProcessSteps steps={processSteps} />
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge>Recent Work</Badge>
              <h2 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">Gallery</h2>
            </div>
            <Link href="/gallery" className="text-sm font-semibold text-gold-dark hover:underline">
              View full gallery →
            </Link>
          </div>
          <GalleryGrid categories={galleryCategories} />
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <div className="mb-10 text-center">
            <Badge>Client Words</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Cta href="/testimonials" variant="outline">
              Read More Testimonials
            </Cta>
          </div>
        </Container>
      </Section>

      <Newsletter />
    </>
  );
}
