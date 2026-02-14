package org.example.learnhubproject.repository;

import org.example.learnhubproject.entity.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {

    Optional<ReviewLog> findByBookmarkIdAndUserId(Long bookmarkId, Long userId);

    List<ReviewLog> findByUserId(Long userId);

    @Query("SELECT rl FROM ReviewLog rl WHERE rl.user.id = :userId AND rl.nextReviewAt <= :date ORDER BY rl.nextReviewAt ASC")
    List<ReviewLog> findDueReviews(@Param("userId") Long userId, @Param("date") LocalDateTime date);

    @Query("SELECT COUNT(rl) FROM ReviewLog rl WHERE rl.user.id = :userId AND rl.nextReviewAt <= :date")
    Long countDueReviews(@Param("userId") Long userId, @Param("date") LocalDateTime date);

    @Query("SELECT rl FROM ReviewLog rl WHERE rl.user.id = :userId AND rl.lastReviewedAt >= :startDate AND rl.lastReviewedAt < :endDate")
    List<ReviewLog> findReviewedBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(rl) FROM ReviewLog rl WHERE rl.user.id = :userId AND rl.lastReviewedAt >= :startDate AND rl.lastReviewedAt < :endDate")
    Long countReviewedBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    boolean existsByBookmarkIdAndUserId(Long bookmarkId, Long userId);
}
