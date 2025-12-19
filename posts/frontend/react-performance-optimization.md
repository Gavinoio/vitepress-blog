---
title: React 性能优化实战指南
date: 2024-12-15
categories:
  - 前端开发
tags:
  - React
  - 性能优化
  - JavaScript
---

# React 性能优化实战指南

在开发大型 React 应用时，性能优化是一个不可忽视的问题。本文将介绍多种实用的 React 性能优化技巧。

## 1. 使用 React.memo 避免不必要的重渲染

`React.memo` 是一个高阶组件，可以记忆组件的渲染结果，只有当 props 发生变化时才重新渲染。

```jsx
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  console.log('渲染 ExpensiveComponent');
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});

// 自定义比较函数
const MyComponent = memo(
  ({ user }) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true 表示不重新渲染
    return prevProps.user.id === nextProps.user.id;
  }
);
```

## 2. useMemo 和 useCallback 优化计算和函数

### useMemo 缓存计算结果

```jsx
import { useMemo } from 'react';

function ProductList({ products, filterText }) {
  // 只有当 products 或 filterText 变化时才重新计算
  const filteredProducts = useMemo(() => {
    console.log('执行过滤操作');
    return products.filter(product =>
      product.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [products, filterText]);

  return (
    <ul>
      {filteredProducts.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### useCallback 缓存函数引用

```jsx
import { useCallback, useState } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 使用 useCallback 缓存函数，避免子组件不必要的重渲染
  const handleClick = useCallback(() => {
    console.log('Button clicked');
    setCount(c => c + 1);
  }, []); // 空依赖数组，函数永远不会改变

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ChildComponent onClick={handleClick} />
      <p>Count: {count}</p>
    </div>
  );
}

const ChildComponent = memo(({ onClick }) => {
  console.log('ChildComponent 渲染');
  return <button onClick={onClick}>点击</button>;
});
```

## 3. 虚拟列表优化长列表渲染

对于大量数据的列表，使用虚拟列表只渲染可见区域的元素。

```jsx
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## 4. 代码分割和懒加载

使用 `React.lazy` 和 `Suspense` 实现组件的按需加载。

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>加载中...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## 5. 使用 key 优化列表渲染

确保为列表项提供稳定且唯一的 `key`。

```jsx
// ❌ 不好的做法 - 使用索引作为 key
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ 好的做法 - 使用唯一标识符
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

## 6. 避免在渲染中创建新对象

```jsx
// ❌ 不好的做法 - 每次渲染都创建新对象
function BadComponent({ user }) {
  return <UserProfile user={user} style={{ color: 'red' }} />;
}

// ✅ 好的做法 - 提取到组件外部或使用 useMemo
const profileStyle = { color: 'red' };

function GoodComponent({ user }) {
  return <UserProfile user={user} style={profileStyle} />;
}
```

## 7. 使用 React DevTools Profiler 分析性能

React DevTools 提供了强大的性能分析工具：

1. 打开 React DevTools
2. 切换到 Profiler 标签
3. 点击录制按钮，执行操作
4. 停止录制，查看性能火焰图
5. 找出渲染时间长的组件并优化

## 8. 优化 Context 使用

将频繁变化的值和不常变化的值分开，避免不必要的重渲染。

```jsx
// ❌ 不好的做法 - 所有值放在一个 Context
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [counter, setCounter] = useState(0); // 频繁变化

  return (
    <AppContext.Provider value={{ user, theme, counter, setUser, setTheme, setCounter }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ 好的做法 - 分离 Context
const UserContext = createContext();
const ThemeContext = createContext();
const CounterContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [counter, setCounter] = useState(0);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <CounterContext.Provider value={{ counter, setCounter }}>
          {children}
        </CounterContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

## 9. 使用 Web Workers 处理密集计算

```jsx
import { useEffect, useState } from 'react';

function HeavyCalculation() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const worker = new Worker(new URL('./worker.js', import.meta.url));

    worker.postMessage({ data: largeDataSet });

    worker.onmessage = (e) => {
      setResult(e.data);
    };

    return () => worker.terminate();
  }, []);

  return <div>{result}</div>;
}
```

## 10. 防抖和节流

```jsx
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

function SearchComponent() {
  const [query, setQuery] = useState('');

  // 使用防抖减少 API 调用
  const debouncedSearch = useCallback(
    debounce((value) => {
      // 执行搜索 API 调用
      fetch(`/api/search?q=${value}`);
    }, 500),
    []
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return <input value={query} onChange={handleChange} />;
}
```

## 总结

React 性能优化是一个持续的过程，需要：

1. **测量优先**：使用 React DevTools Profiler 找出真正的性能瓶颈
2. **避免过早优化**：不要盲目使用 `memo`、`useMemo`、`useCallback`
3. **关注用户体验**：优化对用户影响最大的部分
4. **代码分割**：按需加载，减少初始包体积
5. **合理使用缓存**：避免重复计算和渲染

记住：**过度优化和不优化一样糟糕**，在优化之前先测量，确定真正的性能瓶颈。
