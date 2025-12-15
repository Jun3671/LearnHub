package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.dto.AnalysisResultDTO;
import org.example.learnhubproject.dto.UrlAnalysisRequest;
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

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmark", description = "북마크 관리 API")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final UserService userService;
    private final AIAnalysisService aiAnalysisService;

    @PostMapping
    @Operation(summary = "북마크 생성", description = "새로운 북마크를 생성합니다 (태그 포함)")
    public ResponseEntity<Bookmark> createBookmark(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long categoryId,
            @RequestParam String url,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) List<String> tags) {
        // JWT에서 추출한 email(username)로 User 조회
        User user = userService.findByEmail(userDetails.getUsername());
        Bookmark bookmark = bookmarkService.create(user.getId(), categoryId, url, title, description, thumbnailUrl, tags);
        return ResponseEntity.ok(bookmark);
    }

    @GetMapping
    @Operation(summary = "내 북마크 조회", description = "현재 로그인한 사용자의 모든 북마크를 조회합니다")
    public ResponseEntity<List<Bookmark>> getMyBookmarks(@AuthenticationPrincipal UserDetails userDetails) {
        // JWT에서 추출한 email(username)로 User 조회
        User user = userService.findByEmail(userDetails.getUsername());
        List<Bookmark> bookmarks = bookmarkService.findByUserId(user.getId());
        return ResponseEntity.ok(bookmarks);
    }

    @GetMapping("/{id}")
    @Operation(summary = "북마크 조회", description = "ID로 북마크를 조회합니다")
    public ResponseEntity<Bookmark> getBookmark(@PathVariable Long id) {
        Bookmark bookmark = bookmarkService.findById(id);
        return ResponseEntity.ok(bookmark);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "카테고리별 북마크 조회", description = "특정 카테고리의 모든 북마크를 조회합니다")
    public ResponseEntity<List<Bookmark>> getBookmarksByCategory(@PathVariable Long categoryId) {
        List<Bookmark> bookmarks = bookmarkService.findByCategoryId(categoryId);
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
            @PathVariable Long id,
            @RequestParam(required = false) String url,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String thumbnailUrl,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "false") Boolean reanalyze) {

        // AI 재분석이 요청되고 URL이 제공된 경우
        if (Boolean.TRUE.equals(reanalyze) && url != null && !url.isEmpty()) {
            try {
                AnalysisResultDTO analysisResult = aiAnalysisService.analyzeUrl(url);

                // AI 분석 결과를 우선 사용 (사용자가 직접 입력한 값이 있으면 그것을 우선)
                String finalTitle = (title != null && !title.isEmpty()) ? title : analysisResult.getTitle();
                String finalDescription = (description != null && !description.isEmpty()) ? description : analysisResult.getDescription();

                Bookmark bookmark = bookmarkService.update(id, url, finalTitle, finalDescription, thumbnailUrl, categoryId);

                // AI가 제안한 태그 추가
                if (analysisResult.getTags() != null && !analysisResult.getTags().isEmpty()) {
                    for (String tagName : analysisResult.getTags()) {
                        try {
                            bookmarkService.addTag(id, tagName);
                        } catch (Exception e) {
                            // 태그 추가 실패는 무시 (중복 태그 등)
                        }
                    }
                }

                return ResponseEntity.ok(bookmark);
            } catch (Exception e) {
                throw new RuntimeException("AI 재분석 중 오류가 발생했습니다: " + e.getMessage());
            }
        }

        // 일반 수정
        Bookmark bookmark = bookmarkService.update(id, url, title, description, thumbnailUrl, categoryId);
        return ResponseEntity.ok(bookmark);
    }

    @PostMapping("/{id}/tags")
    @Operation(summary = "북마크에 태그 추가", description = "북마크에 새로운 태그를 추가합니다")
    public ResponseEntity<Void> addTag(
            @PathVariable Long id,
            @RequestParam String tagName) {
        bookmarkService.addTag(id, tagName);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{bookmarkId}/tags/{tagId}")
    @Operation(summary = "북마크에서 태그 제거", description = "북마크에서 특정 태그를 제거합니다")
    public ResponseEntity<Void> removeTag(
            @PathVariable Long bookmarkId,
            @PathVariable Long tagId) {
        bookmarkService.removeTag(bookmarkId, tagId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "북마크 삭제", description = "북마크를 삭제합니다")
    public ResponseEntity<Void> deleteBookmark(@PathVariable Long id) {
        bookmarkService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/analyze")
    @Operation(summary = "URL 분석", description = "AI를 활용하여 URL의 콘텐츠를 분석하고 메타데이터를 추출합니다")
    public ResponseEntity<AnalysisResultDTO> analyzeUrl(@RequestBody UrlAnalysisRequest request) {
        try {
            AnalysisResultDTO result = aiAnalysisService.analyzeUrl(request.getUrl());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("URL 분석 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}