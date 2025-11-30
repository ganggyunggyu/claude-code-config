---
description: FSD(Feature-Sliced Design) 폴더 구조 자동 생성
arguments:
  - name: 폴더명
    description: 생성할 폴더 이름 (예: users, auth, products)
  - name: 경로
    description: 생성 위치 (기본값: src)
    required: false
---

# FSD 폴더 구조 생성기

## 작업 내용
`$ARGUMENTS` 를 파싱하여 FSD 구조의 폴더를 생성합니다.

## 폴더 구조 규칙

지정된 경로에 다음 구조로 폴더와 index.ts를 생성합니다:

```
{경로}/{폴더명}/
├── index.ts          # re-export 파일
└── (내용은 비워둠, 필요시 하위 폴더 추가)
```

## 실행 단계

1. 첫 번째 인자에서 폴더명 추출
2. 두 번째 인자에서 경로 추출 (없으면 src 사용)
3. 해당 경로에 폴더 생성
4. index.ts 파일 생성 (빈 export)

## 예시

- `/fsd-maker users` → `src/users/index.ts` 생성
- `/fsd-maker auth src/features` → `src/features/auth/index.ts` 생성
- `/fsd-maker products src/api` → `src/api/products/index.ts` 생성

## index.ts 기본 템플릿

```typescript
// {폴더명} exports
export {};
```

## 추가 옵션

폴더명에 `/`가 포함된 경우 중첩 폴더로 처리:
- `/fsd-maker user/profile` → `src/user/profile/index.ts`

## 실행

위 규칙에 따라 폴더와 index.ts를 생성해주세요.
