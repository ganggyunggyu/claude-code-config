---
description: API 엔드포인트 및 TanStack Query 훅 생성
argument-hint: <리소스명> [메서드]
---

# API 엔드포인트 생성

TanStack Query를 사용한 API 클라이언트와 React Query 훅을 자동 생성합니다.

## 사용법

```
/api users
/api posts --full
/api products --crud
```

## 기본 구조

### 1. API 클라이언트 (src/api/)
```typescript
// src/api/users.ts
import { api } from './client'
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user'

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users')
  return data
}

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export const createUser = async (dto: CreateUserDto): Promise<User> => {
  const { data } = await api.post('/users', dto)
  return data
}

export const updateUser = async (id: string, dto: UpdateUserDto): Promise<User> => {
  const { data } = await api.patch(`/users/${id}`, dto)
  return data
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`)
}
```

### 2. React Query 훅 (src/hooks/)
```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '@/api/users'
import type { CreateUserDto, UpdateUserDto } from '@/types/user'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      updateUser(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

## 생성 템플릿

### 기본 GET (목록)
```typescript
// API 클라이언트
export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users')
  return data
}

// React Query 훅
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}

// 사용 예시
const UserList = () => {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### GET (단건) with ID
```typescript
// API 클라이언트
export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`)
  return data
}

// React Query 훅
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  })
}

// 사용 예시
const UserDetail = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = useUser(userId)

  if (isLoading) return <div>Loading...</div>
  if (!user) return null

  return <div>{user.name}</div>
}
```

### POST (생성)
```typescript
// API 클라이언트
export const createUser = async (dto: CreateUserDto): Promise<User> => {
  const { data } = await api.post('/users', dto)
  return data
}

// React Query 훅
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // 또는 직접 캐시 업데이트
      queryClient.setQueryData(['user', newUser.id], newUser)
    },
  })
}

// 사용 예시
const CreateUserForm = () => {
  const createUser = useCreateUser()

  const handleSubmit = async (formData: CreateUserDto) => {
    await createUser.mutateAsync(formData)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### PATCH/PUT (수정)
```typescript
// API 클라이언트
export const updateUser = async (id: string, dto: UpdateUserDto): Promise<User> => {
  const { data } = await api.patch(`/users/${id}`, dto)
  return data
}

// React Query 훅
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      updateUser(id, dto),
    onMutate: async ({ id, dto }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['user', id] })
      const previous = queryClient.getQueryData(['user', id])
      queryClient.setQueryData(['user', id], (old: User) => ({ ...old, ...dto }))
      return { previous }
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['user', id], context?.previous)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// 사용 예시
const EditUserForm = ({ userId }: { userId: string }) => {
  const updateUser = useUpdateUser()

  const handleSave = async (updates: UpdateUserDto) => {
    await updateUser.mutateAsync({ id: userId, dto: updates })
  }

  return <form>...</form>
}
```

### DELETE (삭제)
```typescript
// API 클라이언트
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`)
}

// React Query 훅
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['users'] })
      const previous = queryClient.getQueryData(['users'])
      queryClient.setQueryData(['users'], (old: User[] = []) =>
        old.filter((user) => user.id !== id)
      )
      return { previous }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['users'], context?.previous)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// 사용 예시
const DeleteButton = ({ userId }: { userId: string }) => {
  const deleteUser = useDeleteUser()

  return (
    <button onClick={() => deleteUser.mutate(userId)}>
      Delete
    </button>
  )
}
```

## 고급 패턴

### Pagination
```typescript
export const useUsersPaginated = (page: number, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['users', 'paginated', page, pageSize],
    queryFn: () => getUsers({ page, pageSize }),
    keepPreviousData: true,
  })
}
```

### Infinite Scroll
```typescript
export const useUsersInfinite = () => {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) => getUsers({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined
    },
  })
}
```

### Search with Debounce
```typescript
export const useUserSearch = (query: string) => {
  const debouncedQuery = useDebounce(query, 300)

  return useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  })
}
```

### Dependent Query
```typescript
export const useUserWithPosts = (userId: string) => {
  const { data: user } = useUser(userId)

  return useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => getPostsByUserId(userId),
    enabled: !!user,
  })
}
```

## NestJS 백엔드도 함께 생성 (--with-backend)

```typescript
// src/modules/users/users.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto, UpdateUserDto } from './dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}

// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto, UpdateUserDto } from './dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOneOrFail({ where: { id } })
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto)
    return this.usersRepository.save(user)
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id)
  }
}
```

## 생성 프로세스

### 1단계: 프로젝트 구조 확인
```bash
# API 디렉토리 확인
ls src/api/

# hooks 디렉토리 확인
ls src/hooks/

# types 디렉토리 확인
ls src/types/
```

### 2단계: API 클라이언트 생성
- 기본 CRUD 메서드
- 타입 정의 import
- 에러 핸들링

### 3단계: React Query 훅 생성
- useQuery 훅
- useMutation 훅
- 캐시 무효화 로직

### 4단계: 타입 정의 생성 (없는 경우)
- 리소스 타입
- DTO 타입

## 사용 예시

```
사용자: /api posts --crud
```

**생성 파일:**
- `src/api/posts.ts` - API 클라이언트
- `src/hooks/usePosts.ts` - React Query 훅
- `src/types/post.ts` - 타입 정의

```
사용자: /api users --with-backend
```

**생성 파일 (Frontend):**
- `src/api/users.ts`
- `src/hooks/useUsers.ts`

**생성 파일 (Backend):**
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`
- `src/modules/users/dto/create-user.dto.ts`
- `src/modules/users/dto/update-user.dto.ts`

## 주의사항

- **TanStack Query 필수**: 프로젝트에 설치되어 있어야 함
- **구조분해할당**: 모든 훅에서 사용
- **타입 안정성**: API 응답 타입 필수 정의
- **캐시 무효화**: 적절한 시점에 invalidateQueries
- **에러 핸들링**: 모든 API 호출에 에러 처리

## 참고

- TanStack Query: https://tanstack.com/query
- NestJS: https://nestjs.com
