package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tag", description = "태그 관리 API")
public class TagController {

    private final TagService tagService;

    @PostMapping
    @Operation(summary = "태그 생성", description = "새로운 태그를 생성합니다")
    public ResponseEntity<org.example.learnhubproject.entity.Tag> createTag(@RequestParam String name) {
        org.example.learnhubproject.entity.Tag tag = tagService.create(name);
        return ResponseEntity.ok(tag);
    }

    @GetMapping
    @Operation(summary = "전체 태그 조회", description = "모든 태그를 조회합니다")
    public ResponseEntity<List<org.example.learnhubproject.entity.Tag>> getAllTags() {
        List<org.example.learnhubproject.entity.Tag> tags = tagService.findAll();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/popular")
    @Operation(summary = "인기 태그 조회", description = "사용 빈도가 높은 태그를 조회합니다 (최대 20개)")
    public ResponseEntity<List<org.example.learnhubproject.entity.Tag>> getPopularTags(
            @RequestParam(defaultValue = "20") int limit) {
        List<org.example.learnhubproject.entity.Tag> tags = tagService.findTopPopularTags(limit);
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/{id}")
    @Operation(summary = "태그 조회", description = "ID로 태그를 조회합니다")
    public ResponseEntity<org.example.learnhubproject.entity.Tag> getTag(@PathVariable Long id) {
        org.example.learnhubproject.entity.Tag tag = tagService.findById(id);
        return ResponseEntity.ok(tag);
    }

    @GetMapping("/name")
    @Operation(summary = "이름으로 태그 조회", description = "태그 이름으로 조회합니다")
    public ResponseEntity<org.example.learnhubproject.entity.Tag> getTagByName(@RequestParam String name) {
        org.example.learnhubproject.entity.Tag tag = tagService.findByName(name);
        return ResponseEntity.ok(tag);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "태그 삭제", description = "태그를 삭제합니다")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}