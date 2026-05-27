#!/usr/bin/env bash
# Smoke test for the full Angleryst stack running in Kubernetes.
# Usage: ./smoke-test.sh [BASE_URL]
# Defaults to http://$(minikube ip) if no argument provided.

set -e

BASE_URL="${1:-http://$(minikube ip)}"
PASS=0
FAIL=0

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

check_status() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then pass "$desc (HTTP $actual)"; else fail "$desc — expected $expected, got $actual"; fi
}

echo "=== Angleryst K8s Smoke Test ==="
echo "Target: $BASE_URL"
echo ""

# 1. Register (idempotent — 200 on create, 400 if already exists)
echo "[1] Register user"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/users/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"k8stest","email":"k8s@test.com","password":"password123"}')
if [ "$STATUS" = "200" ] || [ "$STATUS" = "400" ]; then
  pass "Register reachable (HTTP $STATUS)"
else
  fail "Register — unexpected status $STATUS"
fi

# 2. Login
echo "[2] Login"
TOKEN=$(curl -s -X POST "$BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"k8stest","password":"password123"}')
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then pass "Login returned token"; else fail "Login — no token returned"; TOKEN=""; fi

# 3. No token rejected
echo "[3] Auth: no token rejected"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/catches")
check_status "No-token rejected" "403" "$STATUS"

# 4. Gateway 404 for unknown path
echo "[4] Gateway: unknown path returns 404"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/unknown/route")
check_status "Unknown path 404" "404" "$STATUS"

if [ -z "$TOKEN" ]; then
  echo ""
  echo "Skipping authenticated tests — no token."
else
  # 5. Catalog
  echo "[5] Tackle: get catalog"
  BODY=$(curl -s "$BASE_URL/tackle/catalog" -H "Authorization: Bearer $TOKEN")
  COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  if [ "$COUNT" -gt "0" ]; then pass "Catalog returned $COUNT lures"; else fail "Catalog empty or error: $BODY"; fi

  # 6. Add to inventory
  echo "[6] Inventory: add lure 1"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/inventory/1" \
    -H "Authorization: Bearer $TOKEN")
  check_status "Add to inventory" "200" "$STATUS"

  # 7. Get inventory
  echo "[7] Inventory: get"
  BODY=$(curl -s "$BASE_URL/inventory" -H "Authorization: Bearer $TOKEN")
  COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  if [ "$COUNT" -gt "0" ]; then pass "Inventory returned $COUNT items"; else fail "Inventory empty or error: $BODY"; fi

  # 8. Log a catch
  echo "[8] Catches: log a catch"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/catches" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"speciesId":1,"weight":3.5,"length":16.0,"locationId":1,"lureId":1,"dateCaught":"2026-05-27"}')
  check_status "Log catch" "200" "$STATUS"

  # 9. Get catches
  echo "[9] Catches: get history"
  BODY=$(curl -s "$BASE_URL/catches" -H "Authorization: Bearer $TOKEN")
  COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  if [ "$COUNT" -gt "0" ]; then pass "Catch history returned $COUNT catches"; else fail "Catch history empty or error: $BODY"; fi

  # 10. Recommendations
  echo "[10] Recommendations: get stub"
  BODY=$(curl -s -X POST "$BASE_URL/recommendations" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"timeOfDay":"MORNING","season":"SPRING","region":"Northeast"}')
  COUNT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null || echo "0")
  SPONSORED=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(all(not r['sponsored'] for r in d))" 2>/dev/null || echo "False")
  if [ "$COUNT" -gt "0" ]; then pass "Recommendations returned $COUNT items"; else fail "Recommendations empty or error: $BODY"; fi
  if [ "$SPONSORED" = "True" ]; then pass "All sponsored=false (stub correct)"; else fail "sponsored field incorrect"; fi
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ]
