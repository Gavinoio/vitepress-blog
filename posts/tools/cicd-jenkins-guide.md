---
title: CI/CD 与 Jenkins 完全指南
date: 2025-11-28 09:50:00
description: 全面讲解 CI/CD 持续集成和持续部署的概念与实践，深入介绍 Jenkins 的安装配置、Pipeline 编写、自动化测试、部署策略等，帮助你构建高效的 DevOps 流程。
keywords:
  - CI/CD
  - Jenkins
  - DevOps
  - 持续集成
  - 自动化部署
categories:
  - 开发工具
tags:
  - CI/CD
  - Jenkins
  - DevOps
  - 自动化
cover: https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1920
---

# CI/CD 与 Jenkins 完全指南

在现代软件开发中，CI/CD 已经成为提升开发效率、保证代码质量的重要实践。本文将全面介绍 CI/CD 的概念、实现方式，以及如何使用 Jenkins 构建完整的 CI/CD 流程。

## 什么是 CI/CD

### CI - 持续集成 (Continuous Integration)

持续集成是一种软件开发实践，开发人员会频繁地（通常每天多次）将代码集成到主分支。每次集成都通过自动化构建和测试来验证，从而尽早发现集成错误。

**核心理念：**
- 频繁提交代码到主分支
- 自动化构建和测试
- 快速反馈问题
- 保持代码始终处于可发布状态

**主要好处：**
- 及早发现和定位错误
- 减少集成问题
- 提高代码质量
- 加快开发速度
- 降低风险

### CD - 持续交付/持续部署

**持续交付 (Continuous Delivery)：**
在持续集成的基础上，将集成后的代码自动部署到测试环境或预生产环境。需要手动批准才能部署到生产环境。

**持续部署 (Continuous Deployment)：**
更进一步，代码通过所有测试后，自动部署到生产环境，无需人工干预。

```
代码提交 → 构建 → 测试 → 部署到测试环境 → [人工审批] → 部署到生产环境
          ↑_____________________ CI ____________________↑
          ↑_____________________________ CD (Delivery) ______________↑
          ↑_____________________________ CD (Deployment) ___________________↑
```

## CI/CD 的实现方式

### 1. 主流 CI/CD 平台对比

#### Jenkins
- **类型：** 开源、自托管
- **优点：** 功能强大、插件丰富、高度可定制
- **缺点：** 需要自己维护服务器
- **适用场景：** 企业级应用、需要高度定制

#### GitLab CI/CD
- **类型：** 内置在 GitLab 中
- **优点：** 与 GitLab 深度集成、配置简单
- **缺点：** 需要使用 GitLab 作为代码仓库
- **适用场景：** GitLab 用户、快速上手

#### GitHub Actions
- **类型：** 内置在 GitHub 中
- **优点：** 与 GitHub 无缝集成、免费额度充足
- **缺点：** 受限于 GitHub 生态
- **适用场景：** 开源项目、GitHub 用户

#### CircleCI
- **类型：** 云端 SaaS
- **优点：** 配置简单、性能好、云端托管
- **缺点：** 免费额度有限
- **适用场景：** 中小型团队、云端方案

#### Travis CI
- **类型：** 云端 SaaS
- **优点：** 对开源项目友好、配置简单
- **缺点：** 私有项目收费较高
- **适用场景：** 开源项目

### 2. CI/CD 工作流程

```bash
# 典型的 CI/CD 流程

# 1. 开发阶段
开发者本地开发 → 提交代码到版本控制系统

# 2. 持续集成阶段
触发 CI 构建 → 代码检出 → 安装依赖 → 编译/构建 → 运行测试
                                                     ↓
                                          测试失败 → 通知开发者
                                                     ↓
                                          测试成功 → 生成构建产物

# 3. 持续交付/部署阶段
部署到测试环境 → 自动化测试 → 部署到预生产环境 → 生产部署
```

### 3. CI/CD 配置示例

#### GitHub Actions 示例

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - name: 检出代码
      uses: actions/checkout@v3

    - name: 设置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: 安装依赖
      run: npm ci

    - name: 代码检查
      run: npm run lint

    - name: 运行测试
      run: npm test

    - name: 构建项目
      run: npm run build

    - name: 上传构建产物
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: 下载构建产物
      uses: actions/download-artifact@v3
      with:
        name: dist

    - name: 部署到服务器
      run: |
        echo "部署到生产环境..."
        # 部署命令
```

#### GitLab CI 示例

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "18"

before_script:
  - npm ci

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm run lint
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'

deploy_staging:
  stage: deploy
  script:
    - echo "部署到测试环境..."
  environment:
    name: staging
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - echo "部署到生产环境..."
  environment:
    name: production
  only:
    - main
  when: manual
```

## Jenkins 详解

### 什么是 Jenkins

Jenkins 是一个开源的自动化服务器，用于自动化各种任务，包括构建、测试和部署软件。它是最流行的 CI/CD 工具之一。

**核心特性：**
- 易于安装和配置
- 丰富的插件生态（超过 1800 个插件）
- 支持分布式构建
- 可视化的流水线配置
- 支持多种版本控制系统
- 高度可扩展和定制

### Jenkins 架构

```
┌─────────────────────────────────────────────────┐
│              Jenkins Master                      │
│  ┌─────────────┐  ┌──────────────┐             │
│  │  Web UI     │  │  API Server  │             │
│  └─────────────┘  └──────────────┘             │
│  ┌─────────────────────────────────────────┐   │
│  │      Job Scheduler & Executor           │   │
│  └─────────────────────────────────────────┘   │
└───────────────┬─────────────────┬───────────────┘
                │                 │
        ┌───────┴────┐    ┌──────┴────────┐
        │            │    │               │
   ┌────▼─────┐ ┌───▼────┐ ┌─────▼──────┐
   │ Agent 1  │ │Agent 2 │ │  Agent N   │
   │ (Linux)  │ │(Windows)│ │  (MacOS)   │
   └──────────┘ └────────┘ └────────────┘
```

### 如何搭建 Jenkins

#### 方式一：Docker 快速搭建（推荐）

```bash
# 1. 拉取 Jenkins 镜像
docker pull jenkins/jenkins:lts

# 2. 创建数据卷目录
mkdir -p ~/jenkins_home

# 3. 运行 Jenkins 容器
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v ~/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# 4. 查看初始管理员密码
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# 5. 访问 Jenkins
# 浏览器打开：http://localhost:8080
```

#### 方式二：使用 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    privileged: true
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    environment:
      - JAVA_OPTS=-Duser.timezone=Asia/Shanghai
    restart: unless-stopped

volumes:
  jenkins_home:
```

```bash
# 启动 Jenkins
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止 Jenkins
docker-compose down
```

#### 方式三：Linux 系统安装

```bash
# Ubuntu/Debian
# 1. 添加 Jenkins 仓库密钥
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# 2. 添加 Jenkins 仓库
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 3. 更新包列表并安装 Jenkins
sudo apt-get update
sudo apt-get install fontconfig openjdk-17-jre
sudo apt-get install jenkins

# 4. 启动 Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 5. 查看状态
sudo systemctl status jenkins

# 6. 查看初始密码
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### 方式四：Windows 系统安装

```powershell
# 1. 下载 Jenkins Windows 安装包
# https://www.jenkins.io/download/

# 2. 运行安装程序
# 按照安装向导完成安装

# 3. Jenkins 会作为 Windows 服务自动启动

# 4. 查看初始密码
# C:\Program Files\Jenkins\secrets\initialAdminPassword
```

### Jenkins 初始配置

#### 1. 解锁 Jenkins

```bash
# 访问 http://localhost:8080
# 输入初始管理员密码（从上面步骤获取）
```

#### 2. 安装推荐插件

Jenkins 会提供两个选项：
- **安装推荐的插件**（推荐新手）
- **选择插件安装**（高级用户）

推荐安装的核心插件：
- Git Plugin
- Pipeline
- Docker Pipeline
- Credentials Plugin
- SSH Agent
- NodeJS Plugin
- Email Extension Plugin
- Blue Ocean（现代化 UI）

#### 3. 创建管理员账号

```
用户名：admin
密码：your-secure-password
确认密码：your-secure-password
全名：Administrator
电子邮件：admin@example.com
```

#### 4. 配置实例

- Jenkins URL: `http://your-server-ip:8080`
- 系统管理员邮件地址: `admin@example.com`

### 如何使用 Jenkins

#### 1. 创建第一个任务（Freestyle Job）

```bash
# 步骤：
1. 点击 "新建任务"
2. 输入任务名称：my-first-job
3. 选择 "构建一个自由风格的软件项目"
4. 点击 "确定"
```

**配置任务：**

```yaml
# 源码管理
选择: Git
Repository URL: https://github.com/your-username/your-repo.git
Credentials: 添加 Git 凭据
Branches to build: */main

# 构建触发器
☑ GitHub hook trigger for GITScm polling  # Git 推送时自动触发
☑ Poll SCM                                # 定时检查代码变化
  Schedule: H/5 * * * *                   # 每 5 分钟检查一次

# 构建环境
☑ Delete workspace before build starts    # 构建前清理工作空间
☑ Provide Node & npm bin/ folder to PATH  # 提供 Node.js 环境

# 构建步骤
添加构建步骤 → Execute shell

#!/bin/bash
echo "开始构建..."

# 安装依赖
npm ci

# 代码检查
npm run lint

# 运行测试
npm test

# 构建项目
npm run build

echo "构建完成！"

# 构建后操作
添加构建后操作步骤 → Archive the artifacts
  Files to archive: dist/**/*

添加构建后操作步骤 → E-mail Notification
  Recipients: team@example.com
```

#### 2. 创建 Pipeline 任务（推荐）

Pipeline 是 Jenkins 的核心功能，使用代码定义整个构建流程。

**创建 Pipeline 任务：**

```groovy
// Jenkinsfile - 声明式 Pipeline
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        DOCKER_IMAGE = 'my-app'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '检出代码...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '安装依赖...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '代码检查...'
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                echo '运行测试...'
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results/**/*.xml'
                }
            }
        }

        stage('Build') {
            steps {
                echo '构建项目...'
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '构建 Docker 镜像...'
                script {
                    docker.build("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo '部署到测试环境...'
                sh '''
                    docker stop my-app-staging || true
                    docker rm my-app-staging || true
                    docker run -d --name my-app-staging -p 3000:3000 ${DOCKER_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: '确认部署到生产环境?', ok: 'Deploy'
                echo '部署到生产环境...'
                sh '''
                    docker stop my-app-prod || true
                    docker rm my-app-prod || true
                    docker run -d --name my-app-prod -p 80:3000 ${DOCKER_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }
    }

    post {
        success {
            echo '构建成功！'
            emailext (
                subject: "Jenkins Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "构建成功！查看详情: ${env.BUILD_URL}",
                to: "team@example.com"
            )
        }
        failure {
            echo '构建失败！'
            emailext (
                subject: "Jenkins Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "构建失败！查看详情: ${env.BUILD_URL}",
                to: "team@example.com"
            )
        }
        always {
            echo '清理工作空间...'
            cleanWs()
        }
    }
}
```

**脚本式 Pipeline 示例：**

```groovy
// Jenkinsfile - 脚本式 Pipeline
node {
    def app

    stage('Checkout') {
        checkout scm
    }

    stage('Build') {
        sh 'npm ci'
        sh 'npm run build'
    }

    stage('Test') {
        try {
            sh 'npm test'
        } catch (Exception e) {
            currentBuild.result = 'FAILURE'
            throw e
        } finally {
            junit 'test-results/**/*.xml'
        }
    }

    stage('Docker Build') {
        app = docker.build("my-app:${env.BUILD_NUMBER}")
    }

    stage('Deploy') {
        app.run('-d -p 3000:3000 --name my-app')
    }
}
```

#### 3. 多分支 Pipeline

多分支 Pipeline 自动为仓库中的每个分支创建 Pipeline。

```bash
# 创建步骤：
1. 新建任务 → 多分支流水线
2. 分支源 → Git
   - Project Repository: https://github.com/your-username/your-repo.git
   - Credentials: 选择或添加凭据
3. 构建配置 → by Jenkinsfile
   - Script Path: Jenkinsfile
4. 扫描多分支流水线触发器
   - 定期检测: 5 分钟
```

#### 4. 配置 Webhook（自动触发构建）

**GitHub Webhook 配置：**

```bash
# 1. 在 Jenkins 中
管理 Jenkins → 系统配置 → GitHub
- GitHub Servers → 添加 GitHub Server
- API URL: https://api.github.com
- Credentials: 添加 GitHub Personal Access Token

# 2. 在 GitHub 仓库中
Settings → Webhooks → Add webhook
- Payload URL: http://your-jenkins-url/github-webhook/
- Content type: application/json
- Events: Just the push event
- Active: ☑

# 3. 在 Jenkins 任务中
构建触发器 → ☑ GitHub hook trigger for GITScm polling
```

**GitLab Webhook 配置：**

```bash
# 1. 在 GitLab 项目中
Settings → Webhooks
- URL: http://your-jenkins-url/project/your-job-name
- Secret Token: (在 Jenkins 任务配置中生成)
- Trigger: Push events, Merge request events
- SSL verification: 根据情况选择
```

### Jenkins 高级功能

#### 1. 分布式构建（Master-Agent）

```groovy
// 指定在特定 Agent 上运行
pipeline {
    agent {
        label 'linux && docker'  // 运行在有 linux 和 docker 标签的节点
    }
    // 或者指定具体节点
    agent {
        node {
            label 'my-node-1'
        }
    }
}

// 不同阶段使用不同 Agent
pipeline {
    agent none
    stages {
        stage('Build') {
            agent { label 'linux' }
            steps {
                sh 'npm run build'
            }
        }
        stage('Test on Windows') {
            agent { label 'windows' }
            steps {
                bat 'npm test'
            }
        }
    }
}
```

**配置 Agent 节点：**

```bash
# 在 Jenkins Master 中：
1. 管理 Jenkins → 节点管理 → 新建节点
2. 节点名称: agent-1
3. 固定节点 → 确定
4. 配置：
   - 远程工作目录: /home/jenkins
   - 标签: linux docker node
   - 用法: 尽可能使用这个节点
   - 启动方式: Launch agents via SSH
   - Host: agent-server-ip
   - Credentials: 添加 SSH 凭据
```

#### 2. 参数化构建

```groovy
pipeline {
    agent any

    parameters {
        string(
            name: 'BRANCH_NAME',
            defaultValue: 'main',
            description: '要构建的分支'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: '部署环境'
        )
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: '是否运行测试'
        )
        text(
            name: 'DEPLOY_NOTES',
            defaultValue: '',
            description: '部署说明'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                echo "构建分支: ${params.BRANCH_NAME}"
                echo "目标环境: ${params.ENVIRONMENT}"
                git branch: "${params.BRANCH_NAME}",
                    url: 'https://github.com/your-repo.git'
            }
        }

        stage('Test') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo "部署到 ${params.ENVIRONMENT} 环境"
                echo "部署说明: ${params.DEPLOY_NOTES}"
                // 部署逻辑
            }
        }
    }
}
```

#### 3. 共享库（Shared Libraries）

```groovy
// vars/deployApp.groovy - 共享库定义
def call(Map config) {
    pipeline {
        agent any
        stages {
            stage('Deploy') {
                steps {
                    script {
                        echo "部署 ${config.appName} 到 ${config.environment}"
                        sh """
                            docker pull ${config.image}
                            docker stop ${config.appName} || true
                            docker rm ${config.appName} || true
                            docker run -d --name ${config.appName} \\
                                -p ${config.port}:${config.port} \\
                                ${config.image}
                        """
                    }
                }
            }
        }
    }
}

// Jenkinsfile - 使用共享库
@Library('my-shared-library') _

deployApp(
    appName: 'my-app',
    environment: 'production',
    image: 'my-app:latest',
    port: 3000
)
```

#### 4. 凭据管理

```bash
# 管理 Jenkins → Manage Credentials → 添加凭据

# 类型：
- Username with password    # 用户名密码
- SSH Username with private key  # SSH 密钥
- Secret text              # 密钥文本
- Secret file              # 密钥文件
- Certificate              # 证书
```

```groovy
// 在 Pipeline 中使用凭据
pipeline {
    agent any

    environment {
        // 用户名密码
        DOCKER_CREDS = credentials('docker-hub-credentials')
        // 密钥文本
        API_KEY = credentials('api-key')
    }

    stages {
        stage('Login') {
            steps {
                sh '''
                    echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin
                '''
            }
        }

        stage('Use Secret') {
            steps {
                // 使用 withCredentials 包装器
                withCredentials([string(credentialsId: 'api-key', variable: 'SECRET')]) {
                    sh 'curl -H "Authorization: Bearer $SECRET" https://api.example.com'
                }
            }
        }
    }
}
```

### Jenkins 最佳实践

#### 1. Pipeline 代码版本控制

```bash
# 将 Jenkinsfile 放在项目根目录
my-project/
├── src/
├── tests/
├── Jenkinsfile          # Jenkins Pipeline 定义
├── package.json
└── README.md

# 优点：
- Pipeline 代码版本化
- 与应用代码一起审查
- 支持分支特定的 Pipeline
```

#### 2. 使用声明式 Pipeline

```groovy
// ✅ 推荐：声明式 Pipeline（更易读、更规范）
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}

// ❌ 不推荐：脚本式 Pipeline（除非需要复杂逻辑）
node {
    stage('Build') {
        sh 'npm run build'
    }
}
```

#### 3. 避免在 Jenkins 中硬编码密钥

```groovy
// ❌ 错误做法
sh 'docker login -u myuser -p mypassword123'

// ✅ 正确做法
withCredentials([usernamePassword(
    credentialsId: 'docker-hub',
    usernameVariable: 'USER',
    passwordVariable: 'PASS'
)]) {
    sh 'echo $PASS | docker login -u $USER --password-stdin'
}
```

#### 4. 合理使用缓存

```groovy
// 缓存 npm 依赖
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                // 使用 npm ci 而不是 npm install（更快、更可靠）
                sh 'npm ci --cache .npm --prefer-offline'
            }
        }
    }
}
```

#### 5. 设置超时时间

```groovy
pipeline {
    agent any

    options {
        timeout(time: 1, unit: 'HOURS')  // 整体超时
        timestamps()                      // 显示时间戳
        buildDiscarder(logRotator(numToKeepStr: '10'))  // 只保留最近 10 次构建
    }

    stages {
        stage('Test') {
            options {
                timeout(time: 10, unit: 'MINUTES')  // 单个阶段超时
            }
            steps {
                sh 'npm test'
            }
        }
    }
}
```

#### 6. 并行执行

```groovy
pipeline {
    agent any
    stages {
        stage('Parallel Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
                stage('E2E Tests') {
                    steps {
                        sh 'npm run test:e2e'
                    }
                }
            }
        }
    }
}
```

### 常见问题与解决方案

#### Q1: Jenkins 占用内存过大

```bash
# 调整 Jenkins JVM 参数
# 编辑 /etc/default/jenkins 或 Docker 环境变量
JAVA_ARGS="-Xmx2048m -Xms512m"

# 清理旧构建
管理 Jenkins → 系统配置 → 丢弃旧的构建
- 保持构建的天数: 30
- 保持构建的最大个数: 10
```

#### Q2: 构建速度慢

```bash
# 解决方案：
1. 使用 Docker 缓存层
2. 启用并行构建
3. 使用分布式构建
4. 缓存依赖（npm/maven/gradle）
5. 使用增量构建
```

#### Q3: Pipeline 语法错误

```groovy
// 使用 Pipeline Syntax 生成器
// 在 Jenkins 任务页面点击 "Pipeline Syntax"

// 验证 Jenkinsfile
// 在 Jenkins 任务页面点击 "Replay" → 编辑 → 验证
```

#### Q4: 权限问题

```bash
# Docker 权限问题
# 将 jenkins 用户添加到 docker 组
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# 文件权限问题
# 确保 Jenkins 有权限访问工作目录
sudo chown -R jenkins:jenkins /var/lib/jenkins
```

## 实战案例：完整的 CI/CD 流程

### 场景：Node.js 应用的完整 CI/CD

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'registry.example.com'
        APP_NAME = 'my-node-app'
        DEPLOY_SERVER = 'prod-server.example.com'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('代码检出') {
            steps {
                echo '检出代码...'
                checkout scm
                sh 'git log -1 --pretty=format:"%h - %an: %s"'
            }
        }

        stage('环境准备') {
            steps {
                echo '准备构建环境...'
                sh '''
                    node --version
                    npm --version
                    docker --version
                '''
            }
        }

        stage('安装依赖') {
            steps {
                echo '安装 npm 依赖...'
                sh 'npm ci --cache .npm --prefer-offline'
            }
        }

        stage('代码质量检查') {
            parallel {
                stage('Lint') {
                    steps {
                        echo '运行 ESLint...'
                        sh 'npm run lint'
                    }
                }
                stage('格式检查') {
                    steps {
                        echo '运行 Prettier 检查...'
                        sh 'npm run format:check'
                    }
                }
                stage('类型检查') {
                    steps {
                        echo '运行 TypeScript 检查...'
                        sh 'npm run type-check'
                    }
                }
            }
        }

        stage('运行测试') {
            parallel {
                stage('单元测试') {
                    steps {
                        echo '运行单元测试...'
                        sh 'npm run test:unit -- --coverage'
                    }
                    post {
                        always {
                            junit 'test-results/unit/*.xml'
                            publishHTML([
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }
                stage('集成测试') {
                    steps {
                        echo '运行集成测试...'
                        sh 'npm run test:integration'
                    }
                    post {
                        always {
                            junit 'test-results/integration/*.xml'
                        }
                    }
                }
            }
        }

        stage('构建应用') {
            steps {
                echo '构建生产版本...'
                sh 'npm run build'
            }
        }

        stage('构建 Docker 镜像') {
            steps {
                echo '构建 Docker 镜像...'
                script {
                    def imageTag = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.BUILD_NUMBER}"
                    def latestTag = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:latest"

                    sh """
                        docker build -t ${imageTag} .
                        docker tag ${imageTag} ${latestTag}
                    """
                }
            }
        }

        stage('安全扫描') {
            steps {
                echo '扫描 Docker 镜像安全漏洞...'
                sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                        aquasec/trivy image ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER}
                '''
            }
        }

        stage('推送镜像') {
            steps {
                echo '推送镜像到 Docker Registry...'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                        echo $PASS | docker login ${DOCKER_REGISTRY} -u $USER --password-stdin
                        docker push ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest
                    '''
                }
            }
        }

        stage('部署到测试环境') {
            when {
                branch 'develop'
            }
            steps {
                echo '部署到测试环境...'
                sh '''
                    docker-compose -f docker-compose.staging.yml down
                    docker-compose -f docker-compose.staging.yml pull
                    docker-compose -f docker-compose.staging.yml up -d
                '''
            }
        }

        stage('部署到生产环境') {
            when {
                branch 'main'
            }
            steps {
                input message: '确认部署到生产环境？', ok: '部署'

                echo '部署到生产环境...'
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'prod-server-ssh',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh '''
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no deploy@${DEPLOY_SERVER} \\
                            "cd /opt/app && \\
                             docker-compose pull && \\
                             docker-compose up -d && \\
                             docker-compose ps"
                    '''
                }
            }
        }

        stage('健康检查') {
            when {
                branch 'main'
            }
            steps {
                echo '执行健康检查...'
                sh '''
                    for i in {1..10}; do
                        if curl -f http://${DEPLOY_SERVER}/health; then
                            echo "应用健康检查通过！"
                            exit 0
                        fi
                        echo "等待应用启动... ($i/10)"
                        sleep 10
                    done
                    echo "应用健康检查失败！"
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 构建成功！'
            emailext (
                subject: "✅ 构建成功: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>构建成功</h2>
                    <p><strong>项目:</strong> ${env.JOB_NAME}</p>
                    <p><strong>构建号:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>分支:</strong> ${env.GIT_BRANCH}</p>
                    <p><strong>提交:</strong> ${env.GIT_COMMIT}</p>
                    <p><a href="${env.BUILD_URL}">查看构建详情</a></p>
                """,
                to: "team@example.com",
                mimeType: 'text/html'
            )
        }

        failure {
            echo '❌ 构建失败！'
            emailext (
                subject: "❌ 构建失败: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>构建失败</h2>
                    <p><strong>项目:</strong> ${env.JOB_NAME}</p>
                    <p><strong>构建号:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>分支:</strong> ${env.GIT_BRANCH}</p>
                    <p><a href="${env.BUILD_URL}console">查看构建日志</a></p>
                """,
                to: "team@example.com",
                mimeType: 'text/html'
            )
        }

        always {
            echo '清理工作空间...'
            // 清理 Docker 镜像
            sh '''
                docker image prune -f
                docker container prune -f
            '''
        }
    }
}
```

### 配套的 Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

USER node

CMD ["node", "dist/index.js"]
```

### Docker Compose 配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: registry.example.com/my-node-app:latest
    container_name: my-app-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    env_file:
      - .env.production
    networks:
      - app-network
    depends_on:
      - redis
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    networks:
      - app-network
    volumes:
      - redis-data:/data

  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    networks:
      - app-network
    volumes:
      - postgres-data:/var/lib/postgresql/data

networks:
  app-network:
    driver: bridge

volumes:
  redis-data:
  postgres-data:
```

## 总结

### CI/CD 核心要点

1. **持续集成（CI）**
   - 频繁提交代码
   - 自动化构建和测试
   - 快速反馈

2. **持续交付/部署（CD）**
   - 自动化部署流程
   - 环境一致性
   - 快速发布

3. **选择合适的工具**
   - Jenkins: 功能强大、高度可定制
   - GitHub Actions: GitHub 用户首选
   - GitLab CI: GitLab 用户最佳选择
   - 其他: CircleCI, Travis CI 等

### Jenkins 使用建议

1. **使用 Pipeline as Code**
   - 将 Jenkinsfile 纳入版本控制
   - 使用声明式 Pipeline
   - 利用共享库复用代码

2. **安全第一**
   - 使用凭据管理
   - 不要硬编码密钥
   - 定期更新 Jenkins 和插件

3. **性能优化**
   - 使用分布式构建
   - 启用缓存
   - 并行执行任务

4. **监控和维护**
   - 设置合理的通知
   - 定期清理旧构建
   - 监控系统资源

### 最佳实践

- ✅ 小步提交，频繁集成
- ✅ 自动化一切可以自动化的
- ✅ 保持构建快速（< 10 分钟）
- ✅ 构建失败立即修复
- ✅ 测试要快速且可靠
- ✅ 使用版本控制管理一切
- ✅ 环境要一致（开发、测试、生产）

通过 CI/CD 和 Jenkins，我们可以大幅提升开发效率，减少人为错误，实现快速、可靠的软件交付！🚀
