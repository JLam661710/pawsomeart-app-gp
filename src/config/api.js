/**
 * API配置文件
 * 管理所有API端点和配置
 */

// API基础配置
const API_CONFIG = {
  // 开发环境配置
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
  },
  // 生产环境配置 - 火山引擎函数服务
  production: {
    // 从环境变量读取API网关地址
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://sd2nfsos05ikp3tvhepug.apigateway-cn-shanghai.volceapi.com',
    timeout: parseInt(import.meta.env.VITE_VOLCENGINE_FUNCTION_TIMEOUT) || 300000, // 5分钟超时
    // 备用配置
    fallbackURL: 'http://localhost:3001', // 本地开发服务器作为备用
  }
};

// 获取当前环境配置
const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development';
  return API_CONFIG[env] || API_CONFIG.development;
};

// API端点定义
export const API_ENDPOINTS = {
  // 订单提交 - 统一接口
  SUBMIT_ORDER: '/api/submit-order',
  // 推荐服务
  RECOMMENDATIONS: '/api/recommendations',
  // 健康检查
  HEALTH: '/api/health',
};

// 导出配置
export const apiConfig = getCurrentConfig();

// 请求配置
export const REQUEST_CONFIG = {
  // 默认请求头
  headers: {
    'Accept': 'application/json',
  },
  // 超时配置
  timeout: apiConfig.timeout,
};

// 文件上传配置
export const UPLOAD_CONFIG = {
  // 最大文件大小 (从环境变量读取，默认50MB)
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 50 * 1024 * 1024,
  // 支持的文件类型
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  // 最大文件数量 (从环境变量读取，默认15个，支持经典定制款多宠+场景图)
  maxFiles: parseInt(import.meta.env.VITE_MAX_FILES) || 15,
  // 请求超时时间 (从环境变量读取，默认5分钟)
  timeout: parseInt(import.meta.env.VITE_UPLOAD_TIMEOUT) || 300000,
};

// 错误处理配置
export const ERROR_CONFIG = {
  // 重试配置
  retry: {
    attempts: 3,
    delay: 1000, // 1秒
    backoff: 2, // 指数退避
  },
  // 错误类型映射
  errorTypes: {
    NETWORK_ERROR: '网络连接异常',
    TIMEOUT_ERROR: '请求超时',
    FILE_ERROR: '文件处理失败',
    API_ERROR: '服务器异常',
    VALIDATION_ERROR: '数据验证失败',
  }
};

// 环境检测
export const isProduction = () => {
  return import.meta.env.MODE === 'production';
};

export const isDevelopment = () => {
  return import.meta.env.MODE === 'development';
};

// 调试模式
export const isDebugMode = () => {
  return import.meta.env.DEV || false;
};

// 日志配置
export const LOG_CONFIG = {
  enabled: isDevelopment() || isDebugMode(),
  level: isProduction() ? 'error' : 'debug',
};

console.log('[API Config] 当前环境:', import.meta.env.MODE);
console.log('[API Config] API基础地址:', apiConfig.baseURL);
console.log('[API Config] 超时配置:', apiConfig.timeout + 'ms');