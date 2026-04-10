package com.bookstore.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Security Headers Filter - Thêm các HTTP Security Headers vào mọi response.
 * 
 * Headers được thêm:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - X-XSS-Protection: 1; mode=block
 * - Strict-Transport-Security: max-age=31536000; includeSubDomains
 * - Content-Security-Policy: restrict scripts, styles, frames
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: restrict camera, microphone, geolocation
 */
@Component
@Order(2)
@Slf4j
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        
        // Prevent MIME type sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");
        
        // Prevent clickjacking - DENY means the page cannot be displayed in a frame
        response.setHeader("X-Frame-Options", "DENY");
        
        // XSS Protection (legacy browsers)
        response.setHeader("X-XSS-Protection", "1; mode=block");
        
        // Content Security Policy - Restrict sources for enhanced security
        // NOTE: Adjust CSP directives based on your actual CDN/resources
        String csp = buildContentSecurityPolicy();
        response.setHeader("Content-Security-Policy", csp);
        
        // HTTP Strict Transport Security - Force HTTPS
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        
        // Referrer Policy - Control referrer information
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // Permissions Policy - Restrict browser features
        response.setHeader("Permissions-Policy", 
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), " +
            "magnetometer=(), microphone=(), payment=(), usb=()");
        
        // Cache Control - Prevent sensitive data caching
        if (isSensitiveEndpoint(request.getRequestURI())) {
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
        }
        
        // X-Request-ID for tracing
        String requestId = request.getHeader("X-Request-ID");
        if (requestId == null || requestId.isEmpty()) {
            requestId = java.util.UUID.randomUUID().toString();
        }
        response.setHeader("X-Request-ID", requestId);
        
        filterChain.doFilter(servletRequest, servletResponse);
    }
    
    private String buildContentSecurityPolicy() {
        StringBuilder csp = new StringBuilder();
        
        // Default source - only same origin
        csp.append("default-src 'self';");
        
        // Script sources - self + trusted domains
        csp.append(" script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;");
        
        // Style sources - self + inline + trusted domains
        csp.append(" style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;");
        
        // Image sources - self + data URIs + trusted domains
        csp.append(" img-src 'self' data: https: blob:;");
        
        // Font sources
        csp.append(" font-src 'self' https://fonts.gstatic.com;");
        
        // Connect sources - self + API
        csp.append(" connect-src 'self' https://api.bookstore.com;");
        
        // Frame sources - DENY
        csp.append(" frame-ancestors 'none';");
        
        // Form action - self only
        csp.append(" form-action 'self';");
        
        // Base URI - restrict
        csp.append(" base-uri 'self';");
        
        // Upgrade insecure requests in production
        // csp.append(" upgrade-insecure-requests;");
        
        return csp.toString();
    }
    
    private boolean isSensitiveEndpoint(String uri) {
        return uri.contains("/auth/") || 
               uri.contains("/admin/") || 
               uri.contains("/profile") ||
               uri.contains("/orders/") ||
               uri.contains("/payment");
    }
    
    @Override
    public void init(FilterConfig filterConfig) {
        log.info("🔒 Security Headers Filter initialized");
        log.info("   - X-Content-Type-Options: nosniff");
        log.info("   - X-Frame-Options: DENY");
        log.info("   - Strict-Transport-Security: max-age=31536000");
        log.info("   - Content-Security-Policy: enabled");
        log.info("   - Referrer-Policy: strict-origin-when-cross-origin");
    }
    
    @Override
    public void destroy() {
        log.info("🔒 Security Headers Filter destroyed");
    }
}
