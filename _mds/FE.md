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
