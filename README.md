# smm-platform

The Shri Mangal Mandir donation platform: **kiosk**, **admin dashboard** and **donor portal**, built on our own API with hosted Postgres.

The old repos (`shri-mangal-mandir-web`, `shri-mangal-mandir-kiosk`, `types-shri-mangal-mandir`) are reference only.

- **Plan & tasks:** [Notion: Shri Mangal Mandir Platform — Build Plan](https://app.notion.com/p/3fbbd0b22ec08146878ed828023a865f)
- **Stack:** Nx + pnpm · Node 22 + Fastify 5 + zod · Drizzle + DigitalOcean Managed Postgres · Better Auth + Twilio Verify · pg-boss · Stripe · Angular 21 (+ Capacitor for the iPad kiosk)

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

Requirements: Node 22 (see `.nvmrc`) and pnpm via corepack.

```sh
corepack enable
pnpm install
pnpm nx graph
```

## Common commands

```sh
pnpm nx run-many -t lint test build   # everything
pnpm nx affected -t lint test build   # only what changed
pnpm nx show projects                 # list projects
pnpm format                           # Prettier on everything
```

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org), e.g. `feat(api): add health endpoint (SMP-10)`. Enforced by commitlint in the `commit-msg` hook.
- **Pre-commit:** lint-staged runs Prettier and `nx affected -t lint --fix` on staged files.
- **Module boundaries:** every project needs a `scope:*` and a `type:*` tag; see [docs/module-boundaries.md](docs/module-boundaries.md).
