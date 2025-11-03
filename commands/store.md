---
description: Jotai Atom 상태 관리 자동 생성
argument-hint: <atom명> [옵션]
---

# Jotai Atom 생성

Jotai를 사용한 상태 관리 atom을 자동으로 생성합니다.

## 사용법

```
/store userAtom
/store themeAtom --persist
/store cartAtom --derived
/store authAtom --async
```

## 기본 Atom

### Primitive Atom
```typescript
// src/stores/userAtom.ts
import { atom } from 'jotai'

interface User {
  id: string
  name: string
  email: string
}

export const userAtom = atom<User | null>(null)
```

### 객체 Atom
```typescript
// src/stores/settingsAtom.ts
import { atom } from 'jotai'

interface Settings {
  theme: 'light' | 'dark'
  language: 'ko' | 'en'
  notifications: boolean
}

export const settingsAtom = atom<Settings>({
  theme: 'light',
  language: 'ko',
  notifications: true,
})
```

### 배열 Atom
```typescript
// src/stores/todosAtom.ts
import { atom } from 'jotai'

interface Todo {
  id: string
  text: string
  completed: boolean
}

export const todosAtom = atom<Todo[]>([])
```

## Derived Atom (파생 Atom)

### Read-only Derived
```typescript
// src/stores/cartAtom.ts
import { atom } from 'jotai'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export const cartItemsAtom = atom<CartItem[]>([])

// 파생 atom: 총 가격 계산
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom)
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
})

// 파생 atom: 총 개수
export const cartCountAtom = atom((get) => {
  const items = get(cartItemsAtom)
  return items.reduce((count, item) => count + item.quantity, 0)
})
```

### Read-Write Derived
```typescript
// src/stores/filterAtom.ts
import { atom } from 'jotai'

export const todosAtom = atom<Todo[]>([])
export const filterAtom = atom<'all' | 'active' | 'completed'>('all')

// 필터링된 todos (read-write)
export const filteredTodosAtom = atom(
  (get) => {
    const todos = get(todosAtom)
    const filter = get(filterAtom)

    if (filter === 'all') return todos
    if (filter === 'active') return todos.filter((t) => !t.completed)
    return todos.filter((t) => t.completed)
  },
  (get, set, newTodos: Todo[]) => {
    set(todosAtom, newTodos)
  }
)
```

## Async Atom (비동기)

### 기본 Async Atom
```typescript
// src/stores/userAtom.ts
import { atom } from 'jotai'
import { fetchUser } from '@/api/users'

export const userIdAtom = atom<string | null>(null)

export const userAtom = atom(async (get) => {
  const userId = get(userIdAtom)
  if (!userId) return null

  const user = await fetchUser(userId)
  return user
})
```

### Suspense와 함께 사용
```typescript
// src/stores/postsAtom.ts
import { atom } from 'jotai'
import { fetchPosts } from '@/api/posts'

export const postsAtom = atom(async () => {
  const posts = await fetchPosts()
  return posts
})

// 사용 (Suspense 필요)
const PostList = () => {
  const [posts] = useAtom(postsAtom)

  return (
    <Suspense fallback={<Loading />}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Suspense>
  )
}
```

## Persistent Atom (LocalStorage)

### atomWithStorage 사용
```typescript
// src/stores/themeAtom.ts
import { atomWithStorage } from 'jotai/utils'

type Theme = 'light' | 'dark'

export const themeAtom = atomWithStorage<Theme>('theme', 'light')
```

### 커스텀 Storage
```typescript
// src/stores/userPreferencesAtom.ts
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

interface UserPreferences {
  fontSize: number
  sidebarCollapsed: boolean
  recentSearches: string[]
}

const storage = createJSONStorage<UserPreferences>(() => localStorage)

export const userPreferencesAtom = atomWithStorage<UserPreferences>(
  'user-preferences',
  {
    fontSize: 14,
    sidebarCollapsed: false,
    recentSearches: [],
  },
  storage
)
```

## Atom with Reset (초기화)

```typescript
// src/stores/formAtom.ts
import { atomWithReset } from 'jotai/utils'

interface FormData {
  name: string
  email: string
  message: string
}

export const formAtom = atomWithReset<FormData>({
  name: '',
  email: '',
  message: '',
})

// 사용
const ContactForm = () => {
  const [form, setForm] = useAtom(formAtom)
  const resetForm = useResetAtom(formAtom)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm(form)
    resetForm() // 초기화
  }
}
```

## Atom Family (동적 Atom)

```typescript
// src/stores/postAtomFamily.ts
import { atomFamily } from 'jotai/utils'
import { fetchPost } from '@/api/posts'

export const postAtomFamily = atomFamily((postId: string) =>
  atom(async () => {
    const post = await fetchPost(postId)
    return post
  })
)

// 사용
const PostDetail = ({ postId }: { postId: string }) => {
  const [post] = useAtom(postAtomFamily(postId))
  return <div>{post.title}</div>
}
```

## Actions (업데이트 로직)

```typescript
// src/stores/cartActions.ts
import { atom } from 'jotai'
import { cartItemsAtom } from './cartAtom'

export const addToCartAtom = atom(
  null,
  (get, set, item: CartItem) => {
    const items = get(cartItemsAtom)
    const existingItem = items.find((i) => i.id === item.id)

    if (existingItem) {
      set(
        cartItemsAtom,
        items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      set(cartItemsAtom, [...items, { ...item, quantity: 1 }])
    }
  }
)

export const removeFromCartAtom = atom(
  null,
  (get, set, itemId: string) => {
    const items = get(cartItemsAtom)
    set(
      cartItemsAtom,
      items.filter((item) => item.id !== itemId)
    )
  }
)

export const clearCartAtom = atom(null, (get, set) => {
  set(cartItemsAtom, [])
})

// 사용
const CartActions = () => {
  const [, addToCart] = useAtom(addToCartAtom)
  const [, removeFromCart] = useAtom(removeFromCartAtom)
  const [, clearCart] = useAtom(clearCartAtom)

  return (
    <>
      <button onClick={() => addToCart(item)}>Add</button>
      <button onClick={() => removeFromCart(item.id)}>Remove</button>
      <button onClick={clearCart}>Clear</button>
    </>
  )
}
```

## TanStack Query와 통합

```typescript
// src/stores/queryAtoms.ts
import { atom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { fetchUsers } from '@/api/users'

export const usersAtom = atomWithQuery(() => ({
  queryKey: ['users'],
  queryFn: fetchUsers,
}))

// 사용
const UserList = () => {
  const [{ data, isLoading, error }] = useAtom(usersAtom)

  if (isLoading) return <Loading />
  if (error) return <Error error={error} />

  return <div>{data.map((user) => user.name)}</div>
}
```

## 디렉토리 구조

```
src/
  stores/
    ├── atoms/          # 기본 atoms
    │   ├── userAtom.ts
    │   ├── themeAtom.ts
    │   └── cartAtom.ts
    ├── derived/        # 파생 atoms
    │   ├── cartTotalAtom.ts
    │   └── filteredTodosAtom.ts
    ├── actions/        # action atoms
    │   ├── cartActions.ts
    │   └── todoActions.ts
    └── index.ts        # export all
```

## 생성 프로세스

### 1단계: Atom 타입 결정
- Primitive (기본값)
- Derived (파생)
- Async (비동기)
- Persistent (영속)

### 2단계: 파일 생성
```bash
src/stores/{atomName}.ts
```

### 3단계: 타입 정의
```typescript
interface AtomState {
  // 상태 타입
}
```

### 4단계: Export
```typescript
// src/stores/index.ts
export { userAtom } from './atoms/userAtom'
export { themeAtom } from './atoms/themeAtom'
```

## 사용 예시

```
사용자: /store themeAtom --persist
```

**생성 파일:**
- `src/stores/themeAtom.ts`
- atomWithStorage 사용
- TypeScript 타입 포함

```
사용자: /store cartAtom --derived
```

**생성 파일:**
- `src/stores/cartAtom.ts`
- cartItemsAtom (기본)
- cartTotalAtom (파생)
- cartCountAtom (파생)

## 주의사항

- **원자성**: 각 atom은 하나의 책임만
- **불변성**: 상태 업데이트 시 불변성 유지
- **초기값**: 적절한 초기값 설정
- **타입**: TypeScript 타입 필수

## 참고

- Jotai 공식 문서: https://jotai.org
- Jotai Utils: https://jotai.org/docs/utilities/storage
- atomWithQuery: https://jotai.org/docs/integrations/query
