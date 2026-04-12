package com.bookstore.integration;

import com.bookstore.repository.CartRepository;
import com.bookstore.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Auth registration flow (full context + H2)")
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Test
    @DisplayName("POST /auth/register persists user, cart, and returns JWT-shaped response")
    void registerEndToEnd() throws Exception {
        String email = "integration-" + System.nanoTime() + "@bookstore.test";
        String body = """
                {
                  "email": "%s",
                  "password": "Password123!",
                  "firstName": "Int",
                  "lastName": "Test",
                  "phoneNumber": "0900000001"
                }
                """.formatted(email);

        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.path("accessToken").asText()).isNotBlank();
        assertThat(json.path("refreshToken").asText()).isNotBlank();
        assertThat(json.path("user").path("email").asText()).isEqualTo(email);

        assertThat(userRepository.existsByEmail(email)).isTrue();
        var user = userRepository.findByEmail(email).orElseThrow();
        assertThat(cartRepository.findByUserId(user.getId())).isPresent();
    }
}
