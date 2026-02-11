# FSD (Feature-Sliced Design) Architecture

## Required for All Frontend Projects (React, Next.js, Vue, Nuxt)

## Top-Level Layer Structure

```
src/
├── app/           # App initialization, providers, global config
├── pages/         # Route page components (composition only)
├── widgets/       # Independent composite UI blocks
├── features/      # User interactions, business actions
├── entities/      # Domain entities (data models, API, hooks)
├── shared/        # Reusable utilities, UI primitives, libs
└── assets/        # Static resources (images, fonts)
```

## Layer Import Rules (Strict)

Upper layers can only import from lower layers. Never import upward or sideways.

```
app     → pages, widgets, features, entities, shared
pages   → widgets, features, entities, shared
widgets → features, entities, shared
features → entities, shared
entities → shared
shared  → nothing (self-contained)
```

## Entity/Feature Slice Structure

Each domain slice follows this internal structure:

```
entities/
├── index.ts                    # Barrel export (re-exports all slices)
├── search/
│   ├── api/
│   │   ├── searchApi.ts        # API functions (Axios)
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSearchManuscripts.ts
│   │   ├── useSearchHistory.ts
│   │   ├── useSearchActions.ts
│   │   ├── useAutocomplete.ts
│   │   ├── useBookmarks.ts
│   │   ├── usePopular.ts
│   │   ├── useStats.ts
│   │   └── index.ts
│   ├── model/
│   │   ├── types.ts            # TypeScript types/interfaces
│   │   └── index.ts
│   ├── stores/
│   │   ├── searchStore.ts      # Jotai atoms or Pinia store
│   │   └── index.ts
│   └── index.ts                # Slice barrel export
├── queue/
│   ├── api/
│   │   ├── queueApi.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useQueueDashboard.ts
│   │   ├── useQueueJobs.ts
│   │   ├── useQueueMutations.ts
│   │   └── index.ts
│   ├── model/
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts
├── published/
│   ├── api/
│   │   ├── publishedApi.ts
│   │   └── index.ts
│   ├── model/
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts
└── upload/
    ├── api/
    │   ├── uploadApi.ts
    │   └── index.ts
    ├── model/
    │   ├── types.ts
    │   └── index.ts
    └── index.ts
```

## Slice Internal Segments

| Segment | Purpose | Naming |
|---------|---------|--------|
| `api/` | Axios API functions | `{domain}Api.ts` |
| `model/` | TypeScript types, interfaces | `types.ts` |
| `hooks/` | Custom hooks (React) / Composables (Vue) | `use{Action}.ts` |
| `stores/` | State management (Jotai atoms / Pinia stores) | `{domain}Store.ts` |
| `ui/` | Presentational components | `{ComponentName}.tsx` |
| `presets/` | Domain-specific presets/constants | `index.ts` |

Not every slice needs all segments. Only create what the domain requires.

## Barrel Export Pattern (Required)

Every folder must have `index.ts`. Exports bubble up hierarchically.

```typescript
// entities/search/api/index.ts
export * from './searchApi';

// entities/search/hooks/index.ts
export * from './useSearchManuscripts';
export * from './useSearchHistory';
export * from './useSearchActions';

// entities/search/model/index.ts
export * from './types';

// entities/search/index.ts
export * from './api';
export * from './hooks';
export * from './model';
export * from './stores';

// entities/index.ts
export * from './search';
export * from './queue';
export * from './published';
export * from './upload';
```

### Result

```typescript
// Clean imports via barrel
import { useSearchManuscripts, getSearchList, type SearchResult } from '@/entities';

// NOT this
// import { useSearchManuscripts } from '@/entities/search/hooks/useSearchManuscripts';
```

## File Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| API files | `{domain}Api.ts` | `searchApi.ts`, `queueApi.ts` |
| Hook files | `use{Action}.ts` | `useSearchHistory.ts`, `useQueueJobs.ts` |
| Store files | `{domain}Store.ts` | `searchStore.ts` |
| Type files | `types.ts` | `types.ts` (always) |
| Component files | `{PascalCase}.tsx` | `SearchCard.tsx` |
| Barrel exports | `index.ts` | `index.ts` (always) |

## When to Create a New Slice

- New domain entity appears (user, post, product, etc.)
- A feature has its own API endpoints
- A group of hooks/components share the same domain context

## Anti-Patterns

```typescript
// BAD: Cross-slice imports at same layer
import { useUser } from '@/entities/search'; // search importing from user

// BAD: Upward imports
import { LoginForm } from '@/features'; // entity importing from feature

// BAD: Utility dumping ground
import { formatDate, validateEmail, getUser } from '@/shared/utils'; // mixed domains

// BAD: Missing barrel export
import { useSearch } from '@/entities/search/hooks/useSearch'; // deep path

// GOOD: Always import from barrel
import { useSearch } from '@/entities';
```

## Checklist

- [ ] Every folder has `index.ts`
- [ ] Layer import rules respected (no upward/sideways imports)
- [ ] Each slice contains only relevant segments
- [ ] API files named `{domain}Api.ts`
- [ ] Types in `model/types.ts`
- [ ] Hooks named `use{Action}.ts`
- [ ] All imports via barrel exports (`@/entities`, `@/features`, `@/shared`)
