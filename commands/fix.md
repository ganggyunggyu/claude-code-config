---
description: 린트/타입 에러 자동 수정
argument-hint: [옵션]
---

# 에러 자동 수정

린트 에러, 타입 에러를 자동으로 수정합니다.

## 사용법

```
/fix
/fix --lint
/fix --type
/fix --imports
/fix --all
```

## 실행 순서

### 1. 자동 수정 가능한 린트 에러
```bash
# ESLint auto-fix
npx eslint src/ --fix

# Biome
npx biome check src/ --apply
```

### 2. import 정리
```bash
# 사용하지 않는 import 제거
# organize imports (VSCode)
```

### 3. 타입 에러 수동 수정
- 타입 불일치
- 누락된 속성
- null/undefined 체크

## 자동 수정 가능한 항목

### ESLint 자동 수정
```typescript
// Before
import {useState,useEffect} from 'react'
import { User } from './types'

const Component = () => {
const [count,setCount]=useState(0)

  useEffect(()=>{
    console.log(count)
  },[count])

  return <div>{count}</div>
}

// After (자동 수정)
import { useState, useEffect } from 'react'

const Component = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log(count)
  }, [count])

  return <div>{count}</div>
}
```

**수정 항목:**
- 들여쓰기
- 공백
- 세미콜론
- 따옴표 스타일
- import 정렬
- 사용하지 않는 import 제거

### Prettier 포맷팅
```typescript
// Before
const user={id:"123",name:"John",email:"john@example.com"}

function createUser(name:string,email:string){return{id:generateId(),name,email}}

// After
const user = {
  id: '123',
  name: 'John',
  email: 'john@example.com',
}

function createUser(name: string, email: string) {
  return {
    id: generateId(),
    name,
    email,
  }
}
```

### Import 정리
```typescript
// Before
import React, { useState, useEffect } from 'react'
import { User, Post, Comment } from '@/types'
import { fetchUser } from '@/api/users'
import { Button } from '@/components/Button'
import { formatDate } from '@/utils/date'

// 실제로 사용하는 것만
const Component = () => {
  const [user, setUser] = useState<User>()

  return <div>{user?.name}</div>
}

// After
import { useState } from 'react'
import type { User } from '@/types'

const Component = () => {
  const [user, setUser] = useState<User>()

  return <div>{user?.name}</div>
}
```

## 수동 수정이 필요한 항목

### 타입 에러

#### 1. 타입 불일치
```typescript
// ❌ Before
const user: User = {
  id: 123, // number
  name: 'John',
}

// ✅ After
const user: User = {
  id: '123', // string
  name: 'John',
}
```

#### 2. 누락된 속성
```typescript
// ❌ Before
const user: User = {
  id: '123',
  // name이 필수인데 없음
}

// ✅ After
const user: User = {
  id: '123',
  name: 'John',
  email: 'john@example.com',
}
```

#### 3. null/undefined 체크
```typescript
// ❌ Before
const userName = user.name.toUpperCase()

// ✅ After (Optional chaining)
const userName = user?.name?.toUpperCase()

// ✅ After (Nullish coalescing)
const userName = user.name ?? 'Guest'

// ✅ After (Type guard)
if (user && user.name) {
  const userName = user.name.toUpperCase()
}
```

#### 4. 함수 반환 타입
```typescript
// ❌ Before
const getUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// ✅ After
const getUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
```

#### 5. Props 타입
```typescript
// ❌ Before
const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>
}

// ✅ After
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
}

const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>
}
```

#### 6. Event 핸들러 타입
```typescript
// ❌ Before
const handleClick = (event) => {
  console.log(event.target.value)
}

// ✅ After
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget.value)
}

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value)
}
```

## 일반적인 수정 패턴

### any 타입 제거
```typescript
// ❌ Before
const data: any = await fetchData()
const items: any[] = []

// ✅ After
const data: UserResponse = await fetchData()
const items: User[] = []

// ✅ unknown 사용 (필요시)
const data: unknown = await fetchData()
if (isUserResponse(data)) {
  // 타입 가드 후 사용
}
```

### 구조분해할당
```typescript
// ❌ Before
const UserProfile = (props) => {
  return <div>{props.user.name}</div>
}

// ✅ After
interface UserProfileProps {
  user: User
}

const UserProfile = ({ user }: UserProfileProps) => {
  return <div>{user.name}</div>
}
```

### Optional Props
```typescript
// ❌ Before
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
}

// ✅ After (기본값 제공)
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

const Button = ({
  variant = 'primary',
  size = 'md'
}: ButtonProps) => {
  // ...
}
```

### Async/Await 에러 처리
```typescript
// ❌ Before
const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// ✅ After
const fetchUser = async (id: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
```

## 수정 프로세스

### 1단계: 에러 확인
```bash
# 린트 에러 확인
npx eslint src/

# 타입 에러 확인
npx tsc --noEmit
```

### 2단계: 자동 수정 실행
```bash
# ESLint 자동 수정
npx eslint src/ --fix

# Prettier 포맷팅
npx prettier --write src/

# Biome (ESLint + Prettier)
npx biome check src/ --apply
```

### 3단계: 수동 수정
- 타입 에러 분석
- 누락된 타입 추가
- null 체크 추가
- import 수정

### 4단계: 재검증
```bash
# 다시 체크
npx eslint src/
npx tsc --noEmit
```

## 수정 우선순위

### 높음 (즉시 수정)
- ❌ any 타입
- ❌ null/undefined 에러
- ❌ 타입 불일치
- ❌ 사용하지 않는 import

### 중간 (수정 권장)
- ⚠️ console.log
- ⚠️ 주석 처리된 코드
- ⚠️ 긴 함수
- ⚠️ 중복 코드

### 낮음 (선택)
- ℹ️ 코드 스타일
- ℹ️ 네이밍 컨벤션
- ℹ️ 주석 추가

## VSCode 통합

### settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

### Extensions
- ESLint
- Prettier
- Error Lens (에러 인라인 표시)

## 대량 수정

### 전체 프로젝트
```bash
# 모든 파일 수정
npx eslint src/ --fix
npx prettier --write src/

# 특정 확장자만
npx eslint "src/**/*.{ts,tsx}" --fix
npx prettier --write "src/**/*.{ts,tsx}"
```

### 단계적 수정
```bash
# 1. 포맷팅만
npx prettier --write src/

# 2. 자동 수정 가능한 것
npx eslint src/ --fix

# 3. import 정리
# VSCode: Shift + Alt + O

# 4. 타입 에러 수동 수정
npx tsc --noEmit
```

## 주의사항

- **백업**: 대량 수정 전 커밋 또는 백업
- **테스트**: 수정 후 테스트 실행
- **검토**: 자동 수정 결과 확인
- **점진적**: 한 번에 모두 수정하지 말고 단계적으로

## 사용 예시

```
사용자: /fix
```

**실행:**
1. ESLint --fix 실행
2. Prettier 포맷팅
3. 수동 수정 필요 항목 리스트업
4. 수정 방법 안내

```
사용자: /fix --all
```

**실행:**
1. 모든 자동 수정 실행
2. 타입 에러 분석 및 수정
3. import 정리
4. 최종 검증

## 참고

- ESLint Rules: https://eslint.org/docs/rules/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Prettier Options: https://prettier.io/docs/en/options.html
