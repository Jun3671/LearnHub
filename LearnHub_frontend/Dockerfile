# 멀티 스테이지 빌드: 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json 복사 (캐시 활용)
COPY package*.json ./

# 의존성 설치
RUN npm ci --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# 런타임 스테이지: Nginx
FROM nginx:alpine

# Nginx 설정 파일 복사 (SPA 라우팅 지원)
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 커스텀 설정 (React Router 지원)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
