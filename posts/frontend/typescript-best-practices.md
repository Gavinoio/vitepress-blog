---
title: TypeScript 最佳实践与编码规范
date: 2024-12-14
categories:
  - 前端开发
tags:
  - TypeScript
  - 最佳实践
  - 编码规范
---

# TypeScript 最佳实践与编码规范

TypeScript 为 JavaScript 带来了强大的类型系统，但要充分发挥其优势，需要遵循一些最佳实践。

## 1. 类型定义优先于类型推断

虽然 TypeScript 有强大的类型推断，但显式声明类型可以提高代码可读性。

```typescript
// ❌ 不够明确
function processUser(user) {
  return user.name.toUpperCase();
}

// ✅ 类型清晰
interface User {
  id: number;
  name: string;
  email: string;
}

function processUser(user: User): string {
  return user.name.toUpperCase();
}
```

## 2. 使用 interface 而非 type（除非必要）

对于对象类型，优先使用 `interface`，因为它支持声明合并且错误提示更友好。

```typescript
// ✅ 推荐使用 interface
interface User {
  id: number;
  name: string;
}

interface User {
  age?: number; // 声明合并
}

// 仅在需要联合类型、交叉类型等时使用 type
type Status = 'pending' | 'success' | 'error';
type Result<T> = { data: T } | { error: string };
```

## 3. 善用联合类型和类型守卫

```typescript
type Success = { status: 'success'; data: any };
type Error = { status: 'error'; message: string };
type Loading = { status: 'loading' };

type ApiResponse = Success | Error | Loading;

function handleResponse(response: ApiResponse) {
  // 类型守卫
  if (response.status === 'success') {
    console.log(response.data); // TypeScript 知道这里有 data
  } else if (response.status === 'error') {
    console.error(response.message); // TypeScript 知道这里有 message
  } else {
    console.log('加载中...');
  }
}

// 自定义类型守卫
function isError(response: ApiResponse): response is Error {
  return response.status === 'error';
}

if (isError(response)) {
  console.error(response.message);
}
```

## 4. 使用 readonly 保护数据

```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

const config: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};

// config.apiUrl = 'https://new-api.com'; // ❌ 错误：无法分配到 "apiUrl" ，因为它是只读属性

// 对于数组
const numbers: readonly number[] = [1, 2, 3];
// numbers.push(4); // ❌ 错误：类型"readonly number[]"上不存在属性"push"

// 使用 ReadonlyArray
const items: ReadonlyArray<string> = ['a', 'b', 'c'];
```

## 5. 使用严格的 null 检查

在 `tsconfig.json` 中启用 `strictNullChecks`：

```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

```typescript
interface User {
  name: string;
  email?: string; // 可选属性
}

function sendEmail(user: User) {
  // ❌ 错误：对象可能为 "undefined"
  // user.email.toLowerCase();

  // ✅ 正确：使用可选链
  user.email?.toLowerCase();

  // ✅ 正确：使用类型守卫
  if (user.email) {
    user.email.toLowerCase();
  }

  // ✅ 正确：使用空值合并
  const email = user.email ?? 'default@example.com';
}
```

## 6. 泛型的正确使用

```typescript
// 基础泛型
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);
const str = identity('hello'); // 类型推断

// 约束泛型
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): void {
  console.log(arg.length);
}

logLength('hello'); // ✅
logLength([1, 2, 3]); // ✅
// logLength(123); // ❌ 错误：类型"number"的参数不能赋给类型"HasLength"的参数

// 泛型工具类型
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 实际应用
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type PartialUser = Partial<User>; // 所有属性可选
type UserPreview = Pick<User, 'id' | 'name'>; // 只选择某些属性
```

## 7. 使用映射类型

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 将所有属性变为可选
type PartialResponse<T> = {
  [P in keyof ApiResponse<T>]?: ApiResponse<T>[P];
};

// 将所有属性变为只读
type ReadonlyResponse<T> = {
  readonly [P in keyof ApiResponse<T>]: ApiResponse<T>[P];
};

// 实用工具类型
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  name: string;
  age: number;
}

type NullableUser = Nullable<User>;
// 等同于
// {
//   name: string | null;
//   age: number | null;
// }
```

## 8. 条件类型的高级用法

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

// 实用的条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type ExtractString<T> = T extends string ? T : never;
type OnlyStrings = ExtractString<string | number | boolean>; // string

// infer 关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { name: 'John', age: 30 };
}

type User = ReturnType<typeof getUser>; // { name: string; age: number; }

// 提取 Promise 的值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Result = UnwrapPromise<Promise<string>>; // string
```

## 9. 正确处理函数重载

```typescript
// 函数重载
function createElement(tag: 'div'): HTMLDivElement;
function createElement(tag: 'span'): HTMLSpanElement;
function createElement(tag: 'button'): HTMLButtonElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const div = createElement('div'); // 类型为 HTMLDivElement
const span = createElement('span'); // 类型为 HTMLSpanElement

// 更灵活的方式：使用泛型
interface ElementMap {
  div: HTMLDivElement;
  span: HTMLSpanElement;
  button: HTMLButtonElement;
}

function createElementGeneric<K extends keyof ElementMap>(tag: K): ElementMap[K] {
  return document.createElement(tag) as ElementMap[K];
}
```

## 10. 使用 const assertions

```typescript
// 不使用 const assertion
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
};
// config 的类型为 { api: string; timeout: number; }

// 使用 const assertion
const configConst = {
  api: 'https://api.example.com',
  timeout: 5000,
} as const;
// configConst 的类型为 { readonly api: "https://api.example.com"; readonly timeout: 5000; }

// 对数组使用
const colors = ['red', 'green', 'blue'] as const;
// colors 的类型为 readonly ["red", "green", "blue"]

type Color = typeof colors[number]; // "red" | "green" | "blue"
```

## 11. 模块声明和命名空间

```typescript
// 为第三方库添加类型声明
declare module 'my-library' {
  export function doSomething(value: string): void;
}

// 扩展全局类型
declare global {
  interface Window {
    myCustomProperty: string;
  }
}

// 使用命名空间组织代码
namespace Utils {
  export namespace String {
    export function capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }

  export namespace Array {
    export function unique<T>(arr: T[]): T[] {
      return [...new Set(arr)];
    }
  }
}

Utils.String.capitalize('hello');
Utils.Array.unique([1, 2, 2, 3]);
```

## 12. 装饰器（实验性功能）

```typescript
// 启用装饰器：tsconfig.json 中设置 "experimentalDecorators": true

// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}

// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    return originalMethod.apply(this, args);
  };
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## 13. tsconfig.json 最佳配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 总结

TypeScript 的最佳实践包括：

1. **显式类型声明**：提高代码可读性
2. **严格模式**：启用所有严格检查
3. **善用类型系统**：联合类型、交叉类型、泛型等
4. **类型守卫**：确保类型安全
5. **只读属性**：保护数据不被修改
6. **高级类型**：映射类型、条件类型等
7. **合理配置**：使用严格的 tsconfig.json

遵循这些实践，可以充分发挥 TypeScript 的优势，编写更安全、更易维护的代码。
