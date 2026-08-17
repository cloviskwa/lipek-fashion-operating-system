import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import Cta from '@/components/ui/primitives/Cta';
import { getBusinessData } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Fitting Availability',
  description: 'Check typical fitting availability across Lipek Fashion ateliers before you book.',
  path: '/book-fitting/calendar',
});

const SAMPLE_SLOTS = [
  { day: 'Monday', slots: ['10:00', '11:30', '14:00', '16:00'] },
  { day: 'Tuesday', slots: ['09:30', '13:00', '15:30'] },
  { day: 'Wednesday', slots: ['10:00', '12:00', '14:30', '17:00'] },
  { day: 'Thursday', slots: ['09:30', '11:00', '15:00'] },
  { day: 'Friday', slots: ['10:00', '13:30', '16:30'] },
  { day: 'Saturday', slots: ['10:30', '12:00'] },
];

export default function BookingCalendarPage() {
  const business = getBusinessData();

  return (
    <>
      <PageHeader
        eyebrow="Book a Fitting"
        title="Fitting Availability"
        description="A typical week of fitting slots across our ateliers. Exact availability is confirmed when you submit a request."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Book a Fitting', path: '/book-fitting' },
          { name: 'Calendar', path: '/book-fitting/calendar' },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_SLOTS.map((day) => (
              <div key={day.day} className="rounded-lg border border-line bg-white p-5">
                <h3 className="font-semibold text-ink">{day.day}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {day.slots.map((slot) => (
                    <li
                      key={slot}
                      className="rounded-pill border border-line px-3 py-1 text-xs font-medium text-ink/70"
                    >
                      {slot}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink/50">
            Sunday: {business.hours.find((h) => h.days === 'Sunday')?.note ?? 'Closed'}.
          </p>
          <div className="mt-10 text-center">
            <Cta href="/book-fitting" variant="primary">
              Request a Slot
            </Cta>
          </div>
        </Container>
      </Section>
    </>
  );
}
