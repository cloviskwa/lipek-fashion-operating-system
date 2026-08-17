import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Cta from '@/components/ui/primitives/Cta';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Message Sent',
  description: 'Your message has been sent to Lipek Fashion.',
  path: '/contact/thank-you',
  noindex: true,
});

export default function ContactThankYouPage() {
  return (
    <Section tone="cream" className="flex min-h-[60vh] items-center">
      <Container className="text-center">
        <span className="text-5xl" aria-hidden>
          ✓
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">Thank you — message sent</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
          We&apos;ve received your message and will get back to you within one business day.
        </p>
        <div className="mt-8">
          <Cta href="/" variant="primary">
            Back to Home
          </Cta>
        </div>
      </Container>
    </Section>
  );
}
