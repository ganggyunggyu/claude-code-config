---
description: React 커스텀 훅 자동 생성
argument-hint: <훅명> [옵션]
---

# React 커스텀 훅 생성

자주 사용하는 React 커스텀 훅을 자동으로 생성합니다.

## 사용법

```
/hook useDebounce
/hook useLocalStorage
/hook useIntersectionObserver
/hook useClickOutside
```

## 기본 템플릿

### useState 기반 훅
```typescript
// src/hooks/useToggle.ts
import { useState, useCallback } from 'react'

export const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return { value, toggle, setTrue, setFalse }
}
```

## 자주 사용하는 훅들

### useDebounce
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 사용 예시
const SearchInput = () => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    // API 호출
    fetchResults(debouncedSearch)
  }, [debouncedSearch])
}
```

### useLocalStorage
```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

// 사용 예시
const [user, setUser] = useLocalStorage('user', null)
```

### useIntersectionObserver
```typescript
// src/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react'

export const useIntersectionObserver = (
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { targetRef, isIntersecting }
}

// 사용 예시 (무한 스크롤)
const InfiniteScroll = () => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 1.0,
  })

  useEffect(() => {
    if (isIntersecting) {
      // 다음 페이지 로드
      loadMore()
    }
  }, [isIntersecting])

  return <div ref={targetRef}>Loading...</div>
}
```

### useClickOutside
```typescript
// src/hooks/useClickOutside.ts
import { useEffect, useRef } from 'react'

export const useClickOutside = <T extends HTMLElement>(
  handler: () => void
) => {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handler])

  return ref
}

// 사용 예시 (모달, 드롭다운)
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false)
  })

  return <div ref={dropdownRef}>...</div>
}
```

### usePrevious
```typescript
// src/hooks/usePrevious.ts
import { useRef, useEffect } from 'react'

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// 사용 예시
const Counter = ({ count }: { count: number }) => {
  const prevCount = usePrevious(count)

  return (
    <div>
      Now: {count}, Before: {prevCount}
    </div>
  )
}
```

### useCopyToClipboard
```typescript
// src/hooks/useCopyToClipboard.ts
import { useState } from 'react'

export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      return true
    } catch (error) {
      console.error('Copy failed', error)
      setCopiedText(null)
      return false
    }
  }

  return { copiedText, copy }
}

// 사용 예시
const CopyButton = ({ text }: { text: string }) => {
  const { copiedText, copy } = useCopyToClipboard()

  return (
    <button onClick={() => copy(text)}>
      {copiedText === text ? 'Copied!' : 'Copy'}
    </button>
  )
}
```

### useMediaQuery
```typescript
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// 사용 예시
const ResponsiveComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  )
}
```

### useWindowSize
```typescript
// src/hooks/useWindowSize.ts
import { useState, useEffect } from 'react'

interface WindowSize {
  width: number
  height: number
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// 사용 예시
const ResponsiveLayout = () => {
  const { width } = useWindowSize()

  return (
    <div>
      Window width: {width}px
    </div>
  )
}
```

### useInterval
```typescript
// src/hooks/useInterval.ts
import { useEffect, useRef } from 'react'

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// 사용 예시
const Timer = () => {
  const [count, setCount] = useState(0)

  useInterval(() => {
    setCount((c) => c + 1)
  }, 1000)

  return <div>{count}</div>
}
```

### useAsync
```typescript
// src/hooks/useAsync.ts
import { useState, useEffect } from 'react'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
  })

  const execute = async () => {
    setState({ data: null, error: null, isLoading: true })

    try {
      const data = await asyncFunction()
      setState({ data, error: null, isLoading: false })
      return data
    } catch (error) {
      setState({ data: null, error: error as Error, isLoading: false })
      throw error
    }
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [])

  return { ...state, execute }
}

// 사용 예시
const UserProfile = ({ userId }: { userId: string }) => {
  const { data, error, isLoading } = useAsync(
    () => fetchUser(userId),
    true
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return <div>{data.name}</div>
}
```

## 생성 프로세스

### 1단계: 훅 종류 결정
- 상태 관리형
- 이벤트 핸들링형
- API 호출형
- 유틸리티형

### 2단계: 파일 생성
```bash
src/hooks/use{HookName}.ts
```

### 3단계: 타입 정의
```typescript
interface UseHookOptions {
  // 옵션 타입
}

interface UseHookReturn {
  // 반환 타입
}
```

### 4단계: 테스트 작성 (선택)
```typescript
// src/hooks/use{HookName}.test.ts
import { renderHook, act } from '@testing-library/react'
import { useHookName } from './useHookName'

describe('useHookName', () => {
  it('should work', () => {
    const { result } = renderHook(() => useHookName())
    expect(result.current).toBeDefined()
  })
})
```

## 사용 예시

```
사용자: /hook useDebounce
```

**생성 파일:**
- `src/hooks/useDebounce.ts`
- 타입 정의 포함
- 사용 예시 주석 포함

## 주의사항

- **의존성 배열**: useEffect, useCallback 등에서 올바른 의존성 배열 사용
- **메모이제이션**: 불필요한 리렌더링 방지
- **클린업**: useEffect에서 이벤트 리스너 제거
- **타입 안정성**: 제네릭 타입 적절히 사용

## 참고

- React Hooks 공식 문서: https://react.dev/reference/react
- usehooks-ts: https://usehooks-ts.com/
- react-use: https://github.com/streamich/react-use
