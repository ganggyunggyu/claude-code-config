date: 2026-03-23
account: nyangdolsoe
result: success
post_url: https://www.instagram.com/nyangdolsoe/p/DWOFNqclE65/
retry_count: 3
final_asset: /tmp/openclaw/uploads/ig_post_20260323_170545.png
final_caption: |
  바람이 생각보다 차가웠는데
  답답한 건 먼저 날아갔음냥

  오늘은 창가 말고
  바깥쪽 봄으로 저장해둠냥
last_successful_click_sequence:
  - openclaw browser stop --browser-profile openclaw
  - openclaw browser start --browser-profile openclaw
  - openclaw browser open https://www.instagram.com/nyangdolsoe/
  - Playwright CDP DOM-eval click on 새로운 게시물
  - Playwright CDP DOM-eval click on 게시물
  - Playwright CDP set_input_files on hidden input[type=file]
  - openclaw browser click 다음
  - openclaw browser type caption into ref e66
  - openclaw browser click 공유하기
  - openclaw browser navigate https://www.instagram.com/nyangdolsoe/
  - openclaw browser snapshot verify post count 24 and top post
exact_file_selection_method:
  - native file chooser not used on successful run
  - Playwright CDP attached to openclaw profile
  - hidden input[type=file] received /tmp/openclaw/uploads/ig_post_20260323_170545.png via set_input_files
error_avoidance_points:
  - restart browser profile first when create flow becomes stale
  - do not rely on browser.upload after it fails to populate input in this environment
  - use DOM-eval click for 새로운 게시물 and 게시물 when role/ref click stalls
  - use openclaw textbox ref on create/details for caption when Playwright cannot see the visible textbox
