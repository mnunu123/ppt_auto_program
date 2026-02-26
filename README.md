# PPT Team Agent

Claude Code Sub-Agent와 Skill 기반의 프레젠테이션 생성 도구입니다.

## 📋 프로젝트 소개

PPT Team Agent는 자동화된 프레젠테이션 생성을 위한 도구로, Claude AI의 Sub-Agent 시스템과 스킬 기반 아키텍처를 활용합니다.

## 🚀 주요 기능

- HTML을 PPTX 형식으로 변환
- 자동화된 프레젠테이션 생성
- Claude AI 기반 콘텐츠 생성

## 📦 설치 방법

### 필수 요구사항

- Node.js (v16 이상)
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/ppt_team_agent.git
cd ppt_team_agent

# 의존성 설치
npm install
```

## 🎯 사용 방법

### HTML을 PPTX로 변환

```bash
npm run html2pptx
```

## 🛠 기술 스택

- **pptxgenjs**: PowerPoint 파일 생성
- **playwright**: 브라우저 자동화
- **sharp**: 이미지 처리
- **react-icons**: 아이콘 라이브러리

## 📂 프로젝트 구조

```
ppt_team_agent/
├── .claude/
│   └── skills/
│       └── pptx-skill/
│           └── scripts/
│               └── html2pptx.js
├── node_modules/
├── package.json
├── package-lock.json
└── README.md
```

---

## 설득형 PPT 자동화 파이프라인 (`build_deck`)

주제가 무엇이든 "남을 설득하는 PPT 흐름"으로 자동 생성하고,
규칙 위반을 자동 검수·수정 제안까지 하는 CLI 파이프라인입니다.

### 빠른 시작

```bash
node scripts/build_deck.js --in samples/policy_youth_rent.json --out out/policy_youth_rent.pptx
node scripts/build_deck.js --in samples/semis_rally.json       --out out/semis_rally.pptx
```

### 산출물 (명령 1개로 5가지)

| 파일 | 설명 |
|------|------|
| `[출력].pptx` | PowerPoint 파일 |
| `[출력]_html/` | HTML 슬라이드 (슬라이드 단위 편집 가능) |
| `[출력]-storyboard.md` | 제목만 읽는 스토리보드 (Title-only Test) |
| `[출력]-validation.md` | 검증 리포트 + 레드팀 분석 |
| `[출력]-copy-report.md` | 슬라이드별 제목 후보 10개 + 소유권 분석 |

### 설득 흐름 3종 (자동 선택)

| 흐름 | 선택 조건 | 슬라이드 구성 |
|------|----------|--------------|
| **가이드형** | goal에 "안내·지원·정책·신청" 포함 | 배경→대상→핵심3→주의→실행 |
| **설득형** | goal에 "설득·투자·제안·매수" 포함 | 훅→문제→인사이트→증거2→해결→CTA |
| **브리핑형** | 기타 | 현황→데이터2→분석→시사점→권고 |

### 입력 JSON 스키마

```json
{
  "audience":   "누구를 설득?",
  "goal":       "끝나고 무엇을 하게?",
  "topic":      "주제",
  "one_liner":  "선택 — 없으면 자동 생성 (Rule 0)",
  "key_points": ["핵심 주장 / 근거 / 절차"],
  "evidence": [
    { "type": "stat|quote|case|rule", "text": "...", "source": "..." }
  ],
  "cta":       ["다음 행동 3개"],
  "copy_bank": [
    { "text": "레퍼런스 문장", "tone": "선언|도발|담담|따뜻|권위",
      "structure": "원칙형|대비형|3단리듬|질문형", "use": "표지|cta|hook" }
  ],
  "constraints": { "slide_count": 10, "title_len": "16~22", "no_paragraph": true },
  "assets":     { "logo": "", "cover_bg": "" }
}
```

### 설득 규칙 (자동 강제)

| 규칙 | 내용 | 강제 방식 |
|------|------|---------|
| **R0** | Deck One-liner 1문장 (10초 발화) | 없으면 자동 생성, 60자 초과 시 경고 |
| **R1** | 제목 = 결론 (어쩌라고 테스트) | 주제형 제목 감지 → 실패 + 수정안 |
| **R2** | 소유권 테스트 | 범용 표현 감지 → 실패 + 구체화 지시 |
| **R3** | 카피뱅크 구조 차용 | 원문 단어 복제 금지, 패턴만 재작성 |
| **R4** | 제목 16~22자 | 초과 시 자동 단축 + 경고 |
| **R5** | 표지 레이아웃 제한 | cover_center_calm / cover_top_aligned만 허용 |
| **R6** | 줄글 금지 | 30자+ 문장 감지 → 분할 제안 |
| **R7** | 발표 후 자아비판 루프 | 검증 리포트에 포스트모템 템플릿 자동 생성 |

### 카피뱅크 운영법

카피뱅크는 레퍼런스 문장을 **톤·구조·용도**로 태깅해 저장합니다.
시스템은 구조만 차용하고 원문 단어는 절대 복제하지 않습니다.

```json
"copy_bank": [
  { "text": "5분이면 된다 — 월세의 37%를 돌려받는 방법",
    "tone": "선언", "structure": "수치형", "use": "표지" },
  { "text": "신청한 사람만 받는다",
    "tone": "도발", "structure": "선언형", "use": "cta" }
]
```

**톤**: `선언` / `도발` / `담담` / `따뜻` / `권위`
**구조**: `원칙형` / `대비형` / `3단리듬` / `질문형` / `수치형` / `선언형`
**용도**: `표지` / `hook` / `cta` / `insight` / `risk`

권장: 레퍼런스 최소 5개 이상 → 카피 품질 안정화

### 파일 구조 (추가된 것)

```
scripts/
  build_deck.js    — CLI 진입점 (명령 1개)
  planner.js       — 설득 흐름 선택 + one_liner 강제
  slide_writer.js  — 제목=결론 + 줄글 금지 적용
  copywriter.js    — 제목 후보 10개 + 소유권 검증
  validator.js     — R0~R7 전체 규칙 검증 + 레드팀
  exporter.js      — HTML 생성 + PPTX 변환 + 리포트

samples/
  policy_youth_rent.json  — 가이드형 예시 (청년 월세지원)
  semis_rally.json        — 설득형 예시 (반도체 빅3 급등)

out/
  *.pptx                  — 생성된 PPTX
  *-storyboard.md         — 제목 스토리보드
  *-validation.md         — 검증 리포트 + 레드팀
  *-copy-report.md        — 제목 후보 + 소유권 분석
```

---

## 🤝 기여하기

이슈와 풀 리퀘스트는 언제나 환영합니다!

## 📝 라이선스

MIT License

## 👤 작성자

Builder Josh

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

Made with ❤️ by Builder Josh

