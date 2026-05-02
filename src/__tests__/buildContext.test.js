// normalizeText tests remain valid after Sprint 3A RAG migration.
// buildContext() has been replaced by searchSimilar() in embeddingService.js —
// see embeddingService.test.js for the new context search tests.
import { describe, it, expect } from 'vitest';
import { normalizeText } from '../utils/normalize.js';

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

  it('handles mixed Vietnamese + Latin', () => {
    expect(normalizeText('Tiramisu Bánh Kem')).toBe('tiramisu banh kem');
  });
});
