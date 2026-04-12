package com.bookstore.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@ConfigurationProperties(prefix = "flashsale.auto")
@Validated
@Getter
@Setter
public class FlashSaleAutoProperties {

    private boolean enabled = true;

    @NotBlank
    private String cron = "0 5 0 ? * MON";

    @NotBlank
    private String timezone = "Asia/Bangkok";

    @Min(1)
    @Max(20)
    private int batchSize = 4;

    @Min(1)
    @Max(90)
    private int discountMin = 15;

    @Min(1)
    @Max(95)
    private int discountMax = 30;

    @Min(1)
    @Max(500)
    private int stockMin = 20;

    @Min(1)
    @Max(500)
    private int stockMax = 60;

    @Min(1)
    @Max(10)
    private int maxPerUser = 2;
}
