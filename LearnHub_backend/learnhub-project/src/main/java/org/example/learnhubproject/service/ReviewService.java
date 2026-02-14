package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.learnhubproject.entity.Bookmark;
import org.example.learnhubproject.entity.ReviewLog;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.repository.BookmarkRepository;
import org.example.learnhubproject.repository.ReviewLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewService {

    private final ReviewLogRepository reviewLogRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserService userService;

    /**
     * 북마크 생성 시 복습 로그 초기화
     */
    public ReviewLog initializeReviewLog(Bookmark bookmark, User user) {
        // 이미 존재하는지 확인
        if (reviewLogRepository.existsByBookmarkIdAndUserId(bookmark.getId(), user.getId())) {
            log.debug("ReviewLog already exists for bookmark {} and user {}", bookmark.getId(), user.getId());
            return reviewLogRepository.findByBookmarkIdAndUserId(bookmark.getId(), user.getId())
                    .orElseThrow();
        }

        ReviewLog reviewLog = ReviewLog.builder()
                .bookmark(bookmark)
                .user(user)
                .reviewCount(0)
                .nextReviewAt(bookmark.getCreatedAt().plusDays(1))
                .build();

        reviewLog = reviewLogRepository.save(reviewLog);
        log.info("Initialized review log for bookmark {}", bookmark.getId());
        return reviewLog;
    }

    /**
     * 오늘 복습해야 할 북마크 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewDue> getTodayReviews(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<ReviewLog> dueReviews = reviewLogRepository.findDueReviews(userId, now);

        return dueReviews.stream()
                .map(reviewLog -> new ReviewDue(
                        reviewLog.getBookmark(),
                        reviewLog.getReviewCount(),
                        reviewLog.getNextReviewAt(),
                        reviewLog.getLastReviewedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 복습 완료 처리
     */
    public ReviewLog completeReview(Long bookmarkId, Long userId) {
        ReviewLog reviewLog = reviewLogRepository.findByBookmarkIdAndUserId(bookmarkId, userId)
                .orElseThrow(() -> new RuntimeException("복습 로그를 찾을 수 없습니다"));

        reviewLog.completeReview();
        reviewLog = reviewLogRepository.save(reviewLog);

        log.info("Review completed for bookmark {} by user {}. Next review: {}",
                bookmarkId, userId, reviewLog.getNextReviewAt());

        return reviewLog;
    }

    /**
     * 복습 통계 조회
     */
    @Transactional(readOnly = true)
    public ReviewStats getReviewStats(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime weekEnd = now;

        // 이번 주 복습 완료 수
        Long weekCompleted = reviewLogRepository.countReviewedBetween(userId, weekStart, weekEnd);

        // 오늘 예정된 복습 수
        Long todayDue = reviewLogRepository.countDueReviews(userId, now);

        // 전체 복습 로그
        List<ReviewLog> allReviews = reviewLogRepository.findByUserId(userId);

        // 연속 복습 일수 계산
        int consecutiveDays = calculateConsecutiveDays(userId);

        // 총 복습 완료 수
        long totalCompleted = allReviews.stream()
                .mapToInt(ReviewLog::getReviewCount)
                .sum();

        return new ReviewStats(
                todayDue,
                weekCompleted,
                totalCompleted,
                consecutiveDays,
                allReviews.size()
        );
    }

    /**
     * 연속 복습 일수 계산
     */
    private int calculateConsecutiveDays(Long userId) {
        LocalDate today = LocalDate.now();
        int consecutiveDays = 0;

        for (int i = 0; i < 365; i++) {
            LocalDate checkDate = today.minusDays(i);
            LocalDateTime startOfDay = checkDate.atStartOfDay();
            LocalDateTime endOfDay = checkDate.plusDays(1).atStartOfDay();

            Long reviewCount = reviewLogRepository.countReviewedBetween(userId, startOfDay, endOfDay);

            if (reviewCount > 0) {
                consecutiveDays++;
            } else if (i > 0) {
                // 오늘이 아닌데 복습이 없으면 연속 끊김
                break;
            }
        }

        return consecutiveDays;
    }

    /**
     * 사용자의 모든 복습 로그 조회
     */
    @Transactional(readOnly = true)
    public List<ReviewLog> getAllReviewLogs(Long userId) {
        return reviewLogRepository.findByUserId(userId);
    }

    /**
     * 복습 예정 북마크 DTO
     */
    public record ReviewDue(
            Bookmark bookmark,
            Integer reviewCount,
            LocalDateTime nextReviewAt,
            LocalDateTime lastReviewedAt
    ) {}

    /**
     * 복습 통계 DTO
     */
    public record ReviewStats(
            Long todayDue,
            Long weekCompleted,
            Long totalCompleted,
            Integer consecutiveDays,
            Integer totalBookmarks
    ) {}
}
