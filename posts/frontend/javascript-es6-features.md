---
title: JavaScript ES6+ 新特性全面解析
date: 2024-12-12
categories:
  - 前端开发
tags:
  - JavaScript
  - ES6
  - 现代JavaScript
cover: https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1920
---

# JavaScript ES6+ 新特性全面解析

ES6 (ECMAScript 2015) 及后续版本为 JavaScript 带来了众多强大特性。本文将全面介绍这些现代 JavaScript 特性。

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
```

## 解构赋值

### 数组解构

```javascript
// 基本用法
const [a, b, c] = [1, 2, 3]

// 跳过元素
const [first, , third] = [1, 2, 3]

// 默认值
const [x = 0, y = 0] = [1]
console.log(x, y) // 1 0

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4]
console.log(head) // 1
console.log(tail) // [2, 3, 4]

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m]
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

```javascript
// 传统函数
function add(a, b) {
  return a + b
}

// 箭头函数
const add = (a, b) => a + b

// 多行箭头函数
const calculate = (a, b) => {
  const sum = a + b
  return sum * 2
}

// 单参数可以省略括号
const square = x => x * x

// 返回对象字面量需要加括号
const makePerson = (name, age) => ({ name, age })
```

### 箭头函数的特点

```javascript
// 1. 没有自己的 this
const obj = {
  name: 'Gavin',
  regularFunc: function() {
    console.log(this.name) // 'Gavin'
  },
  arrowFunc: () => {
    console.log(this.name) // undefined (this 指向外层)
  }
}

// 2. 不能用作构造函数
const Person = (name) => {
  this.name = name
}
new Person('Gavin') // TypeError

// 3. 没有 arguments 对象
const func = () => {
  console.log(arguments) // ReferenceError
}

// 使用剩余参数代替
const func2 = (...args) => {
  console.log(args) // ✅ 可以
}

// 4. 没有 prototype
console.log(add.prototype) // undefined
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
// 数组展开
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]
const combined = [...arr1, ...arr2]

// 复制数组
const original = [1, 2, 3]
const copy = [...original]

// 对象展开
const obj1 = { a: 1, b: 2 }
const obj2 = { c: 3, d: 4 }
const merged = { ...obj1, ...obj2 }

// 覆盖属性
const user = { name: 'Gavin', age: 28 }
const updatedUser = { ...user, age: 29 }

// 函数参数
const numbers = [1, 2, 3, 4, 5]
Math.max(...numbers)
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

## 类 (Class)

```javascript
// 基本类定义
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  greet() {
    console.log(`Hello, I'm ${this.name}`)
  }

  // 静态方法
  static create(name, age) {
    return new Person(name, age)
  }

  // Getter
  get info() {
    return `${this.name}, ${this.age}`
  }

  // Setter
  set info(value) {
    const [name, age] = value.split(',')
    this.name = name.trim()
    this.age = parseInt(age)
  }
}

// 继承
class Developer extends Person {
  constructor(name, age, language) {
    super(name, age) // 调用父类构造函数
    this.language = language
  }

  // 重写方法
  greet() {
    super.greet() // 调用父类方法
    console.log(`I code in ${this.language}`)
  }
}

// 私有字段 (ES2022)
class BankAccount {
  #balance = 0 // 私有字段

  deposit(amount) {
    this.#balance += amount
  }

  getBalance() {
    return this.#balance
  }
}
```

## Promise 和异步编程

```javascript
// 创建 Promise
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true
      if (success) {
        resolve({ data: 'Some data' })
      } else {
        reject(new Error('Failed to fetch'))
      }
    }, 1000)
  })
}

// 使用 Promise
fetchData()
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'))

// Async/Await
async function getData() {
  try {
    const result = await fetchData()
    console.log(result)
    return result
  } catch (error) {
    console.error(error)
  }
}

// 并发请求
async function fetchAll() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ])
  return { users, posts, comments }
}
```

## 模块化 (Modules)

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
set.clear()

// 数组去重
const arr = [1, 2, 2, 3, 3, 4]
const unique = [...new Set(arr)]

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

## Symbol

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

## 新的数组方法

```javascript
const numbers = [1, 2, 3, 4, 5]

// find 和 findIndex
const found = numbers.find(n => n > 3) // 4
const index = numbers.findIndex(n => n > 3) // 3

// includes
numbers.includes(3) // true

// flat 和 flatMap
const nested = [1, [2, [3, [4]]]]
nested.flat() // [1, 2, [3, [4]]]
nested.flat(2) // [1, 2, 3, [4]]
nested.flat(Infinity) // [1, 2, 3, 4]

const arr = [1, 2, 3]
arr.flatMap(x => [x, x * 2]) // [1, 2, 2, 4, 3, 6]

// ES2022: at() 方法
numbers.at(0) // 1
numbers.at(-1) // 5 (从后往前)

// ES2023: findLast 和 findLastIndex
numbers.findLast(n => n > 3) // 5
numbers.findLastIndex(n => n > 3) // 4
```

## 可选链和空值合并

```javascript
// 可选链 (?.)
const user = {
  name: 'Gavin',
  address: {
    city: 'Shanghai'
  }
}

// 避免深层嵌套的属性访问错误
console.log(user?.address?.city) // 'Shanghai'
console.log(user?.contact?.phone) // undefined (不会报错)

// 函数调用
user.greet?.() // 如果 greet 存在则调用

// 数组访问
const arr = [1, 2, 3]
arr?.[0] // 1

// 空值合并 (??)
const value1 = null ?? 'default' // 'default'
const value2 = undefined ?? 'default' // 'default'
const value3 = 0 ?? 'default' // 0 (只有 null 和 undefined 才会使用默认值)
const value4 = '' ?? 'default' // ''

// 与逻辑或的区别
const a = 0 || 100 // 100 (0 是 falsy)
const b = 0 ?? 100 // 0 (0 不是 null/undefined)

// 逻辑赋值运算符 (ES2021)
let x = 1
x &&= 2 // x = x && 2
x ||= 3 // x = x || 3
x ??= 4 // x = x ?? 4
```

## 总结

ES6+ 带来的重要特性：

1. **语法改进**：let/const、箭头函数、模板字符串
2. **解构和扩展**：解构赋值、扩展运算符
3. **异步编程**：Promise、async/await
4. **模块化**：import/export
5. **新数据结构**：Set、Map、Symbol
6. **语法糖**：class、可选链、空值合并
7. **实用方法**：新的数组和对象方法

这些特性让 JavaScript 更加现代化、易用和强大。

参考资源：
- [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ES6 入门教程](https://es6.ruanyifeng.com/)
