package com.bookstore.service;

import java.time.LocalDateTime;

public record FlashSaleAutomationResult(
        int expiredCount,
        int createdCount,
        boolean skipped,
        String reason,
        LocalDateTime campaignStart,
        LocalDateTime campaignEnd) {
}
