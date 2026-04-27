package com.bookstore.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("HealthController Tests")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/health/live returns UP")
    void liveness_returnsOk() throws Exception {
        mockMvc.perform(get("/health/live"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /api/health/ready returns UP when database is connected")
    void readiness_returnsOk_whenDatabaseUp() throws Exception {
        mockMvc.perform(get("/health/ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("UP"));
    }

    @Test
    @DisplayName("GET /api/health returns the full health payload")
    void healthCheck_returnsFullStatus() throws Exception {
        MvcResult result = mockMvc.perform(get("/health"))
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
    @DisplayName("GET /api/health hides internal details on render profile")
    void healthCheck_hidesInternalDetailsInRenderProfile() throws Exception {
        DriverManagerDataSource dataSource = new DriverManagerDataSource(
                "jdbc:h2:mem:health-sanitized;DB_CLOSE_DELAY=-1",
                "sa",
                ""
        );
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("render");
        HealthController controller = new HealthController(dataSource, environment);
        ReflectionTestUtils.setField(controller, "applicationName", "bookstore-api");
        MockMvc renderMockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        renderMockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.service").exists())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.version").doesNotExist())
                .andExpect(jsonPath("$.database").doesNotExist())
                .andExpect(jsonPath("$.memory").doesNotExist())
                .andExpect(jsonPath("$.disk").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/health shows database status")
    void healthCheck_databaseStatusUp() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.database.status").value("UP"))
                .andExpect(jsonPath("$.database.database").exists());
    }

    @Test
    @DisplayName("GET /api/health shows memory details")
    void healthCheck_memoryStatus() throws Exception {
        MvcResult result = mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertThat(content).contains("heap");
        assertThat(content).contains("heap.percent");
    }

    @Test
    @DisplayName("GET /api/health exposes flat disk keys")
    void healthCheck_diskStatusUp() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disk.status").exists())
                .andExpect(jsonPath("$.disk['root.total']").exists())
                .andExpect(jsonPath("$.disk['root.free']").exists());
    }

    @Test
    @DisplayName("GET /api/health returns JSON")
    void healthCheck_returnsJson() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"));
    }

    @Test
    @DisplayName("GET /api/health responds quickly")
    void healthCheck_responseTimeReasonable() throws Exception {
        long startTime = System.currentTimeMillis();
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
        long duration = System.currentTimeMillis() - startTime;
        assertThat(duration).isLessThan(5000);
    }

    @Test
    @DisplayName("GET /api/health returns an ISO-like timestamp")
    void healthCheck_validTimestamp() throws Exception {
        MvcResult result = mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertThat(content).containsPattern("\\d{4}-\\d{2}-\\d{2}");
    }

    @Test
    @DisplayName("Multiple liveness calls stay consistent")
    void healthCheck_consistentResponse() throws Exception {
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(get("/health/live"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("UP"));
        }
    }
}
