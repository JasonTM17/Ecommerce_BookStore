package com.bookstore.repository;

import com.bookstore.config.JpaConfig;
import com.bookstore.entity.Category;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaConfig.class)
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("CategoryRepository (JPA slice)")
class CategoryRepositoryTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("persists hierarchy and finds active subcategories")
    void saveAndFindSubcategories() {
        Category parent = Category.builder()
                .name("Fiction")
                .description("Fiction books")
                .isActive(true)
                .displayOrder(1)
                .build();
        parent = categoryRepository.save(parent);

        Category child = Category.builder()
                .name("Mystery")
                .description("Mystery fiction")
                .isActive(true)
                .displayOrder(1)
                .parent(parent)
                .build();
        categoryRepository.save(child);
        categoryRepository.flush();

        List<Category> subs = categoryRepository.findActiveSubcategories(parent.getId());

        assertThat(subs).hasSize(1);
        assertThat(subs.get(0).getName()).isEqualTo("Mystery");
        assertThat(subs.get(0).getParent().getId()).isEqualTo(parent.getId());
    }

    @Test
    @DisplayName("existsByName reflects persisted state")
    void existsByName() {
        categoryRepository.save(Category.builder()
                .name("UniqueName")
                .isActive(true)
                .displayOrder(0)
                .build());

        assertThat(categoryRepository.existsByName("UniqueName")).isTrue();
        assertThat(categoryRepository.existsByName("Missing")).isFalse();
    }
}
