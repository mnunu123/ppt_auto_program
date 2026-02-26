// validator.js - 설득 PPT 규칙 자동 검증 + 수정 제안 (Rule 0~6 전체 강제)

'use strict';

// ─── Rule 0: Deck One-liner ───────────────────────────────────────────────────

/** Rule 0: one_liner가 10초 안에 말할 수 있는 길이인지 검증 */
function validateOneLiner(oneLiner) {
  if (!oneLiner || !oneLiner.trim()) {
    return {
      rule: 'R0',
      pass: false,
      message: '❌ R0 — one_liner 없음. 반드시 1문장 생성 필요.',
      suggestion: '"우리는 [청중의 문제]를 [방식]으로 해결해 [결과]를 만들겠습니다." 형식 사용',
    };
  }

  const charCount = oneLiner.trim().length;
  const canSay10s = charCount <= 60; // 10초 ≈ 60자(한글)

  return {
    rule: 'R0',
    pass: canSay10s,
    message: canSay10s
      ? `✅ R0 — one_liner 통과 (${charCount}자, 10초 이내)`
      : `❌ R0 — one_liner 너무 김 (${charCount}자 → 60자 이내로 단축)`,
    suggestion: canSay10s
      ? null
      : `단축 예시: "${oneLiner.slice(0, 55)}…"`,
  };
}

// ─── Rule 1: 제목 = 결론 (Title-only 테스트 + 어쩌라고 테스트) ──────────────

const TOPIC_TITLES = /^(소개|개요|목차|현황|배경|결론|정리|요약|분석|계획|전략)$/;
const GENERIC_TITLES = ['현황', '소개', '개요', '목차', '배경', '결론', '정리', '요약'];

function validateTitleOnly(slides) {
  return slides
    .filter((s) => s.role !== 'agenda') // 목차 슬라이드는 제외
    .map((slide) => {
      const title = (slide.title || '').trim();

      if (!title) {
        return {
          rule: 'R1', slide: slide.index, pass: false,
          message: `❌ R1 slide-${slide.index}: 제목 없음`,
          suggestion: '결론형 제목 필수',
        };
      }

      // 어쩌라고 테스트: 주제형 단어만 있으면 실패
      const isTopicTitle = TOPIC_TITLES.test(title) ||
        GENERIC_TITLES.some((w) => title === w);

      // 결론형 동사 포함 여부
      const hasConclusionVerb = /이다$|한다$|됐다$|하라$|만든다$|바뀐다$|말한다$|잃는다$|증명한다$/.test(title);

      const pass = !isTopicTitle && (hasConclusionVerb || title.length >= 10);

      return {
        rule: 'R1', slide: slide.index, title, pass,
        message: isTopicTitle
          ? `❌ R1 slide-${slide.index}: "${title}" — 주제형 제목 (어쩌라고 테스트 실패)`
          : !hasConclusionVerb && title.length < 10
            ? `⚠️  R1 slide-${slide.index}: "${title}" — 결론형 동사 없음 (약한 제목)`
            : `✅ R1 slide-${slide.index}: "${title}"`,
        suggestion: isTopicTitle
          ? `"${title}" → 결론형으로 변환. 예: "${title}이 이것을 바꾼다"`
          : null,
      };
    });
}

// ─── Rule 2: 소유권 테스트 ───────────────────────────────────────────────────

const GENERIC_OWNERSHIP = ['성장', '혁신', '도전', '미래', '글로벌', '신뢰', '함께', '새로운', '최고'];

function validateOwnership(slides, topic) {
  return slides
    .filter((s) => !['cover', 'agenda', 'summary'].includes(s.role))
    .map((slide) => {
      const title = (slide.title || '').trim();
      if (!title) return { rule: 'R2', slide: slide.index, pass: false, message: '제목 없음' };

      const genericCount  = GENERIC_OWNERSHIP.filter((t) => title.includes(t)).length;
      const hasConcrete   = /[0-9%배만억원달러]/.test(title) || /이다$|한다$|하라$|됐다$/.test(title);
      const hasTopicWord  = topic && title.includes(topic.split(' ')[0]);

      const pass = genericCount <= 1 && hasConcrete;

      return {
        rule: 'R2', slide: slide.index, title, pass,
        message: pass
          ? `✅ R2 slide-${slide.index}: 소유권 통과`
          : `❌ R2 slide-${slide.index}: "${title}" — 다른 조직도 쓸 수 있는 문장`,
        checks: { genericCount, hasConcrete, hasTopicWord },
        suggestion: !pass
          ? '원칙/수치/고유 행동을 추가해 구체화. 예: 수치 삽입 또는 "우리만의 기준" 명시'
          : null,
      };
    });
}

// ─── Rule 4: 제목 길이 (16~22자 권장) ────────────────────────────────────────

function validateTitleLength(slides, constraint = {}) {
  const minLen = 8;
  const maxLen = constraint.title_len ? parseInt(constraint.title_len.split('~')[1] || '22') : 22;

  return slides
    .filter((s) => !['cover', 'agenda'].includes(s.role))
    .map((slide) => {
      const title = (slide.title || '').trim();
      const len   = title.length;
      const pass  = len >= minLen && len <= maxLen;

      return {
        rule: 'R4', slide: slide.index, title, len, pass,
        message: pass
          ? `✅ R4 slide-${slide.index}: 제목 ${len}자 (권장 범위)`
          : `⚠️  R4 slide-${slide.index}: "${title}" — ${len}자 (권장 ${minLen}~${maxLen}자)`,
        suggestion: len > maxLen
          ? `${maxLen}자 이내로 단축. 키워드 2~3개만 남기기`
          : len < minLen
            ? '너무 짧음 — 결론/수치 보강 필요'
            : null,
      };
    });
}

// ─── Rule 5: 표지 테스트 ─────────────────────────────────────────────────────

function validateCover(slides, input) {
  const cover = slides.find((s) => s.role === 'cover');
  if (!cover) {
    return {
      rule: 'R5', pass: false,
      message: '❌ R5 — 표지 슬라이드 없음',
      suggestion: 'role: cover 슬라이드 추가',
    };
  }

  const hasMedia  = !!(input.assets?.cover_bg || input.assets?.logo);
  const titleLen  = (cover.title || '').length;
  const goodTitle = titleLen >= 4 && titleLen <= 30;
  const goodLayout = ['cover_center_calm', 'cover_top_aligned'].includes(cover.layout);

  const pass = goodTitle && goodLayout;

  return {
    rule: 'R5', pass,
    message: pass
      ? `✅ R5 — 표지 테스트 통과`
      : `❌ R5 — 표지 테스트 실패`,
    checks: {
      hasMedia:    hasMedia    ? '✅ 배경/로고 있음'  : '⚠️  배경/로고 없음 (권장: cover_bg 설정)',
      goodTitle:   goodTitle   ? `✅ 제목 ${titleLen}자` : `❌ 제목 길이 부적절 (${titleLen}자)`,
      goodLayout:  goodLayout  ? '✅ 레이아웃 정상'  : `❌ 레이아웃 "${cover.layout}" 미지원`,
    },
    suggestion: !goodLayout ? 'layout을 cover_center_calm 또는 cover_top_aligned로 설정' : null,
  };
}

// ─── Rule 6: 줄글 금지 ───────────────────────────────────────────────────────

function validateNoParagraph(slides, constraint = {}) {
  const noParagraph = constraint.no_paragraph !== false;

  return slides
    .filter((s) => s.body && s.body.length > 0)
    .map((slide) => {
      const violations = (slide.body || []).filter((line) => {
        if (typeof line !== 'string') return false;
        return line.length > 30 && /[。,，.]\s/.test(line);
      });

      const pass = !noParagraph || violations.length === 0;

      return {
        rule: 'R6', slide: slide.index, pass,
        message: pass
          ? `✅ R6 slide-${slide.index}: 줄글 없음`
          : `❌ R6 slide-${slide.index}: 줄글 ${violations.length}건`,
        violations: violations.map((v) => ({
          text:       v,
          suggestion: `→ 키워드 + 수치만: "${v.split(/[,，.。]|\s{2,}/)[0].trim()}"`,
        })),
      };
    });
}

// ─── 레드팀 리포트 ────────────────────────────────────────────────────────────

function generateRedTeam(input, plan) {
  const assumptions = [
    {
      assumption: 'one_liner 10초 발화 가능',
      test:       `"${plan.oneLiner}" — ${plan.oneLiner?.length || 0}자`,
      risk:       (plan.oneLiner?.length || 0) > 60 ? 'HIGH' : 'LOW',
      mitigation: '핵심 동사+결과 중심으로 1문장 단축',
    },
    {
      assumption: '우리만의 원칙/철학 실재',
      test:       `key_points ${input.key_points?.length || 0}개 확인`,
      risk:       (input.key_points?.length || 0) < 3 ? 'HIGH' : 'MEDIUM',
      mitigation: '조직 고유 원칙 1문장을 표지 서브타이틀에 명시',
    },
    {
      assumption: `카피뱅크 충분량 (권장 5개+)`,
      test:       `copy_bank ${input.copy_bank?.length || 0}개`,
      risk:       (input.copy_bank?.length || 0) < 3 ? 'HIGH' : 'LOW',
      mitigation: '레퍼런스 최소 5개 수집 후 재실행',
    },
    {
      assumption: '증거/데이터 신뢰도',
      test:       `evidence ${input.evidence?.length || 0}개`,
      risk:       (input.evidence?.length || 0) < 2 ? 'HIGH' : 'LOW',
      mitigation: '출처 명시된 통계/사례 2개 이상 필수',
    },
  ];

  const failSignals = [
    {
      signal:      '"그래서 결론이 뭐예요?" 질문',
      probability: plan.flowType === 'briefing' ? 'MEDIUM' : 'LOW',
      prevention:  '각 슬라이드 제목을 결론형으로 강제 — Validator R1 통과 확인',
    },
    {
      signal:      '제목이 비슷해 기억에 남지 않음',
      probability: plan.slides.filter((s) => s.title?.length < 8).length > 2 ? 'HIGH' : 'LOW',
      prevention:  '소유권 테스트 재실행 + copywriter 10후보 중 수치형 선택',
    },
    {
      signal:      '발표자가 슬라이드를 읽음',
      probability: plan.slides.filter((s) => (s.body || []).join('').length > 150).length > 2
        ? 'HIGH' : 'LOW',
      prevention:  '줄글 슬라이드 분할 + 키워드 중심 재작성 (R6 재검증)',
    },
  ];

  const riskTable = [
    { risk: '제목 주제형 회귀',     trigger: 'R1 실패',     response: '제목=결론 강제 + 기존 제목 부제로 이동' },
    { risk: '우리 말 아님',         trigger: 'R2 실패',     response: '원칙/철학/기준 1문장 추가 후 재작성'   },
    { risk: '카피 품질 들쭉날쭉',   trigger: 'R4 경고',     response: '레퍼런스 3개+제약+10후보 재시도'       },
    { risk: '표지 가독성 붕괴',     trigger: 'R5 실패',     response: '검정 그라데이션 박스(4스톱) 고정 적용' },
    { risk: '줄글 슬라이드 발생',   trigger: 'R6 실패',     response: '2장 분할 + 키워드 1개 메인으로 올림'  },
  ];

  return { assumptions, failSignals, riskTable };
}

// ─── 자아비판 루프 (Rule 7) ────────────────────────────────────────────────

/** Rule 7: 발표 후 자아비판 — 최하위 슬라이드 3장 플래그 + 대안 제시 */
function generatePostMortemTemplate(slides) {
  return {
    rule: 'R7',
    instruction: 'PT 끝난 당일 아래 3가지를 수행하세요.',
    steps: [
      '1. 가장 반응이 없었던 슬라이드 3장을 아래 목록에 표시',
      '2. 해당 슬라이드 제목을 결론형으로 재작성 (copywriter 10후보 중 선택)',
      '3. 대체 레이아웃 1가지 시도 (예: 텍스트 → 카드형)',
    ],
    targetSlides: slides.slice(1, -1).map((s) => ({
      index:    s.index,
      title:    s.title || '(제목 없음)',
      layout:   s.layout,
      flagged:  false,
      newTitle: '',
      altLayout: '',
    })),
    note: '템플릿 의존 금지 — 매 발표마다 가장 약한 슬라이드 개선이 장기 실력 성장의 핵심',
  };
}

// ─── 통합 검증 ───────────────────────────────────────────────────────────────

function validate(plan, input) {
  const results = {
    R0_oneLiner:     validateOneLiner(plan.oneLiner),
    R1_titleOnly:    validateTitleOnly(plan.slides),
    R2_ownership:    validateOwnership(plan.slides, input.topic),
    R4_titleLength:  validateTitleLength(plan.slides, input.constraints || {}),
    R5_cover:        validateCover(plan.slides, input),
    R6_noParagraph:  validateNoParagraph(plan.slides, input.constraints || {}),
    redTeam:         generateRedTeam(input, plan),
    postMortem:      generatePostMortemTemplate(plan.slides),
  };

  const allRuleResults = [
    results.R0_oneLiner,
    ...results.R1_titleOnly,
    ...results.R2_ownership,
    ...results.R4_titleLength,
    results.R5_cover,
    ...results.R6_noParagraph,
  ];

  const totalFails   = allRuleResults.filter((r) => !r.pass).length;
  const totalWarnings = allRuleResults.filter((r) => r.message?.startsWith('⚠️')).length;

  results.summary = {
    totalFails,
    totalWarnings,
    pass: totalFails === 0,
    message: totalFails === 0
      ? `✅ ALL PASS — ${allRuleResults.length}개 규칙 통과${totalWarnings > 0 ? ` (경고 ${totalWarnings}건 개선 권장)` : ''}`
      : `❌ ${totalFails}개 위반 — 수정 후 재검증 필요`,
  };

  return results;
}

module.exports = {
  validate,
  validateOneLiner,
  validateTitleOnly,
  validateOwnership,
  validateTitleLength,
  validateCover,
  validateNoParagraph,
  generateRedTeam,
  generatePostMortemTemplate,
};
