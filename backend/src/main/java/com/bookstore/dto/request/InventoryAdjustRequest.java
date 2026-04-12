package com.bookstore.dto.request;

import com.bookstore.entity.InventoryAction;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAdjustRequest {

    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Số lượng thay đổi không được để trống")
    private Integer quantityChange;

    @NotNull(message = "Hành động không được để trống")
    private InventoryAction action;

    private String reason;
}
