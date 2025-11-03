---
description: React 컴포넌트 빠르게 생성
argument-hint: <컴포넌트명> [옵션]
---

# React 컴포넌트 생성

React 컴포넌트를 규칙에 맞게 빠르게 생성합니다.

## 사용법

```
/component UserProfile
/component Button --with-styles
/component PostList --with-query
/component Header --full
```

## 기본 규칙

### 파일명
- PascalCase 사용
- `src/components/` 또는 프로젝트 구조에 맞게
- 예: `UserProfile.tsx`, `Button.tsx`

### 코드 스타일
- 함수형 컴포넌트
- 구조분해할당 필수
- TypeScript Props 타입 정의
- export default 사용

## 생성 템플릿

### 기본 컴포넌트

```typescript
interface UserProfileProps {
  userId: string
}

const UserProfile = ({ userId }: UserProfileProps) => {
  return (
    <div>
      <h1>User Profile</h1>
    </div>
  )
}

export default UserProfile
```

### TanStack Query 포함 (--with-query)

```typescript
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/api/users'

interface UserProfileProps {
  userId: string
}

const UserProfile = ({ userId }: UserProfileProps) => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return null

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

export default UserProfile
```

### Jotai 상태 포함 (--with-state)

```typescript
import { useAtom } from 'jotai'
import { userAtom } from '@/stores/user'

interface UserProfileProps {
  userId: string
}

const UserProfile = ({ userId }: UserProfileProps) => {
  const [user, setUser] = useAtom(userAtom)

  return (
    <div>
      <h1>{user?.name}</h1>
    </div>
  )
}

export default UserProfile
```

### 스타일 포함 (--with-styles)

Tailwind CSS 사용 시:
```typescript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

const Button = ({ children, variant = 'primary', onClick }: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {children}
    </button>
  )
}

export default Button
```

### 전체 기능 포함 (--full)

```typescript
import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { getUserById } from '@/api/users'
import { selectedUserIdAtom } from '@/stores/user'

interface UserProfileProps {
  userId?: string
  onUserClick?: (userId: string) => void
}

const UserProfile = ({ userId, onUserClick }: UserProfileProps) => {
  const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom)
  const currentUserId = userId ?? selectedUserId

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: () => getUserById(currentUserId),
    enabled: !!currentUserId,
  })

  const handleClick = () => {
    if (user && onUserClick) {
      onUserClick(user.id)
      setSelectedUserId(user.id)
    }
  }

  if (!currentUserId) return null
  if (isLoading) return <div className="animate-pulse">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!user) return null

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </div>
      <button
        onClick={handleClick}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Select User
      </button>
    </div>
  )
}

export default UserProfile
```

## 생성 프로세스

### 1단계: 프로젝트 구조 확인
```bash
# components 디렉토리 찾기
find src -type d -name "components" | head -1
```

### 2단계: 컴포넌트 타입 결정
- **Presentational**: UI만 담당, 로직 없음
- **Container**: 데이터 페칭 및 상태 관리
- **Page**: 라우트 컴포넌트
- **Layout**: 레이아웃 컴포넌트

### 3단계: 필요한 imports 확인
```typescript
// 항상 필요
import { useState, useEffect } from 'react'

// 조건부
import { useQuery, useMutation } from '@tanstack/react-query' // --with-query
import { useAtom } from 'jotai' // --with-state
import { useNavigate, useParams } from 'react-router-dom' // 라우팅 필요시
```

### 4단계: Props 타입 정의
```typescript
// 필수 props
interface ComponentNameProps {
  id: string
  name: string
}

// 선택적 props
interface ComponentNameProps {
  id: string
  name?: string
  onSelect?: (id: string) => void
  className?: string
}

// children 포함
interface ComponentNameProps {
  children: React.ReactNode
  className?: string
}
```

### 5단계: 파일 생성
```bash
# 컴포넌트 파일
src/components/UserProfile.tsx

# 필요시 관련 파일들도 함께
src/components/UserProfile.tsx
src/components/UserProfile.styles.ts  # styled-components
src/components/UserProfile.test.tsx   # 테스트
```

## 옵션 설명

| 옵션 | 설명 | 포함 사항 |
|------|------|----------|
| 기본 | 최소 컴포넌트 | Props, 기본 JSX |
| `--with-query` | TanStack Query | useQuery, 로딩/에러 처리 |
| `--with-state` | 상태 관리 | useState, Jotai atom |
| `--with-styles` | 스타일링 | Tailwind 클래스, variant |
| `--full` | 전체 기능 | Query + State + Styles |

## 컴포넌트 종류별 예시

### Form 컴포넌트
```typescript
interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Login
      </button>
    </form>
  )
}

export default LoginForm
```

### List 컴포넌트
```typescript
import { useQuery } from '@tanstack/react-query'
import { getPosts } from '@/api/posts'

interface Post {
  id: string
  title: string
  content: string
}

const PostList = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  if (isLoading) return <div>Loading...</div>
  if (!posts?.length) return <div>No posts found</div>

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p className="text-gray-600">{post.content}</p>
        </article>
      ))}
    </div>
  )
}

export default PostList
```

### Modal 컴포넌트
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
```

## 사용 예시

```
사용자: /component UserCard --with-query
```

**생성 결과:**
- `src/components/UserCard.tsx`
- TanStack Query 포함
- 로딩/에러 처리
- Props 타입 정의

```
사용자: /component Modal --with-styles
```

**생성 결과:**
- `src/components/Modal.tsx`
- Tailwind 스타일 포함
- Variant 지원
- 애니메이션 클래스

## 주의사항

- **네이밍**: PascalCase 엄수
- **구조분해**: Props는 반드시 구조분해
- **타입**: Props 타입 필수 정의
- **주석**: 중요한 것만 작성
- **Export**: default export 사용

## 참고

- React 공식 문서: https://react.dev
- TanStack Query: https://tanstack.com/query
- Jotai: https://jotai.org
