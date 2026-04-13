#!/bin/bash

# ==============================================================================
# Script: wait-for-services.sh
# Mô tả: Chờ các dịch vụ (MySQL, PostgreSQL, HTTP) sẵn sàng trước khi chạy test.
# Sử dụng: ./wait-for-services.sh --timeout 180 --interval 5 mysql:127.0.0.1:3306 http://127.0.0.1:8080/health
# ==============================================================================

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Biến mặc định
TIMEOUT=120
INTERVAL=5
SERVICES=()
FAILED=0
RETRIES=0

# Log helpers
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_step() { echo -e "${BOLD}${YELLOW}==>${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Hướng dẫn sử dụng
show_help() {
    echo "Sử dụng: $0 [OPTIONS] [SERVICES...]"
    echo ""
    echo "Options:"
    echo "  --timeout T  Thời gian chờ tối đa (giây). Mặc định: 120"
    echo "  --interval I Tần suất kiểm tra (giây). Mặc định: 5"
    echo "  --help       Hiển thị hướng dẫn này"
    echo ""
    echo "Services format:"
    echo "  mysql:host:port      Kiểm tra port MySQL (mặc định port 3306)"
    echo "  postgres:host:port   Kiểm tra port PostgreSQL (mặc định port 5432)"
    echo "  http://url           Kiểm tra HTTP status 200/201/302"
    echo "  host:port            Tự động nhận diện (3306/3307=MySQL, 5432=Postgres, còn lại=HTTP)"
}

# --- Parsing Arguments ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        --timeout) TIMEOUT="$2"; shift 2 ;;
        --interval) INTERVAL="$2"; shift 2 ;;
        --help) show_help; exit 0 ;;
        -*) log_error "Tùy chọn không hợp lệ: $1"; exit 1 ;;
        *) SERVICES+=("$1"); shift ;;
    esac
done

if [ ${#SERVICES[@]} -eq 0 ]; then
    log_error "Không có service nào được chỉ định để chờ!"
    show_help
    exit 1
fi

max_retries=$((TIMEOUT / INTERVAL))

# --- Hàm bóc tách địa chỉ (Robut Parsing) ---
# Trả về chuỗi: "protocol host port"
parse_addr() {
    local input="$1"
    local proto="http"
    local host=""
    local port=""

    # 1. Nhận diện protocol nếu có
    if [[ "$input" =~ ^(mysql|postgres|http|https):(.*) ]]; then
        proto="${BASH_REMATCH[1]}"
        input="${BASH_REMATCH[2]}"
    fi

    # Xử lý trường hợp input bắt đầu bằng // (như http://...)
    input="${input#//}"

    # 2. Bóc tách Host và Port
    if [[ "$input" =~ ([^:/]+):([0-9]+) ]]; then
        host="${BASH_REMATCH[1]}"
        port="${BASH_REMATCH[2]}"
    else
        host="$input"
        # Port mặc định theo protocol
        case "$proto" in
            mysql) port=3306 ;;
            postgres) port=5432 ;;
            *) port=8080 ;;
        esac
    fi

    echo "$proto|$host|$port"
}

# ---------- Hàm kiểm tra Port (MySQL/Postgres) ----------
check_port() {
    local proto="$1"
    local host="$2"
    local port="$3"
    
    log_step "Chờ $proto tại $host:$port (Port Probing)..."
    
    local r=0
    while [ $r -lt $max_retries ]; do
        if command -v nc &> /dev/null; then
            if nc -z -w 2 "$host" "$port" &>/dev/null; then
                log_success "$proto ($host:$port) đã sẵn sàng!"
                return 0
            fi
        elif command -v timeout &> /dev/null; then
            if timeout 2 bash -c "echo > /dev/tcp/$host/$port" &>/dev/null; then
                log_success "$proto ($host:$port) đã sẵn sàng!"
                return 0
            fi
        else
            log_error "Thiếu công cụ thăm dò (nc hoặc bash /dev/tcp). Vui lòng cài đặt netcat."
            return 1
        fi
        
        r=$((r + 1))
        log_warn "Chờ $proto ($host:$port)... ($((r * INTERVAL))s/${TIMEOUT}s)"
        sleep $INTERVAL
    done
    return 1
}

# ---------- Hàm kiểm tra HTTP ----------
check_http() {
    local url="$1"
    
    # Đảm bảo url có http:// nếu chưa có
    [[ "$url" != http* ]] && url="http://$url"
    
    log_step "Chờ HTTP service tại $url ..."
    
    local r=0
    while [ $r -lt $max_retries ]; do
        local status
        if command -v curl &> /dev/null; then
            status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        elif command -v wget &> /dev/null; then
            status=$(wget --spider -S "$url" 2>&1 | grep "HTTP/" | awk '{print $2}' | tail -1 || echo "000")
        else
            log_error "Thiếu công cụ HTTP (curl hoặc wget)!"
            return 1
        fi

        if [[ "$status" =~ ^(200|201|202|204|301|302|307|308)$ ]]; then
            log_success "HTTP Service ($url) đã sẵn sàng! (Status: $status)"
            return 0
        fi
        
        r=$((r + 1))
        log_warn "Chờ HTTP ($url)... ($((r * INTERVAL))s/${TIMEOUT}s) - Status: $status"
        sleep $INTERVAL
    done
    return 1
}

# ---------- Main Loop ----------
for item in "${SERVICES[@]}"; do
    IFS='|' read -r proto host port <<< "$(parse_addr "$item")"
    
    case "$proto" in
        mysql|postgres)
            check_port "$proto" "$host" "$port" || FAILED=$((FAILED + 1))
            ;;
        http|https)
            # Nếu chỉ là domain:port, reconstruct URL, nếu đã là URL thì dùng nguyên
            if [[ "$item" == *"://"* ]]; then
                check_http "$item" || FAILED=$((FAILED + 1))
            else
                check_http "$proto://$host:$port/api/health/live" || FAILED=$((FAILED + 1))
            fi
            ;;
        *)
            # Fallback nhận diện theo port
            if [[ "$port" == "3306" ]] || [[ "$port" == "3307" ]]; then
                check_port "mysql" "$host" "$port" || FAILED=$((FAILED + 1))
            elif [[ "$port" == "5432" ]]; then
                check_port "postgres" "$host" "$port" || FAILED=$((FAILED + 1))
            else
                check_http "http://$host:$port/api/health/live" || FAILED=$((FAILED + 1))
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
    exit 0
else
    echo -e "${RED}${BOLD}  $FAILED service(s) không khả dụng!${NC}"
    echo -e "${BOLD}========================================${NC}"
    exit 1
fi
