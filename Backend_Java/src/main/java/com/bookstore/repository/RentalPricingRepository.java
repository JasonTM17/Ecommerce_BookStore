package com.bookstore.repository;

import com.bookstore.entity.RentalPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentalPricingRepository extends JpaRepository<RentalPricing, Long> {

    Optional<RentalPricing> findByProductId(Long productId);

    List<RentalPricing> findByIsAvailableForRentalTrue();
}
