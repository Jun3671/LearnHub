package org.example.learnhubproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ReviewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookmark_id", nullable = false)
    private Bookmark bookmark;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "next_review_at")
    private LocalDateTime nextReviewAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        // 첫 복습 스케줄 설정 (북마크 생성 후 1일)
        if (this.nextReviewAt == null && this.bookmark != null) {
            this.nextReviewAt = this.bookmark.getCreatedAt().plusDays(1);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 복습 완료 처리 및 다음 복습 일정 계산
     */
    public void completeReview() {
        this.lastReviewedAt = LocalDateTime.now();
        this.reviewCount++;
        this.nextReviewAt = calculateNextReviewDate();
    }

    /**
     * 에빙하우스 망각곡선 기반 다음 복습 일정 계산
     * 복습 횟수에 따라: 1일, 3일, 7일, 14일, 30일
     */
    private LocalDateTime calculateNextReviewDate() {
        int[] intervals = {1, 3, 7, 14, 30};

        if (reviewCount >= intervals.length) {
            // 마지막 간격 이후는 30일 주기 유지
            return LocalDateTime.now().plusDays(30);
        }

        return LocalDateTime.now().plusDays(intervals[reviewCount]);
    }

    /**
     * 오늘 복습해야 하는지 확인
     */
    public boolean isDueToday() {
        if (nextReviewAt == null) {
            return false;
        }
        return !nextReviewAt.toLocalDate().isAfter(LocalDateTime.now().toLocalDate());
    }
}
