package com.bookstore.dto.response;

import com.bookstore.entity.BookClubRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * BookClub响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookClubResponse {

    private Long id;
    private String name;
    private String description;
    private String coverImage;
    private String ownerName;
    private Long currentBookId;
    private String currentBookTitle;
    private Integer memberCount;
    private Boolean isPublic;
    private LocalDateTime createdAt;

    /**
     * BookClub成员响应DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookClubMemberResponse {
        private Long id;
        private Long userId;
        private String userName;
        private BookClubRole role;
        private LocalDateTime joinedAt;
    }
}
