# 部署指南

## 环境要求

- Node.js 18+
- npm 或 yarn
- Vercel 账户（推荐）

## 部署前检查清单

### 1. 环境变量配置

在 Vercel 控制台或部署平台中设置以下环境变量：

```bash
# 飞书多维表格配置
FEISHU_APP_ID=your_production_app_id
FEISHU_APP_SECRET=your_production_app_secret
FEISHU_APP_TOKEN=your_production_app_token
FEISHU_ORDERS_TABLE_ID=your_production_table_id

# 容量管理配置
FEISHU_CAPACITY_WARNING_THRESHOLD=16000
FEISHU_CAPACITY_MAX_THRESHOLD=18000

# 生产环境标识
NODE_ENV=production
MOCK_FEISHU=0
```

### 2. 构建测试

部署前在本地测试构建：

```bash
# 安装依赖
npm install

# 运行测试
npm run test:e2e

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 3. 安全检查

- ✅ 确保 `.env.local` 和 `.env.production` 已添加到 `.gitignore`
- ✅ 检查代码中无硬编码的敏感信息
- ✅ 生产环境已禁用调试日志
- ✅ API 频率限制已正确配置

## Vercel 部署步骤

### 方法一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

### 方法二：通过 Git 集成

1. 将代码推送到 GitHub/GitLab
2. 在 Vercel 控制台导入项目
3. 配置环境变量
4. 部署

## 部署后验证

### 功能测试

- [ ] 首页加载正常
- [ ] 产品选择功能正常
- [ ] 文件上传功能正常
- [ ] 订单提交功能正常
- [ ] 错误处理正常显示

### 性能检查

- [ ] 页面加载速度 < 3秒
- [ ] 图片加载优化
- [ ] 静态资源缓存正常

### API 测试

```bash
# 测试推荐接口
curl https://your-domain.vercel.app/api/recommendations

# 测试健康检查
curl https://your-domain.vercel.app/api/health
```

## 监控和维护

### 日志监控

- 在 Vercel 控制台查看函数日志
- 监控错误率和响应时间

### 容量管理

```bash
# 检查飞书表格容量
npm run capacity:check

# 生成容量报告
npm run capacity:report
```

### 备份策略

- 定期备份飞书表格数据
- 配置备用表格（当主表格接近容量限制时）

## 故障排除

### 常见问题

1. **订单提交失败**
   - 检查飞书 API 配置
   - 验证环境变量设置
   - 查看函数日志

2. **文件上传失败**
   - 检查文件大小限制
   - 验证文件类型支持
   - 检查临时文件清理

3. **页面加载缓慢**
   - 检查静态资源缓存
   - 优化图片大小
   - 检查代码分割效果

### 回滚策略

如果部署出现问题，可以通过 Vercel 控制台快速回滚到上一个稳定版本。

## 更新部署

```bash
# 更新代码
git add .
git commit -m "feat: update feature"
git push

# Vercel 会自动触发重新部署
```

## 联系支持

如遇到部署问题，请检查：
1. Vercel 函数日志
2. 浏览器开发者工具
3. 网络连接状态
4. 环境变量配置