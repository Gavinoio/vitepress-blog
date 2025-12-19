---
title: CSS Grid 与 Flexbox 布局完全指南
date: 2024-12-14
categories:
  - 前端开发
tags:
  - CSS
  - 布局
  - Grid
  - Flexbox
cover: https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1920
---

# CSS Grid 与 Flexbox 布局完全指南

CSS Grid 和 Flexbox 是现代 CSS 布局的两大利器。本文将深入探讨它们的特性、使用场景和最佳实践。

## Flexbox：一维布局的王者

Flexbox 用于一维布局（行或列），非常适合组件内部的布局。

### 基础概念

```css
.container {
  display: flex;
  /* 主轴方向 */
  flex-direction: row; /* row | row-reverse | column | column-reverse */
  /* 换行 */
  flex-wrap: nowrap; /* nowrap | wrap | wrap-reverse */
  /* 主轴对齐 */
  justify-content: flex-start; /* flex-start | flex-end | center | space-between | space-around | space-evenly */
  /* 交叉轴对齐 */
  align-items: stretch; /* stretch | flex-start | flex-end | center | baseline */
  /* 多行对齐 */
  align-content: flex-start;
  /* 间距 */
  gap: 16px;
}
```

### 子项属性

```css
.item {
  /* 放大比例 */
  flex-grow: 0;
  /* 缩小比例 */
  flex-shrink: 1;
  /* 基础大小 */
  flex-basis: auto;
  /* 简写 */
  flex: 0 1 auto; /* flex-grow flex-shrink flex-basis */
  /* 单独对齐 */
  align-self: auto;
  /* 顺序 */
  order: 0;
}
```

### 实用案例

**1. 水平垂直居中**

```css
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

```html
<div class="center-container">
  <div class="content">完美居中</div>
</div>
```

**2. 自适应导航栏**

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #333;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-link {
  color: white;
  text-decoration: none;
}
```

```html
<nav class="navbar">
  <div class="logo">LOGO</div>
  <ul class="nav-links">
    <li><a href="#" class="nav-link">首页</a></li>
    <li><a href="#" class="nav-link">关于</a></li>
    <li><a href="#" class="nav-link">联系</a></li>
  </ul>
  <button class="nav-btn">登录</button>
</nav>
```

**3. 卡片布局**

```css
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  flex: 1 1 300px; /* 最小宽度 300px，自动填充 */
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

**4. 圣杯布局**

```css
.holy-grail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header,
.footer {
  flex-shrink: 0;
  background: #333;
  color: white;
  padding: 1rem;
}

.main {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 2rem;
}

.sidebar {
  flex: 0 0 250px;
  background: #f5f5f5;
  padding: 1rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .main {
    flex-direction: column;
  }

  .sidebar {
    flex: 0 0 auto;
  }
}
```

## CSS Grid：二维布局的利器

Grid 用于二维布局（行和列），适合页面级的整体布局。

### 基础概念

```css
.container {
  display: grid;
  /* 定义列 */
  grid-template-columns: 200px 1fr 200px; /* 固定 弹性 固定 */
  /* 定义行 */
  grid-template-rows: auto 1fr auto;
  /* 间距 */
  gap: 20px; /* row-gap column-gap 的简写 */
  /* 对齐 */
  justify-items: start; /* start | end | center | stretch */
  align-items: start;
  justify-content: start;
  align-content: start;
}
```

### 网格项属性

```css
.item {
  /* 占据的列 */
  grid-column: 1 / 3; /* 从第 1 列到第 3 列 */
  grid-column: span 2; /* 跨越 2 列 */
  /* 占据的行 */
  grid-row: 1 / 3;
  grid-row: span 2;
  /* 简写 */
  grid-area: 1 / 1 / 3 / 3; /* row-start / col-start / row-end / col-end */
  /* 单独对齐 */
  justify-self: center;
  align-self: center;
}
```

### 实用案例

**1. 响应式网格布局**

```css
.grid-container {
  display: grid;
  /* auto-fill: 自动填充，auto-fit: 自动适应 */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.grid-item {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

**2. 完整页面布局**

```css
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.header {
  grid-area: header;
  background: #333;
  color: white;
  padding: 1rem;
}

.sidebar {
  grid-area: sidebar;
  background: #f5f5f5;
  padding: 1rem;
}

.main {
  grid-area: main;
  padding: 2rem;
}

.aside {
  grid-area: aside;
  background: #f5f5f5;
  padding: 1rem;
}

.footer {
  grid-area: footer;
  background: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

/* 响应式 */
@media (max-width: 1024px) {
  .page-layout {
    grid-template-areas:
      "header header"
      "main aside"
      "sidebar sidebar"
      "footer footer";
    grid-template-columns: 1fr 200px;
  }
}

@media (max-width: 768px) {
  .page-layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

**3. 瀑布流布局**

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 20px;
  gap: 1rem;
}

.masonry-item {
  /* JavaScript 动态设置 grid-row-end */
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

```javascript
// 计算每个项目应该占据的行数
function resizeMasonryItem(item) {
  const grid = document.querySelector('.masonry')
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('row-gap'))
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'))
  const itemHeight = item.querySelector('.content').offsetHeight
  const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))
  item.style.gridRowEnd = `span ${rowSpan}`
}

// 应用到所有项目
function resizeAllMasonryItems() {
  const items = document.querySelectorAll('.masonry-item')
  items.forEach(resizeMasonryItem)
}

// 初始化和窗口大小改变时调用
window.addEventListener('load', resizeAllMasonryItems)
window.addEventListener('resize', resizeAllMasonryItems)
```

**4. 图片画廊**

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 100px;
  gap: 0.5rem;
}

.gallery-item {
  overflow: hidden;
  border-radius: 4px;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* 不同大小的图片 */
.gallery-item:nth-child(1) {
  grid-column: span 6;
  grid-row: span 3;
}

.gallery-item:nth-child(2) {
  grid-column: span 3;
  grid-row: span 2;
}

.gallery-item:nth-child(3) {
  grid-column: span 3;
  grid-row: span 2;
}

.gallery-item:nth-child(4) {
  grid-column: span 4;
  grid-row: span 2;
}
```

## Grid vs Flexbox：如何选择？

### 使用 Flexbox 的场景

1. **一维布局**：导航栏、工具栏
2. **内容驱动**：不知道具体有多少项
3. **小规模布局**：组件内部布局
4. **弹性空间分配**：需要自动填充空间

```css
/* 适合 Flexbox */
.toolbar {
  display: flex;
  justify-content: space-between;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

### 使用 Grid 的场景

1. **二维布局**：行和列同时控制
2. **布局驱动**：预先定义好结构
3. **大规模布局**：整体页面布局
4. **精确控制**：需要对齐和定位

```css
/* 适合 Grid */
.dashboard {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

### 组合使用

很多时候，Grid 和 Flexbox 应该组合使用：

```css
/* Grid 控制整体布局 */
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

/* Flexbox 控制内容布局 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

## 现代 CSS 技巧

### 1. CSS 变量配合 Grid

```css
:root {
  --grid-gap: 1rem;
  --grid-columns: 3;
  --grid-min-width: 250px;
}

.adaptive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width), 1fr));
  gap: var(--grid-gap);
}

/* 响应式调整 */
@media (max-width: 768px) {
  :root {
    --grid-gap: 0.5rem;
    --grid-min-width: 150px;
  }
}
```

### 2. Grid 模板简写

```css
.layout {
  display: grid;
  /* grid-template-rows / grid-template-columns */
  grid-template:
    "header header" auto
    "sidebar main" 1fr
    "footer footer" auto
    / 200px 1fr;
  gap: 1rem;
}
```

### 3. 子网格 (Subgrid)

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.grid-item {
  display: grid;
  grid-template-columns: subgrid; /* 继承父网格 */
  grid-column: span 3;
}
```

### 4. place-items 简写

```css
.center {
  display: grid;
  /* align-items 和 justify-items 的简写 */
  place-items: center;
}

.item {
  /* align-self 和 justify-self 的简写 */
  place-self: center;
}
```

## 实战：响应式仪表板

```html
<div class="dashboard">
  <header class="header">Header</header>
  <nav class="sidebar">Sidebar</nav>
  <main class="main">Main Content</main>
  <aside class="widgets">Widgets</aside>
  <footer class="footer">Footer</footer>
</div>
```

```css
.dashboard {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main widgets"
    "footer footer footer";
  grid-template-columns: 200px 1fr 300px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
  padding: 1rem;
}

.header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar {
  grid-area: sidebar;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.main {
  grid-area: main;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  align-content: start;
}

.widgets {
  grid-area: widgets;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer {
  grid-area: footer;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  text-align: center;
}

/* 平板 */
@media (max-width: 1024px) {
  .dashboard {
    grid-template-areas:
      "header header"
      "sidebar main"
      "widgets widgets"
      "footer footer";
    grid-template-columns: 200px 1fr;
  }
}

/* 手机 */
@media (max-width: 768px) {
  .dashboard {
    grid-template-areas:
      "header"
      "main"
      "widgets"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }

  .main {
    grid-template-columns: 1fr;
  }
}
```

## 总结

**Flexbox 特点：**
- 一维布局
- 内容优先
- 简单灵活
- 适合组件级

**Grid 特点：**
- 二维布局
- 布局优先
- 强大精确
- 适合页面级

**最佳实践：**
1. Grid 用于整体布局，Flexbox 用于组件内容
2. 使用 `auto-fill` 和 `minmax()` 实现响应式
3. 利用 `gap` 属性简化间距管理
4. 结合媒体查询实现复杂响应式布局
5. 使用 CSS 变量提高可维护性

现代 CSS 布局已经非常强大，善用 Grid 和 Flexbox 能够大大简化开发工作。

参考资源：
- [CSS Grid 完整指南](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox 完整指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
