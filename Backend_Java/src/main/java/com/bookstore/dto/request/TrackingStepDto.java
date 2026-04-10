package com.bookstore.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingStepDto {
    private String title;
    private String date;
    private boolean completed;
    private boolean current;
}
