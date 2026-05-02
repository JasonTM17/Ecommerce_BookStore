package com.bookstore.service;

import com.bookstore.config.CatalogDataSeeder;
import com.bookstore.entity.Product;
import com.bookstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImageNormalizationService {

    private final ProductRepository productRepository;

    @Transactional
    public List<Product> normalizeExistingProductImages() {
        List<Product> products = productRepository.findAllWithCategoryAndImages();
        return CatalogDataSeeder.normalizeExistingProductImages(products, log);
    }
}
