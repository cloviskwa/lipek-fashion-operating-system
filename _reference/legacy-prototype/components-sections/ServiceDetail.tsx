import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Card from '@/components/ui/primitives/Card';
import Cta from '@/components/ui/primitives/Cta';
import type { ServiceContent } from '@/lib/content/types';

export default function ServiceDetail({ service }: { service: ServiceContent }) {
  return (
    <Section tone="white">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4 text-sm leading-relaxed text-ink/75">
            {service.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <h2 className="mt-10 text-xl font-semibold text-ink">What&apos;s Included</h2>
          <ul className="mt-4 space-y-2">
            {service.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-sm text-ink/75">
                <span className="mt-1 text-gold-dark" aria-hidden>
                  ✓
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">Starting From</p>
            <p className="mt-1 text-3xl font-semibold text-ink">
              {service.currency} {service.priceFrom}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-dark">
              Turnaround
            </p>
            <p className="mt-1 text-sm text-ink/75">{service.turnaround}</p>
            <Cta href="/book-fitting" variant="primary" className="mt-6 w-full">
              Book a Fitting
            </Cta>
            <Cta href="/contact" variant="ghost" className="mt-3 w-full">
              Ask a Question
            </Cta>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
