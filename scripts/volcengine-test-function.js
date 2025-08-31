/**
 * 火山引擎云函数测试端点
 * 用于接收文件上传测试请求并返回相关信息
 */

import express from 'express';
import multer from 'multer';

// 火山引擎云函数入口
export const handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    // 解析请求
    const { httpMethod, headers, body, isBase64Encoded } = event;
    
    console.log('收到请求:', {
      method: httpMethod,
      contentType: headers['content-type'] || headers['Content-Type'],
      contentLength: headers['content-length'] || headers['Content-Length'],
      userAgent: headers['user-agent'] || headers['User-Agent'],
    });
    
    // 只处理 POST 请求
    if (httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Method Not Allowed',
          message: '只支持 POST 请求',
        }),
      };
    }
    
    // 获取请求体大小
    let bodySize = 0;
    if (body) {
      bodySize = isBase64Encoded ? 
        Buffer.from(body, 'base64').length : 
        Buffer.byteLength(body, 'utf8');
    }
    
    // 解析 multipart/form-data（简化版本）
    const contentType = headers['content-type'] || headers['Content-Type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    let fileInfo = [];
    let formFields = {};
    
    if (isMultipart && body) {
      try {
        // 简单解析 multipart 数据
        const boundary = contentType.split('boundary=')[1];
        if (boundary) {
          const bodyBuffer = isBase64Encoded ? 
            Buffer.from(body, 'base64') : 
            Buffer.from(body, 'utf8');
          
          const parts = bodyBuffer.toString().split(`--${boundary}`);
          
          for (const part of parts) {
            if (part.includes('Content-Disposition: form-data')) {
              const lines = part.split('\r\n');
              const dispositionLine = lines.find(line => line.includes('Content-Disposition'));
              
              if (dispositionLine) {
                const nameMatch = dispositionLine.match(/name="([^"]+)"/);
                const filenameMatch = dispositionLine.match(/filename="([^"]+)"/);
                
                if (filenameMatch && nameMatch) {
                  // 这是一个文件
                  const contentStart = part.indexOf('\r\n\r\n') + 4;
                  const contentEnd = part.lastIndexOf('\r\n');
                  const fileContent = part.slice(contentStart, contentEnd);
                  
                  fileInfo.push({
                    fieldName: nameMatch[1],
                    filename: filenameMatch[1],
                    size: Buffer.byteLength(fileContent, 'utf8'),
                  });
                } else if (nameMatch) {
                  // 这是一个普通字段
                  const contentStart = part.indexOf('\r\n\r\n') + 4;
                  const contentEnd = part.lastIndexOf('\r\n');
                  const fieldValue = part.slice(contentStart, contentEnd);
                  
                  formFields[nameMatch[1]] = fieldValue;
                }
              }
            }
          }
        }
      } catch (parseError) {
        console.log('解析 multipart 数据时出错:', parseError.message);
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // 构建响应
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      processingTime,
      request: {
        method: httpMethod,
        contentType,
        bodySize,
        isMultipart,
      },
      files: fileInfo,
      formFields,
      limits: {
        // 火山引擎的一些已知限制（基于文档和测试）
        maxExecutionTime: '3小时（异步任务）',
        maxMemory: '根据配置而定',
        maxRequestSize: '待测试确认',
      },
      environment: {
        functionName: context.functionName || 'unknown',
        functionVersion: context.functionVersion || 'unknown',
        requestId: context.requestId || 'unknown',
        remainingTimeInMillis: context.getRemainingTimeInMillis ? context.getRemainingTimeInMillis() : 'unknown',
      },
      statistics: {
        totalFiles: fileInfo.length,
        totalFileSize: fileInfo.reduce((sum, file) => sum + file.size, 0),
        largestFile: fileInfo.length > 0 ? Math.max(...fileInfo.map(f => f.size)) : 0,
      },
    };
    
    console.log('处理完成:', {
      processingTime,
      fileCount: fileInfo.length,
      totalSize: response.statistics.totalFileSize,
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(response, null, 2),
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('处理请求时发生错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: {
          message: error.message,
          stack: error.stack,
        },
        processingTime,
        timestamp: new Date().toISOString(),
      }, null, 2),
    };
  }
};

// 本地测试用的 Express 服务器
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('volcengine-test-function.js')) {
  const app = express();
  const port = 3001;
  
  // 配置 multer 用于处理文件上传
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 200 * 1024 * 1024, // 200MB 限制用于测试
      files: 20, // 最多 20 个文件
    },
  });
  
  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ extended: true, limit: '200mb' }));
  
  // CORS 中间件
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  // 测试端点
  app.post('/', upload.any(), (req, res) => {
    const startTime = Date.now();
    
    try {
      const files = req.files || [];
      const fields = req.body || {};
      
      console.log('收到本地测试请求:', {
        fileCount: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        fields: Object.keys(fields),
      });
      
      const fileInfo = files.map(file => ({
        fieldName: file.fieldname,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }));
      
      const processingTime = Date.now() - startTime;
      
      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        processingTime,
        request: {
          method: req.method,
          contentType: req.get('Content-Type'),
          contentLength: req.get('Content-Length'),
        },
        files: fileInfo,
        formFields: fields,
        environment: {
          platform: 'local-express',
          nodeVersion: process.version,
          memory: process.memoryUsage(),
        },
        statistics: {
          totalFiles: files.length,
          totalFileSize: files.reduce((sum, file) => sum + file.size, 0),
          largestFile: files.length > 0 ? Math.max(...files.map(f => f.size)) : 0,
        },
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('处理本地请求时发生错误:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          stack: error.stack,
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  app.listen(port, () => {
    console.log(`🚀 本地测试服务器启动在 http://localhost:${port}`);
    console.log('可以使用此端点进行本地测试');
  });
}