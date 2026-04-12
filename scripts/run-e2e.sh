#!/bin/bash

set -euo pipefail

COMPOSE_FILE="docker-compose.e2e.yml"
PROJECT_NAME="${COMPOSE_FILE%.yml}"
BACKEND_PORT="8081"
FRONTEND_PORT="3001"
MYSQL_PORT="3307"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}      $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}   $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC}  $1"; }
log_step()    { echo -e "${CYAN}[STEP]${NC}   $1"; }
log_header()  {
    echo ""
    echo -e "${BOLD}========================================${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${BOLD}========================================${NC}"
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
}

check_compose() {
    if ! docker compose version > /dev/null 2>&1; then
        log_error "Docker Compose plugin was not found."
        exit 1
    fi
}

check_ports() {
    local ports=("$BACKEND_PORT" "$FRONTEND_PORT" "$MYSQL_PORT")
    local services=("Backend" "Frontend" "MySQL")

    for i in "${!ports[@]}"; do
        if command -v lsof > /dev/null 2>&1 && lsof -Pi ":${ports[$i]}" -sTCP:LISTEN -t > /dev/null 2>&1; then
            log_warn "Port ${ports[$i]} (${services[$i]}) is already in use."
        fi
    done
}

ACTION="run"
HEADLESS="true"
KEEP_RUNNING="false"
TEST_PROJECT=""
PROFILE="e2e"

while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADLESS="false"
            shift
            ;;
        --keep-running)
            KEEP_RUNNING="true"
            shift
            ;;
        --project=*)
            TEST_PROJECT="${1#*=}"
            shift
            ;;
        --db-only)
            PROFILE="db-only"
            ACTION="db-only"
            shift
            ;;
        --stop)
            ACTION="stop"
            shift
            ;;
        --status)
            ACTION="status"
            shift
            ;;
        --logs)
            ACTION="logs"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --headed           Run Playwright in headed mode"
            echo "  --keep-running     Keep the Docker stack running after tests"
            echo "  --project=<name>   Run only one Playwright project"
            echo "  --db-only          Start only MySQL from the E2E stack"
            echo "  --stop             Stop and clean the E2E stack"
            echo "  --status           Show current stack status"
            echo "  --logs             Tail stack logs"
            echo "  --help, -h         Show this help"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

compose_cmd() {
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" "$@"
}

case "$ACTION" in
    stop)
        log_header "Stop E2E Stack"
        compose_cmd down -v --remove-orphans 2>/dev/null || true
        log_success "E2E stack stopped."
        exit 0
        ;;

    status)
        log_header "E2E Stack Status"
        compose_cmd ps
        echo ""
        echo "Backend:  http://localhost:$BACKEND_PORT"
        echo "Frontend: http://localhost:$FRONTEND_PORT"
        echo "MySQL:    localhost:$MYSQL_PORT"
        exit 0
        ;;

    logs)
        log_header "E2E Stack Logs"
        compose_cmd logs -f
        exit 0
        ;;

    db-only)
        log_header "Start E2E Database Only"
        check_docker
        check_compose
        compose_cmd --profile db-only up -d
        ./scripts/wait-for-services.sh --timeout 120 --interval 5 -- localhost:"$MYSQL_PORT"
        log_success "MySQL is ready on localhost:$MYSQL_PORT"
        exit 0
        ;;

    run)
        log_header "Run E2E Tests"
        check_docker
        check_compose
        check_ports

        compose_cmd down -v --remove-orphans 2>/dev/null || true

        log_step "Build backend and frontend images"
        compose_cmd build --no-cache backend frontend

        log_step "Start E2E stack"
        compose_cmd --profile "$PROFILE" up -d

        log_step "Wait for MySQL"
        ./scripts/wait-for-services.sh --timeout 120 --interval 5 -- localhost:"$MYSQL_PORT"

        log_step "Wait for backend"
        ./scripts/wait-for-services.sh --timeout 180 --interval 10 -- http://localhost:"$BACKEND_PORT"/api/actuator/health/liveness

        log_step "Wait for frontend"
        ./scripts/wait-for-services.sh --timeout 120 --interval 5 -- http://localhost:"$FRONTEND_PORT"/

        log_step "Install Playwright browser"
        (
            cd frontend
            npm ci --prefer-offline > /dev/null
            npx playwright install --with-deps chromium > /dev/null
        )

        PLAYWRIGHT_CMD="npx playwright test --reporter=html,line --retries=3"
        if [ -n "$TEST_PROJECT" ]; then
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --project=$TEST_PROJECT"
        fi

        log_step "Run Playwright tests"
        (
            cd frontend
            BASE_URL="http://localhost:$FRONTEND_PORT" \
            API_URL="http://localhost:$FRONTEND_PORT/api" \
            PLAYWRIGHT_BASE_URL="http://localhost:$FRONTEND_PORT" \
            PLAYWRIGHT_HEADLESS="$HEADLESS" \
            bash -c "$PLAYWRIGHT_CMD"
        )
        TEST_EXIT_CODE=$?

        if [ "$KEEP_RUNNING" != "true" ]; then
            log_step "Stop E2E stack"
            compose_cmd down -v --remove-orphans
        else
            log_warn "Keeping the E2E stack running."
        fi

        exit $TEST_EXIT_CODE
        ;;
esac
