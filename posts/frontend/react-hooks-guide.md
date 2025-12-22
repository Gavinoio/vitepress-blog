---
title: React Hooks 完全指南
date: 2024-12-10 07:38:18
categories:
  - 前端开发
tags:
  - React
  - JavaScript
  - Hooks
cover: https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1920
---

# React Hooks 完全指南

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

## 总结

React Hooks 让函数组件拥有了完整的能力，使代码更简洁、更易于复用。掌握 Hooks 是现代 React 开发的必备技能。

参考资源：
- [React 官方文档](https://react.dev/)
- [Hooks API Reference](https://react.dev/reference/react)
