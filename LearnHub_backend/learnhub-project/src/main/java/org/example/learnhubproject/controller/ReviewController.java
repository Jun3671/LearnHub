package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.ReviewLog;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.service.ReviewService;
import org.example.learnhubproject.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "복습 관리 API")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @GetMapping("/today")
    @Operation(summary = "오늘 복습할 북마크 조회", description = "에빙하우스 망각곡선 기반으로 오늘 복습해야 할 북마크를 조회합니다")
    public ResponseEntity<List<ReviewService.ReviewDue>> getTodayReviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<ReviewService.ReviewDue> reviews = reviewService.getTodayReviews(user.getId());
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/complete/{bookmarkId}")
    @Operation(summary = "복습 완료 처리", description = "북마크 복습을 완료하고 다음 복습 일정을 계산합니다")
    public ResponseEntity<ReviewLog> completeReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookmarkId) {
        User user = userService.findByEmail(userDetails.getUsername());
        ReviewLog reviewLog = reviewService.completeReview(bookmarkId, user.getId());
        return ResponseEntity.ok(reviewLog);
    }

    @GetMapping("/stats")
    @Operation(summary = "복습 통계 조회", description = "사용자의 복습 통계(오늘 예정, 이번 주 완료, 연속 일수 등)를 조회합니다")
    public ResponseEntity<ReviewService.ReviewStats> getReviewStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        ReviewService.ReviewStats stats = reviewService.getReviewStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/all")
    @Operation(summary = "모든 복습 로그 조회", description = "사용자의 모든 복습 로그를 조회합니다")
    public ResponseEntity<List<ReviewLog>> getAllReviewLogs(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<ReviewLog> logs = reviewService.getAllReviewLogs(user.getId());
        return ResponseEntity.ok(logs);
    }
}
