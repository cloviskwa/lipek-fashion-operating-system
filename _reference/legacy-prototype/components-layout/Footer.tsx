import Link from 'next/link';
import { CONTACT, FOOTER_LINK_GROUPS, SITE_NAME, SITE_TAGLINE, SOCIAL_LINKS } from '@/lib/config/site';
import Container from '@/components/ui/primitives/Container';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-cream">
      <Container className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <p className="font-heading text-2xl font-semibold">{SITE_NAME}</p>
          <p className="mt-2 text-sm text-cream/70">{SITE_TAGLINE}</p>
          <div className="mt-4 space-y-1 text-sm text-cream/80">
            <p>{CONTACT.address}</p>
            <a href={CONTACT.phoneHref} className="block hover:text-gold">
              {CONTACT.phone}
            </a>
            <a href={CONTACT.emailHref} className="block hover:text-gold">
              {CONTACT.email}
            </a>
          </div>
          <div className="mt-5 flex gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-wide text-cream/70 hover:text-gold"
              >
                {social.platform}
              </a>
            ))}
          </div>
        </div>

        {FOOTER_LINK_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{group.title}</p>
            <ul className="mt-4 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cream/80 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-cream/60 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p>Crafted with thread, chalk and care.</p>
        </Container>
      </div>
    </footer>
  );
}
