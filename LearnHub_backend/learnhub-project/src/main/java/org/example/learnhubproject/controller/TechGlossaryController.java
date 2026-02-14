package org.example.learnhubproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learnhubproject.entity.TechTerm;
import org.example.learnhubproject.service.TechGlossaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tech-glossary")
@RequiredArgsConstructor
@Tag(name = "Tech Glossary", description = "기술 용어 사전 API")
public class TechGlossaryController {

    private final TechGlossaryService techGlossaryService;

    @GetMapping("/term/{name}")
    @Operation(summary = "기술 용어 정의 조회", description = "특정 기술 용어의 정의를 조회합니다. 캐시가 없으면 AI로 생성합니다.")
    public ResponseEntity<Map<String, String>> getTermDefinition(@PathVariable String name) {
        String definition = techGlossaryService.getTermDefinition(name);
        return ResponseEntity.ok(Map.of(
                "name", name,
                "definition", definition
        ));
    }

    @PostMapping("/extract")
    @Operation(summary = "텍스트에서 기술 용어 추출", description = "주어진 텍스트에서 기술 용어를 추출하고 각 용어의 정의를 반환합니다.")
    public ResponseEntity<List<TechGlossaryService.TechTermInfo>> extractTerms(
            @RequestBody Map<String, String> request) {
        String text = request.get("text");
        List<TechGlossaryService.TechTermInfo> terms = techGlossaryService.extractAndDefineTerms(text);
        return ResponseEntity.ok(terms);
    }

    @GetMapping
    @Operation(summary = "전체 기술 용어 조회", description = "저장된 모든 기술 용어를 조회합니다.")
    public ResponseEntity<List<TechTerm>> getAllTerms() {
        List<TechTerm> terms = techGlossaryService.getAllTerms();
        return ResponseEntity.ok(terms);
    }

    @GetMapping("/{id}")
    @Operation(summary = "ID로 기술 용어 조회", description = "ID로 특정 기술 용어를 조회합니다.")
    public ResponseEntity<TechTerm> getTermById(@PathVariable Long id) {
        TechTerm term = techGlossaryService.getTermById(id);
        return ResponseEntity.ok(term);
    }

    @PostMapping
    @Operation(summary = "기술 용어 수동 추가", description = "새로운 기술 용어를 수동으로 추가합니다.")
    public ResponseEntity<TechTerm> addTerm(@RequestBody TechTermRequest request) {
        TechTerm term = techGlossaryService.addTerm(
                request.name(),
                request.definition(),
                request.category()
        );
        return ResponseEntity.ok(term);
    }

    @PutMapping("/{id}")
    @Operation(summary = "기술 용어 수정", description = "기존 기술 용어의 정의를 수정합니다.")
    public ResponseEntity<TechTerm> updateTerm(
            @PathVariable Long id,
            @RequestBody TechTermRequest request) {
        TechTerm term = techGlossaryService.updateTerm(
                id,
                request.definition(),
                request.category()
        );
        return ResponseEntity.ok(term);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "기술 용어 삭제", description = "기술 용어를 삭제합니다.")
    public ResponseEntity<Void> deleteTerm(@PathVariable Long id) {
        techGlossaryService.deleteTerm(id);
        return ResponseEntity.noContent().build();
    }

    public record TechTermRequest(String name, String definition, String category) {}
}