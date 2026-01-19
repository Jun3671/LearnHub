# LearnHub - 개발자를 위한 학습 자료 큐레이션 플랫폼

> 개발 공부 중 찾은 유용한 자료들을 체계적으로 관리하는 북마크 서비스

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-진행중-yellow.svg)](#)

## 📖 프로젝트 소개

개발자가 학습하면서 자주 참고하는 **공식 문서, 기술 블로그, 레퍼런스, 예제 코드** 등을 한 곳에서 효율적으로 관리할 수 있는 서비스입니다.

### 🎯 개발 동기

```
"Spring Security 설명 잘 되어 있던 블로그가 어디였더라?"
"FastAPI 예제 코드 레퍼런스 저장해둔 링크가 어디 있지?"
"이거 예전에 북마크해놨었는데, 어떤 카테고리였지…?"
```

브라우저 기본 북마크는 링크가 많아지면 관리가 어렵고, 태그·메모·검색 기능이 제한적입니다.
**개발자의 학습 패턴에 맞는 전용 북마크 관리 서비스**를 만들고자 프로젝트를 시작했습니다.

---

## ✨ 주요 기능

### 1. 북마크 관리 (CRUD)
- ✅ 학습 자료 URL 저장 (제목, 설명, 썸네일)
- ✅ 카테고리별 분류 (Spring, React, Database 등)
- ✅ 다중 태그 지원 (한 자료에 여러 태그 추가 가능)

### 2. AI 자동 분석 (Google Gemini)
- ✅ URL 입력 시 자동으로 제목/설명 추출
- ✅ 적합한 태그 추천
- ✅ 카테고리 자동 분류

### 3. 통합 검색
- ✅ 키워드 기반 검색 (제목/설명)
- ✅ 카테고리별 필터링
- ✅ 태그별 필터링
- ✅ SQL Injection 방어

### 4. 사용자 인증
- ✅ JWT 기반 인증
- ✅ Spring Security 권한 관리
- ✅ 사용자별 데이터 격리

---

## 🛠 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Spring Boot** | 4.0.0 | 백엔드 프레임워크 |
| **Java** | 17 | 프로그래밍 언어 |
| **Spring Data JPA** | - | ORM, 데이터베이스 추상화 |
| **Spring Security** | - | 인증/인가 |
| **MySQL** | 8.0 | 관계형 데이터베이스 |
| **Gradle** | 9.2.1 | 빌드 도구 |
| **JWT** | 0.12.3 | 토큰 기반 인증 |
| **Jsoup** | 1.17.2 | HTML 파싱 (웹 스크래핑) |
| **Swagger/OpenAPI** | 3.0 | API 문서화 |
| **JUnit 5** | - | 단위 테스트 |
| **H2 Database** | - | 테스트용 인메모리 DB |

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19.2.0 | UI 프레임워크 |
| **React Router DOM** | 7.9.6 | 클라이언트 라우팅 |
| **Tailwind CSS** | 3.4.1 | CSS 프레임워크 |
| **Axios** | 1.13.2 | HTTP 클라이언트 |

### External API
- **Google Gemini API** (2.5 Flash): AI 기반 URL 분석

---

## 🏗 아키텍처

### Backend Architecture
```
Controller (REST API)
    ↓
Service (비즈니스 로직)
    ↓
Repository (JPA)
    ↓
MySQL Database
```

### Database ERD
```
User (1) ──────────────────────── (n) Category
  │ (1)                              │ (n)
  │                                  └─ Bookmarks
  │                                      │ (n)
  └──────────── (n) Bookmark ────────────┼──────────── (n) Tag
                                          │
                                          └─── (n) BookmarkTag (junction)
```

### API 흐름
```
Frontend (React)
    ↓ HTTP + JWT
Backend (Spring Boot)
    ↓ JPA
MySQL
    ↑
Google Gemini API (AI 분석)
```

---

## 🚀 시작하기

### 사전 요구사항
- Java 17 이상
- Node.js 20 이상
- MySQL 8.0 이상
- Docker (선택사항)

### 1. Backend 실행

```bash
# 1. 리포지토리 클론
git clone https://github.com/YOUR_USERNAME/LearnHub.git
cd LearnHub/LearnHub_backend/learnhub-project

# 2. 환경 변수 설정 (선택)
export SPRING_DATASOURCE_PASSWORD=your_mysql_password
export GEMINI_API_KEY=your_gemini_api_key

# 3. MySQL 데이터베이스 생성
mysql -u root -p
CREATE DATABASE learnhub;

# 4. 애플리케이션 실행
./gradlew bootRun
```

서버가 `http://localhost:8080`에서 실행됩니다.

**Swagger UI**: http://localhost:8080/swagger-ui.html

### 2. Frontend 실행

```bash
cd LearnHub_frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

---

## 🧪 테스트

### Backend 테스트

```bash
cd LearnHub_backend/learnhub-project

# 전체 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests BookmarkServiceTest

# 테스트 커버리지 리포트 생성 (JaCoCo)
./gradlew test jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

**현재 테스트 현황**:
- ✅ BookmarkServiceTest: 9개 테스트 (PASSED)
- 🚧 CategoryServiceTest: 작업 예정
- 🚧 TagServiceTest: 작업 예정

---

## 📈 성능 최적화

프로젝트 개발 과정에서 수행한 주요 성능 개선 사항입니다.

### 1. N+1 쿼리 문제 해결

**Before**:
```java
// 북마크 100개 조회 시 301번의 쿼리 발생
List<Bookmark> findByUserId(Long userId);
// → 1번: 북마크 조회
// → 100번: 각 북마크의 태그 조회
// → 200번: 각 태그 상세 조회
```

**After**:
```java
@Query("SELECT DISTINCT b FROM Bookmark b " +
       "LEFT JOIN FETCH b.bookmarkTags bt " +  // JOIN FETCH로 한 번에 조회
       "LEFT JOIN FETCH bt.tag " +
       "LEFT JOIN FETCH b.category " +
       "WHERE b.user.id = :userId")
List<Bookmark> findByUserIdWithTags(@Param("userId") Long userId);
// → 1번의 쿼리로 모든 데이터 조회
```

**성능 개선 결과**:
| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| **쿼리 횟수** | 301번 | 1번 | **99.7% ↓** |
| **응답 시간** | 2,500ms | 120ms | **95.2% ↓** |

### 2. 트랜잭션 최적화

```java
@Service
@Transactional(readOnly = true)  // 클래스 레벨: 읽기 전용 트랜잭션
public class BookmarkService {

    // 읽기 메서드는 별도 어노테이션 불필요 (상속)
    public Bookmark findById(Long id) { ... }

    // 쓰기 메서드만 오버라이드
    @Transactional  // readOnly = false
    public Bookmark create(...) { ... }
}
```

**효과**:
- Flush 모드 MANUAL로 설정 → 불필요한 flush 방지
- 더티 체킹 비활성화 → 메모리 절약
- DB 힌트 제공 → DB 레벨 최적화

### 3. SQL Injection 방어

```java
public List<Bookmark> searchByKeyword(Long userId, String keyword) {
    // 특수문자 이스케이프
    String escapedKeyword = keyword
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");

    return bookmarkRepository.searchByKeywordWithTags(userId, escapedKeyword);
}
```

**상세 내용**: [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md)

---

## 📂 프로젝트 구조

```
LearnHub/
├── LearnHub_backend/
│   └── learnhub-project/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/org/example/learnhubproject/
│       │   │   │   ├── controller/     # REST API 엔드포인트
│       │   │   │   ├── service/        # 비즈니스 로직
│       │   │   │   ├── repository/     # JPA Repository
│       │   │   │   ├── entity/         # JPA 엔티티
│       │   │   │   ├── dto/            # DTO 객체
│       │   │   │   ├── security/       # JWT, Spring Security
│       │   │   │   ├── config/         # 설정 클래스
│       │   │   │   └── exception/      # 예외 처리
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       │       └── java/.../service/   # 서비스 계층 테스트
│       ├── build.gradle
│       └── gradlew
│
├── LearnHub_frontend/
│   ├── src/
│   │   ├── components/       # React 컴포넌트
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── services/         # API 호출
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── PERFORMANCE_IMPROVEMENTS.md   # 성능 개선 상세 문서
├── IMPROVEMENT_ROADMAP.md        # 개선 로드맵
└── README.md
```

---

## 🔑 주요 API 엔드포인트

### 인증
```http
POST /api/auth/register   # 회원가입
POST /api/auth/login      # 로그인 (JWT 발급)
```

### 북마크
```http
GET    /api/bookmarks                 # 전체 조회
POST   /api/bookmarks                 # 생성
GET    /api/bookmarks/{id}            # 단일 조회
PUT    /api/bookmarks/{id}            # 수정
DELETE /api/bookmarks/{id}            # 삭제
GET    /api/bookmarks/search?keyword= # 검색
POST   /api/bookmarks/analyze         # AI 분석 (public)
```

### 카테고리
```http
GET    /api/categories     # 전체 조회
POST   /api/categories     # 생성
PUT    /api/categories/{id}  # 수정
DELETE /api/categories/{id}  # 삭제
```

### 태그
```http
GET    /api/tags           # 전체 조회
POST   /api/tags?name=     # 생성
GET    /api/tags/{id}      # 단일 조회
```

**상세 API 문서**: http://localhost:8080/swagger-ui.html

---

## 🎓 학습 내용 & 기술적 고민

### 1. N+1 쿼리 문제 해결
- **문제**: Lazy Loading으로 인한 과도한 쿼리 발생
- **해결**: `LEFT JOIN FETCH`를 사용한 Eager Loading
- **결과**: 301번 → 1번 쿼리 (99.7% 개선)
- **참고**: [BookmarkRepository.java:15-20](./LearnHub_backend/learnhub-project/src/main/java/org/example/learnhubproject/repository/BookmarkRepository.java#L15-L20)

### 2. 영속성 컨텍스트 관리
- **문제**: 테스트에서 `getTags()` 호출 시 빈 리스트 반환
- **원인**: BookmarkTag가 영속성 컨텍스트에 캐시되어 있음
- **해결**: `EntityManager.flush()` + `clear()` 사용
- **참고**: [BookmarkServiceTest.java:89-92](./LearnHub_backend/learnhub-project/src/test/java/org/example/learnhubproject/service/BookmarkServiceTest.java#L89-L92)

### 3. @Transactional 전략
- **선택**: 클래스 레벨 `readOnly=true`, 쓰기 메서드만 오버라이드
- **이유**: 읽기 작업이 80% 이상 → 기본을 readOnly로
- **효과**: 불필요한 flush 방지, 더티 체킹 비활성화

### 4. 테스트 환경 분리
- **개발**: MySQL (Docker)
- **테스트**: H2 인메모리 DB
- **이유**: 테스트 속도 향상, CI/CD 간소화

---

## 📝 향후 개선 계획


### 1주차: 테스트 코드 작성
- [ ] CategoryServiceTest (5개 테스트)
- [ ] TagServiceTest (5개 테스트)
- [ ] Controller 통합 테스트 (MockMvc)
- [ ] 테스트 커버리지 70% 목표

### 2주차: 핵심 기능 개선
- [ ] 통합 검색 (제목 + 설명 + URL + 태그)
- [ ] MySQL Full-text Index 적용
- [ ] Tag 구조 개선 (사용자별 소유권)
- [ ] 대시보드 통계 페이지

### 3주차: 배포 및 최적화
- [o] Docker 컨테이너화
- [o] AWS EC2 배포
- [ ] JMeter 성능 테스트
- [ ] Redis 캐싱 적용

---

## 🤝 기여

개선 아이디어나 버그 리포트는 [Issues](https://github.com/YOUR_USERNAME/LearnHub/issues)에 올려주세요!

---



---

## 👤 Author

**[Choi Jun Hyuk]**
- GitHub: Jun3671(https://github.com/Jun3671)
- Email: wnsgur33787@gmail.com
- Blog: https://velog.io/@jjun3671/posts

---

## 📚 참고 자료

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/index.html)
- [React Documentation](https://react.dev/)
- [JPA Performance Tuning Guide](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#performance)
- [Google Gemini API](https://ai.google.dev/)

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**