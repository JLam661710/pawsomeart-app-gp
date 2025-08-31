# PawsomeArt 图片推荐交互模块

## 技术架构集成说明 (V2.0 更新)

本图片推荐模块已完全适配新的技术架构：
- **图片存储**: 静态图片资源部署在GitHub Pages，利用CDN加速
- **推荐算法**: 部署在火山引擎函数服务，支持智能推荐
- **数据管理**: 图片元数据存储在Feishu Bitable，支持动态管理
- **API集成**: 统一的图片推荐API，支持多维度筛选和个性化推荐

## 选择交互类组件 (Selection Components)
这类组件的核心目标是提供选项，让用户在官方推荐的图库中轻松浏览并做出选择。
组件: 推荐图库
- 适用场景:
  - 为"经典定制款"选择推荐背景（图像来源文件夹：public/pictures/ArtworkToBeBackgroundRecommended）
  - 为"名画致敬款"选择推荐名画（图像来源文件夹：public/pictures/FamousArtPortraitsRecommended）
  - 为"姿态保留款"选择推荐艺术场景（图像来源文件夹：public/pictures/ArtworkToBeBackgroundRecommended）
- 设计目标: 提供一个便捷、无压力的选择方式，帮助没有明确想法的用户完成决策。
- 布局要求:
  - 一个可水平滚动的容器，横向排列若干张推荐图片。
  - 图片下方可附简短标题或编号。
- 交互方式:
  1. 浏览: 用户可通过左右滑动查看所有推荐图片。
  2. 选择: 每张图片均可点击。点击后，该图片应有明确的视觉反馈（如边框高亮、出现打勾图标等），表示已选中。
  3. 确认: 系统应有机制向用户二次确认所选中的图片（例如，在页面下方显示选中图片的缩略图，并配有"确认选择"按钮），然后结束当前选择环节。

## API接口规范 (V2.0 新增)

### 图片推荐API
```
GET /api/pictures/recommendations
Parameters:
- category: 图片分类 (background, famous_art, art_scene)
- style: 画像风格 (classic, masterpiece, scene_recreation, pose_recreation)
- tags: 标签筛选 (nature, indoor, abstract, etc.)
- limit: 返回数量限制 (默认20)
- offset: 分页偏移量

Response:
{
  "success": true,
  "data": {
    "pictures": [
      {
        "id": "bg_001",
        "title": "自然风光背景",
        "description": "清新自然的户外场景",
        "url": "https://username.github.io/repo/pictures/bg_001.jpg",
        "thumbnailUrl": "https://username.github.io/repo/pictures/thumbs/bg_001_thumb.jpg",
        "category": "background",
        "tags": ["nature", "outdoor", "green"],
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "fileSize": "245KB",
        "popularity": 85
      }
    ],
    "totalCount": 156,
    "hasMore": true
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "apiVersion": "v2.0"
}
```

### 智能推荐API
```
POST /api/pictures/smart-recommendations
Body:
{
  "userPreferences": {
    "style": "classic",
    "petType": "dog",
    "colorPreference": ["warm", "natural"],
    "sceneType": "outdoor"
  },
  "previousSelections": ["bg_001", "bg_005"],
  "limit": 10
}

Response:
{
  "success": true,
  "data": {
    "recommendations": [...],
    "recommendationReason": "基于您的偏好和历史选择",
    "confidence": 0.85
  }
}
```

### 图片详情API
```
GET /api/pictures/{pictureId}
Response:
{
  "success": true,
  "data": {
    "picture": {
      "id": "bg_001",
      "title": "自然风光背景",
      "description": "清新自然的户外场景，适合活泼的宠物画像",
      "url": "https://username.github.io/repo/pictures/bg_001.jpg",
      "thumbnailUrl": "https://username.github.io/repo/pictures/thumbs/bg_001_thumb.jpg",
      "category": "background",
      "tags": ["nature", "outdoor", "green"],
      "metadata": {
        "artist": "PawsomeArt Team",
        "createdAt": "2024-01-01",
        "license": "Commercial Use"
      },
      "relatedPictures": ["bg_002", "bg_003"],
      "usageStats": {
        "totalUsed": 245,
        "rating": 4.8
      }
    }
  }
}
```

## 技术实现细节

### 图片资源管理
1. **静态资源优化**: 
   - 原图存储在 `/public/pictures/` 目录
   - 缩略图存储在 `/public/pictures/thumbs/` 目录
   - 支持WebP格式，自动降级到JPEG
   - 响应式图片加载，根据设备选择合适尺寸

2. **CDN加速**: 
   - 利用GitHub Pages全球CDN网络
   - 设置合理的缓存策略
   - 支持图片懒加载和预加载

### 推荐算法
1. **基础推荐**: 基于分类、标签的简单筛选
2. **智能推荐**: 基于用户行为和偏好的个性化推荐
3. **协同过滤**: 基于相似用户选择的推荐
4. **内容推荐**: 基于图片特征的相似度推荐

### 前端交互优化
1. **图片预览**: 
   - 支持图片放大预览
   - 平滑的缩放和切换动画
   - 键盘导航支持

2. **选择状态管理**: 
   - 清晰的选中状态视觉反馈
   - 支持多选和单选模式
   - 选择历史记录和撤销功能

3. **性能优化**: 
   - 虚拟滚动支持大量图片
   - 图片懒加载和预加载策略
   - 本地缓存减少重复请求

### 数据分析
1. **用户行为追踪**: 记录用户的浏览和选择行为
2. **热门图片统计**: 实时统计图片的使用频率
3. **推荐效果评估**: 评估推荐算法的准确性
4. **A/B测试支持**: 支持不同推荐策略的对比测试