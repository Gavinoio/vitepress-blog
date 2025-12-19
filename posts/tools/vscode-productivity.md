---
title: VS Code 效率提升指南
date: 2024-11-28
categories:
  - 开发工具
tags:
  - VS Code
  - IDE
  - 效率工具
cover: https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920
---

# VS Code 效率提升指南

Visual Studio Code 是最受欢迎的代码编辑器。本文分享一些实用技巧和插件，帮助你提升开发效率。

## 必备快捷键

### 文件导航

```
Ctrl + P          快速打开文件
Ctrl + Shift + P  命令面板
Ctrl + Tab        切换最近文件
Ctrl + \          拆分编辑器
Ctrl + W          关闭当前文件
```

### 编辑操作

```
Ctrl + D          选择下一个匹配项
Ctrl + Shift + L  选择所有匹配项
Alt + Click       多光标编辑
Ctrl + Shift + K  删除行
Alt + Up/Down     移动行
Ctrl + /          切换注释
Ctrl + Shift + [  折叠代码块
```

### 代码导航

```
F12               跳转到定义
Alt + F12         查看定义
Shift + F12       查找引用
Ctrl + Shift + O  跳转到符号
Ctrl + T          跳转到工作区符号
```

### 搜索和替换

```
Ctrl + F          查找
Ctrl + H          替换
Ctrl + Shift + F  全局搜索
Ctrl + Shift + H  全局替换
```

## 推荐插件

### 基础增强

**1. Chinese (Simplified) Language Pack**
- 中文界面
- 官方出品

**2. Path Intellisense**
- 路径自动补全
- 支持相对路径和绝对路径

**3. Auto Rename Tag**
- 自动重命名配对标签
- 前端开发必备

**4. Bracket Pair Colorizer 2**
- 括号配对着色
- 提高代码可读性
- ⚠️ VS Code 已内置此功能

### 代码质量

**5. ESLint**
- JavaScript/TypeScript 代码检查
- 自动修复问题

```json
// settings.json
{
  "eslint.autoFixOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**6. Prettier - Code formatter**
- 代码格式化
- 支持多种语言

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**7. Error Lens**
- 在代码行内显示错误
- 更直观的错误提示

### Git 相关

**8. GitLens**
- 增强 Git 功能
- 查看代码作者和提交历史
- 对比分支和提交

**9. Git Graph**
- 可视化 Git 历史
- 图形化操作 Git

### 前端开发

**10. Live Server**
- 启动本地开发服务器
- 自动刷新浏览器

**11. CSS Peek**
- 快速查看 CSS 定义
- 跳转到 CSS 文件

**12. HTML CSS Support**
- HTML 中 CSS 类名自动补全
- 提高开发效率

**13. Tailwind CSS IntelliSense**
- Tailwind CSS 自动补全
- 类名提示和文档

### 代码片段

**14. ES7+ React/Redux/React-Native snippets**
- React 代码片段
- 快速生成组件

**15. Vue VSCode Snippets**
- Vue 代码片段
- 支持 Vue 3

### 主题和图标

**16. One Dark Pro**
- 流行的深色主题
- 护眼舒适

**17. Material Icon Theme**
- 精美的文件图标
- 识别文件类型更快

### 效率工具

**18. TODO Highlight**
- 高亮 TODO、FIXME 等注释
- 快速定位待办事项

**19. Better Comments**
- 不同类型的注释着色
- 提高注释可读性

```javascript
// ! 重要警告
// ? 问题或疑问
// TODO 待办事项
// * 强调说明
```

**20. Code Spell Checker**
- 拼写检查
- 减少变量命名错误

## 代码片段（Snippets）

### 创建自定义片段

1. `Ctrl + Shift + P` → "Configure User Snippets"
2. 选择语言
3. 添加片段

```json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react'",
      "",
      "function ${1:ComponentName}() {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  )",
      "}",
      "",
      "export default ${1:ComponentName}"
    ],
    "description": "Create a React functional component"
  }
}
```

### 常用片段

**JavaScript/TypeScript**
```
clg  → console.log()
imp  → import ... from '...'
exp  → export default
try  → try...catch block
```

## 工作区设置

### settings.json 推荐配置

```json
{
  // 编辑器
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.linkedEditing": true,
  "editor.bracketPairColorization.enabled": true,

  // 文件
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true
  },

  // 终端
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.defaultProfile.windows": "Git Bash",

  // Emmet
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "vue-html": "html"
  },

  // 其他
  "explorer.confirmDelete": false,
  "workbench.startupEditor": "none",
  "breadcrumbs.enabled": true
}
```

## Emmet 快捷输入

### HTML

```
div.container>ul>li*5>a
→
<div class="container">
  <ul>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
  </ul>
</div>

ul>li.item$*3
→
<ul>
  <li class="item1"></li>
  <li class="item2"></li>
  <li class="item3"></li>
</ul>
```

### CSS

```
m10  → margin: 10px;
p20  → padding: 20px;
w100 → width: 100px;
df   → display: flex;
```

## 调试技巧

### 创建 launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/app.js"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### 断点调试

- F5: 开始调试
- F9: 切换断点
- F10: 单步跳过
- F11: 单步进入
- Shift + F11: 单步跳出

## 多光标编辑

### 技巧

1. **Alt + Click**: 在点击位置添加光标
2. **Ctrl + Alt + Up/Down**: 在上方/下方添加光标
3. **Ctrl + D**: 选择下一个匹配项
4. **Ctrl + Shift + L**: 选择所有匹配项

### 示例

```javascript
// 快速修改多个变量名
const userName = "John"
console.log(userName)
alert(userName)

// 使用 Ctrl + D 选择所有 userName，直接修改
```

## 命令行集成

### 在终端中打开 VS Code

```bash
# 安装 code 命令（首次）
# Ctrl + Shift + P → Shell Command: Install 'code' command

# 使用
code .              # 打开当前目录
code file.js        # 打开文件
code -r .           # 在当前窗口打开
code -d file1 file2 # 对比两个文件
```

## 性能优化

### 排查卡顿

1. **禁用不需要的插件**
2. **使用工作区推荐插件**
3. **排除大文件夹**

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.git/objects/**": true
  }
}
```

## 总结

提升 VS Code 效率的关键：

1. **熟练掌握快捷键**
2. **安装必要的插件**
3. **自定义代码片段**
4. **优化编辑器配置**
5. **善用多光标编辑**
6. **学习调试技巧**

记住：工具是为了提高效率，不要过度依赖插件，保持编辑器简洁流畅最重要！

Happy Coding! 💻
