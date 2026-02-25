/**
 * run.cjs - 반도체 빅3 PPT HTML 슬라이드 → PPTX 변환 runner
 * 실행: node .claude/skills/pptx-skill/scripts/run.cjs
 * (output/ 디렉토리에서 실행 OR outputDir 변수 수정)
 */

const html2pptx = require('./html2pptx.cjs');
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function main() {
  const outputDir = path.resolve(__dirname, '../../../../output');
  const slidesDir = path.join(outputDir, 'slides');
  const outputFile = path.join(outputDir, '반도체빅3_메모리시장.pptx');

  // 슬라이드 파일 목록
  const slideFiles = [];
  for (let i = 1; i <= 12; i++) {
    const num = String(i).padStart(2, '0');
    const file = path.join(slidesDir, `slide-${num}.html`);
    if (fs.existsSync(file)) {
      slideFiles.push(file);
    } else {
      console.warn(`⚠️  slide-${num}.html 없음, 건너뜀`);
    }
  }

  console.log(`\n🎬 변환 시작: ${slideFiles.length}장 슬라이드`);
  console.log(`📁 슬라이드 경로: ${slidesDir}`);
  console.log(`💾 저장 경로: ${outputFile}\n`);

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 720pt × 405pt = 10" × 5.625"

  let successCount = 0;
  let errorCount = 0;

  for (const slideFile of slideFiles) {
    const name = path.basename(slideFile);
    try {
      process.stdout.write(`  처리 중: ${name} ... `);
      await html2pptx(slideFile, pres);
      console.log('✅');
      successCount++;
    } catch (err) {
      console.log(`❌\n    오류: ${err.message}\n`);
      errorCount++;
    }
  }

  console.log(`\n📊 결과: 성공 ${successCount}장 / 실패 ${errorCount}장`);

  if (successCount > 0) {
    await pres.writeFile({ fileName: outputFile });
    console.log(`\n✨ PPTX 저장 완료: ${outputFile}\n`);
  } else {
    console.log('\n⛔ 변환된 슬라이드가 없어 파일을 저장하지 않았습니다.\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
