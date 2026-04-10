package com.bookstore.controller;

import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());
        health.put("service", "bookstore-api");

        // Database check
        Map<String, Object> dbCheck = new HashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            dbCheck.put("status", "UP");
            dbCheck.put("database", conn.getCatalog());
        } catch (Exception e) {
            dbCheck.put("status", "DOWN");
            dbCheck.put("error", e.getMessage());
            health.put("status", "DEGRADED");
        }
        health.put("database", dbCheck);

        return ResponseEntity.ok(health);
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, String>> liveness() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> ready = new HashMap<>();
        ready.put("status", "UP");
        ready.put("timestamp", Instant.now().toString());

        try (Connection conn = dataSource.getConnection()) {
            ready.put("database", "UP");
        } catch (Exception e) {
            ready.put("database", "DOWN");
            ready.put("databaseError", e.getMessage());
            return ResponseEntity.status(503).body(ready);
        }

        return ResponseEntity.ok(ready);
    }
}
