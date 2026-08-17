import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import BookingForm from '@/components/forms/BookingForm';
import { getBusinessData } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Book a Fitting',
  description: 'Book a fitting session at Lipek Fashion — choose your service, preferred date and atelier location.',
  path: '/book-fitting',
});

export default function BookFittingPage() {
  const business = getBusinessData();

  return (
    <>
      <PageHeader
        title="Book a Fitting"
        description="Tell us what you need and when — we'll confirm your appointment by phone within one business day."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Book a Fitting', path: '/book-fitting' },
        ]}
      />
      <Section tone="white">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BookingForm />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Atelier Hours</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink/70">
              {business.hours.map((slot) => (
                <li key={slot.days} className="flex justify-between gap-4">
                  <span>{slot.days}</span>
                  <span>{slot.note ?? `${slot.open} – ${slot.close}`}</span>
                </li>
              ))}
            </ul>
            <h2 className="mt-8 text-lg font-semibold text-ink">Locations</h2>
            <ul className="mt-4 space-y-4 text-sm text-ink/70">
              {business.locations.map((location) => (
                <li key={location.id}>
                  <p className="font-medium text-ink">{location.name}</p>
                  <p>{location.address}</p>
                  <p>{location.phone}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
