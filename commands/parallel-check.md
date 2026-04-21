---
description: cron:p / cron:pages 시트를 병렬로 노출체크하고 완료 시 자동 내보내기
argument-hint: [그룹 | 시트목록] (예: cron, pages, all, "pet suripet", "1 2")
---

# 병렬 노출체크 실행기

`$ARGUMENTS`를 해석해서 여러 시트의 노출체크를 **병렬**로 실행합니다.

## 기본 규칙

- 레포 루트: `/Users/ganggyunggyu/Programing/blog-cron-bot`
- 인자가 없으면 메뉴를 보여줍니다.
- 모든 프로세스는 **백그라운드(`run_in_background: true`)**로 실행합니다.
- 완료될 때마다 즉시 결과 확인 + 내보내기를 수행합니다.
- 전체 완료 후 종합 요약 테이블을 출력합니다.

## 메뉴

인자 없이 호출 시 아래를 출력합니다.

```text
[병렬 노출체크]
1) cron:p 3개 시트 (패키지 / 일반건 / 도그마루)
2) pages 시트 선택 실행
3) 전체 (cron:p 3개 + pages 전체)
```

## 그룹 정의

### 1) cron 그룹 (cron:p 시트) — sheet-direct-check 방식

패키지 / 일반건 / 도그마루 3개를 **시트 직접 접근** 방식으로 병렬 실행합니다.
시트에서 키워드를 직접 읽고, 결과를 같은 행에 직접 쓰므로 **행 순서가 보존**됩니다.

**시트 ID**: `1T9PHu-fH6HPmyYA9dtfXaDLm20XAPN-9mzlE2QTPkF0`

**실행 명령** (각각 별도 백그라운드 프로세스):

```bash
pnpm ts-node src/tools/sheet-direct-check.ts 1T9PHu-fH6HPmyYA9dtfXaDLm20XAPN-9mzlE2QTPkF0 패키지
pnpm ts-node src/tools/sheet-direct-check.ts 1T9PHu-fH6HPmyYA9dtfXaDLm20XAPN-9mzlE2QTPkF0 일반건
pnpm ts-node src/tools/sheet-direct-check.ts 1T9PHu-fH6HPmyYA9dtfXaDLm20XAPN-9mzlE2QTPkF0 도그마루
```

**내보내기**: 시트에 직접 쓰기 때문에 별도 내보내기(importKeywords) 불필요.

> ⚠️ 이전의 `ONLY_SHEET_TYPE` + `importKeywords` 방식은 MongoDB를 거치면서 시트 행 순서가 꼬이므로 사용하지 않습니다.

### 2) pages 그룹 (cron:pages 시트)

사용 가능한 시트 타입:

| 한글명 | slug | 비고 |
|--------|------|------|
| 흑염소 신규 | `black-goat-new` | 4페이지 |
| 흑염소 구 | `black-goat-old` | 1페이지 |
| 다이어트보조제 | `diet-supplement` | 4페이지 |
| 피부시술 | `skin-procedure` | 4페이지 |
| 약처방 | `prescription` | 4페이지 |
| 치과 | `dental` | 4페이지 |
| 안과 | `eye-clinic` | 4페이지 |
| 애견 | `pet` | 9페이지 |
| 서리펫 | `suripet` | 9페이지 |

**실행 명령** (각각 별도 백그라운드 프로세스):

```bash
pnpm cron:pages <sheet-type>
```

`cron:pages`는 내보내기가 자동 포함되어 있으므로 별도 내보내기 불필요합니다.

**인자 형식**:
- `pages` → 서브 메뉴 출력 (시트 목록 안내)
- `pages pet suripet` → 애견 + 서리펫 병렬
- `pages 흑염소신규 애견` → 한글 → slug 정규화 후 병렬

### 3) all (전체)

cron 그룹 3개 + pages 전체 시트를 동시에 실행합니다.
시트 수가 많으므로 네이버 차단 위험을 안내한 뒤 실행합니다.

## 시트명 정규화

한글 입력을 slug로 변환합니다.

| 입력 | slug |
|------|------|
| 패키지 | `package` |
| 일반건 / 도그마루제외 | `dogmaru-exclude` |
| 도그마루 | `dogmaru` |
| 흑염소신규 / 흑염소 신규 | `black-goat-new` |
| 흑염소구 / 흑염소 구 | `black-goat-old` |
| 다이어트보조제 | `diet-supplement` |
| 피부시술 | `skin-procedure` |
| 약처방 | `prescription` |
| 치과 | `dental` |
| 안과 | `eye-clinic` |
| 애견 | `pet` |
| 서리펫 | `suripet` |

## 실행 흐름

1. 인자 파싱 → 실행할 시트 목록 결정
2. 각 시트별 백그라운드 프로세스 시작 (Bash `run_in_background: true`)
3. 실행 현황 테이블 출력:
   ```
   | 프로세스 | 시트 | ID | 상태 |
   |----------|------|----|------|
   | 패키지 | package | bXXXXXX | 실행 중 |
   | ...
   ```
4. 각 프로세스 완료 시:
   - `tail -20`으로 결과 요약 확인
   - cron 그룹이면 내보내기 실행
   - 완료 결과 보고
5. 전체 완료 후 종합 요약:
   ```
   | 시트 | 키워드 | 노출 | 인기글 | 스블 | 시간 | 내보내기 |
   |------|--------|------|--------|------|------|----------|
   | ... | ... | ... | ... | ... | ... | ✅ |
   | 합계 | N | N | N | N | - | - |
   ```

## 입력 예시

- `/parallel-check` → 메뉴 출력
- `/parallel-check 1` 또는 `/parallel-check cron` → cron:p 3개 시트 병렬
- `/parallel-check 2 pet suripet` 또는 `/parallel-check pages pet suripet` → 애견+서리펫 병렬
- `/parallel-check 2 흑염소구` → 흑염소 구 단독 실행
- `/parallel-check 3` 또는 `/parallel-check all` → 전체 병렬

## 오류 처리

- 유효하지 않은 시트명 → 유효 목록 안내
- 프로세스 실패(exit code != 0) → 에러 로그 `tail -30` 출력 + 재실행 안내
- 내보내기 실패 → 에러 메시지 출력 + 수동 내보내기 명령 안내

## 주의사항

- cron 그룹은 sheet-direct-check 방식이므로 별도 내보내기 불필요 (시트에 직접 기록됨)
- pages 그룹은 내보내기 자동 포함
- 9페이지 시트(pet, suripet)는 시간이 오래 걸림 (30~45분)
- 너무 많은 시트를 동시에 돌리면 네이버 차단 위험 있음
