package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.dto.CategoryRequest;
import org.example.learnhubproject.entity.Category;
import org.example.learnhubproject.entity.User;
import org.example.learnhubproject.service.CategoryService;
import org.example.learnhubproject.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "카테고리 관리 API")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserService userService;
    private final Validator validator;

    @PostMapping
    @Operation(summary = "카테고리 생성", description = "새로운 카테고리를 생성합니다 (JSON 또는 Query Parameters)")
    public ResponseEntity<Category> createCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) CategoryRequest requestBody,
            @RequestParam(required = false) String name) {

        User user = userService.findByEmail(userDetails.getUsername());

        // Request Body가 있으면 JSON 방식, 없으면 Query Parameters 방식
        CategoryRequest request;
        if (requestBody != null && requestBody.getName() != null) {
            request = requestBody;
        } else {
            request = CategoryRequest.builder()
                    .name(name)
                    .build();

            var violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String errorMessage = violations.stream()
                        .map(v -> v.getMessage())
                        .collect(Collectors.joining(", "));
                throw new IllegalArgumentException(errorMessage);
            }
        }

        Category category = categoryService.create(user.getId(), request.getName());
        return ResponseEntity.ok(category);
    }

    @PostMapping("/form")
    @Operation(summary = "카테고리 생성 (Form)", description = "새로운 카테고리를 생성합니다 (Query Parameters 방식 - 기존 호환성)")
    public ResponseEntity<Category> createCategoryForm(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String name) {

        CategoryRequest request = CategoryRequest.builder()
                .name(name)
                .build();

        var violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(v -> v.getMessage())
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException(errorMessage);
        }

        User user = userService.findByEmail(userDetails.getUsername());
        Category category = categoryService.create(user.getId(), name);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/{id}")
    @Operation(summary = "카테고리 조회", description = "ID로 카테고리를 조회합니다")
    public ResponseEntity<Category> getCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.findByEmail(userDetails.getUsername());
        Category category = categoryService.findByIdWithAuth(id, user.getId());
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

    @PutMapping("/{id}")
    @Operation(summary = "카테고리 수정", description = "카테고리명을 수정합니다")
    public ResponseEntity<Category> updateCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        User user = userService.findByEmail(userDetails.getUsername());
        Category category = categoryService.update(id, user.getId(), request.getName());
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "카테고리 삭제", description = "카테고리를 삭제합니다")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.findByEmail(userDetails.getUsername());
        categoryService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}