import Card from '@/components/ui/primitives/Card';
import type { Testimonial } from '@/lib/content/types';

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card>
      <div className="text-gold" aria-hidden>
        {'★'.repeat(testimonial.rating)}
        {'☆'.repeat(5 - testimonial.rating)}
      </div>
      <p className="mt-3 text-sm italic text-ink/80">&ldquo;{testimonial.quote}&rdquo;</p>
      <p className="mt-4 text-sm font-semibold text-ink">{testimonial.name}</p>
      <p className="text-xs text-ink/60">
        {testimonial.role} · {testimonial.service}
      </p>
    </Card>
  );
}
