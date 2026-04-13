package com.bookstore.service;

import com.bookstore.dto.response.DashboardStats;
import com.bookstore.entity.OrderStatus;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private static final java.time.format.DateTimeFormatter MONTH_FORMATTER = 
            java.time.format.DateTimeFormatter.ofPattern("MMM yyyy");

    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        LocalDateTime startOfMonth = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = LocalDateTime.now().with(TemporalAdjusters.lastDayOfMonth())
                .withHour(23).withMinute(59).withSecond(59);

        long totalUsers = userRepository.countActiveUsers();
        long totalProducts = productRepository.countActiveProducts();
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PENDING);
        long completedOrders = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);

        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        BigDecimal revenueThisMonth = orderRepository.calculateRevenueBetweenDates(startOfMonth, endOfMonth);
        if (revenueThisMonth == null) {
            revenueThisMonth = BigDecimal.ZERO;
        }

        long newOrdersThisMonth = orderRepository.countOrdersBetweenDates(startOfMonth, endOfMonth);

        var lowStockProducts = productRepository.countLowStockProducts(10);

        java.util.Map<String, java.math.BigDecimal> trend = new java.util.LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = LocalDateTime.now().minusMonths(i).with(TemporalAdjusters.firstDayOfMonth())
                    .withHour(0).withMinute(0).withSecond(0);
            LocalDateTime end = LocalDateTime.now().minusMonths(i).with(TemporalAdjusters.lastDayOfMonth())
                    .withHour(23).withMinute(59).withSecond(59);
            BigDecimal monthly = orderRepository.calculateRevenueBetweenDates(start, end);
            trend.put(start.format(MONTH_FORMATTER), monthly != null ? monthly : java.math.BigDecimal.ZERO);
        }

        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .totalRevenue(totalRevenue)
                .lowStockProducts(lowStockProducts)
                .newOrdersThisMonth(newOrdersThisMonth)
                .revenueThisMonth(revenueThisMonth)
                .monthlyRevenueTrend(trend)
                .build();
    }
}
