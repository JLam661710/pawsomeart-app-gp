# PawsomeArt - 宠物肖像画定制平台

一个基于 React + Vite 构建的宠物肖像画定制平台，为用户提供多种艺术风格的宠物肖像画定制服务。

## 项目特色

- **多种定制款式**: 经典定制款、名作致敬款、姿态保留款
- **智能推荐系统**: 基于用户偏好的背景和艺术风格推荐
- **实时预览**: 支持图片上传和文字描述两种定制方式
- **完整订单流程**: 从定制到提交的完整用户体验

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS
- **后端**: Node.js + Express
- **数据存储**: 飞书多维表格集成
- **开发工具**: ESLint + Playwright (E2E测试)

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
# 启动前端开发服务器 (http://localhost:5173)
npm run dev

# 启动后端API服务器 (http://localhost:3001)
npm run dev:api
```

### 运行测试
```bash
# 运行E2E测试
npm run test:e2e
```

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   └── assets/            # 静态资源
├── api/                   # API路由
├── public/                # 公共静态文件
├── prd_and_plan/          # 项目规划和文档
├── tests/                 # 测试文件
└── server.cjs             # 后端服务器
```

## 开发文档

- **开发日志**: [prd_and_plan/development_changelog.md](./prd_and_plan/development_changelog.md) - 记录项目开发过程中的重要修改和优化
- **产品需求**: [prd_and_plan/prd.md](./prd_and_plan/prd.md) - 产品需求文档
- **技术架构**: [prd_and_plan/technology_framework_and_plan.md](./prd_and_plan/technology_framework_and_plan.md) - 技术框架和开发计划
- **容量管理**: [prd_and_plan/feishu_capacity_management_plan.md](./prd_and_plan/feishu_capacity_management_plan.md) - 飞书多维表格容量管理策略和实施计划

## 部署

项目支持 Vercel 部署，配置文件为 `vercel.json`。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

请在提交前运行测试，并更新相关文档。开发过程中的重要修改请记录到开发日志中。
