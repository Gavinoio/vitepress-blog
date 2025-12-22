---
title: Node.js 最佳实践指南
date: 2024-12-12 12:44:24
categories:
  - 后端开发
tags:
  - Node.js
  - JavaScript
  - 最佳实践
cover: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920
---

# Node.js 最佳实践指南

Node.js 是一个强大的后端运行时环境，但要写出高质量的 Node.js 应用需要遵循一些最佳实践。

## 项目结构

### 推荐的目录结构

```
project/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middlewares/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── config/
├── tests/
├── scripts/
├── .env
├── .env.example
├── package.json
└── README.md
```

### 分层架构

```javascript
// controllers/userController.js
exports.getUser = async (req, res, next) => {
  try {
    const user = await UserService.findById(req.params.id)
    res.json({ data: user })
  } catch (error) {
    next(error)
  }
}

// services/userService.js
class UserService {
  async findById(id) {
    const user = await User.findByPk(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return user
  }
}

// models/user.js
const { Model, DataTypes } = require('sequelize')

class User extends Model {}

User.init({
  name: DataTypes.STRING,
  email: DataTypes.STRING
}, { sequelize })
```

## 错误处理

### 统一错误处理中间件

```javascript
// middlewares/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  } else {
    // 生产环境：只返回必要信息
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong'
    })
  }
}

module.exports = { AppError, errorHandler }
```

### 异步错误处理

```javascript
// utils/catchAsync.js
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

// 使用
const catchAsync = require('../utils/catchAsync')

exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body)
  res.status(201).json({ data: user })
})
```

## 环境配置管理

### 使用 dotenv

```javascript
// config/index.js
require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  }
}
```

## 安全性

### 1. 使用 helmet

```javascript
const helmet = require('helmet')
app.use(helmet())
```

### 2. 速率限制

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  max: 100, // 最多 100 次请求
  windowMs: 60 * 60 * 1000, // 1 小时
  message: 'Too many requests from this IP'
})

app.use('/api', limiter)
```

### 3. 数据验证

```javascript
const Joi = require('joi')

const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  next()
}
```

### 4. SQL 注入防护

```javascript
// 使用参数化查询
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)

// 使用 ORM
const user = await User.findOne({ where: { email } })
```

## 日志管理

### 使用 Winston

```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

module.exports = logger
```

## 性能优化

### 1. 使用缓存

```javascript
const redis = require('redis')
const client = redis.createClient()

// 缓存中间件
const cache = (duration) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`

  try {
    const cached = await client.get(key)
    if (cached) {
      return res.json(JSON.parse(cached))
    }

    // 修改 res.json 以保存到缓存
    const originalJson = res.json.bind(res)
    res.json = (data) => {
      client.setex(key, duration, JSON.stringify(data))
      return originalJson(data)
    }
    next()
  } catch (error) {
    next(error)
  }
}

// 使用
app.get('/api/users', cache(300), getUsersController)
```

### 2. 数据库查询优化

```javascript
// 添加索引
await User.sync()
await sequelize.query('CREATE INDEX idx_email ON users(email)')

// 使用分页
const users = await User.findAll({
  limit: 20,
  offset: (page - 1) * 20,
  attributes: ['id', 'name', 'email'], // 只选择需要的字段
  include: [{ model: Profile, attributes: ['avatar'] }]
})

// 批量操作
await User.bulkCreate(users, { validate: true })
```

### 3. 使用 Cluster

```javascript
const cluster = require('cluster')
const os = require('os')

if (cluster.isMaster) {
  const numCPUs = os.cpus().length

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.id} died`)
    cluster.fork() // 重启
  })
} else {
  require('./app')
}
```

## 测试

### 单元测试

```javascript
const request = require('supertest')
const app = require('../app')

describe('User API', () => {
  test('GET /api/users should return users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200)

    expect(response.body.data).toBeInstanceOf(Array)
  })

  test('POST /api/users should create user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201)

    expect(response.body.data.email).toBe(userData.email)
  })
})
```

## 部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start app.js -i max

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart all
```

### ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
```

## 总结

编写高质量的 Node.js 应用需要关注：

1. **代码组织**：清晰的项目结构和分层架构
2. **错误处理**：统一的错误处理机制
3. **安全性**：防护常见的安全漏洞
4. **性能**：合理使用缓存和优化数据库查询
5. **测试**：完善的测试覆盖
6. **部署**：使用进程管理器确保高可用性

这些实践将帮助你构建稳定、安全、高性能的 Node.js 应用！
