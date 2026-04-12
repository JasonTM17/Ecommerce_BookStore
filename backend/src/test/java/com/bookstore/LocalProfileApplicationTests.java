package com.bookstore;

import com.bookstore.service.ChatbotService;
import com.bookstore.service.DisabledChatbotService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:localprofile;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.task.scheduling.enabled=false",
        "grok.enabled=false"
})
@ActiveProfiles("local")
@DisplayName("Application smoke (local profile)")
class LocalProfileApplicationTests {

    @Autowired
    private ChatbotService chatbotService;

    @Test
    @DisplayName("starts with disabled chatbot when Grok is off")
    void contextLoadsWithDisabledChatbot() {
        assertThat(chatbotService).isInstanceOf(DisabledChatbotService.class);
    }
}
