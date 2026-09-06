# LIPEK Frontend Design & Experience Specification
## Premium African Fashion Commerce — Next.js UI/UX Source of Truth

**Status:** Derived — subordinate to `docs/internal/LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` (see SOT §5B) and to `storefront-architecture.md`
**Transferred:** 5 September 2026 (customer-provided frontend design & experience specification, content unaltered)
**Relationship to SOT:** Defines the storefront's custom visual/interaction design language. SOT §5A (backend-driven composition) governs section *content and references*; this spec governs section *design*. Backend-driven data, frontend-driven design. Framer Motion and Aceternity UI are proposed libraries — not yet locked; any adoption is recorded in `dependency-register.md` per SOT §0.2.
**Document Type:** Frontend Design & Implementation Specification  
**Purpose:** Define the visual architecture, page composition, reusable UI patterns, animation language, component strategy, and section-by-section frontend experience for LIPEK.  
**Scope:** Customer-facing Next.js storefront only.  
**Backend Assumption:** Commerce and business data are supplied by the existing LIPEK backend architecture. The backend provides data and state; the frontend owns design, composition, visual hierarchy, animation, interaction, storytelling, and responsive behavior.  
**Primary Frontend Stack:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · Aceternity UI · Framer Motion  
**Relationship to Technical SOT:** This document is subordinate to `LIPEK_MASTER_TECHNICAL_SOURCE_OF_TRUTH.md` and focuses only on the frontend experience.

---

# 1. Frontend Design Principle

The LIPEK storefront must not feel like a backend-rendered commerce template.

The governing principle is:

> **Backend-driven data. Frontend-driven design.**

The backend may provide products, variants, prices, inventory, collections, categories, facets, promotions, customer state, wishlist state, cart state, order state, tailoring state, alteration state, laundry state, and operational content.

The frontend must decide visual composition, section order, art direction, grid geometry, responsive behavior, typography treatment, spacing rhythm, image ratios, section transitions, animation choreography, hover interactions, product-card behavior, editorial storytelling, and how commerce and editorial content blend.

The frontend must therefore be treated as a **designed fashion experience**, not a generic page renderer.

---

# 2. Brand Experience Objective

LIPEK should feel like:

> **A premium African fashion house with the discovery power of a global e-commerce platform and the interaction quality of a modern digital product.**

The interface should communicate African identity through fashion, photography and craftsmanship; luxury through restraint; confidence through strong editorial sections; modern commerce through search and discovery; personalization through recommendations; craftsmanship through tailoring storytelling; and trust through clear service and support surfaces.

The UI itself should remain refined and globally competitive. African identity should come primarily from models, garments, fabrics, cultural dress, tailoring details, contemporary African styling, architecture, locations, and editorial photography rather than decorative background patterns.

---

# 3. Inspiration Translation

The current homepage reference should influence:

- commerce density
- search prominence
- category accessibility
- product discovery
- trust-strip placement
- product tabs
- recommendations
- deal blocks
- social proof
- sticky mobile navigation
- account/cart visibility
- overall section richness

LIPEK must elevate the reference using:

- larger editorial imagery
- fewer but stronger focal points
- asymmetric grids
- premium section transitions
- African fashion art direction
- custom product-card layouts
- custom service sections
- bespoke tailoring presentation
- refined whitespace
- fewer generic marketplace graphics
- stronger visual hierarchy

---

# 4. Frontend Technology Responsibilities

| Technology | Frontend Role |
|---|---|
| **Next.js** | Page architecture, routing, server rendering, data fetching, SEO, storefront structure |
| **TypeScript** | Typed components, API contracts, reusable UI logic |
| **Tailwind CSS** | Layout, responsiveness, spacing and custom styling |
| **shadcn/ui** | Accessible UI primitives and interaction foundations |
| **Aceternity UI** | Carefully selected premium visual interaction patterns |
| **Framer Motion** | Motion language, section reveals, transitions, drawers and tabs |
| **Vendure APIs** | Commerce and business data source |
| **Next.js Image** | Responsive image loading and optimization |

---

# 5. UI Library Strategy

## 5.1 shadcn/ui

Use shadcn mainly for behavior and accessibility, then restyle extensively.

Recommended primitives:

- NavigationMenu
- Sheet
- Drawer
- Dialog
- Popover
- DropdownMenu
- Command
- Tabs
- Accordion
- Tooltip
- Select
- Checkbox
- RadioGroup
- Form
- Skeleton
- Toast
- ScrollArea
- Carousel foundation where appropriate

The public site must not visually look like default shadcn.

## 5.2 Aceternity UI

Use selectively.

| Component / Pattern | Suggested LIPEK Use |
|---|---|
| Apple Cards Carousel | Editorial looks, campaigns and featured collections |
| Lens | Fabric detail, tailoring craftsmanship and product storytelling |
| 3D Marquee | Fashion collage or designer/brand showcase |
| Link Preview | Journal and collection links |
| Infinite Moving Cards | Testimonials, press or community proof |
| Following Pointer | Special editorial/campaign interaction only |
| Spotlight / Background effects | AI Stylist section, used subtly |

Aceternity should create moments of delight, not define every interface.

---

# 6. LIPEK Motion Language

Use Framer Motion consistently.

| Motion Pattern | Use |
|---|---|
| Fade + 16–32px rise | Headings and text entrance |
| Clip reveal | Hero and campaign imagery |
| Scale 1.03 → 1 | Large editorial photography |
| Stagger | Product/category cards |
| Horizontal slide | Carousels |
| Shared layout | Tabs and selected filters |
| Smooth height | Accordions |
| Drawer slide | Cart, account and mobile navigation |
| Subtle parallax 2–5% | Large campaign imagery |
| Crossfade | Product image/variant changes |
| Mask/wipe | Campaign transitions |

Rules:

- no motion without purpose
- no scroll-jacking
- retail interactions should remain fast
- editorial sections may be more cinematic
- respect `prefers-reduced-motion`
- reduce animation load on mobile

---

# 7. Global Page Framework

```text
Utility Bar
↓
Main Header
↓
Primary Navigation / Mega Menu
↓
Page Content
↓
Pre-Footer / Newsletter
↓
Footer

Mobile additionally:
Sticky Bottom Navigation
Floating Support / AI Assistant
```

---

# 8. Header & Navigation

## 8.1 Utility Bar

Use a thin top-level strip.

Possible content:

- premium service statement
- shipping offer
- campaign message
- language
- region
- currency
- store
- support

Desktop example:

```text
Premium African Fashion. Crafted for Every Moment.

                                   EN   United States   USD   Houston
```

Mobile should keep only essentials visible.

## 8.2 Main Header

Desktop:

```text
LIPEK

Women   Men   Children   African Fashion   Tailoring   Services

                        Search   Wishlist   Account   Bag
```

The header may become slightly more compact on scroll using Framer Motion.

## 8.3 Search Experience

Search should open a large search panel with:

- recent searches
- trending searches
- suggested categories
- products
- collections
- services
- editorial content

Use shadcn `Command` as the accessible interaction base and fully customize the design.

## 8.4 Account Dropdown

```text
My LIPEK
────────────
Profile
My Orders
Track Orders
My Tailoring
My Alterations
My Laundry
Wishlist
Measurements
Rewards
Documents
Support
Sign Out
```

## 8.5 Mega Navigation

Top-level navigation:

- Women
- Men
- Children
- African Fashion
- Shoes
- Jewelry
- Bags & Accessories
- Custom Tailoring
- Services
- New Arrivals
- Sale

Example Men mega menu:

```text
MEN

SHOP
Suits
Shirts
Trousers
T-Shirts
Jackets
Casual Wear

AFRICAN WEAR
Agbada
Senator
Kaftan
Dashiki
Boubou
Kente

SHOES
Loafers
Oxford
Sneakers
Boots
Sandals

ACCESSORIES
Watches
Jewelry
Belts
Ties
Bags
Sunglasses

                       [Campaign Image]
                       The New Tailoring Edit
                       Shop Collection →
```

---

# 9. Homepage Recommended Order

```text
01 Utility Bar
02 Header
03 Primary Navigation
04 Hero Commerce Zone
05 Trust Strip
06 Featured Categories
07 New Arrivals
08 Limited-Time Drop / Flash Sale
09 Product Discovery Tabs
10 African Fashion Editorial Story
11 Shop the Look
12 Custom Tailoring Feature
13 Deals & Offers
14 Recommended for You
15 Shoes / Jewelry / Accessories Feature
16 LIPEK Services
17 Featured Brands / Designers
18 Testimonials / Community
19 Video / Style in Motion
20 Editorial Journal
21 AI Stylist Teaser
22 App / PWA Promotion
23 Newsletter
24 Footer
25 Sticky Mobile Nav
26 Floating Support / AI Assistant
```

---

# 10. Hero Commerce Zone

The hero should borrow the functional composition of the reference but become more fashion/editorial.

Desktop:

```text
┌───────────────┬──────────────────────────────────┬───────────────┐
│ DISCOVER      │                                  │ FEATURED      │
│ Women         │      MAIN CAMPAIGN               │ STORY         │
│ Men           │                                  │               │
│ Children      │                                  │               │
│ African Wear  │                                  │               │
│ Tailoring     │                                  │               │
└───────────────┴──────────────────────────────────┴───────────────┘
```

Possible campaign:

```text
NEW SEASON

Modern African Luxury
Made to Be Remembered.

Shop Collection →
Explore Tailoring →
```

Alternative:

```text
THE WEDDING EDIT

Dress the Moment.
Own the Memory.

Shop Wedding →
Book a Fitting →
```

Motion sequence:

1. image reveal
2. campaign label
3. headline
4. supporting text
5. CTAs
6. secondary campaign card

Mobile:

- main hero becomes full-width
- category access moves into chips or drawer
- secondary story stacks below

---

# 11. Trust Strip

Suggested items:

- Free Shipping
- Secure Payment
- Easy Returns
- Custom Tailoring
- Order Tracking
- 24/7 Support
- Pickup & Delivery

Desktop: compact row.

Mobile: horizontally scrollable.

---

# 12. Featured Category Discovery

Suggested categories:

- Women
- Men
- Children
- African Wear
- Suits
- Shoes
- Jewelry
- Bags
- Watches
- Wedding
- Custom Tailoring
- New Arrivals

Use mixed card sizes, not a uniform marketplace grid.

Example:

```text
┌──────────────────┬────────────┬────────────┐
│                  │ WOMEN      │ SHOES      │
│      MEN         ├────────────┼────────────┤
│                  │ JEWELRY    │ KIDS       │
├──────────┬───────┴────────────┴────────────┤
│ AFRICAN  │        CUSTOM TAILORING         │
└──────────┴─────────────────────────────────┘
```

Hover:

- image zoom
- overlay shift
- arrow reveal
- text motion

Mobile: 2-column grid.

---

# 13. New Arrivals

Heading:

```text
NEW ARRIVALS

Fresh pieces. New expressions.

View All →
```

Custom product card should support:

- primary image
- alternate hover image
- new/sale badge
- product name
- category
- current price
- old price where relevant
- rating
- wishlist
- color swatches
- quick add
- optional size preview

Desktop: 4–5 cards visible.

Mobile: 2-column grid or snap carousel.

---

# 14. Limited Drop / Flash Sale

```text
LIMITED DROP

Ends in:
03 : 18 : 42

Shop Before It's Gone →
```

Use:

- countdown
- product carousel
- discount badges
- old/new prices
- restrained urgency

Avoid loud generic marketplace styling.

---

# 15. Product Discovery Tabs

Tabs:

- Recommended
- Trending
- Best Sellers
- New Arrivals
- Recently Viewed
- Top Rated

Use shadcn Tabs behavior with custom design.

Use Framer Motion `AnimatePresence` for product transitions.

Mobile tabs should horizontally scroll.

---

# 16. African Fashion Editorial Story

This is a major identity section.

```text
AFRICAN FASHION

Heritage, Reimagined.

[Large editorial photography]

Explore Men
Explore Women
Explore Children
```

Alternative layout:

- large image left
- headline/story right
- overlapping fabric/detail image

Use subtle parallax only.

---

# 17. Shop the Look

Signature fashion-commerce section.

```text
SHOP THE LOOK

┌──────────────────────────────┬─────────────────────────┐
│                              │ THE MODERN GENTLEMAN    │
│        MODEL IMAGE           │                         │
│       •      •               │ Senator Set             │
│            •                 │ Leather Loafers         │
│                              │ Bracelet                │
│                              │ Watch                   │
│                              │                         │
│                              │ Shop Complete Look →    │
└──────────────────────────────┴─────────────────────────┘
```

Interaction:

- product hotspots
- shadcn Popover preview
- item price
- quick add
- complete-look CTA

Later this can become AI-personalized without redesigning the section.

---

# 18. Custom Tailoring Feature

This must feel like a flagship brand moment.

Recommended split-screen:

```text
[Atelier / Tailor Image]

CRAFTED FOR YOU

Your Measurements.
Your Fabric.
Your Signature.

Create clothing designed around
your body, style and occasion.

Design Your Garment →
Book a Fitting →
```

Supporting points:

- Made to Measure
- Premium Fabrics
- African Designs
- Wedding Tailoring
- Corporate Tailoring

Use Aceternity `Lens` selectively on fabric/stitching detail.

---

# 19. Deals & Offers

Possible offers:

- Daily Offers
- New Customer Offer
- Wedding Package
- Tailoring Consultation
- Bundle & Save
- Accessory Sets
- Loyalty Bonus
- Free Delivery Threshold

Cards should use strong typography, subtle image/graphic treatment and concise CTA.

---

# 20. Recommended for You

Authenticated:

```text
Recommended for You

Selected around your style.
```

Anonymous:

```text
Popular Picks for You
```

Possible signals later:

- viewed products
- wishlist
- size profile
- purchase history
- favorite categories
- preferred colors

Use premium horizontal carousel.

---

# 21. Shoes / Jewelry / Accessories Feature

Title:

```text
FINISH THE LOOK
```

Categories:

- Shoes
- Jewelry
- Watches
- Bags
- Accessories

Use a large visual category treatment plus product cards.

Optional Aceternity 3D Marquee may be used as a restrained visual layer.

---

# 22. LIPEK Services

Title:

```text
BEYOND THE WARDROBE
```

Services:

1. Custom Tailoring
2. Alterations
3. Laundry & Dry Cleaning
4. Pickup & Delivery

Preferred UI: large horizontal accordion or stacked reveal.

Example:

```text
01 CUSTOM TAILORING
────────────────────────────────
[large image]

Made around your measurements and style.

Explore →
```

Use Framer Motion layout transitions.

---

# 23. Featured Brands / Designers

If external brands exist:

```text
FEATURED DESIGNERS
```

Otherwise:

```text
OUR LABELS
```

Potential treatments:

- custom marquee
- logo row
- editorial cards

Use Aceternity Infinite Moving Cards only if it enhances the composition.

---

# 24. Community / Testimonials

Title:

```text
WORN. LOVED. LIPEK.
```

Mix:

- verified purchase reviews
- tailoring testimonials
- laundry reviews
- customer photos
- short videos

Use mixed card sizes or masonry instead of one repetitive slider.

---

# 25. Video / Style in Motion

Title:

```text
STYLE IN MOTION
```

Possible content:

- collection shoots
- tailoring behind the scenes
- wedding styling
- new arrivals
- transformations
- styling guides

Use horizontal reel cards.

Desktop hover: muted preview.

Click: shadcn Dialog with full video.

---

# 26. Editorial Journal

Title:

```text
THE JOURNAL
```

Layout:

```text
┌───────────────────────────────┬───────────────┐
│                               │ Article       │
│        FEATURE STORY          ├───────────────┤
│                               │ Article       │
│                               ├───────────────┤
│                               │ Article       │
└───────────────────────────────┴───────────────┘
```

Possible content:

- How to Style an Agbada
- Modern African Wedding Style
- How a Suit Should Fit
- Choosing Shoes for Formal Wear
- Fabric Care Guide
- Collection Stories

Use Link Preview selectively.

---

# 27. AI Stylist Teaser

This should feel like fashion, not a technology advert.

```text
YOUR LIPEK STYLIST

Tell us where you're going.
We'll help build the look.

"I'm attending a traditional wedding
and want something modern under $700."

Ask LIPEK →
```

Visual:

- model image
- subtle conversational cards
- floating product recommendations
- restrained spotlight effect

Later this connects to the Mastra AI layer.

---

# 28. App / PWA Promotion

```text
TAKE LIPEK EVERYWHERE

Shop.
Track orders.
Manage tailoring.
Book services.
Stay updated.
```

CTA:

```text
Install LIPEK
```

Later use App Store / Google Play badges when native apps exist.

---

# 29. Newsletter / Pre-Footer

```text
STAY IN STYLE

New collections.
Exclusive drops.
Style inspiration.
Member-only offers.

[Email address                         →]
```

Optional preference chips:

- Women
- Men
- Children
- African Fashion

---

# 30. Footer

## SHOP

- Women
- Men
- Children
- African Fashion
- Shoes
- Jewelry
- Accessories
- New Arrivals
- Sale

## SERVICES

- Custom Tailoring
- Alterations
- Laundry
- Dry Cleaning
- Pickup & Delivery

## HELP

- Contact
- Shipping
- Returns
- Order Tracking
- Size Guide
- FAQs

## ABOUT

- Our Story
- Our Craft
- Locations
- Careers
- Journal

## ACCOUNT

- My LIPEK
- Orders
- Wishlist
- Measurements
- Rewards
- Documents

## LEGAL

- Privacy
- Terms
- Cookies
- Accessibility

## SOCIAL

- Instagram
- TikTok
- Facebook
- Pinterest
- YouTube

---

# 31. Sticky Mobile Navigation

Recommended:

```text
Home
Shop
Search
Bag
Account
```

Requirements:

- safe-area aware
- cart badge
- active state
- subtle blur/background
- touch-friendly targets

---

# 32. Floating Support / AI Assistant

Closed state: small assistant trigger.

Open state:

```text
Hi. How can LIPEK help?

Track my order
Find an outfit
Custom tailoring
Returns
Laundry status
Ask a question
```

Support functionality can exist before the full AI layer is enabled.

---

# 33. Product Listing Pages

Structure:

```text
Editorial Category Hero
↓
Breadcrumbs
↓
Title + Product Count
↓
Filter / Sort Controls
↓
Product Grid
↓
Editorial Insert / Campaign Card
↓
More Products
↓
Recently Viewed / Recommendations
```

Filters:

- category
- size
- color
- material
- fit
- style
- occasion
- price
- availability
- rating
- collection

Mobile filters should use a Sheet or Drawer.

---

# 34. Product Grid

Desktop: 3–4 columns.

Large screens: up to 5 if image quality remains strong.

Mobile: 2 columns.

Optional editorial insert after several products:

```text
Product Product Product Product
Product Product Editorial Product
Product Product Product Product
```

---

# 35. Product Detail Page

Desktop:

```text
┌──────────────────────────────┬─────────────────────────────┐
│                              │ Product Name                │
│       Product Gallery        │ Price                       │
│                              │ Rating                      │
│                              │ Color                       │
│                              │ Size                        │
│                              │ Fit                         │
│                              │ Add to Bag                  │
│                              │ Wishlist                    │
│                              │ Customize if applicable     │
└──────────────────────────────┴─────────────────────────────┘
```

Below:

- product story
- fit
- material
- care
- delivery
- returns
- model information
- availability
- reviews
- complete the look
- similar items
- recently viewed

Aceternity Lens may be used for fabric/detail views.

---

# 36. Cart

Use side drawer for quick cart and full page for detailed cart.

Include:

- image
- name
- size
- color
- quantity
- price
- remove
- wishlist
- delivery estimate
- promotion
- order summary

Use Framer Motion layout animations for removal/quantity updates.

---

# 37. Checkout

Checkout should become much quieter than the homepage.

Desktop:

```text
Checkout Form                  Order Summary
```

Mobile:

single-column flow.

Priorities:

- clarity
- speed
- trust
- minimal distraction
- clear progress

Do not bring heavy editorial motion into checkout.

---

# 38. My LIPEK Account

Use same visual system with a more functional hierarchy.

Modules:

- Overview
- Orders
- Tailoring
- Alterations
- Laundry
- Appointments
- Documents
- Wishlist
- Measurements
- Rewards
- Profile
- Addresses
- Support

Desktop: sidebar + content.

Mobile: stacked navigation/cards.

---

# 39. Tailoring Pages

Tailoring should feel like a luxury configurator.

## Landing page

- atelier hero
- craftsmanship
- garment types
- how it works
- fabric details
- gallery
- testimonials
- fitting CTA

## Configurator

```text
01 Style
02 Fit
03 Fabric
04 Color
05 Lapel
06 Buttons
07 Lining
08 Monogram
09 Measurements
10 Fitting
11 Delivery
12 Review
13 Payment
```

Use Framer Motion step transitions.

Avoid a standard form appearance.

---

# 40. Alterations Pages

Landing:

- hero
- service overview
- garment categories
- process
- before/after
- CTA

Request flow:

- garment
- alteration
- photos
- description
- estimate
- pickup/drop-off
- date
- payment

Use step-based interaction.

---

# 41. Laundry & Dry Cleaning Pages

Landing:

- premium garment-care hero
- service types
- care promise
- pickup/delivery
- process
- pricing
- recurring-service teaser

Booking:

- service
- garments
- quantity
- pickup
- delivery preference
- price
- payment

Tracking should reuse LIPEK's standard activity timeline.

---

# 42. Editorial / Blog

Blog home:

- featured story
- magazine grid
- categories
- latest stories
- commerce-aware editorial links

Article:

- large hero
- editorial typography
- full-width imagery
- embedded products
- related stories
- shop-the-story CTA

---

# 43. Search Results

Support:

- products
- collections
- categories
- services
- journal content

Example:

```text
Search results for "wedding"

Products
Collections
Services
Journal
```

---

# 44. Empty States

Design:

- empty cart
- empty wishlist
- no orders
- no search results
- no tailoring jobs
- no rewards

Each should include concise explanation and relevant CTA.

---

# 45. Loading States

Prefer:

- skeleton cards
- skeleton media
- skeleton tabs
- stable layout
- subtle progress in checkout

Avoid relying on generic spinners.

---

# 46. Error States

Example:

```text
We couldn't load this collection.

Try Again
Browse New Arrivals
```

Never expose raw backend errors.

---

# 47. Frontend Data Boundary

Example:

```tsx
const products = await getNewArrivals()

return <NewArrivalsSection products={products} />
```

The backend determines product truth.

The presentation component determines:

- layout
- image ratio
- animation
- card treatment
- spacing
- heading hierarchy
- CTA placement
- responsive behavior

---

# 48. Content Source Rules

Backend is appropriate for:

- products
- prices
- inventory
- collections
- categories
- promotions
- operational content
- campaign data that changes frequently
- business details
- editorial/blog content

Frontend can own:

- structural labels
- design-specific microcopy
- section framing
- static storytelling text tied to art direction
- UI labels
- visual narrative

Not all marketing copy must be forced into backend administration.

---

# 49. Responsive Strategy

Desktop:

- richer composition
- mega menus
- wider grids
- layered imagery
- editorial asymmetry

Mobile:

- stacked storytelling
- horizontal carousels
- sticky bottom nav
- Sheets/Drawers
- simplified mega menu
- reduced motion
- full-width imagery

Mobile must be designed independently rather than merely shrinking desktop.

---

# 50. Performance Rules

- preload hero-critical media only
- lazy-load below fold
- defer video
- use responsive images
- avoid loading every carousel slide immediately
- dynamic-import heavy interactions
- minimize unnecessary client components
- use server components where interaction is not required
- keep Aceternity usage selective
- monitor Core Web Vitals

---

# 51. Accessibility

All custom UI must retain:

- keyboard navigation
- visible focus
- semantic headings
- accessible dialogs
- accessible drawers
- alt text
- labeled forms
- clear errors
- contrast
- reduced motion
- screen-reader state changes

Custom styling must not remove accessibility behavior inherited from shadcn primitives.

---

# 52. Suggested Component Architecture

```text
apps/storefront/
│
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── commerce/
│   ├── media/
│   ├── motion/
│   └── forms/
│
├── features/
│   ├── home/
│   │   ├── hero/
│   │   ├── category-discovery/
│   │   ├── new-arrivals/
│   │   ├── limited-drop/
│   │   ├── product-discovery/
│   │   ├── african-fashion/
│   │   ├── shop-the-look/
│   │   ├── tailoring-feature/
│   │   ├── offers/
│   │   ├── recommendations/
│   │   ├── accessories/
│   │   ├── services/
│   │   ├── brands/
│   │   ├── community/
│   │   ├── video-gallery/
│   │   ├── journal/
│   │   ├── ai-stylist/
│   │   └── newsletter/
│   ├── catalog/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   ├── tailoring/
│   ├── alterations/
│   ├── laundry/
│   └── search/
│
├── lib/
│   ├── api/
│   ├── commerce/
│   ├── motion/
│   ├── seo/
│   └── formatting/
│
└── hooks/
```

---

# 53. Reusable Commerce Components

```text
ProductCard
ProductImage
ProductPrice
ProductBadge
ProductRating
ProductSwatches
WishlistButton
QuickAdd
QuickView
CollectionCard
CategoryCard
OfferCard
LookCard
BrandCard
ReviewCard
ServiceCard
EditorialCard
SearchResultCard
```

---

# 54. Reusable Motion Components

```text
Reveal
Stagger
ImageReveal
ParallaxMedia
FadePresence
MotionDrawer
MotionTabs
AnimatedCounter
Marquee
HoverLift
```

These should standardize animation timing and easing across the storefront.

---

# 55. Visual Character by Page Type

| Page | Primary Character |
|---|---|
| Homepage | Editorial + discovery |
| Category / PLP | Commerce + discovery |
| Product Detail | Product storytelling + conversion |
| Tailoring | Luxury configurator |
| Services | Editorial + process |
| Checkout | Minimal + functional |
| My LIPEK | Functional + polished |
| Journal | Editorial / magazine |
| Search | Utility + discovery |

---

# 56. Homepage Redesign Implementation Sequence

## F1 — Structural Shell

- utility bar
- header
- navigation
- footer
- sticky mobile navigation
- shared motion primitives

## F2 — Hero & Discovery

- hero commerce zone
- trust strip
- category discovery
- section rhythm

## F3 — Commerce Modules

- product card system
- new arrivals
- limited drop
- discovery tabs
- recommendations

## F4 — Editorial Fashion

- African Fashion story
- Shop the Look
- Custom Tailoring feature
- accessories feature

## F5 — Services & Brand Story

- LIPEK Services
- brands/designers
- testimonials/community
- video
- Journal

## F6 — Intelligent / Utility Experiences

- AI Stylist teaser
- support assistant
- PWA promotion
- newsletter

## F7 — Responsive / Motion / Performance Polish

- mobile
- tablet
- reduced motion
- animation tuning
- image optimization
- accessibility
- Core Web Vitals

---

# 57. Homepage Acceptance Criteria

The redesign is complete only when:

- it no longer resembles a generic commerce template
- it clearly communicates premium African fashion
- Men, Women and Children are immediately discoverable
- African Fashion is a major visual category
- Shoes, Jewelry, Bags and Accessories are clearly represented
- Custom Tailoring has flagship treatment
- Alterations and Laundry remain discoverable
- search is prominent
- product discovery is strong
- Shop the Look exists
- product cards feel custom
- mobile is independently designed
- motion is cohesive and restrained
- shadcn is visually customized
- Aceternity is used only where valuable
- the homepage remains performant
- important interactions remain accessible
- backend data populates sections without controlling design
- the homepage establishes the visual grammar for other pages

---

# 58. Design Rule for Future Pages

Every future page should answer:

1. What is the page's commercial or informational purpose?
2. What visual storytelling moment makes it distinctly LIPEK?
3. Which reusable homepage patterns should it inherit rather than reinvent?

The homepage establishes the visual language.

Other pages extend it.

---

# 59. Final Direction

LIPEK should combine:

```text
Premium African Fashion
        +
Editorial Art Direction
        +
Powerful Commerce Discovery
        +
Custom Tailoring
        +
Services
        +
Personalization
        +
Modern Interaction Design
```

The backend provides truth.

The frontend provides identity.

The objective is not simply to improve one homepage.

The objective is to create a complete visual and interaction system capable of supporting LIPEK as a premium global African fashion platform across commerce, tailoring, services, accounts, mobile and future intelligent experiences.

> **LIPEK should feel designed, not generated.**
