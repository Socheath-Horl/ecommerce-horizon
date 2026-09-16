# E-Commerce UI System Design (Wireframes)

> Companion doc to `system-design.md`. Defines the UI structure, page flows, and
> component composition for all screens.
>
> **Canonical reference build:** the wireframes below are realized as static HTML
> in `ux-ui/` (`brand-spec.md`, `ecommerce-design-system.html`,
> `component-library.html`, `shadcn-component-library.html`, plus one HTML file
> per page). Where a prose spec and the HTML disagree, **the HTML wins** — it is
> the source of truth for translation to React (shadcn/ui).

---

## 1. Scope & Conventions

- Wireframes may have been schematic originally; **exact spacing/colors are now resolved** in the `ux-ui/` HTML reference build (see §8).
- Every screen lists its **composition** (which components from `system-design.md` §5 it uses).
- Roles: `GUEST`, `CUSTOMER`, `USER`, `ADMIN`.
- Base layout width for desktop frames: **1280px**, tablet: **768px**, mobile: **375px**.
- Currency format: `$` (USD, per Stripe defaults).
- Prices formatted `$1,234.56`; ratings shown as `★ 4.5 (12)`.
- **Brand:** *Horizon Supply Co.* — everyday carry / outdoor-lifestyle goods ("Objects with a point of view"). Catalog: **Outerwear (24), Travel (12), Carry & Desk (18), Drinkware (9)** — 63 styles. Store name + category set are used verbatim in seed and headers/footers.

---

## 2. Design Tokens (Confirmed in `ux-ui/` reference build)

**Values below are confirmed** — the `ux-ui/` CSS variables and `brand-spec.md`
are the source of truth for the shadcn/Tailwind token map. Tokens are written in
**OKLCH** in the reference build (hex here is the sRGB equivalent).
`ecommerce-design-system.html` holds the full slot-bridge table for mapping
these onto shadcn/ui CSS variables; `shadcn-component-library.html` documents
the composition of every primitive.

### 2.1 Colors (aligned with shadcn/ui defaults)

| Token      | Suggested (light) | Usage |
|------------|-------------------|-------|
| background | #FFFFFF | App background |
| foreground | #09090B | Text default |
| primary    | #18181B | Buttons, active nav, links |
| primary-foreground | #FAFAFA | Text on primary |
| secondary  | #F4F4F5 | Chip/badge background |
| muted      | #F4F4F5 | Skeleton, dividers, table zebra |
| muted-foreground | #71717A | Secondary text, placeholders |
| accent     | #F4F4F5 | Hover states |
| border     | #E4E4E7 | Inputs, table rows, cards |
| destructive | #DC2626 | Delete actions, error toasts |
| success    | #16A34A | PAID/DELIVERED status |
| warning    | #CA8A04 | PENDING status |
| info       | #2563EB | SHIPPED status, info toasts |
| brand      | #3A5A40 | Single brand accent — `--brand`. Hero kicker, category highlight, selected/active states. Primary CTA buttons stay `primary` `#18181B`. Value is a **proposal** — confirm against seed photography before freezing. |

**Dark palette** (applies when `ui.theme = 'dark'`; all other tokens stay constant):

| Token      | Dark value | Notes |
|------------|------------|-------|
| background | #09090B | App background |
| foreground | #FAFAFA | Text default |
| primary    | #FAFAFA | Buttons, links (inverts) |
| primary-foreground | #18181B | Text on primary |
| secondary  | #18181B | Chip/badge background |
| muted      | #18181B | Skeleton, table zebra |
| muted-foreground | #A1A1AA | Secondary text |
| accent     | #27272A | Hover states |
| border     | #27272A | Inputs, cards, dividers |
| brand      | #6AA97C | Same accent, raised luminance for dark background |
| destructive / success / warning / info | #EF4444 / #22C55E / #FACC15 / #3B82F6 | Status colors (raised luminance for contrast) |

**Documented extensions** (present in the reference build, in addition to the shadcn defaults): `--on-accent` #FAFAFA / #18181B (text on primary) and `--hover-fill` #F4F4F5 / #18181B (secondary, badges, table zebra). Status soft-background variants (`--success-soft`, `--warning-soft`, `--info-soft`, `--destructive-soft`) back the status badge chips.

**`--brand`** (review fix 1): a single accent hue — light `#3A5A40`, dark `#6AA97C` (proposal, confirm against photography). Scope: hero kicker, category highlight, selected/active states. It is the **only non-neutral hue outside the status-color set** — every other token stays in the zinc scale so the accent stays meaningful.

**Theme control:** toggle in Header (sun/moon icon) flips the **`html.dark` class** on the root element (shadcn `darkMode: ['class']` strategy); preference persisted in `ui.theme` (localStorage). First load follows `prefers-color-scheme`. Dark-mode paragraphs in the spec sketch optional arc — the reference build implements light + dark as paired token sets, and the stores differ per token as listed.

### 2.2 Typography

| Role | Size / Weight | Applies to |
|------|---------------|------------|
| Display | 36–48px / 800 | Hero headline |
| H1 | 30px / 700 | Page titles (Products, Dashboard…) |
| H2 | 24px / 600 | Section headers (Featured Products…) |
| H3 | 20px / 600 | Card titles, form section headers |
| Body | 14px / 400 | Primary text |
| Small | 12px / 400 | Captions, timestamps, badges |
| Button | 14px / 500 | All buttons |

**Legibility rule:** product-card **price and rating use Body (14px)** — never the 12px Small tier on a purchase-relevant number. `Small` stays for captions, timestamps, badges, meta only.

**Font families (from the reference build):**

| Role | Stack |
|------|-------|
| Display (`--font-display`) | `'Iowan Old Style', 'Charter', Georgia, 'Times New Roman', serif` — headings, logo, admin titles |
| Body (`--font-body`) | system sans stack — body, buttons, fields |
| Mono (`--font-mono`) | `ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace` — prices/SKUs/eyebrows, table meta, status chips |

The serif display + sans body pairing is the brand signifier; mono is reserved for "machine-ish" data (SKUs `FLT-04`, order IDs, timestamps, currency figures). **Camp rule for currency in mono:** mono sits on admin tables, receipts, and line-item meta only — **customer-facing prices always render in the body face** per the legibility rule above. No mono on a shopper-facing number.

### 2.3 Sizing

| Token | Value |
|-------|-------|
| Spacing scale | 4px grid (4, 8, 12, 16, 24, 32, 48) |
| Radius | **`--radius` 10px** (buttons, inputs, selects, chips) · **`--radius-lg` 16px** (cards, tables, drawers, modals) · `100%`/`full` (pills, avatar) — from the reference build CSS |
| Card gap | 16px grid gap desktop, 8px mobile |
| Max content width | 1280px centered (`--container: 1280px`) |
| Header height | 64px (desktop), 56px (mobile) |
| Sidebar width | 240px (admin desktop), slide-over on mobile |

### 2.4 Accessibility Contract (all screens)

- **Touch targets ≥ 44px** — buttons, steppers, icon buttons (cart, theme, close), menu rows.
- **Icon-only controls** (theme, cart ✕, delete, edit) carry `aria-label`; never rely on the emoji/icon alone (see §8).
- **Focus:** visible `:focus-visible` ring on every interactive element; never remove the outline without a replacement.
- **Keyboard:** drawer/menu opens on Enter/Space, closes on `Esc` (focus returns to trigger); dropdown selects and star rating are keyboard-operable.
- **StarRating input** is a radio-group of 5 buttons ("1 star…5 stars"), not a hover-only control; the display variant is a static `☆/★` readout with `aria-label` text (`4.5 / 5`).
- **Contrast pairs:** every hover/focus/selected state flips both bg + fg together and never drops below 4.5:1 (text) / 3:1 (icons). Disabled is the only state allowed to reduce contrast.
- **Color not alone:** status badges pair color chip + text label; OOS always shows text, never just a gray image.

---

## 3. Layout Shells

### 3.1 Customer App Shell (all customer pages)

```
┌────────────────────────────────────────────────────────────────┐
│ HEADER (sticky, 64px)                                           │
│ ┌─────┐ ┌─────────────────────────────┐     ┌──┐ ┌─────────────┐│
│ │LOGO │ │        SearchBar             │     │🌙│ │  🛒 icon    ││
│ │     │ │ (desktop only, w=420)        │     │  │ │ (badge 3)   ││
│ └─────┘ └─────────────────────────────┘     └──┘ │ 👤 UserMenu ││
│                                     (theme toggle)└─────────────┘│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                        PAGE CONTENT (max 1280)                 │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ FOOTER                                                        │
│ ┌─────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│ │LOGO     │ │ Quick Links  │ │ Support      │ │ Follow us   │ │
│ │tagline  │ │ Home         │ │ Help Center  │ │ [f][x][in]  │ │
│ │         │ │ Products     │ │ Contact Us   │ ├─────────────┤ │
│ │         │ │ My Orders    │ │ Shipping     │ │ Payment     │ │
│ │         │ │ My Profile   │ │ Returns      │ │ [Visa][MC]  │ │
│ └─────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │
│ Copyright © Horizon Supply Co. — All rights reserved              │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `Layout` → `Header` (Logo, SearchBar, CartIcon+badge, UserMenu, MobileMenu) + `Footer`.

**Dimensions confirmed in the reference build:** cart drawer right slide-over = `min(420px, 100vw)` full-height; mobile menu = 320px left slide-out; user dropdown = 236px. Header sits sticky at 64px (56px mobile); the search control renders as a rounded **pill** (44px hit area, radius-full) with a focus ring on open.

**Header — mobile (375px):**
```
┌────────────────────────────┐
│ [☰] [LOGO]        [🛒 3]  │
└────────────────────────────┘
   ☰ → slide-out MobileMenu:
   ┌────────────────────────┐
   │  Home                  │
   │  Products              │
   │  Search [_________]    │
   │  Login / Register ▾    │
   │  ─ ─ ─ ─ ─ ─ ─ ─ ─    │
   │  Theme: Light/Dark toggle │  ← moved into menu on mobile
   │  Sort (Products page)  │  ← native select inside menu
   └────────────────────────┘
```
**Mobile menu contents:** account (Login/Register or Profile/Orders), **theme toggle**, and **Sort control** (products page) all live inside this slide-out — the 375px bar keeps only logo + cart.

**UserMenu dropdown (user logged in):**
```
┌──────────────────────┐
│ 👤 Jane Doe (name)   │
│  jane@mail.com       │
│ ───────────────────  │
│ My Profile           │
│ My Orders            │
│ ───────────────────  │
│ Admin Panel  (USER/ADMIN only) │
│ Logout               │
└──────────────────────┘
```

**SearchBar behavior:** type → debounce 300ms → dropdown suggestions → Enter redirects to `/products?search=q`.

### 3.2 Admin Shell

```
┌────────────┬─────────────────────────────────────────────────────┐
│ SIDEBAR    │ ADMIN HEADER                                         │
│ (240px)    │ [☰ tablet]   [Page title]     [User ▾] [View Store] │
│            ├─────────────────────────────────────────────────────┤
│ ▸ Dashboard│                                                     │
│ ▸ Products │                                                     │
│ ▸ Categories│               PAGE CONTENT                         │
│ ▸ Orders   │                                                     │
│ ▸ Users    │                                                     │
│ ─────────  │                                                     │
│ [View Store]                                                      │
│ [Logout]   │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

- **Roles:** drawer visible to `USER` + `ADMIN`; **Users** item only for `ADMIN`.
- **Mobile (<768px):** sidebar hidden; hamburger opens slide-over.
- Guards wrap `/admin/*`: `AuthGuard` → `RoleGuard(USER|ADMIN)`.

---

## 4. Route Map

| Route | Page | Roles | Guard |
|-------|------|-------|-------|
| `/` | Home | ALL | none |
| `/products` | Products | ALL | none |
| `/products/:slug` | ProductDetail | ALL | none |
| `/auth/login` | Auth | GUEST | redirect away if authed |
| `/auth/callback` | Auth (PKCE callback) | GUEST | none — one-shot exchange, then redirects |
| `/cart` | Cart | CUSTOMER+ | AuthGuard |
| `/checkout` | Checkout | CUSTOMER+ | AuthGuard |
| `/order/success` | OrderConfirmation | CUSTOMER+ | AuthGuard |
| `/orders` | Orders | CUSTOMER+ | AuthGuard |
| `/orders/:id` | OrderDetail | CUSTOMER+ (owner) | AuthGuard |
| `/profile` | Profile | CUSTOMER+ | AuthGuard |
| `/admin` | Admin Dashboard | USER+ | AuthGuard + RoleGuard |
| `/admin/products` | ProductList | USER+ | same |
| `/admin/products/:id/edit` | ProductForm | USER+ | same |
| `/admin/products/new` | ProductForm | USER+ | same |
| `/admin/categories` | CategoryList | USER+ | same |
| `/admin/orders` | OrderList | USER+ | same |
| `/admin/users` | UserList | ADMIN | AuthGuard + RoleGuard(ADMIN) |
| `*` | NotFound | ALL | none |

---

## 5. Page Wireframes

### 5.1 Auth — Login (`/auth/login`)

```
┌──────────────────────────────────────────────┐
│                    [LOGO]                     │
│                Horizon Supply Co.               │
│                                              │
│        ┌──────────────────────────────┐      │
│        │  Sign in                     │      │
│        │                              │      │
│        │  (Zitadel logo)              │      │
│        │  [ Sign in with Zitadel ]    │      │
│        │                              │      │
│        │  New here? You'll create      │      │
│        │  your account at Zitadel.     │      │
│        └──────────────────────────────┘      │
└──────────────────────────────────────────────┘
```

**Composition:** `SignInCard` (centered card, max-w 400px) — no password fields.
**Behavior:** single button → SPA builds the Zitadel authorize URL (PKCE, state) and redirects; Zitadel hosts sign-in, self-registration, MFA, and forgot-password (system-design.md §3.1). After a successful code exchange the callback page redirects to `/`.

### 5.2 Auth — Callback (`/auth/callback`)

Not a rendered page — a one-shot exchange page.
```
┌──────────────────────────────────────────────┐
│                    [LOGO]                     │
│                                              │
│        ┌──────────────────────────────┐      │
│        │  (spinner)                   │      │
│        │  Signing you in…             │      │
│        └──────────────────────────────┘      │
└──────────────────────────────────────────────┘
```
**Behavior:** reads the authorization `code` from the URL, exchanges it with Zitadel (PKCE verifier from sessionStorage), stores access (memory) + refresh (localStorage) tokens, calls `GET /api/users/me` (triggers first-login upsert), then redirects to `/`.
**Failure:** invalid/missing `state` or token exchange error → redirect `/auth/login`.

### 5.3 Home (`/`)

```
┌────────────────────────────────────────────────────────────────┐
│ [HeroBanner — full width, h=420]                                │
│  Horizon Supply Co.                                  (bg image) │
│  "Title / tagline" — carries the SS26 collection text           │
│  [  Shop Now  ]      (single primary CTA → /products)          │
│  (Categories are browsed via CategoryGrid below — no duplicate) │
├────────────────────────────────────────────────────────────────┤
│ CategoryGrid (4/2/1 cols)     Section: "Shop by Category"      │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │  IMG    │ │  IMG    │ │  IMG    │ │  IMG    │                │
│ │Outerwear│ │ Travel  │ │Carry&Desk│ │Drinkware│                │
│ │ (24 items) │ │(12)   │ │ (18)   │ │  (9)   │                │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
├────────────────────────────────────────────────────────────────┤
│ "Featured Products"                       [ View all → ]       │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                        │
│ │  IMG  │ │  IMG  │ │  IMG  │ │  IMG  │   ProductGrid          │
│ │Name   │ │Name   │ │Name   │ │Name   │   (4→2→1 cols)         │
│ │$189.00│ │$15.75 │ │$42.00 │ │$8.95  │                        │
│ │★4.5(12)│ │★5(3) │ │★3.8(21)│ │★4.2(9)│                        │
│ └───────┘ └───────┘ └───────┘ └───────┘                        │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `HeroBanner` + `CategoryGrid` + `ProductGrid` (`ProductCard`).
**States:** skeleton cards while loading; empty state ("No products yet").
**ProductCard (detail):**

Default (in stock):
```
┌────────────┐
│  image 1:1  │
│ Name        │
│ $99.99      │   ← price 14px/600
│ ★ 4.5 (12)  │   ← rating 14px (≥3:1 on light & dark)
└────────────┘
```
Out of stock (`stock = 0`):
```
┌────────────┐
│ image 1:1  ├  "Out of stock" badge (destructive) over
│ OOS badge  │  image top-left; price kept, image 60% opacity.
│ Name        │
│ $99.99      │
└────────────┘
   Card still links to `/products/:slug` (details viewable).
```
Card: hover shadow + image zoom; whole card links to `/products/:slug`; the card has **no add-to-cart button** — out-of-stock is signaled by badge + dimming, never by hiding the product.
(Image: 200×200 thumb from `products/…`, see §6.3.)

### 5.4 Products (`/products`)

```
┌─────────────┬───────────────────────────────────────────────────┐
│ FilterSidebar│ [SortSelect: Newest ▾]        "124 results"       │
│ (w=260)     │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│             │ │ Card  │ │ Card  │ │ Card  │ │ Card  │            │
│ Category    │ └───────┘ └───────┘ └───────┘ └───────┘            │
│ ○ All       │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│ ○ Outerwear │ │       │ │       │ │       │ │       │            │
│ ○ Travel    │ └───────┘ └───────┘ └───────┘ └───────┘            │
│ ○ Carry & Desk │  ....                    ┌───────┐            │
│ ○ Drinkware │ └───────┘ └───────┘ └───────┘ └───────┘            │
│             │                                                     │
│ Price       │                                                     │
│ $[___] - $[___]  [Apply]  │        Pagination                     │
│ Rating: [4 ★] [3 ★] [2 ★] │   ◀   1  2  3  4 …  ▶   (3 of 10)   │
│ [Clear all filters] │      │                                     │
└─────────────┴───────────────────────────────────────────────────┘
```

**Composition:** `FilterSidebar` + `SortSelect` + `ProductGrid` + `Pagination`.
**Responsive:** mobile → filters collapse behind "Filters" button (drawer, `min(320px,…)`); SortSelect moves into the drawer as a native select (no desktop dropdown on ≤640px).
**Query sync:** URL params drive state (search, categoryId, minPrice, maxPrice, rating, sort, page). Category is **single-select** (radio list, one entry active) — matches the spec's single `categoryId` param; there is **no multi-category mode**.
**Price validation:** `minPrice ≤ maxPrice` enforced inline before `[Apply]` (swap or error message); range inputs are start/end pairs, not two independent filters.
**Sort options:** `newest` (default), `price_asc`, `price_desc`, `popular`.
**Search states:** see §6.4 — suggestions (loading/empty/error) + submitted query state.

### 5.5 ProductDetail (`/products/:slug`)

```
┌───────────────────────────────────────────┬─────────────────────┐
│ Home / Products / Outerwear / Waxed Field Jacket │  (Breadcrumb)       │
│ ImageGallery (w=560)                      │ ProductInfo (w=420) │
│                                           │                     │
│        [     Main Image      ]            │  Waxed Field Jacket   │
│        [   square 1:1, w=560 ]            │  #tag / category link│
│                                           │                     │
│ [thumb] [thumb] [thumb] [thumb]           │  ★ 4.5  (12 reviews) │
│ (active thumb: border highlight)          │                     │
│                                           │  $99.99              │
│                                           │  Stock: 24 in stock  │
│                                           │  (or: Out of stock)  │
│                                           │                     │
│                                           │  Quantity (max stock)│
│                                           │   [−]  2  [+]        │
│                                           │   [+ disabled @ stock]│
│                                           │  [  Add to Cart  ]   │
│                                           │   (disabled @ 0/OOS) │
│                                           │                     │
├───────────────────────────────────────────┴─────────────────────┤
│ Description (full width, reads under image column)              │
│  Paragraph…                                                     │
├────────────────────────────────────────────────────────────────┤
│ Reviews:  "Customer Reviews — ★ 4.5 (12)"                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ StarRating [☆☆☆☆☆ interactive]  [Post Review] (auth+eligible)│ │
│  │ ┌────────────────────────────────────────────────────────┐ │
│  │ │ ★★★★★  Jane D.    2026-08-12   🖼️[img][img]             │ │
│  │ │ "Great fit, fast shipping…"                             │ │
│  │ │ (ReviewCard — delete btn on own review)                 │ │
│  │ └────────────────────────────────────────────────────────┘ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Pagination ◀ 1 2 ▶]                                          │
├────────────────────────────────────────────────────────────────┤
│ Related Products (same category)                               │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                            │
│ │ Card │ │ Card │ │ Card │ │ Card │                            │
│ └──────┘ └──────┘ └──────┘ └──────┘                            │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `ImageGallery`, `ProductInfo`, `QuantitySelector`, `ReviewSection` (`StarRating`, `ReviewForm`, `ReviewList`→`ReviewCard`+`ReviewImages`), `RelatedProducts`.
**Review eligibility (product rule):** authenticated **and** has purchased the product **and** has not already reviewed it. `ReviewForm` is only rendered when eligible; rating 1–5; ≤5 images.
**Review errors:** `400` validation · `401` unauth · `403` not purchased · `404` product or file · `409` already reviewed.
**Contract (now in `system-design.md` §3.6):** the purchase gate is enforced server-side — `403 Not purchased` when no `PAID`/`DELIVERED` order contains the product.
**Behavior:** Add to Cart → toast + header badge bump; if not authed → redirect login with `next` param.
**Quantity cap:** stepper `[−] [+]` bounded 1…`stock`; `[+]` disabled at `stock`; **`[Add to Cart]` disabled when `stock = 0` or `qty ≥ stock`** (mirrors server `409 stock`). Helper hint "Only N left" when `stock ≤ 5`.

### 5.6 Cart (`/cart`)

```
┌──────────────────────────────────────────────┬──────────────────┐
│ Cart (3 items)  [Clear cart]                 │ OrderSummary (w=320)
│                                              │                  │
│ ┌──────────────────────────────────────────┐ │  Subtotal   $149.99
│ │ [IMG] Product A         $25.00  [− 2 +] ✕│ │  Shipping    $10.00
│ ├──────────────────────────────────────────┤ │  Tax         $12.00
│ │ [IMG] Product B         $99.99  [− 1 +] ✕│ │  ──────────      │
│ └──────────────────────────────────────────┘ │  Total       $171.99
│ + update quantity via PATCH /api/cart/:id    │                  │
│ stock exceeded → 409 toast                   │  [ Checkout ]    │
│ + [Clear cart] → confirm dialog →            │  [ Continue shopping ]
│     DELETE /api/cart                         │                  │
├──────────────────────────────────────────────┴──────────────────┤
│ Empty state: [🛒 illustration] "Your cart is empty"              │
│              [ Start shopping ]                                  │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `CartItem` × n + `OrderSummary`.
**OrderSummary data source:** subtotal, shipping, tax, and total render from `GET /api/cart` (`shipping`, `tax`, `total` — server-computed estimate, `system-design.md` §3.3), never computed client-side.

**Cart surface — drawer + full Cart page:** the header cart icon (click/tap) sets `ui.isCartOpen = true` → right slide-over panel (`min(420px, 100vw)`, full-height, closes on overlay/✕/Esc). It reuses the Cart page's components, compacted, with its own empty state; the `[View Cart]`/`[Continue shopping]` link opens `/cart`. One trigger, one drawer — **no hover dropdown**. Full-page `/cart` remains the standard checkout path. Matches `system-design.md` §4.1 `ui.isCartOpen`.

```
┌──────────┐
│ PAGE     │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ CONTENT  │ ▓│ 🛒 Cart (3)        ✕ │
│ (dimmed) │ ▓├───────────────────────┤
│          │ ▓│ [IMG] Product A ×2    │
│          │ ▓│       $50.00          │
│          │ ▓│ [IMG] Product B ×1    │
│          │ ▓│       $99.99          │
│          │ ▓├───────────────────────┤
│          │ ▓│ Subtotal     $149.99  │
│          │ ▓│ [  Checkout  ]        │
│          │ ▓│ [ View Cart ]         │
│          │ ▓└───────────────────────┘│
│          │ └───────────────────────  │
└──────────┘
```
Click overlay/✕ → `isCartOpen = false`. On mobile: full-width drawer.

### 5.7 Checkout (`/checkout`)

**Stepper:** `① Address → ② Review & Pay` (progress chips).

```
┌──────────────────────────────────────────────┬──────────────────┐
│ ① Shipping Address  →  ② Review & Pay       │ OrderSummary      │
│                                              │  [IMG] Product A ×2 │
│ AddressForm (from saved addresses + manual)  │  [IMG] Product B ×1 │
│ ┌──────────────────────────────────────────┐ │  Subtotal $149.99   │
│ │ Label: [Home ▾] / [+ New address]        │ │  Shipping $10.00    │
│ │ Line1      [__________________]          │ │  Tax $12.00         │
│ │ Line2      [____________] (optional)     │ │  ─────────────      │
│ │ City [_____] State [____] Zip [____]     │ │  Total $171.99      │
│ │ Country [United States ▾] [✓ set default] │ └────────────────────┘
│ │                                [Continue→]│                      │
│ └──────────────────────────────────────────┘                      │
├───────────────────────────────────────────────────────────────────┤
│ ② Review & Pay — PaymentForm (Stripe Hosted Checkout)            │
│ ┌──────────────────────────────────────────────┐                │
│ │  Payment methods                            │                │
│ │  ◉ Credit/Debit Card (Stripe secure checkout)│                │
│ │  (  Card fields handled by Stripe page )    │                │
│ │    "You'll be redirected to Stripe."        │                │
│ │  [  Pay $171.99  ]   ← (1) POST /api/orders                  │
│ │                         (2) POST /api/checkout/create-session │
│ │  Test card: 4242 4242 4242 4242                             │
│ └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

**Composition:** `AddressForm` + `PaymentForm` + `OrderSummary` (read-only, always visible on right).
**Pricing rule (now defined in `system-design.md` §2):** `subtotal = Σ price×qty`; **shipping** = flat fee ($5 free ≥ $100) and **tax** = state rate on subtotal (8.25%), both computed server-side. `GET /api/cart` returns the estimate for the cart and checkout-step-① summary; `POST /api/orders` stores the authoritative snapshot (`shipping`, `tax`, `total`) that surfaces on OrderConfirmation, Orders, and OrderDetail — later order views never re-derive from live product prices.
**Flow (order-first — matches `system-design.md` §3.4/§3.5):** Address → OrderSummary review → `[Pay $..]` →
1. `POST /api/orders` `{ shippingAddress }` → creates the order as **`PENDING`**, returns `orderId`
2. `POST /api/checkout/create-session` `{ orderId }` → `data.url`
3. Redirect to Stripe hosted checkout → back to `/order/success?session_id=…` (success) or `/cart` (cancel)

> **Contract (now in `system-design.md` §3.5):** `create-session` accepts `{ orderId }` and returns `data.orderId` so the success page can resolve the order. Order stays `PENDING` until the Stripe webhook flips it to `PAID`.

**Guard:** cart empty on page load → redirect to `/cart`; Continue disabled until address valid; `[Pay $..]` double-submit lock while requests are in flight.
**Errors:** `400` cart empty or order validation → toast, stay on page; `400/409` order-creation conflict → toast; `422 PAYMENT_FAILED` (Stripe side) → error state on Checkout with retry.

### 5.8 OrderConfirmation (`/order/success`)

```
┌──────────────────────────────────────────────┐
│   ✅  (success icon, large)                   │
│   Thank you for your order!                   │
│   Order #10f2c8ab-…                           │
│   Status: PAID chip                           │
├──────────────────────────────────────────────┤
│  Items:  Product A ×2  $50.00                │
│          Product B ×1  $99.99                │
│  Shipping: $10.00   Tax: $12.00              │
│  Total:  $171.99   (Visa •••• 4242)          │
├──────────────────────────────────────────────┤
│  [ Continue Shopping ]   [ View My Orders ]  │
└──────────────────────────────────────────────┘
```

**Resolve:** entry URL carries `?session_id=…` (+ `orderId` from the create-session response). Fetch `GET /api/orders/:id` (owner-gated) to render this screen; never fabricate the order in the client.

**States:**
- *Resolving* — spinner "Confirming your order…".
- *`PENDING`* — success header shown, but **no PAID chip**; "Payment processing — we'll confirm shortly." Poll `GET /api/orders/:id` every 2s (max ~10 attempts) until it flips to `PAID`.
- *`PAID`* — full success block with PAID chip + payment card (as in the wireframe above).
- *Fetch fails (`403`/`404`) or payment was cancelled* — error block "Payment didn't go through" + `[ Back to Cart ]` (do not show a fake success).
- *Webhook still unprocessed after poll timeout* — keep `PENDING` view with "We'll email your confirmation"; do not block the user.

**Composition:** `OrderConfirmation` (success icon, summary, CTAs).

### 5.9 Orders (`/orders`)

```
┌──────────────────────────────────────────────┐
│  Home / My Orders   (Breadcrumb)               │
│  My Orders                                    │
│  [Status filter: [All][PENDING][PAID]… ▾]     │
│ ┌────────────────────────────────────────────┐│
│ │ #10f2c8ab   2026-08-15 [PAID chip] $171.99→││
│ ├────────────────────────────────────────────┤│
│ │ #10f2cab   2026-08-12 [SHIPPED] $44.99  → ││
│ └────────────────────────────────────────────┘│
│  Pagination ◀ 1 2 ▶                            │
│  Empty: "No orders yet" [Start shopping]       │
└──────────────────────────────────────────────┘
```

**Row:** OrderStatusBadge color mapping — PENDING=warning, PAID=success, SHIPPED=info, DELIVERED=success, CANCELLED=destructive.

### 5.10 OrderDetail (`/orders/:id`)

```
┌──────────────────────────────────────────────┐
│  Home / My Orders / #10f2c8ab  (Breadcrumb)   │
│  Order #10f2c8ab    [PAID]  (badge, top-right)│
├──────────────────────────────────────────────┤
│  Items (per item)                          │
│  [IMG] Product A ×2  $25.00 → $50.00  [Review]│
│  [IMG] Product B ×1  $99.99 → $99.99  [Review]│
│ ─────────────────────────────────────────────┤
│  Shipping Address                            │
│    Jane Doe                                  │
│    123 Main St, Springfield, IL 62704, US    │
│ ─────────────────────────────────────────────┤
│  Payment                                     │
│    Visa •••• 4242     $171.99   PAID         │
├──────────────────────────────────────────────┤
│  Total: $171.99                              │
└──────────────────────────────────────────────┘
```

**Per-item review CTA:** each order row shows `[Review]` when the order is **DELIVERED** and the user is eligible (§5.5) — links to `/products/:slug` review composer (or modal) in the delivered/not-yet-reviewed state. Rows already reviewed show `✓ Reviewed` (disabled). Multi-item orders no longer collapse into a single "review this product" button.

### 5.11 Profile (`/profile`)

```
┌──────────────────────────────────────────────┐
│  My Profile                        (2-col grid)│
│ ┌──────────────────┐  ┌─────────────────────┐ │
│ │ UserInfo         │  │ Security (Zitadel)  │ │
│ │ [IMG avatar]     │  │ [Manage password →] │ │
│ │ Jane Doe         │  │ Opens Zitadel's     │ │
│ │ jane@mail.com    │  │ hosted password/MFA │ │
│ │ +1 555 0100      │  │ settings in a new  │ │
│ │ [Edit Profile]   │  │ tab.                │ │
│ └──────────────────┘  └─────────────────────┘ │
│ ┌────────────────────────────────────────────┐ │
│ │ AddressList                                │ │
│ │ [+ Add Address]                            │ │
│ │ ┌────────────────────────────────────────┐ │ │
│ │ │ Default: Home — 123 Main St, Springfield│ │ │
│ │ │          IL 62704       [Edit][Delete] │ │ │
│ │ └────────────────────────────────────────┘ │ │
│ │   Work — 45 Oak Ave, Chicago, IL 60601    │ │
│ │                              [Edit][Delete]│ │
│ └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

**Composition:** `UserInfo`, `AddressList` (`AddressForm` modal), and a Security card that links out to **Zitadel** (no password form — system-design.md §3.1).
**Avatar upload:** `SingleUpload` (2MB, in-file validation).

### 5.12 Admin — Dashboard (`/admin`)

```
┌────────────────────────────────────────────────────────────────┐
│ Dashboard                                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ Revenue  │ │ Orders   │ │ Users    │ │ Products │          │
│ │ $9,240.00│ │ 12       │ │ 34       │ │ 5        │          │
│ │ +12% ↑   │ │ +3 this wk│ │ 2 new   │ │ 1 low stock│        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├──────────────────────────────┬────────────────────────────────┤
│ SalesChart (recharts line)   │ RecentOrders (last 10)         │
│ ┌──────────────────────────┐ │ ┌────────────────────────────┐ │
│ │  /│   ●          ●        │ │ │ #10f2c8ab [PAID]  $171.99  │ │
│ │ │ |      ●   ●  ●        │ │ │   Jane Doe        2026-08-15│ │
│ │ │ |   ●       ●          │ │ └────────────────────────────┘ │
│ │ └──────────────────────┘ │ │ [View all orders →]           │
│    Jul ▁▂▃▄▅▆ Aug            │ └────────────────────────────┘ │
└──────────────────────────────┴────────────────────────────────┘
```

**Composition:** `StatsCards` ×4 + `SalesChart` + `RecentOrders`.
**Data:** cards map 1:1 to `GET /api/admin/stats` (`system-design.md` §3.7): Revenue = `totalRevenue`, Orders = `totalOrders` + `ordersThisWeek`, Users = `totalUsers` + `newUsersThisWeek`, Products = `totalProducts` + `lowStockProducts`; Chart = `salesByDay`, RecentOrders = `recentOrders`. No client-side derivation.

### 5.13 Admin — Products (`/admin/products`)

```
┌────────────────────────────────────────────────────────────────┐
│  Products                                 [ + New Product ]    │
│  [Search products…]                     [Category ▾][Stock ▾]  │
│ ┌──┬──────────────┬───────┬───────┬──────────┬────────────────┐ │
│ │# │ Name         │ Price │ Stock │ Category │ Actions         │ │
│ ├──┼──────────────┼───────┼───────┼──────────┼────────────────┤ │
│ │1 │ Waxed Field Jacket │$189.00│  24   │ Outerwear │ [✏️ Edit] [🗑️]   │ │
│ │2 │ Weekender Duffel   │$168.00│   0 ⚠ │ Travel     │ [✏️ Edit] [🗑️]  │ │
│ └──┴──────────────┴───────┴───────┴──────────┴────────────────┘ │
│  Pagination ◀ 1 2 ▶   (stock 0 row: red Stock cell)             │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `ProductTable` + pagination; delete → confirm dialog → toast.
**Breadcrumb:** `Admin / Products` (Sentinel `Home` optional).
**Data:** `GET /api/admin/products` — `?search=&categoryId=&stock=&page=&limit=` where `stock` ∈ `in_stock | out_of_stock | low` (low = stock ≤ 5). Defined in `system-design.md` §3.7.

### 5.14 Admin — ProductForm (`/admin/products/new`, `/admin/products/:id/edit`)

```
┌────────────────────────────────────────────────────────────────┐
│ Create Product                              (or "Edit Product") │
│ ┌────────────────────────────┐ ┌──────────────────────────────┐ │
│ │ Name            [________]│ │ Images (≤5)                  │ │
│ │ Description     [________]│ │ [MultiUpload dropzone]       │ │
│ │                 [textarea │ │ ┌────────┐ ┌────────┐ ┌──────┐ │ │
│ │ Price       [$____]       │ │ │  IMG   │ │  IMG   │ │  +   │ │
│ │ Stock       [____]        │ │ │ [✕]    │ │ [✕]    │ │      │ │
│ │ Category    [Select ▾]    │ │ └────────┘ └────────┘ └──────┘ │ │
│ ├────────────────────────────┴──────────────────────────────┤ │
│ │                      [ Save ]    [ Cancel ]                │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** form + `MultiUpload` (5MB/file, jpg|jpeg|png|webp).
**Validation:** price ≥ 0, stock ≥ 0, name required; category select required.

### 5.15 Admin — Categories (`/admin/categories`)

```
┌────────────────────────────────────────────────────────────────┐
│  Categories                             [ + New Category ]     │
│ ┌─────────────────────────────────────────────┬───────────────┐│
│ │ Category │ Slug │ Products │ Image │ Actions │               ││
│ │ Outerwear │ outerwear │ 24 │[IMG] │ [✏️][🗑️]│               │
│ │ Travel  │ travel │ 12 │[IMG] │ [✏️][🗑️]│               │
│ └─────────────────────────────────────────────┴───────────────┘│
│ CategoryForm (modal): Name [____]  Image [SingleUpload]        │
│                        [Save] [Cancel]                         │
│  409 → "Category name exists"; delete with products → 409 error│
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `CategoryTable` + modal `CategoryForm` + `SingleUpload`.

### 5.16 Admin — Orders (`/admin/orders`)

```
┌────────────────────────────────────────────────────────────────┐
│  Orders                            [Status: All ▾][Date range] │
│ ┌──────────────┬─────────┬────────┬───────┬───────────────────┐│
│ │ Order        │ Customer│ Total  │ Status│ Actions            ││
│ │ #10f2c8ab    │ Jane Doe│$171.99 │ (▾ status select) │Details││
│ │ #10f2cab     │ John    │$44.99  │ (▾ status select) │Details││
│ └──────────────┴─────────┴────────┴───────┴───────────────────┘│
│  Status dropdown cell → PATCH /api/admin/orders/:id/status      │
│  Invalid transition (e.g. DELIVERED→PENDING) → toast error 400  │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `OrderTable` (inline `OrderStatus` select) + pagination + detail drawer/page.
**Data:** `GET /api/admin/orders` — `?status=&dateFrom=&dateTo=&page=&limit=`. Defined in `system-design.md` §3.7.

**Status transitions (legal):**
```
PENDING   → PAID | CANCELLED
PAID      → SHIPPED | CANCELLED
SHIPPED   → DELIVERED | CANCELLED
DELIVERED → (terminal)
CANCELLED → (terminal)
```
- `PENDING → PAID` is normally set by the Stripe webhook; the admin dropdown should only present the currently legal transitions and disable others (`400 Invalid status transition` → toast on violation).

### 5.17 Admin — Users (`/admin/users`) — ADMIN only

```
┌────────────────────────────────────────────────────────────────┐
│  Users                                    [Role: All ▾][Search]│
│ ┌──────────┬────────────┬────────┬───────────┬───────────────┐│
│ │ User     │ Email      │ Role   │ Orders    │ Role Selector ││
│ │ Jane Doe │ j@mail.com │ Customer│ 3        │ [Customer ▾]  ││
│ │ Admin1   │ a@mail.com │ ADMIN  │ 12       │ [ADMIN ▾]     ││
│ └──────────┴────────────┴────────┴───────────┴───────────────┘│
│  Pagination ◀ 1 2 ▶                                          │
└────────────────────────────────────────────────────────────────┘
```

**Composition:** `UserTable` + inline `RoleSelector` (PATCH `/api/admin/users/:id/role`).
**Constraint:** cannot promote above your own level; cannot change own role (400 toast).

### 5.18 NotFound (all non-matched routes)

```
┌──────────────────────────────┐
│          404                 │
│    Page not found            │
│  [  Back to Home  ]          │
└──────────────────────────────┘
```

---

## 6. Shared Components

### 6.1 FileUpload

```
SingleUpload                          MultiUpload
┌────────────────────────────┐       ┌──────────────────────────────┐
│ ⬆ Drag & drop or click     │       │ ⬆ Drag & drop or click      │
│(jpg, jpeg, png, webp)      │       │ add many (jpg, jpeg, png, webp)  │
│ ┌────────┐                 │       │ ┌─────┐ ┌─────┐ ┌─────┐     │
│ │ IMG    │  [Replace][✕]   │       │ │ IMG │ │ IMG │ │ IMG │     │
│ └────────┘                 │       │ └─────┘ └─────┘ └─────┘     │
└────────────────────────────┘       │   progress bar per file      │
                                     └──────────────────────────────┘
```
Upload progress % per file; error toast for invalid type/size (`400`).
**Size limits per entity (from `system-design.md` §8):** products/reviews ≤5MB · avatars/categories ≤2MB. The shared component enforces the limit matching the attached entity.

### 6.2 Feedback / Loading primitives

| Component | Usage |
|-----------|-------|
| `Skeleton` | Product grids, detail page, tables (pulse animation) |
| `Breadcrumb` | Products, ProductDetail, Orders, OrderDetail, Admin pages — `Home / {section} / {current}`; last crumb is the page title (not a link). Sentinel `Home` optional in Admin. |
| `Spinner` | Button submissions, page transitions |
| `Toast` | Success (green), error (red), info (blue); auto-dismiss 3s |
| `ErrorBoundary` | Wraps App; fallback + Retry |

### 6.3 Image Variants (MinIO thumbnail sizes per `system-design.md` §8)

| Context | Size used | Source |
|---------|-----------|--------|
| ProductGrid / ProductCard | 200×200 thumb (srcset 500 for ≤2x) | `products/…` |
| ProductDetail main image | 500×500 | `products/…` |
| ImageGallery thumbnails | 200×200 | `products/…` |
| Cart Drawer / CartItem / OrderSummary row | 200×200 | `products/…` |
| CategoryGrid / CategoryTable | 300×300 | `categories/…` |
| UserMenu / UserInfo avatar | 100×100 | `avatars/…` |
| ReviewImages / ReviewCard | 200×200 | `reviews/…` |

> **Contract (now in `system-design.md` §8):** the review-image pipeline generates a 200×200 thumbnail (in addition to the existing product/category/avatar sizes) so this row is servable.

All images served via `File.url`; `alt` = product/category/user name. Fallback placeholder (`product-placeholder.svg`) when image missing.

### 6.4 Per-Page States Matrix

| Page | Loading | Empty | Error |
|------|---------|-------|-------|
| Home | 8 skeleton cards | — (keeps CategoryGrid) | "Couldn't load products" + Retry, no banner error |
| Products | 8 skeleton cards | "No products match your filters" + Clear filters | toast + Retry |
| Products — Search (query submitted) | inline "Searching…" | "No results for \`query\`" + Clear search | toast + Retry |
| Products — Search suggestions (pre-enter) | 3–5 suggestion skeletons | show recent/empty → hint "Type to search" | toast only |
| ProductDetail | 2-col skeleton | — | 404 view ("Product not found") + Back to products |
| Cart | skeleton rows | "Your cart is empty" + Start shopping | toast + Retry |
| Checkout | spinner on button | redirect to `/cart` | toast (400/422) + stays on page |
| Orders | list skeleton | "No orders yet" + Start shopping | toast + Retry |
| OrderDetail | skeleton | — | redirect `/orders` on 403/404 |
| Profile | skeleton | — | toast + Retry |
| Admin pages (all) | table skeletons | "No records found" | toast + Retry |
| Reviews (product page) | 3 review skeletons | "No reviews yet. Be the first!" | toast; `403` → hide ReviewForm |
| Review submit (product page) | spinner in `[Post Review]` | — | inline errors per §5.5 (`400/401/403/404/409`); success → toast "Review submitted" + list refresh |

### 6.5 Icon policy (wireframe → build translation)

Wireframes draw icons as emoji (🌙 🛒 👤 ✏️ 🗑️ ☰ …). These are shorthand only — in React they map one-for-one to shadcn/lucide-react icons; **no emoji ships in the build**:

| Wireframe | lucide-react icon |
|-----------|-------------------|
| 🌙 (theme toggle) | `Moon` / `Sun` |
| 🛒 (cart) | `ShoppingCart` (badge = count text) |
| 👤 (user menu) | `User` |
| ✏️ (edit) | `Pencil` |
| 🗑️ (delete) | `Trash2` |
| ☰ (menu) | `Menu` |
| ✕ (close) | `X` |
| ▾ / ▶ / ◀ | `ChevronDown` / `ChevronRight` / `ChevronLeft` |
| ✓ (done) | `Check` |
| ✅ (order success) | `CheckCircle2` |
| ⚠ (low stock, admin) | `TriangleAlert` |
| ★ / ☆ (rating) | `Star` / `StarHalf` — filled on value; display readout keeps `aria-label` (`4.5 / 5`) per §2.4 |

Every icon-only control still carries the `aria-label` required in §3.1/§2.4.

---

## 7. Responsive Matrix

| Breakpoint | Grid (products) | Sidebar | Header | Filters |
|------------|-----------------|---------|--------|---------|
| ≥1280 | 4 cols | full | full nav + search | left column |
| 769–1279 | 3 cols | full | condensed nav | left column |
| 641–768 | 2 cols | slide-over | hamburger | drawer (filter button) |
| ≤640 | 1 col  | slide-over | hamburger, search icon modal | drawer |

---

## 8. Reference Build (`ux-ui/`) — Implementation Notes

**🧱 Prerequisite gate (review fix 2):** the `ux-ui/` reference build must exist in the repository before React translation begins — it is the source of truth, and translation only works against a real artifact. Missing `ux-ui/` = don't start frontend pages; commit the HTML build first.

The static HTML build in `ux-ui/` is the canonical visual spec; React translation happens **directly from the HTML, not via Penpot**. When implementing in React:

- **One HTML file per page** maps to one React route (see §4): `home-page.html`, `products-page.html`, `product-detail-page.html`, `cart-page.html`, `checkout-page.html`, `order-success.html`, `orders-page.html`, `order-detail-page.html`, `profile-page.html`, `login-page.html`, `404-page.html`; admin: `admin-page.html`, `admin-products-page.html`, `admin-product-form.html`, `admin-categories-page.html`, `admin-orders-page.html`, `admin-users-page.html`.
- **Design-system source files:** `brand-spec.md` (brand/token prose), `ecommerce-design-system.html` (token slot-bridge + primitives), `component-library.html` and `shadcn-component-library.html` (composed components incl. Header/ProductCard/CartDrawer/StatusBadges/DataTable).
- **Design tokens** (§2) map 1:1 to the Tailwind/shadcn theme (`:root` + `.dark` CSS variables, `darkMode: ['class']`). TODO notes and raw hexes in code are banned — always reference the tokens.
- Components (Header, ProductCard, ProductTable…) are **composable pieces** in the HTML — rebuild them as typed React + shadcn components with variants (e.g. button: default/loading/disabled; status badge: 5 states).
- Component names must match `system-design.md` §5 names (e.g. `FilterSidebar`, `OrderSummary`, `StatsCards`).
- Interactive parts (dropdowns, modals, drawers) are already wired in the HTML (open/close, Esc, overlay click) — copy the interaction contract, not just the look.
- Both **light and dark variants** are in the HTML (`html.dark` class toggles all tokens); one component theme, don't fork per-mode.
- Image placeholders use the thumbnail sizes in §6.3 (square 200/300/500) and the `assets/` photography in `ux-ui/assets/` (hero + product + category JPGs).

---

## 9. Reconciliation with `system-design.md`

All contract gaps identified while writing this UI spec are now folded into `system-design.md`. Status column = where each landed there.

| # | Gap (UI depended on it) | Resolved in `system-design.md` |
|---|-------------------------|--------------------------------|
| 1 | Order-first checkout: `create-session` accepts `{ orderId }`, returns `data.orderId` + `sessionId` | §3.5 `POST /api/checkout/create-session` (request body + response updated) |
| 2 | `GET /api/admin/orders` — `?status=&dateFrom=&dateTo=&page=&limit=` | §3.7 `GET /api/admin/orders` (added) |
| 3 | `GET /api/admin/products` — `?search=&categoryId=&stock=&page=&limit=` | §3.7 `GET /api/admin/products` (added) |
| 4 | Review purchase gate `403` | §3.6 `POST /api/products/:id/reviews` (+ gate note) |
| 5 | `STRIPE_SUCCESS_URL` includes `{CHECKOUT_SESSION_ID}` | §11 env var (updated) |
| 6 | 200×200 review-image thumbnail | §8 Review Images (added) |
| 7 | Order snapshot fields `shipping`/`tax` + cart estimate | §2 `Order` model; §3.3 `GET /api/cart`; §3.4 order responses |
| 8 | Legal status-transition matrix for admin PATCH | §3.4 PATCH `/api/admin/orders/:id/status` (added) |
| 9 | Admin stats keys for all four dashboard cards | §3.7 `GET /api/admin/stats` (added `newUsersThisWeek`, `ordersThisWeek`, `lowStockProducts`) |
| 10 | Built UI binds the spec: brand (Horizon Supply Co.), 4 categories + SKU catalog, `html.dark` theme, `--radius` 10/16px, cart drawer 420px complements `/cart` | This doc §1/§2.1–2.3/§5.6 + `implement-plan.md` §1.5/1.22 · reference: `ux-ui/` HTML |

> **Already satisfied (no change needed):** MIME allow-list `jpg, jpeg, png, webp` was already uniform (§8) · `DELETE /api/cart` · `GET /api/orders` + `?status=` · `GET /api/admin/users` + role PATCH · `GET /api/cart` PATCH/DELETE `403`/`409` · avatar/category 2MB + product/review 5MB limits (§8) · `File.url` serving (all §6.3 rows servable).

---

## Next Step

Both specs are now in agreement; reconciliation items #1–#9 are folded into `system-design.md`, and `implement-plan.md` has been aligned:
- §6 rewritten for the order-first flow (`POST /api/orders` → `POST /api/checkout/create-session` → webhook flips `PENDING → PAID`; webhook no longer creates orders)
- Register DTO/page use a single `name` (spec has no `firstName`/`lastName`)
- `MiniCart` replaced by the `CartDrawer` (single quick-access surface, complements the `/cart` page); category filter is a single-select radio; address fields are `line1/line2/city/state/zip/country`; Order model includes `shipping`/`tax`
- Stripe frontend is hosted-checkout redirect only (no Elements/Card Element)
- **Visual source is the `ux-ui/` HTML reference build** (§8) — React is implemented against it directly, with the Penpot translation step dropped.

Optional (not required for consistency): drop `Role.GUEST` from the `Role` enum — it encodes "logged out", which the UI models via request state, not a DB role.

Optional (not required for consistency): drop `Role.GUEST` from the `Role` enum — it encodes "logged out", which the UI models via request state, not a DB role.
