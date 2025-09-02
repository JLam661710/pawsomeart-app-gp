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
  try {
    // 允许预检请求快速返回（CORS 已由全局 cors() 处理中，此处兜底）
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    if (req.method !== 'POST') {
      return res.status(404).send('Not Found');
    }

    const base = process.env.VITE_API_BASE_URL || '';
    if (!base) {
      return res.status(500).json({ error: 'VITE_API_BASE_URL 未配置' });
    }

    const target = `${base.replace(/\/$/, '')}/api/submit-order`;

    // 透传必要请求头，避免 Host 覆盖
    const headers = { ...req.headers };
    delete headers.host;

    // 使用 Node18+ 全局 fetch 作为最小依赖的转发实现
    const response = await fetch(target, {
      method: 'POST',
      headers,
      body: req, // 对于 multipart/form-data，直接透传原始请求流
      duplex: 'half', // Node18+ 传递可读流作为请求体需要显式声明
    });

    // 透传响应
    res.status(response.status);
    // 过滤部分与本地响应冲突的头（按需）
    response.headers.forEach((value, key) => {
      if (['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    const buf = Buffer.from(await response.arrayBuffer());
    return res.send(buf);
  } catch (err) {
    console.error('[Proxy /api/submit-order] 转发失败:', err);
    return res.status(502).json({
      error: '上游服务不可用或转发失败',
      details: err.message || String(err)
    });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});