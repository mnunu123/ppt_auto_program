// slide_writer.js - Rule 1(제목=결론) + Rule 6(줄글 금지) 강제 적용 슬라이드 콘텐츠 생성

'use strict';

/** Rule 1: 제목 = 결론 패턴 (주제형 → 결론형 변환) */
const CONCLUSION_PATTERNS = {
  result:    (num, result) => `${num} ${result}이 증명한다`,
  principle: (subj, verb)  => `${subj}이 ${verb}를 만든다`,
  contrast:  (a, b)        => `${a}가 아닌 ${b}를 선택했다`,
  declare:   (action)      => `${action}이 답이다`,
  number:    (num, ctx)    => `${num} — ${ctx}의 전환점`,
  warning:   (risk)        => `놓치면 ${risk}이 된다`,
  imperative:(action)      => `지금 당장 ${action}하라`,
};

/** Rule 4: 제목 길이 강제 — 최대 max자(기본 22자), 초과 시 자동 단축 */
function clampTitle(text, max = 22) {
  if (!text) return '';
  // 이미 짧으면 그대로
  if (text.length <= max) return text;
  // 조사/어미 앞에서 자르기 시도
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
}

/** Rule 6: 최대 글자 수 — 키워드 라인은 30자 이하 */
function enforceNoParagraph(lines) {
  return lines.map((line) => {
    if (typeof line !== 'string') return line;
    // 30자 초과 줄글이면 첫 30자 + "…"로 트리밍
    return line.length > 30 ? line.slice(0, 28) + '…' : line;
  });
}

/** keyPoint 문자열에서 키워드(앞)와 설명(뒤)을 파싱 */
function parseKeyPoint(kp = '') {
  const [label, ...rest] = kp.split(/[:\-\—]/);
  return {
    label: label?.trim() || kp,
    desc:  rest.join(' ').trim(),
  };
}

/** evidence 객체를 data_cards 아이템으로 변환 */
function evidenceToCards(evidence) {
  if (!evidence) return [];
  if (Array.isArray(evidence)) return evidence.map((e) => evidenceToCard(e));
  return [evidenceToCard(evidence)];
}

function evidenceToCard(e) {
  if (!e) return { value: '—', label: '', desc: '' };
  if (e.type === 'stat') {
    const parts = e.text.split(' ');
    return { value: parts[0] || '—', label: parts.slice(1, 3).join(' '), desc: e.source || '' };
  }
  if (e.type === 'quote') {
    return { value: '"', label: e.text?.slice(0, 20) || '', desc: e.source || '' };
  }
  return { value: '▶', label: e.text?.slice(0, 20) || '', desc: e.source || '' };
}

// ─── 슬라이드 role별 writer ────────────────────────────────────────────

function writeCover(slide, input) {
  return {
    ...slide,
    title:       input.topic,
    subtitle:    input.one_liner || '',
    sectionLabel: input.audience ? `${input.audience}을 위한 안내` : '',
  };
}

function writeAgenda(slide, input) {
  const kp = (input.key_points || []).slice(0, 4);
  return {
    ...slide,
    title: '오늘의 흐름',
    sectionLabel: '목차',
    agendaItems: kp.map((k, i) => {
      const { label, desc } = parseKeyPoint(k);
      return { num: String(i + 1).padStart(2, '0'), title: label, desc };
    }),
  };
}

function writeHook(slide, input) {
  const kp = parseKeyPoint(slide.keyPoint);
  // 설득형: 훅은 날카로운 질문 또는 선언
  const hookTitle = kp.label ? `${kp.label}가 바뀌고 있다` : `${input.topic}: 지금이 결정적 순간이다`;
  return {
    ...slide,
    sectionLabel: '왜 지금인가',
    title: hookTitle,
    quote: slide.keyPoint || input.key_points?.[0] || '',
    source: input.evidence?.[0]?.source || '',
  };
}

function writeProblem(slide, input) {
  const kp = parseKeyPoint(slide.keyPoint);
  const title = kp.label
    ? CONCLUSION_PATTERNS.warning(kp.label)
    : `지금 아무것도 하지 않으면 기회를 잃는다`;

  const bullets = (input.key_points || []).slice(0, 3).map((k) => {
    const p = parseKeyPoint(k);
    return `${p.label}: ${p.desc || '현황'}`;
  });

  return {
    ...slide,
    sectionLabel: '문제 / 배경',
    title,
    body: enforceNoParagraph(bullets),
  };
}

function writeTarget(slide, input) {
  const ev = evidenceToCards(slide.evidence || input.evidence?.[0]);
  const aud = (input.audience || '대상').split(/[,\s(]/)[0]; // 첫 단어만
  const title = clampTitle(`${aud}만 받는 혜택`);
  return {
    ...slide,
    sectionLabel: '대상 / 조건',
    title,
    cards: ev.length ? ev : [{ value: aud, label: '대상', desc: '' }],
  };
}

function writeInsight(slide, input) {
  const cards = evidenceToCards(
    input.evidence?.filter((e) => e.type === 'stat').slice(0, 4) || []
  );
  const kp = parseKeyPoint(slide.keyPoint);
  return {
    ...slide,
    sectionLabel: '핵심 인사이트',
    title: kp.label
      ? CONCLUSION_PATTERNS.number(kp.label, '전환의 이유')
      : `숫자가 방향을 말해준다`,
    cards: cards.length ? cards : [{ value: '?', label: '데이터 필요', desc: '' }],
  };
}

function writeSolutionN(slide, input, idx) {
  const kp   = parseKeyPoint(input.key_points?.[idx] || slide.keyPoint || '');
  const role = slide.role;
  const num  = role.includes('_') ? role.split('_')[1] : '';

  // keyword를 8자 이내로 단축 후 패턴 적용
  const kwShort = clampTitle(kp.label, 8);
  const descShort = clampTitle(kp.desc || '결과', 6);
  const title = kwShort
    ? clampTitle(CONCLUSION_PATTERNS.principle(kwShort, descShort))
    : `핵심 내용 ${num}`;

  const sub = (input.key_points || [])
    .slice(idx + 1, idx + 4)
    .map((k) => parseKeyPoint(k))
    .map((p) => `${p.label}: ${p.desc || ''}`.trim());

  return {
    ...slide,
    sectionLabel: `핵심 내용 ${num}`,
    title,
    keyword: kp.label,
    body: enforceNoParagraph(sub.length ? sub : [kp.desc || '']),
  };
}

function writeEvidence(slide, input, idx) {
  const evList = (input.evidence || []).slice(idx, idx + 4);
  const cards  = evidenceToCards(evList);
  const kp     = parseKeyPoint(slide.keyPoint);
  const title  = kp.label
    ? CONCLUSION_PATTERNS.result(kp.label, '사실')
    : `데이터가 스스로 말한다`;

  return {
    ...slide,
    sectionLabel: `증거 ${idx + 1}`,
    title,
    cards,
  };
}

function writeData(slide, input, idx) {
  const evList = (input.evidence || []).slice(idx * 2, idx * 2 + 4);
  const cards  = evidenceToCards(evList);
  const kp     = parseKeyPoint(slide.keyPoint);
  return {
    ...slide,
    sectionLabel: `데이터 ${idx + 1}`,
    title: kp.label ? `${kp.label} — 수치로 보는 현실` : '핵심 데이터',
    cards,
  };
}

function writeOverview(slide, input) {
  const cards = evidenceToCards((input.evidence || []).slice(0, 4));
  return {
    ...slide,
    sectionLabel: '개요 / 현황',
    title: `${input.topic}: 지금 어디에 있는가`,
    cards,
  };
}

function writeSolution(slide, input) {
  const kp     = parseKeyPoint(slide.keyPoint);
  const title  = kp.label
    ? CONCLUSION_PATTERNS.declare(kp.label)
    : `우리의 선택이 결과를 만든다`;
  const bullets = (input.key_points || []).slice(-3).map((k) => {
    const p = parseKeyPoint(k);
    return `${p.label}: ${p.desc || ''}`.trim();
  });
  return {
    ...slide,
    sectionLabel: '해결책',
    title,
    keyword: kp.label,
    body: enforceNoParagraph(bullets),
  };
}

function writeAnalysis(slide, input) {
  const kp = parseKeyPoint(slide.keyPoint);
  return {
    ...slide,
    sectionLabel: '분석',
    title: kp.label ? `${kp.label}이 말하는 것` : '분석이 가리키는 방향',
    body: enforceNoParagraph([kp.desc || ''].filter(Boolean)),
  };
}

function writeImplication(slide, input) {
  const kp    = parseKeyPoint(slide.keyPoint);
  const title = kp.label
    ? CONCLUSION_PATTERNS.principle(kp.label, '시사점')
    : '이것이 의미하는 바';
  return {
    ...slide,
    sectionLabel: '시사점',
    title,
    body: enforceNoParagraph((input.key_points || []).slice(-3).map((k) => parseKeyPoint(k).label)),
  };
}

function writeRecommendation(slide, input) {
  const bullets = (input.cta || input.key_points || []).slice(0, 3).map((c) => {
    const p = parseKeyPoint(c);
    return `${p.label}`.trim();
  });
  return {
    ...slide,
    sectionLabel: '권고',
    title: '지금 해야 할 3가지',
    keyword: '권고',
    body: enforceNoParagraph(bullets),
  };
}

function writeCaution(slide, input) {
  const cards = (input.evidence || [])
    .filter((e) => e.type === 'rule')
    .slice(0, 4)
    .map((e) => ({ value: '⚠', label: e.text?.slice(0, 15) || '', desc: e.source || '' }));
  return {
    ...slide,
    sectionLabel: '주의사항',
    title: '이것만은 반드시 확인하라',
    cards: cards.length ? cards : [{ value: '⚠', label: '주의', desc: '담당자 확인 필수' }],
  };
}

function writeNextSteps(slide, input) {
  const steps = (input.cta || []).slice(0, 3);
  const firstKw = clampTitle(parseKeyPoint(steps[0] || '').label, 8);
  const title = firstKw
    ? clampTitle(CONCLUSION_PATTERNS.imperative(firstKw))
    : '다음 단계가 결과를 결정한다';
  return {
    ...slide,
    sectionLabel: '다음 단계',
    title,
    keyword: '실행',
    body: enforceNoParagraph(steps.map((s) => parseKeyPoint(s).label)),
  };
}

function writeRisk(slide, input) {
  const risks = (input.evidence || []).filter((e) => e.type === 'rule' || e.type === 'case');
  const cards = risks.slice(0, 4).map((r) => ({
    value: '↯',
    label: r.text?.slice(0, 15) || '리스크',
    desc: r.source || '',
  }));
  return {
    ...slide,
    sectionLabel: '리스크',
    title: '이 가정이 틀릴 때를 대비하라',
    cards: cards.length ? cards : [{ value: '↯', label: '리스크', desc: '시나리오 검토 필요' }],
  };
}

function writeCTASlide(slide, input) {
  const cta = (input.cta || input.key_points || []).slice(0, 3);
  const firstKw = clampTitle(parseKeyPoint(cta[0] || '').label, 8);
  const title = firstKw
    ? clampTitle(CONCLUSION_PATTERNS.imperative(firstKw))
    : `지금 시작하지 않으면 기회를 잃는다`;
  return {
    ...slide,
    sectionLabel: '행동 촉구',
    title,
    keyword: 'NOW',
    body: enforceNoParagraph(cta.map((c) => parseKeyPoint(c).label)),
  };
}

function writeSummary(slide, input, planContext) {
  const bullets = (input.key_points || []).slice(0, 3).map((k) => parseKeyPoint(k).label);
  return {
    ...slide,
    sectionLabel: '핵심 정리',
    title: `기억할 것은 3가지뿐이다`,
    oneLiner: planContext?.oneLiner || input.one_liner || '',
    body: enforceNoParagraph(bullets),
  };
}

function writeGeneric(slide, input) {
  const kp = parseKeyPoint(slide.keyPoint);
  return {
    ...slide,
    sectionLabel: slide.purpose || '',
    title: kp.label || slide.purpose || '슬라이드',
    body: [kp.desc].filter(Boolean),
  };
}

// ─── 메인 함수 ────────────────────────────────────────────────────────

/** 슬라이드 role에 따라 적절한 writer를 선택 */
function writeSlide(slideSpec, input, planContext) {
  const roleMap = {
    cover:          writeCover,
    agenda:         writeAgenda,
    hook:           writeHook,
    problem:        writeProblem,
    target:         writeTarget,
    insight:        writeInsight,
    solution:       writeSolution,
    solution_1:     (s, i) => writeSolutionN(s, i, 0),
    solution_2:     (s, i) => writeSolutionN(s, i, 1),
    solution_3:     (s, i) => writeSolutionN(s, i, 2),
    evidence_1:     (s, i) => writeEvidence(s, i, 0),
    evidence_2:     (s, i) => writeEvidence(s, i, 1),
    data_1:         (s, i) => writeData(s, i, 0),
    data_2:         (s, i) => writeData(s, i, 1),
    overview:       writeOverview,
    analysis:       writeAnalysis,
    implication:    writeImplication,
    recommendation: writeRecommendation,
    caution:        writeCaution,
    next_steps:     writeNextSteps,
    risk:           writeRisk,
    cta:            writeCTASlide,
    summary:        (s, i) => writeSummary(s, i, planContext),
  };

  const writer = roleMap[slideSpec.role] || writeGeneric;
  return writer(slideSpec, input, planContext);
}

module.exports = { writeSlide, enforceNoParagraph, parseKeyPoint };
