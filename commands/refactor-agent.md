---
description: 리팩토링 에이전트
argument-hint: file-or-directory
---

# 리팩토링 에이전트 (Enhanced 6-Phase Pipeline)

기능 구현 후 코드 품질을 유지하면서 파일을 적절히 분할하고 구조를 개선합니다.
**multi-agent 병렬 분석 + LSP 진단 + AST-grep 검증**을 활용하는 6단계 파이프라인입니다.

## 대상

$ARGUMENTS

- 인자가 있으면 해당 파일/디렉토리만 리팩토링
- 인자가 없으면 최근 변경사항 기반으로 분석

---

## Phase 1: Intent Gate (범위 결정)

리팩토링 시작 전 **범위와 목표를 명확히** 합니다.

### 인자가 있는 경우
해당 파일/디렉토리를 직접 분석 대상으로 설정합니다.

### 인자가 없는 경우
```bash
git status
git diff --stat
git log --oneline -5
```
최근 변경된 파일들을 리팩토링 대상으로 설정합니다.

### 중단 조건 (이 중 하나라도 해당되면 중단 후 사용자에게 확인)
- 대상 파일이 10개 이상 → 범위 축소 요청
- 대상 코드에 테스트가 전혀 없음 → 테스트 먼저 작성 제안
- 기존 빌드가 깨져있음 → 빌드 수정 먼저 제안

---

## Phase 2: 병렬 코드베이스 분석

**5개 병렬 탐색**을 동시에 실행합니다.

### 탐색 1: 파일 복잡도 분석
```
task(subagent_type="explore", run_in_background=true, ...)
- 대상 파일들의 줄 수, 함수/클래스 크기 측정
- 파일 크기 300줄 이상 → 분할 후보
- 컴포넌트/클래스 100줄 이상 → SRP 위반 가능성
- 함수/메서드 30줄 이상 → 분해 후보
- 순환 복잡도가 높은 함수 식별
```

### 탐색 2: 의존성 그래프
```
task(subagent_type="explore", run_in_background=true, ...)
- 대상 파일들의 import/export 관계 매핑
- 순환 의존성 탐지
- 과도한 결합도 (한 파일이 10개 이상 import) 식별
- dead export (사용되지 않는 export) 탐지
```

### 탐색 3: 기존 패턴 & 컨벤션
```
task(subagent_type="explore", run_in_background=true, ...)
- 프로젝트의 기존 파일 분할 패턴 파악
- 네이밍 컨벤션 (파일명, 함수명, 컴포넌트명)
- import 스타일 (절대경로 vs 상대경로, barrel export)
- 타입 정의 위치 패턴
```

### 탐색 4: 테스트 커버리지 현황
```
task(subagent_type="explore", run_in_background=true, ...)
- 대상 파일에 대한 테스트 파일 존재 여부
- 테스트 패턴 (unit, integration, e2e)
- 테스트 실행 명령어 확인 (package.json scripts)
```

### 탐색 5: 코드 스멜 탐지
```
task(subagent_type="explore", run_in_background=true, ...)
- Prop Drilling (3단계 이상 drilling되는 값)
- 매직 넘버/스트링
- 중복 코드 패턴
- 빈 catch 블록
- any 타입 사용
- console.log 잔재
```

### 직접 도구 (병렬 탐색 중 동시에 실행)

```
# LSP 진단으로 기존 에러/경고 파악
lsp_diagnostics(filePath="대상파일", severity="all")

# 심볼 구조 파악
lsp_symbols(filePath="대상파일", scope="document")

# AST-grep으로 코드 스멜 패턴 탐지
ast_grep_search(pattern="console.log($MSG)", lang="typescript")
ast_grep_search(pattern="catch($ERR) {}", lang="typescript")
```

---

## Phase 3: 리팩토링 계획 수립

병렬 탐색 결과를 종합하여 구체적인 계획을 수립합니다.

### 계획 템플릿

```markdown
## 리팩토링 계획

### 우선순위 1 (안전한 변경)
| # | 파일 | 문제점 | 조치 | 예상 효과 |
|---|------|--------|------|-----------|
| 1 | ... | ... | ... | ... |

### 우선순위 2 (구조 변경)
| # | 파일 | 문제점 | 조치 | 예상 효과 |
|---|------|--------|------|-----------|
| 1 | ... | ... | ... | ... |

### 위험 요소
- (식별된 위험 나열)

### 건드리지 않을 것
- (명시적으로 변경하지 않을 항목)
```

### 크기 임계값 (자동 적용)

| 항목 | 임계값 | 조치 |
|------|--------|------|
| 파일 | 300줄 이상 | 분할 검토 |
| 컴포넌트 | 100줄 이상 | SRP 위반 검토 |
| 함수/메서드 | 30줄 이상 | 분해 검토 |
| import 수 | 10개 이상 | 과결합 검토 |
| Prop drilling | 3단계 이상 | 상수/Context 추출 |

---

## Phase 4: 단계적 실행 (+ 연속 검증)

**중요**: 한 번에 하나씩, 단계적으로 진행합니다.
각 변경 후 **즉시 LSP 진단**을 실행하여 깨진 것이 없는지 확인합니다.

### 실행 순서 (안전한 것부터)

#### 4.1 타입 분리

```typescript
// Before: 컴포넌트 파일 내부에 타입 정의
interface UserProps { ... }
type UserRole = 'admin' | 'member' | 'guest';

// After: types/ 또는 model/types/ 로 분리
// types/user.ts (또는 FSD: entities/user/model/types/index.ts)
export interface UserProps { ... }
export type UserRole = 'admin' | 'member' | 'guest';
```

**검증**: `lsp_diagnostics` → 타입 에러 없음 확인

#### 4.2 커스텀 훅 추출

```typescript
// Before: 컴포넌트 내부에 로직 혼재
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
useEffect(() => { /* fetch 로직 */ }, []);

// After: 훅으로 분리
// hooks/use-user-data/index.ts
export const useUserData = (userId: string) => {
  const { data, isLoading } = useQuery({ ... });
  return { data, isLoading };
};
```

**검증**: `lsp_diagnostics` + `lsp_find_references`로 모든 사용처 확인

#### 4.3 컴포넌트 분리

```typescript
// Before: UserProfile.tsx (350줄)
// - UserAvatar (하위 컴포넌트)
// - UserStats (하위 컴포넌트)
// - UserProfile (메인 컴포넌트)

// After:
// features/user/           (또는 기존 구조에 맞게)
//   ├── hooks/use-user-data/index.ts
//   ├── ui/user-avatar/index.tsx
//   ├── ui/user-stats/index.tsx
//   ├── ui/user-profile/index.tsx    # 메인 - 합성만
//   └── index.ts                     # barrel export
```

**검증**: `lsp_diagnostics` + 빌드 확인

#### 4.4 Prop Drilling 제거

```typescript
// Before: config가 3단계 이상 drilling
const processKeywords = async (keywords, config, logBuilder) => {
  const result = await getCrawlResult(query, config, ...);
};

// After: 전역 상수로 추출
// constants/crawl-config/index.ts
export const CRAWL_CONFIG = {
  maxRetries: 3,
  delayBetweenQueries: 1500,
} as const;

// 직접 import
import { CRAWL_CONFIG } from '@/constants';
```

**검증**: `ast_grep_search`로 이전 패턴이 남아있지 않은지 확인

#### 4.5 매직 넘버/스트링 상수화

```typescript
// Before
if (retryCount > 3) { ... }
setTimeout(fn, 1500);

// After
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
```

#### 4.6 긴 함수 분해

```typescript
// Before: 50줄짜리 핸들러

// After:
const handleSubmit = async (formData: FormData) => {
  const validated = validateForm(formData);
  const transformed = transformPayload(validated);
  await submitToApi(transformed);
};
```

#### 4.7 복잡한 조건문 정리

```typescript
// Before:
if (user.role === 'admin' || (user.role === 'member' && user.permissions.includes('edit'))) {

// After:
const canEdit = (user: User): boolean =>
  user.role === 'admin' ||
  (user.role === 'member' && user.permissions.includes('edit'));
```

#### 4.8 Import 정리

```typescript
// 1. 외부 라이브러리
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 내부 모듈
import { useAuth } from '@/hooks/useAuth';
import { UserCard } from '@/components/UserCard';

// 3. 타입 (type-only import)
import type { User } from '@/types/user';
```

#### 4.9 Barrel Export 정리

```typescript
// 모든 폴더에 index.ts 추가
// entities/search/index.ts
export * from './api';
export * from './hooks';
export * from './model';
```

### 각 단계 완료 시 검증 체크포인트

```
lsp_diagnostics(filePath="변경된파일") → 에러 0개 확인
```

에러 발생 시 **즉시 수정** 후 다음 단계 진행. 3회 실패 시 중단하고 사용자에게 보고.

---

## Phase 5: 전체 검증

모든 리팩토링 완료 후 **전체 프로젝트** 검증을 실행합니다.

### TypeScript/JavaScript 프로젝트
```bash
# 타입 체크
npx tsc --noEmit

# 린트
npx eslint . (또는 프로젝트의 lint 명령어)

# 테스트
npm test (또는 프로젝트의 test 명령어)

# 빌드
npm run build (또는 프로젝트의 build 명령어)
```

### Python 프로젝트
```bash
mypy .
ruff check .
pytest
```

### AST-grep 최종 확인
```
# 코드 스멜이 제거되었는지 확인
ast_grep_search(pattern="console.log($MSG)", lang="typescript")  → 0건
ast_grep_search(pattern="catch($ERR) {}", lang="typescript")     → 0건
```

### 검증 체크리스트
- [ ] 기존 기능 정상 작동 확인
- [ ] 타입 에러 없음 (lsp_diagnostics)
- [ ] 린트 에러 없음
- [ ] 테스트 통과
- [ ] 빌드 성공
- [ ] import 경로 정상
- [ ] barrel export 정상
- [ ] dead export 없음

### 실패 시 복구 프로토콜

1. **1-2회 실패**: 원인 분석 후 수정 시도
2. **3회 연속 실패**: 즉시 중단
3. **마지막 정상 상태로 복원** (`git checkout` 또는 편집 취소)
4. **실패 내용 문서화** 후 사용자에게 보고

---

## Phase 6: 결과 보고

```markdown
## 리팩토링 완료 보고

### 변경 요약
| # | 파일 | Before (줄) | After (줄) | 변경 내용 |
|---|------|-------------|------------|-----------|
| (실제 변경 기반으로 작성) |

### 수행된 리팩토링
- (실제 수행한 패턴별 정리)

### 검증 결과
| 항목 | 결과 | 비고 |
|------|------|------|
| 타입 체크 | ✅/❌ | |
| 린트 | ✅/❌ | |
| 테스트 | ✅/❌ | |
| 빌드 | ✅/❌ | |

### 개선 지표
- 총 파일 수: N → M
- 평균 파일 크기: X줄 → Y줄
- 코드 스멜 제거: N건
```

---

## FSD 아키텍처 (Frontend 프로젝트)

FSD(Feature-Sliced Design) 아키텍처를 따르는 프로젝트의 경우:

**@~/.claude/rules/architecture-fsd.md**

### FSD 핵심 규칙

```
src/
├── app/           # App 초기화, 프로바이더, 전역 설정
├── pages/         # 라우트 페이지 컴포넌트 (조합만)
├── widgets/       # 독립적인 복합 UI 블록
├── features/      # 사용자 인터랙션, 비즈니스 액션
├── entities/      # 도메인 엔티티 (데이터 모델, API, 훅)
├── shared/        # 재사용 유틸, UI 프리미티브, 라이브러리
└── assets/        # 정적 리소스 (이미지, 폰트)
```

### 레이어 Import 규칙 (엄격)

상위 레이어는 하위 레이어만 import 가능. 역방향/횡방향 import 금지.

```
app     → pages, widgets, features, entities, shared
pages   → widgets, features, entities, shared
widgets → features, entities, shared
features → entities, shared
entities → shared
shared  → nothing (자기완결)
```

### FSD 마이그레이션 패턴

flat/unstructured 프로젝트를 FSD로 마이그레이션:

1. **도메인 식별** — 관련 파일을 도메인별로 그룹화
2. **Slice 폴더 생성** — `entities/{domain}/` + `api/`, `model/`, `hooks/` 세그먼트
3. **타입 먼저 이동** — `model/types/index.ts`
4. **API 함수 이동** — `api/{domain}-api/index.ts`
5. **훅 이동** — `hooks/use-{action}/index.ts`
6. **Barrel export 추가** — 모든 레벨에 `index.ts`
7. **Import 업데이트** — barrel 경로 사용 (`@/entities`)
8. **빈 폴더 삭제**

**주의**: 한 번에 하나의 도메인만 마이그레이션. 각 도메인 완료 후 테스트.

---

## 공통 리팩토링 패턴

**@~/.claude/rules/refactor.md**

### 주요 패턴 요약

- **Prop Drilling 제거**: 3단계 이상 drilling → 전역 상수/Context로 추출
- **커스텀 훅 추출**: 컴포넌트 내 상태+로직 → 훅으로 분리
- **컴포넌트 분리**: Container/Presentational 또는 합성 컴포넌트
- **타입 정의 분리**: 공유 타입 → `types/` 또는 `model/types/`
- **Barrel Export 정리**: `index.ts`로 모듈 진입점 정리
- **유틸 함수 추출**: 재사용 순수 함수 → `utils/` 또는 `shared/lib/`

---

## 체크리스트

### TypeScript 프로젝트
- [ ] 타입 정의 적절히 분리
- [ ] `any` 사용 최소화
- [ ] type-only import 사용 (`import type`)
- [ ] 컴포넌트 Props 타입 명시
- [ ] 함수 반환 타입 명시 (복잡한 경우)
- [ ] barrel export 정리
- [ ] 파일명 컨벤션 준수
- [ ] 불필요한 re-export 제거

### Python 프로젝트
- [ ] 타입 힌트 활용
- [ ] `__all__` 정의
- [ ] Private 메서드/속성 (`_prefix`)
- [ ] Import 순서 (stdlib → 3rd party → local)
- [ ] 네이밍 컨벤션 (snake_case 함수, PascalCase 클래스)

---

## 절대 원칙

1. **기능 먼저**: 절대 기능이 깨지면 안 됨
2. **점진적 개선**: 한 번에 너무 많이 바꾸지 않음
3. **검증 필수**: 리팩토링 후 반드시 LSP 진단 + 빌드/테스트
4. **의미 있는 분할**: 단순 줄 수 감소가 아니라 책임 분리
5. **일관성 유지**: 프로젝트 기존 구조와 컨벤션 따름
6. **버그 수정 금지**: 리팩토링 중 발견된 버그는 별도 보고, 동시 수정 안 함
7. **3회 실패 시 중단**: 복구 후 사용자에게 보고

---

**이제 대상 파일을 분석하고 리팩토링을 시작하세요!**
