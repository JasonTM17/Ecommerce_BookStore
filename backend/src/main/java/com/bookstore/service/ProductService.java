package com.bookstore.service;

import com.bookstore.dto.request.ProductRequest;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.dto.response.ProductResponse;
import com.bookstore.entity.Brand;
import com.bookstore.entity.Category;
import com.bookstore.entity.Product;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BrandRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "brands", allEntries = true)
    })
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        Brand brand = resolveBrand(request.getBrandId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .isbn(request.getIsbn())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .discountPercent(request.getDiscountPercent() != null ? request.getDiscountPercent() : 0)
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .imageUrl(request.getImageUrl())
                .images(copyImages(request.getImages()))
                .category(category)
                .brand(brand)
                .specifications(request.getSpecifications())
                .pageCount(request.getPageCount())
                .publishedYear(request.getPublishedYear())
                .language(request.getLanguage())
                .weightGrams(request.getWeightGrams())
                .dimensions(request.getDimensions())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isBestseller(request.getIsBestseller() != null ? request.getIsBestseller() : false)
                .isNew(request.getIsNew() != null ? request.getIsNew() : true)
                .isActive(true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        product.calculateDiscountPrice();
        product = productRepository.save(product);

        updateProductRating(product.getId());

        return mapToProductResponse(product);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "brands", allEntries = true)
    })
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getBrandId() != null) {
            product.setBrand(resolveBrand(request.getBrandId()));
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getShortDescription() != null) product.setShortDescription(request.getShortDescription());
        if (request.getAuthor() != null) product.setAuthor(request.getAuthor());
        if (request.getPublisher() != null) product.setPublisher(request.getPublisher());
        if (request.getIsbn() != null) product.setIsbn(request.getIsbn());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getDiscountPrice() != null) product.setDiscountPrice(request.getDiscountPrice());
        if (request.getDiscountPercent() != null) product.setDiscountPercent(request.getDiscountPercent());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getImages() != null) product.setImages(copyImages(request.getImages()));
        if (request.getSpecifications() != null) product.setSpecifications(request.getSpecifications());
        if (request.getPageCount() != null) product.setPageCount(request.getPageCount());
        if (request.getPublishedYear() != null) product.setPublishedYear(request.getPublishedYear());
        if (request.getLanguage() != null) product.setLanguage(request.getLanguage());
        if (request.getWeightGrams() != null) product.setWeightGrams(request.getWeightGrams());
        if (request.getDimensions() != null) product.setDimensions(request.getDimensions());
        if (request.getIsFeatured() != null) product.setIsFeatured(request.getIsFeatured());
        if (request.getIsBestseller() != null) product.setIsBestseller(request.getIsBestseller());
        if (request.getIsNew() != null) product.setIsNew(request.getIsNew());
        if (request.getSortOrder() != null) product.setSortOrder(request.getSortOrder());

        product.calculateDiscountPrice();
        product = productRepository.save(product);

        updateProductRating(id);

        return mapToProductResponse(product);
    }

    /**
     * Read-write: {@link ProductRepository#incrementViewCount} runs an UPDATE and must not run inside a read-only transaction.
     */
    @Transactional
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        ProductResponse response = mapToProductResponse(product);
        productRepository.incrementViewCount(id);
        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String direction) {
        Sort sort = buildProductSort(sortBy, direction);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> products = productRepository.findAllActiveProducts(pageable);
        List<ProductResponse> content = products.getContent().stream()
                .map(this::mapToProductResponse)
                .toList();

        return PageResponse.<ProductResponse>builder()
                .content(content)
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .first(products.isFirst())
                .last(products.isLast())
                .hasNext(products.hasNext())
                .hasPrevious(products.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'featured'")
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findFeaturedProducts().stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getBestsellerProducts() {
        return productRepository.findBestsellerProducts().stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getNewProducts() {
        return productRepository.findNewProducts().stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByCategoryIdIn(resolveCategoryIds(categoryId), pageable);
        List<ProductResponse> content = products.getContent().stream()
                .map(this::mapToProductResponse)
                .toList();

        return PageResponse.<ProductResponse>builder()
                .content(content)
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .first(products.isFirst())
                .last(products.isLast())
                .hasNext(products.hasNext())
                .hasPrevious(products.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(
            String keyword, Long categoryId, Long brandId,
            BigDecimal minPrice, BigDecimal maxPrice,
            Boolean inStock, String sortBy, String direction,
            int page, int size) {
        List<Long> categoryIds = categoryId != null ? resolveCategoryIds(categoryId) : null;

        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.isTrue(root.get("isActive")));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("author")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern)
                ));
            }

            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            if (brandId != null) {
                predicates.add(criteriaBuilder.equal(root.get("brand").get("id"), brandId));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (inStock != null && inStock) {
                predicates.add(criteriaBuilder.greaterThan(root.get("stockQuantity"), 0));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = buildProductSort(sortBy, direction);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> products = productRepository.findAll(spec, pageable);
        List<ProductResponse> content = products.getContent().stream()
                .map(this::mapToProductResponse)
                .toList();

        return PageResponse.<ProductResponse>builder()
                .content(content)
                .page(products.getNumber())
                .size(products.getSize())
                .totalElements(products.getTotalElements())
                .totalPages(products.getTotalPages())
                .first(products.isFirst())
                .last(products.isLast())
                .hasNext(products.hasNext())
                .hasPrevious(products.hasPrevious())
                .build();
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "brands", allEntries = true)
    })
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long productId, Long categoryId) {
        Pageable pageable = PageRequest.of(0, 8);
        return productRepository.findRelatedProducts(productId, categoryId, pageable).stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(int threshold) {
        return productRepository.findLowStockProducts(threshold).stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countActiveProducts() {
        return productRepository.countActiveProducts();
    }

    /**
     * Map UI sort tokens (newest, price_asc, …) to JPA field names; unknown values fall back safely.
     */
    private Sort buildProductSort(String sortBy, String direction) {
        String dirStr = (direction != null && !direction.isBlank()) ? direction : "DESC";
        Sort.Direction dir;
        try {
            dir = Sort.Direction.fromString(dirStr);
        } catch (IllegalArgumentException e) {
            dir = Sort.Direction.DESC;
        }

        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sortBy.trim()) {
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "createdAt", "price", "name", "soldCount", "viewCount", "avgRating", "sortOrder" -> Sort.by(dir, sortBy.trim());
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private void updateProductRating(Long productId) {
        Double avgRating = reviewRepository.calculateAverageRatingByProductId(productId);
        long reviewCount = reviewRepository.countApprovedReviewsByProductId(productId);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAvgRating(avgRating != null ? avgRating : 0.0);
            product.setReviewCount((int) reviewCount);
            productRepository.save(product);
        }
    }

    private List<Long> resolveCategoryIds(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        List<Long> categoryIds = new ArrayList<>();
        collectCategoryIds(category, categoryIds);
        return categoryIds;
    }

    private void collectCategoryIds(Category category, List<Long> categoryIds) {
        categoryIds.add(category.getId());

        if (category.getSubcategories() == null || category.getSubcategories().isEmpty()) {
            return;
        }

        category.getSubcategories().stream()
                .filter(subcategory -> Boolean.TRUE.equals(subcategory.getIsActive()))
                .forEach(subcategory -> collectCategoryIds(subcategory, categoryIds));
    }

    private Brand resolveBrand(Long brandId) {
        if (brandId == null) {
            return null;
        }

        return brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", brandId));
    }

    private List<String> copyImages(List<String> images) {
        return images == null ? new ArrayList<>() : new ArrayList<>(images);
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .author(product.getAuthor())
                .publisher(product.getPublisher())
                .isbn(product.getIsbn())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .discountPercent(product.getDiscountPercent())
                .currentPrice(product.getCurrentPrice())
                .stockQuantity(product.getStockQuantity())
                .inStock(product.isInStock())
                .imageUrl(product.getImageUrl())
                .images(copyImages(product.getImages()))
                .category(product.getCategory() != null ? mapToCategoryResponse(product.getCategory()) : null)
                .brand(product.getBrand() != null ? mapToBrandResponse(product.getBrand()) : null)
                .specifications(product.getSpecifications())
                .pageCount(product.getPageCount())
                .publishedYear(product.getPublishedYear())
                .language(product.getLanguage())
                .weightGrams(product.getWeightGrams())
                .dimensions(product.getDimensions())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .soldCount(product.getSoldCount())
                .viewCount(product.getViewCount())
                .isFeatured(product.getIsFeatured())
                .isBestseller(product.getIsBestseller())
                .isNew(product.getIsNew())
                .sortOrder(product.getSortOrder())
                .build();
    }

    private com.bookstore.dto.response.CategoryResponse mapToCategoryResponse(Category category) {
        String parentName = null;
        if (category.getParent() != null) {
            parentName = categoryRepository.findParentNameById(category.getId()).orElse(null);
        }
        return com.bookstore.dto.response.CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(parentName)
                .isActive(category.getIsActive())
                .sortOrder(category.getSortOrder())
                .build();
    }

    private com.bookstore.dto.response.BrandResponse mapToBrandResponse(com.bookstore.entity.Brand brand) {
        return com.bookstore.dto.response.BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .logoUrl(brand.getLogoUrl())
                .websiteUrl(brand.getWebsiteUrl())
                .isActive(brand.getIsActive())
                .build();
    }
}
