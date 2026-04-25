// Express server for Đồng Tiền Chatbot - Phase 1
// Webhook-first order flow (no database yet)

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { orderRouter } from './routes/order.js';
import { chatRouter } from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Allow any localhost port in dev; lock to ALLOWED_ORIGIN env var in production
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const corsOrigin = ALLOWED_ORIGIN
  ? ALLOWED_ORIGIN
  : (origin, cb) => {
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) cb(null, true);
      else cb(new Error('Not allowed by CORS'));
    };

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' }
});
app.use('/api/chat', limiter);
app.use('/api/order', limiter);

// Routes
app.use('/api', orderRouter);
app.use('/api', chatRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Đồng Tiền API Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}/health`);
});

export default app;
