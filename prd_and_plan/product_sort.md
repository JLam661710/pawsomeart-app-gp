# PawsomeArt 产品分类体系

## 技术架构集成说明 (V2.0 更新)

本产品分类体系已完全适配新的技术架构：
- **分类数据管理**: 存储在Feishu Bitable，支持动态分类管理
- **前端展示**: 通过GitHub Pages部署，确保分类信息快速加载
- **API集成**: 统一的产品分类API，支持多维度筛选
- **搜索优化**: 支持按分类、风格、价格等多维度搜索

## 产品分类概述

PawsomeArt 的宠物画像定制服务可以归纳为两大创作系列，其中包含四种具体的画像款式。

大类一：全新艺术创作系列
这个系列的核心是从零开始，画像师根据您提供的宠物照片（展现体貌特征），为您创作一幅全新的艺术作品。

小类 1: 经典定制款 (Classic Custom Portrait)
  特点: 画像师会创作一幅经典的正面端坐姿势的宠物画像。您可以为这幅画像自由搭配一个全新的背景，无论是通过文字描述、自己上传图片，还是从我们的推荐中选择。

小类 2: 名画致敬款 (Masterpiece Homage Portrait)
  特点: 这是一种极具创意的风格，我们会将您的爱宠形象与一幅您指定的或由我们推荐的世界艺术名画进行巧妙融合，实现一场跨时空的艺术对话。
  
大类二：参考照片再创作系列
这个系列是基于您提供的一张心仪照片进行艺术化再创作，重点在于保留照片中您最喜爱的某个核心元素。

小类 1: 场景复刻款 (Full Recreation Style)
  特点: 画像师会完全参考您所提供照片的构图，对其中的宠物姿势、位置以及背景场景进行整体的艺术化重绘。
  
小类 2: 姿态保留款 (Pose-Only Recreation Style)
  特点: 我们只保留并参考您照片中宠物的姿势和位置，然后将其置入一个由您指定的全新背景之中，创造出一种"旧姿态，新故事"的有趣效果。

## API接口规范 (V2.0 新增)

### 产品分类查询API
```
GET /api/products/categories
Response:
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "art_creation",
        "name": "全新艺术创作系列",
        "description": "从零开始创作全新艺术作品",
        "subcategories": [
          {
            "id": "classic",
            "name": "经典定制款",
            "description": "经典正面端坐姿势画像",
            "features": ["自由背景搭配", "经典构图", "高品质创作"]
          },
          {
            "id": "masterpiece",
            "name": "名画致敬款",
            "description": "与世界名画的创意融合",
            "features": ["名画融合", "创意构图", "艺术对话"]
          }
        ]
      },
      {
        "id": "photo_recreation",
        "name": "参考照片再创作系列",
        "description": "基于现有照片的艺术化再创作",
        "subcategories": [
          {
            "id": "scene_recreation",
            "name": "场景复刻款",
            "description": "完整场景的艺术化重绘",
            "features": ["完整构图保留", "场景重现", "艺术化处理"]
          },
          {
            "id": "pose_recreation",
            "name": "姿态保留款",
            "description": "保留姿态，更换背景",
            "features": ["姿态保留", "背景自定义", "创意组合"]
          }
        ]
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "apiVersion": "v2.0"
}
```

### 产品筛选API
```
GET /api/products/filter
Parameters:
- category: 主分类ID (art_creation, photo_recreation)
- subcategory: 子分类ID (classic, masterpiece, scene_recreation, pose_recreation)
- priceRange: 价格区间 (low, medium, high)
- petCount: 宠物数量 (1, 2, 3+)
- size: 尺寸规格 (8inch, A4, large)

Response:
{
  "success": true,
  "data": {
    "products": [...],
    "totalCount": 12,
    "filters": {
      "appliedFilters": {...},
      "availableFilters": {...}
    }
  }
}
```

## 技术实现细节

### 分类数据管理
1. **数据结构**: 层级化分类存储在Feishu Bitable
2. **动态更新**: 支持分类信息的实时更新和发布
3. **多语言支持**: 预留国际化扩展接口
4. **SEO优化**: 分类页面的搜索引擎优化

### 前端展示优化
1. **分类导航**: 清晰的分类导航和面包屑
2. **筛选功能**: 多维度产品筛选和排序
3. **响应式设计**: 适配各种设备的分类展示
4. **加载优化**: 分类数据的懒加载和缓存策略

### 搜索与推荐
1. **智能搜索**: 基于分类的智能搜索建议
2. **相关推荐**: 同类产品的智能推荐
3. **用户行为**: 基于用户浏览的个性化推荐
4. **热门分类**: 实时统计和展示热门分类