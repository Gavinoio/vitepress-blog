---
title: RESTful API 设计最佳实践
date: 2024-12-05
categories:
  - 后端开发
tags:
  - API
  - REST
  - 接口设计
cover: https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1920
---

# RESTful API 设计最佳实践

设计良好的 RESTful API 能够提升开发效率和用户体验。本文介绍 REST API 的设计原则和最佳实践。

## REST 基本原则

### 1. 使用 HTTP 方法

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 获取资源 | `GET /api/users/1` |
| POST | 创建资源 | `POST /api/users` |
| PUT | 完整更新资源 | `PUT /api/users/1` |
| PATCH | 部分更新资源 | `PATCH /api/users/1` |
| DELETE | 删除资源 | `DELETE /api/users/1` |

### 2. 使用名词而非动词

```
✅ 好的设计
GET /api/users
POST /api/users
GET /api/users/1
DELETE /api/users/1

❌ 不好的设计
GET /api/getUsers
POST /api/createUser
GET /api/getUserById/1
DELETE /api/deleteUser/1
```

### 3. 使用复数名词

```
✅ GET /api/users
✅ GET /api/products
✅ GET /api/orders

❌ GET /api/user
❌ GET /api/product
❌ GET /api/order
```

## URL 设计

### 资源层级

```
# 用户的订单
GET /api/users/1/orders

# 订单的商品
GET /api/orders/123/items

# 用户的地址
GET /api/users/1/addresses
```

### 查询参数

```
# 分页
GET /api/users?page=1&limit=20

# 排序
GET /api/products?sort=-price,name

# 过滤
GET /api/users?status=active&role=admin

# 字段选择
GET /api/users/1?fields=name,email,avatar

# 搜索
GET /api/products?q=laptop
```

## HTTP 状态码

### 成功响应

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| 200 | OK | GET、PUT、PATCH 成功 |
| 201 | Created | POST 创建成功 |
| 204 | No Content | DELETE 成功 |

### 客户端错误

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 验证失败 |
| 429 | Too Many Requests | 请求过多 |

### 服务器错误

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

## 响应格式

### 统一的响应结构

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gavin",
    "email": "gavin@example.com"
  },
  "meta": {
    "timestamp": "2024-12-05T10:00:00Z",
    "version": "1.0"
  }
}
```

### 列表响应

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "User 1" },
    { "id": 2, "name": "User 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "links": {
    "self": "/api/users?page=1",
    "next": "/api/users?page=2",
    "prev": null,
    "first": "/api/users?page=1",
    "last": "/api/users?page=5"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-12-05T10:00:00Z",
    "requestId": "abc-123-def"
  }
}
```

## 版本控制

### 1. URL 版本控制（推荐）

```
GET /api/v1/users
GET /api/v2/users
```

### 2. Header 版本控制

```
GET /api/users
Accept: application/vnd.myapi.v1+json
```

### 3. 查询参数版本控制

```
GET /api/users?version=1
```

## 认证和授权

### Bearer Token

```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key

```http
GET /api/users
X-API-Key: your-api-key-here
```

## 速率限制

### 响应头

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1670234567
```

### 超出限制

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded"
  }
}
```

## HATEOAS

在响应中包含相关链接，使 API 更具自描述性。

```json
{
  "data": {
    "id": 1,
    "name": "Gavin",
    "email": "gavin@example.com"
  },
  "links": {
    "self": "/api/users/1",
    "orders": "/api/users/1/orders",
    "addresses": "/api/users/1/addresses",
    "avatar": "/api/users/1/avatar"
  }
}
```

## 文档

### 使用 OpenAPI (Swagger)

```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
```

## 批量操作

### 批量创建

```http
POST /api/users/batch

[
  { "name": "User 1", "email": "user1@example.com" },
  { "name": "User 2", "email": "user2@example.com" }
]
```

### 批量删除

```http
DELETE /api/users?ids=1,2,3

或

DELETE /api/users/batch
{
  "ids": [1, 2, 3]
}
```

## 最佳实践总结

1. **一致性**：保持 API 风格一致
2. **清晰性**：URL 和参数命名要清晰明了
3. **版本控制**：为 API 添加版本号
4. **错误处理**：提供详细的错误信息
5. **文档**：维护完善的 API 文档
6. **安全性**：实现认证、授权和速率限制
7. **性能**：支持分页、过滤和字段选择
8. **向后兼容**：避免破坏性变更

遵循这些原则，你就能设计出优秀的 RESTful API！
