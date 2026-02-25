// 빌더조쉬 PPT 변환 스크립트
const html2pptx = require('../.claude/skills/pptx-skill/scripts/html2pptx.cjs');
const PptxGenJS = require('pptxgenjs');
const path = require('path');

async function main() {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9'; // 10" × 5.625" = 720pt × 405pt

  const slidesDir = path.join(__dirname, 'slides');
  const outputPath = path.join(__dirname, '빌더조쉬.pptx');

  const slideFiles = [
    'slide-01.html', 'slide-02.html', 'slide-03.html', 'slide-04.html',
    'slide-05.html', 'slide-06.html', 'slide-07.html', 'slide-08.html',
    'slide-09.html', 'slide-10.html', 'slide-11.html', 'slide-12.html'
  ];

  for (const file of slideFiles) {
    const filePath = path.join(slidesDir, file);
    console.log(`변환 중: ${file}`);
    try {
      await html2pptx(filePath, pres);
      console.log(`  ✓ ${file} 완료`);
    } catch (err) {
      console.error(`  ✗ ${file} 오류:`, err.message);
    }
  }

  await pres.writeFile({ fileName: outputPath });
  console.log(`\n✅ PPTX 저장 완료: ${outputPath}`);
}

main().catch(console.error);
