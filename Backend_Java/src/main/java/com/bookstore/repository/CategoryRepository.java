package com.bookstore.repository;

import com.bookstore.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    List<Category> findByParentIsNullOrderByDisplayOrderAsc();

    List<Category> findByParentIdOrderByDisplayOrderAsc(Long parentId);

    @Query("SELECT c FROM Category c WHERE c.isActive = true ORDER BY c.displayOrder ASC")
    List<Category> findAllActiveCategories();

    @Query("SELECT c FROM Category c WHERE c.isActive = true AND c.parent IS NULL ORDER BY c.displayOrder ASC")
    List<Category> findActiveRootCategories();

    @Query("SELECT c FROM Category c WHERE c.isActive = true AND c.parent.id = :parentId ORDER BY c.displayOrder ASC")
    List<Category> findActiveSubcategories(Long parentId);
}
