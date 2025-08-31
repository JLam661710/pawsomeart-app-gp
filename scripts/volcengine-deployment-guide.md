# 火山引擎部署指南

## 快速部署步骤

### 1. 准备火山引擎账号

1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 注册/登录账号
3. 开通「函数服务 veFaaS」
4. 开通「API 网关」服务

### 2. 创建云函数

#### 2.1 进入函数服务
- 控制台 → 产品与服务 → 函数服务 veFaaS
- 点击「创建函数」

#### 2.2 基础配置
```
函数名称: upload-limit-test
运行时: Node.js 18.x
内存规格: 1024MB
超时时间: 300秒 (5分钟)
环境变量: 无需配置
```

#### 2.3 上传函数代码

**方法一：在线编辑器**
1. 选择「在线编辑」
2. 将 `volcengine-test-function.js` 内容复制到编辑器
3. 修改代码以适配火山引擎格式：

```javascript
// 移除 Express 相关代码，只保留 handler 函数
export const handler = async (event, context) => {
  // ... 函数主体代码
};
```

**方法二：ZIP 包上传**
1. 创建部署包：
```bash
cd scripts
zip -r volcengine-function.zip volcengine-test-function.js
```
2. 上传 ZIP 文件

### 3. 配置 API 网关

#### 3.1 创建 API 网关
- 控制台 → API 网关
- 创建网关实例
- 选择「共享型」（测试用）

#### 3.2 创建 API
```
API 名称: upload-test-api
请求方法: POST
请求路径: /upload-test
后端类型: 函数服务
后端函数: upload-limit-test
```

#### 3.3 配置请求参数
```
请求体格式: multipart/form-data
最大请求体大小: 100MB (根据需要调整)
超时时间: 300秒
```

### 4. 获取测试端点

部署完成后，获取 API 网关提供的访问地址：
```
https://your-gateway-id.volcengineapi.com/upload-test
```

### 5. 执行测试

```bash
# 使用获取的端点地址运行测试
node scripts/volcengine-upload-test.js https://your-gateway-id.volcengineapi.com/upload-test
```

## 火山引擎专用函数代码

创建 `volcengine-cloud-function.js`：

```javascript
/**
 * 火山引擎云函数 - 文件上传测试
 */

export const handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    console.log('收到请求事件:', JSON.stringify(event, null, 2));
    
    // 解析请求
    const { httpMethod, headers, body, isBase64Encoded } = event;
    
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
    
    const contentType = headers['content-type'] || headers['Content-Type'] || '';
    const processingTime = Date.now() - startTime;
    
    // 构建响应
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      processingTime,
      platform: 'volcengine-vefaas',
      request: {
        method: httpMethod,
        contentType,
        bodySize,
        headers: Object.keys(headers),
      },
      environment: {
        functionName: context.functionName,
        functionVersion: context.functionVersion,
        requestId: context.requestId,
        remainingTimeInMillis: context.getRemainingTimeInMillis(),
        region: context.region,
      },
      limits: {
        maxExecutionTime: '300秒 (可配置到3小时)',
        maxMemory: '1024MB (可配置)',
        actualBodySize: `${(bodySize / 1024 / 1024).toFixed(2)}MB`,
      },
    };
    
    console.log('处理完成:', {
      processingTime,
      bodySize,
      success: true,
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
        platform: 'volcengine-vefaas',
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
```

## 监控和调试

### 查看函数日志
1. 函数服务控制台 → 选择函数 → 监控
2. 查看调用次数、错误率、平均耗时
3. 点击「日志」查看详细执行日志

### 性能监控
```
关键指标:
- 调用次数
- 平均响应时间
- 错误率
- 内存使用率
- 超时次数
```

## 成本估算

### 函数服务费用
```
计费项目:
- 调用次数: ¥0.0000017/次
- 执行时长: ¥0.0000017/GB·秒
- 流量费用: ¥0.8/GB

示例 (1000次测试):
- 调用费用: 1000 × ¥0.0000017 = ¥0.0017
- 执行费用: 1000 × 1GB × 3秒 × ¥0.0000017 = ¥0.0051
- 总计: 约 ¥0.007 (不含流量)
```

### API 网关费用
```
- API 调用: ¥0.06/万次
- 流量费用: ¥0.8/GB
```

## 故障排除

### 常见问题

1. **函数超时**
   - 增加超时时间配置
   - 检查函数执行逻辑
   - 优化代码性能

2. **内存不足**
   - 增加内存配置 (512MB → 1024MB)
   - 优化内存使用

3. **API 网关 502 错误**
   - 检查函数是否正常运行
   - 确认返回格式正确
   - 查看函数日志

4. **CORS 问题**
   - 确保响应头包含 CORS 配置
   - 检查 OPTIONS 请求处理

### 调试技巧

1. **本地测试优先**
   ```bash
   # 先在本地验证逻辑
   node scripts/volcengine-test-function.js
   ```

2. **逐步部署**
   - 先部署简单版本
   - 逐步增加功能
   - 每步都进行测试

3. **日志调试**
   ```javascript
   console.log('调试信息:', { event, context });
   ```

## 安全配置

### 访问控制
- 配置 API 密钥认证（生产环境）
- 设置 IP 白名单（如需要）
- 启用请求频率限制

### 数据安全
- 不记录敏感信息到日志
- 及时清理临时文件
- 使用 HTTPS 传输

---

**部署完成后，记得更新测试脚本中的端点地址，然后执行完整的文件上传限制测试！**