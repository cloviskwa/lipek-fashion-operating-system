import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Video Testimonials',
  description: 'Hear directly from Lipek Fashion clients about their fitting and tailoring experience.',
  path: '/testimonials/video-testimonials',
});

const VIDEOS = [
  { title: "Amara's Wedding Gown Journey", duration: '2:14' },
  { title: "Jean-Paul on Four Years of Custom Suits", duration: '1:48' },
  { title: 'Fatou on Matching Ankara Across a Family Order', duration: '2:02' },
];

export default function VideoTestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title="Video Testimonials"
        description="Short clips from clients talking through their fitting experience, in their own words."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Testimonials', path: '/testimonials' },
          { name: 'Video Testimonials', path: '/testimonials/video-testimonials' },
        ]}
      />
      <Section tone="white">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VIDEOS.map((video) => (
              <div key={video.title} className="overflow-hidden rounded-lg border border-line bg-white">
                <div className="flex h-48 items-center justify-center bg-ink text-cream">
                  <span aria-hidden className="text-4xl">
                    ▶
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-ink">{video.title}</h3>
                  <p className="mt-1 text-xs text-ink/50">{video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
