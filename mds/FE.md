## FSD 아키텍처

### Barrel Export (index.ts) 규칙

**모든 폴더에는 index.ts를 만들어 모듈을 내보내야 합니다.**

#### 기본 원칙

1. **TypeScript/JavaScript 파일**: `export * from './filename'` 형식
2. **Vue/React 컴포넌트**: `export { default as ComponentName } from './ComponentName.vue'` 형식
3. **계층적 구조**: 하위 폴더의 index.ts를 상위 폴더에서 re-export

#### 폴더별 index.ts 생성 예시

**features 폴더 구조:**
```
features/
├── published/
│   ├── hooks/
│   │   ├── index.ts         (hooks export)
│   │   ├── usePublishedList.ts
│   │   └── usePublishedModal.ts
│   ├── stores/
│   │   ├── index.ts         (stores export)
│   │   └── publishedStore.ts
│   ├── ui/
│   │   ├── index.ts         (UI components export)
│   │   ├── PublishedCard.vue
│   │   └── PublishedModal.vue
│   └── index.ts             (통합 export)
└── index.ts                 (features 전체 export)
```

**TypeScript 파일 export 예시:**
```typescript
// features/published/hooks/index.ts
export * from './usePublishedList';
export * from './usePublishedModal';
```

**Vue/React 컴포넌트 export 예시:**
```typescript
// features/published/ui/index.ts
export { default as PublishedCard } from './PublishedCard.vue';
export { default as PublishedModal } from './PublishedModal.vue';
```

**계층적 통합 export:**
```typescript
// features/published/index.ts
export * from './hooks';
export * from './stores';
export * from './ui';

// features/index.ts
export * from './published';
```

#### Import 사용 예시

Barrel export를 사용하면 import 경로가 깔끔해집니다:

```typescript
// ❌ 이전 방식 (긴 경로)
import { usePublishedStore } from '@/features/published/stores/publishedStore';
import { usePublishedModal } from '@/features/published/hooks/usePublishedModal';
import PublishedCard from '@/features/published/ui/PublishedCard.vue';

// ✅ 새로운 방식 (barrel export)
import { usePublishedStore, usePublishedModal, PublishedCard } from '@/features';
```

#### 적용 대상 폴더

다음 폴더들은 반드시 index.ts를 가져야 합니다:

- `src/features/` - 기능 단위 모듈
- `src/entities/` - 엔티티 모듈
- `src/stores/` - 상태 관리
- `src/hooks/` - 커스텀 훅
- `src/components/ui/` - UI 컴포넌트
- `src/components/widgets/` - 위젯 컴포넌트
- `src/utils/` - 유틸리티 함수
- `src/types/` - 타입 정의
- `src/constants/` - 상수

#### 주의사항

1. **순환 참조 방지**: 같은 레벨의 모듈끼리는 직접 import하지 말고, 상위 레벨에서 import
2. **Tree-shaking 고려**: `export *` 사용 시 사용하지 않는 모듈도 번들에 포함될 수 있으므로 주의
3. **일관성 유지**: 프로젝트 전체에서 동일한 export 패턴 사용

## HTTP 클라이언트

### Axios 사용 필수

**fetch API 사용 금지. 반드시 axios를 사용하세요.**

이유:
- Interceptor로 전역 에러 처리 가능
- 자동 JSON 변환
- Request/Response 변환 쉬움
- Timeout 설정 간편
- 취소 기능 (AbortController)
- TypeScript 타입 지원 우수

### Axios 기본 설정

```typescript
// src/api/client.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 로그아웃 처리
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### API 호출 예시

```typescript
// ❌ 이렇게 하지 마세요 (fetch)
const response = await fetch('/api/users')
const data = await response.json()

// ✅ 이렇게 하세요 (axios)
const { data } = await api.get('/users')
```

## Vercel 배포 설정

### SPA 라우팅 설정

React Router, Vue Router 등 클라이언트 사이드 라우팅을 사용하는 SPA는 Vercel 배포 시 `vercel.json` 파일이 필수입니다.

**vercel.json**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
이 설정이 없으면:
/ 외의 경로에서 새로고침 시 404 에러 발생
직접 URL 입력 시 페이지 로드 실패
동작 원리:
모든 경로 요청을 index.html로 리라이트
클라이언트 사이드 라우터가 경로 처리
SEO가 중요하다면 Next.js 사용 권장
프로젝트 루트에 vercel.json 생성 필수
```
