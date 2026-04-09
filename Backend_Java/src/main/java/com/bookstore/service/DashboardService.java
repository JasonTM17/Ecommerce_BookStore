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

        var lowStockProducts = productRepository.findLowStockProducts(10).size();

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
                .build();
    }
}
