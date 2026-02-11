# Jotai Guidelines

Required for React/Next.js client state management.

## Core Principles

- **No actions in store** — atoms hold state only
- **State logic lives in hooks**
- **Separate shared hooks from domain hooks**

## Installation

```bash
pnpm add jotai
```

## Atom Definitions

```typescript
// atoms/userAtom.ts
import { atom } from 'jotai';
import type { User } from '@/types/user';

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom(false);
export const counterAtom = atom(0);
export const todosAtom = atom<Todo[]>([]);
```

### Computed Atom (Read-Only)

```typescript
export const doubleCountAtom = atom((get) => get(countAtom) * 2);

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

## Hooks Pattern

### Shared Hooks (`shared/hooks/`)

```typescript
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { counterAtom } from '@/atoms/counterAtom';

export const useCounter = () => {
  const [count, setCount] = useAtom(counterAtom);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

  return { count, increment, decrement, reset };
};

// Read-only
export const useCounterValue = () => useAtomValue(counterAtom);

// Write-only
export const useCounterActions = () => {
  const setCount = useSetAtom(counterAtom);
  return {
    increment: () => setCount((prev) => prev + 1),
    decrement: () => setCount((prev) => prev - 1),
    reset: () => setCount(0),
  };
};
```

### Domain Hooks (`entities/[domain]/hooks/`)

```typescript
import { useAtom, useSetAtom } from 'jotai';
import { userAtom, isAuthenticatedAtom } from '@/atoms/userAtom';

export const useUser = () => {
  const [user, setUser] = useAtom(userAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, login, logout };
};
```

## Advanced Patterns

### Atom Family

```typescript
import { atomFamily } from 'jotai/utils';

export const todoAtomFamily = atomFamily((id: string) =>
  atom<Todo>({ id, title: '', completed: false })
);
```

### Atom with LocalStorage

```typescript
import { atomWithStorage } from 'jotai/utils';

export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');
```

### Atom with Reset

```typescript
import { atomWithReset } from 'jotai/utils';
import { useResetAtom } from 'jotai/utils';

export const formAtom = atomWithReset({ name: '', email: '', message: '' });
const resetForm = useResetAtom(formAtom);
```

## Folder Structure

```
src/
├── atoms/              # Atom definitions
│   ├── counterAtom.ts
│   ├── userAtom.ts
│   └── todoAtom.ts
├── shared/hooks/       # Shared hooks
│   ├── useCounter.ts
│   └── useTheme.ts
└── entities/
    ├── user/hooks/     # Domain hooks
    │   └── useUser.ts
    └── todo/hooks/
        └── useTodos.ts
```

## Naming Rules

- Atoms: `~Atom` suffix (`userAtom`, `isLoadingAtom`)
- Hooks: `use~` prefix (`useUser`, `useCounter`)
- Read-only hooks: `use~Value` (`useCounterValue`)
- Write-only hooks: `use~Actions` (`useCounterActions`)

## Checklist

- [ ] Atoms defined in `atoms/` directory
- [ ] Actions live in hooks, not atoms
- [ ] Shared vs domain hooks separated
- [ ] `~Atom` suffix on all atoms
- [ ] `use~` prefix on all hooks
- [ ] Types explicitly defined
