# PawsomeArt 定制应用技术选型与框架设计

## 项目概述

PawsomeArt 定制应用是一个轻量化的移动端网页应用，采用现代化的前后端分离架构。前端部署在GitHub Pages上，后端采用火山引擎函数服务，通过飞书多维表格作为数据存储后端，实现完整的订单管理和文件上传功能。

## 核心设计原则

1. **前端体验保持**: 完全保持现有的页面、布局、用户体验和视觉元素
2. **云原生架构**: 采用火山引擎函数服务，实现高可用、弹性扩展的后端服务
3. **静态部署**: 前端部署在GitHub Pages，降低部署成本，提高访问速度
4. **API层重构**: 重新设计API调用层，提升代码质量和可维护性
## 技术栈选型

### 前端技术栈
- **框架**: React 18 + Vite
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **HTTP客户端**: Axios
- **部署平台**: GitHub Pages

### 后端技术栈
- **函数服务**: 火山引擎函数服务 (Volcengine Function Service)
- **运行时**: Node.js 18
- **API网关**: 火山引擎API网关
- **数据存储**: 飞书多维表格
- **文件存储**: 飞书云文档

## 整体架构设计

### 架构模式: "前后端分离 + 云原生"

- **前端**: React + Vite 构建的单页应用，部署在 GitHub Pages
- **后端**: 火山引擎函数服务 (Volcengine Function Service)，提供RESTful API
- **数据存储**: 飞书多维表格 (Bitable)
- **文件存储**: 飞书云文档
- **API网关**: 火山引擎API网关，处理跨域和路由

### 数据流程

1. **用户交互**: 用户在前端填写表单并上传图片
2. **API调用**: 前端通过统一的API服务层调用后端接口
3. **函数处理**: 火山引擎函数服务处理请求：
   - 解析表单数据和文件
   - 上传图片到飞书，获取 `file_token`
   - 将文本数据和 `file_token` 写入飞书多维表格
4. **响应返回**: 函数服务返回处理结果给前端
5. **错误处理**: 统一的错误处理和重试机制
11. 飞书多维表格数据结构 (增强版)
为确保数据能被正确、完整、结构化地接收，从而支持后续高效的运营和自动化流程，我们推荐采用以下经过优化的飞书多维表格列（字段）设计。

#### A. 订单基础信息
| 字段名 (Field Name) | 字段类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| **订单号** | `文本` | 唯一标识每个订单的ID，建议格式 `PA-YYYYMMDD-HHMM-XXXXXX`。 |
| **提交时间** | `创建时间` | 记录用户提交表单的精确时间，自动填充。 |
| **产品系列** | `单选` | 对应 `product_sort.md` 的两大分类，如“全新艺术创作系列”。 |
| **具体款式** | `单选` | 对应具体的画像风格，如“经典定制款”、“名画致敬款”等。 |
| **宠物数量** | `数字` | 用户选择的参与画像的宠物数量。 |
| **画像尺寸** | `单选` | 用户选择的画像尺寸，如“8寸”、“A4”、“大尺寸”。 |

#### B. 价格与状态
| 字段名 (Field Name) | 字段类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| **预估价格** | `货币` | 根据用户选择自动计算的初始价格。 |
| **最终价格** | `货币` | 经运营人员确认或调整后的最终成交价格。 |
| **订单状态** | `单选` | 跟踪订单生命周期，如“待处理”、“设计中”、“待确认”、“已完成”、“已取消”。 |

#### C. 客户信息
| 字段名 (Field Name) | 字段类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| **客户手机号** | `文本` | 用户的手机号，用于后续沟通。 |
| **客户邮箱** | `文本` | 用户的邮箱，用于后续沟通。 |
| **客户备注** | `多行文本` | 用户在提交时留下的任何额外要求或说明。 |

#### D. 定制化详情 (核心)
这部分字段用于精确捕捉用户的每一个定制化选择，是实现高质量定制的关键。

| 字段名 (Field Name) | 字段类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| **宠物照片** | `附件` | 用户上传的宠物照片，可多张。这是生成画像的核心素材。 |
| **背景设定方式** | `单选` | 记录背景选择的来源，如“文字描述”、“上传图片”、“推荐图库”。 |
| **背景-文字描述** | `多行文本` | 如果背景设定方式为“文字描述”，则此字段记录具体内容。 |
| **背景-上传图片** | `附件` | 如果背景设定方式为“上传图片”，则此字段记录用户上传的背景图片。 |
| **背景-推荐选择** | `文本` | 如果背景设定方式为“推荐图库”，则此字段记录所选推荐背景的编号或名称。 |
| **名画选择方式** | `单选` | (仅名画致敬款) 记录名画选择来源，如“上传图片”、“推荐图库”。 |
| **名画-上传图片** | `附件` | (仅名画致敬款) 用户上传的参考名画图片。 |
| **名画-推荐选择** | `文本` | (仅名画致敬款) 所选推荐名画的编号或名称。 |
| **爱宠个性描述** | `多行文本` | (仅经典定制款) 用户对宠物性格、特点的描述，用于创作。 |


云函数需要发送给飞书的 JSON 格式 (示例):
```json
{
  "fields": {
    "订单号": "PA-20250818-1100-C3PO01",
    "产品系列": "全新艺术创作系列",
    "具体款式": "经典定制款",
    "宠物数量": 1,
    "画像尺寸": "8寸",
    "预估价格": 188,
    "订单状态": "待处理",
    "客户联系方式": "13900000001",
    "客户备注": "背景色请使用柔和的蓝色。",
    "宠物照片": [
      { "file_token": "boxcnDog001Tokenxxxxxx" },
      { "file_token": "boxcnDog002Tokenxxxxxx" },
      { "file_token": "boxcnDog003Tokenxxxxxx" }
    ],
    "背景设定方式": "文字描述",
    "背景-文字描述": "柔和的蓝色",
    "爱宠个性描述": "我家狗狗叫旺财，是一只非常温顺的金毛，性格很粘人，喜欢傻笑。"
  }
}
```
## 项目文件夹结构

### 前端项目结构 (GitHub Pages)
```
pawsomeart-frontend/
├── public/                # 静态资源
├── src/
│   ├── assets/            # 存放所有静态图片资源
│   ├── components/        # 可复用的 UI 组件
│   ├── constants/         # 存放常量
│   ├── pages/             # 页面级组件
│   ├── services/          # API服务层
│   │   ├── api.js         # 统一的API调用封装
│   │   └── feishu.js      # 飞书相关API
│   ├── utils/             # 工具函数
│   ├── App.jsx
│   └── main.jsx
├── .env.production        # 生产环境变量
├── package.json
├── vite.config.js         # Vite配置
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions部署配置
```

### 后端项目结构 (火山引擎函数服务)
```
pawsomeart-backend/
├── functions/
│   ├── submit/            # 订单提交函数
│   │   ├── index.js       # 主处理逻辑
│   │   ├── package.json
│   │   └── config.json    # 函数配置
│   └── upload/            # 文件上传函数
│       ├── index.js
│       ├── package.json
│       └── config.json
├── shared/                # 共享代码
│   ├── feishu.js         # 飞书API封装
│   └── utils.js          # 工具函数
└── deploy.yml            # 部署配置
```
## 核心开发指令

### 前端开发步骤

1. **初始化项目**: 使用 Vite 创建新的 React + Tailwind CSS 项目
2. **环境配置**: 配置 `.env.production` 文件，设置火山引擎函数服务的API端点
3. **API服务层**: 创建统一的API调用封装，支持错误处理和重试机制
4. **GitHub Actions**: 配置自动化部署到GitHub Pages

### 后端开发步骤

1. **函数服务初始化**: 在火山引擎控制台创建函数服务项目
2. **订单提交函数** (`functions/submit/index.js`):
   - 获取飞书 Tenant Access Token
   - 解析 multipart/form-data 请求
   - 上传图片到飞书，获取 file_token
   - 组装数据并写入飞书多维表格
   - 返回处理结果

3. **文件上传函数** (`functions/upload/index.js`):
   - 处理大文件上传
   - 支持分片上传
   - 返回上传进度

4. **API网关配置**: 配置跨域策略和路由规则

### 前端API调用逻辑

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// 订单提交
export const submitOrder = async (formData) => {
  const response = await api.post('/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
```
## 核心开发者文档链接

### 前端框架与样式
- **React 官方文档**: https://react.dev/
  - 用途: 构建用户界面的核心框架
- **Vite 官方指南**: https://vitejs.dev/guide/
  - 用途: 项目构建工具和开发服务器
- **Tailwind CSS 官方文档**: https://tailwindcss.com/docs/
  - 用途: CSS框架，用于快速构建样式

### 部署与云服务
- **GitHub Pages 部署指南**: https://docs.github.com/en/pages
  - 用途: 前端静态网站部署平台
- **GitHub Actions 文档**: https://docs.github.com/en/actions
  - 用途: 自动化CI/CD流程
- **火山引擎函数服务文档**: https://www.volcengine.com/docs/6459
  - 用途: 后端Serverless函数服务，项目的核心后端架构
- **火山引擎API网关文档**: https://www.volcengine.com/docs/6462
  - 用途: API网关配置，处理跨域和路由

### 飞书开放平台 API
- **获取 Tenant Access Token**: https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal
  - 用途: 获取飞书API调用凭证
- **上传附件 API**: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all
  - 用途: 上传图片文件到飞书，获取file_token
- **新增记录 API**: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create
  - 用途: 向飞书多维表格添加新记录

### 开发工具
- **Axios 文档**: https://axios-http.com/docs/intro
  - 用途: HTTP客户端，用于API调用
- **Node.js 官方文档**: https://nodejs.org/docs/
  - 用途: 后端函数运行时环境