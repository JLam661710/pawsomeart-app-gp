# 火山引擎函数服务部署指南

## 概述

本指南详细说明如何在火山引擎平台部署PawsomeArt统一订单提交函数，包括函数服务配置、API网关设置和完整的测试流程。

## 前置条件

### 账号准备
- 火山引擎账号并完成实名认证
- 开通函数服务(veFaaS)和API网关服务
- 具备相应的IAM权限

### 资源准备
- 飞书应用配置信息
- 多维表格ID和权限
- 部署代码包(zip文件)

## 第一步：创建函数服务

### 1.1 登录控制台
1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 选择「函数服务」产品
3. 选择目标地域（推荐：华北2-北京）

### 1.2 创建函数
1. 点击「创建函数」
2. 填写基本信息：
   ```
   函数名称: submit-order-unified
   描述: PawsomeArt统一订单提交函数
   运行时: Node.js 18
   ```

### 1.3 配置函数参数
```yaml
# 基础配置
内存规格: 1024 MB
超时时间: 300 秒 (5分钟)
并发实例数: 100 (根据业务需求调整)

# 网络配置
VPC: 默认VPC (或自定义VPC)
子网: 默认子网
安全组: 默认安全组

# 日志配置
日志服务: 开启
日志保留期: 7天
```

### 1.4 上传代码包
1. 选择「上传ZIP包」
2. 上传准备好的 `submit-order-unified.zip` 文件
3. 设置入口函数：`index.handler`

## 第二步：配置环境变量

### 2.1 在函数配置页面添加环境变量
```bash
# 必填环境变量
FEISHU_APP_ID=cli_a82b11b2cef8500b
FEISHU_APP_SECRET=rwvdNRqdGK5jniJZ5qnaDrB1vpOrapT0
FEISHU_APP_TOKEN=D57IbyuasaNE0qsqVEmcTBHJnNf
FEISHU_ORDERS_TABLE_ID=tbl2H2OYtBX0TLbT

# 可选环境变量
FEISHU_BACKUP_APP_TOKEN=Akr0bavQ6aBgD8sxNlUcIl0Gnqe
FEISHU_BACKUP_ORDERS_TABLE_ID=tbllFeAA9QPXNEHI
NODE_ENV=production
MOCK_FEISHU=false
```

### 2.2 环境变量安全配置
- 敏感信息使用「加密存储」
- 定期轮换密钥
- 限制访问权限

## 第三步：配置API网关

### 3.1 创建API分组
1. 进入「API网关」控制台
2. 点击「创建API分组」
3. 填写分组信息：
   ```
   分组名称: pawsomeart-api
   描述: PawsomeArt API服务
   地域: 华北2-北京 (与函数服务保持一致)
   ```

### 3.2 创建API接口

#### 基本信息
```yaml
API名称: submit-order
描述: 统一订单提交接口
API路径: /api/submit-order
HTTP方法: POST
```

#### 请求配置
```yaml
# 请求参数
Content-Type: multipart/form-data
请求体大小限制: 50 MB
超时时间: 300 秒

# 参数定义
参数类型: Form Data
必填参数:
  - phone (string): 客户手机号
  - customization_style (string): 定制款式
可选参数:
  - email (string): 客户邮箱
  - petCount (number): 宠物数量
  - size (string): 画像尺寸
  - price (number): 预估价格
  - selectionMethod (string): 选择方式
  - textDescription (string): 文字描述
  - selectedRecommendation (string): 推荐选择
  - notes (string): 客户备注
  - user_uploads (file[]): 宠物照片
  - uploadedImage (file): 参考图片
```

#### 后端配置
```yaml
后端类型: 函数服务
函数服务:
  地域: 华北2-北京
  函数名称: submit-order-unified
  版本: $LATEST
  别名: (留空)

# 高级配置
后端超时: 300000 ms (5分钟)
重试次数: 0
```

#### CORS配置
```yaml
# 跨域设置
允许的源: 
  - https://your-frontend-domain.com
  - https://localhost:3000 (开发环境)
  - https://127.0.0.1:3000 (开发环境)
  - https://jlam661710.github.io (GitHub Pages 主域名)
  - https://jlam661710.github.io/pawsomeart-app-gp (GitHub Pages 项目域名)

允许的方法: POST, OPTIONS
允许的头部: 
  - Content-Type
  - Authorization
  - X-Requested-With

允许凭证: false
预检请求缓存时间: 86400 (24小时)
```

### 3.3 发布API
1. 完成API配置后点击「发布」
2. 选择发布环境：
   ```
   环境名称: prod
   版本描述: PawsomeArt生产环境v1.0
   ```
3. 获取API调用地址

## 第四步：域名和SSL配置

### 4.1 自定义域名（可选）
1. 在API网关控制台选择「域名管理」
2. 添加自定义域名：
   ```
   域名: api.pawsomeart.com
   协议: HTTPS
   证书: 上传SSL证书或使用免费证书
   ```

### 4.2 路径映射
```yaml
路径映射:
  源路径: /api/*
  目标路径: /*
  环境: prod
```

## 第五步：安全配置

### 5.1 访问控制
```yaml
# IP白名单（可选）
允许的IP段:
  - 0.0.0.0/0 (允许所有，生产环境建议限制)

# 请求频率限制
限流策略:
  每秒请求数: 100
  每分钟请求数: 1000
  每小时请求数: 10000
```

### 5.2 监控告警
```yaml
# 监控指标
关键指标:
  - 请求成功率 < 95%
  - 平均响应时间 > 5000ms
  - 错误率 > 5%
  - 函数执行失败次数 > 10/小时

# 告警通知
通知方式:
  - 邮件: dev@pawsomeart.com
  - 短信: +86-138****8888
  - 钉钉群: webhook_url
```

## 第六步：测试验证

### 6.1 函数测试

#### 6.1.1 基础测试（MOCK模式）
在函数控制台点击「测试」，使用以下测试事件：
```json
{
  "httpMethod": "POST",
  "headers": {
    "content-type": "application/json"
  },
  "body": "{\"phone\":\"13800138000\",\"customization_style\":\"经典定制款\",\"email\":\"test@example.com\",\"petCount\":1,\"size\":\"30x40cm\",\"notes\":\"测试订单\",\"MOCK\":\"true\"}",
  "isBase64Encoded": false
}
```

#### 6.1.2 完整功能测试
配置好飞书环境变量后，使用以下测试事件：
```json
{
  "httpMethod": "POST",
  "headers": {
    "content-type": "application/json"
  },
  "body": "{\"phone\":\"13800138000\",\"customization_style\":\"经典定制款\",\"email\":\"test@example.com\",\"petCount\":1,\"size\":\"30x40cm\",\"notes\":\"测试订单\"}",
  "isBase64Encoded": false
}
```

### 6.2 API网关测试

#### 6.2.1 基础JSON测试（推荐）
使用curl命令测试基础功能：
```bash
curl -X POST \
  'https://sd2nfsos05ikp3tvhepug.apigateway-cn-shanghai.volceapi.com/api/submit-order' \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "13800138000",
    "customization_style": "经典定制款",
    "email": "test@example.com",
    "petCount": 1,
    "size": "30x40cm",
    "notes": "测试订单",
    "MOCK": "true"
  }'
```

**注意**: 函数现在支持两种Content-Type格式：
- `application/json`: 适用于简单数据提交（推荐用于测试）
- `multipart/form-data`: 适用于文件上传场景

#### 6.2.2 跨域预检测试
测试OPTIONS请求：
```bash
curl -X OPTIONS \
  'https://sd2nfsos05ikp3tvhepug.apigateway-cn-shanghai.volceapi.com/api/submit-order' \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type' \
  -v
```

#### 6.2.3 文件上传测试
测试multipart/form-data格式（需要准备测试图片文件）：
```bash
curl -X POST \
  'https://sd2nfsos05ikp3tvhepug.apigateway-cn-shanghai.volceapi.com/api/submit-order' \
  -F 'phone=13800138000' \
  -F 'customization_style=经典定制款' \
  -F 'email=test@example.com' \
  -F 'petCount=1' \
  -F 'size=30x40cm' \
  -F 'notes=测试订单' \
  -F 'petPhotos=@/path/to/test-pet-photo.jpg' \
  -F 'referenceImages=@/path/to/test-reference.jpg'
```

#### 6.2.4 错误处理测试
测试缺少必填字段的情况：
```bash
curl -X POST \
  'https://sd2nfsos05ikp3tvhepug.apigateway-cn-shanghai.volceapi.com/api/submit-order' \
  -H 'Content-Type: application/json' \
  -d '{
    "customization_style": "经典定制款"
  }'
```

### 6.3 前端集成测试
1. 更新前端API配置
2. 测试完整的订单提交流程
3. 验证文件上传功能
4. 检查多维表格数据

## 第七步：生产部署

### 7.1 部署检查清单
- [ ] 函数代码已上传并测试通过
- [ ] 环境变量配置正确
- [ ] API网关配置完成
- [ ] CORS设置正确
- [ ] 域名和SSL证书配置
- [ ] 监控告警设置
- [ ] 安全策略配置
- [ ] 前端API地址更新

### 7.2 发布流程
1. 在测试环境完成所有测试
2. 备份当前配置
3. 发布到生产环境
4. 执行冒烟测试
5. 监控系统状态

## 第八步：监控和维护

### 8.1 日常监控
```yaml
监控项目:
  - 函数执行成功率
  - API响应时间
  - 错误日志分析
  - 资源使用情况
  - 费用消耗统计
```

### 8.2 日志查看
1. 函数服务日志：控制台 → 函数服务 → 日志
2. API网关日志：控制台 → API网关 → 访问日志
3. 错误追踪：查看详细错误堆栈

### 8.3 性能优化
```yaml
优化策略:
  - 根据实际负载调整内存配置
  - 优化函数冷启动时间
  - 配置预留实例（高并发场景）
  - 启用函数缓存
```

## 故障排查

### 常见问题

#### 1. 函数执行超时
```yaml
原因分析:
  - 文件上传时间过长
  - 网络连接异常
  - 飞书API响应慢

解决方案:
  - 增加超时时间配置
  - 优化文件上传逻辑
  - 添加重试机制
```

#### 2. CORS错误
```yaml
原因分析:
  - 前端域名未加入白名单
  - OPTIONS请求处理异常
  - 响应头配置错误

解决方案:
  - 检查CORS配置
  - 添加前端域名
  - 验证预检请求
```

#### 3. 文件上传失败
```yaml
原因分析:
  - 文件大小超限
  - 文件格式不支持
  - 飞书API权限问题

解决方案:
  - 检查文件大小限制
  - 验证文件格式
  - 确认飞书应用权限
```

### 调试工具
```bash
# 查看函数日志
vefaas logs --function-name submit-order-unified --start-time 2024-01-15T10:00:00Z

# 测试API接口
curl -v -X POST 'https://api-gateway-url/api/submit-order' \
  -H 'Content-Type: multipart/form-data' \
  -F 'phone=13800138000' \
  -F 'customization_style=经典定制款'

# 检查网络连通性
telnet api.feishu.cn 443
```

## 成本优化

### 计费说明
```yaml
函数服务计费:
  - 请求次数: ¥1.33/百万次
  - 执行时间: ¥0.0000167/GB·秒
  - 流量费用: ¥0.8/GB

API网关计费:
  - API调用: ¥0.06/万次
  - 流量费用: ¥0.8/GB
```

### 优化建议
1. 合理配置内存规格
2. 优化函数执行时间
3. 使用预留实例（高并发场景）
4. 定期清理无用资源

## 安全最佳实践

### 1. 访问控制
- 使用IAM角色和策略
- 最小权限原则
- 定期审计权限

### 2. 数据保护
- 敏感数据加密存储
- 传输过程使用HTTPS
- 定期备份重要数据

### 3. 监控审计
- 启用访问日志
- 配置安全告警
- 定期安全扫描

## 联系支持

如遇到技术问题，可通过以下方式获取支持：

1. **火山引擎技术支持**
   - 工单系统：控制台 → 支持中心 → 提交工单
   - 技术文档：https://www.volcengine.com/docs/6662
   - 社区论坛：https://developer.volcengine.com/

2. **项目技术支持**
   - 邮箱：dev@pawsomeart.com
   - 项目地址：https://github.com/your-org/pawsomeart-app

---

**注意事项**：
- 本指南基于火山引擎函数服务最新版本编写
- 部分配置可能因产品更新而有所变化
- 建议在测试环境充分验证后再部署到生产环境
- 定期关注火山引擎产品更新和最佳实践