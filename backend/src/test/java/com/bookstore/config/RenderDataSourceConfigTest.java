package com.bookstore.config;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.mock.env.MockEnvironment;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class RenderDataSourceConfigTest {

    @Test
    void dataSource_parsesRenderDatabaseUrlIntoValidJdbcConfiguration() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("DATABASE_URL", "postgresql://bookstore:bookpass@render-host:5432/bookstore_db");
        RenderDataSourceConfig config = new RenderDataSourceConfig(environment);
        DataSourceProperties properties = new DataSourceProperties();

        DataSource dataSource = config.dataSource(properties);
        HikariDataSource hikari = assertInstanceOf(HikariDataSource.class, dataSource);

        assertEquals("jdbc:postgresql://render-host:5432/bookstore_db?sslmode=prefer", hikari.getJdbcUrl());
        assertEquals("bookstore", hikari.getUsername());
        assertEquals("bookpass", hikari.getPassword());
        hikari.close();
    }

    @Test
    void dataSource_fallsBackToSplitDatasourcePropertiesWhenDatabaseUrlIsMissing() {
        MockEnvironment environment = new MockEnvironment();
        RenderDataSourceConfig config = new RenderDataSourceConfig(environment);
        DataSourceProperties properties = new DataSourceProperties();
        properties.setUrl("jdbc:postgresql://db-host:5432/bookstore?sslmode=prefer");
        properties.setUsername("dbuser");
        properties.setPassword("dbpass");
        properties.setDriverClassName("org.postgresql.Driver");

        DataSource dataSource = config.dataSource(properties);
        HikariDataSource hikari = assertInstanceOf(HikariDataSource.class, dataSource);

        assertEquals("jdbc:postgresql://db-host:5432/bookstore?sslmode=prefer", hikari.getJdbcUrl());
        assertEquals("dbuser", hikari.getUsername());
        assertEquals("dbpass", hikari.getPassword());
        hikari.close();
    }
}
