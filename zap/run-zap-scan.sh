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
    echo -e "${GREEN}✓ Reports directory ready: $REPORTS_DIR${NC}"
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

    docker run --rm \
        -v "$ZAP_DIR:/zap/wrk:rw" \
        $DOCKER_MEMORY \
        $DOCKER_NETWORK_FLAG \
        "$ZAP_IMAGE" \
        zap.sh -cmd -Xmx512m -autorun /zap/wrk/frontend-scan.yaml \
        2>&1 | while IFS= read -r line; do
            echo -e "  ${BLUE}[$(step_elapsed)]${NC} $line"
        done | tee "$REPORTS_DIR/frontend-scan-log-${TIMESTAMP}.txt"

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

    docker run --rm \
        -v "$ZAP_DIR:/zap/wrk:rw" \
        $DOCKER_MEMORY \
        $DOCKER_NETWORK_FLAG \
        "$ZAP_IMAGE" \
        zap.sh -cmd -Xmx512m -autorun /zap/wrk/backend-scan.yaml \
        2>&1 | while IFS= read -r line; do
            echo -e "  ${BLUE}[$(step_elapsed)]${NC} $line"
        done | tee "$REPORTS_DIR/backend-scan-log-${TIMESTAMP}.txt"

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
