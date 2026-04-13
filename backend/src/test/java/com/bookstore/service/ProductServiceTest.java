package com.bookstore.service;

import com.bookstore.dto.request.ProductRequest;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.entity.Category;
import com.bookstore.entity.Product;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private EffectivePricingService effectivePricingService;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private Category testCategory;
    private ProductRequest productRequest;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Tiểu Thuyết")
                .description("Sách tiểu thuyết")
                .isActive(true)
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Đắc Nhân Tâm")
                .author("Dale Carnegie")
                .publisher("NXB Trẻ")
                .isbn("9786045653206")
                .price(new BigDecimal("59000"))
                .discountPrice(new BigDecimal("45000"))
                .discountPercent(24)
                .stockQuantity(100)
                .shortDescription("Sách kinh điển về giao tiếp")
                .description("Một cuốn sách kinh điển")
                .category(testCategory)
                .isActive(true)
                .isFeatured(true)
                .isBestseller(true)
                .avgRating(4.5)
                .reviewCount(100)
                .soldCount(500)
                .viewCount(1000)
                .build();

        productRequest = ProductRequest.builder()
                .name("Đắc Nhân Tâm")
                .author("Dale Carnegie")
                .publisher("NXB Trẻ")
                .isbn("9786045653206")
                .price(new BigDecimal("59000"))
                .discountPercent(24)
                .stockQuantity(100)
                .shortDescription("Sách kinh điển về giao tiếp")
                .description("Một cuốn sách kinh điển")
                .categoryId(1L)
                .isFeatured(true)
                .isBestseller(true)
                .build();

        lenient().when(effectivePricingService.resolve(testProduct)).thenReturn(pricingFor(testProduct));
        lenient().when(effectivePricingService.resolveAll(any())).thenReturn(Map.of(testProduct.getId(), pricingFor(testProduct)));
    }

    @Test
    void createProduct_Success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(effectivePricingService.resolve(any(Product.class))).thenAnswer(invocation -> pricingFor(invocation.getArgument(0)));
        when(reviewRepository.calculateAverageRatingByProductId(anyLong())).thenReturn(4.5);
        when(reviewRepository.countApprovedReviewsByProductId(anyLong())).thenReturn(100L);

        ProductResponse response = productService.createProduct(productRequest);

        assertNotNull(response);
        assertEquals("Đắc Nhân Tâm", response.getName());
        assertEquals("Dale Carnegie", response.getAuthor());
        assertEquals(new BigDecimal("45000"), response.getCurrentPrice());
        assertTrue(response.isInStock());

        verify(categoryRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_CategoryNotFound_ThrowsException() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            productService.createProduct(productRequest));

        verify(categoryRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void getProductById_Success() {
        when(productRepository.findDetailById(1L)).thenReturn(Optional.of(testProduct));
        doNothing().when(productRepository).incrementViewCount(1L);

        ProductResponse response = productService.getProductById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Đắc Nhân Tâm", response.getName());

        verify(productRepository).findDetailById(1L);
        verify(productRepository).incrementViewCount(1L);
    }

    @Test
    void getProductById_NotFound_ThrowsException() {
        when(productRepository.findDetailById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            productService.getProductById(1L));

        verify(productRepository).findDetailById(1L);
        verify(productRepository, never()).incrementViewCount(any());
    }

    @Test
    void getAllProducts_Success() {
        Page<Product> productPage = new PageImpl<>(List.of(testProduct));
        when(productRepository.findAllActiveProducts(any(Pageable.class))).thenReturn(productPage);

        var response = productService.getAllProducts(0, 10, "createdAt", "DESC");

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getContent().size());
        assertEquals("Đắc Nhân Tâm", response.getContent().get(0).getName());
    }

    @Test
    void getProductsByCategory_IncludesDescendants() {
        Category childCategory = Category.builder()
                .id(2L)
                .name("Tiểu Thuyết Hiện Đại")
                .isActive(true)
                .parent(testCategory)
                .build();
        testCategory.setSubcategories(List.of(childCategory));

        Page<Product> productPage = new PageImpl<>(List.of(testProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(productRepository.findByCategoryIdIn(
                argThat(categoryIds -> categoryIds.containsAll(List.of(1L, 2L)) && categoryIds.size() == 2),
                any(Pageable.class)
        )).thenReturn(productPage);

        var response = productService.getProductsByCategory(1L, 0, 12);

        assertEquals(1, response.getContent().size());
        verify(productRepository).findByCategoryIdIn(
                argThat(categoryIds -> categoryIds.containsAll(List.of(1L, 2L)) && categoryIds.size() == 2),
                any(Pageable.class)
        );
    }

    @Test
    void getFeaturedProducts_Success() {
        when(productRepository.findFeaturedProducts()).thenReturn(List.of(testProduct));

        List<ProductResponse> products = productService.getFeaturedProducts();

        assertNotNull(products);
        assertEquals(1, products.size());
        assertEquals("Đắc Nhân Tâm", products.get(0).getName());

        verify(productRepository).findFeaturedProducts();
    }

    @Test
    void deleteProduct_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        productService.deleteProduct(1L);

        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_Success() {
        ProductRequest updateRequest = ProductRequest.builder()
                .name("Đắc Nhân Tâm - Bản Mới")
                .price(new BigDecimal("55000"))
                .stockQuantity(150)
                .build();

        Product updatedProduct = Product.builder()
                .id(1L)
                .name("Đắc Nhân Tâm - Bản Mới")
                .price(new BigDecimal("55000"))
                .stockQuantity(150)
                .category(testCategory)
                .isActive(true)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(effectivePricingService.resolve(any(Product.class))).thenAnswer(invocation -> pricingFor(invocation.getArgument(0)));
        when(reviewRepository.calculateAverageRatingByProductId(anyLong())).thenReturn(4.5);
        when(reviewRepository.countApprovedReviewsByProductId(anyLong())).thenReturn(100L);

        ProductResponse response = productService.updateProduct(1L, updateRequest);

        assertNotNull(response);
        assertEquals("Đắc Nhân Tâm - Bản Mới", response.getName());
        assertEquals(0, new BigDecimal("55000").compareTo(response.getPrice()));

        verify(productRepository, times(2)).findById(1L);
        verify(productRepository, atLeastOnce()).save(any(Product.class));
    }

    private EffectiveProductPricing pricingFor(Product product) {
        BigDecimal currentPrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                ? product.getDiscountPrice()
                : product.getPrice();

        return new EffectiveProductPricing(
                product.getPrice(),
                product.getDiscountPrice(),
                currentPrice,
                product.getDiscountPercent(),
                product.getStockQuantity(),
                product.getStockQuantity() != null && product.getStockQuantity() > 0,
                null
        );
    }
}
