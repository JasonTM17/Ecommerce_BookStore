package com.bookstore.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.demo-seed")
@Getter
@Setter
public class DemoSeedProperties {

    private boolean enabled = true;

    private boolean deferred = false;
}
