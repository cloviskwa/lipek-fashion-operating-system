import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import Card from '@/components/ui/primitives/Card';
import { CONTACT } from '@/lib/config/site';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Wholesale Enquiries',
  description: 'Bulk and wholesale tailoring enquiries for boutiques, event planners and corporate clients.',
  path: '/contact/wholesale',
});

const WHOLESALE_USE_CASES = [
  {
    title: 'Boutiques & Retailers',
    body: 'Stock ready-to-wear or capsule collections cut from our fabric library at wholesale pricing tiers.',
  },
  {
    title: 'Event & Wedding Planners',
    body: 'Coordinate matching bridal party or ceremony outfits for groups of 6 or more with a dedicated timeline.',
  },
  {
    title: 'Corporate Uniforms',
    body: 'Outfit teams in consistent, properly fitted formalwear with per-employee measurement sessions.',
  },
];

export default function ContactWholesalePage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Wholesale Enquiries"
        description="Ordering for a group, a store, or a team? Our wholesale desk handles bulk pricing and coordinated timelines."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
          { name: 'Wholesale', path: '/contact/wholesale' },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {WHOLESALE_USE_CASES.map((useCase) => (
              <Card key={useCase.title}>
                <h2 className="font-heading text-lg font-semibold text-ink">{useCase.title}</h2>
                <p className="mt-2 text-sm text-ink/70">{useCase.body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 rounded-lg border border-line bg-cream-deep p-8 text-center">
            <h2 className="text-lg font-semibold text-ink">Get a Wholesale Quote</h2>
            <p className="mt-2 text-sm text-ink/70">
              Email our wholesale desk with order size, timeline and garment type, and we&apos;ll follow up
              within two business days.
            </p>
            <a
              href={`mailto:${CONTACT.wholesaleEmail}`}
              className="mt-4 inline-block rounded-pill bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark"
            >
              {CONTACT.wholesaleEmail}
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
