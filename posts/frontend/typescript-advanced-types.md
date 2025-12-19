---
title: TypeScript 高级类型系统完全指南
date: 2024-12-18
categories:
  - 前端开发
tags:
  - TypeScript
  - JavaScript
  - 类型系统
cover: https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1920
---

# TypeScript 高级类型系统完全指南

TypeScript 的类型系统功能强大且灵活。掌握高级类型特性能够帮助我们编写更安全、更优雅的代码。

## 联合类型与交叉类型

### 联合类型 (Union Types)

联合类型表示一个值可以是几种类型之一。

```typescript
type Status = 'pending' | 'success' | 'error'

function handleStatus(status: Status) {
  switch (status) {
    case 'pending':
      console.log('加载中...')
      break
    case 'success':
      console.log('成功!')
      break
    case 'error':
      console.log('错误!')
      break
  }
}
```

### 交叉类型 (Intersection Types)

交叉类型将多个类型合并为一个类型。

```typescript
interface User {
  name: string
  age: number
}

interface Admin {
  role: string
  permissions: string[]
}

type AdminUser = User & Admin

const admin: AdminUser = {
  name: 'Gavin',
  age: 28,
  role: 'super-admin',
  permissions: ['read', 'write', 'delete']
}
```

## 类型保护 (Type Guards)

类型保护帮助 TypeScript 在特定作用域内缩小类型范围。

### typeof 类型保护

```typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    // 在这个代码块中，value 是 string 类型
    return value.toUpperCase()
  } else {
    // 在这个代码块中,value 是 number 类型
    return value.toFixed(2)
  }
}
```

### instanceof 类型保护

```typescript
class Dog {
  bark() {
    console.log('汪汪!')
  }
}

class Cat {
  meow() {
    console.log('喵喵!')
  }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark()
  } else {
    animal.meow()
  }
}
```

### 自定义类型保护

```typescript
interface Fish {
  swim: () => void
}

interface Bird {
  fly: () => void
}

// 类型谓词 (Type Predicate)
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim()
  } else {
    pet.fly()
  }
}
```

## 映射类型 (Mapped Types)

映射类型允许我们基于旧类型创建新类型。

### 内置映射类型

```typescript
interface User {
  id: number
  name: string
  email: string
}

// Partial - 所有属性变为可选
type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string }

// Required - 所有属性变为必需
type RequiredUser = Required<PartialUser>

// Readonly - 所有属性变为只读
type ReadonlyUser = Readonly<User>

// Pick - 选择部分属性
type UserPreview = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// Omit - 排除部分属性
type UserWithoutEmail = Omit<User, 'email'>
// { id: number; name: string }
```

### 自定义映射类型

```typescript
// 将所有属性变为可空类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

interface Product {
  name: string
  price: number
}

type NullableProduct = Nullable<Product>
// { name: string | null; price: number | null }

// 为所有函数属性添加前缀
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// {
//   getName: () => string
//   getAge: () => number
// }
```

## 条件类型 (Conditional Types)

条件类型允许我们根据条件选择类型。

```typescript
// 基本语法：T extends U ? X : Y
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false

// 实用示例：提取数组元素类型
type ArrayElementType<T> = T extends (infer U)[] ? U : never

type StringArray = ArrayElementType<string[]>  // string
type NumberArray = ArrayElementType<number[]>  // number

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

function getUser() {
  return { name: 'Gavin', age: 28 }
}

type User = ReturnType<typeof getUser>
// { name: string; age: number }
```

## 模板字面量类型 (Template Literal Types)

TypeScript 4.1+ 引入的强大特性。

```typescript
type EventName = 'click' | 'scroll' | 'mousemove'
type HandlerName = `on${Capitalize<EventName>}`
// 'onClick' | 'onScroll' | 'onMousemove'

// 实用示例：生成 CSS 属性
type CSSProperty = 'margin' | 'padding'
type Side = 'top' | 'right' | 'bottom' | 'left'
type CSSPropertyWithSide = `${CSSProperty}-${Side}`
// 'margin-top' | 'margin-right' | ... | 'padding-left'

// 类型安全的路由
type Routes = '/home' | '/about' | '/contact'
type RouteWithLang = `/${string}${Routes}`
// '/zh-cn/home' | '/en/home' | ...
```

## 工具类型实战

### 深度只读

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

interface Config {
  server: {
    host: string
    port: number
  }
  database: {
    url: string
  }
}

type ReadonlyConfig = DeepReadonly<Config>
// 所有嵌套属性都是只读的
```

### 深度 Partial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

type PartialConfig = DeepPartial<Config>
// 所有嵌套属性都是可选的
```

### 类型安全的事件系统

```typescript
interface EventMap {
  'user:login': { userId: string; timestamp: number }
  'user:logout': { userId: string }
  'product:view': { productId: string; source: string }
}

class EventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
    // 实现...
  }

  emit<K extends keyof T>(event: K, data: T[K]) {
    // 实现...
  }
}

const emitter = new EventEmitter<EventMap>()

// 类型安全！
emitter.on('user:login', (data) => {
  console.log(data.userId)  // ✅ 正确
  console.log(data.username)  // ❌ 类型错误
})

emitter.emit('user:login', {
  userId: '123',
  timestamp: Date.now()
})  // ✅ 正确

emitter.emit('user:login', {
  userId: '123'
})  // ❌ 缺少 timestamp
```

## 实战技巧

### 1. 使用 const 断言

```typescript
// 普通对象
const config = {
  endpoint: '/api',
  timeout: 5000
}
// 类型: { endpoint: string; timeout: number }

// 使用 const 断言
const config = {
  endpoint: '/api',
  timeout: 5000
} as const
// 类型: { readonly endpoint: '/api'; readonly timeout: 5000 }
```

### 2. 类型收窄

```typescript
function processValue(value: string | number | null) {
  if (!value) {
    return 'Empty'
  }

  // 此时 value 类型为 string | number

  if (typeof value === 'string') {
    return value.toUpperCase()
  }

  // 此时 value 类型为 number
  return value.toFixed(2)
}
```

### 3. 避免使用 any

```typescript
// ❌ 不好
function process(data: any) {
  return data.value
}

// ✅ 使用泛型
function process<T extends { value: unknown }>(data: T) {
  return data.value
}

// ✅ 或使用 unknown
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: unknown }).value
  }
  return undefined
}
```

## 总结

TypeScript 的高级类型系统提供了强大的类型操作能力：

1. **联合和交叉类型**：组合类型
2. **类型保护**：运行时类型检查
3. **映射类型**：类型转换
4. **条件类型**：类型逻辑判断
5. **模板字面量类型**：字符串类型操作

掌握这些特性能够让我们编写更安全、更具表达力的代码。

参考资源：
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
