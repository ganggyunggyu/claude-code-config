---
description: 변경사항을 분석하여 파일별로 쪼개서 커밋
argument-hint: 없음
---

# 커밋 자동화

변경된 파일들을 분석하여 의미있는 단위로 커밋을 생성합니다.

## 작동 방식

1. **변경사항 확인**

   - `git status`로 변경된 파일 목록 확인
   - `git diff`로 각 파일의 변경 내용 분석

2. **파일 분류**

   - 연관된 파일끼리 그룹화
   - 기능별, 영역별로 분류
   - 독립적인 변경사항 구분

3. **커밋 메시지 생성**

   - Conventional Commits 형식 사용
   - 변경 내용을 명확하게 설명
   - 관련 파일들을 하나의 커밋으로

4. **커밋 실행**
   - 파일별로 순차적으로 커밋
   - 각 커밋은 독립적으로 동작 가능
   - 명확한 커밋 히스토리 생성

## 커밋 메시지 형식

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 종류

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 등 (동작 변경 없음)
- `refactor`: 리팩토링 (기능 변경 없음)
- `test`: 테스트 추가/수정
- `chore`: 빌드, 패키지 매니저 등 기타 변경

### 예시

```bash
feat(user): add user profile page

- Create UserProfile component
- Add API integration
- Implement profile editing

feat(auth): implement JWT authentication

- Add login/logout functionality
- Create auth middleware
- Update user service

fix(cart): fix cart total calculation

- Correct discount calculation
- Handle empty cart case

refactor(api): reorganize API structure

- Move endpoints to separate files
- Add error handling
- Improve type safety

docs(readme): update installation guide

- Add prerequisites
- Update setup steps
- Add troubleshooting section

style(components): format code with prettier

- Apply consistent formatting
- Remove unused imports
```

## 실행 프로세스

### 1단계: 상태 확인

```bash
git status
git diff --stat
```

**분석 내용:**

- 변경된 파일 목록
- 추가/삭제된 라인 수
- 파일 유형 (신규/수정/삭제)

### 2단계: 변경사항 그룹화

**기준:**

- 같은 기능/도메인
- 연관된 파일들
- 의존 관계

**예시:**

```
그룹 1: 사용자 프로필 기능
- src/pages/UserProfile.tsx
- src/components/ProfileCard.tsx
- src/hooks/useUser.ts
- src/types/user.ts

그룹 2: API 엔드포인트
- src/api/users.ts
- src/api/auth.ts

그룹 3: 스타일링
- src/styles/global.css
- tailwind.config.js
```

### 3단계: 커밋 메시지 생성

각 그룹마다:

1. 변경 내용 분석
2. 적절한 type 선택
3. scope 결정
4. 간결한 subject 작성
5. 필요시 body 추가

### 4단계: 커밋 실행

```bash
# 그룹 1
git add src/pages/UserProfile.tsx src/components/ProfileCard.tsx src/hooks/useUser.ts src/types/user.ts
git commit -m "feat(user): add user profile page

- Create UserProfile component with profile display
- Add ProfileCard component for user info
- Implement useUser hook for data fetching
- Define User type interface"

# 그룹 2
git add src/api/users.ts src/api/auth.ts
git commit -m "feat(api): add user and auth endpoints

- Implement user CRUD operations
- Add JWT authentication endpoints
- Include error handling"

# 그룹 3
git add src/styles/global.css tailwind.config.js
git commit -m "style: update global styles and tailwind config

- Add custom color palette
- Update typography settings
- Configure responsive breakpoints"
```

## 특수 케이스 처리

### 대규모 변경

여러 개의 작은 커밋으로 분할:

```bash
git add -p  # 일부만 스테이징
git commit -m "..."
```

### 의존성 변경

별도 커밋으로 분리:

```bash
git add package.json package-lock.json
git commit -m "chore(deps): update dependencies

- Update react to 18.3.0
- Update next to 14.2.0"
```

### 설정 파일 변경

독립적으로 커밋:

```bash
git add .eslintrc.json .prettierrc
git commit -m "chore(config): update linting rules"
```

### 문서 변경

문서만 별도로:

```bash
git add README.md docs/
git commit -m "docs: update documentation

- Add installation guide
- Update API reference"
```

## 체크리스트

커밋 전 확인사항:

- [ ] 각 커밋이 독립적으로 동작하는가?
- [ ] 커밋 메시지가 명확한가?
- [ ] 관련 파일들이 함께 커밋되는가?
- [ ] 불필요한 파일이 포함되지 않았는가?
- [ ] 테스트가 통과하는가?
- [ ] 린트 에러가 없는가?

## 사용 예시

### 명령어 호출

```
사용자: 커밋 ㄱ
```

### Claude 응답 프로세스

1. 변경사항 분석

   ```bash
   git status
   git diff --stat
   ```

2. 그룹화 및 분석 결과 제시

   ```
   다음과 같이 3개의 커밋으로 나누겠습니다:

   1. 사용자 프로필 기능 (feat)
   2. API 엔드포인트 (feat)
   3. 스타일 업데이트 (style)
   ```

3. 각 커밋 실행

   ```bash
   # 실제 git 명령어 실행
   git add [파일들...]
   git commit -m "[메시지]"
   ```

4. 결과 확인
   ```bash
   git log --oneline -5
   ```

## 주의사항

- **커밋 전 테스트**: 각 커밋 후 코드가 정상 동작하는지 확인
- **원자적 커밋**: 각 커밋은 하나의 완결된 변경사항
- **명확한 메시지**: 나중에 읽어도 이해 가능한 메시지
- **리뷰 가능성**: 코드 리뷰하기 쉬운 크기로 분할

## 참고

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
