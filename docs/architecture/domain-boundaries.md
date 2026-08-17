# Domain Boundaries

**Status:** Derived (skeleton)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §0C

| Plugin / Context      | Core responsibilities                                                            | Task family                | Status                |
| --------------------- | -------------------------------------------------------------------------------- | -------------------------- | --------------------- |
| `lipek-content`       | Pages, sections, menus, FAQs, policies, articles, site settings, content SEO     | `CONTENT-*`                | Not started (Phase 2) |
| `lipek-security`      | Native auth, MFA (WebAuthn/TOTP), social auth, RBAC, audit log, rate limiting    | `SEC-*`                    | Not started (Phase 1) |
| `tailoring`           | Measurements, custom configurations, tailoring jobs, production stages, fittings | `TAILOR-*`                 | Not started (Phase 5) |
| `alterations`         | Alteration requests, assessment, quotes, work states                             | `ALTER-*`                  | Not started (Phase 6) |
| `laundry`             | Garment items, cleaning jobs, pickup/delivery states, recurring plans            | `LAUNDRY-*`                | Not started (Phase 6) |
| `appointments`        | Appointment resources, slots, bookings, fitting/service appointments             | `TAILOR-005`, `ALTER-004`  | Not started (Phase 5) |
| `crm`                 | Leads, opportunities, customer notes, support cases, follow-ups                  | `CRM-*`                    | Not started (Phase 7) |
| `loyalty`             | Points, tiers, rewards, earning events                                           | `CRM-008`                  | Not started (Phase 7) |
| `documents`           | Receipts, invoices, quotes, measurement sheets, delivery notes                   | `COM-020`, `TAILOR-010`    | Not started (Phase 4) |
| `customer-experience` | Wishlist, reviews, saved looks, recommendations, alerts                          | `SEARCH-007`, `SEARCH-008` | Not started (Phase 8) |
| `analytics-events`    | Canonical event publication and analytics bridge                                 | `OPS-001`, `OPS-002`       | Not started (Phase 4) |
| `integrations`        | Payment/email/SMS/shipping provider adapters                                     | `OPS-006`                  | Not started (Phase 4) |

Retail purchases remain native Vendure Orders. Service workflows (Tailoring/Alterations/Laundry) have dedicated domain entities linked to Vendure `Customer`/`Order`/`Payment` records — see `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §0C diagram. No plugin above may create a shadow copy of core customer/order/payment data (source of truth §52B).
