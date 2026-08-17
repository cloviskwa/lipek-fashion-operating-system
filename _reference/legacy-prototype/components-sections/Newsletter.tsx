import Container from '@/components/ui/primitives/Container';

export default function Newsletter() {
  return (
    <div className="bg-ink py-14 text-cream">
      <Container className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-heading text-2xl font-semibold md:text-3xl">
          Style notes from the atelier
        </h2>
        <p className="max-w-md text-sm text-cream/70">
          Fabric drops, seasonal lookbooks and fitting tips — straight to your inbox, once a month.
        </p>
        <form className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="you@email.com"
            className="w-full rounded-pill border border-white/20 bg-white/10 px-5 py-3 text-sm text-cream placeholder:text-cream/50 focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-pill bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark"
          >
            Subscribe
          </button>
        </form>
      </Container>
    </div>
  );
}
