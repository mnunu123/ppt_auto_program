<!--
변경 요약 (5줄):
1. 표지 프리셋 2종(cover_top_aligned, cover_center_aligned_calm) HTML 템플릿 추가.
2. gradient_box_black_4stops_right 컴포넌트(검정 4중지점, 우향, 0/30/60/100%) 추가.
3. 타이포그래피 룰 강화: 제목 2줄 제한, weight 강조만 허용, 컬러 강조 금지, 레드닷 옵션.
4. html2pptx 안정성을 위한 overflow 방지 규칙(여백/줄수/폰트 최소 크기) 명시.
5. slides-spec.md 소비 형식 정의 및 워크플로우에 slides-spec.md 우선 읽기 추가.
-->
---
name: design-skill
description: 프레젠테이션 슬라이드를 미려한 HTML로 디자인. 슬라이드 HTML 생성, 시각적 디자인, 레이아웃 구성이 필요할 때 사용.
---

# Design Skill - 프로페셔널 프레젠테이션 디자인 시스템

최고 수준의 비즈니스 프레젠테이션을 위한 HTML 슬라이드 디자인 스킬입니다.
미니멀하고 세련된 디자인, 전문적인 타이포그래피, 정교한 레이아웃을 제공합니다.

---

## 핵심 디자인 철학

### 1. Less is More
- 불필요한 장식 요소 제거
- 콘텐츠가 주인공이 되는 디자인
- 여백(Whitespace)을 적극 활용
- 시각적 계층 구조 명확화

### 2. 타이포그래피 중심 디자인
- Pretendard를 기본 폰트로 사용
- 폰트 크기 대비로 시각적 임팩트 생성
- 자간과 행간의 섬세한 조절
- **웨이트 변화로만 강조** (컬러 강조 금지)

### 3. 전략적 색상 사용
- 제한된 색상 팔레트 (2~3색)
- 모노톤 기반 + 포인트 컬러
- 배경색으로 분위기 연출
- 고대비로 가독성 확보

---

## 워크플로우

1. **사양서 읽기**: `slides-spec.md` 먼저 읽기 (없으면 `slide-outline.md` 사용)
2. **테마 결정**: 색상 팔레트, 전체적인 무드 선택
3. **표지 프리셋 적용**: `preset` 값에 따라 `cover_top_aligned` 또는 `cover_center_aligned_calm` 선택
4. **디자인 실행**: 각 슬라이드 HTML 생성 (Rules Pack 게이트 준수)
5. **일관성 검토**: 전체 프레젠테이션의 통일성 확인
6. **저장**: `slides/` 디렉토리에 파일 저장

---

## slides-spec.md 소비 형식

design-skill은 `slides-spec.md`를 우선 읽고 아래 항목을 파싱합니다.

| 항목 | 설명 | 처리 방법 |
|------|------|-----------|
| `type` | 슬라이드 유형 | 해당 템플릿 선택 |
| `preset` | 표지 프리셋 | cover_top_aligned 또는 cover_center_aligned_calm 적용 |
| `layout` | 레이아웃 유형 | bullets_keyword / two_column / data_card 등 |
| `title_line1` / `title_line2` | 제목 (최대 2줄) | `<h1>` 2개로 분리 렌더링 |
| `gradient_box` | true이면 gradient_box 컴포넌트 적용 | gradient_box_black_4stops_right |
| `background` | calm / dark / light / image | 배경 스타일 결정 |
| `bullets` | 불릿 목록 (bold 키워드 + 내용) | `<li>` + `<strong>` 렌더링 |
| `source` | 출처 | 슬라이드 우하단 caption |

---

## 기본 설정

### 슬라이드 크기 (16:9 기본)
```html
<body style="width: 720pt; height: 405pt;">
```

### 지원 비율
| 비율 | 크기 | 용도 |
|------|------|------|
| 16:9 | 720pt × 405pt | 기본, 모니터/화면 |
| 4:3 | 720pt × 540pt | 구형 프로젝터 |
| 16:10 | 720pt × 450pt | 맥북 |

### 기본 폰트 스택
```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Pretendard 웹폰트 CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
```

---

## 타이포그래피 시스템

### 폰트 크기 스케일
| 용도 | 크기 | 웨이트 | 사용 예시 |
|------|------|--------|----------|
| Hero Title | 72-96pt | 700-800 | 표지 메인 타이틀 |
| Section Title | 48-60pt | 700 | 섹션 구분 제목 |
| Slide Title | 32-40pt | 600-700 | 슬라이드 제목 |
| Subtitle | 20-24pt | 500 | 부제목, 설명 |
| Body | 16-20pt | 400 | 본문 텍스트 |
| Caption | 12-14pt | 400 | 캡션, 출처 |
| Label | 10-12pt | 500-600 | 뱃지, 태그 |

### 자간 설정 (letter-spacing)
```css
/* 대형 제목: 타이트하게 */
letter-spacing: -0.02em;

/* 중형 제목 */
letter-spacing: -0.01em;

/* 본문: 기본 */
letter-spacing: 0;

/* 캡션, 레이블: 약간 넓게 */
letter-spacing: 0.02em;
```

### 행간 설정 (line-height)
```css
/* 제목 */
line-height: 1.2;

/* 본문 */
line-height: 1.6 - 1.8;

/* 한 줄 텍스트 */
line-height: 1;
```

---

## ★ 타이포그래피 룰 (Rules Pack 적용)

> 이 섹션의 규칙은 Rules Pack에서 파생됩니다. 모든 슬라이드에 강제 적용됩니다.

### 제목 줄 수 제한
- **표지 제목은 최대 2줄** (title_line1 + title_line2)
- 3줄 이상의 제목이 slides-spec.md에 있으면 → 2줄로 리라이팅 후 렌더링
- HTML에서 2줄 구현 방법:
```html
<h1 style="font-size: 56pt; font-weight: 700; ...">첫째 줄</h1>
<h1 style="font-size: 56pt; font-weight: 700; ...">둘째 줄</h1>
```

### 강조 방식 (Weight-Only Emphasis)
- **허용**: `font-weight: 700` 또는 `<strong>` 태그
- **금지**: 텍스트 색상으로 단어 강조 (빨강, 파랑, 노랑 등)
- 올바른 키워드 강조 예시:
```html
<!-- 올바른 예 -->
<li style="font-size: 16pt;">
  <strong style="font-weight: 700; color: inherit;">자동화 대체율</strong>
  — 제조업 직군의 42% 자동화 대체 예상
</li>

<!-- 금지 예 -->
<li style="font-size: 16pt;">
  <span style="color: #e53e3e;">자동화 대체율</span>  <!-- ❌ 컬러 강조 금지 -->
  — 제조업 직군의 42% 자동화 대체 예상
</li>
```

### 레드 닷 옵션 (단조로울 때만)
- 텍스트 덩어리의 주목도를 높일 때만 허용
- 마침표를 강조색 dot으로 표현:
```html
<h2 style="font-size: 36pt; font-weight: 700; color: #1a1a1a;">
  핵심 인사이트<span style="color: #e53e3e;">.</span>
</h2>
```

---

## ★ 표지 프리셋 (cover_top_aligned / cover_center_aligned_calm)

### 프리셋 1: cover_top_aligned

**용도**: 영상/배경 이미지를 살리고 싶을 때. 제목이 상단에 위치.
**특징**: 동적 배경 허용, gradient_box 적용 권장.

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: #1a1a1a; /* 배경: 단색 또는 이미지 */
      padding: 48pt;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- 상단: 제목 영역 (gradient_box 적용 시) -->
  <div style="flex: 0 0 auto;">
    <!-- gradient_box_black_4stops_right: 동적 배경 위 가독성 확보 -->
    <div style="
      display: inline-block;
      background: linear-gradient(to right,
        rgba(0,0,0,1.0) 0%,
        rgba(0,0,0,0.7) 30%,
        rgba(0,0,0,0.4) 60%,
        rgba(0,0,0,0.0) 100%
      );
      padding: 16pt 64pt 16pt 0;
      border: none;
      max-width: 520pt;
    ">
      <h1 style="color: #ffffff; font-size: 52pt; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2;">
        제목 첫째 줄
      </h1>
      <h1 style="color: #ffffff; font-size: 52pt; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2;">
        제목 둘째 줄
      </h1>
    </div>
    <p style="color: rgba(255,255,255,0.75); font-size: 16pt; font-weight: 400; margin-top: 16pt; line-height: 1.5;">
      부제목 텍스트
    </p>
  </div>

  <!-- 스페이서 -->
  <div style="flex: 1;"></div>

  <!-- 하단: 소속/날짜 정보 -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <p style="font-size: 12pt; color: rgba(255,255,255,0.6); margin-bottom: 4pt;">발표자명</p>
      <p style="font-size: 11pt; color: rgba(255,255,255,0.5);">소속 | 날짜</p>
    </div>
    <p style="font-size: 10pt; color: rgba(255,255,255,0.3); letter-spacing: 0.05em;">로고/기관명</p>
  </div>
</body>
</html>
```

---

### 프리셋 2: cover_center_aligned_calm

**용도**: 전체 조화 중심, 과부하 방지.
**금지**: 과도한 동적 배경(빠른 움직임/영상). 배경은 단색·그라데이션·정적 이미지만 허용.
**특징**: 모든 요소 중앙 정렬, gradient_box 불필요.

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      /* calm 배경: 단색 또는 매우 느린/정적 그라데이션만 허용 */
      background: #0f0f0f;
      padding: 48pt;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- 제목 (최대 2줄) -->
  <h1 style="
    color: #ffffff;
    font-size: 60pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    max-width: 560pt;
  ">
    제목 첫째 줄
  </h1>
  <h1 style="
    color: #ffffff;
    font-size: 60pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    max-width: 560pt;
  ">
    제목 둘째 줄
  </h1>

  <!-- 구분선 -->
  <div style="width: 48pt; height: 2pt; background: rgba(255,255,255,0.25); margin: 24pt 0;"></div>

  <!-- 부제목 -->
  <p style="
    color: rgba(255,255,255,0.65);
    font-size: 16pt;
    font-weight: 400;
    max-width: 480pt;
    line-height: 1.5;
  ">
    부제목 텍스트
  </p>

  <!-- 발표자 정보 -->
  <p style="
    margin-top: 40pt;
    font-size: 12pt;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.02em;
  ">
    발표자명 &nbsp;|&nbsp; 소속 &nbsp;|&nbsp; 날짜
  </p>
</body>
</html>
```

---

## ★ gradient_box_black_4stops_right 컴포넌트

**용도**: 동적/복잡 배경에서 텍스트 가독성 확보.
**규격**:
- 방향: 오른쪽 (left → right)
- 색상: 검정 (rgba 0,0,0)
- 중지점 4개, 투명도: 0% → 30% → 60% → 100% (좌→우)
- 사각형, **테두리 없음**
- 박스 폭: 제목 길이에 맞게 조정 (화면 전체 불필요)

```html
<!-- gradient_box_black_4stops_right -->
<!-- 동적/복잡 배경 위에 텍스트를 올릴 때 사용 -->
<div style="
  display: inline-block;
  background: linear-gradient(to right,
    rgba(0,0,0,1.0)  0%,   /* 중지점 1: 투명도 0%  = 완전 불투명 */
    rgba(0,0,0,0.7) 30%,   /* 중지점 2: 투명도 30% */
    rgba(0,0,0,0.4) 60%,   /* 중지점 3: 투명도 60% */
    rgba(0,0,0,0.0) 100%   /* 중지점 4: 투명도 100% = 완전 투명 */
  );
  padding: 20pt 72pt 20pt 32pt;
  border: none;
  max-width: 500pt;
">
  <!-- 제목 (최대 2줄) -->
  <h1 style="
    color: #ffffff;
    font-size: 52pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    white-space: nowrap;
  ">
    제목 첫째 줄
  </h1>
  <h1 style="
    color: #ffffff;
    font-size: 52pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    white-space: nowrap;
  ">
    제목 둘째 줄
  </h1>
</div>
```

**사용 조건**:
- `gradient_box: true`로 slides-spec.md에 명시된 슬라이드
- 동적/복잡 배경(이미지, 영상 배경 등)이 있는 슬라이드
- `cover_center_aligned_calm` 프리셋에는 사용 불필요 (calm 배경이므로)

---

## ★ Overflow 방지 규칙 (html2pptx 안정성)

> html2pptx 변환 시 콘텐츠가 슬라이드 영역을 벗어나면 잘리거나 레이아웃이 깨집니다.
> 아래 규칙을 모든 슬라이드에 적용하세요.

### 슬라이드 컨테이너 규칙
```css
body {
  width: 720pt;
  height: 405pt;
  overflow: hidden;       /* 필수: 넘침 방지 */
  box-sizing: border-box; /* 필수: 패딩 포함 크기 계산 */
  padding: 32pt 48pt;     /* 최소 상하 32pt, 좌우 48pt */
}
```

### 폰트 크기 최솟값
| 용도 | 최솟값 | 이유 |
|------|--------|------|
| 표지 제목 | 36pt | 가독성 확보 |
| 슬라이드 제목 | 24pt | 명확한 계층 |
| 본문 불릿 | 13pt | PPTX 렌더링 |
| 캡션/출처 | 9pt | 최소 허용 크기 |

### 최대 줄 수 제한
| 영역 | 최대 줄 수 | 처리 방법 |
|------|-----------|-----------|
| 표지 제목 | 2줄 | 리라이팅 필수 |
| 슬라이드 제목 | 1줄 | 축약 또는 폰트 축소 |
| 불릿 항목 | 1줄/항목 | 초과 시 분리 |
| 불릿 개수 | 최대 6개 | 초과 시 슬라이드 분리 |
| 부제목 | 2줄 | 초과 시 생략 |

### 텍스트 overflow 처리
```css
/* 제목: 강제 줄 자름 */
.slide-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 불릿 텍스트: 한 줄 유지 */
.bullet-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 580pt; /* 슬라이드 폭 - 좌우 패딩 */
}
```

### 안전 영역 (Safe Zone)
- 상단: 32pt 이상 여백
- 하단: 32pt 이상 여백 (푸터 포함)
- 좌우: 48pt 이상 여백
- 콘텐츠 영역 최대 폭: 624pt (720 - 48×2)
- 콘텐츠 영역 최대 높이: 341pt (405 - 32×2)

---

## 색상 팔레트 시스템

### 1. Executive Minimal (기본 권장)
세련된 비즈니스 프레젠테이션용
```css
--bg-primary: #f5f5f0;      /* 웜 화이트 배경 */
--bg-secondary: #e8e8e3;    /* 서브 배경 */
--bg-dark: #1a1a1a;         /* 다크 배경 */
--text-primary: #1a1a1a;    /* 메인 텍스트 */
--text-secondary: #666666;  /* 보조 텍스트 */
--text-light: #999999;      /* 약한 텍스트 */
--accent: #1a1a1a;          /* 강조 (검정) */
--border: #d4d4d0;          /* 테두리 */
```

### 2. Sage Professional
차분하고 신뢰감 있는 톤
```css
--bg-primary: #b8c4b8;      /* 세이지 그린 배경 */
--bg-secondary: #a3b0a3;    /* 짙은 세이지 */
--bg-light: #f8faf8;        /* 밝은 배경 */
--text-primary: #1a1a1a;    /* 메인 텍스트 */
--text-secondary: #3d3d3d;  /* 보조 텍스트 */
--accent: #2d2d2d;          /* 강조 */
--border: #9aa89a;          /* 테두리 */
```

### 3. Modern Dark
임팩트 있는 다크 테마
```css
--bg-primary: #0f0f0f;      /* 순수 다크 */
--bg-secondary: #1a1a1a;    /* 카드 배경 */
--bg-elevated: #252525;     /* 강조 영역 */
--text-primary: #ffffff;    /* 메인 텍스트 */
--text-secondary: #b0b0b0;  /* 보조 텍스트 */
--accent: #ffffff;          /* 강조 (화이트) */
--border: #333333;          /* 테두리 */
```

### 4. Corporate Blue
전통적 비즈니스 톤
```css
--bg-primary: #ffffff;      /* 화이트 배경 */
--bg-secondary: #f7f9fc;    /* 밝은 블루 그레이 */
--text-primary: #1e2a3a;    /* 다크 네이비 */
--text-secondary: #5a6b7d;  /* 블루 그레이 */
--accent: #2563eb;          /* 블루 강조 */
--border: #e2e8f0;          /* 테두리 */
```

### 5. Warm Neutral
따뜻하고 친근한 톤
```css
--bg-primary: #faf8f5;      /* 크림 화이트 */
--bg-secondary: #f0ebe3;    /* 웜 베이지 */
--text-primary: #2d2a26;    /* 다크 브라운 */
--text-secondary: #6b6560;  /* 미디움 브라운 */
--accent: #c45a3b;          /* 테라코타 */
--border: #ddd8d0;          /* 테두리 */
```

---

## 레이아웃 시스템

### 여백 기준 (padding/margin)
```css
/* 슬라이드 전체 여백 (최소값 준수) */
padding: 32pt 48pt;

/* 섹션 간 여백 */
gap: 24pt;

/* 요소 간 여백 */
gap: 16pt;

/* 텍스트 블록 내 여백 */
gap: 8pt;
```

### 그리드 시스템
```css
/* 2단 레이아웃 */
display: grid;
grid-template-columns: 1fr 1fr;
gap: 32pt;

/* 3단 레이아웃 */
grid-template-columns: repeat(3, 1fr);

/* 비대칭 레이아웃 (40:60) */
grid-template-columns: 2fr 3fr;

/* 비대칭 레이아웃 (30:70) */
grid-template-columns: 1fr 2.3fr;
```

---

## 디자인 컴포넌트

### 1. 뱃지/태그
```html
<p style="
  display: inline-block;
  padding: 6pt 14pt;
  border: 1px solid #1a1a1a;
  border-radius: 20pt;
  font-size: 10pt;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
">PRESENTATION</p>
```

### 2. 섹션 넘버
```html
<p style="
  display: inline-block;
  padding: 4pt 12pt;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 4pt;
  font-size: 10pt;
  font-weight: 600;
">SECTION 1</p>
```

### 3. 로고 영역
```html
<div style="display: flex; align-items: center; gap: 8pt;">
  <div style="
    width: 20pt;
    height: 20pt;
    background: #1a1a1a;
    border-radius: 4pt;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <p style="color: #fff; font-size: 12pt;">*</p>
  </div>
  <p style="font-size: 12pt; font-weight: 600;">LogoName</p>
</div>
```

### 4. 구분선
```html
<div style="
  width: 100%;
  height: 1pt;
  background: #d4d4d0;
"></div>
```

### 5. 불릿 키워드 리스트 (bullets_keyword 레이아웃)
```html
<ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14pt;">
  <li style="font-size: 16pt; color: #1a1a1a; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
    <strong style="font-weight: 700; color: inherit;">키워드</strong>
    &nbsp;—&nbsp;내용 한 줄 설명 (수치 포함 권장)
  </li>
  <li style="font-size: 16pt; color: #1a1a1a; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
    <strong style="font-weight: 700; color: inherit;">키워드</strong>
    &nbsp;—&nbsp;내용 한 줄 설명
  </li>
</ul>
```

### 6. 출처 캡션 (우하단)
```html
<p style="
  font-size: 9pt;
  color: #999999;
  letter-spacing: 0.02em;
  text-align: right;
">
  Source: 출처 기관명, YYYY-MM
</p>
```

---

## 슬라이드 템플릿

### 1. 표지 슬라이드 (Cover)
→ **표지 프리셋 섹션 참고**: `cover_top_aligned` 또는 `cover_center_aligned_calm` 사용

### 2. 목차 슬라이드 (Contents)
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: #b8c4b8;
      padding: 40pt 48pt;
      display: grid;
      grid-template-columns: 1fr 1.8fr;
      gap: 48pt;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- 왼쪽: 타이틀 -->
  <div style="display: flex; flex-direction: column; justify-content: flex-end;">
    <h1 style="font-size: 52pt; font-weight: 500; color: #1a1a1a; letter-spacing: -0.02em; line-height: 1.2;">
      Our<br>Contents
    </h1>
  </div>

  <!-- 오른쪽: 목차 리스트 -->
  <div style="display: flex; flex-direction: column; justify-content: center; gap: 12pt;">
    <div style="display: flex; align-items: center; gap: 16pt; padding: 10pt 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
      <p style="display: inline-block; padding: 4pt 10pt; background: #1a1a1a; color: #fff; border-radius: 4pt; font-size: 8pt; font-weight: 600; white-space: nowrap;">SECTION 1</p>
      <p style="flex: 1; font-size: 14pt; font-weight: 500; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">SECTION TITLE</p>
    </div>
    <div style="display: flex; align-items: center; gap: 16pt; padding: 10pt 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
      <p style="display: inline-block; padding: 4pt 10pt; background: #1a1a1a; color: #fff; border-radius: 4pt; font-size: 8pt; font-weight: 600; white-space: nowrap;">SECTION 2</p>
      <p style="flex: 1; font-size: 14pt; font-weight: 500; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">SECTION TITLE</p>
    </div>
    <div style="display: flex; align-items: center; gap: 16pt; padding: 10pt 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
      <p style="display: inline-block; padding: 4pt 10pt; background: #1a1a1a; color: #fff; border-radius: 4pt; font-size: 8pt; font-weight: 600; white-space: nowrap;">SECTION 3</p>
      <p style="flex: 1; font-size: 14pt; font-weight: 500; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">SECTION TITLE</p>
    </div>
    <div style="display: flex; align-items: center; gap: 16pt; padding: 10pt 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
      <p style="display: inline-block; padding: 4pt 10pt; background: #1a1a1a; color: #fff; border-radius: 4pt; font-size: 8pt; font-weight: 600; white-space: nowrap;">SECTION 4</p>
      <p style="flex: 1; font-size: 14pt; font-weight: 500; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">SECTION TITLE</p>
    </div>
    <div style="display: flex; align-items: center; gap: 16pt; padding: 10pt 0;">
      <p style="display: inline-block; padding: 4pt 10pt; background: #1a1a1a; color: #fff; border-radius: 4pt; font-size: 8pt; font-weight: 600; white-space: nowrap;">SECTION 5</p>
      <p style="flex: 1; font-size: 14pt; font-weight: 500; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">SECTION TITLE</p>
    </div>
  </div>
</body>
</html>
```

### 3. 섹션 구분 슬라이드 (Section Divider)
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: #1a1a1a;
      padding: 48pt;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div>
    <p style="display: inline-block; padding: 4pt 10pt; background: #fff; color: #1a1a1a; border-radius: 4pt; font-size: 8pt; font-weight: 600;">SECTION 1</p>
  </div>
  <div>
    <h1 style="font-size: 60pt; font-weight: 500; color: #ffffff; letter-spacing: -0.02em; line-height: 1.1;">
      Introduction
    </h1>
    <p style="font-size: 15pt; color: #888; margin-top: 16pt; max-width: 400pt; line-height: 1.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
      Brief description of what this section covers.
    </p>
  </div>
  <div style="display: flex; justify-content: flex-end;">
    <p style="font-size: 10pt; color: #666;">01</p>
  </div>
</body>
</html>
```

### 4. 콘텐츠 슬라이드 — bullets_keyword 레이아웃
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: #ffffff;
      padding: 36pt 48pt;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <!-- 헤더 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28pt;">
    <div style="display: flex; align-items: center; gap: 12pt;">
      <p style="display: inline-block; padding: 4pt 10pt; background: #1a1a1a; color: #fff; border-radius: 4pt; font-size: 8pt; font-weight: 600; white-space: nowrap;">SECTION 1</p>
      <h2 style="font-size: 26pt; font-weight: 700; color: #1a1a1a; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 500pt;">슬라이드 제목</h2>
    </div>
    <p style="font-size: 10pt; color: #999; white-space: nowrap;">02</p>
  </div>

  <!-- 불릿 리스트 (키워드 + 한 줄 내용) -->
  <ul style="list-style: none; padding: 0; flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16pt;">
    <li style="font-size: 16pt; color: #1a1a1a; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      <strong style="font-weight: 700; color: inherit;">키워드 1</strong>
      &nbsp;—&nbsp;내용 설명 (수치/출처 포함)
    </li>
    <li style="font-size: 16pt; color: #1a1a1a; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      <strong style="font-weight: 700; color: inherit;">키워드 2</strong>
      &nbsp;—&nbsp;내용 설명 (수치/출처 포함)
    </li>
    <li style="font-size: 16pt; color: #1a1a1a; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      <strong style="font-weight: 700; color: inherit;">키워드 3</strong>
      &nbsp;—&nbsp;내용 설명 (수치/출처 포함)
    </li>
  </ul>

  <!-- 푸터 -->
  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12pt; border-top: 1px solid #eee;">
    <p style="font-size: 9pt; color: #999; white-space: nowrap; overflow: hidden;">Source: 출처 기관명, YYYY-MM</p>
    <p style="font-size: 9pt; color: #999; white-space: nowrap;">©2026 발표자</p>
  </div>
</body>
</html>
```

### 5. 통계/데이터 슬라이드 (Statistics)
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: #f5f5f0;
      padding: 36pt 48pt;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28pt;">
    <h2 style="font-size: 26pt; font-weight: 700; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 560pt;">Key Metrics</h2>
    <p style="font-size: 10pt; color: #999; white-space: nowrap;">03</p>
  </div>

  <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20pt;">
    <div style="background: #1a1a1a; border-radius: 12pt; padding: 24pt; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
      <p style="font-size: 9pt; color: #888; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Revenue Growth</p>
      <div>
        <p style="font-size: 44pt; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">85%</p>
        <p style="font-size: 11pt; color: #666; margin-top: 6pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Year over year</p>
      </div>
    </div>
    <div style="background: #ffffff; border-radius: 12pt; padding: 24pt; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e5e5e0; overflow: hidden;">
      <p style="font-size: 9pt; color: #888; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Active Users</p>
      <div>
        <p style="font-size: 44pt; font-weight: 700; color: #1a1a1a; letter-spacing: -0.02em;">2.4M</p>
        <p style="font-size: 11pt; color: #888; margin-top: 6pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">+340K this quarter</p>
      </div>
    </div>
    <div style="background: #ffffff; border-radius: 12pt; padding: 24pt; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e5e5e0; overflow: hidden;">
      <p style="font-size: 9pt; color: #888; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Customer Satisfaction</p>
      <div>
        <p style="font-size: 44pt; font-weight: 700; color: #1a1a1a; letter-spacing: -0.02em;">4.9</p>
        <p style="font-size: 11pt; color: #888; margin-top: 6pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Out of 5.0 rating</p>
      </div>
    </div>
  </div>

  <div style="display: flex; justify-content: flex-end; padding-top: 12pt;">
    <p style="font-size: 9pt; color: #999;">Source: Internal Analytics 2025</p>
  </div>
</body>
</html>
```

### 6. 인용문 슬라이드 (Quote)
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: #1a1a1a;
      padding: 64pt;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <p style="font-size: 44pt; color: #444; margin-bottom: 20pt; line-height: 1;">"</p>
  <h2 style="font-size: 26pt; font-weight: 400; color: #ffffff; letter-spacing: -0.01em; line-height: 1.5; max-width: 520pt; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
    The best way to predict the future is to create it.
  </h2>
  <div style="margin-top: 36pt;">
    <p style="font-size: 13pt; font-weight: 500; color: #ffffff;">Peter Drucker</p>
    <p style="font-size: 11pt; color: #666; margin-top: 4pt;">Management Consultant</p>
  </div>
</body>
</html>
```

### 7. 마무리 슬라이드 (Closing)
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: #1a1a1a;
      padding: 48pt;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div style="display: flex; align-items: center; gap: 8pt;">
    <div style="width: 20pt; height: 20pt; background: #fff; border-radius: 4pt; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      <p style="color: #1a1a1a; font-size: 12pt;">*</p>
    </div>
    <p style="font-size: 12pt; font-weight: 600; color: #ffffff; white-space: nowrap;">LogoName</p>
  </div>
  <div>
    <h1 style="font-size: 52pt; font-weight: 500; color: #ffffff; letter-spacing: -0.02em; line-height: 1.1;">Thank You</h1>
    <p style="font-size: 15pt; color: #888; margin-top: 14pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Questions? Let's discuss.</p>
  </div>
  <div style="display: flex; gap: 48pt; overflow: hidden;">
    <div>
      <p style="font-size: 9pt; color: #666; margin-bottom: 4pt;">Email</p>
      <p style="font-size: 12pt; font-weight: 500; color: #ffffff; white-space: nowrap;">hello@company.com</p>
    </div>
    <div>
      <p style="font-size: 9pt; color: #666; margin-bottom: 4pt;">Website</p>
      <p style="font-size: 12pt; font-weight: 500; color: #ffffff; white-space: nowrap;">www.company.com</p>
    </div>
  </div>
</body>
</html>
```

---

## 텍스트 사용 규칙

### 필수 태그
```html
<!-- 모든 텍스트는 반드시 다음 태그 안에 -->
<p>, <h1>-<h6>, <ul>, <ol>, <li>

<!-- 금지 - PowerPoint에서 무시됨 -->
<div>텍스트</div>
<span>텍스트</span>
```

---

## 출력 및 파일 구조

### 파일 저장 규칙
```
slides/
├── slide-01.html  (표지)
├── slide-02.html  (목차)
├── slide-03.html  (섹션 구분)
├── slide-04.html  (내용)
├── ...
└── slide-XX.html  (마무리)
```

### 파일 명명 규칙
- 2자리 숫자 사용: `slide-01.html`, `slide-02.html`
- 순서대로 명명
- 특수문자, 공백 사용 금지

---

## 품질 게이트 체크리스트 (생성 완료 후 실행)

### Rules Pack 준수 확인
- [ ] 모든 표지 제목이 2줄 이하인가?
- [ ] 줄글(문단 형식 텍스트)이 없는가? (불릿 전용)
- [ ] 컬러 강조(색상으로 단어 강조)가 없는가?
- [ ] `gradient_box: true`인 슬라이드에 `gradient_box_black_4stops_right` 적용됐는가?
- [ ] `cover_center_aligned_calm` 슬라이드에 동적/빠른 배경이 없는가?

### Overflow 방지 확인
- [ ] 모든 `<body>`에 `overflow: hidden` 적용됐는가?
- [ ] 본문 폰트가 13pt 이상인가?
- [ ] 불릿이 6개 이하인가?
- [ ] 제목이 1줄(내용 슬라이드) 또는 2줄(표지) 이내인가?
- [ ] 콘텐츠가 안전 영역(32pt/48pt 여백) 안에 있는가?

### 기술 호환성 확인
- [ ] Pretendard CDN 링크가 모든 파일에 포함됐는가?
- [ ] 모든 색상에 # 포함됐는가?
- [ ] 텍스트가 div/span에 직접 입력되지 않았는가?
- [ ] 이미지 경로가 절대 경로 또는 URL인가?

---

## 주의사항

1. **CSS 그라데이션**: PowerPoint 변환 시 지원 안됨 — 배경 이미지로 대체 (gradient_box는 인라인 스타일이므로 허용)
2. **웹폰트**: Pretendard CDN 링크 항상 포함
3. **이미지 경로**: 절대 경로 또는 URL 사용
4. **호환성**: 모든 색상에 # 포함
5. **텍스트 규칙**: div/span에 직접 텍스트 금지
6. **overflow 필수**: `body`와 콘텐츠 컨테이너에 `overflow: hidden` 적용
7. **보류**: PPT 내 영상/음악 자동재생·반복·동시재생은 현재 단계에서 구현 없음
