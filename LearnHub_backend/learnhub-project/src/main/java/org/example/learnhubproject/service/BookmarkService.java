package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.*;
import org.example.learnhubproject.repository.BookmarkRepository;
import org.example.learnhubproject.repository.BookmarkTagRepository;
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
        return bookmarkRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("북마크를 찾을 수 없습니다: " + id));
    }

    public List<Bookmark> findByUserId(Long userId) {
        return bookmarkRepository.findByUserId(userId);
    }

    public List<Bookmark> findByCategoryId(Long categoryId) {
        return bookmarkRepository.findByCategoryId(categoryId);
    }

    public List<Bookmark> findByUserIdAndCategoryId(Long userId, Long categoryId) {
        return bookmarkRepository.findByUserIdAndCategoryId(userId, categoryId);
    }

    public List<Bookmark> searchByKeyword(Long userId, String keyword) {
        return bookmarkRepository.searchByKeyword(userId, keyword);
    }

    public List<Bookmark> findByTagId(Long userId, Long tagId) {
        List<BookmarkTag> bookmarkTags = bookmarkTagRepository.findByUserIdAndTagId(userId, tagId);
        return bookmarkTags.stream()
                .map(BookmarkTag::getBookmark)
                .collect(Collectors.toList());
    }

    @Transactional
    public Bookmark update(Long id, String url, String title, String description, String thumbnailUrl, Long categoryId) {
        Bookmark bookmark = findById(id);

        if (url != null) bookmark.setUrl(url);
        if (title != null) bookmark.setTitle(title);
        if (description != null) bookmark.setDescription(description);
        if (thumbnailUrl != null) bookmark.setS3ThumbnailUrl(thumbnailUrl);
        if (categoryId != null) {
            Category category = categoryService.findById(categoryId);
            bookmark.setCategory(category);
        }

        return bookmark;
    }

    @Transactional
    public void addTag(Long bookmarkId, String tagName) {
        Bookmark bookmark = findById(bookmarkId);
        Tag tag = tagService.findOrCreate(tagName);

        BookmarkTag bookmarkTag = BookmarkTag.builder()
                .bookmark(bookmark)
                .tag(tag)
                .build();

        bookmarkTagRepository.save(bookmarkTag);
    }

    @Transactional
    public void removeTag(Long bookmarkId, Long tagId) {
        bookmarkTagRepository.deleteByBookmarkIdAndTagId(bookmarkId, tagId);
    }

    @Transactional
    public void delete(Long id) {
        Bookmark bookmark = findById(id);
        bookmarkRepository.delete(bookmark);
    }
}
