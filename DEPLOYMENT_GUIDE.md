# PawsomeArt 部署指南

## 🚀 快速部署

### 方法一：使用自动部署脚本（推荐）
```bash
# 部署并自动提交所有更改
./deploy.sh "你的提交信息"

# 或者使用 npm script
npm run deploy
```

### 方法二：使用 npm scripts
```bash
# 快速部署到生产环境（不提交代码）
npm run deploy:quick

# 部署到预览环境
npm run deploy:preview
```

### 方法三：直接使用 Vercel CLI
```bash
# 部署到生产环境
npx vercel --prod

# 部署到预览环境
npx vercel
```

## 📋 可用的部署命令

| 命令 | 描述 |
|------|------|
| `npm run deploy` | 完整部署流程：提交代码 → 推送到 GitHub → 部署到 Vercel |
| `npm run deploy:quick` | 快速部署到生产环境（跳过 Git 操作） |
| `npm run deploy:preview` | 部署到预览环境 |
| `npm run vercel:list` | 查看所有部署 |
| `npm run vercel:logs` | 查看部署日志 |
| `npm run vercel:login` | 登录 Vercel |
| `npm run vercel:link` | 连接到 Vercel 项目 |

## 🔧 初始设置

如果这是第一次在新环境中部署，请按以下步骤操作：

1. **登录 Vercel**
   ```bash
   npm run vercel:login
   ```

2. **连接项目**
   ```bash
   npm run vercel:link
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

## 📊 监控部署

- **查看所有部署**: `npm run vercel:list`
- **查看部署日志**: `npm run vercel:logs`
- **Vercel 控制台**: https://vercel.com/dashboard

## 🔄 自动部署工作流

当你运行 `./deploy.sh` 或 `npm run deploy` 时，脚本会自动：

1. ✅ 检查是否有未提交的更改
2. 📦 添加所有更改到 Git
3. 💾 提交更改（使用提供的消息或自动生成）
4. ⬆️ 推送到 GitHub
5. 🌐 部署到 Vercel 生产环境
6. 🎉 显示部署结果

## 🚨 故障排除

### 问题：`vercel: command not found`
**解决方案**: 使用 `npx vercel` 而不是 `vercel`

### 问题：权限被拒绝
**解决方案**: 确保脚本有执行权限
```bash
chmod +x deploy.sh
```

### 问题：Git 推送失败
**解决方案**: 检查 Git 配置和网络连接
```bash
git config --list
git remote -v
```

## 📝 最佳实践

1. **提交消息**: 使用有意义的提交消息
   ```bash
   ./deploy.sh "修复图片上传大小限制问题"
   ```

2. **测试**: 在部署前先在本地测试
   ```bash
   npm run dev
   ```

3. **预览**: 使用预览部署测试新功能
   ```bash
   npm run deploy:preview
   ```

4. **监控**: 定期检查部署状态和日志
   ```bash
   npm run vercel:list
   npm run vercel:logs
   ```

## 🔗 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [项目仓库](https://github.com/JLam661710/pawsomeart-app)
- [生产环境](https://pawsomeart-app.vercel.app)