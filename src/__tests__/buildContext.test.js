// Unit tests for buildContext() logic — mirrors server/routes/chat.js
// Pattern: extract pure logic as local functions (same as chatRoute.history.test.js)
import { describe, it, expect } from 'vitest';
import { normalizeText } from '../utils/normalize.js';

// ── Mirror buildContext from chat.js ───────────────────────────────────────
const MAX_CONTEXT_PRODUCTS = 8;
const safe = (s) => (s || '').replace(/[\r\n]+/g, ' ').trim();

const buildContext = (userMessage, products) => {
  const q = normalizeText(userMessage);
  const allWords = q.split(' ');
  const unigrams = allWords.filter((w) => w.length >= 3);
  if (unigrams.length === 0) return '';
  const bigrams = allWords.length >= 2
    ? allWords.slice(0, -1).map((w, i) => `${w} ${allWords[i + 1]}`)
    : [];
  const tokens = [...unigrams, ...bigrams];

  const scored = (products ?? [])
    .map((p) => {
      const haystack = normalizeText(`${p.name} ${p.category}`);
      const hits = tokens.filter((t) => haystack.includes(t)).length;
      return { p, hits };
    })
    .filter(({ hits }) => hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, MAX_CONTEXT_PRODUCTS)
    .map(({ p }) => {
      let line = `- ${safe(p.name)} (${safe(p.category)}): ${safe(p.price_range)}`;
      if (p.description) line += ` | mô tả: ${safe(p.description)}`;
      if (p.image_url) line += ` | ảnh: ${safe(p.image_url)}`;
      return line;
    });

  if (scored.length === 0) return '';
  return `\nSẢN PHẨM LIÊN QUAN ĐẾN CÂU HỎI:\n${scored.join('\n')}`;
};

// ── Sample products fixture ────────────────────────────────────────────────
const PRODUCTS = [
  { name: 'bánh kem cưới', category: 'Bánh cưới', price_range: '~1,500,000đ', description: 'Sang trọng nhiều tầng', image_url: 'https://cdn.example.com/cuoi.jpg' },
  { name: 'bánh kem sinh nhật', category: 'Bánh kem sinh nhật', price_range: '~250,000đ', description: '', image_url: '' },
  { name: 'cupcake', category: 'Cupcake', price_range: '~25,000đ', description: 'Nhỏ xinh', image_url: 'https://cdn.example.com/cup.jpg' },
  { name: 'mousse dừa', category: 'Mousse/Cheese Cake', price_range: '~200,000đ', description: '', image_url: '' },
];

// ── Tests ──────────────────────────────────────────────────────────────────
describe('normalizeText', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizeText('Bánh Cưới')).toBe('banh cuoi');
  });

  it('replaces đ with d', () => {
    expect(normalizeText('đặt bánh')).toBe('dat banh');
  });

  it('strips punctuation', () => {
    expect(normalizeText('bánh kem?')).toBe('banh kem');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeText('bánh   kem')).toBe('banh kem');
  });
});

describe('buildContext', () => {
  it('returns empty string when message has no words ≥ 3 chars', () => {
    expect(buildContext('ok', PRODUCTS)).toBe('');
    expect(buildContext('hi', PRODUCTS)).toBe('');
  });

  it('returns empty string when products array is empty', () => {
    expect(buildContext('bánh cưới', [])).toBe('');
  });

  it('returns empty string when no products match', () => {
    expect(buildContext('pizza pepperoni', PRODUCTS)).toBe('');
  });

  it('matches product by name keyword', () => {
    const result = buildContext('bánh cưới giá bao nhiêu', PRODUCTS);
    expect(result).toContain('bánh kem cưới');
    expect(result).toContain('SẢN PHẨM LIÊN QUAN');
  });

  it('includes price_range in output', () => {
    const result = buildContext('bánh cưới', PRODUCTS);
    expect(result).toContain('~1,500,000đ');
  });

  it('includes description when present', () => {
    const result = buildContext('bánh cưới', PRODUCTS);
    expect(result).toContain('mô tả: Sang trọng nhiều tầng');
  });

  it('includes image_url when present', () => {
    const result = buildContext('bánh cưới', PRODUCTS);
    expect(result).toContain('ảnh: https://cdn.example.com/cuoi.jpg');
  });

  it('does not emit | mô tả: line when description is empty', () => {
    // "sinh nhật" matches only bánh kem sinh nhật (no cưới), which has empty description
    const result = buildContext('sinh nhật', PRODUCTS);
    expect(result).not.toContain('mô tả:');
  });

  it('does not emit | ảnh: line when image_url is empty', () => {
    // "sinh nhật" matches only bánh kem sinh nhật (no cưới), which has empty image_url
    const result = buildContext('sinh nhật', PRODUCTS);
    expect(result).not.toContain('ảnh:');
  });

  it('caps at MAX_CONTEXT_PRODUCTS (8)', () => {
    const many = Array.from({ length: 15 }, (_, i) => ({
      name: `bánh kem ${i}`,
      category: 'Bánh kem sinh nhật',
      price_range: `${i * 1000}đ`,
      description: '',
      image_url: '',
    }));
    const result = buildContext('bánh kem', many);
    const lines = result.split('\n').filter((l) => l.startsWith('- '));
    expect(lines.length).toBeLessThanOrEqual(8);
  });

  it('ranks higher-match products first', () => {
    const result = buildContext('bánh kem cưới đẹp', PRODUCTS);
    const lines = result.split('\n').filter((l) => l.startsWith('- '));
    // bánh kem cưới: unigrams banh+kem+cuoi=3, bigrams "banh kem"+"kem cuoi"=2 → 5 hits
    // bánh kem sinh nhật: unigrams banh+kem=2, bigram "banh kem"=1 → 3 hits
    expect(lines[0]).toContain('bánh kem cưới');
  });

  it('handles Vietnamese diacritics in query correctly', () => {
    // "cưới" normalizes to "cuoi", should match "bánh kem cưới"
    const result = buildContext('giá bánh cưới', PRODUCTS);
    expect(result).toContain('bánh kem cưới');
  });
});
