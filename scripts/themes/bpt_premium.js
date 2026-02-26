// bpt_premium.js - BPT_PREMIUM 테마 HTML 슬라이드 생성기
// 빕비티.pdf 디자인 원칙: Paperlogy 폰트, #02FFDC 액센트, 다크 배경, 상단 우측 페이지 번호

'use strict';

// ─── 디자인 토큰 ──────────────────────────────────────────────────────────────

const TOKENS = {
  colors: {
    BG_DARK:      '#070A0D',   // 메인 배경 (near-black deep navy)
    BG_CARD:      '#0E1318',   // 카드/패널 배경
    BG_CARD2:     '#141B22',   // 보조 카드 배경
    ACCENT:       '#02FFDC',   // 강조 (bright cyan-teal)
    ACCENT_DIM:   'rgba(2,255,220,0.15)',  // 액센트 반투명 (카드 테두리/배경)
    ACCENT_GLOW:  'rgba(2,255,220,0.06)',  // 액센트 글로우 (미세 배경)
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_MUTED:   '#B0BAC6',   // 보조 텍스트
    TEXT_DIM:     '#6B7785',   // 주석/캡션
    GLASS_BG:     'rgba(255,255,255,0.04)',
    GLASS_BORDER: 'rgba(255,255,255,0.08)',
    GRADIENT_PANEL: 'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 100%)',
  },
  typography: {
    // Paperlogy 폰트 (미설치 환경에서는 Pretendard로 폴백)
    FONT_STACK: "'Paperlogy', 'Pretendard', 'Noto Sans KR', sans-serif",
    COVER_TITLE: { size: '42pt', weight: '700', lineHeight: '1.15' },
    H1:          { size: '28pt', weight: '700', lineHeight: '1.25' },
    H2:          { size: '22pt', weight: '600', lineHeight: '1.3'  },
    METRIC_BIG:  { size: '38pt', weight: '700', lineHeight: '1.0'  },
    BODY:        { size: '13pt', weight: '400', lineHeight: '1.55' },
    CAPTION:     { size: '9.5pt',weight: '400', lineHeight: '1.4'  },
    LABEL:       { size: '9pt',  weight: '600', lineHeight: '1.0', letterSpacing: '0.14em' },
    PAGE_NUM:    { size: '9pt',  weight: '400', opacity: '0.45'    },
  },
  grid: {
    MARGIN_H: '40pt',    // 수평 여백
    MARGIN_V: '28pt',    // 수직 여백 (상단)
    GAP:      '10pt',    // 카드 간격
    RADIUS:   '8pt',     // 카드 모서리
    RADIUS_LG:'14pt',    // 큰 카드
  },
};

// ─── 폰트 설정 ───────────────────────────────────────────────────────────────
// 외부 CDN 의존성 없음: 외부 네트워크 차단 환경에서 타임아웃 방지
// Paperlogy가 시스템에 설치된 경우 자동으로 사용됨
// 설치법: https://github.com/orioncactus/paperlogy (선택 사항)

// ─── 공통 컴포넌트 ────────────────────────────────────────────────────────────

// 페이지 번호 상단 우측 (빕비티.pdf 규칙) — <p> 사용으로 html2pptx 검증 통과
function addPageNum(index) {
  return `<p style="position:absolute;top:18pt;right:${TOKENS.grid.MARGIN_H};
    font-size:${TOKENS.typography.PAGE_NUM.size};
    font-family:${TOKENS.typography.FONT_STACK};
    color:${TOKENS.colors.TEXT_PRIMARY};
    opacity:${TOKENS.typography.PAGE_NUM.opacity};
    font-weight:400;letter-spacing:0.05em;z-index:10;">
    ${String(index).padStart(2,'0')}
  </p>`;
}

// 섹션 레이블 (액센트 컬러, 대문자)
function addSectionLabel(text) {
  if (!text) return '';
  return `<p style="font-size:${TOKENS.typography.LABEL.size};
    font-family:${TOKENS.typography.FONT_STACK};
    color:${TOKENS.colors.ACCENT};font-weight:${TOKENS.typography.LABEL.weight};
    letter-spacing:${TOKENS.typography.LABEL.letterSpacing};
    text-transform:uppercase;margin-bottom:10pt;">
    ${escapedText(text)}
  </p>`;
}

// 액센트 수평선
function addAccentLine(width = '36pt', margin = '0 0 18pt 0') {
  return `<div style="width:${width};height:2pt;background:${TOKENS.colors.ACCENT};
    border-radius:1pt;margin:${margin};flex-shrink:0;"></div>`;
}

// 글래스 카드 래퍼
function glassCard(content, extraStyle = '') {
  return `<div style="background:${TOKENS.colors.GLASS_BG};
    border:1pt solid ${TOKENS.colors.GLASS_BORDER};
    border-radius:${TOKENS.grid.RADIUS};
    padding:16pt 18pt;
    ${extraStyle}">
    ${content}
  </div>`;
}

// 메트릭 블록 (큰 숫자 + 레이블)
function addMetricBlock(value, label, desc = '') {
  return `
    <p style="font-size:${TOKENS.typography.METRIC_BIG.size};
      font-family:${TOKENS.typography.FONT_STACK};
      font-weight:${TOKENS.typography.METRIC_BIG.weight};
      color:${TOKENS.colors.ACCENT};line-height:${TOKENS.typography.METRIC_BIG.lineHeight};
      margin-bottom:6pt;">${escapedText(value)}</p>
    <p style="font-size:12pt;font-family:${TOKENS.typography.FONT_STACK};
      font-weight:600;color:${TOKENS.colors.TEXT_PRIMARY};margin-bottom:4pt;">
      ${escapedText(label)}</p>
    ${desc ? `<p style="font-size:9pt;font-family:${TOKENS.typography.FONT_STACK};
      color:${TOKENS.colors.TEXT_DIM};">${escapedText(desc)}</p>` : ''}
  `;
}

// ─── 공통 헬퍼 ────────────────────────────────────────────────────────────────

function escapedText(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlHead(title, extraStyle = '') {
  return `<!DOCTYPE html>
<!-- BPT_PREMIUM: ${title} -->
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width:720pt; height:405pt;
      font-family:${TOKENS.typography.FONT_STACK};
      background:${TOKENS.colors.BG_DARK};
      overflow:hidden; position:relative;
    }
    ${extraStyle}
  </style>
</head>`;
}

// ─── 레이아웃 1: coverHero (표지) ────────────────────────────────────────────

function genCoverHero(slide, input) {
  const title    = escapedText(slide.title || input.topic || '제목');
  const subtitle = escapedText(slide.subtitle || slide.sectionLabel || input.audience || '');
  const oneLiner = escapedText(slide.oneLiner || input.one_liner || '');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: cover`)}
<body style="display:flex;flex-direction:column;justify-content:center;
  padding:0 ${TOKENS.grid.MARGIN_H};
  background:${TOKENS.colors.BG_DARK};">

  ${addPageNum(slide.index)}

  <!-- 배경 액센트 수직선 (우측 장식) — 오버플로 없이 테두리 효과 -->
  <div style="position:absolute;right:60pt;top:10%;
    width:2pt;height:80%;
    background:${TOKENS.colors.ACCENT_DIM};"></div>

  <!-- 본문 -->
  <div style="position:relative;max-width:520pt;">
    ${subtitle ? `<p style="font-size:10pt;font-family:${TOKENS.typography.FONT_STACK};
      color:${TOKENS.colors.ACCENT};font-weight:600;
      letter-spacing:0.15em;text-transform:uppercase;margin-bottom:20pt;">
      ${subtitle}
    </p>` : ''}

    <h1 style="font-size:${TOKENS.typography.COVER_TITLE.size};
      font-family:${TOKENS.typography.FONT_STACK};
      font-weight:${TOKENS.typography.COVER_TITLE.weight};
      color:${TOKENS.colors.TEXT_PRIMARY};
      line-height:${TOKENS.typography.COVER_TITLE.lineHeight};
      letter-spacing:-0.02em;margin-bottom:20pt;">
      ${title}
    </h1>

    ${addAccentLine('48pt', '0 0 18pt 0')}

    ${oneLiner ? `<p style="font-size:13pt;font-family:${TOKENS.typography.FONT_STACK};
      color:${TOKENS.colors.TEXT_MUTED};font-weight:400;line-height:1.6;max-width:460pt;">
      ${oneLiner}
    </p>` : ''}
  </div>

</body></html>`;
}

// ─── 레이아웃 2: sectionCover (섹션 구분) ───────────────────────────────────

function genSectionCover(slide, input) {
  const sectionNum = String(slide.index).padStart(2,'0');
  const label      = escapedText(slide.sectionLabel || '');
  const title      = escapedText(slide.title || '');
  const quote      = escapedText(slide.quote || slide.keyword || '');

  return `${htmlHead(`slide-${sectionNum}: section_cover`)}
<body style="display:flex;flex-direction:column;justify-content:center;align-items:center;
  text-align:center;padding:48pt ${TOKENS.grid.MARGIN_H};
  background:${TOKENS.colors.BG_DARK};">

  ${addPageNum(slide.index)}

  <!-- 대형 배경 섹션 번호 -->
  <p style="position:absolute;font-size:160pt;font-weight:700;
    color:rgba(255,255,255,0.02);letter-spacing:-0.05em;
    font-family:${TOKENS.typography.FONT_STACK};
    top:50%;left:50%;transform:translate(-50%,-50%);
    user-select:none;pointer-events:none;white-space:nowrap;">
    ${sectionNum}
  </p>

  <div style="position:relative;max-width:480pt;">
    ${label ? `<p style="font-size:10pt;color:${TOKENS.colors.ACCENT};font-weight:600;
      letter-spacing:0.15em;text-transform:uppercase;
      font-family:${TOKENS.typography.FONT_STACK};margin-bottom:20pt;">${label}</p>` : ''}

    <h1 style="font-size:30pt;font-weight:700;
      color:${TOKENS.colors.TEXT_PRIMARY};letter-spacing:-0.02em;line-height:1.2;
      font-family:${TOKENS.typography.FONT_STACK};margin-bottom:16pt;">${title}</h1>

    ${addAccentLine('40pt', '0 auto 18pt')}

    ${quote ? `<p style="font-size:13pt;color:${TOKENS.colors.TEXT_MUTED};
      font-family:${TOKENS.typography.FONT_STACK};line-height:1.6;">${quote}</p>` : ''}
  </div>

</body></html>`;
}

// ─── 레이아웃 3: heroLeftCardsRight (텍스트 좌 + 카드 우) ───────────────────

function genHeroLeftCardsRight(slide, input) {
  const body    = (slide.body || []).filter(Boolean).slice(0, 4);
  // 우측 패널 높이 = 405-56=349pt; 카드 최대 3개로 제한 (오버플로 방지)
  const cards   = (slide.cards || []).slice(0, 3);
  const keyword = escapedText(slide.keyword || '');

  const bulletsHTML = body.map((b) => `
    <li style="display:flex;align-items:flex-start;gap:9pt;
      margin-bottom:9pt;font-size:12.5pt;
      color:${TOKENS.colors.TEXT_MUTED};line-height:1.5;
      font-family:${TOKENS.typography.FONT_STACK};">
      <span style="display:block;width:5pt;height:5pt;min-width:5pt;
        background:${TOKENS.colors.ACCENT};border-radius:50%;
        margin-top:5pt;flex-shrink:0;"></span>
      ${escapedText(b)}
    </li>`).join('');

  // 컴팩트 카드: 우측 패널 내 높이 제한으로 24pt 메트릭 사용
  const compactCard = (c) => `
    <div style="background:${TOKENS.colors.GLASS_BG};
      border:1pt solid ${TOKENS.colors.GLASS_BORDER};
      border-radius:${TOKENS.grid.RADIUS};
      padding:11pt 14pt;margin-bottom:8pt;">
      <p style="font-size:24pt;font-family:${TOKENS.typography.FONT_STACK};
        font-weight:700;color:${TOKENS.colors.ACCENT};
        line-height:1.0;margin-bottom:4pt;">${escapedText(c.value || '—')}</p>
      <p style="font-size:11pt;font-family:${TOKENS.typography.FONT_STACK};
        font-weight:600;color:${TOKENS.colors.TEXT_PRIMARY};
        margin-bottom:3pt;">${escapedText(c.label || '')}</p>
      ${c.desc ? `<p style="font-size:9pt;font-family:${TOKENS.typography.FONT_STACK};
        color:${TOKENS.colors.TEXT_DIM};">${escapedText(c.desc)}</p>` : ''}
    </div>`;

  const cardsHTML = cards.map(compactCard).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: heroLeftCardsRight`)}
<body style="display:grid;grid-template-columns:1fr 200pt;
  height:405pt;overflow:hidden;">

  ${addPageNum(slide.index)}

  <!-- 좌측: 히어로 텍스트 -->
  <div style="padding:${TOKENS.grid.MARGIN_V} 28pt ${TOKENS.grid.MARGIN_V} ${TOKENS.grid.MARGIN_H};
    display:flex;flex-direction:column;justify-content:center;
    border-right:1pt solid ${TOKENS.colors.GLASS_BORDER};">
    ${addSectionLabel(slide.sectionLabel)}
    ${keyword ? `<p style="font-size:20pt;font-weight:700;
      color:${TOKENS.colors.ACCENT};font-family:${TOKENS.typography.FONT_STACK};
      line-height:1.1;margin-bottom:10pt;">${keyword}</p>` : ''}
    <h2 style="font-size:${TOKENS.typography.H2.size};font-weight:600;
      color:${TOKENS.colors.TEXT_PRIMARY};font-family:${TOKENS.typography.FONT_STACK};
      line-height:${TOKENS.typography.H2.lineHeight};margin-bottom:16pt;">
      ${escapedText(slide.title || '')}
    </h2>
    <ul style="list-style:none;padding:0;">${bulletsHTML}</ul>
  </div>

  <!-- 우측: 카드 패널 (최대 3개) -->
  <div style="padding:${TOKENS.grid.MARGIN_V} 14pt;
    display:flex;flex-direction:column;justify-content:center;
    background:${TOKENS.colors.BG_CARD};">
    ${cardsHTML || `<p style="font-size:11pt;color:${TOKENS.colors.TEXT_DIM};
      font-family:${TOKENS.typography.FONT_STACK};">—</p>`}
  </div>

</body></html>`;
}

// ─── 레이아웃 4: metricDashboard (지표 대시보드) ────────────────────────────

function genMetricDashboard(slide, input) {
  const cards = (slide.cards || []).slice(0, 4);
  const cols  = cards.length <= 2 ? '1fr 1fr' : `repeat(${Math.min(cards.length, 4)}, 1fr)`;

  const cardsHTML = cards.map((c) => `
    <div style="background:${TOKENS.colors.BG_CARD};
      border:1pt solid ${TOKENS.colors.GLASS_BORDER};
      border-top:2pt solid ${TOKENS.colors.ACCENT};
      border-radius:${TOKENS.grid.RADIUS};padding:20pt 18pt;">
      ${addMetricBlock(c.value || '—', c.label || '', c.desc || '')}
    </div>`).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: metricDashboard`)}
<body style="padding:${TOKENS.grid.MARGIN_V} ${TOKENS.grid.MARGIN_H} 24pt;">

  ${addPageNum(slide.index)}

  ${addSectionLabel(slide.sectionLabel)}
  <h2 style="font-size:${TOKENS.typography.H1.size};font-weight:${TOKENS.typography.H1.weight};
    color:${TOKENS.colors.TEXT_PRIMARY};font-family:${TOKENS.typography.FONT_STACK};
    line-height:${TOKENS.typography.H1.lineHeight};margin-bottom:18pt;">
    ${escapedText(slide.title || '')}
  </h2>

  <div style="display:grid;grid-template-columns:${cols};gap:${TOKENS.grid.GAP};">
    ${cardsHTML}
  </div>

</body></html>`;
}

// ─── 레이아웃 5: timeline (수평 타임라인 / 어젠다) ──────────────────────────

function genTimeline(slide, input) {
  const items = (slide.agendaItems || slide.body?.map((b,i) => ({
    num: String(i+1).padStart(2,'0'), title: b, desc: ''
  })) || []).slice(0, 5);

  const itemsHTML = items.map((it, i) => `
    <div style="display:flex;flex-direction:column;align-items:center;
      flex:1;position:relative;padding:0 8pt;">
      <!-- 타임라인 점 -->
      <div style="width:10pt;height:10pt;border-radius:50%;
        background:${TOKENS.colors.ACCENT};
        border:2pt solid ${TOKENS.colors.BG_DARK};
        position:relative;z-index:1;margin-bottom:12pt;flex-shrink:0;"></div>
      <!-- 번호 + 내용 -->
      <p style="font-size:18pt;font-weight:700;color:${TOKENS.colors.ACCENT};
        font-family:${TOKENS.typography.FONT_STACK};
        line-height:1;margin-bottom:6pt;">${escapedText(it.num || String(i+1))}</p>
      <p style="font-size:11pt;font-weight:600;color:${TOKENS.colors.TEXT_PRIMARY};
        font-family:${TOKENS.typography.FONT_STACK};
        text-align:center;line-height:1.3;margin-bottom:4pt;">${escapedText(it.title || '')}</p>
      ${it.desc ? `<p style="font-size:9pt;color:${TOKENS.colors.TEXT_DIM};
        font-family:${TOKENS.typography.FONT_STACK};text-align:center;line-height:1.3;">
        ${escapedText(it.desc)}</p>` : ''}
    </div>
    ${i < items.length-1 ? `<div style="position:absolute;top:0;height:2pt;
      background:${TOKENS.colors.GLASS_BORDER};z-index:0;"></div>` : ''}`
  ).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: timeline`)}
<body style="padding:${TOKENS.grid.MARGIN_V} ${TOKENS.grid.MARGIN_H} 28pt;">

  ${addPageNum(slide.index)}

  ${addSectionLabel(slide.sectionLabel || '목차')}
  <h2 style="font-size:${TOKENS.typography.H1.size};font-weight:${TOKENS.typography.H1.weight};
    color:${TOKENS.colors.TEXT_PRIMARY};font-family:${TOKENS.typography.FONT_STACK};
    line-height:${TOKENS.typography.H1.lineHeight};margin-bottom:28pt;">
    ${escapedText(slide.title || '오늘의 흐름')}
  </h2>

  <!-- 타임라인 -->
  <div style="position:relative;display:flex;align-items:flex-start;
    padding-top:0;">
    <!-- 수평선 -->
    <div style="position:absolute;top:4pt;left:5%;right:5%;height:2pt;
      background:${TOKENS.colors.GLASS_BORDER};z-index:0;"></div>
    ${itemsHTML}
  </div>

</body></html>`;
}

// ─── 레이아웃 6: compareTwin (2열 비교) ──────────────────────────────────────

function genCompareTwin(slide, input) {
  const cards  = (slide.cards || []).slice(0, 2);
  const body   = (slide.body || []).filter(Boolean).slice(0, 4);

  // 카드 2개면 비교, 아니면 좌우 글머리로 분할
  const half = Math.ceil(body.length / 2);
  const leftItems  = cards.length >= 2 ? [] : body.slice(0, half);
  const rightItems = cards.length >= 2 ? [] : body.slice(half);

  function panelBullets(items) {
    return items.map((b) => `
      <li style="display:flex;align-items:flex-start;gap:8pt;margin-bottom:9pt;
        font-size:12pt;color:${TOKENS.colors.TEXT_MUTED};line-height:1.5;
        font-family:${TOKENS.typography.FONT_STACK};">
        <span style="display:block;width:4pt;height:4pt;min-width:4pt;
          background:${TOKENS.colors.ACCENT};border-radius:50%;margin-top:5pt;flex-shrink:0;"></span>
        ${escapedText(b)}
      </li>`).join('');
  }

  const leftContent = cards.length >= 2
    ? addMetricBlock(cards[0].value||'—', cards[0].label||'', cards[0].desc||'')
    : `<ul style="list-style:none;padding:0;">${panelBullets(leftItems)}</ul>`;

  const rightContent = cards.length >= 2
    ? addMetricBlock(cards[1].value||'—', cards[1].label||'', cards[1].desc||'')
    : `<ul style="list-style:none;padding:0;">${panelBullets(rightItems)}</ul>`;

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: compareTwin`)}
<body style="display:flex;flex-direction:column;
  padding:${TOKENS.grid.MARGIN_V} ${TOKENS.grid.MARGIN_H} 28pt;">

  ${addPageNum(slide.index)}

  ${addSectionLabel(slide.sectionLabel)}
  <h2 style="font-size:${TOKENS.typography.H1.size};font-weight:${TOKENS.typography.H1.weight};
    color:${TOKENS.colors.TEXT_PRIMARY};font-family:${TOKENS.typography.FONT_STACK};
    line-height:${TOKENS.typography.H1.lineHeight};margin-bottom:16pt;">
    ${escapedText(slide.title || '')}
  </h2>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12pt;flex:1;">
    <!-- 좌측 패널 -->
    <div style="background:${TOKENS.colors.BG_CARD};
      border:1pt solid ${TOKENS.colors.ACCENT_DIM};
      border-radius:${TOKENS.grid.RADIUS_LG};padding:20pt 18pt;
      display:flex;flex-direction:column;justify-content:center;">
      ${cards.length >= 2 ? `<p style="font-size:9pt;font-weight:600;
        color:${TOKENS.colors.ACCENT};letter-spacing:0.12em;text-transform:uppercase;
        font-family:${TOKENS.typography.FONT_STACK};margin-bottom:12pt;">
        ${escapedText(cards[0].label || '현황')}</p>` : ''}
      ${leftContent}
    </div>
    <!-- 우측 패널 -->
    <div style="background:${TOKENS.colors.BG_CARD};
      border:1pt solid ${TOKENS.colors.GLASS_BORDER};
      border-radius:${TOKENS.grid.RADIUS_LG};padding:20pt 18pt;
      display:flex;flex-direction:column;justify-content:center;">
      ${cards.length >= 2 ? `<p style="font-size:9pt;font-weight:600;
        color:${TOKENS.colors.TEXT_DIM};letter-spacing:0.12em;text-transform:uppercase;
        font-family:${TOKENS.typography.FONT_STACK};margin-bottom:12pt;">
        ${escapedText(cards[1].label || '전망')}</p>` : ''}
      ${rightContent}
    </div>
  </div>

</body></html>`;
}

// ─── 레이아웃 7: closing (CTA / 마무리) ─────────────────────────────────────

function genClosing(slide, input) {
  const bullets = (slide.body || slide.keyPoints || slide.cta || []).slice(0, 3);
  const oneLiner = escapedText(slide.oneLiner || input.one_liner || '');

  const ctaHTML = bullets.map((b, i) => `
    <div style="display:flex;align-items:center;gap:14pt;margin-bottom:14pt;">
      <span style="font-size:22pt;font-weight:700;color:${TOKENS.colors.ACCENT};
        font-family:${TOKENS.typography.FONT_STACK};
        line-height:1;flex-shrink:0;width:28pt;">
        ${String(i+1).padStart(2,'0')}
      </span>
      <p style="font-size:13pt;font-weight:600;
        color:${TOKENS.colors.TEXT_PRIMARY};font-family:${TOKENS.typography.FONT_STACK};
        line-height:1.45;">${escapedText(b)}</p>
    </div>`).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: closing`)}
<body style="display:grid;grid-template-columns:1fr 220pt;height:405pt;">

  ${addPageNum(slide.index)}

  <!-- 좌측: CTA 리스트 -->
  <div style="padding:${TOKENS.grid.MARGIN_V} 28pt ${TOKENS.grid.MARGIN_V} ${TOKENS.grid.MARGIN_H};
    display:flex;flex-direction:column;justify-content:center;
    border-right:1pt solid ${TOKENS.colors.GLASS_BORDER};">
    ${addSectionLabel(slide.sectionLabel)}
    <h2 style="font-size:${TOKENS.typography.H1.size};font-weight:700;
      color:${TOKENS.colors.TEXT_PRIMARY};font-family:${TOKENS.typography.FONT_STACK};
      line-height:${TOKENS.typography.H1.lineHeight};margin-bottom:20pt;">
      ${escapedText(slide.title || '지금 바로 시작하라')}
    </h2>
    ${addAccentLine('36pt', '0 0 18pt 0')}
    ${ctaHTML}
  </div>

  <!-- 우측: One-liner 카드 -->
  <div style="padding:${TOKENS.grid.MARGIN_V} 20pt;
    display:flex;flex-direction:column;justify-content:center;
    background:${TOKENS.colors.ACCENT_GLOW};">
    <p style="font-size:9pt;font-weight:600;
      color:${TOKENS.colors.ACCENT};letter-spacing:0.12em;text-transform:uppercase;
      font-family:${TOKENS.typography.FONT_STACK};margin-bottom:12pt;">ONE-LINER</p>
    ${oneLiner ? `<p style="font-size:12pt;font-weight:400;
      color:${TOKENS.colors.TEXT_MUTED};font-family:${TOKENS.typography.FONT_STACK};
      line-height:1.65;">${oneLiner}</p>` : ''}
  </div>

</body></html>`;
}

// ─── 레이아웃 8: summaryGrid (3-포인트 요약) ─────────────────────────────────

function genSummaryGrid(slide, input) {
  const points = (slide.body || slide.keyPoints || []).slice(0, 3);
  const oneLiner = escapedText(slide.oneLiner || input.one_liner || '');

  const pointsHTML = points.map((p, i) => `
    <div style="display:flex;align-items:flex-start;gap:14pt;margin-bottom:16pt;">
      <div style="width:32pt;height:32pt;border-radius:50%;
        background:${TOKENS.colors.ACCENT_DIM};border:1pt solid ${TOKENS.colors.ACCENT};
        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:14pt;font-weight:700;color:${TOKENS.colors.ACCENT};
          font-family:${TOKENS.typography.FONT_STACK};">
          ${String(i+1)}
        </span>
      </div>
      <p style="font-size:13pt;color:${TOKENS.colors.TEXT_MUTED};
        font-family:${TOKENS.typography.FONT_STACK};line-height:1.5;padding-top:4pt;">
        ${escapedText(p)}</p>
    </div>`).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: summaryGrid`)}
<body style="display:grid;grid-template-columns:1fr 200pt;height:405pt;">

  ${addPageNum(slide.index)}

  <!-- 좌측: 요약 포인트 -->
  <div style="padding:${TOKENS.grid.MARGIN_V} 28pt ${TOKENS.grid.MARGIN_V} ${TOKENS.grid.MARGIN_H};
    display:flex;flex-direction:column;justify-content:center;">
    ${addSectionLabel(slide.sectionLabel || '핵심 정리')}
    <h2 style="font-size:${TOKENS.typography.H1.size};font-weight:700;
      color:${TOKENS.colors.TEXT_PRIMARY};font-family:${TOKENS.typography.FONT_STACK};
      line-height:${TOKENS.typography.H1.lineHeight};margin-bottom:20pt;">
      ${escapedText(slide.title || '기억할 것은 3가지뿐이다')}
    </h2>
    ${pointsHTML}
  </div>

  <!-- 우측: One-liner -->
  <div style="padding:${TOKENS.grid.MARGIN_V} 20pt;
    display:flex;flex-direction:column;justify-content:center;
    background:${TOKENS.colors.BG_CARD};
    border-left:1pt solid ${TOKENS.colors.GLASS_BORDER};">
    <p style="font-size:9pt;font-weight:600;
      color:${TOKENS.colors.ACCENT};letter-spacing:0.12em;text-transform:uppercase;
      font-family:${TOKENS.typography.FONT_STACK};margin-bottom:12pt;">ONE-LINER</p>
    ${oneLiner ? `<p style="font-size:12pt;color:${TOKENS.colors.TEXT_MUTED};
      font-family:${TOKENS.typography.FONT_STACK};line-height:1.65;">${oneLiner}</p>` : ''}
    ${addAccentLine('28pt', '20pt 0 0 0')}
  </div>

</body></html>`;
}

// ─── 레이아웃 9: quoteHero (풀스크린 인용/훅) ───────────────────────────────

function genQuoteHero(slide, input) {
  const quote  = escapedText(slide.quote || slide.keyword || slide.title || '');
  const source = escapedText(slide.source || slide.sectionLabel || '');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: quoteHero`,`
    body {
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      text-align:center;
      padding:48pt ${TOKENS.grid.MARGIN_H};
    }
  `)}
<body>

  ${addPageNum(slide.index)}

  <!-- 장식 따옴표 -->
  <p style="font-size:72pt;color:${TOKENS.colors.ACCENT};opacity:0.35;
    line-height:0.7;margin-bottom:18pt;font-family:Georgia,serif;">"</p>

  <p style="font-size:20pt;font-weight:600;color:${TOKENS.colors.TEXT_PRIMARY};
    font-family:${TOKENS.typography.FONT_STACK};
    line-height:1.45;max-width:520pt;margin-bottom:22pt;">
    ${quote}
  </p>

  ${addAccentLine('36pt', '0 auto 14pt')}

  ${source ? `<p style="font-size:10pt;color:${TOKENS.colors.TEXT_DIM};
    font-family:${TOKENS.typography.FONT_STACK};letter-spacing:0.05em;">${source}</p>` : ''}

</body></html>`;
}

// ─── 레이아웃 라우터 ──────────────────────────────────────────────────────────

/**
 * BPT_PREMIUM 테마 레이아웃 라우터
 * slide.layout 값을 BPT_PREMIUM 레이아웃 함수로 매핑한다.
 */
function generateSlideHTML(slide, input) {
  // role 기반 오버라이드
  if (slide.role === 'cover')   return genCoverHero(slide, input);
  if (slide.role === 'agenda')  return genTimeline(slide, input);
  if (slide.role === 'cta')     return genClosing(slide, input);
  if (slide.role === 'summary') return genSummaryGrid(slide, input);

  // layout 기반 매핑
  switch (slide.layout) {
    case 'cover_center_calm':
    case 'cover_top_aligned':   return genCoverHero(slide, input);
    case 'agenda':              return genTimeline(slide, input);
    case 'quote_keyword':       return genQuoteHero(slide, input);
    case 'data_cards':
      // 카드 2개 이하이고 비교가 필요하면 compareTwin, 아니면 metricDashboard
      return (slide.cards || []).length === 2
        ? genCompareTwin(slide, input)
        : genMetricDashboard(slide, input);
    case 'bullets_keyword':
      return genHeroLeftCardsRight(slide, input);
    case 'summary':             return genSummaryGrid(slide, input);
    default:                    return genHeroLeftCardsRight(slide, input);
  }
}

// ─── 디자인 검증기 ────────────────────────────────────────────────────────────

/**
 * BPT_PREMIUM 자동 디자인 규칙 검증
 * 슬라이드 배열을 분석해 ColorCount, Alignment, TextDensity,
 * TitleQuality, PanelCoverage, BMS 결과를 반환한다.
 */
function validateDesign(slides) {
  const results = { pass: true, violations: [], warnings: [], report: [] };

  // D1: BMS 위계 — 슬라이드별 텍스트 요소 밀도
  slides.forEach((s) => {
    const bodyCount = (s.body || []).length;
    const cardCount = (s.cards || []).length;
    const total     = bodyCount + cardCount;
    if (total > 5) {
      results.warnings.push({
        rule: 'D1-BMS',
        slide: s.index,
        message: `slide-${String(s.index).padStart(2,'0')}: 요소 ${total}개 — BMS 위계 (Big+Medium+Small ≤ 5) 초과`,
        suggestion: '카드 2개 줄이거나 슬라이드 분리',
      });
    }
  });

  // D2: TextDensity — 글머리 5개 이상 경고
  slides.forEach((s) => {
    if ((s.body || []).length > 4) {
      results.warnings.push({
        rule: 'D2-TextDensity',
        slide: s.index,
        message: `slide-${String(s.index).padStart(2,'0')}: 글머리 ${s.body.length}개 — 4개 이하 권장`,
        suggestion: '하위 항목 2개 제거 또는 별도 슬라이드로 분리',
      });
    }
  });

  // D3: TitleQuality — 제목 길이 8~26자
  slides.forEach((s) => {
    const len = (s.title || '').length;
    if (s.role !== 'cover' && (len < 4 || len > 28)) {
      results.violations.push({
        rule: 'D3-TitleQuality',
        slide: s.index,
        message: `slide-${String(s.index).padStart(2,'0')}: 제목 ${len}자 — BPT_PREMIUM 권장 8~26자 이탈`,
        suggestion: '제목을 구체적 결론형 동사 포함 문장으로 재작성',
      });
      results.pass = false;
    }
  });

  // D4: PanelCoverage — data_cards 슬라이드에 카드 없음
  slides.forEach((s) => {
    if (s.layout === 'data_cards' && !(s.cards || []).length) {
      results.warnings.push({
        rule: 'D4-PanelCoverage',
        slide: s.index,
        message: `slide-${String(s.index).padStart(2,'0')}: data_cards 레이아웃인데 cards 배열이 비어있음`,
        suggestion: 'cards 배열에 {value, label, desc} 객체 추가',
      });
    }
  });

  // D5: 표지 레이아웃 확인
  const cover = slides.find((s) => s.role === 'cover');
  if (cover && !['cover_center_calm','cover_top_aligned'].includes(cover.layout)) {
    results.warnings.push({
      rule: 'D5-CoverLayout',
      slide: cover.index,
      message: `cover 슬라이드 레이아웃 '${cover.layout}' — BPT_PREMIUM은 cover_center_calm 사용`,
      suggestion: "layout을 'cover_center_calm'으로 설정",
    });
  }

  // 리포트 생성
  const total    = violations => violations.length;
  const warnCnt  = results.warnings.length;
  const violCnt  = results.violations.length;

  results.report = [
    `# BPT_PREMIUM 디자인 검증 리포트`,
    `> 생성일: ${new Date().toISOString().slice(0,10)}`,
    '',
    `## 결과: ${results.pass ? '✅ 통과' : `❌ ${violCnt}개 위반`}${warnCnt ? ` (⚠️  ${warnCnt}개 경고)` : ''}`,
    '',
    '| 규칙 | 코드 | 상세 | 제안 |',
    '|------|------|------|------|',
    ...[...results.violations, ...results.warnings].map((v) =>
      `| ${v.rule.startsWith('D') ? (results.violations.includes(v) ? '❌' : '⚠️ ') : '✅'} | ${v.rule} | slide-${String(v.slide).padStart(2,'0')}: ${v.message.replace(/^slide-\d+: /,'')} | ${v.suggestion || '—'} |`
    ),
    '',
    '## 디자인 토큰',
    '| 항목 | 값 |',
    '|------|-----|',
    `| 배경 | ${TOKENS.colors.BG_DARK} |`,
    `| 액센트 | ${TOKENS.colors.ACCENT} |`,
    `| 텍스트 | ${TOKENS.colors.TEXT_PRIMARY} |`,
    `| 보조 텍스트 | ${TOKENS.colors.TEXT_MUTED} |`,
    `| 폰트 스택 | Paperlogy → Pretendard → Noto Sans KR |`,
    `| 커버 제목 | ${TOKENS.typography.COVER_TITLE.size} / ${TOKENS.typography.COVER_TITLE.weight} |`,
    `| 메트릭 숫자 | ${TOKENS.typography.METRIC_BIG.size} / ${TOKENS.typography.METRIC_BIG.weight} |`,
  ];

  return results;
}

// ─── 모듈 exports ─────────────────────────────────────────────────────────────

module.exports = { generateSlideHTML, validateDesign, TOKENS };
