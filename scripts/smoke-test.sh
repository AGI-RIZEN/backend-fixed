#!/usr/bin/env bash
# End-to-end smoke test for the backend, usable before the real auth/DB
# teammates finish their pieces. Requires the server to be running
# (docker compose up, or npm run dev) and the placeholder DB seeded
# (npm run seed:demo).
#
# Usage: BASE_URL=http://localhost:4000 ./scripts/smoke-test.sh

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
PASS=0
FAIL=0

check() {
  local description="$1"
  local expected_status="$2"
  local actual_status="$3"

  if [ "$actual_status" == "$expected_status" ]; then
    echo "  PASS  $description ($actual_status)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $description (expected $expected_status, got $actual_status)"
    FAIL=$((FAIL + 1))
  fi
}

echo "== SkyDesk backend smoke test against $BASE_URL =="
echo

# --- Health checks (no auth needed) ---
echo "-- Health --"
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health/live")
check "GET /health/live" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health/ready")
check "GET /health/ready" 200 "$status"
echo

# --- Auth enforcement (should reject with no token) ---
echo "-- Auth enforcement --"
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/trips")
check "GET /api/v1/trips with no token" 401 "$status"
echo

# --- Real authentication ---
echo "-- Authentication (real login) --"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"arjun@skydesk.io","password":"password123"}' \
  "$BASE_URL/api/v1/auth/login")
TOKEN=$(echo "$LOGIN_RESPONSE" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).data.accessToken)}catch{console.log('')}})" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "  FAIL  POST /api/v1/auth/login — no token returned. Did you run 'npm run seed:demo'?"
  FAIL=$((FAIL + 1))
else
  echo "  PASS  POST /api/v1/auth/login"
  PASS=$((PASS + 1))
fi
AUTH="Authorization: Bearer $TOKEN"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" \
  -d '{"email":"arjun@skydesk.io","password":"wrong-password"}' \
  "$BASE_URL/api/v1/auth/login")
check "POST /api/v1/auth/login (wrong password, should be rejected)" 401 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/auth/me")
check "GET /api/v1/auth/me" 200 "$status"
echo

# --- Authenticated business routes ---
echo "-- Business endpoints --"
status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/trips")
check "GET /api/v1/trips" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/expenses")
check "GET /api/v1/expenses" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/expenses/spend-over-time?range=month")
check "GET /api/v1/expenses/spend-over-time" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/advances")
check "GET /api/v1/advances" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/advances/outstanding")
check "GET /api/v1/advances/outstanding" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/wallet")
check "GET /api/v1/wallet" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/dashboard/summary")
check "GET /api/v1/dashboard/summary" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/notifications")
check "GET /api/v1/notifications" 200 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -H "$AUTH" "$BASE_URL/api/v1/notifications/unread-count")
check "GET /api/v1/notifications/unread-count" 200 "$status"

# --- Write path + validation ---
echo
echo "-- Write path & validation --"
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"date":"2026-07-18","category":"meals","merchant":"Smoke Test Lunch","amount":250}' \
  "$BASE_URL/api/v1/expenses")
check "POST /api/v1/expenses (valid payload)" 201 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"date":"2026-07-18","category":"meals","merchant":"Bad Amount","amount":-50}' \
  "$BASE_URL/api/v1/expenses")
check "POST /api/v1/expenses (negative amount, should be rejected)" 400 "$status"

status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"date":"2026-07-18","category":"not-a-real-category","merchant":"Bad Category","amount":50}' \
  "$BASE_URL/api/v1/expenses")
check "POST /api/v1/expenses (invalid category, should be rejected)" 400 "$status"

echo
echo "== Results: $PASS passed, $FAIL failed =="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
