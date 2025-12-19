---
title: CSS 动画完全指南：从入门到精通
date: 2024-12-13
categories:
  - 前端开发
tags:
  - CSS
  - 动画
  - Web Design
---

# CSS 动画完全指南：从入门到精通

CSS 动画能够让网页更加生动有趣。本文将深入讲解 CSS 动画的各种技巧和最佳实践。

## 1. Transition vs Animation

### Transition（过渡）

适合简单的状态变化，需要触发器（如 hover、focus 等）。

```css
/* 基础过渡 */
.button {
  background-color: #3498db;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #2980b9;
}

/* 多属性过渡 */
.card {
  transform: scale(1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* 使用 all 简写（谨慎使用，可能影响性能） */
.element {
  transition: all 0.3s ease;
}
```

### Animation（动画）

适合复杂的、自动播放的动画。

```css
/* 定义关键帧 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 应用动画 */
.slide-in-element {
  animation: slideIn 0.5s ease-out;
}

/* 完整的动画属性 */
.animated-box {
  animation-name: slideIn;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-delay: 0.2s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-fill-mode: forwards;
  animation-play-state: running;
}

/* 简写形式 */
.animated-box {
  animation: slideIn 1s ease-in-out 0.2s infinite alternate forwards;
}
```

## 2. 常用的缓动函数（Timing Functions）

```css
/* 线性 */
.linear {
  animation-timing-function: linear;
}

/* 内置缓动 */
.ease {
  animation-timing-function: ease; /* 默认 */
}

.ease-in {
  animation-timing-function: ease-in; /* 慢速开始 */
}

.ease-out {
  animation-timing-function: ease-out; /* 慢速结束 */
}

.ease-in-out {
  animation-timing-function: ease-in-out; /* 慢速开始和结束 */
}

/* 自定义贝塞尔曲线 */
.custom-easing {
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 步进函数 */
.steps {
  animation-timing-function: steps(4, end);
}
```

## 3. 实用动画示例

### 淡入淡出

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

.fade-out {
  animation: fadeOut 0.5s ease-out;
}
```

### 弹跳效果

```css
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

.bounce {
  animation: bounce 2s infinite;
}
```

### 脉冲效果

```css
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### 旋转加载动画

```css
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}
```

### 骨架屏加载效果

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### 打字机效果

```css
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter {
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid;
  animation: typing 3.5s steps(40) 1s forwards,
             blink 0.75s step-end infinite;
}
```

## 4. 3D 变换动画

```css
/* 3D 卡片翻转 */
.card-container {
  perspective: 1000px;
}

.card {
  width: 300px;
  height: 400px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card:hover {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

/* 3D 立方体旋转 */
@keyframes rotate3d {
  from {
    transform: rotateX(0) rotateY(0);
  }
  to {
    transform: rotateX(360deg) rotateY(360deg);
  }
}

.cube {
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
  animation: rotate3d 10s linear infinite;
}
```

## 5. 性能优化技巧

### 使用 transform 和 opacity

```css
/* ❌ 性能差 - 触发重排 */
.bad-animation {
  animation: moveLeft 1s;
}

@keyframes moveLeft {
  from {
    left: 0;
  }
  to {
    left: 100px;
  }
}

/* ✅ 性能好 - 只触发合成 */
.good-animation {
  animation: moveLeftGood 1s;
}

@keyframes moveLeftGood {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100px);
  }
}
```

### 使用 will-change

```css
.animated-element {
  /* 提示浏览器该元素将要发生变化 */
  will-change: transform, opacity;
}

/* 动画结束后移除 */
.animated-element.animation-done {
  will-change: auto;
}
```

### 硬件加速

```css
.hardware-accelerated {
  /* 强制使用硬件加速 */
  transform: translateZ(0);
  /* 或 */
  transform: translate3d(0, 0, 0);
}
```

## 6. 响应式动画

```css
/* 根据屏幕尺寸调整动画 */
@media (max-width: 768px) {
  .animated-element {
    animation-duration: 0.3s; /* 移动端使用更快的动画 */
  }
}

/* 尊重用户的动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 7. 高级技巧

### 交错动画

```css
.staggered-item {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.staggered-item:nth-child(1) { animation-delay: 0.1s; }
.staggered-item:nth-child(2) { animation-delay: 0.2s; }
.staggered-item:nth-child(3) { animation-delay: 0.3s; }
.staggered-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### SVG 路径动画

```css
.svg-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s ease-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

### 渐变动画

```css
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-gradient {
  background: linear-gradient(270deg, #ff6b6b, #4ecdc4, #45b7d1);
  background-size: 600% 600%;
  animation: gradient-shift 10s ease infinite;
}
```

## 8. 调试动画

```css
/* 放慢所有动画便于调试 */
* {
  animation-duration: 10s !important;
  transition-duration: 10s !important;
}

/* 暂停动画 */
.paused {
  animation-play-state: paused !important;
}
```

## 9. 实用的动画库推荐

虽然本文重点是原生 CSS，但有时使用动画库可以提高效率：

- **Animate.css**：现成的 CSS 动画集合
- **Hover.css**：专注于悬停效果的动画
- **AOS (Animate On Scroll)**：滚动触发动画
- **Magic Animations**：独特的 CSS3 动画

## 总结

CSS 动画的关键点：

1. **选择合适的方式**：Transition 用于简单状态变化，Animation 用于复杂动画
2. **性能优先**：使用 `transform` 和 `opacity`，避免触发重排
3. **用户体验**：尊重 `prefers-reduced-motion`，避免过度动画
4. **硬件加速**：合理使用 `will-change` 和 `transform: translateZ(0)`
5. **响应式设计**：在移动设备上使用更短的动画时长
6. **调试友好**：使用 DevTools 的动画面板调试

记住：**动画应该增强用户体验，而不是分散注意力**。保持简洁、流畅、有目的性。
