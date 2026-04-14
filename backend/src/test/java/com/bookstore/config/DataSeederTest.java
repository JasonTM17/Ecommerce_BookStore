package com.bookstore.config;

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
import com.bookstore.service.ProductImageNormalizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class DataSeederTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ProductImageNormalizationService productImageNormalizationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private FlashSaleRepository flashSaleRepository;

    private DemoSeedProperties demoSeedProperties;
    private DataSeeder dataSeeder;

    @BeforeEach
    void setUp() {
        demoSeedProperties = new DemoSeedProperties();
        demoSeedProperties.setEnabled(true);
        demoSeedProperties.setDeferred(false);
        dataSeeder = new DataSeeder(passwordEncoder, productImageNormalizationService, demoSeedProperties);
    }

    @Test
    void initDatabase_skipsStartupSeedingWhenDeferredIsEnabled() throws Exception {
        demoSeedProperties.setDeferred(true);

        CommandLineRunner runner = dataSeeder.initDatabase(
                userRepository,
                categoryRepository,
                brandRepository,
                productRepository,
                cartRepository,
                cartItemRepository,
                orderRepository,
                reviewRepository,
                addressRepository,
                wishlistRepository,
                couponRepository,
                flashSaleRepository
        );

        runner.run();

        verifyNoInteractions(
                userRepository,
                categoryRepository,
                brandRepository,
                productRepository,
                cartRepository,
                cartItemRepository,
                orderRepository,
                reviewRepository,
                addressRepository,
                wishlistRepository,
                couponRepository,
                flashSaleRepository
        );
    }

    @Test
    void initDatabase_skipsStartupSeedingWhenDisabled() throws Exception {
        demoSeedProperties.setEnabled(false);

        CommandLineRunner runner = dataSeeder.initDatabase(
                userRepository,
                categoryRepository,
                brandRepository,
                productRepository,
                cartRepository,
                cartItemRepository,
                orderRepository,
                reviewRepository,
                addressRepository,
                wishlistRepository,
                couponRepository,
                flashSaleRepository
        );

        runner.run();

        verifyNoInteractions(
                userRepository,
                categoryRepository,
                brandRepository,
                productRepository,
                cartRepository,
                cartItemRepository,
                orderRepository,
                reviewRepository,
                addressRepository,
                wishlistRepository,
                couponRepository,
                flashSaleRepository
        );
    }
}
