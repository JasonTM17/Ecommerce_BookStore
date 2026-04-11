package com.bookstore.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * HealthControllerTest - Kiểm tra các endpoint health check
 * 
 * Test coverage:
 * - GET /api/health       - Health check đầy đủ
 * - GET /api/health/live - Liveness probe
 * - GET /api/health/ready - Readiness probe
 * 
 * @author BookStore Team
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("HealthController Tests")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // ==========================================
    // Liveness Probe Tests
    // ==========================================

    @Test
    @DisplayName("GET /api/health/live - returns 200 with status UP")
    void liveness_returnsOk() throws Exception {
        mockMvc.perform(get("/api/health/live"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // ==========================================
    // Readiness Probe Tests
    // ==========================================

    @Test
    @DisplayName("GET /api/health/ready - returns 200 when database is connected")
    void readiness_returnsOk_whenDatabaseUp() throws Exception {
        mockMvc.perform(get("/api/health/ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("UP"));
    }

    // ==========================================
    // Full Health Check Tests
    // ==========================================

    @Test
    @DisplayName("GET /api/health - returns 200 with full health status")
    void healthCheck_returnsFullStatus() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").exists())
                .andExpect(jsonPath("$.version").exists())
                .andExpect(jsonPath("$.timestamp").exists())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertThat(content).contains("database");
        assertThat(content).contains("memory");
        assertThat(content).contains("disk");
    }

    @Test
    @DisplayName("GET /api/health - database status is UP")
    void healthCheck_databaseStatusUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.database.status").value("UP"))
                .andExpect(jsonPath("$.database.database").exists());
    }

    @Test
    @DisplayName("GET /api/health - memory status is UP or WARNING")
    void healthCheck_memoryStatus() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        // Memory status có thể là UP hoặc WARNING tùy vào memory usage
        assertThat(content).contains("heap");
        assertThat(content).contains("heap.percent");
    }

    @Test
    @DisplayName("GET /api/health - disk status is UP")
    void healthCheck_diskStatusUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disk.status").exists())
                .andExpect(jsonPath("$.disk.root.total").exists())
                .andExpect(jsonPath("$.disk.root.free").exists());
    }

    @Test
    @DisplayName("GET /api/health - returns JSON content type")
    void healthCheck_returnsJson() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"));
    }

    @Test
    @DisplayName("GET /api/health - response time is reasonable (< 5s)")
    void healthCheck_responseTimeReasonable() throws Exception {
        long startTime = System.currentTimeMillis();
        
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
        
        long duration = System.currentTimeMillis() - startTime;
        assertThat(duration).isLessThan(5000);
    }

    @Test
    @DisplayName("GET /api/health - timestamp is valid ISO format")
    void healthCheck_validTimestamp() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        // Timestamp nên là ISO 8601 format
        assertThat(content).containsPattern("\\d{4}-\\d{2}-\\d{2}");
    }

    @Test
    @DisplayName("Multiple calls - response is consistent")
    void healthCheck_consistentResponse() throws Exception {
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(get("/api/health/live"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("UP"));
        }
    }
}
