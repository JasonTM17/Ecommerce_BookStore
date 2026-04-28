package com.bookstore.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Filter để bảo vệ ứng dụng khỏi brute-force attacks và DDoS.
 * 
 * Giới hạn:
 * - Auth endpoints: 5 requests/phút/IP
 * - API endpoints: 100 requests/phút/IP
 * - Public endpoints: 200 requests/phút/IP
 */
@Component
@Order(1)
@Slf4j
public class RateLimitingFilter implements Filter {

    private final Map<String, RateLimitEntry> rateLimitMap = new ConcurrentHashMap<>();
    
    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;
    
    @Value("${app.rate-limit.auth-limit:5}")
    private int authLimit;
    
    @Value("${app.rate-limit.auth-window-ms:60000}")
    private long authWindowMs;
    
    @Value("${app.rate-limit.api-limit:100}")
    private int apiLimit;
    
    @Value("${app.rate-limit.api-window-ms:60000}")
    private long apiWindowMs;
    
    @Value("${app.rate-limit.public-limit:200}")
    private int publicLimit;
    
    @Value("${app.rate-limit.public-window-ms:60000}")
    private long publicWindowMs;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        
        if (!rateLimitEnabled) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        
        String clientIp = getClientIP(request);
        String requestUri = request.getRequestURI();
        String key = clientIp + ":" + requestUri;
        
        // Xác định loại endpoint để áp dụng limit phù hợp
        RateLimitConfig config = getRateLimitConfig(request.getMethod(), requestUri);
        
        // Kiểm tra rate limit
        RateLimitEntry entry = rateLimitMap.computeIfAbsent(key, k -> new RateLimitEntry(config.limit, config.windowMs));
        
        if (!entry.tryConsume()) {
            log.warn("WARNING: Rate limit exceeded for IP: {} on endpoint: {}", clientIp, requestUri);
            
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setHeader("X-RateLimit-Limit", String.valueOf(config.limit));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("X-RateLimit-Reset", String.valueOf(entry.getResetTime() / 1000));
            response.setHeader("Retry-After", String.valueOf(entry.getRetryAfterSeconds()));
            
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\",\"retryAfter\":" + entry.getRetryAfterSeconds() + "}");
            return;
        }
        
        // Thêm headers vào response
        response.setHeader("X-RateLimit-Limit", String.valueOf(config.limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(entry.getRemaining()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(entry.getResetTime() / 1000));
        
        filterChain.doFilter(servletRequest, servletResponse);
    }
    
    private RateLimitConfig getRateLimitConfig(String method, String uri) {
        if (uri.startsWith("/api/auth/") || uri.startsWith("/auth/")) {
            return new RateLimitConfig(authLimit, authWindowMs);
        } else if (uri.startsWith("/api/admin/") || uri.startsWith("/admin/")) {
            return new RateLimitConfig(authLimit, authWindowMs);
        } else if ("GET".equalsIgnoreCase(method) && isPublicCatalogEndpoint(uri)) {
            return new RateLimitConfig(publicLimit, publicWindowMs);
        } else if (uri.startsWith("/api/")) {
            return new RateLimitConfig(apiLimit, apiWindowMs);
        }
        return new RateLimitConfig(publicLimit, publicWindowMs);
    }

    private boolean isPublicCatalogEndpoint(String uri) {
        return uri.startsWith("/api/products/")
                || uri.equals("/api/products")
                || uri.startsWith("/products/")
                || uri.equals("/products")
                || uri.startsWith("/api/categories/")
                || uri.equals("/api/categories")
                || uri.startsWith("/categories/")
                || uri.equals("/categories")
                || uri.startsWith("/api/brands/")
                || uri.equals("/api/brands")
                || uri.startsWith("/brands/")
                || uri.equals("/brands")
                || uri.startsWith("/api/flash-sales/")
                || uri.equals("/api/flash-sales")
                || uri.startsWith("/flash-sales/")
                || uri.equals("/flash-sales")
                || uri.startsWith("/api/reviews/")
                || uri.equals("/api/reviews")
                || uri.startsWith("/reviews/")
                || uri.equals("/reviews")
                || uri.equals("/api/coupons/available")
                || uri.equals("/coupons/available");
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }
    
    @Override
    public void init(FilterConfig filterConfig) {
        log.info("Rate Limiting Filter initialized");
        log.info("   - Auth endpoints: {} requests/{}ms", authLimit, authWindowMs);
        log.info("   - API endpoints: {} requests/{}ms", apiLimit, apiWindowMs);
        log.info("   - Public endpoints: {} requests/{}ms", publicLimit, publicWindowMs);
    }
    
    @Override
    public void destroy() {
        rateLimitMap.clear();
        log.info("Rate Limiting Filter destroyed");
    }
    
    private static class RateLimitConfig {
        final int limit;
        final long windowMs;
        
        RateLimitConfig(int limit, long windowMs) {
            this.limit = limit;
            this.windowMs = windowMs;
        }
    }
    
    private static class RateLimitEntry {
        private final int limit;
        private final long windowMs;
        private final AtomicInteger count;
        private volatile long windowStart;
        private final Object lock = new Object();
        
        RateLimitEntry(int limit, long windowMs) {
            this.limit = limit;
            this.windowMs = windowMs;
            this.count = new AtomicInteger(0);
            this.windowStart = System.currentTimeMillis();
        }
        
        boolean tryConsume() {
            cleanup();
            return count.incrementAndGet() <= limit;
        }
        
        int getRemaining() {
            cleanup();
            return Math.max(0, limit - count.get());
        }
        
        long getResetTime() {
            return windowStart + windowMs;
        }
        
        long getRetryAfterSeconds() {
            return Math.max(1, (windowStart + windowMs - System.currentTimeMillis()) / 1000);
        }
        
        private void cleanup() {
            long now = System.currentTimeMillis();
            if (now - windowStart >= windowMs) {
                synchronized (lock) {
                    if (now - windowStart >= windowMs) {
                        count.set(0);
                        windowStart = now;
                    }
                }
            }
        }
    }
}
