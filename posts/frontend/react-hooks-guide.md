---
title: React Hooks 完全指南
date: 2025-07-10 11:15:00
description: 全面深入讲解 React Hooks 的使用方法和最佳实践，包括 useState、useEffect、useContext、useReducer、useMemo、useCallback 等常用 Hooks，以及自定义 Hooks 的开发技巧和性能优化建议。
keywords:
  - React Hooks
  - useState
  - useEffect
  - React 18
  - 函数组件
categories:
  - 前端开发
tags:
  - React
  - JavaScript
  - Hooks
cover: https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1920
---

# React Hooks 完全指南

> 📖 阅读时间：25分钟 | 难度：⭐⭐⭐ 中级 | 更新日期：2025-01-26

React Hooks 改变了我们编写 React 组件的方式。本文将全面介绍常用的 Hooks 及其使用场景。

## 什么是 Hooks？

Hooks 是 React 16.8 引入的新特性，它让你在不编写 class 的情况下使用 state 和其他 React 特性。

## 基础 Hooks

### useState

用于在函数组件中添加状态。

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}
```

**更新状态的两种方式：**

```jsx
// 直接设置新值
setCount(5)

// 使用函数式更新（基于前一个状态）
setCount(prevCount => prevCount + 1)
```

### useEffect

用于处理副作用，如数据获取、订阅、DOM 操作等。

```jsx
import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 获取用户数据
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))

    // 清理函数
    return () => {
      // 取消请求或清理订阅
    }
  }, [userId]) // 依赖数组

  return user ? <div>{user.name}</div> : <div>Loading...</div>
}
```

**依赖数组的三种情况：**

```jsx
useEffect(() => {
  // 每次渲染后都执行
})

useEffect(() => {
  // 只在组件挂载时执行一次
}, [])

useEffect(() => {
  // 在 count 变化时执行
}, [count])
```

### useContext

用于在组件树中共享数据，避免 props 层层传递。

```jsx
import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  )
}

function Toolbar() {
  return <ThemedButton />
}

function ThemedButton() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Button</button>
}
```

## 高级 Hooks

### useReducer

用于管理复杂的状态逻辑。

```jsx
import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })

  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  )
}
```

### useMemo 和 useCallback

用于性能优化。

**useMemo**：缓存计算结果

```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])
```

**useCallback**：缓存函数引用

```jsx
const handleClick = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

### useRef

用于访问 DOM 元素或保存可变值。

```jsx
function TextInput() {
  const inputRef = useRef(null)

  const focusInput = () => {
    inputRef.current.focus()
  }

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>聚焦输入框</button>
    </>
  )
}
```

## 自定义 Hooks

自定义 Hook 让你可以复用状态逻辑。

### 示例：表单输入处理

```jsx
function useInput(initialValue) {
  const [value, setValue] = useState(initialValue)

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const reset = () => {
    setValue(initialValue)
  }

  return {
    value,
    onChange: handleChange,
    reset
  }
}

// 使用
function LoginForm() {
  const username = useInput('')
  const password = useInput('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(username.value, password.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" {...username} />
      <input type="password" {...password} />
      <button type="submit">登录</button>
    </form>
  )
}
```

## Hooks 规则

1. **只在顶层调用 Hooks**：不要在循环、条件或嵌套函数中调用
2. **只在 React 函数中调用 Hooks**：函数组件或自定义 Hook

## 常见陷阱

### 1. 闭包陷阱

```jsx
// ❌ 错误
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1) // count 始终是 0
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ✅ 正确
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1) // 使用函数式更新
    }, 1000)
    return () => clearInterval(timer)
  }, [])
}
```

### 2. 不必要的依赖

使用 `useCallback` 和 `useMemo` 稳定引用。

## React 18+ 新增 Hooks

### useId

生成唯一的 ID，用于可访问性属性。

```jsx
import { useId } from 'react'

function PasswordField() {
  const passwordHintId = useId()

  return (
    <>
      <label>
        密码:
        <input
          type="password"
          aria-describedby={passwordHintId}
        />
      </label>
      <p id={passwordHintId}>
        密码应包含至少 8 个字符
      </p>
    </>
  )
}
```

### useTransition

标记状态更新为非紧急，避免阻塞用户交互。

```jsx
import { useState, useTransition } from 'react'

function SearchResults() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value) // 紧急更新

    startTransition(() => {
      // 非紧急更新，不会阻塞输入
      setResults(filterResults(value))
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <div>搜索中...</div>}
      <ResultsList results={results} />
    </>
  )
}
```

### useDeferredValue

延迟更新某个值，类似于防抖。

```jsx
import { useState, useDeferredValue } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  // deferredQuery 会延迟更新，不会阻塞输入
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults query={deferredQuery} />
    </>
  )
}
```

### useSyncExternalStore

订阅外部数据源（如浏览器 API、第三方状态管理库）。

```jsx
import { useSyncExternalStore } from 'react'

function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    // subscribe: 订阅函数
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)
      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    // getSnapshot: 获取当前值
    () => navigator.onLine,
    // getServerSnapshot: 服务端渲染时的值
    () => true
  )

  return isOnline
}

function StatusBar() {
  const isOnline = useOnlineStatus()
  return <div>{isOnline ? '在线' : '离线'}</div>
}
```

### useInsertionEffect

在 DOM 变更之前同步触发，用于 CSS-in-JS 库。

```jsx
import { useInsertionEffect } from 'react'

function useCSS(rule) {
  useInsertionEffect(() => {
    // 在 DOM 变更前插入样式
    const style = document.createElement('style')
    style.textContent = rule
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  })
}
```

## React 19 新特性预览

### use Hook (实验性)

读取 Promise 或 Context 的值。

```jsx
import { use } from 'react'

function Comments({ commentsPromise }) {
  // 直接读取 Promise 的值
  const comments = use(commentsPromise)

  return comments.map(comment => (
    <div key={comment.id}>{comment.text}</div>
  ))
}
```

### useOptimistic (实验性)

乐观更新 UI，提升用户体验。

```jsx
import { useOptimistic } from 'react'

function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { text: newMessage, sending: true }]
  )

  const formAction = async (formData) => {
    const message = formData.get('message')
    addOptimisticMessage(message) // 立即显示
    await sendMessage(message) // 实际发送
  }

  return (
    <>
      {optimisticMessages.map((msg, i) => (
        <div key={i}>
          {msg.text}
          {msg.sending && <small> (发送中...)</small>}
        </div>
      ))}
      <form action={formAction}>
        <input name="message" />
        <button type="submit">发送</button>
      </form>
    </>
  )
}
```

## 性能优化最佳实践

### 1. 合理使用 memo

```jsx
import { memo } from 'react'

// 只在 props 未变化时跳过重新渲染
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* 复杂的渲染逻辑 */}</div>
})
```

### 2. 避免在渲染中创建对象

```jsx
// ❌ 每次渲染都创建新对象
function Component() {
  return <Child style={{ color: 'red' }} />
}

// ✅ 提取到组件外部
const style = { color: 'red' }
function Component() {
  return <Child style={style} />
}
```

### 3. 使用 key 优化列表渲染

```jsx
// ✅ 使用稳定的 key
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ❌ 使用索引作为 key（数据会变化时）
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
```

## 总结

React Hooks 让函数组件拥有了完整的能力，使代码更简洁、更易于复用。

**核心 Hooks：**
- ✅ useState、useEffect、useContext - 基础必备
- ✅ useReducer、useMemo、useCallback - 复杂状态和性能优化
- ✅ useRef - DOM 访问和可变值

**React 18+ 新增：**
- ✅ useId - 生成唯一 ID
- ✅ useTransition、useDeferredValue - 并发特性
- ✅ useSyncExternalStore - 外部状态订阅
- ✅ useInsertionEffect - CSS-in-JS 优化

**React 19 实验性：**
- ✅ use - 读取 Promise/Context
- ✅ useOptimistic - 乐观更新

掌握这些 Hooks 是现代 React 开发的必备技能。

## 🔗 相关文章

- [React 性能优化实战指南](./react-performance-optimization.md)
- [JavaScript ES6+ 完全指南](./javascript-complete-guide.md)
- [TypeScript 高级类型系统完全指南](./typescript-advanced-types.md)

## 📖 参考资源

- [React 官方文档](https://react.dev/)
- [Hooks API Reference](https://react.dev/reference/react)
- [React 18 新特性](https://react.dev/blog/2022/03/29/react-v18)
- [React 19 Beta](https://react.dev/blog/2024/04/25/react-19)
