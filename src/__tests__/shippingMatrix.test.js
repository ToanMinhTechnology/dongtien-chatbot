// Unit tests for src/data/shippingMatrix.js
// Pure functions — no external dependencies, no mocking needed.

import { describe, it, expect } from 'vitest';
import {
  calculateShipping,
  calculateTotal,
  getFreeshippingThreshold,
  canDeliver,
  SHIPPING_RESULT,
} from '../../src/data/shippingMatrix.js';

// ─── calculateShipping — Case 1: ≤ 5km ───────────────────────────────────────

describe('calculateShipping — ≤5km (freeship unconditional)', () => {
  it('1km, low order value → FREESHIP', () => {
    const r = calculateShipping(1, 50000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
    expect(r.fee).toBe(0);
  });

  it('5km exactly → FREESHIP (boundary)', () => {
    const r = calculateShipping(5, 100000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
    expect(r.fee).toBe(0);
  });

  it('5km, very low order → still FREESHIP (distance rule wins)', () => {
    const r = calculateShipping(4.9, 10000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
  });
});

// ─── calculateShipping — Case 2: >5km–7km ────────────────────────────────────

describe('calculateShipping — >5km–7km', () => {
  it('6km, order ≥ 250k → FREESHIP', () => {
    const r = calculateShipping(6, 250000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
    expect(r.fee).toBe(0);
  });

  it('6km, order > 250k → FREESHIP', () => {
    const r = calculateShipping(6, 500000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
  });

  it('6km, 100k ≤ order < 250k → SHIP_15K', () => {
    const r = calculateShipping(6, 150000);
    expect(r.result).toBe(SHIPPING_RESULT.SHIP_15K);
    expect(r.fee).toBe(15000);
  });

  it('6km, order exactly 100k → SHIP_15K (boundary)', () => {
    const r = calculateShipping(6, 100000);
    expect(r.result).toBe(SHIPPING_RESULT.SHIP_15K);
  });

  it('7km exactly, order ≥ 250k → FREESHIP (7km is still in >5–7 zone)', () => {
    const r = calculateShipping(7, 300000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
  });

  it('6km, order < 100k → REJECT (falls through to fallback)', () => {
    const r = calculateShipping(6, 90000);
    expect(r.result).toBe(SHIPPING_RESULT.REJECT);
    expect(r.fee).toBeNull();
  });
});

// ─── calculateShipping — Case 3: >7km–10km ───────────────────────────────────

describe('calculateShipping — >7km–10km', () => {
  it('8km, order ≥ 350k → FREESHIP', () => {
    const r = calculateShipping(8, 350000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
    expect(r.fee).toBe(0);
  });

  it('8km, 250k ≤ order < 350k → SHIP_15K', () => {
    const r = calculateShipping(8, 280000);
    expect(r.result).toBe(SHIPPING_RESULT.SHIP_15K);
    expect(r.fee).toBe(15000);
  });

  it('8km, 100k ≤ order < 250k → SHIP_25K', () => {
    const r = calculateShipping(8, 180000);
    expect(r.result).toBe(SHIPPING_RESULT.SHIP_25K);
    expect(r.fee).toBe(25000);
  });

  it('10km exactly, order ≥ 350k → FREESHIP (10km is still in >7–10 zone)', () => {
    const r = calculateShipping(10, 400000);
    expect(r.result).toBe(SHIPPING_RESULT.FREESHIP);
  });

  it('9km, order < 100k → REJECT (falls through)', () => {
    const r = calculateShipping(9, 50000);
    expect(r.result).toBe(SHIPPING_RESULT.REJECT);
  });

  it('message contains fee amount for SHIP_25K', () => {
    const r = calculateShipping(9, 150000);
    expect(r.message).toContain('25,000đ');
  });
});

// ─── calculateShipping — Case 4: >10km–20km ──────────────────────────────────

describe('calculateShipping — >10km–20km', () => {
  it('15km, order ≥ 2M → SHIP_25K', () => {
    const r = calculateShipping(15, 2000000);
    expect(r.result).toBe(SHIPPING_RESULT.SHIP_25K);
    expect(r.fee).toBe(25000);
  });

  it('15km, order > 2M → SHIP_25K', () => {
    const r = calculateShipping(15, 3000000);
    expect(r.result).toBe(SHIPPING_RESULT.SHIP_25K);
  });

  it('15km, order < 2M → REJECT', () => {
    const r = calculateShipping(15, 1500000);
    expect(r.result).toBe(SHIPPING_RESULT.REJECT);
    expect(r.fee).toBeNull();
  });

  it('20km exactly, order ≥ 2M → SHIP_25K (20km still in >10–20 zone)', () => {
    const r = calculateShipping(20, 2000000);
    expect(r.result).toBe(SHIPPING_RESULT.SHIP_25K);
  });

  it('11km, order 1,999,999đ → REJECT (just under threshold)', () => {
    const r = calculateShipping(11, 1999999);
    expect(r.result).toBe(SHIPPING_RESULT.REJECT);
    expect(r.message).toContain('2,000,000đ');
  });
});

// ─── calculateShipping — Case 5: >20km ───────────────────────────────────────

describe('calculateShipping — >20km (always reject)', () => {
  it('21km → REJECT', () => {
    const r = calculateShipping(21, 5000000);
    expect(r.result).toBe(SHIPPING_RESULT.REJECT);
    expect(r.fee).toBeNull();
  });

  it('50km, huge order → still REJECT', () => {
    const r = calculateShipping(50, 10000000);
    expect(r.result).toBe(SHIPPING_RESULT.REJECT);
  });

  it('message mentions max range (20km)', () => {
    const r = calculateShipping(25, 3000000);
    expect(r.message).toContain('20km');
  });
});

// ─── calculateTotal ───────────────────────────────────────────────────────────

describe('calculateTotal', () => {
  it('sums orderValue + shippingFee + accessoryFee', () => {
    expect(calculateTotal(185000, 15000, 0)).toBe(200000);
  });

  it('defaults shippingFee and accessoryFee to 0', () => {
    expect(calculateTotal(185000)).toBe(185000);
  });

  it('includes accessory fee', () => {
    expect(calculateTotal(200000, 0, 30000)).toBe(230000);
  });
});

// ─── getFreeshippingThreshold ─────────────────────────────────────────────────

describe('getFreeshippingThreshold', () => {
  it('≤5km → 0 (always freeship)', () => {
    expect(getFreeshippingThreshold(3)).toBe(0);
    expect(getFreeshippingThreshold(5)).toBe(0);
  });

  it('≤7km → 250,000đ threshold', () => {
    expect(getFreeshippingThreshold(6)).toBe(250000);
    expect(getFreeshippingThreshold(7)).toBe(250000);
  });

  it('≤10km → 350,000đ threshold', () => {
    expect(getFreeshippingThreshold(8)).toBe(350000);
    expect(getFreeshippingThreshold(10)).toBe(350000);
  });

  it('>10km → null (no freeship available)', () => {
    expect(getFreeshippingThreshold(11)).toBeNull();
    expect(getFreeshippingThreshold(50)).toBeNull();
  });
});

// ─── canDeliver ───────────────────────────────────────────────────────────────

describe('canDeliver', () => {
  it('3km, any value → true', () => {
    expect(canDeliver(3, 50000)).toBe(true);
  });

  it('8km, order 350k → true (freeship zone)', () => {
    expect(canDeliver(8, 350000)).toBe(true);
  });

  it('15km, order 1,500,000đ → false (under 2M threshold)', () => {
    expect(canDeliver(15, 1500000)).toBe(false);
  });

  it('15km, order 2,000,000đ → true (meets 2M threshold)', () => {
    expect(canDeliver(15, 2000000)).toBe(true);
  });

  it('25km → false (beyond range)', () => {
    expect(canDeliver(25, 5000000)).toBe(false);
  });
});
