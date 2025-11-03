---
description: 프로젝트 분석 및 AGENT.md 생성
argument-hint: 없음
---

# 프로젝트 초기화

새 프로젝트에 진입했을 때 프로젝트를 분석하고 해당 프로젝트에 맞는 AGENT.md를 생성합니다.

## 작동 방식

### 1단계: 프로젝트 구조 분석

```bash
# 프로젝트 루트 파일 확인
ls -la

# 패키지 매니저 확인
cat package.json 2>/dev/null || cat requirements.txt 2>/dev/null || cat Cargo.toml 2>/dev/null
```

**분석 항목:**
- 프로젝트 유형 (React, Vue, NestJS, Next.js, Python 등)
- 사용 프레임워크 및 라이브러리
- 빌드 도구 (Vite, Webpack, esbuild 등)
- 패키지 매니저 (npm, yarn, pnpm, bun)
- 테스트 프레임워크 (Jest, Vitest, Playwright)
- 린터/포매터 (ESLint, Prettier, Biome)

### 2단계: 디렉토리 구조 파악

```bash
# 주요 디렉토리 확인
find . -maxdepth 2 -type d | grep -E "(src|lib|pages|components|api|server)"

# 설정 파일 확인
ls -la | grep -E "(config|rc|\\.json|\\.js)"
```

**확인 사항:**
- 소스 코드 위치
- 컴포넌트 구조
- API 라우트 구조
- 타입 정의 위치
- 스타일 관리 방식

### 3단계: 주요 파일 읽기

```typescript
// 프로젝트별로 중요 파일 읽기
- tsconfig.json / jsconfig.json
- vite.config.ts / next.config.js
- tailwind.config.js (있는 경우)
- .eslintrc.js / .prettierrc
- README.md (프로젝트 설명)
```

### 4단계: AGENT.md 생성

프로젝트 루트에 `.claude/AGENT.md` 생성:

```markdown
# [프로젝트명] - 개발 가이드

## 프로젝트 개요
- 타입: [React SPA / Next.js / NestJS API / Vue App 등]
- 패키지 매니저: [npm / yarn / pnpm / bun]
- 주요 프레임워크: [리스트]

## 디렉토리 구조
```
src/
  ├── components/    # React 컴포넌트
  ├── pages/         # 페이지
  ├── hooks/         # 커스텀 훅
  ├── api/           # API 호출
  ├── types/         # 타입 정의
  └── utils/         # 유틸리티
```

## 기술 스택
### 필수
- React 18 / Vue 3 / NestJS 등
- TypeScript
- [상태관리 라이브러리]

### 주요 라이브러리
- TanStack Query (서버 상태)
- [기타 주요 라이브러리]

## 개발 규칙
### 컴포넌트
- 함수형 컴포넌트 사용
- 구조분해할당 필수
- Props 타입 정의

### API
- TanStack Query 사용
- 에러 핸들링 필수

### 스타일링
- [Tailwind / CSS Modules / Styled Components]

## 실행 명령어
```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 테스트
npm test

# 린트
npm run lint
```

## 주의사항
- [프로젝트별 특이사항]
```

## 분석 기준

### React 프로젝트
```json
{
  "indicators": [
    "dependencies.react",
    "dependencies.next",
    "src/components/",
    "vite.config.ts"
  ],
  "checks": [
    "상태관리 (Jotai, Zustand, Recoil)",
    "라우팅 (React Router, Next.js)",
    "스타일링 (Tailwind, Emotion, Styled)",
    "빌드 도구 (Vite, Next, CRA)"
  ]
}
```

### NestJS 프로젝트
```json
{
  "indicators": [
    "dependencies.@nestjs/core",
    "src/main.ts",
    "src/app.module.ts"
  ],
  "checks": [
    "데이터베이스 (TypeORM, Prisma, Mongoose)",
    "인증 (JWT, Passport)",
    "API 문서 (Swagger)",
    "테스트 (Jest)"
  ]
}
```

### Vue 프로젝트
```json
{
  "indicators": [
    "dependencies.vue",
    "src/App.vue",
    "vite.config.ts"
  ],
  "checks": [
    "상태관리 (Pinia, Vuex)",
    "라우팅 (Vue Router)",
    "스타일링 방식",
    "빌드 도구 (Vite, Vue CLI)"
  ]
}
```

## 생성 결과 예시

### React + Vite + TanStack Query
```markdown
# MyApp - React 개발 가이드

## 프로젝트 개요
- 타입: React SPA
- 패키지 매니저: pnpm
- 빌드 도구: Vite

## 기술 스택
- React 18.3
- TypeScript 5.3
- TanStack Query 5.0 (서버 상태)
- Jotai (클라이언트 상태)
- React Router 6
- Tailwind CSS

## 디렉토리 구조
src/
  ├── components/     # 재사용 컴포넌트
  ├── pages/         # 페이지 컴포넌트
  ├── hooks/         # 커스텀 훅
  ├── api/           # API 클라이언트
  ├── stores/        # Jotai atoms
  ├── types/         # 타입 정의
  └── utils/         # 유틸리티

## 개발 규칙
- 구조분해할당 필수
- TanStack Query로 서버 상태 관리
- Jotai로 클라이언트 상태 관리
- 주석 최소화 (중요한 것만)
```

### NestJS API
```markdown
# API Server - NestJS 개발 가이드

## 프로젝트 개요
- 타입: NestJS REST API
- 패키지 매니저: npm
- 데이터베이스: PostgreSQL + TypeORM

## 기술 스택
- NestJS 10
- TypeScript 5.3
- TypeORM
- JWT Authentication
- Swagger

## 디렉토리 구조
src/
  ├── modules/       # 기능 모듈
  │   ├── users/
  │   ├── auth/
  │   └── posts/
  ├── common/        # 공통 모듈
  │   ├── guards/
  │   ├── filters/
  │   └── decorators/
  └── config/        # 설정

## 개발 규칙
- 모듈별로 분리
- DTO 타입 정의 필수
- 에러 핸들링 표준화
- Swagger 문서화
```

## 사용 시점

1. **새 프로젝트 시작**
   ```
   사용자: 프로젝트 분석 좀
   ```

2. **프로젝트 최초 진입**
   ```
   사용자: /init
   ```

3. **프로젝트 구조 변경 후**
   ```
   사용자: 프로젝트 구조 업데이트
   ```

## 출력 내용

1. **프로젝트 분석 결과**
   - 감지된 프레임워크
   - 주요 라이브러리
   - 디렉토리 구조

2. **AGENT.md 생성**
   - 프로젝트별 맞춤 가이드
   - 실행 명령어
   - 개발 규칙

3. **추천사항**
   - 추가 설치 권장 라이브러리
   - 설정 개선 제안

## 참고

이 명령어는 CLAUDE.md의 `<project_initialization>` 섹션에 정의된 대로 동작합니다.
