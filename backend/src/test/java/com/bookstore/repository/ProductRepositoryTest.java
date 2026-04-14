package com.bookstore.repository;

import com.bookstore.config.JpaConfig;
import com.bookstore.entity.Category;
import com.bookstore.entity.Product;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaConfig.class)
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("ProductRepository (JPA slice)")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("findAllWithCategoryAndImages eagerly loads category and image collection")
    void findAllWithCategoryAndImages() {
        Category category = categoryRepository.save(Category.builder()
                .name("Science")
                .description("Science books")
                .isActive(true)
                .sortOrder(1)
                .build());

        productRepository.save(Product.builder()
                .name("A Brief History of Time")
                .author("Stephen Hawking")
                .publisher("Bantam")
                .isbn("9780553380163")
                .price(BigDecimal.valueOf(129000))
                .stockQuantity(10)
                .category(category)
                .imageUrl("/images/books/covers/9780553380163.jpg")
                .images(List.of("/images/books/covers/9780553380163.jpg"))
                .isActive(true)
                .build());

        productRepository.flush();

        Product product = productRepository.findAllWithCategoryAndImages().get(0);

        assertThat(Hibernate.isInitialized(product.getImages())).isTrue();
        assertThat(Hibernate.isInitialized(product.getCategory())).isTrue();
        assertThat(product.getImages()).containsExactly("/images/books/covers/9780553380163.jpg");
        assertThat(product.getCategory().getName()).isEqualTo("Science");
    }
}
