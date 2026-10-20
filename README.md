# smm-platform

The Shri Mangal Mandir donation platform: **kiosk**, **admin dashboard** and **donor portal**, built on our own API with hosted Postgres.

The old repos (`shri-mangal-mandir-web`, `shri-mangal-mandir-kiosk`, `types-shri-mangal-mandir`) are reference only.

- **Plan & tasks:** [Notion: Shri Mangal Mandir Platform — Build Plan](https://app.notion.com/p/3fbbd0b22ec08146878ed828023a865f)
- **Stack:** Nx + pnpm · Node 24 + Fastify 5 + zod · Drizzle + DigitalOcean Managed Postgres 18 · Better Auth + Twilio Verify · pg-boss · Stripe · Angular 22 (+ Capacitor for the iPad kiosk)

## Layout

```
apps/
  api/            Fastify API (HTTP)
  worker/         pg-boss worker (emails, PDFs, reconciliation)
  admin-web/      Staff dashboard (Angular)
  donor-portal/   Donor self-service + online giving (Angular)
  kiosk/          iPad kiosk (Angular + Capacitor iOS)
libs/
  contracts/      zod schemas + types shared by API and apps
  db/             Drizzle schema, migrations, seeds
  domain/         pure business rules
  ui/             shared Angular components, pipes, theme
  data-access/    generated API client
docs/             ADRs, glossary, runbooks
```

## Getting started

You need git, [nvm](https://github.com/nvm-sh/nvm) (or [nvm-windows](https://github.com/coreybutler/nvm-windows)) and Docker Desktop (or another Docker with Compose v2).

1. **Use Node 24 LTS** (pinned in `.nvmrc`):

   ```sh
   nvm install 24
   nvm use 24
   ```

2. **Install pnpm and dependencies.** Corepack picks the pnpm version from `package.json`:

   ```sh
   corepack enable
   pnpm install
   ```

3. **Create your local settings.** The defaults work as-is; every variable is explained in the file:

   ```sh
   cp .env.example .env
   ```

4. **Start Postgres and Mailpit** and wait until they are healthy:

   ```sh
   docker compose up -d --wait
   ```

5. **Run the apps** (API, worker and admin dashboard, with reload on change):

   ```sh
   pnpm dev
   ```

### Local URLs

| What              | URL                                      |
| ----------------- | ---------------------------------------- |
| API               | http://localhost:3000                    |
| Admin dashboard   | http://localhost:4200                    |
| Donor portal      | http://localhost:4201 (`pnpm dev:donor`) |
| Kiosk             | http://localhost:4202 (`pnpm dev:kiosk`) |
| Mailpit (inbox)   | http://localhost:8025                    |
| Postgres          | `postgres://smm:smm@localhost:5432/smm`  |
| pgAdmin, optional | http://localhost:5050 (`pnpm db:tools`)  |

`pnpm dev:all` serves all five apps at once. Mailpit catches every email the apps send (SMTP on port 1025), so nothing reaches a real inbox.

### Local services

```sh
pnpm db:up      # start Postgres + Mailpit (docker compose up -d --wait)
pnpm db:down    # stop them, keep the data
pnpm db:reset   # stop them and DELETE the local database, then start fresh
pnpm db:logs    # follow container logs
pnpm db:tools   # also start pgAdmin (compose profile "tools")
```

**Troubleshooting**

- _Docker Desktop on Windows won't start ("wsl is not installed"):_ run `wsl --install` in an admin PowerShell, then restart.
- _"ports are not available ... 5432":_ another Postgres (often a local Windows install) already uses the port. In `.env`, set `POSTGRES_PORT=5433` and change the port in `DATABASE_URL` to match, then run `pnpm db:up` again. The same applies to `SMTP_PORT`, `MAILPIT_UI_PORT` and `PGADMIN_PORT`.

## Common commands

```sh
pnpm nx run-many -t lint typecheck test build   # everything
pnpm nx affected -t lint typecheck test build   # only what changed (what CI runs)
pnpm nx show projects                           # list projects
pnpm format                                     # Prettier on everything
```

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull request and push to `main` and `develop`:

1. `pnpm install --frozen-lockfile` (Node from `.nvmrc`, pnpm from `packageManager`)
2. `nx format:check` on the changed files
3. `nx affected -t lint typecheck test build`, against the PR's target branch or the last green commit

A Postgres 18 service container is available to tests through `DATABASE_URL`. [Dependabot](.github/dependabot.yml) opens grouped dependency PRs against `develop` every Monday. Nx and Angular majors are left out, because those go through `pnpm nx migrate latest`.

Set up once in GitHub (repository **Settings**):

- **Code security:** turn on _Secret scanning_ and _Push protection_.
- **Branches → `main`:** add a branch protection rule (or ruleset). Require a pull request and require the **CI** status check to pass.

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org), e.g. `feat(api): add health endpoint (SMP-10)`. Enforced by commitlint in the `commit-msg` hook.
- **Pre-commit:** lint-staged runs Prettier and `nx affected -t lint --fix` on staged files.
- **Module boundaries:** every project needs a `scope:*` and a `type:*` tag; see [docs/module-boundaries.md](docs/module-boundaries.md).
- **Imports:** libs are imported as `@smm/<lib>` (path aliases in `tsconfig.base.json`, added by the Nx lib generators). Libs are not buildable; apps compile or bundle them.
- **Dev ports:** api 3000, admin-web 4200, donor-portal 4201, kiosk 4202 (`pnpm nx serve <app>`), Postgres 5432, Mailpit 1025 (SMTP) / 8025 (UI), pgAdmin 5050.
- **Environment:** settings live in `.env` (git-ignored); add every new variable to `.env.example` with a comment.
