package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.learnhubproject.entity.*;
import org.example.learnhubproject.exception.ResourceNotFoundException;
import org.example.learnhubproject.repository.BookmarkRepository;
import org.example.learnhubproject.repository.BookmarkTagRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final BookmarkTagRepository bookmarkTagRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final TagService tagService;

    /**
     * 북마크 소유권 검증
     */
    private void validateOwnership(Bookmark bookmark, Long userId) {
        if (!bookmark.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("접근 권한이 없습니다");
        }
    }

    /**
     * URL에서 OG 태그 파싱
     */
    private OgMetadata parseOgTags(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(5000)
                    .get();

            String ogImage = doc.select("meta[property=og:image]").attr("content");
            String ogTitle = doc.select("meta[property=og:title]").attr("content");
            String ogDescription = doc.select("meta[property=og:description]").attr("content");

            // OG 태그가 없으면 일반 메타 태그에서 가져오기
            if (ogTitle.isEmpty()) {
                ogTitle = doc.select("meta[name=title]").attr("content");
                if (ogTitle.isEmpty()) {
                    ogTitle = doc.title();
                }
            }

            if (ogDescription.isEmpty()) {
                ogDescription = doc.select("meta[name=description]").attr("content");
            }

            return new OgMetadata(
                    ogImage.isEmpty() ? null : ogImage,
                    ogTitle.isEmpty() ? null : ogTitle,
                    ogDescription.isEmpty() ? null : ogDescription
            );
        } catch (Exception e) {
            log.warn("OG 태그 파싱 실패: {}", url, e);
            return new OgMetadata(null, null, null);
        }
    }

    /**
     * OG 메타데이터를 담는 내부 클래스
     */
    private record OgMetadata(String imageUrl, String title, String description) {
    }

    @Transactional
    public Bookmark create(Long userId, Long categoryId, String url, String title,
                          String description, String thumbnailUrl, List<String> tagNames) {
        User user = userService.findById(userId);
        Category category = categoryService.findById(categoryId);

        // URL에서 OG 태그 파싱
        OgMetadata ogMetadata = parseOgTags(url);

        // 북마크 생성
        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .category(category)
                .url(url)
                .title(title)
                .description(description)
                .s3ThumbnailUrl(thumbnailUrl)
                .imageUrl(ogMetadata.imageUrl())
                .metaTitle(ogMetadata.title())
                .metaDescription(ogMetadata.description())
                .build();

        bookmark = bookmarkRepository.save(bookmark);

        // 태그 추가
        if (tagNames != null && !tagNames.isEmpty()) {
            for (String tagName : tagNames) {
                Tag tag = tagService.findOrCreate(tagName);
                BookmarkTag bookmarkTag = BookmarkTag.builder()
                        .bookmark(bookmark)
                        .tag(tag)
                        .build();
                bookmarkTagRepository.save(bookmarkTag);
            }
        }

        return bookmark;
    }

    public Bookmark findById(Long id) {
        return bookmarkRepository.findByIdWithTags(id)
                .orElseThrow(() -> new ResourceNotFoundException("북마크", "id", id));
    }

    /**
     * 북마크 조회 (권한 검증 포함)
     */
    public Bookmark findByIdWithAuth(Long id, Long userId) {
        Bookmark bookmark = findById(id);
        validateOwnership(bookmark, userId);
        return bookmark;
    }

    public List<Bookmark> findByUserId(Long userId) {
        return bookmarkRepository.findByUserIdWithTags(userId);
    }

    /**
     * 사용자의 북마크 조회 (정렬 옵션 포함)
     * @param userId 사용자 ID
     * @param sort 정렬 기준 (latest: 최신순, oldest: 오래된순, title: 제목순)
     */
    public List<Bookmark> findByUserIdSorted(Long userId, String sort) {
        // 유효하지 않은 정렬 옵션은 기본값(latest)으로 처리
        if (!List.of("latest", "oldest", "title").contains(sort)) {
            sort = "latest";
        }
        return bookmarkRepository.findByUserIdWithTagsSorted(userId, sort);
    }

    public List<Bookmark> findByCategoryId(Long categoryId) {
        return bookmarkRepository.findByCategoryId(categoryId);
    }

    public List<Bookmark> findByUserIdAndCategoryId(Long userId, Long categoryId) {
        return bookmarkRepository.findByUserIdAndCategoryIdWithTags(userId, categoryId);
    }

    public List<Bookmark> searchByKeyword(Long userId, String keyword) {
        // #태그 검색 시 # 제거 (예: #Spring -> Spring)
        if (keyword.startsWith("#")) {
            keyword = keyword.substring(1);
        }

        // 빈 문자열 체크
        if (keyword.trim().isEmpty()) {
            return findByUserId(userId);
        }

        // SQL 특수문자 이스케이프 처리
        String escapedKeyword = keyword
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return bookmarkRepository.searchByKeywordWithTags(userId, escapedKeyword);
    }

    public List<Bookmark> findByTagId(Long userId, Long tagId) {
        List<BookmarkTag> bookmarkTags = bookmarkTagRepository.findByUserIdAndTagId(userId, tagId);
        return bookmarkTags.stream()
                .map(BookmarkTag::getBookmark)
                .collect(Collectors.toList());
    }

    @Transactional
    public Bookmark update(Long id, Long userId, String url, String title, String description,
                          String thumbnailUrl, String imageUrl, String metaTitle,
                          String metaDescription, Long categoryId, Boolean reanalyze) {
        Bookmark bookmark = findById(id);
        validateOwnership(bookmark, userId);

        boolean urlChanged = false;
        if (url != null && !url.equals(bookmark.getUrl())) {
            bookmark.setUrl(url);
            urlChanged = true;
        }

        // URL이 변경되었거나 reanalyze가 true이면 OG 태그 다시 파싱
        if (urlChanged || (reanalyze != null && reanalyze)) {
            OgMetadata ogMetadata = parseOgTags(bookmark.getUrl());
            bookmark.setImageUrl(ogMetadata.imageUrl());
            bookmark.setMetaTitle(ogMetadata.title());
            bookmark.setMetaDescription(ogMetadata.description());
        } else {
            // 수동으로 지정된 값이 있으면 우선 적용
            if (imageUrl != null) bookmark.setImageUrl(imageUrl);
            if (metaTitle != null) bookmark.setMetaTitle(metaTitle);
            if (metaDescription != null) bookmark.setMetaDescription(metaDescription);
        }

        if (title != null) bookmark.setTitle(title);
        if (description != null) bookmark.setDescription(description);
        if (thumbnailUrl != null) bookmark.setS3ThumbnailUrl(thumbnailUrl);
        if (categoryId != null) {
            Category category = categoryService.findById(categoryId);
            // 카테고리 소유권도 검증
            categoryService.validateOwnership(category, userId);
            bookmark.setCategory(category);
        }

        return bookmark;
    }

    @Transactional
    public void addTag(Long bookmarkId, Long userId, String tagName) {
        Bookmark bookmark = findById(bookmarkId);
        validateOwnership(bookmark, userId);

        Tag tag = tagService.findOrCreate(tagName);

        // 중복 태그 체크
        boolean exists = bookmarkTagRepository.existsByBookmarkIdAndTagId(bookmarkId, tag.getId());
        if (exists) {
            throw new IllegalArgumentException("이미 추가된 태그입니다");
        }

        BookmarkTag bookmarkTag = BookmarkTag.builder()
                .bookmark(bookmark)
                .tag(tag)
                .build();

        bookmarkTagRepository.save(bookmarkTag);
    }

    @Transactional
    public void removeTag(Long bookmarkId, Long userId, Long tagId) {
        Bookmark bookmark = findById(bookmarkId);
        validateOwnership(bookmark, userId);
        bookmarkTagRepository.deleteByBookmarkIdAndTagId(bookmarkId, tagId);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Bookmark bookmark = findById(id);
        validateOwnership(bookmark, userId);
        bookmarkRepository.delete(bookmark);
    }
}
