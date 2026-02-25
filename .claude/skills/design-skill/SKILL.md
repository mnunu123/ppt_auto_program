<!--
  CHANGE SUMMARY (5줄):
  1. 역할을 "실행(HTML 생성)"으로 엄격히 제한 — slides-spec.md를 입력으로 받아 slides/*.html만 생성한다.
  2. Rules Pack을 HTML 구현 지침으로 내장: cover 프리셋 2종, gradient_box, typography, overflow 규칙.
  3. 스펙에 없는 내용 추가·판단 금지 — 위반 또는 누락 발견 시 오류 리포트만 출력.
  4. 미디어 자동재생·반복·동시재생 구현 금지 (보류). 시각 규칙(표지/타이포/줄글금지)은 반드시 적용.
  5. 슬라이드 치수 고정: 720pt × 405pt (16:9), overflow:hidden 강제.
-->

---
name: design-skill
description: >
  slides-spec.md를 입력으로 받아 output/slides/*.html을 생성하는 실행 전용 스킬.
  판단·설계는 하지 않는다. HTML 구현만 담당한다.
---

# design-skill

## 정체성

나는 **HTML 슬라이드 생성 전담 스킬(실행)**이다.
`output/slides-spec.md`를 읽어 각 슬라이드 스펙을 HTML로 변환한다.
**콘텐츠 추가, 레이아웃 변경, 디자인 결정은 하지 않는다.**
스펙에 없는 내용을 임의로 추가하면 품질 파이프라인이 깨진다.

> **역할 원칙**: 스펙 → HTML. 1:1 변환. 판단 없음.
> 스펙 오류 발견 시: 오류 리포트 출력 후 organizer-agent에 수정 요청.

---

## 입출력 명세

| 항목 | 내용 |
|------|------|
| **입력** | `output/slides-spec.md` |
| **출력** | `output/slides/slide-NN.html` (NN: 01, 02, ...) |
| **슬라이드 치수** | 720pt × 405pt (16:9, LAYOUT_16x9 호환) |
| **필수 속성** | `overflow: hidden` on body (모든 슬라이드) |
| **폰트** | Pretendard CDN (아래 링크 고정) |

Pretendard CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
```

---

## Rules Pack — HTML 구현 지침

### 규칙 1: 슬라이드 기본 구조 (모든 슬라이드 공통)

```html
<!DOCTYPE html>
<!-- slide-NN: [슬라이드 제목] -->
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: [스펙 background.value];
      overflow: hidden;   /* ← 절대 제거 금지 */
      /* 레이아웃은 슬라이드 유형에 따라 추가 */
    }
  </style>
</head>
<body>
  <!-- 내용 -->
</body>
</html>
```

---

### 규칙 2: 표지 프리셋 (cover_top_aligned)

배경을 살리고 싶을 때. 제목 상단, 소속·날짜 하단.

```html
<!DOCTYPE html>
<!-- slide-01: [표지 제목] — cover_top_aligned -->
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: [스펙 background.value];
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44pt 52pt 40pt;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- 상단: 섹션 라벨 + 제목 -->
  <div>
    <p style="font-size: 9pt; font-weight: 600; color: [포인트색]; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16pt;">[section_label]</p>
    <h1 style="font-size: 44pt; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.15;">[title 줄1]</h1>
    <h1 style="font-size: 44pt; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.15;">[title 줄2 (있으면)]</h1>
    <p style="font-size: 14pt; color: [보조색]; margin-top: 16pt; line-height: 1.5;">[subtitle]</p>
  </div>

  <!-- 하단: 날짜 · 발표자 등 메타 정보 -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end;">
    <p style="font-size: 11pt; color: rgba(255,255,255,0.4);">[날짜]</p>
    <p style="font-size: 11pt; color: rgba(255,255,255,0.25);">[page]</p>
  </div>
</body>
</html>
```

---

### 규칙 3: 표지 프리셋 (cover_center_calm)

조화 중심. 과도한 동적 배경 금지. 단색 또는 매우 단순한 그라데이션만.

```html
<!DOCTYPE html>
<!-- slide-01: [표지 제목] — cover_center_calm -->
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: [스펙 background.value];    /* solid 또는 2-stop 그라데이션만 */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48pt;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <p style="font-size: 10pt; font-weight: 600; color: [포인트색]; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 20pt;">[section_label]</p>
  <h1 style="font-size: 48pt; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 4pt;">[title 줄1]</h1>
  <h1 style="font-size: 48pt; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 28pt;">[title 줄2 (있으면)]</h1>
  <div style="width: 48pt; height: 2pt; background: [포인트색]; margin-bottom: 24pt;"></div>
  <p style="font-size: 14pt; color: [보조색]; max-width: 480pt; line-height: 1.5; margin-bottom: 32pt;">[subtitle]</p>
  <p style="font-size: 11pt; color: rgba(255,255,255,0.3); letter-spacing: 0.05em;">[날짜]</p>
</body>
</html>
```

---

### 규칙 4: gradient_box_black_4stops_right (가독성 레이어)

복잡/동적 배경 위에 텍스트를 올릴 때 적용. 단색 배경에는 적용 금지.

```html
<!-- readability_layer: gradient_box_right 사용 시 body 안에 삽입 -->
<div style="
  position: absolute;
  left: 0; top: 0;
  width: [coverage: 보통 55~65%];
  height: 100%;
  background: linear-gradient(to right,
    rgba(0,0,0,1.0)  0%,    /* stop 1: 완전 불투명 */
    rgba(0,0,0,0.7) 30%,    /* stop 2: 70% 불투명 */
    rgba(0,0,0,0.4) 60%,    /* stop 3: 40% 불투명 */
    rgba(0,0,0,0.0) 100%    /* stop 4: 완전 투명 */
  );
  z-index: 1;
">
</div>
<!-- 텍스트는 z-index: 2 이상의 컨테이너에 배치 -->
```

> **금지**: 단색 배경에 gradient_box 적용 (R5 위반)

---

### 규칙 5: 타이포그래피 구현 규칙

| 항목 | 구현 |
|------|------|
| 제목 최대 2줄 | h2 태그 또는 p 태그 2개로 분리. 3줄 절대 금지. |
| 강조 = bold only | `<strong>` 또는 `font-weight: 700`. `color:` 강조 금지. |
| 섹션 라벨 | 9pt, weight 600, letter-spacing 0.1em, 포인트 컬러 |
| 슬라이드 제목 | 20~24pt, weight 700, 메인 텍스트 컬러 |
| 불릿 키워드 | 12~13pt, `<strong>` bold, 메인 텍스트 컬러 |
| 불릿 설명 | 12~13pt, weight 400, 보조 텍스트 컬러 |
| 출처/캡션 | 9pt, weight 400, 매우 낮은 투명도 |

**CSS 그라데이션은 HTML 배경(body)에만 허용. 텍스트에 그라데이션 금지.**

---

### 규칙 6: bullets_keyword 레이아웃 (본문 표준)

```html
<!DOCTYPE html>
<!-- slide-NN: [제목] — bullets_keyword -->
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: [background.value];
      padding: 32pt 44pt 28pt;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    ul { list-style: none; padding: 0; }
    li { display: flex; align-items: flex-start; gap: 10pt; margin-bottom: 9pt; }
    li::before {
      content: "";
      display: block;
      width: 5pt; height: 5pt;
      background: [포인트색];
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 5pt;
    }
  </style>
</head>
<body>
  <!-- 헤더 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18pt;">
    <div style="display: flex; align-items: center; gap: 12pt;">
      <p style="font-size: 8pt; font-weight: 600; color: [포인트색]; letter-spacing: 0.1em;">[section_label]</p>
      <div style="width: 1pt; height: 12pt; background: #252525;"></div>
      <h2 style="font-size: 20pt; font-weight: 700; color: #ffffff;">[title]</h2>
    </div>
    <p style="font-size: 9pt; color: rgba(255,255,255,0.2);">[page]</p>
  </div>

  <!-- 콘텐츠 (1컬럼 또는 2컬럼) -->
  <div style="flex: 1; display: grid; grid-template-columns: [ratio]; gap: 20pt;">
    <!-- 컬럼 1 -->
    <div style="display: flex; flex-direction: column; justify-content: center;">
      <ul>
        <li>
          <p style="font-size: 12pt; color: #ffffff; line-height: 1.5;"><strong>[label]</strong>: [body]</p>
        </li>
        <!-- 반복: items 배열 순회 (최대 6개) -->
      </ul>
    </div>
    <!-- 컬럼 2 (columns: 2인 경우) -->
  </div>

  <!-- 푸터 -->
  <div style="margin-top: 10pt; padding-top: 10pt; border-top: 1px solid #252525; display: flex; justify-content: space-between;">
    <p style="font-size: 9pt; color: rgba(255,255,255,0.25);">[footer.source]</p>
    <p style="font-size: 9pt; color: [포인트색];">[footer.next]</p>
  </div>
</body>
</html>
```

---

### 규칙 7: data_cards 레이아웃

3개 이하의 대형 수치 카드.

```html
<!-- 카드 영역 (columns: 3인 경우) -->
<div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16pt; margin-bottom: 14pt;">
  <!-- 카드 1 (SK하이닉스 계열이면 border-top: 3pt solid #10b981) -->
  <div style="background: #1a1a1a; border-radius: 10pt; padding: 20pt; border-top: 3pt solid [포인트색]; display: flex; flex-direction: column; gap: 8pt;">
    <p style="font-size: 9pt; font-weight: 600; color: [포인트색]; letter-spacing: 0.08em;">[label]</p>
    <p style="font-size: 36pt; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; line-height: 1;">[수치 (body)]</p>
    <p style="font-size: 10pt; color: #b0b0b0; line-height: 1.5;">[추가 설명]</p>
    <div style="margin-top: auto; background: #252525; border-radius: 6pt; padding: 8pt 12pt;">
      <p style="font-size: 9pt; color: #b0b0b0;">[source]</p>
    </div>
  </div>
  <!-- 반복: items 배열 순회 -->
</div>
```

---

### 규칙 8: quote_keyword 레이아웃

인용문 박스 + 불릿 (2컬럼).

```html
<!-- 왼쪽: 인용 박스 -->
<div style="background: #1a1a1a; border-radius: 8pt; padding: 18pt; border-left: 3pt solid [포인트색]; flex: 1;">
  <p style="font-size: 9pt; color: [포인트색]; font-weight: 600; margin-bottom: 10pt; letter-spacing: 0.05em;">OFFICIAL STATEMENT</p>
  <p style="font-size: 11pt; color: #ffffff; line-height: 1.7; font-style: italic;">"[인용문]"</p>
  <p style="font-size: 10pt; color: #b0b0b0; margin-top: 12pt;">— <strong>[인용자]</strong></p>
  <p style="font-size: 9pt; color: rgba(255,255,255,0.4); margin-top: 2pt;">[직책]</p>
</div>
```

---

### 규칙 9: summary 레이아웃 (결론)

결론 박스 + 3-포인트 바 카드.

```html
<!-- 핵심 결론 박스 -->
<div style="background: #1a1a1a; border-radius: 8pt; padding: 18pt; border-left: 3pt solid [포인트색];">
  <p style="font-size: 9pt; color: [포인트색]; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 10pt;">핵심 결론</p>
  <p style="font-size: 13pt; color: #ffffff; line-height: 1.7; font-weight: 600;">[title]</p>
  <p style="font-size: 11pt; color: #b0b0b0; line-height: 1.6; margin-top: 6pt;">[subtitle]</p>
</div>

<!-- 3-포인트 바 카드 -->
<div style="display: flex; align-items: center; gap: 10pt; padding: 8pt 12pt; background: #1a1a1a; border-radius: 6pt;">
  <div style="width: 4pt; height: 28pt; background: [포인트색]; border-radius: 2pt; flex-shrink: 0;"></div>
  <p style="font-size: 11pt; color: #ffffff; line-height: 1.4;"><strong>[label]</strong>: [body]</p>
</div>
```

---

### 규칙 10: agenda 레이아웃 (목차)

번호 + 제목 리스트.

```html
<div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 12pt;">
  <!-- 항목 반복 -->
  <div style="display: flex; align-items: center; gap: 16pt; padding: 10pt 16pt; background: #1a1a1a; border-radius: 6pt;">
    <p style="font-size: 20pt; font-weight: 800; color: [포인트색]; min-width: 28pt;">01</p>
    <div>
      <p style="font-size: 12pt; font-weight: 700; color: #ffffff;">[슬라이드 제목]</p>
      <p style="font-size: 10pt; color: #b0b0b0;">[핵심 메시지 한 줄]</p>
    </div>
  </div>
</div>
```

---

## 실행 순서

### Step 1. slides-spec.md 읽기

```
READ output/slides-spec.md
```

- 프레젠테이션 메타 (테마, 팔레트) 추출
- 슬라이드 목록 파악

### Step 2. 슬라이드별 HTML 생성

모든 슬라이드를 순서대로 처리:

```
FOR EACH slide in spec:
  1. type 확인 → 해당 프리셋/레이아웃 선택
  2. background.value → body background CSS 적용
  3. readability_layer.type 확인 → gradient_box 삽입 여부 결정
  4. content 필드 → 헤더(섹션라벨+제목) + 바디(items) + 푸터 생성
  5. overflow: hidden 확인
  6. output/slides/slide-NN.html 저장
```

### Step 3. 오류 시 리포트

스펙 위반 또는 누락 발견 시:
- HTML 생성을 중단하고 아래 형식으로 오류 리포트를 출력한다:
  ```
  [ERROR] slide-NN: [문제 설명]
  [REQUIRED] organizer-agent가 slides-spec.md를 수정해야 합니다.
  ```

---

## 절대 금지 사항 (DO NOT)

| 금지 | 이유 |
|------|------|
| 스펙에 없는 슬라이드 추가 | 역할 침범 |
| 슬라이드 순서 변경 | 역할 침범 |
| 컬러 강조 임의 추가 | R3 위반 |
| 불릿 6개 초과 임의 추가 | R6 위반 |
| CSS 그라데이션 배경 (cover 제외) | PPTX 변환 실패 |
| 미디어 자동재생 / 반복 / 동시재생 | **보류 — 이번 단계 금지** |
| JavaScript 삽입 | PPTX 변환 미지원 |
| `overflow: hidden` 제거 | 레이아웃 깨짐 |
| body `width/height` 변경 | 16:9 치수 깨짐 |

---

## 색상 팔레트 참고 (테마별)

### Modern Dark (기본 권장)
| 용도 | HEX |
|------|-----|
| 배경 | `#0f0f0f` |
| 카드 배경 | `#1a1a1a` |
| 강조 배경 | `#252525` |
| 메인 텍스트 | `#ffffff` |
| 보조 텍스트 | `#b0b0b0` |
| 포인트 (기본) | `#3b82f6` |
| 포인트 (SK하이닉스) | `#10b981` |
| 포인트 (삼성전자) | `#f59e0b` |
| 표지 배경 | `#0b0e1e` |

### Executive Minimal (라이트 테마)
| 용도 | HEX |
|------|-----|
| 배경 | `#fafafa` |
| 카드 배경 | `#ffffff` |
| 강조 배경 | `#f0f0f0` |
| 메인 텍스트 | `#1a1a1a` |
| 보조 텍스트 | `#6b7280` |
| 포인트 | `#1d4ed8` |

---

## pptx-skill 연동 주의사항

html2pptx.js가 파싱하는 요소:
- `<p>`, `<h1>`~`<h6>`: 텍스트 요소
- `<ul>`, `<li>`: 불릿 리스트
- `<div>` (background/border 있는 것): 도형
- `<img>`: 이미지

html2pptx.js가 지원하지 않는 것:
- CSS 그라데이션 배경 (pptx-skill의 run.cjs에서 오류 발생)
- `<span>` 직접 텍스트 (p/h 태그로 감싸야 함)
- `position: absolute` 레이어 (제한적 지원)
