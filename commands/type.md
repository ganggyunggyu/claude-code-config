---
description: TypeScript 타입 정의 자동 생성
argument-hint: <타입명> [옵션]
---

# TypeScript 타입 정의 생성

프로젝트에 필요한 TypeScript 타입, 인터페이스, DTO를 자동으로 생성합니다.

## 사용법

```
/type User
/type Post --dto
/type Product --full
/type Response<T> --generic
```

## 기본 타입 정의

### Interface
```typescript
// src/types/user.ts
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}
```

### Type Alias
```typescript
// src/types/user.ts
export type UserId = string

export type UserRole = 'admin' | 'user' | 'guest'

export type UserStatus = 'active' | 'inactive' | 'banned'
```

### DTO (Data Transfer Object)
```typescript
// src/types/user.ts
export interface CreateUserDto {
  email: string
  name: string
  password: string
}

export interface UpdateUserDto {
  email?: string
  name?: string
}

export type UserResponseDto = Omit<User, 'password'>
```

## 생성 템플릿

### 기본 Entity
```typescript
// src/types/post.ts
export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export type PostStatus = 'draft' | 'published' | 'archived'
```

### DTO 포함 (--dto)
```typescript
// src/types/post.ts
export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

// 생성용 DTO
export interface CreatePostDto {
  title: string
  content: string
  authorId: string
}

// 수정용 DTO (모든 필드 선택적)
export interface UpdatePostDto {
  title?: string
  content?: string
  published?: boolean
}

// 응답용 DTO
export interface PostResponseDto extends Post {
  author: {
    id: string
    name: string
  }
  commentsCount: number
  likesCount: number
}

// 목록 조회용 DTO
export interface PostListDto {
  id: string
  title: string
  authorId: string
  published: boolean
  createdAt: Date
}
```

### 전체 타입 세트 (--full)
```typescript
// src/types/user.ts

// Base Entity
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

// Enums
export type UserRole = 'admin' | 'user' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'banned'

// DTOs
export interface CreateUserDto {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface UpdateUserDto {
  email?: string
  name?: string
  avatar?: string
  bio?: string
}

export interface LoginDto {
  email: string
  password: string
}

// Response DTOs
export type UserResponseDto = Omit<User, 'password'>

export interface UserWithStatsDto extends UserResponseDto {
  postsCount: number
  followersCount: number
  followingCount: number
}

// Query DTOs
export interface UserQueryDto {
  search?: string
  role?: UserRole
  status?: UserStatus
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
}

// Utility Types
export type PartialUser = Partial<User>
export type RequiredUser = Required<User>
export type UserKeys = keyof User
export type UserValues = User[UserKeys]
```

### Generic 타입 (--generic)
```typescript
// src/types/common.ts

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: Date
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Error Response
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: Date
}

// Resource with ID
export interface WithId<T> extends T {
  id: string
}

// Resource with Timestamps
export interface WithTimestamps<T> extends T {
  createdAt: Date
  updatedAt: Date
}

// Nullable type
export type Nullable<T> = T | null

// Optional fields
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
```

## 고급 패턴

### Discriminated Union
```typescript
export interface LoadingState {
  status: 'loading'
}

export interface SuccessState<T> {
  status: 'success'
  data: T
}

export interface ErrorState {
  status: 'error'
  error: Error
}

export type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState

// 사용 예시
const handleState = (state: AsyncState<User>) => {
  switch (state.status) {
    case 'loading':
      return <Spinner />
    case 'success':
      return <div>{state.data.name}</div>
    case 'error':
      return <div>Error: {state.error.message}</div>
  }
}
```

### Mapped Types
```typescript
// 모든 필드를 readonly로
export type ReadonlyUser = {
  readonly [K in keyof User]: User[K]
}

// 특정 필드만 선택
export type UserBasicInfo = Pick<User, 'id' | 'name' | 'email'>

// 특정 필드 제외
export type UserWithoutPassword = Omit<User, 'password'>

// 필드를 nullable로
export type NullableUser = {
  [K in keyof User]: User[K] | null
}
```

### Conditional Types
```typescript
// T가 배열이면 요소 타입 추출, 아니면 T 그대로
export type Unpacked<T> = T extends (infer U)[] ? U : T

// 함수 반환 타입 추출
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// Promise 언래핑
export type Awaited<T> = T extends Promise<infer U> ? U : T
```

### Utility Types 조합
```typescript
// 생성용 (id, timestamps 제외)
export type CreateDto<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

// 수정용 (선택적 필드로 변경)
export type UpdateDto<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>

// 응답용 (민감 정보 제외)
export type ResponseDto<T, K extends keyof T> = Omit<T, K>

// 사용 예시
type CreateUserDto = CreateDto<User>
type UpdateUserDto = UpdateDto<User>
type UserResponseDto = ResponseDto<User, 'password'>
```

## NestJS DTO with Validation (--nestjs)

```typescript
// src/modules/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(2)
  name: string

  @IsString()
  @MinLength(8)
  password: string

  @IsOptional()
  @IsString()
  avatar?: string
}

// src/modules/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

// src/modules/users/dto/user-response.dto.ts
import { Exclude } from 'class-transformer'

export class UserResponseDto {
  id: string
  email: string
  name: string
  avatar?: string

  @Exclude()
  password: string

  createdAt: Date
  updatedAt: Date
}
```

## Zod Schema 생성 (--zod)

```typescript
// src/schemas/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['admin', 'user', 'guest']),
  status: z.enum(['active', 'inactive', 'banned']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8),
})

export const updateUserSchema = createUserSchema.partial()

// 타입 추론
export type User = z.infer<typeof userSchema>
export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>
```

## 타입 가드 생성 (--guards)

```typescript
// src/types/user.ts

export interface User {
  id: string
  name: string
  email: string
}

// 타입 가드
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    typeof (value as User).id === 'string' &&
    typeof (value as User).name === 'string' &&
    typeof (value as User).email === 'string'
  )
}

export const isUserArray = (value: unknown): value is User[] => {
  return Array.isArray(value) && value.every(isUser)
}

// 사용 예시
const data: unknown = fetchUserData()

if (isUser(data)) {
  console.log(data.name) // 타입 안전
}
```

## 생성 프로세스

### 1단계: 프로젝트 구조 확인
```bash
# types 디렉토리 확인
ls src/types/

# 기존 타입 파일 확인
ls src/types/*.ts
```

### 2단계: 타입 종류 결정
- Entity: 데이터베이스 모델
- DTO: 데이터 전송 객체
- Response: API 응답
- Query: 조회 파라미터

### 3단계: 관련 타입 자동 생성
- 기본 인터페이스
- DTO (Create, Update)
- Response DTO
- Enum types

## 사용 예시

```
사용자: /type Product --dto
```

**생성 파일:**
```typescript
// src/types/product.ts
export interface Product {
  id: string
  name: string
  price: number
  description: string
  stock: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductDto {
  name: string
  price: number
  description: string
  stock: number
  categoryId: string
}

export interface UpdateProductDto {
  name?: string
  price?: number
  description?: string
  stock?: number
  categoryId?: string
}
```

```
사용자: /type ApiResponse --generic
```

**생성 파일:**
```typescript
// src/types/common.ts
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
```

## 주의사항

- **네이밍**: PascalCase 사용
- **파일 구조**: 도메인별로 분리
- **타입 재사용**: 중복 최소화
- **DTO 네이밍**: 명확한 용도 표시
- **제네릭**: 재사용 가능한 타입은 제네릭으로

## 참고

- TypeScript 공식 문서: https://www.typescriptlang.org
- Zod: https://zod.dev
- class-validator: https://github.com/typestack/class-validator
