---
title: EyeDropper API：让浏览器也能吸取屏幕任意颜色
date: 2026-02-24 10:00:00
description: 深入讲解 EyeDropper API 的工作原理与使用方法，内含可交互 Demo，让你在阅读文章时就能直接体验从屏幕任意位置拾取颜色的能力。
keywords:
  - EyeDropper API
  - 颜色拾取
  - 浏览器 API
  - JavaScript
  - Web API
categories:
  - 前端开发
tags:
  - Web API
  - JavaScript
  - 浏览器原生 API
  - 颜色
cover: https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920
---

# EyeDropper API：让浏览器也能吸取屏幕任意颜色

设计师和开发者都熟悉"吸管工具"——在 Photoshop、Figma 或系统取色器里，点一下就能拿到任意位置的颜色值。过去这件事在浏览器里做不到，只能借助桌面软件或浏览器扩展。

**EyeDropper API** 改变了这一点。它让网页可以直接调起系统级的颜色拾取器，用户能从屏幕上的任何地方——包括浏览器以外的区域——采样颜色，并把结果返回给网页。

## 先来体验一下

下面就是一个完整的颜色拾取器，点击按钮后把鼠标移到屏幕任意位置点击即可采样。颜色值支持一键复制。

<EyeDropperDemo />

> 需要 Chrome 95+ 或 Edge 95+ 才能使用，Safari 和 Firefox 暂不支持。

---

## API 基础用法

EyeDropper API 的接口非常简洁，核心只有一个类和一个方法：

```javascript
const eyeDropper = new EyeDropper()

try {
  const result = await eyeDropper.open()
  console.log(result.sRGBHex) // 例如 "#1a2b3c"
} catch (err) {
  // 用户按下 Esc 取消时会抛出 AbortError
  console.log('用户取消了拾取')
}
```

`eyeDropper.open()` 返回一个 Promise，resolve 时给出一个对象，其中 `sRGBHex` 是采样到的颜色，格式为小写 hex 字符串（如 `#ff6600`）。

### 检测浏览器支持

```javascript
if ('EyeDropper' in window) {
  // 支持
} else {
  // 不支持，给出降级提示
}
```

---

## 颜色格式转换

API 只返回 HEX 格式，实际开发中往往还需要 RGB 或 HSL，手动转换并不复杂：

```javascript
// HEX → RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

// HEX → HSL
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}
```

---

## 结合 `<input type="color">` 使用

EyeDropper 和原生颜色输入框可以很好地配合，前者负责从屏幕采样，后者负责精细调整：

```html
<input type="color" id="colorInput" value="#ff6600" />
<button id="pickBtn">从屏幕拾取</button>

<script>
  const input = document.getElementById('colorInput')
  const btn = document.getElementById('pickBtn')

  btn.addEventListener('click', async () => {
    if (!('EyeDropper' in window)) return alert('浏览器不支持')
    try {
      const result = await new EyeDropper().open()
      input.value = result.sRGBHex
      input.dispatchEvent(new Event('input')) // 触发后续逻辑
    } catch {}
  })
</script>
```

---

## 实际应用场景

**1. 在线设计工具**

Figma、Canva 等工具的 Web 版可以用它实现吸管功能，让用户从参考图或其他标签页中采样品牌色。

**2. 主题定制器**

让用户从自己的截图或网站中拾取颜色，直接应用到主题配置，无需手动输入色值。

**3. 无障碍对比度检查**

拾取页面上两个元素的颜色后，自动计算对比度，判断是否符合 WCAG 标准。

```javascript
// 简单的对比度计算
function getLuminance(hex) {
  const rgb = [hex.slice(1,3), hex.slice(3,5), hex.slice(5,7)]
    .map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2)
}

// 使用示例
const ratio = getContrastRatio('#ffffff', '#6062ce')
console.log(`对比度：${ratio}:1`) // WCAG AA 要求 ≥ 4.5:1
```

---

## 注意事项

**用户手势触发**：`eyeDropper.open()` 必须在用户交互事件（如 click）中调用，不能在页面加载时自动触发，这是浏览器的安全限制。

**跨屏幕采样**：用户可以把鼠标移到浏览器窗口外，采样桌面上任何位置的颜色，包括其他应用程序的界面。

**用户取消**：按下 `Esc` 键会取消拾取，Promise 会以 `AbortError` reject，记得用 `try/catch` 处理。

**HTTPS 环境**：和大多数现代 Web API 一样，EyeDropper 需要在安全上下文（HTTPS 或 localhost）下才能使用。

---

## 浏览器兼容性

| 浏览器 | 支持版本 |
|--------|---------|
| Chrome | 95+ ✅ |
| Edge | 95+ ✅ |
| Opera | 81+ ✅ |
| Firefox | ❌ 暂不支持 |
| Safari | ❌ 暂不支持 |

对于不支持的浏览器，可以引导用户使用系统自带的取色工具（macOS 的"数码测色计"、Windows 的 PowerToys 颜色选取器）作为替代方案。

---

EyeDropper API 虽然功能单一，但它填补了 Web 平台长期以来的一个空白。对于任何涉及颜色选择的工具类应用，它都是值得优先考虑的原生方案——零依赖、体验好、和系统深度集成。
