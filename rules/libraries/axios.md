# Axios Guidelines

Required HTTP client for all frontend projects. Never use `fetch`.

## Setup

```bash
pnpm add axios
```

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

## API Function Naming

| HTTP Method | Pattern | Example |
|------------|---------|---------|
| GET (list) | `get{Entity}List` | `getUserList` |
| GET (one) | `get{Entity}` | `getUser` |
| POST | `create{Entity}` | `createUser` |
| PUT/PATCH | `update{Entity}` | `updateUser` |
| DELETE | `delete{Entity}` | `deleteUser` |

```typescript
import { api } from '@/api/client';
import type { User, CreateUserDto } from '@/types/user';

export const getUserList = async (params?: { page?: number; limit?: number }) => {
  const { data } = await api.get<User[]>('/users', { params });
  return data;
};

export const getUser = async (id: string) => {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
};

export const createUser = async (dto: CreateUserDto) => {
  const { data } = await api.post<User>('/users', dto);
  return data;
};

export const updateUser = async (id: string, dto: Partial<User>) => {
  const { data } = await api.put<User>(`/users/${id}`, dto);
  return data;
};

export const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
};
```

## File Upload

```typescript
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
```

## Error Handling

```typescript
import { AxiosError } from 'axios';

try {
  await createUser(data);
} catch (error) {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
  }
}
```
