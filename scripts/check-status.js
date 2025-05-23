#!/usr/bin/env node

/**
 * 项目状态检查脚本
 * 用于验证部署状态和资源配置
 * 
 * 使用方法:
 * node scripts/check-status.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
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

function logSection(title) {
    log(`\n${'='.repeat(50)}`, 'cyan');
    log(`${title}`, 'cyan');
    log(`${'='.repeat(50)}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// 执行命令并返回结果
function execCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message, output: error.stdout };
    }
}

// 检查文件是否存在
function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

// 检查必需文件
function checkRequiredFiles() {
    logSection('检查必需文件');

    const requiredFiles = [
        'package.json',
        'wrangler.toml',
        'public/index.html',
        'public/manifest.json',
        'public/sw.js',
        'functions/api/stats.js',
        'scripts/migrate.sql',
        'scripts/seed.sql',
        '.gitignore',
        'README.md'
    ];

    let allFilesExist = true;

    requiredFiles.forEach(file => {
        if (checkFileExists(file)) {
            logSuccess(`${file} 存在`);
        } else {
            logError(`${file} 缺失`);
            allFilesExist = false;
        }
    });

    return allFilesExist;
}

// 检查Node.js版本
function checkNodeVersion() {
    logSection('检查Node.js版本');

    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    logInfo(`当前Node.js版本: ${nodeVersion}`);

    if (majorVersion >= 18) {
        logSuccess('Node.js版本符合要求 (>= 18.0.0)');
        return true;
    } else {
        logError('Node.js版本过低，需要 >= 18.0.0');
        return false;
    }
}

// 检查依赖安装
function checkDependencies() {
    logSection('检查依赖安装');

    if (!checkFileExists('node_modules')) {
        logError('node_modules 目录不存在，请运行 npm install');
        return false;
    }

    logSuccess('依赖已安装');

    // 检查关键依赖
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const keyDependencies = ['chart.js', 'date-fns', 'jest', 'eslint'];

    keyDependencies.forEach(dep => {
        if (dependencies[dep]) {
            logSuccess(`${dep} 已安装`);
        } else {
            logWarning(`${dep} 未在package.json中找到`);
        }
    });

    return true;
}

// 检查Wrangler配置
function checkWranglerConfig() {
    logSection('检查Wrangler配置');

    if (!checkFileExists('wrangler.toml')) {
        logError('wrangler.toml 文件不存在');
        return false;
    }

    const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');

    // 检查关键配置
    const checks = [
        { pattern: /name\s*=\s*["']safety-learning-platform["']/, name: '项目名称' },
        { pattern: /pages_build_output_dir\s*=\s*["']public["']/, name: '构建输出目录' },
        { pattern: /\[\[kv_namespaces\]\]/, name: 'KV命名空间配置' },
        { pattern: /\[\[d1_databases\]\]/, name: 'D1数据库配置' }
    ];

    checks.forEach(check => {
        if (check.pattern.test(wranglerConfig)) {
            logSuccess(`${check.name} 配置正确`);
        } else {
            logWarning(`${check.name} 配置可能缺失或不正确`);
        }
    });

    return true;
}

// 检查Wrangler CLI
function checkWranglerCLI() {
    logSection('检查Wrangler CLI');

    const result = execCommand('wrangler --version', { silent: true });

    if (result.success) {
        logSuccess(`Wrangler CLI 已安装: ${result.output.trim()}`);
        return true;
    } else {
        logError('Wrangler CLI 未安装，请运行: npm install -g wrangler');
        return false;
    }
}

// 检查Cloudflare认证
function checkCloudflareAuth() {
    logSection('检查Cloudflare认证');

    const result = execCommand('wrangler whoami', { silent: true });

    if (result.success && !result.output.includes('not authenticated')) {
        logSuccess('已登录Cloudflare');
        logInfo(`用户信息: ${result.output.trim()}`);
        return true;
    } else {
        logWarning('未登录Cloudflare，请运行: wrangler login');
        return false;
    }
}

// 检查项目构建
function checkBuild() {
    logSection('检查项目构建');

    logInfo('正在运行构建测试...');
    const result = execCommand('npm run build', { silent: true });

    if (result.success) {
        logSuccess('项目构建成功');
        return true;
    } else {
        logError('项目构建失败');
        logError(result.error);
        return false;
    }
}

// 检查代码质量
function checkCodeQuality() {
    logSection('检查代码质量');

    // 检查ESLint
    logInfo('运行ESLint检查...');
    const lintResult = execCommand('npm run lint', { silent: true });

    if (lintResult.success) {
        logSuccess('ESLint检查通过');
    } else {
        logWarning('ESLint检查发现问题');
        if (lintResult.output) {
            console.log(lintResult.output);
        }
    }

    return true;
}

// 检查Git状态
function checkGitStatus() {
    logSection('检查Git状态');

    if (!checkFileExists('.git')) {
        logWarning('Git仓库未初始化');
        return false;
    }

    const statusResult = execCommand('git status --porcelain', { silent: true });

    if (statusResult.success) {
        if (statusResult.output.trim() === '') {
            logSuccess('工作目录干净，没有未提交的更改');
        } else {
            logWarning('有未提交的更改:');
            console.log(statusResult.output);
        }
    }

    // 检查远程仓库
    const remoteResult = execCommand('git remote -v', { silent: true });
    if (remoteResult.success && remoteResult.output.trim()) {
        logSuccess('Git远程仓库已配置');
        logInfo('远程仓库:');
        console.log(remoteResult.output);
    } else {
        logWarning('Git远程仓库未配置');
    }

    return true;
}

// 生成状态报告
function generateStatusReport(checks) {
    logSection('状态报告');

    const passed = checks.filter(check => check.passed).length;
    const total = checks.length;

    log(`\n总体状态: ${passed}/${total} 项检查通过`, passed === total ? 'green' : 'yellow');

    if (passed === total) {
        logSuccess('🎉 所有检查都通过了！项目已准备好部署。');
    } else {
        logWarning('⚠️  有一些检查未通过，请查看上面的详细信息。');
    }

    // 生成建议
    log('\n📋 建议的下一步操作:', 'cyan');

    if (!checks.find(c => c.name === 'Cloudflare认证').passed) {
        log('1. 登录Cloudflare: wrangler login');
    }

    if (!checks.find(c => c.name === 'Git状态').passed) {
        log('2. 初始化Git仓库并添加远程仓库');
    }

    if (passed === total) {
        log('3. 运行部署脚本: node scripts/deploy.js');
        log('4. 或推送到GitHub进行自动部署');
    }
}

// 主函数
async function main() {
    log('🔍 安全学习平台 - 项目状态检查', 'bright');
    log('检查项目配置和部署准备情况\n', 'blue');

    const checks = [
        { name: '必需文件', fn: checkRequiredFiles },
        { name: 'Node.js版本', fn: checkNodeVersion },
        { name: '依赖安装', fn: checkDependencies },
        { name: 'Wrangler配置', fn: checkWranglerConfig },
        { name: 'Wrangler CLI', fn: checkWranglerCLI },
        { name: 'Cloudflare认证', fn: checkCloudflareAuth },
        { name: '项目构建', fn: checkBuild },
        { name: '代码质量', fn: checkCodeQuality },
        { name: 'Git状态', fn: checkGitStatus }
    ];

    const results = [];

    for (const check of checks) {
        try {
            const passed = await check.fn();
            results.push({ name: check.name, passed });
        } catch (error) {
            logError(`检查 ${check.name} 时出错: ${error.message}`);
            results.push({ name: check.name, passed: false });
        }
    }

    generateStatusReport(results);
}

// 运行检查
if (require.main === module) {
    main().catch(error => {
        logError(`检查过程中出现错误: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { main }; 