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

## What gets ported from `_reference/legacy-prototype/` (task `FOUND-020`)

| From                                            | To                                      | How                                                                                     |
| ----------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------- |
| `styles/variables.css`                          | `packages/ui/src/tokens`                | Extended with dark/light pairs (`THEME-001`), not copied verbatim                       |
| `components/ui/primitives/*`                    | `packages/ui/src/primitives`            | Already copied; review against Vendure starter's component conventions before wiring in |
| Route/IA structure (`app/*`)                    | `apps/storefront/app/*`                 | Re-implemented against backend APIs, not copied as static-JSON-reading code             |
| `lib/seo/metadata.ts`, `lib/schema/builders.ts` | `apps/storefront/lib/seo`, `lib/schema` | Pattern reused, data source becomes `CONTENT-006`/catalog APIs                          |
| `content/*.json`                                | `packages/testing/fixtures/content`     | Already copied — seed/test fixtures only, never a runtime dependency                    |

Nothing in this table is done yet; this is the porting plan `FOUND-020` executes against.
