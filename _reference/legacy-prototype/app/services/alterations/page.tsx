import type { Metadata } from 'next';
import PageHeader from '@/components/sections/PageHeader';
import ServiceDetail from '@/components/sections/ServiceDetail';
import { getServiceBySlug } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

const service = getServiceBySlug('alterations');

export const metadata: Metadata = buildPageMetadata({
  title: service.seo.title,
  description: service.seo.description,
  path: '/services/alterations',
});

export default function AlterationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Service"
        title={service.name}
        description={service.shortDescription}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path: '/services/alterations' },
        ]}
      />
      <ServiceDetail service={service} />
    </>
  );
}
