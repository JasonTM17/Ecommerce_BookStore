package com.bookstore.service;

import com.bookstore.dto.request.BrandRequest;
import com.bookstore.dto.response.BrandResponse;
import com.bookstore.entity.Brand;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public BrandResponse createBrand(BrandRequest request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new ConflictException("Thương hiệu đã tồn tại");
        }

        Brand brand = Brand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .logoUrl(request.getLogoUrl())
                .websiteUrl(request.getWebsiteUrl())
                .isActive(true)
                .build();

        brand = brandRepository.save(brand);
        return mapToBrandResponse(brand);
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public BrandResponse updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        if (request.getName() != null && !request.getName().equals(brand.getName())) {
            if (brandRepository.existsByName(request.getName())) {
                throw new ConflictException("Thương hiệu đã tồn tại");
            }
            brand.setName(request.getName());
        }

        if (request.getDescription() != null) brand.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) brand.setLogoUrl(request.getLogoUrl());
        if (request.getWebsiteUrl() != null) brand.setWebsiteUrl(request.getWebsiteUrl());

        brand = brandRepository.save(brand);
        return mapToBrandResponse(brand);
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        return mapToBrandResponse(brand);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "brands")
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAllActiveBrands().stream()
                .map(this::mapToBrandResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        brand.setIsActive(false);
        brandRepository.save(brand);
    }

    private BrandResponse mapToBrandResponse(Brand brand) {
        int productCount = 0;
        try {
            if (brand.getProducts() != null) {
                productCount = brand.getProducts().size();
            }
        } catch (Exception e) {
            // Fallback: use count query if products collection is not initialized
            try {
                productCount = (int) brandRepository.countById(brand.getId());
            } catch (Exception ignored) {}
        }

        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .logoUrl(brand.getLogoUrl())
                .websiteUrl(brand.getWebsiteUrl())
                .isActive(brand.getIsActive())
                .productCount(productCount)
                .build();
    }
}
