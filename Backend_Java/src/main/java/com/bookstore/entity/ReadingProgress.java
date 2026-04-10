package com.bookstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ReadingStatus status = ReadingStatus.WANT_TO_READ;

    @Column(name = "current_page")
    @Builder.Default
    private Integer currentPage = 0;

    @Column(name = "total_pages")
    private Integer totalPages;

    @Column(name = "progress_percent")
    @Builder.Default
    private Integer progressPercent = 0;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "review", columnDefinition = "TEXT")
    private String review;

    @Column(name = "reading_notes", columnDefinition = "TEXT")
    private String readingNotes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateProgress(int currentPage) {
        this.currentPage = currentPage;
        if (totalPages != null && totalPages > 0) {
            this.progressPercent = (int) ((currentPage * 100.0) / totalPages);
        }
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
        if (currentPage >= totalPages) {
            this.status = ReadingStatus.FINISHED;
            this.finishedAt = LocalDateTime.now();
        } else {
            this.status = ReadingStatus.READING;
        }
    }
}
