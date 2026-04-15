package com.bookstore.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Render exposes DATABASE_URL in URI form:
 *   postgresql://USER:PASSWORD@HOST:PORT/DATABASE
 *
 * PostgreSQL JDBC expects credentials outside the JDBC URL, so we parse
 * DATABASE_URL into a valid jdbc:postgresql:// URL and set username/password
 * separately. If DATABASE_URL is absent, Spring falls back to the split DB_*
 * properties from application-render.properties.
 */
@Configuration
@Profile("render")
public class RenderDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(RenderDataSourceConfig.class);

    private final Environment environment;

    public RenderDataSourceConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public DataSource dataSource(DataSourceProperties properties) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        String hostFallback = environment.getProperty("DB_HOST");

        // Failsafe: If the user didn't sync the blueprint and pasted the full URL into DB_HOST,
        // we catch it and treat it as the connection string.
        if ((databaseUrl == null || databaseUrl.isBlank()) && hostFallback != null && hostFallback.contains("@")) {
            log.warn("Detected full connection string inside DB_HOST! This is a common misconfiguration. Auto-correcting...");
            databaseUrl = hostFallback.startsWith("postgres") ? hostFallback : "postgresql://" + hostFallback;
        }

        if (databaseUrl != null && !databaseUrl.isBlank()) {
            log.info("Detected DATABASE_URL env var - parsing for JDBC DataSource...");
            try {
                String cleanUrl = databaseUrl;
                if (cleanUrl.startsWith("postgres://")) {
                    cleanUrl = "postgresql://" + cleanUrl.substring("postgres://".length());
                }

                URI uri = new URI(cleanUrl.replace("postgresql://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String dbName = uri.getPath();
                if (dbName != null && dbName.startsWith("/")) {
                    dbName = dbName.substring(1);
                }

                String username = null;
                String password = null;
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                String jdbcUrl =
                        String.format("jdbc:postgresql://%s:%d/%s?sslmode=prefer", host, port, dbName);

                log.info("Constructed JDBC URL: jdbc:postgresql://{}:{}/{}", host, port, dbName);

                HikariDataSource dataSource = new HikariDataSource();
                dataSource.setJdbcUrl(jdbcUrl);
                dataSource.setUsername(username);
                dataSource.setPassword(password);
                dataSource.setDriverClassName("org.postgresql.Driver");
                dataSource.setMaximumPoolSize(5);
                dataSource.setMinimumIdle(2);
                dataSource.setConnectionTimeout(30000);
                dataSource.setIdleTimeout(600000);
                dataSource.setMaxLifetime(1800000);

                return dataSource;
            } catch (Exception exception) {
                log.error(
                        "Failed to parse DATABASE_URL: {}. Falling back to Spring properties.",
                        exception.getMessage());
            }
        }

        log.info("No DATABASE_URL found - using Spring datasource properties (DB_HOST, DB_NAME, etc.)");
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
}
