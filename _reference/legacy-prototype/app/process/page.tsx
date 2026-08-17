import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import ProcessSteps from '@/components/sections/ProcessSteps';
import Cta from '@/components/ui/primitives/Cta';
import { getProcessSteps } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Our Process',
  description:
    'From consultation to delivery — how Lipek Fashion measures, cuts, fits and finishes every custom garment.',
  path: '/process',
});

export default function ProcessPage() {
  const steps = getProcessSteps();

  return (
    <>
      <PageHeader
        title="Our Process"
        description="Four steps stand between a fabric choice and a finished garment. Here's exactly what happens at each one."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Process', path: '/process' },
        ]}
      />
      <Section tone="white">
        <Container>
          <ProcessSteps steps={steps} />
          <div className="mt-14 text-center">
            <Cta href="/book-fitting" variant="primary">
              Start With a Consultation
            </Cta>
          </div>
        </Container>
      </Section>
    </>
  );
}
