import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/config/site';

interface BuildPageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image = '/images/social/og-image.jpg',
  noindex = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: image }],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Bespoke Tailoring, Perfectly Fitted`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};
