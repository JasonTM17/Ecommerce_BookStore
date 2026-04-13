package com.bookstore.service;

import com.bookstore.dto.request.OrderRequest;
import com.bookstore.dto.response.OrderItemResponse;
import com.bookstore.dto.response.OrderResponse;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.OrderStatus;
import com.bookstore.entity.PaymentStatus;
import com.bookstore.entity.Product;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.FlashSaleRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final FlashSaleRepository flashSaleRepository;
    private final EffectivePricingService effectivePricingService;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.1");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("200000");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("25000");

    @Transactional
    public OrderResponse createOrder(User user, OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Đơn hàng phải có ít nhất một sản phẩm");
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .shippingPhone(request.getShippingPhone())
                .shippingReceiverName(request.getShippingReceiverName())
                .shippingMethod(request.getShippingMethod())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .shippingFee(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .build();

        Map<Long, Product> productsById = new LinkedHashMap<>();
        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));
            productsById.put(product.getId(), product);
        }

        Map<Long, EffectiveProductPricing> pricingByProductId = effectivePricingService.resolveAll(productsById.values());
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productsById.get(itemRequest.getProductId());
            EffectiveProductPricing pricing = pricingByProductId.get(product.getId());

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new BadRequestException("Sản phẩm '" + product.getName() + "' không còn hoạt động");
            }

            validateRequestedQuantity(product, pricing, itemRequest.getQuantity());

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(pricing.currentPrice())
                    .discountPercent(0)
                    .build();
            orderItem.calculateSubtotal();

            order.addItem(orderItem);
            subtotal = subtotal.add(orderItem.getSubtotal());

            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            product.setSoldCount(product.getSoldCount() + itemRequest.getQuantity());
            productRepository.save(product);

            if (pricing.hasActiveFlashSale()) {
                FlashSale flashSale = pricing.activeFlashSale();
                flashSale.setSoldCount(flashSale.getSoldCount() + itemRequest.getQuantity());
                flashSaleRepository.save(flashSale);
            }
        }

        order.setSubtotal(subtotal);

        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : SHIPPING_FEE;
        order.setShippingFee(shippingFee);

        BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        order.setTaxAmount(taxAmount);
        order.calculateTotal();
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(3));

        order = orderRepository.save(order);

        cartRepository.findByUserId(user.getId())
                .ifPresent(cart -> cartItemRepository.deleteAllByCartId(cart.getId()));

        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(User user, Long orderId) {
        Order order = orderRepository.findByIdWithUserAndItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(user.getId()) && !user.getRoles().contains(Role.ADMIN)) {
            throw new BadRequestException("Bạn không có quyền xem đơn hàng này");
        }

        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getAdminOrderById(Long orderId) {
        Order order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(User user, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Page<Order> orders = orderRepository.findByUserId(user.getId(), PageRequest.of(page, size, sort));

        List<OrderResponse> content = orders.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(content)
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .first(orders.isFirst())
                .last(orders.isLast())
                .hasNext(orders.hasNext())
                .hasPrevious(orders.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(int page, int size, OrderStatus status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Page<Order> orders = status != null
                ? orderRepository.findByOrderStatus(status, PageRequest.of(page, size, sort))
                : orderRepository.findAll(PageRequest.of(page, size, sort));

        List<OrderResponse> content = orders.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(content)
                .page(orders.getNumber())
                .size(orders.getSize())
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .first(orders.isFirst())
                .last(orders.isLast())
                .hasNext(orders.hasNext())
                .hasPrevious(orders.hasPrevious())
                .build();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setOrderStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.CANCELLED) {
            order.setCancelledAt(LocalDateTime.now());
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (Boolean.TRUE.equals(product.getIsActive())) {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        order = orderRepository.save(order);
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long orderId, PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setPaymentStatus(paymentStatus);
        order = orderRepository.save(order);
        return mapToOrderResponse(order);
    }

    private void validateRequestedQuantity(Product product, EffectiveProductPricing pricing, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng không hợp lệ");
        }

        if (pricing.hasActiveFlashSale()) {
            if (quantity > pricing.maxPerUser()) {
                throw new BadRequestException(
                        "Flash sale cho sản phẩm '" + product.getName() + "' chỉ cho phép mua tối đa " + pricing.maxPerUser() + " cuốn");
            }

            if (quantity > pricing.stockQuantity()) {
                throw new BadRequestException("Số lượng flash sale còn lại không đủ");
            }
            return;
        }

        if (quantity > pricing.stockQuantity()) {
            throw new BadRequestException("Sản phẩm '" + product.getName() + "' không đủ số lượng trong kho");
        }
    }

    private String generateOrderNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD" + timestamp.substring(timestamp.length() - 8) + uuid;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .user(mapToUserResponse(order.getUser()))
                .orderStatus(order.getOrderStatus())
                .orderStatusDisplayName(order.getOrderStatus().name())
                .paymentStatus(order.getPaymentStatus())
                .paymentStatusDisplayName(order.getPaymentStatus().name())
                .orderItems(items)
                .shippingAddress(order.getShippingAddress())
                .shippingPhone(order.getShippingPhone())
                .shippingReceiverName(order.getShippingReceiverName())
                .shippingMethod(order.getShippingMethod())
                .shippingFee(order.getShippingFee())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .estimatedDelivery(order.getEstimatedDelivery())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .cancelReason(order.getCancelReason())
                .sortOrder(order.getSortOrder())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .product(mapToProductResponse(item.getProduct(), effectivePricingService.resolve(item.getProduct())))
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .discountPercent(item.getDiscountPercent())
                .subtotal(item.getSubtotal())
                .sortOrder(item.getSortOrder())
                .build();
    }

    private ProductResponse mapToProductResponse(Product product, EffectiveProductPricing pricing) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .author(product.getAuthor())
                .imageUrl(product.getImageUrl())
                .price(pricing.originalPrice())
                .discountPrice(pricing.discountPrice())
                .currentPrice(pricing.currentPrice())
                .discountPercent(pricing.discountPercent())
                .stockQuantity(pricing.stockQuantity())
                .inStock(pricing.inStock())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .build();
    }
}
