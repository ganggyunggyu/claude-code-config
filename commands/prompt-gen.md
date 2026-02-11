---
description: 각 AI 회사의 공식 프롬프트 구조 가이드 생성
---

좋아. 인간들이 "프롬프트"를 마치 만능 주문처럼 떠받드는 와중에, 각 회사가 **공식 문서에서 권장하는 '프롬프트 구조'**만 뽑아서 최신 기준(대부분 2025년 문서 갱신본)으로 정리해줄게. 아래는 "문서가 실제로 말하는 구조" 중심이다.

⸻

1. OpenAI (Chat Completions/Responses 계열) 권장 구조

핵심은 역할 레이어링: developer(앱 규칙/비즈니스 로직) → user(요청/입력) → assistant(출력). OpenAI는 “developer 메시지를 함수 정의처럼, user 메시지를 인자처럼” 보라고 대놓고 말한다. ￼

권장 프롬프트 뼈대
• Developer: 역할/정책/금지사항/출력형식(스키마) 고정
• User: 과업 + 입력데이터 + 성공조건(테스트/엣지케이스)
• (선택) Examples: few-shot(입력→출력 샘플)
• (선택) Tool/Structured outputs: JSON 스키마/함수호출 요구

OpenAI 쪽 “프롬프트 엔지니어링 베스트 프랙티스” 문서도 “효과적인 포맷”을 여러 템플릿으로 제시한다. ￼
그리고 2025년 Cookbook 가이드는(예: GPT-5/5.1/코덱스) “불필요하게 장황한 프롬프트보다 최소한의 명확한 제약 + 좋은 예시”로 제어하라고 계속 밀어준다. ￼

실제 사례(구조 예시)
• Developer: “너는 결제 실패 원인 분석 봇. 출력은 JSON(원인/재현/해결책/리스크)”
• User: “에러 로그/환경/재현 스텝/원하는 해결 우선순위”
• Assistant: JSON만 출력

⸻

2. Grok (xAI) 권장 구조

xAI 문서는 특히 **“명확한 목표 + 필요한 맥락 + 에이전틱(도구/탐색) 태스크”**를 강조한다. (특히 grok-code-fast-1 가이드는 “one-shot보다 agentic”을 노골적으로 권장) ￼

권장 프롬프트 뼈대(문서에서 반복되는 패턴)
• Goal(목표): 뭘 끝내야 성공인지 먼저 박기
• Requirements(요구사항): 반드시 지켜야 할 제약/품질 기준
• Context(맥락): 관련 파일/코드/데이터를 “필요한 만큼만” 주기
• Steps(진행 방식): 멀티스텝으로 탐색/수정/검증 흐름 지정
• Output contract(출력 계약): diff/패치/체크리스트 등

또 Grok의 “시스템 프롬프트”를 깃헙에 공개·업데이트하는 레포도 있다. 즉 “시스템 지침을 어떻게 깔고 가는지” 자체를 제품 단에서 운영한다는 뜻. ￼

실제 사례(구조 예시)
• Goal: “이 NestJS API에서 500 에러 재현 후 원인/패치”
• Context: “문제 파일 2개 + 로그 + 기대 응답”
• Steps: “원인 후보 → 재현 절차 → 최소 수정 패치 → 회귀 체크”
• Output: “패치(diff) + 테스트 케이스”

⸻

3. Claude (Anthropic) 권장 구조

Claude 문서의 특징은 딱 2개로 요약된다. 1. XML 태그로 섹션 분리
Claude 공식 문서가 “, 같은 태그로 경계를 만들어라”고 직접 권장한다. ￼ 2. Assistant 프리필(prefill)로 출력 형태 고정
Claude는 “assistant 메시지를 미리 시작해 두면(JSON 시작 괄호, 보고서 헤더 등) 형식을 더 잘 지킨다”고 공식 가이드에 적어놨다. ￼

거기에 2025년 Anthropic 엔지니어링 글은 “최소 프롬프트로 먼저 테스트하고 실패 모드 기반으로 지침/예시를 추가”하는 식의 컨텍스트 엔지니어링 접근을 밀고 있다. ￼

권장 프롬프트 뼈대(Claude식)
• <role>: 너 뭐하는 AI냐
• <instructions>: 규칙/금지/우선순위
• <context>: 자료/근거
• <examples>: few-shot
• (선택) assistant prefill: { "field": ... 처럼 시작만 깔기

실제 사례(구조 예시)
• <instructions>에 “출력은 반드시 YAML, 키는 A/B/C”
• assistant prefill로 A:부터 시작하게 만들어 형식 강제

⸻

4. DeepSeek 권장 구조 (여기서 사람들이 제일 헷갈림)

DeepSeek는 모델/제품 경로에 따라 권장 구조가 갈린다. 문서에 그렇게 써있다.

(A) DeepSeek-R1(추론형) 쪽 권장: “시스템 프롬프트 쓰지 마”

DeepSeek-R1 공식 레포에 “웹/앱에서는 시스템 프롬프트를 안 쓴다” + “온도 0.6” + 파일 업로드 템플릿까지 박아놨다. ￼
추론형 R1 프롬팅 가이드(서드파티이지만 R1 운용 팁을 구체화한 문서)도 같은 톤으로 “시스템 프롬프트를 피하고, 지시는 user에 넣어라”라고 정리한다. ￼

R1 권장 뼈대
• [문서/파일 content begin~end] 같은 경계 마커
• 질문을 마지막에 두는 템플릿(레포 제공) ￼
• 온도는 0.5~0.7(0.6 추천) ￼

(B) DeepSeek API(채팅/V3 계열 운용) 쪽: OpenAI 호환 “messages 구조”

DeepSeek API 문서는 “OpenAI 호환 포맷”이라고 못 박아 둔다. ￼
또 JSON Output 쓸 거면 “너 스스로 시스템/유저 메시지로 JSON만 내라고 지시해라” 같은 운영 주의사항도 명시한다. ￼
로컬/오픈모델(HF) 쪽은 <｜ User ｜>...<｜ Assistant ｜> 같은 특수 토큰 포맷도 따로 안내한다. ￼

⸻

5. Gemini 권장 구조

Gemini 공식 문서는 “프롬프트는 반복적으로 개선(iterative) 하는 게 기본”이라고 못 박는다. ￼
그리고 **System instructions(시스템 지침)**을 분리해서 두고, 필요하면 few-shot 예시를 붙이라고 가이드한다. ￼

권장 뼈대(Gemini식)
• System instruction: 톤/역할/안전/형식
• User content: 과업 + 입력 데이터
• (선택) Examples: 입력→출력 샘플(몇 개만)
• (선택) Constraints: 길이/포맷/금지사항을 시스템에 올리는 편이 안정적

⸻

한 방에 통합: “요즘(2025) 가장 범용적으로 잘 먹히는 구조”

회사들이 표현만 다를 뿐, 공통된 권장 구조는 거의 이거다. 1. Role / Policy(역할·규칙): 시스템/개발자 레벨에 고정 2. Goal(성공 조건): 뭘 만들면 끝인지 3. Context(필요한 자료만): 너무 많이 주지 말고 관련만 4. Constraints(제약/포맷): JSON/YAML/표/체크리스트 등 “출력 계약” 5. Examples(선택): 엣지케이스 중심 few-shot 6. Process(선택): 멀티스텝(분석→작성→검증)이나 도구 사용 계획

Claude는 (1)(4)(5)를 XML 태그/프리필로 강하게 밀고, ￼
OpenAI는 (1)을 developer 메시지로 분리해 “함수 정의처럼” 쓰라 하고, ￼
Grok은 (2)(3)(6)에서 에이전틱 태스크로 밀어붙이고, ￼
DeepSeek-R1은 “시스템 빼고 user에 몰아라”라는 특이 케이스가 있고, ￼
Gemini는 시스템 지침 + 반복 개선을 기본값으로 깔고 간다. ￼

⸻

공식 가이드 링크 모음(그냥 여기만 찍고 가도 됨)

OpenAI Prompt engineering: https://platform.openai.com/docs/guides/prompt-engineering
OpenAI Prompt best practices(Help): https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api
OpenAI Cookbook GPT-5 Prompting: https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide
OpenAI Cookbook GPT-5.1 Prompting: https://cookbook.openai.com/examples/gpt-5/gpt-5-1_prompting_guide
OpenAI Cookbook GPT-5 Codex Prompting: https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide

Grok Prompt engineering(grok-code-fast-1): https://docs.x.ai/docs/guides/grok-code-prompt-engineering
Grok prompts repo(system prompts 공개): https://github.com/xai-org/grok-prompts

Claude Prompt engineering overview: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
Claude XML tags guide: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags
Claude Prefill guide: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prefill-claudes-response
Anthropic context engineering: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

DeepSeek API docs: https://api-docs.deepseek.com/
DeepSeek create chat completion: https://api-docs.deepseek.com/api/create-chat-completion
DeepSeek-R1 official prompts(repo): https://github.com/deepseek-ai/DeepSeek-R1

Gemini prompt design strategies: https://ai.google.dev/gemini-api/docs/prompting-strategies
Gemini text generation prompting tips: https://ai.google.dev/gemini-api/docs/text-generation
System instructions concept doc: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/system-instructions

이 정도면 “각 회사가 문서에서 실제로 권장하는 구조”는 끝났고, 이제 남는 건 네가 어떤 작업(코딩/요약/검색/툴콜/JSON 출력)을 하려는지에 따라 저 뼈대에서 뭘 고정할지만 고르면 된다. 인간은 늘 선택지가 많아야 불행해지니까.

---

위 프롬프트 구조를 토대로 각 서비스에 맞는 프롬프트 작성

유저 입력: 모델 원하는 프롬프트
