---
title: JavaScript ES6+ 完全指南：从基础到高级特性
date: 2025-07-28 10:00:00
description: 全面深入讲解 JavaScript ES6 到 ES2023 的所有重要特性，包含变量声明、解构赋值、箭头函数、Promise、async/await、模块化、类、新数据结构等，配有丰富的代码示例和实战技巧。
keywords:
  - JavaScript
  - ES6
  - ES2023
  - 现代JavaScript
  - 前端开发
categories:
  - 前端开发
tags:
  - JavaScript
  - ES6+
  - 编程技巧
  - 现代JavaScript
cover: https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1920
---

# JavaScript ES6+ 完全指南：从基础到高级特性

> 📖 阅读时间：30分钟 | 难度：⭐⭐⭐ 中级 | 更新日期：2024-12-15

ES6 (ECMAScript 2015) 及后续版本为 JavaScript 带来了革命性的改变。本文将全面介绍从 ES6 到 ES2023 的所有重要特性，帮助你掌握现代 JavaScript 开发。

## 📋 目录

- [变量声明：let 和 const](#变量声明let-和-const)
- [解构赋值](#解构赋值)
- [箭头函数](#箭头函数)
- [模板字符串](#模板字符串)
- [扩展运算符和剩余参数](#扩展运算符和剩余参数)
- [增强的对象字面量](#增强的对象字面量)
- [Promise 和异步编程](#promise-和异步编程)
- [类 (Class)](#类-class)
- [模块化](#模块化)
- [新的数据结构](#新的数据结构)
- [可选链和空值合并](#可选链和空值合并)
- [数组和对象方法](#数组和对象方法)
- [实用技巧](#实用技巧)

## 变量声明：let 和 const

### let：块级作用域变量

```javascript
// var 的问题：函数作用域
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出: 3 3 3

// let 的解决方案：块级作用域
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出: 0 1 2

// 暂时性死区 (TDZ)
console.log(x) // ReferenceError
let x = 5

// 块级作用域示例
{
  let blockScoped = 'inside'
  console.log(blockScoped) // 'inside'
}
console.log(blockScoped) // ReferenceError
```

### const：常量声明

```javascript
const PI = 3.14159
PI = 3.14 // TypeError: Assignment to constant variable

// const 对象的属性可以修改
const user = { name: 'Gavin' }
user.name = 'John' // ✅ 可以
user = {} // ❌ 不可以

// 冻结对象
const frozenUser = Object.freeze({ name: 'Gavin' })
frozenUser.name = 'John' // 静默失败（严格模式下报错）

// 最佳实践：优先使用 const，需要重新赋值时使用 let
const config = { theme: 'dark' }
let counter = 0
```

## 解构赋值

### 数组解构

```javascript
// 基本用法
const [a, b, c] = [1, 2, 3]

// 跳过元素
const [first, , third] = [1, 2, 3]
console.log(first, third) // 1, 3

// 默认值
const [x = 0, y = 0] = [1]
console.log(x, y) // 1, 0

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5]
console.log(head) // 1
console.log(tail) // [2, 3, 4, 5]

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m]
console.log(m, n) // 2, 1

// 嵌套解构
const [a, [b, c]] = [1, [2, 3]]
console.log(a, b, c) // 1, 2, 3
```

### 对象解构

```javascript
// 基本用法
const user = { name: 'Gavin', age: 28 }
const { name, age } = user

// 重命名
const { name: userName, age: userAge } = user

// 默认值
const { city = 'Beijing' } = user

// 剩余属性
const { name, ...rest } = { name: 'John', age: 30, city: 'NY' }
console.log(rest) // { age: 30, city: 'NY' }

// 嵌套解构
const person = {
  name: 'Gavin',
  address: {
    city: 'Shanghai',
    street: 'Nanjing Road'
  }
}
const { address: { city, street } } = person

// 函数参数解构
function greet({ name, age = 18 }) {
  console.log(`Hello ${name}, you are ${age}`)
}
greet({ name: 'Gavin' }) // Hello Gavin, you are 18
```

## 箭头函数

### 基础语法

```javascript
// 传统函数
function add(a, b) {
  return a + b
}

// 箭头函数
const add = (a, b) => a + b

// 单参数可省略括号
const square = x => x * x

// 无参数需要括号
const greet = () => console.log('Hello')

// 返回对象需要括号
const createUser = (name, age) => ({ name, age })

// 多行函数体需要 return
const calculate = (a, b) => {
  const sum = a + b
  return sum * 2
}
```

### 箭头函数的特点

```javascript
// 1. 没有自己的 this
class Counter {
  constructor() {
    this.count = 0
  }

  // ❌ 传统函数，this 指向会改变
  incrementBad() {
    setTimeout(function() {
      this.count++ // this 指向 window
    }, 1000)
  }

  // ✅ 箭头函数，this 指向 Counter 实例
  incrementGood() {
    setTimeout(() => {
      this.count++ // this 指向 Counter 实例
    }, 1000)
  }
}

// 2. 不能用作构造函数
const Person = (name) => {
  this.name = name
}
new Person('Gavin') // TypeError

// 3. 没有 arguments 对象
const func = (...args) => {
  console.log(args) // 使用剩余参数代替
}

// 4. 没有 prototype
console.log(add.prototype) // undefined

// 不适合使用箭头函数的场景
const obj = {
  value: 100,
  // ❌ 箭头函数没有自己的 this
  getValue: () => this.value, // undefined

  // ✅ 使用普通函数
  getValueCorrect() {
    return this.value // 100
  }
}
```

## 模板字符串

```javascript
const name = 'Gavin'
const age = 28

// 基本用法
const greeting = `Hello, ${name}!`

// 多行字符串
const message = `
  Dear ${name},

  Your age is ${age}.

  Best regards
`

// 表达式
const price = 100
const tax = 0.1
const total = `Total: $${(price * (1 + tax)).toFixed(2)}`

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return `${result}${str}<strong>${values[i] || ''}</strong>`
  }, '')
}

const html = highlight`Name: ${name}, Age: ${age}`
// "Name: <strong>Gavin</strong>, Age: <strong>28</strong>"
```

## 扩展运算符和剩余参数

### 扩展运算符 (Spread)

```javascript
// 数组操作
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]

// 合并数组
const merged = [...arr1, ...arr2] // [1, 2, 3, 4, 5, 6]

// 复制数组（浅拷贝）
const copy = [...arr1]

// 数组转换
const str = 'hello'
const chars = [...str] // ['h', 'e', 'l', 'l', 'o']

// 找出最大值/最小值
const numbers = [1, 5, 3, 9, 2]
Math.max(...numbers) // 9
Math.min(...numbers) // 1

// 对象操作
const obj1 = { a: 1, b: 2 }
const obj2 = { c: 3, d: 4 }

// 合并对象
const mergedObj = { ...obj1, ...obj2 } // { a: 1, b: 2, c: 3, d: 4 }

// 浅拷贝对象
const objCopy = { ...obj1 }

// 覆盖属性
const updated = { ...obj1, b: 20 } // { a: 1, b: 20 }
```

### 剩余参数 (Rest)

```javascript
// 收集剩余参数
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0)
}
sum(1, 2, 3, 4, 5) // 15

// 与普通参数结合
function multiply(multiplier, ...numbers) {
  return numbers.map(num => num * multiplier)
}
multiply(2, 1, 2, 3) // [2, 4, 6]

// 对象剩余属性
const { name, ...otherInfo } = { name: 'Gavin', age: 28, city: 'Shanghai' }
console.log(otherInfo) // { age: 28, city: 'Shanghai' }
```

## 增强的对象字面量

```javascript
const name = 'Gavin'
const age = 28

// 属性简写
const user = { name, age }
// 等同于 { name: name, age: age }

// 方法简写
const obj = {
  sayHi() {
    console.log('Hi!')
  }
  // 等同于 sayHi: function() { ... }
}

// 计算属性名
const prop = 'name'
const user2 = {
  [prop]: 'Gavin',
  ['get' + prop]() {
    return this[prop]
  }
}
```

## Promise 和异步编程

### Promise 基础

```javascript
// 创建 Promise
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5
      if (success) {
        resolve({ data: 'Success' })
      } else {
        reject(new Error('Failed'))
      }
    }, 1000)
  })
}

// Promise 链
fetchData()
  .then(result => {
    console.log(result)
    return fetchData()
  })
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    console.error(error)
  })
  .finally(() => {
    console.log('Completed')
  })
```

### async/await

```javascript
// 基本用法
async function getData() {
  try {
    const result = await fetchData()
    console.log(result)
    return result
  } catch (error) {
    console.error(error)
  }
}

// 并行请求
async function getMultipleData() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ])
  return { user, posts, comments }
}

// Promise.allSettled - 等待所有 Promise 完成（无论成功失败）
const results = await Promise.allSettled([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
])

// Promise.race - 返回最快完成的 Promise
const fastest = await Promise.race([
  fetch('/api/server1'),
  fetch('/api/server2'),
  fetch('/api/server3')
])

// Promise.any - 返回第一个成功的 Promise (ES2021)
const firstSuccess = await Promise.any([
  fetch('/api/server1'),
  fetch('/api/server2')
])
```

## 类 (Class)

```javascript
// 基本类定义
class Person {
  // 公共字段 (ES2022)
  name = 'Anonymous'

  // 私有字段 (ES2022)
  #age = 0

  // 静态属性
  static species = 'Homo sapiens'

  constructor(name, age) {
    this.name = name
    this.#age = age
  }

  // 方法
  greet() {
    console.log(`Hello, I'm ${this.name}`)
  }

  // Getter
  get age() {
    return this.#age
  }

  // Setter
  set age(value) {
    if (value >= 0) {
      this.#age = value
    }
  }

  // 静态方法
  static create(name, age) {
    return new Person(name, age)
  }

  // 私有方法 (ES2022)
  #privateMethod() {
    console.log('This is private')
  }
}

// 继承
class Developer extends Person {
  #language

  constructor(name, age, language) {
    super(name, age) // 调用父类构造函数
    this.#language = language
  }

  // 重写方法
  greet() {
    super.greet() // 调用父类方法
    console.log(`I code in ${this.#language}`)
  }
}

const dev = new Developer('Gavin', 28, 'JavaScript')
dev.greet()
```

## 模块化

```javascript
// export.js - 导出
export const PI = 3.14159

export function add(a, b) {
  return a + b
}

export class Calculator {
  // ...
}

// 默认导出
export default class User {
  // ...
}

// 命名导出
export { PI as pi, add }

// import.js - 导入
import User from './export.js' // 默认导入
import { PI, add } from './export.js' // 命名导入
import { PI as pi } from './export.js' // 重命名
import * as math from './export.js' // 全部导入

// 动态导入
async function loadModule() {
  const module = await import('./export.js')
  module.add(1, 2)
}

// 条件导入
if (condition) {
  const { feature } = await import('./feature.js')
}
```

## 新的数据结构

### Set

```javascript
// 创建 Set
const set = new Set([1, 2, 3, 3, 4])
console.log(set) // Set(4) { 1, 2, 3, 4 }

// 添加和删除
set.add(5)
set.delete(1)
set.has(2) // true
set.size // 4
set.clear()

// 数组去重
const arr = [1, 2, 2, 3, 3, 4]
const unique = [...new Set(arr)] // [1, 2, 3, 4]

// 遍历
set.forEach(value => console.log(value))
for (const value of set) {
  console.log(value)
}
```

### Map

```javascript
// 创建 Map
const map = new Map([
  ['name', 'Gavin'],
  ['age', 28]
])

// 添加和获取
map.set('city', 'Shanghai')
map.get('name') // 'Gavin'
map.has('age') // true
map.delete('city')
map.size // 2

// 对象作为键
const obj = { id: 1 }
map.set(obj, 'Object value')
map.get(obj) // 'Object value'

// 遍历
map.forEach((value, key) => {
  console.log(`${key}: ${value}`)
})

for (const [key, value] of map) {
  console.log(`${key}: ${value}`)
}

// 转换
const object = Object.fromEntries(map)
const newMap = new Map(Object.entries(object))
```

### Symbol

```javascript
// 创建唯一标识符
const id = Symbol('id')
const id2 = Symbol('id')
console.log(id === id2) // false

// 对象中使用
const user = {
  name: 'Gavin',
  [id]: 123
}
console.log(user[id]) // 123

// Symbol 不会出现在 for...in 中
for (let key in user) {
  console.log(key) // 只输出 'name'
}

// 获取 Symbol 属性
Object.getOwnPropertySymbols(user)

// 全局 Symbol
const globalSym = Symbol.for('app.id')
const same = Symbol.for('app.id')
console.log(globalSym === same) // true

// 内置 Symbol
class Collection {
  *[Symbol.iterator]() {
    yield 1
    yield 2
    yield 3
  }
}

const collection = new Collection()
for (const value of collection) {
  console.log(value) // 1, 2, 3
}
```

## 可选链和空值合并

```javascript
// 可选链 (?.) - ES2020
const user = {
  name: 'Gavin',
  address: {
    city: 'Shanghai'
  }
}

// ❌ 传统方式
const zip = user && user.address && user.address.zip

// ✅ 可选链
const zip = user?.address?.zip // undefined

// 方法调用
user.greet?.() // 如果 greet 存在则调用

// 数组访问
const firstItem = arr?.[0]

// 空值合并 (??) - ES2020
const value1 = null ?? 'default' // 'default'
const value2 = undefined ?? 'default' // 'default'
const value3 = 0 ?? 'default' // 0
const value4 = '' ?? 'default' // ''
const value5 = false ?? 'default' // false

// 与 || 的区别
const a = 0 || 'default' // 'default'
const b = 0 ?? 'default' // 0

// 组合使用
const username = user?.name ?? 'Anonymous'

// 逻辑赋值运算符 (ES2021)
let x = 1
x &&= 2 // x = x && 2
x ||= 3 // x = x || 3
x ??= 4 // x = x ?? 4

// 实际应用
let config = {}
config.theme ??= 'light' // 如果 theme 为 null/undefined 则设置为 'light'
```

## 数组和对象方法

### 数组方法

```javascript
const numbers = [1, 2, 3, 4, 5]

// map - 转换数组
const doubled = numbers.map(n => n * 2) // [2, 4, 6, 8, 10]

// filter - 过滤数组
const evens = numbers.filter(n => n % 2 === 0) // [2, 4]

// reduce - 归约数组
const sum = numbers.reduce((acc, n) => acc + n, 0) // 15

// find - 查找元素
const found = numbers.find(n => n > 3) // 4

// findIndex - 查找索引
const index = numbers.findIndex(n => n > 3) // 3

// some - 是否有元素满足条件
const hasEven = numbers.some(n => n % 2 === 0) // true

// every - 是否所有元素满足条件
const allPositive = numbers.every(n => n > 0) // true

// includes - 是否包含某元素 (ES2016)
numbers.includes(3) // true

// flat - 展平数组 (ES2019)
const nested = [1, [2, 3], [4, [5, 6]]]
nested.flat() // [1, 2, 3, 4, [5, 6]]
nested.flat(2) // [1, 2, 3, 4, 5, 6]
nested.flat(Infinity) // 完全展平

// flatMap - map + flat (ES2019)
const words = ['hello', 'world']
words.flatMap(word => word.split('')) // ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']

// at - 支持负索引 (ES2022)
const arr = [1, 2, 3, 4, 5]
arr.at(-1) // 5
arr.at(-2) // 4

// findLast 和 findLastIndex (ES2023)
numbers.findLast(n => n > 3) // 5
numbers.findLastIndex(n => n > 3) // 4

// 链式调用
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .reduce((acc, n) => acc + n, 0) // 12
```

### 对象方法

```javascript
const obj = { a: 1, b: 2, c: 3 }

// Object.keys - 获取所有键
Object.keys(obj) // ['a', 'b', 'c']

// Object.values - 获取所有值 (ES2017)
Object.values(obj) // [1, 2, 3]

// Object.entries - 获取键值对数组 (ES2017)
Object.entries(obj) // [['a', 1], ['b', 2], ['c', 3]]

// Object.fromEntries - 从键值对数组创建对象 (ES2019)
const entries = [['a', 1], ['b', 2]]
Object.fromEntries(entries) // { a: 1, b: 2 }

// 转换对象
const doubled = Object.fromEntries(
  Object.entries(obj).map(([key, value]) => [key, value * 2])
) // { a: 2, b: 4, c: 6 }

// Object.assign - 合并对象
const merged = Object.assign({}, obj, { d: 4 }) // { a: 1, b: 2, c: 3, d: 4 }

// Object.freeze - 冻结对象
const frozen = Object.freeze({ a: 1 })
// frozen.a = 2; // 无效

// Object.seal - 密封对象（可修改现有属性，不可添加删除）
const sealed = Object.seal({ a: 1 })
sealed.a = 2 // ✅
// sealed.b = 3; // ❌

// Object.hasOwn - 检查对象是否有自己的属性 (ES2022)
Object.hasOwn(obj, 'a') // true
```

## 实用技巧

### 短路求值

```javascript
// && 短路
const user = getUser() && getUser().name

// || 默认值
const name = userName || 'Anonymous'

// ?? 空值合并（更精确）
const count = userCount ?? 0
```

### 条件对象属性

```javascript
const includeAge = true
const user = {
  name: 'John',
  ...(includeAge && { age: 30 })
}
```

### 数组去重

```javascript
const unique = [...new Set([1, 2, 2, 3, 3, 4])] // [1, 2, 3, 4]
```

### 对象深拷贝

```javascript
// 简单深拷贝（不支持函数、循环引用等）
const copy = JSON.parse(JSON.stringify(obj))

// 使用 structuredClone（现代浏览器，ES2022）
const copy = structuredClone(obj)
```

### 数组分组 (ES2023)

```javascript
const items = [
  { type: 'fruit', name: 'apple' },
  { type: 'vegetable', name: 'carrot' },
  { type: 'fruit', name: 'banana' }
]

// Object.groupBy
const grouped = Object.groupBy(items, item => item.type)
// {
//   fruit: [{ type: 'fruit', name: 'apple' }, { type: 'fruit', name: 'banana' }],
//   vegetable: [{ type: 'vegetable', name: 'carrot' }]
// }
```

## 💡 总结

现代 JavaScript (ES6+) 带来的重要特性：

### 基础特性 (ES6/ES2015)
- ✅ **变量声明**：let/const 块级作用域
- ✅ **解构赋值**：简化数据提取
- ✅ **箭头函数**：更简洁的函数语法
- ✅ **模板字符串**：字符串插值和多行支持
- ✅ **扩展运算符**：数组和对象操作
- ✅ **Promise**：异步编程基础
- ✅ **类**：面向对象编程
- ✅ **模块化**：import/export

### 进阶特性 (ES2016-ES2019)
- ✅ **async/await** (ES2017)：优雅的异步处理
- ✅ **Object.values/entries** (ES2017)：对象遍历
- ✅ **flat/flatMap** (ES2019)：数组展平
- ✅ **Object.fromEntries** (ES2019)：对象转换

### 现代特性 (ES2020-ES2023)
- ✅ **可选链** (ES2020)：安全的属性访问
- ✅ **空值合并** (ES2020)：精确的默认值
- ✅ **逻辑赋值** (ES2021)：简化赋值操作
- ✅ **私有字段** (ES2022)：真正的私有属性
- ✅ **at() 方法** (ES2022)：负索引访问
- ✅ **structuredClone** (ES2022)：深拷贝
- ✅ **findLast** (ES2023)：从后查找
- ✅ **Object.groupBy** (ES2023)：数组分组

掌握这些特性，能够编写更简洁、更易维护、更现代化的 JavaScript 代码。

## 🔗 相关文章

- [TypeScript 高级类型系统完全指南](./typescript-advanced-types.md)
- [React Hooks 完全指南](./react-hooks-guide.md)
- [Vue 3 Composition API 深度解析](./vue3-composition-api.md)

## 📖 参考资源

- [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ES6 入门教程 - 阮一峰](https://es6.ruanyifeng.com/)
- [ECMAScript 规范](https://tc39.es/ecma262/)
- [Can I Use - 浏览器兼容性](https://caniuse.com/)
