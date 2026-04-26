// Tests for order route validation logic extracted as pure functions
// We test the validation rules directly without spinning up Express
import { describe, it, expect } from 'vitest'

// --- Mirror the validation logic from server/routes/order.js ---
const PHONE_RE = /^[0-9]{10,11}$/

const maskPhone = (phone) => phone.slice(0, 4) + '****' + phone.slice(-2)

const validateOrder = ({ customerName, phone, product, quantity }) => {
  const trimmedName = (customerName || '').trim()
  const trimmedPhone = (phone || '').replace(/\s/g, '')
  const trimmedProduct = (product || '').trim()

  if (!trimmedName || !trimmedPhone || !trimmedProduct) {
    return { valid: false, error: 'Thiếu thông tin bắt buộc: tên, số điện thoại, và sản phẩm' }
  }
  if (!PHONE_RE.test(trimmedPhone)) {
    return { valid: false, error: 'Số điện thoại không hợp lệ (cần 10-11 chữ số)' }
  }
  const safeQty = Math.max(1, Math.min(parseInt(quantity) || 1, 99))
  return { valid: true, trimmedName, trimmedPhone, trimmedProduct, safeQty }
}

// ---

describe('order route validation logic', () => {
  it('rejects missing customerName', () => {
    const result = validateOrder({ customerName: '', phone: '0935226206', product: 'Bánh kem' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('bắt buộc')
  })

  it('rejects missing phone', () => {
    const result = validateOrder({ customerName: 'An', phone: '', product: 'Bánh kem' })
    expect(result.valid).toBe(false)
  })

  it('rejects missing product', () => {
    const result = validateOrder({ customerName: 'An', phone: '0935226206', product: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects phone with fewer than 10 digits', () => {
    const result = validateOrder({ customerName: 'An', phone: '093522620', product: 'Bánh kem' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('10-11')
  })

  it('rejects phone with more than 11 digits', () => {
    const result = validateOrder({ customerName: 'An', phone: '093522620699', product: 'Bánh kem' })
    expect(result.valid).toBe(false)
  })

  it('rejects phone with non-digit characters', () => {
    const result = validateOrder({ customerName: 'An', phone: '09352abc06', product: 'Bánh kem' })
    expect(result.valid).toBe(false)
  })

  it('accepts valid 10-digit phone', () => {
    const result = validateOrder({ customerName: 'An', phone: '0935226206', product: 'Bánh kem' })
    expect(result.valid).toBe(true)
  })

  it('accepts valid 11-digit phone', () => {
    const result = validateOrder({ customerName: 'An', phone: '09352262069', product: 'Bánh kem' })
    expect(result.valid).toBe(true)
  })

  it('strips whitespace from phone before validation', () => {
    const result = validateOrder({ customerName: 'An', phone: '0935 226 206', product: 'Bánh kem' })
    expect(result.valid).toBe(true)
    expect(result.trimmedPhone).toBe('0935226206')
  })

  it('clamps quantity to 1 when not provided', () => {
    const result = validateOrder({ customerName: 'An', phone: '0935226206', product: 'Bánh kem' })
    expect(result.safeQty).toBe(1)
  })

  it('clamps quantity to 99 maximum', () => {
    const result = validateOrder({ customerName: 'An', phone: '0935226206', product: 'Bánh kem', quantity: 200 })
    expect(result.safeQty).toBe(99)
  })

  it('clamps quantity to 1 minimum for zero or negative', () => {
    const result = validateOrder({ customerName: 'An', phone: '0935226206', product: 'Bánh kem', quantity: 0 })
    expect(result.safeQty).toBe(1)
  })
})

describe('maskPhone', () => {
  it('masks middle digits of 10-digit phone', () => {
    expect(maskPhone('0935226206')).toBe('0935****06')
  })

  it('preserves first 4 and last 2 digits', () => {
    const masked = maskPhone('09123456789')
    expect(masked.startsWith('0912')).toBe(true)
    expect(masked.endsWith('89')).toBe(true)
    expect(masked).toContain('****')
  })
})
