package com.bookstore.config;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!test")
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository,
            AddressRepository addressRepository) {

        return args -> {
            if (userRepository.count() > 0 && productRepository.count() > 0) {
                log.info("Database already seeded, skipping...");
                return;
            }

            if (userRepository.count() > 0 && productRepository.count() == 0) {
                if (categoryRepository.count() > 0) {
                    log.info("Users exist, categories present, no products — seeding products only (reuse existing categories)...");
                    CatalogDataSeeder.seedProductsUsingExistingCatalog(
                            categoryRepository, brandRepository, productRepository, log);
                    return;
                }
                log.info("Users exist but catalog is empty — seeding categories, brands, and products...");
                CatalogDataSeeder.seedCatalog(categoryRepository, brandRepository, productRepository, log);
                return;
            }

            log.info("Seeding database with rich sample data...");

            // ==================== USERS ====================
            User admin = User.builder()
                    .email("admin@bookstore.com")
                    .password(passwordEncoder.encode("Admin123!"))
                    .firstName("Nguyễn")
                    .lastName("Sơn")
                    .phoneNumber("0901234567")
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(Role.ADMIN)))
                    .build();
            admin = userRepository.save(admin);

            User manager = User.builder()
                    .email("manager@bookstore.com")
                    .password(passwordEncoder.encode("Manager123!"))
                    .firstName("Trần")
                    .lastName("Minh")
                    .phoneNumber("0902345678")
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(Role.MANAGER)))
                    .build();
            manager = userRepository.save(manager);

            List<User> customers = new ArrayList<>();
            String[] firstNames = {"Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Phan", "Trương", "Võ", "Đinh", "Lý"};
            String[] lastNames = {"Minh", "Huyền", "Anh", "Thảo", "Lan", "Hương", "Ngọc", "Trang", "Hà", "Linh", "Phương", "Tú", "Quỳnh", "Mai", "Yến"};
            String[] domains = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "email.com"};

            // Demo customer account - MUST be first so it exists for login
            User demoCustomer = User.builder()
                    .email("customer@example.com")
                    .password(passwordEncoder.encode("Customer123!"))
                    .firstName("Nguyễn")
                    .lastName("Khách")
                    .phoneNumber("0903456789")
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                    .build();
            demoCustomer = userRepository.save(demoCustomer);

            customers = new ArrayList<>();
            customers.add(demoCustomer);

            for (int i = 1; i <= 20; i++) {
                String firstName = firstNames[new Random().nextInt(firstNames.length)];
                String lastName = lastNames[new Random().nextInt(lastNames.length)];
                String domain = domains[new Random().nextInt(domains.length)];
                String email = firstName.toLowerCase() + lastName.toLowerCase() + i + "@" + domain;

                User customer = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode("Customer123!"))
                        .firstName(firstName)
                        .lastName(lastName)
                        .phoneNumber("09" + String.format("%08d", new Random().nextInt(100000000)))
                        .isActive(true)
                        .isEmailVerified(new Random().nextBoolean())
                        .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                        .build();
                customers.add(userRepository.save(customer));
            }
            log.info("Created {} users", customers.size() + 2);

            List<Product> products = CatalogDataSeeder.seedCatalog(
                    categoryRepository, brandRepository, productRepository, log);

            Random rand = new Random(42);

            // ==================== ADDRESSES ====================
            String[] provinces = {"TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Biên Hòa", "Nha Trang", "Hải Dương", "Bắc Ninh", "Thanh Hóa"};
            String[] districts = {"Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10"};
            String[] wards = {"Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10"};
            String[] streets = {"Nguyễn Trãi", "Lê Lợi", "Đền Thánh", "Cao Thắng", "Trần Hưng Đạo", "Võ Văn Tần", "Nguyễn Đình Chiểu", "Phạm Ngũ Lão", "Pasteur", "Lê Lai"};

            for (User customer : customers) {
                int addrCount = rand.nextInt(2) + 1;
                for (int i = 0; i < addrCount; i++) {
                    String province = provinces[rand.nextInt(provinces.length)];
                    String district = districts[rand.nextInt(districts.length)];
                    String ward = wards[rand.nextInt(wards.length)];
                    String street = streets[rand.nextInt(streets.length)] + " " + (rand.nextInt(200) + 1);

                    Address address = Address.builder()
                            .user(customer)
                            .receiverName(customer.getFullName())
                            .phoneNumber(customer.getPhoneNumber())
                            .province(province)
                            .district(district)
                            .ward(ward)
                            .streetAddress(street)
                            .isDefault(i == 0)
                            .addressType(i == 0 ? "HOME" : "WORK")
                            .build();
                    addressRepository.save(address);
                }
            }
            log.info("Created addresses for customers");

            // ==================== ORDERS ====================
            OrderStatus[] orderStatuses = OrderStatus.values();
            PaymentStatus[] paymentStatuses = PaymentStatus.values();

            for (User customer : customers) {
                int orderCount = rand.nextInt(3) + 1;
                for (int o = 0; o < orderCount; o++) {
                    List<Product> orderProducts = new ArrayList<>();
                    int itemCount = rand.nextInt(3) + 1;
                    for (int i = 0; i < itemCount; i++) {
                        orderProducts.add(products.get(rand.nextInt(products.size())));
                    }

                    OrderStatus oStatus = orderStatuses[rand.nextInt(orderStatuses.length)];
                    PaymentStatus pStatus = oStatus == OrderStatus.PENDING || oStatus == OrderStatus.CONFIRMED
                            ? PaymentStatus.PENDING : PaymentStatus.SUCCESS;

                    LocalDateTime createdAt = LocalDateTime.now().minusDays(rand.nextInt(60));

                    BigDecimal subtotal = BigDecimal.ZERO;
                    Order order = Order.builder()
                            .orderNumber("ORD" + System.currentTimeMillis() + rand.nextInt(10000))
                            .user(customer)
                            .orderStatus(oStatus)
                            .paymentStatus(pStatus)
                            .shippingAddress(provinces[rand.nextInt(provinces.length)] + ", " +
                                    districts[rand.nextInt(districts.length)] + ", " +
                                    wards[rand.nextInt(wards.length)] + ", " +
                                    streets[rand.nextInt(streets.length)] + " " + (rand.nextInt(200) + 1))
                            .shippingPhone(customer.getPhoneNumber())
                            .shippingReceiverName(customer.getFullName())
                            .shippingMethod("Giao hàng nhanh")
                            .shippingFee(BigDecimal.valueOf(rand.nextInt(2) == 0 ? 0 : 25000))
                            .paymentMethod(rand.nextBoolean() ? "COD" : "Thanh toán online")
                            .notes(oStatus == OrderStatus.CANCELLED ? "Khách hủy đơn" : null)
                            .cancelledAt(oStatus == OrderStatus.CANCELLED ? createdAt.plusDays(1) : null)
                            .build();

                    for (Product p : orderProducts) {
                        int qty = rand.nextInt(2) + 1;
                        BigDecimal itemPrice = p.getCurrentPrice();
                        BigDecimal itemSubtotal = itemPrice.multiply(BigDecimal.valueOf(qty));
                        subtotal = subtotal.add(itemSubtotal);

                        OrderItem item = OrderItem.builder()
                                .product(p)
                                .quantity(qty)
                                .price(itemPrice)
                                .discountPercent(p.getDiscountPercent())
                                .build();
                        item.calculateSubtotal();
                        order.addItem(item);
                    }

                    order.setSubtotal(subtotal);
                    order.setTaxAmount(subtotal.multiply(BigDecimal.valueOf(0.1)).setScale(0, java.math.RoundingMode.HALF_UP));
                    order.setDiscountAmount(BigDecimal.ZERO);
                    order.setTotalAmount(order.getSubtotal()
                            .add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO)
                            .add(order.getTaxAmount()));

                    if (oStatus == OrderStatus.DELIVERED) {
                        order.setDeliveredAt(createdAt.plusDays(3 + rand.nextInt(3)));
                    }

                    order = orderRepository.save(order);

                    // Reviews for delivered orders
                    if (oStatus == OrderStatus.DELIVERED && rand.nextBoolean()) {
                        for (OrderItem item : order.getOrderItems()) {
                            Review review = Review.builder()
                                    .user(customer)
                                    .product(item.getProduct())
                                    .rating(rand.nextInt(2) + 4)
                                    .comment(getRandomComment(rand))
                                    .isVerifiedPurchase(true)
                                    .isApproved(true)
                                    .isHidden(false)
                                    .helpfulCount(rand.nextInt(20))
                                    .build();
                            reviewRepository.save(review);
                        }
                    }
                }
            }

            // Admin orders
            for (int i = 0; i < 3; i++) {
                OrderStatus oStatus = orderStatuses[rand.nextInt(orderStatuses.length)];
                User adminCustomer = customers.get(rand.nextInt(customers.size()));

                Order adminOrder = Order.builder()
                        .orderNumber("ORD" + System.currentTimeMillis() + 10000 + i)
                        .user(adminCustomer)
                        .orderStatus(oStatus)
                        .paymentStatus(PaymentStatus.SUCCESS)
                        .shippingAddress("123 Admin Street, District 1, Ho Chi Minh City")
                        .shippingPhone(adminCustomer.getPhoneNumber())
                        .shippingReceiverName(adminCustomer.getFullName())
                        .shippingMethod("Giao hàng nhanh")
                        .shippingFee(BigDecimal.ZERO)
                        .paymentMethod("Thanh toán online")
                        .subtotal(BigDecimal.valueOf(300000))
                        .taxAmount(BigDecimal.valueOf(30000))
                        .discountAmount(BigDecimal.ZERO)
                        .totalAmount(BigDecimal.valueOf(330000))
                        .createdAt(LocalDateTime.now().minusDays(rand.nextInt(30)))
                        .build();

                Product randomProduct = products.get(rand.nextInt(products.size()));
                OrderItem item = OrderItem.builder()
                        .product(randomProduct)
                        .quantity(3)
                        .price(randomProduct.getCurrentPrice())
                        .build();
                item.calculateSubtotal();
                adminOrder.addItem(item);
                adminOrder.calculateTotal();

                orderRepository.save(adminOrder);
            }

            log.info("Created orders with reviews");

            // ==================== CARTS ====================
            for (User customer : customers) {
                Cart cart = Cart.builder().user(customer).build();
                cart = cartRepository.save(cart);

                int cartItemCount = rand.nextInt(3) + 1;
                for (int i = 0; i < cartItemCount; i++) {
                    Product randomProduct = products.get(rand.nextInt(products.size()));
                    CartItem cartItem = CartItem.builder()
                            .cart(cart)
                            .product(randomProduct)
                            .quantity(rand.nextInt(2) + 1)
                            .build();
                    cartItemRepository.save(cartItem);
                }
            }
            log.info("Created carts with items");

            // Admin cart
            Cart adminCart = Cart.builder().user(admin).build();
            cartRepository.save(adminCart);

            log.info("========================================");
            log.info("Database seeding COMPLETED!");
            log.info("========================================");
            log.info("Admin: admin@bookstore.com / Admin123!");
            log.info("Manager: manager@bookstore.com / Manager123!");
            log.info("Customer: customer@example.com / Customer123!");
            log.info("20+ sample customers: [name][number]@gmail.com / Customer123!");
            log.info("========================================");
        };
    }

    private String getRandomComment(Random rand) {
        String[] comments = {
                "Sách rất hay, giao hàng nhanh. Đóng gói cẩn thận. Sẽ ủng hộ tiếp!",
                "Nội dung phong phú, bìa đẹp. Giá cả hợp lý. Recommend!",
                "Chất lượng in ấn tốt, không bị lỗi. Giao đúng mẫu.",
                "Mua lần thứ 3 rồi, lần nào cũng hài lòng. Shop uy tín!",
                "Sách đúng như mô tả, giao hàng nhanh hơn dự kiến.",
                "Tuyệt vời! Đọc rồi muốn đọc tiếp. 5 sao!",
                "Giao hàng đúng hẹn, sách mới, không rách. Tốt!",
                "Nội dung bổ ích, phù hợp với giá. Mua thêm các tập khác.",
                "Đóng gói kỹ, không bị móp méo. Cảm ơn shop!",
                " Sách hay, phù hợp cho người mới bắt đầu."
        };
        return comments[rand.nextInt(comments.length)];
    }
}
