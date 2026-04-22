// Express server for Đồng Tiền Chatbot - Phase 1
// Webhook-first order flow (no database yet)

import express from 'express';
import cors from 'cors';
import { orderRouter } from './routes/order.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', orderRouter);

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
