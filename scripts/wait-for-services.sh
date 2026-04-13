#!/usr/bin/env bash

set -euo pipefail

TIMEOUT=120
INTERVAL=5
SERVICES=()

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_step() {
    echo -e "${BOLD}${YELLOW}==>${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat <<'EOF'
Usage: ./scripts/wait-for-services.sh [OPTIONS] [--] SERVICE [SERVICE...]

Options:
  --timeout <seconds>   Maximum time to wait. Default: 120
  --interval <seconds>  Delay between retries. Default: 5
  --help                Show this help message

Supported service formats:
  mysql:host:port       Probe a MySQL TCP port
  postgres:host:port    Probe a PostgreSQL TCP port
  http://host/path      Probe an HTTP or HTTPS endpoint
  host:port             Auto-detects MySQL/PostgreSQL ports, otherwise probes TCP
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        --)
            shift
            break
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            SERVICES+=("$1")
            shift
            ;;
    esac
done

while [[ $# -gt 0 ]]; do
    SERVICES+=("$1")
    shift
done

if [[ ${#SERVICES[@]} -eq 0 ]]; then
    log_error "No services were provided."
    show_help
    exit 1
fi

if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]] || ! [[ "$INTERVAL" =~ ^[0-9]+$ ]] || [[ "$INTERVAL" -le 0 ]]; then
    log_error "Timeout and interval must be positive integers."
    exit 1
fi

MAX_RETRIES=$(((TIMEOUT + INTERVAL - 1) / INTERVAL))

probe_tcp() {
    local label="$1"
    local host="$2"
    local port="$3"

    log_step "Waiting for $label on $host:$port"

    for ((attempt = 1; attempt <= MAX_RETRIES; attempt++)); do
        if command -v nc >/dev/null 2>&1; then
            if nc -z -w 2 "$host" "$port" >/dev/null 2>&1; then
                log_success "$label is ready on $host:$port"
                return 0
            fi
        elif command -v timeout >/dev/null 2>&1; then
            if timeout 2 bash -c "</dev/tcp/$host/$port" >/dev/null 2>&1; then
                log_success "$label is ready on $host:$port"
                return 0
            fi
        else
            log_error "Neither netcat nor timeout+/dev/tcp is available on this runner."
            return 1
        fi

        log_warn "Still waiting for $label on $host:$port ($((attempt * INTERVAL))s/${TIMEOUT}s)"
        sleep "$INTERVAL"
    done

    log_error "$label did not become ready on $host:$port within ${TIMEOUT}s"
    return 1
}

probe_http() {
    local url="$1"

    log_step "Waiting for HTTP endpoint $url"

    for ((attempt = 1; attempt <= MAX_RETRIES; attempt++)); do
        if ! command -v curl >/dev/null 2>&1; then
            log_error "curl is required to probe HTTP endpoints."
            return 1
        fi

        local status
        status="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"

        if [[ "$status" =~ ^(200|201|202|204|301|302|307|308)$ ]]; then
            log_success "HTTP endpoint is ready: $url (status $status)"
            return 0
        fi

        log_warn "Still waiting for $url ($((attempt * INTERVAL))s/${TIMEOUT}s, status ${status:-000})"
        sleep "$INTERVAL"
    done

    log_error "HTTP endpoint did not become ready: $url"
    return 1
}

probe_target() {
    local target="$1"

    if [[ "$target" =~ ^https?:// ]]; then
        probe_http "$target"
        return
    fi

    if [[ "$target" =~ ^(mysql|postgres):(.*)$ ]]; then
        local service_type="${BASH_REMATCH[1]}"
        local address="${BASH_REMATCH[2]}"
        local default_port="3306"

        if [[ "$service_type" == "postgres" ]]; then
            default_port="5432"
        fi

        local host="${address%:*}"
        local port="${address##*:}"

        if [[ "$host" == "$address" ]]; then
            port="$default_port"
        fi

        probe_tcp "$service_type" "$host" "$port"
        return
    fi

    if [[ "$target" =~ ^([^:]+):([0-9]+)$ ]]; then
        local host="${BASH_REMATCH[1]}"
        local port="${BASH_REMATCH[2]}"

        case "$port" in
            3306|3307)
                probe_tcp "mysql" "$host" "$port"
                ;;
            5432)
                probe_tcp "postgres" "$host" "$port"
                ;;
            *)
                probe_tcp "tcp service" "$host" "$port"
                ;;
        esac
        return
    fi

    log_error "Unsupported service target: $target"
    return 1
}

FAILED=0

for service in "${SERVICES[@]}"; do
    if ! probe_target "$service"; then
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo -e "${BOLD}========================================${NC}"

if [[ "$FAILED" -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}All services are ready.${NC}"
    echo -e "${BOLD}========================================${NC}"
    exit 0
fi

echo -e "${RED}${BOLD}$FAILED service(s) failed readiness checks.${NC}"
echo -e "${BOLD}========================================${NC}"
exit 1
