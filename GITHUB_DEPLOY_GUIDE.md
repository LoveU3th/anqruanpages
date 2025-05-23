# 🚀 GitHub自动部署指南

通过GitHub连接Cloudflare Pages实现自动部署的完整指南。

## 📋 前置要求

- GitHub账户
- Cloudflare账户
- Node.js >= 18.0.0
- Git

## 🛠️ 部署步骤

### 1. 准备GitHub仓库

#### 创建GitHub仓库

1. 访问 [GitHub](https://github.com)
2. 点击 "New repository"
3. 仓库名称：`safety-learning-platform`
4. 设置为公开或私有
5. 不要初始化README（因为本地已有代码）

#### 推送本地代码到GitHub

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Safety Learning Platform"

# 设置主分支
git branch -M main

# 添加GitHub远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/your-username/safety-learning-platform.git

# 推送到GitHub
git push -u origin main
```

### 2. 连接Cloudflare Pages

#### 在Cloudflare中创建Pages项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单中选择 "Pages"
3. 点击 "Create a project"
4. 选择 "Connect to Git"

#### 配置GitHub集成

1. 点击 "GitHub" 按钮
2. 如果首次使用，需要授权Cloudflare访问GitHub
3. 选择您的GitHub账户
4. 选择 `safety-learning-platform` 仓库
5. 点击 "Begin setup"

#### 配置构建设置

在构建配置页面设置以下参数：

- **Project name**: `safety-learning-platform`
- **Production branch**: `main`
- **Framework preset**: `None`
- **Build command**: `npm run build`
- **Build output directory**: `public`
- **Root directory**: `/` (留空)

点击 "Save and Deploy" 开始首次部署。

### 3. 配置环境变量

在Cloudflare Pages项目设置中添加环境变量：

1. 进入项目设置页面
2. 选择 "Environment variables" 标签
3. 添加以下变量：

```
ENVIRONMENT=production
API_BASE_URL=https://safety-learning-platform.pages.dev
```

### 4. 配置Cloudflare资源

#### 安装Wrangler CLI

```bash
npm install -g wrangler
```

#### 登录Cloudflare

```bash
wrangler login
```

#### 创建KV命名空间

```bash
# 创建生产环境KV命名空间
wrangler kv:namespace create "SAFETY_KV"

# 创建预览环境KV命名空间
wrangler kv:namespace create "SAFETY_KV" --preview
```

记录返回的命名空间ID。

#### 创建D1数据库

```bash
wrangler d1 create safety-learning-db
```

记录返回的数据库ID。

#### 更新wrangler.toml配置

将获得的ID更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "SAFETY_KV"
id = "your-actual-kv-namespace-id"
preview_id = "your-actual-preview-kv-namespace-id"

[[d1_databases]]
binding = "SAFETY_DB"
database_name = "safety-learning-db"
database_id = "your-actual-database-id"
```

提交更改：

```bash
git add wrangler.toml
git commit -m "Update Cloudflare resource IDs"
git push
```

### 5. 配置Cloudflare Pages绑定

1. 在Cloudflare Pages项目设置中
2. 选择 "Functions" 标签
3. 在 "KV namespace bindings" 部分：
   - Variable name: `SAFETY_KV`
   - KV namespace: 选择您创建的KV命名空间
4. 在 "D1 database bindings" 部分：
   - Variable name: `SAFETY_DB`
   - D1 database: 选择您创建的D1数据库
5. 保存设置

### 6. 运行数据库迁移

```bash
# 运行数据库迁移
wrangler d1 execute safety-learning-db --file=./scripts/migrate.sql

# 填充示例数据
wrangler d1 execute safety-learning-db --file=./scripts/seed.sql
```

### 7. 验证部署

1. 访问您的Cloudflare Pages URL
2. 检查所有功能是否正常工作
3. 测试API端点
4. 验证数据库连接

## 🔄 自动部署流程

配置完成后，自动部署流程如下：

1. **推送代码**到GitHub main分支
2. **Cloudflare Pages自动检测**到代码变更
3. **自动运行构建**：`npm run build`
4. **部署到生产环境**
5. **更新网站**内容

## 🎯 GitHub Actions（可选）

如果您想使用GitHub Actions进行更高级的CI/CD：

### 设置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 添加以下secrets：

```
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
```

### 获取Cloudflare API Token

1. 访问 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 "Create Token"
3. 使用 "Custom token" 模板
4. 设置权限：
   - Account: `Cloudflare Pages:Edit`
   - Zone Resources: `Include All zones`
5. 复制生成的token

### 获取Account ID

1. 在Cloudflare Dashboard右侧边栏找到 "Account ID"
2. 复制该ID

## 🔧 故障排除

### 常见问题

#### 构建失败

**问题**: 构建过程中出现错误
**解决方案**:
1. 检查Node.js版本是否为18+
2. 确保所有依赖都在package.json中
3. 检查构建命令是否正确

#### 部署成功但功能异常

**问题**: 网站部署成功但API不工作
**解决方案**:
1. 检查环境变量是否正确设置
2. 验证KV和D1绑定是否配置
3. 检查wrangler.toml中的资源ID

#### 数据库连接失败

**问题**: 无法连接到D1数据库
**解决方案**:
1. 确认数据库已创建
2. 检查数据库ID是否正确
3. 验证绑定配置
4. 确认已运行迁移脚本

### 调试技巧

1. **查看构建日志**: 在Cloudflare Pages项目中查看详细的构建日志
2. **使用本地开发**: `npm run dev` 在本地测试
3. **检查函数日志**: 在Cloudflare Dashboard中查看Functions日志
4. **验证资源**: 使用Wrangler CLI验证KV和D1资源

## 📝 最佳实践

### 分支管理

- 使用 `main` 分支作为生产环境
- 创建 `develop` 分支用于开发
- 使用Pull Request进行代码审查

### 环境管理

- 为不同环境设置不同的Cloudflare Pages项目
- 使用环境变量管理配置
- 定期备份数据库

### 安全考虑

- 定期更新依赖包
- 使用环境变量存储敏感信息
- 启用Cloudflare安全功能

## 🎉 完成！

恭喜！您已成功配置了GitHub自动部署到Cloudflare Pages。

现在每次推送代码到GitHub，您的网站都会自动更新！

---

*最后更新: 2024-01-15* 