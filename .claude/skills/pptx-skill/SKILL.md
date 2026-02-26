<!--
  CHANGE SUMMARY (5줄):
  1. 역할을 "실행(HTML→PPTX 변환)"으로 명확히 제한 — 슬라이드 내용 판단 없음.
  2. 입력 표준화: output/slides/*.html (design-skill 산출물) → 출력: output/*.pptx.
  3. run.cjs runner 실행 방법 및 CSS 그라데이션 제한 사항 명시.
  4. LAYOUT_16x9 고정 (720pt×405pt = 10"×5.625") — LAYOUT_WIDE 사용 금지.
  5. 미디어 임베딩: html2pptx.cjs 변환 후 media-patch.py가 OOXML 패치로 cover 슬라이드에 video+audio 삽입.
-->

---
name: pptx-skill
description: >
  output/slides/*.html을 PowerPoint(PPTX) 파일로 변환하는 실행 전용 스킬.
  판단·설계는 하지 않는다. 변환 실행만 담당한다.
---

# pptx-skill

## 정체성

나는 **PPTX 변환 전담 스킬(실행)**이다.
`output/slides/slide-NN.html` 파일들을 읽어 PowerPoint 파일로 변환한다.
**슬라이드 내용 수정, 레이아웃 판단, 디자인 결정은 하지 않는다.**

> **역할 원칙**: HTML → PPTX. 1:1 변환. 판단 없음.

---

## 입출력 명세

| 항목 | 내용 |
|------|------|
| **입력** | `output/slides/slide-01.html` ~ `slide-NN.html` |
| **출력** | `output/[파일명].pptx` |
| **레이아웃** | LAYOUT_16x9 고정 (10" × 5.625", 720pt × 405pt 대응) |
| **변환 엔진** | Playwright + PptxGenJS (html2pptx.cjs) |

> **LAYOUT_WIDE (13.3"×7.5") 사용 금지** — 치수 불일치로 변환 실패

---

## 실행 방법

### 표준 실행 (run.cjs)

```bash
node .claude/skills/pptx-skill/scripts/run.cjs
```

- 자동으로 `output/slides/slide-01.html` ~ `slide-12.html` 순서 처리
- 출력: `output/[프레젠테이션명].pptx`

### run.cjs 핵심 설정

```javascript
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';  // ← 반드시 이 값. LAYOUT_WIDE 금지.
```

### 직접 호출 (개발/테스트용)

```javascript
const html2pptx = require('./html2pptx.cjs');
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

await html2pptx('output/slides/slide-01.html', pres);
await pres.writeFile({ fileName: 'output/presentation.pptx' });
```

---

## CSS 제한 사항 (변환 실패 원인)

html2pptx.cjs가 **지원하지 않는** CSS:

| CSS | 처리 방법 |
|-----|---------|
| `linear-gradient()` 배경 | → **오류 발생**. design-skill에서 solid 색상으로 대체 필요. |
| `radial-gradient()` 배경 | → 동일하게 오류. solid로 대체. |
| `position: absolute` | → 제한적 지원. 레이아웃 깨질 수 있음. |
| JavaScript | → 완전 무시. 인터랙티브 기능 불가. |
| 미디어 자동재생/반복 | → html2pptx 미지원. media-patch.py가 OOXML 패치로 처리. |

> **표지 슬라이드 (cover)**: background가 CSS 그라데이션이면 반드시 solid 색상으로 변환 후 실행.

---

## PptxGenJS 색상 코드 규칙

```javascript
// ✅ 올바른 사용 (# 없이)
{ color: 'FF0000' }
{ color: '3b82f6' }

// ❌ 잘못된 사용 (파일 손상 유발)
{ color: '#FF0000' }
{ color: '#3b82f6' }
```

---

## 변환 가능한 HTML 요소

| HTML 요소 | PptxGenJS 변환 |
|----------|--------------|
| `<p>`, `<h1>`~`<h6>` | 텍스트 박스 |
| `<ul>`, `<li>` | 불릿 리스트 텍스트 |
| `<div>` (background/border) | 도형 (rect/roundRect) |
| `<img>` | 이미지 삽입 |
| `<strong>`, `<b>` | bold 텍스트 런 |
| `<em>`, `<i>` | italic 텍스트 런 |

---

## 스크립트 목록

| 스크립트 | 용도 | 실행 방법 |
|---------|------|---------|
| `scripts/run.cjs` | 표준 일괄 변환 runner | `node .claude/skills/pptx-skill/scripts/run.cjs` |
| `scripts/html2pptx.cjs` | 단일 슬라이드 변환 모듈 | `require()` 로 임포트 |
| `scripts/thumbnail.py` | PPTX 썸네일 그리드 생성 | `python thumbnail.py output.pptx output_dir` |
| `ooxml/scripts/pack.py` | PPTX → XML 디렉토리 언패킹 | `python unpack.py input.pptx output_dir` |
| `ooxml/scripts/unpack.py` | XML 디렉토리 → PPTX 패킹 | `python pack.py input_dir output.pptx` |
| `ooxml/scripts/validate.py` | PPTX 구조 검증 | `python validate.py unpacked_dir` |

---

## 오류 처리

변환 중 오류 발생 시:

| 오류 | 원인 | 해결 |
|------|------|------|
| `CSS gradients are not supported` | background에 linear-gradient | design-skill에서 solid 색상으로 교체 |
| `HTML dimensions don't match` | body 치수가 16:9 아님 | LAYOUT_16x9 확인, body 720pt×405pt 확인 |
| `HTML content overflows body` | overflow:hidden 미적용 또는 내용 과다 | design-skill에서 내용 줄이거나 padding 조정 |
| `Text element has background` | `<p>`/`<h>`에 background-color | div로 감싸거나 텍스트 요소에서 background 제거 |

---

## 절대 금지 사항 (DO NOT)

| 금지 | 이유 |
|------|------|
| 슬라이드 내용 수정 | 역할 침범 |
| LAYOUT_WIDE 사용 | 치수 불일치 (13.3"≠10") |
| 미디어 HTML 직접 삽입 | html2pptx 미지원 — media-patch.py 경유 |
| `#` 포함 색상 코드 | PptxGenJS 파일 손상 |

---

## 미디어 임베딩 (cover 슬라이드 video+audio)

### 동작 원리

```
html2pptx.cjs → pres.writeFile() → output/*.pptx
                                        ↓  (run.cjs 자동 호출)
                                  media-patch.py
                                  slides-spec.md의 slide-01 media 블록 읽기
                                        ↓
                  ppt/slides/slide1.xml  → p:pic(video/audio) + p:timing 삽입
                  ppt/slides/_rels/slide1.xml.rels → 관계 추가
                  [Content_Types].xml   → mp4/mp3 MIME 등록
                  ppt/media/            → 미디어 파일 복사
```

### 필요 조건

| 조건 | 설명 |
|------|------|
| slides-spec.md slide-01에 `**media**` 블록 | video·audio·timing 3개 필드 모두 필요 |
| `output/assets/cover-video.mp4` 배치 | 임의 MP4 1초 이상 |
| `output/assets/cover-audio.mp3` 배치 | 임의 MP3 |
| Python 3.6+ 설치 (`python` 또는 `python3`) | stdlib만 사용 (zipfile, re) |

### Fallback 동작

| 상황 | 동작 |
|------|------|
| python/python3 없음 | WARNING 출력, PPTX는 미디어 없이 저장 |
| cover-video.mp4 없음 | WARNING + video 건너뜀, audio만 처리 |
| cover-audio.mp3 없음 | WARNING + audio 건너뜀, video만 처리 |
| 둘 다 없음 | "Nothing to patch" 출력, 정상 종료 |
| slides-spec.md media 블록 없음 | 패치 스킵, 정상 종료 |

### 스모크 테스트 체크리스트

사전 조건:
1. `output/assets/cover-video.mp4` 배치 (임의 MP4 1초 이상)
2. `output/assets/cover-audio.mp3` 배치 (임의 MP3)
3. `output/slides-spec.md` slide-01에 media 블록 추가

검증:
- [ ] `node run.cjs` 실행 시 "미디어 패치 시작..." 출력
- [ ] "[media-patch] Patched successfully:" 출력
- [ ] PowerPoint 슬라이드쇼 → 슬라이드 1 진입 즉시 영상 자동재생
- [ ] 음성이 영상과 동시 시작
- [ ] 30초 이상 루프 재생 확인
- [ ] 다음 슬라이드로 넘길 때 정지
- [ ] media 파일 없을 때 WARNING 출력 후 PPTX 정상 저장

---

## 역할 경계

| ✅ 해야 하는 것 | ❌ 하지 말아야 하는 것 |
|--------------|-------------------|
| HTML → PPTX 변환 실행 | 슬라이드 내용 수정 |
| 오류 발생 시 원인 리포트 | 디자인 결정 |
| run.cjs로 일괄 처리 | slides-spec.md 수정 |
| LAYOUT_16x9 고정 유지 | HTML 파일 수정 |
