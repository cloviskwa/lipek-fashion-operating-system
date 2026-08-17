import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import TestimonialCard from '@/components/sections/TestimonialCard';
import Cta from '@/components/ui/primitives/Cta';
import { getTestimonials } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Testimonials',
  description: 'What Lipek Fashion clients say about custom tailoring, alterations and garment care.',
  path: '/testimonials',
});

export default function TestimonialsPage() {
  const testimonials = getTestimonials();

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Real feedback from clients across weddings, corporate wardrobes and everyday tailoring."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Testimonials', path: '/testimonials' },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Cta href="/testimonials/video-testimonials" variant="outline">
              Watch Video Testimonials
            </Cta>
          </div>
        </Container>
      </Section>
    </>
  );
}
