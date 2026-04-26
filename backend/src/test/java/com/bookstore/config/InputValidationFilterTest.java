package com.bookstore.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InputValidationFilterTest {

    private InputValidationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new InputValidationFilter();
        ReflectionTestUtils.setField(filter, "validationEnabled", true);
        ReflectionTestUtils.setField(filter, "maxBodySize", 10);
        ReflectionTestUtils.setField(filter, "blockXss", true);
        ReflectionTestUtils.setField(filter, "blockSqlInjection", true);
    }

    @Test
    void skipsMultipartBodyScanningForUploads() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/uploads/avatar");
        request.setContentType("multipart/form-data; boundary=demo");
        request.setContent("<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(HttpStatus.OK.value(), response.getStatus());
    }

    @Test
    void rejectsChunkedBodiesThatExceedTheReadLimit() throws Exception {
        MockHttpServletRequest request = new UnknownLengthRequest("POST", "/api/auth/login");
        request.setContentType("application/json");
        request.setContent("{\"email\":\"a@example.com\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE.value(), response.getStatus());
    }

    @Test
    void stillBlocksXssPayloadsInJsonRequests() throws Exception {
        ReflectionTestUtils.setField(filter, "maxBodySize", 1024);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/reviews");
        request.setContentType("application/json");
        request.setContent("{\"comment\":\"<script>alert(1)</script>\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
    }

    private static class UnknownLengthRequest extends MockHttpServletRequest {
        UnknownLengthRequest(String method, String requestUri) {
            super(method, requestUri);
        }

        @Override
        public int getContentLength() {
            return -1;
        }

        @Override
        public long getContentLengthLong() {
            return -1;
        }
    }
}
