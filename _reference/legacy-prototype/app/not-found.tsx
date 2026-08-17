import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Cta from '@/components/ui/primitives/Cta';

export default function NotFound() {
  return (
    <Section tone="cream" className="flex min-h-[60vh] items-center">
      <Container className="text-center">
        <p className="font-heading text-6xl font-semibold text-gold-dark">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-ink">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink/70">
          The page you&apos;re looking for may have moved. Try one of the links below.
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
