// build_deck.js - 설득형 PPT 자동화 파이프라인 CLI 진입점
// 사용법: node scripts/build_deck.js --in samples/semis_rally.json --out out/semis_rally.pptx

'use strict';

const fs   = require('fs');
const path = require('path');

const { plan }              = require('./planner');
const { writeSlide }        = require('./slide_writer');
const { generateTitleCandidates, formatCopyReport } = require('./copywriter');
const { validate }          = require('./validator');
const { exportDeck }        = require('./exporter');

// ─── CLI 인자 파싱 ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--in')    args.input  = argv[i + 1];
    if (argv[i] === '--out')   args.output = argv[i + 1];
    if (argv[i] === '--theme') args.theme  = argv[i + 1];
    if (argv[i] === '--help')  args.help   = true;
  }
  return args;
}

function printHelp() {
  console.log(`
설득형 PPT 자동화 파이프라인
─────────────────────────────────────────────────
사용법:
  node scripts/build_deck.js --in <입력JSON> --out <출력PPTX>

예시:
  node scripts/build_deck.js --in samples/policy_youth_rent.json --out out/policy_youth_rent.pptx
  node scripts/build_deck.js --in samples/semis_rally.json       --out out/semis_rally.pptx
  node scripts/build_deck.js --in samples/policy_youth_rent.json --theme BPT_PREMIUM --out out/policy_bpt.pptx
  node scripts/build_deck.js --in samples/semis_rally.json       --theme BPT_PREMIUM --out out/semis_bpt.pptx

옵션:
  --theme BPT_PREMIUM   — BPT_PREMIUM 프리미엄 다크 테마 적용

입력 JSON 스키마:
  {
    "audience":    "누구를 설득?",
    "goal":        "끝나고 무엇을 하게?",
    "topic":       "주제",
    "one_liner":   "선택(없으면 자동 생성)",
    "key_points":  ["핵심 주장 / 근거 / 절차"],
    "evidence":    [{"type":"stat|quote|case|rule","text":"...","source":"..."}],
    "cta":         ["다음 행동 3개"],
    "copy_bank":   [{"text":"...","tone":"선언","structure":"원칙형","use":"표지"}],
    "constraints": {"slide_count":10, "title_len":"16~22", "no_paragraph":true},
    "assets":      {"logo":"...", "cover_bg":"..."}
  }

산출물:
  - [출력].pptx           — PPTX 파일
  - [출력]-storyboard.md  — 제목만 읽는 스토리보드
  - [출력]-validation.md  — 검증 리포트 + 레드팀 분석
  `);
}

// ─── 파이프라인 ───────────────────────────────────────────────────────────────

async function run() {
  const args = parseArgs(process.argv);

  if (args.help || !args.input || !args.output) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  // 1. 입력 로드
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ 입력 파일 없음: ${inputPath}`);
    process.exit(1);
  }

  let input;
  try {
    input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch (e) {
    console.error(`❌ JSON 파싱 실패: ${e.message}`);
    process.exit(1);
  }

  const outputPath = path.resolve(args.output);
  const topicLabel = input.topic || path.basename(args.input, '.json');
  const theme      = args.theme || null;

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎯 주제: ${topicLabel}`);
  console.log(`👥 청중: ${input.audience || '(미지정)'}`);
  console.log(`🎯 목표: ${input.goal || '(미지정)'}`);
  if (theme) console.log(`🎨 테마: ${theme}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // 2. Planner — 설득 흐름 선택 + one_liner 강제 생성 (Rule 0)
  console.log(`[1/5] 📐 Planner: 설득 흐름 선택...`);
  const deckPlan = plan(input);
  console.log(`  흐름: ${deckPlan.flowName} (${deckPlan.slides.length}장)`);
  console.log(`  One-liner: "${deckPlan.oneLiner}"\n`);

  // 3. Slide Writer — 슬라이드별 콘텐츠 생성 (Rule 1, Rule 6)
  console.log(`[2/5] ✍️  Slide Writer: 슬라이드 콘텐츠 생성...`);
  deckPlan.slides = deckPlan.slides.map((slide) =>
    writeSlide(slide, { ...input, one_liner: deckPlan.oneLiner }, deckPlan)
  );
  console.log(`  ${deckPlan.slides.length}장 슬라이드 작성 완료\n`);

  // 4. Copywriter — 제목 후보 + 소유권 검증 (Rule 2, 3, 4)
  console.log(`[3/5] ✒️  Copywriter: 제목 후보 생성 (소유권 검증)...`);
  const copyReportLines = [];
  const copyBank = input.copy_bank || [];
  const specificTerms = [
    ...(input.topic || '').split(/\s+/),
    ...(input.key_points || []).flatMap((k) => k.split(/[\s:\-]/)).filter((w) => w.length > 2),
  ];

  for (const slide of deckPlan.slides) {
    if (['cover', 'agenda', 'summary'].includes(slide.role)) continue;

    const ctx = {
      role:         slide.role,
      purpose:      slide.purpose,
      keyword:      slide.keyword || slide.sectionLabel || '',
      topic:        input.topic,
      specificTerms,
      evidence:     slide.evidence || null,
    };

    const { recommended } = generateTitleCandidates(ctx, copyBank);
    // 소유권 강한 추천 제목이 있으면 현재 제목과 비교
    if (recommended.length > 0 && recommended[0].ownership.score > 0.7) {
      // 현재 제목의 소유권이 약하면 추천 제목으로 교체
      const currentScore = recommended.find((r) => r.text === slide.title)?.ownership.score ?? 0.3;
      if (currentScore < 0.5 && recommended[0].ownership.score >= 0.7) {
        slide.titleCandidates = recommended.map((r) => r.text);
      }
    }

    copyReportLines.push(formatCopyReport(slide.index, ctx, copyBank));
  }

  // 카피 리포트 파일로 저장
  const copyReportPath = outputPath.replace('.pptx', '-copy-report.md');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(copyReportPath,
    `# 카피 리포트 — ${topicLabel}\n\n` + copyReportLines.join('\n'),
    'utf8'
  );
  console.log(`  카피 리포트: ${copyReportPath}\n`);

  // 5. Validator — 전체 규칙 검증 (Rule 0~6)
  console.log(`[4/5] 🔍 Validator: 규칙 검증...`);
  const validation = validate(deckPlan, input);
  console.log(`  ${validation.summary.message}`);

  if (!validation.summary.pass) {
    console.log(`\n  위반 상세:`);
    const allResults = [
      validation.R0_oneLiner,
      ...validation.R1_titleOnly,
      ...validation.R2_ownership,
      ...validation.R4_titleLength,
      validation.R5_cover,
      ...validation.R6_noParagraph,
    ];
    allResults.filter((r) => !r.pass).forEach((r) => {
      console.log(`    ${r.message}`);
      if (r.suggestion) console.log(`    → ${r.suggestion}`);
    });
    console.log('');
  }

  // 6. Exporter — HTML + PPTX + 리포트 (Rule 5 디자인 강제)
  const themeLabel = theme ? ` [${theme}]` : '';
  console.log(`[5/5] 🖨️  Exporter: HTML 생성${themeLabel} → PPTX 변환...`);
  let result;
  try {
    result = await exportDeck(deckPlan, input, validation, outputPath, theme);
  } catch (err) {
    console.error(`\n❌ Export 실패: ${err.message}`);
    process.exit(1);
  }

  // 결과 출력
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ 완료!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n📦 산출물:`);
  console.log(`  PPTX:           ${result.pptxPath}`);
  console.log(`  HTML 슬라이드:  ${result.htmlDir}/`);
  console.log(`  스토리보드:     ${result.storyboardPath}`);
  console.log(`  검증 리포트:    ${result.validationPath}`);
  console.log(`  카피 리포트:    ${copyReportPath}`);
  if (result.designValidPath) {
    console.log(`  디자인 검증:    ${result.designValidPath}`);
  }
  console.log(`\n🔎 검증 결과: ${validation.summary.message}`);

  if (validation.summary.totalWarnings > 0) {
    console.log(`⚠️  경고 ${validation.summary.totalWarnings}건 — 검증 리포트 확인 권장`);
  }

  console.log('');
}

run().catch((err) => {
  console.error(`\n💥 Fatal: ${err.message}`);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
