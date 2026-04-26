// Intent Matcher — keyword-based FAQ lookup for Tiệm Bánh Vani
// Uses knowledgeBase.faqs: [{question, answer, keywords}]

import { knowledgeBase } from '../data/knowledgeBase.js';

const faqs = knowledgeBase.faqs ?? [];

const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/đ/g, 'd')   // đ (U+0111) doesn't decompose via NFD — must replace before stripping
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Best-match base (0.6) + density bonus (0.4) — avoids penalising FAQs with many keywords
const calculateMatchScore = (query, keywords) => {
  if (!keywords?.length) return 0;
  let maxScore = 0;
  let totalScore = 0;
  let matched = 0;
  for (const kw of keywords) {
    const nkw = normalizeText(kw);
    let s = 0;
    if (query.includes(nkw)) { s = 1; }
    else if (nkw.length >= 3 && query.includes(nkw.slice(0, -1))) { s = 0.8; }
    if (s > 0) { totalScore += s; matched++; maxScore = Math.max(maxScore, s); }
  }
  if (matched === 0) return 0;
  return maxScore * 0.6 + (totalScore / keywords.length) * 0.4;
};

/**
 * Match user query against FAQ knowledge base.
 * @returns {{ match: boolean, intent: string|null, answer: string|null, confidence: number }}
 */
export const matchIntent = (userQuery) => {
  if (!userQuery || userQuery.trim().length < 2) {
    return { match: false, intent: null, answer: null, confidence: 0 };
  }

  const q = normalizeText(userQuery);
  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const score = calculateMatchScore(q, faq.keywords);
    if (score > bestScore) { bestScore = score; best = faq; }
  }

  const THRESHOLD = 0.3;
  if (bestScore >= THRESHOLD && best) {
    return {
      match: true,
      intent: normalizeText(best.question),
      answer: best.answer,
      confidence: bestScore,
      question: best.question,
    };
  }
  return { match: false, intent: null, answer: null, confidence: 0 };
};

const ORDER_KEYWORDS = [
  'dat ngay', 'dat banh ngay', 'mua ngay', 'order ngay',
  'muon dat', 'can dat', 'order', 'dat hang',
  'muon mua', 'cho toi dat',
  'cho minh dat',   // "cho mình đặt"
  'minh muon dat',  // "mình muốn đặt"
  'muon order',     // "muốn order"
];

export const isOrderIntent = (userQuery) => {
  const q = normalizeText(userQuery);
  // "cần đặt trước" is a lead-time question, not an order intent
  if (q.includes('can dat truoc')) return false;
  return ORDER_KEYWORDS.some((kw) => q.includes(kw));
};

export const isGreeting = (userQuery) => {
  const greetings = ['chao', 'hello', 'hi', 'xin chao', 'hey', 'alo'];
  const q = normalizeText(userQuery);
  return greetings.some((kw) => q.includes(kw));
};

export default { matchIntent, isOrderIntent, isGreeting };
