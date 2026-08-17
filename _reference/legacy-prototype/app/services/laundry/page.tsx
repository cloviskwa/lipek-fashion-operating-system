import type { Metadata } from 'next';
import PageHeader from '@/components/sections/PageHeader';
import ServiceDetail from '@/components/sections/ServiceDetail';
import { getServiceBySlug } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

const service = getServiceBySlug('laundry');

export const metadata: Metadata = buildPageMetadata({
  title: service.seo.title,
  description: service.seo.description,
  path: '/services/laundry',
});

export default function LaundryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Service"
        title={service.name}
        description={service.shortDescription}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path: '/services/laundry' },
        ]}
      />
      <ServiceDetail service={service} />
    </>
  );
}
