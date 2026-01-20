---
title: SSE（Server-Sent Events）完全指南：实时通信的轻量级方案
date: 2026-01-18 15:20:00
categories:
  - 前端开发
tags:
  - SSE
  - Server-Sent Events
  - WebSocket
  - 实时通信
  - HTTP
cover: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920
---

# SSE（Server-Sent Events）完全指南

在现代 Web 应用中，实时数据推送已经成为常见需求。本文将深入介绍 SSE（Server-Sent Events）技术，以及它与 WebSocket 的区别，帮助你选择最适合的实时通信方案。

## 什么是 SSE

Server-Sent Events（SSE）是一种服务器向客户端推送实时更新的技术，基于 HTTP 协议实现。它允许服务器在建立连接后持续向客户端发送数据，而客户端无需重复请求。

### 核心特性

- **单向通信**：只能服务器向客户端推送数据
- **基于 HTTP**：使用标准 HTTP 协议，无需特殊协议
- **自动重连**：连接断开后自动尝试重新连接
- **事件类型**：支持自定义事件类型
- **简单易用**：API 简洁，易于实现
- **文本传输**：只能传输文本数据（UTF-8）

### 工作原理

```
客户端                                服务器
   │                                    │
   │──── HTTP GET 请求 ─────────────────▶│
   │     (Accept: text/event-stream)    │
   │                                    │
   │◀──── HTTP 200 响应 ─────────────────│
   │     (Content-Type: text/event-stream)
   │                                    │
   │◀──── data: 消息1 ───────────────────│
   │                                    │
   │◀──── data: 消息2 ───────────────────│
   │                                    │
   │◀──── data: 消息3 ───────────────────│
   │                                    │
   └─────── 保持连接 ────────────────────┘
```

## SSE 基础使用

### 客户端实现（浏览器）

#### 1. 基础示例

```javascript
// 创建 SSE 连接
const eventSource = new EventSource('/api/stream');

// 监听消息事件（默认事件）
eventSource.onmessage = (event) => {
  console.log('收到消息:', event.data);

  // 解析 JSON 数据
  const data = JSON.parse(event.data);
  console.log('解析后的数据:', data);
};

// 监听连接打开
eventSource.onopen = () => {
  console.log('SSE 连接已建立');
};

// 监听错误
eventSource.onerror = (error) => {
  console.error('SSE 连接错误:', error);

  if (eventSource.readyState === EventSource.CLOSED) {
    console.log('SSE 连接已关闭');
  }
};

// 手动关闭连接
// eventSource.close();
```

#### 2. 自定义事件类型

```javascript
const eventSource = new EventSource('/api/stream');

// 监听自定义事件：通知
eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  console.log('收到通知:', notification);
  showNotification(notification.title, notification.message);
});

// 监听自定义事件：更新
eventSource.addEventListener('update', (event) => {
  const update = JSON.parse(event.data);
  console.log('收到更新:', update);
  updateUI(update);
});

// 监听自定义事件：心跳
eventSource.addEventListener('heartbeat', (event) => {
  console.log('收到心跳:', event.data);
});

// 同时监听默认事件
eventSource.onmessage = (event) => {
  console.log('收到默认消息:', event.data);
};
```

#### 3. 带认证的 SSE 连接

```javascript
// 方式1: 通过 URL 参数传递 token
const token = localStorage.getItem('authToken');
const eventSource = new EventSource(`/api/stream?token=${token}`);

// 方式2: 使用 fetch + ReadableStream（更灵活）
async function connectSSE() {
  const token = localStorage.getItem('authToken');

  const response = await fetch('/api/stream', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream'
    }
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        console.log('收到数据:', data);
        handleMessage(JSON.parse(data));
      }
    }
  }
}

connectSSE();
```

#### 4. SSE 连接状态管理

```javascript
class SSEManager {
  constructor(url) {
    this.url = url;
    this.eventSource = null;
    this.reconnectDelay = 3000;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
  }

  connect() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      console.log('✅ SSE 连接成功');
      this.reconnectAttempts = 0; // 重置重连次数
    };

    this.eventSource.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.eventSource.onerror = (error) => {
      console.error('❌ SSE 连接错误:', error);

      if (this.eventSource.readyState === EventSource.CLOSED) {
        this.handleReconnect();
      }
    };

    return this.eventSource;
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('收到消息:', data);
      // 处理消息逻辑
    } catch (error) {
      console.error('解析消息失败:', error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ 达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 SSE 连接已关闭');
    }
  }

  getReadyState() {
    if (!this.eventSource) return 'DISCONNECTED';

    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'CONNECTING';
      case EventSource.OPEN:
        return 'OPEN';
      case EventSource.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}

// 使用示例
const sseManager = new SSEManager('/api/stream');
sseManager.connect();

// 在页面卸载时关闭连接
window.addEventListener('beforeunload', () => {
  sseManager.close();
});
```

### 服务端实现

#### 1. Node.js (Express) 实现

```javascript
const express = require('express');
const app = express();

// SSE 端点
app.get('/api/stream', (req, res) => {
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 支持跨域（如果需要）
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 立即发送响应头
  res.flushHeaders();

  // 发送初始消息
  res.write('data: {"message": "连接成功"}\n\n');

  // 定时发送数据
  const intervalId = setInterval(() => {
    const data = {
      time: new Date().toISOString(),
      value: Math.random()
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 1000);

  // 客户端断开连接时清理
  req.on('close', () => {
    console.log('客户端断开连接');
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

#### 2. 带事件类型的完整示例

```javascript
const express = require('express');
const app = express();

// SSE 辅助函数
class SSEConnection {
  constructor(res) {
    this.res = res;
    this.id = Date.now();
    this.init();
  }

  init() {
    this.res.setHeader('Content-Type', 'text/event-stream');
    this.res.setHeader('Cache-Control', 'no-cache');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.setHeader('Access-Control-Allow-Origin', '*');
    this.res.flushHeaders();
  }

  // 发送消息（默认事件）
  send(data, id = null) {
    if (id) {
      this.res.write(`id: ${id}\n`);
    }
    this.res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // 发送自定义事件
  sendEvent(event, data, id = null) {
    if (id) {
      this.res.write(`id: ${id}\n`);
    }
    this.res.write(`event: ${event}\n`);
    this.res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // 发送注释（保持连接活跃）
  sendComment(comment) {
    this.res.write(`: ${comment}\n\n`);
  }

  // 设置重连时间（毫秒）
  setRetry(ms) {
    this.res.write(`retry: ${ms}\n\n`);
  }

  // 关闭连接
  close() {
    this.res.end();
  }
}

// 存储所有活跃的 SSE 连接
const connections = new Set();

// SSE 端点
app.get('/api/stream', (req, res) => {
  const connection = new SSEConnection(res);
  connections.add(connection);

  // 设置重连时间为 3 秒
  connection.setRetry(3000);

  // 发送欢迎消息
  connection.send({ message: '欢迎连接 SSE 服务' });

  // 发送心跳（每 30 秒）
  const heartbeatId = setInterval(() => {
    connection.sendEvent('heartbeat', { time: Date.now() });
  }, 30000);

  // 客户端断开连接时清理
  req.on('close', () => {
    console.log(`客户端断开连接: ${connection.id}`);
    clearInterval(heartbeatId);
    connections.delete(connection);
  });
});

// 广播消息到所有连接的客户端
function broadcast(event, data) {
  connections.forEach(connection => {
    connection.sendEvent(event, data);
  });
}

// 示例：定时广播更新
setInterval(() => {
  broadcast('update', {
    timestamp: Date.now(),
    data: `更新数据 ${Math.random().toFixed(2)}`
  });
}, 5000);

// 示例：触发通知的 API
app.post('/api/notify', express.json(), (req, res) => {
  const { title, message } = req.body;

  broadcast('notification', {
    title,
    message,
    timestamp: Date.now()
  });

  res.json({ success: true, message: '通知已发送' });
});

app.listen(3000, () => {
  console.log('SSE 服务器运行在 http://localhost:3000');
});
```

#### 3. 实战示例：实时日志推送

```javascript
const express = require('express');
const { spawn } = require('child_process');
const app = express();

// 实时日志流
app.get('/api/logs', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // 执行命令并流式传输输出
  const process = spawn('tail', ['-f', '/var/log/app.log']);

  process.stdout.on('data', (data) => {
    const log = data.toString().trim();
    res.write(`event: log\n`);
    res.write(`data: ${JSON.stringify({ log, timestamp: Date.now() })}\n\n`);
  });

  process.stderr.on('data', (data) => {
    const error = data.toString().trim();
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error, timestamp: Date.now() })}\n\n`);
  });

  req.on('close', () => {
    process.kill();
    res.end();
  });
});

// 实时构建进度
app.get('/api/build-progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const steps = [
    'Installing dependencies...',
    'Compiling TypeScript...',
    'Running tests...',
    'Building production bundle...',
    'Optimizing assets...',
    'Build completed!'
  ];

  let currentStep = 0;

  const sendProgress = () => {
    if (currentStep < steps.length) {
      res.write(`event: progress\n`);
      res.write(`data: ${JSON.stringify({
        step: currentStep + 1,
        total: steps.length,
        message: steps[currentStep],
        percentage: Math.round(((currentStep + 1) / steps.length) * 100)
      })}\n\n`);

      currentStep++;

      if (currentStep < steps.length) {
        setTimeout(sendProgress, 2000);
      } else {
        res.write(`event: complete\n`);
        res.write(`data: ${JSON.stringify({ success: true })}\n\n`);
        res.end();
      }
    }
  };

  sendProgress();

  req.on('close', () => {
    res.end();
  });
});

app.listen(3000);
```

#### 4. 其他后端实现

**Python (Flask)：**

```python
from flask import Flask, Response, stream_with_context
import time
import json

app = Flask(__name__)

@app.route('/api/stream')
def stream():
    def generate():
        # 设置重连时间
        yield 'retry: 3000\n\n'

        # 发送初始消息
        yield f'data: {json.dumps({"message": "连接成功"})}\n\n'

        # 持续发送数据
        count = 0
        while True:
            count += 1
            data = {
                'count': count,
                'timestamp': time.time()
            }
            yield f'data: {json.dumps(data)}\n\n'
            time.sleep(1)

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    )

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
```

**Go (Gin)：**

```go
package main

import (
    "encoding/json"
    "fmt"
    "time"

    "github.com/gin-gonic/gin"
)

func main() {
    router := gin.Default()

    router.GET("/api/stream", func(c *gin.Context) {
        c.Header("Content-Type", "text/event-stream")
        c.Header("Cache-Control", "no-cache")
        c.Header("Connection", "keep-alive")
        c.Header("Access-Control-Allow-Origin", "*")

        c.Stream(func(w io.Writer) bool {
            data := map[string]interface{}{
                "timestamp": time.Now().Unix(),
                "message": "Hello from Go!",
            }

            jsonData, _ := json.Marshal(data)
            fmt.Fprintf(w, "data: %s\n\n", jsonData)

            time.Sleep(1 * time.Second)
            return true // 继续流式传输
        })
    })

    router.Run(":3000")
}
```

**Java (Spring Boot)：**

```java
@RestController
@RequestMapping("/api")
public class SSEController {

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Map<String, Object>>> streamEvents() {
        return Flux.interval(Duration.ofSeconds(1))
            .map(sequence -> {
                Map<String, Object> data = new HashMap<>();
                data.put("timestamp", System.currentTimeMillis());
                data.put("sequence", sequence);

                return ServerSentEvent.<Map<String, Object>>builder()
                    .id(String.valueOf(sequence))
                    .event("message")
                    .data(data)
                    .retry(Duration.ofSeconds(3))
                    .build();
            });
    }

    @GetMapping(value = "/notifications", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        // 异步发送事件
        CompletableFuture.runAsync(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    Map<String, Object> data = new HashMap<>();
                    data.put("message", "通知 " + i);
                    data.put("timestamp", System.currentTimeMillis());

                    SseEmitter.SseEventBuilder event = SseEmitter.event()
                        .id(String.valueOf(i))
                        .name("notification")
                        .data(data);

                    emitter.send(event);
                    Thread.sleep(1000);
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
```

## SSE 消息格式详解

### 标准格式

```
field: value\n
field: value\n
\n
```

### 字段说明

```
# 1. data: 消息内容（必需）
data: {"message": "Hello"}

# 2. event: 事件类型（可选，默认为 "message"）
event: notification
data: {"title": "新消息"}

# 3. id: 消息 ID（可选，用于断线重连）
id: 123
data: {"content": "重要消息"}

# 4. retry: 重连时间（毫秒）
retry: 5000

# 5. 注释（以冒号开头，用于保持连接）
: this is a comment

# 6. 多行数据
data: {
data:   "multiline": true,
data:   "content": "多行内容"
data: }

# 完整示例
id: 456
event: update
retry: 3000
data: {"status": "success"}
data: {"timestamp": 1705312800}

```

### 实际传输示例

```
: 保持连接活跃

id: 1
event: notification
data: {"title": "新消息", "body": "您有一条新消息"}

id: 2
data: {"type": "heartbeat", "time": 1705312800}

id: 3
event: update
data: {"userId": 123, "status": "online"}

retry: 5000

```

## React 中使用 SSE

### 自定义 Hook

```typescript
// useSSE.ts
import { useEffect, useState, useRef } from 'react';

interface UseSSEOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  events?: Record<string, (data: any) => void>;
}

export function useSSE({
  url,
  onMessage,
  onError,
  onOpen,
  events = {}
}: UseSSEOptions) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);
  const [readyState, setReadyState] = useState<number>(EventSource.CONNECTING);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // 创建 SSE 连接
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // 连接打开
    eventSource.onopen = () => {
      console.log('SSE 连接已建立');
      setReadyState(EventSource.OPEN);
      onOpen?.();
    };

    // 默认消息处理
    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        onMessage?.(parsedData);
      } catch (error) {
        console.error('解析消息失败:', error);
      }
    };

    // 错误处理
    eventSource.onerror = (event) => {
      console.error('SSE 错误:', event);
      setError(event);
      setReadyState(eventSource.readyState);
      onError?.(event);
    };

    // 注册自定义事件监听器
    Object.entries(events).forEach(([eventName, handler]) => {
      eventSource.addEventListener(eventName, (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data);
          handler(parsedData);
        } catch (error) {
          console.error(`解析事件 ${eventName} 失败:`, error);
        }
      });
    });

    // 清理函数
    return () => {
      console.log('关闭 SSE 连接');
      eventSource.close();
    };
  }, [url]); // 仅在 URL 变化时重新连接

  // 手动关闭连接
  const close = () => {
    eventSourceRef.current?.close();
  };

  return {
    data,
    error,
    readyState,
    close
  };
}
```

### 组件使用示例

```typescript
// NotificationComponent.tsx
import React, { useState } from 'react';
import { useSSE } from './useSSE';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export function NotificationComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { readyState, close } = useSSE({
    url: '/api/stream',

    onOpen: () => {
      console.log('✅ 连接成功');
    },

    events: {
      notification: (data: Notification) => {
        console.log('收到通知:', data);
        setNotifications(prev => [data, ...prev].slice(0, 10)); // 只保留最近 10 条
      },

      update: (data) => {
        console.log('收到更新:', data);
      },

      heartbeat: (data) => {
        console.log('💓 心跳:', data);
      }
    },

    onError: (error) => {
      console.error('❌ 连接错误:', error);
    }
  });

  const getStatusColor = () => {
    switch (readyState) {
      case EventSource.CONNECTING:
        return 'yellow';
      case EventSource.OPEN:
        return 'green';
      case EventSource.CLOSED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = () => {
    switch (readyState) {
      case EventSource.CONNECTING:
        return '连接中...';
      case EventSource.OPEN:
        return '已连接';
      case EventSource.CLOSED:
        return '已断开';
      default:
        return '未知';
    }
  };

  return (
    <div className="notification-container">
      <div className="header">
        <h2>实时通知</h2>
        <div className="status">
          <span
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span>{getStatusText()}</span>
        </div>
        <button onClick={close}>断开连接</button>
      </div>

      <div className="notifications">
        {notifications.length === 0 ? (
          <p>暂无通知</p>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="notification-item">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <span className="timestamp">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 实时进度条组件

```typescript
// ProgressComponent.tsx
import React, { useState } from 'react';
import { useSSE } from './useSSE';

interface Progress {
  step: number;
  total: number;
  message: string;
  percentage: number;
}

export function ProgressComponent() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useSSE({
    url: '/api/build-progress',

    events: {
      progress: (data: Progress) => {
        setProgress(data);
      },

      complete: () => {
        setIsComplete(true);
      }
    }
  });

  if (!progress) {
    return <div>等待开始...</div>;
  }

  return (
    <div className="progress-container">
      <h2>构建进度</h2>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="progress-info">
        <p>{progress.message}</p>
        <span>{progress.step} / {progress.total}</span>
        <span>{progress.percentage}%</span>
      </div>

      {isComplete && (
        <div className="complete-message">
          ✅ 构建完成！
        </div>
      )}
    </div>
  );
}
```

## Vue 3 中使用 SSE

```typescript
// useSSE.ts (Vue 3 Composition API)
import { ref, onUnmounted } from 'vue';

export function useSSE(url: string) {
  const data = ref<any>(null);
  const error = ref<Event | null>(null);
  const readyState = ref<number>(EventSource.CONNECTING);

  let eventSource: EventSource | null = null;

  const connect = () => {
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log('SSE 连接已建立');
      readyState.value = EventSource.OPEN;
    };

    eventSource.onmessage = (event) => {
      try {
        data.value = JSON.parse(event.data);
      } catch (e) {
        console.error('解析消息失败:', e);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE 错误:', event);
      error.value = event;
      readyState.value = eventSource?.readyState ?? EventSource.CLOSED;
    };
  };

  const close = () => {
    eventSource?.close();
  };

  const addEventListener = (event: string, handler: (data: any) => void) => {
    eventSource?.addEventListener(event, (e: MessageEvent) => {
      try {
        const parsedData = JSON.parse(e.data);
        handler(parsedData);
      } catch (error) {
        console.error('解析失败:', error);
      }
    });
  };

  // 自动连接
  connect();

  // 组件卸载时关闭连接
  onUnmounted(() => {
    close();
  });

  return {
    data,
    error,
    readyState,
    close,
    addEventListener
  };
}
```

```vue
<!-- NotificationView.vue -->
<template>
  <div class="notification-view">
    <div class="header">
      <h2>实时通知</h2>
      <div class="status" :class="statusClass">
        <span class="dot"></span>
        <span>{{ statusText }}</span>
      </div>
    </div>

    <div class="notifications">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
      >
        <h3>{{ notification.title }}</h3>
        <p>{{ notification.message }}</p>
        <span class="time">{{ formatTime(notification.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSSE } from './useSSE';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

const notifications = ref<Notification[]>([]);

const { readyState, addEventListener } = useSSE('/api/stream');

// 监听通知事件
addEventListener('notification', (data: Notification) => {
  notifications.value.unshift(data);
  // 只保留最近 20 条
  if (notifications.value.length > 20) {
    notifications.value.pop();
  }
});

const statusClass = computed(() => {
  switch (readyState.value) {
    case EventSource.CONNECTING:
      return 'connecting';
    case EventSource.OPEN:
      return 'open';
    case EventSource.CLOSED:
      return 'closed';
    default:
      return 'unknown';
  }
});

const statusText = computed(() => {
  switch (readyState.value) {
    case EventSource.CONNECTING:
      return '连接中...';
    case EventSource.OPEN:
      return '已连接';
    case EventSource.CLOSED:
      return '已断开';
    default:
      return '未知';
  }
});

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};
</script>

<style scoped>
.status.open .dot {
  background-color: #10b981;
}

.status.connecting .dot {
  background-color: #f59e0b;
}

.status.closed .dot {
  background-color: #ef4444;
}
</style>
```

## SSE vs WebSocket 详细对比

### 核心区别

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| **通信方向** | 单向（服务器→客户端） | 双向（客户端↔服务器） |
| **协议** | HTTP/HTTPS | WS/WSS（独立协议） |
| **数据格式** | 仅文本（UTF-8） | 文本和二进制 |
| **浏览器支持** | 现代浏览器原生支持（IE 除外） | 所有现代浏览器 |
| **自动重连** | ✅ 内置自动重连 | ❌ 需要手动实现 |
| **连接复杂度** | 简单（标准 HTTP） | 复杂（需握手升级） |
| **防火墙友好** | ✅ 非常友好 | ⚠️ 可能被阻止 |
| **HTTP/2** | ✅ 完全支持 | ⚠️ 需要特殊处理 |
| **事件类型** | ✅ 支持自定义事件 | ❌ 需自己实现 |
| **连接ID** | ✅ 内置消息 ID | ❌ 需自己实现 |
| **资源占用** | 较低 | 较高 |
| **服务器负载** | 中等 | 高（保持大量连接） |

### 通信模式对比

```javascript
// SSE - 单向通信
// 客户端
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = (event) => {
  console.log('收到:', event.data);
};

// 服务器
res.write(`data: ${JSON.stringify(message)}\n\n`);

// ❌ SSE 无法从客户端发送消息到服务器
// 如需发送，必须使用额外的 HTTP 请求（fetch/axios）

// ---------------------------------------------------

// WebSocket - 双向通信
// 客户端
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  console.log('收到:', event.data);
};

// ✅ 可以直接发送消息
ws.send('Hello Server!');

// 服务器
ws.send(JSON.stringify(message));

ws.on('message', (data) => {
  console.log('收到客户端消息:', data);
});
```

### 使用场景对比

#### SSE 适用场景 ✅

1. **实时通知推送**
   ```javascript
   // 新消息、系统通知、用户动态
   eventSource.addEventListener('notification', (event) => {
     showNotification(JSON.parse(event.data));
   });
   ```

2. **实时数据展示**
   ```javascript
   // 股票行情、天气更新、实时监控
   eventSource.onmessage = (event) => {
     const { stock, price } = JSON.parse(event.data);
     updateStockPrice(stock, price);
   };
   ```

3. **进度追踪**
   ```javascript
   // 文件上传、构建进度、任务执行
   eventSource.addEventListener('progress', (event) => {
     const { percentage } = JSON.parse(event.data);
     updateProgressBar(percentage);
   });
   ```

4. **日志流式传输**
   ```javascript
   // 实时日志、审计记录
   eventSource.addEventListener('log', (event) => {
     appendLog(event.data);
   });
   ```

5. **Feed 更新**
   ```javascript
   // 社交媒体动态、新闻推送
   eventSource.addEventListener('feed', (event) => {
     prependFeedItem(JSON.parse(event.data));
   });
   ```

#### WebSocket 适用场景 ✅

1. **实时聊天应用**
   ```javascript
   // 需要双向即时通信
   ws.onmessage = (event) => {
     displayMessage(JSON.parse(event.data));
   };

   ws.send(JSON.stringify({
     type: 'message',
     content: 'Hello!'
   }));
   ```

2. **在线游戏**
   ```javascript
   // 高频双向数据交换
   ws.send(JSON.stringify({
     type: 'player_move',
     x: 100,
     y: 200
   }));
   ```

3. **协同编辑**
   ```javascript
   // 多人同时编辑文档
   ws.send(JSON.stringify({
     type: 'edit',
     position: 10,
     text: 'Hello'
   }));
   ```

4. **视频会议信令**
   ```javascript
   // WebRTC 信令通道
   ws.send(JSON.stringify({
     type: 'offer',
     sdp: offer
   }));
   ```

5. **IoT 设备控制**
   ```javascript
   // 需要向设备发送控制指令
   ws.send(JSON.stringify({
     type: 'control',
     device: 'light',
     action: 'on'
   }));
   ```

### 性能对比

```javascript
// 连接开销对比

// SSE
// 建立连接: ~50-100ms
// 保持连接: 每个连接 ~4KB 内存
// 单服务器可支持: ~10,000 并发连接

// WebSocket
// 建立连接: ~100-200ms（需要握手升级）
// 保持连接: 每个连接 ~8KB 内存
// 单服务器可支持: ~5,000-8,000 并发连接

// 数据传输效率

// SSE - 每条消息有固定格式开销
data: {"value": 123}\n\n  // 23 字节（JSON 本身 15 字节）

// WebSocket - 二进制帧，开销最小
// 相同数据: ~17 字节（包含帧头）
```

### 选择建议

```
使用 SSE 的情况：
✅ 只需要服务器推送数据给客户端
✅ 需要简单快速的实现
✅ 需要自动重连机制
✅ 需要与现有 HTTP 基础设施兼容
✅ 需要更好的防火墙穿透
✅ 推送频率不是特别高（< 1次/秒）

使用 WebSocket 的情况：
✅ 需要双向实时通信
✅ 需要传输二进制数据
✅ 需要低延迟（< 50ms）
✅ 高频数据交换（> 10次/秒）
✅ 需要自定义协议
✅ 客户端需要主动发送大量数据

混合使用：
💡 SSE 用于服务器推送 + fetch/axios 用于客户端请求
💡 这种组合可以满足大多数场景，实现简单且高效
```

### 代码实现对比

```javascript
// 同一个实时通知功能的两种实现

// ========== SSE 实现 ==========
// 客户端
const eventSource = new EventSource('/api/notifications');

eventSource.addEventListener('notification', (event) => {
  const data = JSON.parse(event.data);
  showNotification(data);
});

// 发送消息需要额外的 HTTP 请求
async function sendMessage(message) {
  await fetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}

// 服务器
app.get('/api/notifications', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');

  // 推送通知
  const send = (data) => {
    res.write(`event: notification\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  notificationEmitter.on('new', send);
  req.on('close', () => {
    notificationEmitter.off('new', send);
  });
});

// ========== WebSocket 实现 ==========
// 客户端
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification') {
    showNotification(data);
  }
};

// 发送消息通过同一连接
function sendMessage(message) {
  ws.send(JSON.stringify({
    type: 'message',
    content: message
  }));
}

// 服务器
wss.on('connection', (ws) => {
  // 推送通知
  const send = (data) => {
    ws.send(JSON.stringify({
      type: 'notification',
      ...data
    }));
  };

  notificationEmitter.on('new', send);

  // 接收消息
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    handleMessage(message);
  });

  ws.on('close', () => {
    notificationEmitter.off('new', send);
  });
});
```

## SSE 高级应用

### 1. 断线重连与消息补发

```javascript
// 服务器端：记录客户端最后接收的消息 ID
const messageStore = []; // 存储所有消息
let messageIdCounter = 0;

app.get('/api/stream', (req, res) => {
  const lastEventId = req.headers['last-event-id'];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // 如果客户端重连，发送缺失的消息
  if (lastEventId) {
    const lastId = parseInt(lastEventId);
    const missedMessages = messageStore.filter(msg => msg.id > lastId);

    missedMessages.forEach(msg => {
      res.write(`id: ${msg.id}\n`);
      res.write(`data: ${JSON.stringify(msg.data)}\n\n`);
    });
  }

  // 继续发送新消息
  const sendMessage = (data) => {
    const id = ++messageIdCounter;
    const message = { id, data, timestamp: Date.now() };

    messageStore.push(message);

    // 只保留最近 100 条消息
    if (messageStore.length > 100) {
      messageStore.shift();
    }

    res.write(`id: ${id}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  eventEmitter.on('message', sendMessage);

  req.on('close', () => {
    eventEmitter.off('message', sendMessage);
  });
});

// 客户端：自动使用最后的消息 ID 重连
const eventSource = new EventSource('/api/stream');

eventSource.onmessage = (event) => {
  console.log('消息 ID:', event.lastEventId);
  console.log('数据:', event.data);
  // EventSource 会自动在重连时发送 Last-Event-ID 请求头
};
```

### 2. 认证和授权

```javascript
// 使用 Token 认证
const token = localStorage.getItem('token');
const eventSource = new EventSource(`/api/stream?token=${token}`);

// 服务器验证
app.get('/api/stream', async (req, res) => {
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');

  try {
    const user = await verifyToken(token);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 只发送该用户相关的消息
    const sendMessage = (data) => {
      if (data.userId === user.id) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    eventEmitter.on('message', sendMessage);

    req.on('close', () => {
      eventEmitter.off('message', sendMessage);
    });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

### 3. 负载均衡和集群

```javascript
// 使用 Redis Pub/Sub 实现跨服务器消息分发
const Redis = require('ioredis');
const pub = new Redis();
const sub = new Redis();

// 订阅 Redis 频道
sub.subscribe('sse-messages');

sub.on('message', (channel, message) => {
  const data = JSON.parse(message);
  // 广播给本服务器上的所有 SSE 连接
  connections.forEach(connection => {
    connection.res.write(`data: ${message}\n\n`);
  });
});

// 发布消息到 Redis（任何服务器都可以发布）
function broadcastMessage(data) {
  pub.publish('sse-messages', JSON.stringify(data));
}

// Nginx 配置（支持 SSE）
/*
location /api/stream {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header X-Accel-Buffering no;
    proxy_cache off;
    proxy_buffering off;
    chunked_transfer_encoding off;
}
*/
```

### 4. 心跳和超时处理

```javascript
// 服务器：定期发送心跳
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // 每 30 秒发送一次心跳（注释不会触发客户端事件）
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // 或者发送心跳事件
  const heartbeatEvent = setInterval(() => {
    res.write('event: heartbeat\n');
    res.write(`data: ${Date.now()}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(heartbeatEvent);
  });
});

// 客户端：检测连接状态
class SSEWithTimeout {
  constructor(url, timeout = 60000) {
    this.url = url;
    this.timeout = timeout;
    this.timeoutId = null;
    this.connect();
  }

  connect() {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event) => {
      this.resetTimeout();
      this.handleMessage(event);
    };

    this.eventSource.addEventListener('heartbeat', () => {
      console.log('💓 收到心跳');
      this.resetTimeout();
    });

    this.eventSource.onerror = () => {
      console.error('连接错误');
      this.cleanup();
    };

    this.resetTimeout();
  }

  resetTimeout() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      console.error('连接超时，重新连接...');
      this.reconnect();
    }, this.timeout);
  }

  reconnect() {
    this.cleanup();
    setTimeout(() => this.connect(), 3000);
  }

  cleanup() {
    clearTimeout(this.timeoutId);
    this.eventSource?.close();
  }

  handleMessage(event) {
    console.log('收到消息:', event.data);
  }
}

const sse = new SSEWithTimeout('/api/stream');
```

## 浏览器兼容性

### 支持情况

```javascript
// 检测浏览器是否支持 SSE
if (typeof EventSource !== 'undefined') {
  console.log('✅ 浏览器支持 SSE');
  const eventSource = new EventSource('/api/stream');
} else {
  console.log('❌ 浏览器不支持 SSE，使用 Polyfill');
  // 使用 polyfill 或降级方案
}
```

### Polyfill 方案

```javascript
// 使用 event-source-polyfill
import { EventSourcePolyfill } from 'event-source-polyfill';

const eventSource = new EventSourcePolyfill('/api/stream', {
  headers: {
    'Authorization': 'Bearer ' + token
  },
  heartbeatTimeout: 45000,
  connectionTimeout: 10000
});
```

### 降级方案

```javascript
// 轮询降级
class SSEClient {
  constructor(url) {
    this.url = url;
    this.useSSE = typeof EventSource !== 'undefined';

    if (this.useSSE) {
      this.connectSSE();
    } else {
      this.connectPolling();
    }
  }

  connectSSE() {
    this.eventSource = new EventSource(this.url);
    this.eventSource.onmessage = (event) => {
      this.onMessage(JSON.parse(event.data));
    };
  }

  connectPolling() {
    this.poll();
  }

  async poll() {
    while (true) {
      try {
        const response = await fetch(this.url);
        const data = await response.json();
        this.onMessage(data);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error('轮询错误:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  onMessage(data) {
    console.log('收到数据:', data);
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

## 常见问题与解决方案

### Q1: SSE 连接频繁断开

```javascript
// 原因：
// 1. 代理/负载均衡器超时
// 2. 防火墙限制
// 3. 浏览器限制

// 解决方案：定期发送心跳
setInterval(() => {
  res.write(': keep-alive\n\n');
}, 15000); // 每 15 秒发送一次

// Nginx 配置
/*
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;
*/
```

### Q2: 同一域名最多 6 个并发连接

```javascript
// HTTP/1.1 限制同一域名最多 6 个并发连接

// 解决方案1: 使用 HTTP/2（没有此限制）
// 解决方案2: 使用不同的子域名
const eventSource1 = new EventSource('https://sse1.example.com/stream');
const eventSource2 = new EventSource('https://sse2.example.com/stream');

// 解决方案3: 复用同一个连接，使用事件类型区分
const eventSource = new EventSource('/api/stream');

eventSource.addEventListener('notifications', handleNotifications);
eventSource.addEventListener('updates', handleUpdates);
eventSource.addEventListener('messages', handleMessages);
```

### Q3: 大量数据时性能问题

```javascript
// 服务器端：批量发送
const batchSize = 10;
const batchTimeout = 100; // ms
let batch = [];

function sendData(data) {
  batch.push(data);

  if (batch.length >= batchSize) {
    flushBatch();
  } else if (batch.length === 1) {
    setTimeout(flushBatch, batchTimeout);
  }
}

function flushBatch() {
  if (batch.length === 0) return;

  res.write(`data: ${JSON.stringify(batch)}\n\n`);
  batch = [];
}
```

### Q4: 内存泄漏

```javascript
// ❌ 错误：忘记关闭连接
const eventSource = new EventSource('/api/stream');

// ✅ 正确：在组件卸载时关闭
useEffect(() => {
  const eventSource = new EventSource('/api/stream');

  return () => {
    eventSource.close(); // 清理
  };
}, []);

// 服务器端：及时清理监听器
req.on('close', () => {
  // 移除所有事件监听器
  eventEmitter.off('message', sendMessage);
  clearInterval(heartbeatId);
});
```

## 最佳实践总结

### 客户端最佳实践

```javascript
✅ 总是在组件卸载时关闭连接
✅ 使用 try-catch 处理 JSON 解析
✅ 实现合理的重连策略（指数退避）
✅ 监控连接状态并提供用户反馈
✅ 在移动端注意电池消耗
✅ 使用节流/防抖处理高频更新
```

### 服务器最佳实践

```javascript
✅ 设置合理的响应头
✅ 定期发送心跳保持连接
✅ 实现消息队列和补发机制
✅ 监控活跃连接数
✅ 实现连接限流和认证
✅ 使用 Redis 等消息队列支持集群
✅ 及时清理断开的连接
```

## 总结

### SSE 的优势

- ✅ **简单易用**：基于 HTTP，无需特殊协议
- ✅ **自动重连**：内置重连机制
- ✅ **事件类型**：支持多种自定义事件
- ✅ **防火墙友好**：使用标准 HTTP 端口
- ✅ **轻量级**：资源占用少
- ✅ **HTTP/2 支持**：可复用单个 TCP 连接

### SSE 的局限

- ❌ **单向通信**：只能服务器推送
- ❌ **文本数据**：不支持二进制
- ❌ **连接数限制**：HTTP/1.1 有 6 个连接限制
- ❌ **IE 不支持**：需要 polyfill

### 何时使用 SSE

```
✅ 推荐使用 SSE：
- 实时通知和提醒
- 实时数据监控和展示
- 进度追踪
- 新闻/社交媒体 Feed
- 日志流
- 服务器状态监控

❌ 不推荐使用 SSE：
- 需要双向实时通信（使用 WebSocket）
- 需要传输二进制数据（使用 WebSocket）
- 需要超低延迟（< 50ms）（使用 WebSocket）
- 高频数据交换（> 10次/秒）（使用 WebSocket）
```

SSE 是一个简单、高效、可靠的服务器推送解决方案，特别适合单向数据推送的场景。通过合理的设计和实现，可以构建出稳定可靠的实时应用！🚀
