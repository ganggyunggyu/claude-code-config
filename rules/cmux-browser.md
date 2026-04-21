# Browser Automation

## 도구 우선순위

1. **OpenClaw 브라우저** (우선) — AI 에이전트 전용, 안정적
2. **cmux 브라우저** (보조) — OpenClaw이 안 될 때만

GUI 브라우저(Safari, Chrome 등)를 직접 열지 않는다.

---

## OpenClaw Browser (Primary)

### Core Commands

```bash
# 상태 확인
openclaw browser status

# 브라우저 시작/종료
openclaw browser start
openclaw browser stop

# URL 열기 (새 탭)
openclaw browser open <url>

# 현재 탭에서 이동
openclaw browser navigate <url>

# 페이지 스냅샷 (AI용)
openclaw browser snapshot
openclaw browser snapshot --efficient
openclaw browser snapshot --labels

# 탭 관리
openclaw browser tabs
openclaw browser focus <target-id>
openclaw browser close <target-id>
openclaw browser tab <index>

# 인터랙션 (ref 기반)
openclaw browser click <ref>
openclaw browser type <ref> "text"
openclaw browser type <ref> "text" --submit
openclaw browser hover <ref>
openclaw browser drag <ref-from> <ref-to>
openclaw browser select <ref> "option"
openclaw browser scrollintoview <ref>

# 폼 채우기 (일괄)
openclaw browser fill --fields '[{"ref":"1","value":"Ada"}]'

# 키보드
openclaw browser press Enter
openclaw browser press Tab

# 대기
openclaw browser wait --text "Done"
openclaw browser wait --selector "<css>"
openclaw browser wait --url-contains "<text>"

# 스크린샷
openclaw browser screenshot
openclaw browser screenshot --full-page
openclaw browser screenshot --ref <ref>

# 쿠키/스토리지
openclaw browser cookies
openclaw browser storage local get <key>

# JS 실행
openclaw browser evaluate --fn '(el) => el.textContent' --ref <ref>

# 다이얼로그 처리
openclaw browser dialog --accept
openclaw browser dialog --dismiss

# 파일 업로드
openclaw browser upload /path/to/file

# 콘솔/에러 확인
openclaw browser console
openclaw browser errors
```

### Workflow

1. `openclaw browser open <url>` — 새 탭에서 URL 열기
2. `openclaw browser snapshot` — 현재 페이지 상태 파악 (ref 번호 확인)
3. ref 번호로 인터랙션 (`click`, `type`, `fill`)
4. `openclaw browser snapshot`으로 결과 확인

---

## cmux Browser (Fallback)

### Core Commands

```bash
cmux browser open <url>
cmux browser surface:<id> snapshot --compact
cmux browser surface:<id> click --selector "<css>"
cmux browser surface:<id> fill --selector "<css>" --text "<text>"
cmux browser surface:<id> type --selector "<css>" --text "<text>"
cmux browser surface:<id> press --key "Enter"
cmux browser surface:<id> wait --selector "<css>"
cmux browser surface:<id> screenshot --out /tmp/screenshot.png
```

---

## Subagent Integration

브라우저 작업을 서브 에이전트에게 위임 시:
- **반드시 "OpenClaw 브라우저(`openclaw browser`) 기준으로 작업해"** 지침을 포함한다
- OpenClaw 명령어 예시도 함께 전달한다
- cmux browser는 OpenClaw이 실패할 때만 폴백으로 사용

## Notes

- snapshot의 ref 번호로 요소 참조 (`click <ref>`, `type <ref> "text"`)
- `--submit` 플래그로 type 후 자동 엔터 가능
- 외부 GUI 앱(`open` 명령 등)으로 브라우저를 열지 않는다
- OpenClaw은 프로필 기반 세션 관리 지원 (`--browser-profile`)
