# Frontend Architecture

## Barrel Export (index.ts) - Required

Every module folder must have an `index.ts` that exports its public API.

### TypeScript Files

```typescript
// features/published/hooks/index.ts
export * from './usePublishedList';
export * from './usePublishedModal';
```

### Vue/React Components

```typescript
// features/published/ui/index.ts
export { default as PublishedCard } from './PublishedCard.vue';
export { default as PublishedModal } from './PublishedModal.vue';
```

### Hierarchical Export

```typescript
// features/published/index.ts
export * from './hooks';
export * from './stores';
export * from './ui';

// features/index.ts
export * from './published';
```

### Result

```typescript
// Clean import via barrel export
import { usePublishedStore, usePublishedModal, PublishedCard } from '@/features';

// Instead of long paths
// import { usePublishedStore } from '@/features/published/stores/publishedStore';
```

### Required Folders

All of these must have `index.ts`:
- `src/features/` - Feature modules
- `src/entities/` - Entity modules
- `src/shared/` - Shared utilities
- `src/hooks/` - Custom hooks
- `src/types/` - Type definitions
- `src/constants/` - Constants

### Cautions

- **Circular references**: Do not import between modules at the same level
- **Tree-shaking**: Be aware that `export *` may include unused modules
- **Consistency**: Use the same export pattern throughout the project

## HTTP Client: Axios (Required)

**Never use the `fetch` API. Always use Axios.**

```typescript
// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

## Vercel SPA Deployment

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Required for client-side routing (React Router, Vue Router). Without this, direct URL access returns 404.
