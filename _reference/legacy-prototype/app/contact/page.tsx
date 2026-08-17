import type { Metadata } from 'next';
import Container from '@/components/ui/primitives/Container';
import Section from '@/components/ui/primitives/Section';
import PageHeader from '@/components/sections/PageHeader';
import ContactForm from '@/components/forms/ContactForm';
import { CONTACT } from '@/lib/config/site';
import { getBusinessData } from '@/lib/content/reader';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact',
  description: 'Get in touch with Lipek Fashion — phone, WhatsApp, email or visit one of our ateliers.',
  path: '/contact',
});

export default function ContactPage() {
  const business = getBusinessData();

  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Questions about an order, fabric or timeline? Reach out — we usually reply within one business day."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />
      <Section tone="white">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-ink">Direct Contact</h2>
              <ul className="mt-3 space-y-1 text-sm text-ink/70">
                <li>
                  <a href={CONTACT.phoneHref} className="hover:text-gold-dark">
                    {CONTACT.phone}
                  </a>
                </li>
                <li>
                  <a href={CONTACT.whatsappHref} className="hover:text-gold-dark">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href={CONTACT.emailHref} className="hover:text-gold-dark">
                    {CONTACT.email}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Locations</h2>
              <ul className="mt-3 space-y-4 text-sm text-ink/70">
                {business.locations.map((location) => (
                  <li key={location.id}>
                    <p className="font-medium text-ink">{location.name}</p>
                    <p>{location.address}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
