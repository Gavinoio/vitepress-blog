# 解决 503 Service Unavailable 错误

## 问题分析

你的控制台显示多个 `.js` 文件返回 503 错误：
- `archives.md.DFiNEAFb.js`
- `about.md.BbHFseP9.js`
- `categories.md.BWsaMBTq.js`
- 以及多个文章页面的 JS 文件

这是因为 Cloudflare 的缓存规则过于激进，导致某些动态生成的 JS 文件被错误缓存或阻止。

## 解决方案

### 方案 1：调整 Cloudflare Cache Rules（推荐）

1. **登录 Cloudflare Dashboard**
2. **进入 Caching → Cache Rules**
3. **修改或删除可能导致问题的规则**

#### 检查现有规则

如果你之前创建了 "Static Assets Cache" 规则，需要修改它：

**原规则（可能有问题）：**
- When: URI Path contains `/assets/`
- Then: Cache everything

**修改为（更精确）：**
- When:
  - URI Path contains `/assets/`
  - AND File extension is one of: `css`, `png`, `jpg`, `jpeg`, `gif`, `svg`, `woff`, `woff2`, `ttf`, `eot`, `ico`, `webp`, `mp4`
  - AND NOT URI Path contains `.md.`
- Then:
  - Eligible for cache: Yes
  - Edge TTL: 1 month
  - Browser TTL: 1 month

**关键点：** 添加 `AND NOT URI Path contains '.md.'` 排除 VitePress 动态生成的 markdown 相关 JS 文件。

### 方案 2：使用 Page Rules 排除特定路径

1. **进入 Rules → Page Rules**
2. **创建新规则：**

**规则：排除动态 JS 文件**
- URL Pattern: `huangguanhao.com/assets/*.md.*.js`
- Settings:
  - Cache Level: **Bypass**
  - Disable Performance

**优先级：** 设置为 1（最高优先级）

### 方案 3：清除 Cloudflare 缓存（临时解决）

1. **进入 Caching → Configuration**
2. **点击 "Purge Everything"**
3. **等待 30 秒后刷新网站**

这只是临时解决方案，需要配合方案 1 或 2 才能彻底解决。

### 方案 4：使用 Transform Rules 添加缓存控制头

1. **进入 Rules → Transform Rules → Modify Response Header**
2. **创建新规则：**

**规则名称：** VitePress Dynamic JS No Cache

**When incoming requests match:**
- URI Path matches regex: `.*\.md\.[A-Za-z0-9]+\.js$`

**Then:**
- Set static: `Cache-Control` = `no-cache, no-store, must-revalidate`

## 推荐配置

### 最佳实践：分层缓存策略

#### 规则 1：动态 JS 文件不缓存（优先级 1）
- **When:** URI Path matches regex `.*\.md\.[A-Za-z0-9]+\.js$`
- **Then:** Cache Level = Bypass

#### 规则 2：静态资源长期缓存（优先级 2）
- **When:**
  - File extension is one of: `css`, `png`, `jpg`, `jpeg`, `gif`, `svg`, `woff`, `woff2`, `ttf`, `eot`, `ico`, `webp`
  - AND URI Path contains `/assets/`
- **Then:**
  - Edge TTL: 1 month
  - Browser TTL: 1 month

#### 规则 3：HTML 短期缓存（优先级 3）
- **When:** File extension is `html` OR URI Path is `/`
- **Then:**
  - Edge TTL: 2 hours
  - Browser TTL: 30 minutes

## 验证修复

修改配置后，按以下步骤验证：

1. **清除 Cloudflare 缓存**
   ```bash
   # 在 Cloudflare Dashboard: Caching → Configuration → Purge Everything
   ```

2. **清除浏览器缓存**
   - Chrome: Ctrl+Shift+Delete → 清除缓存
   - 或使用无痕模式测试

3. **检查控制台**
   - 打开 Chrome DevTools → Console
   - 刷新页面
   - 确认没有 503 错误

4. **检查网络请求**
   - Chrome DevTools → Network
   - 查看 `.md.*.js` 文件的响应头
   - 应该看到 `cf-cache-status: DYNAMIC` 或 `MISS`（而不是 `HIT`）

## 为什么会出现这个问题？

VitePress 使用代码分割（Code Splitting）技术：
- 每个 markdown 文件（如 `archives.md`）会生成对应的 JS 文件
- 文件名包含内容哈希（如 `DFiNEAFb`）
- 当内容更新时，哈希会变化，生成新文件名

如果 Cloudflare 缓存了旧的路由映射，但新的 JS 文件还没有被缓存，就会出现 503 错误。

## 注意事项

1. **不要缓存包含 `.md.` 的 JS 文件** - 这些是 VitePress 动态生成的
2. **每次部署后清除缓存** - 确保用户获取最新内容
3. **使用 Bypass 而不是短 TTL** - 对于动态内容，完全不缓存更安全
4. **优先级很重要** - 确保排除规则的优先级高于通用缓存规则

## 快速修复命令

如果你想快速测试，可以暂时禁用所有 Cache Rules：

1. 进入 Cloudflare Dashboard
2. Caching → Cache Rules
3. 将所有规则切换为 "Disabled"
4. 刷新网站测试
5. 如果问题解决，说明确实是缓存规则导致的
6. 然后按照上面的推荐配置重新创建规则
