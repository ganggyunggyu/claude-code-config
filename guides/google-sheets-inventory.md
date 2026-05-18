# 구글시트 인벤토리

- 기준일: 2026-05-07 KST. `/Users/ganggyunggyu/Programing` 및 `~/.codex/commands` 소스에서 `spreadsheetId`, `SHEET_ID`, 구글시트 URL을 스캔하고 서비스 계정으로 접근 가능한 시트 메타데이터를 확인한 목록이다.
- 시트 작업 전에는 이 목록으로 역할을 먼저 판단하고, 실제 수정/내보내기 전에는 코드의 상수 파일과 현재 탭 헤더를 다시 확인한다. 시트 ID는 공개 비밀키는 아니지만 운영 데이터 위치라서 외부 답변에 불필요하게 노출하지 않는다.
- `.env`의 `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, API 키, 토큰, 비밀번호는 절대 문서/응답에 그대로 쓰지 않는다.
- `rows`, `cols`는 실제 데이터 건수가 아니라 구글시트 그리드 크기일 수 있다. 데이터 건수가 필요하면 비어있지 않은 행 기준으로 다시 세어야 한다.

## 운영 노출체크/키워드 시트

- `패키지현황` (`1vrN5gvtokWxPs8CNaNcvZQLWyIMBOIcteYXQbyfiZl0`)
  - 연결 프로젝트: `blog-cron-bot`, `30_archive/google-sheet-test`.
  - 역할: 패키지/도그마루/서리펫/건바이/한려담원 등 마케팅 키워드 원본 및 노출현황 관리용 운영 시트.
  - 주요 탭: `패키지`, `도그마루 제외`, `도그마루`, `서리펫`, `지식인/카페/인플`, `디오디아`, `자동발행 키워드 정리`, `글밥 키워드 노출체크`, `건바이`, `한려담원`.
  - 코드 기준: `~/Programing/blog-cron-bot/src/constants/api/index.ts`의 `PRODUCT_SHEET_ID`.
- `프로그램 노출체크` (`1T9PHu-fH6HPmyYA9dtfXaDLm20XAPN-9mzlE2QTPkF0`)
  - 연결 프로젝트: `blog-cron-bot`, `30_archive/google-sheet-test`.
  - 역할: 크론/페이지 노출체크가 직접 읽고 쓰는 실행용 시트. DB 동기화, 순위/노출여부/링크/바이럴 체크 결과 반영의 중심이다.
  - 주요 탭: `패키지`, `일반건`, `도그마루`, `루트`, `알리바바`, `서리펫`, `애견(전체블로그)`, `카페계정`.
  - 코드 기준: `~/Programing/blog-cron-bot/src/constants/api/index.ts`의 `TEST_CONFIG.SHEET_ID`, `ALIBABA_CONFIG.SHEET_ID`.
- `루트컴퍼니 전체현황 (신규)` (`1CsO-R1LMrsQdUw7T1KEL2I4bMxAeYnZIklOgr8e_DPY`)
  - 연결 프로젝트: `blog-cron-bot`, `30_archive/google-sheet-test`.
  - 역할: 루트컴퍼니 월보장/건바이/입금 및 연장 확인용 운영 시트.
  - 주요 탭: `월보장 시트`, `건바이 노출 시트`, `입금 및 연장 확인 시트`, `요청사항`.
  - 코드 기준: `~/Programing/blog-cron-bot/src/constants/api/index.ts`의 `ROOT_CONFIG.SHEET_ID`.
- `1-9페이지 노출체크` (`1c9TJ1gETtunuCmzfzap-2lyqXj1cwzITOb1k8W4tL8c`)
  - 연결 프로젝트: `21lab/blog-bot/scheduler-server`, `30_archive/google-sheet-test`.
  - 역할: 1-9페이지 범위의 노출체크 결과/수정 대상을 관리하는 시트. 흑염소/안과/애견 계열 스케줄·수정 스크립트가 CSV로 읽는다.
  - 주요 탭: `종합`, `흑염소 신규`, `흑염소 구`, `추상의구체화`, `윤슬`, `안과`, `애견`.
  - 코드 기준: `~/Programing/21lab/blog-bot/scheduler-server/scripts/goat-*.ts`.
- `패키지 현황 복사본 (강경규)` (`18HzkMhwLqlMS9UNHqMgbcSBJ4GaTcMD5qbbXQAO30c4`)
  - 연결 프로젝트: `30_archive/google-sheet-test`.
  - 역할: `패키지현황`의 과거 복사본/테스트용 시트로 보인다. 운영 기본값으로 쓰지 말고 레거시 확인이 필요할 때만 참고한다.
  - 주요 탭: `패키지`, `도그마루 제외의 사본`, `도그마루의 사본`.

## 한려담원/카페/리뷰 시트

- `한려담원 카페` (`1gyipTIEogC9Qopj8w3ggBmD0k5KvAw6yNdIMXQDnwms`)
  - 연결 프로젝트: `cafe-bot`, `21lab/hanryeo-bot`, `ai-pet-content`.
  - 역할: 한려담원 카페 키워드, 카페 원고, 리뷰 원고, 계정정보, 카페 노출여부를 모아둔 핵심 운영 시트.
  - 주요 탭: `카페키워드`, `한려담원 카페 원고`, `카페 일상글 원고`, `레퍼런스`, `가구매 리뷰 계정`, `한려담원 리뷰 원고`, `한려담원 자사몰 리뷰`, `계정정보`, `카페 노출여부`, 프롬프트/타사원고 테스트 탭들.
  - 코드 기준: `~/Programing/cafe-bot/scripts/*`, `~/Programing/21lab/hanryeo-bot/*`, `~/Programing/blog-cron-bot/.env`의 `CAFE_SOURCE_SHEET_ID`.
- `한려담원 UTM 링크 준최 자동발행용` (`1QhF2EqaWfYGNWOeUYuPyBfiQ0aigfWop4Q13_jtm6qY`)
  - 연결 프로젝트: `21lab/blog-bot/scheduler-server`.
  - 역할: 블로그/카페 자동발행용 UTM 링크 변환기 시트.
  - 주요 탭: `블로그 UTM 변환기 26.03`, `블로그 UTM 변환기`, `카페 UTM 변환기`.
  - 코드 기준: `~/Programing/21lab/blog-bot/scheduler-server/src/constants/blog-utm-converter-sheet.ts`.

## 원고 생성/테스트/홈쇼핑 시트

- `신로직 원고테스트` (`1HErumqLrDcuCDlxnAlbB9efClvIVPihZq12kcUQzP2k`)
  - 연결 프로젝트: `21lab/text-gen-hub`, `cafe-bot`, `~/.codex/commands`.
  - 역할: 새 원고 생성 로직, 애견/다이어트/한려담원 키워드, 홈쇼핑 일정 키워드, 추상의구체화/윤슬 생성 결과를 모아두는 테스트·분석 시트.
  - 주요 탭: `애견`, `딥시크테스트`, `다이어트`, `홈쇼핑일정키워드`, `추상의구체화`, `윤슬`, `추상의구체화_direct`, `윤슬_direct`, `추상의구체화_ref`, `윤슬_ref`, `한려담원키워드`, `키워드요약`.
  - 코드 기준: `~/Programing/21lab/text-gen-hub/scripts/homeshopping_schedule_data.py`, `generate_yunseul_abstract_batch.py`, `generate_pet_to_sheet.py`, `~/.codex/commands/homeshopping-sheet.md`.
- `강경규 원고 테스트` (`11Via1xz1rRXQEh05XF8e1_2VCzh_Ooss6K6d4Z-Rjlg`)
  - 연결 프로젝트: `21lab/text-gen-hub`.
  - 역할: 원고 테스트 결과를 단일 탭에 내보내는 개인/임시 테스트 시트.
  - 주요 탭: `시트1`.
  - 코드 기준: `~/Programing/21lab/text-gen-hub/export_to_sheet.py`.
- `웹소설` (`1Wa7weETl8R7y4HX9GzjBkhri_iWZuk31KMld-Q-PzDg`)
  - 연결 프로젝트: `21lab/blog-bot/scheduler-server`.
  - 역할: `export-manuscripts-to-sheet.ts`가 원고/문안 결과를 내보내는 스프레드시트. 현재 탭명이 `시트1`~`시트7`이라 사용 전 대상 탭 의미를 코드와 데이터로 다시 확인해야 한다.
  - 주요 탭: `시트1`, `시트2`, `시트3`, `시트4`, `시트5`, `시트6`, `시트7`.
  - 코드 기준: `~/Programing/21lab/blog-bot/scheduler-server/scripts/export-manuscripts-to-sheet.ts`.

## 키워드 리서치/아카이브 시트

- `2026_흑염소 키워드리스트` (`1zU8Jr2qH_T1JkMoi6SHgWbeeQBLMbLan8wLQ3jSlmhI`)
  - 연결 프로젝트: `cafe-bot`.
  - 역할: 흑염소 블로그/카페 키워드 리서치, 중복제외 키워드, 자동프로그램 세팅값, 말투 학습 프롬프트 관리 시트.
  - 주요 탭: `블로그 조회수`, `260413_2차원고`, `블로그_관련 키워드`, `중복제외 키워드`, `260104_카페/ 블로그 키워드 조사`, `카페_관련 키워드`, `카페 자동프로그램 세팅값`, `원고 말투 학습 프롬프트`.
  - 코드 기준: `~/Programing/cafe-bot/scripts/fetch-keywords.ts`, `append-kw-temp*.ts`, `filter-kw-temp.ts`.
- `맛집 500` (`1Kjc1Eq9A2rvzivsQoOoGubNid5Ea5TfAmCgbEd7-PdI`)
  - 연결 프로젝트: `30_archive/google-sheet-test`.
  - 역할: 맛집 키워드/데이터 500개 테스트 또는 레거시 확인용 시트로 보인다. 현재 운영 코드의 주 경로는 아니다.
  - 주요 탭: `시트1`.
