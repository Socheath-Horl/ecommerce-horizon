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
- **Slugs:** `outerwear`, `travel`, `carry-desk`, `drinkware` (URL string used by `GET /api/products?categoryId=` and the product-detail breadcrumb).
- **Products** use SKU-style slugs (e.g. FLT-04 waxed field jacket, WKD-09 weekender duffel, FLK-24 stainless flask); `isFeatured` seeds ~8 featured items for the Home grid.
- Seed data and any admin UX copy use these names/values verbatim. Visual reference: `ux-ui/` HTML build (see `system-ui-design.md` §8).

---

## 2. Database Schema (Drizzle ORM)

> Defined in `backend/src/db/schema.ts`. PostgreSQL database, `pg` driver + `drizzle-orm`. Primary keys are UUIDv4 (`crypto.randomUUID()` via `uuid().defaultRandom()`) **except `users.id`**, which stores the **Zitadel subject (`sub`)** directly — Zitadel creates it, not the app, so it has no `defaultRandom`. Every column that references a user (`orders.userId`, `cartItems.userId`, …) is therefore `text`, not `uuid`. Column names are **camelCase on purpose** — they mirror the JSON keys returned by the API (§3) 1:1. Enums are real Postgres enums via `pgEnum`. `updatedAt` is written by the app on every update (Drizzle has no `@updatedAt`).

```typescript
import { relations } from "drizzle-orm";
import {
  boolean, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["GUEST", "CUSTOMER", "USER", "ADMIN"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),                 // Zitadel `sub` claim — no defaultRandom, Zitadel sets it
  email: text("email").notNull().unique(),     // from Zitadel profile claims on first login
  name: text("name").notNull(),                // from Zitadel profile claims on first login
  role: roleEnum("role").notNull().default("CUSTOMER"),  // assigned in OUR admin portal, not Zitadel
  avatarId: uuid("avatarId"),                  // FK → files.id
  phone: text("phone"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),  // app sets on update
});

// No password column: identity + password live in Zitadel (self-hosted). The app
// never sees a password and never stores a hash.

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  imageId: uuid("imageId"),                    // FK → files.id
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),           // product price today (order items snapshot theirs)
  stock: integer("stock").notNull().default(0),
  isFeatured: boolean("isFeatured").notNull().default(false),
  categoryId: uuid("categoryId")
    .notNull()
    .references(() => categories.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    fileId: uuid("fileId")
      .notNull()
      .references(() => files.id),
    order: integer("order").notNull().default(0),
  },
  (t) => [t.index(["productId"]), t.unique(["productId", "fileId"])],
);

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").references(() => users.id),  // = Zitadel sub
  originalName: text("originalName").notNull(),
  fileName: text("fileName").notNull(),        // stored object name
  mimeType: text("mimeType").notNull(),
  size: integer("size").notNull(),
  bucket: text("bucket").notNull(),            // "ecommerce"
  key: text("key").notNull(),                  // MinIO object key
  url: text("url").notNull(),
  entityType: text("entityType"),              // "user" | "product" | "category" | "review"
  entityId: uuid("entityId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),             // = Zitadel sub
    productId: uuid("productId")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
  },
  (t) => [t.index(["userId"]), t.unique(["userId", "productId"])],
);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),             // = Zitadel sub
  status: orderStatusEnum("status").notNull().default("PENDING"),
  total: numeric("total").notNull(),
  shipping: numeric("shipping").notNull(),     // snapshot at creation
  tax: numeric("tax").notNull(),               // snapshot at creation
  stripeSessionId: text("stripeSessionId").unique(),
  shippingAddress: jsonb("shippingAddress").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
```

**Pricing rule (server-computed, never client-side)** — confirmed against the `ux-ui/` reference build (`cart-page.html` renders the same constants: `SHIP_FLAT = 5`, `SHIP_FREE_MIN = 100`, tax 8.25%):
- `subtotal = Σ (OrderItem.price × quantity)`, where `price` is the **product price at order creation** (snapshot against future price changes; orders are never re-priced)
- `shipping = $5.00` flat, **free when subtotal ≥ $100**
- `tax = subtotal × 0.0825` (state rate, fixed for v1)
- `total = subtotal + shipping + tax`

`Order.shipping`, `Order.tax`, and `Order.total` are written once at creation (`POST /api/orders`) and returned thereafter by every order-reading endpoint. `GET /api/cart` returns the same computation as live estimates so cart and checkout totals can render before the order exists.

```typescript
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("productId")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),           // product price snapshot at order creation
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("orderId")
    .notNull()
    .references(() => orders.id),
  stripeId: text("stripeId").notNull().unique(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  cardBrand: text("cardBrand"),
  cardLast4: text("cardLast4"),
  status: text("status").notNull(),            // "succeeded" etc.
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),             // = Zitadel sub
    productId: uuid("productId")
      .notNull()
      .references(() => products.id),
    rating: integer("rating").notNull(),       // 1-5
    comment: text("comment"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [t.index(["productId"]), t.unique(["userId", "productId"])],
);

export const reviewImages = pgTable(
  "review_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("reviewId")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    fileId: uuid("fileId")
      .notNull()
      .references(() => files.id),
  },
  (t) => [t.index(["reviewId"]), t.unique(["reviewId", "fileId"])],
);

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),             // = Zitadel sub
  label: text("label").notNull(),              // "Home", "Work", ...
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull().default("US"),
  isDefault: boolean("isDefault").notNull().default(false),
});

// Relations (for `db.query.*` with `with: { ... }` joins)
export const userRelations = relations(users, ({ one, many }) => ({
  avatar: one(files, { fields: [users.avatarId], references: [files.id] }),
  cartItems: many(cartItems),
  orders: many(orders),
  reviews: many(reviews),
  addresses: many(addresses),
  files: many(files),
}));
export const fileRelations = relations(files, ({ one, many }) => ({
  user: one(users, { fields: [files.userId], references: [users.id] }),
  productImages: many(productImages),
  reviewImages: many(reviewImages),
}));
export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));
export const categoryRelations = relations(categories, ({ one, many }) => ({
  image: one(files, { fields: [categories.imageId], references: [files.id] }),
  products: many(products),
}));
export const cartItemRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));
export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
}));
export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
export const paymentRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
export const reviewRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  images: many(reviewImages),
}));
export const reviewImageRelations = relations(reviewImages, ({ one }) => ({
  review: one(reviews, { fields: [reviewImages.reviewId], references: [reviews.id] }),
  file: one(files, { fields: [reviewImages.fileId], references: [files.id] }),
}));
export const addressRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
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
    clientId: string        // Zitadel SPA application client ID
    redirectUri: string     // e.g. http://localhost:5173/auth/callback
    scopes: string[]        // ["openid", "profile", "email"]
    endSessionUri: string   // Zitadel logout endpoint
  }
}
```
The SPA fetches this on boot so the OIDC settings aren't hardcoded on the client.

#### Sign-in flow (no login endpoint of ours)
```
1. SPA → GET /api/auth/config → Zitadel authorize URL:
   {issuer}/oauth/v2/authorize?
     client_id={clientId}
     &redirect_uri={redirectUri}
     &scope=openid profile email
     &response_type=code
     &state={random}
     &nonce={random}
     &code_challenge={S256(pkce_verifier)}
     &code_challenge_method=S256          // verifier kept in sessionStorage, never sent
2. User signs in on Zitadel's hosted page (password, MFA, social, self-register).
3. Zitadel → 302 {redirectUri}?code={code}&state={state}
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
Authorization: Bearer <accessToken>       // only proves a valid session exists

// Response 200
{
  success: true,
  message: "Logged out successfully"
}

// Errors
401 - Unauthorized
```
Backend is stateless — it just returns OK. The SPA then clears its stored tokens and redirects to Zitadel's end-session endpoint:
`{endSessionUri}?id_token_hint={id_token}&post_logout_redirect_uri={frontend_url}`.

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
?categoryId=string    // filter by category
?minPrice=number      // min price
?maxPrice=number      // max price
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
    totalPages: number
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
      id, rating, comment, createdAt,
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
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Request
{
  name: string
  description: string
  price: number
  categoryId: string
  stock: number
  imageIds: string[]    // max 5 file IDs (upload files first via /api/files/upload)
}

// Response 201
{
  success: true,
  data: {
    id, name, slug, description, price, stock, categoryId, createdAt,
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
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Request
{
  name?: string
  description?: string
  price?: number
  categoryId?: string
  stock?: number
  imageIds?: string[]   // replace all images with these
}

// Response 200
{
  success: true,
  data: {
    id, name, slug, description, price, stock, categoryId, updatedAt,
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
Authorization: Bearer <accessToken>
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
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Request
{
  name: string       // required, unique
  fileId?: string    // optional, upload file first via /api/files/upload
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
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Request
{
  name?: string
  fileId?: string
}

// Response 200
{
  success: true,
  data: { id, name, slug, image: { id, url }, updatedAt }
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
Authorization: Bearer <accessToken>
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
Authorization: Bearer <accessToken>

// Response 200
{
  success: true,
  data: {
    items: [{
      id,
      quantity,
      product: { id, name, slug, price, images[0], stock }
    }],
    subtotal: number,
    shipping: number,   // estimate (same pricing rule as order creation)
    tax: number,        // estimate
    total: number       // subtotal + shipping + tax
  }
}

// Errors
401 - Unauthorized
```

#### POST `/api/cart`
```typescript
// Headers
Authorization: Bearer <accessToken>

// Request
{
  productId: string  // required
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
Authorization: Bearer <accessToken>

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
Authorization: Bearer <accessToken>

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
Authorization: Bearer <accessToken>

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
Authorization: Bearer <accessToken>

// Request
{
  shippingAddress: {
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
    shippingAddress,
    items: [{
      id, quantity, price,
      product: { id, name, images[0] }
    }],
    createdAt
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
Authorization: Bearer <accessToken>

// Query Params
?page=number
?limit=number
?status=OrderStatus

// Response 200
{
  success: true,
  data: [{
    id, status, total, shipping, tax, createdAt,
    items: [{ quantity, product: { name, images[0] } }]
  }],
  pagination: { page, limit, total, totalPages }
}

// Errors
401 - Unauthorized
```

#### GET `/api/orders/:id`
```typescript
// Headers
Authorization: Bearer <accessToken>

// Response 200
{
  success: true,
  data: {
    id, status, total, shipping, tax, shippingAddress, createdAt,
    items: [{
      id, quantity, price,
      product: { id, name, slug, images[0] }
    }],
    payment: {
      cardBrand: string
      cardLast4: string
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
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Request
{
  status: OrderStatus  // PENDING | PAID | SHIPPED | DELIVERED | CANCELLED
}

// Response 200
{
  success: true,
  data: {
    id, status, updatedAt
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
Authorization: Bearer <accessToken>

// Request
{
  orderId: string  // order created via POST /api/orders (status PENDING)
}

// Response 200
{
  success: true,
  data: {
    orderId: string
    sessionId: string
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
    id, rating, comment, createdAt,
    user: { id, name, avatar },
    images: [{ id, url }]
  }],
  _avg: { rating: number },
  _count: { reviews: number },
  pagination: { page, limit, total, totalPages }
}
```

#### POST `/api/products/:id/reviews`
```typescript
// Headers
Authorization: Bearer <accessToken>

// Request
{
  rating: number     // required, 1-5
  comment?: string   // optional, max 500 chars
  imageIds?: string[] // optional, upload files first via /api/files/upload, max 5
}

// Response 201
{
  success: true,
  data: {
    id, rating, comment, createdAt,
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
Authorization: Bearer <accessToken>

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
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Response 200
{
  success: true,
  data: {
    totalRevenue: number
    totalOrders: number
    totalUsers: number
    totalProducts: number
    newUsersThisWeek: number
    ordersThisWeek: number
    lowStockProducts: number   // products with stock ≤ 5
    recentOrders: [{
      id, total, status, createdAt,
      user: { name }
    }],
    salesByDay: [{
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
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Query Params
?search=string          // search by name
?categoryId=string      // filter by category
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
    createdAt, updatedAt
  }],
  pagination: { page, limit, total, totalPages }
}

// Errors
401 - Unauthorized
403 - Not admin portal user
```

#### GET `/api/admin/orders`
```typescript
// Headers
Authorization: Bearer <accessToken>
Role: USER | ADMIN

// Query Params
?status=OrderStatus
?dateFrom=string   // ISO date
?dateTo=string     // ISO date
?page=number
?limit=number

// Response 200
{
  success: true,
  data: [{
    id, status, total, shipping, tax, createdAt,
    user: { id, name, email },
    items: [{ quantity, product: { name, images[0] } }]
  }],
  pagination: { page, limit, total, totalPages }
}

// Errors
401 - Unauthorized
403 - Not admin portal user
```

#### GET `/api/admin/users`
```typescript
// Headers
Authorization: Bearer <accessToken>
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
    id, name, email, role, createdAt,
    _count: { orders: number }
  }],
  pagination: { page, limit, total, totalPages }
}

// Errors
401 - Unauthorized
403 - Not admin
```

#### PUT `/api/admin/users/:id/role`
```typescript
// Headers
Authorization: Bearer <accessToken>
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
Authorization: Bearer <accessToken>

// Response 200
{
  success: true,
  data: {
    id, name, email, phone, avatar, role, createdAt,   // id = Zitadel sub; role from our DB
    addresses: [{ id, label, line1, city, state, zip, isDefault }]
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
Authorization: Bearer <accessToken>

// Request
{
  name?: string
  phone?: string
  avatarId?: string   // upload file first via /api/files/upload
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
Authorization: Bearer <accessToken>

// Request
{
  label: string      // "Home", "Work", etc.
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country?: string   // default "US"
  isDefault?: boolean
}

// Response 201
{
  success: true,
  data: {
    id, label, line1, line2, city, state, zip, country, isDefault
  }
}

// Errors
400 - Validation error
401 - Unauthorized
```

#### PATCH `/api/users/me/address/:id`
```typescript
// Headers
Authorization: Bearer <accessToken>

// Request
{
  label?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  isDefault?: boolean
}

// Response 200
{
  success: true,
  data: {
    id, label, line1, line2, city, state, zip, country, isDefault
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
Authorization: Bearer <accessToken>

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
Authorization: Bearer <accessToken>

// Request (multipart/form-data)
file: File           // required, max 5MB
entityType?: string  // "user" | "product" | "category" | "review"
entityId?: string    // ID of entity to link

// Response 201
{
  success: true,
  data: {
    id,
    originalName,
    fileName,
    mimeType,
    size,
    url,
    entityType,
    entityId,
    createdAt
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
Authorization: Bearer <accessToken>

// Request (multipart/form-data)
files: File[]        // required, max 5 files, max 5MB each
entityType?: string
entityId?: string

// Response 201
{
  success: true,
  data: [{
    id, originalName, fileName, mimeType, size, url, entityType, entityId
  }]
}

// Errors
400 - Validation error
401 - Unauthorized
```

#### GET `/api/files`
```typescript
// Headers
Authorization: Bearer <accessToken>

// Query Params
?entityType=string   // filter by entity type
?entityId=string     // filter by entity ID
?page=number
?limit=number

// Response 200
{
  success: true,
  data: [{
    id, originalName, fileName, mimeType, size, url, entityType, entityId, createdAt
  }],
  pagination: { page, limit, total, totalPages }
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
    id, originalName, fileName, mimeType, size, url, entityType, entityId, createdAt
  }
}

// Errors
404 - File not found
```

#### DELETE `/api/files/:id`
```typescript
// Headers
Authorization: Bearer <accessToken>

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
Authorization: Bearer <accessToken>

// Request
{
  entityType: string  // "user" | "product" | "category" | "review"
  entityId: string    // ID of entity to link
}

// Response 200
{
  success: true,
  data: {
    id, entityType, entityId
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
Authorization: Bearer <accessToken>

// Response 200
{
  success: true,
  data: {
    id, entityType: null, entityId: null
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
    accessToken: string
    refreshToken: string
    isAuthenticated: boolean
  },
  cart: {
    items: [{ productId, name, price, image, quantity }]
    total: number
  },
  ui: {
    isCartOpen: boolean
    isMobileMenuOpen: boolean
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
authApi:        getAuthConfig, logout   // sign-in/refresh run in the SPA against Zitadel (OIDC + PKCE, §3.1)
productsApi:    getProducts, getProduct, createProduct, updateProduct, deleteProduct
categoriesApi:  getCategories, createCategory, updateCategory, deleteCategory
cartApi:        getCart, addToCart, updateCartItem, removeFromCart, clearCart
ordersApi:      createOrder, getOrders, getOrder
reviewsApi:     getProductReviews, createReview, deleteReview
adminApi:       getStats, getUsers
usersApi:       getProfile, updateProfile, addAddress, updateAddress, deleteAddress
filesApi:       uploadFile, uploadMultiple, getFiles, getFile, deleteFile, linkFile, unlinkFile
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
    totalPages: number
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
Key: products/{productId}/{filename}
URL: {MINIO_ENDPOINT}/{bucket}/products/{productId}/{filename}

Limits:
- Max 5MB per image
- Max 5 images per product
- Types: jpg, jpeg, png, webp
- Thumbnails: 200x200, 500x500 (auto-generated)
```

### User Avatars
```
Bucket: ecommerce
Key: avatars/{userId}/{filename}
URL: {MINIO_ENDPOINT}/{bucket}/avatars/{userId}/{filename}

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
Key: reviews/{reviewId}/{filename}
URL: {MINIO_ENDPOINT}/{bucket}/reviews/{reviewId}/{filename}

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
import { httpError } from "../utils/http-error";

async uploadFile(
  file: Express.Multer.File,
  userId: string,
  entityType?: string,
  entityId?: string
): Promise<typeof files.$inferSelect> {
  // Build folder path based on entity type
  let folder = 'uploads';
  if (entityType === 'product') folder = 'products';
  else if (entityType === 'avatar') folder = 'avatars';
  else if (entityType === 'category') folder = 'categories';
  else if (entityType === 'review') folder = 'reviews';

  // For review images, include entityId in path
  const key = entityId
    ? `${folder}/${entityId}/${crypto.randomUUID()}${extname(file.originalname)}`
    : `${folder}/${crypto.randomUUID()}${extname(file.originalname)}`;

  await this.minioClient.putObject(
    'ecommerce',
    key,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );

  const url = `${this.minioEndpoint}/ecommerce/${key}`;

  const [created] = await db.insert(files).values({
    userId,
    originalName: file.originalname,
    fileName: `${crypto.randomUUID()}${extname(file.originalname)}`,
    mimeType: file.mimetype,
    size: file.size,
    bucket: 'ecommerce',
    key,
    url,
    entityType,
    entityId,
  }).returning();
  return created;
}

async deleteFile(fileId: string): Promise<void> {
  const [file] = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
  if (!file) throw httpError(404, 'File not found');

  await this.minioClient.removeObject(file.bucket, file.key);
  await db.delete(files).where(eq(files.id, fileId));
}

async linkToEntity(fileId: string, entityType: string, entityId: string) {
  const [linked] = await db.update(files)
    .set({ entityType, entityId })
    .where(eq(files.id, fileId))
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
```bash
# Start PostgreSQL (required by Zitadel — use existing local instance or separate container)
# Then start Zitadel
docker run -d --name zitadel \
  -p 8080:8080 \
  --hostname zitadel \
  -e ZITADEL_DATABASE_POSTGRES_HOST=localhost \
  -e ZITADEL_DATABASE_POSTGRES_PORT=5432 \
  -e ZITADEL_DATABASE_POSTGRES_USER=zitadel \
  -e ZITADEL_DATABASE_POSTGRES_PASSWORD=zitadel \
  -e ZITADEL_DATABASE_POSTGRES_DATABASE=zitadel \
  -e ZITADEL_EXTERNALSECURE=false \
  -e ZITADEL_FIRSTINSTANCE_ORG_HUMAN_USERNAME=admin \
  -e ZITADEL_FIRSTINSTANCE_ORG_HUMAN_PASSWORD=Admin123! \
  ghcr.io/zitadel/zitadel:latest

# Console: http://localhost:8080/ui/console
# 1. Create project → add application (OIDC SPA)
# 2. Set redirect URI to http://localhost:5173/auth/callback
# 3. Copy the Client ID (SPA application) → set as ZITADEL_CLIENT_ID in backend .env
# 4. No client secret needed — SPA uses PKCE (public client)
# 5. Disable PKCE requirement if Zitadel defaults require it: Project → App → OIDC → PKCE
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
- `requireAuth` middleware uses `jose`'s `createRemoteJWKSet` against Zitadel's JWKS endpoint (`{issuer}/.well-known/openid-configuration` → `jwks_uri`).
- Verifies `exp`, `aud` (must match our client ID), and `iss` (must match `ZITADEL_ISSUER`).
- Extracts `sub` as `userId` — no DB lookup on every request; the token is the identity proof.
- Sets `req.userId = payload.sub`, `req.user = { sub, email, name }` (from verified token claims).

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

> Unlike Prisma (which threw `P2025`), Drizzle's `select().limit(1)` / `update().returning()` return an **empty array or `undefined`** when nothing matches — wrap with a `findOr404`/`getOr404` helper that throws `httpError(404, 'Not found')`. There is no "not found" DB error to catch; it is an application-level check in the service layer.

---

## 11. Environment Variables

### Backend (.env)
```bash
PORT=3000
API_PREFIX=api
DATABASE_URL="postgresql://user:pass@localhost:5432/ecommerce"
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
OIDC issuer/clientId/redirectUri are **not** hardcoded — the SPA fetches them from `GET /api/auth/config` on boot (§3.1).

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
