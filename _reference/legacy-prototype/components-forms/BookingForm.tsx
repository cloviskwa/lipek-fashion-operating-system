'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

const SERVICE_OPTIONS = [
  'Custom Suit / Formalwear',
  "Women's Tailoring",
  'Traditional & African Fashion',
  'Alterations',
  'Laundry & Care',
  'Something else',
];

export default function BookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const service = String(formData.get('service') ?? '').trim();
    const date = String(formData.get('date') ?? '').trim();

    if (!name || !phone || !service || !date) {
      setError('Please fill in your name, phone, service and preferred date.');
      return;
    }

    setIsSubmitting(true);
    router.push('/book-fitting/confirmation');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-line bg-white p-6 md:p-8">
      {error ? (
        <p className="rounded-md bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-2 w-full rounded-md border border-line px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-2 w-full rounded-md border border-line px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="service" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
          Service
        </label>
        <select
          id="service"
          name="service"
          required
          defaultValue=""
          className="mt-2 w-full rounded-md border border-line bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
        >
          <option value="" disabled>
            Select a service
          </option>
          {SERVICE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Preferred Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="mt-2 w-full rounded-md border border-line px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Location
          </label>
          <select
            id="location"
            name="location"
            defaultValue="douala"
            className="mt-2 w-full rounded-md border border-line bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
          >
            <option value="douala">Bonanjo Atelier, Douala</option>
            <option value="yaounde">Bastos Showroom, Yaoundé</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-ink/70">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="mt-2 w-full rounded-md border border-line px-4 py-3 text-sm focus:border-gold focus:outline-none"
          placeholder="Occasion, fabric preferences, reference photos you'll bring…"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-pill bg-gold px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:opacity-60"
      >
        {isSubmitting ? 'Booking…' : 'Request Fitting'}
      </button>
    </form>
  );
}
