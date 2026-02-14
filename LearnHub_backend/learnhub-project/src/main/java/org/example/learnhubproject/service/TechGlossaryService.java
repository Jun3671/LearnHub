package org.example.learnhubproject.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.learnhubproject.entity.TechTerm;
import org.example.learnhubproject.repository.TechTermRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TechGlossaryService {

    private final TechTermRepository techTermRepository;
    private final AIAnalysisService aiAnalysisService;

    /**
     * 기술 용어 정의 조회 (캐시 우선, 없으면 AI 생성)
     */
    public String getTermDefinition(String termName) {
        log.info("기술 용어 정의 조회: {}", termName);

        // 1차: DB에서 캐시된 정의 조회
        Optional<TechTerm> cached = techTermRepository.findByNameIgnoreCase(termName);
        if (cached.isPresent()) {
            log.debug("캐시된 정의 사용: {}", termName);
            return cached.get().getDefinition();
        }

        // 2차: AI에게 정의 요청
        log.debug("AI로 정의 생성: {}", termName);
        String definition = aiAnalysisService.generateTermDefinition(termName);

        // 3차: DB에 캐싱
        TechTerm techTerm = TechTerm.builder()
                .name(termName)
                .definition(definition)
                .category(inferCategory(termName))
                .build();
        techTermRepository.save(techTerm);

        log.info("기술 용어 정의 생성 및 캐싱 완료: {}", termName);
        return definition;
    }

    /**
     * 텍스트에서 기술 용어 추출 및 정의 조회
     */
    public List<TechTermInfo> extractAndDefineTerms(String text) {
        log.info("텍스트에서 기술 용어 추출 시작");

        // AI로 기술 용어 추출
        List<String> terms = aiAnalysisService.extractTechTerms(text);

        // 각 용어의 정의 조회
        List<TechTermInfo> termInfos = terms.stream()
                .map(term -> {
                    String definition = getTermDefinition(term);
                    return new TechTermInfo(term, definition);
                })
                .toList();

        log.info("기술 용어 추출 및 정의 조회 완료: {} 개", termInfos.size());
        return termInfos;
    }

    /**
     * 모든 기술 용어 조회
     */
    @Transactional(readOnly = true)
    public List<TechTerm> getAllTerms() {
        return techTermRepository.findAll();
    }

    /**
     * ID로 기술 용어 조회
     */
    @Transactional(readOnly = true)
    public TechTerm getTermById(Long id) {
        return techTermRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("기술 용어를 찾을 수 없습니다: " + id));
    }

    /**
     * 기술 용어 수동 추가
     */
    public TechTerm addTerm(String name, String definition, String category) {
        // 중복 체크
        if (techTermRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("이미 존재하는 기술 용어입니다: " + name);
        }

        TechTerm techTerm = TechTerm.builder()
                .name(name)
                .definition(definition)
                .category(category)
                .build();

        return techTermRepository.save(techTerm);
    }

    /**
     * 기술 용어 수정
     */
    public TechTerm updateTerm(Long id, String definition, String category) {
        TechTerm techTerm = getTermById(id);
        techTerm.setDefinition(definition);
        techTerm.setCategory(category);
        return techTermRepository.save(techTerm);
    }

    /**
     * 기술 용어 삭제
     */
    public void deleteTerm(Long id) {
        techTermRepository.deleteById(id);
    }

    /**
     * 용어 이름으로부터 카테고리 추론 (간단한 휴리스틱)
     */
    private String inferCategory(String termName) {
        String lower = termName.toLowerCase();

        if (lower.contains("spring") || lower.contains("boot") || lower.contains("react") ||
            lower.contains("vue") || lower.contains("angular") || lower.contains("django")) {
            return "Framework";
        } else if (lower.contains("sql") || lower.contains("database") || lower.contains("redis") ||
                   lower.contains("mongodb") || lower.contains("mysql") || lower.contains("postgres")) {
            return "Database";
        } else if (lower.contains("java") || lower.contains("python") || lower.contains("javascript") ||
                   lower.contains("typescript") || lower.contains("kotlin")) {
            return "Language";
        } else if (lower.contains("docker") || lower.contains("kubernetes") || lower.contains("jenkins") ||
                   lower.contains("git") || lower.contains("aws") || lower.contains("gcp")) {
            return "Tool";
        } else if (lower.contains("jwt") || lower.contains("oauth") || lower.contains("rest") ||
                   lower.contains("api") || lower.contains("microservice")) {
            return "Concept";
        }

        return "Other";
    }

    /**
     * 기술 용어 정보 DTO
     */
    public record TechTermInfo(String name, String definition) {}
}