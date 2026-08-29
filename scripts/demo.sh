#!/usr/bin/env bash
# A presentation-ready walkthrough of the full API — creates a trip,
# books a flight against it, logs an expense, tops up the wallet, and
# shows the dashboard/chart data updating as a result. Meant to be run
# live during a demo, not just for pass/fail checking (see smoke-test.sh
# for that instead).
#
# Usage: BASE_URL=http://localhost:4000 ./scripts/demo.sh

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"

# Pretty-prints JSON using Node (no dependency on jq being installed).
pretty() {
  node -e "
    let input = '';
    process.stdin.on('data', d => input += d);
    process.stdin.on('end', () => {
      try { console.log(JSON.stringify(JSON.parse(input), null, 2)); }
      catch { console.log(input); }
    });
  "
}

section() {
  echo
  echo "════════════════════════════════════════════════════════════"
  echo "  $1"
  echo "════════════════════════════════════════════════════════════"
}

step() {
  echo
  echo "→ $1"
}

section "SkyDesk Backend — Live API Demo"
echo "  Target: $BASE_URL"
echo "  Full interactive docs available at: $BASE_URL/docs"

# ---------------------------------------------------------------------
section "1. Health check"
step "GET /health/ready — confirms the database and Redis are both reachable"
curl -s "$BASE_URL/health/ready" | pretty

# ---------------------------------------------------------------------
section "2. Authentication (real login, not a bypass)"
step "Confirming an unauthenticated request is correctly rejected"
curl -s "$BASE_URL/api/v1/trips" | pretty

step "POST /api/v1/auth/login — seeded test account"
LOGIN_JSON=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"arjun@skydesk.io","password":"password123"}' \
  "$BASE_URL/api/v1/auth/login")
echo "$LOGIN_JSON" | pretty
TOKEN=$(echo "$LOGIN_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.accessToken))")
AUTH="Authorization: Bearer $TOKEN"
echo "  Real access token acquired via login."

step "GET /api/v1/auth/me — confirms the token identifies the right user"
curl -s -H "$AUTH" "$BASE_URL/api/v1/auth/me" | pretty

# ---------------------------------------------------------------------
section "3. Create a trip"
step "POST /api/v1/trips"
TRIP_JSON=$(curl -s -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"title":"Bengaluru Sprint Review","destination":"Bengaluru","startDate":"2026-08-01","endDate":"2026-08-03"}' \
  "$BASE_URL/api/v1/trips")
echo "$TRIP_JSON" | pretty
TRIP_ID=$(echo "$TRIP_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).data.id))")

# ---------------------------------------------------------------------
section "4. Book a flight against that trip"
step "POST /api/v1/bookings"
curl -s -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"type\":\"flight\",\"tripId\":\"$TRIP_ID\",\"airline\":\"IndiGo\",\"flightNo\":\"6E 2291\",\"from\":\"DEL\",\"to\":\"BLR\",\"date\":\"2026-08-01\",\"depart\":\"06:15\",\"arrive\":\"08:45\",\"price\":5200,\"pnr\":\"X7QK9L\"}" \
  "$BASE_URL/api/v1/bookings" | pretty

# ---------------------------------------------------------------------
section "5. Log an expense against the trip"
step "POST /api/v1/expenses  (with an Idempotency-Key — safe to retry without duplicating)"
curl -s -X POST -H "$AUTH" -H "Content-Type: application/json" -H "Idempotency-Key: demo-expense-001" \
  -d "{\"date\":\"2026-08-01\",\"category\":\"flight\",\"merchant\":\"IndiGo 6E 2291\",\"description\":\"Sprint review travel\",\"amount\":5200,\"tripId\":\"$TRIP_ID\"}" \
  "$BASE_URL/api/v1/expenses" | pretty

# ---------------------------------------------------------------------
section "6. Trip detail — itinerary + expenses + computed total"
step "GET /api/v1/trips/$TRIP_ID"
curl -s -H "$AUTH" "$BASE_URL/api/v1/trips/$TRIP_ID" | pretty

# ---------------------------------------------------------------------
section "7. Dashboard summary — all 4 KPI cards in one call"
step "GET /api/v1/dashboard/summary"
curl -s -H "$AUTH" "$BASE_URL/api/v1/dashboard/summary" | pretty

# ---------------------------------------------------------------------
section "8. Spend over time — powers the Weekly/Monthly/Yearly chart"
step "GET /api/v1/expenses/spend-over-time?range=month"
curl -s -H "$AUTH" "$BASE_URL/api/v1/expenses/spend-over-time?range=month" | pretty

# ---------------------------------------------------------------------
section "9. Request a travel advance"
step "POST /api/v1/advances"
curl -s -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"purpose\":\"Bengaluru trip float\",\"amount\":3000,\"tripId\":\"$TRIP_ID\"}" \
  "$BASE_URL/api/v1/advances" | pretty

step "GET /api/v1/advances/outstanding"
curl -s -H "$AUTH" "$BASE_URL/api/v1/advances/outstanding" | pretty

# ---------------------------------------------------------------------
section "10. Wallet — top up and view balance"
step "POST /api/v1/wallet/top-up"
curl -s -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"amount":2000}' \
  "$BASE_URL/api/v1/wallet/top-up" | pretty

step "GET /api/v1/wallet"
curl -s -H "$AUTH" "$BASE_URL/api/v1/wallet" | pretty

# ---------------------------------------------------------------------
section "11. Notifications — auto-generated by the actions above"
step "GET /api/v1/notifications — the expense, advance, and top-up above each fired a real notification"
curl -s -H "$AUTH" "$BASE_URL/api/v1/notifications" | pretty

step "GET /api/v1/notifications/unread-count"
curl -s -H "$AUTH" "$BASE_URL/api/v1/notifications/unread-count" | pretty

# ---------------------------------------------------------------------
section "12. Validation actually rejects bad input"
step "POST /api/v1/expenses with a negative amount (should be 400, not 500)"
curl -s -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"date":"2026-08-01","category":"meals","merchant":"Bad Data","amount":-50}' \
  "$BASE_URL/api/v1/expenses" | pretty

section "Demo complete"
echo "  Everything above ran against a real PostgreSQL database and Redis cache."
echo "  Explore every endpoint interactively at: $BASE_URL/docs"
echo
