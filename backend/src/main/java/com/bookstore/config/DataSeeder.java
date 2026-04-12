package com.bookstore.config;

import com.bookstore.entity.Address;
import com.bookstore.entity.Cart;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.Coupon;
import com.bookstore.entity.CouponType;
import com.bookstore.entity.FlashSale;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.OrderStatus;
import com.bookstore.entity.PaymentStatus;
import com.bookstore.entity.Product;
import com.bookstore.entity.Review;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.entity.Wishlist;
import com.bookstore.repository.AddressRepository;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.FlashSaleRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.ReviewRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private static final int TARGET_CUSTOMER_COUNT = 24;
    private static final String DEMO_CUSTOMER_EMAIL = "customer@example.com";

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
            AddressRepository addressRepository,
            WishlistRepository wishlistRepository,
            CouponRepository couponRepository,
            FlashSaleRepository flashSaleRepository) {

        return args -> {
            log.info("Ensuring portfolio demo data...");

            User admin = ensureUser(
                    userRepository,
                    "admin@bookstore.com",
                    "Admin123!",
                    "Nguyễn",
                    "Sơn",
                    "0901234567",
                    Set.of(Role.ADMIN));

            User manager = ensureUser(
                    userRepository,
                    "manager@bookstore.com",
                    "Manager123!",
                    "Trần",
                    "Minh",
                    "0902345678",
                    Set.of(Role.MANAGER));

            List<User> customers = ensureCustomerUsers(userRepository);
            List<Product> products = ensureCatalog(categoryRepository, brandRepository, productRepository);

            Random rand = new Random(42);
            ensureAddresses(customers, addressRepository, rand);
            ensureOrders(customers, products, orderRepository, reviewRepository, rand);
            ensureCarts(admin, customers, products, cartRepository, cartItemRepository, rand);
            ensureWishlists(customers, products, wishlistRepository, rand);
            ensureCoupons(couponRepository, admin);
            ensureFlashSales(flashSaleRepository, products);

            log.info("========================================");
            log.info("Portfolio demo data is ready");
            log.info("========================================");
            log.info("Admin: admin@bookstore.com / Admin123!");
            log.info("Manager: manager@bookstore.com / Manager123!");
            log.info("Customer: customer@example.com / Customer123!");
            log.info("Customers: {}", customers.size());
            log.info("Products: {}", products.size());
            log.info("Coupons: {}", couponRepository.count());
            log.info("Flash sales: {}", flashSaleRepository.count());
            log.info("========================================");
        };
    }

    private User ensureUser(
            UserRepository userRepository,
            String email,
            String rawPassword,
            String firstName,
            String lastName,
            String phoneNumber,
            Set<Role> roles) {

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        boolean isNew = user.getId() == null;
        String persistedFullName = lastName == null || lastName.isBlank()
                ? firstName
                : firstName + " " + lastName;

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setFirstName(persistedFullName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setIsActive(true);
        user.setIsEmailVerified(true);
        user.setRoles(new HashSet<>(roles));

        User saved = userRepository.save(user);
        if (isNew) {
            log.info("Created user {}", email);
        }
        return saved;
    }

    private List<User> ensureCustomerUsers(UserRepository userRepository) {
        User demoCustomer = ensureUser(
                userRepository,
                DEMO_CUSTOMER_EMAIL,
                "Customer123!",
                "Nguyễn",
                "Khách",
                "0903456789",
                Set.of(Role.CUSTOMER));

        String[] firstNames = {"Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Phan", "Trương", "Võ", "Đinh", "Lý"};
        String[] lastNames = {"Minh", "Huyền", "Anh", "Thảo", "Lan", "Hương", "Ngọc", "Trang", "Hà", "Linh", "Phương", "Tú", "Quỳnh", "Mai", "Yến"};
        String[] domains = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "email.com"};

        List<User> existingCustomers = userRepository.findByRolesContaining(Role.CUSTOMER);
        Set<String> knownEmails = new LinkedHashSet<>();
        for (User customer : existingCustomers) {
            knownEmails.add(customer.getEmail().toLowerCase());
        }

        int index = 1;
        while (knownEmails.size() < TARGET_CUSTOMER_COUNT) {
            String firstName = firstNames[(index - 1) % firstNames.length];
            String lastName = lastNames[(index * 2 - 1) % lastNames.length];
            String domain = domains[(index - 1) % domains.length];
            String localPart = slugify(firstName) + "." + slugify(lastName) + index;
            String email = localPart + "@" + domain;

            if (knownEmails.contains(email.toLowerCase()) || DEMO_CUSTOMER_EMAIL.equalsIgnoreCase(email)) {
                index++;
                continue;
            }

            ensureUser(
                    userRepository,
                    email,
                    "Customer123!",
                    firstName,
                    lastName,
                    "09" + String.format("%08d", 10000000 + index),
                    Set.of(Role.CUSTOMER));
            knownEmails.add(email.toLowerCase());
            index++;
        }

        List<User> customers = new ArrayList<>();
        customers.add(demoCustomer);
        userRepository.findByRolesContaining(Role.CUSTOMER).stream()
                .filter(user -> !DEMO_CUSTOMER_EMAIL.equalsIgnoreCase(user.getEmail()))
                .sorted(Comparator.comparing(User::getEmail))
                .forEach(customers::add);

        return customers;
    }

    private List<Product> ensureCatalog(
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository) {

        if (productRepository.count() > 0) {
            return productRepository.findAll();
        }

        if (categoryRepository.count() > 0) {
            log.info("Users exist, categories present, no products — seeding products only (reuse existing categories)...");
            return CatalogDataSeeder.seedProductsUsingExistingCatalog(
                    categoryRepository, brandRepository, productRepository, log);
        }

        log.info("Catalog is empty — seeding categories, brands, and products...");
        return CatalogDataSeeder.seedCatalog(categoryRepository, brandRepository, productRepository, log);
    }

    private void ensureAddresses(List<User> customers, AddressRepository addressRepository, Random rand) {
        String[] provinces = {"TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Biên Hòa", "Nha Trang", "Hải Dương", "Bắc Ninh", "Thanh Hóa"};
        String[] districts = {"Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10"};
        String[] wards = {"Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10"};
        String[] streets = {"Nguyễn Trãi", "Lê Lợi", "Điện Biên Phủ", "Cao Thắng", "Trần Hưng Đạo", "Võ Văn Tần", "Nguyễn Đình Chiểu", "Phạm Ngũ Lão", "Pasteur", "Lê Lai"};

        int createdCount = 0;
        for (int i = 0; i < customers.size(); i++) {
            User customer = customers.get(i);
            if (!addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(customer.getId()).isEmpty()) {
                continue;
            }

            int addressCount = customer.getEmail().equalsIgnoreCase(DEMO_CUSTOMER_EMAIL) ? 2 : (rand.nextInt(2) + 1);
            for (int addressIndex = 0; addressIndex < addressCount; addressIndex++) {
                Address address = Address.builder()
                        .user(customer)
                        .receiverName(customer.getFullName())
                        .phoneNumber(customer.getPhoneNumber())
                        .province(provinces[(i + addressIndex) % provinces.length])
                        .district(districts[(i + addressIndex * 2) % districts.length])
                        .ward(wards[(i + addressIndex * 3) % wards.length])
                        .streetAddress(streets[(i + addressIndex) % streets.length] + " " + (10 + i + addressIndex))
                        .isDefault(addressIndex == 0)
                        .addressType(addressIndex == 0 ? "HOME" : "WORK")
                        .build();
                addressRepository.save(address);
                createdCount++;
            }
        }

        if (createdCount > 0) {
            log.info("Created {} customer addresses", createdCount);
        }
    }

    private void ensureOrders(
            List<User> customers,
            List<Product> products,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository,
            Random rand) {

        if (products.isEmpty()) {
            return;
        }

        AtomicInteger sequence = new AtomicInteger((int) orderRepository.count() + 1);

        if (orderRepository.count() == 0) {
            OrderStatus[] orderStatuses = OrderStatus.values();

            for (int customerIndex = 0; customerIndex < customers.size(); customerIndex++) {
                User customer = customers.get(customerIndex);
                int orderCount = customer.getEmail().equalsIgnoreCase(DEMO_CUSTOMER_EMAIL) ? 3 : rand.nextInt(3) + 1;

                for (int orderIndex = 0; orderIndex < orderCount; orderIndex++) {
                    OrderStatus status = customer.getEmail().equalsIgnoreCase(DEMO_CUSTOMER_EMAIL)
                            ? List.of(OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PENDING).get(orderIndex % 3)
                            : orderStatuses[rand.nextInt(orderStatuses.length)];

                    createSampleOrder(customer, products, orderRepository, reviewRepository, rand, sequence, status);
                }
            }

            log.info("Created showcase orders with reviews");
            return;
        }

        User demoCustomer = customers.get(0);
        if (orderRepository.findByUserId(demoCustomer.getId(), PageRequest.of(0, 1)).isEmpty()) {
            createSampleOrder(
                    demoCustomer,
                    products,
                    orderRepository,
                    reviewRepository,
                    rand,
                    sequence,
                    OrderStatus.DELIVERED);
            log.info("Added a showcase order for {}", demoCustomer.getEmail());
        }
    }

    private void createSampleOrder(
            User customer,
            List<Product> products,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository,
            Random rand,
            AtomicInteger sequence,
            OrderStatus status) {

        List<Product> orderProducts = new ArrayList<>();
        int itemCount = rand.nextInt(3) + 1;
        for (int i = 0; i < itemCount; i++) {
            orderProducts.add(products.get((sequence.get() + i + rand.nextInt(products.size())) % products.size()));
        }

        LocalDateTime createdAt = LocalDateTime.now().minusDays(rand.nextInt(45) + 1);
        PaymentStatus paymentStatus = resolvePaymentStatus(status);

        Order order = Order.builder()
                .orderNumber(String.format("ORD%08d", sequence.getAndIncrement()))
                .user(customer)
                .orderStatus(status)
                .paymentStatus(paymentStatus)
                .shippingAddress("123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh")
                .shippingPhone(customer.getPhoneNumber())
                .shippingReceiverName(customer.getFullName())
                .shippingMethod(rand.nextBoolean() ? "Giao hàng nhanh" : "Giao tiêu chuẩn")
                .shippingFee(rand.nextBoolean() ? BigDecimal.ZERO : BigDecimal.valueOf(25000))
                .paymentMethod(rand.nextBoolean() ? "COD" : "Thanh toán online")
                .notes(status == OrderStatus.CANCELLED ? "Khách hủy đơn sau khi đổi lịch nhận hàng." : "Giao vào giờ hành chính.")
                .createdAt(createdAt)
                .estimatedDelivery(createdAt.plusDays(3))
                .cancelledAt(status == OrderStatus.CANCELLED ? createdAt.plusHours(12) : null)
                .cancelReason(status == OrderStatus.CANCELLED ? "Khách thay đổi nhu cầu" : null)
                .deliveredAt(status == OrderStatus.DELIVERED ? createdAt.plusDays(3) : null)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (Product product : orderProducts.stream().distinct().toList()) {
            int quantity = rand.nextInt(2) + 1;
            BigDecimal itemPrice = product.getCurrentPrice();
            subtotal = subtotal.add(itemPrice.multiply(BigDecimal.valueOf(quantity)));

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(quantity)
                    .price(itemPrice)
                    .discountPercent(product.getDiscountPercent())
                    .build();
            item.calculateSubtotal();
            order.addItem(item);
        }

        order.setSubtotal(subtotal);
        order.setTaxAmount(subtotal.multiply(BigDecimal.valueOf(0.08)).setScale(0, java.math.RoundingMode.HALF_UP));
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(order.getSubtotal()
                .add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO)
                .add(order.getTaxAmount()));

        Order savedOrder = orderRepository.save(order);

        if (status == OrderStatus.DELIVERED) {
            for (OrderItem item : savedOrder.getOrderItems()) {
                if (reviewRepository.existsByUserIdAndProductId(customer.getId(), item.getProduct().getId())) {
                    continue;
                }

                reviewRepository.save(Review.builder()
                        .user(customer)
                        .product(item.getProduct())
                        .rating(rand.nextInt(2) + 4)
                        .comment(getRandomComment(rand))
                        .isVerifiedPurchase(true)
                        .isApproved(true)
                        .isHidden(false)
                        .helpfulCount(rand.nextInt(30))
                        .build());
            }
        }
    }

    private PaymentStatus resolvePaymentStatus(OrderStatus orderStatus) {
        return switch (orderStatus) {
            case DELIVERED, SHIPPED, PROCESSING, CONFIRMED -> PaymentStatus.SUCCESS;
            case CANCELLED -> PaymentStatus.CANCELLED;
            case REFUNDED -> PaymentStatus.REFUNDED;
            case PENDING -> PaymentStatus.PENDING;
        };
    }

    private void ensureCarts(
            User admin,
            List<User> customers,
            List<Product> products,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            Random rand) {

        if (products.isEmpty()) {
            return;
        }

        List<User> users = new ArrayList<>(customers);
        users.add(admin);

        int cartsCreated = 0;
        int itemsCreated = 0;

        for (int userIndex = 0; userIndex < users.size(); userIndex++) {
            User user = users.get(userIndex);
            Cart cart = cartRepository.findByUserId(user.getId()).orElseGet(() -> {
                Cart created = cartRepository.save(Cart.builder().user(user).build());
                return created;
            });

            if (cartItemRepository.countByCartId(cart.getId()) > 0) {
                continue;
            }

            cartsCreated++;
            int itemCount = user.getEmail().equalsIgnoreCase(DEMO_CUSTOMER_EMAIL) ? 3 : rand.nextInt(3) + 1;

            for (int itemIndex = 0; itemIndex < itemCount; itemIndex++) {
                Product product = products.get((userIndex * 5 + itemIndex * 3 + rand.nextInt(products.size())) % products.size());

                if (cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId()).isPresent()) {
                    continue;
                }

                cartItemRepository.save(CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(user.getEmail().equalsIgnoreCase(DEMO_CUSTOMER_EMAIL) ? 1 : rand.nextInt(2) + 1)
                        .build());
                itemsCreated++;
            }
        }

        if (cartsCreated > 0 || itemsCreated > 0) {
            log.info("Ensured carts for demo users ({} carts touched, {} items added)", cartsCreated, itemsCreated);
        }
    }

    private void ensureWishlists(
            List<User> customers,
            List<Product> products,
            WishlistRepository wishlistRepository,
            Random rand) {

        if (products.isEmpty()) {
            return;
        }

        int created = 0;
        int showcaseUsers = Math.min(6, customers.size());

        for (int userIndex = 0; userIndex < showcaseUsers; userIndex++) {
            User customer = customers.get(userIndex);
            if (wishlistRepository.countByUser(customer) > 0) {
                continue;
            }

            int wishlistSize = customer.getEmail().equalsIgnoreCase(DEMO_CUSTOMER_EMAIL) ? 4 : 2 + rand.nextInt(2);
            for (int itemIndex = 0; itemIndex < wishlistSize; itemIndex++) {
                Product product = products.get((userIndex * 7 + itemIndex * 5 + rand.nextInt(products.size())) % products.size());

                if (wishlistRepository.existsByUserAndProduct(customer, product)) {
                    continue;
                }

                wishlistRepository.save(Wishlist.builder()
                        .user(customer)
                        .product(product)
                        .priority(Math.max(1, wishlistSize - itemIndex))
                        .sortOrder(itemIndex + 1)
                        .notes(itemIndex == 0 ? "Ưu tiên săn deal trong tuần này." : null)
                        .build());
                created++;
            }
        }

        if (created > 0) {
            log.info("Created {} wishlist items for showcase customers", created);
        }
    }

    private void ensureCoupons(CouponRepository couponRepository, User admin) {
        if (couponRepository.count() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        List<Coupon> coupons = List.of(
                Coupon.builder()
                        .code("WELCOME10")
                        .description("Giảm 10% cho đơn hàng đầu tiên từ 150.000đ")
                        .type(CouponType.PERCENTAGE)
                        .discountValue(BigDecimal.valueOf(10))
                        .minOrderAmount(BigDecimal.valueOf(150_000))
                        .maxDiscount(BigDecimal.valueOf(50_000))
                        .startDate(now.minusDays(2))
                        .endDate(now.plusMonths(3))
                        .usageLimit(500)
                        .perUserLimit(1)
                        .isActive(true)
                        .isPublic(true)
                        .sortOrder(1)
                        .createdBy(admin.getId())
                        .build(),
                Coupon.builder()
                        .code("BOOKLOVER50K")
                        .description("Tặng 50.000đ cho đơn từ 399.000đ")
                        .type(CouponType.FIXED_AMOUNT)
                        .discountValue(BigDecimal.valueOf(50_000))
                        .minOrderAmount(BigDecimal.valueOf(399_000))
                        .maxDiscount(BigDecimal.valueOf(50_000))
                        .startDate(now.minusDays(1))
                        .endDate(now.plusMonths(2))
                        .usageLimit(300)
                        .perUserLimit(2)
                        .isActive(true)
                        .isPublic(true)
                        .sortOrder(2)
                        .createdBy(admin.getId())
                        .build(),
                Coupon.builder()
                        .code("FREESHIP")
                        .description("Miễn phí vận chuyển cho đơn hàng từ 120.000đ")
                        .type(CouponType.FREE_SHIPPING)
                        .discountValue(BigDecimal.ZERO)
                        .minOrderAmount(BigDecimal.valueOf(120_000))
                        .maxDiscount(BigDecimal.valueOf(30_000))
                        .startDate(now.minusDays(5))
                        .endDate(now.plusMonths(1))
                        .usageLimit(1000)
                        .perUserLimit(3)
                        .isActive(true)
                        .isPublic(true)
                        .sortOrder(3)
                        .createdBy(admin.getId())
                        .build(),
                Coupon.builder()
                        .code("SPRING25")
                        .description("Giảm 25% cho các tựa sách nổi bật, tối đa 80.000đ")
                        .type(CouponType.PERCENTAGE)
                        .discountValue(BigDecimal.valueOf(25))
                        .minOrderAmount(BigDecimal.valueOf(250_000))
                        .maxDiscount(BigDecimal.valueOf(80_000))
                        .startDate(now.minusHours(8))
                        .endDate(now.plusDays(21))
                        .usageLimit(250)
                        .perUserLimit(1)
                        .isActive(true)
                        .isPublic(true)
                        .sortOrder(4)
                        .createdBy(admin.getId())
                        .build()
        );

        couponRepository.saveAll(coupons);
        log.info("Created {} public coupons", coupons.size());
    }

    private void ensureFlashSales(FlashSaleRepository flashSaleRepository, List<Product> products) {
        if (flashSaleRepository.count() > 0 || products.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        List<Product> showcaseProducts = products.stream()
                .sorted(Comparator.comparingInt((Product product) -> product.getSoldCount() != null ? product.getSoldCount() : 0).reversed())
                .limit(4)
                .toList();

        List<FlashSale> flashSales = new ArrayList<>();
        for (int i = 0; i < showcaseProducts.size(); i++) {
            Product product = showcaseProducts.get(i);
            BigDecimal originalPrice = product.getCurrentPrice();
            BigDecimal salePrice = originalPrice.multiply(BigDecimal.valueOf(i < 2 ? 0.72 : 0.78))
                    .setScale(0, java.math.RoundingMode.HALF_UP);

            flashSales.add(FlashSale.builder()
                    .product(product)
                    .originalPrice(originalPrice)
                    .salePrice(salePrice)
                    .startTime(i < 2 ? now.minusHours(3L + i) : now.plusHours(12L + i * 6))
                    .endTime(i < 2 ? now.plusHours(18L - i) : now.plusHours(42L + i * 6))
                    .stockLimit(40 + i * 10)
                    .soldCount(i < 2 ? 8 + i * 4 : 0)
                    .maxPerUser(2)
                    .isActive(true)
                    .build());
        }

        flashSaleRepository.saveAll(flashSales);
        log.info("Created {} flash sale entries", flashSales.size());
    }

    private String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        return normalized.toLowerCase()
                .replaceAll("[^a-z0-9]+", "")
                .replaceAll("(^-+|-+$)", "");
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
                "Sách hay, phù hợp cho người mới bắt đầu."
        };
        return comments[rand.nextInt(comments.length)];
    }
}
