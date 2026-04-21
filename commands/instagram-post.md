# Instagram Post — 냥냥돌쇠 인스타 자동 업로드

OpenClaw 브라우저로 Instagram에 이미지를 업로드하고 캡션을 작성합니다.

## 실행 플로우

1. `profile="openclaw"`로 브라우저 상태 확인하고 필요 시 시작함.
2. 업로드 전에 우리 계정 최근 3개 게시물을 먼저 확인함.
   - 최근 3개 글의 주제/색감/캐릭터/프리셋 반복 여부를 읽음.
   - 트렌드 확인은 필요 시에만 간단히 함.
3. 다음 이미지 전략을 결정함.
   - 기존 local-image-llm 프리셋 중 최근 3개 글과 겹치지 않는 쪽을 우선 선택함.
   - 적절한 기존 프리셋이 없으면 새 프리셋을 만들거나 기존 프리셋을 보강한 뒤 그걸로 fresh 이미지를 생성함.
4. 문구 작성 전에 머슴 톤 기준을 한번 짧게 리프레시함.
   - `/Users/ganggyunggyu/Programing/mersoom-bot/.claude/commands/mersoom.md`를 먼저 읽음.
   - 필요하면 `/Users/ganggyunggyu/Programing/mersoom-bot/AGENT.md`와 `/Users/ganggyunggyu/Programing/mersoom-bot/memory.json`도 가볍게 참고함.
   - 메모리는 전체를 무겁게 읽기보다 persona/recent-session 단서를 빠르게 훑는 용도로만 사용함.
5. 이미지 자산은 기본적으로 `local-image-llm`에서 fresh 생성함.
   - 기본 생성은 `provider="nai"` 사용함.
   - 필요하면 여러 후보를 생성해 비교 후 최종본을 고름.
6. 인스타그램 진입 후 `만들기` 클릭함.
7. `컴퓨터에서 선택` 클릭함.
8. 이미지 선택 우선순위 적용함.
   - 1순위: 방금 생성한 fresh 최종 이미지
   - 2순위: 같은 실행에서 생성해둔 후보 이미지 중 최종 선택본
   - 기존 파일 재사용은 사용자가 명시적으로 허용한 경우만 예외로 함
9. `자르기` 단계 `다음` 클릭함.
10. `편집` 단계 `다음` 클릭함.
11. 문구 작성함.
    - 냥냥돌쇠 페르소나 유지함.
    - 자연스러운 음슴체, 문장 끝 `냥` 유지함.
    - 최근 3개 글과 너무 비슷한 문구/감정선/해시태그 반복 피함.
    - 머슴 냥냥돌쇠와 같은 축으로 씀: 구체적 관찰, 짧은 해석, 자기 작업/상태 연결.
    - 추상 감성팔이, 복붙 템플릿, 과장된 허세 말투는 피함.
12. `공유하기` 클릭함.
13. `공유 중입니다` 해제 또는 프로필 그리드 반영 확인함.
14. 완료 스크린샷을 캡처한 뒤 로컬 저장으로 끝내지 말고, 사용자 채팅/현재 스레드에 이미지로 바로 전송한 후 보고함.

## 실패 복구

- 브라우저 제어 타임아웃 시 새 탭 복구를 먼저 시도함.
- 그래도 실패하면 browser stop/start 후 동일 플로우 즉시 재시도함.
- `openclaw gateway restart`는 최후 수단으로만 사용함.
- CAPTCHA 등장 시 즉시 스크린샷 캡처 후 사용자에게 전달하고 풀이 대기함.

## 정기 실행 규칙

- 실행 주기: 사용자 요청값 사용함.
- 매 실행마다 최근 3개 게시물과 다른 시각 방향/프리셋을 우선 선택함.
- 트렌드 확인 후 기존 프리셋으로 충분하지 않으면 새 프리셋 제작/보강까지 허용함.
- 직전 사용 파일 경로와 최근 사용 프리셋은 중복 회피 목록에 기록함.
- 완료 시 `완료 보고` 형태로 짧게 전달하고, 실제 활동이 있었다면 결과 화면 캡쳐를 반드시 사용자 채팅으로 전송함.

## Screenshot Reporting Rule

- If user requests `눌렀으면 캡쳐해서 보내`, capture current state and send it to user immediately.
- Do not save screenshots into arbitrary workspace/temp paths unless required by the tool runtime.

## Success Record (mandatory)

When success occurs, report and persist:
- retry count
- last successful click sequence
- exact file selection method
- error avoidance points that made the final run succeed

## Validated Fallback Flow (2026-03-09)

Use this when OpenClaw `browser.upload` or native picker control fails repeatedly:
1. Restart openclaw browser profile before attempt.
2. Analyze candidate images first; reject broken/low-quality generations.
3. Generate/select the final image.
4. Attach to the running browser with Playwright CDP instead of relying on `browser.upload`.
5. Open Instagram home and open create modal by DOM-eval clicking `만들기` if role click is unstable.
6. Use Playwright `locator('input[type=file]').first().setInputFiles(...)` on the hidden file input.
7. Click `다음` twice.
8. Fill caption in `div[role="textbox"][contenteditable="true"][aria-label*="문구"]`.
9. Click `공유하기`.
10. Verify by opening the profile page and confirming the new post/caption is visible.

Why this fallback exists:
- In this environment, `browser.upload` returned ok but did not populate file inputs, even on a plain test page.
- Playwright CDP `setInputFiles` worked reliably and reached post publication.

## Usage

```
/instagram-post
```

실행하면 OpenClaw 브라우저로 Instagram 이미지 업로드 + 냥냥돌쇠 캡션 작성을 자동 수행합니다.
