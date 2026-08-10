# 멀티 스테이지 빌드: 빌드 스테이지
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

# Gradle 캐시 활용을 위해 먼저 의존성 파일만 복사
COPY LearnHub_backend/learnhub-project/build.gradle LearnHub_backend/learnhub-project/settings.gradle ./
COPY LearnHub_backend/learnhub-project/gradle ./gradle
COPY LearnHub_backend/learnhub-project/gradlew ./

# 의존성 다운로드 (캐시 레이어)
RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon || true

# 소스 코드 복사
COPY LearnHub_backend/learnhub-project/src ./src

# 애플리케이션 빌드 (테스트 제외)
RUN ./gradlew bootJar -x test --no-daemon

# 런타임 스테이지
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# 헬스체크용 curl 설치
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# 빌드 스테이지에서 생성된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 애플리케이션 실행을 위한 사용자 생성 (보안)
RUN useradd -m -s /bin/bash appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]