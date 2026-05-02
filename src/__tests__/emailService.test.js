import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEmailsSend = vi.hoisted(() => vi.fn().mockResolvedValue({ id: 'email-id' }));

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockEmailsSend };
  },
}));

import { sendOrderNotification } from '../../server/services/emailService.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ORDER = {
  id: 'TEST-001',
  customerName: 'Nguyễn Văn A',
  phone: '0912345678',
  product: 'Bánh kem tiramisu',
  cakeType: 'custom',
  quantity: 1,
  deliveryDate: '2026-05-10',
  deliveryAddress: '123 Lý Thường Kiệt',
  notes: 'Viết: Happy Birthday',
  createdAt: '2026-05-01T10:00:00Z',
};

const ESTIMATE_WITH_FEE = {
  requiresManualShipping: false,
  shipping: { fee: 30000, message: null },
};

const ESTIMATE_MANUAL_SHIPPING = {
  requiresManualShipping: true,
  shipping: null,
};

const ESTIMATE_NO_FEE = {
  requiresManualShipping: false,
  shipping: { fee: null, message: 'Nội thành miễn phí' },
};

// ── sendOrderNotification ─────────────────────────────────────────────────────

describe('sendOrderNotification', () => {
  const ORIG_KEY = process.env.RESEND_API_KEY;

  beforeEach(() => {
    mockEmailsSend.mockReset();
    mockEmailsSend.mockResolvedValue({ id: 'email-id' });
  });

  afterEach(() => {
    if (ORIG_KEY === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = ORIG_KEY;
  });

  it('returns early without calling Resend when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY;
    await sendOrderNotification(ORDER, ESTIMATE_WITH_FEE);
    expect(mockEmailsSend).not.toHaveBeenCalled();
  });

  it('sends email when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    await sendOrderNotification(ORDER, ESTIMATE_WITH_FEE);
    expect(mockEmailsSend).toHaveBeenCalledTimes(1);
  });

  it('includes order ID in email subject', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    await sendOrderNotification(ORDER, ESTIMATE_WITH_FEE);
    const { subject } = mockEmailsSend.mock.calls[0][0];
    expect(subject).toContain('TEST-001');
  });

  it('uses manual shipping line when requiresManualShipping is true', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    await sendOrderNotification(ORDER, ESTIMATE_MANUAL_SHIPPING);
    const { html } = mockEmailsSend.mock.calls[0][0];
    expect(html).toContain('sẽ xác nhận khi liên hệ khách');
  });

  it('formats fee in VND when fee is set', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    await sendOrderNotification(ORDER, ESTIMATE_WITH_FEE);
    const { html } = mockEmailsSend.mock.calls[0][0];
    expect(html).toContain('30.000đ');
  });

  it('falls back to shipping.message when fee is null', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    await sendOrderNotification(ORDER, ESTIMATE_NO_FEE);
    const { html } = mockEmailsSend.mock.calls[0][0];
    expect(html).toContain('Nội thành miễn phí');
  });

  it('includes customer name, phone, product in HTML body', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    await sendOrderNotification(ORDER, ESTIMATE_WITH_FEE);
    const { html } = mockEmailsSend.mock.calls[0][0];
    expect(html).toContain('Nguyễn Văn A');
    expect(html).toContain('0912345678');
    expect(html).toContain('Bánh kem tiramisu');
  });

  it('falls back gracefully when deliveryDate and deliveryAddress are null', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    const orderNoAddress = { ...ORDER, deliveryDate: null, deliveryAddress: null };
    await sendOrderNotification(orderNoAddress, ESTIMATE_WITH_FEE);
    const { html } = mockEmailsSend.mock.calls[0][0];
    expect(html).toContain('Chưa xác định');
    expect(html).toContain('Nhận tại tiệm');
  });
});
