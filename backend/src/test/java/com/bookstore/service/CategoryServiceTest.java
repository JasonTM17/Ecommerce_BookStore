package com.bookstore.service;

import com.bookstore.dto.request.CategoryRequest;
import com.bookstore.dto.response.CategoryResponse;
import com.bookstore.entity.Category;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;
    private Category childCategory;
    private CategoryRequest categoryRequest;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Tiểu Thuyết")
                .description("Sách tiểu thuyết hay nhất")
                .isActive(true)
                .build();

        childCategory = Category.builder()
                .id(2L)
                .name("Tiểu Thuyết Trinh Thám")
                .description("Tiểu thuyết trinh thám hấp dẫn")
                .isActive(true)
                .parent(testCategory)
                .build();
        testCategory.setSubcategories(List.of(childCategory));

        categoryRequest = CategoryRequest.builder()
                .name("Tiểu Thuyết Mới")
                .description("Danh mục tiểu thuyết mới")
                .build();

        lenient().when(productRepository.countActiveProductsByCategoryIds(anyList()))
                .thenReturn(0L);
    }

    @Test
    void getAllCategories_Success() {
        when(categoryRepository.findAllActiveCategories())
                .thenReturn(List.of(testCategory, childCategory));

        List<CategoryResponse> categories = categoryService.getAllCategories();

        assertNotNull(categories);
        assertEquals(2, categories.size());
        assertEquals("Tiểu Thuyết", categories.get(0).getName());
    }

    @Test
    void getAllCategories_Empty() {
        when(categoryRepository.findAllActiveCategories())
                .thenReturn(List.of());

        List<CategoryResponse> categories = categoryService.getAllCategories();

        assertNotNull(categories);
        assertEquals(0, categories.size());
    }

    @Test
    void getRootCategories_Success() {
        when(categoryRepository.findActiveRootCategories())
                .thenReturn(List.of(testCategory));

        List<CategoryResponse> categories = categoryService.getRootCategories();

        assertNotNull(categories);
        assertEquals(1, categories.size());
    }

    @Test
    void getCategoryById_Success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));

        CategoryResponse response = categoryService.getCategoryById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Tiểu Thuyết", response.getName());
    }

    @Test
    void getCategoryById_AggregatesDescendantProductCounts() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(productRepository.countActiveProductsByCategoryIds(List.of(1L, 2L))).thenReturn(7L);
        when(productRepository.countActiveProductsByCategoryIds(List.of(2L))).thenReturn(3L);

        CategoryResponse response = categoryService.getCategoryById(1L);

        assertEquals(7, response.getProductCount());
        assertNotNull(response.getSubcategories());
        assertEquals(1, response.getSubcategories().size());
        assertEquals(3, response.getSubcategories().get(0).getProductCount());
    }

    @Test
    void getCategoryById_NotFound_ThrowsException() {
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                categoryService.getCategoryById(999L));
    }

    @Test
    void getSubcategories_Success() {
        when(categoryRepository.findActiveSubcategories(1L))
                .thenReturn(java.util.List.of(childCategory));

        var responses = categoryService.getSubcategories(1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    @Test
    void getSubcategories_NoChildren() {
        when(categoryRepository.findActiveSubcategories(1L))
                .thenReturn(java.util.List.of());

        var responses = categoryService.getSubcategories(1L);

        assertNotNull(responses);
        assertEquals(0, responses.size());
    }

    @Test
    void createCategory_Success() {
        Category savedCategory = Category.builder()
                .id(3L)
                .name("Tiểu Thuyết Mới")
                .description("Danh mục tiểu thuyết mới")
                .isActive(true)
                .build();

        when(categoryRepository.existsByName("Tiểu Thuyết Mới")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(savedCategory);

        CategoryResponse response = categoryService.createCategory(categoryRequest);

        assertNotNull(response);
        assertEquals("Tiểu Thuyết Mới", response.getName());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategory_DuplicateName_ThrowsException() {
        when(categoryRepository.existsByName("Tiểu Thuyết Mới")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                categoryService.createCategory(categoryRequest));

        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void createCategory_WithParent_Success() {
        CategoryRequest requestWithParent = CategoryRequest.builder()
                .name("Tiểu Thuyết Trinh Thám")
                .description("Tiểu thuyết trinh thám")
                .parentId(1L)
                .build();

        Category savedCategory = Category.builder()
                .id(2L)
                .name("Tiểu Thuyết Trinh Thám")
                .parent(testCategory)
                .isActive(true)
                .build();

        when(categoryRepository.existsByName("Tiểu Thuyết Trinh Thám")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(savedCategory);

        CategoryResponse response = categoryService.createCategory(requestWithParent);

        assertNotNull(response);
        assertEquals(1L, response.getParentId());
    }

    @Test
    void createCategory_ParentNotFound_ThrowsException() {
        CategoryRequest requestWithParent = CategoryRequest.builder()
                .name("Tiểu Thuyết Trinh Thám")
                .parentId(999L)
                .build();

        when(categoryRepository.existsByName("Tiểu Thuyết Trinh Thám")).thenReturn(false);
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                categoryService.createCategory(requestWithParent));
    }

    @Test
    void updateCategory_Success() {
        CategoryRequest updateRequest = CategoryRequest.builder()
                .name("Tiểu Thuyết Cập Nhật")
                .description("Mô tả mới")
                .build();

        Category updatedCategory = Category.builder()
                .id(1L)
                .name("Tiểu Thuyết Cập Nhật")
                .description("Mô tả mới")
                .isActive(true)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(updatedCategory);

        CategoryResponse response = categoryService.updateCategory(1L, updateRequest);

        assertNotNull(response);
        assertEquals("Tiểu Thuyết Cập Nhật", response.getName());
        assertEquals("Mô tả mới", response.getDescription());
    }

    @Test
    void updateCategory_NotFound_ThrowsException() {
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                categoryService.updateCategory(999L, categoryRequest));
    }

    @Test
    void deleteCategory_Success_softDeletes() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

        categoryService.deleteCategory(1L);

        assertFalse(testCategory.getIsActive());
        verify(categoryRepository).save(testCategory);
    }

    @Test
    void deleteCategory_NotFound_ThrowsException() {
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                categoryService.deleteCategory(999L));
    }
}
