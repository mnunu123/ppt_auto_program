// exporter.js - HTML 슬라이드 생성 + PPTX 변환 + 스토리보드/검증 리포트 출력

'use strict';

const fs            = require('fs');
const path          = require('path');
const { spawnSync } = require('child_process');

// ─── 디자인 상수 ─────────────────────────────────────────────────────────────

const COLORS = {
  bg:       '#0f0f0f',
  bg2:      '#1a1a1a',
  accent:   '#3b82f6',
  text:     '#ffffff',
  muted:    '#b0b0b0',
  dim:      '#888888',
  dimmer:   '#555555',
};

const FONT_CDN = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css';

const BASE_STYLE = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 720pt; height: 405pt;
      font-family: 'Pretendard', sans-serif;
      background: ${COLORS.bg};
      overflow: hidden;
    }
    .section-label {
      font-size: 10pt; color: ${COLORS.accent}; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8pt;
    }
    .slide-title {
      font-size: 22pt; font-weight: 700; color: ${COLORS.text};
      letter-spacing: -0.01em; margin-bottom: 20pt; line-height: 1.25;
    }
    .slide-title-lg {
      font-size: 28pt; font-weight: 800; color: ${COLORS.text};
      letter-spacing: -0.02em; margin-bottom: 16pt; line-height: 1.2;
    }
`;

// ─── HTML 조각 헬퍼 ──────────────────────────────────────────────────────────

function htmlHead(title, extraStyle = '') {
  return `<!DOCTYPE html>
<!-- ${title} -->
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="${FONT_CDN}">
  <style>${BASE_STYLE}${extraStyle}
  </style>
</head>`;
}

function escapedText(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── 레이아웃별 HTML 생성 ────────────────────────────────────────────────────

function genCoverCenterCalm(slide, input) {
  const title    = escapedText(slide.title || input.topic || '제목');
  const subtitle = escapedText(slide.subtitle || slide.sectionLabel || '');
  const label    = escapedText(slide.sectionLabel || '');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: 표지 — cover_center_calm`, `
    body {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; padding: 48pt;
      background: #0b0e1e;
    }
  `)}
<body>
  <p style="font-size:10pt;color:${COLORS.accent};font-weight:600;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:20pt;">${label}</p>
  <h1 style="font-size:36pt;font-weight:800;color:${COLORS.text};letter-spacing:-0.02em;line-height:1.2;margin-bottom:20pt;max-width:600pt;">${title}</h1>
  <div style="width:48pt;height:2pt;background:${COLORS.accent};margin-bottom:20pt;"></div>
  <p style="font-size:13pt;color:${COLORS.muted};font-weight:400;max-width:480pt;line-height:1.5;">${subtitle}</p>
</body>
</html>`;
}

function genAgenda(slide) {
  const items = (slide.agendaItems || []).slice(0, 4);
  const cols  = items.length <= 2 ? '1fr 1fr' : '1fr 1fr';
  const itemsHTML = items.map((it) => `
    <div class="agenda-item">
      <p class="agenda-num">${escapedText(it.num)}</p>
      <div>
        <p class="agenda-title">${escapedText(it.title)}</p>
        <p class="agenda-desc">${escapedText(it.desc)}</p>
      </div>
    </div>`).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: 목차 — agenda`, `
    body { padding: 40pt 44pt 36pt; }
    .agenda-grid {
      display: grid; grid-template-columns: ${cols}; gap: 10pt;
    }
    .agenda-item {
      background: ${COLORS.bg2}; border-left: 3pt solid ${COLORS.accent};
      border-radius: 4pt; padding: 14pt 16pt;
      display: flex; align-items: flex-start; gap: 12pt;
    }
    .agenda-num  { font-size:20pt;font-weight:800;color:${COLORS.accent};line-height:1;flex-shrink:0; }
    .agenda-title{ font-size:12pt;font-weight:700;color:${COLORS.text};margin-bottom:3pt; }
    .agenda-desc { font-size:9.5pt;font-weight:400;color:${COLORS.dim}; }
  `)}
<body>
  <p class="section-label">${escapedText(slide.sectionLabel || '목차')}</p>
  <p class="slide-title">${escapedText(slide.title || '오늘의 흐름')}</p>
  <div class="agenda-grid">${itemsHTML}</div>
</body>
</html>`;
}

function genBulletsKeyword(slide) {
  const keyword = escapedText(slide.keyword || '');
  const body    = (slide.body || []).filter(Boolean).slice(0, 5);
  const bulletsHTML = body.map((b) =>
    `<li>${escapedText(b)}</li>`).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: ${slide.role} — bullets_keyword`, `
    body {
      display: grid; grid-template-columns: 180pt 1fr;
      padding: 0; gap: 0;
    }
    .left-panel {
      background: ${COLORS.bg2}; padding: 36pt 24pt;
      display: flex; flex-direction: column; justify-content: center;
      border-right: 1pt solid #252525;
    }
    .right-panel { padding: 36pt 36pt; display: flex; flex-direction: column; justify-content: center; }
    .keyword { font-size:24pt;font-weight:800;color:${COLORS.accent};line-height:1.1;margin-bottom:8pt; }
    ul { list-style: none; padding: 0; }
    li { display:flex;align-items:flex-start;gap:10pt;margin-bottom:10pt;font-size:13pt;color:${COLORS.muted};line-height:1.45; }
    li::before { content:""; display:block;width:5pt;height:5pt;background:${COLORS.accent};border-radius:50%;flex-shrink:0;margin-top:5pt; }
  `)}
<body>
  <div class="left-panel">
    <p class="section-label">${escapedText(slide.sectionLabel || '')}</p>
    <p class="keyword">${keyword}</p>
  </div>
  <div class="right-panel">
    <p class="slide-title">${escapedText(slide.title || '')}</p>
    <ul>${bulletsHTML}</ul>
  </div>
</body>
</html>`;
}

function genDataCards(slide) {
  const cards = (slide.cards || []).slice(0, 4);
  const cols  = cards.length <= 2 ? '1fr 1fr' : `repeat(${Math.min(cards.length, 4)}, 1fr)`;
  const cardsHTML = cards.map((c) => `
    <div class="card">
      <p class="card-value">${escapedText(c.value || '—')}</p>
      <p class="card-label">${escapedText(c.label || '')}</p>
      <p class="card-desc">${escapedText(c.desc || '')}</p>
    </div>`).join('');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: ${slide.role} — data_cards`, `
    body { padding: 36pt 44pt 32pt; }
    .cards-grid { display:grid; grid-template-columns:${cols}; gap:10pt; margin-bottom:14pt; }
    .card { background:${COLORS.bg2}; border-radius:6pt; padding:16pt 14pt; border-top:2pt solid ${COLORS.accent}; }
    .card-value { font-size:22pt;font-weight:800;color:${COLORS.accent};line-height:1.1;margin-bottom:6pt; }
    .card-label { font-size:11pt;font-weight:700;color:${COLORS.text};margin-bottom:4pt; }
    .card-desc  { font-size:9pt;color:${COLORS.dim};font-weight:400; }
  `)}
<body>
  <p class="section-label">${escapedText(slide.sectionLabel || '')}</p>
  <p class="slide-title">${escapedText(slide.title || '')}</p>
  <div class="cards-grid">${cardsHTML}</div>
</body>
</html>`;
}

function genQuoteKeyword(slide) {
  const quote  = escapedText(slide.quote || slide.keyword || slide.title || '');
  const source = escapedText(slide.source || '');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: ${slide.role} — quote_keyword`, `
    body {
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      padding:48pt; text-align:center; background:#0b0e1e;
    }
    .quote-mark { font-size:64pt;color:${COLORS.accent};line-height:0.6;margin-bottom:16pt;font-family:serif; }
    .quote-text { font-size:18pt;font-weight:600;color:${COLORS.text};line-height:1.5;max-width:560pt;margin-bottom:20pt; }
    .source     { font-size:10pt;color:${COLORS.dim}; }
  `)}
<body>
  <p class="quote-mark">"</p>
  <p class="quote-text">${quote}</p>
  <p class="section-label">${escapedText(slide.sectionLabel || '')}</p>
  ${source ? `<p class="source">${source}</p>` : ''}
</body>
</html>`;
}

function genSummary(slide) {
  const bullets = (slide.body || slide.keyPoints || []).slice(0, 3);
  const bulletsHTML = bullets.map((b) =>
    `<li>${escapedText(b)}</li>`).join('');
  const oneLiner = escapedText(slide.oneLiner || '');

  return `${htmlHead(`slide-${String(slide.index).padStart(2,'0')}: 요약 — summary`, `
    body { padding: 40pt 44pt; background: #0b0e1e; }
    .summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:24pt; margin-top:8pt; }
    .left ul { list-style:none;padding:0; }
    .left li { display:flex;align-items:flex-start;gap:10pt;margin-bottom:12pt;font-size:13pt;color:${COLORS.muted};line-height:1.4; }
    .left li::before { content:"";display:block;width:5pt;height:5pt;background:${COLORS.accent};border-radius:50%;flex-shrink:0;margin-top:5pt; }
    .right { background:${COLORS.bg2};border-radius:8pt;padding:24pt;display:flex;flex-direction:column;justify-content:center; }
    .one-liner { font-size:13pt;font-weight:600;color:${COLORS.text};line-height:1.6; }
    .one-liner-label { font-size:9pt;color:${COLORS.accent};font-weight:600;letter-spacing:0.1em;margin-bottom:8pt; }
  `)}
<body>
  <p class="section-label">${escapedText(slide.sectionLabel || '핵심 정리')}</p>
  <p class="slide-title">${escapedText(slide.title || '기억할 것은 3가지뿐이다')}</p>
  <div class="summary-grid">
    <div class="left"><ul>${bulletsHTML}</ul></div>
    <div class="right">
      <p class="one-liner-label">ONE-LINER</p>
      <p class="one-liner">${oneLiner}</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── 라우터: layout → HTML 생성 함수 ────────────────────────────────────────

function generateSlideHTML(slide, input, theme) {
  if (theme === 'BPT_PREMIUM') {
    const bpt = require('./themes/bpt_premium');
    return bpt.generateSlideHTML(slide, input);
  }
  switch (slide.layout) {
    case 'cover_center_calm':
    case 'cover_top_aligned':  return genCoverCenterCalm(slide, input);
    case 'agenda':             return genAgenda(slide);
    case 'bullets_keyword':    return genBulletsKeyword(slide);
    case 'data_cards':         return genDataCards(slide);
    case 'quote_keyword':      return genQuoteKeyword(slide);
    case 'summary':            return genSummary(slide);
    default:                   return genBulletsKeyword(slide); // 폴백
  }
}

// ─── 스토리보드 MD 생성 ──────────────────────────────────────────────────────

function generateStoryboard(plan, input) {
  const lines = [
    `# 스토리보드 — ${input.topic}`,
    `> 청중: ${input.audience || '—'} | 목표: ${input.goal || '—'} | 흐름: ${plan.flowName}`,
    `> 생성일: ${new Date().toISOString().slice(0, 10)}`,
    '',
    `## One-liner`,
    `> **${plan.oneLiner}**`,
    '',
    `## 제목만 읽는 스토리 (Title-only Test)`,
    '',
    '| # | 제목 | 레이아웃 | 목적 |',
    '|---|------|--------|------|',
    ...plan.slides.map((s) =>
      `| ${String(s.index).padStart(2,'0')} | ${s.title || '(미정)'} | ${s.layout} | ${s.purpose} |`
    ),
    '',
    '---',
    '',
    '## 슬라이드별 상세',
    '',
    ...plan.slides.map((s) => [
      `### Slide ${String(s.index).padStart(2,'0')}: ${s.title || s.purpose}`,
      `- **레이아웃**: ${s.layout}`,
      `- **섹션 레이블**: ${s.sectionLabel || ''}`,
      s.body?.length ? `- **본문**:\n${s.body.map((b) => `  - ${b}`).join('\n')}` : '',
      s.cards?.length ? `- **카드**: ${s.cards.map((c) => `${c.value} ${c.label}`).join(' / ')}` : '',
      s.agendaItems?.length ? `- **목차**: ${s.agendaItems.map((a) => a.title).join(' → ')}` : '',
      '',
    ].filter(Boolean).join('\n')),
  ];

  return lines.join('\n');
}

// ─── 검증 리포트 MD 생성 ─────────────────────────────────────────────────────

function generateValidationReport(validation, plan, input) {
  const { summary, R0_oneLiner, R1_titleOnly, R2_ownership, R4_titleLength,
          R5_cover, R6_noParagraph, redTeam, postMortem } = validation;

  const lines = [
    `# 검증 리포트 — ${input.topic}`,
    `> 생성일: ${new Date().toISOString().slice(0, 10)}`,
    '',
    `## 결과: ${summary.message}`,
    '',
    '---',
    '',
    '## R0 — Deck One-liner',
    R0_oneLiner.message,
    R0_oneLiner.suggestion ? `> 수정안: ${R0_oneLiner.suggestion}` : '',
    '',
    '## R1 — 제목=결론 (Title-only + 어쩌라고 테스트)',
    ...R1_titleOnly.map((r) => [r.message, r.suggestion ? `  > 수정안: ${r.suggestion}` : ''].filter(Boolean).join('\n')),
    '',
    '## R2 — 소유권 테스트',
    ...R2_ownership.map((r) => [r.message, r.suggestion ? `  > 수정안: ${r.suggestion}` : ''].filter(Boolean).join('\n')),
    '',
    '## R4 — 제목 길이 (16~22자 권장)',
    ...R4_titleLength.map((r) => [r.message, r.suggestion ? `  > 수정안: ${r.suggestion}` : ''].filter(Boolean).join('\n')),
    '',
    '## R5 — 표지 테스트',
    R5_cover.message,
    ...(R5_cover.checks ? Object.values(R5_cover.checks).map((v) => `  - ${v}`) : []),
    R5_cover.suggestion ? `> 수정안: ${R5_cover.suggestion}` : '',
    '',
    '## R6 — 줄글 금지',
    ...R6_noParagraph.map((r) => [
      r.message,
      ...(r.violations || []).map((v) => `  > "${v.text}" ${v.suggestion}`),
    ].join('\n')),
    '',
    '---',
    '',
    '## 레드팀 리포트',
    '',
    '### 깨지기 쉬운 가정',
    '| 가정 | 테스트 | 리스크 | 완화 방법 |',
    '|------|--------|--------|----------|',
    ...redTeam.assumptions.map((a) =>
      `| ${a.assumption} | ${a.test} | **${a.risk}** | ${a.mitigation} |`
    ),
    '',
    '### 실패 신호',
    '| 신호 | 확률 | 예방책 |',
    '|------|------|--------|',
    ...redTeam.failSignals.map((f) =>
      `| ${f.signal} | **${f.probability}** | ${f.prevention} |`
    ),
    '',
    '### 리스크-대응표',
    '| 리스크 | 트리거 | 대응 |',
    '|--------|--------|------|',
    ...redTeam.riskTable.map((r) =>
      `| ${r.risk} | ${r.trigger} | ${r.response} |`
    ),
    '',
    '---',
    '',
    '## Rule 7 — 발표 후 자아비판 루프',
    postMortem.instruction,
    '',
    ...postMortem.steps,
    '',
    '| 슬라이드 | 현재 제목 | 레이아웃 | 개선 여부 |',
    '|---------|---------|--------|---------|',
    ...postMortem.targetSlides.map((s) =>
      `| ${String(s.index).padStart(2,'0')} | ${s.title} | ${s.layout} | ☐ |`
    ),
    '',
    `> ${postMortem.note}`,
  ];

  return lines.filter((l) => l !== undefined).join('\n');
}

// ─── cover 슬라이드 동영상 자동 임베딩 ──────────────────────────────────────
// assets/ 폴더에 MP4 파일이 있으면 PPTX 첫 슬라이드에 자동으로 삽입한다.
// Remotion 렌더 결과를 assets/에 복사(또는 심볼릭 링크)하는 것만으로 동작.

const ASSETS_DIR      = path.resolve(__dirname, '../assets');
const MEDIA_PATCH_PY  = path.resolve(
  __dirname, '../.claude/skills/pptx-skill/scripts/media-patch.py'
);

/**
 * assets/ 폴더를 스캔해 첫 번째 MP4를 PPTX 커버 슬라이드에 임베딩한다.
 * Python(media-patch.py --video) 경로로 처리.
 * @returns {string|null} 임베딩된 영상 경로, 없거나 실패하면 null
 */
function embedVideoInCover(pptxPath) {
  // 1. assets/ 존재 여부
  if (!fs.existsSync(ASSETS_DIR)) return null;

  // 2. MP4 파일 스캔 (알파벳순, 첫 번째 사용)
  const mp4s = fs.readdirSync(ASSETS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .sort();
  if (mp4s.length === 0) return null;

  const videoPath = path.join(ASSETS_DIR, mp4s[0]);
  console.log(`\n🎬 커버 동영상 감지: ${mp4s[0]}`);

  // 3. media-patch.py 존재 확인
  if (!fs.existsSync(MEDIA_PATCH_PY)) {
    console.warn('⚠️  media-patch.py 없음. 영상 임베딩 스킵.');
    return null;
  }

  // 4. python / python3 중 사용 가능한 것으로 호출
  for (const cmd of ['python', 'python3']) {
    const result = spawnSync(
      cmd,
      [MEDIA_PATCH_PY, pptxPath, '--video', videoPath],
      { stdio: 'inherit', encoding: 'utf-8' }
    );
    if (result.status === 0) return videoPath;
    if (result.error?.code === 'ENOENT') continue; // 명령어 없음 → 다음 시도
    console.warn(`⚠️  영상 임베딩 실패 (${cmd}): exit ${result.status}`);
    return null;
  }

  console.warn('⚠️  python/python3 미설치. 영상 임베딩 스킵.');
  return null;
}

// ─── PPTX 변환 ───────────────────────────────────────────────────────────────

async function convertToPPTX(htmlDir, outputPptxPath) {
  const html2pptx = require('../.claude/skills/pptx-skill/scripts/html2pptx.cjs');
  const pptxgen   = require('pptxgenjs');

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  const files = fs.readdirSync(htmlDir)
    .filter((f) => f.endsWith('.html'))
    .sort();

  let ok = 0, fail = 0;
  for (const file of files) {
    const filePath = path.join(htmlDir, file);
    try {
      process.stdout.write(`  ${file} ... `);
      await html2pptx(filePath, pres);
      console.log('✅');
      ok++;
    } catch (err) {
      console.log(`❌  ${err.message.split('\n')[0]}`);
      fail++;
    }
  }

  if (ok > 0) {
    await pres.writeFile({ fileName: outputPptxPath });
    console.log(`\n💾 PPTX 저장: ${outputPptxPath} (${ok}장 성공, ${fail}장 실패)`);
  } else {
    throw new Error('변환된 슬라이드가 없어 PPTX를 저장하지 않았습니다.');
  }
}

// ─── 메인 export 함수 ────────────────────────────────────────────────────────

async function exportDeck(plan, input, validation, outputPptxPath, theme) {
  const outDir    = path.dirname(outputPptxPath);
  const baseName  = path.basename(outputPptxPath, '.pptx');
  const htmlDir   = path.join(outDir, `${baseName}_html`);
  const storyPath = path.join(outDir, `${baseName}-storyboard.md`);
  const validPath = path.join(outDir, `${baseName}-validation.md`);

  fs.mkdirSync(htmlDir, { recursive: true });
  fs.mkdirSync(outDir,  { recursive: true });

  // 1. HTML 생성
  const themeLabel = theme ? ` [${theme}]` : '';
  console.log(`\n📄 HTML 슬라이드 생성${themeLabel} (${plan.slides.length}장)...`);
  for (const slide of plan.slides) {
    const html     = generateSlideHTML(slide, input, theme);
    const fileName = `slide-${String(slide.index).padStart(2, '0')}.html`;
    fs.writeFileSync(path.join(htmlDir, fileName), html, 'utf8');
  }

  // 2. PPTX 변환
  console.log(`\n🎬 PPTX 변환...`);
  await convertToPPTX(htmlDir, outputPptxPath);

  // 2-1. assets/ 동영상 → 커버 슬라이드 자동 임베딩
  const embeddedVideo = embedVideoInCover(outputPptxPath);

  // 3. 스토리보드 MD
  const storyboard = generateStoryboard(plan, input);
  fs.writeFileSync(storyPath, storyboard, 'utf8');
  console.log(`📋 스토리보드: ${storyPath}`);

  // 4. 검증 리포트 MD
  const report = generateValidationReport(validation, plan, input);
  fs.writeFileSync(validPath, report, 'utf8');
  console.log(`📊 검증 리포트: ${validPath}`);

  // 5. BPT_PREMIUM 디자인 검증 리포트
  let designValidPath = null;
  if (theme === 'BPT_PREMIUM') {
    const bpt = require('./themes/bpt_premium');
    const designResult = bpt.validateDesign(plan.slides);
    designValidPath = path.join(outDir, `${baseName}-design-validation.md`);
    fs.writeFileSync(designValidPath, designResult.report.join('\n'), 'utf8');
    const dStatus = designResult.pass ? '✅ 통과' : `❌ ${designResult.violations.length}건 위반`;
    console.log(`🎨 디자인 검증${themeLabel}: ${dStatus} → ${designValidPath}`);
  }

  return {
    pptxPath:          outputPptxPath,
    htmlDir,
    storyboardPath:    storyPath,
    validationPath:    validPath,
    designValidPath,
    embeddedVideo,
  };
}

module.exports = { exportDeck, generateSlideHTML, generateStoryboard, generateValidationReport };
