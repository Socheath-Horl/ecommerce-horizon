# E-Commerce Implementation Plan

> Status: `[ ]` pending | `[-]` in progress | `[x]` done

---

## Frontend Verification Standard (headless)

**All end-to-end frontend checks use the Lightpanda headless browser** (per AGENTS.md — a standalone binary from lightpanda.io, NOT an npm package; on Windows run it via the `lightpanda/browser` Docker image):

- **Serve the app:** `npm run dev` bound to `0.0.0.0` (or `preview` of a production build) with `VITE_API_URL` set so the app can reach the backend; use Vite's `server.proxy` (`'/api' -> http://localhost:3000`) so all API calls are same-origin (the backend CORS allows only `http://localhost:5173`).
- **Render check:** `docker run --rm --add-host=host.docker.internal:host-gateway lightpanda/browser:latest /bin/lightpanda fetch http://host.docker.internal:<port>/<path> --dump html` — assert the rendered DOM markers, not just HTTP 200.
- **Flow check (click-through):** a PandaScript run via `/bin/lightpanda run /script.js` using `new Page()` + `page.goto/fill/click` and `page.wait_for_script`/`page.evaluate`, asserting client flows — Zitadel sign-in redirect, PKCE callback round-trip, routing, protected redirects.
- Every frontend `Verify:` bullet below ("loads / works / redirected / responsive") is performed this way and read from Lightpanda's dumped DOM/output.

## Phase 1: Project Setup, DB Schema, Auth + Password, MinIO

**Duration:** 2-3 days

### 1.1 Initialize Monorepo
- [x] Create `ecommerce/` folder
- [x] Create `ecommerce/frontend/` folder
- [x] Create `ecommerce/backend/` folder
- [x] Initialize git repository in `ecommerce/`
- [x] Create `.gitignore` (Node.js, Express, Vite, Drizzle)

### 1.2 Backend — Express Project
- [x] Initialize Node + TypeScript project in `backend/` (install `express`, `tsx`, `typescript`, `@types/express`, `@types/node`) — runtime: **Node v24** (`@types/node` ^22 resolved by npm)
- [x] Install `drizzle-orm`, `pg` + `@types/pg`, and `drizzle-kit` (dev)
- [x] Install `jose` (verify JWTs signed by Zitadel's JWKS)
- [x] Install `zod` (validation) and `dotenv`
- [x] Install `cors`
- [x] Install `minio`, `multer` + `@types/multer`
- [x] Install `swagger-jsdoc`, `swagger-ui-express` + `@types/swagger-jsdoc`, `@types/swagger-ui-express` (OpenAPI, §1.5.5) — installed in 1.1 but now **superseded (1.5.5 deferred → tsoa); consider removing these deps when tsoa lands**
- [x] Configure scripts in `package.json` (`dev` = `tsx watch`, `build` = `tsc`, `db:generate`, `db:migrate`, `db:seed`, `db:push`)
- [x] Create `.env` + `.env.example` with all environment variables
- [x] Bootstrap Express app in `src/index.ts` (dotenv, `cors`, JSON body, `/api` prefix, 404 + error middleware)
- [x] Verify: `npm run build` compiles

### 1.3 Backend — Drizzle Setup
- [x] Create `drizzle.config.ts` (dialect `postgresql`, `schema: "./src/db/schema.ts"`, `out: "./drizzle"`, `DATABASE_URL` from env)
- [x] Define `users` table in `src/db/schema.ts` (`id = text` PK = **Zitadel `sub`**, NO password column, `role` pgEnum, timestamps)
- [x] Define `categories` table
- [x] Define `products` table (incl. `Decimal` price → `numeric`)
- [x] Define `files` table (`entity_type` + `entity_id` polymorphic association)
- [x] Create pool + drizzle client (`src/db/index.ts`: `pg.Pool` + `drizzle(pool, { schema })`, export `db`)
- [x] Generate + apply initial migration (`npm run db:generate` → `npm run db:migrate`)
- [x] Verify: tables exist in PostgreSQL (`npx drizzle-kit check` / psql `\dt`)

### 1.4 Backend — DB Client (Drizzle)
- [x] Create the shared drizzle client wrapper (`src/db/index.ts`) exporting one `db` instance + all `schema` tables for services to import
- [x] Verify: `npm run build` compiles

### 1.5 Backend — Seed File
- [x] Add `is_featured boolean default(false)` to `products` in `src/db/schema.ts` (Home "Featured Products" needs it) — included in the initial migration
- [x] Install `tsx` (dev) as the script runner
- [x] Add seed script to `package.json` (`db:seed` → `tsx src/db/seed.ts`)
- [x] Create `src/db/seed.ts` — idempotent by slug/email (`onConflictDoNothing`) so re-seeding never duplicates
- [x] Ensure the admin identity exists in **Zitadel** (console or self-registration); the seed only records admin's `sub`:**role = ADMIN` for the known admin email (`onConflictDoUpdate` on users.email) — bcrypt is gone, the app never stores passwords
- [x] Seed sample categories (brand = Horizon Supply Co. — match `ux-ui/`): Outerwear, Travel, Carry & Desk, Drinkware
- [x] Seed sample products per category (match `ux-ui/` prototype products — user chose prototype data over spec SKUs: Waxed Field Jacket, Country Wax Jacket, Weekender Duffel, Canvas Duffel, Cabin Carry-On, Trail Mug, Insulated Bottle 750ml, Steel Bottle 1L, Utility Backpack, Daypack — 8 `is_featured`, 2 not)
- [x] Run seed (`npm run db:seed`)
- [x] Verify: data check (categories = 4, products = 10, admin = ADMIN)

### 1.5.5 Backend — OpenAPI Docs (Scalar UI) — DEFERRED
- [ ] ~~swagger-jsdoc / swagger-ui-express~~ — superseded: user wants **true auto-generation** (spec derived from code, zero JSDoc). Revisit this task once routes exist in Phase 2, likely via **tsoa** (auto-gen from TS types) + `@scalar/api-reference` renderer at `/api/docs`. Skip swagger-ui-express when revived — Scalar already renders.

### 1.6 Backend — Auth Structure (Zitadel OIDC)
- [x] Create `AuthService` (`src/modules/auth/auth.service.ts`) — loads Zitadel OIDC discovery, builds the SPA config payload, stateless logout (no user upsert here — that's 1.14)
- [x] Create `src/utils/oidc.ts` — cached OIDC discovery fetcher (shared by AuthService here; JWKS extension lands in 1.8)
- [x] Create auth controller (`src/modules/auth/auth.controller.ts`) — `express.Router()` with the `/config`, `/logout` handlers
- [x] Mount the controller at `/api/auth` in `src/app.ts`
- [x] Verify: `npm run build` compiles

### 1.7 Backend — Validation Infrastructure (zod)
- [x] Add the `validate(schema)` middleware (`src/common/middleware/validate.ts`) — parses `req.body`/`req.query`, on failure returns `400` with `{ success: false, error: { code: "VALIDATION_ERROR", message, details } }`
- [x] Auth has no request-body schemas — the OIDC code exchange happens client-side against Zitadel (system-design §3.1); `logout` takes no body
- [x] Verify: `npm run build` compiles

### 1.8 Backend — Token Validation Middleware (Zitadel JWKS)
- [x] Extend `src/utils/oidc.ts` — cache `jwks_uri`, build `createRemoteJWKSet(keys)` with `jose`, `verify_access_token()` helper (discovery itself was created in 1.6)
- [x] Create `require_auth` middleware (`src/common/middleware/auth.ts`): verify `Authorization: Bearer <token>` with `jwtVerify` (+ `issuer`, `audience` = `ZITADEL_CLIENT_ID`), attach `req.user` = `{ id, email, name }` from claims (`id` = `sub`); else `401 UNAUTHORIZED`
- [x] Create `require_role(...roles)` middleware factory — looks up `req.user.role` in DB against allowed roles; else `403 FORBIDDEN`
- [x] Verify: `npm run build` compiles

### 1.9 Backend — Route Protection
- [x] Apply `require_auth` to `POST /api/auth/logout` (only existing protected route at this phase)
- [ ] Apply `require_auth` to cart/orders/profile/files routes — **carried into each phase** as those routes are created (1.14, 1.17, 5.1, 6.3, 7.1)
- [ ] Apply `require_role('USER', 'ADMIN')` admin portal + `require_role('ADMIN')` user mgmt — **carried into §2.3 / §9.1**
- [x] Verify: `npm run build` compiles

### 1.10 Backend — OIDC Config Endpoint
- [x] Implement `get_config()` in AuthService — returns issuer, client_id, redirect_uri, scopes, end_session_uri (from env + cached discovery) so the SPA never hardcodes OIDC settings
- [x] Add GET `/api/auth/config` route in `auth.controller.ts` (public)
- [ ] OpenAPI doc for GET /api/auth/config → **deferred with 1.5.5** (tsoa auto-gen)
- [ ] Verify: `GET /api/auth/config` returns the SPA settings ✅ (Zitadel v4 running on :8080, discovery fetched, real `end_session_uri` returned); **browser sign-in round-trip pending manual step** — create SPA client in Zitadel console (`http://localhost:8080/ui/console`), set real `ZITADEL_CLIENT_ID` in `.env`, then complete authorize → code → /users/me (that last hop needs 1.14 too)

### 1.11 Backend — Logout Endpoint
- [ ] Implement `logout()` in AuthService — stateless: validate the session exists (`require_auth`), return OK
- [ ] Add POST `/api/auth/logout` route in `auth.controller.ts` (`require_auth`-protected)
- [ ] OpenAPI doc for POST /api/auth/logout → **deferred with 1.5.5** (tsoa auto-gen)
- [ ] Verify: Logout returns 200; the SPA then clears storage and redirects to Zitadel's `end_session` endpoint (system-design §3.1)

### 1.12 Backend — Session Restore (no refresh endpoint of ours)
- [ ] There is NO `/api/auth/refresh` — the SPA refreshes directly against Zitadel (`grant_type=refresh_token`), then re-calls `GET /api/users/me` (system-design §3.1)
- [ ] Verify: expired access token + Zitadel refresh grant → new access token accepted by `/api/users/me`

### 1.13 Backend — Passwords (delegated to Zitadel)
- [ ] No `change-password` endpoint — Zitadel owns passwords, MFA, forgot-password, and self-registration via its hosted UI (system-design §3.1 and §9)
- [ ] Admin users are created in the **Zitadel console**, not via our API; their role is assigned in our admin portal (§2)
- [ ] Verify: password reset works in Zitadel's end-user UI only

### 1.14 Backend — Profile Endpoint (lazy user upsert)
- [ ] Implement `get_profile()` in AuthService — upsert `users` from verified token claims on first contact: `id = sub`, `email`/`name` from claims, `role = CUSTOMER` default
- [ ] Return current user data (id, name, email, phone, avatar, role, addresses)
- [ ] Add GET `/api/users/me` route in `src/modules/users/users.controller.ts` (per system-design §3.8; `require_auth`, uses `req.user`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/users/me (bearer security, 200, 401)
- [ ] Verify: Profile returns current user data; a brand-new Zitadel user gets a `users` row (role CUSTOMER)

### 1.15 Backend — Auth Error Handling
- [ ] Return 401 for missing/invalid/expired Zitadel access token (require_auth)
- [ ] Return 403 for insufficient role (require_role)
- [ ] Add the global error-handling middleware (`src/common/middleware/error.ts`) that shapes every error as `{ success: false, error: { code, message, details } }` (404 fallback included)
- [ ] Verify: All auth error cases return correct status codes

### 1.16 Backend — MinIO Service
- [ ] Create MinIO client + service (`src/common/services/minio.service.ts`, `minio` client from env config)
- [ ] Ensure bucket + public-read policy on startup
- [ ] Implement `upload_file(buffer, meta)` → object key + URL
- [ ] Implement `delete_file(bucket, key)`
- [ ] Implement `generate_url(bucket, key)`
- [ ] Verify: MinIO connection works (check MinIO console)

### 1.17 Backend — Files Structure
- [ ] Create `FilesService` (`src/modules/files/files.service.ts`)
- [ ] Create files controller (`src/modules/files/files.controller.ts`)
- [ ] Mount the controller at `/api/files` in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 1.18 Backend — Basic File Upload Endpoint
- [ ] Implement basic POST `/api/files/upload` endpoint (single file)
- [ ] Use simple `multer` memory storage (`upload.single('file')`)
- [ ] Save file record in database (`db.insert(files)`)
- [ ] Return file data
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/files/upload (consumes multipart/form-data, body schema, 201)
- [ ] Verify: Upload image via API, check MinIO + DB

### 1.19 Backend — File List Endpoint
- [ ] Implement GET `/api/files` endpoint
- [ ] Filter by entity_type and entity_id in query
- [ ] Return list of files
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/files (query params, 200)
- [ ] Verify: List files for an entity

### 1.20 Backend — File Delete Endpoint
- [ ] Implement DELETE `/api/files/:id` endpoint
- [ ] Delete from MinIO
- [ ] Delete record from database
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): DELETE /api/files/:id (path param, 200, 404)
- [ ] Verify: Delete removes from MinIO + DB

### 1.21 Backend — File Link/Unlink Endpoints
- [ ] Implement PUT `/api/files/:id/link` endpoint (PUT per dev preference)
- [ ] Link file to entity (entity_type + entity_id)
- [ ] Implement PUT `/api/files/:id/unlink` endpoint (PUT per dev preference)
- [ ] Unlink file from entity
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): PUT /api/files/:id/link|unlink (body schema, 200)
- [ ] Verify: Link/unlink works correctly

### 1.22 Frontend — Vite Project
- [ ] Create Vite + React + TypeScript project in `frontend/`
- [ ] Install `@reduxjs/toolkit`, `react-redux`
- [ ] Install `react-router-dom`
- [ ] Install `axios`
- [ ] Install `tailwindcss` and `@tailwindcss/vite`
- [ ] Configure Tailwind in `vite.config.ts`
- [ ] Initialize shadcn/ui
- [ ] Add shadcn/ui components: button, input, card, label
- [ ] Set up token CSS (globals.css) from `ux-ui/brand-spec.md` (OKLCH zinc values, light + dark) and `ux-ui/shadcn-component-library.html` slot-bridge table
- [ ] Set up theme strategy: `dark_mode: ['class']`, `html.dark` class, persisted `ui.theme` in localStorage, first load follows `prefers-color-scheme`
- [ ] Verify: `npm run build` compiles

### 1.23 Frontend — Redux Store
- [ ] Create store (`src/store/index.ts`)
- [ ] Create auth slice (`src/store/slices/auth_slice.ts`)
- [ ] Add user, tokens, is_authenticated to auth state
- [ ] Add login, logout, set_tokens actions
- [ ] Configure localStorage persistence for refresh token
- [ ] Wrap app with Redux Provider in `main.tsx`
- [ ] Verify: `npm run build` compiles

### 1.24 Frontend — API Base Service
- [ ] Create Axios instance (`src/services/api.ts`)
- [ ] Configure base URL from env variable
- [ ] Add request interceptor to attach access token
- [ ] Add response interceptor to handle 401 (refresh token)
- [ ] Verify: `npm run build` compiles

### 1.25 Frontend — Router Setup
- [ ] Configure React Router in `App.tsx`
- [ ] Create route structure: `/`, `/auth/*`, `/admin/*`, `/products`, `/cart`, etc.
- [ ] Create placeholder pages for each route
- [ ] Verify: `npm run build` compiles, routes work

### 1.26 Frontend — Auth API (RTK Query)
- [ ] Create auth_api (`src/services/auth_api.ts`)
- [ ] Add `get_auth_config` query (issuer, client_id, redirect_uri, scopes, end_session_uri)
- [ ] Add `logout` mutation
- [ ] Add `get_profile` query (GET `/api/users/me`)
- [ ] Configure base URL and headers
- [ ] Verify: `npm run build` compiles

### 1.27 Frontend — Zitadel Sign-In Flow (replaces Login page)
- [ ] Create OIDC helper (`src/lib/oidc.ts`) — fetch `/api/auth/config`, generate `pkce_verifier` + `code_challenge` (S256 via Web Crypto), build the Zitadel authorize URL with state+nonce (stored in sessionStorage)
- [ ] Create `LoginPage` (`src/pages/auth/Login.tsx`) — renders `ux-ui/login-page.html` layout; one primary button that redirects to Zitadel (no password form, no local credential handling)
- [ ] Redirect to `/` if already authenticated (short-circuit on boot)
- [ ] Verify: Lightpanda — unauthenticated `/auth/login` shows a redirect; authenticated user lands on `/`

### 1.28 Frontend — Auth Callback Page (replaces Register page)
- [ ] Create callback page (`src/pages/auth/Callback.tsx`) mapped to `ZITADEL_REDIRECT_URI` (e.g. `/auth/callback`)
- [ ] Exchange authorization code at Zitadel token endpoint (PKCE verifier from sessionStorage) → access + refresh + id tokens
- [ ] Store access token in memory (Redux) + refresh token in localStorage (unchanged strategy per §AGENTS)
- [ ] Call GET `/api/users/me` (triggers first-login upsert per system-design §3.1)
- [ ] Self-registration is handled by Zitadel itself (hidden by the login button) — no separate register page; `Register.tsx` is not built
- [ ] Verify: full sign-in round-trip in browser works (code + PKCE exchange, /users/me upsert, landing on `/`)

### 1.29 Phase 1 — Full Verification
- [ ] Backend starts without errors
- [ ] Frontend starts without errors (headless Lightpanda: all routes render; unauthenticated `/auth/login` redirects, callback round-trip completes, logged-in `/` shows user)
- [ ] Sign in with a Zitadel user (code + PKCE exchange succeeds)
- [ ] New user is upserted into `users` (role = `CUSTOMER`)
- [ ] Access protected route with token
- [ ] Refresh token grant works (session restore via Zitadel refresh)
- [ ] Admin user's `role = ADMIN` is reflected in `GET /api/users/me`
- [ ] Upload file via API
- [ ] List files via API
- [ ] Delete file via API

---

## Phase 2: User Management (Admin)

**Duration:** 1-2 days

### 2.1 Backend — Users Structure
- [ ] Create `UsersService` (`src/modules/users/users.service.ts`)
- [ ] Create users controller (`src/modules/users/users.controller.ts`)
- [ ] Mount the controller in `src/app.ts` (`/api/admin/users`, `/api/users`)
- [ ] Verify: `npm run build` compiles

### 2.2 Backend — Users Validation (zod)
- [ ] Create `update_role_schema` (role: ADMIN | USER | CUSTOMER)
- [ ] Add query schema for `GET /api/admin/users` (page, limit, search, role)
- [ ] Create response types (`AdminUserListItem` with `_count.orders`, `AdminUser`, `ListUsersResponse`)
- [ ] Verify: `npm run build` compiles

### 2.3 Backend — Admin List Users Endpoint
- [ ] Implement `find_all()` in UsersService
- [ ] Add pagination support (page, limit)
- [ ] Add search by name/email
- [ ] Add filter by role
- [ ] Return users with total count and order count
- [ ] Add GET `/api/admin/users` route (ADMIN only, `require_role('ADMIN')` + `validate(query_schema, 'query')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/admin/users (bearer security, 200, 403)
- [ ] Verify: Admin can list users

### 2.4 Backend — Admin Update Role Endpoint
- [ ] Implement `update_role()` in UsersService
- [ ] Validate role is valid enum value (CUSTOMER | USER | ADMIN)
- [ ] Prevent self-role change
- [ ] Add PUT `/api/admin/users/:id/role` route (ADMIN only)
- [ ] Apply `require_role('ADMIN')`
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): PUT /api/admin/users/:id/role (bearer security, body `update_role_schema`, 200, 400, 401, 403, 404)
- [ ] Verify: Admin can change user role

### 2.5 Backend — Admin User Error Handling
- [ ] Return 404 for non-existent user
- [ ] Return 400 for invalid role
- [ ] Return 403 for non-admin access
- [ ] Return 400 for self-role change attempt
- [ ] Verify: All error cases handled

### 2.6 Frontend — Admin API (RTK Query)
- [ ] Create admin_api (`src/services/admin_api.ts`)
- [ ] Add get_users query (with pagination)
- [ ] Add update_user_role mutation
- [ ] Verify: `npm run build` compiles

### 2.7 Frontend — Auth Guard Component
- [ ] Create AuthGuard (`src/components/guards/AuthGuard.tsx`)
- [ ] Check if user is authenticated
- [ ] Redirect to login if not
- [ ] Verify: `npm run build` compiles

### 2.8 Frontend — Role Guard Component
- [ ] Create RoleGuard (`src/components/guards/RoleGuard.tsx`)
- [ ] Check if user has required role
- [ ] Redirect to home if not authorized
- [ ] Verify: `npm run build` compiles

### 2.9 Frontend — Admin Layout
- [ ] Create AdminLayout (`src/pages/admin/AdminLayout.tsx`)
- [ ] Add sidebar navigation
- [ ] Add main content area
- [ ] Wrap with AuthGuard and RoleGuard
- [ ] Verify: `npm run build` compiles

### 2.10 Frontend — Admin Sidebar
- [ ] Create Sidebar component (`src/components/layout/Sidebar.tsx`)
- [ ] Add Dashboard link
- [ ] Add Products link
- [ ] Add Categories link
- [ ] Add Orders link
- [ ] Add Users link
- [ ] Verify: `npm run build` compiles

### 2.11 Frontend — User Table Component
- [ ] Create UserTable (`src/components/admin/UserTable.tsx`)
- [ ] Display user email, name, role, created date
- [ ] Add role selector dropdown
- [ ] Verify: `npm run build` compiles

### 2.12 Frontend — Role Selector Component
- [ ] Create RoleSelector (`src/components/admin/RoleSelector.tsx`)
- [ ] Show current role
- [ ] Dropdown to select new role
- [ ] Call update_user_role on change
- [ ] Show success/error feedback
- [ ] Verify: `npm run build` compiles

### 2.13 Frontend — User List Page
- [ ] Create UserList page (`src/pages/admin/users/UserList.tsx`)
- [ ] Fetch users with admin_api
- [ ] Display UserTable
- [ ] Add pagination controls
- [ ] Verify: `npm run build` compiles

### 2.14 Frontend — Protect Admin Routes
- [ ] Wrap `/admin/*` routes with AuthGuard
- [ ] Wrap `/admin/*` routes with RoleGuard (ADMIN/USER)
- [ ] Boot-time session restore (`src/lib/session.ts`): refresh token → Zitadel refresh grant → GET `/api/users/me`, so direct URLs / hard refreshes stay logged in
- [ ] Verify: Non-admin users redirected (Lightpanda: anon /admin → login PASS, CUSTOMER login → /admin blocked to / PASS, ADMIN /admin/users renders 10 rows PASS)

### 2.15 Phase 2 — Full Verification
- [ ] Backend admin endpoints work
- [ ] Admin can list users
- [ ] Admin can change user role
- [ ] Non-admin gets 403
- [ ] Frontend admin layout renders
- [ ] User list displays correctly
- [ ] Role change works in UI

---

## Phase 3: Products + Categories CRUD

**Duration:** 2-3 days

### 3.1 Backend — Categories Structure
- [ ] Create `CategoriesService` (`src/modules/categories/categories.service.ts`)
- [ ] Create categories controller (`src/modules/categories/categories.controller.ts`)
- [ ] Mount the controller at `/api/categories` in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 3.2 Backend — Categories Validation (zod)
- [ ] Create `create_category_schema` (name, file_id?) — per `system-design.md` §3.2 (no description/parent_id on Category)
- [ ] Create `update_category_schema` (name?, file_id?)
- [ ] Apply via `validate(schema)` middleware
- [ ] Verify: `npm run build` compiles

### 3.3 Backend — Slug Utility
- [ ] Create slugify function (`src/utils/slugify.ts`)
- [ ] Generate slug from name
- [ ] Handle duplicates (append number)
- [ ] Verify: `npm run build` compiles

### 3.4 Backend — Create Category Endpoint
- [ ] Implement `create()` in CategoriesService
- [ ] Auto-generate slug from name
- [ ] Check for duplicate name
- [ ] Add POST `/api/categories` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/categories (bearer security, body `create_category_schema`, 201, 400, 401, 403, 404, 409)
- [ ] Verify: Admin can create category

### 3.5 Backend — List Categories Endpoint
- [ ] Implement `find_all()` in CategoriesService
- [ ] Return all categories (public)
- [ ] Add GET `/api/categories` route
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/categories (200)
- [ ] Verify: Categories list returns data

### 3.6 Backend — Update Category Endpoint
- [ ] Implement `update()` in CategoriesService
- [ ] Check category exists
- [ ] Update slug if name changes
- [ ] Add PATCH `/api/categories/:id` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): PATCH /api/categories/:id (bearer security, body `update_category_schema`, 200, 400, 401, 403, 404, 409)
- [ ] Verify: Admin can update category

### 3.7 Backend — Delete Category Endpoint
- [ ] Implement `remove()` in CategoriesService
- [ ] Check for products in category
- [ ] Prevent delete if products exist
- [ ] Add DELETE `/api/categories/:id` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): DELETE /api/categories/:id (bearer security, 200, 401, 403, 404, 409)
- [ ] Verify: Admin can delete category (if no products)

### 3.8 Backend — Products Structure
- [ ] Create `ProductsService` (`src/modules/products/products.service.ts`)
- [ ] Create products controller (`src/modules/products/products.controller.ts`)
- [ ] Mount the controller at `/api/products` in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 3.9 Backend — Products Validation (zod)
- [ ] Create `create_product_schema` (name, description, price, category_id, stock, image_ids? ≤ 5)
- [ ] Create `update_product_schema` (all optional)
- [ ] Create `query_products_schema` (page, limit, search, category_id, min_price, max_price, rating, sort)
- [ ] Apply via `validate(schema)` middleware (body vs query)
- [ ] Verify: `npm run build` compiles

### 3.10 Backend — Pagination Utility
- [ ] Create pagination helper (`src/utils/pagination.ts`)
- [ ] Accept page, limit params
- [ ] Return `{ page, limit, offset, total_pages }` values
- [ ] Verify: `npm run build` compiles

### 3.11 Backend — ProductImage Table
- [ ] Add `product_images` table to `src/db/schema.ts` (product_id, file_id, order, unique `(product_id, file_id)`, cascade on product delete)
- [ ] Add relations to `products` and `files`
- [ ] Regenerate migration (`npm run db:generate`)
- [ ] Verify: `npm run db:migrate` applies the new table (psql `\dt`)

### 3.12 Backend — Create Product Endpoint
- [ ] Implement `create()` in ProductsService
- [ ] Auto-generate slug from name
- [ ] Validate category exists
- [ ] Create product in database
- [ ] Add POST `/api/products` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/products (bearer security, body `create_product_schema`, 201, 400, 401, 403, 404, 409)
- [ ] Verify: Admin can create product

### 3.13 Backend — List Products Endpoint
- [ ] Implement `find_all()` in ProductsService
- [ ] Add pagination (page, limit)
- [ ] Add filtering (search, category_id, min_price, max_price)
- [ ] Add sorting (price_asc, price_desc, newest, popular)
- [ ] Include category and images in response
- [ ] Add GET `/api/products` route (public, `validate(query_products_schema, 'query')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/products (200 + pagination payload)
- [ ] Verify: Products list with filters works

### 3.14 Backend — Get Product Endpoint
- [ ] Implement `find_by_slug()` in ProductsService
- [ ] Include category and images
- [ ] Add GET `/api/products/:slug` route (public)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/products/:slug (path param slug, 200, 404)
- [ ] Verify: Single product returns correctly

### 3.15 Backend — Update Product Endpoint
- [ ] Implement `update()` in ProductsService
- [ ] Check product exists
- [ ] Validate category exists (if changing)
- [ ] Update slug if name changes
- [ ] Add PATCH `/api/products/:id` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): PATCH /api/products/:id (bearer security, body `update_product_schema`, 200, 400, 401, 403, 404)
- [ ] Verify: Admin can update product

### 3.16 Backend — Delete Product Endpoint
- [ ] Implement `remove()` in ProductsService
- [ ] Check product exists
- [ ] Delete product images from MinIO
- [ ] Delete product from database
- [ ] Add DELETE `/api/products/:id` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): DELETE /api/products/:id (bearer security, 200, 401, 403, 404)
- [ ] Verify: Admin can delete product

### 3.17 Backend — Product Error Handling
- [ ] Return 404 for non-existent product
- [ ] Return 400 for invalid category
- [ ] Return 400 for duplicate slug
- [ ] Return 400 for negative stock/price
- [ ] Verify: All error cases handled

### 3.18 Frontend — Products API (RTK Query)
- [ ] Create products_api (`src/services/products_api.ts`)
- [ ] Add get_products query (with filters)
- [ ] Add get_product query (by slug)
- [ ] Verify: `npm run build` compiles

### 3.19 Frontend — Categories API (RTK Query)
- [ ] Create categories_api (`src/services/categories_api.ts`)
- [ ] Add get_categories query
- [ ] Verify: `npm run build` compiles

### 3.20 Frontend — ProductCard Component
- [ ] Create ProductCard (`src/components/ProductCard.tsx`) — follow `ux-ui/products-page.html` + shadcn library `ProductCard`
- [ ] Display product image (200×200 thumb, srcset 500 for ≤2x)
- [ ] Display product name, price (14px/600), rating (14px — legibility rule: purchase numbers never drop to Small tier)
- [ ] Whole-card link to `/products/:slug`
- [ ] Out-of-stock (stock 0): destructive badge over 55%-dimmed media, price kept, card still links — **no add-to-cart button on the card**
- [ ] Verify: `npm run build` compiles

### 3.21 Frontend — FilterSidebar Component
- [ ] Create FilterSidebar (`src/components/products/FilterSidebar.tsx`) — follow `ux-ui/products-page.html` (All/Outerwear/Travel/Carry & Desk/Drinkware)
- [ ] Category filter (single-select radio, matches single `category_id` param, count per category)
- [ ] Price range filter (min/max inputs)
- [ ] Clear filters button
- [ ] Mobile (≤768px): collapse to slide-over filter drawer launching from "Filters" button
- [ ] Verify: `npm run build` compiles

### 3.22 Frontend — SortSelect Component
- [ ] Create SortSelect (`src/components/products/SortSelect.tsx`) — follow `ux-ui/products-page.html`
- [ ] Options (values must match backend `sort` param): `newest`, `price_asc` "Price: Low to High", `price_desc` "Price: High to Low", `popular` "Most popular"
- [ ] Verify: `npm run build` compiles

### 3.23 Frontend — Pagination Component
- [ ] Create Pagination (`src/components/Pagination.tsx`)
- [ ] Previous/Next buttons
- [ ] Page numbers
- [ ] Current page highlight
- [ ] Verify: `npm run build` compiles

### 3.24 Frontend — ImageGallery Component
- [ ] Create ImageGallery (`src/components/ImageGallery.tsx`)
- [ ] Main image display
- [ ] Thumbnail navigation
- [ ] Click to select thumbnail
- [ ] Verify: `npm run build` compiles

### 3.25 Frontend — Products Page
- [ ] Create Products page (`src/pages/customer/Products.tsx`) — follow `ux-ui/products-page.html`
- [ ] Fetch products with products_api
- [ ] Display product grid (ProductCard)
- [ ] Add FilterSidebar (desktop sidebar 260px; mobile filter drawer)
- [ ] Add SortSelect
- [ ] Add Pagination
- [ ] Add results count + "Filters (n)" active count
- [ ] Add search banner ("Results for "q"" + "Clear search ×") when query present
- [ ] Add empty state (no results → "Clear filters" button)
- [ ] Verify: Products page loads with data (Lightpanda: product grid renders)

### 3.26 Frontend — ProductDetail Page
- [ ] Create ProductDetail page (`src/pages/customer/ProductDetail.tsx`) — follow `ux-ui/product-detail-page.html`
- [ ] Fetch product by slug
- [ ] Display ImageGallery (main + thumbnail row)
- [ ] Display product info (name, price, description)
- [ ] Display category (breadcrumb to products page)
- [ ] Display stock status (In stock / "Only N left" hint / Out of stock)
- [ ] Quantity stepper (1–stock max, disabled out of stock)
- [ ] Add to Cart button (disabled when out of stock)
- [ ] Display reviews section (list + per-item Review CTA / "Reviewed" state)
- [ ] Verify: Product detail page loads correctly (Lightpanda)

### 3.27 Frontend — Admin Product API (RTK Query)
- [ ] Add create_product mutation to admin_api
- [ ] Add update_product mutation to admin_api
- [ ] Add delete_product mutation to admin_api
- [ ] Verify: `npm run build` compiles

### 3.28 Frontend — Admin Category API (RTK Query)
- [ ] Add create_category mutation to admin_api
- [ ] Add update_category mutation to admin_api
- [ ] Add delete_category mutation to admin_api
- [ ] Verify: `npm run build` compiles

### 3.29 Frontend — Admin ProductTable Component
- [ ] Create ProductTable (`src/components/admin/ProductTable.tsx`)
- [ ] Display product name, price, stock, category
- [ ] Edit button
- [ ] Delete button
- [ ] Verify: `npm run build` compiles

### 3.30 Frontend — Admin ProductList Page
- [ ] Create ProductList page (`src/pages/admin/products/ProductList.tsx`)
- [ ] Fetch products with admin_api
- [ ] Display ProductTable
- [ ] Add "Create Product" button
- [ ] Verify: `npm run build` compiles

### 3.31 Frontend — Admin ProductForm Page
- [ ] Create ProductForm page (`src/pages/admin/products/ProductForm.tsx`)
- [ ] Form fields: name, description, price, category_id, stock
- [ ] Image upload component
- [ ] Submit to create/update API
- [ ] Pre-fill form for edit mode
- [ ] Verify: `npm run build` compiles

### 3.32 Frontend — Admin CategoryList Page
- [ ] Create CategoryList page (`src/pages/admin/categories/CategoryList.tsx`)
- [ ] Fetch categories with admin_api
- [ ] Display category table
- [ ] Add "Create Category" button
- [ ] Verify: `npm run build` compiles

### 3.33 Frontend — Admin CategoryForm Page
- [ ] Create CategoryForm page (`src/pages/admin/categories/CategoryForm.tsx`)
- [ ] Form fields: name, description
- [ ] Submit to create/update API
- [ ] Pre-fill form for edit mode
- [ ] Verify: `npm run build` compiles

### 3.34 Phase 3 — Full Verification
- [ ] Admin can create category
- [ ] Admin can edit category
- [ ] Admin can delete category (if no products)
- [ ] Admin can create product
- [ ] Admin can edit product
- [ ] Admin can delete product
- [ ] Customer can browse products
- [ ] Customer can filter products
- [ ] Customer can sort products
- [ ] Customer can view product detail
- [ ] Product images display correctly

---

## Phase 4: File Upload Enhancements (Thumbnails + Validation)

**Duration:** 1 day

### 4.1 Backend — Upload Middleware
- [ ] Create multer upload middleware (`src/modules/files/middleware/upload.ts`)
- [ ] Configure file size limit (5MB)
- [ ] Configure allowed MIME types
- [ ] Verify: `npm run build` compiles

### 4.2 Backend — Image File Filter
- [ ] Create multer `file_filter` (`src/modules/files/middleware/image_filter.ts`)
- [ ] Allow only image MIME types (jpg, jpeg, png, webp)
- [ ] Reject non-image files
- [ ] Verify: `npm run build` compiles

### 4.3 Backend — Thumbnail Service
- [ ] Create thumbnail service (`src/modules/minio/thumbnail.service.ts`)
- [ ] Generate thumbnails on upload:
  - Products: 200x200, 500x500
  - Avatars: 100x100
  - Categories: 300x300
  - Reviews: 200x200
- [ ] Save thumbnails to MinIO
- [ ] Return thumbnail URLs
- [ ] Verify: `npm run build` compiles

### 4.4 Backend — Multer Config
- [ ] Create multer config (`src/config/multer.config.ts`)
- [ ] Configure storage (`memoryStorage`)
- [ ] Configure file filter
- [ ] Configure limits
- [ ] Verify: `npm run build` compiles

### 4.5 Backend — Enhanced Upload Endpoint
- [ ] Update upload route to use the multer middleware
- [ ] Apply image filter
- [ ] Generate thumbnails based on entity type
- [ ] Save both original and thumbnails
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/files/upload (consumes multipart/form-data, 201)
- [ ] Verify: Upload generates thumbnails

### 4.6 Backend — Multiple Upload Endpoint
- [ ] Implement POST `/api/files/upload/multiple` endpoint
- [ ] Accept max 5 files (`upload.array('files', 5)`)
- [ ] Validate each file (5MB limit, image types)
- [ ] Return array of uploaded files
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/files/upload/multiple (consumes multipart/form-data, 201)
- [ ] Verify: Multiple file upload works

### 4.7 Backend — File Validation
- [ ] Validate file size on upload
- [ ] Validate MIME type on upload
- [ ] Return meaningful error messages
- [ ] Verify: Invalid files rejected with clear error

### 4.8 Frontend — Files API (RTK Query)
- [ ] Create files_api (`src/services/files_api.ts`)
- [ ] Add upload_file mutation
- [ ] Add upload_multiple mutation
- [ ] Add get_files query
- [ ] Add delete_file mutation
- [ ] Verify: `npm run build` compiles

### 4.9 Frontend — use_upload Hook
- [ ] Create use_upload hook (`src/hooks/use_upload.ts`)
- [ ] Manage upload state (loading, progress, error)
- [ ] Handle file selection
- [ ] Handle upload to API
- [ ] Handle error states
- [ ] Verify: `npm run build` compiles

### 4.10 Frontend — SingleUpload Component
- [ ] Create SingleUpload (`src/components/file-upload/SingleUpload.tsx`)
- [ ] Drag & drop area
- [ ] Click to browse
- [ ] Image preview
- [ ] Upload progress indicator
- [ ] Remove button
- [ ] Verify: `npm run build` compiles

### 4.11 Frontend — MultiUpload Component
- [ ] Create MultiUpload (`src/components/file-upload/MultiUpload.tsx`)
- [ ] Multiple file selection (max 5)
- [ ] Grid preview of selected files
- [ ] Individual remove buttons
- [ ] Upload all button
- [ ] Verify: `npm run build` compiles

### 4.12 Frontend — FileUpload Wrapper Component
- [ ] Create FileUpload (`src/components/FileUpload.tsx`)
- [ ] Wrap SingleUpload and MultiUpload
- [ ] Accept mode prop (single/multi)
- [ ] Verify: `npm run build` compiles

### 4.13 Phase 4 — Full Verification
- [ ] Single file upload works
- [ ] Multi file upload works
- [ ] Thumbnails auto-generate (correct sizes per entity type)
- [ ] File size limit enforced (5MB)
- [ ] Invalid file types rejected (only jpg, jpeg, png, webp)
- [ ] Drag & drop works
- [ ] Upload progress shows
- [ ] Error messages display

---

## Phase 5: Cart Functionality

**Duration:** 1-2 days

### 5.1 Backend — Cart Structure
- [ ] Create `CartService` (`src/modules/cart/cart.service.ts`)
- [ ] Create cart controller (`src/modules/cart/cart.controller.ts`)
- [ ] Mount the controller at `/api/cart` in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 5.2 Backend — Cart Validation (zod)
- [ ] Create `add_to_cart_schema` (product_id, quantity ≥ 1)
- [ ] Create `update_cart_schema` (quantity ≥ 1)
- [ ] Apply via `validate(schema)` middleware
- [ ] Verify: `npm run build` compiles

### 5.3 Backend — CartItem Table
- [ ] Add `cart_items` table to `src/db/schema.ts` (user_id, product_id, quantity, unique `(user_id, product_id)`)
- [ ] Add relations to `users` and `products`
- [ ] Regenerate migration (`npm run db:generate`)
- [ ] Verify: `npm run db:migrate` applies the new table (psql `\dt`)

### 5.4 Backend — Add to Cart Endpoint
- [ ] Implement `add_to_cart()` in CartService
- [ ] Check product exists and has stock
- [ ] Check if item already in cart (increment quantity)
- [ ] Create new cart item if not exists
- [ ] Add POST `/api/cart` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/cart (bearer security, body `add_to_cart_schema`, 201, 400, 401, 404, 409)
- [ ] Verify: Add to cart works

### 5.5 Backend — Get Cart Endpoint
- [ ] Implement `get_cart()` in CartService
- [ ] Return cart items with product details
- [ ] Calculate subtotal per item
- [ ] Calculate total
- [ ] Add GET `/api/cart` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/cart (bearer security, 200)
- [ ] Verify: Get cart returns correct data

### 5.6 Backend — Update Cart Endpoint
- [ ] Implement `update_cart_item()` in CartService
- [ ] Validate new quantity
- [ ] Check stock availability
- [ ] Update quantity
- [ ] Add PATCH `/api/cart/:id` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): PATCH /api/cart/:id (bearer security, body `update_cart_schema`, 200, 400, 401, 403, 404, 409)
- [ ] Verify: Update quantity works

### 5.7 Backend — Remove from Cart Endpoint
- [ ] Implement `remove_from_cart()` in CartService
- [ ] Delete cart item
- [ ] Add DELETE `/api/cart/:id` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): DELETE /api/cart/:id (bearer security, 200, 401, 403, 404)
- [ ] Verify: Remove from cart works

### 5.8 Backend — Cart Validation
- [ ] Prevent adding out-of-stock product
- [ ] Prevent quantity exceeding stock
- [ ] Return appropriate error messages
- [ ] Verify: Stock validation works

### 5.9 Frontend — Cart API (RTK Query)
- [ ] Create cart_api (`src/services/cart_api.ts`)
- [ ] Add add_to_cart mutation
- [ ] Add get_cart query
- [ ] Add update_cart mutation
- [ ] Add remove_from_cart mutation
- [ ] Verify: `npm run build` compiles

### 5.10 Frontend — Cart Slice
- [ ] Create cart slice (`src/store/slices/cart_slice.ts`)
- [ ] Add cart_count state
- [ ] Add update_cart_count action
- [ ] Sync with localStorage
- [ ] Verify: `npm run build` compiles

### 5.11 Frontend — QuantitySelector Component
- [ ] Create QuantitySelector (`src/components/QuantitySelector.tsx`)
- [ ] Decrease button
- [ ] Quantity display
- [ ] Increase button
- [ ] Min/max limits
- [ ] Verify: `npm run build` compiles

### 5.12 Frontend — CartItem Component
- [ ] Create CartItem (`src/components/cart/CartItem.tsx`)
- [ ] Display product image
- [ ] Display product name
- [ ] Display unit price
- [ ] QuantitySelector
- [ ] Line total
- [ ] Remove button
- [ ] Verify: `npm run build` compiles

### 5.13 Frontend — OrderSummary Component
- [ ] Create OrderSummary (`src/components/cart/OrderSummary.tsx`)
- [ ] Display subtotal
- [ ] Display shipping (flat rate)
- [ ] Display tax
- [ ] Display total
- [ ] Checkout button
- [ ] Verify: `npm run build` compiles

### 5.14 Frontend — Cart Page
- [ ] Create Cart page (`src/pages/customer/Cart.tsx`)
- [ ] Fetch cart with cart_api
- [ ] Display list of CartItems
- [ ] Display OrderSummary
- [ ] Empty cart message
- [ ] Verify: Cart page loads correctly (Lightpanda)

### 5.15 Frontend — CartDrawer Component
- [ ] Create CartDrawer (`src/components/cart/CartDrawer.tsx`) — follow `ux-ui/` drawer (`min(420px, 100vw)` right slide-over)
- [ ] Cart icon trigger with count badge
- [ ] Slide-out drawer (quick-access surface next to the full `/cart` page — no hover MiniCart)
- [ ] Item list (name, qty, price)
- [ ] OrderSummary (subtotal/shipping/tax/total from `GET /api/cart`)
- [ ] View Cart link
- [ ] Verify: `npm run build` compiles

### 5.16 Frontend — Header Integration
- [ ] Add CartDrawer trigger to Header
- [ ] Update cart count on add/remove
- [ ] Verify: Cart count updates in real-time (Lightpanda: add to cart → count badge updates)

### 5.17 Phase 5 — Full Verification
- [ ] Add to cart from product page
- [ ] Cart count updates in header
- [ ] Cart page shows all items
- [ ] Update quantity works
- [ ] Remove item works
- [ ] Cart totals calculate correctly
- [ ] Stock validation prevents overselling
- [ ] Cart persists across refreshes

---

## Phase 6: Checkout + Stripe

**Duration:** 2-3 days

### 6.1 Backend — Stripe Service
- [ ] Create `StripeService` (`src/modules/stripe/stripe.service.ts`)
- [ ] Configure Stripe client from secret key + webhook secret
- [ ] Verify: `npm run build` compiles

### 6.2 Backend — Stripe Service
- [ ] Implement `create_checkout_session(order_id)` against an existing `PENDING` order (order-first: order was created first by `POST /api/orders`)
- [ ] Configure session from order fields (amount from order `total`, no cart re-derivation)
- [ ] Configure success URL with `{CHECKOUT_SESSION_ID}` and cancel URL
- [ ] Attach `order_id` to the session (client_reference_id/metadata)
- [ ] Return `{ order_id, session_id, url }`
- [ ] Verify: `npm run build` compiles

### 6.3 Backend — Checkout Structure
- [ ] Create `CheckoutService` (`src/modules/checkout/checkout.service.ts`)
- [ ] Create checkout controller (`src/modules/checkout/checkout.controller.ts`)
- [ ] Mount the controller at `/api/checkout` in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 6.4 Backend — Order Tables
- [ ] Add `orders` table to `src/db/schema.ts` (id, user_id, status enum, total/shipping/tax `numeric`, stripe_session_id?, shipping_address `jsonb`)
- [ ] Add `order_items` table (order_id, product_id, quantity, price — price snapshot at creation)
- [ ] Add `payments` table
- [ ] Add relations
- [ ] Add shipping/tax `numeric` columns to orders (pricing rule: flat $5, free ≥$100; tax 8.25%; snapshot at creation)
- [ ] Regenerate migration (`npm run db:generate`)
- [ ] Verify: `npm run db:migrate` applies the new tables (psql `\dt`)

### 6.5 Backend — Order-First Checkout
- [ ] Implement `POST /api/orders` — creates order as `PENDING` from the user's cart, storing `shipping`, `tax`, `total`, `shipping_address` (per `system-design.md` §3.4)
- [ ] Validate cart is not empty, items in stock before creating order
- [ ] Implement `POST /api/checkout/create-session` — accepts `{ order_id }`, verifies order is the user's own `PENDING`, calls Stripe service, returns `data.url`
- [ ] Add routes (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/orders + POST /api/checkout/create-session (bearer security, 201, 400, 401, 404, 409)
- [ ] Verify: `POST /api/orders` + `create-session` produce a Stripe checkout URL

### 6.6 Backend — Stripe Webhook Handler
- [ ] Implement webhook handler in `checkout.controller.ts`
- [ ] Verify webhook signature
- [ ] Handle `checkout.session.completed` event
- [ ] Resolve the order via `order_id` (client_reference_id/metadata) — do **not** create a new order
- [ ] Flip order status `PENDING → PAID`
- [ ] Create payment record
- [ ] Decrement product stock
- [ ] Clear user cart
- [ ] Add POST `/api/webhook/stripe` route
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/webhook/stripe (raw body, 200, 400)
- [ ] Verify: Webhook processes correctly

### 6.7 Backend — Checkout Validation
- [ ] Validate order exists and belongs to the user
- [ ] Validate order status is `PENDING` (reject already-paid/cancelled)
- [ ] Validate order total > 0
- [ ] Return meaningful errors
- [ ] Verify: Validation works

### 6.8 Frontend — Checkout API (RTK Query)
- [ ] Create checkout_api (`src/services/checkout_api.ts`)
- [ ] Add create_order mutation (`POST /api/orders`)
- [ ] Add create_session mutation (`POST /api/checkout/create-session`)
- [ ] Verify: `npm run build` compiles

### 6.9 Frontend — Card Redirect (Stripe Hosted Checkout)
- [ ] On `[Pay]`: `POST /api/orders` → `POST /api/checkout/create-session` → `window.location = data.url` (redirect, no Stripe Elements/Card Element on our page)
- [ ] Define success URL `/order/success?session_id={CHECKOUT_SESSION_ID}` and cancel URL `/cart`
- [ ] Verify: `npm run build` compiles

### 6.10 Frontend — AddressForm Component
- [ ] Create AddressForm (`src/components/checkout/AddressForm.tsx`)
- [ ] Form fields: line1, line2 (optional), city, state, zip, country
- [ ] Saved-address preselect (`label`, `is_default`) + "+ New address"
- [ ] Form validation
- [ ] Verify: `npm run build` compiles

### 6.11 Frontend — Payment Form (Stripe Hosted Checkout)
- [ ] Radio: Credit/Debit Card (Stripe secure checkout) — hosted, no card fields on our page
- [ ] `[Pay $..]` button with double-submit lock
- [ ] Error handling: `422 PAYMENT_FAILED` → error state with retry
- [ ] Verify: `npm run build` compiles

### 6.12 Frontend — Checkout OrderSummary Component
- [ ] Create OrderSummary (`src/components/checkout/OrderSummary.tsx`)
- [ ] Display cart items
- [ ] Display subtotal, shipping, tax, total (from `GET /api/cart`, never computed client-side)
- [ ] Verify: `npm run build` compiles

### 6.13 Frontend — Checkout Page
- [ ] Create Checkout page (`src/pages/customer/Checkout.tsx`)
- [ ] Step 1: Shipping address (AddressForm)
- [ ] Step 2: Review & Pay (OrderSummary + Payment)
- [ ] Submit: create order → create session → redirect to Stripe
- [ ] Verify: Checkout flow works (Lightpanda: order → Stripe checkout URL reached)

### 6.14 Frontend — OrderConfirmation Page
- [ ] Create OrderConfirmation page (`src/pages/customer/OrderConfirmation.tsx`)
- [ ] Resolve the order via `?session_id` (+ `order_id` from create-session response) → `GET /api/orders/:id` (owner-gated)
- [ ] Display success message
- [ ] Display order number
- [ ] Display order summary (authoritative snapshot: total, shipping, tax)
- [ ] Continue shopping button
- [ ] Verify: Confirmation page displays (Lightpanda)

### 6.15 Phase 6 — Full Verification
- [ ] Complete checkout flow works (order-first: POST /api/orders → create-session → Stripe redirect)
- [ ] Stripe test card succeeds (4242...)
- [ ] Failed card shows error
- [ ] Order created in database as `PENDING` before redirect, flipped to `PAID` by webhook
- [ ] Payment record created
- [ ] Stock decremented
- [ ] Cart cleared after purchase
- [ ] Confirmation page displays verified order
- [ ] Order not found / not PENDING on create-session → `400`

---

## Phase 7: Orders + Profile

**Duration:** 2 days

### 7.1 Backend — Orders Structure
- [ ] Create `OrdersService` (`src/modules/orders/orders.service.ts`)
- [ ] Create orders controller (`src/modules/orders/orders.controller.ts`)
- [ ] Mount the controller at `/api/orders` in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 7.2 Backend — Orders Validation (zod)
- [ ] Create `update_order_status_schema` (status enum)
- [ ] Apply via `validate(schema)` middleware
- [ ] Verify: `npm run build` compiles

### 7.3 Backend — List Orders Endpoint
- [ ] Implement `find_all()` in OrdersService
- [ ] Filter by current user
- [ ] Include order items
- [ ] Add pagination
- [ ] Add GET `/api/orders` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/orders (bearer security, 200)
- [ ] Verify: User can list their orders

### 7.4 Backend — Get Order Endpoint
- [ ] Implement `find_one()` in OrdersService
- [ ] Include order items and payment
- [ ] Verify user owns the order
- [ ] Add GET `/api/orders/:id` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/orders/:id (bearer security, 200, 401, 403, 404)
- [ ] Verify: User can get order detail

### 7.5 Backend — Admin Update Order Status Endpoint
- [ ] Implement `update_status()` in OrdersService
- [ ] Validate status is valid enum
- [ ] Enforce legal transitions (PENDING→PAID|CANCELLED, PAID→SHIPPED|CANCELLED, SHIPPED→DELIVERED|CANCELLED) — `400 Invalid status transition`
- [ ] Update order status
- [ ] Add PATCH `/api/admin/orders/:id/status` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): PATCH /api/admin/orders/:id/status (bearer security, body `update_order_status_schema`, 200, 400, 401, 403, 404)
- [ ] Verify: Admin can update order status

### 7.6 Backend — Address Table
- [ ] Add `addresses` table to `src/db/schema.ts` (user_id, label, line1/line2, city, state, zip, country, is_default)
- [ ] Add relation to `users`
- [ ] Regenerate migration (`npm run db:generate`)
- [ ] Verify: `npm run db:migrate` applies the new table (psql `\dt`)

### 7.7 Backend — Profile Endpoints
- [ ] Implement `get_profile()` in UsersService
- [ ] Implement `update_profile()` in UsersService
- [ ] Add GET `/api/users/me` route (protected, `require_auth`)
- [ ] Add PATCH `/api/users/me` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET/PATCH /api/users/me (bearer security, 200, 400, 401, 404)
- [ ] Verify: Profile get/update works

### 7.8 Backend — Address Endpoints
- [ ] Implement `create_address()` in UsersService
- [ ] Implement `update_address()` in UsersService
- [ ] Implement `delete_address()` in UsersService
- [ ] Implement `get_addresses()` in UsersService
- [ ] Add address routes (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): /api/users/me/address CRUD (bearer security, 200/201, 400, 401, 403, 404)
- [ ] Verify: Address CRUD works

### 7.9 Frontend — Orders API (RTK Query)
- [ ] Create orders_api (`src/services/orders_api.ts`)
- [ ] Add get_orders query
- [ ] Add get_order query
- [ ] Verify: `npm run build` compiles

### 7.10 Frontend — Users API (RTK Query)
- [ ] Create users_api (`src/services/users_api.ts`)
- [ ] Add get_profile query
- [ ] Add update_profile mutation
- [ ] Add get_addresses query
- [ ] Add create_address mutation
- [ ] Add update_address mutation
- [ ] Add delete_address mutation
- [ ] Verify: `npm run build` compiles

### 7.11 Frontend — OrderStatusBadge Component
- [ ] Create OrderStatusBadge (`src/components/orders/OrderStatusBadge.tsx`)
- [ ] Color-coded status (pending=yellow, paid=green, shipped=blue, delivered=green, cancelled=red)
- [ ] Verify: `npm run build` compiles

### 7.12 Frontend — OrderList Component
- [ ] Create OrderList (`src/components/orders/OrderList.tsx`)
- [ ] Display order number, date, total, status
- [ ] Link to order detail
- [ ] Verify: `npm run build` compiles

### 7.13 Frontend — OrderDetail Component
- [ ] Create OrderDetail (`src/components/orders/OrderDetail.tsx`)
- [ ] Display order items
- [ ] Display shipping address
- [ ] Display payment info
- [ ] Display order status
- [ ] Verify: `npm run build` compiles

### 7.14 Frontend — Orders Page
- [ ] Create Orders page (`src/pages/customer/Orders.tsx`)
- [ ] Fetch orders with orders_api
- [ ] Display OrderList
- [ ] Empty orders message
- [ ] Verify: Orders page loads (Lightpanda)

### 7.15 Frontend — OrderDetail Page
- [ ] Create OrderDetail page (`src/pages/customer/OrderDetail.tsx`)
- [ ] Fetch order by ID
- [ ] Display OrderDetail component
- [ ] Verify: Order detail page loads (Lightpanda)

### 7.16 Frontend — UserInfo Component
- [ ] Create UserInfo (`src/components/profile/UserInfo.tsx`)
- [ ] Display user info (name, email)
- [ ] Edit button
- [ ] Verify: `npm run build` compiles

### 7.17 Frontend — AddressList Component
- [ ] Create AddressList (`src/components/profile/AddressList.tsx`)
- [ ] Display list of addresses
- [ ] Edit button per address
- [ ] Delete button per address
- [ ] Add address button
- [ ] Verify: `npm run build` compiles

### 7.18 Frontend — AddressForm Component
- [ ] Create AddressForm (`src/components/profile/AddressForm.tsx`)
- [ ] Form fields: line1, line2, city, state, zip, country
- [ ] Form validation
- [ ] Submit to create/update API
- [ ] Verify: `npm run build` compiles

### 7.19 Frontend — Profile Page (Zitadel-linked)
- [ ] Create Profile page (`src/pages/customer/Profile.tsx`)
- [ ] Display `UserInfo` (name, phone, avatar — profile fields owned by our app, updated via PATCH `/api/users/me`)
- [ ] Display `AddressList`
- [ ] Add a "Manage password" link that opens Zitadel's end-user UI in a new tab (password/MFA/forgot-password live there; system-design §3.1)
- [ ] Verify: Profile page loads (Lightpanda); password link points at Zitadel's end-session/consent URL

### 7.21 Phase 7 — Full Verification
- [ ] Order history displays correctly
- [ ] Order detail shows all info
- [ ] Admin can update order status
- [ ] Profile displays correctly
- [ ] Profile edit works
- [ ] Address CRUD works
- [ ] Password change works

---

## Phase 8: Reviews (with images)

**Duration:** 1 day

### 8.1 Backend — Reviews Structure
- [ ] Create `ReviewsService` (`src/modules/reviews/reviews.service.ts`)
- [ ] Create reviews controller (`src/modules/reviews/reviews.controller.ts`)
- [ ] Mount the controller at `/api/reviews` (and `/api/products/:id/reviews`) in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 8.2 Backend — Reviews Validation (zod)
- [ ] Create `create_review_schema` (rating 1–5, comment?, image_ids? ≤ 5)
- [ ] Add validation (rating 1-5, required fields)
- [ ] Verify: `npm run build` compiles

### 8.3 Backend — ReviewImage Table
- [ ] Add `review_images` table to `src/db/schema.ts` (review_id, file_id, unique `(review_id, file_id)`, cascade on review delete)
- [ ] Add relations to `reviews` and `files`
- [ ] Regenerate migration (`npm run db:generate`)
- [ ] Verify: `npm run db:migrate` applies the new table (psql `\dt`)

### 8.4 Backend — Create Review Endpoint
- [ ] Implement `create()` in ReviewsService
- [ ] Verify user purchased the product
- [ ] Prevent duplicate reviews
- [ ] Create review in database
- [ ] Add POST `/api/products/:id/reviews` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): POST /api/products/:id/reviews (bearer security, body `create_review_schema`, 201, 400, 401, 403, 404, 409)
- [ ] Verify: Create review works

### 8.5 Backend — List Reviews Endpoint
- [ ] Implement `find_all()` in ReviewsService
- [ ] Filter by product ID
- [ ] Include images
- [ ] Include user info (name only)
- [ ] Add GET `/api/products/:id/reviews` route (public)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/products/:id/reviews (200)
- [ ] Verify: List reviews works

### 8.6 Backend — Delete Review Endpoint
- [ ] Implement `remove()` in ReviewsService
- [ ] Verify user owns the review
- [ ] Delete review images from MinIO
- [ ] Delete review from database
- [ ] Add DELETE `/api/reviews/:id` route (protected, `require_auth`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): DELETE /api/reviews/:id (bearer security, 200, 401, 403, 404)
- [ ] Verify: Delete own review works

### 8.7 Backend — Review Validation
- [ ] Verify user purchased product before reviewing
- [ ] Prevent duplicate reviews per user per product
- [ ] Validate rating is 1-5
- [ ] Verify: Validation works

### 8.8 Frontend — Reviews API (RTK Query)
- [ ] Create reviews_api (`src/services/reviews_api.ts`)
- [ ] Add get_reviews query
- [ ] Add create_review mutation
- [ ] Add delete_review mutation
- [ ] Verify: `npm run build` compiles

### 8.9 Frontend — StarRating Component
- [ ] Create StarRating (`src/components/reviews/StarRating.tsx`)
- [ ] Display 5 stars
- [ ] Interactive hover
- [ ] Click to select rating
- [ ] Read-only mode
- [ ] Verify: `npm run build` compiles

### 8.10 Frontend — ReviewCard Component
- [ ] Create ReviewCard (`src/components/reviews/ReviewCard.tsx`)
- [ ] Display user name
- [ ] Display StarRating
- [ ] Display title and comment
- [ ] Display date
- [ ] Delete button (own reviews only)
- [ ] Verify: `npm run build` compiles

### 8.11 Frontend — ReviewImages Component
- [ ] Create ReviewImages (`src/components/reviews/ReviewImages.tsx`)
- [ ] Display review images in grid
- [ ] Click to enlarge (modal)
- [ ] Verify: `npm run build` compiles

### 8.12 Frontend — ReviewForm Component
- [ ] Create ReviewForm (`src/components/reviews/ReviewForm.tsx`)
- [ ] StarRating selector
- [ ] Title input
- [ ] Comment textarea
- [ ] Image upload (optional)
- [ ] Submit button
- [ ] Verify: `npm run build` compiles

### 8.13 Frontend — ReviewList Component
- [ ] Create ReviewList (`src/components/reviews/ReviewList.tsx`)
- [ ] Display list of ReviewCards
- [ ] Empty reviews message
- [ ] Verify: `npm run build` compiles

### 8.14 Frontend — ReviewSection Component
- [ ] Create ReviewSection (`src/components/reviews/ReviewSection.tsx`)
- [ ] Average rating display
- [ ] ReviewForm (if eligible)
- [ ] ReviewList
- [ ] Verify: `npm run build` compiles

### 8.15 Frontend — Integrate Reviews in ProductDetail
- [ ] Add ReviewSection to ProductDetail page
- [ ] Fetch reviews for product
- [ ] Verify: Reviews show on product page (Lightpanda)

### 8.16 Phase 8 — Full Verification
- [ ] Create review works
- [ ] Review displays on product page
- [ ] Star rating is interactive
- [ ] Only own reviews can be deleted
- [ ] Review images display
- [ ] Cannot review same product twice
- [ ] Must have purchased to review

---

## Phase 9: Admin Dashboard

**Duration:** 2-3 days

### 9.1 Backend — Admin Structure
- [ ] Create `AdminService` (`src/modules/admin/admin.service.ts`)
- [ ] Create admin controller (`src/modules/admin/admin.controller.ts`)
- [ ] Mount the controller at `/api/admin` in `src/app.ts`
- [ ] Verify: `npm run build` compiles

### 9.2 Backend — Admin Stats Endpoint
- [ ] Implement `get_stats()` in AdminService
- [ ] Count total users
- [ ] Count total products
- [ ] Count total orders
- [ ] Calculate total revenue
- [ ] Count new users this week
- [ ] Count orders this week
- [ ] Count low stock products (stock <= 5)
- [ ] Get recent orders (last 10)
- [ ] Calculate sales by day (revenue per day)
- [ ] Add GET `/api/admin/stats` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/admin/stats (bearer security, 200, 403)
- [ ] Verify: Stats endpoint returns all fields

### 9.3 Backend — Admin Orders Endpoint
- [ ] Implement `get_all_orders()` in AdminService
- [ ] Include user info
- [ ] Include order items
- [ ] Add pagination (page, limit)
- [ ] Add filters: status, date_from, date_to (ISO dates)
- [ ] Add GET `/api/admin/orders` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/admin/orders (bearer security, 200, 403)
- [ ] Verify: Admin can list all orders with filters

### 9.4 Backend — Admin Products Endpoint
- [ ] Implement `get_all_products()` in AdminService
- [ ] Include category
- [ ] Include images
- [ ] Add pagination (page, limit)
- [ ] Add filters: search (by name), category_id, stock ("in_stock" | "out_of_stock" | "low")
- [ ] Add GET `/api/admin/products` route (admin only, `require_role('USER', 'ADMIN')`)
- [ ] OpenAPI (deferred w/ 1.5.5 → tsoa auto-gen): GET /api/admin/products (bearer security, 200, 403)
- [ ] Verify: Admin can list all products with filters

### 9.5 Frontend — Admin API Updates
- [ ] Add get_stats query to admin_api
- [ ] Add get_all_orders query to admin_api (with status, date_from, date_to filters)
- [ ] Add get_all_products query to admin_api (with search, category_id, stock filters)
- [ ] Verify: `npm run build` compiles

### 9.6 Frontend — StatsCards Component
- [ ] Create StatsCards (`src/components/admin/StatsCards.tsx`)
- [ ] Total Users card
- [ ] Total Products card
- [ ] Total Orders card
- [ ] Total Revenue card
- [ ] Verify: `npm run build` compiles

### 9.7 Frontend — SalesChart Component
- [ ] Create SalesChart (`src/components/admin/SalesChart.tsx`)
- [ ] Install `recharts`
- [ ] Line chart for revenue over time
- [ ] Responsive container
- [ ] Verify: `npm run build` compiles

### 9.8 Frontend — RecentOrders Component
- [ ] Create RecentOrders (`src/components/admin/RecentOrders.tsx`)
- [ ] Display last 10 orders
- [ ] Order number, customer, total, status
- [ ] Link to order detail
- [ ] Verify: `npm run build` compiles

### 9.9 Frontend — Dashboard Page
- [ ] Create Dashboard page (`src/pages/admin/Dashboard.tsx`)
- [ ] Fetch stats with admin_api
- [ ] Display StatsCards
- [ ] Display SalesChart
- [ ] Display RecentOrders
- [ ] Verify: Dashboard page loads (Lightpanda)

### 9.10 Frontend — Admin OrderTable Component
- [ ] Create OrderTable (`src/components/admin/OrderTable.tsx`)
- [ ] Display all order columns
- [ ] Status filter
- [ ] Link to order detail
- [ ] Verify: `npm run build` compiles

### 9.11 Frontend — Admin OrderList Page
- [ ] Create OrderList page (`src/pages/admin/orders/OrderList.tsx`)
- [ ] Fetch orders with admin_api
- [ ] Display OrderTable
- [ ] Add pagination
- [ ] Verify: Order list page loads (Lightpanda)

### 9.12 Frontend — Admin Order Status Update
- [ ] Add status update to order detail
- [ ] Dropdown for status selection
- [ ] Call update_status API
- [ ] Verify: Status update works

### 9.13 Phase 9 — Full Verification
- [ ] Dashboard shows correct stats (all fields)
- [ ] Charts render with data
- [ ] Recent orders display
- [ ] Admin order list works with filters (status, date range)
- [ ] Admin product list works with filters (search, category, stock)
- [ ] Admin can update order status
- [ ] All admin pages responsive

---

## Phase 10: Polish + Responsive

**Duration:** 2-3 days

### 10.1 Frontend — Header Component
- [ ] Create Header (`src/components/layout/Header.tsx`)
- [ ] Logo
- [ ] Navigation links
- [ ] Search bar
- [ ] User menu (sign in via Zitadel or profile/logout)
- [ ] Cart Drawer trigger (opens CartDrawer)
- [ ] Verify: `npm run build` compiles

### 10.2 Frontend — Footer Component
- [ ] Create Footer (`src/components/layout/Footer.tsx`)
- [ ] Company info
- [ ] Quick links
- [ ] Social media links
- [ ] Copyright
- [ ] Verify: `npm run build` compiles

### 10.3 Frontend — MobileMenu Component
- [ ] Create MobileMenu (`src/components/layout/MobileMenu.tsx`)
- [ ] Hamburger button
- [ ] Slide-out menu
- [ ] Navigation links
- [ ] Close button
- [ ] Verify: `npm run build` compiles

### 10.4 Frontend — SearchBar Component
- [ ] Create SearchBar (`src/components/SearchBar.tsx`)
- [ ] Search input
- [ ] Search icon
- [ ] Debounced search
- [ ] Redirect to products page with query
- [ ] Verify: `npm run build` compiles

### 10.5 Frontend — Skeleton Component
- [ ] Create Skeleton (`src/components/ui/Skeleton.tsx`)
- [ ] Animated placeholder
- [ ] Multiple variants (text, card, image)
- [ ] Verify: `npm run build` compiles

### 10.6 Frontend — Spinner Component
- [ ] Create Spinner (`src/components/ui/Spinner.tsx`)
- [ ] Loading animation
- [ ] Size variants
- [ ] Verify: `npm run build` compiles

### 10.7 Frontend — ErrorBoundary Component
- [ ] Create ErrorBoundary (`src/components/ErrorBoundary.tsx`)
- [ ] Catch rendering errors
- [ ] Display fallback UI
- [ ] Retry button
- [ ] Verify: `npm run build` compiles

### 10.8 Frontend — Toast Component
- [ ] Create Toast (`src/components/ui/Toast.tsx`)
- [ ] Success toast (green)
- [ ] Error toast (red)
- [ ] Info toast (blue)
- [ ] Auto-dismiss
- [ ] Manual dismiss
- [ ] Verify: `npm run build` compiles

### 10.9 Frontend — Loading States
- [ ] Add Skeleton to product list page
- [ ] Add Skeleton to product detail page
- [ ] Add Spinner to form submissions
- [ ] Add Spinner to page transitions
- [ ] Verify: Loading states display correctly

### 10.10 Frontend — Error Handling
- [ ] Add ErrorBoundary to App
- [ ] Add error toasts for API failures
- [ ] Add 404 page
- [ ] Verify: Error handling works

### 10.11 Frontend — Responsive Header
- [ ] Mobile: hamburger menu
- [ ] Tablet: condensed nav
- [ ] Desktop: full nav
- [ ] Verify: Header responsive

### 10.12 Frontend — Responsive Product Grid
- [ ] Mobile: 1 column
- [ ] Tablet: 2 columns
- [ ] Desktop: 3-4 columns
- [ ] Verify: Grid responsive

### 10.13 Frontend — Responsive Cart
- [ ] Mobile: full width items
- [ ] Tablet: side by side
- [ ] Desktop: standard layout
- [ ] Verify: Cart responsive (Lightpanda: narrow viewport)

### 10.14 Frontend — Responsive Admin
- [ ] Mobile: collapsible sidebar
- [ ] Tablet: narrow sidebar
- [ ] Desktop: full sidebar
- [ ] Verify: Admin responsive (Lightpanda: narrow viewport)

### 10.15 Frontend — 404 Page
- [ ] Create NotFound page (`src/pages/NotFound.tsx`)
- [ ] Display 404 message
- [ ] Link to home
- [ ] Verify: 404 page works (Lightpanda: unknown route renders 404)

### 10.16 Frontend — SEO Metadata
- [ ] Add title to index.html
- [ ] Add meta description
- [ ] Add Open Graph tags
- [ ] Verify: SEO metadata present

### 10.17 Documentation
- [ ] Create `frontend/.env.example`
- [ ] Create `backend/.env.example`
- [ ] Create `frontend/README.md` with setup instructions
- [ ] Create `backend/README.md` with setup instructions
- [ ] Verify: Documentation complete

### 10.18 Phase 10 — Full Verification
- [ ] All pages responsive (375px, 768px, 1280px)
- [ ] Loading states work
- [ ] Error handling works
- [ ] Toast notifications work
- [ ] 404 page works
- [ ] No console errors
- [ ] App is production-ready

---

## Final Project Verification

- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Database migrations applied
- [ ] Seed data present
- [ ] All API endpoints tested
- [ ] All frontend pages tested
- [ ] Auth flow complete
- [ ] Product catalog works
- [ ] Cart functionality works
- [ ] Checkout flow works
- [ ] Order management works
- [ ] Admin dashboard works
- [ ] Reviews system works
- [ ] File upload works
- [ ] Responsive design works
- [ ] Error handling works
- [ ] Loading states work
- [ ] Toast notifications work
