package com.bookstore.config;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.web.servlet.context.ServletWebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

@Configuration
@Profile("render")
@RequiredArgsConstructor
@Slf4j
public class RenderStartupDiagnostics {

    private final Environment environment;
    private final AtomicBoolean entityManagerLogged = new AtomicBoolean(false);

    @PostConstruct
    void logRenderStartupMode() {
        log.info(
                "Render startup mode: lazyInit={}, repoBootstrapMode={}, hikariMinIdle={}, springdocApiDocs={}, "
                        + "swaggerUi={}, demoSeedDeferred={}",
                environment.getProperty("spring.main.lazy-initialization", "false"),
                environment.getProperty("spring.data.jpa.repositories.bootstrap-mode", "default"),
                environment.getProperty("spring.datasource.hikari.minimum-idle", "default"),
                environment.getProperty("springdoc.api-docs.enabled", "true"),
                environment.getProperty("springdoc.swagger-ui.enabled", "true"),
                environment.getProperty("app.demo-seed.deferred", "false"));
    }

    @Bean
    BeanPostProcessor renderMilestoneBeanPostProcessor() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) {
                if (bean instanceof EntityManagerFactory && entityManagerLogged.compareAndSet(false, true)) {
                    log.info("Render startup milestone: entity manager factory initialized");
                }
                return bean;
            }
        };
    }

    @Bean
    ApplicationListener<ServletWebServerInitializedEvent> renderWebServerStartedLogger() {
        return event -> log.info(
                "Render startup milestone: web server bound on port {}",
                event.getWebServer().getPort());
    }

    @Bean
    ApplicationListener<ApplicationReadyEvent> renderApplicationReadyLogger() {
        return event -> {
            long startupMs = event.getTimeTaken() != null ? event.getTimeTaken().toMillis() : -1L;
            log.info("Render startup milestone: application ready in {} ms", startupMs);
        };
    }
}
