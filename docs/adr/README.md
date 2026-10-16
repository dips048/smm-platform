# Architecture Decision Records

An ADR records **why** we made a significant technical choice, so nobody has to re-run the debate later.

## Rules

- One decision per file: `NNN-short-title.md`, numbered in order and never renumbered.
- Copy [`000-template.md`](000-template.md) to start a new one.
- Status is one of `Proposed`, `Accepted`, `Superseded by ADR-NNN` or `Deprecated`.
- An accepted ADR is not edited to change the decision. Write a new ADR that supersedes it, then update the old one's status.

## Index

| ADR                                | Title                                       | Status   |
| ---------------------------------- | ------------------------------------------- | -------- |
| [001](001-monorepo-and-stack.md)   | Monorepo and technology stack               | Accepted |
| [002](002-authentication.md)       | Authentication: Better Auth + Twilio Verify | Accepted |
| [003](003-hosting-digitalocean.md) | Hosting on DigitalOcean                     | Accepted |
| [004](004-data-rules.md)           | Data rules: ids, money, time, deletes       | Accepted |
