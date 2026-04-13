#!/bin/bash
# ==============================================================================
# wait-for-services.sh - Reusable health-check script for Docker Compose & CI
# Hỗ trợ: MySQL (port 3306), PostgreSQL (port 5432), HTTP endpoint health check
# ==============================================================================

set -e

# ---------- Cấu hình mặc định ----------
TIMEOUT=120        # Tổng timeout tính bằng giây
INTERVAL=5         # Khoảng thời gian giữa các lần thử (giây)
RETRIES=0          # Số lần thử hiện tại
QUIET=0            # Chế độ yên lặng (0 = hiển thị output)

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ---------- Hàm helper ----------
log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERR]${NC}    $1"; }
log_step()    { echo -e "${CYAN}[STEP]${NC}   $1"; }

# Tính số lần thử tối đa
max_retries=$((TIMEOUT / INTERVAL))

# ---------- Parse arguments ----------
while [[ $# -gt 0 ]]; do
    case $1 in
        --timeout)
            TIMEOUT="$2"
            max_retries=$((TIMEOUT / INTERVAL))
            shift 2
            ;;
        --interval)
            INTERVAL="$2"
            max_retries=$((TIMEOUT / INTERVAL))
            shift 2
            ;;
        --quiet|-q)
            QUIET=1
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] <service> [<service> ...]"
            echo ""
            echo "Services:"
            echo "  mysql      - Chờ MySQL trên port 3306 (tcp)"
            echo "  postgres   - Chờ PostgreSQL trên port 5432 (tcp)"
            echo "  http://... - Chờ HTTP endpoint trả về 200"
            echo ""
            echo "Options:"
            echo "  --timeout <sec>   Tổng timeout (mặc định: 120)"
            echo "  --interval <sec>  Khoảng thời gian giữa các lần thử (mặc định: 5)"
            echo "  --quiet, -q        Chế độ yên lặng, chỉ hiển thị lỗi"
            echo "  --help, -h         Hiển thị trợ giúp"
            echo ""
            echo "Ví dụ:"
            echo "  $0 mysql postgres"
            echo "  $0 --timeout 60 mysql"
            echo "  $0 http://localhost:8080/api/health/live"
            echo "  $0 --timeout 30 --interval 2 http://backend:8080/api/health/live"
            exit 0
            ;;
        -*)
            log_error "Tùy chọn không hợp lệ: $1"
            echo "Dùng '$0 --help' để xem hướng dẫn."
            exit 1
            ;;
        *)
            SERVICES+=("$1")
            shift
            ;;
    esac
done

# Kiểm tra đầu vào
if [ ${#SERVICES[@]} -eq 0 ]; then
    log_error "Chưa chỉ định service nào để chờ."
    echo "Dùng '$0 --help' để xem hướng dẫn."
    exit 1
fi

# ---------- Hàm kiểm tra từng loại service ----------
check_mysql() {
    local host="${1%:3306}"
    local port="${1##*:}"
    port="${port:-3306}"
    
    log_step "Chờ MySQL tại $host:$port ..."
    
    if command -v mysql &> /dev/null; then
        while [ $RETRIES -lt $max_retries ]; do
            # Use rootpass123 as fallback, but prefer environment variables if set
            local pass="${MYSQL_ROOT_PASSWORD:-rootpass123}"
            if mysqladmin ping -h "$host" -P "$port" -u root -p"$pass" --silent &> /dev/null 2>&1; then
                log_success "MySQL ($host:$port) đã sẵn sàng!"
                return 0
            fi
            RETRIES=$((RETRIES + 1))
            log_warn "Chờ MySQL... ($((RETRIES * INTERVAL))s/${TIMEOUT}s)"
            sleep $INTERVAL
        done
    else
        # Fallback: dùng nc (netcat) hoặc timeout
        while [ $RETRIES -lt $max_retries ]; do
            if command -v nc &> /dev/null; then
                if nc -z -w 2 "$host" "$port" 2>/dev/null; then
                    log_success "MySQL ($host:$port) port đã mở!"
                    return 0
                fi
            elif command -v timeout &> /dev/null; then
                if timeout 2 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
                    log_success "MySQL ($host:$port) port đã mở!"
                    return 0
                fi
            else
                # Cuối cùng: dùng curl đến backend health endpoint thay thế
                log_warn "Không tìm thấy mysqladmin/nc, thử qua HTTP..."
                return 2
            fi
            RETRIES=$((RETRIES + 1))
            log_warn "Chờ MySQL... ($((RETRIES * INTERVAL))s/${TIMEOUT}s)"
            sleep $INTERVAL
        done
    fi
    
    log_error "MySQL ($host:$port) không phản hồi sau ${TIMEOUT}s"
    return 1
}

check_postgres() {
    local host="${1%:5432}"
    local port="${1##*:}"
    port="${port:-5432}"
    
    log_step "Chờ PostgreSQL tại $host:$port ..."
    
    if command -v pg_isready &> /dev/null; then
        while [ $RETRIES -lt $max_retries ]; do
            if pg_isready -h "$host" -p "$port" -U postgres -q 2>/dev/null; then
                log_success "PostgreSQL ($host:$port) đã sẵn sàng!"
                return 0
            fi
            RETRIES=$((RETRIES + 1))
            log_warn "Chờ PostgreSQL... ($((RETRIES * INTERVAL))s/${TIMEOUT}s)"
            sleep $INTERVAL
        done
    else
        while [ $RETRIES -lt $max_retries ]; do
            if command -v nc &> /dev/null; then
                if nc -z -w 2 "$host" "$port" 2>/dev/null; then
                    log_success "PostgreSQL ($host:$port) port đã mở!"
                    return 0
                fi
            elif command -v timeout &> /dev/null; then
                if timeout 2 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
                    log_success "PostgreSQL ($host:$port) port đã mở!"
                    return 0
                fi
            fi
            RETRIES=$((RETRIES + 1))
            log_warn "Chờ PostgreSQL... ($((RETRIES * INTERVAL))s/${TIMEOUT}s)"
            sleep $INTERVAL
        done
    fi
    
    log_error "PostgreSQL ($host:$port) không phản hồi sau ${TIMEOUT}s"
    return 1
}

check_http() {
    local url="$1"
    
    log_step "Chờ HTTP endpoint: $url ..."
    
    while [ $RETRIES -lt $max_retries ]; do
        # Lấy HTTP status code
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            log_success "HTTP endpoint ($url) trả về 200 OK!"
            return 0
        elif [ "$HTTP_CODE" = "000" ]; then
            log_warn "Không thể kết nối đến $url ($((RETRIES * INTERVAL))s/${TIMEOUT}s)"
        else
            log_warn "HTTP endpoint trả về HTTP $HTTP_CODE, chờ 200... ($((RETRIES * INTERVAL))s/${TIMEOUT}s)"
        fi
        
        RETRIES=$((RETRIES + 1))
        sleep $INTERVAL
    done
    
    log_error "HTTP endpoint ($url) không phản hồi 200 sau ${TIMEOUT}s (HTTP code: $HTTP_CODE)"
    return 1
}

# ---------- Main: chạy kiểm tra tất cả services ----------
echo ""
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}  wait-for-services.sh${NC}"
echo -e "${BOLD}  Timeout: ${TIMEOUT}s | Interval: ${INTERVAL}s${NC}"
echo -e "${BOLD}========================================${NC}"
echo ""
echo -e "${BOLD}Services cần chờ:${NC}"
for svc in "${SERVICES[@]}"; do
    echo "  - $svc"
done
echo ""

FAILED=0

for service in "${SERVICES[@]}"; do
    # Reset bộ đếm cho mỗi service
    RETRIES=0
    
    case "$service" in
        mysql|mysql:*)
            check_mysql "$service" || FAILED=$((FAILED + 1))
            ;;
        postgres|postgres:*)
            check_postgres "$service" || FAILED=$((FAILED + 1))
            ;;
        http://*|https://*)
            check_http "$service" || FAILED=$((FAILED + 1))
            ;;
        *)
            # Thử nhận diện port từ chuỗi
            if [[ "$service" =~ :[0-9]+$ ]]; then
                check_http "http://$service/api/health/live" || FAILED=$((FAILED + 1))
            else
                log_warn "Không nhận diện được service: $service, thử như HTTP..."
                check_http "http://$service:8080/api/health/live" || FAILED=$((FAILED + 1))
            fi
            ;;
    esac
done

# ---------- Kết quả ----------
echo ""
echo -e "${BOLD}========================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}${BOLD}  Tất cả services đã sẵn sàng!${NC}"
    echo -e "${BOLD}========================================${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}${BOLD}  $FAILED service(s) không khả dụng!${NC}"
    echo -e "${BOLD}========================================${NC}"
    echo ""
    exit 1
fi
