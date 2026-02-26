/**
 * run.cjs - 이커머스 트렌드 & 수익화 전략 PPT HTML 슬라이드 → PPTX 변환 runner
 * 실행: node .claude/skills/pptx-skill/scripts/run.cjs
 * (output/ 디렉토리에서 실행 OR outputDir 변수 수정)
 */

const html2pptx = require('./html2pptx.cjs');
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

async function main() {
  const outputDir = path.resolve(__dirname, '../../../../output');
  const slidesDir = path.join(outputDir, 'slides');
  const outputFile = path.join(outputDir, '이커머스_수익화전략.pptx');

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

    // ── media-patch.py 호출 (cover 슬라이드 video+audio 임베딩) ──
    const specPath = path.join(outputDir, 'slides-spec.md');
    const mediaPatchScript = path.resolve(__dirname, 'media-patch.py');
    if (fs.existsSync(specPath) && fs.existsSync(mediaPatchScript)) {
      const pythonCmds = ['python', 'python3'];
      let patched = false;
      for (const cmd of pythonCmds) {
        const result = spawnSync(cmd, [mediaPatchScript, outputFile, specPath], {
          stdio: 'inherit',
          encoding: 'utf-8',
        });
        if (result.status === 0) { patched = true; break; }
        if (result.error && result.error.code === 'ENOENT') continue; // 명령어 없음
        console.warn(`⚠️  media-patch 실패 (${cmd}): exit ${result.status}. PPTX는 미디어 없이 저장됨.`);
        break;
      }
      if (!patched && pythonCmds.every(c => {
        const r = spawnSync(c, ['--version'], { stdio: 'ignore' });
        return r.error && r.error.code === 'ENOENT';
      })) {
        console.warn('⚠️  python/python3 미설치. media-patch 스킵. PPTX는 미디어 없이 저장됨.');
      }
    }
  } else {
    console.log('\n⛔ 변환된 슬라이드가 없어 파일을 저장하지 않았습니다.\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
