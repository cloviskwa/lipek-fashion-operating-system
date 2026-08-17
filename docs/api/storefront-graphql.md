# Storefront GraphQL (Shop API)

**Status:** Derived (skeleton — populated once `apps/server` exists and `apps/storefront` starts consuming it, `FOUND-014` onward)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §3.2, §6A

Nothing to document yet — the Vendure Shop API doesn't exist until `FOUND-014`. This file becomes the index of every Shop API query/mutation `apps/storefront` and `apps/mobile/customer` depend on, generated/cross-referenced against `packages/graphql`'s codegen output, updated as part of every task that adds a new storefront-facing query.

## Route map draft (source of truth §5, §36)

```text
/men, /men/<category>, /men/<category>/<subcategory>
/women, /women/<category>, /women/<category>/<subcategory>
/children, /children/<category>
/custom-tailoring
/alterations
/laundry-dry-cleaning
/account/* (My LIPEK)
```

Confirmed against source-of-truth §5.1–§5.4/§36 examples; finalized once `COM-001`/`COM-007` land.
