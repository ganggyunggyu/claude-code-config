# CSS/Tailwind 퍼블리싱 지침

<principles>
## 퍼블리싱 원칙

### 디자인 철학

- 세련되고 현대적인 디자인
- **가장 중요**: AI가 한 티가 나지 않아야 함
- 기타 요구사항이 있을 경우 수용

### 아이콘 사용

- 이모지 사용 지양
- 가능한 아이콘 라이브러리 사용 (Lucide, Heroicons 등)
  </principles>

<tailwind_setup>

## Tailwind CSS 4.0 설정

### Next.js

공식 문서: https://tailwindcss.com/docs/installation/framework-guides/nextjs

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

Configure PostCSS Plugins
Create a postcss.config.mjs file in the root of your project and add the @tailwindcss/postcss plugin to your PostCSS configuration.

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

### Vite (React/Vue)

공식 문서: https://tailwindcss.com/docs/installation/using-vite

```bash
npm install tailwindcss @tailwindcss/vite
```

```javascript
//vite.config.ts

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

</tailwind_setup>

<utility_classes>

## Tailwind 유틸리티 클래스 패턴

### 레이아웃

```html
<!-- Flexbox -->
<div class="flex items-center justify-between">
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap">
      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="grid place-items-center">
          <!-- Container -->
          <div class="container mx-auto px-4"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 반응형 디자인 (모바일 우선)

```html
<!-- 크기 -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <div class="text-sm md:text-base lg:text-lg">
    <!-- 패딩/마진 -->
    <div class="p-2 md:p-4 lg:p-6">
      <div class="m-2 md:m-4 lg:m-8">
        <!-- Display -->
        <div class="hidden md:block">
          <div class="block md:hidden"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 상태 변화

```html
<!-- Hover -->
<button class="hover:bg-blue-600 hover:scale-105">
  <!-- Focus -->
  <input class="focus:ring-2 focus:ring-blue-500 focus:outline-none" />

  <!-- Active -->
  <button class="active:scale-95">
    <!-- Disabled -->
    <button class="disabled:opacity-50 disabled:cursor-not-allowed"></button>
  </button>
</button>
```

### 트랜지션 & 애니메이션

```html
<!-- 부드러운 전환 -->
<div class="transition-all duration-300 ease-in-out">
  <div class="transition-colors hover:bg-blue-500">
    <div class="transition-transform hover:scale-110">
      <!-- 애니메이션 -->
      <div class="animate-spin">
        <div class="animate-pulse">
          <div class="animate-bounce"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

</utility_classes>

<color_scheme>

## 색상 체계

### 다크모드 지원

```html
<!-- 다크모드 변수 -->
<div class="bg-white dark:bg-gray-900">
  <div class="text-gray-900 dark:text-white">
    <div class="border-gray-200 dark:border-gray-700"></div>
  </div>
</div>
```

### 시맨틱 색상

```html
<!-- Primary -->
<button class="bg-blue-500 hover:bg-blue-600">
  <!-- Success -->
  <div class="bg-green-500 text-white">
    <!-- Warning -->
    <div class="bg-yellow-500 text-black">
      <!-- Error -->
      <div class="bg-red-500 text-white">
        <!-- Neutral -->
        <div class="bg-gray-500 text-white"></div>
      </div>
    </div>
  </div>
</button>
```

</color_scheme>

<typography>
## 타이포그래피

```html
<!-- 제목 -->
<h1 class="text-4xl font-bold">
  <h2 class="text-3xl font-semibold">
    <h3 class="text-2xl font-medium">
      <!-- 본문 -->
      <p class="text-base leading-relaxed"></p>
      <p class="text-sm text-gray-600">
        <!-- 강조 -->
        <span class="font-bold">
          <span class="italic">
            <span class="underline">
              <!-- 행간 -->
              <p class="leading-tight"></p>
              <p class="leading-normal"></p>
              <p class="leading-relaxed"></p></span></span
        ></span>
      </p>
    </h3>
  </h2>
</h1>
```

</typography>

<component_patterns>

## 컴포넌트 패턴

### 카드

```html
<div
  class="
  bg-white rounded-lg shadow-md
  hover:shadow-xl transition-shadow
  p-6
"
>
  <h3 class="text-xl font-semibold mb-2">제목</h3>
  <p class="text-gray-600">내용</p>
</div>
```

### 버튼

```html
<!-- Primary -->
<button
  class="
  px-4 py-2 rounded-md
  bg-blue-500 text-white
  hover:bg-blue-600
  active:scale-95
  transition-all
"
>
  클릭
</button>

<!-- Outline -->
<button
  class="
  px-4 py-2 rounded-md
  border-2 border-blue-500 text-blue-500
  hover:bg-blue-500 hover:text-white
  transition-colors
"
>
  클릭
</button>
```

### Input

```html
<input
  class="
  w-full px-4 py-2 rounded-md
  border border-gray-300
  focus:ring-2 focus:ring-blue-500 focus:border-transparent
  outline-none
  transition-all
"
/>
```

### Modal

```html
<div
  class="
  fixed inset-0 z-50
  bg-black bg-opacity-50
  flex items-center justify-center
"
>
  <div
    class="
    bg-white rounded-lg
    p-6 max-w-md w-full
    shadow-2xl
  "
  >
    모달 내용
  </div>
</div>
```

### Navigation

```html
<nav
  class="
  sticky top-0 z-40
  bg-white border-b
  shadow-sm
"
>
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-8">
        <!-- 로고 및 메뉴 -->
      </div>
    </div>
  </div>
</nav>
```

</component_patterns>

<accessibility>
## 접근성 고려사항

```html
<!-- 포커스 표시 -->
<button class="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  <!-- 스크린 리더 -->
  <span class="sr-only">설명 텍스트</span>

  <!-- 충분한 대비 -->
  <div class="bg-gray-900 text-white">
    <!-- 터치 영역 확보 -->
    <button class="min-h-[44px] min-w-[44px]"></button>
  </div>
</button>
```

</accessibility>

<custom_config>

## 커스텀 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};
```

</custom_config>

<best_practices>

## 모범 사례

### 클래스 순서

```html
<!-- 권장 순서: 레이아웃 → 박스모델 → 타이포그래피 → 시각적 → 기타 -->
<div
  class="
  flex items-center justify-between
  w-full h-16 px-4 py-2
  text-lg font-semibold
  bg-white border-b shadow-sm
  hover:bg-gray-50
  transition-colors
"
></div>
```

### 그룹 호버

```html
<div class="group">
  <img class="group-hover:scale-110 transition-transform" />
  <p class="group-hover:text-blue-500">제목</p>
</div>
```

### Peer 상태

```html
<input type="checkbox" class="peer sr-only" id="toggle" />
<label for="toggle" class="peer-checked:bg-blue-500"> 토글 </label>
```

### 조건부 스타일링

```html
<!-- cn 함수와 함께 사용 (React/Next.js) -->
<div className={cn( "base-classes", "hover:scale-105", isActive &&
"bg-blue-500", disabled && "opacity-50 cursor-not-allowed" )}>
```

</best_practices>

<performance>
## 성능 최적화

### JIT 모드 활용

```javascript
// tailwind.config.js
module.exports = {
  mode: 'jit', // Just-In-Time 모드
  purge: ['./src/**/*.{js,jsx,ts,tsx}'],
};
```

### 불필요한 클래스 제거

```javascript
// 프로덕션 빌드 시 사용하지 않는 클래스 자동 제거
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
};
```

</performance>

<checklist>
## 개발 체크리스트

- [ ] 모바일 우선 반응형 디자인
- [ ] hover/focus 상태 정의
- [ ] 트랜지션 효과 추가
- [ ] 접근성 고려 (focus, sr-only)
- [ ] 다크모드 지원 (필요시)
- [ ] 적절한 색상 대비
- [ ] 일관된 spacing 사용
- [ ] 컴포넌트 재사용성
      </checklist>
