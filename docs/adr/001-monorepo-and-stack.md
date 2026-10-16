# ADR-001: Monorepo and technology stack

- **Status:** Accepted
- **Date:** 2026-10-16
- **Task:** SMP-1

## Context

Shri Mangal Mandir needs three front ends (an iPad **kiosk**, a staff **admin dashboard** and a **donor portal**) over one set of business rules: donors, purposes, donations, receipts and reports.

Today those live in separate Firebase-based repos (`shri-mangal-mandir-web`, `shri-mangal-mandir-kiosk`, `types-shri-mangal-mandir`). Shared types are copied between repos and drift, and the business rules sit in the clients. We are rebuilding from scratch, with no data migration. The old repos are reference only.

The work is mostly done by one developer, so the stack has to be productive, strongly typed end to end, and cheap to run.

## Decision

We will build everything in **one Nx monorepo managed with pnpm** (`smm-platform`):

| Area            | Choice                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Repo            | Nx + pnpm workspaces; Node 22 LTS pinned (`.nvmrc`, `engines`)                                   |
| API             | Node 22 + TypeScript + **Fastify 5**, **zod** validation, OpenAPI generated from the schemas     |
| Database access | **Drizzle ORM**, SQL migrations committed to git                                                 |
| Background jobs | **pg-boss** (queue stored in Postgres), run as a separate `worker` app                           |
| Payments        | **Stripe Terminal** (kiosk + admin), **Stripe Payment Element** (online)                         |
| Receipts        | **pdfmake** PDFs; transactional email provider (Postmark recommended)                            |
| Front ends      | **Angular 21**: standalone components, signals, zoneless. **Capacitor** wraps the kiosk for iPad |
| Testing         | Vitest, Testcontainers (real Postgres), Playwright e2e                                           |
| CI              | GitHub Actions with `nx affected`                                                                |
| Monitoring      | Sentry                                                                                           |

Layout:

```
apps/  api, worker, admin-web, donor-portal, kiosk
libs/  contracts (zod schemas + types), db (Drizzle schema, migrations, seeds),
       domain (pure business rules), ui (shared Angular), data-access (API client)
docs/  ADRs, glossary, runbooks
```

**Dependency rules** (enforced by Nx module boundaries in SMP-4):

- Business rules live in `libs/domain` and run on the server. Front ends never decide money, receipt numbers or status changes.
- `libs/contracts` is the single source of truth for request and response shapes. The API validates with it, and the front ends get typed clients from it.
- Apps depend on libs, never on other apps.

## Consequences

- One PR can change the schema, the API and all three UIs together. Shared types cannot drift.
- `nx affected` keeps CI time proportional to the change.
- Everyone works with one language (TypeScript) and one front-end framework.
- Nx and Angular major upgrades now affect the whole repo at once. We run `nx migrate` regularly rather than letting versions fall behind.
- A Postgres-backed queue is enough for our volume (a temple, not a bank). If job volume ever outgrows it, we revisit.

## Alternatives considered

- **Keep separate repos:** that is the current pain (copied types, rules in clients).
- **Turborepo:** good task caching, but weaker Angular support and no generators or module-boundary rules.
- **NestJS:** heavier framework and decorators. Fastify + zod gives us schema-first typing with less magic.
- **Express:** older, slower, and weaker typing and schema support than Fastify.
- **Prisma:** generated client and its own schema language. Drizzle stays close to SQL and keeps migrations as plain SQL files.
- **React / Next.js:** the existing apps and the developer's experience are Angular. Switching frameworks adds risk with no gain for this product.
- **Redis + BullMQ:** one more service to run and pay for. pg-boss reuses the database we already have.
