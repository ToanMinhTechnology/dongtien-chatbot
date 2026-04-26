// Order Form Component - Collect order details from user
// Used when user wants to order

import React, { useState } from 'react';

const OrderForm = ({ onSubmit, onCancel, onChatZalo }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    product: '',
    quantity: 1,
    deliveryDate: '',
    deliveryAddress: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Vui lòng nhập tên';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.product.trim()) {
      newErrors.product = 'Vui lòng nhập loại bánh';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${hasError ? '#ff6b6b' : 'rgba(255,255,255,0.3)'}`,
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: 600,
    opacity: 0.9
  };

  const errorStyle = {
    color: '#ff6b6b',
    fontSize: '11px',
    marginTop: '2px'
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
        marginBottom: '16px',
        fontSize: '14px',
        fontWeight: 600
      }}>
        <span style={{ fontSize: '18px' }}>🎂</span>
        ĐIỀN THÔNG TIN ĐẶT BÁNH
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>1️⃣ Tên của bạn *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="VD: Minh"
            style={inputStyle(!!errors.customerName)}
          />
          {errors.customerName && <div style={errorStyle}>{errors.customerName}</div>}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>2️⃣ Số điện thoại *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="VD: 0935226206"
            style={inputStyle(!!errors.phone)}
          />
          {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
        </div>

        {/* Product */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>3️⃣ Loại bánh & size *</label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            placeholder="VD: Bánh kem 16cm viết chữ"
            style={inputStyle(!!errors.product)}
          />
          {errors.product && <div style={errorStyle}>{errors.product}</div>}
          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
            Hỏi mình về giá bánh trước nếu chưa biết!
          </div>
        </div>

        {/* Quantity */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>4️⃣ Số lượng</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            max="10"
            style={{ ...inputStyle(false), width: '80px' }}
          />
        </div>

        {/* Delivery Date */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>5️⃣ Ngày nhận bánh</label>
          <input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            style={inputStyle(false)}
          />
        </div>

        {/* Delivery Address */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>6️⃣ Địa chỉ giao (nếu cần)</label>
          <input
            type="text"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            placeholder="VD: 123 Nguyễn Văn Linh, Q. Hải Châu"
            style={inputStyle(false)}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>7️⃣ Ghi chú thêm</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="VD: Viết chữ 'Happy Birthday', màu hồng..."
            rows="2"
            style={{ ...inputStyle(false), resize: 'none' }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          Tiếp tục xem lại đơn hàng →
        </button>
      </form>

      {/* Alternative: Chat Zalo */}
      <button
        onClick={onChatZalo}
        style={{
          width: '100%',
          padding: '10px',
          background: 'rgba(255,255,255,0.15)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          marginBottom: '8px'
        }}
      >
        💬 Hoặc chat Zalo: 0935226206
      </button>

      {/* Cancel */}
      <button
        onClick={onCancel}
        style={{
          width: '100%',
          padding: '8px',
          background: 'transparent',
          color: 'rgba(255,255,255,0.7)',
          border: 'none',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Hủy
      </button>

      <div style={{
        marginTop: '12px',
        fontSize: '11px',
        opacity: 0.7,
        textAlign: 'center'
      }}>
        Vani sẽ liên hệ xác nhận trong 30 phút
      </div>
    </div>
  );
};

export default OrderForm;
