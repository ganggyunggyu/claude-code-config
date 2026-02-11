---
description: GitHub 프로젝트 분석 → 포트폴리오 + 기술 포스팅 MDX 자동 생성
run_mode: user
---

# GitHub 프로젝트 → MDX 자동 생성

IMPORTANT: Do NOT use emojis unless explicitly requested by the user.

GitHub 프로젝트 URL을 분석하여 포트폴리오 MDX와 기술 포스팅 MDX를 자동 생성합니다.

## 입력

```
/github-portfolio <GitHub URL>
```

예시: `/github-portfolio https://github.com/username/project-name`

## 실행 단계

### 1. GitHub 프로젝트 분석

**WebFetch 도구 사용**

- README 내용 분석
- 기술 스택 파악 (package.json, requirements.txt, go.mod 등)
- 주요 기능 정리
- 프로젝트 아키텍처 파악 (폴더 구조)
- 총 커밋 수 확인

### 2. 첫 커밋 날짜 확인

**GitHub API 또는 페이지 분석**

- 레포지토리 생성 날짜 또는 첫 커밋 날짜 확인
- 이 날짜를 포트폴리오의 `period` 시작일로 사용

```
period: YYYY년 MM월 DD일 - 현재
```

### 3. 현재 블로그 MDX 포맷 확인

**기존 파일 분석**

포트폴리오 MDX 위치:
```
src/content/portfolios/*.mdx
```

포스트 MDX 위치:
```
src/content/posts/*.mdx
```

각 폴더의 기존 파일을 읽어 frontmatter 형식을 파악합니다.

### 4. 포트폴리오 MDX 작성

**파일 위치**: `src/content/portfolios/{project-name}.mdx`

**frontmatter 형식**:
```yaml
---
title: 프로젝트 제목
description: 프로젝트 설명 (1-2문장)
date: YYYY-MM-DD (첫 커밋 날짜)
tags: [기술스택, 태그들]
period: YYYY년 MM월 DD일 - 현재 (첫 커밋 날짜 기준)
role: 개발 역할
featured: true/false
---
```

**본문 구성**:
1. 서비스 개요
2. 핵심 기능 (각 기능별 상세 설명)
3. 아키텍처 (FSD 등 구조 설명)
4. 기술적 도전 (문제 해결 사례)
5. 성과 및 결론

### 5. 기술 포스팅 MDX 작성

**파일 위치**: `src/content/posts/{topic-name}.mdx`

**frontmatter 형식**:
```yaml
---
title: 포스팅 제목
date: YYYY-MM-DD (현재 날짜)
tags: [관련 태그들]
excerpt: 포스팅 요약 (1-2문장)
---
```

**주제 선정 기준**:
- 프로젝트에서 사용한 핵심 기술
- 특별한 구현 패턴 (예: Adapter Pattern, SSE Streaming)
- 해결한 기술적 문제

**본문 구성**:
1. 기술 소개 및 배경
2. 구현 방법 (코드 예시 포함)
3. 실제 적용 사례 (프로젝트 연계)
4. 마무리 및 핵심 포인트

## 작성 원칙

### 포트폴리오
- 문제 해결 중심 서술
- 정량적 성과 포함 (가능한 경우)
- 기술적 도전과 극복 과정 강조

### 기술 포스팅
- 실용적인 코드 예시
- 단계별 설명
- 프로젝트 경험 연계

## 피해야 할 표현

- ❌ "혁신적인", "획기적인", "최첨단"
- ❌ "뛰어난 성능", "탁월한 구조"
- ❌ 과도한 마케팅 문구

## 선호하는 표현

- ✅ 구체적인 문제 상황 설명
- ✅ 해결 방법과 그 이유
- ✅ Before/After 비교
- ✅ 실제 수치 기반 성과

## 결과물

1. `src/content/portfolios/{project-name}.mdx` - 포트폴리오 문서
2. `src/content/posts/{tech-topic}.mdx` - 기술 포스팅

두 파일 모두 기존 블로그의 MDX 포맷과 일관성을 유지합니다.
