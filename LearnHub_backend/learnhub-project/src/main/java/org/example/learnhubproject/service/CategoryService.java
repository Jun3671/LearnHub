package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.Category;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserService userService;

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
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + id));
    }

    public List<Category> findByUserId(Long userId) {
        return categoryRepository.findByUserId(userId);
    }

    @Transactional
    public Category update(Long id, String name) {
        Category category = findById(id);

        if (categoryRepository.existsByUserIdAndName(category.getUser().getId(), name)) {
            throw new IllegalArgumentException("이미 존재하는 카테고리명입니다: " + name);
        }

        category.setName(name);
        return category;
    }

    @Transactional
    public void delete(Long id) {
        Category category = findById(id);
        categoryRepository.delete(category);
    }
}
