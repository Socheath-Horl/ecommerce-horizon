# E-Commerce — Agent Instructions

## Communication Style

- **Explain every step like a tutor teaching a student** — break down what you're doing and why before doing it
- Use simple, clear language
- Don't assume the user knows the context — walk them through it
- **For every step, explain:**
  - **What it does** — describe the concept or code
  - **How it works** — show the mechanism or syntax
  - **Why use it** — explain the benefit or problem it solves
  - **How they work together** — show how components connect
- **Show file diff before asking permission** — let the user see what changes will be made before approving
- **Always ask for permission before creating or editing files** — never make changes without user approval

## Tech Stack

**Frontend:** Vite + React + TypeScript, Tailwind CSS + shadcn/ui, Redux Toolkit + RTK Query

**Backend:** Express + TypeScript, Drizzle ORM + PostgreSQL (`pg`), self-hosted Zitadel (OIDC / Authorization Code + PKCE), `zod` validation, Stripe, MinIO

## Backend Structure (NestJS-inspired, plain Express)

- Each feature lives in `src/modules/<feature>/`: `*.controller.ts` (routes + req/res mapping), `*.service.ts` (business logic), `*.dto.ts` (zod schemas)
- Controllers expose `static routes(): Router`; services are constructed manually (no DI container)
- `src/common/` holds cross-cutting concerns: `filters/` (error handlers), `middleware/` (validate, require_auth, require_role), `interceptors/`
- `src/app.ts` = root module (global middleware + mounting); `src/index.ts` = bootstrap

## Rules

- **Project scaffolding:** Always run CLI commands to create projects (frontend: `npm create vite@latest`; backend: `npm init` + targeted `npm install`). Never create project files from scratch.
- **Package installation:** Always install with latest compatible version. Use `npm install <package>@latest` or `npx shadcn@latest add`.
- **Imports:** Always use `@/` alias prefix for imports (e.g., `import { Button } from '@/components/ui/button'`).

## Key Commands

### Backend
```bash
cd backend
npm run build              # Compile TypeScript
npm run start:dev          # Dev server on port 3000
npm run db:generate        # Generate SQL migration (drizzle-kit)
npm run db:migrate         # Apply migrations to PostgreSQL
npm run db:seed            # Seed database (tsx src/db/seed.ts)
```

### Frontend
```bash
cd frontend
npm run build              # Production build
npm run dev                # Dev server on port 5173
npm run lint               # Run ESLint
npx shadcn@latest add <component>  # Add shadcn/ui component
```

### Frontend Verification (headless)
- **Verify frontend end-to-end with the Lightpanda headless browser** (lightpanda.io — a standalone binary, NOT an npm package — install it separately; confirm Windows support/availability before relying on it)
- Workflow: `npm run dev` (or `preview` of a production build), then point Lightpanda at the app URL and assert the page renders and client flows (Zitadel sign-in redirect, PKCE callback, routing, protected redirects) execute/succeed
- Read results from Lightpanda's dumped DOM/output instead of a manual browser

## API Conventions

**Response format:** `{ success: boolean, data?: T, message?: string, error?: { code, message, details } }`

**Auth:** self-hosted **Zitadel** (OIDC). The SPA redirects to Zitadel's hosted login, exchanges the code via PKCE, and sends the access token as `Bearer` in the `Authorization` header. The backend verifies tokens against Zitadel's JWKS (`jose`); `users.id` = Zitadel `sub`. Access token short-lived, refresh token in localStorage (refreshed directly against Zitadel, not our API). No passwords ever stored by us.

**Base URL:** `http://localhost:3000/api`

## Role System

| Role | Access |
|------|--------|
| GUEST | Browse products only |
| CUSTOMER | + Cart, checkout, orders, reviews, profile |
| USER | + Admin portal (limited) |
| ADMIN | + Manage users, full access |

Guards: `requireAuth` middleware for protected routes, `requireRole(...)` middleware factory for role-based access.

## Database Conventions

- UUIDs for all primary keys (`uuid('id').primaryKey().defaultRandom()` in `src/db/schema.ts`)
- Slugs for URL-friendly identifiers (products, categories)
- `files` table tracks all uploads (MinIO + DB record)
- `entityType` + `entityId` pattern for polymorphic file associations
- Timestamps: `createdAt` (DB default), `updatedAt` (set by the app) on all tables

## Running Order

When implementing phases:
1. Run `npm run db:generate` after any schema change, then `npm run db:migrate` to apply it
2. Run `npm run build` after code changes to verify compilation

## Important Notes

- **No Docker for deployment** — only for local MinIO, PostgreSQL, and Zitadel
- **Single React app** with role-based routing (`/` customer, `/admin` admin)
- **Stripe test mode** — use `4242 4242 4242 4242` for test cards
- **MinIO required** — file uploads depend on MinIO running locally (Docker on port 9000, console on 9001)
- **Zitadel required (local)** — self-hosted OIDC on port 8080; console at `http://localhost:8080/ui/console`; SPA client ID goes in `ZITADEL_CLIENT_ID` (see `system-design.md` §8 Local Zitadel Setup)
- Reference: `system-design.md` (DB schema, API endpoints), `implement-plan.md` (task checklist)
