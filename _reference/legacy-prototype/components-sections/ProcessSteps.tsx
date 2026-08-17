import Link from 'next/link';

export interface ProcessStepItem {
  slug: string;
  order: number;
  name: string;
  duration: string;
  summary: string;
}

export default function ProcessSteps({ steps, basePath = '/process' }: { steps: ProcessStepItem[]; basePath?: string }) {
  return (
    <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <li key={step.slug} className="relative rounded-lg border border-line bg-white p-6">
          <span className="font-heading text-4xl font-semibold text-cream-deep" style={{ WebkitTextStroke: '1.5px #b8894f' }}>
            {String(step.order).padStart(2, '0')}
          </span>
          <h3 className="mt-3 text-lg font-semibold text-ink">{step.name}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gold-dark">{step.duration}</p>
          <p className="mt-3 text-sm text-ink/70">{step.summary}</p>
          <Link
            href={`${basePath}/${step.slug}`}
            className="mt-4 inline-block text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
          >
            Details →
          </Link>
        </li>
      ))}
    </ol>
  );
}
