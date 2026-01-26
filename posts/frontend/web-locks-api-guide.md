---
title: 深入理解 Web Locks API：浏览器原生的资源锁定机制
date: 2025-09-05 14:00:00
description: 深入讲解 Web Locks API 的工作原理和使用方法，包括独占锁、共享锁、锁的生命周期、实战应用场景等，帮助你在浏览器中实现可靠的并发控制。
keywords:
  - Web Locks API
  - 并发控制
  - 浏览器 API
  - 资源锁定
  - JavaScript
categories:
  - 前端开发
tags:
  - Web API
  - JavaScript
  - 并发控制
  - 浏览器原生 API
cover: https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920
---

# 深入理解 Web Locks API：浏览器原生的资源锁定机制

在现代 Web 应用中，尤其是使用了 Service Worker、SharedWorker 或多个标签页的场景下，如何协调不同上下文之间的资源访问成为一个重要问题。Web Locks API 作为浏览器原生提供的资源锁定机制，为我们解决并发控制问题提供了优雅的解决方案。

## 什么是 Web Locks API？

Web Locks API 允许一个脚本异步获取一个锁，持有该锁直到工作完成，然后释放它。在持有锁期间，其他想要获取同名锁的脚本必须等待。这提供了一种在不同执行上下文（如标签页、Worker）之间协调资源访问的机制。

### 核心概念

```javascript
// 基本使用示例
await navigator.locks.request('my_resource', async lock => {
  // 获取到锁后执行的代码
  // 在这个回调函数内，我们独占访问 'my_resource'
  await doSomethingWithResource();
  // 函数返回时自动释放锁
});
```

**关键特性：**

1. **异步获取**：锁的获取是异步的，不会阻塞主线程
2. **自动释放**：回调函数执行完毕后自动释放锁
3. **跨上下文**：可以在标签页、Worker、Service Worker 之间共享
4. **支持共享锁**：除了独占锁，还支持多个持有者的共享锁

## API 详解

### 1. 基本方法：`navigator.locks.request()`

```javascript
navigator.locks.request(name, options, callback)
navigator.locks.request(name, callback)
```

**参数说明：**

- `name`：锁的名称（字符串），相同名称的锁会互斥
- `options`（可选）：配置对象
- `callback`：获取锁后执行的回调函数

```javascript
// 最简单的用法
await navigator.locks.request('resource_1', async lock => {
  console.log('获取到锁');
  await performTask();
  console.log('任务完成，即将释放锁');
});

// 带选项的用法
await navigator.locks.request('resource_2', {
  mode: 'exclusive',      // 独占模式（默认）
  ifAvailable: false,     // 如果锁不可用是否立即返回
  steal: false,           // 是否抢占现有锁
  signal: abortSignal     // AbortSignal 用于取消请求
}, async lock => {
  // 处理逻辑
});
```

### 2. 查询锁状态：`navigator.locks.query()`

```javascript
const state = await navigator.locks.query();
console.log(state);
```

**返回对象结构：**

```javascript
{
  held: [
    {
      name: 'resource_1',
      mode: 'exclusive',
      clientId: 'abc123...'
    }
  ],
  pending: [
    {
      name: 'resource_1',
      mode: 'exclusive',
      clientId: 'def456...'
    }
  ]
}
```

- `held`：当前持有的锁列表
- `pending`：等待中的锁请求列表

### 3. 锁的模式

#### 独占锁（Exclusive Lock）

```javascript
// 默认就是独占模式
await navigator.locks.request('my_db', async lock => {
  // 只有一个上下文可以同时持有这个锁
  const data = await readFromDB();
  await processData(data);
  await writeToDB(data);
});
```

**特性：**
- 同一时间只能有一个持有者
- 适用于读写操作
- 阻塞其他所有请求（包括共享锁）

#### 共享锁（Shared Lock）

```javascript
// 使用共享模式
await navigator.locks.request('my_db', { mode: 'shared' }, async lock => {
  // 多个上下文可以同时持有共享锁
  const data = await readFromDB();
  console.log(data);
  // 只读操作，不修改数据
});
```

**特性：**
- 多个共享锁可以同时存在
- 适用于只读操作
- 会被独占锁阻塞

**共享锁与独占锁的关系：**

```javascript
// 场景演示
// 标签页 1: 持有共享锁
navigator.locks.request('resource', { mode: 'shared' }, async lock => {
  console.log('标签页 1 获取共享锁');
  await delay(5000);
});

// 标签页 2: 也能获取共享锁（不会等待）
navigator.locks.request('resource', { mode: 'shared' }, async lock => {
  console.log('标签页 2 获取共享锁');
  await delay(3000);
});

// 标签页 3: 请求独占锁（必须等待所有共享锁释放）
navigator.locks.request('resource', { mode: 'exclusive' }, async lock => {
  console.log('标签页 3 获取独占锁');
  await writeData();
});
```

## 实际应用场景

### 场景 1：防止多标签页重复提交

```javascript
// 在多个标签页打开同一页面时，防止重复提交表单
async function submitForm(formData) {
  try {
    await navigator.locks.request('form_submission', {
      ifAvailable: true  // 如果锁不可用，立即返回 null
    }, async lock => {
      if (!lock) {
        console.log('另一个标签页正在提交，跳过');
        showMessage('请求正在处理中，请勿重复提交');
        return;
      }

      // 执行提交
      console.log('开始提交表单');
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('提交成功', result);
      showMessage('提交成功');
    });
  } catch (error) {
    console.error('提交失败', error);
    showMessage('提交失败，请重试');
  }
}

// 辅助函数
function showMessage(msg) {
  alert(msg);
}
```

### 场景 2：IndexedDB 的并发控制

```javascript
class DatabaseManager {
  constructor(dbName) {
    this.dbName = dbName;
    this.lockName = `db_lock_${dbName}`;
  }

  // 读取数据（使用共享锁）
  async read(storeName, key) {
    return navigator.locks.request(this.lockName, {
      mode: 'shared'
    }, async lock => {
      const db = await this.openDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const result = await store.get(key);
      return result;
    });
  }

  // 写入数据（使用独占锁）
  async write(storeName, data) {
    return navigator.locks.request(this.lockName, {
      mode: 'exclusive'
    }, async lock => {
      const db = await this.openDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.put(data);
      await tx.complete;
      console.log('写入成功');
    });
  }

  // 批量操作（独占锁，确保原子性）
  async batchUpdate(storeName, operations) {
    return navigator.locks.request(this.lockName, {
      mode: 'exclusive'
    }, async lock => {
      const db = await this.openDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      for (const op of operations) {
        if (op.type === 'add') {
          await store.add(op.data);
        } else if (op.type === 'update') {
          await store.put(op.data);
        } else if (op.type === 'delete') {
          await store.delete(op.key);
        }
      }

      await tx.complete;
      console.log(`批量操作完成: ${operations.length} 条`);
    });
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 使用示例
const dbManager = new DatabaseManager('myApp');

// 多个标签页可以同时读取
await dbManager.read('users', 'user123');

// 只有一个标签页可以写入
await dbManager.write('users', { id: 'user123', name: 'John' });
```

### 场景 3：Service Worker 更新控制

```javascript
// 在 Service Worker 中控制更新流程
// sw.js
self.addEventListener('install', event => {
  event.waitUntil(
    navigator.locks.request('sw_update', async lock => {
      console.log('开始安装新版本 Service Worker');

      // 缓存新资源
      const cache = await caches.open('v2');
      await cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
        '/app.js'
      ]);

      console.log('新版本资源缓存完成');
      await self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    navigator.locks.request('sw_update', async lock => {
      console.log('激活新版本 Service Worker');

      // 清理旧缓存
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== 'v2')
          .map(name => caches.delete(name))
      );

      console.log('旧版本缓存已清理');
      await self.clients.claim();
    })
  );
});
```

### 场景 4：定时任务的单实例运行

```javascript
// 确保定时任务在多个标签页中只运行一次
class SingletonTask {
  constructor(taskName, interval) {
    this.taskName = taskName;
    this.interval = interval;
    this.lockName = `task_${taskName}`;
  }

  async start() {
    // 尝试获取锁并执行任务
    const runTask = async () => {
      try {
        await navigator.locks.request(this.lockName, {
          ifAvailable: true  // 如果锁不可用，说明其他标签页在运行
        }, async lock => {
          if (!lock) {
            console.log(`任务 ${this.taskName} 正在其他标签页运行`);
            return;
          }

          console.log(`开始执行任务: ${this.taskName}`);
          await this.execute();
          console.log(`任务完成: ${this.taskName}`);
        });
      } catch (error) {
        console.error(`任务执行失败: ${this.taskName}`, error);
      }
    };

    // 立即执行一次
    await runTask();

    // 设置定时执行
    this.timerId = setInterval(runTask, this.interval);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      console.log(`停止任务: ${this.taskName}`);
    }
  }

  async execute() {
    // 子类实现具体任务逻辑
    throw new Error('Must implement execute method');
  }
}

// 使用示例：数据同步任务
class DataSyncTask extends SingletonTask {
  constructor() {
    super('data_sync', 60000);  // 每分钟执行一次
  }

  async execute() {
    console.log('开始同步数据...');

    // 从服务器获取最新数据
    const response = await fetch('/api/sync');
    const data = await response.json();

    // 更新本地数据
    await updateLocalData(data);

    console.log('数据同步完成');
  }
}

// 在每个标签页启动任务
const syncTask = new DataSyncTask();
syncTask.start();

// 页面卸载时停止
window.addEventListener('beforeunload', () => {
  syncTask.stop();
});
```

### 场景 5：资源下载队列控制

```javascript
// 限制同时下载的资源数量
class DownloadManager {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.lockPrefix = 'download_slot_';
  }

  async download(url, filename) {
    // 尝试获取一个下载槽位
    const slot = await this.acquireSlot();

    try {
      console.log(`开始下载 [槽位 ${slot}]: ${filename}`);

      const response = await fetch(url);
      const blob = await response.blob();

      // 保存文件
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();

      console.log(`下载完成 [槽位 ${slot}]: ${filename}`);
    } finally {
      // 释放槽位在 request 回调结束时自动完成
    }
  }

  async acquireSlot() {
    // 尝试获取任一可用槽位
    for (let i = 0; i < this.maxConcurrent; i++) {
      const lockName = `${this.lockPrefix}${i}`;

      const acquired = await new Promise(resolve => {
        navigator.locks.request(lockName, {
          ifAvailable: true
        }, lock => {
          if (lock) {
            // 获取到锁，保持持有直到下载完成
            return new Promise(release => {
              // 返回槽位编号和释放函数
              resolve({ slot: i, release });
            });
          }
          resolve(null);
        });
      });

      if (acquired) {
        return acquired.slot;
      }
    }

    // 所有槽位都被占用，等待第一个可用的
    return new Promise(resolve => {
      const tryAcquire = async () => {
        for (let i = 0; i < this.maxConcurrent; i++) {
          const lockName = `${this.lockPrefix}${i}`;

          await navigator.locks.request(lockName, async lock => {
            resolve(i);
            // 锁会在下载完成后释放
          });
        }
      };

      tryAcquire();
    });
  }
}

// 更优雅的实现
class DownloadQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async download(url, filename) {
    // 使用槽位锁
    const slotIndex = Math.floor(Math.random() * this.maxConcurrent);
    const lockName = `download_slot_${slotIndex}`;

    await navigator.locks.request(lockName, async lock => {
      console.log(`[槽位 ${slotIndex}] 开始下载: ${filename}`);

      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      console.log(`[槽位 ${slotIndex}] 完成下载: ${filename}`);

      // 模拟下载时间
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  }

  async downloadBatch(files) {
    // 并发下载，但受限于最大并发数
    await Promise.all(
      files.map(({ url, filename }) => this.download(url, filename))
    );
  }
}

// 使用示例
const queue = new DownloadQueue(3);

// 批量下载 10 个文件，但最多同时下载 3 个
queue.downloadBatch([
  { url: '/files/1.pdf', filename: 'file1.pdf' },
  { url: '/files/2.pdf', filename: 'file2.pdf' },
  { url: '/files/3.pdf', filename: 'file3.pdf' },
  { url: '/files/4.pdf', filename: 'file4.pdf' },
  { url: '/files/5.pdf', filename: 'file5.pdf' },
  // ... 更多文件
]);
```

## 高级用法

### 1. 使用 AbortSignal 取消锁请求

```javascript
const controller = new AbortController();

// 设置 5 秒超时
setTimeout(() => controller.abort(), 5000);

try {
  await navigator.locks.request('my_resource', {
    signal: controller.signal
  }, async lock => {
    // 如果 5 秒内没有获取到锁，这里不会执行
    await doLongRunningTask();
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('锁请求被取消');
  }
}
```

### 2. 锁的抢占（Steal）

```javascript
// 抢占现有的锁（慎用！）
await navigator.locks.request('resource', {
  steal: true  // 强制释放其他持有者的锁
}, async lock => {
  console.log('已抢占锁');
  await emergencyOperation();
});
```

⚠️ **警告：** `steal` 选项会强制释放其他上下文持有的锁，可能导致数据不一致。只在紧急情况下使用。

### 3. 非阻塞尝试获取锁

```javascript
// 尝试获取锁，如果不可用立即返回
const result = await navigator.locks.request('resource', {
  ifAvailable: true
}, async lock => {
  if (!lock) {
    return { success: false, message: '资源被占用' };
  }

  await performTask();
  return { success: true };
});

console.log(result);
```

### 4. 监控锁状态

```javascript
// 实时监控锁的使用情况
async function monitorLocks() {
  const state = await navigator.locks.query();

  console.log('=== 当前锁状态 ===');
  console.log(`持有的锁: ${state.held.length}`);
  state.held.forEach(lock => {
    console.log(`  - ${lock.name} (${lock.mode}) [${lock.clientId}]`);
  });

  console.log(`等待的锁: ${state.pending.length}`);
  state.pending.forEach(lock => {
    console.log(`  - ${lock.name} (${lock.mode}) [${lock.clientId}]`);
  });
}

// 每秒检查一次
setInterval(monitorLocks, 1000);
```

### 5. 锁的超时处理

```javascript
// 实现锁的超时机制
async function requestWithTimeout(lockName, callback, timeout = 5000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    return await navigator.locks.request(lockName, {
      signal: controller.signal
    }, async lock => {
      clearTimeout(timeoutId);
      return await callback(lock);
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`获取锁超时: ${lockName}`);
    }
    throw error;
  }
}

// 使用
try {
  await requestWithTimeout('my_resource', async lock => {
    await doWork();
  }, 3000);
} catch (error) {
  console.error('操作失败:', error.message);
}
```

## 与其他方案的对比

### Web Locks API vs LocalStorage

```javascript
// ❌ 使用 LocalStorage 实现锁（不推荐）
function acquireLockViaStorage(name) {
  const lockKey = `lock_${name}`;
  const lockValue = Date.now().toString();

  // 问题：不是原子操作，可能有竞态条件
  if (!localStorage.getItem(lockKey)) {
    localStorage.setItem(lockKey, lockValue);
    return true;
  }
  return false;
}

// ✅ 使用 Web Locks API（推荐）
await navigator.locks.request(name, async lock => {
  // 原子操作，无竞态条件
  await doWork();
});
```

**Web Locks API 的优势：**
- 原子性保证
- 跨上下文支持（Worker、标签页）
- 自动清理（标签页关闭时释放锁）
- 支持共享锁和独占锁
- 内置等待队列

### Web Locks API vs BroadcastChannel

```javascript
// BroadcastChannel：用于通信，不提供锁机制
const channel = new BroadcastChannel('my_channel');
channel.postMessage({ type: 'REQUEST_PERMISSION' });
channel.onmessage = (event) => {
  if (event.data.type === 'PERMISSION_GRANTED') {
    // 没有保证互斥访问
    doWork();
  }
};

// Web Locks API：原生锁机制
await navigator.locks.request('resource', async lock => {
  // 保证互斥访问
  await doWork();
});
```

**适用场景：**
- **BroadcastChannel**：跨标签页通信
- **Web Locks API**：跨上下文资源同步

## 最佳实践

### 1. 合理命名锁

```javascript
// ❌ 不好的命名
await navigator.locks.request('lock1', async lock => {
  // 难以理解锁的用途
});

// ✅ 好的命名
await navigator.locks.request('database:users:write', async lock => {
  // 清晰表明：数据库 users 表的写入锁
});

await navigator.locks.request('sync:calendar:events', async lock => {
  // 清晰表明：日历事件同步锁
});
```

### 2. 避免长时间持有锁

```javascript
// ❌ 长时间持有锁
await navigator.locks.request('resource', async lock => {
  await longRunningTask();  // 可能耗时几分钟
  await anotherTask();
  await yetAnotherTask();
});

// ✅ 分段获取锁
await navigator.locks.request('resource', async lock => {
  await criticalTask();  // 只锁定关键操作
});

await nonCriticalTask();  // 不需要锁的操作

await navigator.locks.request('resource', async lock => {
  await anotherCriticalTask();
});
```

### 3. 处理锁超时

```javascript
// ✅ 始终设置合理的超时
async function safeRequest(lockName, callback, options = {}) {
  const timeout = options.timeout || 10000;
  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await navigator.locks.request(lockName, {
      ...options,
      signal: controller.signal
    }, callback);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`锁请求超时: ${lockName}`);
      throw new Error('操作超时，请稍后重试');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
```

### 4. 错误处理

```javascript
// ✅ 完善的错误处理
async function performDatabaseOperation() {
  try {
    await navigator.locks.request('db:write', async lock => {
      try {
        await writeToDatabase();
      } catch (dbError) {
        console.error('数据库操作失败', dbError);
        await rollback();
        throw dbError;
      }
    });
  } catch (lockError) {
    if (lockError.name === 'AbortError') {
      console.error('获取锁超时');
    } else {
      console.error('操作失败', lockError);
    }
    throw lockError;
  }
}
```

### 5. 监控和调试

```javascript
// ✅ 添加日志和监控
async function monitoredRequest(lockName, callback) {
  const startTime = performance.now();
  let acquired = false;

  try {
    console.log(`[Lock] 请求锁: ${lockName}`);

    const result = await navigator.locks.request(lockName, async lock => {
      acquired = true;
      const waitTime = performance.now() - startTime;
      console.log(`[Lock] 获取锁: ${lockName} (等待 ${waitTime.toFixed(2)}ms)`);

      const taskStart = performance.now();
      const result = await callback(lock);
      const taskDuration = performance.now() - taskStart;

      console.log(`[Lock] 任务完成: ${lockName} (耗时 ${taskDuration.toFixed(2)}ms)`);
      return result;
    });

    return result;
  } finally {
    if (acquired) {
      const totalTime = performance.now() - startTime;
      console.log(`[Lock] 释放锁: ${lockName} (总耗时 ${totalTime.toFixed(2)}ms)`);
    }
  }
}
```

## 兼容性和 Polyfill

### 浏览器支持检测

```javascript
if ('locks' in navigator) {
  console.log('✅ Web Locks API 可用');
} else {
  console.log('❌ Web Locks API 不可用');
  // 使用降级方案
}
```

### 兼容性现状（2025年）

- ✅ Chrome 69+
- ✅ Edge 79+
- ✅ Opera 56+
- ❌ Firefox（实验性支持）
- ❌ Safari（未支持）

### 降级方案

```javascript
// 简单的 Polyfill（仅用于演示，生产环境需要更完善的实现）
class LockManager {
  constructor() {
    this.locks = new Map();
    this.waiting = new Map();
  }

  async request(name, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    const mode = options.mode || 'exclusive';
    const ifAvailable = options.ifAvailable || false;

    // 检查锁是否可用
    if (ifAvailable && this.locks.has(name)) {
      return callback(null);
    }

    // 等待锁可用
    await this.waitForLock(name, mode);

    // 获取锁
    this.locks.set(name, { mode, holder: Date.now() });

    try {
      const result = await callback({});
      return result;
    } finally {
      // 释放锁
      this.locks.delete(name);
      this.notifyWaiting(name);
    }
  }

  async waitForLock(name, mode) {
    while (this.locks.has(name)) {
      await new Promise(resolve => {
        if (!this.waiting.has(name)) {
          this.waiting.set(name, []);
        }
        this.waiting.get(name).push(resolve);
      });
    }
  }

  notifyWaiting(name) {
    const waiters = this.waiting.get(name) || [];
    waiters.forEach(resolve => resolve());
    this.waiting.delete(name);
  }

  async query() {
    return {
      held: Array.from(this.locks.entries()).map(([name, info]) => ({
        name,
        mode: info.mode,
        clientId: info.holder.toString()
      })),
      pending: []
    };
  }
}

// 使用 Polyfill
if (!('locks' in navigator)) {
  navigator.locks = new LockManager();
}
```

## 性能考虑

### 1. 锁的粒度

```javascript
// ❌ 粗粒度锁（锁定整个数据库）
await navigator.locks.request('database', async lock => {
  await updateUser();
  await updateProduct();
  await updateOrder();
});

// ✅ 细粒度锁（锁定具体资源）
await navigator.locks.request('database:users:user123', async lock => {
  await updateUser('user123');
});

await navigator.locks.request('database:products:prod456', async lock => {
  await updateProduct('prod456');
});
```

### 2. 锁的持有时间

```javascript
// ❌ 在锁内执行网络请求
await navigator.locks.request('resource', async lock => {
  const data = await fetch('/api/data');  // 可能很慢
  await processData(data);
});

// ✅ 先获取数据，再获取锁
const data = await fetch('/api/data');
await navigator.locks.request('resource', async lock => {
  await processData(data);  // 只锁定必要的操作
});
```

### 3. 避免死锁

```javascript
// ❌ 可能导致死锁
// 标签页 A
await navigator.locks.request('lock1', async () => {
  await navigator.locks.request('lock2', async () => {
    // ...
  });
});

// 标签页 B
await navigator.locks.request('lock2', async () => {
  await navigator.locks.request('lock1', async () => {
    // ...
  });
});

// ✅ 使用固定的锁获取顺序
async function acquireMultipleLocks(callback) {
  await navigator.locks.request('lock1', async () => {
    await navigator.locks.request('lock2', async () => {
      await callback();
    });
  });
}
```

## 调试技巧

### 可视化锁状态

```javascript
// 创建一个调试面板
async function createLockDebugPanel() {
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: #0f0;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    border-radius: 5px;
    max-width: 400px;
    z-index: 10000;
  `;
  document.body.appendChild(panel);

  // 每秒更新一次
  setInterval(async () => {
    const state = await navigator.locks.query();

    panel.innerHTML = `
      <div><strong>Web Locks Debug Panel</strong></div>
      <div>━━━━━━━━━━━━━━━━━━━━</div>
      <div><strong>Held (${state.held.length})</strong></div>
      ${state.held.map(lock => `
        <div>├─ ${lock.name}</div>
        <div>│  Mode: ${lock.mode}</div>
        <div>│  Client: ${lock.clientId.substring(0, 8)}...</div>
      `).join('')}
      <div><strong>Pending (${state.pending.length})</strong></div>
      ${state.pending.map(lock => `
        <div>├─ ${lock.name}</div>
        <div>│  Mode: ${lock.mode}</div>
        <div>│  Client: ${lock.clientId.substring(0, 8)}...</div>
      `).join('')}
    `;
  }, 1000);
}

// 在开发环境中启用
if (import.meta.env.DEV) {
  createLockDebugPanel();
}
```

### 性能分析

```javascript
// 锁性能分析工具
class LockProfiler {
  constructor() {
    this.metrics = new Map();
  }

  async profile(lockName, callback) {
    const metric = this.getOrCreateMetric(lockName);
    const startWait = performance.now();

    return navigator.locks.request(lockName, async lock => {
      const waitTime = performance.now() - startWait;
      metric.totalWaitTime += waitTime;
      metric.waitTimes.push(waitTime);

      const startHold = performance.now();
      const result = await callback(lock);
      const holdTime = performance.now() - startHold;

      metric.totalHoldTime += holdTime;
      metric.holdTimes.push(holdTime);
      metric.count++;

      return result;
    });
  }

  getOrCreateMetric(lockName) {
    if (!this.metrics.has(lockName)) {
      this.metrics.set(lockName, {
        count: 0,
        totalWaitTime: 0,
        totalHoldTime: 0,
        waitTimes: [],
        holdTimes: []
      });
    }
    return this.metrics.get(lockName);
  }

  report() {
    console.table(
      Array.from(this.metrics.entries()).map(([name, metric]) => ({
        Lock: name,
        Count: metric.count,
        'Avg Wait (ms)': (metric.totalWaitTime / metric.count).toFixed(2),
        'Avg Hold (ms)': (metric.totalHoldTime / metric.count).toFixed(2),
        'Max Wait (ms)': Math.max(...metric.waitTimes).toFixed(2),
        'Max Hold (ms)': Math.max(...metric.holdTimes).toFixed(2)
      }))
    );
  }
}

// 使用
const profiler = new LockProfiler();

await profiler.profile('my_lock', async lock => {
  await doWork();
});

// 查看报告
profiler.report();
```

## 常见陷阱和注意事项

### 1. 回调必须是异步函数

```javascript
// ❌ 同步回调（不推荐）
navigator.locks.request('lock', lock => {
  doSyncWork();
  // 锁会立即释放，可能导致竞态条件
});

// ✅ 异步回调
await navigator.locks.request('lock', async lock => {
  await doAsyncWork();
  // 锁会在 Promise 完成后释放
});
```

### 2. 不要忘记 await

```javascript
// ❌ 忘记 await（锁会立即释放）
navigator.locks.request('lock', async lock => {
  await doWork();
});
// 代码继续执行，但锁可能已释放

// ✅ 使用 await
await navigator.locks.request('lock', async lock => {
  await doWork();
});
// 确保锁在工作完成后才释放
```

### 3. 避免在回调外释放锁

```javascript
// ❌ 无法手动释放锁
let myLock;
await navigator.locks.request('lock', async lock => {
  myLock = lock;
});
// lock 已自动释放，myLock 无效

// ✅ 锁会在回调结束时自动释放
await navigator.locks.request('lock', async lock => {
  await doWork();
  // 无需手动释放
});
```

## 总结

Web Locks API 是浏览器提供的强大的并发控制原生解决方案，特别适合以下场景：

**核心优势：**
1. ✅ **原子性保证** - 避免竞态条件
2. ✅ **跨上下文** - 支持多标签页、Worker、Service Worker
3. ✅ **自动清理** - 标签页关闭时自动释放锁
4. ✅ **灵活模式** - 支持独占锁和共享锁
5. ✅ **原生性能** - 无需第三方库，性能优秀

**适用场景：**
- 多标签页数据同步
- IndexedDB 并发控制
- Service Worker 更新管理
- 防止重复提交
- 资源访问队列控制

**注意事项：**
- ⚠️ 浏览器兼容性（主要是 Chromium 系）
- ⚠️ 需要合理设计锁的粒度
- ⚠️ 避免长时间持有锁
- ⚠️ 注意死锁风险

通过合理使用 Web Locks API，我们可以构建更加健壮的 Web 应用，有效解决多上下文环境下的资源竞争问题。随着浏览器支持的完善，Web Locks API 将成为现代 Web 开发中不可或缺的工具。

## 参考资源

- [Web Locks API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [Web Locks API Specification](https://wicg.github.io/web-locks/)
- [Can I Use - Web Locks API](https://caniuse.com/web-locks)
- [Chromium Web Locks Implementation](https://www.chromium.org/developers/web-locks/)
