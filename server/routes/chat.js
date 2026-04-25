import { Router } from 'express';
import OpenAI from 'openai';

export const chatRouter = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Bạn là trợ lý chatbot của Đồng Tiền Bakery — tiệm bánh kem tại Đà Nẵng.

Thông tin tiệm:
- Địa chỉ: 107 Đ. Lê Đình Dương, Nam Dương, Q. Hải Châu, Đà Nẵng
- Zalo/Điện thoại: 0935 226 206
- Email: tiembanhvani.com@gmail.com

Chỉ trả lời các câu hỏi liên quan đến bánh kem, đặt hàng, giá cả, giao hàng của tiệm.
Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
Nếu khách muốn đặt bánh, hướng dẫn liên hệ Zalo 0935226206.
Không bịa đặt giá hoặc thông tin không có trong hệ thống.`;

chatRouter.post('/chat', async (req, res) => {
  try {
    const { history } = req.body;
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ success: false, error: 'history is required' });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(({ role, text }) => ({
        role: role === 'model' ? 'assistant' : 'user',
        content: text,
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
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Xin lỗi, mình đang gặp sự cố. Bạn nhắn Zalo 0935226206 nha!',
    });
  }
});
