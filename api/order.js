import { randomUUID } from 'crypto';

const PHONE_RE = /^[0-9]{10,11}$/;
const maskPhone = (phone) => phone ? phone.slice(0, 4) + '****' + phone.slice(-2) : '****';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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

    console.log('NEW ORDER via Chatbot:', JSON.stringify({
      id: order.id,
      phone: maskPhone(order.phone),
      product: `${order.quantity}x ${order.product}`,
      deliveryDate: order.deliveryDate,
      createdAt: order.createdAt
    }));

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
}
