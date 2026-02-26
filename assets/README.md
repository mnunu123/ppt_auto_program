# assets/

이 폴더에 MP4 파일을 넣으면 `build_deck.js` 실행 시
PPTX의 **첫 번째 슬라이드(커버)** 에 동영상이 자동으로 임베딩됩니다.

## 사용법

```bash
# 1. Remotion으로 영상 렌더
cd ../remotion-intro-video
npm run build          # → out/video.mp4

# 2. assets/ 에 복사
copy out\video.mp4 ..\ppt_team_agent-main\assets\intro.mp4

# 3. PPT 빌드 (자동으로 커버에 영상 삽입됨)
cd ../ppt_team_agent-main
node scripts/build_deck.js --in samples/semis_rally.json --out out/semis_rally.pptx
```

## 규칙

- `.mp4` 파일만 지원 (알파벳 순서 첫 번째 파일이 사용됨)
- `intro.mp4` 또는 `video.mp4` 이름 권장
- 파일이 없으면 동영상 없이 정상 생성됨 (오류 아님)
- Python 3이 설치되어 있어야 동영상 임베딩이 작동함
