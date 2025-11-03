---
description: 린트, 타입체크, 테스트 실행
argument-hint: [옵션]
---

# 코드 검증

프로젝트의 코드 품질을 검증합니다. 린트, 타입 체크, 테스트를 순차적으로 실행합니다.

## 사용법

```
/check
/check --lint-only
/check --type-only
/check --test-only
/check --all
```

## 실행 순서

### 1. Lint (ESLint / Biome)
```bash
# ESLint
npm run lint
# 또는
npx eslint src/

# Biome
npx biome check src/
```

**확인 사항:**
- 코드 스타일 규칙 위반
- 잠재적 버그
- 사용하지 않는 변수/import
- 안티패턴

### 2. Type Check (TypeScript)
```bash
# TypeScript
npx tsc --noEmit

# Vue
npx vue-tsc --noEmit
```

**확인 사항:**
- 타입 오류
- any 타입 경고
- 타입 불일치
- 누락된 타입 정의

### 3. Test (Jest / Vitest)
```bash
# Jest
npm test

# Vitest
npx vitest run

# Playwright (E2E)
npx playwright test
```

**확인 사항:**
- 유닛 테스트 통과 여부
- 통합 테스트 결과
- E2E 테스트 성공 여부
- 테스트 커버리지

### 4. Build (선택)
```bash
# Vite
npm run build

# Next.js
npm run build

# NestJS
npm run build
```

**확인 사항:**
- 빌드 성공 여부
- 빌드 경고
- 번들 크기

## 상세 검증 프로세스

### ESLint 검증
```bash
# 전체 검사
npx eslint src/

# 특정 디렉토리
npx eslint src/components/

# 자동 수정 가능한 것 수정
npx eslint src/ --fix

# 경고 포함
npx eslint src/ --max-warnings 0
```

**일반적인 오류:**
```typescript
// ❌ 사용하지 않는 import
import { useState } from 'react' // unused

// ❌ 사용하지 않는 변수
const unusedVar = 'test'

// ❌ any 타입
const data: any = {}

// ❌ console.log 남아있음
console.log('debug')

// ❌ 빈 함수
const handleClick = () => {}
```

### TypeScript 검증
```bash
# 타입 체크만
npx tsc --noEmit

# watch 모드
npx tsc --noEmit --watch

# 특정 파일
npx tsc --noEmit src/components/UserProfile.tsx
```

**일반적인 오류:**
```typescript
// ❌ 타입 불일치
const user: User = {
  id: 123, // string이어야 함
  name: 'John',
}

// ❌ 누락된 속성
const user: User = {
  id: '123',
  // name이 없음
}

// ❌ null/undefined 체크 안함
const userName = user.name.toUpperCase() // user.name이 undefined일 수 있음

// ❌ 잘못된 타입 사용
const handleClick = (event: Event) => {
  // React.MouseEvent<HTMLButtonElement>이어야 함
}
```

### Jest/Vitest 검증
```bash
# 전체 테스트
npm test

# watch 모드
npm test -- --watch

# 커버리지
npm test -- --coverage

# 특정 파일
npm test UserProfile.test.tsx

# 업데이트된 스냅샷
npm test -- -u
```

**일반적인 실패:**
```typescript
// ❌ 비동기 처리 안함
test('fetches user', () => {
  const user = await fetchUser() // await 없음
  expect(user.name).toBe('John')
})

// ❌ Mock 설정 안함
test('calls API', () => {
  // API mock 없음
  const result = callApi()
})

// ❌ 클린업 안함
test('renders modal', () => {
  render(<Modal />)
  // cleanup 안함
})
```

## 결과 리포트

### 성공 시
```
✓ Lint: 0 errors, 0 warnings
✓ Type Check: No errors found
✓ Tests: 45 passed, 0 failed
✓ Build: Completed successfully

All checks passed! 🎉
```

### 실패 시
```
✗ Lint: 3 errors, 5 warnings
  src/components/UserProfile.tsx
    Line 10: 'user' is never used
    Line 23: Missing return type on function

✗ Type Check: 2 errors found
  src/api/users.ts:15:3
    Type 'number' is not assignable to type 'string'

✗ Tests: 42 passed, 3 failed
  UserProfile.test.tsx
    ✗ renders user name
      Expected: "John Doe"
      Received: "undefined"

❌ Checks failed. Please fix the issues above.
```

## 옵션별 실행

### --lint-only
```bash
# ESLint만 실행
npx eslint src/ --max-warnings 0
```

### --type-only
```bash
# TypeScript만 실행
npx tsc --noEmit
```

### --test-only
```bash
# 테스트만 실행
npm test
```

### --all
```bash
# 모든 검증 + 빌드
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## CI/CD 통합

### GitHub Actions
```yaml
# .github/workflows/check.yml
name: Code Quality Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npx tsc --noEmit

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

### Pre-commit Hook
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npx tsc --noEmit
npm test
```

## 자동 수정 가능한 항목

### ESLint
```bash
# 자동 수정
npx eslint src/ --fix
```

**수정 가능:**
- 들여쓰기
- 따옴표 스타일
- 세미콜론
- 불필요한 공백
- import 정렬

### Prettier
```bash
# 포맷팅
npx prettier --write src/
```

**수정 가능:**
- 코드 포맷
- 줄바꿈
- 들여쓰기
- 괄호 스타일

### Biome
```bash
# 린트 + 포맷
npx biome check src/ --apply
```

**수정 가능:**
- ESLint + Prettier 기능 통합

## 문제 해결 가이드

### Import 오류
```typescript
// ❌ 잘못된 import
import UserProfile from './UserProfile'

// ✅ 올바른 import
import UserProfile from '@/components/UserProfile'
```

### 타입 오류
```typescript
// ❌ any 사용
const data: any = await fetchData()

// ✅ 명확한 타입
const data: UserResponse = await fetchData()
```

### 테스트 오류
```typescript
// ❌ 비동기 미처리
test('fetches data', () => {
  const result = fetchData()
  expect(result).toBeDefined()
})

// ✅ async/await 사용
test('fetches data', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})
```

## 성능 최적화

### 병렬 실행
```bash
# npm-run-all 사용
npm install -D npm-run-all

# package.json
{
  "scripts": {
    "check": "npm-run-all --parallel lint type-check test"
  }
}
```

### 캐시 활용
```bash
# ESLint 캐시
npx eslint src/ --cache

# TypeScript 증분 빌드
npx tsc --incremental
```

## 사용 예시

```
사용자: /check
```

**실행 결과:**
1. ESLint 실행
2. TypeScript 타입 체크
3. 테스트 실행
4. 결과 요약 표시

```
사용자: /check --all
```

**실행 결과:**
1. 전체 검증 수행
2. 빌드까지 실행
3. 상세 리포트 생성

## 주의사항

- **순차 실행**: 오류 발견 시 즉시 중단
- **자동 수정**: --fix 옵션 신중히 사용
- **테스트 격리**: 각 테스트는 독립적으로
- **CI/CD**: 배포 전 필수 실행

## 참고

- ESLint: https://eslint.org
- TypeScript: https://www.typescriptlang.org
- Jest: https://jestjs.io
- Vitest: https://vitest.dev
- Biome: https://biomejs.dev
