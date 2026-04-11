package com.bookstore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private String imageUrl;
    private Long parentId;
    private String parentName;
    private List<CategoryResponse> subcategories;
    private Integer sortOrder;
    private Boolean isActive;
    private Integer productCount;
}
