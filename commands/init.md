---
description: 프로젝트 분석 및 AGENT.md 생성
argument-hint: 없음
---

# 프로젝트 초기화 (Enhanced)

새 프로젝트에 진입했을 때 프로젝트를 심층 분석하고 해당 프로젝트에 맞는 AGENT.md를 생성합니다.
단순 파일 탐색이 아닌 **multi-agent 병렬 분석 + LSP 진단**을 활용합니다.

## Phase 1: 병렬 코드베이스 탐색

**즉시 실행**: 아래 3개 탐색을 **동시에** (background) 시작합니다.

### 탐색 1: 프로젝트 구조 & 의존성
```
task(subagent_type="explore", run_in_background=true, ...)
프롬프트:
- 프로젝트 루트 파일 구조 (ls -la, 주요 config 파일)
- package.json / requirements.txt / Cargo.toml 등 패키지 매니저 파일 읽기
- 사용 프레임워크 및 주요 라이브러리 버전 목록
- 빌드 도구 설정 (vite.config, next.config, webpack.config 등)
- 테스트/린트/포맷터 설정 파일
```

### 탐색 2: 소스코드 패턴 & 아키텍처
```
task(subagent_type="explore", run_in_background=true, ...)
프롬프트:
- src/ 디렉토리 2레벨 구조 스캔
- 컴포넌트/모듈 구조 패턴 파악 (flat vs domain-grouped vs FSD vs feature-based)
- import 패턴 분석 (절대경로 vs 상대경로, barrel export 사용 여부)
- 상태관리 패턴 (Context, Jotai, Zustand, Redux, Pinia 등)
- API 호출 패턴 (fetch, axios, TanStack Query 등)
- 라우팅 구조
```

### 탐색 3: 코드 품질 & 컨벤션
```
task(subagent_type="explore", run_in_background=true, ...)
프롬프트:
- 네이밍 컨벤션 (camelCase, kebab-case, PascalCase - 파일/변수/함수/컴포넌트)
- 코드 스타일 (arrow function vs function, 세미콜론, 구조분해 등)
- 테스트 파일 위치 및 패턴 (colocated vs __tests__ vs test/)
- 타입 관리 방식 (inline vs 분리, .d.ts 사용 여부)
- 에러 핸들링 패턴
- 주석 스타일 및 빈도
```

## Phase 2: 프레임워크 감지 & 분류

병렬 탐색 결과를 수집하면서, 직접 도구로 핵심 파일을 읽습니다.

### 감지 인디케이터

#### React / Next.js
```json
{
  "indicators": ["dependencies.react", "dependencies.next", "src/components/", "vite.config.ts", "next.config"],
  "checks": ["상태관리 (Jotai, Zustand, Recoil, Redux)", "라우팅 (React Router, Next.js App/Pages)", "스타일링 (Tailwind, Emotion, Styled, CSS Modules)", "빌드 도구 (Vite, Next, CRA)", "서버 상태 (TanStack Query, SWR)"]
}
```

#### Vue / Nuxt
```json
{
  "indicators": ["dependencies.vue", "dependencies.nuxt", "src/App.vue", "nuxt.config"],
  "checks": ["상태관리 (Pinia, Vuex)", "라우팅 (Vue Router, Nuxt auto-routes)", "스타일링 방식", "Composition API vs Options API"]
}
```

#### NestJS
```json
{
  "indicators": ["dependencies.@nestjs/core", "src/main.ts", "src/app.module.ts"],
  "checks": ["ORM (TypeORM, Prisma, Mongoose)", "인증 (JWT, Passport)", "API 문서 (Swagger)", "마이크로서비스 여부"]
}
```

#### Python (FastAPI / Django / Flask)
```json
{
  "indicators": ["requirements.txt", "pyproject.toml", "fastapi", "django", "flask"],
  "checks": ["ORM (SQLAlchemy, Django ORM, Tortoise)", "비동기 여부", "패키지 관리 (pip, poetry, uv)"]
}
```

## Phase 3: LSP 진단 활용

탐색 결과를 기다리는 동안 LSP 도구를 활용합니다:

```
# 주요 소스 파일에서 심볼 구조 파악
lsp_symbols(filePath="src/main.ts 또는 진입점", scope="document")

# 워크스페이스 전역 심볼 검색 (프로젝트 규모 파악)
lsp_symbols(filePath="src/main.ts", scope="workspace", query="")

# 진입점에서 진단 확인 (기존 문제점 파악)
lsp_diagnostics(filePath="src/main.ts 또는 진입점")
```

## Phase 4: 디렉토리 중요도 평가

탐색 결과를 종합하여 각 주요 디렉토리의 중요도를 평가합니다:

| 평가 기준 | 가중치 |
|-----------|--------|
| 파일 수 | 20% |
| 최근 변경 빈도 | 30% |
| 다른 모듈에서의 import 빈도 | 30% |
| 코드 복잡도 | 20% |

**중요도 높은 디렉토리** (상위 5개)에 대해서는 하위 디렉토리별 설명을 포함합니다.

## Phase 5: AGENT.md 생성

### 생성 위치 및 구조

프로젝트 루트에 `AGENT.md` 생성 (`.claude/AGENT.md`가 아닌 **루트**에 생성)

### 템플릿

```markdown
# [프로젝트명] - 개발 가이드

## 프로젝트 개요
- **타입**: [React SPA / Next.js SSR / NestJS API / Vue App 등]
- **패키지 매니저**: [npm / yarn / pnpm / bun] + 버전
- **Node/Python 버전**: [런타임 버전]
- **주요 프레임워크**: [리스트 + 버전]

## 아키텍처
[FSD / Feature-based / Domain-grouped / Flat 등 감지된 패턴 설명]

### 레이어 구조 (감지된 경우)
```
src/
├── [감지된 디렉토리 구조]
```

### 핵심 디렉토리 설명
| 디렉토리 | 역할 | 주요 파일 수 | 비고 |
|----------|------|-------------|------|
| (분석 결과 기반으로 작성) | | | |

## 기술 스택

### 핵심
- [감지된 핵심 기술 스택]

### 상태관리
- [감지된 상태관리 라이브러리 + 사용 패턴]

### API / 서버 통신
- [감지된 API 패턴]

### 스타일링
- [감지된 스타일링 방식]

## 코드 컨벤션
- **파일 네이밍**: [감지된 패턴: kebab-case / camelCase / PascalCase]
- **컴포넌트**: [함수형 / 클래스 / arrow function export]
- **Import 스타일**: [절대경로 @/ / 상대경로 / barrel export]
- **타입 관리**: [inline / 분리 / .d.ts]
- **테스트 위치**: [colocated / __tests__ / test/]

## 실행 명령어
```bash
# 개발 서버
[감지된 dev 명령어]

# 빌드
[감지된 build 명령어]

# 테스트
[감지된 test 명령어]

# 린트/포맷
[감지된 lint 명령어]

# 타입체크
[감지된 typecheck 명령어]
```

## 주의사항
- [분석 중 발견된 특이사항]
- [기존 lint 에러/경고 현황]
- [특수한 설정이나 의존성]
```

## 생성 결과 예시

### React + Vite + TanStack Query + FSD
```markdown
# MyApp - React 개발 가이드

## 프로젝트 개요
- **타입**: React SPA
- **패키지 매니저**: pnpm 9.x
- **Node 버전**: 22+
- **주요 프레임워크**: React 19, TypeScript 5.7

## 아키텍처
FSD (Feature-Sliced Design) 구조 채택

### 레이어 구조
```
src/
├── app/           # 앱 초기화, 프로바이더
├── pages/         # 라우트 페이지
├── widgets/       # 복합 UI 블록
├── features/      # 사용자 인터랙션
├── entities/      # 도메인 엔티티
├── shared/        # 재사용 유틸, UI
└── assets/        # 정적 리소스
```

## 기술 스택
### 핵심
- React 19 + TypeScript 5.7
- Vite 6 (빌드)

### 상태관리
- TanStack Query 5 (서버 상태)
- Jotai 2 (클라이언트 상태)

### 스타일링
- Tailwind CSS v4

## 코드 컨벤션
- **파일 네이밍**: kebab-case 폴더 + index.ts
- **컴포넌트**: arrow function export
- **Import**: 절대경로 @/ + barrel export
- **타입**: model/types/index.ts 분리

## 실행 명령어
```bash
pnpm dev          # Vite dev server
pnpm build        # 프로덕션 빌드
pnpm test         # Vitest
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
```
```

### NestJS API
```markdown
# API Server - NestJS 개발 가이드

## 프로젝트 개요
- **타입**: NestJS REST API
- **패키지 매니저**: npm
- **데이터베이스**: PostgreSQL + TypeORM

## 아키텍처
Module-based 구조 (NestJS 표준)

### 모듈 구조
```
src/
├── modules/       # 기능 모듈
│   ├── users/
│   ├── auth/
│   └── posts/
├── common/        # 공통 (guards, filters, decorators)
└── config/        # 설정
```

## 기술 스택
- NestJS 10 + TypeScript 5.3
- TypeORM + PostgreSQL
- JWT Authentication + Passport
- Swagger (API 문서)

## 코드 컨벤션
- **모듈별 분리**: controller, service, entity, dto
- **DTO**: class-validator + class-transformer
- **에러**: HttpException 계층 사용
```

## 분석 완료 후 출력

1. **프로젝트 분석 결과** 요약 (감지된 항목 나열)
2. **AGENT.md 파일 생성** (위 템플릿 기반)
3. **권장사항** (개선 제안, 누락된 설정 등)
