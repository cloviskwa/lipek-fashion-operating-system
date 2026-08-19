# Storefront Architecture

**Status:** Derived (skeleton)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §3.1, §6A

`apps/storefront` is a **renderer of backend-owned data**, never a system of record (source of truth §3.1). It is bootstrapped in `FOUND-014` from the official Vendure Next.js starter (Next.js 16 / React 19, verified — see `system-overview.md`), not evolved from `_reference/legacy-prototype/`.

## Session/API rules (source of truth §6A)

- Consume Vendure's **Shop GraphQL API** for commerce/customer operations.
- Cookie-based Vendure sessions for browser flows unless an ADR identifies a reason to prefer bearer tokens.
- Never expose Admin API credentials to the storefront.
- Prefer Server Components/server-side functions for sensitive data fetching.
- Client-side calls carry only customer-authorized credentials.
- Generated GraphQL types (`packages/graphql`) refreshed whenever plugin schemas change.
- The AI chat endpoint (Phase 9) propagates authenticated customer identity to server-side tools without exposing privileged credentials to the browser.

## What was ported from `_reference/legacy-prototype/` (`FOUND-020`; the directory is retired in the commit immediately following this one)

| From                                                           | To                                                            | Outcome                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styles/variables.css`                                         | `packages/ui/src/tokens`                                      | Copied in Phase 0 as `legacy-variables.css`, kept as a reference token set; extended with real dark/light pairs in `THEME-001` (Phase 2), not before                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `components/*/primitives/*`                                    | `packages/ui/src/primitives`                                  | Copied in Phase 0. **Not yet wired into `apps/storefront`** — the official starter has its own, more extensive shadcn-based component library at `apps/storefront/src/components/ui/*` (Button, Card, Dialog, etc., already used throughout the generated pages). Reconcile the two only when a genuine LIPEK-specific primitive is needed that shadcn doesn't already cover; forcing a wholesale swap now would be an unnecessary rewrite of working, tested UI code.                                                                                                                                                                                                                                                                                                                                |
| `lib/schema/builders.ts`, `components-schema/JsonLdScript.tsx` | `apps/storefront/src/config/json-ld.ts`, `json-ld-script.tsx` | **Ported, adapted.** The official starter already has its own `src/config/metadata.ts` (Next.js `Metadata` API — title/description/canonical/OG/robots, env-driven `SITE_NAME`/`SITE_URL`) — porting the legacy prototype's _metadata_ pattern on top would have duplicated it. Its separate JSON-LD _structured-data_ builders (LocalBusiness/Breadcrumb/FAQ/Article schema) had no equivalent in the new app, so those were ported — rewritten as pure functions taking data as parameters (the original read hard-coded `SITE_NAME`/`CONTACT`/`SOCIAL_LINKS` constants, which is exactly the "hard-coded business content" source of truth §52E forbids). Not yet called from any page — real business data (store address, hours, social links) has no source until `CONTENT-*` (Phase 2) exists. |
| `content/*.json`                                               | `packages/testing/fixtures/content`                           | Already copied in Phase 0 — seed/test fixtures only, never a runtime dependency of `apps/storefront`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Route/IA structure (`app/*`)                                   | —                                                             | **Deliberately not ported as pages.** See "Route/IA inventory" below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Route/IA inventory (preserved here, not as dead code)

The prior prototype's route tree — the actual business information architecture LIPEK's site needs — is captured here so it isn't lost, without carrying forward code that would need a full rewrite anyway once real backend content exists:

```text
/                                          Home
/about                                     About
/services                                  Services index
/services/custom-tailoring                 + [slug] (7 sub-categories: african-fashion,
                                            casual-modern, shirts-tops, special-occasion,
                                            suits-formal, trousers-bottoms, womens-tailoring)
/services/alterations
/services/laundry
/process                                   + [slug]
/gallery                                   + [slug]
/shop                                      + [slug]
/book-fitting                              + /calendar, /confirmation
/testimonials                              + /video-testimonials
/blog                                      + /[category], /[category]/[slug]
/faq                                       + [slug]
/contact                                   + /location, /thank-you, /wholesale
/legal                                     + [slug]
```

**Why this isn't built as pages now:** every one of these routes needs real content from a backend that doesn't exist yet — `services`/`custom-tailoring` sub-category detail needs `ServiceDefinition` (`CONTENT-*`, Phase 2), `shop` needs the real catalog (`COM-001`–`COM-005`, done at the data level in Phase 1E, not yet surfaced in any UI), `blog`/`faq`/`legal`/`testimonials`/`gallery` need `Article`/`FaqItem`/`PolicyDocument`/`Testimonial` CMS entities (Phase 2). Building these routes now, against nothing, would mean either hard-coding business content into the storefront (forbidden, source of truth §52E) or wiring against APIs that don't exist. This inventory is the checklist Phase 3 (`COM-006` onward, "Storefront Experience") builds against once Phase 2's CMS exists — nothing here is lost, it's sequenced correctly instead of built twice.

**Visual smoke test (this task's own acceptance test):** limited to what actually exists post-port — `apps/storefront`'s own generated pages (home, product, collection, cart, checkout, account, search, sign-in — all already present from the official starter) build and render correctly (`COM-023`-style full build already verified in `FOUND-014`/`FOUND-019`); the new `json-ld.ts`/`json-ld-script.tsx` typecheck and lint cleanly. There was no LIPEK-specific route to smoke-test, because none was built, by design.
