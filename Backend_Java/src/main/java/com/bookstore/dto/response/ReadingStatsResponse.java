package com.bookstore.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReadingStatsResponse {
    private long totalBooks;
    private long wantToRead;
    private long currentlyReading;
    private long finishedBooks;
    private long totalPagesRead;
    private ReadingStreakInfo streak;
    private ChallengeInfo challenge;
    private List<TopGenreInfo> topGenres;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadingStreakInfo {
        private Integer currentStreak;
        private Integer longestStreak;
        private Integer totalReadingDays;
        private LocalDate lastReadDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeInfo {
        private Integer targetBooks;
        private Integer completedBooks;
        private Integer year;
        private Boolean isCompleted;
        private Integer progressPercent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopGenreInfo {
        private String genre;
        private long count;
    }
}
