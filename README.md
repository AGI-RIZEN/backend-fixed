# SkyDesk Backend

Node.js + Express backend for the SkyDesk Travel & Expense app.

## Scope of this repository

This repo contains **backend business-logic code only**:
- Routes, controllers, services, repositories for Trips, Bookings, Expenses, Advances, Wallet (saved cards + balance + transactions), and the Dashboard summary
- Redis-backed rate limiting, caching, and idempotency protection
- Centralized error handling, request validation, structured logging
- Docker + Docker Compose + CI pipeline

**Explicitly NOT included here (owned by teammates, integrated separately):**
- **Database schema & migrations** — `prisma/schema.prisma` in this repo is a **placeholder** matching the field names the repository layer expects. It will be replaced by the real schema once finalized. As long as model/field names line up, nothing outside `prisma/schema.prisma` needs to change.
- **Authentication (signup/login/token issuing)** — this backend only *verifies* JWTs (`src/middleware/auth.middleware.js`) using a shared `JWT_SECRET`. The actual login/signup endpoints, password hashing, and token issuance live in a separate auth module.

## Getting started

```bash
cp .env.example .env
# fill in JWT_SECRET, or ask the auth teammate for the shared value

docker compose up
```

This starts the app, Postgres, and Redis together. On first run:

```bash
docker compose exec app npx prisma db push
```

to sync the placeholder schema to the database (swap for real migrations once the DB teammate's schema lands).

## Local dev without Docker

```bash
npm install
npx prisma generate
npm run dev
```

Requires a local Postgres and Redis reachable at the URLs in `.env`.

## API overview (all under `/api/v1`, all require `Authorization: Bearer <token>`)

| Resource | Endpoints |
|---|---|
| Trips | `GET /trips`, `POST /trips`, `GET /trips/:id`, `DELETE /trips/:id` |
| Bookings | `GET /bookings`, `POST /bookings`, `DELETE /bookings/:id` |
| Expenses | `GET /expenses`, `POST /expenses` (idempotency-key supported), `GET /expenses/:id`, `DELETE /expenses/:id`, `GET /expenses/spend-over-time?range=week\|month\|year`, `GET /expenses/category-spend-over-time?range=...`, `GET /expenses/category-breakdown` |
| Advances | `GET /advances`, `POST /advances`, `GET /advances/outstanding` |
| Wallet | `GET /wallet` (balance + cards + transactions in one call), `GET /wallet/cards`, `POST /wallet/cards` (add saved card — only last 4 digits ever persisted), `DELETE /wallet/cards/:id`, `GET /wallet/transactions`, `POST /wallet/top-up` (idempotency-key supported) |
| Dashboard | `GET /dashboard/summary` (all 4 KPI cards in one call) |
| Health | `GET /health/live`, `GET /health/ready` (unauthenticated, used by Docker/orchestrators) |

## API documentation (the contract for whoever integrates)

Once the server is running:
```
http://localhost:4000/docs
```
Interactive Swagger UI — every endpoint, every request/response shape, with a
"Try it out" button to actually call the API from the browser. This is the
single source of truth for the frontend/auth/database teammates to integrate
against, so nobody needs to read the source code to know what an endpoint expects.

The raw spec also lives at `openapi.yaml` in the repo root if you'd rather
import it into Postman/Insomnia directly (both support "Import from OpenAPI").

## Running the live demo

Once the server is up and seeded (steps 1–2 below, or see full setup further
down), run:
```bash
./scripts/demo.sh
```
(Run this in Git Bash or WSL on Windows — it's a bash script.)

This walks through the entire API live, in order, printing formatted
responses at each step:
1. Health check
2. Get an auth token
3. Create a trip
4. Book a flight against it
5. Log an expense against it (using an idempotency key)
6. Fetch the trip detail — shows the itinerary + computed total together
7. Fetch the dashboard summary — all 4 KPI cards
8. Fetch the spend-over-time chart data
9. Request a travel advance, check the outstanding total
10. Top up the wallet, check the balance
11. Confirm bad input (negative amount) is correctly rejected with `400`, not a crash

Good for showing the API actually working end-to-end in a presentation,
rather than testing pass/fail one endpoint at a time (`smoke-test.sh` is
better for that — quick automated check, less narration).

## Testing this backend while auth/DB are still in progress

You don't need to wait for either teammate to finish. Here's the workflow:

**1. Start the database and Redis** (using the placeholder schema — swap for the real one later, nothing else needs to change):
```bash
cp .env.example .env   # fill in a JWT_SECRET (any long random string for now)
docker compose up -d postgres redis
npx prisma generate
npx prisma db push       # syncs the placeholder schema
npm run seed:demo         # DEV ONLY — creates a test user + sample trip/expense/advance/wallet data
npm run dev
```

**2. Get a test JWT without the real login endpoint:**
```bash
npm run test-token
```
This mints a valid token locally, signed with your `.env`'s `JWT_SECRET` — the same thing the auth teammate's login endpoint will eventually return. Once the real endpoint exists, just swap this out; nothing else changes, since this backend only *verifies* tokens, it never cared how they were issued.

Options:
```bash
node scripts/generate-test-token.js --role employee
node scripts/generate-test-token.js --sub <some-other-user-id> --role admin
node scripts/generate-test-token.js --quiet   # prints only the token, for piping into other commands
```

**3. Run the full smoke test** (hits every endpoint, checks status codes, checks validation actually rejects bad input):
```bash
./scripts/smoke-test.sh
```
Expect all checks to pass once steps 1–2 are done. This is the fastest way to confirm "is my backend actually working" without needing Postman or manual curl commands.

**4. Or test manually with the minted token:**
```bash
TOKEN=$(node scripts/generate-test-token.js --quiet)
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/dashboard/summary
```

**Once your teammates' pieces land:**
- Real DB schema replaces `prisma/schema.prisma` — as long as model/field names match, nothing in `src/` needs to change.
- Real login endpoint replaces `generate-test-token.js` as the way to get a token — as long as it signs with the same `JWT_SECRET` and payload shape (`{ sub, role }`), `auth.middleware.js` doesn't need to change either.

**Automated test suite** (unit tests for validators, middleware — no DB required):
```bash
npm test
```

## Notes for integration

- Token payload expected: `{ sub: '<userId>', role: 'admin' | 'employee' }`, signed with the same `JWT_SECRET` both services share.
- Every route scopes queries by `req.user.id` — there's no cross-user data access by design.
- `requireRole('admin')` middleware exists and is ready to wire onto any route that needs role enforcement.
