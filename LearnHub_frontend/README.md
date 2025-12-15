# LearnHub 프론트엔드

> 개발자 학습 자료 큐레이션 북마크 서비스

## 📋 프로젝트 소개

LearnHub는 개발자들이 학습 자료를 효율적으로 관리하고 정리할 수 있는 북마크 서비스입니다.
Raindrop과 Linkwarden에서 영감을 받은 미니멀한 디자인으로 제작되었습니다.

## 🎨 주요 특징

- **미니멀한 디자인**: 깔끔하고 직관적인 UI/UX
- **카테고리 관리**: 북마크를 카테고리별로 분류
- **태그 시스템**: 태그를 통한 효율적인 검색
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **JWT 인증**: 안전한 사용자 인증 시스템

## 🛠️ 기술 스택

- **React** 19.2.0 - UI 라이브러리
- **React Router** 7.9.6 - 클라이언트 라우팅
- **Axios** 1.13.2 - HTTP 클라이언트
- **Tailwind CSS** 3.4.1 - 스타일링
- **Create React App** - 프로젝트 설정

## 📦 설치 방법

### 1. 저장소 클론

```bash
git clone https://github.com/Jun3671/LearnHub_frontend.git
cd LearnHub_frontend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 설정

백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.
다른 포트를 사용하는 경우 `src/services/api.js` 파일에서 `API_BASE_URL`을 수정하세요.

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### 4. 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── components/           # 재사용 가능한 컴포넌트
│   └── BookmarkCard.js  # 북마크 카드 컴포넌트
├── pages/               # 페이지 컴포넌트
│   ├── Login.js        # 로그인 페이지
│   ├── Register.js     # 회원가입 페이지
│   └── Dashboard.js    # 메인 대시보드
├── services/            # API 서비스
│   └── api.js          # Axios 설정 및 API 함수
├── App.js              # 메인 앱 컴포넌트 (라우팅)
└── index.js            # 엔트리 포인트
```

## 🎯 주요 기능

### 1. 인증
- 회원가입
- 로그인
- JWT 토큰 기반 인증

### 2. 북마크 관리
- 북마크 목록 조회
- 북마크 생성/수정/삭제
- 검색 기능
- 카테고리별 필터링

### 3. 카테고리 관리
- 카테고리 생성
- 카테고리별 북마크 그룹화

### 4. 태그
- 태그 기반 분류
- 북마크당 다중 태그 지원

## 🚀 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 파일은 `build` 폴더에 생성됩니다.

## 🔗 관련 저장소

- 백엔드: [LearnHub_backend](https://github.com/Jun3671/LearnHub_backend)

## 📝 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

## 👨‍💻 개발자

Jun3671

---

**Made with ❤️ using React and Tailwind CSS**
