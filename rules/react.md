# React / Next.js Guidelines

## Project Setup

### Next.js

```bash
npx create-next-app@latest project-name --typescript --eslint --tailwind --src-dir --app --turbopack --import-alias "@/*"
```

### React (Vite)

```bash
pnpm create vite@latest my-app -- --template react-ts
```

## Absolute Imports (Required)

```typescript
import { Content } from '@/entities';
import { Button } from '@/shared';
import { formatMonth } from '@/shared';

// NEVER use relative imports
// import { Button } from '../../../shared/ui/button';
```

## cn() Function (Required)

All `className` attributes must use the `cn()` utility.

```typescript
import { cn } from '@/shared';

// cn definition
import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Usage
<div className={cn(
  "base-classes",
  "hover:scale-105",
  "transition-all",
  conditionalClass && "conditional-style",
  className
)}>
```

## React.Fragment (Required)

Always use `<React.Fragment>`. Shorthand `<></>` is prohibited.

```typescript
<React.Fragment>
  <Header />
  <Main />
</React.Fragment>
```

## FSD Architecture

```
src/
├── app/           # Initialization, providers, global config
│   ├── config/    # Axios, env settings
│   ├── provider/  # Error boundaries, interceptors
│   ├── store/     # Store setup
│   └── styles/    # Global styles
├── pages/         # Route page components
├── widgets/       # Independent UI blocks
├── features/      # Business features
├── entities/      # Domain entities
├── shared/        # Shared utilities, UI components
└── assets/        # Static resources
```

### Layer Import Rules

```typescript
// entities → can import from: shared
// features → can import from: shared, entities
// widgets  → can import from: shared, entities, features
// pages    → can import from: shared, entities, features, widgets
```

## Component Pattern

```typescript
import React from 'react';
import { cn } from '@/shared';

interface ComponentNameProps {
  className?: string;
}

export const ComponentName = ({ className }: ComponentNameProps) => {
  const [state, setState] = React.useState(false);

  const handleClick = () => {};

  return (
    <React.Fragment>
      <div className={cn('base-styles', 'hover:styles', className)}>
        Content
      </div>
    </React.Fragment>
  );
};
```

### forwardRef Component

```typescript
export const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef(({ content }, ref) => {
  return (
    <figure
      ref={ref}
      className={cn('relative', 'hover:scale-105', 'transition-all')}
    >
      {/* content */}
    </figure>
  );
});

Card.displayName = 'Card';
```

## Naming

| Category | Convention | Example |
|----------|-----------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Functions | camelCase (verb-first) | `getUserInfo`, `handleClick` |
| Components | PascalCase | `ContentCard`, `ReviewList` |
| Interfaces | PascalCase + Props suffix | `ContentCardProps` |
| Types | PascalCase | `User`, `ReviewCreateRequest` |

## API & Hooks Pattern

```typescript
// entities/review/api/review.api.ts
export const getReviewByContent = async (contentId: string) => {};
export const createReview = async (data: ReviewCreateRequest) => {};

// entities/review/hooks/review.hooks.ts
export const useReviewByContent = () => {};
export const useReviewDetail = () => {};
```

## Folder Structure

```
features/
├── content/
│   ├── ui/
│   │   ├── card/
│   │   │   ├── CardImage.tsx
│   │   │   ├── CardInfo.tsx
│   │   │   └── index.tsx
│   │   └── content-list/
│   ├── api/
│   ├── hooks/
│   └── model/

shared/
├── ui/
│   ├── button/
│   ├── input/
│   └── modal/
├── lib/
│   ├── cn/
│   └── format-date/
└── api/
```

## Common UI Patterns

```typescript
// Modal/Overlay
className={cn(
  "fixed inset-0 z-50",
  "bg-black bg-opacity-50",
  "flex items-center justify-center",
  isOpen ? "visible opacity-100" : "invisible opacity-0",
  "transition-all duration-200"
)}

// Responsive Grid
className={cn(
  "grid gap-4",
  "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
  "p-4 md:p-6 lg:p-8"
)}
```

## Checklist

- [ ] `cn()` function imported and used for all className
- [ ] `React.Fragment` used (no shorthand)
- [ ] Props interface defined
- [ ] Absolute imports only (`@/`)
- [ ] FSD layer import rules respected
