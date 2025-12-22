---
title: Node.js 异步编程模式深度解析
date: 2024-12-13 04:22:42
categories:
  - 后端开发
tags:
  - Node.js
  - JavaScript
  - 异步编程
cover: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920
---

# Node.js 异步编程模式深度解析

Node.js 的核心特性就是异步非阻塞 I/O。本文将深入探讨 Node.js 中的各种异步编程模式及其演进历程。

## 异步编程的演进

### 1. 回调函数 (Callback)

最早期的异步处理方式。

```javascript
const fs = require('fs')

// 读取文件
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err)
    return
  }
  console.log('文件内容:', data)
})

console.log('继续执行...')
```

**回调地狱问题：**

```javascript
// 多层嵌套的回调
fs.readFile('file1.txt', 'utf8', (err1, data1) => {
  if (err1) return console.error(err1)

  fs.readFile('file2.txt', 'utf8', (err2, data2) => {
    if (err2) return console.error(err2)

    fs.readFile('file3.txt', 'utf8', (err3, data3) => {
      if (err3) return console.error(err3)

      // 处理三个文件的数据
      const result = processData(data1, data2, data3)
      console.log(result)
    })
  })
})
```

### 2. Promise

ES6 引入，解决回调地狱问题。

```javascript
const fs = require('fs').promises

// 链式调用
fs.readFile('file1.txt', 'utf8')
  .then(data1 => {
    console.log('文件1:', data1)
    return fs.readFile('file2.txt', 'utf8')
  })
  .then(data2 => {
    console.log('文件2:', data2)
    return fs.readFile('file3.txt', 'utf8')
  })
  .then(data3 => {
    console.log('文件3:', data3)
  })
  .catch(err => {
    console.error('错误:', err)
  })
```

**Promise 的核心方法：**

```javascript
// Promise.all - 所有 Promise 都成功
Promise.all([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('file2.txt', 'utf8'),
  fs.readFile('file3.txt', 'utf8')
])
  .then(([data1, data2, data3]) => {
    console.log('所有文件读取完成')
  })
  .catch(err => {
    console.error('有文件读取失败:', err)
  })

// Promise.race - 第一个完成的 Promise
Promise.race([
  fetch('https://api1.com/data'),
  fetch('https://api2.com/data')
])
  .then(response => response.json())
  .then(data => {
    console.log('最快的响应:', data)
  })

// Promise.allSettled - 等待所有 Promise 完成（无论成功失败）
Promise.allSettled([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('nonexistent.txt', 'utf8'),
  fs.readFile('file3.txt', 'utf8')
])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`文件${index + 1}成功:`, result.value)
      } else {
        console.log(`文件${index + 1}失败:`, result.reason)
      }
    })
  })

// Promise.any - 第一个成功的 Promise
Promise.any([
  fetch('https://api1.com/data'),
  fetch('https://api2.com/data'),
  fetch('https://api3.com/data')
])
  .then(response => {
    console.log('第一个成功的请求:', response)
  })
  .catch(err => {
    console.error('所有请求都失败了')
  })
```

### 3. Async/Await

ES2017 引入，让异步代码看起来像同步代码。

```javascript
const fs = require('fs').promises

async function readFiles() {
  try {
    const data1 = await fs.readFile('file1.txt', 'utf8')
    console.log('文件1:', data1)

    const data2 = await fs.readFile('file2.txt', 'utf8')
    console.log('文件2:', data2)

    const data3 = await fs.readFile('file3.txt', 'utf8')
    console.log('文件3:', data3)

    return [data1, data2, data3]
  } catch (err) {
    console.error('读取文件出错:', err)
    throw err
  }
}

// 调用
readFiles()
  .then(results => {
    console.log('所有文件读取完成')
  })
  .catch(err => {
    console.error('发生错误:', err)
  })
```

**并行执行：**

```javascript
async function readFilesParallel() {
  try {
    // 并行读取多个文件
    const [data1, data2, data3] = await Promise.all([
      fs.readFile('file1.txt', 'utf8'),
      fs.readFile('file2.txt', 'utf8'),
      fs.readFile('file3.txt', 'utf8')
    ])

    console.log('所有文件读取完成')
    return [data1, data2, data3]
  } catch (err) {
    console.error('读取文件出错:', err)
    throw err
  }
}
```

## 事件循环 (Event Loop)

理解事件循环是掌握 Node.js 异步编程的关键。

### 事件循环的阶段

```
   ┌───────────────────────────┐
┌─>│           timers          │  执行 setTimeout/setInterval 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  执行延迟到下一个循环迭代的 I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  内部使用
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │  执行 setImmediate 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  执行 close 事件回调
   └───────────────────────────┘
```

### 宏任务和微任务

```javascript
console.log('1: 同步代码')

setTimeout(() => {
  console.log('2: setTimeout (宏任务)')
}, 0)

Promise.resolve().then(() => {
  console.log('3: Promise (微任务)')
})

process.nextTick(() => {
  console.log('4: nextTick (微任务，优先级最高)')
})

console.log('5: 同步代码')

// 输出顺序:
// 1: 同步代码
// 5: 同步代码
// 4: nextTick (微任务，优先级最高)
// 3: Promise (微任务)
// 2: setTimeout (宏任务)
```

**执行顺序规则：**

1. 同步代码
2. process.nextTick
3. 微任务（Promise.then, queueMicrotask）
4. 宏任务（setTimeout, setInterval, setImmediate）

## 常见异步模式

### 1. 错误优先回调 (Error-First Callback)

Node.js 的标准回调模式。

```javascript
function readFileCallback(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      return callback(err, null)
    }
    callback(null, data)
  })
}

// 使用
readFileCallback('file.txt', (err, data) => {
  if (err) {
    return console.error('错误:', err)
  }
  console.log('数据:', data)
})
```

### 2. Promise 化 (Promisification)

将回调风格转换为 Promise 风格。

```javascript
const { promisify } = require('util')
const fs = require('fs')

// 手动 Promise 化
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// 使用 util.promisify
const readFileAsync = promisify(fs.readFile)

// 使用
async function main() {
  try {
    const data = await readFileAsync('file.txt', 'utf8')
    console.log(data)
  } catch (err) {
    console.error(err)
  }
}
```

### 3. 事件发射器 (EventEmitter)

处理多次触发的异步事件。

```javascript
const EventEmitter = require('events')

class DataProcessor extends EventEmitter {
  async process(data) {
    this.emit('start', { data })

    try {
      // 模拟处理过程
      for (let i = 0; i < data.length; i++) {
        await this.processItem(data[i])
        this.emit('progress', {
          current: i + 1,
          total: data.length,
          percentage: ((i + 1) / data.length * 100).toFixed(2)
        })
      }

      this.emit('complete', { success: true })
    } catch (err) {
      this.emit('error', err)
    }
  }

  async processItem(item) {
    // 处理单个项目
    return new Promise(resolve => setTimeout(resolve, 100))
  }
}

// 使用
const processor = new DataProcessor()

processor.on('start', (info) => {
  console.log('开始处理:', info)
})

processor.on('progress', (info) => {
  console.log(`进度: ${info.percentage}% (${info.current}/${info.total})`)
})

processor.on('complete', (info) => {
  console.log('处理完成:', info)
})

processor.on('error', (err) => {
  console.error('处理出错:', err)
})

processor.process([1, 2, 3, 4, 5])
```

### 4. Stream 流式处理

处理大文件或持续的数据流。

```javascript
const fs = require('fs')
const { Transform } = require('stream')

// 创建转换流
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
}

// 读取大文件并转换
const readStream = fs.createReadStream('large-file.txt', { encoding: 'utf8' })
const writeStream = fs.createWriteStream('output.txt')
const transformer = new UpperCaseTransform()

readStream
  .pipe(transformer)
  .pipe(writeStream)

readStream.on('data', (chunk) => {
  console.log(`读取 ${chunk.length} 字节`)
})

writeStream.on('finish', () => {
  console.log('写入完成')
})

readStream.on('error', (err) => {
  console.error('读取错误:', err)
})
```

### 5. 异步迭代器 (Async Iterator)

```javascript
// 创建异步迭代器
async function* asyncGenerator() {
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 100))
    yield i
  }
}

// 使用 for await...of
async function main() {
  for await (const value of asyncGenerator()) {
    console.log(value)
  }
}

// Stream 的异步迭代
async function readLargeFile(filename) {
  const stream = fs.createReadStream(filename, { encoding: 'utf8' })

  for await (const chunk of stream) {
    console.log('读取块:', chunk.length)
    // 处理每个块
  }
}
```

## 错误处理最佳实践

### 1. try-catch 与 async/await

```javascript
async function safeOperation() {
  try {
    const result = await riskyOperation()
    return result
  } catch (err) {
    // 记录错误
    console.error('操作失败:', err)
    // 可以重新抛出或返回默认值
    throw new Error('操作失败，请稍后重试')
  }
}
```

### 2. Promise 错误处理

```javascript
// ✅ 好的做法
someAsyncOperation()
  .then(result => processResult(result))
  .catch(err => handleError(err))

// ❌ 避免未捕获的 Promise 拒绝
someAsyncOperation()
  .then(result => processResult(result))
// 缺少 .catch()

// 全局处理未捕获的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
  // 记录日志、发送告警等
})
```

### 3. 优雅的错误包装

```javascript
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

async function getUserData(userId) {
  try {
    const user = await db.findUser(userId)
    if (!user) {
      throw new AppError('用户不存在', 404)
    }
    return user
  } catch (err) {
    if (err.isOperational) {
      throw err
    }
    // 未预期的错误
    throw new AppError('获取用户数据失败', 500, false)
  }
}
```

## 性能优化技巧

### 1. 避免阻塞事件循环

```javascript
// ❌ 坏例子：阻塞事件循环
function blockingOperation() {
  const start = Date.now()
  while (Date.now() - start < 5000) {
    // 阻塞 5 秒
  }
  return 'done'
}

// ✅ 好例子：使用异步操作
async function nonBlockingOperation() {
  await new Promise(resolve => setTimeout(resolve, 5000))
  return 'done'
}

// ✅ 对于 CPU 密集型任务，使用 Worker Threads
const { Worker } = require('worker_threads')

function runHeavyComputation(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./heavy-computation.js', {
      workerData: data
    })
    worker.on('message', resolve)
    worker.on('error', reject)
  })
}
```

### 2. 批量处理

```javascript
// 批量处理数据
async function processBatch(items, batchSize = 10) {
  const results = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    )
    results.push(...batchResults)

    // 给事件循环一些喘息时间
    await new Promise(resolve => setImmediate(resolve))
  }

  return results
}
```

### 3. 限流和并发控制

```javascript
class PromisePool {
  constructor(concurrency) {
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  async add(promiseFunction) {
    while (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve))
    }

    this.running++

    try {
      return await promiseFunction()
    } finally {
      this.running--
      const resolve = this.queue.shift()
      if (resolve) resolve()
    }
  }
}

// 使用
const pool = new PromisePool(5) // 最多 5 个并发

const tasks = urls.map(url =>
  pool.add(() => fetch(url))
)

const results = await Promise.all(tasks)
```

## 总结

Node.js 异步编程的关键点：

1. **理解事件循环**：宏任务、微任务的执行顺序
2. **选择合适的模式**：Callback → Promise → Async/Await
3. **正确处理错误**：try-catch、Promise.catch、错误事件
4. **性能优化**：避免阻塞、批量处理、并发控制
5. **使用现代特性**：Async Iterator、Stream、Worker Threads

掌握这些模式和技巧，能够编写出高效、可维护的 Node.js 异步代码。

参考资源：
- [Node.js 官方文档](https://nodejs.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
