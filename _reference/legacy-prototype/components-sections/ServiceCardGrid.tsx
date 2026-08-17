import Link from 'next/link';
import Card from '@/components/ui/primitives/Card';

export interface ServiceCardItem {
  slug: string;
  href: string;
  name: string;
  shortDescription: string;
  priceFrom?: number;
  currency?: string;
}

export default function ServiceCardGrid({ items }: { items: ServiceCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.slug} className="flex flex-col">
          <h3 className="font-heading text-xl font-semibold text-ink">{item.name}</h3>
          <p className="mt-2 flex-1 text-sm text-ink/70">{item.shortDescription}</p>
          {item.priceFrom ? (
            <p className="mt-4 text-sm font-semibold text-gold-dark">
              From {item.currency ?? 'USD'} {item.priceFrom}
            </p>
          ) : null}
          <Link
            href={item.href}
            className="mt-4 inline-flex items-center text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
          >
            Learn more →
          </Link>
        </Card>
      ))}
    </div>
  );
}
