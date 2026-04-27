# Đồng Tiến Bakery — AI CSKH Chatbot

Chatbot chăm sóc khách hàng tự động cho Tiệm Bánh Vani (DOTICOM), xây dựng với React + Vite + OpenAI. Khách hàng có thể hỏi về sản phẩm, giá, thời gian giao hàng, và đặt bánh trực tiếp qua chat.

![Status](https://img.shields.io/badge/Status-Live-green) ![React](https://img.shields.io/badge/React-18+-blue) ![Vite](https://img.shields.io/badge/Vite-5+-yellow) ![Version](https://img.shields.io/badge/Version-0.1.0-orange)

## Tính năng

- **FAQ thông minh** — Trả lời câu hỏi về sản phẩm, giá, thời gian đặt trước, khu vực giao hàng
- **Đặt bánh qua chat** — Form đặt hàng tích hợp trong giao diện chat
- **Phân loại bánh** — Tự động nhận biết bánh bán tại cửa hàng (`in-store`) hay bánh xưởng (`factory`)
- **Ca giao hàng thông minh** — Tính Ca 1 (08:00–11:30) / Ca 2 (12:30–17:00) theo giờ VN thực tế
- **Ma trận phí ship** — 6 mức phí dựa trên khoảng cách và giá trị đơn; freeship dưới 5km
- **Google Maps integration** — Tính khoảng cách thực tế từ các cửa hàng DOTICOM đến địa chỉ giao
- **Hình ảnh sản phẩm** — 22 sản phẩm DOTICOM với hình ảnh thực tế từ CDN
- **Bảo mật** — XSS protection, prompt injection guard, phone masking trong logs

## Quick Start

### Yêu cầu
- Node.js 18+
- npm
- OpenAI API Key
- Google Maps API Key (tùy chọn — fallback về xác nhận thủ công nếu không có)

### 1. Clone và cài dependencies
```bash
git clone https://github.com/ToanMinhTechnology/dongtien-chatbot.git
cd dongtien-chatbot
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env` ở root:
```env
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIza...   # tùy chọn
PORT=3001                      # tùy chọn, mặc định 3001
ALLOWED_ORIGIN=http://localhost:5173   # tùy chọn cho dev
```

### 3. Chạy development
Cần 2 terminal:

**Terminal 1 — Frontend (React/Vite):**
```bash
npm run dev
```
Mở [http://localhost:5173](http://localhost:5173)

**Terminal 2 — Backend (Express):**
```bash
npm run server:dev
```
API chạy tại [http://localhost:3001](http://localhost:3001)

## Build & Deploy

### Build frontend
```bash
npm run build
```
Output vào `dist/`.

### Deploy lên Vercel
Project đã cấu hình sẵn Vercel serverless functions trong `api/`:

```bash
vercel --prod
```

Đặt các biến môi trường sau trong Vercel dashboard:
- `OPENAI_API_KEY` — bắt buộc
- `GOOGLE_MAPS_API_KEY` — tùy chọn (không có thì phí ship xác nhận thủ công)
- `ALLOWED_ORIGIN` — domain frontend của bạn

## Cấu trúc project

```
dongtien-chatbot/
├── api/                    # Vercel serverless functions
│   ├── chat.js             # POST /api/chat
│   └── order.js            # POST /api/order
├── server/                 # Express server (local dev)
│   ├── index.js
│   ├── routes/
│   │   ├── chat.js         # Chat route với RAG context injection
│   │   └── order.js        # Order route với evaluateOrder()
│   └── services/
│       └── orderEngine.js  # Sprint 2: phân loại bánh, ca giao, phí ship
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx  # Render message + hình sản phẩm
│   │   ├── ChatForm.jsx     # Input form
│   │   └── OrderForm.jsx    # Form đặt hàng
│   ├── data/
│   │   ├── knowledgeBase.js # FAQ và intent scoring
│   │   ├── cakeDatabase.js  # 22 sản phẩm DOTICOM
│   │   └── shippingMatrix.js # Ma trận 6 mức phí ship
│   ├── utils/
│   │   ├── intentMatcher.js # FAQ intent detection
│   │   └── normalize.js     # Text normalization tiếng Việt
│   └── App.jsx              # Main app + chat logic
├── scripts/
│   └── build-kb.cjs         # Crawl và build knowledge base
├── data/
│   └── structured/          # Dữ liệu sản phẩm crawl từ website
├── CHANGELOG.md
└── vercel.json
```

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy Vite dev server (frontend) |
| `npm run server:dev` | Chạy Express với hot reload (backend) |
| `npm run build` | Build frontend cho production |
| `npm run test` | Chạy toàn bộ test suite (vitest) |
| `npm run test:watch` | Test ở watch mode |
| `npm run lint` | ESLint |
| `npm run crawl:vani` | Crawl dữ liệu mới từ website Vani |

## Kiến trúc

```
User ──→ React Chat UI
           │
           ├──→ FAQ/Intent Matcher (client-side, zero-latency)
           │       └── Matched? Return answer immediately
           │
           └──→ POST /api/chat (OpenAI)
                   ├── RAG: inject sản phẩm liên quan vào system prompt
                   └── Return Claude-generated response

User submit order ──→ POST /api/order
                           ├── Validate fields
                           ├── evaluateOrder(): classify + delivery window + shipping
                           ├── Reject nếu ngoài vùng giao (>20km hoặc <2M VND cho 10–20km)
                           └── Log order + return estimate
```

## Phí ship (Sprint 2)

| Khoảng cách | Giá trị đơn | Phí |
|-------------|-------------|-----|
| ≤ 5km | bất kỳ | Miễn phí |
| 5–7km | ≥ 250k | Miễn phí |
| 5–7km | 100k–250k | 15,000đ |
| 7–10km | ≥ 350k | Miễn phí |
| 7–10km | 250k–350k | 15,000đ |
| 7–10km | 100k–250k | 25,000đ |
| 10–20km | ≥ 2,000,000đ | 25,000đ |
| 10–20km | < 2,000,000đ | Từ chối |
| > 20km | bất kỳ | Từ chối |

## Troubleshooting

**Chatbot không trả lời:**
Kiểm tra `OPENAI_API_KEY` trong `.env` và xem console của terminal backend.

**Phí ship hiện "xác nhận thủ công":**
Bình thường nếu chưa có `GOOGLE_MAPS_API_KEY`. Thêm key để bật tính năng tính khoảng cách tự động.

**Lỗi CORS:**
Đảm bảo `ALLOWED_ORIGIN` khớp với URL frontend. Hoặc để trống để cho phép tất cả `localhost:*` ở dev.

**Build fails:**
Chạy `npm install` để đảm bảo đủ dependencies, sau đó `npm run build`.

---

Liên hệ: Zalo 0935 226 206 | [ToanMinhTechnology/dongtien-chatbot](https://github.com/ToanMinhTechnology/dongtien-chatbot) | [CHANGELOG](CHANGELOG.md)
