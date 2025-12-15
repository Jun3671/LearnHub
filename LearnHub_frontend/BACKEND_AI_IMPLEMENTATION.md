# AI URL 분석 백엔드 구현 가이드

## 개요
사용자가 북마크 추가 시 URL을 입력하면, AI가 자동으로 웹페이지의 콘텐츠를 분석하여 제목, 설명, 태그, 카테고리를 추천하는 기능입니다.

## API 엔드포인트

### POST `/api/bookmarks/analyze`

**요청 (Request)**
```json
{
  "url": "https://example.com/article"
}
```

**응답 (Response)**
```json
{
  "title": "React Hooks 완벽 가이드",
  "description": "React Hooks의 기본 개념부터 고급 패턴까지 상세하게 설명합니다. useState, useEffect, useContext 등 주요 훅의 사용법을 예제와 함께 소개합니다.",
  "tags": ["React", "Hooks", "JavaScript", "Frontend"],
  "suggestedCategory": 2
}
```

## 구현 단계

### 1. 의존성 추가 (pom.xml)

```xml
<!-- Jsoup: HTML 파싱 -->
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.17.2</version>
</dependency>

<!-- OpenAI API 또는 Spring AI -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.0.0-M3</version>
</dependency>

<!-- 또는 직접 OpenAI API 사용시 -->
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>service</artifactId>
    <version>0.18.2</version>
</dependency>
```

### 2. Controller 구현

```java
@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private AIAnalysisService aiAnalysisService;

    /**
     * URL 분석 API
     * AI를 활용하여 URL의 콘텐츠를 분석하고 메타데이터를 추출합니다.
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResultDTO> analyzeUrl(@RequestBody UrlAnalysisRequest request) {
        try {
            AnalysisResultDTO result = aiAnalysisService.analyzeUrl(request.getUrl());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("URL 분석 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
```

### 3. DTO 클래스

```java
// 요청 DTO
public class UrlAnalysisRequest {
    private String url;

    // getter, setter
}

// 응답 DTO
public class AnalysisResultDTO {
    private String title;
    private String description;
    private List<String> tags;
    private Long suggestedCategory;

    // constructor, getter, setter
}
```

### 4. AI 분석 서비스 구현

```java
@Service
public class AIAnalysisService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * URL 콘텐츠를 AI로 분석
     */
    public AnalysisResultDTO analyzeUrl(String url) throws IOException {
        // 1. 웹페이지 스크래핑
        String htmlContent = scrapeWebpage(url);

        // 2. AI로 분석
        String aiResponse = analyzeWithAI(htmlContent, url);

        // 3. 응답 파싱
        return parseAIResponse(aiResponse);
    }

    /**
     * Jsoup을 사용한 웹페이지 스크래핑
     */
    private String scrapeWebpage(String url) throws IOException {
        Document doc = Jsoup.connect(url)
            .userAgent("Mozilla/5.0")
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
        return String.format(
            "Title: %s\nDescription: %s\nKeywords: %s\nContent: %s",
            title, description, keywords, bodyText
        );
    }

    /**
     * OpenAI API를 사용한 AI 분석
     */
    private String analyzeWithAI(String content, String url) {
        // OpenAI 클라이언트 생성
        OpenAiService service = new OpenAiService(openaiApiKey);

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
            """, content, url, categoryList);

        // ChatGPT API 호출
        CompletionRequest completionRequest = CompletionRequest.builder()
            .model("gpt-4o-mini") // 또는 "gpt-4"
            .prompt(prompt)
            .maxTokens(500)
            .temperature(0.7)
            .build();

        CompletionResult result = service.createCompletion(completionRequest);
        return result.getChoices().get(0).getText();
    }

    /**
     * AI 응답을 DTO로 파싱
     */
    private AnalysisResultDTO parseAIResponse(String aiResponse) {
        try {
            // JSON 파싱 (Jackson ObjectMapper 사용)
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(aiResponse, AnalysisResultDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("AI 응답 파싱 실패: " + e.getMessage());
        }
    }
}
```

### 5. application.yml 설정

```yaml
openai:
  api:
    key: ${OPENAI_API_KEY}  # 환경변수로 관리

# 또는
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      model: gpt-4o-mini
```

## Spring AI 사용 (권장)

Spring AI를 사용하면 더 간편하게 구현할 수 있습니다:

```java
@Service
public class AIAnalysisService {

    private final ChatClient chatClient;

    public AIAnalysisService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public AnalysisResultDTO analyzeUrl(String url) throws IOException {
        String content = scrapeWebpage(url);

        String prompt = createPrompt(content, url);

        String response = chatClient.prompt()
            .user(prompt)
            .call()
            .content();

        return parseAIResponse(response);
    }
}
```

## 테스트

```java
@SpringBootTest
class AIAnalysisServiceTest {

    @Autowired
    private AIAnalysisService aiAnalysisService;

    @Test
    void testAnalyzeUrl() throws IOException {
        String testUrl = "https://react.dev/learn";

        AnalysisResultDTO result = aiAnalysisService.analyzeUrl(testUrl);

        assertNotNull(result.getTitle());
        assertNotNull(result.getDescription());
        assertFalse(result.getTags().isEmpty());
        assertNotNull(result.getSuggestedCategory());
    }
}
```

## 보안 고려사항

1. **Rate Limiting**: AI API 호출 제한 (사용자당 하루 N회)
2. **URL 검증**: 악성 URL 차단
3. **Timeout 설정**: 웹 스크래핑 타임아웃
4. **API Key 보안**: 환경변수 또는 Secret Manager 사용

```java
@Component
public class RateLimiter {
    private final Map<Long, Integer> userRequestCount = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_DAY = 50;

    public boolean allowRequest(Long userId) {
        int count = userRequestCount.getOrDefault(userId, 0);
        if (count >= MAX_REQUESTS_PER_DAY) {
            return false;
        }
        userRequestCount.put(userId, count + 1);
        return true;
    }
}
```

## 비용 최적화

- **gpt-4o-mini** 사용 (저렴하고 빠름)
- 캐싱: 같은 URL은 24시간 내 재분석 안 함
- 배치 처리: 여러 URL을 한 번에 분석

```java
@Cacheable(value = "urlAnalysis", key = "#url")
public AnalysisResultDTO analyzeUrl(String url) {
    // ...
}
```

## 프론트엔드 연동 확인

프론트엔드에서 이미 구현 완료:
- ✅ API 엔드포인트 연결 (`bookmarkAPI.analyzeUrl()`)
- ✅ AI 분석 버튼 UI
- ✅ 로딩 상태 표시
- ✅ 분석 결과 자동 채우기

백엔드만 구현하면 바로 동작합니다!
