// Unit tests for server/services/orderEngine.js
// Tests run in Node (via vitest) — no browser needed.

import { describe, it, expect } from 'vitest';
import {
  classifyCake,
  findCake,
  getDeliveryWindow,
  evaluateOrder,
  CAKE_TYPE,
} from '../../server/services/orderEngine.js';

// Helper: build a Date at a given VN local time (h:m) so getDeliveryWindow
// receives a UTC timestamp that corresponds to exactly that VN hour/minute.
// VN = UTC+7, so VN 8:30 = UTC 1:30
const vnDate = (h, m = 0) => new Date(Date.UTC(2026, 0, 15, h - 7, m));

// ─── classifyCake ─────────────────────────────────────────────────────────────

describe('classifyCake', () => {
  it('classifies in-store cake by ID', () => {
    expect(classifyCake('1S3-011')).toBe(CAKE_TYPE.IN_STORE);
  });

  it('classifies in-store cake by ID (case-insensitive)', () => {
    expect(classifyCake('1s3-011')).toBe(CAKE_TYPE.IN_STORE);
  });

  it('classifies factory cake by ID', () => {
    expect(classifyCake('1TIS-003')).toBe(CAKE_TYPE.FACTORY);
  });

  it('classifies factory cake by partial name (tiramisu)', () => {
    expect(classifyCake('bánh tiramisu')).toBe(CAKE_TYPE.FACTORY);
  });

  it('classifies factory cake by partial name (chanh dây)', () => {
    expect(classifyCake('chanh dây')).toBe(CAKE_TYPE.FACTORY);
  });

  it('classifies in-store cake by partial name (rau câu nhỏ)', () => {
    // 1RCS series are in-store
    expect(classifyCake('1RCS-001')).toBe(CAKE_TYPE.IN_STORE);
  });

  it('classifies factory cake (set nhiều vị)', () => {
    expect(classifyCake('SET-9HU')).toBe(CAKE_TYPE.FACTORY);
  });

  it('falls back to custom-order for unknown product', () => {
    expect(classifyCake('bánh không tồn tại xyz')).toBe(CAKE_TYPE.CUSTOM_ORDER);
  });

  it('falls back to custom-order for empty string', () => {
    expect(classifyCake('')).toBe(CAKE_TYPE.CUSTOM_ORDER);
  });

  it('falls back to custom-order for null', () => {
    expect(classifyCake(null)).toBe(CAKE_TYPE.CUSTOM_ORDER);
  });
});

// ─── findCake ─────────────────────────────────────────────────────────────────

describe('findCake', () => {
  it('returns cake object for known ID', () => {
    const cake = findCake('1TIS-004');
    expect(cake).not.toBeNull();
    expect(cake.availability).toBe('factory');
    expect(cake.price).toBeGreaterThan(0);
  });

  it('returns null for unknown product', () => {
    expect(findCake('bánh lạ không có trong db')).toBeNull();
  });
});

// ─── getDeliveryWindow — shift boundaries ─────────────────────────────────────

describe('getDeliveryWindow — shift boundary rules', () => {
  // Ca 1 territory: 00:00–08:29 VN
  it('00:00 VN → Ca 1 hôm nay', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(0, 0));
    expect(w.shift).toBe(1);
    expect(w.dayLabel).toBe('hôm nay');
  });

  it('08:29 VN → Ca 1 hôm nay', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(8, 29));
    expect(w.shift).toBe(1);
    expect(w.dayLabel).toBe('hôm nay');
  });

  // Boundary: 08:30 belongs to Ca 2 (confirmed)
  it('08:30 VN → Ca 2 hôm nay (confirmed boundary)', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(8, 30));
    expect(w.shift).toBe(2);
    expect(w.dayLabel).toBe('hôm nay');
  });

  it('13:59 VN → Ca 2 hôm nay', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(13, 59));
    expect(w.shift).toBe(2);
    expect(w.dayLabel).toBe('hôm nay');
  });

  it('14:00 VN → Ca 1 ngày mai', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(14, 0));
    expect(w.shift).toBe(1);
    expect(w.dayLabel).toBe('ngày mai');
  });

  it('23:59 VN → Ca 1 ngày mai', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(23, 59));
    expect(w.shift).toBe(1);
    expect(w.dayLabel).toBe('ngày mai');
  });
});

describe('getDeliveryWindow — shift time ranges', () => {
  it('Ca 1 returns correct time range', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(7, 0));
    expect(w.deliveryStart).toBe('8:00');
    expect(w.deliveryEnd).toBe('11:30');
  });

  it('Ca 2 returns correct time range', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(10, 0));
    expect(w.deliveryStart).toBe('12:30');
    expect(w.deliveryEnd).toBe('17:00');
  });
});

describe('getDeliveryWindow — message per cake type', () => {
  it('in-store message mentions cửa hàng', () => {
    const w = getDeliveryWindow(CAKE_TYPE.IN_STORE, vnDate(7, 0));
    expect(w.message).toContain('cửa hàng');
  });

  it('factory message mentions xưởng', () => {
    const w = getDeliveryWindow(CAKE_TYPE.FACTORY, vnDate(7, 0));
    expect(w.message).toContain('xưởng');
  });

  it('custom-order message mentions 3 tiếng', () => {
    const w = getDeliveryWindow(CAKE_TYPE.CUSTOM_ORDER, vnDate(7, 0));
    expect(w.message).toContain('3 tiếng');
  });
});

// ─── evaluateOrder ────────────────────────────────────────────────────────────

describe('evaluateOrder', () => {
  it('returns manual shipping when no address provided', async () => {
    const result = await evaluateOrder({ product: '1S3-011', quantity: 1 });
    expect(result.requiresManualShipping).toBe(true);
    expect(result.canFulfill).toBe(true);
    expect(result.shipping).toBeNull();
  });

  it('returns manual shipping when address given but GOOGLE_MAPS_API_KEY not set', async () => {
    const result = await evaluateOrder({
      product: '1TIS-003',
      quantity: 2,
      deliveryAddress: '123 Nguyễn Văn Linh, Quận 7',
    });
    expect(result.requiresManualShipping).toBe(true);
    expect(result.distanceKm).toBeNull();
  });

  it('correctly classifies known in-store product', async () => {
    const result = await evaluateOrder({ product: '1S3-023', quantity: 1 });
    expect(result.cakeType).toBe(CAKE_TYPE.IN_STORE);
    expect(result.cakeFound).toBe(true);
  });

  it('correctly classifies known factory product', async () => {
    const result = await evaluateOrder({ product: '1TIT-008', quantity: 1 });
    expect(result.cakeType).toBe(CAKE_TYPE.FACTORY);
    expect(result.unitPrice).toBe(210000);
    expect(result.orderValue).toBe(210000);
  });

  it('computes orderValue = unitPrice * quantity', async () => {
    const result = await evaluateOrder({ product: '1TIS-003', quantity: 3 });
    expect(result.orderValue).toBe(185000 * 3);
  });

  it('falls back to custom-order for unknown product', async () => {
    const result = await evaluateOrder({ product: 'bánh lạ không có', quantity: 1 });
    expect(result.cakeType).toBe(CAKE_TYPE.CUSTOM_ORDER);
    expect(result.cakeFound).toBe(false);
    expect(result.unitPrice).toBeNull();
    expect(result.orderValue).toBe(0);
  });

  it('includes deliveryWindow in result', async () => {
    const result = await evaluateOrder({ product: '1S3-011', quantity: 1 });
    expect(result.deliveryWindow).toHaveProperty('shift');
    expect(result.deliveryWindow).toHaveProperty('message');
    expect(result.deliveryWindow).toHaveProperty('dayLabel');
  });
});

