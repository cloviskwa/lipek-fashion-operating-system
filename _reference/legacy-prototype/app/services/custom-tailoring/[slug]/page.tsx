import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/sections/PageHeader';
import ServiceDetail from '@/components/sections/ServiceDetail';
import { getCustomTailoringSubServiceBySlug, getCustomTailoringSubServices } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCustomTailoringSubServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getCustomTailoringSubServiceBySlug(slug);
  if (!service) return {};

  return buildPageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/custom-tailoring/${slug}`,
  });
}

export default async function CustomTailoringSubServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getCustomTailoringSubServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Custom Tailoring"
        title={service.name}
        description={service.shortDescription}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Custom Tailoring', path: '/services/custom-tailoring' },
          { name: service.name, path: `/services/custom-tailoring/${slug}` },
        ]}
      />
      <ServiceDetail service={service} />
    </>
  );
}
