import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import { getLegalDocs } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal',
  description: 'Privacy, terms, refund and shipping policies for Lipek Fashion.',
  path: '/legal',
});

export default function LegalIndexPage() {
  const docs = getLegalDocs();

  return (
    <>
      <PageHeader
        title="Legal"
        description="Policies governing orders, privacy and shipping at Lipek Fashion."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Legal', path: '/legal' },
        ]}
      />
      <Section tone="white">
        <Container>
          <ul className="divide-y divide-line rounded-lg border border-line bg-white">
            {docs.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/legal/${doc.slug}`}
                  className="flex items-center justify-between px-6 py-4 text-sm font-medium text-ink hover:bg-cream-deep"
                >
                  {doc.title}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
