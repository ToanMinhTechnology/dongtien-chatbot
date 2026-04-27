/**
 * shippingMatrix.js
 * Nguồn: Tài liệu nghiệp vụ DOTICOM — Requirement_cho_phân_tích_nghiệp_vụ.docx
 * Cập nhật: 2026-04-27
 *
 * BẢNG PHÍ SHIP THEO KHOẢNG CÁCH × GIÁ TRỊ ĐƠN HÀNG
 * ┌─────────────────┬──────────────────┬────────────┐
 * │ Khoảng cách     │ Giá trị đơn      │ Phí ship   │
 * ├─────────────────┼──────────────────┼────────────┤
 * │ ≤ 5km           │ Bất kỳ           │ FREESHIP   │
 * │ > 5km – 7km     │ ≥ 250,000đ       │ FREESHIP   │
 * │ > 5km – 7km     │ 100k – < 250k    │ 15,000đ    │
 * │ > 7km – 10km    │ ≥ 350,000đ       │ FREESHIP   │
 * │ > 7km – 10km    │ 250k – < 350k    │ 15,000đ    │
 * │ > 7km – 10km    │ 100k – < 250k    │ 25,000đ    │
 * │ > 10km – 20km   │ ≥ 2,000,000đ     │ 25,000đ    │
 * │ > 10km          │ < 2,000,000đ     │ TỪ CHỐI    │
 * └─────────────────┴──────────────────┴────────────┘
 */

export const SHIPPING_RESULT = {
  FREESHIP: "freeship",
  SHIP_15K: "ship_15k",
  SHIP_25K: "ship_25k",
  REJECT:   "reject",
};

/**
 * Tính phí ship
 * @param {number} distanceKm   — khoảng cách thực tế từ Google Maps (km)
 * @param {number} orderValue   — giá trị đơn hàng (VNĐ), chưa gồm phí ship
 * @returns {{ result: string, fee: number, message: string }}
 */
export function calculateShipping(distanceKm, orderValue) {
  const km = distanceKm;
  const v  = orderValue;

  // Case 1 — ≤ 5km: FREESHIP không điều kiện
  if (km <= 5) {
    return {
      result:  SHIPPING_RESULT.FREESHIP,
      fee:     0,
      message: `Freeship — khoảng cách ${km.toFixed(1)}km ≤ 5km.`
    };
  }

  // Case 2 — > 5km đến 7km
  if (km > 5 && km <= 7) {
    if (v >= 250000) {
      return {
        result:  SHIPPING_RESULT.FREESHIP,
        fee:     0,
        message: `Freeship — khoảng cách ${km.toFixed(1)}km, đơn hàng ${_fmt(v)} ≥ 250,000đ.`
      };
    }
    if (v >= 100000) {
      return {
        result:  SHIPPING_RESULT.SHIP_15K,
        fee:     15000,
        message: `Phí ship 15,000đ — khoảng cách ${km.toFixed(1)}km, đơn hàng ${_fmt(v)}.`
      };
    }
  }

  // Case 3 — > 7km đến 10km
  if (km > 7 && km <= 10) {
    if (v >= 350000) {
      return {
        result:  SHIPPING_RESULT.FREESHIP,
        fee:     0,
        message: `Freeship — khoảng cách ${km.toFixed(1)}km, đơn hàng ${_fmt(v)} ≥ 350,000đ.`
      };
    }
    if (v >= 250000) {
      return {
        result:  SHIPPING_RESULT.SHIP_15K,
        fee:     15000,
        message: `Phí ship 15,000đ — khoảng cách ${km.toFixed(1)}km, đơn hàng ${_fmt(v)}.`
      };
    }
    if (v >= 100000) {
      return {
        result:  SHIPPING_RESULT.SHIP_25K,
        fee:     25000,
        message: `Phí ship 25,000đ — khoảng cách ${km.toFixed(1)}km, đơn hàng ${_fmt(v)}.`
      };
    }
  }

  // Case 4 — > 10km đến 20km: chỉ nhận đơn ≥ 2 triệu
  if (km > 10 && km <= 20) {
    if (v >= 2000000) {
      return {
        result:  SHIPPING_RESULT.SHIP_25K,
        fee:     25000,
        message: `Phí ship 25,000đ — khoảng cách ${km.toFixed(1)}km, đơn hàng ${_fmt(v)} ≥ 2,000,000đ.`
      };
    }
    return {
      result:  SHIPPING_RESULT.REJECT,
      fee:     null,
      message: `Không nhận đơn — khoảng cách ${km.toFixed(1)}km > 10km nhưng đơn hàng ${_fmt(v)} < 2,000,000đ. Vui lòng đặt thêm hoặc đến cửa hàng.`
    };
  }

  // Case 5 — > 20km: không nhận
  if (km > 20) {
    return {
      result:  SHIPPING_RESULT.REJECT,
      fee:     null,
      message: `Không nhận đơn — khoảng cách ${km.toFixed(1)}km vượt quá phạm vi giao hàng (tối đa 20km).`
    };
  }

  // Fallback — giá trị đơn quá thấp
  return {
    result:  SHIPPING_RESULT.REJECT,
    fee:     null,
    message: `Không nhận đơn — giá trị đơn hàng ${_fmt(v)} không đủ điều kiện.`
  };
}

/**
 * Tính tổng tiền đơn hàng
 * @param {number} orderValue     — giá bánh
 * @param {number} shippingFee    — phí ship (từ calculateShipping)
 * @param {number} accessoryFee   — phí phụ kiện thêm (nếu có)
 * @returns {number} tổng tiền
 */
export function calculateTotal(orderValue, shippingFee = 0, accessoryFee = 0) {
  return orderValue + shippingFee + accessoryFee;
}

/**
 * Freeship threshold — trả về số tiền tối thiểu để được freeship
 * ở khoảng cách nhất định (hữu ích khi bot muốn gợi ý upsell)
 * @param {number} distanceKm
 * @returns {number|null} ngưỡng freeship, hoặc null nếu không có
 */
export function getFreeshippingThreshold(distanceKm) {
  if (distanceKm <= 5)  return 0;        // Luôn freeship
  if (distanceKm <= 7)  return 250000;   // ≥ 250k → freeship
  if (distanceKm <= 10) return 350000;   // ≥ 350k → freeship
  return null;                           // > 10km không có freeship
}

/**
 * Kiểm tra nhanh đơn có thể giao không
 */
export function canDeliver(distanceKm, orderValue) {
  const r = calculateShipping(distanceKm, orderValue);
  return r.result !== SHIPPING_RESULT.REJECT;
}

// ─── INTERNAL ────────────────────────────────────────────
function _fmt(n) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default { calculateShipping, calculateTotal, getFreeshippingThreshold, canDeliver, SHIPPING_RESULT };
