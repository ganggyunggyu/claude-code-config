# 카페 글 수정 (Sonnet 서브에이전트 원고 생성)

외부 API 대신 Sonnet 서브에이전트가 원고를 생성하고, 글 수정 + 댓글큐 등록까지 하는 스킬입니다.

## 작업 흐름

### 1단계: 입력 받기

사용자에게 아래 정보를 받습니다:

```
링크1 | 키워드1
링크2 | 키워드2
```

또는 표 형식, 또는 "벤타쿠 댓글 막힌 글 전부" 같은 자연어 요청도 가능.

**댓글 차단 글 자동 탐색도 지원:**
- "벤타쿠 댓글 막힌 글" → 최근 20개 글 중 `isWriteComment: false`인 것 자동 탐색
- 탐색 시 `scripts/find-blocked-comments.ts` 흐름 참고

### 2단계: 프롬프트 스타일 결정

| LOGIN_ID | 대상 카페 | 프롬프트 | 비고 |
|----------|----------|---------|------|
| `qwzx16` | 벤타쿠/으스스/다향만리 | `buildAnimePrompt` | 애니 스타일 |
| `21lab` | 샤넬/쇼핑/건강 | `buildOwnKeywordPrompt` | 광고 스타일 |

### 3단계: 프롬프트 빌드

```bash
npx tsx -e "
const { buildAnimePrompt } = require('./src/features/viral/prompts/build-anime-prompt');
const fs = require('fs');
const items = [/* articleId, keyword 쌍 */];
const prompts = items.map(item => ({
  articleId: item.articleId,
  keyword: item.keyword,
  prompt: buildAnimePrompt({ keyword: item.keyword, keywordType: 'own' }),
}));
fs.writeFileSync('/tmp/anime-prompts.json', JSON.stringify(prompts, null, 2));
"
```

- 광고 스타일이면 `buildOwnKeywordPrompt` 사용
- 일상 스타일이면 `buildShortDailyPrompt` 사용

### 4단계: Sonnet 서브에이전트로 원고 생성

각 키워드마다 Agent tool을 사용합니다:

```
Agent(model: "sonnet", prompt: "/tmp/anime-prompts.json에서 articleId N번 프롬프트 읽고 지시대로 원고 생성")
```

**필수 규칙:**
- **병렬 실행**: 독립적인 원고이므로 8개까지 동시 Agent 호출 가능
- 각 Agent는 `/tmp/anime-prompts.json` 파일을 Read해서 해당 articleId의 prompt를 읽고 실행
- 출력은 반드시 `[제목]`, `[본문]`, `[댓글]` 형식

### 5단계: 원고 저장

Agent 결과를 수집하여 `/tmp/generated-manuscripts.json`에 저장:

```json
[
  {
    "articleId": 770,
    "keyword": "원오크 내한 콘서트",
    "raw": "[제목]\n...\n\n[본문]\n...\n\n[댓글]\n..."
  }
]
```

### 6단계: 수정 + 댓글큐 등록 실행

```bash
npx tsx --env-file=.env.local scripts/run-modify-from-manuscripts.ts
```

이 스크립트가 자동으로:
1. `/tmp/generated-manuscripts.json` 읽기
2. `parseViralResponse`로 제목/본문/댓글 파싱
3. DB에서 writer 계정 조회
4. `modifyArticleWithAccount`로 글 수정 + 댓글 허용
5. `addViralCommentJobs`로 댓글/대댓글 BullMQ 큐 등록
6. DB 상태 `modified`로 업데이트

**딜레이:** 글 수정 간 10초, 첫 댓글 30초 후, 댓글 간 30~90초 랜덤

### 7단계: 결과 보고

수정 결과를 보고합니다:
- 성공/실패 건수
- 각 글의 새 제목
- 큐에 추가된 댓글/대댓글 수

## 환경 설정

- **LOGIN_ID**: `.env.local`의 `LOGIN_ID` 값 (벤타쿠는 `qwzx16`)
- **CAFE_ID**: 스크립트 내 `CAFE_ID` 상수 (벤타쿠: `31642514`)
- **원고 파일**: `/tmp/generated-manuscripts.json`
- **프롬프트 파일**: `/tmp/anime-prompts.json`

## 파일 경로

- 프롬프트 빌더: `src/features/viral/prompts/build-anime-prompt.ts`
- 파서: `src/features/viral/viral-parser.ts`
- 수정+큐 스크립트: `scripts/run-modify-from-manuscripts.ts`
- 글 수정 로직: `src/features/auto-comment/batch/article-modifier.ts`

## 사용법

```
/modify-posts-sonnet
```
