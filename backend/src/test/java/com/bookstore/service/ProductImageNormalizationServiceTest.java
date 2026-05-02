package com.bookstore.service;

import com.bookstore.entity.Product;
import com.bookstore.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductImageNormalizationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductImageNormalizationService productImageNormalizationService;

    @Test
    void normalizeExistingProductImages_replacesImmutableImageListsWithoutMerge() {
        Product product = Product.builder()
                .id(1L)
                .name("Existing Book")
                .isbn("9780000000001")
                .price(BigDecimal.valueOf(120000))
                .stockQuantity(5)
                .imageUrl("https://example.com/cover.jpg")
                .images(List.of("https://example.com/cover.jpg"))
                .isActive(true)
                .build();
        when(productRepository.findAllWithCategoryAndImages()).thenReturn(List.of(product));

        productImageNormalizationService.normalizeExistingProductImages();

        assertThat(product.getImageUrl()).isEqualTo("/images/books/placeholders/default.svg");
        assertThat(product.getImages()).containsExactly("/images/books/placeholders/default.svg");
        product.getImages().add("/images/books/placeholders/extra.svg");
        assertThat(product.getImages()).hasSize(2);
        verify(productRepository, never()).saveAll(any());
    }
}
