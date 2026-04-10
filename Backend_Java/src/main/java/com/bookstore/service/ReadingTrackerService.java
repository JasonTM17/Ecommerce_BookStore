package com.bookstore.service;

import com.bookstore.dto.response.ReadingProgressResponse;
import com.bookstore.dto.response.ReadingStatsResponse;
import com.bookstore.dto.response.ReadingStatsResponse.*;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadingTrackerService {

    private final ReadingProgressRepository progressRepository;
    private final ReadingChallengeRepository challengeRepository;
    private final ReadingStreakRepository streakRepository;
    private final ProductRepository productRepository;

    @Transactional
    public ReadingProgressResponse startReading(Long productId, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (progressRepository.existsByUserAndProductId(user, productId)) {
            throw new BadRequestException("Bạn đã bắt đầu đọc sách này rồi");
        }

        ReadingProgress progress = progressRepository.save(ReadingProgress.builder()
                .user(user)
                .product(product)
                .status(ReadingStatus.WANT_TO_READ)
                .totalPages(product.getPageCount())
                .startedAt(LocalDateTime.now())
                .build());

        updateStreak(user);
        log.info("User {} started reading {}", user.getEmail(), product.getName());
        return mapToResponse(progress);
    }

    @Transactional
    public ReadingProgressResponse updateProgress(Long progressId, int currentPage, User user) {
        ReadingProgress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("ReadingProgress", "id", progressId));

        if (!progress.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền cập nhật tiến độ này");
        }

        progress.updateProgress(currentPage);
        progressRepository.save(progress);

        if (progress.getStatus() == ReadingStatus.FINISHED) {
            updateStreak(user);
            updateChallenge(user);
        }

        return mapToResponse(progress);
    }

    @Transactional
    public ReadingProgressResponse finishBook(Long progressId, Integer rating, String review, User user) {
        ReadingProgress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("ReadingProgress", "id", progressId));

        if (!progress.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Bạn không có quyền cập nhật");
        }

        progress.setStatus(ReadingStatus.FINISHED);
        progress.setFinishedAt(LocalDateTime.now());
        progress.setRating(rating);
        progress.setReview(review);
        if (progress.getTotalPages() != null) {
            progress.setCurrentPage(progress.getTotalPages());
            progress.setProgressPercent(100);
        }
        progressRepository.save(progress);

        updateStreak(user);
        updateChallenge(user);
        log.info("User {} finished reading {}", user.getEmail(), progress.getProduct().getName());
        return mapToResponse(progress);
    }

    @Transactional(readOnly = true)
    public List<ReadingProgressResponse> getUserProgress(User user) {
        return progressRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReadingStatsResponse getUserStats(User user) {
        long total = progressRepository.count();
        long wantToRead = progressRepository.countByUserAndStatus(user, ReadingStatus.WANT_TO_READ);
        long reading = progressRepository.countByUserAndStatus(user, ReadingStatus.READING);
        long finished = progressRepository.countByUserAndStatus(user, ReadingStatus.FINISHED);

        ReadingStreak streak = streakRepository.findByUser(user).orElse(null);
        ReadingStreakInfo streakInfo = null;
        if (streak != null) {
            streakInfo = ReadingStreakInfo.builder()
                    .currentStreak(streak.getCurrentStreak())
                    .longestStreak(streak.getLongestStreak())
                    .totalReadingDays(streak.getTotalReadingDays())
                    .lastReadDate(streak.getLastReadDate())
                    .build();
        }

        ReadingChallenge challenge = challengeRepository.findByUserAndYear(user, LocalDateTime.now().getYear()).orElse(null);
        ChallengeInfo challengeInfo = null;
        if (challenge != null) {
            int percent = challenge.getTargetBooks() > 0 ?
                    (int) ((challenge.getCompletedBooks() * 100.0) / challenge.getTargetBooks()) : 0;
            challengeInfo = ChallengeInfo.builder()
                    .targetBooks(challenge.getTargetBooks())
                    .completedBooks(challenge.getCompletedBooks())
                    .year(challenge.getYear())
                    .isCompleted(challenge.getIsCompleted())
                    .progressPercent(percent)
                    .build();
        }

        return ReadingStatsResponse.builder()
                .totalBooks(total)
                .wantToRead(wantToRead)
                .currentlyReading(reading)
                .finishedBooks(finished)
                .streak(streakInfo)
                .challenge(challengeInfo)
                .build();
    }

    private void updateStreak(User user) {
        ReadingStreak streak = streakRepository.findByUser(user)
                .orElse(ReadingStreak.builder().user(user).currentStreak(0).longestStreak(0).totalReadingDays(0).build());

        LocalDate today = LocalDate.now();
        if (streak.getLastReadDate() == null) {
            streak.setCurrentStreak(1);
            streak.setTotalReadingDays(1);
        } else if (streak.getLastReadDate().equals(today.minusDays(1))) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            streak.setTotalReadingDays(streak.getTotalReadingDays() + 1);
        } else if (!streak.getLastReadDate().equals(today)) {
            streak.setCurrentStreak(1);
        }

        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }
        streak.setLastReadDate(today);
        streakRepository.save(streak);
    }

    private void updateChallenge(User user) {
        int year = LocalDateTime.now().getYear();
        ReadingChallenge challenge = challengeRepository.findByUserAndYear(user, year)
                .orElse(ReadingChallenge.builder()
                        .user(user).year(year).targetBooks(12).completedBooks(0).build());

        challenge.setCompletedBooks((int) progressRepository.countByUserAndStatus(user, ReadingStatus.FINISHED));
        if (challenge.getCompletedBooks() >= challenge.getTargetBooks()) {
            challenge.setIsCompleted(true);
            challenge.setFinishedAt(LocalDateTime.now());
        }
        challengeRepository.save(challenge);
    }

    private ReadingProgressResponse mapToResponse(ReadingProgress rp) {
        Product p = rp.getProduct();
        return ReadingProgressResponse.builder()
                .id(rp.getId()).productId(p.getId()).productName(p.getName())
                .productAuthor(p.getAuthor()).productImage(p.getImageUrl())
                .status(rp.getStatus()).currentPage(rp.getCurrentPage())
                .totalPages(rp.getTotalPages()).progressPercent(rp.getProgressPercent())
                .startedAt(rp.getStartedAt()).finishedAt(rp.getFinishedAt())
                .rating(rp.getRating()).review(rp.getReview())
                .createdAt(rp.getCreatedAt())
                .build();
    }
}
