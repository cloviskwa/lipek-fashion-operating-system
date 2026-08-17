export const SITE_NAME = 'Lipek Fashion';
export const SITE_URL = 'https://www.lipekfashion.com';
export const SITE_TAGLINE = 'Bespoke Tailoring, Perfectly Fitted';
export const SITE_DESCRIPTION =
  'Lipek Fashion is a bespoke tailoring house crafting made-to-measure suits, traditional and occasion wear, alterations and garment care — cut, fitted and finished by hand.';

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'All Services', href: '/services' },
      { label: 'Custom Tailoring', href: '/services/custom-tailoring' },
      { label: 'Alterations', href: '/services/alterations' },
      { label: 'Laundry & Care', href: '/services/laundry' },
    ],
  },
  { label: 'Process', href: '/process' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Shop', href: '/shop' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_LINK_GROUPS = [
  {
    title: 'Services',
    links: [
      { label: 'Custom Tailoring', href: '/services/custom-tailoring' },
      { label: 'Alterations', href: '/services/alterations' },
      { label: 'Laundry & Care', href: '/services/laundry' },
      { label: 'Book a Fitting', href: '/book-fitting' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Process', href: '/process' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
      { label: 'Wholesale Enquiries', href: '/contact/wholesale' },
      { label: 'Store Location', href: '/contact/location' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy-policy' },
      { label: 'Terms of Use', href: '/legal/terms-of-use' },
      { label: 'Refund Policy', href: '/legal/refund-policy' },
      { label: 'Shipping Policy', href: '/legal/shipping-policy' },
    ],
  },
];

export const CONTACT = {
  phone: '+237 6 77 12 34 56',
  phoneHref: 'tel:+237677123456',
  whatsapp: '+237 6 77 12 34 56',
  whatsappHref: 'https://wa.me/237677123456',
  email: 'hello@lipekfashion.com',
  emailHref: 'mailto:hello@lipekfashion.com',
  wholesaleEmail: 'wholesale@lipekfashion.com',
  address: 'Rue de la Mode 14, Bonanjo, Douala, Cameroon',
};

export const SOCIAL_LINKS = [
  { platform: 'Instagram', href: 'https://instagram.com/lipekfashion' },
  { platform: 'Facebook', href: 'https://facebook.com/lipekfashion' },
  { platform: 'TikTok', href: 'https://tiktok.com/@lipekfashion' },
  { platform: 'Pinterest', href: 'https://pinterest.com/lipekfashion' },
];
