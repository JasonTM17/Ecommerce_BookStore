package com.bookstore.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Input Validation Filter - Sanitize và validate input đầu vào để prevent XSS và Injection attacks.
 * 
 * Các checks được thực hiện:
 * - XSS patterns detection
 * - SQL Injection patterns detection  
 * - Path traversal detection
 * - Maximum request body size
 */
@Component
@Order(3)
@Slf4j
public class InputValidationFilter implements Filter {

    // XSS Patterns
    private static final Pattern[] XSS_PATTERNS = {
        Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL),
        Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<iframe[^>]*>.*?</iframe>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL),
        Pattern.compile("<object[^>]*>.*?</object>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL),
        Pattern.compile("<embed[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("expression\\s*\\(", Pattern.CASE_INSENSITIVE),
        Pattern.compile("data:\\s*text/html", Pattern.CASE_INSENSITIVE),
        Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE)
    };

    // SQL Injection Patterns
    private static final Pattern[] SQL_INJECTION_PATTERNS = {
        Pattern.compile("('|(\\'\\'))+", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(;|%3B)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(union|Union|UNION)\\s+(select|Select|SELECT|all|All|ALL)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(exec|Exec|EXEC)\\s*\\(", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(execute|Execute|EXECUTE)\\s+", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(drop|Drop|DROP)\\s+(table|Table|TABLE|database|Database|DATABASE)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(insert|Insert|INSERT)\\s+into", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(update|Update|UPDATE)\\s+.*\\s+set", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(delete|Delete|DELETE)\\s+from", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(alter|Alter|ALTER)\\s+(table|Table|TABLE|column|Column|COLUMN)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(create|Create|CREATE)\\s+(table|Table|TABLE|index|Index|INDEX)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(xp_|XP_)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("(sp_|SP_)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("--\\s*$", Pattern.CASE_INSENSITIVE),
        Pattern.compile("#\\s*$"),
        Pattern.compile("/\\*.*\\*/", Pattern.DOTALL),
        Pattern.compile("@\\s*variable", Pattern.CASE_INSENSITIVE)
    };

    // Path Traversal Patterns
    private static final Pattern PATH_TRAVERSAL_PATTERN = 
        Pattern.compile("(\\.\\.[\\\\/]|\\.\\.\\.|[\\\\/]{2,}|(~|`|\\$|\\%))", Pattern.CASE_INSENSITIVE);

    @Value("${app.input-validation.enabled:true}")
    private boolean validationEnabled;

    @Value("${app.input-validation.max-body-size:10485760}")
    private int maxBodySize; // 10MB default

    @Value("${app.input-validation.block-xss:true}")
    private boolean blockXss;

    @Value("${app.input-validation.block-sql-injection:true}")
    private boolean blockSqlInjection;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        
        if (!validationEnabled) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        
        String requestUri = request.getRequestURI();
        String method = request.getMethod();

        // Skip for GET requests and static resources
        if ("GET".equalsIgnoreCase(method) || isStaticResource(requestUri)) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // Check Content-Length
        int contentLength = request.getContentLength();
        if (contentLength > maxBodySize) {
            sendError(response, HttpStatus.BAD_REQUEST, "Request body too large. Maximum size: " + maxBodySize + " bytes");
            return;
        }

        // Wrap request to allow multiple reads of body
        CachedBodyHttpServletRequest cachedRequest = new CachedBodyHttpServletRequest(request, maxBodySize);

        // Get body content for validation
        String bodyContent = cachedRequest.getCachedBody();
        
        if (bodyContent != null && !bodyContent.isEmpty()) {
            // Check for XSS
            if (blockXss && containsXSS(bodyContent)) {
                log.warn("⚠️ XSS attack detected from IP: {} on URI: {}", getClientIP(request), requestUri);
                sendError(response, HttpStatus.BAD_REQUEST, "Invalid input detected. Potential XSS attack blocked.");
                return;
            }
            
            // Check for SQL Injection
            if (blockSqlInjection && containsSQLInjection(bodyContent)) {
                log.warn("⚠️ SQL Injection attempt detected from IP: {} on URI: {}", getClientIP(request), requestUri);
                sendError(response, HttpStatus.BAD_REQUEST, "Invalid input detected. Potential SQL injection blocked.");
                return;
            }
        }

        // Validate URL parameters
        if (containsPathTraversal(requestUri)) {
            log.warn("⚠️ Path traversal attempt detected from IP: {} on URI: {}", getClientIP(request), requestUri);
            sendError(response, HttpStatus.BAD_REQUEST, "Invalid path detected.");
            return;
        }

        filterChain.doFilter(cachedRequest, servletResponse);
    }

    private boolean containsXSS(String input) {
        for (Pattern pattern : XSS_PATTERNS) {
            if (pattern.matcher(input).find()) {
                return true;
            }
        }
        return false;
    }

    private boolean containsSQLInjection(String input) {
        for (Pattern pattern : SQL_INJECTION_PATTERNS) {
            if (pattern.matcher(input).find()) {
                return true;
            }
        }
        return false;
    }

    private boolean containsPathTraversal(String input) {
        return PATH_TRAVERSAL_PATTERN.matcher(input).find();
    }

    private boolean isStaticResource(String uri) {
        return uri.contains("/uploads/") || 
               uri.contains("/static/") || 
               uri.endsWith(".css") || 
               uri.endsWith(".js") ||
               uri.endsWith(".png") ||
               uri.endsWith(".jpg") ||
               uri.endsWith(".jpeg") ||
               uri.endsWith(".gif") ||
               uri.endsWith(".svg") ||
               uri.endsWith(".ico") ||
               uri.endsWith(".woff") ||
               uri.endsWith(".woff2") ||
               uri.endsWith(".ttf") ||
               uri.endsWith(".eot");
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\",\"status\":" + status.value() + "}");
    }

    @Override
    public void init(FilterConfig filterConfig) {
        log.info("🔍 Input Validation Filter initialized");
        log.info("   - XSS detection: " + (blockXss ? "enabled" : "disabled"));
        log.info("   - SQL Injection detection: " + (blockSqlInjection ? "enabled" : "disabled"));
        log.info("   - Max body size: " + maxBodySize + " bytes");
    }

    @Override
    public void destroy() {
        log.info("🔍 Input Validation Filter destroyed");
    }

    /**
     * Wrapper class to cache request body for multiple reads
     */
    private static class CachedBodyHttpServletRequest extends HttpServletRequestWrapper {
        private final byte[] cachedBody;

        public CachedBodyHttpServletRequest(HttpServletRequest request, int maxSize) throws IOException {
            super(request);
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            InputStream is = request.getInputStream();
            byte[] buffer = new byte[1024];
            int read;
            int totalRead = 0;
            
            while ((read = is.read(buffer)) != -1 && totalRead < maxSize) {
                baos.write(buffer, 0, read);
                totalRead += read;
            }
            
            this.cachedBody = baos.toByteArray();
        }

        @Override
        public ServletInputStream getInputStream() {
            return new CachedBodyServletInputStream(cachedBody);
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }

        public String getCachedBody() {
            return new String(cachedBody, StandardCharsets.UTF_8);
        }
    }

    private static class CachedBodyServletInputStream extends ServletInputStream {
        private final ByteArrayInputStream inputStream;

        public CachedBodyServletInputStream(byte[] cachedBody) {
            this.inputStream = new ByteArrayInputStream(cachedBody);
        }

        @Override
        public boolean isFinished() {
            return inputStream.available() == 0;
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setReadListener(ReadListener readListener) {
            throw new UnsupportedOperationException();
        }

        @Override
        public int read() {
            return inputStream.read();
        }
    }
}
