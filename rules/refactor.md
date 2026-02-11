# Refactoring Guide

## Prop Drilling Removal

### Problem

```typescript
// BAD: config passed through multiple layers
const processKeywords = async (
  keywords: any[],
  config: Config,     // prop drilling
  logBuilder: DetailedLogBuilder
) => {
  const crawlResult = await getCrawlResult(searchQuery, keywordDoc, query, config, ...);
};
```

### Solution: Extract to Global Constants

```typescript
// constants/crawl-config/index.ts
export const CRAWL_CONFIG = {
  maxRetries: 3,
  delayBetweenQueries: 1500,
} as const;

// Import directly where needed
import { CRAWL_CONFIG } from '../../constants';

const html = await crawlWithRetry(searchQuery, CRAWL_CONFIG.maxRetries);
```

### Steps

1. **Create global constant**
2. **Remove parameter from function signatures**
3. **Import constant directly in consuming modules**
4. **Remove from type definitions**
5. **Remove from call sites**

### When to Apply

- Same value drilled 3+ levels deep
- Value is immutable configuration
- Multiple consumers need the same value

### Cautions

- Runtime-changing values are not suitable for global constants
- Use environment variables for environment-specific values
- Consider DI pattern when test overrides are needed

## FSD Migration

### Problem: Flat or Unstructured Folders

```
src/
├── components/        # Everything dumped here
│   ├── Header.tsx
│   ├── UserCard.tsx
│   ├── SearchBar.tsx
│   └── QueueList.tsx
├── hooks/             # All hooks in one place
│   ├── useUser.ts
│   ├── useSearch.ts
│   └── useQueue.ts
├── api/               # All APIs in one file or folder
│   └── index.ts
├── types/             # All types mixed
│   └── index.ts
└── utils/
```

### Solution: Migrate to FSD Slice Structure

```
src/
├── entities/
│   ├── search/
│   │   ├── api/
│   │   │   ├── searchApi.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useSearchManuscripts.ts
│   │   │   └── index.ts
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
├── features/
├── widgets/
├── shared/
│   ├── ui/
│   └── lib/
└── pages/
```

### Steps

1. **Identify domains** — group related files by domain (search, user, queue, etc.)
2. **Create slice folders** — `entities/{domain}/` with `api/`, `model/`, `hooks/` segments
3. **Move types first** — extract domain types into `model/types.ts`
4. **Move API functions** — extract into `api/{domain}Api.ts`
5. **Move hooks** — extract into `hooks/use{Action}.ts`
6. **Add barrel exports** — create `index.ts` at every level
7. **Update imports** — change all imports to use barrel paths (`@/entities`)
8. **Remove old folders** — delete empty original folders

### When to Apply

- Project has 5+ components/hooks sharing the same domain
- API functions scattered across multiple files
- Types and hooks mixed without domain separation
- Hard to find where domain logic lives

### Cautions

- Migrate one domain at a time, not all at once
- Run tests after each domain migration
- Keep barrel exports updated as files move
- Watch for circular dependencies between slices
