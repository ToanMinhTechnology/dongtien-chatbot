import OpenAI from 'openai';
import { searchSimilar, productToContextLine } from '../server/services/embeddingService.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_HISTORY = 10;
const MAX_TEXT_LEN = 500;

async function buildContext(userMessage) {
  try {
    const products = await searchSimilar(userMessage);
    if (products.length === 0) return '';
    return `\nSẢN PHẨM LIÊN QUAN ĐẾN CÂU HỎI:\n${products.map(productToContextLine).join('\n')}`;
  } catch {
    return '';
  }
}

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
- Khi khách hỏi giá: dùng giá trong SẢN PHẨM LIÊN QUAN (nếu có), luôn nhắc đây là giá tham khảo và mời nhắn Zalo 0935 226 206 để báo giá chính xác
- Khi tư vấn sản phẩm có ảnh trong SẢN PHẨM LIÊN QUAN: hiển thị ảnh đầu tiên bằng markdown ![tên bánh](url_ảnh) ngay đầu câu trả lời
- Khi khách muốn đặt: thu thập tên, số điện thoại, loại bánh, ngày nhận, địa chỉ giao
- Mọi câu hỏi không rõ: hướng dẫn liên hệ Zalo 0935 226 206
- KHÔNG bịa giá, KHÔNG cam kết thời gian mà không chắc chắn`.trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(503).json({ success: false, error: 'AI service not configured' });
    }

    const { history } = req.body;
    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ success: false, error: 'history is required' });
    }

    const lastUserText = (history.filter((m) => m.role === 'user').at(-1)?.text ?? '').slice(0, MAX_TEXT_LEN);
    const context = await buildContext(lastUserText);
    const systemContent = context ? `${SYSTEM_PROMPT}\n${context}` : SYSTEM_PROMPT;

    const messages = [
      { role: 'system', content: systemContent },
      ...history
        .slice(-MAX_HISTORY)
        .filter(({ role }) => role === 'user' || role === 'model')
        .map(({ role, text }) => {
          const raw = typeof text === 'string' ? text : String(text ?? '');
          return {
            role: role === 'model' ? 'assistant' : 'user',
            content: raw.slice(0, MAX_TEXT_LEN),
          };
        }),
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
}
