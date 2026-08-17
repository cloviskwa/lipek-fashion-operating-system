import Breadcrumbs, { type BreadcrumbItem } from '@/components/layout/Breadcrumbs';
import Container from '@/components/ui/primitives/Container';

export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
}) {
  return (
    <div className="border-b border-line bg-cream-deep py-12 md:py-16">
      <Container>
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow ? (
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-4xl font-semibold text-ink md:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-base text-ink/70">{description}</p> : null}
      </Container>
    </div>
  );
}
