# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 프로젝트 개요

LearnHub는 Java 17로 구축된 Spring Boot 4.0.0 백엔드 애플리케이션으로, 학습 관리 플랫폼으로 설계되었습니다. 이 프로젝트는 데이터 영속성을 위해 MySQL을 사용하고, 인증/권한 부여를 위해 Spring Security를, 데이터베이스 작업을 위해 Spring Data JPA를 사용합니다.

## 기술 스택

- **프레임워크**: Spring Boot 4.0.0
- **Java 버전**: 17
- **빌드 도구**: Gradle (Gradle Wrapper 포함)
- **데이터베이스**: MySQL
- **주요 의존성**:
  - Spring Data JPA
  - Spring Security
  - Spring Web MVC
  - Lombok (보일러플레이트 코드 감소)

## 주요 명령어

### 빌드 및 실행
```bash
# 프로젝트 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun

# 빌드 아티팩트 정리
./gradlew clean

# 테스트 없이 빌드
./gradlew build -x test
```

### 테스트
```bash
# 모든 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests org.example.learnhubproject.SpecificTestClass

# 상세 출력과 함께 테스트 실행
./gradlew test --info

# 지속적으로 테스트 실행 (변경 시 재실행)
./gradlew test --continuous
```

### 개발
```bash
# 의존성 업데이트 확인
./gradlew dependencyUpdates

# 프로젝트 리포트 생성
./gradlew build --scan
```

## 프로젝트 구조

```
src/
├── main/
│   ├── java/org/example/learnhubproject/
│   │   └── LearnhubProjectApplication.java (메인 진입점)
│   └── resources/
│       └── application.properties (설정 파일)
└── test/
    └── java/org/example/learnhubproject/
        └── LearnhubProjectApplicationTests.java
```

## 아키텍처 참고사항

### 패키지 구조
베이스 패키지는 `org.example.learnhubproject`입니다. 새로운 컴포넌트를 추가할 때는 표준 Spring Boot 계층형 아키텍처를 따르세요:
- **Controller 계층**: REST 엔드포인트 및 요청 처리
- **Service 계층**: 비즈니스 로직
- **Repository 계층**: 데이터 접근 (JPA 리포지토리)
- **Entity/Model 계층**: JPA 엔티티 및 도메인 모델
- **DTO 계층**: API 계약을 위한 데이터 전송 객체
- **Config**: 설정 클래스 (보안, 데이터베이스 등)

### 데이터베이스 설정
MySQL이 데이터베이스로 설정되어 있습니다. 연결 정보는 `application.properties`에 지정해야 합니다:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/learnhub?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=chlwnsgur1!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.show-sql=true
```

### 보안
Spring Security가 포함되어 있습니다. 인증 구현 시:
- 보안 설정은 전용 `@Configuration` 클래스에 정의해야 합니다
- 최신 Spring Security 설정을 위해 `SecurityFilterChain` 빈을 사용하세요 (Spring Boot 4.0)
- 프로젝트 요구사항에 따라 JWT 또는 세션 기반 인증을 고려하세요

### Lombok 사용
Lombok은 어노테이션 프로세싱을 통해 활성화되어 있습니다. 보일러플레이트를 줄이기 위해 Lombok 어노테이션을 사용하세요:
- `@Data`, `@Getter`, `@Setter`: POJO용
- `@Builder`: 빌더 패턴용
- `@NoArgsConstructor`, `@AllArgsConstructor`: 생성자용
- `@Slf4j`: 로깅용

## 개발 워크플로우

1. **새 엔티티 추가**: 적절한 어노테이션(`@Entity`, `@Table`, `@Id` 등)과 함께 JPA 엔티티 클래스 생성
2. **리포지토리 생성**: 기본 CRUD 작업을 위해 `JpaRepository<Entity, ID>` 확장
3. **비즈니스 로직**: `@Service`로 어노테이션된 서비스 클래스에서 구현
4. **REST 엔드포인트**: `@RestController`와 적절한 HTTP 메서드 매핑으로 컨트롤러 클래스 생성
5. **테스팅**: 서비스용 단위 테스트, 리포지토리용 통합 테스트, 컨트롤러용 웹 계층 테스트 작성

## Git 브랜치 전략

**중요: 절대 main 브랜치에 직접 커밋하지 마세요**

- 새로운 기능이나 버그 수정 작업 시 항상 새로운 브랜치를 생성하세요
- 브랜치 명명 규칙: `feature/기능명`, `bugfix/버그명`, `hotfix/긴급수정명`
- 작업 완료 후 Pull Request를 생성하여 main 브랜치에 병합하세요
- main 브랜치는 항상 배포 가능한 상태를 유지해야 합니다

```bash
# 새 기능 브랜치 생성 예시
git checkout -b feature/user-authentication

# 작업 후 커밋
git add .
git commit -m "feat: 사용자 인증 기능 추가"

# 원격 브랜치에 푸시
git push origin feature/user-authentication
```

## Windows 개발 참고사항

이 프로젝트는 Windows 환경에서 개발되고 있습니다. Gradle 명령어 사용 시:
- Windows 명령 프롬프트에서는 `gradlew.bat` 사용: `gradlew.bat build`
- Git Bash나 WSL에서는 `./gradlew` 사용: `./gradlew build`
- Java 17 JDK가 설치되어 있고 JAVA_HOME이 올바르게 설정되어 있는지 확인하세요
