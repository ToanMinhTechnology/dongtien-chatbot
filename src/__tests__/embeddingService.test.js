// Tests for embeddingService.js — pure functions tested directly,
// OpenAI-dependent functions tested via vi.mock.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock OpenAI and fs/promises BEFORE imports that use them ─────────────────

const mockEmbeddingsCreate = vi.hoisted(() => vi.fn());
// Hoist readFile mock so embeddingService.js gets the same function reference
const mockReadFile = vi.hoisted(() => vi.fn().mockRejectedValue(new Error('ENOENT')));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    embeddings = { create: mockEmbeddingsCreate };
  },
}));

// Mock fs/promises so tests don't touch disk (synchronous factory avoids async timing issues in vitest 4.x)
vi.mock('fs/promises', () => {
  const mod = {
    readFile: mockReadFile,
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  };
  return { ...mod, default: mod };
});

import {
  cosineSimilarity,
  formatPrice,
  productToText,
  productToContextLine,
  searchSimilar,
  resetIndexForTesting,
} from '../../server/services/embeddingService.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const PRODUCT_A = {
  id: 'TEST-001',
  name: 'Bánh kem tiramisu',
  categoryLabel: 'Bánh kem đặc biệt',
  flavorLabel: 'Tiramisu',
  price: 350000,
  availability: 'in-store',
  keywords: ['tiramisu', 'cà phê', 'kem Ý'],
  imageUrl: 'https://cdn.example.com/tiramisu.jpg',
  note: '',
};

const PRODUCT_B = {
  id: 'TEST-002',
  name: 'Bánh kem sữa tươi',
  categoryLabel: 'Bánh kem thiếu nhi',
  flavorLabel: 'Sữa tươi',
  price: 170000,
  availability: 'factory',
  keywords: ['sữa tươi', 'thiếu nhi', 'dễ thương'],
  imageUrl: 'https://cdn.example.com/sua-tuoi.jpg',
  note: 'Trang trí động vật cute',
};

// ── cosineSimilarity ──────────────────────────────────────────────────────────

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0);
  });

  it('returns -1 for opposite vectors', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it('returns 0 for zero-norm vector (no division-by-zero crash)', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([0, 0, 0], [0, 0, 0])).toBe(0);
  });

  it('returns value in [-1, 1] range for random vectors', () => {
    const a = [0.3, -0.7, 0.5, 0.1];
    const b = [-0.2, 0.8, 0.4, -0.6];
    const score = cosineSimilarity(a, b);
    expect(score).toBeGreaterThanOrEqual(-1);
    expect(score).toBeLessThanOrEqual(1);
  });
});

// ── formatPrice ───────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formats integer VND with đ suffix', () => {
    expect(formatPrice(170000)).toBe('170.000đ');
  });

  it('formats 350000 correctly', () => {
    expect(formatPrice(350000)).toBe('350.000đ');
  });

  it('returns empty string for 0', () => {
    expect(formatPrice(0)).toBe('');
  });

  it('returns empty string for null/undefined', () => {
    expect(formatPrice(null)).toBe('');
    expect(formatPrice(undefined)).toBe('');
  });

  it('returns empty string for non-number', () => {
    expect(formatPrice('170000')).toBe('');
  });
});

// ── productToText ─────────────────────────────────────────────────────────────

describe('productToText', () => {
  it('joins name + categoryLabel + flavorLabel + keywords', () => {
    const text = productToText(PRODUCT_A);
    expect(text).toContain('Bánh kem tiramisu');
    expect(text).toContain('Bánh kem đặc biệt');
    expect(text).toContain('Tiramisu');
    expect(text).toContain('cà phê');
  });

  it('handles missing keywords gracefully', () => {
    const p = { name: 'Test', categoryLabel: 'Cat', flavorLabel: 'Flavor' };
    expect(() => productToText(p)).not.toThrow();
    expect(productToText(p)).toBe('Test Cat Flavor');
  });
});

// ── productToContextLine ──────────────────────────────────────────────────────

describe('productToContextLine', () => {
  it('includes name, categoryLabel, and formatted price', () => {
    const line = productToContextLine(PRODUCT_A);
    expect(line).toContain('Bánh kem tiramisu');
    expect(line).toContain('Bánh kem đặc biệt');
    expect(line).toContain('350.000đ');
  });

  it('includes imageUrl', () => {
    const line = productToContextLine(PRODUCT_A);
    expect(line).toContain('ảnh: https://cdn.example.com/tiramisu.jpg');
  });

  it('includes availability', () => {
    const line = productToContextLine(PRODUCT_A);
    expect(line).toContain('in-store');
  });

  it('omits note line when note is empty string', () => {
    const line = productToContextLine(PRODUCT_A);
    expect(line).not.toContain('ghi chú:');
  });

  it('includes note when present', () => {
    const line = productToContextLine(PRODUCT_B);
    expect(line).toContain('ghi chú: Trang trí động vật cute');
  });

  it('strips newlines from fields', () => {
    const p = { ...PRODUCT_A, name: 'Bánh\nkem' };
    expect(productToContextLine(p)).not.toContain('\n');
  });

  it('starts with dash (context line format)', () => {
    expect(productToContextLine(PRODUCT_A).startsWith('- ')).toBe(true);
  });
});

// ── searchSimilar ─────────────────────────────────────────────────────────────

describe('searchSimilar', () => {
  const ORIG_KEY = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    resetIndexForTesting();
    mockEmbeddingsCreate.mockReset();
    mockReadFile.mockReset();
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
  });

  afterEach(() => {
    if (ORIG_KEY === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = ORIG_KEY;
  });

  it('returns top products when embeddings exist', async () => {
    // Mock: product vectors + query vector such that PRODUCT_A scores higher
    const vecA = [1, 0, 0];  // angle 0° with query
    const vecB = [0, 1, 0];  // angle 90° with query
    const queryVec = [1, 0, 0];

    // First call: embed products (20 batched) → return per-product vectors
    // buildIndex() falls back to API because readFile rejects
    mockEmbeddingsCreate
      .mockResolvedValueOnce({
        // index build — returns one embedding per product in CAKE_DATABASE
        data: Array.from({ length: 20 }, (_, i) => ({
          embedding: i === 0 ? vecA : vecB,
        })),
      })
      .mockResolvedValueOnce({
        // query embed
        data: [{ embedding: queryVec }],
      });

    const results = await searchSimilar('tiramisu', 1);
    expect(Array.isArray(results)).toBe(true);
    // At least called OpenAI for both index + query
    expect(mockEmbeddingsCreate).toHaveBeenCalledTimes(2);
  });

  it('returns empty array when OpenAI throws', async () => {
    mockEmbeddingsCreate.mockRejectedValue(new Error('API error'));
    const results = await searchSimilar('tiramisu');
    expect(results).toEqual([]);
  });

  it('filters out results below similarity threshold', async () => {
    // Query vector orthogonal to all product vectors → all scores ≈ 0, below 0.55
    mockEmbeddingsCreate
      .mockResolvedValueOnce({
        data: Array.from({ length: 20 }, () => ({ embedding: [1, 0, 0] })),
      })
      .mockResolvedValueOnce({
        data: [{ embedding: [0, 1, 0] }],  // orthogonal → score = 0
      });

    const results = await searchSimilar('completely unrelated query');
    expect(results).toEqual([]);
  });
});
