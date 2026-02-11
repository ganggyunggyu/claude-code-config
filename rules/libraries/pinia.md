# Pinia Guidelines

Required for Vue/Nuxt global state management. Use Composition API style.

## Installation

### Vue 3

```bash
pnpm add pinia
```

```typescript
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.mount('#app');
```

### Nuxt 3

```bash
pnpm add pinia @pinia/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({ modules: ['@pinia/nuxt'] });
```

## Store Pattern (Composition API)

```typescript
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

  // Actions
  const login = async (email: string, password: string) => {
    isLoading.value = true;
    try {
      const { data } = await api.post('/auth/login', { email, password });
      user.value = data.user;
      token.value = data.token;
      localStorage.setItem('token', data.token);
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  };

  return { user, token, isLoading, isAuthenticated, userName, login, logout };
});
```

## Usage in Components

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();

// storeToRefs preserves reactivity for state/getters
const { count, doubleCount } = storeToRefs(counter);

// Actions can be destructured directly
const { increment, decrement } = counter;
</script>
```

## Store Composition

```typescript
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore();
  const items = ref<CartItem[]>([]);

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const userDiscount = computed(() => (userStore.isAdmin ? 0.2 : 0));
  const finalTotal = computed(() => total.value * (1 - userDiscount.value));

  return { items, total, finalTotal };
});
```

## Persistence

```bash
pnpm add pinia-plugin-persistedstate
```

```typescript
// main.ts
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
pinia.use(piniaPluginPersistedstate);

// Store with persistence
export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<'light' | 'dark'>('light');
    return { theme };
  },
  { persist: true },
);
```

## Naming Rules

- Store name: `use~Store` (`useUserStore`, `useCartStore`)
- State: `ref()` for all reactive state
- Getters: `computed()` for derived state
- Actions: arrow functions (async when needed)

## Checklist

- [ ] Composition API style
- [ ] `use~Store` naming pattern
- [ ] State as `ref`, getters as `computed`
- [ ] `storeToRefs()` when destructuring
- [ ] Async actions wrapped in try-catch
- [ ] Persistence configured when needed
