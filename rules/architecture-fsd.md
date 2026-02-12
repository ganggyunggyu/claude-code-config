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
│   ├── index.ts                # Slice barrel export
│   ├── api/
│   │   ├── index.ts
│   │   └── search-api/
│   │       └── index.ts        # API functions (Axios)
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── use-search-manuscripts/
│   │   │   └── index.ts
│   │   ├── use-search-history/
│   │   │   └── index.ts
│   │   ├── use-search-actions/
│   │   │   └── index.ts
│   │   ├── use-autocomplete/
│   │   │   └── index.ts
│   │   ├── use-bookmarks/
│   │   │   └── index.ts
│   │   ├── use-popular/
│   │   │   └── index.ts
│   │   └── use-stats/
│   │       └── index.ts
│   ├── model/
│   │   ├── index.ts
│   │   └── types/
│   │       └── index.ts        # TypeScript types/interfaces
│   └── stores/
│       ├── index.ts
│       └── search-store/
│           └── index.ts        # Jotai atoms or Pinia store
├── queue/
│   ├── index.ts
│   ├── api/
│   │   ├── index.ts
│   │   └── queue-api/
│   │       └── index.ts
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── use-queue-dashboard/
│   │   │   └── index.ts
│   │   ├── use-queue-jobs/
│   │   │   └── index.ts
│   │   └── use-queue-mutations/
│   │       └── index.ts
│   └── model/
│       ├── index.ts
│       └── types/
│           └── index.ts
├── published/
│   ├── index.ts
│   ├── api/
│   │   ├── index.ts
│   │   └── published-api/
│   │       └── index.ts
│   └── model/
│       ├── index.ts
│       └── types/
│           └── index.ts
└── upload/
    ├── index.ts
    ├── api/
    │   ├── index.ts
    │   └── upload-api/
    │       └── index.ts
    └── model/
        ├── index.ts
        └── types/
            └── index.ts
```

## Slice Internal Segments

| Segment | Purpose | Naming |
|---------|---------|--------|
| `api/` | Axios API functions | `{domain}-api/index.ts` |
| `model/` | TypeScript types, interfaces | `types/index.ts` |
| `hooks/` | Custom hooks (React) / Composables (Vue) | `use-{action}/index.ts` |
| `stores/` | State management (Jotai atoms / Pinia stores) | `{domain}-store/index.ts` |
| `ui/` | Presentational components | `{component-name}/index.tsx` |
| `presets/` | Domain-specific presets/constants | `{preset-name}/index.ts` |

Not every slice needs all segments. Only create what the domain requires.

**폴더 네이밍 규칙**: 모든 모듈은 `kebab-case` 폴더명 + `index.ts` 구조를 따릅니다.

## Barrel Export Pattern (Required)

Every folder must have `index.ts`. Exports bubble up hierarchically.

```typescript
// entities/search/api/index.ts
export * from './search-api';

// entities/search/hooks/index.ts
export * from './use-search-manuscripts';
export * from './use-search-history';
export * from './use-search-actions';

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
| API | `{domain}-api/index.ts` | `search-api/index.ts`, `queue-api/index.ts` |
| Hook | `use-{action}/index.ts` | `use-search-history/index.ts`, `use-queue-jobs/index.ts` |
| Store | `{domain}-store/index.ts` | `search-store/index.ts` |
| Type | `types/index.ts` | `types/index.ts` (always) |
| Component | `{component-name}/index.tsx` | `search-card/index.tsx` |
| Barrel exports | `index.ts` | `index.ts` (always) |

**규칙**: 모든 모듈은 폴더 + `index.ts` 구조. 폴더명은 `kebab-case`.

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

- [ ] 모든 모듈은 `폴더/index.ts` 구조
- [ ] 폴더명은 `kebab-case`
- [ ] 레이어 import 규칙 준수 (역방향/횡방향 import 금지)
- [ ] 각 slice는 필요한 segment만 포함
- [ ] API: `{domain}-api/index.ts`
- [ ] Types: `model/types/index.ts`
- [ ] Hooks: `use-{action}/index.ts`
- [ ] Stores: `{domain}-store/index.ts`
- [ ] 모든 import는 barrel export 통해서 (`@/entities`, `@/features`, `@/shared`)
