# ADR-004: Data rules: ids, money, time, deletes

- **Status:** Accepted
- **Date:** 2026-10-16
- **Task:** SMP-1

## Context

Donation data is financial and is used for tax receipts. Small inconsistencies (floating-point money, ambiguous dates, records that vanish) cause real problems: wrong totals, a receipt in the wrong tax year, an audit we can't answer. These rules apply to every table and every API, and are detailed further in the schema conventions task (SMP-17).

## Decision

### Ids

- Primary keys are **UUIDv7**, generated **in the application** (`libs/domain`) before insert.
- UUIDv7 is time-ordered, so indexes stay efficient. Ids are not guessable, and clients can know an id before the row is saved (useful for idempotent kiosk retries).
- Human-facing numbers (such as receipt numbers) are separate columns with their own rules. They are never the primary key.

### Money

- Money is stored as **integer cents** (`bigint`) with a **currency** code (`USD` for now). We never use floats or `numeric` math in application code for money.
- All arithmetic and formatting goes through helpers in `libs/domain`. Display formatting (`$1,234.56`) happens only at the edge.

### Time

- Every timestamp is **`timestamptz`, stored and transmitted in UTC** (ISO 8601 in the API).
- The temple timezone **`America/New_York`** is used **only** where the business needs a local date: report periods, "today's donations", and the **receipt / tax year** of a donation.
- Pure calendar dates without a time (for example a pledge due date) use `date`.

### Deletes

- Default is a **hard delete**, guarded by foreign keys.
- **Soft delete** (`deleted_at timestamptz`) is used **only where the business needs it**: records that receipts, reports or audits refer to (donors, donations, purposes). Soft-deleted rows are excluded by default in queries.
- **Donations are never deleted**, soft or hard. A mistake is corrected with a **void** or **refund** status and a reason, so totals and receipts stay explainable.

### Common columns

- Every table has `created_at` and `updated_at` (`timestamptz`, UTC, set by the database or app).
- Changes to money, donors, roles and settings are written to an **audit log** (who, when, what changed).

## Consequences

- Totals are exact and the same in SQL, the API and the UI.
- Receipts land in the correct tax year regardless of server timezone.
- Developers must use the domain helpers for money and dates. We add lint rules or tests to catch raw `Date` or float money usage where practical.
- Soft delete is limited, so we don't need `WHERE deleted_at IS NULL` everywhere. The tables that have it must be clearly marked.

## Alternatives considered

- **Auto-increment integer ids:** guessable, leak record counts, and can't be created on the client for safe retries.
- **UUIDv4:** random order hurts index locality.
- **`numeric(12,2)` for money:** exact in the database, but JavaScript turns it into floats or strings. Integer cents are simpler end to end.
- **Local-time timestamps:** break across daylight saving changes and server moves.
- **Soft delete everywhere:** adds complexity to every query and hides bugs. Most tables don't need it.

## Open question for the temple

> **Receipt numbers:** should the new system start fresh at **`SMM-2027-000001`** (year-based, resetting each tax year), or **continue the old sequence** from the Firebase system?

This affects the receipt-number design in `libs/domain` and must be answered before the receipts phase (Phase 4). Until then, the default assumption is `SMM-<receipt year>-<6-digit sequence>`, resetting each year.
