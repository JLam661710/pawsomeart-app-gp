# 火山引擎文件上传限制技术验证测试

本测试套件用于验证火山引擎 veFaaS（函数计算）和 API 网关的实际文件上传大小限制，以便与 Vercel 进行技术对比，辅助最终的技术选型决策。

## 测试目标

1. **确认火山引擎的实际文件上传大小限制**
2. **测试不同大小文件的上传性能**
3. **验证批量文件上传的处理能力**
4. **对比 Vercel 的 4.5MB 限制**
5. **评估执行时间限制（相比 Vercel 的 10-30秒）**

## 测试架构

```
测试客户端 (volcengine-upload-test.js)
    ↓ HTTP POST (multipart/form-data)
火山引擎 API 网关
    ↓
火山引擎 veFaaS 函数 (volcengine-test-function.js)
    ↓ 响应
测试结果分析和报告
```

## 文件说明

### 1. `volcengine-upload-test.js`
**测试客户端脚本**
- 生成不同大小的测试文件（1MB - 100MB）
- 执行单文件和批量文件上传测试
- 记录响应时间、成功率和错误信息
- 生成详细的测试报告

### 2. `volcengine-test-function.js`
**火山引擎云函数代码**
- 接收和解析 multipart/form-data 请求
- 统计文件大小和数量
- 返回详细的处理信息
- 包含本地 Express 服务器用于本地测试

## 测试步骤

### 步骤 1: 准备环境

```bash
# 安装依赖
npm install axios form-data express multer

# 或者如果项目已有 package.json
npm install
```

### 步骤 2: 部署火山引擎云函数

1. **登录火山引擎控制台**
   - 访问 [火山引擎控制台](https://console.volcengine.com/)
   - 进入「函数服务 veFaaS」

2. **创建新函数**
   ```
   函数名称: upload-limit-test
   运行时: Node.js 18.x
   内存配置: 512MB (可根据需要调整)
   超时时间: 300秒 (5分钟)
   ```

3. **上传函数代码**
   - 将 `volcengine-test-function.js` 的内容复制到函数编辑器
   - 或打包上传 ZIP 文件

4. **配置 API 网关触发器**
   - 创建 HTTP 触发器
   - 记录生成的 API 端点 URL

### 步骤 3: 本地测试（可选）

在部署到火山引擎之前，可以先进行本地测试：

```bash
# 启动本地测试服务器
node scripts/volcengine-test-function.js

# 在另一个终端运行测试
node scripts/volcengine-upload-test.js http://localhost:3001
```

### 步骤 4: 执行火山引擎测试

```bash
# 使用火山引擎的实际端点进行测试
node scripts/volcengine-upload-test.js https://your-volcengine-function.endpoint.com
```

## 测试配置

### 测试文件大小
- 1MB - 基准测试
- 4.5MB - Vercel 当前限制
- 10MB - 中等大小文件
- 20MB - 大文件测试
- 50MB - 超大文件测试
- 100MB - 极限测试

### 测试类型
1. **单文件上传测试** - 测试不同大小的单个文件
2. **批量上传测试** - 测试多个文件同时上传

### 超时设置
- 客户端超时: 3分钟
- 函数超时: 5分钟（可调整）

## 预期测试结果

### 成功指标
- ✅ 上传成功率
- ⏱️ 响应时间
- 📊 最大支持文件大小
- 🔄 批量处理能力

### 失败分析
- ❌ 请求体大小限制
- ⏰ 执行时间超时
- 💾 内存限制
- 🌐 网络传输限制

## 与 Vercel 对比分析

| 指标 | Vercel | 火山引擎 veFaaS | 优势 |
|------|--------|----------------|------|
| 文件大小限制 | 4.5MB | 待测试 | ? |
| 执行时间限制 | 10-30秒 | 最长3小时 | 🔥 火山引擎 |
| 冷启动时间 | ~100ms | 待测试 | ? |
| 并发处理 | 有限制 | 待测试 | ? |
| 成本 | 按请求计费 | 按使用量计费 | ? |

## 测试报告

测试完成后，会生成以下文件：
- `volcengine-upload-test-report.json` - 详细测试数据
- 控制台输出 - 实时测试结果

### 报告内容
```json
{
  "timestamp": "2024-01-XX",
  "endpoint": "https://your-endpoint",
  "results": [
    {
      "type": "single",
      "success": true,
      "fileSize": 1048576,
      "duration": 1234,
      "status": 200
    }
  ],
  "summary": {
    "totalTests": 7,
    "successfulUploads": 5,
    "failedUploads": 2,
    "maxSuccessfulSize": 20971520,
    "minFailedSize": 52428800
  }
}
```

## 技术选型建议

基于测试结果，我们将能够得出以下结论：

### 如果火山引擎表现优异
- ✅ **文件大小限制** > 4.5MB
- ✅ **执行时间** > 30秒
- ✅ **稳定性**良好
- ✅ **成本**合理

**建议**: 考虑迁移到火山引擎，可以解决当前 Vercel 的限制问题

### 如果火山引擎存在限制
- ❌ 文件大小限制类似或更严格
- ❌ 其他技术限制

**建议**: 继续优化当前的批量上传方案，或考虑其他云服务商

## 注意事项

1. **成本控制**: 测试过程中会产生一定的函数调用费用
2. **网络环境**: 确保网络连接稳定，避免网络问题影响测试结果
3. **并发限制**: 避免同时运行多个测试实例
4. **数据清理**: 测试完成后及时清理临时文件

## 故障排除

### 常见问题

1. **连接超时**
   ```
   Error: timeout of 180000ms exceeded
   ```
   - 检查网络连接
   - 增加超时时间
   - 确认火山引擎端点可访问

2. **413 Payload Too Large**
   ```
   HTTP Status: 413
   ```
   - 已达到文件大小限制
   - 记录限制值用于分析

3. **500 Internal Server Error**
   ```
   HTTP Status: 500
   ```
   - 检查云函数日志
   - 确认函数代码正确部署
   - 检查内存和超时配置

## 下一步行动

1. **执行测试** - 按照上述步骤进行完整测试
2. **分析结果** - 对比测试数据与 Vercel 限制
3. **成本评估** - 计算迁移和运营成本
4. **技术决策** - 基于测试结果做出最终选择
5. **迁移计划** - 如果选择火山引擎，制定详细迁移方案

---

**测试负责人**: AI Assistant  
**测试日期**: 2024年1月  
**版本**: v1.0