---
description: 네이버 인기글 HTML 구조 변경 시 셀렉터 자동 업데이트
argument-hint: 없음
---

# 네이버 인기글 셀렉터 업데이트

네이버 검색 결과의 "인기글" 섹션 HTML 구조가 변경되었을 때, 크롤링 셀렉터를 자동으로 업데이트합니다.

## 작동 방식

### 1단계: HTML 수집

1. 네이버에서 검색 (예: https://search.naver.com/search.naver?query=맛집)
2. 브라우저 개발자 도구 열기 (F12 또는 Cmd+Option+I)
3. 인기글 섹션 찾기
4. HTML 복사 (우클릭 → Copy → Copy outerHTML)

### 2단계: 커맨드 실행

```
/naver-popular-update
```

입력 후, 복사한 HTML을 붙여넣습니다.

### 3단계: 자동 처리

1. HTML 분석
   - 인기글 컨테이너 클래스명 추출
   - 각 아이템 래퍼 클래스명 추출
   - 제목 링크 셀렉터 찾기
   - 미리보기 텍스트 셀렉터 찾기

2. 코드 업데이트
   - `shared/naver/_popular.ts` 파일 수정
   - 새로운 셀렉터로 교체

3. 자동 커밋
   - 변경사항 자동 커밋
   - 커밋 메시지: "fix(naver): update popular items selector"

## 분석할 HTML 구조

### 컨테이너
```html
<div class="fds-ugc-single-intention-item-list">
  <!-- 인기글 목록 -->
</div>
```

### 각 인기글 아이템
```html
<div class="item_wrap">
  <a class="title_link" href="...">
    <span class="title_class">제목</span>
  </a>
  <div class="preview_text">미리보기...</div>
  <div class="blog_name">블로그명</div>
</div>
```

## 사용 시점

1. 인기글 크롤링이 실패할 때
   - 빈 배열 반환
   - extractPopularItems 함수에서 아무것도 못 찾음
   - 셀렉터가 더 이상 동작하지 않음

2. 네이버 UI 업데이트 이후
   - 네이버 검색 결과 페이지 디자인 변경
   - 클래스명 변경
   - HTML 구조 변경

## 실행 프로세스

### HTML 파싱
```typescript
const $ = cheerio.load(htmlString)
const container = $('.fds-ugc-single-intention-item-list')
const items = container.find('.item_wrap')
```

### 셀렉터 추출
```typescript
const containerClass = container.attr('class')
const itemClass = items.first().attr('class')
const titleSelector = items.find('a span').attr('class')
```

### 코드 생성 및 업데이트
```typescript
export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = cheerio.load(html)
  const items: PopularItem[] = []

  $('.새로운컨테이너 .새로운아이템').each((_, el) => {
    const $el = $(el)
    const title = $el.find('.새로운제목셀렉터').text().trim()
    // ...
  })

  return items
}
```

### 파일 업데이트 및 커밋
```bash
git add shared/naver/_popular.ts
git commit -m "fix(naver): update popular items selector"
```

## 주의사항

- 전체 HTML 제공: 인기글 섹션 전체를 복사하세요
- 여러 아이템 포함: 최소 2-3개의 인기글이 포함된 HTML
- 개발자 도구 사용: 브라우저 개발자 도구에서 정확한 HTML 구조 확인
- 테스트: 업데이트 후 실제로 크롤링이 잘 되는지 확인

## 관련 파일

- shared/naver/_popular.ts - 인기글 추출 함수
- app/routes/api.naver-popular.ts - API 라우트
- entities/naver/index.ts - 네이버 크롤링 엔티티

## 참고

이 커맨드는 naver-search-engine 프로젝트에서 사용됩니다.
네이버 검색 결과의 "인기글" 섹션을 크롤링하는 기능을 유지보수하기 위한 도구입니다.
