---
description: TanStack Query useMutation 훅 빠르게 생성
argument-hint: <액션명> [옵션]
---

# TanStack Mutation 훅 생성

TanStack Query의 useMutation 훅을 빠르게 생성합니다.

## 사용법

```
/mutation useCreateUser
/mutation useUpdatePost --optimistic
/mutation useDeleteComment
/mutation useUploadImage --progress
```

## 기본 Mutation 훅

### 생성 (Create)
```typescript
// src/hooks/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/api/users'
import type { CreateUserDto } from '@/types/user'

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateUserDto) => createUser(dto),
    onSuccess: (newUser) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // 또는 직접 캐시 업데이트
      queryClient.setQueryData(['user', newUser.id], newUser)
    },
  })
}

// 사용
const CreateUserForm = () => {
  const createUser = useCreateUser()

  const handleSubmit = async (data: CreateUserDto) => {
    try {
      await createUser.mutateAsync(data)
      toast.success('User created!')
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

### 수정 (Update)
```typescript
// src/hooks/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '@/api/users'
import type { UpdateUserDto } from '@/types/user'

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      updateUser(id, dto),
    onSuccess: (updatedUser, { id }) => {
      // 특정 유저 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      // 유저 목록도 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// 사용
const EditUserForm = ({ userId }: { userId: string }) => {
  const updateUser = useUpdateUser()

  const handleSave = async (updates: UpdateUserDto) => {
    await updateUser.mutateAsync({ id: userId, dto: updates })
  }

  return <form onSubmit={handleSave}>{/* fields */}</form>
}
```

### 삭제 (Delete)
```typescript
// src/hooks/useDeleteUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUser } from '@/api/users'

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_, deletedId) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: ['user', deletedId] })
      // 목록 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// 사용
const DeleteButton = ({ userId }: { userId: string }) => {
  const deleteUser = useDeleteUser()

  const handleDelete = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteUser.mutateAsync(userId)
    }
  }

  return (
    <button onClick={handleDelete} disabled={deleteUser.isPending}>
      {deleteUser.isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

## Optimistic Update (낙관적 업데이트)

### 좋아요 기능
```typescript
// src/hooks/useLikePost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likePost } from '@/api/posts'
import type { Post } from '@/types/post'

export const useLikePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => likePost(postId),

    // Optimistic update
    onMutate: async (postId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['post', postId] })

      // 이전 데이터 백업
      const previousPost = queryClient.getQueryData<Post>(['post', postId])

      // Optimistic update 적용
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old
        return {
          ...old,
          likes: old.likes + 1,
          isLiked: true,
        }
      })

      return { previousPost }
    },

    // 에러 발생 시 롤백
    onError: (err, postId, context) => {
      queryClient.setQueryData(['post', postId], context?.previousPost)
    },

    // 성공 시 서버 데이터로 교체
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}

// 사용
const LikeButton = ({ postId }: { postId: string }) => {
  const likePost = useLikePost()

  return (
    <button onClick={() => likePost.mutate(postId)}>
      Like
    </button>
  )
}
```

### 목록에서 아이템 추가
```typescript
// src/hooks/useAddTodo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTodo } from '@/api/todos'
import type { Todo, CreateTodoDto } from '@/types/todo'

export const useAddTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateTodoDto) => createTodo(dto),

    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      // Optimistic update: 임시 ID로 추가
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => [
        ...old,
        { ...newTodo, id: 'temp-' + Date.now(), completed: false },
      ])

      return { previousTodos }
    },

    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

## Multiple Mutations (순차/병렬 실행)

### 순차 실행
```typescript
// src/hooks/useCreateUserWithProfile.ts
export const useCreateUserWithProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { user: CreateUserDto; profile: CreateProfileDto }) => {
      // 1. 유저 생성
      const user = await createUser(data.user)
      // 2. 프로필 생성 (유저 ID 필요)
      const profile = await createProfile(user.id, data.profile)

      return { user, profile }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### 병렬 실행 (Promise.all)
```typescript
// src/hooks/useBulkDelete.ts
export const useBulkDelete = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteUser(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

## Upload with Progress (업로드 진행률)

```typescript
// src/hooks/useUploadImage.ts
import { useMutation } from '@tanstack/react-query'
import { uploadImage } from '@/api/upload'
import { useState } from 'react'

export const useUploadImage = () => {
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: (file: File) =>
      uploadImage(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        )
        setProgress(percentCompleted)
      }),
    onSuccess: () => {
      setProgress(0)
    },
  })

  return { ...mutation, progress }
}

// 사용
const ImageUpload = () => {
  const { mutate, progress, isPending } = useUploadImage()

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) mutate(file)
        }}
      />
      {isPending && <ProgressBar value={progress} />}
    </div>
  )
}
```

## Error Handling (에러 처리)

### Toast 알림
```typescript
// src/hooks/useCreatePost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost } from '@/api/posts'
import { toast } from 'react-hot-toast'

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast.success('게시글이 생성되었습니다!')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '게시글 생성에 실패했습니다')
    },
  })
}
```

### Retry (재시도)
```typescript
export const useCreateUser = () => {
  return useMutation({
    mutationFn: createUser,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
```

## 생성 프로세스

### 1단계: Mutation 종류 결정
- Create
- Update
- Delete
- Custom Action

### 2단계: 파일 생성
```bash
src/hooks/use{ActionName}.ts
```

### 3단계: Mutation 작성
```typescript
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### 4단계: 타입 정의
```typescript
interface MutationVariables {
  id: string
  dto: UpdateDto
}
```

## 디렉토리 구조

```
src/
  hooks/
    ├── mutations/
    │   ├── useCreateUser.ts
    │   ├── useUpdateUser.ts
    │   ├── useDeleteUser.ts
    │   └── useLikePost.ts
    └── index.ts
```

## 사용 예시

```
사용자: /mutation useCreatePost
```

**생성 파일:**
- `src/hooks/useCreatePost.ts`
- mutationFn, onSuccess 포함
- 캐시 무효화 로직 포함

```
사용자: /mutation useLikePost --optimistic
```

**생성 파일:**
- `src/hooks/useLikePost.ts`
- onMutate, onError, onSettled 포함
- Optimistic update 로직 포함

## 주의사항

- **캐시 무효화**: 적절한 queryKey 무효화 필수
- **Optimistic Update**: onError에서 롤백 처리
- **타입 안정성**: mutationFn 파라미터 타입 명시
- **에러 처리**: onError 핸들러 구현

## 참고

- TanStack Query Mutations: https://tanstack.com/query/latest/docs/react/guides/mutations
- Optimistic Updates: https://tanstack.com/query/latest/docs/react/guides/optimistic-updates
- useMutation: https://tanstack.com/query/latest/docs/react/reference/useMutation
