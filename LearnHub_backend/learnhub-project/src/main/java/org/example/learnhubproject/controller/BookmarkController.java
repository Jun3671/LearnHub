package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.dto.*;
import org.example.learnhubproject.entity.Bookmark;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.service.AIAnalysisService;
import org.example.learnhubproject.service.BookmarkService;
import org.example.learnhubproject.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmark", description = "북마크 관리 API")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final UserService userService;
    private final AIAnalysisService aiAnalysisService;
    private final Validator validator;

    @PostMapping
    @Operation(summary = "북마크 생성", description = "새로운 북마크를 생성합니다 (JSON 또는 Query Parameters)")
    public ResponseEntity<Bookmark> createBookmark(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) BookmarkCreateRequest requestBody,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String url,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) List<String> tags) {

        User user = userService.findByEmail(userDetails.getUsername());

        // Request Body가 있으면 JSON 방식, 없으면 Query Parameters 방식
        BookmarkCreateRequest request;
        if (requestBody != null && requestBody.getCategoryId() != null) {
            request = requestBody;
        } else {
            // Query Parameters를 DTO로 변환
            request = BookmarkCreateRequest.builder()
                    .categoryId(categoryId)
                    .url(url)
                    .title(title)
                    .description(description)
                    .thumbnailUrl(thumbnailUrl)
                    .tags(tags)
                    .build();

            // 수동 검증
            var violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String errorMessage = violations.stream()
                        .map(v -> v.getMessage())
                        .collect(Collectors.joining(", "));
                throw new IllegalArgumentException(errorMessage);
            }
        }

        Bookmark bookmark = bookmarkService.create(
                user.getId(),
                request.getCategoryId(),
                request.getUrl(),
                request.getTitle(),
                request.getDescription(),
                request.getThumbnailUrl(),
                request.getTags()
        );
        return ResponseEntity.ok(bookmark);
    }

    @PostMapping("/form")
    @Operation(summary = "북마크 생성 (Form)", description = "새로운 북마크를 생성합니다 (Query Parameters 방식 - 기존 호환성)")
    public ResponseEntity<Bookmark> createBookmarkForm(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long categoryId,
            @RequestParam String url,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) List<String> tags) {

        // DTO로 변환하여 검증
        BookmarkCreateRequest request = BookmarkCreateRequest.builder()
                .categoryId(categoryId)
                .url(url)
                .title(title)
                .description(description)
                .thumbnailUrl(thumbnailUrl)
                .tags(tags)
                .build();

        // 검증 수행
        var violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(v -> v.getMessage())
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException(errorMessage);
        }

        User user = userService.findByEmail(userDetails.getUsername());
        Bookmark bookmark = bookmarkService.create(
                user.getId(),
                categoryId,
                url,
                title,
                description,
                thumbnailUrl,
                tags
        );
        return ResponseEntity.ok(bookmark);
    }

    @GetMapping
    @Operation(summary = "내 북마크 조회", description = "현재 로그인한 사용자의 모든 북마크를 조회합니다. sort 파라미터로 정렬 가능 (latest: 최신순, oldest: 오래된순, title: 제목순)")
    public ResponseEntity<List<Bookmark>> getMyBookmarks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false, defaultValue = "latest") String sort) {
        // JWT에서 추출한 email(username)로 User 조회
        User user = userService.findByEmail(userDetails.getUsername());
        List<Bookmark> bookmarks = bookmarkService.findByUserIdSorted(user.getId(), sort);
        return ResponseEntity.ok(bookmarks);
    }

    @GetMapping("/{id}")
    @Operation(summary = "북마크 조회", description = "ID로 북마크를 조회합니다")
    public ResponseEntity<Bookmark> getBookmark(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.findByEmail(userDetails.getUsername());
        Bookmark bookmark = bookmarkService.findByIdWithAuth(id, user.getId());
        return ResponseEntity.ok(bookmark);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "카테고리별 북마크 조회", description = "특정 카테고리의 모든 북마크를 조회합니다")
    public ResponseEntity<List<Bookmark>> getBookmarksByCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long categoryId) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<Bookmark> bookmarks = bookmarkService.findByUserIdAndCategoryId(user.getId(), categoryId);
        return ResponseEntity.ok(bookmarks);
    }

    @GetMapping("/search")
    @Operation(summary = "북마크 검색", description = "제목 또는 설명으로 북마크를 검색합니다")
    public ResponseEntity<List<Bookmark>> searchBookmarks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String keyword) {
        // JWT에서 추출한 email(username)로 User 조회
        User user = userService.findByEmail(userDetails.getUsername());
        List<Bookmark> bookmarks = bookmarkService.searchByKeyword(user.getId(), keyword);
        return ResponseEntity.ok(bookmarks);
    }

    @GetMapping("/tag/{tagId}")
    @Operation(summary = "태그별 북마크 조회", description = "특정 태그가 달린 북마크를 조회합니다")
    public ResponseEntity<List<Bookmark>> getBookmarksByTag(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tagId) {
        // JWT에서 추출한 email(username)로 User 조회
        User user = userService.findByEmail(userDetails.getUsername());
        List<Bookmark> bookmarks = bookmarkService.findByTagId(user.getId(), tagId);
        return ResponseEntity.ok(bookmarks);
    }

    @PutMapping("/{id}")
    @Operation(summary = "북마크 수정", description = "북마크 정보를 수정합니다. reanalyze=true로 설정하면 URL을 AI로 재분석합니다.")
    public ResponseEntity<Bookmark> updateBookmark(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody BookmarkUpdateRequest request) {

        User user = userService.findByEmail(userDetails.getUsername());

        // AI 재분석이 요청되고 URL이 제공된 경우
        if (Boolean.TRUE.equals(request.getReanalyze()) && request.getUrl() != null && !request.getUrl().isEmpty()) {
            try {
                AnalysisResultDTO analysisResult = aiAnalysisService.analyzeUrl(request.getUrl());

                // AI 분석 결과를 우선 사용 (사용자가 직접 입력한 값이 있으면 그것을 우선)
                String finalTitle = (request.getTitle() != null && !request.getTitle().isEmpty())
                        ? request.getTitle() : analysisResult.getTitle();
                String finalDescription = (request.getDescription() != null && !request.getDescription().isEmpty())
                        ? request.getDescription() : analysisResult.getDescription();

                Bookmark bookmark = bookmarkService.update(id, user.getId(), request.getUrl(),
                        finalTitle, finalDescription, request.getThumbnailUrl(),
                        request.getImageUrl(), request.getMetaTitle(), request.getMetaDescription(),
                        request.getCategoryId(), request.getReanalyze());

                // AI가 제안한 태그 추가
                if (analysisResult.getTags() != null && !analysisResult.getTags().isEmpty()) {
                    for (String tagName : analysisResult.getTags()) {
                        try {
                            bookmarkService.addTag(id, user.getId(), tagName);
                        } catch (Exception e) {
                            // 태그 추가 실패는 무시 (중복 태그 등)
                        }
                    }
                }

                return ResponseEntity.ok(bookmark);
            } catch (Exception e) {
                throw new RuntimeException("AI 재분석 중 오류가 발생했습니다");
            }
        }

        // 일반 수정
        Bookmark bookmark = bookmarkService.update(id, user.getId(), request.getUrl(),
                request.getTitle(), request.getDescription(), request.getThumbnailUrl(),
                request.getImageUrl(), request.getMetaTitle(), request.getMetaDescription(),
                request.getCategoryId(), request.getReanalyze());

        // 태그 처리: 기존 태그를 모두 삭제하고 새로운 태그 추가
        if (request.getTags() != null) {
            // 기존 태그 조회 및 삭제
            Bookmark existingBookmark = bookmarkService.findByIdWithAuth(id, user.getId());
            if (existingBookmark.getBookmarkTags() != null) {
                for (var bookmarkTag : existingBookmark.getBookmarkTags()) {
                    try {
                        bookmarkService.removeTag(id, user.getId(), bookmarkTag.getTag().getId());
                    } catch (Exception e) {
                        // 태그 삭제 실패는 무시
                    }
                }
            }

            // 새로운 태그 추가
            for (String tagName : request.getTags()) {
                if (tagName != null && !tagName.trim().isEmpty()) {
                    try {
                        bookmarkService.addTag(id, user.getId(), tagName.trim());
                    } catch (Exception e) {
                        // 태그 추가 실패는 무시 (중복 태그 등)
                    }
                }
            }
        }

        return ResponseEntity.ok(bookmark);
    }

    @PostMapping("/{id}/tags")
    @Operation(summary = "북마크에 태그 추가", description = "북마크에 새로운 태그를 추가합니다")
    public ResponseEntity<Void> addTag(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TagRequest request) {
        User user = userService.findByEmail(userDetails.getUsername());
        bookmarkService.addTag(id, user.getId(), request.getTagName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{bookmarkId}/tags/{tagId}")
    @Operation(summary = "북마크에서 태그 제거", description = "북마크에서 특정 태그를 제거합니다")
    public ResponseEntity<Void> removeTag(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookmarkId,
            @PathVariable Long tagId) {
        User user = userService.findByEmail(userDetails.getUsername());
        bookmarkService.removeTag(bookmarkId, user.getId(), tagId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "북마크 삭제", description = "북마크를 삭제합니다")
    public ResponseEntity<Void> deleteBookmark(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.findByEmail(userDetails.getUsername());
        bookmarkService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/analyze")
    @Operation(summary = "URL 분석", description = "AI를 활용하여 URL의 콘텐츠를 분석하고 메타데이터를 추출합니다")
    public ResponseEntity<AnalysisResultDTO> analyzeUrl(@Valid @RequestBody UrlAnalysisRequest request) {
        try {
            AnalysisResultDTO result = aiAnalysisService.analyzeUrl(request.getUrl());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("URL 분석 중 오류가 발생했습니다");
        }
    }
}