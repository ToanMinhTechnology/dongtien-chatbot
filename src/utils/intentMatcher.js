// Intent Matcher - Keyword-based intent classification
// Không dùng RAG/AI - pure keyword matching

import { knowledgeBase, intentGroups } from '../data/knowledgeBase.js';

/**
 * Normalize Vietnamese text for matching
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

/**
 * Calculate match score between query and keywords
 * @param {string} query - normalized user query
 * @param {string[]} keywords - keywords to match against
 * @returns {number} - score 0-1
 */
const calculateMatchScore = (query, keywords) => {
  if (!keywords || keywords.length === 0) return 0;

  let score = 0;
  let matchedKeywords = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);

    // Exact match
    if (query.includes(normalizedKeyword)) {
      score += 1;
      matchedKeywords++;
      continue;
    }

    // Partial match (keyword inside query or query inside keyword)
    if (normalizedKeyword.length >= 3) {
      if (query.includes(normalizedKeyword.substring(0, normalizedKeyword.length - 1))) {
        score += 0.8;
        matchedKeywords++;
        continue;
      }
    }
  }

  // Return weighted score
  if (keywords.length === 0) return 0;
  return matchedKeywords > 0 ? (score / keywords.length) * Math.min(matchedKeywords / 2, 1) : 0;
};

/**
 * Match user query against knowledge base
 * @param {string} userQuery - raw user input
 * @returns {{ match: boolean, intent: string|null, answer: string|null, confidence: number }}
 */
export const matchIntent = (userQuery) => {
  if (!userQuery || userQuery.trim().length < 2) {
    return { match: false, intent: null, answer: null, confidence: 0 };
  }

  const normalizedQuery = normalizeText(userQuery);
  let bestMatch = null;
  let bestScore = 0;

  // Match against each FAQ entry
  for (const faq of knowledgeBase) {
    const score = calculateMatchScore(normalizedQuery, faq.keywords);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // Confidence threshold: 0.3 for now (lowered since keywords are specific)
  const CONFIDENCE_THRESHOLD = 0.3;

  if (bestScore >= CONFIDENCE_THRESHOLD && bestMatch) {
    return {
      match: true,
      intent: bestMatch.intent,
      answer: bestMatch.answer,
      confidence: bestScore,
      question: bestMatch.question
    };
  }

  return { match: false, intent: null, answer: null, confidence: 0 };
};

/**
 * Check if query is an order intent
 * @param {string} userQuery
 * @returns {boolean}
 */
export const isOrderIntent = (userQuery) => {
  const orderKeywords = [
    'đặt ngay', 'đặt bánh ngay', 'mua ngay', 'order ngay',
    'muốn đặt', 'cần đặt', 'order', 'đặt hàng'
  ];

  const normalized = normalizeText(userQuery);
  return orderKeywords.some(keyword => normalized.includes(normalizeText(keyword)));
};

/**
 * Check if query is a greeting
 * @param {string} userQuery
 * @returns {boolean}
 */
export const isGreeting = (userQuery) => {
  const greetingKeywords = ['chào', 'hello', 'hi', 'xin chào', 'hey', 'alo', 'good morning', 'good afternoon'];
  const normalized = normalizeText(userQuery);
  return greetingKeywords.some(keyword => normalized.includes(normalizeText(keyword)));
};

/**
 * Get FAQ by intent
 * @param {string} intent
 * @returns {object|null}
 */
export const getFAQByIntent = (intent) => {
  return knowledgeBase.find(faq => faq.intent === intent) || null;
};

/**
 * Get all intents in a group
 * @param {string} groupName
 * @returns {string[]}
 */
export const getIntentsInGroup = (groupName) => {
  return intentGroups[groupName] || [];
};

export default { matchIntent, isOrderIntent, isGreeting, getFAQByIntent, getIntentsInGroup };
