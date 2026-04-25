import { Router } from 'express';
import OpenAI from 'openai';

export const chatRouter = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

chatRouter.post('/chat', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(503).json({ success: false, error: 'AI service not configured' });
    }

    const { history } = req.body;
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ success: false, error: 'history is required' });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      // Only forward user/model turns — strip any injected system-role entries
      ...history
        .filter(({ role }) => role === 'user' || role === 'model')
        .map(({ role, text }) => ({
          role: role === 'model' ? 'assistant' : 'user',
          content: typeof text === 'string' ? text : String(text ?? ''),
        })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '';
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Xin lỗi, mình đang gặp sự cố. Bạn nhắn Zalo 0935 226 206 nha!',
    });
  }
});
