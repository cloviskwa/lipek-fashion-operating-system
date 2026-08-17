# Testing Strategy

**Status:** Derived (skeleton)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §0F.4, §43

| Layer                       | Tool                         | Scope                                                                                                               |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Unit/integration            | Vitest                       | `apps/*`, `packages/*` business logic, Vendure plugin unit tests                                                    |
| Commerce/plugin integration | Vendure testing utilities    | Plugin-level integration against a real Vendure test server                                                         |
| End-to-end                  | Playwright                   | Storefront/admin critical journeys, starting with `COM-023`'s full commerce critical path                           |
| Accessibility               | axe (`@axe-core/playwright`) | WCAG 2.2 AA gate, from Phase 3 (`COM-012`) onward                                                                   |
| Performance/load            | k6                           | Critical commerce path at target scale, Phase 11 (`OPS-012`)                                                        |
| AI quality                  | Mastra evals/scorers         | Support Q&A, product discovery, order-status tool tests, adversarial/injection tests — Phase 9 (`AI-009`, `AI-010`) |

## Non-negotiable gate

The SOT §43 critical journey (Search → Variant → Cart → Checkout → Payment → Order → Receipt → Track → Return) is automated as `COM-023` and must be green in CI before any deploy — a failing run blocks deployment, not just a warning.

No test infrastructure exists yet; this document is the target, established before any test is written per Phase 0 discipline.
