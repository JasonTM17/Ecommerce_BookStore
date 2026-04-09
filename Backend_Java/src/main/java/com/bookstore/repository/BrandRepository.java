package com.bookstore.repository;

import com.bookstore.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT b FROM Brand b WHERE b.isActive = true ORDER BY b.name ASC")
    List<Brand> findAllActiveBrands();

    long countById(Long id);

    @Query("SELECT b FROM Brand b WHERE b.isActive = true AND b.name LIKE %:keyword%")
    List<Brand> searchBrands(String keyword);
}
