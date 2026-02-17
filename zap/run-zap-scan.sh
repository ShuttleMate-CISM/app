#!/bin/bash
# ==============================================================================
# ShuttleMate - OWASP ZAP DAST Scanner
# ==============================================================================
# Runs OWASP ZAP security scans against the local ShuttleMate application
# using Docker. Generates HTML and JSON reports in zap/reports/
#
# Prerequisites:
#   1. Docker Desktop running
#   2. ShuttleMate Frontend running on http://localhost:5173
#   3. ShuttleMate Backend running on http://localhost:5001
#
# Usage:
#   ./zap/run-zap-scan.sh              # Run both scans
#   ./zap/run-zap-scan.sh frontend     # Frontend only
#   ./zap/run-zap-scan.sh backend      # Backend only
#   ./zap/run-zap-scan.sh baseline     # Quick baseline scan (faster)
# ==============================================================================

set -e
set -o pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root (one level up from zap/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ZAP_DIR="$SCRIPT_DIR"
REPORTS_DIR="$ZAP_DIR/reports"

# ZAP Docker image
ZAP_IMAGE="zaproxy/zap-stable"

# Memory limits for 8GB machines
DOCKER_MEMORY="--memory=2g --memory-swap=2g"
ZAP_JVM_OPTS="-Xmx512m"

FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:5001"
GENERATED_DIR="$ZAP_DIR/generated"
TOKENS_FILE="$GENERATED_DIR/tokens.json"

ZAP_PASSWORD="ZapTest123!"
ZAP_USER_ADMIN_PREFIX="zap_admin"
ZAP_USER_COACH_PREFIX="zap_coach"
ZAP_USER_COURTOWNER_PREFIX="zap_courtowner"
ZAP_USER_SHOPOWNER_PREFIX="zap_shopowner"

ZAP_USER_ADMIN=""
ZAP_USER_COACH=""
ZAP_USER_COURTOWNER=""
ZAP_USER_SHOPOWNER=""

ZAP_TOKEN_ADMIN=""
ZAP_TOKEN_COACH=""
ZAP_TOKEN_COURTOWNER=""
ZAP_TOKEN_SHOPOWNER=""

ZAP_FIXTURE_USER_MONGO_ID=""
ZAP_FIXTURE_USER_FIREBASE_UID_PREFIX="zap-user-fixture"
ZAP_FIXTURE_USER_FIREBASE_UID=""
ZAP_FIXTURE_COURT_ID=""
ZAP_FIXTURE_COACH_ID=""
ZAP_FIXTURE_COACH_SLOT_ID=""
ZAP_FIXTURE_COURT_SLOT_ID=""
ZAP_FIXTURE_SHOP_ID=""
ZAP_FIXTURE_CATEGORY_ID=""
ZAP_FIXTURE_ITEM_ID=""
ZAP_FIXTURE_MATCH_ID=""
ZAP_FIXTURE_COACH_BOOKING_ID=""
ZAP_FIXTURE_COURT_BOOKING_ID=""
ZAP_DYNAMIC_BACKEND_REQUESTS=""

# Docker target URLs (host.docker.internal for macOS, localhost for Linux)
if [[ "$(uname)" == "Darwin" ]]; then
    DOCKER_NETWORK_FLAG=""
    DOCKER_HOST_ALIAS="host.docker.internal"
else
    DOCKER_NETWORK_FLAG="--network host"
    DOCKER_HOST_ALIAS="localhost"
fi

# Timestamp for report filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RUN_ID="$TIMESTAMP"

ZAP_USER_ADMIN="${ZAP_USER_ADMIN_PREFIX}_${RUN_ID}"
ZAP_USER_COACH="${ZAP_USER_COACH_PREFIX}_${RUN_ID}"
ZAP_USER_COURTOWNER="${ZAP_USER_COURTOWNER_PREFIX}_${RUN_ID}"
ZAP_USER_SHOPOWNER="${ZAP_USER_SHOPOWNER_PREFIX}_${RUN_ID}"

ZAP_FIXTURE_USER_FIREBASE_UID="${ZAP_FIXTURE_USER_FIREBASE_UID_PREFIX}-${RUN_ID}"

# Track elapsed time
SCAN_START_TIME=$(date +%s)

elapsed_time() {
    local now=$(date +%s)
    local elapsed=$((now - SCAN_START_TIME))
    local mins=$((elapsed / 60))
    local secs=$((elapsed % 60))
    printf "%dm %02ds" "$mins" "$secs"
}

step_timer_start() {
    STEP_START=$(date +%s)
}

step_elapsed() {
    local now=$(date +%s)
    local elapsed=$((now - STEP_START))
    local mins=$((elapsed / 60))
    local secs=$((elapsed % 60))
    printf "%dm %02ds" "$mins" "$secs"
}

# ==============================================================================
# Helper Functions
# ==============================================================================

print_banner() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       🛡️  OWASP ZAP - ShuttleMate DAST Scanner  🛡️      ║${NC}"
    echo -e "${BLUE}║              CISM Phase 3 - Security Scan               ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}ERROR: Docker is not installed or not in PATH${NC}"
        echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
        exit 1
    fi

    if ! docker info &> /dev/null 2>&1; then
        echo -e "${RED}ERROR: Docker daemon is not running${NC}"
        echo "Please start Docker Desktop and try again."
        exit 1
    fi

    echo -e "${GREEN}✓ Docker is running${NC}"
}

check_service() {
    local url=$1
    local name=$2
    if curl -s --head --connect-timeout 3 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name is accessible at $url${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $name is NOT accessible at $url${NC}"
        return 1
    fi
}

pull_zap_image() {
    echo -e "${BLUE}Pulling latest ZAP Docker image...${NC}"
    if docker pull "$ZAP_IMAGE" 2>&1; then
        echo -e "${GREEN}✓ ZAP image pulled (latest)${NC}"
    else
        # Pull failed - check if we have a cached version
        if docker image inspect "$ZAP_IMAGE" &>/dev/null; then
            echo -e "${YELLOW}⚠ Pull failed (network issue), using cached ZAP image${NC}"
        else
            echo -e "${RED}ERROR: Cannot pull ZAP image and no cached version found${NC}"
            echo "Check your internet connection and try again."
            exit 1
        fi
    fi
}

create_reports_dir() {
    mkdir -p "$REPORTS_DIR"
    mkdir -p "$GENERATED_DIR"
    echo -e "${GREEN}✓ Reports directory ready: $REPORTS_DIR${NC}"
}

load_cached_tokens() {
    if [ ! -f "$TOKENS_FILE" ]; then
        return 0
    fi

    python3 - <<'PY' "$TOKENS_FILE"
import base64
import json
import sys
import time

path = sys.argv[1]
try:
    data = json.load(open(path))
except Exception:
    raise SystemExit(0)

def jwt_exp(token: str) -> int:
    try:
        parts = token.split('.')
        if len(parts) < 2:
            return 0
        payload_b64 = parts[1]
        pad = '=' * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + pad))
        return int(payload.get('exp') or 0)
    except Exception:
        return 0

now = int(time.time())
min_valid = now + 60

out = {}
for key in ["admin", "coach", "courtowner", "shopowner"]:
    tok = (data.get(key) or "").strip()
    if tok and jwt_exp(tok) >= min_valid:
        out[key] = tok

print(f'ZAP_TOKEN_ADMIN={out.get("admin", "")}')
print(f'ZAP_TOKEN_COACH={out.get("coach", "")}')
print(f'ZAP_TOKEN_COURTOWNER={out.get("courtowner", "")}')
print(f'ZAP_TOKEN_SHOPOWNER={out.get("shopowner", "")}')
PY
}

save_tokens() {
    python3 - <<'PY' "$TOKENS_FILE" "$ZAP_TOKEN_ADMIN" "$ZAP_TOKEN_COACH" "$ZAP_TOKEN_COURTOWNER" "$ZAP_TOKEN_SHOPOWNER"
import json
import sys
import time

path = sys.argv[1]
data = {
  "savedAt": int(time.time()),
  "admin": sys.argv[2],
  "coach": sys.argv[3],
  "courtowner": sys.argv[4],
  "shopowner": sys.argv[5],
}
json.dump(data, open(path, 'w'), indent=2)
PY
}

extract_token() {
    local payload="$1"
    python3 - <<'PY' "$payload"
import json
import sys

raw = sys.argv[1]
try:
    data = json.loads(raw)
except Exception:
    print("")
    raise SystemExit(0)

token = ((data.get("data") or {}).get("token")) or ""
print(token)
PY
}

json_get() {
    local payload="$1"
    local path="$2"
    python3 - <<'PY' "$payload" "$path"
import json
import re
import sys

raw = sys.argv[1]
path = sys.argv[2]

try:
    data = json.loads(raw)
except Exception:
    print("")
    raise SystemExit(0)

parts = path.split('.')
cur = data

for part in parts:
    m = re.match(r'^([^\[]+)(?:\[(\d+)\])?$', part)
    if not m:
        cur = None
        break
    key = m.group(1)
    idx = m.group(2)

    if not isinstance(cur, dict) or key not in cur:
        cur = None
        break

    cur = cur[key]
    if idx is not None:
        if not isinstance(cur, list):
            cur = None
            break
        i = int(idx)
        if i < 0 or i >= len(cur):
            cur = None
            break
        cur = cur[i]

if cur is None:
    print("")
elif isinstance(cur, (dict, list)):
    print("")
else:
    print(cur)
PY
}

post_json() {
    local url="$1"
    local payload="$2"
    curl -s -X POST "$url" -H "Content-Type: application/json" -d "$payload" || true
}

put_json() {
    local url="$1"
    local payload="$2"
    curl -s -X PUT "$url" -H "Content-Type: application/json" -d "$payload" || true
}

patch_json() {
    local url="$1"
    local payload="$2"
    curl -s -X PATCH "$url" -H "Content-Type: application/json" -d "$payload" || true
}

register_test_user() {
    local username=$1
    local role=$2
    local email=$3

    curl -s -X POST "$BACKEND_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$ZAP_PASSWORD\",\"role\":\"$role\",\"email\":\"$email\"}" \
        > /dev/null 2>&1 || true
}

login_test_user() {
    local username=$1
    local response
    response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$ZAP_PASSWORD\"}" || true)

    extract_token "$response"
}

prepare_auth_tokens() {
    # Try to reuse valid tokens (prevents hitting the 5-per-15min login limiter on reruns)
    local cached
    cached=$(load_cached_tokens || true)
    if [ -n "$cached" ]; then
        eval "$cached"
    fi

    if ! check_service "$BACKEND_URL" "Backend API" > /dev/null; then
        echo -e "${YELLOW}⚠ Backend is not available, skipping auth token preparation${NC}"
        return 0
    fi

    echo -e "${BLUE}Preparing auth users/tokens for protected endpoint scans...${NC}"

    register_test_user "$ZAP_USER_ADMIN" "admin" "$ZAP_USER_ADMIN@example.com"
    register_test_user "$ZAP_USER_COACH" "coach" "$ZAP_USER_COACH@example.com"
    register_test_user "$ZAP_USER_COURTOWNER" "courtowner" "$ZAP_USER_COURTOWNER@example.com"
    register_test_user "$ZAP_USER_SHOPOWNER" "shopowner" "$ZAP_USER_SHOPOWNER@example.com"

    if [[ -z "$ZAP_TOKEN_ADMIN" ]]; then
        ZAP_TOKEN_ADMIN=$(login_test_user "$ZAP_USER_ADMIN")
    fi
    if [[ -z "$ZAP_TOKEN_COACH" ]]; then
        ZAP_TOKEN_COACH=$(login_test_user "$ZAP_USER_COACH")
    fi
    if [[ -z "$ZAP_TOKEN_COURTOWNER" ]]; then
        ZAP_TOKEN_COURTOWNER=$(login_test_user "$ZAP_USER_COURTOWNER")
    fi
    if [[ -z "$ZAP_TOKEN_SHOPOWNER" ]]; then
        ZAP_TOKEN_SHOPOWNER=$(login_test_user "$ZAP_USER_SHOPOWNER")
    fi

    [[ -z "$ZAP_TOKEN_ADMIN" ]] && echo -e "${YELLOW}⚠ Could not obtain admin token${NC}"
    [[ -z "$ZAP_TOKEN_COACH" ]] && echo -e "${YELLOW}⚠ Could not obtain coach token${NC}"
    [[ -z "$ZAP_TOKEN_COURTOWNER" ]] && echo -e "${YELLOW}⚠ Could not obtain courtowner token${NC}"
    [[ -z "$ZAP_TOKEN_SHOPOWNER" ]] && echo -e "${YELLOW}⚠ Could not obtain shopowner token${NC}"

    # Persist tokens (even partial) for the next run.
    save_tokens || true
}

prepare_scan_fixtures() {
        if ! check_service "$BACKEND_URL" "Backend API" > /dev/null; then
                echo -e "${YELLOW}⚠ Backend is not available, skipping fixture preparation${NC}"
                return 0
        fi

        echo -e "${BLUE}Preparing fixture data for deep endpoint coverage...${NC}"

        local court_resp
        court_resp=$(post_json "$BACKEND_URL/api/courts" '{"CourtPhoto":"https://example.com/court.png","CourtName":"ZAP Court","Tel":"0771234567","place":"Colombo","Directions":[{"latitude":"6.9271","longitude":"79.8612"}],"Priceperhour":1500,"Openinghours":"08:00-20:00"}')
        ZAP_FIXTURE_COURT_ID=$(json_get "$court_resp" "court._id")

        if [[ -z "$ZAP_FIXTURE_COURT_ID" ]]; then
                local courts_resp
                courts_resp=$(curl -s "$BACKEND_URL/api/courts" || true)
                ZAP_FIXTURE_COURT_ID=$(json_get "$courts_resp" "courts[0]._id")
        fi

        local coach_resp
        coach_resp=$(post_json "$BACKEND_URL/api/coachers" "{\"CoachPhoto\":\"https://example.com/coach.png\",\"CoachName\":\"ZAP Coach\",\"Tel\":\"0771234568\",\"TrainingType\":[\"Singles\"],\"Certifications\":\"Level 1\",\"Courts\":[\"$ZAP_FIXTURE_COURT_ID\"],\"Experiance\":3,\"hourlyRate\":2500}")
        ZAP_FIXTURE_COACH_ID=$(json_get "$coach_resp" "coach._id")

        if [[ -z "$ZAP_FIXTURE_COACH_ID" ]]; then
                local coaches_resp
                coaches_resp=$(curl -s "$BACKEND_URL/api/coachers" || true)
                ZAP_FIXTURE_COACH_ID=$(json_get "$coaches_resp" "coachers[0]._id")
        fi

        local user_resp
        user_resp=$(post_json "$BACKEND_URL/api/user" "{\"name\":\"ZAP User\",\"email\":\"zap-user-fixture-${RUN_ID}@example.com\",\"firebaseUid\":\"$ZAP_FIXTURE_USER_FIREBASE_UID\",\"password\":\"$ZAP_PASSWORD\",\"role\":\"user\"}")
        ZAP_FIXTURE_USER_MONGO_ID=$(json_get "$user_resp" "_id")

        if [[ -z "$ZAP_FIXTURE_USER_MONGO_ID" ]]; then
                local user_get_resp
                user_get_resp=$(curl -s "$BACKEND_URL/api/user/$ZAP_FIXTURE_USER_FIREBASE_UID" || true)
                ZAP_FIXTURE_USER_MONGO_ID=$(json_get "$user_get_resp" "_id")
        fi

        local shop_resp
        shop_resp=$(post_json "$BACKEND_URL/api/shops" '{"ShopPhoto":"https://example.com/shop.png","ShopName":"ZAP Shop","Tel":"0771234569","place":"Colombo","website":"https://example.com","brands":[{"name":"ZAP Brand","images":"https://example.com/brand.png"}]}' )
        ZAP_FIXTURE_SHOP_ID=$(json_get "$shop_resp" "shop._id")

        if [[ -z "$ZAP_FIXTURE_SHOP_ID" ]]; then
                local shops_resp
                shops_resp=$(curl -s "$BACKEND_URL/api/shops" || true)
                ZAP_FIXTURE_SHOP_ID=$(json_get "$shops_resp" "shops[0]._id")
        fi

        if [[ -n "$ZAP_FIXTURE_SHOP_ID" ]]; then
                local category_resp
                category_resp=$(post_json "$BACKEND_URL/api/shops/$ZAP_FIXTURE_SHOP_ID/categories" '{"categoryName":"ZAP Category","priceRange":"1000-3000"}')
                ZAP_FIXTURE_CATEGORY_ID=$(json_get "$category_resp" "shop.categories[0]._id")

                if [[ -n "$ZAP_FIXTURE_CATEGORY_ID" ]]; then
                        local item_resp
                        item_resp=$(post_json "$BACKEND_URL/api/shops/shop/$ZAP_FIXTURE_SHOP_ID/categories/$ZAP_FIXTURE_CATEGORY_ID/items" "{\"itemphoto\":\"https://example.com/item.png\",\"name\":\"ZAP Racket\",\"price\":2000,\"color\":\"Black\",\"brand\":\"ZAP Brand\",\"features\":\"Light\",\"availableqty\":10,\"categoryId\":\"$ZAP_FIXTURE_CATEGORY_ID\"}")
                        ZAP_FIXTURE_ITEM_ID=$(json_get "$item_resp" "shop.items[0]._id")
                fi
        fi

        local match_resp
        match_resp=$(post_json "$BACKEND_URL/api/matches" '{"MatchPhoto":"https://example.com/match.png","MatchName":"ZAP Match","StartDate":"2026-03-01","EndDate":"2026-03-02","Weblink":"https://example.com/match"}')
        ZAP_FIXTURE_MATCH_ID=$(json_get "$match_resp" "match._id")

        local coach_slot_resp
        coach_slot_resp=$(post_json "$BACKEND_URL/api/coachers/$ZAP_FIXTURE_COACH_ID/availability" '{"dayOfWeek":1,"startTime":"09:00","endTime":"11:00","isRecurring":true}')
        ZAP_FIXTURE_COACH_SLOT_ID=$(json_get "$coach_slot_resp" "data._id")

        local court_slot_resp
        court_slot_resp=$(post_json "$BACKEND_URL/api/courts/$ZAP_FIXTURE_COURT_ID/availability" '{"dayOfWeek":1,"startTime":"09:00","endTime":"11:00","isRecurring":true}')
        ZAP_FIXTURE_COURT_SLOT_ID=$(json_get "$court_slot_resp" "data._id")

        local coach_booking_resp
        coach_booking_resp=$(post_json "$BACKEND_URL/api/coachers/$ZAP_FIXTURE_COACH_ID/bookings" "{\"date\":\"2026-02-23\",\"startTime\":\"09:00\",\"endTime\":\"10:00\",\"userId\":\"$ZAP_FIXTURE_USER_MONGO_ID\",\"courtId\":\"$ZAP_FIXTURE_COURT_ID\",\"notes\":\"zap\"}")
        ZAP_FIXTURE_COACH_BOOKING_ID=$(json_get "$coach_booking_resp" "data._id")

        local court_booking_resp
        court_booking_resp=$(post_json "$BACKEND_URL/api/courts/$ZAP_FIXTURE_COURT_ID/bookings" "{\"date\":\"2026-02-23\",\"startTime\":\"10:00\",\"endTime\":\"11:00\",\"userId\":\"$ZAP_FIXTURE_USER_MONGO_ID\",\"notes\":\"zap\"}")
        ZAP_FIXTURE_COURT_BOOKING_ID=$(json_get "$court_booking_resp" "data._id")

                ZAP_DYNAMIC_BACKEND_REQUESTS=$(cat <<EOF
- url: "http://host.docker.internal:5001/api/coachers/$ZAP_FIXTURE_COACH_ID"
  method: "GET"
- url: "http://host.docker.internal:5001/api/coachers/$ZAP_FIXTURE_COACH_ID"
  method: "PUT"
  data: '{"CoachName":"ZAP Coach Updated"}'
- url: "http://host.docker.internal:5001/api/coachers/$ZAP_FIXTURE_COACH_ID/availability"
  method: "GET"
- url: "http://host.docker.internal:5001/api/coachers/$ZAP_FIXTURE_COACH_ID/availability/$ZAP_FIXTURE_COACH_SLOT_ID"
  method: "PUT"
  data: '{"startTime":"10:00","endTime":"12:00"}'
- url: "http://host.docker.internal:5001/api/coachers/$ZAP_FIXTURE_COACH_ID/check-availability"
  method: "POST"
  data: '{"date":"2026-02-23","startTime":"09:00","endTime":"10:00"}'
- url: "http://host.docker.internal:5001/api/coachers/$ZAP_FIXTURE_COACH_ID/bookings/$ZAP_FIXTURE_COACH_BOOKING_ID"
  method: "GET"
- url: "http://host.docker.internal:5001/api/coachers/$ZAP_FIXTURE_COACH_ID/bookings/$ZAP_FIXTURE_COACH_BOOKING_ID/status"
  method: "PATCH"
  data: '{"status":"confirmed"}'

- url: "http://host.docker.internal:5001/api/courts/$ZAP_FIXTURE_COURT_ID/availability"
  method: "GET"
- url: "http://host.docker.internal:5001/api/courts/$ZAP_FIXTURE_COURT_ID/availability/$ZAP_FIXTURE_COURT_SLOT_ID"
  method: "PUT"
  data: '{"startTime":"10:00","endTime":"12:00"}'
- url: "http://host.docker.internal:5001/api/courts/$ZAP_FIXTURE_COURT_ID/check-availability"
  method: "POST"
  data: '{"date":"2026-02-23","startTime":"10:00","endTime":"11:00"}'
- url: "http://host.docker.internal:5001/api/courts/$ZAP_FIXTURE_COURT_ID/bookings/$ZAP_FIXTURE_COURT_BOOKING_ID"
  method: "GET"
- url: "http://host.docker.internal:5001/api/courts/$ZAP_FIXTURE_COURT_ID/bookings/$ZAP_FIXTURE_COURT_BOOKING_ID/status"
  method: "PATCH"
  data: '{"status":"confirmed"}'

- url: "http://host.docker.internal:5001/api/shops/shop/$ZAP_FIXTURE_SHOP_ID"
  method: "GET"
- url: "http://host.docker.internal:5001/api/shops/shop/$ZAP_FIXTURE_SHOP_ID"
  method: "PUT"
  data: '{"ShopName":"ZAP Shop Updated"}'
- url: "http://host.docker.internal:5001/api/items/shop/$ZAP_FIXTURE_SHOP_ID"
  method: "GET"
- url: "http://host.docker.internal:5001/api/items/category/$ZAP_FIXTURE_CATEGORY_ID"
  method: "GET"
- url: "http://host.docker.internal:5001/api/items/$ZAP_FIXTURE_ITEM_ID"
  method: "GET"

- url: "http://host.docker.internal:5001/api/matches/match/$ZAP_FIXTURE_MATCH_ID"
  method: "PUT"
  data: '{"MatchName":"ZAP Match Updated"}'

- url: "http://host.docker.internal:5001/api/user/$ZAP_FIXTURE_USER_FIREBASE_UID"
  method: "GET"
- url: "http://host.docker.internal:5001/api/user/$ZAP_FIXTURE_USER_FIREBASE_UID"
  method: "PUT"
  data: '{"name":"ZAP User Updated"}'

- url: "http://host.docker.internal:5001/api/payment/payments/user/$ZAP_FIXTURE_USER_MONGO_ID"
  method: "GET"
EOF
)

        echo -e "${GREEN}✓ Fixture preparation complete (court: ${ZAP_FIXTURE_COURT_ID:-n/a}, coach: ${ZAP_FIXTURE_COACH_ID:-n/a}, shop: ${ZAP_FIXTURE_SHOP_ID:-n/a})${NC}"
}

render_scan_config() {
    local source_file=$1
    local output_file=$2

    python3 - <<'PY' "$source_file" "$output_file" "$ZAP_TOKEN_ADMIN" "$ZAP_TOKEN_COACH" "$ZAP_TOKEN_COURTOWNER" "$ZAP_TOKEN_SHOPOWNER" "$ZAP_DYNAMIC_BACKEND_REQUESTS"
import pathlib
import re
import sys

source = pathlib.Path(sys.argv[1])
target = pathlib.Path(sys.argv[2])

admin = sys.argv[3] or "zap-missing-admin-token"
coach = sys.argv[4] or "zap-missing-coach-token"
courtowner = sys.argv[5] or "zap-missing-courtowner-token"
shopowner = sys.argv[6] or "zap-missing-shopowner-token"
dynamic_requests = sys.argv[7] if len(sys.argv) > 7 else ""

content = source.read_text()
content = content.replace("__ZAP_TOKEN_ADMIN__", admin)
content = content.replace("__ZAP_TOKEN_COACH__", coach)
content = content.replace("__ZAP_TOKEN_COURTOWNER__", courtowner)
content = content.replace("__ZAP_TOKEN_SHOPOWNER__", shopowner)

# Replace the entire marker line, preserving YAML indentation.
marker = "# __ZAP_DYNAMIC_BACKEND_REQUESTS__"
lines_out = []
for line in content.splitlines(True):
    if marker in line:
        indent = re.match(r"^(\s*)", line).group(1)
        dyn = dynamic_requests.strip("\n")
        if dyn:
            for dyn_line in dyn.splitlines():
                lines_out.append(indent + dyn_line + "\n")
        # omit the marker line itself
        continue
    lines_out.append(line)

content = "".join(lines_out)

target.write_text(content)
PY
}

validate_expected_reports() {
    local scan_name=$1
    local report_base=$2
    local log_file=$3

    local expected_html="$REPORTS_DIR/${report_base}.html"
    local expected_json="$REPORTS_DIR/${report_base}.json"

    if [ ! -f "$expected_html" ] || [ ! -f "$expected_json" ]; then
        echo -e "${RED}ERROR: ${scan_name} scan did not generate expected report files.${NC}"
        echo "Expected:"
        echo "  - $expected_html"
        echo "  - $expected_json"
        echo ""
        echo "Possible causes:"
        echo "  - Scan was interrupted before completion"
        echo "  - Docker container exited with an error"
        echo "  - ZAP active scan did not finish"
        echo ""
        if [ -f "$log_file" ]; then
            echo "Last 30 lines from log ($log_file):"
            tail -n 30 "$log_file" || true
        fi
        return 1
    fi
}

# ==============================================================================
# Scan Functions
# ==============================================================================

run_frontend_scan() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  🌐 Running Frontend Scan (React/Vite @ $FRONTEND_URL)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if ! check_service "$FRONTEND_URL" "Frontend"; then
        echo -e "${RED}Skipping frontend scan - service not running${NC}"
        echo "Start it with: cd Shuttlemate-Frontend && npm run dev"
        return 1
    fi

    echo -e "${YELLOW}Starting ZAP Automation Framework scan...${NC}"
    echo "Estimated time: 5-10 minutes. Live output below:"
    echo ""
    step_timer_start
    local frontend_log="$REPORTS_DIR/frontend-scan-log-${TIMESTAMP}.txt"

    local frontend_config_rel="generated/frontend-scan-${TIMESTAMP}.yaml"
    local frontend_config_abs="$ZAP_DIR/$frontend_config_rel"
    render_scan_config "$ZAP_DIR/frontend-scan.yaml" "$frontend_config_abs"

    set +e
    docker run --rm \
        -v "$ZAP_DIR:/zap/wrk:rw" \
        $DOCKER_MEMORY \
        $DOCKER_NETWORK_FLAG \
        "$ZAP_IMAGE" \
        zap.sh -cmd -Xmx512m -autorun "/zap/wrk/$frontend_config_rel" \
        2>&1 | tee "$frontend_log"
    local frontend_exit_code=${PIPESTATUS[0]}
    set -e

    if [ "$frontend_exit_code" -ne 0 ]; then
        echo -e "${RED}ERROR: Frontend ZAP scan process failed before completion.${NC}"
        echo "Check log: $frontend_log"
        return 1
    fi

    validate_expected_reports "Frontend" "shuttlemate-frontend-report" "$frontend_log"

    echo ""
    echo -e "${GREEN}✓ Frontend scan complete! (took $(step_elapsed))${NC}"

    # Rename reports with timestamp
    if [ -f "$REPORTS_DIR/shuttlemate-frontend-report.html" ]; then
        mv "$REPORTS_DIR/shuttlemate-frontend-report.html" \
           "$REPORTS_DIR/shuttlemate-frontend-report-${TIMESTAMP}.html"
        echo -e "${GREEN}  📄 HTML Report: reports/shuttlemate-frontend-report-${TIMESTAMP}.html${NC}"
    fi
    if [ -f "$REPORTS_DIR/shuttlemate-frontend-report.json" ]; then
        mv "$REPORTS_DIR/shuttlemate-frontend-report.json" \
           "$REPORTS_DIR/shuttlemate-frontend-report-${TIMESTAMP}.json"
        echo -e "${GREEN}  📄 JSON Report: reports/shuttlemate-frontend-report-${TIMESTAMP}.json${NC}"
    fi
}

run_backend_scan() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  🔧 Running Backend API Scan (Express @ $BACKEND_URL)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if ! check_service "$BACKEND_URL" "Backend API"; then
        echo -e "${RED}Skipping backend scan - service not running${NC}"
        echo "Start it with: cd Shuttlemate-Backend && npm run dev"
        return 1
    fi

    echo -e "${YELLOW}Starting ZAP Automation Framework scan...${NC}"
    echo "Estimated time: 5-10 minutes. Live output below:"
    echo ""
    step_timer_start
    local backend_log="$REPORTS_DIR/backend-scan-log-${TIMESTAMP}.txt"

    local backend_config_rel="generated/backend-scan-${TIMESTAMP}.yaml"
    local backend_config_abs="$ZAP_DIR/$backend_config_rel"
    render_scan_config "$ZAP_DIR/backend-scan.yaml" "$backend_config_abs"

    set +e
    docker run --rm \
        -v "$ZAP_DIR:/zap/wrk:rw" \
        $DOCKER_MEMORY \
        $DOCKER_NETWORK_FLAG \
        "$ZAP_IMAGE" \
        zap.sh -cmd -Xmx512m -autorun "/zap/wrk/$backend_config_rel" \
        2>&1 | tee "$backend_log"
    local backend_exit_code=${PIPESTATUS[0]}
    set -e

    if [ "$backend_exit_code" -ne 0 ]; then
        # ZAP can exit non-zero when the automation plan has warnings (e.g., a
        # start URL returns 404) even if the scan ran and reports were generated.
        if validate_expected_reports "Backend" "shuttlemate-backend-report" "$backend_log"; then
            echo -e "${YELLOW}⚠ Backend ZAP exited with code $backend_exit_code, but reports were generated.${NC}"
        else
            echo -e "${RED}ERROR: Backend ZAP scan process failed before completion.${NC}"
            echo "Check log: $backend_log"
            return 1
        fi
    else
        validate_expected_reports "Backend" "shuttlemate-backend-report" "$backend_log"
    fi

    echo ""
    echo -e "${GREEN}✓ Backend scan complete! (took $(step_elapsed))${NC}"

    # Rename reports with timestamp
    if [ -f "$REPORTS_DIR/shuttlemate-backend-report.html" ]; then
        mv "$REPORTS_DIR/shuttlemate-backend-report.html" \
           "$REPORTS_DIR/shuttlemate-backend-report-${TIMESTAMP}.html"
        echo -e "${GREEN}  📄 HTML Report: reports/shuttlemate-backend-report-${TIMESTAMP}.html${NC}"
    fi
    if [ -f "$REPORTS_DIR/shuttlemate-backend-report.json" ]; then
        mv "$REPORTS_DIR/shuttlemate-backend-report.json" \
           "$REPORTS_DIR/shuttlemate-backend-report-${TIMESTAMP}.json"
        echo -e "${GREEN}  📄 JSON Report: reports/shuttlemate-backend-report-${TIMESTAMP}.json${NC}"
    fi
}

run_baseline_scan() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  ⚡ Running Quick Baseline Scan (Passive Only)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Baseline scan is faster - only passive checks, no active attacks."
    echo ""

    create_reports_dir

    # Frontend baseline
    if check_service "$FRONTEND_URL" "Frontend"; then
        echo -e "${YELLOW}Scanning frontend (passive only, ~2-3 min)...${NC}"
        step_timer_start
        docker run --rm \
            -v "$REPORTS_DIR:/zap/wrk:rw" \
            $DOCKER_MEMORY \
            $DOCKER_NETWORK_FLAG \
            "$ZAP_IMAGE" \
            zap-baseline.py \
            -t "http://${DOCKER_HOST_ALIAS}:5173" \
            -r "shuttlemate-frontend-baseline-${TIMESTAMP}.html" \
            -J "shuttlemate-frontend-baseline-${TIMESTAMP}.json" \
            -m 2 \
            -I \
            2>&1 | while IFS= read -r line; do
                echo -e "  ${BLUE}[$(step_elapsed)]${NC} $line"
            done | tee "$REPORTS_DIR/frontend-baseline-log-${TIMESTAMP}.txt"
        echo -e "${GREEN}✓ Frontend baseline scan done (took $(step_elapsed))${NC}"
    fi

    # Backend baseline
    if check_service "$BACKEND_URL" "Backend API"; then
        echo -e "${YELLOW}Scanning backend API (passive only, ~2-3 min)...${NC}"
        step_timer_start
        docker run --rm \
            -v "$REPORTS_DIR:/zap/wrk:rw" \
            $DOCKER_MEMORY \
            $DOCKER_NETWORK_FLAG \
            "$ZAP_IMAGE" \
            zap-baseline.py \
            -t "http://${DOCKER_HOST_ALIAS}:5001" \
            -r "shuttlemate-backend-baseline-${TIMESTAMP}.html" \
            -J "shuttlemate-backend-baseline-${TIMESTAMP}.json" \
            -m 2 \
            -I \
            2>&1 | while IFS= read -r line; do
                echo -e "  ${BLUE}[$(step_elapsed)]${NC} $line"
            done | tee "$REPORTS_DIR/backend-baseline-log-${TIMESTAMP}.txt"
        echo -e "${GREEN}✓ Backend baseline scan done (took $(step_elapsed))${NC}"
    fi

    echo ""
    echo -e "${GREEN}Baseline reports saved to: $REPORTS_DIR${NC}"
}

print_summary() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📊 Scan Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Reports saved to: ${GREEN}$REPORTS_DIR${NC}"
    echo ""
    if ls "$REPORTS_DIR"/*.html 1> /dev/null 2>&1; then
        echo "HTML Reports (open in browser for best viewing):"
        for f in "$REPORTS_DIR"/*-${TIMESTAMP}.html; do
            [ -f "$f" ] && echo -e "  📄 ${GREEN}$(basename "$f")${NC}"
        done
    fi
    echo ""
    echo -e "To view a report: ${YELLOW}open $REPORTS_DIR/<report-name>.html${NC}"
    echo ""
}

# ==============================================================================
# Main
# ==============================================================================

print_banner
echo -e "${YELLOW}💡 TIP: In Docker Desktop → Settings → Resources, limit RAM to 2-3GB${NC}"
echo -e "${YELLOW}   to prevent Docker from starving your system of memory.${NC}"
echo ""
check_docker
create_reports_dir
prepare_auth_tokens
prepare_scan_fixtures

SCAN_TYPE="${1:-all}"

case "$SCAN_TYPE" in
    frontend)
        pull_zap_image
        run_frontend_scan
        ;;
    backend)
        pull_zap_image
        run_backend_scan
        ;;
    baseline)
        pull_zap_image
        run_baseline_scan
        ;;
    all)
        pull_zap_image
        run_frontend_scan
        run_backend_scan
        ;;
    *)
        echo "Usage: $0 [frontend|backend|baseline|all]"
        echo ""
        echo "  frontend  - Full scan of React frontend (port 5173)"
        echo "  backend   - Full scan of Express API (port 5001)"
        echo "  baseline  - Quick passive-only scan of both"
        echo "  all       - Full scan of both (default)"
        exit 1
        ;;
esac

print_summary
echo -e "${GREEN}Done! Total time: $(elapsed_time) 🎉${NC}"
