# TanStack Query 사용 지침

<overview>
FE 통합 시 TanStack Query 설정이 필수입니다.
서버 상태 관리를 위한 강력한 도구로 React/Next.js, Vue/Nuxt에서 모두 사용 가능합니다.
</overview>

<installation>
## 설치

### React/Next.js

```bash
npm install @tanstack/react-query
# or
yarn add @tanstack/react-query
# or
pnpm add @tanstack/react-query
```

### Vue/Nuxt

```bash
npm install @tanstack/vue-query
```

</installation>

<setup_react>

## React/Next.js 설정

### QueryClient 설정

```typescript
ㄴ;
```

### App에 적용

```typescript
// app/layout.tsx (Next.js)
```

```typescript
// main.tsx (React)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

</setup_react>

<usequery>
## useQuery - 데이터 조회

### 기본 사용법

```typescript
import { useQuery } from '@tanstack/react-query';

// API 함수
async function fetchUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// 컴포넌트에서 사용
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### 타입 안전성

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
}

function useUser(userId: string) {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
  });
}

// 사용
const { data } = useUser('123'); // data는 User | undefined
```

### Query Options

```typescript
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5분 동안 fresh
  cacheTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
  refetchOnWindowFocus: true, // 윈도우 포커스 시 재요청
  refetchOnMount: true, // 마운트 시 재요청
  refetchInterval: 30000, // 30초마다 자동 재요청
  retry: 3, // 실패 시 3번 재시도
  enabled: !!userId, // 조건부 실행
});
```

</usequery>

<usemutation>
## useMutation - 데이터 변경

### 기본 사용법

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateUserData {
  name: string;
  email: string;
}

async function createUser(data: CreateUserData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 성공 시 users 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>

      {mutation.isError && <p>Error: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>User created successfully!</p>}
    </form>
  );
}
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    // 진행 중인 refetch 취소
    await queryClient.cancelQueries({ queryKey: ['users'] });

    // 이전 데이터 백업
    const previousUsers = queryClient.getQueryData(['users']);

    // Optimistic update
    queryClient.setQueryData(['users'], (old: User[]) => [...old, newUser]);

    // 롤백용 데이터 반환
    return { previousUsers };
  },
  onError: (err, newUser, context) => {
    // 에러 시 롤백
    if (context?.previousUsers) {
      queryClient.setQueryData(['users'], context.previousUsers);
    }
  },
  onSettled: () => {
    // 완료 후 재검증
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

</usemutation>

<custom_hooks>

## 커스텀 Hooks 패턴

### User Hooks

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
}

// 전체 목록 조회
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
  });
}

// 단일 조회
export function useUser(userId: string) {
  return useQuery<User>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });
}

// 생성
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<User, 'id'>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// 수정
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: User) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}

// 삭제
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 컴포넌트에서 사용

```typescript
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers';

function UserList() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button
        onClick={() =>
          createUser.mutate({ name: 'New', email: 'new@example.com' })
        }
      >
        Add User
      </button>

      {users?.map((user) => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => deleteUser.mutate(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

</custom_hooks>

<pagination>
## Pagination & Infinite Query

### 페이지네이션

```typescript
function UserListPaginated() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchUsers(page),
    keepPreviousData: true, // 이전 데이터 유지
  });

  return (
    <div>
      {data?.users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}

      <button
        onClick={() => setPage((old) => Math.max(old - 1, 1))}
        disabled={page === 1}
      >
        Previous
      </button>

      <button
        onClick={() => setPage((old) => old + 1)}
        disabled={!data?.hasMore}
      >
        Next
      </button>
    </div>
  );
}
```

### Infinite Scroll

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function UserListInfinite() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['users'],
      queryFn: ({ pageParam = 1 }) => fetchUsers(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  return (
    <div>
      {data?.pages.map((page) => (
        <React.Fragment key={page.page}>
          {page.users.map((user) => (
            <div key={user.id}>{user.name}</div>
          ))}
        </React.Fragment>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}
```

</pagination>

<best_practices>

## 모범 사례

### Query Key 관리

```typescript
// ✅ Query Keys를 상수로 관리
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
};

// 사용
useQuery({
  queryKey: queryKeys.users.detail(userId),
  queryFn: () => fetchUser(userId),
});

// 무효화
queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
```

### 에러 처리

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  retry: (failureCount, error) => {
    // 404는 재시도하지 않음
    if (error.status === 404) return false;
    return failureCount < 3;
  },
  onError: (error) => {
    // 전역 에러 처리
    console.error('Query failed:', error);
  },
});
```

### Loading States

```typescript
function Component() {
  const query = useQuery({ ... })

  if (query.isLoading) return <Spinner />
  if (query.isError) return <ErrorMessage error={query.error} />
  if (!query.data) return null

  return <div>{query.data.map(...)}</div>
}
```

</best_practices>

<checklist>
## 개발 체크리스트

- [ ] QueryClient Provider 설정
- [ ] DevTools 추가 (개발 환경)
- [ ] Query Key 체계적 관리
- [ ] 커스텀 hooks로 분리
- [ ] 적절한 staleTime 설정
- [ ] Mutation 후 invalidate
- [ ] 에러 처리 구현
- [ ] Loading 상태 처리
- [ ] 타입 정의
      </checklist>
