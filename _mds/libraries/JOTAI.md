# Jotai 사용 지침

<overview>
React/Next.js 사용 시 처음부터 Jotai를 설정하여 사용합니다.
</overview>

<principles>
## 핵심 원칙

- **Action은 스토어에 담지 않음**
- **State 활용 함수는 hooks에 작성**
- **공용 hooks와 도메인 hooks 구분**
  </principles>

<installation>
## 설치

```bash
npm install jotai
# or
yarn add jotai
# or
pnpm add jotai
```

</installation>

<atoms>
## Atoms 정의

### 기본 Atom

```typescript
// atoms/counterAtom.ts
import { atom } from 'jotai';

// 숫자
export const counterAtom = atom(0);

// 문자열
export const nameAtom = atom('');

// 객체
export const userAtom = atom<User | null>(null);

// 배열
export const todosAtom = atom<Todo[]>([]);

// Boolean
export const isLoadingAtom = atom(false);
```

### 타입 정의와 함께

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// atoms/userAtom.ts
import { atom } from 'jotai';
import type { User } from '@/types/user';

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom(false);
export const authTokenAtom = atom<string | null>(null);
```

### Computed Atom (읽기 전용)

```typescript
import { atom } from 'jotai';

const countAtom = atom(0);

// 읽기 전용 파생 상태
export const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 여러 atom 조합
export const fullNameAtom = atom((get) => {
  const firstName = get(firstNameAtom);
  const lastName = get(lastNameAtom);
  return `${firstName} ${lastName}`;
});

// 복잡한 계산
export const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);

  return todos.filter((todo) => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });
});
```

</atoms>

<hooks>
## Hooks 패턴

### 공용 Hooks (shared/hooks/)

```typescript
// shared/hooks/useCounter.ts
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { counterAtom } from '@/atoms/counterAtom';

export const useCounter = () => {
  const [count, setCount] = useAtom(counterAtom);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

  return {
    count,
    increment,
    decrement,
    reset,
  };
};

// 읽기만 필요한 경우
export const useCounterValue = () => {
  return useAtomValue(counterAtom);
};

// 쓰기만 필요한 경우
export const useCounterActions = () => {
  const setCount = useSetAtom(counterAtom);

  return {
    increment: () => setCount((prev) => prev + 1),
    decrement: () => setCount((prev) => prev - 1),
    reset: () => setCount(0),
  };
};
```

### 도메인 Hooks (entities/[domain]/hooks/)

```typescript
// entities/user/hooks/useUser.ts
import { useAtom, useSetAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom } from '@/atoms/userAtom';
import type { User } from '@/types/user';

export const useUser = () => {
  const [user, setUser] = useAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return {
    user,
    login,
    logout,
    updateProfile,
  };
};
```

### 비동기 Hooks

```typescript
// entities/todo/hooks/useTodos.ts
import { useAtom } from 'jotai';
import { todosAtom, isLoadingAtom } from '@/atoms/todoAtom';

export const useTodos = () => {
  const [todos, setTodos] = useAtom(todosAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const newTodo = await response.json();
      setTodos((prev) => [...prev, newTodo]);
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return {
    todos,
    isLoading,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
};
```

</hooks>

<usage>
## 사용 예시

### 컴포넌트에서 사용

```typescript
// components/Counter.tsx
import React from 'react';
import { useCounter } from '@/shared/hooks/useCounter';

export const Counter = () => {
  const { count, increment, decrement, reset } = useCounter();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
```

### 읽기만 필요한 경우

```typescript
// components/CounterDisplay.tsx
import { useCounterValue } from '@/shared/hooks/useCounter';

export const CounterDisplay = () => {
  const count = useCounterValue();

  return <p>Current count: {count}</p>;
};
```

### 액션만 필요한 경우

```typescript
// components/CounterButtons.tsx
import { useCounterActions } from '@/shared/hooks/useCounter';

export const CounterButtons = () => {
  const { increment, decrement } = useCounterActions();

  return (
    <>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </>
  );
};
```

</usage>

<folder_structure>

## 폴더 구조

```
src/
├── atoms/                      # Atom 정의
│   ├── counterAtom.ts
│   ├── userAtom.ts
│   └── todoAtom.ts
│
├── shared/
│   └── hooks/                  # 공용 hooks
│       ├── useCounter.ts
│       └── useTheme.ts
│
└── entities/
    ├── user/
    │   └── hooks/              # 사용자 도메인 hooks
    │       └── useUser.ts
    └── todo/
        └── hooks/              # Todo 도메인 hooks
            └── useTodos.ts
```

</folder_structure>

<advanced_patterns>

## 고급 패턴

### Atom Family (동적 atom)

```typescript
import { atomFamily } from 'jotai/utils';

// ID별로 별도의 atom 생성
export const todoAtomFamily = atomFamily((id: string) =>
  atom<Todo>({
    id,
    title: '',
    completed: false,
  })
);

// 사용
const todoAtom = todoAtomFamily('todo-1');
```

### Atom with LocalStorage

```typescript
import { atomWithStorage } from 'jotai/utils';

// 자동으로 localStorage와 동기화
export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');

export const userPreferencesAtom = atomWithStorage('user-preferences', {
  language: 'ko',
  notifications: true,
});
```

### Atom with Reset

```typescript
import { atomWithReset } from 'jotai/utils';

export const formAtom = atomWithReset({
  name: '',
  email: '',
  message: '',
});

// 사용
import { useResetAtom } from 'jotai/utils';

const resetForm = useResetAtom(formAtom);
resetForm(); // 초기값으로 리셋
```

</advanced_patterns>

<best_practices>

## 모범 사례

### Atom 네이밍

```typescript
// ✅ ~Atom 접미사 사용
export const userAtom = atom<User | null>(null);
export const isLoadingAtom = atom(false);
export const counterAtom = atom(0);

// ❌ 접미사 없음
export const user = atom<User | null>(null);
export const loading = atom(false);
```

### Hooks 네이밍

```typescript
// ✅ use~ 접두사 사용
export const useUser = () => { ... };
export const useCounter = () => { ... };
export const useTodos = () => { ... };

// Value만 필요한 경우
export const useUserValue = () => useAtomValue(userAtom);

// Actions만 필요한 경우
export const useUserActions = () => { ... };
```

### 관심사 분리

```typescript
// ✅ State와 Logic 분리
// atoms/userAtom.ts
export const userAtom = atom<User | null>(null);

// hooks/useUser.ts
export const useUser = () => {
  const [user, setUser] = useAtom(userAtom);

  const login = async () => { ... };
  const logout = () => { ... };

  return { user, login, logout };
};

// ❌ State에 logic 포함
export const userAtom = atom<User | null>(null);
userAtom.login = async () => { ... }; // 안됨!
```

</best_practices>

<checklist>
## 개발 체크리스트

- [ ] Atom은 atoms/ 폴더에 정의
- [ ] Action은 hooks에 작성
- [ ] 공용/도메인 hooks 구분
- [ ] ~Atom 접미사 사용
- [ ] use~ 접두사 사용
- [ ] 타입 정의 명시
- [ ] 읽기/쓰기 hooks 분리 (필요시)
      </checklist>
