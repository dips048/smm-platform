# Module boundaries

`@nx/enforce-module-boundaries` (root `eslint.config.mjs`) stops code from importing across lines it shouldn't. Every project carries exactly one `scope:*` and one `type:*` tag in `nx.tags` (in its `package.json` or `project.json`).

## Tags per project

| Project             | scope    | type          |
| ------------------- | -------- | ------------- |
| `apps/api`          | `api`    | `app`         |
| `apps/worker`       | `api`    | `app`         |
| `apps/admin-web`    | `web`    | `app`         |
| `apps/donor-portal` | `web`    | `app`         |
| `apps/kiosk`        | `web`    | `app`         |
| `libs/contracts`    | `shared` | `contracts`   |
| `libs/domain`       | `shared` | `domain`      |
| `libs/db`           | `api`    | `db`          |
| `libs/ui`           | `web`    | `ui`          |
| `libs/data-access`  | `web`    | `data-access` |

## Rules

**Scope** (which side of the system):

- `scope:api` → `scope:api`, `scope:shared`
- `scope:web` → `scope:web`, `scope:shared`
- `scope:shared` → `scope:shared` only

**Type** (what kind of project):

- `type:app` → any lib, never another app
- `type:contracts` → nothing (leaf: zod schemas + types)
- `type:domain` → `contracts`
- `type:db` → `contracts`, `domain`
- `type:data-access` → `contracts`
- `type:ui` → `contracts`, `domain`

So the API can use `contracts`, `db`, `domain`; the Angular apps can use `contracts`, `domain`, `ui`, `data-access`. Importing `@smm/db` from an Angular app fails lint.

A project with no tags is unconstrained, so tag new projects when you generate them.
