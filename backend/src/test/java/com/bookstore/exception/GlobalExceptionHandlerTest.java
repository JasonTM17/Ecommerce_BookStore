package com.bookstore.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("maps AccessDeniedException to HTTP 403")
    void handleAccessDeniedException_returnsForbidden() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/orders");

        var response = handler.handleAccessDeniedException(
                new AccessDeniedException("Forbidden"),
                new ServletWebRequest(request)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(403);
        assertThat(response.getBody().getError()).isEqualTo("Forbidden");
        assertThat(response.getBody().getMessage()).isEqualTo("Access denied");
        assertThat(response.getBody().getPath()).isEqualTo("/api/admin/orders");
    }

    @Test
    @DisplayName("maps NoResourceFoundException to HTTP 404")
    void handleNoResourceFoundException_returnsNotFound() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/missing");

        var response = handler.handleNoResourceFoundException(
                new NoResourceFoundException(HttpMethod.GET, "missing"),
                new ServletWebRequest(request)
        );

        assertThat(response.getStatusCode().value()).isEqualTo(404);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getError()).isEqualTo("Not Found");
        assertThat(response.getBody().getMessage()).contains("missing");
        assertThat(response.getBody().getPath()).isEqualTo("/api/missing");
    }
}
