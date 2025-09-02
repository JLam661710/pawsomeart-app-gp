# PawsomeArt 统一订单提交函数

## 概述

这是PawsomeArt项目的核心后端函数，专为火山引擎函数服务(veFaaS)优化设计。该函数统一处理所有订单提交请求，包括文件上传和数据写入飞书多维表格。

## 功能特性

### 核心功能
- **统一订单处理**：处理所有类型的定制订单（经典定制款、名画致敬款等）
- **文件上传管理**：支持多张宠物照片和参考图片上传到飞书
- **数据验证**：完整的表单数据验证和手机号格式检查
- **多维表格集成**：自动创建飞书多维表格记录
- **错误处理**：详细的错误分类和用户友好的错误信息

### 技术优势
- **高性能**：利用火山引擎函数服务的高内存和长执行时间
- **大文件支持**：突破Vercel 4.5MB限制，支持更大文件上传
- **简化架构**：消除复杂的批量上传机制
- **弹性扩容**：自动处理高并发请求

## 技术规格

### 运行环境
- **Runtime**: Node.js 18.x
- **内存配置**: 1024MB (推荐)
- **超时时间**: 300秒 (5分钟)
- **并发限制**: 根据业务需求配置

### 依赖包
- `@larksuiteoapi/node-sdk`: 飞书API SDK
- `multiparty`: 表单数据解析

### 环境变量
```bash
# 飞书应用配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_APP_TOKEN=your_app_token
FEISHU_ORDERS_TABLE_ID=your_table_id

# 可选配置
FEISHU_BACKUP_APP_TOKEN=backup_token
FEISHU_BACKUP_ORDERS_TABLE_ID=backup_table_id
MOCK_FEISHU=false
NODE_ENV=production
```

## API接口

### 请求格式
- **方法**: POST
- **Content-Type**: multipart/form-data
- **路径**: `/api/submit-order`

### 请求参数

#### 必填字段
- `phone`: 客户手机号
- `customization_style`: 定制款式名称

#### 可选字段
- `email`: 客户邮箱
- `petCount`: 宠物数量
- `size`: 画像尺寸
- `price`: 预估价格
- `selectionMethod`: 选择方式 (text/upload/recommendation)
- `textDescription`: 文字描述
- `selectedRecommendation`: 推荐选择 (JSON字符串)
- `notes`: 客户备注

#### 文件字段
- `user_uploads`: 宠物照片 (支持多文件)
- `uploadedImage`: 参考图片 (单文件)

### 响应格式

#### 成功响应
```json
{
  "success": true,
  "message": "Order submitted successfully!",
  "orderId": "PA-20240115-1430-0000ABCDEF",
  "data": {
    "record": {
      "record_id": "recXXXXXXXXXXXX"
    }
  },
  "processingTime": 2500
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "订单提交失败",
  "error": {
    "type": "FILE_UPLOAD_ERROR",
    "details": "文件上传失败: image.jpg - 文件过大",
    "suggestions": [
      "请检查图片文件大小是否超过10MB",
      "请确保图片格式为JPG或PNG"
    ]
  },
  "processingTime": 1200
}
```

## 数据映射

### 多维表格字段映射

| 前端字段 | 多维表格字段 | 类型 | 说明 |
|---------|-------------|------|------|
| phone | 客户手机号 | 文本 | 必填 |
| email | 客户邮箱 | 文本 | 可选 |
| customization_style | 具体款式 | 单选 | 必填 |
| petCount | 宠物数量 | 数字 | 可选 |
| size | 画像尺寸 | 单选 | 可选 |
| price | 预估价格 | 货币 | 可选 |
| notes | 客户备注 | 多行文本 | 可选 |
| user_uploads | 宠物照片 | 附件 | 文件数组 |
| uploadedImage | 背景-上传图片/名画-上传图片 | 附件 | 根据款式类型 |
| textDescription | 背景-文字描述/爱宠个性描述 | 多行文本 | 根据款式类型 |
| selectedRecommendation | 背景-推荐选择/名画-推荐选择 | 文本 | 根据款式类型 |

### 订单号生成规则
格式: `PA-YYYYMMDD-HHMM-XXXXXX`
- PA: 项目前缀
- YYYYMMDD: 年月日
- HHMM: 小时分钟
- XXXXXX: 手机号后4位 + 随机字符

## 错误处理

### 错误类型
1. **FILE_UPLOAD_ERROR**: 文件上传失败
2. **REFERENCE_IMAGE_UPLOAD_ERROR**: 参考图片上传失败
3. **NETWORK_ERROR**: 网络连接异常
4. **API_ERROR**: 飞书API异常
5. **FILE_ERROR**: 文件处理失败
6. **GENERAL_ERROR**: 通用错误

### 重试机制
- 文件上传失败时自动重试3次
- 使用指数退避策略 (1s, 2s, 4s)
- 临时文件自动清理

## 部署说明

### 本地测试
```bash
# 安装依赖
npm install

# 设置环境变量
cp .env.example .env
# 编辑 .env 文件，填入正确的配置

# 运行测试
npm test
```

### 火山引擎部署
1. 创建函数服务
2. 上传代码包 (zip格式)
3. 配置环境变量
4. 设置API网关
5. 测试函数

详细部署步骤请参考 `deployment-guide.md`

## 监控和日志

### 关键日志
- 请求开始和结束时间
- 文件上传进度和结果
- 多维表格记录创建状态
- 错误详情和堆栈信息

### 性能指标
- 处理时间 (processingTime)
- 文件上传数量和大小
- 成功率和错误率

## 安全考虑

### 数据保护
- 敏感信息不记录到日志
- 临时文件及时清理
- 环境变量安全存储

### 访问控制
- CORS配置限制来源域名
- API网关访问控制
- 请求大小限制

## 维护和更新

### 版本管理
- 使用语义化版本号
- 保持向后兼容性
- 详细的变更日志

### 故障排查
1. 检查环境变量配置
2. 查看函数执行日志
3. 验证飞书API权限
4. 测试网络连接

## 联系信息

如有问题或建议，请联系开发团队：
- 邮箱: dev@pawsomeart.com
- 项目地址: https://github.com/your-org/pawsomeart-app