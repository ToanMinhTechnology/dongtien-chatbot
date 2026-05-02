// orderEngine.js — Sprint 2 business logic for Đồng Tiến chatbot
// All order validation, delivery window, and shipping calculations live here.
// Routes (server/routes/order.js, api/order.js) call evaluateOrder() and render results.

import { Client, TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';
import { CAKE_DATABASE, searchCakes } from '../../src/data/cakeDatabase.js';
import {
  calculateShipping,
  canDeliver,
  getFreeshippingThreshold,
  SHIPPING_RESULT,
} from '../../src/data/shippingMatrix.js';

// Module-level Maps client — reused across requests (Vercel keeps the module warm between invocations)
const _mapsClient = new Client({});

export { SHIPPING_RESULT, canDeliver, getFreeshippingThreshold };

// ─── CAKE CLASSIFICATION ─────────────────────────────────────────────────────

// Mirrors the availability field in cakeDatabase.js
export const CAKE_TYPE = {
  IN_STORE:     'in-store',
  FACTORY:      'factory',
  CUSTOM_ORDER: 'custom-order',
};

/**
 * Find a cake by ID, exact name, or keyword search.
 * Returns the full cake object, or null if not found.
 */
export function findCake(productInput) {
  if (!productInput) return null;
  const q = productInput.trim().toLowerCase();

  // 1. Exact ID match (e.g. "1TIS-003")
  const byId = CAKE_DATABASE.find(c => c.id.toLowerCase() === q);
  if (byId) return byId;

  // 2. Exact name match (case-insensitive)
  const byName = CAKE_DATABASE.find(c => c.name.toLowerCase() === q);
  if (byName) return byName;

  // 3. Scored keyword search — returns ranked results
  const results = searchCakes(productInput);
  return results.length > 0 ? results[0] : null;
}

/**
 * Classify a cake product name into one of the three availability types.
 * Falls back to CUSTOM_ORDER for unknown products (safest default — most lead time).
 *
 * @param {string} productInput — product name or ID from the order form
 * @returns {'in-store'|'factory'|'custom-order'}
 */
export function classifyCake(productInput) {
  const cake = findCake(productInput);
  return cake ? cake.availability : CAKE_TYPE.CUSTOM_ORDER;
}

// ─── KITCHEN SHIFT + DELIVERY WINDOW ─────────────────────────────────────────

// Vietnam is UTC+7. Server may run in UTC (Vercel), so all VN time comparisons
// must convert first.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

// Shift boundaries in minutes from midnight (VN local time)
const CA2_START_MIN = 8 * 60 + 30;  // 08:30 → Ca 2 begins (confirmed boundary)
const CA2_END_MIN   = 13 * 60 + 59; // 13:59 → last minute Ca 2 accepts
const AFTER_CA2_MIN = 14 * 60;      // 14:00 → off-hours, next Ca 1

const SHIFTS = {
  1: { start: '8:00',  end: '11:30' },
  2: { start: '12:30', end: '17:00' },
};

/**
 * Compute the delivery window for an order placed at orderTimestamp.
 *
 * Rules (from DOTICOM docs, confirmed 2026-04-27):
 *   Ca 1 (8:00–11:30):  accepts orders from 14:00 prev day → 08:29:59
 *   Ca 2 (12:30–17:00): accepts orders from 08:30:00 → 13:59:59
 *   08:30:00 exactly  → Ca 2  (boundary decision confirmed)
 *   14:00:00+ (same day) → Ca 1 next day
 *
 * @param {'in-store'|'factory'|'custom-order'} cakeType
 * @param {Date|string|number} [orderTimestamp] — defaults to now
 * @returns {{
 *   shift: number,
 *   deliveryStart: string,
 *   deliveryEnd: string,
 *   dayLabel: string,
 *   message: string,
 * }}
 */
export function getDeliveryWindow(cakeType, orderTimestamp) {
  const now  = orderTimestamp ? new Date(orderTimestamp) : new Date();
  const vnMs = now.getTime() + VN_OFFSET_MS;
  const vn   = new Date(vnMs);
  const totalMin = vn.getUTCHours() * 60 + vn.getUTCMinutes();

  let shift, dayLabel;

  if (totalMin < CA2_START_MIN) {
    // 00:00–08:29 VN → Ca 1 today
    shift    = 1;
    dayLabel = 'hôm nay';
  } else if (totalMin <= CA2_END_MIN) {
    // 08:30–13:59 VN → Ca 2 today
    shift    = 2;
    dayLabel = 'hôm nay';
  } else {
    // 14:00–23:59 VN → Ca 1 tomorrow
    shift    = 1;
    dayLabel = 'ngày mai';
  }

  const { start: deliveryStart, end: deliveryEnd } = SHIFTS[shift];

  const TYPE_LABEL = {
    [CAKE_TYPE.IN_STORE]:     'Bánh có sẵn tại cửa hàng',
    [CAKE_TYPE.FACTORY]:      'Bánh chuyển từ xưởng về',
    [CAKE_TYPE.CUSTOM_ORDER]: 'Bánh đặt theo yêu cầu (tối thiểu 3 tiếng làm bánh)',
  };
  const label = TYPE_LABEL[cakeType] ?? TYPE_LABEL[CAKE_TYPE.CUSTOM_ORDER];
  const message = `${label} — giao ca ${shift} (${deliveryStart}–${deliveryEnd} ${dayLabel}).`;

  return { shift, deliveryStart, deliveryEnd, dayLabel, message };
}

// ─── STORE LOCATIONS ─────────────────────────────────────────────────────────

// Origins used for Distance Matrix queries.
// The API returns one distance per origin; we pick the minimum (nearest store).
export const STORE_LOCATIONS = [
  {
    name: 'Đồng Tiến Bakery — Trụ sở chính',
    address: '75-77-79 Phan Đăng Lưu, Hoà Cường Bắc, Hải Châu, Đà Nẵng',
  },
  // Add branches here as they open, e.g.:
  // { name: 'Chi nhánh Quận X', address: '...' },
];

// ─── DISTANCE + SHIPPING (Sprint 2b) ─────────────────────────────────────────

/**
 * Compute driving distance in km from the nearest Đồng Tiến store to deliveryAddress.
 * Uses Google Maps Distance Matrix API (driving mode, metric units).
 * Queries all STORE_LOCATIONS as origins and returns the minimum distance.
 *
 * Returns null when:
 *   - GOOGLE_MAPS_API_KEY env var is not set
 *   - address is empty / cannot be geocoded
 *   - API call fails or times out
 *
 * Null always triggers the manual-fallback path in evaluateOrder — no silent failures.
 *
 * @param {string} address — delivery address string from the order form
 * @returns {Promise<number|null>} driving distance in km, or null
 */
export async function getDistanceKm(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;           // no key → skip API call, use manual fallback
  if (!address?.trim()) return null;  // empty address → nothing to geocode

  try {
    const origins = STORE_LOCATIONS.map(s => s.address);

    const response = await _mapsClient.distancematrix({
      params: {
        origins,
        destinations: [address],
        mode: TravelMode.driving,
        units: UnitSystem.metric,
        key: apiKey,
      },
      timeout: 5000, // 5s — safe for Vercel's 10s serverless limit
    });

    const rows = response.data?.rows;
    if (!rows?.length) return null;

    // Pick nearest store: iterate all origin rows, return minimum driving km
    let minKm = null;
    for (const row of rows) {
      const el = row.elements?.[0];
      if (el?.status === 'OK' && el.distance?.value != null) {
        const km = el.distance.value / 1000;
        if (minKm === null || km < minKm) minKm = km;
      }
    }

    return minKm; // null if all elements returned non-OK status (e.g. ZERO_RESULTS)
  } catch (err) {
    console.error('getDistanceKm error:', err?.message ?? err);
    return null;
  }
}

// ─── ORDER EVALUATION ─────────────────────────────────────────────────────────

/**
 * Full Sprint 2 order evaluation in one call.
 * Combines classification, delivery window, and shipping estimate.
 *
 * @param {{
 *   product: string,
 *   quantity?: number,
 *   deliveryAddress?: string,
 * }} orderData
 * @returns {Promise<{
 *   cakeType: string,
 *   cakeFound: boolean,
 *   unitPrice: number|null,
 *   orderValue: number,
 *   deliveryWindow: object,
 *   shipping: object|null,
 *   distanceKm: number|null,
 *   requiresManualShipping: boolean,
 *   canFulfill: boolean,
 * }>}
 */
export async function evaluateOrder({ product, quantity = 1, deliveryAddress }) {
  // Step 1: classify cake + get price for shipping threshold calculation
  const cake      = findCake(product);
  const cakeType  = cake ? cake.availability : CAKE_TYPE.CUSTOM_ORDER;
  const cakeFound = cake !== null;
  const unitPrice = cake ? cake.price : null;
  const safeQty   = Math.max(1, Math.min(parseInt(quantity) || 1, 99));
  const orderValue = unitPrice != null ? unitPrice * safeQty : 0;

  // Step 2: delivery window based on order time and cake type
  const deliveryWindow = getDeliveryWindow(cakeType);

  // Step 3: distance + shipping (Sprint 2a: always null → manual fallback)
  const distanceKm = deliveryAddress ? await getDistanceKm(deliveryAddress) : null;

  if (distanceKm !== null) {
    // Sprint 2b path: Maps returned a distance
    const shipping = calculateShipping(distanceKm, orderValue);
    return {
      cakeType,
      cakeFound,
      unitPrice,
      orderValue,
      deliveryWindow,
      shipping,
      distanceKm,
      requiresManualShipping: false,
      canFulfill: shipping.result !== SHIPPING_RESULT.REJECT,
    };
  }

  // Sprint 2a path: no distance → manual shipping confirmation
  return {
    cakeType,
    cakeFound,
    unitPrice,
    orderValue,
    deliveryWindow,
    shipping: null,
    distanceKm: null,
    requiresManualShipping: true,
    canFulfill: true, // assume deliverable until staff confirms
  };
}
