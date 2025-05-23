#!/usr/bin/env node

/**
 * 安全管理交互学习平台 - GitHub部署准备脚本
 * 准备项目以便通过GitHub连接到Cloudflare Pages实现自动部署
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            encoding: 'utf8',
            stdio: 'inherit',
            ...options
        });
        return result;
    } catch (error) {
        log(`❌ 命令执行失败: ${command}`, 'red');
        log(error.message, 'red');
        process.exit(1);
    }
}

function checkPrerequisites() {
    log('🔍 检查部署环境...', 'cyan');

    // 检查 Node.js 版本
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 18) {
            log(`❌ Node.js 版本过低: ${nodeVersion}，需要 >= 18.0.0`, 'red');
            process.exit(1);
        }
        log(`✅ Node.js 版本: ${nodeVersion}`, 'green');
    } catch (error) {
        log('❌ 未找到 Node.js', 'red');
        process.exit(1);
    }

    // 检查 Git
    try {
        const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
        log(`✅ Git 版本: ${gitVersion}`, 'green');
    } catch (error) {
        log('❌ 未找到 Git，请先安装 Git', 'red');
        process.exit(1);
    }

    // 检查是否在Git仓库中
    try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        log('✅ Git 仓库检查通过', 'green');
    } catch (error) {
        log('❌ 当前目录不是Git仓库，请先初始化Git仓库', 'red');
        process.exit(1);
    }

    // 检查配置文件
    if (!existsSync('wrangler.toml')) {
        log('❌ 未找到 wrangler.toml 配置文件', 'red');
        process.exit(1);
    }
    log('✅ 配置文件检查通过', 'green');
}

function buildProject() {
    log('🔨 构建项目...', 'cyan');

    // 安装依赖
    if (!existsSync('node_modules')) {
        log('📦 安装依赖包...', 'yellow');
        execCommand('npm install');
    }

    // 运行构建
    log('🏗️ 构建生产版本...', 'yellow');
    execCommand('npm run build');

    log('✅ 项目构建完成', 'green');
}

function checkGitStatus() {
    log('📋 检查Git状态...', 'cyan');

    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
            log('⚠️ 有未提交的更改，建议先提交所有更改', 'yellow');
            log('未提交的文件:', 'yellow');
            console.log(status);
        } else {
            log('✅ 工作目录干净，没有未提交的更改', 'green');
        }
    } catch (error) {
        log('⚠️ 无法检查Git状态', 'yellow');
    }
}

function generateGitHubActions() {
    log('⚙️ 生成GitHub Actions工作流...', 'cyan');

    const workflowDir = '.github/workflows';
    const workflowFile = `${workflowDir}/deploy.yml`;

    // 创建目录
    if (!existsSync('.github')) {
        execCommand('mkdir .github');
    }
    if (!existsSync(workflowDir)) {
        execCommand('mkdir .github/workflows');
    }

    const workflowContent = `name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
      - master
  pull_request:
    branches:
      - main
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: safety-learning-platform
          directory: public
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}
`;

    writeFileSync(workflowFile, workflowContent);
    log(`✅ GitHub Actions工作流已创建: ${workflowFile}`, 'green');
}

function generateDeploymentGuide() {
    log('📋 生成部署指南...', 'cyan');

    const guideContent = `# GitHub自动部署指南

## 🚀 通过GitHub连接Cloudflare Pages实现自动部署

### 1. 准备GitHub仓库

1. 在GitHub上创建新仓库
2. 将本地代码推送到GitHub仓库：

\`\`\`bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/safety-learning-platform.git
git push -u origin main
\`\`\`

### 2. 连接Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Pages" 部分
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 授权GitHub并选择您的仓库
6. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: \`npm run build\`
   - **Build output directory**: \`public\`
   - **Root directory**: \`/\` (留空)

### 3. 配置环境变量

在Cloudflare Pages项目设置中添加以下环境变量：

\`\`\`
ENVIRONMENT=production
API_BASE_URL=https://your-project-name.pages.dev
\`\`\`

### 4. 配置Cloudflare资源

#### 创建KV命名空间：
\`\`\`bash
wrangler kv:namespace create "SAFETY_KV"
wrangler kv:namespace create "SAFETY_KV" --preview
\`\`\`

#### 创建D1数据库：
\`\`\`bash
wrangler d1 create safety-learning-db
\`\`\`

#### 更新wrangler.toml中的资源ID

### 5. 设置GitHub Secrets（可选 - 用于GitHub Actions）

如果使用GitHub Actions进行部署，需要在GitHub仓库设置中添加以下Secrets：

- \`CLOUDFLARE_API_TOKEN\`: Cloudflare API令牌
- \`CLOUDFLARE_ACCOUNT_ID\`: Cloudflare账户ID

### 6. 自动部署

配置完成后，每次推送到main分支都会自动触发部署。

## 📝 注意事项

1. 首次部署后，需要手动运行数据库迁移
2. 确保所有环境变量都已正确配置
3. 检查KV和D1资源的绑定是否正确

## 🔧 故障排除

- 如果构建失败，检查Node.js版本是否为18+
- 如果部署失败，检查环境变量配置
- 如果功能异常，检查KV和D1资源绑定

---
生成时间: ${new Date().toISOString()}
`;

    writeFileSync('GITHUB_DEPLOY_GUIDE.md', guideContent);
    log('✅ 部署指南已生成: GITHUB_DEPLOY_GUIDE.md', 'green');
}

function updatePackageJson() {
    log('📦 更新package.json脚本...', 'cyan');

    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

    // 更新脚本，移除直接部署相关的脚本
    packageJson.scripts = {
        ...packageJson.scripts,
        "prepare-deploy": "node scripts/deploy.js",
        "build:production": "NODE_ENV=production npm run build"
    };

    // 移除不需要的部署脚本
    delete packageJson.scripts.deploy;
    delete packageJson.scripts["deploy:staging"];
    delete packageJson.scripts["deploy:production"];

    writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
    log('✅ package.json已更新', 'green');
}

function showInstructions() {
    log('\n🎉 GitHub部署准备完成！', 'green');
    log('📝 下一步操作:', 'cyan');
    log('1. 提交所有更改到Git仓库', 'yellow');
    log('   git add .', 'blue');
    log('   git commit -m "Prepare for GitHub deployment"', 'blue');
    log('', 'reset');
    log('2. 推送到GitHub仓库', 'yellow');
    log('   git remote add origin https://github.com/your-username/safety-learning-platform.git', 'blue');
    log('   git branch -M main', 'blue');
    log('   git push -u origin main', 'blue');
    log('', 'reset');
    log('3. 在Cloudflare Pages中连接GitHub仓库', 'yellow');
    log('   - 访问 https://dash.cloudflare.com/pages', 'blue');
    log('   - 点击 "Create a project" > "Connect to Git"', 'blue');
    log('   - 选择您的GitHub仓库', 'blue');
    log('   - 构建命令: npm run build', 'blue');
    log('   - 输出目录: public', 'blue');
    log('', 'reset');
    log('4. 配置Cloudflare资源（KV和D1）', 'yellow');
    log('5. 运行数据库迁移', 'yellow');
    log('', 'reset');
    log('📚 详细说明请查看 GITHUB_DEPLOY_GUIDE.md', 'blue');
}

function main() {
    log('🚀 安全管理交互学习平台 - GitHub部署准备脚本', 'bright');
    log('📦 准备通过GitHub自动部署到Cloudflare Pages', 'cyan');
    log('=' * 60, 'blue');

    try {
        checkPrerequisites();
        buildProject();
        checkGitStatus();
        generateGitHubActions();
        updatePackageJson();
        generateDeploymentGuide();
        showInstructions();
    } catch (error) {
        log(`❌ 准备失败: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main as prepareGitHubDeploy }; 