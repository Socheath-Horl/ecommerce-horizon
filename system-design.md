# E-Commerce System Design (Detailed)

---

## 1. User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **GUEST** | Not logged in | Browse products, view details |
| **CUSTOMER** | Logged in shopper | All guest + cart, checkout, orders, reviews, profile |
| **USER** | Admin portal staff | Dashboard, products, orders, categories (limited) |
| **ADMIN** | Full admin | All user + manage users, full access |

### Role Hierarchy
```
GUEST → CUSTOMER → USER → ADMIN
```

### Product Domain & Seed Content

The storefront (spec + seed data) implements **Horizon Supply Co.** — an everyday-carry / outdoor-lifestyle goods store:
- **Categories:** Outerwear (24), Travel (12), Carry & Desk (18), Drinkware (9) — 63 styles total.
- **Slugs:** `outerwear`, `travel`, `carry-desk`, `drinkware` (URL string used by `GET /api/products?category_id=` and the product-detail breadcrumb).
- **Products** use descriptive slugs matching the `ux-ui/` prototype (waxed-field-jacket, weekender-duffel, trail-mug, …); `is_featured` seeds 8 featured items for the Home grid (all but Steel Bottle 1L and the sold-out Daypack).
- Seed data and any admin UX copy use these names/values verbatim. Visual reference: `ux-ui/` HTML build (see `system-ui-design.md` §8).

---

## 2. Database Schema (Drizzle ORM)

> Defined in `backend/src/db/schema.ts`. PostgreSQL database, `pg` driver + `drizzle-orm`. Primary keys are UUIDv4 (`crypto.randomUUID()` via `uuid().defaultRandom()`) **except `users.id`**, which stores the **Zitadel subject (`sub`)** directly — Zitadel creates it, not the app, so it has no `defaultRandom`. Every column that references a user (`orders.user_id`, `cart_items.user_id`, …) is therefore `text`, not `uuid`. Column prefixes that form compounds use **`snake_case`** (`first_name`, `created_at`) — they mirror the JSON keys returned by the API (§3) 1:1. Enums are real Postgres enums via `pgEnum`. `updated_at` is written by the app on every update (Drizzle has no `@updated_at`).

```typescript
import { relations } from "drizzle-orm";
import {
  boolean, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid,
} from "drizzle-orm/pg-core";

export const role_enum = pgEnum("role", ["GUEST", "CUSTOMER", "USER", "ADMIN"]);
export const order_status_enum = pgEnum("order_status", [
  "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED",
]);

// files before users — despite the bidirectional FK cycle (users.avatar_id ↔
// files.user_id), `PgColumn`-annotated callbacks break TS circular inference so
// BOTH sides stay real DB constraints.
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id").references((): PgColumn => users.id),  // = Zitadel sub
  original_name: text("original_name").notNull(),
  file_name: text("file_name").notNull(),         // stored object name
  mime_type: text("mime_type").notNull(),
  size: integer("size").notNull(),
  bucket: text("bucket").notNull(),               // "ecommerce"
  key: text("key").notNull(),                     // MinIO object key
  url: text("url").notNull(),
  entity_type: text("entity_type"),               // "user" | "product" | "category" | "review"
  entity_id: uuid("entity_id"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),                 // Zitadel `sub` claim — no defaultRandom, Zitadel sets it
  email: text("email").notNull().unique(),     // from Zitadel profile claims on first login
  name: text("name").notNull(),                // from Zitadel profile claims on first login
  role: role_enum("role").notNull().default("CUSTOMER"),  // assigned in OUR admin portal, not Zitadel
  avatar_id: uuid("avatar_id").references((): PgColumn => files.id),  // FK → files.id
  phone: text("phone"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),  // app sets on update
});

// No password column: identity + password live in Zitadel (self-hosted). The app
// never sees a password and never stores a hash.

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  image_id: uuid("image_id").references(() => files.id),  // FK → files.id
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),           // product price today (order items snapshot theirs)
  stock: integer("stock").notNull().default(0),
  is_featured: boolean("is_featured").notNull().default(false),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const product_images = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    file_id: uuid("file_id")
      .notNull()
      .references(() => files.id),
    order: integer("order").notNull().default(0),
  },
  (t) => [t.index(["product_id"]), t.unique(["product_id", "file_id"])],
);

export const cart_items = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),             // = Zitadel sub
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
  },
  (t) => [t.index(["user_id"]), t.unique(["user_id", "product_id"])],
);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),             // = Zitadel sub
  status: order_status_enum("status").notNull().default("PENDING"),
  total: numeric("total").notNull(),
  shipping: numeric("shipping").notNull(),     // snapshot at creation
  tax: numeric("tax").notNull(),               // snapshot at creation
  stripe_session_id: text("stripe_session_id").unique(),
  shipping_address: jsonb("shipping_address").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
```

**Pricing rule (server-computed, never client-side)** — confirmed against the `ux-ui/` reference build (`cart-page.html` renders the same constants: `SHIP_FLAT = 5`, `SHIP_FREE_MIN = 100`, tax 8.25%):
- `sub_total = Σ (OrderItem.price × quantity)`, where `price` is the **product price at order creation** (snapshot against future price changes; orders are never re-priced)
- `shipping = $5.00` flat, **free when sub_total ≥ $100**
- `tax = sub_total × 0.0825` (state rate, fixed for v1)
- `total = sub_total + shipping + tax`

`Order.shipping`, `Order.tax`, and `Order.total` are written once at creation (`POST /api/orders`) and returned thereafter by every order-reading endpoint. `GET /api/cart` returns the same computation as live estimates so cart and checkout totals can render before the order exists.

```typescript
export const order_items = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  product_id: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),           // product price snapshot at order creation
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  stripe_id: text("stripe_id").notNull().unique(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  card_brand: text("card_brand"),
  card_last_4: text("card_last_4"),
  status: text("status").notNull(),            // "succeeded" etc.
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id),             // = Zitadel sub
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id),
    rating: integer("rating").notNull(),       // 1-5
    comment: text("comment"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [t.index(["product_id"]), t.unique(["user_id", "product_id"])],
);

export const review_images = pgTable(
  "review_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    review_id: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    file_id: uuid("file_id")
      .notNull()
      .references(() => files.id),
  },
  (t) => [t.index(["review_id"]), t.unique(["review_id", "file_id"])],
);

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id),             // = Zitadel sub
  label: text("label").notNull(),              // "Home", "Work", ...
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull().default("US"),
  is_default: boolean("is_default").notNull().default(false),
});

// Relations (for `db.query.*` with `with: { ... }` joins)
export const user_relations = relations(users, ({ one, many }) => ({
  avatar: one(files, { fields: [users.avatar_id], references: [files.id] }),
  cart_items: many(cart_items),
  orders: many(orders),
  reviews: many(reviews),
  addresses: many(addresses),
  files: many(files),
}));
export const file_relations = relations(files, ({ one, many }) => ({
  user: one(users, { fields: [files.user_id], references: [users.id] }),
  product_images: many(product_images),
  review_images: many(review_images),
}));
export const product_relations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.category_id], references: [categories.id] }),
  images: many(product_images),
  cart_items: many(cart_items),
  order_items: many(order_items),
  reviews: many(reviews),
}));
export const category_relations = relations(categories, ({ one, many }) => ({
  image: one(files, { fields: [categories.image_id], references: [files.id] }),
  products: many(products),
}));
export const cart_item_relations = relations(cart_items, ({ one }) => ({
  user: one(users, { fields: [cart_items.user_id], references: [users.id] }),
  product: one(products, { fields: [cart_items.product_id], references: [products.id] }),
}));
export const order_relations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.user_id], references: [users.id] }),
  items: many(order_items),
  payments: many(payments),
}));
export const order_item_relations = relations(order_items, ({ one }) => ({
  order: one(orders, { fields: [order_items.order_id], references: [orders.id] }),
  product: one(products, { fields: [order_items.product_id], references: [products.id] }),
}));
export const payment_relations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.order_id], references: [orders.id] }),
}));
export const review_relations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.user_id], references: [users.id] }),
  product: one(products, { fields: [reviews.product_id], references: [products.id] }),
  images: many(review_images),
}));
export const review_image_relations = relations(review_images, ({ one }) => ({
  review: one(reviews, { fields: [review_images.review_id], references: [reviews.id] }),
  file: one(files, { fields: [review_images.file_id], references: [files.id] }),
}));
export const address_relations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.user_id], references: [users.id] }),
}));
```

---

## 3. API Endpoints (Detailed)

---

### 3.1 Auth (Zitadel OIDC)

Authentication is delegated to a **self-hosted Zitadel** instance using **Authorization Code + PKCE**. The SPA redirects to Zitadel's hosted login page; Zitadel owns passwords, MFA, sessions, and self-registration. **The API never receives a password and never stores one.**

- `users.id` = the Zitadel **`sub`** claim (see schema §2). No app-generated UUID mapping needed.
- First authenticated contact (`GET /api/users/me`) **upserts** the user row from the verified token's claims (`sub`, `email`, `name`), defaulting `role` to `CUSTOMER`.
- **Roles are assigned by us** (admin portal, `PUT /api/admin/users/:id/role` — §3.7) and live in our `users.role` column; Zitadel only authenticates who the user is.
- Backend turns away any request that is not a signed Zitadel token (see §9 — validation via Zitadel's JWKS).

#### GET `/api/auth/config` (public)
```typescript
// Response 200
{
  success: true,
  data: {
    issuer: string          // e.g. http://localhost:8080
    client_id: string        // Zitadel SPA application client ID
    redirect_uri: string     // e.g. http://localhost:5173/auth/callback
    scopes: string[]        // ["openid", "profile", "email"]
    end_session_uri: string   // Zitadel logout endpoint
  }
}
```
The SPA fetches this on boot so the OIDC settings aren't hardcoded on the client.

#### Sign-in flow (no login endpoint of ours)
```
1. SPA → GET /api/auth/config → Zitadel authorize URL:
   {issuer}/oauth/v2/authorize?
     client_id={client_id}
     &redirect_uri={redirect_uri}
     &scope=openid profile email
     &response_type=code
     &state={random}
     &nonce={random}
     &code_challenge={S256(pkce_verifier)}
     &code_challenge_method=S256          // verifier kept in sessionStorage, never sent
2. User signs in on Zitadel's hosted page (password, MFA, social, self-register).
3. Zitadel → 302 {redirect_uri}?code={code}&state={state}
4. SPA POST {issuer}/oauth/v2/token
   grant_type=authorization_code | client_id | code | redirect_uri | code_verifier
   → { access_token, refresh_token, id_token }
5. Storage: access token in memory (Redux), refresh token in localStorage.
6. SPA → GET /api/users/me with `Authorization: Bearer <access_token>`
   → backend verifies token (JWKS), upserts `users` by `sub`, returns profile.
```

#### POST `/api/auth/logout` (protected)
```typescript
// Headers
Authorization: Bearer <access_token>       // only proves a valid session exists

// Response 200
{
  success: true,
  message: "Logged out successfully"
}

// Errors
401 - Unauthorized
```
Backend is stateless — it just returns OK. The SPA then clears its stored tokens and redirects to Zitadel's end-session endpoint:
`{end_session_uri}?id_token_hint={id_token}&post_logout_redirect_uri={frontend_url}`.

#### Token refresh (no endpoint of ours)
- The SPA refreshes **directly with Zitadel**: `POST {issuer}/oauth/v2/token` with `grant_type=refresh_token&refresh_token={...}&client_id={...}`.
- On boot / hard refresh, session restore = refresh grant → new access token → `GET /api/users/me`.
- `401` (expired/invalid refresh token) → SPA redirects to sign-in.

#### Passwords & security
- Change-password, forgot-password, MFA, and admin user creation are handled **inside Zitadel** (its end-user UI / console). There is **no** `change-password` API endpoint and no password column.

---

### 3.2 Products

#### GET `/api/products`
```typescript
// Query Params
?search=string        // search by name
?category_id=string    // filter by category
?min_price=number      // min price
?max_price=number      // max price
?rating=number        // min rating
?page=number          // default 1
?limit=number         // default 12, max 50
?sort=string          // "price_asc" | "price_desc" | "newest" | "popular"

// Response 200
{
  success: true,
  data: [{
    id, name, slug, price, images[0], stock,
    category: { id, name, slug },
    _avg: { rating: number },
    _count: { reviews: number }
  }],
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
```

#### GET `/api/products/:slug`
```typescript
// Response 200
{
  success: true,
  data: {
    id, name, slug, description, price, images, stock,
    category: { id, name, slug },
    reviews: [{
      id, rating, comment, created_at,
      user: { id, name, avatar }
    }],
    _avg: { rating: number },
    _count: { reviews: number }
  }
}

// Errors
404 - Product not found
```

#### POST `/api/products` (Admin)
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Request
{
  name: string
  description: string
  price: number
  category_id: string
  stock: number
  image_ids: string[]    // max 5 file IDs (upload files first via /api/files/upload)
}

// Response 201
{
  success: true,
  data: {
    id, name, slug, description, price, stock, category_id, created_at,
    images: [{ id, url, order }]
  }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not admin portal user
404 - File not found
```

#### PATCH `/api/products/:id` (Admin)
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Request
{
  name?: string
  description?: string
  price?: number
  category_id?: string
  stock?: number
  image_ids?: string[]   // replace all images with these
}

// Response 200
{
  success: true,
  data: {
    id, name, slug, description, price, stock, category_id, updated_at,
    images: [{ id, url, order }]
  }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not admin portal user
404 - Product not found
404 - File not found
```

#### DELETE `/api/products/:id` (Admin)
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Response 200
{
  success: true,
  message: "Product deleted successfully"
}

// Errors
401 - Unauthorized
403 - Not admin portal user
404 - Product not found
```

#### GET `/api/categories`
```typescript
// Response 200
{
  success: true,
  data: [{
    id, name, slug, image,
    _count: { products: number }
  }]
}
```

#### POST `/api/categories` (Admin)
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Request
{
  name: string       // required, unique
  file_id?: string    // optional, upload file first via /api/files/upload
}

// Response 201
{
  success: true,
  data: { id, name, slug, image: { id, url } }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not admin portal user
409 - Category name exists
404 - File not found
```

#### PATCH `/api/categories/:id` (Admin)
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Request
{
  name?: string
  file_id?: string
}

// Response 200
{
  success: true,
  data: { id, name, slug, image: { id, url }, updated_at }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not admin portal user
404 - Category not found
404 - File not found
409 - Name already exists
```

#### DELETE `/api/categories/:id` (Admin)
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Response 200
{
  success: true,
  message: "Category deleted"
}

// Errors
401 - Unauthorized
403 - Not admin portal user
404 - Category not found
409 - Category has products
```

---

### 3.3 Cart

#### GET `/api/cart`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  data: {
    items: [{
      id,
      quantity,
      product: { id, name, slug, price, images[0], stock }
    }],
    sub_total: number,
    shipping: number,   // estimate (same pricing rule as order creation)
    tax: number,        // estimate
    total: number       // sub_total + shipping + tax
  }
}

// Errors
401 - Unauthorized
```

#### POST `/api/cart`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  product_id: string  // required
  quantity: number   // required, min 1
}

// Response 201
{
  success: true,
  data: {
    id,
    quantity,
    product: { id, name, slug, price, images[0] }
  }
}

// Errors
400 - Validation error
401 - Unauthorized
404 - Product not found
409 - Item already in cart (use PATCH)
```

#### PATCH `/api/cart/:id`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  quantity: number  // required, min 1
}

// Response 200
{
  success: true,
  data: {
    id,
    quantity,
    product: { id, name, price, images[0] }
  }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not cart owner
404 - Cart item not found
409 - Stock exceeded
```

#### DELETE `/api/cart/:id`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  message: "Item removed from cart"
}

// Errors
401 - Unauthorized
403 - Not cart owner
404 - Cart item not found
```

#### DELETE `/api/cart`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  message: "Cart cleared"
}

// Errors
401 - Unauthorized
```

---

### 3.4 Orders

#### POST `/api/orders`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  shipping_address: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
}

// Response 201
{
  success: true,
  data: {
    id,
    status: "PENDING",
    total,
    shipping,   // snapshot, computed at creation (delta: extends Order model)
    tax,        // snapshot, computed at creation
    shipping_address,
    items: [{
      id, quantity, price,
      product: { id, name, images[0] }
    }],
    created_at
  }
}

// Errors
400 - Validation error
400 - Cart is empty
401 - Unauthorized
```

#### GET `/api/orders`
```typescript
// Headers
Authorization: Bearer <access_token>

// Query Params
?page=number
?limit=number
?status=OrderStatus

// Response 200
{
  success: true,
  data: [{
    id, status, total, shipping, tax, created_at,
    items: [{ quantity, product: { name, images[0] } }]
  }],
  pagination: { page, limit, total, total_pages }
}

// Errors
401 - Unauthorized
```

#### GET `/api/orders/:id`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  data: {
    id, status, total, shipping, tax, shipping_address, created_at,
    items: [{
      id, quantity, price,
      product: { id, name, slug, images[0] }
    }],
    payment: {
      card_brand: string
      card_last_4: string
    }
  }
}

// Errors
401 - Unauthorized
403 - Not order owner
404 - Order not found
```

#### PATCH `/api/admin/orders/:id/status` (Admin)
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Request
{
  status: OrderStatus  // PENDING | PAID | SHIPPED | DELIVERED | CANCELLED
}

// Response 200
{
  success: true,
  data: {
    id, status, updated_at
  }
}

// Errors
400 - Invalid status transition
401 - Unauthorized
403 - Not admin portal user
404 - Order not found
```

**Legal status transitions (enforced by `400 Invalid status transition`):**
```
PENDING   → PAID | CANCELLED
PAID      → SHIPPED | CANCELLED
SHIPPED   → DELIVERED | CANCELLED
DELIVERED → (terminal)
CANCELLED → (terminal)
```
`PENDING → PAID` is normally applied by the Stripe webhook, not the admin endpoint.

---

### 3.5 Checkout

#### POST `/api/checkout/create-session`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  order_id: string  // order created via POST /api/orders (status PENDING)
}

// Response 200
{
  success: true,
  data: {
    order_id: string
    session_id: string
    url: string  // Stripe checkout URL
  }
}

// Errors
401 - Unauthorized
400 - Order not found or not PENDING
```

#### POST `/api/webhook/stripe`
```typescript
// Headers
Stripe-Signature: string  // Stripe webhook signature

// Request
// Stripe event object (checkout.session.completed)

// Response 200
// Updates order status to PAID

// Errors
400 - Invalid signature
```

---

### 3.6 Reviews

#### GET `/api/products/:id/reviews`
```typescript
// Query Params
?page=number
?limit=number

// Response 200
{
  success: true,
  data: [{
    id, rating, comment, created_at,
    user: { id, name, avatar },
    images: [{ id, url }]
  }],
  _avg: { rating: number },
  _count: { reviews: number },
  pagination: { page, limit, total, total_pages }
}
```

#### POST `/api/products/:id/reviews`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  rating: number     // required, 1-5
  comment?: string   // optional, max 500 chars
  image_ids?: string[] // optional, upload files first via /api/files/upload, max 5
}

// Response 201
{
  success: true,
  data: {
    id, rating, comment, created_at,
    user: { id, name, avatar },
    images: [{ id, url }]
  }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not purchased (order must be PAID/DELIVERED and contain the product)
404 - Product not found
404 - File not found
409 - Already reviewed this product
```

> **Purchase gate:** `POST /api/products/:id/reviews` verifies the authenticated user has a `PAID` or `DELIVERED` order containing the product before accepting a review; otherwise `403`.

#### DELETE `/api/reviews/:id`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  message: "Review deleted"
}

// Errors
401 - Unauthorized
403 - Not review owner or admin
404 - Review not found
```

---

### 3.7 Admin

#### GET `/api/admin/stats`
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Response 200
{
  success: true,
  data: {
    total_revenue: number
    total_orders: number
    total_users: number
    total_products: number
    new_users_this_week: number
    orders_this_week: number
    low_stock_products: number   // products with stock ≤ 5
    recent_orders: [{
      id, total, status, created_at,
      user: { name }
    }],
    sales_by_day: [{
      date: string
      revenue: number
    }]
  }
}

// Errors
401 - Unauthorized
403 - Not admin portal user
```

#### GET `/api/admin/products`
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Query Params
?search=string          // search by name
?category_id=string      // filter by category
?stock=string           // "in_stock" | "out_of_stock" | "low" (low = stock ≤ 5)
?page=number
?limit=number

// Response 200
{
  success: true,
  data: [{
    id, name, slug, description, price, stock,
    category: { id, name, slug },
    images: [{ id, url, order }],
    created_at, updated_at
  }],
  pagination: { page, limit, total, total_pages }
}

// Errors
401 - Unauthorized
403 - Not admin portal user
```

#### GET `/api/admin/orders`
```typescript
// Headers
Authorization: Bearer <access_token>
Role: USER | ADMIN

// Query Params
?status=OrderStatus
?date_from=string   // ISO date
?date_to=string     // ISO date
?page=number
?limit=number

// Response 200
{
  success: true,
  data: [{
    id, status, total, shipping, tax, created_at,
    user: { id, name, email },
    items: [{ quantity, product: { name, images[0] } }]
  }],
  pagination: { page, limit, total, total_pages }
}

// Errors
401 - Unauthorized
403 - Not admin portal user
```

#### GET `/api/admin/users`
```typescript
// Headers
Authorization: Bearer <access_token>
Role: ADMIN  // Only ADMIN can manage users

// Query Params
?page=number
?limit=number
?search=string
?role=Role   // filter by role

// Response 200
{
  success: true,
  data: [{
    id, name, email, role, created_at,
    _count: { orders: number }
  }],
  pagination: { page, limit, total, total_pages }
}

// Errors
401 - Unauthorized
403 - Not admin
```

#### PUT `/api/admin/users/:id/role`
```typescript
// Headers
Authorization: Bearer <access_token>
Role: ADMIN  // Only ADMIN can change roles

// Request
{
  role: Role  // CUSTOMER | USER | ADMIN
}

// Response 200
{
  success: true,
  data: {
    id, name, email, role
  }
}

// Errors
400 - Cannot promote above your level
401 - Unauthorized
403 - Not admin
404 - User not found
```

---

### 3.8 Users

#### GET `/api/users/me`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  data: {
    id, name, email, phone, avatar, role, created_at,   // id = Zitadel sub; role from our DB
    addresses: [{ id, label, line1, city, state, zip, is_default }]
  }
}

// Notes
- First call for a new `sub` **upserts** `users` from the verified token claims (email/name, role = CUSTOMER).
- `role` determines client routing (GUEST/CUSTOMER/USER/ADMIN); refresh it after admin assigns a role.

// Errors
401 - Unauthorized
```

#### PATCH `/api/users/me`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  name?: string
  phone?: string
  avatar_id?: string   // upload file first via /api/files/upload
}

// Response 200
{
  success: true,
  data: {
    id, name, email, phone,
    avatar: { id, url }
  }
}

// Errors
400 - Validation error
401 - Unauthorized
404 - File not found
```

#### POST `/api/users/me/address`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  label: string      // "Home", "Work", etc.
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country?: string   // default "US"
  is_default?: boolean
}

// Response 201
{
  success: true,
  data: {
    id, label, line1, line2, city, state, zip, country, is_default
  }
}

// Errors
400 - Validation error
401 - Unauthorized
```

#### PATCH `/api/users/me/address/:id`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  label?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  is_default?: boolean
}

// Response 200
{
  success: true,
  data: {
    id, label, line1, line2, city, state, zip, country, is_default
  }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not address owner
404 - Address not found
```

#### DELETE `/api/users/me/address/:id`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  message: "Address deleted"
}

// Errors
401 - Unauthorized
403 - Not address owner
404 - Address not found
```

---

### 3.9 Files

#### POST `/api/files/upload`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request (multipart/form-data)
file: File           // required, max 5MB
entity_type?: string  // "user" | "product" | "category" | "review"
entity_id?: string    // ID of entity to link

// Response 201
{
  success: true,
  data: {
    id,
    original_name,
    file_name,
    mime_type,
    size,
    url,
    entity_type,
    entity_id,
    created_at
  }
}

// Errors
400 - Validation error (file type/size)
401 - Unauthorized
404 - Entity not found
```

#### POST `/api/files/upload/multiple`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request (multipart/form-data)
files: File[]        // required, max 5 files, max 5MB each
entity_type?: string
entity_id?: string

// Response 201
{
  success: true,
  data: [{
    id, original_name, file_name, mime_type, size, url, entity_type, entity_id
  }]
}

// Errors
400 - Validation error
401 - Unauthorized
```

#### GET `/api/files`
```typescript
// Headers
Authorization: Bearer <access_token>

// Query Params
?entity_type=string   // filter by entity type
?entity_id=string     // filter by entity ID
?page=number
?limit=number

// Response 200
{
  success: true,
  data: [{
    id, original_name, file_name, mime_type, size, url, entity_type, entity_id, created_at
  }],
  pagination: { page, limit, total, total_pages }
}

// Errors
401 - Unauthorized
```

#### GET `/api/files/:id`
```typescript
// Response 200
{
  success: true,
  data: {
    id, original_name, file_name, mime_type, size, url, entity_type, entity_id, created_at
  }
}

// Errors
404 - File not found
```

#### DELETE `/api/files/:id`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  message: "File deleted"
}

// Errors
401 - Unauthorized
403 - Not file owner or admin
404 - File not found
```

#### PUT `/api/files/:id/link`
```typescript
// Headers
Authorization: Bearer <access_token>

// Request
{
  entity_type: string  // "user" | "product" | "category" | "review"
  entity_id: string    // ID of entity to link
}

// Response 200
{
  success: true,
  data: {
    id, entity_type, entity_id
  }
}

// Errors
400 - Validation error
401 - Unauthorized
403 - Not file owner or admin
404 - File not found
404 - Entity not found
```

#### PUT `/api/files/:id/unlink`
```typescript
// Headers
Authorization: Bearer <access_token>

// Response 200
{
  success: true,
  data: {
    id, entity_type: null, entity_id: null
  }
}

// Errors
401 - Unauthorized
403 - Not file owner or admin
404 - File not found
```

---

## 4. Frontend State Structure

### Redux Store
```typescript
{
  auth: {
    user: { id, name, email, role, avatar }
    access_token: string
    refresh_token: string
    is_authenticated: boolean
  },
  cart: {
    items: [{ product_id, name, price, image, quantity }]
    total: number
  },
  ui: {
    is_cart_open: boolean
    is_mobile_menu_open: boolean
    theme: 'light' | 'dark'
  }
}
```

### Token Storage Strategy
```
Access Token:  In-memory (Redux state) - cleared on refresh
Refresh Token: localStorage - persists across sessions

Why:
- Access token in memory = secure (not accessible via XSS)
- Refresh token in localStorage = persistent (user stays logged in)
- On app load: check localStorage for refresh token → get new access token
```

### RTK Query Endpoints
```typescript
auth_api:        get_auth_config, logout   // sign-in/refresh run in the SPA against Zitadel (OIDC + PKCE, §3.1)
products_api:    get_products, get_product, create_product, update_product, delete_product
categories_api:  get_categories, create_category, update_category, delete_category
cart_api:        get_cart, add_to_cart, update_cart_item, remove_from_cart, clear_cart
orders_api:      create_order, get_orders, get_order
reviews_api:     get_product_reviews, create_review, delete_review
admin_api:       get_stats, get_users
users_api:       get_profile, update_profile, add_address, update_address, delete_address
files_api:       upload_file, upload_multiple, get_files, get_file, delete_file, link_file, unlink_file
```

---

## 5. Component Tree

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── SearchBar (pill, radius-full)
│   │   ├── CartIcon (with badge) → opens CartDrawer
│   │   ├── UserMenu (dropdown, 236px)
│   │   └── MobileMenu (320px left slide-out)
│   ├── Sidebar (admin only)
│   └── Footer
│
├── Pages
│   ├── Home
│   │   ├── HeroBanner
│   │   ├── CategoryGrid
│   │   └── ProductGrid
│   │
│   ├── Products
│   │   ├── FilterSidebar
│   │   ├── SortSelect
│   │   ├── ProductGrid
│   │   └── Pagination
│   │
│   ├── ProductDetail
│   │   ├── ImageGallery
│   │   ├── ProductInfo
│   │   ├── QuantitySelector
│   │   ├── ReviewSection
│   │   │   ├── StarRating
│   │   │   ├── ReviewForm
│   │   │   └── ReviewList → ReviewCard (+ ReviewImages)
│   │   └── RelatedProducts
│   │
│   ├── Cart
│   │   ├── CartItem
│   │   └── OrderSummary
│   │
│   ├── Checkout
│   │   ├── AddressForm
│   │   ├── PaymentForm (Stripe hosted redirect)
│   │   └── OrderSummary
│   │
│   ├── Profile
│   │   ├── UserInfo
│   │   ├── AddressList
│   │   └── Security (links to Zitadel password/MFA)
│   │
│   ├── Orders
│   │   ├── OrderList
│   │   └── OrderDetail
│   │
│   └── Auth
│       ├── SignInCard (redirects to Zitadel authorize URL)
│       └── CallbackPage (PKCE code exchange, one-shot)
│
├── Components
│   ├── CartDrawer (right slide-over, min 420px; shared by Header across all customer pages)
│   ├── FileUpload
│   │   ├── SingleUpload
│   │   └── MultiUpload
│   ├── ImageGallery
│   ├── Pagination
│   ├── SearchBar
│   ├── OrderStatusBadge (status ⇄ color-chip mapping, 5 states)
│   ├── Breadcrumb
│   └── Toast
│
└── Admin
    ├── Dashboard
    │   ├── StatsCards
    │   ├── SalesChart
    │   └── RecentOrders
    ├── ProductManagement
    │   └── ProductTable
    ├── CategoryManagement
    │   └── CategoryTable
    ├── OrderManagement
    │   └── OrderTable
    └── UserManagement
        └── UserTable
```

> Visual contract for every named component = the matching section in `ux-ui/` (see `system-ui-design.md` §8). `CartDrawer` replaces any standalone hover-`MiniCart`; the full `/cart` page and the drawer share `CartItem`/`OrderSummary`.

---

## 6. Build Phases

| Phase | Features | Est. Time | Dependencies |
|-------|----------|-----------|--------------|
| **1** | Project setup, DB schema, Auth + Password, MinIO | 2-3 days | — |
| **2** | User Management (Admin: list, roles) | 1-2 days | Phase 1 |
| **3** | Products + Categories CRUD | 2-3 days | Phase 2 |
| **4** | File upload service + entity linking | 1 day | Phase 2, 3 |
| **5** | Cart functionality | 1-2 days | Phase 3 |
| **6** | Checkout + Stripe | 2-3 days | Phase 5 |
| **7** | Orders + Profile | 2 days | Phase 6 |
| **8** | Reviews (with images) | 1 day | Phase 3, 4 |
| **9** | Admin Dashboard | 2-3 days | Phase 7 |
| **10** | Polish + Responsive | 2-3 days | All |

**Total: ~16-22 days**

---

## 7. API Standards

### Response Format
```typescript
// Success
{
  success: true
  data: T
  message?: string
}

// Error
{
  success: false
  error: {
    code: string        // "VALIDATION_ERROR", "NOT_FOUND", etc.
    message: string     // Human-readable message
    details?: any       // Additional error info
  }
}

// Paginated
{
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}
```

### Status Codes
| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Unprocessable entity |
| 500 | Server error |

---

## 8. File Storage Strategy

### Storage: MinIO (S3-compatible)

### Bucket Structure
```
ecommerce/
├── products/       # Product images
├── avatars/        # User avatars
├── categories/     # Category images
├── reviews/        # Review reference images
└── thumbnails/     # Generated thumbnails
```

### Product Images
```
Bucket: ecommerce
Key: products/{product_id}/{filename}
URL: {MINIO_ENDPOINT}/{bucket}/products/{product_id}/{filename}

Limits:
- Max 5MB per image
- Max 5 images per product
- Types: jpg, jpeg, png, webp
- Thumbnails: 200x200, 500x500 (auto-generated)
```

### User Avatars
```
Bucket: ecommerce
Key: avatars/{user_id}/{filename}
URL: {MINIO_ENDPOINT}/{bucket}/avatars/{user_id}/{filename}

Limits:
- Max 2MB
- Types: jpg, jpeg, png, webp
- Thumbnail: 100x100 (auto-generated)
```

### Category Images
```
Bucket: ecommerce
Key: categories/{filename}
URL: {MINIO_ENDPOINT}/{bucket}/categories/{filename}

Limits:
- Max 2MB
- Types: jpg, jpeg, png, webp
- Thumbnail: 300x300 (auto-generated)
```

### Review Images
```
Bucket: ecommerce
Key: reviews/{review_id}/{filename}
URL: {MINIO_ENDPOINT}/{bucket}/reviews/{review_id}/{filename}

Limits:
- Max 5MB per image
- Max 5 images per review
- Types: jpg, jpeg, png, webp
- Thumbnail: 200x200 (auto-generated)
```

### Express MinIO Config
```typescript
// minio.config.ts
{
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
}

// Bucket policy (public read)
{
  Version: '2012-10-17',
  Statement: [{
    Effect: 'Allow',
    Principal: { AWS: ['*'] },
    Action: ['s3:GetObject'],
    Resource: ['arn:aws:s3:::ecommerce/*']
  }]
}
```

### Upload Service
```typescript
// services/minio.service.ts (plus utils/http-error.ts)
import { db, files } from "../db";
import { http_error } from "../utils/http-error";

async upload_file(
  file: Express.Multer.File,
  user_id: string,
  entity_type?: string,
  entity_id?: string
): Promise<typeof files.$inferSelect> {
  // Build folder path based on entity type
  let folder = 'uploads';
  if (entity_type === 'product') folder = 'products';
  else if (entity_type === 'avatar') folder = 'avatars';
  else if (entity_type === 'category') folder = 'categories';
  else if (entity_type === 'review') folder = 'reviews';

  // For review images, include entity_id in path
  const key = entity_id
    ? `${folder}/${entity_id}/${crypto.randomUUID()}${extname(file.originalname)}`
    : `${folder}/${crypto.randomUUID()}${extname(file.originalname)}`;

  await this.minio_client.putObject(
    'ecommerce',
    key,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );

  const url = `${this.minio_endpoint}/ecommerce/${key}`;

  const [created] = await db.insert(files).values({
    user_id,
    original_name: file.originalname,
    file_name: `${crypto.randomUUID()}${extname(file.originalname)}`,
    mime_type: file.mimetype,
    size: file.size,
    bucket: 'ecommerce',
    key,
    url,
    entity_type,
    entity_id,
  }).returning();
  return created;
}

async delete_file(file_id: string): Promise<void> {
  const [file] = await db.select().from(files).where(eq(files.id, file_id)).limit(1);
  if (!file) throw http_error(404, 'File not found');

  await this.minio_client.removeObject(file.bucket, file.key);
  await db.delete(files).where(eq(files.id, file_id));
}

async link_to_entity(file_id: string, entity_type: string, entity_id: string) {
  const [linked] = await db.update(files)
    .set({ entity_type, entity_id })
    .where(eq(files.id, file_id))
    .returning();
  return linked;
}
```

### Environment Variables
```bash
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=ecommerce
MINIO_USE_SSL=false
```

### Local MinIO Setup
```bash
# Download MinIO (Windows)
# https://min.io/docs/minio/windows/index.html

# Start MinIO server
minio server /data --console-address ":9001"

# Access Console
# http://localhost:9001
# Login: minioadmin / minioadmin

# Create bucket via console or mc client
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/ecommerce
mc anonymous set public local/ecommerce
```

### Local Zitadel Setup (self-hosted, Docker)
> **Zitadel v4+** (image `ghcr.io/zitadel/zitadel:latest`). Two gotchas vs. older docs: there is no `--setup` flag anymore — use `start-from-init`; and inside the container `localhost` is the container itself, so the Postgres host must be `host.docker.internal`.

```bash
# 1. Create the Zitadel role + database on your local Postgres (run once) — start-from-init will NOT create them itself when using a DSN
docker exec postgres psql -U postgres -c "CREATE ROLE zitadel LOGIN PASSWORD 'zitadel' SUPERUSER;"
docker exec postgres psql -U postgres -c "CREATE DATABASE zitadel OWNER zitadel;"

# 2. Start Zitadel (v4 — the masterkey MUST be supplied via --masterkeyFromEnv + ZITADEL_MASTERKEY)
docker run -d --name zitadel \
  -p 8080:8080 \
  --hostname zitadel \
  -e ZITADEL_MASTERKEY=MasterkeyNeedsToHave32Characters \
  -e ZITADEL_DATABASE_POSTGRES_DSN="postgresql://zitadel:zitadel@host.docker.internal:5432/zitadel?sslmode=disable" \
  -e ZITADEL_EXTERNALSECURE=false \
  -e ZITADEL_FIRSTINSTANCE_ORG_HUMAN_USERNAME=admin \
  -e ZITADEL_FIRSTINSTANCE_ORG_HUMAN_PASSWORD=Admin123! \
  ghcr.io/zitadel/zitadel:latest start-from-init --masterkeyFromEnv --tlsMode disabled

# 3. Wait until discovery responds (first boot runs DB migrations, takes a minute+)
Invoke-WebRequest -Uri 'http://localhost:8080/.well-known/openid-configuration' -UseBasicParsing  # → 200

# 4. Console: http://localhost:8080/ui/console  (sign in admin / Admin123!)
#    1. Create project → add application (OIDC, application type SPA)
#    2. Set redirect URI to http://localhost:5173/auth/callback
#    3. Copy the Client ID (SPA application) → set as ZITADEL_CLIENT_ID in backend .env
#    4. No client secret needed — SPA uses PKCE (public client)

# Stop / remove later (data lives in Postgres — safe to recreate)
docker stop zitadel
docker rm -f zitadel
```

---

## 9. Security Config

### CORS
```typescript
{
  origin: [
    'http://localhost:5173',
    'https://yourdomain.com'
  ],
  credentials: true
}
```

### Rate Limiting
```
Auth routes:   5 req / 15 min (per IP)
Cart/Orders:   30 req / 1 min (per user)
Products GET:  100 req / 1 min (per IP)
Admin routes:  60 req / 1 min (per user)
```

### Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### Token Validation
- `require_auth` middleware uses `jose`'s `createRemoteJWKSet` against Zitadel's JWKS endpoint (`{issuer}/.well-known/openid-configuration` → `jwks_uri`).
- Verifies `exp`, `aud` (must match our client ID), and `iss` (must match `ZITADEL_ISSUER`).
- Extracts `sub` as `user_id` — no DB lookup on every request; the token is the identity proof.
- Sets `req.user_id = payload.sub`, `req.user = { sub, email, name }` (from verified token claims).

### Input Validation
- `zod` schemas (`*.schema.ts`) validated by a shared `validate(schema)` middleware
- Sanitize HTML in user input
- Validate query params (`validate(schema, 'query')`)

---

## 10. Error Handling

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | No/invalid token |
| FORBIDDEN | 403 | Wrong permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate |
| STOCK_EXCEEDED | 409 | Out of stock |
| PAYMENT_FAILED | 422 | Stripe error |
| INTERNAL_ERROR | 500 | Server error |

### Database Errors
| Postgres error | HTTP | Description |
|---------------|------|-------------|
| Error code `23505` (unique_violation) | 409 | Duplicate (email, slug, name) → `CONFLICT` |
| Error code `23503` (foreign_key_violation) | 400 | Invalid reference → `VALIDATION_ERROR` |
| Invalid enum / `22P02` | 400 | Bad value → `VALIDATION_ERROR` |
| Driver: connect/auth refused | 500 | `INTERNAL_ERROR` |

> Unlike Prisma (which threw `P2025`), Drizzle's `select().limit(1)` / `update().returning()` return an **empty array or `undefined`** when nothing matches — wrap with a `find_or_404`/`get_or_404` helper that throws `http_error(404, 'Not found')`. There is no "not found" DB error to catch; it is an application-level check in the service layer.

---

## 11. Environment Variables

### Backend (.env)
```bash
PORT=3000
API_PREFIX=api
DATABASE_URL="postgresql://user:pass@localhost:5432/horizon-ecommerce"
ZITADEL_ISSUER=http://localhost:8080        # self-hosted Zitadel instance
ZITADEL_CLIENT_ID=your-spa-client-id        # from Zitadel console → App → SPA OIDC
ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_SUCCESS_URL=http://localhost:5173/order/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=http://localhost:5173/cart
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=ecommerce
MINIO_USE_SSL=false
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```
OIDC issuer/client_id/redirect_uri are **not** hardcoded — the SPA fetches them from `GET /api/auth/config` on boot (§3.1).

---

## 12. Testing Strategy

### Backend (Express)
| Type | Tool | Scope |
|------|------|-------|
| Unit | Jest | Services, utils, middleware |
| Integration | Jest + Supertest | Routers, endpoints |
| E2E | Jest + Supertest | Full API flows |

### Frontend (React)
| Type | Tool | Scope |
|------|------|-------|
| Unit | Vitest | Components, hooks, utils |
| Integration | Vitest + RTL | Component interactions |
| E2E | Playwright | Critical user flows |

### Key Test Cases
```
Auth:      OIDC redirect, PKCE code exchange, JWKS token validation, first-login upsert, logout + end-session
Roles:     GUEST→CUSTOMER, USER admin access, ADMIN user management
Products:  CRUD, filter, search, pagination
Cart:      add, update, remove, stock limits
Orders:    create, payment webhook, status transitions
Reviews:   CRUD, image upload
Admin:     role-based access, dashboard stats, user role management
Files:     upload, delete, link/unlink to entities
```
