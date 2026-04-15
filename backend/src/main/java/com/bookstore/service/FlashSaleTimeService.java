package com.bookstore.service;

import com.bookstore.config.FlashSaleAutoProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class FlashSaleTimeService {

    private final FlashSaleAutoProperties properties;

    public ZoneId zoneId() {
        return ZoneId.of(properties.getTimezone());
    }

    public LocalDateTime now() {
        return LocalDateTime.now(zoneId());
    }

    public OffsetDateTime toOffsetDateTime(LocalDateTime value) {
        if (value == null) {
            return null;
        }

        return value.atZone(zoneId()).toOffsetDateTime();
    }
}
