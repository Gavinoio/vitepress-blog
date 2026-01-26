---
title: Vue 3 Composition API 深度解析
date: 2025-04-10 15:20:00
description: 深入讲解 Vue 3 Composition API 的核心概念和最佳实践，包括 setup 函数、响应式 API、生命周期钩子、组合式函数的设计模式等，帮助你写出更灵活、更易维护的 Vue 代码。
keywords:
  - Vue 3
  - Composition API
  - setup
  - 组合式函数
  - Vue 响应式
categories:
  - 前端开发
tags:
  - Vue3
  - JavaScript
  - 前端框架
cover: https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1920
---

# Vue 3 Composition API 深度解析

Vue 3 带来了全新的 Composition API，它为我们提供了更灵活的代码组织方式。本文将深入探讨 Composition API 的核心概念和最佳实践。

## 为什么需要 Composition API？

在 Vue 2 的 Options API 中，我们按照选项（data、methods、computed 等）来组织代码。当组件变得复杂时，相关的逻辑会分散在不同的选项中，导致代码难以维护。

Composition API 允许我们按照**逻辑关注点**来组织代码，使得相关的代码可以放在一起。

## 核心概念

### 1. setup 函数

`setup` 是 Composition API 的入口点，在组件创建之前执行。

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    // 响应式状态
    const count = ref(0)

    // 计算属性
    const doubleCount = computed(() => count.value * 2)

    // 方法
    function increment() {
      count.value++
    }

    // 暴露给模板
    return {
      count,
      doubleCount,
      increment
    }
  }
}
```

### 2. ref 和 reactive

**ref**：用于创建基本类型的响应式数据

```javascript
const count = ref(0)
console.log(count.value) // 0
count.value++
```

**reactive**：用于创建对象的响应式数据

```javascript
const state = reactive({
  count: 0,
  name: 'Gavin'
})
console.log(state.count) // 0
state.count++
```

### 3. 生命周期钩子

Composition API 中的生命周期钩子需要导入使用：

```javascript
import { onMounted, onUpdated, onUnmounted } from 'vue'

setup() {
  onMounted(() => {
    console.log('组件已挂载')
  })

  onUpdated(() => {
    console.log('组件已更新')
  })

  onUnmounted(() => {
    console.log('组件即将卸载')
  })
}
```

## 组合函数（Composables）

Composition API 的一大优势是可以轻松提取和复用逻辑。

### 示例：鼠标追踪

```javascript
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
```

使用：

```javascript
import { useMouse } from './composables/useMouse'

export default {
  setup() {
    const { x, y } = useMouse()
    return { x, y }
  }
}
```

## 最佳实践

1. **使用 `<script setup>` 语法糖**：更简洁的语法
   ```vue
   <script setup>
   import { ref } from 'vue'

   const count = ref(0)
   function increment() {
     count.value++
   }
   </script>
   ```

2. **合理拆分组合函数**：每个组合函数专注于一个功能

3. **避免过度使用 reactive**：对于简单的值，`ref` 更直观

4. **使用 TypeScript**：获得更好的类型推导和开发体验

## 总结

Composition API 为 Vue 应用带来了更好的代码组织方式和逻辑复用能力。虽然学习曲线稍陡，但掌握后会大大提升开发效率。

Happy Coding! 🚀
