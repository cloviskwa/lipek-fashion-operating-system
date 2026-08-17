import Container from '@/components/ui/primitives/Container';
import Cta from '@/components/ui/primitives/Cta';
import Badge from '@/components/ui/primitives/Badge';

export interface HeroProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stats?: { label: string; value: string }[];
}

export default function Hero({ eyebrow, title, description, primaryCta, secondaryCta, stats }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-ink text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(184,137,79,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(164,74,63,0.25), transparent 40%)',
        }}
      />
      <Container className="relative py-20 md:py-28">
        <Badge>{eyebrow}</Badge>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-xl text-base text-cream/75 md:text-lg">{description}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Cta href={primaryCta.href} variant="primary">
            {primaryCta.label}
          </Cta>
          {secondaryCta ? (
            <Cta href={secondaryCta.href} variant="outline" className="border-cream text-cream hover:bg-cream hover:text-ink">
              {secondaryCta.label}
            </Cta>
          ) : null}
        </div>
        {stats && stats.length > 0 ? (
          <dl className="mt-14 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs uppercase tracking-wide text-cream/60">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-gold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>
    </div>
  );
}
