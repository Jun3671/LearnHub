package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.Category;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.service.CategoryService;
import org.example.learnhubproject.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "카테고리 관리 API")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "카테고리 생성", description = "새로운 카테고리를 생성합니다")
    public ResponseEntity<Category> createCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String name) {
        // JWT에서 추출한 email(username)로 User 조회
        User user = userService.findByEmail(userDetails.getUsername());
        Category category = categoryService.create(user.getId(), name);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/{id}")
    @Operation(summary = "카테고리 조회", description = "ID로 카테고리를 조회합니다")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        Category category = categoryService.findById(id);
        return ResponseEntity.ok(category);
    }

    @GetMapping
    @Operation(summary = "내 카테고리 조회", description = "현재 로그인한 사용자의 모든 카테고리를 조회합니다")
    public ResponseEntity<List<Category>> getMyCategories(
            @AuthenticationPrincipal UserDetails userDetails) {
        // JWT에서 추출한 email(username)로 User 조회
        User user = userService.findByEmail(userDetails.getUsername());
        List<Category> categories = categoryService.findByUserId(user.getId());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "사용자별 카테고리 조회", description = "특정 사용자의 모든 카테고리를 조회합니다")
    public ResponseEntity<List<Category>> getCategoriesByUser(@PathVariable Long userId) {
        List<Category> categories = categoryService.findByUserId(userId);
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    @Operation(summary = "카테고리 수정", description = "카테고리명을 수정합니다")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestParam String name) {
        Category category = categoryService.update(id, name);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "카테고리 삭제", description = "카테고리를 삭제합니다")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}