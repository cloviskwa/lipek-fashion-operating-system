# AI Architecture

**Status:** Derived (skeleton — real content lands with `AI-001` in Phase 9)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §23A–§31; `docs/adr/ADR-0005-llm-model-provider.md`

```text
Next.js AI Chat UI (apps/storefront)
        ↓
Authenticated AI Endpoint / BFF
        ↓
Mastra Agent (apps/ai)
   ┌────┼───────────────┐
   │    │               │
Memory  RAG        Authorized Tools
   │    │               │
Postgres/pgvector       Vendure Shop API / LIPEK Service APIs / CRM APIs (apps/server)
```

Do not start any implementation against this diagram before Phase 8 (Search) closes — see `docs/implementation/MASTER_IMPLEMENTATION_PLAN.md` §7 (AI Implementation Roadmap) for the full `AI-001`–`AI-016` sequencing, and `ADR-0005` for the provisional model-provider decision.

Non-negotiable constraints carried forward from the source of truth, restated here so they aren't lost between now and Phase 9:
- RAG sources are approved non-private content only (FAQs, policies, guides) — never private order histories or measurements.
- Every conversation/thread scoped to an authenticated or anonymous session resource; no cross-customer memory leakage.
- Tool execution requires both agent permission AND user authorization on the specific resource.
- READ tools may execute autonomously; PREPARE tools stage but don't finalize; ACTION tools require explicit confirmation (source of truth §25).
- No arbitrary SQL tool, ever.
