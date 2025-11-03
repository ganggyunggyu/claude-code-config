# Vue/Nuxt 개발 지침

<state_management>

## Pinia 필수 사용

Vue/Nuxt 사용 시 전역 상태관리는 Pinia를 필수로 사용합니다.

### Composition API 스타일

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0);
  const name = ref('Eduardo');

  // Getters
  const doubleCount = computed(() => count.value * 2);

  // Actions
  function increment() {
    count.value++;
  }

  function reset() {
    count.value = 0;
  }

  return { count, name, doubleCount, increment, reset };
});
```

### 사용 예시

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">Increment</button>
    <button @click="counter.reset">Reset</button>
  </div>
</template>
```

</state_management>

<component_structure>

## 컴포넌트 구조

### Script Setup 사용

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

const emit = defineEmits<{
  update: [value: number];
  close: [];
}>();

const localCount = ref(props.count);
const router = useRouter();

const doubleCount = computed(() => localCount.value * 2);

const handleIncrement = () => {
  localCount.value++;
  emit('update', localCount.value);
};

onMounted(() => {
  console.log('Component mounted');
});
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <p>Count: {{ localCount }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="handleIncrement">Increment</button>
  </div>
</template>

<style scoped>
.component {
  padding: 1rem;
}
</style>
```

</component_structure>

<composables>
## Composables 패턴

```typescript
// composables/useUser.ts
import { ref, computed } from 'vue';
import type { User } from '@/types';

export const useUser = () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!user.value);

  const login = async (email: string, password: string) => {
    // 로그인 로직
  };

  const logout = () => {
    user.value = null;
  };

  return {
    user,
    isLoggedIn,
    login,
    logout,
  };
};
```

### 사용

```vue
<script setup lang="ts">
import { useUser } from '@/composables/useUser';

const { user, isLoggedIn, login, logout } = useUser();
</script>
```

</composables>

<routing>
## 라우팅 (Vue Router)

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/AboutPage.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

</routing>

<naming>
## 네이밍 컨벤션

### 컴포넌트 파일명 - PascalCase

```
components/
├── UserCard.vue
├── ProductList.vue
└── NavigationBar.vue
```

### Composables - camelCase with 'use' prefix

```
composables/
├── useUser.ts
├── useAuth.ts
└── useProducts.ts
```

### 변수 & 함수 - camelCase

```typescript
const userName = 'john';
const userList = [];
const isActive = true;

const getUserInfo = () => {};
const handleClick = () => {};
```

</naming>

<typescript>
## TypeScript 사용

### 타입 정의

```typescript
// types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}
```

### Props 타입

```vue
<script setup lang="ts">
interface Props {
  user: User;
  isEditable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditable: false,
});
</script>
```

</typescript>

<nuxt_specific>

## Nuxt 전용 기능

### Auto Imports

Nuxt는 자동으로 import합니다:

- Components
- Composables
- Utils
- Vue APIs (ref, computed, etc)

```vue
<script setup lang="ts">
// 자동 import - 명시적 import 불필요
const count = ref(0);
const route = useRoute();
const { data } = await useFetch('/api/users');
</script>
```

### Server Routes

```typescript
// server/api/users.ts
export default defineEventHandler(async (event) => {
  const users = await fetchUsers();
  return {
    users,
  };
});
```

### Layouts

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <Header />
    <slot />
    <Footer />
  </div>
</template>
```

</nuxt_specific>

<best_practices>

## 모범 사례

### Reactive 선언

```typescript
// ✅ 올바른 사용
const count = ref(0);
const user = ref<User | null>(null);
const list = ref<string[]>([]);

// Reactive 객체
const state = reactive({
  count: 0,
  name: 'John',
});

// ❌ 잘못된 사용
let count = 0; // 반응성 없음
```

### Computed 사용

```typescript
// ✅ 복잡한 로직은 computed 사용
const doubleCount = computed(() => count.value * 2)
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ❌ 템플릿에서 복잡한 로직 금지
<template>
  <!-- Bad -->
  <p>{{ count * 2 + (isActive ? 10 : 0) }}</p>

  <!-- Good -->
  <p>{{ calculatedValue }}</p>
</template>
```

### Watch 사용

```typescript
// 단순 watch
watch(count, (newVal, oldVal) => {
  console.log(`Count changed from ${oldVal} to ${newVal}`);
});

// 즉시 실행
watch(
  user,
  (newUser) => {
    if (newUser) {
      fetchUserData(newUser.id);
    }
  },
  { immediate: true }
);

// 깊은 감시
watch(
  state,
  (newState) => {
    saveToLocalStorage(newState);
  },
  { deep: true }
);
```

</best_practices>

<checklist>
## 개발 체크리스트

- [ ] Pinia를 전역 상태관리로 사용
- [ ] Script Setup 문법 사용
- [ ] TypeScript 타입 정의
- [ ] Composables로 로직 재사용
- [ ] Computed로 파생 상태 관리
- [ ] Props 타입 명시
- [ ] Emits 타입 정의
      </checklist>
