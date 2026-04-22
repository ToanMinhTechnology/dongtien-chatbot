// Order routes - Webhook-first implementation
// No database in Phase 1 - just webhook notifications

import { Router } from 'express';
import { trackEvent } from '../src/utils/analytics.js';

export const orderRouter = Router();

// POST /api/order - Create new order via webhook
orderRouter.post('/order', async (req, res) => {
  try {
    const { customerName, phone, product, quantity, deliveryDate, notes, deliveryAddress } = req.body;

    // Validate required fields
    if (!customerName || !phone || !product) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin bắt buộc: tên, số điện thoại, và sản phẩm'
      });
    }

    // Build order object
    const order = {
      id: `ORD-${Date.now()}`,
      customerName,
      phone,
      product,
      quantity: quantity || 1,
      deliveryDate: deliveryDate || null,
      deliveryAddress: deliveryAddress || null,
      notes: notes || null,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // WEBHOOK NOTIFICATION (Phase 1: console.log only)
    // Later: Zalo webhook, email, SMS
    console.log('═══════════════════════════════════════');
    console.log('📦 NEW ORDER via Chatbot');
    console.log('═══════════════════════════════════════');
    console.log(`🆔 Order ID: ${order.id}`);
    console.log(`👤 Customer: ${order.customerName}`);
    console.log(`📱 Phone: ${order.phone}`);
    console.log(`🍰 Product: ${order.quantity}x ${order.product}`);
    if (order.deliveryDate) console.log(`📅 Delivery: ${order.deliveryDate}`);
    if (order.deliveryAddress) console.log(`📍 Address: ${order.deliveryAddress}`);
    if (order.notes) console.log(`📝 Notes: ${order.notes}`);
    console.log(`⏰ Time: ${order.createdAt}`);
    console.log('═══════════════════════════════════════');

    // Track analytics
    trackEvent('ORDER_CONFIRMED', {
      orderId: order.id,
      product: order.product,
      customerName: order.customerName
    });

    // Response
    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được gửi! Đồng Tiền sẽ liên hệ xác nhận sớm nhất.',
      orderId: order.id,
      order: order
    });

  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra. Vui lòng liên hệ Zalo 0935226206'
    });
  }
});

// GET /api/order/:id - Check order status (Phase 1: stub only)
orderRouter.get('/order/:id', (req, res) => {
  // Phase 1: No database, so we can't check real status
  // Return stub response
  res.json({
    success: false,
    message: 'Tính năng kiểm tra đơn hàng đang được phát triển. Vui lòng liên hệ Zalo 0935226206'
  });
});

// POST /api/webhook/test - Test webhook
orderRouter.post('/webhook/test', (req, res) => {
  console.log('🧪 Webhook test received:', req.body);
  res.json({ success: true, message: 'Webhook test OK' });
});
