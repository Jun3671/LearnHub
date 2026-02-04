package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.*;
import org.example.learnhubproject.exception.ResourceNotFoundException;
import org.example.learnhubproject.repository.BookmarkRepository;
import org.example.learnhubproject.repository.BookmarkTagRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional
    public Bookmark create(Long userId, Long categoryId, String url, String title,
                          String description, String thumbnailUrl, List<String> tagNames) {
        User user = userService.findById(userId);
        Category category = categoryService.findById(categoryId);

        // 북마크 생성
        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .category(category)
                .url(url)
                .title(title)
                .description(description)
                .s3ThumbnailUrl(thumbnailUrl)
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
    public Bookmark update(Long id, Long userId, String url, String title, String description, String thumbnailUrl, Long categoryId) {
        Bookmark bookmark = findById(id);
        validateOwnership(bookmark, userId);

        if (url != null) bookmark.setUrl(url);
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
