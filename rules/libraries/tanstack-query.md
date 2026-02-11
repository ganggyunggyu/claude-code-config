# TanStack Query Guidelines

Required for all frontend projects with server state.

## Setup

### React/Next.js

```bash
pnpm add @tanstack/react-query
```

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <YourApp />
  </QueryClientProvider>
);
```

### Vue/Nuxt

```bash
pnpm add @tanstack/vue-query
```

## useQuery

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
}

const useUser = (userId: string) => {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};
```

### Query Options

```typescript
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000,        // 5 min fresh
  cacheTime: 10 * 60 * 1000,       // 10 min cache
  refetchOnWindowFocus: true,
  retry: 3,
  enabled: !!userId,
});
```

## useMutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ['users'] });
    const previousUsers = queryClient.getQueryData(['users']);
    queryClient.setQueryData(['users'], (old: User[]) => [...old, newUser]);
    return { previousUsers };
  },
  onError: (err, newUser, context) => {
    if (context?.previousUsers) {
      queryClient.setQueryData(['users'], context.previousUsers);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

## Custom Hooks Pattern (CRUD)

```typescript
// hooks/useUsers.ts
export const useUsers = () =>
  useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users') });

export const useUser = (userId: string) =>
  useQuery<User>({ queryKey: ['users', userId], queryFn: () => api.get(`/users/${userId}`), enabled: !!userId });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<User, 'id'>) => api.post('/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: User) => api.put(`/users/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};
```

## Query Key Management

```typescript
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
};
```

## Infinite Query

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ['users'],
    queryFn: ({ pageParam = 1 }) => fetchUsers(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
```

## Checklist

- [ ] QueryClientProvider configured
- [ ] Query keys managed as constants
- [ ] Custom hooks per entity
- [ ] Appropriate staleTime set
- [ ] Mutation invalidates related queries
- [ ] Error and loading states handled
- [ ] Types defined
