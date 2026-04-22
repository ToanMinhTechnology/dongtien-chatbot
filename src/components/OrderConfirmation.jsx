// Order Confirmation Component - Đồng Tiền Chatbot
// Hiển thị chi tiết đơn hàng + action buttons

import React from 'react';

const OrderConfirmation = ({ orderDetails, onConfirm, onCancel, onChatZalo }) => {
  if (!orderDetails) return null;

  const { customerName, phone, product, quantity, deliveryDate, deliveryAddress, notes } = orderDetails;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa chọn';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '16px',
      margin: '10px 0',
      color: 'white'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontSize: '14px',
        fontWeight: 600
      }}>
        <span style={{ fontSize: '18px' }}>🎂</span>
        XÁC NHẬN ĐẶT BÁNH
      </div>

      {/* Order Details */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        fontSize: '13px'
      }}>
        <div style={{ marginBottom: '6px' }}>
          <strong>👤 Khách hàng:</strong> {customerName || 'Chưa nhập'}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <strong>📱 Điện thoại:</strong> {phone || 'Chưa nhập'}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <strong>🍰 Sản phẩm:</strong> {quantity || 1}x {product || 'Chưa chọn'}
        </div>
        {deliveryDate && (
          <div style={{ marginBottom: '6px' }}>
            <strong>📅 Ngày nhận:</strong> {formatDate(deliveryDate)}
          </div>
        )}
        {deliveryAddress && (
          <div style={{ marginBottom: '6px' }}>
            <strong>📍 Địa chỉ giao:</strong> {deliveryAddress}
          </div>
        )}
        {notes && (
          <div style={{ fontStyle: 'italic', opacity: 0.9 }}>
            <strong>📝 Ghi chú:</strong> {notes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '10px 16px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          ✓ Xác nhận đặt bánh
        </button>

        {/* Chat Zalo Button */}
        <button
          onClick={onChatZalo}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          💬 Chat Zalo: 0935226206
        </button>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            color: 'rgba(255,255,255,0.8)',
            border: 'none',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '4px'
          }}
        >
          Hủy
        </button>
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '11px',
        opacity: 0.8,
        textAlign: 'center'
      }}>
        Đồng Tiền sẽ gọi xác nhận trong 30 phút
      </div>
    </div>
  );
};

export default OrderConfirmation;
