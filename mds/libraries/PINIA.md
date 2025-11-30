# Pinia 사용 지침

<overview>
Vue/Nuxt 사용 시 전역 상태관리는 Pinia를 필수로 사용합니다.
Composition API 스타일을 기본으로 사용합니다.
</overview>

<installation>
## 설치

### Vue 3

```bash
npm install pinia
# or
yarn add pinia
# or
pnpm add pinia
```

```typescript
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app');
```

### Nuxt 3

```bash
npm install pinia @pinia/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
});
```

</installation>

<basic_store>

## 기본 Store 패턴 (Composition API)

### 카운터 예시

```typescript
// stores/counter.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0);
  const name = ref('Eduardo');

  // Getters
  const doubleCount = computed(() => count.value * 2);
  const isEven = computed(() => count.value % 2 === 0);

  // Actions
  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function reset() {
    count.value = 0;
  }

  function incrementBy(amount: number) {
    count.value += amount;
  }

  return {
    // State
    count,
    name,
    // Getters
    doubleCount,
    isEven,
    // Actions
    increment,
    decrement,
    reset,
    incrementBy,
  };
});
```

### 사용자 Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types/user';

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const userName = computed(() => user.value?.name ?? 'Guest');
  const isAdmin = computed(() => user.value?.role === 'admin');

  // Actions
  async function login(email: string, password: string) {
    isLoading.value = true;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      user.value = data.user;
      token.value = data.token;

      // 로컬 스토리지에 저장
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  async function fetchProfile() {
    if (!token.value) return;

    isLoading.value = true;
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      const data = await response.json();
      user.value = data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function updateProfile(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates };
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    // Getters
    isAuthenticated,
    userName,
    isAdmin,
    // Actions
    login,
    logout,
    fetchProfile,
    updateProfile,
  };
});
```

</basic_store>

<usage>
## 컴포넌트에서 사용

### Script Setup

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();

// State 직접 접근
console.log(counter.count);

// Getter 접근
console.log(counter.doubleCount);

// Action 호출
function handleIncrement() {
  counter.increment();
}
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">+</button>
    <button @click="counter.decrement">-</button>
    <button @click="counter.reset">Reset</button>
  </div>
</template>
```

### Destructuring (주의)

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();

// ✅ storeToRefs로 반응성 유지
const { count, doubleCount } = storeToRefs(counter);
const { increment, decrement } = counter;

// ❌ 직접 구조분해 - 반응성 상실
const { count } = counter; // 반응성 없음!
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

</usage>

<async_actions>

## 비동기 Actions

### Todo Store

```typescript
// stores/todo.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Todo } from '@/types/todo';

export const useTodoStore = defineStore('todo', () => {
  // State
  const todos = ref<Todo[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const completedTodos = computed(() =>
    todos.value.filter((todo) => todo.completed)
  );

  const activeTodos = computed(() =>
    todos.value.filter((todo) => !todo.completed)
  );

  const totalCount = computed(() => todos.value.length);
  const completedCount = computed(() => completedTodos.value.length);

  // Actions
  async function fetchTodos() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      todos.value = data;
    } catch (err) {
      error.value = 'Failed to fetch todos';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addTodo(title: string) {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false }),
      });
      const newTodo = await response.json();
      todos.value.push(newTodo);
    } catch (err) {
      error.value = 'Failed to add todo';
      console.error(err);
    }
  }

  async function toggleTodo(id: string) {
    const todo = todos.value.find((t) => t.id === id);
    if (!todo) return;

    const updatedCompleted = !todo.completed;

    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedCompleted }),
      });

      todo.completed = updatedCompleted;
    } catch (err) {
      error.value = 'Failed to update todo';
      console.error(err);
    }
  }

  async function deleteTodo(id: string) {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      const index = todos.value.findIndex((t) => t.id === id);
      if (index > -1) {
        todos.value.splice(index, 1);
      }
    } catch (err) {
      error.value = 'Failed to delete todo';
      console.error(err);
    }
  }

  return {
    // State
    todos,
    isLoading,
    error,
    // Getters
    completedTodos,
    activeTodos,
    totalCount,
    completedCount,
    // Actions
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
});
```

</async_actions>

<store_composition>

## Store 조합

### 다른 Store 사용하기

```typescript
// stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore();

  const items = ref<CartItem[]>([]);

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // userStore의 상태 활용
  const userDiscount = computed(() => (userStore.isAdmin ? 0.2 : 0));

  const finalTotal = computed(() => total.value * (1 - userDiscount.value));

  function addItem(item: CartItem) {
    items.value.push(item);
  }

  return {
    items,
    total,
    finalTotal,
    addItem,
  };
});
```

</store_composition>

<persistence>
## 영구 저장소 (LocalStorage)

### Plugin 사용

```bash
npm install pinia-plugin-persistedstate
```

```typescript
// main.ts
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
```

### Store에 적용

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<'light' | 'dark'>('light');
    const language = ref('ko');

    function toggleTheme() {
      theme.value = theme.value === 'light' ? 'dark' : 'light';
    }

    return {
      theme,
      language,
      toggleTheme,
    };
  },
  {
    persist: true, // 자동으로 localStorage에 저장
  }
);

// 특정 state만 저장
export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref(null);
    const token = ref(null);
    const preferences = ref({});

    return { user, token, preferences };
  },
  {
    persist: {
      paths: ['token', 'preferences'], // token과 preferences만 저장
    },
  }
);
```

</persistence>

<folder_structure>

## 폴더 구조

```
src/
└── stores/
    ├── counter.ts
    ├── user.ts
    ├── todo.ts
    ├── cart.ts
    └── settings.ts
```

또는 도메인별로 분리:

```
src/
└── stores/
    ├── auth/
    │   ├── user.ts
    │   └── session.ts
    ├── products/
    │   ├── list.ts
    │   └── cart.ts
    └── common/
        └── settings.ts
```

</folder_structure>

<best_practices>

## 모범 사례

### Store 네이밍

```typescript
// ✅ use~Store 패턴
export const useUserStore = defineStore('user', () => { ... })
export const useCartStore = defineStore('cart', () => { ... })
export const useTodoStore = defineStore('todo', () => { ... })

// ❌ 일관성 없는 네이밍
export const userStore = defineStore('user', () => { ... })
export const cartData = defineStore('cart', () => { ... })
```

### Action은 async 함수로

```typescript
// ✅ async/await 사용
async function fetchUsers() {
  isLoading.value = true;
  try {
    const response = await fetch('/api/users');
    users.value = await response.json();
  } finally {
    isLoading.value = false;
  }
}

// ❌ Promise 체인
function fetchUsers() {
  fetch('/api/users')
    .then((res) => res.json())
    .then((data) => {
      users.value = data;
    });
}
```

### Getter는 computed 사용

```typescript
// ✅ computed로 파생 상태
const completedCount = computed(
  () => todos.value.filter((t) => t.completed).length
);

// ❌ 함수로 반환
function getCompletedCount() {
  return todos.value.filter((t) => t.completed).length;
}
```

### State 직접 수정

```typescript
// ✅ Composition API에서는 직접 수정 가능
function increment() {
  count.value++;
}

function addTodo(todo: Todo) {
  todos.value.push(todo);
}

// Options API 스타일 불필요
// this.$patch, this.$state 등
```

</best_practices>

<checklist>
## 개발 체크리스트

- [ ] Composition API 스타일 사용
- [ ] use~Store 네이밍 패턴
- [ ] State는 ref로 정의
- [ ] Getters는 computed로 정의
- [ ] Actions는 함수로 정의
- [ ] async 작업은 try-catch로 감싸기
- [ ] 필요시 persist 설정
- [ ] storeToRefs로 구조분해
      </checklist>
