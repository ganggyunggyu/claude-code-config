---
description: 대한민국 홈쇼핑 건강식품 주간 시트를 갱신하고 키워드요약 탭까지 검증
argument-hint: [verify]
---

# 홈쇼핑 주간 시트 반영

`/homeshopping-sheet`는 `text-gen-hub`의 홈쇼핑 시트 내보내기 스크립트를 실행해서 메인 탭과 `키워드요약` 탭을 함께 갱신함.

## 기본 규칙

- 작업 루트: `/Users/ganggyunggyu/Programing/21lab/text-gen-hub`
- 대상 스프레드시트: `1HErumqLrDcuCDlxnAlbB9efClvIVPihZq12kcUQzP2k`
- 메인 탭 gid: `1306070881` (`홈쇼핑일정키워드`)
- 요약 탭 제목: `키워드요약`
- 데이터 수집기: `scripts/homeshopping_schedule_data.py`
- 메인 스크립트: `scripts/export_homeshopping_to_sheet.py`
- 요약 스크립트: `scripts/export_homeshopping_keywords.py`
- 실행 후 반드시 두 탭을 다시 읽어서 행 수, 날짜 범위, 채널 수를 검증함.

## 데이터 기준

- 데이터 소스는 `https://api.hsmoa.net/v1/schedule`
- 대상 채널은 홈쇼핑모아 기준 `18개 채널`
- 기본 수집 창은 실행일 기준 `과거 4일 ~ 미래 2일`, 총 `7일`
- `scripts/homeshopping_schedule_data.py`가 수집 결과를 `/tmp/homeshopping_health_collection.json`에 캐시하고, 메인/요약 스크립트가 같은 캐시를 재사용함.
- `키워드요약` 탭은 매 실행 시 삭제 후 재생성되므로 gid가 바뀔 수 있음.

## 인자 해석

- 인자 없으면 메인 탭 반영 → 요약 탭 반영 → 검증까지 전부 실행함.
- `$ARGUMENTS`가 `verify`면 쓰기 작업은 건너뛰고 현재 시트 상태만 검증해서 보고함.

## 실행 전 점검

1. `uv` 실행 가능 여부 확인
2. `/Users/ganggyunggyu/Programing/21lab/text-gen-hub/export_to_sheet.py` 존재 여부 확인
3. `/Users/ganggyunggyu/Programing/21lab/text-gen-hub/scripts/export_homeshopping_to_sheet.py` 존재 여부 확인
4. `/Users/ganggyunggyu/Programing/21lab/text-gen-hub/scripts/export_homeshopping_keywords.py` 존재 여부 확인
5. `/Users/ganggyunggyu/Programing/21lab/text-gen-hub/scripts/homeshopping_schedule_data.py` 존재 여부 확인

필수 항목이 없으면 실행하지 말고 누락 항목부터 보고함.

## 실행 명령

```bash
cd /Users/ganggyunggyu/Programing/21lab/text-gen-hub && uv run python scripts/export_homeshopping_to_sheet.py
cd /Users/ganggyunggyu/Programing/21lab/text-gen-hub && uv run python scripts/export_homeshopping_keywords.py
```

## 검증 명령

메인 탭 검증:

```bash
curl -s 'https://docs.google.com/spreadsheets/d/1HErumqLrDcuCDlxnAlbB9efClvIVPihZq12kcUQzP2k/gviz/tq?tqx=out:csv&gid=1306070881' | ruby -rcsv -e 'rows=CSV.parse(STDIN.read); data=rows[1..] || []; dates=data.map{|r| r[0]}.uniq; channels=data.map{|r| r[1]}.uniq; puts "main_rows=#{data.size}"; puts "main_dates=#{dates.first}..#{dates.last}"; puts "main_channels=#{channels.size}"; puts "main_first=#{data.first.inspect}"; puts "main_last=#{data.last.inspect}"'
```

요약 탭 검증:

```bash
cd /Users/ganggyunggyu/Programing/21lab/text-gen-hub && uv run python - <<'PY'
import sys
from pathlib import Path

ROOT_DIR = Path.cwd()
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from scripts.export_homeshopping_keywords import get_client
from scripts.homeshopping_schedule_data import SPREADSHEET_ID, SUMMARY_WORKSHEET_TITLE

gc = get_client()
spreadsheet = gc.open_by_key(SPREADSHEET_ID)
ws = spreadsheet.worksheet(SUMMARY_WORKSHEET_TITLE)
rows = ws.get_all_values()
print(f"summary_gid={ws.id}")
print(f"summary_rows={len(rows)}")
for row in rows[:8]:
    print(row)
PY
```

## 실행 순서

1. 작업 루트와 필수 파일 확인
2. 인자가 `verify`가 아니면 메인 탭 스크립트 실행
3. 인자가 `verify`가 아니면 요약 탭 스크립트 실행
4. 메인 탭 검증
5. 요약 탭 검증
6. 결과를 아래 템플릿으로 보고

## 결과 보고 템플릿

```text
[홈쇼핑 시트 반영 보고]
- 모드: <full | verify>
- 실행 시각(KST): <YYYY-MM-DD HH:mm:ss>
- 데이터 소스: hsmoa schedule API 기준
- 메인 탭: <성공/실패>
- 메인 행수: <N>
- 메인 날짜 범위: <YYYY-MM-DD..YYYY-MM-DD>
- 메인 채널수: <N>
- 요약 탭: <성공/실패>
- 요약 행수: <N>
- 요약 상위 키워드: <상위 3개>
- 실행 명령: <실행한 명령 목록>
- 시트 URL: https://docs.google.com/spreadsheets/d/1HErumqLrDcuCDlxnAlbB9efClvIVPihZq12kcUQzP2k/edit#gid=1306070881
- 메모: <수집 날짜 창 / 요약 gid 재생성 여부 등>
```

## 사용 예시

- `/homeshopping-sheet` -> 메인 탭 반영 + 요약 탭 반영 + 검증
- `/homeshopping-sheet verify` -> 현재 시트 상태만 검증
