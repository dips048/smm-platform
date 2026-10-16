# ADR-002: Authentication: Better Auth + Twilio Verify

- **Status:** Accepted
- **Date:** 2026-10-16
- **Task:** SMP-1

## Context

Three kinds of user sign in:

1. **Staff** (admins, volunteers) use the admin dashboard and can see donor data and money.
2. **Donors** use the donor portal and the kiosk to see their history and statements.
3. **Kiosk devices** are temple-owned iPads that sit unattended in public.

Most donors and many staff are more comfortable with a phone number than a password. The current system uses Firebase Auth, and its Firestore rules were fully open (`allow read, write: if true`), so authorization was effectively missing. We are leaving Firebase, so users should live in our own Postgres.

## Decision

We will use **Better Auth** inside the API, store its tables in our Postgres, and send SMS codes with **Twilio Verify**.

- **Sign-in method:** phone number + one-time code (OTP) through Twilio Verify. We never generate or store the codes ourselves.
- **Sessions:** Better Auth sessions in Postgres. Web apps use secure, `HttpOnly`, `SameSite` cookies. Sessions can be revoked.
- **Roles:** every user has a role (for example `admin`, `staff`, `donor`). Every API route declares the role it needs and the server checks it, never the client.
- **Staff are invite-only:** an admin invites a phone number with a role. A stranger who signs in with an unknown number gets, at most, a donor account. Never a staff one.
- **Kiosk devices:** a device is paired once with a short-lived **pairing code** that an admin generates. The pairing returns a long-lived **device token** stored on the iPad, scoped to kiosk actions only and revocable from the admin dashboard.
- **Donors at the kiosk:** after an OTP check at the kiosk, the donor gets a **short-lived token** (minutes, not days) limited to that donor and that kiosk session. It is cleared when the session ends.
- **Abuse protection:** rate limits on OTP send and verify per phone number, per IP and per device. Generic error messages, so nobody can probe which numbers exist.

## Consequences

- We own our user data and can join users to donors in SQL.
- No Firebase dependency remains after go-live.
- Authorization is explicit and tested on the server.
- We are responsible for rate limiting, session security and auditing role changes.
- Each OTP has a Twilio cost. Rate limits also cap the bill.
- SMS delivery problems (carrier filtering, wrong numbers) become our support issue. We need a staff-assisted fallback for the kiosk.

## Alternatives considered

- **Firebase Auth:** keeps a Firebase dependency and splits user data from our database.
- **Auth0 / Clerk:** polished, but costs grow per user and identity data lives outside our database.
- **Writing our own auth:** too easy to get sessions, OTP handling or token rotation wrong. Better Auth is open source, runs in our process and uses our database.
- **Email magic links:** many donors check SMS more reliably than email, and the kiosk needs something fast while standing at it. Email can be added later as a second method.
