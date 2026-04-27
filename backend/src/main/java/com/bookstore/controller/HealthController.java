package com.bookstore.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HealthController - Kiểm tra trạng thái health của ứng dụng
 * 
 * Các endpoint:
 * - GET /api/health         - Health check đầy đủ (DB + Memory + Disk)
 * - GET /api/health/live    - Liveness probe (Kubernetes)
 * - GET /api/health/ready   - Readiness probe (Kubernetes)
 * 
 * @author BookStore Team
 */
@Slf4j
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final Environment environment;

    @Value("${spring.application.name:bookstore-api}")
    private String applicationName;

    /**
     * Health check đầy đủ - kiểm tra database, memory, disk
     * 
     * @return Map chứa trạng thái của tất cả components
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());
        health.put("service", applicationName);
        health.put("version", getVersion());

        // Database check
        Map<String, Object> dbCheck = checkDatabase();
        health.put("database", dbCheck);

        // Memory check
        Map<String, Object> memoryCheck = checkMemory();
        health.put("memory", memoryCheck);

        // Disk check
        Map<String, Object> diskCheck = checkDisk();
        health.put("disk", diskCheck);

        // Overall status
        boolean allUp = "UP".equals(dbCheck.get("status"))
                      && "UP".equals(memoryCheck.get("status"))
                      && "UP".equals(diskCheck.get("status"));

        if (!allUp) {
            health.put("status", "DEGRADED");
        }

        if (isProductionLikeProfile()) {
            health.remove("version");
            health.remove("database");
            health.remove("memory");
            health.remove("disk");
        }

        return ResponseEntity.ok(health);
    }

    /**
     * Liveness probe - cho Kubernetes
     * Chỉ kiểm tra ứng dụng đang chạy, không kiểm tra external dependencies
     * 
     * @return Map với status UP nếu ứng dụng sống
     */
    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> liveness() {
        Map<String, Object> live = new LinkedHashMap<>();
        live.put("status", "UP");
        live.put("timestamp", Instant.now().toString());
        live.put("service", applicationName);
        return ResponseEntity.ok(live);
    }

    /**
     * Readiness probe - cho Kubernetes
     * Kiểm tra ứng dụng đã sẵn sàng nhận traffic chưa
     * 
     * @return 200 nếu sẵn sàng, 503 nếu không
     */
    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> ready = new LinkedHashMap<>();
        ready.put("timestamp", Instant.now().toString());
        ready.put("service", applicationName);

        // Kiểm tra database
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(5)) {
                ready.put("status", "UP");
                ready.put("database", "UP");
                return ResponseEntity.ok(ready);
            }
        } catch (Exception e) {
            log.error("Readiness check failed: database connection error", e);
        }

        // Database không sẵn sàng
        ready.put("status", "DOWN");
        ready.put("database", "DOWN");
        return ResponseEntity.status(503).body(ready);
    }

    // ==========================================
    // Private helper methods
    // ==========================================

    /**
     * Kiểm tra kết nối database
     */
    private Map<String, Object> checkDatabase() {
        Map<String, Object> dbCheck = new LinkedHashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            dbCheck.put("status", "UP");
            dbCheck.put("database", conn.getCatalog());
            dbCheck.put("url", conn.getMetaData().getURL());
            dbCheck.put("driver", conn.getMetaData().getDriverName());
            dbCheck.put("driverVersion", conn.getMetaData().getDriverVersion());
        } catch (Exception e) {
            log.error("Database health check failed", e);
            dbCheck.put("status", "DOWN");
            dbCheck.put("error", e.getMessage());
        }
        return dbCheck;
    }

    private boolean isProductionLikeProfile() {
        for (String profile : environment.getActiveProfiles()) {
            if ("prod".equalsIgnoreCase(profile)
                    || "production".equalsIgnoreCase(profile)
                    || "render".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Kiểm tra memory usage
     */
    private Map<String, Object> checkMemory() {
        Map<String, Object> memCheck = new LinkedHashMap<>();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsage = memoryBean.getNonHeapMemoryUsage();

        long usedHeap = heapUsage.getUsed();
        long maxHeap = heapUsage.getMax();
        double heapPercent = (double) usedHeap / maxHeap * 100;

        memCheck.put("heap.used", formatBytes(usedHeap));
        memCheck.put("heap.max", formatBytes(maxHeap));
        memCheck.put("heap.percent", String.format("%.1f%%", heapPercent));
        memCheck.put("nonHeap.used", formatBytes(nonHeapUsage.getUsed()));
        memCheck.put("nonHeap.max", formatBytes(nonHeapUsage.getMax()));

        // Alert nếu heap > 85%
        if (heapPercent > 95) {
            memCheck.put("status", "CRITICAL");
            memCheck.put("alert", "Heap memory usage above 95%!");
        } else if (heapPercent > 85) {
            memCheck.put("status", "WARNING");
            memCheck.put("alert", "Heap memory usage above 85%");
        } else {
            memCheck.put("status", "UP");
        }

        return memCheck;
    }

    /**
     * Kiểm tra disk space
     */
    private Map<String, Object> checkDisk() {
        Map<String, Object> diskCheck = new LinkedHashMap<>();
        try {
            File root = new File("/");
            
            long total = root.getTotalSpace();
            long free = root.getFreeSpace();
            long usable = root.getUsableSpace();
            long used = total - usable;
            double usedPercent = (double) used / total * 100;

            diskCheck.put("root.total", formatBytes(total));
            diskCheck.put("root.free", formatBytes(free));
            diskCheck.put("root.used", formatBytes(used));
            diskCheck.put("root.percent", String.format("%.1f%%", usedPercent));

            // Alert nếu disk > 90%
            if (usedPercent > 90) {
                diskCheck.put("status", "CRITICAL");
                diskCheck.put("alert", "Disk usage above 90%!");
            } else if (usedPercent > 80) {
                diskCheck.put("status", "WARNING");
                diskCheck.put("alert", "Disk usage above 80%");
            } else {
                diskCheck.put("status", "UP");
            }
        } catch (Exception e) {
            log.error("Disk health check failed", e);
            diskCheck.put("status", "UNKNOWN");
            diskCheck.put("error", e.getMessage());
        }
        return diskCheck;
    }

    /**
     * Format bytes thành human-readable string
     */
    private String formatBytes(long bytes) {
        if (bytes < 0) return "unknown";
        int unit = 0;
        double value = bytes;
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        while (value >= 1024 && unit < units.length - 1) {
            value /= 1024;
            unit++;
        }
        return String.format("%.1f %s", value, units[unit]);
    }

    /**
     * Lấy version của ứng dụng từ pom.xml hoặc manifest
     */
    private String getVersion() {
        try {
            String implVersion = getClass().getPackage().getImplementationVersion();
            return implVersion != null ? implVersion : "1.0.1";
        } catch (Exception e) {
            return "1.0.1";
        }
    }
}
