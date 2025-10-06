# Deploying to Coolify with Nixpacks

This project ships as an Astro Node server that also runs database-backed API routes. Follow the checklist below each time you push a build to Coolify.

## 1. Prerequisites
- Coolify stack with the **Nixpacks** builder.
- Postgres 15+ provisioned (Coolify service or external).
- Environment variables configured for the Astro service:
  - `DATABASE_URL` – full Postgres URI (e.g. `postgres://user:pass@host:5432/db`).
  - `SESSION_SECRET` – random string ≥ 32 chars.
  - `STORAGE_ROOT` – optional; defaults to `./storage`. Keep the Coolify volume path here if you mount persistent storage.
  - `NODE_ENV=production`.
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` – only needed for seeding the initial owner.

## 2. First-time setup
1. Push the latest branch to your Git remote (`feature/modern-landing` or main).
2. In Coolify, create a new **Node / Nixpacks** application pointing at the repo.
3. Mount a persistent volume to `/app/storage` if you plan to store uploaded media locally.
4. Set the environment variables above in the application configuration.

## 3. Build & runtime configuration
- Build command: `npm run build`
- Start command: `npm run start`
- Nixpacks automatically picks these up via `nixpacks.toml`. No Dockerfile required.
- The app listens on the default Node port (`3000`). Expose it in Coolify and set any desired custom domain.

## 4. Database migrations & seeding
1. After Coolify finishes the first build, open a shell into the container or add a one-off job to run:
   ```bash
   npm run db:migrate
   npm run seed:admin
   ```
2. Update the admin password immediately after logging in through the dashboard.

## 5. Ongoing deploys
- For every new release, push to the tracked branch. Coolify rebuilds using `npm install`, `npm run build`, and restarts with `npm run start`.
- Run `npm run db:migrate` after each deployment that touches database schema.
- Back up the Postgres database regularly (Coolify’s scheduled backups or external tooling).

## 6. Troubleshooting
- **Invalid environment configuration**: ensure `DATABASE_URL` and `SESSION_SECRET` are defined before the container starts. The server fails fast when they are missing.
- **Build fails complaining about adapter**: confirm `@astrojs/node` is installed and the lockfile is up to date (already bundled in this repo).
- **File uploads missing**: verify the storage volume path matches `STORAGE_ROOT` and Coolify mounts it with write permissions.

You are ready to deploy! Keep this document with the project so future releases follow the same checklist.
