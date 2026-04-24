// Chat proxy route — keeps OPENAI_API_KEY server-side only
// Frontend calls POST /api/chat; this proxies to OpenAI

import { Router } from 'express';
import axios from 'axios';

export const chatRouter = Router();

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn của Tiệm Bánh Vani (tiembanhvani.com) - tiệm bánh handmade tại Đà Nẵng.

THÔNG TIN TIỆM:
- Địa chỉ: 107 Đ. Lê Đình Dương, Nam Dương, Q. Hải Châu, Đà Nẵng
- Zalo/Điện thoại: 0935 226 206
- Email: tiembanhvani.com@gmail.com
- Website: tiembanhvani.com

CÁC LOẠI BÁNH:
Bánh kem sinh nhật (baby, số, pokemon, công ty, 2 tầng, cưới), Mousse (mousse dừa, red velvet), Cupcake, Bánh su, Bánh tầng, Bánh kẹo & chocolate, Bánh mini, Bánh mừng thọ, Bánh chủ đề theo yêu cầu, Bánh 18+, Bánh hũ vàng & khai trương, Bánh nặn tạo hình.

QUY TẮC TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn, dùng emoji phù hợp
- Khi khách hỏi giá: giải thích giá phụ thuộc size/thiết kế, hướng dẫn nhắn Zalo 0935 226 206 để báo giá
- Khi khách muốn đặt: thu thập tên, số điện thoại, loại bánh, ngày nhận, địa chỉ giao
- Mọi câu hỏi không rõ: hướng dẫn liên hệ Zalo 0935 226 206
- KHÔNG bịa giá, KHÔNG cam kết thời gian mà không chắc chắn`.trim();

// POST /api/chat - Proxy to OpenAI (API key stays server-side)
chatRouter.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ success: false, error: 'AI service not configured' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const botText = response.data.choices[0]?.message?.content?.trim()
      || 'Xin lỗi, mình chưa hiểu câu hỏi. Bạn chat Zalo 0935 226 206 để được hỗ trợ nha!';

    res.json({ success: true, text: botText });

  } catch (error) {
    console.error('Chat error:', error.response?.status, error.message);
    res.status(500).json({
      success: false,
      error: 'Xin lỗi, mình đang gặp chút vấn đề. Bạn chat Zalo 0935 226 206 để được hỗ trợ nha!'
    });
  }
});
