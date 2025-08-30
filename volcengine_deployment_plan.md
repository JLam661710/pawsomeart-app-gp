# PawsomeArt 项目迁移至火山引擎函数服务部署计划

## 项目概述

本项目是一个宠物艺术定制平台，目前基于 Vercel Serverless Functions 架构，需要迁移至火山引擎函数服务（veFaaS）+ GitHub Pages 的新架构。

### 当前技术栈
- **前端**: React + Vite + Tailwind CSS
- **后端**: Vercel Serverless Functions (Node.js)
- **数据存储**: 飞书多维表格
- **部署**: Vercel 全栈部署

### 目标架构
- **前端**: React + Vite + Tailwind CSS (部署至 GitHub Pages)
- **后端**: 火山引擎函数服务 (veFaaS)
- **数据存储**: 飞书多维表格 (保持不变)
- **API 调用**: 通过 HTTP 触发器调用火山引擎函数

## 可行性评估

### ✅ 技术可行性

1. **函数服务兼容性**
   - 火山引擎 veFaaS 支持 Node.js 运行时
   - 支持 HTTP 触发器，可提供 REST API 接口
   - 支持 multipart/form-data 文件上传处理
   - 支持环境变量配置（飞书 API 密钥等）

2. **文件上传处理**
   - veFaaS 支持通过 multiparty 和 multer 中间件处理文件上传
   - 可以处理 multipart/form-data 格式数据
   - 支持文件大小限制和类型验证

3. **API Gateway 集成**
   - 火山引擎提供 API 网关服务
   - 支持 CORS 跨域配置
   - 支持自定义域名和路径映射

4. **前端静态部署**
   - GitHub Pages 支持 React SPA 部署
   - 支持自定义域名和 HTTPS
   - 可通过 GitHub Actions 实现自动化部署

### ✅ 业务可行性

1. **功能完整性**
   - 所有现有 API 功能可以完整迁移
   - 飞书多维表格集成保持不变
   - 文件上传、批量处理等核心功能可正常实现

2. **性能优势**
   - 火山引擎 veFaaS 提供毫秒级冷启动
   - 支持最大 1000 单实例并发
   - 按需计费，降低成本

3. **运维优势**
   - 前后端分离，独立部署和扩展
   - GitHub Pages 提供稳定的静态资源服务
   - 火山引擎提供完善的监控和日志

## 详细迁移方案

### 阶段一：环境准备和配置

#### 1.1 火山引擎账号和服务准备
- [ ] 注册火山引擎账号
- [ ] 开通函数服务 (veFaaS)
- [ ] 开通 API 网关服务
- [ ] 配置访问密钥 (AK/SK)
- [ ] 创建项目和资源组

#### 1.2 开发环境配置
- [ ] 安装 veFaaS Code Deployer 插件 (VSCode/Trae)
- [ ] 配置本地开发环境
- [ ] 安装 Serverless Devs 工具

#### 1.3 GitHub Pages 准备
- [ ] 创建 GitHub 仓库（如果需要新仓库）
- [ ] 配置 GitHub Pages 设置
- [ ] 设置自定义域名（可选）

### 阶段二：后端函数迁移

#### 2.1 函数结构设计

基于现有的 4 个 API 端点，创建对应的火山引擎函数：

1. **submit-order** - 单个订单提交
2. **submit-order-batch** - 批量订单提交  
3. **upload-batch** - 批量文件上传
4. **recommendations** - 推荐数据获取

#### 2.2 函数代码适配

**通用适配要点：**
```javascript
// 火山引擎函数入口结构
const { vefaas } = require('@volcengine/vefaas-golang-runtime');

function handler(ctx, event) {
  // 处理 HTTP 请求
  const { method, path, headers, body } = event;
  
  // 业务逻辑处理
  // ...
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(result)
  };
}

vefaas.Start(handler);
```

**文件上传处理适配：**
```javascript
const multiparty = require('multiparty');

function parseMultipartData(event) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(event, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
```

#### 2.3 环境变量配置

在火山引擎函数中配置以下环境变量：
- `FEISHU_APP_ID` - 飞书应用 ID
- `FEISHU_APP_SECRET` - 飞书应用密钥
- `FEISHU_APP_TOKEN` - 飞书多维表格 Token
- `FEISHU_TABLE_ID` - 飞书表格 ID

#### 2.4 函数部署和测试

- [ ] 创建函数实例
- [ ] 配置运行时环境 (Node.js 18)
- [ ] 设置内存和超时配置
- [ ] 部署函数代码
- [ ] 创建 HTTP 触发器
- [ ] 配置 API 网关路由
- [ ] 测试函数调用

### 阶段三：API 网关配置

#### 3.1 创建 API 网关实例
- [ ] 创建网关实例
- [ ] 配置网关服务
- [ ] 设置自定义域名（可选）

#### 3.2 路由配置

配置以下 API 路由：
```
POST /api/submit-order -> submit-order 函数
POST /api/submit-order-batch -> submit-order-batch 函数
POST /api/upload-batch -> upload-batch 函数
GET  /api/recommendations -> recommendations 函数
```

#### 3.3 CORS 和安全配置
- [ ] 配置 CORS 策略
- [ ] 设置请求频率限制
- [ ] 配置 HTTPS 证书
- [ ] 设置访问日志

### 阶段四：前端代码适配

#### 4.1 API 基础 URL 配置

更新前端 API 调用配置：
```javascript
// config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-gateway-domain.com'
  : 'http://localhost:3001';

export default API_BASE_URL;
```

#### 4.2 API 调用适配

更新所有 API 调用，使用完整的 URL：
```javascript
// 原来的调用
fetch('/api/submit-order', options)

// 更新后的调用
fetch(`${API_BASE_URL}/api/submit-order`, options)
```

#### 4.3 构建配置优化

更新 `vite.config.js`：
```javascript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/PawsomeArt-app/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

### 阶段五：GitHub Pages 部署

#### 5.1 GitHub Actions 配置

创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 5.2 环境变量配置

在 GitHub 仓库设置中配置：
- `API_BASE_URL` - 火山引擎 API 网关地址

### 阶段六：测试和验证

#### 6.1 功能测试
- [ ] 基础信息填写测试
- [ ] 单文件上传测试
- [ ] 批量文件上传测试
- [ ] 订单提交测试
- [ ] 推荐数据获取测试
- [ ] 跨域访问测试

#### 6.2 性能测试
- [ ] 函数冷启动时间测试
- [ ] 文件上传性能测试
- [ ] 并发请求测试
- [ ] 前端加载性能测试

#### 6.3 集成测试
- [ ] 完整用户流程测试
- [ ] 飞书数据写入验证
- [ ] 错误处理测试
- [ ] 监控和日志验证

## 开发前准备工作

### 技术调研

1. **火山引擎函数服务深度调研**
   - [ ] 阅读官方文档：https://www.volcengine.com/docs/6662/
   - [ ] 了解 Node.js 运行时特性和限制
   - [ ] 研究文件上传最佳实践
   - [ ] 了解计费模式和成本优化

2. **API 网关服务调研**
   - [ ] 阅读 API 网关文档
   - [ ] 了解路由配置和域名绑定
   - [ ] 研究 CORS 和安全配置
   - [ ] 了解监控和日志功能

3. **GitHub Pages 部署调研**
   - [ ] 了解 GitHub Actions 工作流
   - [ ] 研究 SPA 路由配置
   - [ ] 了解自定义域名配置

### 环境搭建

1. **开发工具准备**
   - [ ] 安装 veFaaS Code Deployer 插件
   - [ ] 配置火山引擎 CLI 工具
   - [ ] 准备测试环境

2. **账号和权限配置**
   - [ ] 火山引擎账号注册和实名认证
   - [ ] 开通相关服务
   - [ ] 配置 IAM 权限
   - [ ] 生成访问密钥

3. **代码仓库准备**
   - [ ] 创建新的 GitHub 仓库（如需要）
   - [ ] 配置分支保护规则
   - [ ] 设置 GitHub Pages

### 风险评估和应对

#### 技术风险

1. **函数冷启动延迟**
   - 风险：首次调用可能有延迟
   - 应对：使用预热策略，优化函数代码

2. **文件上传大小限制**
   - 风险：火山引擎可能有文件大小限制
   - 应对：实现分片上传，优化压缩策略

3. **跨域配置复杂性**
   - 风险：前后端分离可能导致跨域问题
   - 应对：详细配置 CORS 策略

#### 业务风险

1. **迁移期间服务中断**
   - 风险：迁移过程中可能影响用户使用
   - 应对：采用蓝绿部署，保持原服务运行

2. **数据一致性**
   - 风险：迁移过程中数据可能不一致
   - 应对：充分测试，确保飞书集成正常

## 成本分析

### 火山引擎 veFaaS 成本
- **计算费用**：按调用次数和执行时间计费
- **流量费用**：按出网流量计费
- **存储费用**：函数代码存储费用

### GitHub Pages 成本
- **免费额度**：公开仓库免费使用
- **带宽限制**：每月 100GB 流量限制
- **存储限制**：1GB 存储空间限制

### 预估月成本
- 火山引擎函数服务：¥50-200（根据调用量）
- GitHub Pages：免费
- 总计：¥50-200/月

## 时间规划

### 第一周：准备和调研
- 完成技术调研
- 搭建开发环境
- 配置账号和权限

### 第二周：后端迁移
- 适配函数代码
- 部署测试函数
- 配置 API 网关

### 第三周：前端适配
- 更新前端代码
- 配置 GitHub Actions
- 部署到 GitHub Pages

### 第四周：测试和优化
- 功能测试
- 性能优化
- 上线准备

## 监控和运维

### 监控指标
- 函数调用次数和成功率
- 函数执行时间和内存使用
- API 网关请求量和响应时间
- 前端页面加载性能

### 日志管理
- 函数执行日志
- API 网关访问日志
- 错误日志和告警

### 备份和恢复
- 函数代码版本管理
- 配置备份
- 数据备份策略

## 总结

本迁移方案技术可行，业务风险可控，预期能够实现：

1. **架构优化**：前后端完全分离，提高可维护性
2. **成本优化**：按需计费，降低运营成本
3. **性能提升**：利用火山引擎的高性能计算能力
4. **运维简化**：减少服务器运维工作量

建议按照本计划逐步实施，确保平稳迁移。