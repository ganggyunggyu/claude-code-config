# CSS / Tailwind CSS Guidelines

## Design Philosophy

- Modern, polished design
- Must not look AI-generated
- Use icon libraries (Lucide, Heroicons) instead of emojis

## Tailwind CSS v4 Setup

### Next.js

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
```

### Vite (React/Vue)

```bash
npm install tailwindcss @tailwindcss/vite
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

## Responsive Design (Mobile-First)

```html
<div class="w-full md:w-1/2 lg:w-1/3">
<div class="text-sm md:text-base lg:text-lg">
<div class="p-2 md:p-4 lg:p-6">
<div class="hidden md:block">
```

## State Variants

```html
<button class="hover:bg-blue-600 hover:scale-105">
<input class="focus:ring-2 focus:ring-blue-500 focus:outline-none" />
<button class="active:scale-95">
<button class="disabled:opacity-50 disabled:cursor-not-allowed">
```

## Dark Mode

```html
<div class="bg-white dark:bg-gray-900">
<div class="text-gray-900 dark:text-white">
```

## Class Order Convention

Layout → Box Model → Typography → Visual → Misc

```html
<div class="
  flex items-center justify-between
  w-full h-16 px-4 py-2
  text-lg font-semibold
  bg-white border-b shadow-sm
  hover:bg-gray-50
  transition-colors
">
```

## Component Patterns

### Card
```html
<div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
```

### Button
```html
<button class="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all">
```

### Input
```html
<input class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
```

### Modal
```html
<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
  <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
```

## Accessibility

```html
<button class="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
<span class="sr-only">Description text</span>
<button class="min-h-[44px] min-w-[44px]">
```

## Advanced Patterns

```html
<!-- Group hover -->
<div class="group">
  <img class="group-hover:scale-110 transition-transform" />
  <p class="group-hover:text-blue-500">Title</p>
</div>

<!-- Peer state -->
<input type="checkbox" class="peer sr-only" id="toggle" />
<label for="toggle" class="peer-checked:bg-blue-500">Toggle</label>
```

## Checklist

- [ ] Mobile-first responsive design
- [ ] hover/focus states defined
- [ ] Transitions applied
- [ ] Accessibility (focus rings, sr-only)
- [ ] Consistent spacing
- [ ] Reusable component patterns
