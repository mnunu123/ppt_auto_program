<!--
  CHANGE SUMMARY (5줄):
  1. 신규 스킬 — 인포그래픽 이미지/레퍼런스 라이브러리 연동을 위한 I/O 스펙 정의 전용.
  2. 이번 단계에서는 구현 보류 — 스펙/인터페이스 문서만 정의한다.
  3. 입력: slides-spec.md의 asset 요청 필드 (asset_type, query, style) 파싱.
  4. 출력: output/assets/[slide-NN]-[asset-id].png (또는 .svg) 형식 표준화.
  5. design-skill이 <img src="..."> 태그로 참조할 수 있도록 경로 규약 정의.
-->

---
name: asset-skill
description: >
  [구현 보류] 인포그래픽 이미지·레퍼런스 라이브러리 연동 스킬.
  이번 단계에서는 I/O 스펙 정의만 포함. 실제 이미지 생성 미구현.
---

# asset-skill

## 상태

> ⚠️ **이번 단계 구현 보류**
> 이 파일은 향후 구현을 위한 I/O 스펙 및 인터페이스 정의만 포함한다.
> 실제 이미지 생성 · 라이브러리 연동은 추후 단계에서 구현한다.

---

## 정체성 (목표)

나는 **시각 자산 생성 전담 스킬(실행)**이다.
슬라이드 스펙에서 이미지가 필요한 위치를 파악하고,
인포그래픽 · 아이콘 · 차트 이미지를 생성하거나 외부 라이브러리에서 가져와
`output/assets/` 디렉토리에 저장한다.
design-skill이 `<img src>` 태그로 참조할 수 있도록 파일명 규약을 준수한다.

---

## 입출력 명세

### 입력: slides-spec.md의 asset 필드 (미래 스키마)

```markdown
### slide-NN
- **assets** (선택):
  - id: [고유 ID]
    type: [infographic | icon | chart | photo | diagram]
    query: "[검색어 또는 생성 요청]"
    style: [flat | line | filled | photo-realistic]
    size: [small | medium | large]
    position: [left | right | background | full]
```

### 출력: output/assets/ 파일

```
output/assets/
  slide-NN-[asset-id].png
  slide-NN-[asset-id].svg
```

파일명 규약:
- `slide-01-hero.png` — slide-01의 hero 이미지
- `slide-05-chart-dram.png` — slide-05의 DRAM 차트
- `slide-10-icon-sk.svg` — slide-10의 SK하이닉스 아이콘

---

## design-skill 연동 인터페이스

design-skill이 asset을 참조할 때:

```html
<!-- output/assets/ 경로를 상대경로로 참조 -->
<img src="../assets/slide-01-hero.png"
     style="width: 100%; height: 100%; object-fit: cover;"
     alt="[대체 텍스트]">
```

> 주의: html2pptx.js는 절대경로 또는 file:// 경로로 이미지를 처리함.
> run.cjs에서 경로를 절대경로로 변환하는 로직 필요 (pptx-skill 담당).

---

## 미래 구현 계획

### Phase 1 (보류): 로컬 아이콘 라이브러리
- react-icons (이미 package.json에 포함) 활용
- SVG 아이콘을 PNG로 래스터화하여 저장
- 구현 방법: Playwright로 SVG 렌더링 → 스크린샷 저장

### Phase 2 (보류): 차트 자동 생성
- slides-spec.md의 데이터 필드 → Chart.js/D3.js로 차트 생성
- Playwright로 렌더링 → PNG 저장
- 지원 유형: bar, line, pie, donut, treemap

### Phase 3 (보류): 외부 이미지 검색/생성
- Unsplash API: 사진 검색
- DALL-E / Stable Diffusion API: 인포그래픽 생성
- 저작권 안전 이미지만 허용 (CC0 또는 API 라이선스)

---

## 현재 단계에서의 대안

asset-skill이 미구현 상태에서 이미지가 필요한 경우:

1. **슬라이드 스펙에서 이미지 요청 제거** → design-skill이 텍스트/도형으로 대체
2. **수동 이미지 삽입** → `output/assets/` 에 이미지 직접 복사 후 slides-spec.md에 경로 명시
3. **CSS 도형으로 대체** → 이미지 없이 색상 카드/도형으로 시각화

---

## 역할 경계

| ✅ 담당 (미래) | ❌ 담당 아님 |
|-------------|------------|
| 이미지/아이콘/차트 파일 생성 | 슬라이드 설계 결정 |
| output/assets/ 관리 | HTML 생성 |
| design-skill에 경로 제공 | PPTX 변환 |
