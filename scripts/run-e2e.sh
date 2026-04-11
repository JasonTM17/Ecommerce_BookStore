#!/bin/bash
# ==============================================================================
# run-e2e.sh - Local E2E script cho developer
# Chạy E2E test stack với docker-compose.e2e.yml
#
# Usage:
#   ./scripts/run-e2e.sh                      # Chạy headless (mặc định)
#   ./scripts/run-e2e.sh --headed              # Chạy với headed mode (visible browser)
#   ./scripts/run-e2e.sh --keep-running        # Không dọn dẹp sau khi xong
#   ./scripts/run-e2e.sh --project=<name>       # Chạy specific test project
#   ./scripts/run-e2e.sh --db-only             # Chỉ chạy MySQL (dev test)
#   ./scripts/run-e2e.sh --stop               # Dừng và dọn dẹp stack
#   ./scripts/run-e2e.sh --status              # Kiểm tra trạng thái stack
#   ./scripts/run-e2e.sh --logs                # Xem logs của stack
#   ./scripts/run-e2e.sh --help               # Hiển thị trợ giúp
# ==============================================================================

set -e

# ---------- Cấu hình ----------
COMPOSE_FILE="docker-compose.e2e.yml"
PROJECT_NAME="${COMPOSE_FILE%.yml}"
BACKEND_PORT="8081"
FRONTEND_PORT="3001"
MYSQL_PORT="3307"

# ---------- Màu sắc ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---------- Hàm helper ----------
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

# Kiểm tra Docker đang chạy
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker không chạy! Vui lòng khởi động Docker Desktop."
        exit 1
    fi
}

# Kiểm tra docker-compose
check_compose() {
    if ! docker-compose -f "$COMPOSE_FILE" --version > /dev/null 2>&1; then
        log_error "docker-compose không tìm thấy! Vui lòng cài đặt docker-compose."
        exit 1
    fi
}

# Kiểm tra port đang sử dụng
check_ports() {
    local ports=("$BACKEND_PORT" "$FRONTEND_PORT" "$MYSQL_PORT")
    local services=("Backend" "Frontend" "MySQL")
    
    for i in "${!ports[@]}"; do
        if lsof -Pi ":${ports[$i]}" -sTCP:LISTEN -t >/dev/null 2>&1 2>/dev/null || \
           netstat -an 2>/dev/null | grep -q ":${ports[$i]}.*LISTEN"; then
            log_warn "Port ${ports[$i]} (${services[$i]}) đã được sử dụng!"
        fi
    done
}

# ---------- Parse arguments ----------
ACTION="run"
HEADLESS="true"
KEEP_RUNNING="false"
TEST_PROJECT=""
PROFILE="e2e"

while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADLESS="true"
            PLAYWRIGHT_HEADED="--project=headed"
            shift
            ;;
        --keep-running)
            KEEP_RUNNING="true"
            shift
            ;;
        --project=*)
            TEST_PROJECT="${1#*=}"
            PLAYWRIGHT_PROJECT="--project=${TEST_PROJECT}"
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
            echo "  --headed              Chạy với headed mode (visible browser)"
            echo "  --keep-running        Không dọn dẹp stack sau khi xong"
            echo "  --project=<name>      Chạy specific test project"
            echo "  --db-only             Chỉ chạy MySQL (dev test)"
            echo "  --stop                Dừng và dọn dẹp stack"
            echo "  --status              Kiểm tra trạng thái stack"
            echo "  --logs                Xem logs của stack"
            echo "  --help, -h            Hiển thị trợ giúp"
            echo ""
            echo "Examples:"
            echo "  $0                           # Chạy headless"
            echo "  $0 --headed                  # Chạy với visible browser"
            echo "  $0 --keep-running            # Giữ stack chạy sau test"
            echo "  $0 --project=chromium        # Chạy chromium project"
            echo "  $0 --db-only                 # Chỉ chạy MySQL"
            echo "  $0 --stop                    # Dừng stack"
            echo "  $0 --status                  # Xem trạng thái"
            exit 0
            ;;
        *)
            log_error "Tùy chọn không hợp lệ: $1"
            echo "Dùng '$0 --help' để xem hướng dẫn."
            exit 1
            ;;
    esac
done

# ---------- Main ----------
case "$ACTION" in
    "stop")
        log_header "Dừng E2E Stack"
        
        log_info "Dừng và dọn dẹp containers..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v --remove-orphans 2>/dev/null || true
        
        log_success "Đã dừng và dọn dẹp E2E stack!"
        exit 0
        ;;
    
    "status")
        log_header "Trạng thái E2E Stack"
        
        echo ""
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
        echo ""
        
        log_info "Các port đang sử dụng:"
        echo "  - Backend:  http://localhost:$BACKEND_PORT"
        echo "  - Frontend: http://localhost:$FRONTEND_PORT"
        echo "  - MySQL:    localhost:$MYSQL_PORT"
        exit 0
        ;;
    
    "logs")
        log_header "Logs E2E Stack"
        echo ""
        echo "Đang hiển thị logs (Ctrl+C để thoát)..."
        echo ""
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
        exit 0
        ;;
    
    "db-only")
        log_header "Chạy DB Only Mode"
        check_docker
        check_compose
        
        log_info "Bắt đầu MySQL..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile db-only up -d
        
        log_info "Chờ MySQL sẵn sàng..."
        ./scripts/wait-for-services.sh --timeout 120 --interval 5 -- mysql:3306
        
        log_success "MySQL đã chạy tại localhost:$MYSQL_PORT"
        echo ""
        echo "Kết nối MySQL:"
        echo "  Host:     localhost"
        echo "  Port:     $MYSQL_PORT"
        echo "  User:     root"
        echo "  Password: rootpass123"
        echo "  Database: bookstore_e2e"
        echo ""
        log_info "Dùng '$0 --stop' để dừng."
        exit 0
        ;;
    
    "run")
        log_header "Chạy E2E Tests"
        check_docker
        check_compose
        check_ports
        
        echo ""
        echo "Cấu hình:"
        echo "  - Compose file: $COMPOSE_FILE"
        echo "  - Profile:      $PROFILE"
        echo "  - Headless:     $HEADLESS"
        echo "  - Keep running: $KEEP_RUNNING"
        echo "  - Project:      ${TEST_PROJECT:-all}"
        echo ""
        
        # Bước 1: Dọn dẹp stack cũ
        log_step "1. Dọn dẹp stack cũ..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v --remove-orphans 2>/dev/null || true
        log_success "Đã dọn dẹp"
        
        # Bước 2: Build images
        log_step "2. Build Docker images..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build --no-cache backend frontend
        log_success "Build xong"
        
        # Bước 3: Start stack
        log_step "3. Khởi động E2E stack..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile "$PROFILE" up -d
        log_success "Stack đã khởi động"
        
        # Bước 4: Chờ MySQL
        log_step "4. Chờ MySQL..."
        ./scripts/wait-for-services.sh --timeout 120 --interval 5 -- mysql:"$MYSQL_PORT"
        
        # Bước 5: Chờ Backend
        log_step "5. Chờ Backend..."
        ./scripts/wait-for-services.sh --timeout 180 --interval 10 -- http://localhost:"$BACKEND_PORT"/api/health/live
        
        # Bước 6: Chờ Frontend
        log_step "6. Chờ Frontend..."
        ./scripts/wait-for-services.sh --timeout 120 --interval 5 -- http://localhost:"$FRONTEND_PORT"/
        
        # Bước 7: Setup Playwright
        log_step "7. Setup Playwright..."
        cd Frontend_NextJS
        npm ci --prefer-offline > /dev/null 2>&1
        npx playwright install --with-deps chromium > /dev/null 2>&1
        cd ..
        log_success "Playwright đã cài đặt"
        
        # Bước 8: Chạy E2E tests
        log_step "8. Chạy E2E tests..."
        echo ""
        
        PLAYWRIGHT_CMD="npx playwright test"
        [ -n "$PLAYWRIGHT_PROJECT" ] && PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD $PLAYWRIGHT_PROJECT"
        PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --reporter=html,line --retries=3"
        
        PLAYWRIGHT_BASE_URL="http://localhost:$FRONTEND_PORT" \
        PLAYWRIGHT_HEADLESS="$HEADLESS" \
        bash -c "$PLAYWRIGHT_CMD"
        
        TEST_EXIT_CODE=$?
        
        # Bước 9: Copy reports
        log_step "9. Copy reports..."
        mkdir -p playwright-report
        cp -r Frontend_NextJS/playwright-report/* playwright-report/ 2>/dev/null || true
        log_success "Reports đã copy vào ./playwright-report/"
        
        # Bước 10: Dọn dẹp hoặc giữ lại
        log_step "10. Hoàn tất"
        
        if [ "$KEEP_RUNNING" = "true" ]; then
            log_warn "Giữ stack chạy! Dùng '$0 --stop' để dừng."
            echo ""
            echo "Truy cập:"
            echo "  - Backend:  http://localhost:$BACKEND_PORT"
            echo "  - Frontend: http://localhost:$FRONTEND_PORT"
            echo "  - Reports:  file://$(pwd)/playwright-report/index.html"
            echo ""
        else
            log_info "Dọn dẹp stack..."
            docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v --remove-orphans
            log_success "Đã dọn dẹp!"
        fi
        
        # Bước 11: Mở report
        log_step "11. Mở báo cáo test..."
        if command -v open &> /dev/null; then
            open "file://$(pwd)/playwright-report/index.html"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "file://$(pwd)/playwright-report/index.html"
        elif command -v start &> /dev/null; then
            start "file://$(pwd)/playwright-report/index.html"
        else
            log_info "Mở file report thủ công: $(pwd)/playwright-report/index.html"
        fi
        
        echo ""
        if [ $TEST_EXIT_CODE -eq 0 ]; then
            log_success "E2E Tests: PASSED!"
        else
            log_error "E2E Tests: FAILED (exit code: $TEST_EXIT_CODE)"
        fi
        echo ""
        
        exit $TEST_EXIT_CODE
        ;;
esac
