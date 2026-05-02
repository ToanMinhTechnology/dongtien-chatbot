import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const OWNER_EMAIL = 'tiembanhvani.com@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendOrderNotification(order, estimate) {
  if (!process.env.RESEND_API_KEY) return;

  const shippingLine = estimate.requiresManualShipping
    ? 'Phí ship: sẽ xác nhận khi liên hệ khách'
    : `Phí ship: ${estimate.shipping?.fee != null ? estimate.shipping.fee.toLocaleString('vi-VN') + 'đ' : estimate.shipping?.message ?? 'Nội thành'}`;

  const html = `
<h2>🎂 Đơn hàng mới — ${order.id}</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0;color:#666">Khách</td><td><strong>${order.customerName}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">SĐT</td><td>${order.phone}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Sản phẩm</td><td>${order.quantity}x ${order.product} (${order.cakeType})</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Ngày nhận</td><td>${order.deliveryDate ?? 'Chưa xác định'}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Địa chỉ</td><td>${order.deliveryAddress ?? 'Nhận tại tiệm'}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Ship</td><td>${shippingLine}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Ghi chú</td><td>${order.notes ?? '—'}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Thời gian</td><td>${new Date(order.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td></tr>
</table>
<p style="margin-top:16px;color:#888;font-size:12px">Đơn qua chatbot tiembanhvani.com</p>
`;

  await resend.emails.send({
    from: `Vani Chatbot <${FROM_EMAIL}>`,
    to: OWNER_EMAIL,
    subject: `🎂 Đơn mới ${order.id} — ${order.customerName} — ${order.quantity}x ${order.product}`,
    html,
  });
}
