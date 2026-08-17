import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import Badge from '@/components/ui/primitives/Badge';
import Card from '@/components/ui/primitives/Card';
import Cta from '@/components/ui/primitives/Cta';
import PageHeader from '@/components/sections/PageHeader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Us',
  description:
    'Lipek Fashion is a bespoke tailoring house founded on precise measurement, hand finishing and respect for fabric — from suits to traditional wear.',
  path: '/about',
});

const VALUES = [
  {
    title: 'Fitted on you, not guessed',
    body: 'Every pattern is adjusted on your body across at least one fitting session before it is finished — never shipped on measurements alone.',
  },
  {
    title: 'Finished by hand',
    body: 'Buttonholes, hems and linings are hand-finished in-atelier. Nothing is outsourced mid-order to a third-party workshop.',
  },
  {
    title: 'Fabric-first thinking',
    body: 'We plan pattern placement, grain direction and panel matching before a single cut — especially critical for bold prints like Ankara and kente.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Fifteen years of cutting cloth to fit real people."
        description="Lipek Fashion started as a single tailoring bench in Douala and grew into two ateliers — but the process hasn't changed: measure by hand, fit on the body, finish by hand."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
      />

      <Section tone="white">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge>How We Started</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">
              From one tailoring bench to a full atelier
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/75">
              <p>
                Lipek Fashion opened in Bonanjo, Douala with a single cutting table and a promise: every
                garment would be measured on the client, not assumed from a chart. That promise is still
                the first thing every apprentice learns on their first day.
              </p>
              <p>
                Over fifteen years we&apos;ve grown into a full atelier with a dedicated fitting studio, an
                in-house laundry and pressing service, and a second showroom in Bastos, Yaoundé — while
                keeping every order small enough to fit by hand.
              </p>
              <p>
                Today our team covers formal suiting, women&apos;s tailoring, traditional and African-print
                occasion wear, and garment care — all under one roof, all measured the same careful way.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 h-56 rounded-lg bg-gradient-to-br from-gold to-clay" />
            <div className="h-40 rounded-lg bg-cream-deep" />
            <div className="h-40 rounded-lg bg-ink" />
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <div className="mb-10 text-center">
            <Badge>What We Believe</Badge>
            <h2 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((value) => (
              <Card key={value.title}>
                <h3 className="font-heading text-lg font-semibold text-ink">{value.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{value.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="ink">
        <Container className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">
            Come see the atelier for yourself
          </h2>
          <p className="max-w-xl text-sm text-cream/75">
            Book a fitting or stop by the showroom — we&apos;re happy to walk you through fabric, fit and
            timelines before you commit to anything.
          </p>
          <Cta href="/book-fitting" variant="primary" className="mt-2">
            Book a Fitting
          </Cta>
        </Container>
      </Section>
    </>
  );
}
