---
description: TanStack Query useQuery 훅 빠르게 생성
argument-hint: <리소스명> [옵션]
---

# TanStack Query 훅 생성

TanStack Query의 useQuery 훅을 빠르게 생성합니다.

## 사용법

```
/query useUser
/query useProducts --infinite
/query usePosts --pagination
/query useProfile --dependent
```

## 기본 Query 훅

### 단건 조회
```typescript
// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/api/users'
import type { User } from '@/types/user'

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  })
}

// 사용
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user, isLoading, error } = useUser(userId)

  if (isLoading) return <Loading />
  if (error) return <Error error={error} />
  if (!user) return null

  return <div>{user.name}</div>
}
```

### 목록 조회
```typescript
// src/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/api/users'
import type { User } from '@/types/user'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}

// 사용
const UserList = () => {
  const { data: users, isLoading } = useUsers()

  if (isLoading) return <Loading />

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## 고급 패턴

### Pagination (페이지네이션)
```typescript
// src/hooks/useUsersPaginated.ts
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/api/users'

export const useUsersPaginated = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['users', 'paginated', page, pageSize],
    queryFn: () => getUsers({ page, pageSize }),
    placeholderData: (previousData) => previousData,
  })
}

// 사용
const UserList = () => {
  const [page, setPage] = useState(1)
  const { data, isLoading, isPlaceholderData } = useUsersPaginated(page)

  return (
    <div>
      {data?.items.map((user) => <UserCard key={user.id} user={user} />)}
      <Pagination
        page={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        disabled={isPlaceholderData}
      />
    </div>
  )
}
```

### Infinite Scroll (무한 스크롤)
```typescript
// src/hooks/useUsersInfinite.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { getUsers } from '@/api/users'

export const useUsersInfinite = () => {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) => getUsers({ page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
  })
}

// 사용
const InfiniteUserList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div>
      {data?.pages.map((page) =>
        page.items.map((user) => <UserCard key={user.id} user={user} />)
      )}
      <div ref={ref}>{isFetchingNextPage && 'Loading...'}</div>
    </div>
  )
}
```

### Dependent Query (의존 쿼리)
```typescript
// src/hooks/useUserWithPosts.ts
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/api/users'
import { getPostsByUserId } from '@/api/posts'

export const useUserWithPosts = (userId: string) => {
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  })

  const postsQuery = useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => getPostsByUserId(userId),
    enabled: !!userQuery.data,
  })

  return {
    user: userQuery.data,
    posts: postsQuery.data,
    isLoading: userQuery.isLoading || postsQuery.isLoading,
    error: userQuery.error || postsQuery.error,
  }
}

// 사용
const UserProfile = ({ userId }: { userId: string }) => {
  const { user, posts, isLoading } = useUserWithPosts(userId)

  if (isLoading) return <Loading />

  return (
    <div>
      <h1>{user?.name}</h1>
      <PostList posts={posts} />
    </div>
  )
}
```

### Parallel Queries (병렬 쿼리)
```typescript
// src/hooks/useDashboardData.ts
import { useQueries } from '@tanstack/react-query'
import { getUsers } from '@/api/users'
import { getPosts } from '@/api/posts'
import { getComments } from '@/api/comments'

export const useDashboardData = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['users'],
        queryFn: getUsers,
      },
      {
        queryKey: ['posts'],
        queryFn: getPosts,
      },
      {
        queryKey: ['comments'],
        queryFn: getComments,
      },
    ],
  })

  return {
    users: results[0].data,
    posts: results[1].data,
    comments: results[2].data,
    isLoading: results.some((r) => r.isLoading),
    error: results.find((r) => r.error)?.error,
  }
}
```

### Search with Debounce (검색 + Debounce)
```typescript
// src/hooks/useSearchUsers.ts
import { useQuery } from '@tanstack/react-query'
import { searchUsers } from '@/api/users'
import { useDebounce } from '@/hooks/useDebounce'

export const useSearchUsers = (query: string) => {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  })
}

// 사용
const SearchUsers = () => {
  const [search, setSearch] = useState('')
  const { data: users, isLoading } = useSearchUsers(search)

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
      />
      {isLoading && <Loading />}
      {users?.map((user) => <UserCard key={user.id} user={user} />)}
    </div>
  )
}
```

## Query 옵션

### Stale Time & Cache Time
```typescript
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // 5분 동안 fresh
    gcTime: 1000 * 60 * 30,    // 30분 동안 캐시 유지
  })
}
```

### Retry & Retry Delay
```typescript
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
```

### Refetch Intervals
```typescript
export const useRealtimeData = () => {
  return useQuery({
    queryKey: ['realtime'],
    queryFn: getRealtimeData,
    refetchInterval: 3000, // 3초마다 자동 refetch
  })
}
```

### Select (데이터 변환)
```typescript
export const useUserNames = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    select: (data) => data.map((user) => user.name),
  })
}
```

## Suspense Mode

```typescript
// src/hooks/useUserSuspense.ts
import { useSuspenseQuery } from '@tanstack/react-query'
import { getUser } from '@/api/users'

export const useUserSuspense = (id: string) => {
  return useSuspenseQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
  })
}

// 사용 (Suspense 필요)
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user } = useUserSuspense(userId) // error, isLoading 없음

  return <div>{user.name}</div>
}

// 상위 컴포넌트
const App = () => (
  <Suspense fallback={<Loading />}>
    <ErrorBoundary>
      <UserProfile userId="123" />
    </ErrorBoundary>
  </Suspense>
)
```

## 생성 프로세스

### 1단계: Query 종류 결정
- 기본 Query
- Infinite Query
- Paginated Query
- Dependent Query

### 2단계: 파일 생성
```bash
src/hooks/use{ResourceName}.ts
```

### 3단계: QueryKey 정의
```typescript
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
```

### 4단계: 훅 작성
```typescript
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
  })
}
```

## 디렉토리 구조

```
src/
  hooks/
    ├── queries/
    │   ├── useUser.ts
    │   ├── useUsers.ts
    │   ├── useUsersPaginated.ts
    │   └── useUsersInfinite.ts
    └── keys/
        └── userKeys.ts
```

## 사용 예시

```
사용자: /query useProducts
```

**생성 파일:**
- `src/hooks/useProducts.ts`
- queryKey, queryFn 포함
- TypeScript 타입 포함

```
사용자: /query useUsers --infinite
```

**생성 파일:**
- `src/hooks/useUsersInfinite.ts`
- useInfiniteQuery 사용
- getNextPageParam 포함

## 주의사항

- **QueryKey**: 고유하고 예측 가능한 키 사용
- **Enabled**: 조건부 쿼리는 enabled 옵션 사용
- **타입**: API 응답 타입 명시
- **에러 처리**: 적절한 에러 핸들링

## 참고

- TanStack Query 공식 문서: https://tanstack.com/query
- Query Keys: https://tanstack.com/query/latest/docs/react/guides/query-keys
- Query Options: https://tanstack.com/query/latest/docs/react/reference/useQuery
