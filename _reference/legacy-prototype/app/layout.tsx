import { Montserrat, Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JsonLdScript from '@/components/schema/JsonLdScript';
import { buildLocalBusinessSchema, mergeJsonLdGraph } from '@/lib/schema/builders';
import { DEFAULT_METADATA } from '@/lib/seo/metadata';
import './tailwind.css';

const bodyFont = Montserrat({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap',
});

const headingFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading-loaded',
  display: 'swap',
});

export const metadata = DEFAULT_METADATA;

export default function RootLayout({ children }: { children: ReactNode }) {
  const schema = mergeJsonLdGraph(buildLocalBusinessSchema());

  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <JsonLdScript schema={schema} />
      </body>
    </html>
  );
}
