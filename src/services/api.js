/**
 * 统一API服务层
 * 封装所有API调用逻辑，支持火山引擎函数服务
 */

import { 
  apiConfig, 
  API_ENDPOINTS, 
  REQUEST_CONFIG, 
  UPLOAD_CONFIG, 
  ERROR_CONFIG,
  LOG_CONFIG 
} from '../config/api.js';

/**
 * 日志工具
 */
const logger = {
  debug: (...args) => {
    if (LOG_CONFIG.enabled && LOG_CONFIG.level === 'debug') {
      console.log('[API Service]', ...args);
    }
  },
  error: (...args) => {
    if (LOG_CONFIG.enabled) {
      console.error('[API Service]', ...args);
    }
  },
  info: (...args) => {
    if (LOG_CONFIG.enabled) {
      console.info('[API Service]', ...args);
    }
  }
};

/**
 * 构建完整的API URL
 */
const buildApiUrl = (endpoint) => {
  // 如果是绝对路径，直接返回
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  // 拼接基础URL和端点路径
  const baseUrl = apiConfig.baseURL.endsWith('/') ? apiConfig.baseURL.slice(0, -1) : apiConfig.baseURL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

/**
 * 错误处理工具
 */
const handleApiError = (error, context = '') => {
  logger.error(`API错误 [${context}]:`, error);
  
  // 网络错误
  if (!navigator.onLine) {
    return {
      type: 'NETWORK_ERROR',
      message: '网络连接异常，请检查网络设置',
      originalError: error
    };
  }
  
  // 超时错误
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return {
      type: 'TIMEOUT_ERROR',
      message: '请求超时，请稍后重试',
      originalError: error
    };
  }
  
  // HTTP错误
  if (error.status) {
    const statusMessages = {
      400: '请求参数错误',
      401: '未授权访问',
      403: '访问被拒绝',
      404: '服务不存在',
      413: '文件过大',
      429: '请求过于频繁',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时'
    };
    
    return {
      type: 'API_ERROR',
      message: statusMessages[error.status] || `服务器错误 (${error.status})`,
      status: error.status,
      originalError: error
    };
  }
  
  // 通用错误
  return {
    type: 'GENERAL_ERROR',
    message: error.message || '未知错误',
    originalError: error
  };
};

/**
 * 重试机制
 */
const withRetry = async (fn, options = {}) => {
  const { attempts = ERROR_CONFIG.retry.attempts, delay = ERROR_CONFIG.retry.delay, backoff = ERROR_CONFIG.retry.backoff } = options;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      logger.debug(`重试 ${i + 1}/${attempts}:`, error.message);
      
      // 最后一次尝试，直接抛出错误
      if (i === attempts - 1) {
        throw error;
      }
      
      // 等待后重试
      const waitTime = delay * Math.pow(backoff, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

/**
 * 基础请求方法
 */
const request = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || REQUEST_CONFIG.timeout);
  
  try {
    const response = await fetch(buildApiUrl(url), {
      ...REQUEST_CONFIG,
      ...options,
      signal: controller.signal,
      headers: {
        ...REQUEST_CONFIG.headers,
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * 文件验证
 */
const validateFile = (file) => {
  const errors = [];
  
  // 检查文件大小
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    errors.push(`文件 "${file.name}" 大小超过限制 (${Math.round(UPLOAD_CONFIG.maxFileSize / 1024 / 1024)}MB)`);
  }
  
  // 检查文件类型
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    errors.push(`文件 "${file.name}" 类型不支持 (${file.type})`);
  }
  
  return errors;
};

/**
 * 验证多个文件
 */
const validateFiles = (files) => {
  const fileArray = Array.from(files);
  const errors = [];
  
  // 检查文件数量
  if (fileArray.length > UPLOAD_CONFIG.maxFiles) {
    errors.push(`文件数量超过限制 (最多${UPLOAD_CONFIG.maxFiles}个)`);
  }
  
  // 验证每个文件
  fileArray.forEach(file => {
    errors.push(...validateFile(file));
  });
  
  return errors;
};

/**
 * API服务类
 */
class ApiService {
  /**
   * 提交订单
   * @param {FormData} formData - 表单数据
   * @returns {Promise<Object>} 订单提交结果
   */
  static async submitOrder(formData) {
    logger.debug('开始提交订单');
    
    try {
      // 验证表单数据
      const phone = formData.get('phone');
      const customizationStyle = formData.get('customization_style');
      
      if (!phone || !customizationStyle) {
        throw new Error('缺少必填字段：手机号或定制款式');
      }
      
      // 验证上传的文件
      const userUploads = formData.getAll('user_uploads');
      const uploadedImage = formData.get('uploadedImage') || formData.get('referenceImages');
      
      const allFiles = [...userUploads];
      if (uploadedImage instanceof File) {
        allFiles.push(uploadedImage);
      }
      
      if (allFiles.length > 0) {
        const validationErrors = validateFiles(allFiles);
        if (validationErrors.length > 0) {
          throw new Error(`文件验证失败：\n${validationErrors.join('\n')}`);
        }
      }
      
      logger.debug('文件验证通过，开始上传');
      
      // 发送请求
      const response = await withRetry(async () => {
        return await request(API_ENDPOINTS.SUBMIT_ORDER, {
          method: 'POST',
          body: formData,
          timeout: UPLOAD_CONFIG.timeout
        });
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || result.message || '订单提交失败');
      }
      
      logger.info('订单提交成功:', result.orderId);
      return result;
      
    } catch (error) {
      const apiError = handleApiError(error, 'submitOrder');
      logger.error('订单提交失败:', apiError);
      throw apiError;
    }
  }
  
  /**
   * 获取推荐内容
   * @param {Object} params - 推荐参数
   * @returns {Promise<Object>} 推荐结果
   */
  static async getRecommendations(params) {
    logger.debug('获取推荐内容:', params);
    
    try {
      const response = await withRetry(async () => {
        return await request(API_ENDPOINTS.RECOMMENDATIONS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        });
      });
      
      const result = await response.json();
      logger.debug('推荐内容获取成功');
      return result;
      
    } catch (error) {
      const apiError = handleApiError(error, 'getRecommendations');
      logger.error('推荐内容获取失败:', apiError);
      throw apiError;
    }
  }
  
  /**
   * 健康检查
   * @returns {Promise<Object>} 健康状态
   */
  static async healthCheck() {
    try {
      const response = await request(API_ENDPOINTS.HEALTH, {
        method: 'GET',
        timeout: 5000 // 5秒超时
      });
      
      const result = await response.json();
      logger.debug('健康检查通过');
      return result;
      
    } catch (error) {
      const apiError = handleApiError(error, 'healthCheck');
      logger.error('健康检查失败:', apiError);
      throw apiError;
    }
  }
}

// 导出API服务
export default ApiService;

// 导出工具函数
export {
  validateFile,
  validateFiles,
  handleApiError,
  buildApiUrl,
  logger
};

// 向后兼容的导出
export const submitOrder = ApiService.submitOrder;
export const getRecommendations = ApiService.getRecommendations;
export const healthCheck = ApiService.healthCheck;