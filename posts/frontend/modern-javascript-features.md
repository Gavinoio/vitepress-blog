---
title: 现代 JavaScript 必备特性与实用技巧
date: 2024-12-11
categories:
  - 前端开发
tags:
  - JavaScript
  - ES6+
  - 编程技巧
---

# 现代 JavaScript 必备特性与实用技巧

本文汇总了从 ES6 到最新 ECMAScript 标准中最实用的 JavaScript 特性和编程技巧。

## 1. 解构赋值的高级用法

### 数组解构

```javascript
// 基础解构
const [a, b, c] = [1, 2, 3];

// 跳过元素
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1, 3

// 剩余参数
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

// 默认值
const [x = 1, y = 2] = [10];
console.log(x, y); // 10, 2

// 交换变量
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1

// 嵌套解构
const [a, [b, c]] = [1, [2, 3]];
```

### 对象解构

```javascript
// 基础解构
const { name, age } = { name: 'John', age: 30 };

// 重命名
const { name: userName, age: userAge } = { name: 'John', age: 30 };

// 默认值
const { name = 'Anonymous', age = 0 } = {};

// 剩余属性
const { name, ...rest } = { name: 'John', age: 30, city: 'NY' };
console.log(rest); // { age: 30, city: 'NY' }

// 嵌套解构
const user = {
  name: 'John',
  address: {
    city: 'New York',
    zip: '10001'
  }
};
const { address: { city, zip } } = user;

// 函数参数解构
function greet({ name, age = 18 }) {
  console.log(`Hello ${name}, you are ${age}`);
}
greet({ name: 'John' }); // Hello John, you are 18
```

## 2. 扩展运算符和剩余参数

```javascript
// 数组操作
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// 合并数组
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// 复制数组（浅拷贝）
const copy = [...arr1];

// 数组转换
const str = 'hello';
const chars = [...str]; // ['h', 'e', 'l', 'l', 'o']

// 找出最大值/最小值
const numbers = [1, 5, 3, 9, 2];
Math.max(...numbers); // 9
Math.min(...numbers); // 1

// 对象操作
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

// 合并对象
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// 浅拷贝对象
const copy = { ...obj1 };

// 覆盖属性
const updated = { ...obj1, b: 20 }; // { a: 1, b: 20 }

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4); // 10
```

## 3. 模板字符串

```javascript
// 基础用法
const name = 'John';
const age = 30;
console.log(`My name is ${name} and I'm ${age} years old`);

// 多行字符串
const html = `
  <div>
    <h1>${name}</h1>
    <p>Age: ${age}</p>
  </div>
`;

// 表达式
const price = 100;
const tax = 0.1;
console.log(`Total: $${price * (1 + tax)}`); // Total: $110

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return `${result}${str}<strong>${values[i] || ''}</strong>`;
  }, '');
}

const name = 'John';
const age = 30;
const result = highlight`Name: ${name}, Age: ${age}`;
// "Name: <strong>John</strong>, Age: <strong>30</strong>"
```

## 4. 箭头函数

```javascript
// 基础语法
const add = (a, b) => a + b;

// 单参数可省略括号
const square = x => x * x;

// 无参数需要括号
const greet = () => console.log('Hello');

// 返回对象需要括号
const createUser = (name, age) => ({ name, age });

// 多行函数体需要 return
const sum = (a, b) => {
  const result = a + b;
  return result;
};

// this 绑定
class Counter {
  constructor() {
    this.count = 0;
  }

  // ❌ 传统函数，this 指向会改变
  incrementBad() {
    setTimeout(function() {
      this.count++; // this 指向 window
    }, 1000);
  }

  // ✅ 箭头函数，this 指向 Counter 实例
  incrementGood() {
    setTimeout(() => {
      this.count++; // this 指向 Counter 实例
    }, 1000);
  }
}

// 不适合使用箭头函数的场景
const obj = {
  value: 100,
  // ❌ 箭头函数没有自己的 this
  getValue: () => this.value, // undefined

  // ✅ 使用普通函数
  getValueCorrect() {
    return this.value; // 100
  }
};
```

## 5. Promise 和 async/await

```javascript
// Promise 基础
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5;
      if (success) {
        resolve({ data: 'Success' });
      } else {
        reject(new Error('Failed'));
      }
    }, 1000);
  });
};

// Promise 链
fetchData()
  .then(result => {
    console.log(result);
    return fetchData();
  })
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('Completed');
  });

// async/await
async function getData() {
  try {
    const result = await fetchData();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

// 并行请求
async function getMultipleData() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  return { user, posts, comments };
}

// Promise.allSettled - 等待所有 Promise 完成（无论成功失败）
const results = await Promise.allSettled([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);

// Promise.race - 返回最快完成的 Promise
const fastest = await Promise.race([
  fetch('/api/server1'),
  fetch('/api/server2'),
  fetch('/api/server3')
]);

// Promise.any - 返回第一个成功的 Promise
const firstSuccess = await Promise.any([
  fetch('/api/server1'),
  fetch('/api/server2')
]);
```

## 6. 可选链和空值合并

```javascript
// 可选链 (?.)
const user = {
  name: 'John',
  address: {
    city: 'New York'
  }
};

// ❌ 传统方式
const zip = user && user.address && user.address.zip;

// ✅ 可选链
const zip = user?.address?.zip; // undefined

// 方法调用
user.getAge?.(); // 如果 getAge 存在则调用

// 数组访问
const firstItem = arr?.[0];

// 空值合并 (??)
const value1 = null ?? 'default'; // 'default'
const value2 = undefined ?? 'default'; // 'default'
const value3 = 0 ?? 'default'; // 0
const value4 = '' ?? 'default'; // ''
const value5 = false ?? 'default'; // false

// 与 || 的区别
const a = 0 || 'default'; // 'default'
const b = 0 ?? 'default'; // 0

// 组合使用
const username = user?.name ?? 'Anonymous';

// 赋值时使用
let config = {};
config.theme ??= 'light'; // 如果 theme 为 null/undefined 则设置为 'light'
```

## 7. 数组方法

```javascript
const numbers = [1, 2, 3, 4, 5];

// map - 转换数组
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]

// filter - 过滤数组
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// reduce - 归约数组
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15

// find - 查找元素
const found = numbers.find(n => n > 3); // 4

// findIndex - 查找索引
const index = numbers.findIndex(n => n > 3); // 3

// some - 是否有元素满足条件
const hasEven = numbers.some(n => n % 2 === 0); // true

// every - 是否所有元素满足条件
const allPositive = numbers.every(n => n > 0); // true

// flat - 展平数组
const nested = [1, [2, 3], [4, [5, 6]]];
nested.flat(); // [1, 2, 3, 4, [5, 6]]
nested.flat(2); // [1, 2, 3, 4, 5, 6]

// flatMap - map + flat
const words = ['hello', 'world'];
words.flatMap(word => word.split('')); // ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']

// at - 支持负索引
const arr = [1, 2, 3, 4, 5];
arr.at(-1); // 5
arr.at(-2); // 4

// 链式调用
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .reduce((acc, n) => acc + n, 0); // 12
```

## 8. 对象方法

```javascript
const obj = { a: 1, b: 2, c: 3 };

// Object.keys - 获取所有键
Object.keys(obj); // ['a', 'b', 'c']

// Object.values - 获取所有值
Object.values(obj); // [1, 2, 3]

// Object.entries - 获取键值对数组
Object.entries(obj); // [['a', 1], ['b', 2], ['c', 3]]

// Object.fromEntries - 从键值对数组创建对象
const entries = [['a', 1], ['b', 2]];
Object.fromEntries(entries); // { a: 1, b: 2 }

// 转换对象
const doubled = Object.fromEntries(
  Object.entries(obj).map(([key, value]) => [key, value * 2])
); // { a: 2, b: 4, c: 6 }

// Object.assign - 合并对象
const merged = Object.assign({}, obj, { d: 4 }); // { a: 1, b: 2, c: 3, d: 4 }

// Object.freeze - 冻结对象
const frozen = Object.freeze({ a: 1 });
// frozen.a = 2; // 无效

// Object.seal - 密封对象（可修改现有属性，不可添加删除）
const sealed = Object.seal({ a: 1 });
sealed.a = 2; // ✅
// sealed.b = 3; // ❌

// Object.hasOwn - 检查对象是否有自己的属性
Object.hasOwn(obj, 'a'); // true
```

## 9. 模块化

```javascript
// 导出
// utils.js
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
export default class Calculator {
  // ...
}

// 导入
// main.js
import Calculator, { PI, add } from './utils.js';
import * as utils from './utils.js';
import { add as sum } from './utils.js'; // 重命名

// 动态导入
async function loadModule() {
  const module = await import('./utils.js');
  module.add(1, 2);
}

// 条件导入
if (condition) {
  const { feature } = await import('./feature.js');
}
```

## 10. 类

```javascript
// 基础类
class Person {
  // 公共字段
  name = 'Anonymous';

  // 私有字段
  #age = 0;

  // 静态属性
  static species = 'Homo sapiens';

  constructor(name, age) {
    this.name = name;
    this.#age = age;
  }

  // 方法
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }

  // Getter
  get age() {
    return this.#age;
  }

  // Setter
  set age(value) {
    if (value >= 0) {
      this.#age = value;
    }
  }

  // 静态方法
  static create(name, age) {
    return new Person(name, age);
  }

  // 私有方法
  #privateMethod() {
    console.log('This is private');
  }
}

// 继承
class Student extends Person {
  #grade;

  constructor(name, age, grade) {
    super(name, age);
    this.#grade = grade;
  }

  // 重写方法
  greet() {
    super.greet();
    console.log(`I'm in grade ${this.#grade}`);
  }
}

const student = new Student('John', 18, 12);
student.greet();
```

## 11. 实用技巧

### 短路求值

```javascript
// && 短路
const user = getUser() && getUser().name;

// || 默认值
const name = userName || 'Anonymous';

// ?? 空值合并（更精确）
const count = userCount ?? 0;
```

### 条件对象属性

```javascript
const includeAge = true;
const user = {
  name: 'John',
  ...(includeAge && { age: 30 })
};
```

### 数组去重

```javascript
const unique = [...new Set([1, 2, 2, 3, 3, 4])]; // [1, 2, 3, 4]
```

### 对象深拷贝

```javascript
// 简单深拷贝（不支持函数、循环引用等）
const copy = JSON.parse(JSON.stringify(obj));

// 使用 structuredClone（现代浏览器）
const copy = structuredClone(obj);
```

## 总结

现代 JavaScript 提供了丰富的特性：

1. **解构和扩展运算符**：简化数据操作
2. **箭头函数**：更简洁的函数语法
3. **Promise/async-await**：优雅的异步处理
4. **可选链和空值合并**：安全的属性访问
5. **数组和对象方法**：强大的数据处理能力
6. **模块化**：更好的代码组织
7. **类**：面向对象编程

掌握这些特性，能够编写更简洁、更易维护的现代 JavaScript 代码。
