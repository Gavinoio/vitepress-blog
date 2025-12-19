# 博客封面图使用指南

## 方案一：手动下载图片（推荐）

你可以从以下网站下载免费高质量图片：

### 1. **Pexels** (https://www.pexels.com/zh-cn/)
- 完全免费，无需署名
- 搜索关键词：technology, coding, workspace, abstract, nature
- 下载后重命名为 cover-1.jpg, cover-2.jpg 等，放到这个文件夹

### 2. **Pixabay** (https://pixabay.com/zh/)
- 免费图片库
- 中文界面，国内访问较快

### 3. **Unsplash** (https://unsplash.com/)
- 高质量摄影图片
- 需要科学上网访问更稳定

## 方案二：使用随机图片 API

在文章的 frontmatter 中直接使用 API 地址：

```yaml
---
title: 你的文章标题
cover: https://api.dujin.org/bing/1920.php
---
```

### 可用的随机图片 API：

1. **必应每日图片**（稳定）
   ```
   https://api.dujin.org/bing/1920.php
   ```

2. **随机风景图**
   ```
   https://api.ixiaowai.cn/gqapi/gqapi.php
   ```

3. **随机二次元图片**（如果你喜欢）
   ```
   https://api.btstu.cn/sjbz/api.php
   ```

## 方案三：本地图片（最推荐）

### 步骤：

1. 下载 10-20 张你喜欢的图片
2. 重命名为 cover-1.jpg, cover-2.jpg, cover-3.jpg ... cover-20.jpg
3. 放到 `public/covers/` 文件夹（就是这个文件夹）
4. 在文章中引用：

```yaml
---
title: 你的文章标题
cover: /covers/cover-1.jpg
---
```

### 推荐图片尺寸：
- 宽度：1920px
- 高度：1080px 或 1200px
- 格式：JPG 或 PNG
- 文件大小：建议不超过 500KB（可以使用 TinyPNG 压缩）

## 当前封面图列表

目前这个文件夹里的图片（需要你手动添加）：
- cover-1.jpg ~ cover-20.jpg （建议准备 20 张）

## 批量更新文章封面

准备好图片后，我可以帮你批量更新所有文章的封面配置。
