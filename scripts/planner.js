// planner.js - 설득 흐름 선택 + 슬라이드 구조 설계 + Rule 0 (one_liner) 강제

'use strict';

/** 설득 흐름 3종 정의 */
const FLOWS = {
  guided: {
    name: '가이드형',
    desc: '정책 안내, 절차, 단계별 가이드',
    slides: [
      { role: 'cover',       layout: 'cover_center_calm',  purpose: '첫인상 / 티저'       },
      { role: 'agenda',      layout: 'agenda',             purpose: '오늘의 흐름'          },
      { role: 'problem',     layout: 'bullets_keyword',    purpose: '배경 / 문제 정의'     },
      { role: 'target',      layout: 'data_cards',         purpose: '대상 / 조건'          },
      { role: 'solution_1',  layout: 'bullets_keyword',    purpose: '핵심 내용 ①'         },
      { role: 'solution_2',  layout: 'bullets_keyword',    purpose: '핵심 내용 ②'         },
      { role: 'solution_3',  layout: 'data_cards',         purpose: '핵심 내용 ③'         },
      { role: 'caution',     layout: 'data_cards',         purpose: '주의사항 / 제한'      },
      { role: 'next_steps',  layout: 'bullets_keyword',    purpose: '다음 단계'            },
      { role: 'summary',     layout: 'summary',            purpose: '핵심 요약'            },
    ],
  },
  persuasive: {
    name: '설득형',
    desc: '투자 제안, IR, 제안서',
    slides: [
      { role: 'cover',      layout: 'cover_center_calm',  purpose: '첫인상 / 티저'        },
      { role: 'hook',       layout: 'quote_keyword',      purpose: '관심 유발 / 훅'       },
      { role: 'problem',    layout: 'bullets_keyword',    purpose: '문제 / 기회 정의'     },
      { role: 'insight',    layout: 'data_cards',         purpose: '핵심 인사이트'        },
      { role: 'evidence_1', layout: 'data_cards',         purpose: '증거 / 데이터 ①'     },
      { role: 'evidence_2', layout: 'bullets_keyword',    purpose: '증거 / 사례 ②'       },
      { role: 'solution',   layout: 'bullets_keyword',    purpose: '우리의 해결책'        },
      { role: 'risk',       layout: 'data_cards',         purpose: '리스크 / 반론 대응'   },
      { role: 'cta',        layout: 'bullets_keyword',    purpose: '행동 촉구'            },
      { role: 'summary',    layout: 'summary',            purpose: '핵심 요약'            },
    ],
  },
  briefing: {
    name: '브리핑형',
    desc: '보고서, 분석, 현황 설명',
    slides: [
      { role: 'cover',          layout: 'cover_center_calm',  purpose: '첫인상 / 티저'    },
      { role: 'agenda',         layout: 'agenda',             purpose: '오늘의 흐름'       },
      { role: 'overview',       layout: 'data_cards',         purpose: '개요 / 현황'       },
      { role: 'data_1',         layout: 'data_cards',         purpose: '핵심 데이터 ①'   },
      { role: 'data_2',         layout: 'data_cards',         purpose: '핵심 데이터 ②'   },
      { role: 'analysis',       layout: 'bullets_keyword',    purpose: '분석 / 해석'       },
      { role: 'implication',    layout: 'bullets_keyword',    purpose: '시사점'            },
      { role: 'recommendation', layout: 'bullets_keyword',    purpose: '권고사항'          },
      { role: 'risk',           layout: 'data_cards',         purpose: '리스크 / 한계'     },
      { role: 'summary',        layout: 'summary',            purpose: '핵심 요약'         },
    ],
  },
};

/** 목표/주제 텍스트로 흐름 자동 선택 */
function selectFlow(input) {
  const text = ((input.goal || '') + (input.topic || '')).toLowerCase();
  if (/설득|투자|제안|ir|pitch|유치|행동|매수|급등|랠리/.test(text)) return 'persuasive';
  if (/안내|가이드|절차|지원|정책|신청|방법|공모|모집/.test(text))   return 'guided';
  return 'briefing';
}

/** Rule 0: Deck One-liner 생성 (없으면 템플릿으로 강제 생성) */
function enforceOneLiner(input) {
  if (input.one_liner && input.one_liner.trim()) return input.one_liner.trim();

  const problem = input.key_points?.[0] || '복잡한 문제';
  const method  = input.key_points?.[1] || '우리만의 방식';
  const outcome = input.goal             || '원하는 결과';

  return `우리는 ${problem}을(를) ${method}으로 해결해 ${outcome}을(를) 만들겠습니다.`;
}

/** key_points / evidence를 슬라이드에 배분 */
function assignContent(slides, input) {
  const kp  = input.key_points  || [];
  const ev  = input.evidence    || [];
  const cta = input.cta         || [];
  let kpIdx = 0;
  let evIdx = 0;

  return slides.map((slide) => {
    const out = { ...slide };

    if (slide.role === 'cover') {
      out.title      = input.topic;
      out.subtitle   = input.one_liner || '';
      out.sectionLabel = input.audience ? `${input.audience}을 위한` : '';
    } else if (/^(solution|solution_\d|problem|insight|analysis|implication|recommendation|next_steps|hook)$/.test(slide.role)) {
      out.keyPoint   = kp[kpIdx] || '';
      out.kpIndex    = kpIdx;
      kpIdx++;
    } else if (/^(evidence_\d|data_\d|overview|target|caution|risk|insight)$/.test(slide.role)) {
      out.evidence   = ev[evIdx] || null;
      out.keyPoint   = kp[kpIdx] || '';
      evIdx++;
      kpIdx++;
    } else if (slide.role === 'cta') {
      out.ctaItems   = cta;
      out.keyPoint   = kp[kpIdx] || '';
    } else if (slide.role === 'summary') {
      out.keyPoints  = kp;
      out.oneLiner   = input.one_liner || '';
    } else if (slide.role === 'agenda') {
      out.agendaItems = input.key_points?.slice(0, 4).map((kp, i) => ({
        num: String(i + 1).padStart(2, '0'),
        title: kp.split(':')[0]?.trim() || kp,
        desc: kp.split(':')[1]?.trim() || '',
      })) || [];
    }

    return out;
  });
}

/** 메인 플래너 */
function plan(input) {
  const flowType = selectFlow(input);
  const flow     = FLOWS[flowType];
  const oneLiner = enforceOneLiner(input);

  const maxSlides = input.constraints?.slide_count || flow.slides.length;
  const baseSlides = flow.slides.slice(0, maxSlides).map((s, i) => ({
    ...s,
    index: i + 1,
    title:    '',
    body:     [],
  }));

  const slides = assignContent(baseSlides, input);

  return { flowType, flowName: flow.name, oneLiner, slides };
}

module.exports = { plan, FLOWS, selectFlow, enforceOneLiner };
