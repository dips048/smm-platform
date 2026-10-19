# ADR-003: Hosting on DigitalOcean

- **Status:** Accepted
- **Date:** 2026-10-16
- **Task:** SMP-1

## Context

We need to host an API, a background worker, three static front ends, a Postgres database and private file storage for receipt PDFs. The data is donation and donor records, so backups and point-in-time restore are essential. There is no dedicated ops person, so the platform must be simple, predictable in cost and deploy from git.

## Decision

We will host on **DigitalOcean**:

- **Database:** **DigitalOcean Managed PostgreSQL 18** (the newest major DO offers; local Docker uses the same major). Daily backups and point-in-time recovery are included, and it is reachable from the apps over DO's private network only (trusted sources).
- **Compute:** **DigitalOcean App Platform**, defined by an app spec committed at `.do/app.yaml`:
  - `api`: service (Fastify)
  - `worker`: worker (pg-boss jobs: emails, PDFs, reconciliation)
  - `admin-web`, `donor-portal`, `kiosk`: static sites
  - a **`PRE_DEPLOY` job** that runs database migrations before the new version takes traffic. If a migration fails, the deploy stops.
- **Files:** a **private DO Spaces** bucket for receipt PDFs, served only through short-lived signed URLs.
- **Environments are fully separate:**

| Environment | Database                                      | Keys               | Deploys               |
| ----------- | --------------------------------------------- | ------------------ | --------------------- |
| local       | Docker Postgres 18 + Mailpit                  | Stripe/Twilio test | `pnpm dev`            |
| staging     | own small DO Postgres cluster, fake seed data | test mode          | every merge to `main` |
| production  | own DO Postgres cluster                       | live               | tagged release only   |

Staging and production never share a database, bucket, secret or key.

- **Secrets** live in App Platform encrypted environment variables, never in git.

## Consequences

- One vendor, one bill, and deploys straight from git.
- Backups and restore are managed for us. We still run a restore drill before go-live (SMP-117).
- Migrations must be backwards-compatible with the previous app version (expand → migrate → contract), because the old version keeps serving during a deploy.
- App Platform gives us less control than raw VMs or Kubernetes. That is acceptable at our scale.
- We depend on DigitalOcean's regions and uptime. We keep an offsite logical dump as a safety net.

## Alternatives considered

- **Stay on Firebase:** the reason for the rebuild is to move to a relational database and our own API.
- **AWS (RDS + ECS/Fargate):** more powerful, but much more to configure, secure and pay attention to for a one-developer project.
- **Fly.io / Render / Railway:** good developer experience, but the managed Postgres offerings are less mature or pricier for backups and point-in-time recovery.
- **Supabase / Neon:** good Postgres hosting, but compute would sit with another vendor, giving two bills and cross-provider networking.
