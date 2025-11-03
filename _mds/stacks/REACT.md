# React/Next.js 개발 지침

<create_project>

## Next.js

```bash
npx create-next-app@latest project-name --typescript --eslint --tailwind --src-dir --app --turbopack --import-alias "@/*"
```

## React.js or Vue.js

```bash
pnpm create vite@latest my-app -- --template react-ts && cd my-app && echo 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport path from "path";\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "src"),\n    },\n  },\n});' > vite.config.ts
```

</create_project>

<imports>
## 절대 경로 필수

```typescript
// ✅ 반드시 절대 경로 사용
import { Content } from '@/entities';
import { Button } from '@/shared';
import { formatMonth } from '@/shared';

// ❌ 상대 경로 금지
import { Button } from '../../../shared/ui/button';
```

</imports>

<styling>
## cn 함수 필수 사용

모든 className에서 cn 함수를 사용합니다.

```typescript
import { cn } from '@/shared';

// cn 함수 정의
import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// 사용 예시
<div className={cn(
  "base-classes",
  "hover:scale-105",
  "transition-all",
  conditionalClass && "conditional-style",
  className // props로 받은 추가 className
)}>
```

### 스타일링 패턴

```typescript
// 기본 패턴
className={cn(
  "base-class",
  "modifier-class",
  condition && "conditional-class",
  className
)}

// 복잡한 조건부 스타일링
className={cn(
  "relative cursor-pointer rounded-md transition-all",
  "hover:scale-105 hover:ring-4 hover:ring-zinc-700",
  "md:w-[card-img-w] w-[card-img-sm-w]",
  isActive && "ring-2 ring-blue-500",
  disabled && "opacity-50 cursor-not-allowed",
  className
)}

// Tailwind 반응형 (모바일 우선)
'w-[card-img-sm-w] md:w-[card-img-w]'
'text-sm md:text-base lg:text-lg'
'p-2 md:p-4 lg:p-6'
```

</styling>

<fragments>
## React.Fragment 필수

```typescript
// ✅ 반드시 React.Fragment 사용
<React.Fragment>
  <Header />
  <Main />
</React.Fragment>

// ❌ 단축 문법 금지
<>
  <Header />
  <Main />
</>
```

</fragments>

<architecture>
## FSD 아키텍처 구조

```
src/
├── app/           # 앱 초기화, 프로바이더, 전역 설정
│   ├── config/    # axios, env 설정
│   ├── provider/  # 에러, axios 인터셉터
│   ├── store/     # Redux 스토어, 슬라이스
│   └── styles/    # 전역 스타일
├── pages/         # 라우팅 페이지 컴포넌트
├── widgets/       # 독립적인 UI 블록
├── features/      # 비즈니스 기능
├── entities/      # 도메인 엔티티
├── shared/        # 공용 유틸리티, UI
└── assets/        # 정적 리소스
```

### 계층별 Import 규칙

```typescript
// entities에서 사용 가능
import { ... } from '@/shared'; // ✅

// features에서 사용 가능
import { ... } from '@/shared'; // ✅
import { ... } from '@/entities'; // ✅

// widgets에서 사용 가능
import { ... } from '@/shared'; // ✅
import { ... } from '@/entities'; // ✅
import { ... } from '@/features'; // ✅

// pages에서 사용 가능
import { ... } from '@/shared'; // ✅
import { ... } from '@/entities'; // ✅
import { ... } from '@/features'; // ✅
import { ... } from '@/widgets'; // ✅
```

</architecture>

<components>
## 컴포넌트 작성 패턴

### 기본 함수형 컴포넌트

```typescript
import React from 'react';
import { cn } from '@/shared';

interface ComponentNameProps {
  className?: string;
}

export const ComponentName = ({ className }: ComponentNameProps) => {
  const [state, setState] = React.useState(false);

  const handleClick = () => {
    // 이벤트 핸들러
  };

  return (
    <React.Fragment>
      <div className={cn('base-styles', 'hover:styles', className)}>
        컴포넌트 내용
      </div>
    </React.Fragment>
  );
};
```

### forwardRef 컴포넌트

```typescript
export const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef(({ content }, ref) => {
  return (
    <figure
      ref={ref}
      className={cn('relative', 'hover:scale-105', 'transition-all')}
    >
      {/* 컴포넌트 내용 */}
    </figure>
  );
});

Card.displayName = 'Card';
```

</components>

<naming>
## 네이밍 컨벤션

### 변수 & 함수 (camelCase)

```typescript
// 변수
const userName = 'john';
const userList = ['john', 'jane'];
const isLoggedIn = true;

// 함수 (동사 + 명사)
const getUserInfo = () => {};
const createReview = () => {};
const updateContent = () => {};
const removeUser = () => {};
const handleLoginClick = () => {};
const toggleSidebar = () => {};
```

### 컴포넌트 & 타입 (PascalCase)

```typescript
// 컴포넌트
export const ContentCard = () => {};
export const ReviewList = () => {};

// 인터페이스
interface ContentCardProps {
  contentId: string;
}

// 타입
export type User = {
  _id: string;
  username: string;
};

// API 타입
export type ReviewCreateRequest = {
  contentId: string;
  grade: number;
};
```

</naming>

<api_patterns>

## API & 상태 관리

### API 함수

```typescript
// entities/review/api/review.api.ts
export const getReviewByContent = async (contentId: string) => {};
export const getReview = async (reviewId: string) => {};
export const createReview = async (data: ReviewCreateRequest) => {};
export const updateReview = async (id: string, data: ReviewUpdateRequest) => {};
export const removeReview = async (reviewId: string) => {};
```

### 커스텀 훅

```typescript
// entities/review/hooks/review.hooks.ts
export const useReviewByContent = () => {};
export const useReviewDetail = () => {};
export const useAverageGradeByContent = () => {};
```

</api_patterns>

<folder_structure>

## 폴더별 파일 구조

### features 폴더

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
```

### shared 폴더

```
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

</folder_structure>

<checklist>
## 개발 체크리스트

### 컴포넌트 생성 시

- [ ] cn 함수 import
- [ ] className={cn(...)} 패턴 사용
- [ ] React.Fragment 사용
- [ ] Props 인터페이스 정의
- [ ] 절대경로 import 사용

### 스타일링 시

- [ ] cn() 안에서 Tailwind 클래스 사용
- [ ] 반응형 클래스 모바일 우선
- [ ] 조건부 스타일 condition && "class"

### 네이밍 시

- [ ] 함수는 동사로 시작
- [ ] 배열 변수는 ~List
- [ ] Boolean은 is~
- [ ] 이벤트 핸들러는 handle~
      </checklist>

<examples>
## 실전 예시

### Card 컴포넌트

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared';
import { Content } from '@/entities';

interface CardProps {
  content: Content;
  className?: string;
}

export const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef(({ content, className }, ref) => {
  const navigator = useNavigate();
  const [cardHover, setCardHover] = React.useState(false);

  const handleCardClick = () => {
    navigator(`/content/${content._id}`);
  };

  const handleMouseEnter = () => {
    setCardHover(true);
  };

  const handleMouseLeave = () => {
    setCardHover(false);
  };

  return (
    <figure
      ref={ref}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative cursor-pointer rounded-md transition-all',
        'hover:scale-105 hover:ring-4 hover:ring-zinc-700',
        'md:w-[card-img-w] w-[card-img-sm-w]',
        className
      )}
    >
      {cardHover && <CardHover review={content.title} />}
      <div
        className={cn(
          'text-center flex gap-2 flex-col',
          'md:w-[card-img-w] w-[card-img-sm-w]'
        )}
      >
        <CardImage path={content.posterPath} />
        <CardInfo
          title={content.title}
          grade={(content.voteAverage / 2).toFixed(2)}
        />
      </div>
    </figure>
  );
});

Card.displayName = 'Card';
```

### Button 컴포넌트

```typescript
import React from 'react';
import { cn } from '@/shared';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  item?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  item,
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'px-4 py-2 rounded-md transition-colors',
        variant === 'default' && 'bg-gray-100 hover:bg-gray-200',
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-green-500 text-white hover:bg-green-600',
        className
      )}
      {...props}
    >
      {label && label}
      {item && item}
    </button>
  );
};

Button.displayName = 'Button';
```

</examples>

<common_patterns>

## 자주 사용되는 패턴

### Modal/Overlay

```typescript
className={cn(
  "fixed inset-0 z-50",
  "bg-black bg-opacity-50",
  "flex items-center justify-center",
  isOpen ? "visible opacity-100" : "invisible opacity-0",
  "transition-all duration-200"
)}
```

### 반응형 Grid

```typescript
className={cn(
  "grid gap-4",
  "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
  "p-4 md:p-6 lg:p-8"
)}
```

### Loading State

```typescript
className={cn(
  "flex items-center justify-center",
  "min-h-screen",
  isLoading && "animate-pulse"
)}
```

</common_patterns>
