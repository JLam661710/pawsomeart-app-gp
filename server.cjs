const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// Load environment variables from .env.local (fallback to .env if needed)
try {
  require('dotenv').config({ path: '.env.local' });
} catch {
  try { require('dotenv').config(); } catch {}
}

const app = express();
const port = 3001; // A different port from Vite

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 通用 API 频率限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP在15分钟内最多100次请求
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 订单提交专用频率限制（更严格）
const submitOrderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: process.env.NODE_ENV === 'test' ? 100 : 3, // 测试环境放宽限制，生产环境每个IP每分钟最多3次订单提交
  message: {
    error: '订单提交过于频繁，请稍后再试',
    retryAfter: '1分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 跳过成功的请求，只对失败的请求计数
  skipSuccessfulRequests: false,
  // 使用 handler 替代已弃用的 onLimitReached
  handler: (req, res, next, options) => {
    console.log(`[RATE_LIMIT] 订单提交频率限制触发 - IP: ${req.ip}, 时间: ${new Date().toISOString()}`);
    res.status(options.statusCode).json(options.message);
  }
});

// 应用通用频率限制到所有API路由
app.use('/api', generalLimiter);

// Serve static files from public directory
app.use('/pictures', express.static('public/pictures'));
app.use(express.static('public'));

// Health check endpoint (no secrets)
app.get('/api/health', (req, res) => {
  const mock = process.env.MOCK_FEISHU === '1' || process.env.MOCK_FEISHU === 'true';
  res.json({
    ok: true,
    mock,
    env: {
      FEISHU_APP_TOKEN: Boolean(process.env.FEISHU_APP_TOKEN),
      FEISHU_ORDERS_TABLE_ID: Boolean(process.env.FEISHU_ORDERS_TABLE_ID),
    },
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// Use dynamic import for ES Modules
app.use('/api/recommendations', async (req, res) => {
  const recommendationsHandler = await import('./api/recommendations.js');
  recommendationsHandler.default(req, res);
});

app.use('/api/submit-order', submitOrderLimiter, async (req, res) => {
  const submitOrderHandler = await import('./api/submit-order.js');
  submitOrderHandler.default(req, res);
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});