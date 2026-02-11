# Vue / Nuxt Guidelines

## State Management: Pinia (Required)

Use Pinia for all global state management in Vue/Nuxt projects.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  const increment = () => {
    count.value++;
  };

  return { count, doubleCount, increment };
});
```

## Component Structure: Script Setup

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
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <p>Count: {{ localCount }}</p>
    <button @click="handleIncrement">Increment</button>
  </div>
</template>

<style scoped>
.component {
  padding: 1rem;
}
</style>
```

## Composables Pattern

```typescript
// composables/useUser.ts
import { ref, computed } from 'vue';
import type { User } from '@/types';

export const useUser = () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!user.value);

  const login = async (email: string, password: string) => {};
  const logout = () => { user.value = null; };

  return { user, isLoggedIn, login, logout };
};
```

## Routing (Vue Router)

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
```

## Naming

| Category | Convention | Example |
|----------|-----------|---------|
| Component files | PascalCase | `UserCard.vue` |
| Composables | camelCase with `use` prefix | `useUser.ts` |
| Variables/Functions | camelCase | `userName`, `handleClick` |

## TypeScript Usage

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

## Nuxt-Specific

- Auto imports for components, composables, utils, and Vue APIs
- Server routes in `server/api/`
- Layouts in `layouts/`

## Best Practices

- Use `ref()` for reactive state, `reactive()` for complex objects
- Use `computed()` for derived state (never compute in template)
- Use `watch()` with `{ immediate: true }` when needed
- Use `storeToRefs()` when destructuring Pinia stores

## Checklist

- [ ] Pinia for global state management
- [ ] Script Setup syntax
- [ ] TypeScript types defined
- [ ] Composables for reusable logic
- [ ] Props and Emits typed
