// Sprint 2b tests — evaluateOrder() when Google Maps returns a real distance.
// Isolated from orderEngine.test.js to keep the vi.mock() scope contained.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// vi.hoisted ensures the mock variable is available inside the factory,
// which vitest hoists to the top of the module before imports resolve.
const mockDistancematrix = vi.hoisted(() => vi.fn());

vi.mock('@googlemaps/google-maps-services-js', () => ({
  // Must be a class (or constructor function) because orderEngine.js calls `new Client({})`.
  Client: class MockClient {
    distancematrix = mockDistancematrix;
  },
  TravelMode: { driving: 'driving' },
  UnitSystem:  { metric: 'metric' },
}));

import { evaluateOrder, CAKE_TYPE } from '../../server/services/orderEngine.js';

const ORIG_KEY = process.env.GOOGLE_MAPS_API_KEY;

describe('evaluateOrder — Sprint 2b (Maps distance known)', () => {
  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';
  });

  afterEach(() => {
    if (ORIG_KEY === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = ORIG_KEY;
    vi.clearAllMocks();
  });

  it('3km delivery → requiresManualShipping false, canFulfill true, fee 0', async () => {
    mockDistancematrix.mockResolvedValue({
      data: { rows: [{ elements: [{ status: 'OK', distance: { value: 3000 } }] }] },
    });
    const result = await evaluateOrder({
      product: '1TIS-003',
      quantity: 1,
      deliveryAddress: 'Quận 1, Đà Nẵng',
    });
    expect(result.requiresManualShipping).toBe(false);
    expect(result.distanceKm).toBe(3);
    expect(result.canFulfill).toBe(true);
    expect(result.shipping).not.toBeNull();
    expect(result.shipping.fee).toBe(0);
  });

  it('15km, single-cake order (185k) → canFulfill false (below 2M reject threshold)', async () => {
    mockDistancematrix.mockResolvedValue({
      data: { rows: [{ elements: [{ status: 'OK', distance: { value: 15000 } }] }] },
    });
    const result = await evaluateOrder({
      product: '1TIS-003',
      quantity: 1,
      deliveryAddress: 'xa xa',
    });
    expect(result.requiresManualShipping).toBe(false);
    expect(result.distanceKm).toBe(15);
    expect(result.canFulfill).toBe(false);
    expect(result.shipping.fee).toBeNull();
  });

  it('Maps returns non-OK element → falls back to manual shipping', async () => {
    mockDistancematrix.mockResolvedValue({
      data: { rows: [{ elements: [{ status: 'NOT_FOUND' }] }] },
    });
    const result = await evaluateOrder({
      product: '1S3-011',
      quantity: 1,
      deliveryAddress: 'hẻm không tìm được',
    });
    expect(result.requiresManualShipping).toBe(true);
    expect(result.distanceKm).toBeNull();
  });

  it('Maps throws network error → falls back gracefully (no crash)', async () => {
    mockDistancematrix.mockRejectedValue(new Error('Network error'));
    const result = await evaluateOrder({
      product: '1S3-011',
      quantity: 1,
      deliveryAddress: 'test address',
    });
    expect(result.requiresManualShipping).toBe(true);
    expect(result.distanceKm).toBeNull();
    expect(result.canFulfill).toBe(true); // manual path is always fulfillable
  });

  it('multiple store origins: picks nearest (minimum distance)', async () => {
    mockDistancematrix.mockResolvedValue({
      data: {
        rows: [
          { elements: [{ status: 'OK', distance: { value: 8000 } }] }, // 8km
          { elements: [{ status: 'OK', distance: { value: 4000 } }] }, // 4km — nearest
        ],
      },
    });
    const result = await evaluateOrder({
      product: '1TIS-003',
      quantity: 1,
      deliveryAddress: 'somewhere',
    });
    expect(result.distanceKm).toBe(4);
    expect(result.shipping.fee).toBe(0); // 4km ≤ 5km → FREESHIP
  });

  it('6km, order 150k → SHIP_15K fee applied', async () => {
    mockDistancematrix.mockResolvedValue({
      data: { rows: [{ elements: [{ status: 'OK', distance: { value: 6000 } }] }] },
    });
    const result = await evaluateOrder({
      product: '1S3-011',
      quantity: 1,
      deliveryAddress: 'Quận 3, Đà Nẵng',
    });
    // 1S3-011 price should be < 250k — checking fee is 15k for 6km + 100-250k range
    expect(result.distanceKm).toBe(6);
    expect(result.canFulfill).toBe(true);
    expect(result.shipping.fee).toBe(15000);
  });
});
