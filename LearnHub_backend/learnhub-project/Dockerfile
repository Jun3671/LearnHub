# 멀티 스테이지 빌드: 빌드 스테이지
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app

# Gradle 캐시 활용을 위해 먼저 의존성 파일만 복사
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./

# 의존성 다운로드 (캐시 레이어)
RUN ./gradlew dependencies --no-daemon || true

RUN chmod +x ./gradlew
# 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드 (테스트 제외)
RUN ./gradlew bootJar -x test --no-daemon

# 런타임 스테이지
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# 빌드 스테이지에서 생성된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 애플리케이션 실행을 위한 사용자 생성 (보안)
RUN useradd -m -s /bin/bash appuser && \
    chown -R appuser:appuser /app

USER appuser

# 애플리케이션 포트 노출 (Spring Boot 기본 포트)
EXPOSE 8080

# 환경 변수 설정 (docker-compose에서 오버라이드 가능)
ENV SPRING_PROFILES_ACTIVE=prod

# 헬스체크 (선택사항)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom","-Dspring.jpa.hibernate.ddl-auto=update", "-jar", "app.jar"]
