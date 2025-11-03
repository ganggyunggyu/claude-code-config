---
description: Jest/Vitest 테스트 자동 생성
argument-hint: <파일경로>
---

# 테스트 자동 생성

Jest 또는 Vitest를 사용한 테스트 파일을 자동으로 생성합니다.

## 사용법

```
/test src/components/UserProfile.tsx
/test src/hooks/useDebounce.ts
/test src/api/users.ts
/test src/utils/formatDate.ts
```

## React 컴포넌트 테스트

### 기본 컴포넌트
```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Props 테스트
```typescript
// src/components/UserCard.test.tsx
import { render, screen } from '@testing-library/react'
import UserCard from './UserCard'

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  }

  it('renders user information', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('handles missing user gracefully', () => {
    render(<UserCard user={null} />)
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })
})
```

## 비동기 테스트

### TanStack Query 컴포넌트
```typescript
// src/components/UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserList from './UserList'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('UserList', () => {
  it('renders loading state', () => {
    render(<UserList />, { wrapper: createWrapper() })
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders users after loading', async () => {
    render(<UserList />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
```

## 커스텀 훅 테스트

### renderHook 사용
```typescript
// src/hooks/useDebounce.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } }
    )

    expect(result.current).toBe('hello')

    rerender({ value: 'world' })
    expect(result.current).toBe('hello') // Still old value

    await waitFor(() => {
      expect(result.current).toBe('world')
    }, { timeout: 600 })
  })
})
```

### Query Hook 테스트
```typescript
// src/hooks/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUsers } from './useUsers'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(3)
  })
})
```

## API/Utils 테스트

### Utility 함수
```typescript
// src/utils/formatDate.test.ts
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats date to YYYY-MM-DD', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('2024-01-15')
  })

  it('handles invalid date', () => {
    expect(formatDate(new Date('invalid'))).toBe('')
  })

  it('formats date with custom format', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/15/2024')
  })
})
```

### API 함수
```typescript
// src/api/users.test.ts
import { vi } from 'vitest'
import { getUsers, getUserById } from './users'
import { api } from './client'

vi.mock('./client')

describe('users API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('fetches users successfully', async () => {
      const mockUsers = [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' },
      ]

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUsers })

      const users = await getUsers()

      expect(api.get).toHaveBeenCalledWith('/users')
      expect(users).toEqual(mockUsers)
    })

    it('handles API error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      await expect(getUsers()).rejects.toThrow('Network error')
    })
  })

  describe('getUserById', () => {
    it('fetches user by id', async () => {
      const mockUser = { id: '1', name: 'John' }

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser })

      const user = await getUserById('1')

      expect(api.get).toHaveBeenCalledWith('/users/1')
      expect(user).toEqual(mockUser)
    })
  })
})
```

## 통합 테스트

### Form 제출 Flow
```typescript
// src/components/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from './LoginForm'
import { login } from '@/api/auth'

vi.mock('@/api/auth')

describe('LoginForm Integration', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    vi.mocked(login).mockResolvedValueOnce({ token: 'abc123' })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
  })
})
```

## MSW (Mock Service Worker)

### API Mocking
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' },
    ])
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({ id, name: 'John Doe' })
  }),

  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json()
    return HttpResponse.json({ id: '3', ...newUser }, { status: 201 })
  }),
]

// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Coverage 확인

```bash
# Vitest
vitest --coverage

# Jest
jest --coverage
```

## 생성 프로세스

### 1단계: 파일 분석
- 컴포넌트 / 훅 / 유틸리티 파악
- Props, 파라미터 추출

### 2단계: 테스트 파일 생성
```bash
{원본파일명}.test.{ts|tsx}
```

### 3단계: 테스트 케이스 작성
- 기본 렌더링
- Props 변화
- 이벤트 핸들링
- 비동기 처리
- 에러 케이스

## 사용 예시

```
사용자: /test src/components/Button.tsx
```

**생성 파일:**
- `src/components/Button.test.tsx`
- 기본 렌더링, 클릭, disabled 테스트 포함

```
사용자: /test src/hooks/useDebounce.ts
```

**생성 파일:**
- `src/hooks/useDebounce.test.ts`
- renderHook 사용, 값 변화 테스트 포함

## 주의사항

- **격리**: 각 테스트는 독립적으로
- **Mock**: 외부 의존성은 Mock 처리
- **Cleanup**: afterEach로 정리
- **Async**: waitFor, findBy 활용

## 참고

- Testing Library: https://testing-library.com/
- Vitest: https://vitest.dev/
- MSW: https://mswjs.io/
- Jest: https://jestjs.io/
