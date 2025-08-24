# PawsomeArt App

一个基于React的宠物艺术创作平台，让用户能够将宠物照片转换为艺术作品。

## 🎨 项目简介

PawsomeArt是一个创新的Web应用，专门为宠物爱好者设计，提供将宠物照片转换为各种艺术风格作品的服务。用户可以上传宠物照片，选择不同的艺术风格，获得独特的艺术作品。

## ✨ 主要功能

- 📸 宠物照片上传和处理
- 🎭 多种艺术风格选择
- 🖼️ 实时预览和定制
- 📱 响应式设计，支持移动端
- 🛒 在线订购和支付
- 📦 批量上传处理

## 🛠️ 技术栈

### 前端
- **React 19** - 用户界面框架
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

### 后端
- **Node.js** - 运行环境
- **Express** - Web框架
- **Multer** - 文件上传处理
- **CORS** - 跨域资源共享
- **Rate Limiting** - 请求限制

### 开发工具
- **ESLint** - 代码检查
- **Playwright** - 端到端测试
- **PostCSS** - CSS处理
- **Terser** - 代码压缩

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 根据需要配置环境变量

### 开发模式
```bash
# 启动前端开发服务器
npm run dev

# 启动API服务器
npm run dev:api
```

### 构建项目
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 🧪 测试

### 运行端到端测试
```bash
npm run test:e2e
```

### 测试UI模式
```bash
npm run test:e2e:ui
```

### 生成测试代码
```bash
npm run e2e:codegen
```

## 📊 项目管理

### 代码检查
```bash
npm run lint
```

### 持续集成
```bash
npm run ci
```

### 变更日志
```bash
# 添加变更记录
npm run changelog:add

# 查看状态
npm run changelog:status

# 查看变更日志
npm run changelog:view
```

### 容量监控
```bash
# 监控系统容量
npm run capacity:monitor

# 生成容量报告
npm run capacity:report

# 检查容量状态
npm run capacity:check
```

## 🚀 部署

### Vercel部署（推荐）
```bash
# 快速部署到生产环境
npm run deploy:quick

# 部署预览版本
npm run deploy:preview

# 完整部署流程
npm run deploy
```

### Vercel管理
```bash
# 登录Vercel
npm run vercel:login

# 链接项目
npm run vercel:link

# 查看日志
npm run vercel:logs

# 列出项目
npm run vercel:list
```

## 📁 项目结构

    