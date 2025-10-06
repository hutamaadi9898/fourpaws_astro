# Pet Memorial Website Generator Plan

## Phase 0 – Vision & Architecture
- Clarify success criteria: private memorial generator with single-owner access.
- Maintain a single monolith repository combining Astro UI, API routes, and shared domain logic.
- Confirm stack choice: Astro + React + TypeScript, Tailwind, shadcn/ui, Framer Motion, Node.js API layer with pg + Drizzle ORM on Postgres.
- Outline deployment target (e.g., Vercel + managed Postgres) and hosting constraints.

## Phase 1 – Project Foundation
1. Verify Node.js LTS, package manager, and Astro CLI versions; install dependencies.
2. Enable TypeScript strict mode and configure path aliases for shared modules.
3. Install Tailwind, shadcn/ui, Framer Motion; scaffold Tailwind config and base styles.
4. Create environment variable scaffolding (.env, .env.example) covering database URL, session secrets, storage bucket credentials.

## Phase 2 – Database & Access Control
1. Design Drizzle schema for users, pets, memorial_pages, media_assets, themes tables.
2. Implement Drizzle migration scripts with drizzle-kit; seed single admin user with hashed password.
3. Build Node Postgres pool + Drizzle client module, adding zod-based result validators.
4. Implement session-backed auth (cookie-based) and login/logout endpoints restricted to the admin user.

## Phase 3 – Core API & Services
1. Define Astro server endpoints (REST or RPC) for pets, memorial pages, media uploads, publish actions.
2. Add service layer logic: slug generation, draft vs published states, media ordering, validations.
3. Wire storage adapter (local filesystem first) with clear interface to swap for S3-compatible storage later.
4. Add rate limiting and input validation middleware to protect admin-only routes.

## Phase 4 – Admin Experience
1. Scaffold protected admin layout with shadcn/ui navigation, breadcrumbs, and auth guard.
2. Create CRUD React islands for pets and memorial content with optimistic UI states where sensible.
3. Implement memorial preview page using Astro content collections + Framer Motion transitions.
4. Add theming controls (palette, typography presets) persisted per memorial record.

## Phase 5 – Public Memorial Delivery
1. Render published memorial pages via Astro routes pulling data from Postgres/Drizzle queries.
2. Implement static snapshot generation or caching on publish for low-latency delivery.
3. Handle SEO metadata and Open Graph images per memorial; consider dynamic image generation.
4. Add optional guestbook module with moderation toggle controlled from admin panel.

## Phase 6 – Quality & Operations
1. Configure linting (ESLint, Prettier), type-check, and test scripts (Vitest or Playwright) in package.json.
2. Add integration tests hitting API endpoints against a test Postgres schema.
3. Set up CI workflow: install, lint, type-check, test, build, apply migrations.
4. Document deployment steps, Postgres provisioning, image hosting setup, backup routine, and credential rotation.
5. Schedule milestone reviews after each phase to adjust scope and ensure feature parity with vision.

