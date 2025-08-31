/**
 * 火山引擎云函数 - 文件上传限制测试
 * 专门用于部署到火山引擎 veFaaS 的版本
 */

export const handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    console.log('=== 火山引擎云函数开始处理请求 ===');
    console.log('请求事件:', JSON.stringify({
      httpMethod: event.httpMethod,
      headers: Object.keys(event.headers || {}),
      bodySize: event.body ? (event.isBase64Encoded ? 
        Buffer.from(event.body, 'base64').length : 
        Buffer.byteLength(event.body, 'utf8')) : 0,
    }, null, 2));
    
    // 解析请求
    const { httpMethod, headers, body, isBase64Encoded, queryStringParameters } = event;
    
    // 处理 CORS 预检请求
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
        body: '',
      };
    }
    
    // 只处理 POST 请求
    if (httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Method Not Allowed',
          message: '只支持 POST 请求',
          allowedMethods: ['POST'],
        }),
      };
    }
    
    // 获取请求体大小和内容类型
    let bodySize = 0;
    let actualBody = null;
    
    if (body) {
      if (isBase64Encoded) {
        actualBody = Buffer.from(body, 'base64');
        bodySize = actualBody.length;
      } else {
        actualBody = body;
        bodySize = Buffer.byteLength(body, 'utf8');
      }
    }
    
    const contentType = headers['content-type'] || headers['Content-Type'] || '';
    const contentLength = headers['content-length'] || headers['Content-Length'] || '0';
    const isMultipart = contentType.includes('multipart/form-data');
    
    console.log('请求分析:', {
      contentType,
      contentLength: parseInt(contentLength),
      actualBodySize: bodySize,
      isMultipart,
      isBase64Encoded,
    });
    
    // 解析 multipart/form-data（简化版本）
    let fileInfo = [];
    let formFields = {};
    let parseError = null;
    
    if (isMultipart && actualBody) {
      try {
        const boundary = contentType.split('boundary=')[1];
        if (boundary) {
          const bodyString = actualBody.toString('binary');
          const parts = bodyString.split(`--${boundary}`);
          
          console.log(`解析 multipart 数据，边界: ${boundary}，部分数量: ${parts.length}`);
          
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
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
                  
                  if (contentStart > 3 && contentEnd > contentStart) {
                    const fileContent = part.slice(contentStart, contentEnd);
                    const fileSize = Buffer.byteLength(fileContent, 'binary');
                    
                    fileInfo.push({
                      fieldName: nameMatch[1],
                      filename: filenameMatch[1],
                      size: fileSize,
                      sizeFormatted: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
                    });
                    
                    console.log(`解析文件: ${filenameMatch[1]}, 大小: ${fileSize} 字节`);
                  }
                } else if (nameMatch) {
                  // 这是一个普通字段
                  const contentStart = part.indexOf('\r\n\r\n') + 4;
                  const contentEnd = part.lastIndexOf('\r\n');
                  
                  if (contentStart > 3 && contentEnd > contentStart) {
                    const fieldValue = part.slice(contentStart, contentEnd);
                    formFields[nameMatch[1]] = fieldValue;
                    
                    console.log(`解析字段: ${nameMatch[1]} = ${fieldValue}`);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        parseError = error.message;
        console.error('解析 multipart 数据时出错:', error);
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    // 统计信息
    const statistics = {
      totalFiles: fileInfo.length,
      totalFileSize: fileInfo.reduce((sum, file) => sum + file.size, 0),
      largestFile: fileInfo.length > 0 ? Math.max(...fileInfo.map(f => f.size)) : 0,
      averageFileSize: fileInfo.length > 0 ? fileInfo.reduce((sum, file) => sum + file.size, 0) / fileInfo.length : 0,
    };
    
    // 构建响应
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      processingTime,
      platform: 'volcengine-vefaas',
      test: {
        purpose: '火山引擎文件上传限制测试',
        version: '1.0.0',
      },
      request: {
        method: httpMethod,
        contentType,
        declaredContentLength: parseInt(contentLength) || 0,
        actualBodySize: bodySize,
        bodySizeFormatted: `${(bodySize / 1024 / 1024).toFixed(2)}MB`,
        isMultipart,
        isBase64Encoded,
        queryParams: queryStringParameters || {},
      },
      parsing: {
        success: !parseError,
        error: parseError,
        filesFound: fileInfo.length,
        fieldsFound: Object.keys(formFields).length,
      },
      files: fileInfo,
      formFields,
      statistics: {
        ...statistics,
        totalFileSizeFormatted: `${(statistics.totalFileSize / 1024 / 1024).toFixed(2)}MB`,
        largestFileFormatted: `${(statistics.largestFile / 1024 / 1024).toFixed(2)}MB`,
        averageFileSizeFormatted: `${(statistics.averageFileSize / 1024 / 1024).toFixed(2)}MB`,
      },
      environment: {
        platform: 'volcengine-vefaas',
        functionName: context.functionName || 'unknown',
        functionVersion: context.functionVersion || 'unknown',
        requestId: context.requestId || 'unknown',
        region: context.region || 'unknown',
        remainingTimeInMillis: context.getRemainingTimeInMillis ? context.getRemainingTimeInMillis() : 'unknown',
        memoryLimitInMB: context.memoryLimitInMB || 'unknown',
      },
      limits: {
        configuredTimeout: '300秒 (可配置到3小时)',
        configuredMemory: context.memoryLimitInMB ? `${context.memoryLimitInMB}MB` : '未知',
        maxExecutionTime: '最长3小时（异步任务）',
        requestBodyLimit: '待测试确认',
        notes: [
          '火山引擎 veFaaS 支持长时间执行',
          '内存和超时时间可根据需要配置',
          '支持弹性扩容和并发处理',
        ],
      },
      comparison: {
        vercel: {
          maxFileSize: '4.5MB',
          maxExecutionTime: '10-30秒',
          status: bodySize > 4.5 * 1024 * 1024 ? '已超过Vercel限制' : '在Vercel限制内',
        },
        volcengine: {
          currentTest: `${(bodySize / 1024 / 1024).toFixed(2)}MB`,
          status: '测试中',
          advantage: processingTime < 30000 ? '处理时间优秀' : '处理时间较长',
        },
      },
    };
    
    console.log('处理完成:', {
      success: true,
      processingTime,
      fileCount: fileInfo.length,
      totalSize: statistics.totalFileSize,
      largestFile: statistics.largestFile,
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Processing-Time': processingTime.toString(),
        'X-Platform': 'volcengine-vefaas',
        'X-File-Count': fileInfo.length.toString(),
        'X-Total-Size': statistics.totalFileSize.toString(),
      },
      body: JSON.stringify(response, null, 2),
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('=== 处理请求时发生错误 ===');
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      processingTime,
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'X-Processing-Time': processingTime.toString(),
        'X-Platform': 'volcengine-vefaas',
        'X-Error': 'true',
      },
      body: JSON.stringify({
        success: false,
        platform: 'volcengine-vefaas',
        timestamp: new Date().toISOString(),
        processingTime,
        error: {
          message: error.message,
          type: error.name || 'UnknownError',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        request: {
          method: event.httpMethod,
          hasBody: !!event.body,
          isBase64: event.isBase64Encoded,
        },
        environment: {
          functionName: context.functionName,
          requestId: context.requestId,
          remainingTime: context.getRemainingTimeInMillis ? context.getRemainingTimeInMillis() : 'unknown',
        },
        troubleshooting: [
          '检查请求格式是否正确',
          '确认 Content-Type 为 multipart/form-data',
          '验证文件大小是否合理',
          '查看函数日志获取详细信息',
        ],
      }, null, 2),
    };
  }
};

// 导出处理函数
export default handler;