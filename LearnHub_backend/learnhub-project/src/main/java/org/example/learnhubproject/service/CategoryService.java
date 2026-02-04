package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.Bookmark;
import org.example.learnhubproject.entity.Category;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.exception.ResourceNotFoundException;
import org.example.learnhubproject.repository.BookmarkRepository;
import org.example.learnhubproject.repository.CategoryRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserService userService;

    /**
     * 카테고리 소유권 검증
     */
    public void validateOwnership(Category category, Long userId) {
        if (!category.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("접근 권한이 없습니다");
        }
    }

    @Transactional
    public Category create(Long userId, String name) {
        User user = userService.findById(userId);

        if (categoryRepository.existsByUserIdAndName(userId, name)) {
            throw new IllegalArgumentException("이미 존재하는 카테고리명입니다: " + name);
        }

        Category category = Category.builder()
                .name(name)
                .user(user)
                .build();

        return categoryRepository.save(category);
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("카테고리", "id", id));
    }

    /**
     * 카테고리 조회 (권한 검증 포함)
     */
    public Category findByIdWithAuth(Long id, Long userId) {
        Category category = findById(id);
        validateOwnership(category, userId);
        return category;
    }

    public List<Category> findByUserId(Long userId) {
        return categoryRepository.findByUserId(userId);
    }

    @Transactional
    public Category update(Long id, Long userId, String name) {
        Category category = findById(id);
        validateOwnership(category, userId);

        if (categoryRepository.existsByUserIdAndName(category.getUser().getId(), name)) {
            throw new IllegalArgumentException("이미 존재하는 카테고리명입니다: " + name);
        }

        category.setName(name);
        return category;
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Category category = findById(id);
        validateOwnership(category, userId);

        // 기본 카테고리는 삭제 불가
        if (Boolean.TRUE.equals(category.getIsDefault())) {
            throw new IllegalArgumentException("기본 카테고리는 삭제할 수 없습니다");
        }

        // 카테고리에 속한 북마크를 기본 카테고리로 이동 (없으면 자동 생성)
        Category defaultCategory = categoryRepository
                .findByUserIdAndIsDefault(userId, true)
                .orElseGet(() -> {
                    // 기본 카테고리가 없으면 자동 생성
                    User user = userService.findById(userId);
                    Category newDefault = Category.builder()
                            .name("미분류")
                            .isDefault(true)
                            .user(user)
                            .build();
                    return categoryRepository.save(newDefault);
                });

        List<Bookmark> bookmarks = bookmarkRepository.findByCategoryId(id);
        for (Bookmark bookmark : bookmarks) {
            bookmark.setCategory(defaultCategory);
        }

        // 카테고리 삭제
        categoryRepository.delete(category);
    }
}
