---
title: Git 工作流最佳实践
date: 2024-12-28 15:00:00
description: 全面讲解 Git 工作流的最佳实践，包括 Feature Branch、Git Flow、GitHub Flow 等工作流模式，以及提交规范、分支管理、冲突解决等实用技巧。
keywords:
  - Git
  - 工作流
  - 版本控制
  - Git Flow
  - 团队协作
categories:
  - 开发工具
tags:
  - Git
  - 版本控制
  - 工作流
cover: https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1920
---

# Git 工作流最佳实践

Git 是最流行的版本控制工具。掌握 Git 工作流能大大提升团队协作效率。

## 常用 Git 工作流

### 1. Feature Branch Workflow

最常用的工作流，每个功能都在独立的分支上开发。

```bash
# 创建功能分支
git checkout -b feature/user-authentication

# 开发并提交
git add .
git commit -m "feat: implement user login"

# 推送到远程
git push origin feature/user-authentication

# 合并到主分支（通过 Pull Request）
```

### 2. Git Flow

适合有明确发布周期的项目。

**分支类型：**
- `main`: 生产代码
- `develop`: 开发分支
- `feature/*`: 功能分支
- `release/*`: 发布分支
- `hotfix/*`: 紧急修复分支

```bash
# 开始新功能
git checkout -b feature/new-feature develop

# 完成功能
git checkout develop
git merge --no-ff feature/new-feature
git branch -d feature/new-feature

# 准备发布
git checkout -b release/1.0.0 develop

# 发布
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0
git checkout develop
git merge --no-ff release/1.0.0
```

### 3. GitHub Flow

简化版工作流，适合持续部署。

```bash
# 从 main 创建分支
git checkout -b fix-bug

# 提交更改
git commit -m "fix: resolve login issue"

# 推送并创建 PR
git push origin fix-bug

# 合并后删除分支
git branch -d fix-bug
```

## 提交规范

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例：**

```bash
feat(auth): add JWT authentication

Implement JWT-based authentication system with:
- User login endpoint
- Token generation and validation
- Refresh token mechanism

Closes #123
```

## 常用命令

### 基础操作

```bash
# 查看状态
git status

# 查看差异
git diff
git diff --staged

# 添加文件
git add <file>
git add .
git add -A

# 提交
git commit -m "message"
git commit --amend  # 修改最后一次提交

# 推送
git push origin main
git push -u origin feature-branch
```

### 分支操作

```bash
# 查看分支
git branch
git branch -a  # 包括远程分支

# 创建分支
git branch feature-branch
git checkout -b feature-branch  # 创建并切换

# 切换分支
git checkout main
git switch main  # 新命令

# 删除分支
git branch -d feature-branch  # 安全删除
git branch -D feature-branch  # 强制删除

# 重命名分支
git branch -m old-name new-name
```

### 合并与变基

```bash
# 合并
git merge feature-branch
git merge --no-ff feature-branch  # 保留分支历史

# 变基
git rebase main
git rebase -i HEAD~3  # 交互式变基

# 解决冲突
git add <resolved-files>
git rebase --continue
git merge --continue
```

### 撤销操作

```bash
# 撤销工作区更改
git checkout -- <file>
git restore <file>  # 新命令

# 撤销暂存
git reset HEAD <file>
git restore --staged <file>  # 新命令

# 撤销提交
git reset --soft HEAD~1  # 保留更改
git reset --mixed HEAD~1  # 默认，取消暂存
git reset --hard HEAD~1  # 删除更改

# 撤销已推送的提交
git revert <commit-hash>
```

### 查看历史

```bash
# 查看提交历史
git log
git log --oneline
git log --graph --oneline --all

# 查看文件历史
git log -- <file>

# 查看特定提交
git show <commit-hash>

# 查找提交
git log --grep="keyword"
git log --author="Gavin"
```

## 高级技巧

### 1. Stash（暂存）

```bash
# 暂存当前更改
git stash
git stash save "work in progress"

# 查看暂存列表
git stash list

# 应用暂存
git stash apply
git stash apply stash@{2}

# 应用并删除
git stash pop

# 删除暂存
git stash drop
git stash clear  # 清空所有
```

### 2. Cherry-pick（挑选提交）

```bash
# 挑选特定提交到当前分支
git cherry-pick <commit-hash>

# 挑选多个提交
git cherry-pick <hash1> <hash2>

# 挑选范围
git cherry-pick <hash1>..<hash2>
```

### 3. 子模块

```bash
# 添加子模块
git submodule add <repository-url> <path>

# 克隆包含子模块的项目
git clone --recursive <repository-url>

# 更新子模块
git submodule update --init --recursive
git submodule update --remote
```

### 4. 搜索和调试

```bash
# 二分查找问题提交
git bisect start
git bisect bad  # 当前版本有问题
git bisect good <commit-hash>  # 已知好的版本
# Git 会自动二分查找

# 查找谁修改了代码
git blame <file>

# 搜索内容
git grep "function"
git grep -n "TODO"  # 显示行号
```

## 配置优化

### 全局配置

```bash
# 用户信息
git config --global user.name "Gavin"
git config --global user.email "gavin@example.com"

# 默认编辑器
git config --global core.editor "code --wait"

# 默认分支名
git config --global init.defaultBranch main

# 自动换行
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input  # Mac/Linux

# 颜色显示
git config --global color.ui auto
```

### 别名（Alias）

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

### .gitignore

```bash
# Node.js
node_modules/
npm-debug.log
.env

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
*.log
```

## 团队协作规范

### 1. 分支命名

```
feature/user-auth
bugfix/login-error
hotfix/critical-security-issue
release/v1.0.0
```

### 2. PR 规范

- 标题清晰描述变更内容
- 详细描述实现方式
- 关联相关 Issue
- 通过 CI 检查
- 至少一人 Code Review

### 3. 代码审查清单

- [ ] 代码符合项目规范
- [ ] 测试覆盖充分
- [ ] 文档已更新
- [ ] 无明显性能问题
- [ ] 无安全隐患

## 常见问题

### Q: 如何撤销已推送的提交？

```bash
# 使用 revert（推荐，保留历史）
git revert <commit-hash>
git push

# 使用 reset（不推荐，会改写历史）
git reset --hard <commit-hash>
git push -f  # 强制推送
```

### Q: 如何解决合并冲突？

```bash
# 1. 查看冲突文件
git status

# 2. 编辑文件解决冲突（移除 <<<<<<< ======= >>>>>>>）

# 3. 标记为已解决
git add <resolved-files>

# 4. 完成合并
git commit
```

### Q: 如何同步 fork 的仓库？

```bash
# 添加上游仓库
git remote add upstream <original-repo-url>

# 获取上游更新
git fetch upstream

# 合并到本地
git checkout main
git merge upstream/main

# 推送到自己的 fork
git push origin main
```

## 总结

掌握 Git 工作流和常用命令是每个开发者的必备技能。建议：

1. 选择适合团队的工作流
2. 遵循提交规范
3. 及时提交，保持小步快跑
4. 经常同步远程仓库
5. 善用 Git 工具（VS Code Git 插件、GitKraken 等）

Happy Coding! 🚀
