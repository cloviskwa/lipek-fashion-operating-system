import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Cta from '@/components/ui/primitives/Cta';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Fitting Request Received',
  description: 'Your fitting request has been received by Lipek Fashion.',
  path: '/book-fitting/confirmation',
  noindex: true,
});

export default function BookingConfirmationPage() {
  return (
    <Section tone="cream" className="min-h-[60vh] flex items-center">
      <Container className="text-center">
        <span className="text-5xl" aria-hidden>
          ✓
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">
          Your fitting request has been received
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
          A member of our team will call or WhatsApp you within one business day to confirm your
          appointment time and answer any questions about fabric or pricing.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Cta href="/" variant="primary">
            Back to Home
          </Cta>
          <Cta href="/services" variant="outline">
            Browse Services
          </Cta>
        </div>
      </Container>
    </Section>
  );
}
