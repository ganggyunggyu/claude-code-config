date: 2026-03-31
domain: naver
subcategory: blog
scope: browser-operation
result: reference
title: naver-blog-reservation-monitoring
profiles_and_sessions:
  - Prefer OpenClaw browser for direct login and reservation verification on Naver blog work.
  - Keep the target account logged in on a dedicated browser profile while monitoring scheduled posts.
  - When running multiple Naver accounts, split work by browser profile to avoid session bleed.
verification_source_of_truth:
  - For reservation monitoring, visible Naver blog UI is the source of truth over queue, DB, or API counters.
  - Open `https://blog.naver.com/{blogId}?Redirect=Write&` after login and verify the top `예약 발행 N건` button.
  - Open the reservation popup and confirm both `총N개` and the visible title/date list before saying scheduling is complete.
reporting_rules:
  - Do not use final wording such as `완료`, `정상 등록`, `개수 맞음` until the reservation popup has been checked directly.
  - If internal queue state and Naver UI differ, report the mismatch explicitly and prioritize the Naver-visible result.
monitoring_flow:
  - Check queue/dashboard state first to catch failures or hanging jobs.
  - Refresh or reopen the Naver write page before the final count check because stale editor tabs can show old reservation counts.
  - After refresh, reopen the reservation popup and compare total count, per-date distribution, and newly added titles.
verified_routes_and_labels:
  - Entry URL: `https://blog.naver.com/{blogId}?Redirect=Write&`
  - Top bar label: `예약 발행 N건`
  - Popup title: `예약 발행 글`
  - Popup total label pattern: `총N개`
known_working_examples:
  - On 2026-03-31, direct verification for `dq1h3bjy` showed `예약 발행 15건` and popup `총15개`.
  - Newly verified reservation titles included `스마일프로 가격 비용 5가지 핵심 정리`, `렌즈삽입술 회복기간, 단계별로 알아두면 도움이 됩니다`, `라섹비용, 얼마가 적정한지 가늠하는 법`, and `백내장증상, 어떤 변화부터 의심해야 할까`.
