package com.bookstore.dto.response;

import com.bookstore.entity.InventoryAction;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InventoryLogResponse {

    private Long id;
    private Long productId;
    private String productName;
    private InventoryAction action;
    private Integer quantityChange;
    private Integer stockBefore;
    private Integer stockAfter;
    private String reason;
    private Long referenceId;
    private String referenceType;
    private String createdByName;
    private LocalDateTime createdAt;
}
