# Data Model

**Status:** Derived (skeleton — grows every phase as entities are actually implemented)
**Source:** `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` §0B.2

## Vendure-native catalog mapping (binding — do not create a parallel system)

| LIPEK concept                          | Vendure implementation                            |
| -------------------------------------- | ------------------------------------------------- |
| Product                                | `Product`                                         |
| Purchasable SKU                        | `ProductVariant`                                  |
| Size/Color when creating separate SKUs | `ProductOptionGroup` + `ProductOption` + variants |
| Category hierarchy                     | Nested `Collection` tree                          |
| Tags/structured attributes/filters     | `Facet` + `FacetValue`                            |
| Product media                          | `Asset`                                           |
| Stock                                  | `StockLevel` / `StockLocation`                    |
| Region/storefront                      | `Channel`                                         |
| Customer group                         | `CustomerGroup`                                   |
| Promotions                             | Vendure Promotions                                |
| Internal/product-specific extra fields | Vendure custom fields                             |

## Custom entity stubs, by plugin (populated with real schemas/migrations as each phase builds)

- `lipek-security`: WebAuthn credential, TOTP secret (encrypted at rest), backup code (hashed), audit log entry
- `lipek-content`: `ContentPage`, `PageSection`, `NavigationMenu`, `NavigationItem`, `Banner`, `FaqItem`, `PolicyDocument`, `Article`, `ArticleCategory`, `StoreLocation`, `Testimonial`, `ServiceDefinition`
- `tailoring`: `TailoringJob`, `TailoringConfiguration`, `MeasurementProfile`, `FittingAppointment`, `ProductionTimeline`
- `alterations`: `AlterationJob`, `Garment`, `Assessment`, `WorkTimeline`
- `laundry`: `GarmentItem`, `CleaningInstructions`, `PickupDelivery`, `ServiceTimeline`
- `crm`: `Lead`, `Opportunity`, `CustomerNote`, `SupportCase`, `FollowUpTask`, `CustomerInteraction`, `CustomerSegmentDefinition`
- `documents`: `DocumentRecord`

No migrations exist yet — every entity above ships with a reviewed migration when its owning task lands (`FOUND-017` policy).
