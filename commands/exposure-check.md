---
description: exposure-check 숫자 메뉴형 실행기 (세분화 + 상세 보고)
argument-hint: [메뉴번호 | 메뉴번호 옵션]
---

# exposure-check 메뉴 실행기

`$ARGUMENTS`를 숫자 메뉴로 해석해서 이 프로젝트의 실제 명령을 실행합니다.

## 기본 규칙

- 레포 루트는 `/Users/ganggyunggyu/Programing/blog-cron-bot`로 고정합니다.
- 인자가 없으면 실행하지 않고 메인 메뉴를 먼저 보여줍니다.
- 상위 메뉴 번호(`1`, `2`, `3`, `9`)만 입력되면 서브 메뉴를 먼저 보여줍니다.
- 실행이 끝나면 항상 "상세 보고 템플릿"으로 결과를 출력합니다.

## 메인 메뉴

```text
실행할 작업 번호를 입력해주세요.
1) 페이지 크론
2) 루트 크론/스케줄러
3) 로그인/쿠키
9) 보고/상태
```

## 서브 메뉴 및 번호 매핑

### 1) 페이지 크론

`1`만 입력 시 아래 메뉴를 출력합니다.

```text
[1] 페이지 크론
1-1) 전체 시트 실행
1-2) 단일 시트 실행
1-3) 특정 시트 제외 실행
1-4) 1분 테스트 크론 실행
```

- `1-1` -> `pnpm cron:pages`
- `1-2 <sheet-type>` -> `pnpm cron:pages <sheet-type>`
- `1-3 <sheet-type>` -> `pnpm cron:pages --exclude <sheet-type>`
- `1-4` -> `pnpm cron:p`

### 2) 루트 크론/스케줄러

`2`만 입력 시 아래 메뉴를 출력합니다.

```text
[2] 루트 크론/스케줄러
2-1) 루트 크론 실행
2-2) 루트 스케줄러 실행
2-3) 루트 스케줄러 테스트
2-4) 2AM 테스트 시나리오 실행
```

- `2-1` -> `pnpm cron:root`
- `2-2` -> `pnpm scheduler:root`
- `2-3` -> `pnpm scheduler:root:test`
- `2-4` -> `pnpm cron:2am`

### 3) 로그인/쿠키

`3`만 입력 시 아래 메뉴를 출력합니다.

```text
[3] 로그인/쿠키
3-1) 로그인 상태 확인
3-2) 자동 로그인
3-3) 쿠키 갱신
3-4) 수동 로그인 후 쿠키 획득
```

- `3-1` -> `pnpm check-login`
- `3-2` -> `pnpm cookie:auto`
- `3-3` -> `pnpm cookie:update`
- `3-4` -> `pnpm cookie:login`

### 9) 보고/상태

`9`만 입력 시 아래 메뉴를 출력합니다.

```text
[9] 보고/상태
9-1) 최근 output CSV 5개
9-2) 최근 logs JSON 5개
9-3) cron 로그 tail 100줄
9-4) 실행 환경 점검 리포트
```

- `9-1` -> `ls -lt output | head -n 6`
- `9-2` -> `ls -lt logs | head -n 6`
- `9-3` -> `tail -n 100 cron_p_output.log` (없으면 `cron_log.txt` 대체)
- `9-4` -> 아래 항목 점검
  - `pnpm` 사용 가능 여부
  - `.env` 파일 존재 여부
  - `MONGODB_URI` 설정 여부
  - `PAGE_CHECK_API` 설정 여부

## sheet-type 정규화

`1-2`, `1-3`에서 입력된 시트명을 아래 slug로 정규화합니다.

- 흑염소 / `black-goat` -> `black-goat`
- 약재효능 / `herb-effect` -> `herb-effect`
- 다이어트보조제 / `diet-supplement` -> `diet-supplement`
- 피부시술 / `skin-procedure` -> `skin-procedure`
- 약처방 / `prescription` -> `prescription`
- 치과 / `dental` -> `dental`
- 안과 / `eye-clinic` -> `eye-clinic`
- 애견 / `pet` -> `pet`
- 치질 / `hemorrhoid` -> `hemorrhoid`
- 서리펫 / `suripet` -> `suripet`

유효하지 않은 시트명이면 실행하지 말고 유효 목록을 안내합니다.

## 실행 전 체크

아래 작업(`1-*`, `2-*`, `3-*`)은 실행 전에 점검합니다.

1. 현재 작업 경로가 프로젝트 루트인지
2. `pnpm` 실행 가능 여부
3. `.env` 파일 존재 여부
4. `MONGODB_URI` 유효 여부
5. 페이지 크론 계열(`1-*`)은 `PAGE_CHECK_API` 유효 여부

필수 항목 누락 시 실행하지 말고 누락값을 먼저 리포트합니다.

## 상세 보고 템플릿

모든 실행/조회 결과를 아래 형식으로 출력합니다.

```text
[exposure-check 실행 보고]
- 요청: <사용자 입력>
- 메뉴: <예: 1-2>
- 실행 시각(KST): <YYYY-MM-DD HH:mm:ss>
- 실행 명령: <실행한 명령>
- 사전 점검: <통과/실패 + 항목>
- 실행 결과: <성공/실패 + 핵심 로그 3~7줄 요약>
- 산출물: <생성/변경 파일 경로>
- 참고 로그: <확인한 로그 파일 경로>
- 다음 액션: <필요하면 1개 제안>
```

`9-*` 조회도 같은 템플릿을 사용하되 "실행 명령"에 조회 명령을 기록합니다.

## 입력 예시

- `/exposure-check` -> 메인 메뉴 출력
- `/exposure-check 1` -> 페이지 크론 서브 메뉴 출력
- `/exposure-check 1-1` -> 전체 페이지 크론 실행
- `/exposure-check 1-2 pet` -> `pnpm cron:pages pet`
- `/exposure-check 1-3 suripet` -> `pnpm cron:pages --exclude suripet`
- `/exposure-check 2-1` -> `pnpm cron:root`
- `/exposure-check 3-2` -> `pnpm cookie:auto`
- `/exposure-check 9-1` -> 최근 output 목록 보고
- `/exposure-check 9-4` -> 환경 점검 리포트

## 오류 처리 규칙

- 알 수 없는 번호는 실행하지 않고 가능한 번호를 다시 출력합니다.
- 서브 메뉴인데 필수 인자가 없으면 실행하지 않고 예시를 함께 안내합니다.
- 명령 실패 시 즉시 중단하고 실패 원인 + 재실행 권장 번호를 보고합니다.

이 규칙으로 숫자 메뉴형 실행과 상세 보고를 일관되게 수행하세요.
