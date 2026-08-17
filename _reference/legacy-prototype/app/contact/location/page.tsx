import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Card from '@/components/ui/primitives/Card';
import PageHeader from '@/components/sections/PageHeader';
import { getBusinessData } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Store Locations',
  description: 'Find Lipek Fashion ateliers in Douala and Yaoundé, with hours and directions.',
  path: '/contact/location',
});

export default function ContactLocationPage() {
  const business = getBusinessData();

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Store Locations"
        description="Visit us in person to browse fabric, discuss a design, or pick up a finished order."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
          { name: 'Location', path: '/contact/location' },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {business.locations.map((location) => (
              <Card key={location.id}>
                <div className="mb-4 h-40 rounded-md bg-cream-deep" />
                <h2 className="font-heading text-xl font-semibold text-ink">{location.name}</h2>
                <p className="mt-2 text-sm text-ink/70">{location.address}</p>
                <p className="mt-1 text-sm text-ink/70">{location.phone}</p>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
                >
                  Get directions →
                </a>
              </Card>
            ))}
          </div>
          <div className="mt-10 rounded-lg border border-line bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">Hours</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              {business.hours.map((slot) => (
                <li key={slot.days} className="flex justify-between gap-4">
                  <span>{slot.days}</span>
                  <span>{slot.note ?? `${slot.open} – ${slot.close}`}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
