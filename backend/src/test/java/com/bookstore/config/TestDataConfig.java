package com.bookstore.config;

import com.bookstore.entity.Brand;
import com.bookstore.entity.Category;
import com.bookstore.entity.Product;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 * TestDataConfig - Cấu hình dữ liệu test cho môi trường test
 * 
 * Tạo các user test mặc định:
 * - admin@bookstore.com / Admin123! (ADMIN)
 * - manager@bookstore.com / Manager123! (MANAGER)  
 * - customer@example.com / Customer123! (CUSTOMER)
 * 
 * Chỉ chạy khi profile = "test"
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
@Profile("test")
public class TestDataConfig {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initTestData(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ProductRepository productRepository) {
        return args -> {
            log.info("Initializing test data...");

            // Admin user
            if (!userRepository.findByEmail("admin@bookstore.com").isPresent()) {
                User admin = User.builder()
                        .email("admin@bookstore.com")
                        .password(passwordEncoder.encode("Admin123!"))
                        .firstName("Admin")
                        .lastName("User")
                        .phoneNumber("0901234567")
                        .isActive(true)
                        .isEmailVerified(true)
                        .roles(new HashSet<>(Set.of(Role.ADMIN)))
                        .build();
                userRepository.save(admin);
                log.info("Created admin user: admin@bookstore.com");
            }

            // Manager user
            if (!userRepository.findByEmail("manager@bookstore.com").isPresent()) {
                User manager = User.builder()
                        .email("manager@bookstore.com")
                        .password(passwordEncoder.encode("Manager123!"))
                        .firstName("Manager")
                        .lastName("User")
                        .phoneNumber("0902345678")
                        .isActive(true)
                        .isEmailVerified(true)
                        .roles(new HashSet<>(Set.of(Role.MANAGER)))
                        .build();
                userRepository.save(manager);
                log.info("Created manager user: manager@bookstore.com");
            }

            // Customer user
            if (!userRepository.findByEmail("customer@example.com").isPresent()) {
                User customer = User.builder()
                        .email("customer@example.com")
                        .password(passwordEncoder.encode("Customer123!"))
                        .firstName("Customer")
                        .lastName("Test")
                        .phoneNumber("0903456789")
                        .isActive(true)
                        .isEmailVerified(true)
                        .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                        .build();
                userRepository.save(customer);
                log.info("Created customer user: customer@example.com");
            }

            Category category = categoryRepository.findAll().stream().findFirst()
                    .orElseGet(() -> {
                        Category created = Category.builder()
                                .name("Test Category")
                                .description("Default test category")
                                .isActive(true)
                                .sortOrder(0)
                                .build();
                        Category saved = categoryRepository.save(created);
                        log.info("Created test category: {}", saved.getName());
                        return saved;
                    });

            Brand brand = brandRepository.findAll().stream().findFirst()
                    .orElseGet(() -> {
                        Brand created = Brand.builder()
                                .name("Test Brand")
                                .description("Default test brand")
                                .isActive(true)
                                .build();
                        Brand saved = brandRepository.save(created);
                        log.info("Created test brand: {}", saved.getName());
                        return saved;
                    });

            if (productRepository.count() == 0) {
                Product product = Product.builder()
                        .name("Test Book")
                        .description("Default test product")
                        .shortDescription("Default test product")
                        .author("Test Author")
                        .publisher("Test Publisher")
                        .isbn("TEST-BOOK-001")
                        .price(BigDecimal.valueOf(100000))
                        .discountPrice(BigDecimal.valueOf(90000))
                        .stockQuantity(100)
                        .imageUrl("https://example.com/test-book.jpg")
                        .category(category)
                        .brand(brand)
                        .isFeatured(true)
                        .isBestseller(true)
                        .isNew(true)
                        .isActive(true)
                        .sortOrder(0)
                        .build();
                productRepository.save(product);
                log.info("Created default test product: {}", product.getName());
            }

            log.info("Test data initialization completed");
        };
    }
}
