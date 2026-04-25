// Order routes - Webhook-first implementation
// No database in Phase 1 - just webhook notifications
// TODO Phase 2: replace console.log with Zalo webhook / email — logs below contain PII

import { Router } from 'express';
import { randomUUID } from 'crypto';

export const orderRouter = Router();

const PHONE_RE = /^[0-9]{10,11}$/;

// Mask middle digits of phone for logs: 0935226206 → 0935****06
const maskPhone = (phone) => phone.slice(0, 4) + '****' + phone.slice(-2);

// POST /api/order - Create new order via webhook
orderRouter.post('/order', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      product,
      quantity,
      deliveryDate,
      notes,
      deliveryAddress
    } = req.body;

    // Trim and validate required fields
    const trimmedName = (customerName || '').trim();
    const trimmedPhone = (phone || '').replace(/\s/g, '');
    const trimmedProduct = (product || '').trim();

    if (!trimmedName || !trimmedPhone || !trimmedProduct) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin bắt buộc: tên, số điện thoại, và sản phẩm'
      });
    }

    if (!PHONE_RE.test(trimmedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Số điện thoại không hợp lệ (cần 10-11 chữ số)'
      });
    }

    // Build order object
    const order = {
      id: `ORD-${randomUUID().split('-')[0].toUpperCase()}`,
      customerName: trimmedName,
      phone: trimmedPhone,
      product: trimmedProduct,
      quantity: Math.max(1, Math.min(parseInt(quantity) || 1, 99)),
      deliveryDate: deliveryDate || null,
      deliveryAddress: deliveryAddress || null,
      notes: notes || null,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // WEBHOOK NOTIFICATION (Phase 1: console.log only — phone is partially masked)
    // Phase 2: replace with Zalo webhook / email to avoid PII in application logs
    console.log('═══════════════════════════════════════');
    console.log('📦 NEW ORDER via Chatbot');
    console.log('═══════════════════════════════════════');
    console.log(`🆔 Order ID: ${order.id}`);
    console.log(`👤 Customer: [REDACTED]`);
    console.log(`📱 Phone: ${maskPhone(order.phone)}`);
    console.log(`🍰 Product: ${order.quantity}x ${order.product}`);
    if (order.deliveryDate) console.log(`📅 Delivery: ${order.deliveryDate}`);
    if (order.deliveryAddress) console.log(`📍 Address: [REDACTED]`);
    if (order.notes) console.log(`📝 Notes: [REDACTED]`);
    console.log(`⏰ Time: ${order.createdAt}`);
    console.log('═══════════════════════════════════════');

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được gửi! Vani sẽ liên hệ xác nhận sớm nhất.',
      orderId: order.id
    });

  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra. Vui lòng liên hệ Zalo 0935 226 206'
    });
  }
});

// GET /api/order/:id - Check order status (Phase 1: stub only)
orderRouter.get('/order/:id', (req, res) => {
  // Phase 1: No database, so we can't check real status
  res.json({
    success: false,
    message: 'Tính năng kiểm tra đơn hàng đang được phát triển. Vui lòng liên hệ Zalo 0935 226 206'
  });
});

// POST /api/webhook/test - Test webhook (dev only)
orderRouter.post('/webhook/test', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ success: false });
  }
  console.log('🧪 Webhook test received:', JSON.stringify(req.body));
  res.json({ success: true, message: 'Webhook test OK' });
});
