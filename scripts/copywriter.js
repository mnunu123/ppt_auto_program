// copywriter.js - Rule 2(소유권) + Rule 3(카피뱅크) + Rule 4(제목 후보 10개) 강제 적용

'use strict';

// ─── 제목 패턴 라이브러리 ────────────────────────────────────────────

const PATTERNS = [
  { id: 'result',    tone: '선언', structure: '원칙형',  fn: (kw, num) => `${num || kw}, 그것이 증명한다`          },
  { id: 'contrast',  tone: '도발', structure: '대비형',  fn: (a, b)    => `${a}가 아닌 ${b}를 택했다`              },
  { id: 'declare',   tone: '선언', structure: '원칙형',  fn: (kw)      => `${kw}이 답이다`                        },
  { id: 'number',    tone: '권위', structure: '수치형',  fn: (num, kw) => `${num} — ${kw}의 변곡점`               },
  { id: 'principle', tone: '담담', structure: '원칙형',  fn: (a, b)    => `${a}이 ${b}를 만든다`                   },
  { id: 'warning',   tone: '도발', structure: '질문형',  fn: (risk)    => `이것을 모르면 ${risk}이 된다`           },
  { id: 'imperative',tone: '선언', structure: '3단리듬', fn: (kw)      => `지금 당장 ${kw}하라`                   },
  { id: 'question',  tone: '따뜻', structure: '질문형',  fn: (kw)      => `${kw}는 어떻게 가능한가?`              },
  { id: 'rhythm',    tone: '담담', structure: '3단리듬', fn: (a,b,c)   => `${a}·${b}·${c}`                       },
  { id: 'lens',      tone: '권위', structure: '대비형',  fn: (kw, ctx) => `${ctx}이 바뀌면 ${kw}도 바뀐다`        },
];

// 일반론/업계 공통 표현 (소유권 감점)
const GENERIC_TERMS = [
  '성장', '혁신', '도전', '미래', '글로벌', '신뢰', '고객 중심', '함께', '상생',
  '새로운', '최고', '최적', '솔루션', '플랫폼', '에코시스템',
];

// ─── 소유권 검증 (Rule 2) ────────────────────────────────────────────

/** 소유권 점수 0~1 계산 */
function ownershipScore(title, context = {}) {
  let score = 0.5;

  // 감점: 일반론적 용어
  const genericCount = GENERIC_TERMS.filter((t) => title.includes(t)).length;
  score -= genericCount * 0.15;

  // 가점: 수치/단위 포함
  if (/\d/.test(title)) score += 0.2;

  // 가점: 주제 고유 키워드 포함
  const specific = (context.specificTerms || []).filter((t) => title.includes(t));
  score += specific.length * 0.15;

  // 가점: 결론형 동사 포함
  if (/이다$|한다$|했다$|하라$|된다$|만든다$/.test(title.trim())) score += 0.1;

  // 감점: 길이 벗어남 (16~22자 권장)
  if (title.length < 8 || title.length > 28) score -= 0.15;

  // 3개 실패 조건 체크
  const companyAgnostic = !context.specificTerms?.some((t) => title.includes(t));
  const industryGeneric = genericCount >= 2;
  const soWhat = !/[0-9%배만억원달러위]\s|이다$|한다$|했다$|하라$/.test(title);

  const failCount = [companyAgnostic, industryGeneric, soWhat].filter(Boolean).length;
  score -= failCount * 0.2;

  return Math.max(0, Math.min(1, score));
}

/** 소유권 테스트 상세 결과 */
function checkOwnership(title, context = {}) {
  const score = ownershipScore(title, context);
  const genericCount = GENERIC_TERMS.filter((t) => title.includes(t)).length;
  const hasSpecific   = (context.specificTerms || []).some((t) => title.includes(t));
  const hasConcrete   = /[0-9%배만억원달러위]/.test(title) || /이다$|한다$|됐다$|하라$/.test(title.trim());
  const soWhat        = !hasConcrete;

  return {
    score,
    pass: score >= 0.5,
    flags: {
      companyAgnostic: !hasSpecific,
      industryGeneric: genericCount >= 2,
      soWhat,
    },
    reason: score >= 0.7 ? '강한 소유권'
      : score >= 0.5 ? '보통 소유권 — 수치/고유 원칙 추가 권장'
      : '소유권 부족 — 업계 범용 문장, 재작성 필요',
  };
}

// ─── 카피뱅크 활용 (Rule 3) ────────────────────────────────────────────

/** 카피뱅크 레퍼런스에서 "구조만" 차용해 새 제목 생성 (원문 단어 복제 금지) */
function inspiredByBank(ref, context) {
  if (!ref || !ref.text || !context.keyword) return null;

  const { structure, tone, text } = ref;
  const kw = context.keyword;

  // 구조만 차용, 원문 단어/구 복제 금지
  // 원문에서 길이·리듬만 추출
  const wordCount = text.split(/\s+/).length;
  const isBrief   = wordCount <= 5;

  // 구조별 템플릿으로 재작성
  switch (structure) {
    case '원칙형':  return `${kw}이(가) 결과를 결정한다`;
    case '대비형':  return isBrief ? `${kw}가 아닌 선택` : `기존 방식 대신 ${kw}를 택한 이유`;
    case '3단리듬': return `${kw}·원칙·결과`;
    case '질문형':  return `${kw}는 왜 지금인가?`;
    case '선언형':  return `${kw}이 답이다`;
    default:        return `${kw}: ${tone === '도발' ? '불편한 진실' : '명확한 선택'}`;
  }
}

// ─── 제목 후보 10개 생성 (Rule 4) ────────────────────────────────────────────

/**
 * 제목 후보 10개 생성 + 소유권 강한 3개 추천
 * @param {object} slideCtx - { role, purpose, keyword, topic, specificTerms }
 * @param {Array}  copyBank - 카피뱅크 배열
 * @returns {{ candidates, recommended }}
 */
function generateTitleCandidates(slideCtx, copyBank = []) {
  const { keyword = '', topic = '', specificTerms = [] } = slideCtx;
  if (!keyword && !topic) return { candidates: [], recommended: [] };

  const context = { keyword, topic, specificTerms };
  const candidates = [];

  // 1. 패턴 기반 생성 (최대 10개)
  const kw   = keyword || topic;
  const ev   = slideCtx.evidence?.text?.split(' ')?.[0] || '';
  const kw2  = specificTerms[0] || topic;

  const generated = [
    PATTERNS[0].fn(kw, ev || '100%'),
    PATTERNS[1].fn(kw, kw2),
    PATTERNS[2].fn(kw),
    PATTERNS[3].fn(ev || kw, kw),
    PATTERNS[4].fn(kw, kw2 || '결과'),
    PATTERNS[5].fn(kw),
    PATTERNS[6].fn(kw),
    PATTERNS[7].fn(kw),
    PATTERNS[8].fn(kw, kw2 || '원칙', '결과'),
    PATTERNS[9].fn(kw, kw2 || topic),
  ];

  generated.forEach((text, i) => {
    const p = PATTERNS[i % PATTERNS.length];
    const ownership = checkOwnership(text, context);
    candidates.push({
      text,
      pattern:  p.structure,
      tone:     p.tone,
      reason:   `${p.tone} 톤, ${p.structure} 구조 → ${ownership.reason}`,
      ownership,
    });
  });

  // 2. 카피뱅크 영감 (구조만, 원문 단어 복제 금지)
  const bankInspired = copyBank.slice(0, 3).map((ref) => {
    const text = inspiredByBank(ref, context);
    if (!text) return null;
    const ownership = checkOwnership(text, context);
    return {
      text,
      pattern:  ref.structure || '뱅크참고',
      tone:     ref.tone || '담담',
      reason:   `카피뱅크 구조 차용 (${ref.tone}·${ref.structure}) — 원문 단어 미포함`,
      ownership,
    };
  }).filter(Boolean);

  const all = [...candidates, ...bankInspired]
    .filter((c) => c.text && c.text.length >= 6)
    .slice(0, 10);

  // 소유권 점수 상위 3개 추천
  const recommended = [...all]
    .sort((a, b) => b.ownership.score - a.ownership.score)
    .slice(0, 3);

  return { candidates: all, recommended };
}

/** 단일 슬라이드에 대한 카피 리포트 문자열 생성 */
function formatCopyReport(slideIndex, slideCtx, copyBank) {
  const { candidates, recommended } = generateTitleCandidates(slideCtx, copyBank);
  if (!candidates.length) return '';

  const lines = [
    `### Slide ${String(slideIndex).padStart(2, '0')} 제목 후보 (${slideCtx.purpose || ''})`,
    '',
    '| # | 제목 후보 | 패턴 | 톤 | 소유권점수 | 이유 |',
    '|---|---------|------|-----|----------|------|',
    ...candidates.map((c, i) =>
      `| ${i + 1} | ${c.text} | ${c.pattern} | ${c.tone} | ${(c.ownership.score * 100).toFixed(0)}점 | ${c.reason} |`
    ),
    '',
    '**소유권 강한 추천 3개:**',
    ...recommended.map((c, i) => `${i + 1}. **${c.text}** — ${c.reason}`),
    '',
  ];

  return lines.join('\n');
}

module.exports = { generateTitleCandidates, checkOwnership, ownershipScore, formatCopyReport };
