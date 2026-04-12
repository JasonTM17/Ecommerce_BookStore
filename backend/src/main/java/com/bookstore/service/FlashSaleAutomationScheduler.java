package com.bookstore.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlashSaleAutomationScheduler {

    private final FlashSaleAutomationService flashSaleAutomationService;

    @Scheduled(
            cron = "${flashsale.auto.cron:0 5 0 ? * MON}",
            zone = "${flashsale.auto.timezone:Asia/Bangkok}"
    )
    public void rotateWeeklyFlashSales() {
        FlashSaleAutomationResult result = flashSaleAutomationService.rotateWeeklyFlashSales();
        if (result.skipped()) {
            log.info("Weekly flash sale rotation skipped: reason={}, expiredCount={}, window={} -> {}",
                    result.reason(), result.expiredCount(), result.campaignStart(), result.campaignEnd());
            return;
        }

        log.info("Weekly flash sale rotation completed: createdCount={}, expiredCount={}, window={} -> {}",
                result.createdCount(), result.expiredCount(), result.campaignStart(), result.campaignEnd());
    }
}
