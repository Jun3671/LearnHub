package org.example.learnhubproject.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.learnhubproject.dto.AnalysisResultDTO;
import org.example.learnhubproject.entity.Category;
import org.example.learnhubproject.repository.CategoryRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIAnalysisService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public AnalysisResultDTO analyzeUrl(String url) throws IOException {
        log.info("URL 분석 시작: {}", url);

        // 1. 웹페이지 스크래핑
        String htmlContent = scrapeWebpage(url);

        // 2. AI로 분석
        String aiResponse = analyzeWithAI(htmlContent, url);

        // 3. 응답 파싱
        AnalysisResultDTO result = parseAIResponse(aiResponse);

        log.info("URL 분석 완료: {}", url);
        return result;
    }

    private String scrapeWebpage(String url) throws IOException {
        log.debug("웹페이지 스크래핑 시작: {}", url);

        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .timeout(10000)
                .get();

        // 메타 태그 추출
        String title = doc.title();
        String description = doc.select("meta[name=description]").attr("content");
        String keywords = doc.select("meta[name=keywords]").attr("content");

        // 본문 텍스트 추출 (처음 1000자)
        String bodyText = doc.body().text();
        if (bodyText.length() > 1000) {
            bodyText = bodyText.substring(0, 1000);
        }

        // AI에 전달할 컨텍스트 생성
        String content = String.format(
                "Title: %s\nDescription: %s\nKeywords: %s\nContent: %s",
                title, description, keywords, bodyText
        );

        log.debug("웹페이지 스크래핑 완료: {} chars", content.length());
        return content;
    }

    private String analyzeWithAI(String content, String url) {
        log.debug("AI 분석 시작");

        // API 키 확인 (보안을 위해 일부만 표시)
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.error("Gemini API 키가 설정되지 않았습니다!");
            throw new RuntimeException("Gemini API 키가 설정되지 않았습니다.");
        }
        String maskedKey = geminiApiKey.substring(0, Math.min(10, geminiApiKey.length())) + "...";
        log.debug("Gemini API 키 확인: {}", maskedKey);

        // 카테고리 목록 가져오기
        List<Category> categories = categoryRepository.findAll();
        String categoryList = categories.stream()
                .map(c -> c.getId() + ": " + c.getName())
                .collect(Collectors.joining(", "));

        // AI 프롬프트 생성
        String prompt = String.format("""
                다음 웹페이지 정보를 분석하여 JSON 형식으로 결과를 반환해주세요.

                웹페이지 정보:
                %s

                URL: %s

                사용 가능한 카테고리:
                %s

                다음 형식의 JSON으로 응답해주세요:
                {
                  "title": "웹페이지의 핵심 제목 (50자 이내)",
                  "description": "웹페이지 내용을 2-3문장으로 요약",
                  "tags": ["관련된", "태그", "3-5개"],
                  "suggestedCategory": 카테고리_ID
                }

                주의사항:
                - 제목은 명확하고 간결하게
                - 설명은 핵심 내용을 담아서
                - 태그는 기술 스택이나 주제 중심으로
                - 카테고리는 위의 목록에서 가장 적합한 것을 선택
                - 반드시 JSON 형식으로만 응답하고, 다른 설명은 포함하지 마세요
                """, content, url, categoryList);

        try {
            // Gemini API 요청 본문 생성
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content1 = new HashMap<>();
            content1.put("parts", List.of(part));

            requestBody.put("contents", List.of(content1));

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", geminiApiKey);  // API 키를 헤더로 전달

            // HTTP 엔티티 생성
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // API 호출
            ResponseEntity<String> response = restTemplate.exchange(
                    GEMINI_API_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            // 응답 파싱
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String responseText = rootNode
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

            log.debug("AI 분석 완료: {} chars", responseText.length());
            return responseText;

        } catch (Exception e) {
            log.error("AI 분석 실패", e);
            throw new RuntimeException("AI 분석 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    private AnalysisResultDTO parseAIResponse(String aiResponse) {
        try {
            log.debug("AI 응답 파싱 시작");

            // JSON 추출 (응답에서 JSON 부분만 추출)
            String jsonResponse = extractJson(aiResponse);

            // JSON 파싱
            AnalysisResultDTO result = objectMapper.readValue(jsonResponse, AnalysisResultDTO.class);

            log.debug("AI 응답 파싱 완료");
            return result;
        } catch (Exception e) {
            log.error("AI 응답 파싱 실패: {}", aiResponse, e);
            throw new RuntimeException("AI 응답 파싱 실패: " + e.getMessage());
        }
    }

    private String extractJson(String response) {
        // JSON 부분만 추출 ({}로 감싸진 부분)
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');

        if (start == -1 || end == -1) {
            return response;
        }

        return response.substring(start, end + 1);
    }
}
