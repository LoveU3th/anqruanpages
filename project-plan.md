# 安全管理交互页面项目规划 (Cloudflare Pages版本)

## 项目概述

本项目旨在创建一个用于安全管理的交互式网页应用，部署在Cloudflare Pages平台上。应用主要功能包括：

- **视频学习**：提供安全教育视频内容，展示正确操作与违规操作的对比
- **知识测试**：通过随机抽取的安全意识测试题，检验学习效果
- **数据统计**：记录和分析访问数据，跟踪学习效果

应用包含4个主要页面（2个视频页面和2个答题页面）以及1个管理页面。整个应用采用现代前端架构，利用Cloudflare Pages的静态托管能力和Functions功能，题库数据存储在Cloudflare KV空间，视频采用嵌入外部链接的方式。

## 页面结构

应用包含以下5个页面，形成完整的安全学习和测试流程：

### 学习模块

1. **视频页面1**：《你的选择决定安全分界-遵守规章制度-安全》
   - 全屏播放预设视频，展示正确安全操作流程
   - 在移动设备上自动全屏播放，优化移动端体验
   - 视频结束后提供导航至测试页面的选项

2. **视频页面2**：《你的选择决定安全分界-违规操作-不安全》
   - 全屏播放预设视频，展示违规操作的危险性
   - 在移动设备上自动全屏播放，确保良好观看体验
   - 视频结束后提供导航至测试页面的选项

### 测试模块

3. **答题页面1**：《测测你的主动安全意识有多强-按章操作》
   - 包含10道安全意识测试题（从KV存储的题库中随机抽取）
   - 实时反馈答题正确性，增强学习效果
   - 满分时显示恭喜特效，强化正面激励

4. **答题页面2**：《测测你的主动安全意识有多强-违规操作》
   - 包含10道安全意识测试题（从KV存储的题库中随机抽取）
   - 题目侧重于识别和规避违规操作
   - 规避违章成功满分时显示恭喜特效，强化安全意识

### 管理模块

5. **管理页面**：位于`/admin`路径
   - 提供题库管理（增删查改），便于内容更新
   - 提供视频链接管理，支持更换视频源
   - 查看访问统计数据，分析学习效果
   - 需要基本认证保护，确保管理安全

## 技术架构

### 前端技术栈

- **现代前端框架**：使用原生JavaScript + 模块化架构，确保快速加载和良好兼容性
- **单页应用(SPA)架构**：使用前端路由实现页面切换，提升用户体验
- **响应式设计**：采用CSS Grid和Flexbox，确保在各种设备上良好显示
- **PWA支持**：实现Service Worker缓存和离线功能
- **模块化CSS**：使用CSS模块化和自定义属性，便于维护和主题切换

### 后端服务

- **Cloudflare Pages Functions**：提供服务器端API功能，处理数据请求
- **Cloudflare KV存储**：存储应用数据，包括题库、视频链接和访问统计
- **Cloudflare D1数据库**：存储结构化数据和用户统计信息
- **基本认证(Basic Auth)**：保护管理页面，控制访问权限

### 项目文件结构

整个应用采用现代前端项目结构，便于开发、维护和部署：

```
project-root/
├── public/                          # 静态资源目录
│   ├── index.html                   # 主页面入口
│   ├── video1.html                  # 安全操作视频页面
│   ├── video2.html                  # 违规操作视频页面
│   ├── quiz1.html                   # 主动安全意识测试页面
│   ├── quiz2.html                   # 违规操作测试页面
│   ├── admin.html                   # 管理页面
│   ├── manifest.json                # PWA配置文件
│   ├── sw.js                        # Service Worker
│   ├── assets/                      # 静态资源
│   │   ├── css/                     # 样式文件
│   │   │   ├── main.css             # 主样式文件
│   │   │   ├── components.css       # 组件样式
│   │   │   ├── pages.css            # 页面特定样式
│   │   │   └── admin.css            # 管理页面样式
│   │   ├── js/                      # JavaScript文件
│   │   │   ├── app.js               # 主应用逻辑
│   │   │   ├── router.js            # 路由管理
│   │   │   ├── video-player.js      # 视频播放器
│   │   │   ├── quiz-system.js       # 答题系统
│   │   │   ├── data-manager.js      # 数据管理
│   │   │   ├── ui-components.js     # UI组件
│   │   │   ├── utils.js             # 工具函数
│   │   │   └── admin.js             # 管理系统
│   │   ├── images/                  # 图片资源
│   │   │   ├── icons/               # 图标文件
│   │   │   ├── backgrounds/         # 背景图片
│   │   │   └── illustrations/       # 插图素材
│   │   └── fonts/                   # 字体文件
│   └── _headers                     # Cloudflare Pages头部配置
├── functions/                       # Cloudflare Pages Functions
│   ├── api/                         # API路由
│   │   ├── questions.js             # 题目API
│   │   ├── stats.js                 # 统计API
│   │   ├── videos.js                # 视频API
│   │   └── admin/                   # 管理API
│   │       ├── auth.js              # 认证API
│   │       ├── questions.js         # 题目管理API
│   │       └── stats.js             # 统计管理API
│   └── _middleware.js               # 中间件配置
├── src/                             # 源代码目录（开发时使用）
│   ├── components/                  # 可复用组件
│   ├── pages/                       # 页面组件
│   ├── utils/                       # 工具函数
│   └── styles/                      # 样式源文件
├── scripts/                         # 构建和部署脚本
│   ├── build.js                     # 构建脚本
│   ├── deploy.js                    # 部署脚本
│   └── setup-kv.js                  # KV数据初始化脚本
├── wrangler.toml                    # Cloudflare配置文件
├── package.json                     # 项目依赖配置
├── .gitignore                       # Git忽略文件
└── README.md                        # 项目说明文档
```

## 核心功能模块

应用由以下几个核心功能模块组成，每个模块负责特定功能并相互协作：

### 1. 路由系统 (router.js)

路由系统是应用的核心，负责页面切换和状态管理：

- 实现基于History API的前端路由，支持浏览器前进/后退
- 提供流畅的页面间导航功能，无需刷新页面
- 保存用户当前页面状态，支持页面状态恢复
- 处理页面切换动画，提升用户体验

#### 函数设计

```javascript
/**
 * 初始化路由系统
 * 解析URL参数并设置初始页面
 */
function initRouter() {
  // 解析URL路径，确定初始页面
  // 设置默认页面（首页或上次访问页面）
  // 绑定历史状态事件(popstate)
  // 初始化页面切换动画
  // 注册路由变化监听器
}

/**
 * 导航到指定页面
 * @param {string} path - 目标页面路径
 * @param {Object} state - 页面状态（可选）
 * @returns {boolean} - 导航是否成功
 */
function navigateTo(path, state = {}) {
  // 验证路径是否有效
  // 触发页面离开事件(beforeLeave)
  // 保存当前页面状态到sessionStorage
  // 更新浏览器历史和URL
  // 加载目标页面内容
  // 执行页面进入动画
  // 返回导航结果
}

/**
 * 获取当前页面信息
 * @returns {Object} - 包含当前页面路径和状态的对象
 */
function getCurrentPageInfo() {
  // 返回当前活动页面路径和相关状态
  // 包括页面参数和滚动位置等
}

/**
 * 保存页面状态到会话存储
 * @param {string} path - 页面路径
 * @param {Object} state - 页面状态
 */
function savePageState(path, state) {
  // 序列化状态对象
  // 保存到sessionStorage，使用路径作为键名
  // 设置过期时间，避免存储过多数据
}

/**
 * 从会话存储加载页面状态
 * @param {string} path - 页面路径
 * @returns {Object|null} - 页面状态或null（无保存状态时）
 */
function loadPageState(path) {
  // 从sessionStorage读取指定页面的状态
  // 反序列化并验证数据完整性
  // 返回状态对象或null
}
```

### 2. 视频播放模块 (video-player.js)

视频播放模块负责安全教育视频的加载和播放控制：

- 支持全屏视频播放，提供沉浸式学习体验
- 智能检测设备类型并自动适配最佳播放模式
- 提供完整播放控制（播放/暂停/重播/音量/进度）
- 视频结束后提供清晰的导航选项和学习引导
- 从Cloudflare KV存储动态获取视频链接，便于内容更新
- 记录视频观看数据，用于学习效果分析

#### 函数设计

```javascript
/**
 * 获取视频URL
 * @param {string} videoId - 视频ID标识符
 * @returns {Promise<string>} - 视频URL
 */
async function getVideoUrl(videoId) {
  // 从API获取视频URL
  // 验证URL有效性
  // 返回有效URL或默认URL（当存储中无数据时）
  const response = await fetch(`/api/videos/${videoId}`);
  const data = await response.json();
  return data.url;
}

/**
 * 初始化视频播放器
 * @param {string} videoId - 视频元素ID
 * @param {string} videoUrl - 视频URL
 * @param {Function} onEnded - 视频结束回调函数
 * @returns {HTMLElement} - 初始化后的视频元素
 */
function initVideoPlayer(videoId, videoUrl, onEnded) {
  // 获取视频DOM元素
  // 设置视频源和属性（自动播放、循环等）
  // 绑定事件监听器（播放、暂停、结束等）
  // 根据设备类型适配播放器
  // 添加自定义播放控制UI
  // 设置视频结束回调
  // 返回初始化后的视频元素
}

/**
 * 检测设备类型并适配视频播放
 * @param {HTMLElement} videoElement - 视频DOM元素
 * @returns {Object} - 包含设备类型和适配结果的对象
 */
function detectDeviceAndAdapt(videoElement) {
  // 检测设备类型（桌面/平板/手机）
  // 检测屏幕方向（横向/纵向）
  // 检测浏览器对全屏API的支持
  // 根据设备类型调整视频播放器尺寸和控制方式
  // 设置适合当前设备的播放质量
  // 返回设备信息和适配结果
}

/**
 * 切换视频全屏状态
 * @param {HTMLElement} videoElement - 视频DOM元素
 * @param {boolean} fullscreen - 是否全屏
 * @returns {boolean} - 操作是否成功
 */
function toggleFullscreen(videoElement, fullscreen) {
  // 检查全屏API兼容性
  // 根据参数请求进入或退出全屏
  // 处理全屏变化事件
  // 调整UI元素在全屏模式下的显示
  // 返回操作结果
}

/**
 * 处理视频播放结束事件
 * @param {string} videoId - 视频元素ID
 * @param {Function} callback - 回调函数
 */
function handleVideoEnded(videoId, callback) {
  // 显示视频结束UI（重播按钮、下一步选项等）
  // 记录视频完成观看状态
  // 提供相关学习建议
  // 显示导航到测试页面的选项
  // 执行自定义回调函数
}

/**
 * 预加载视频资源
 * @param {string} videoUrl - 视频URL
 * @param {Object} options - 预加载选项
 */
function preloadVideo(videoUrl, options = {}) {
  // 创建预加载请求
  // 设置预加载范围（元数据/部分内容/完整视频）
  // 根据网络状况调整预加载策略
  // 监控预加载进度
}

/**
 * 更新视频链接
 * @param {string} videoId - 视频ID
 * @param {string} videoUrl - 新的视频URL
 * @returns {Promise<boolean>} - 更新是否成功
 */
async function updateVideoUrl(videoId, videoUrl) {
  // 验证URL格式和可访问性
  // 检查视频内容类型
  // 通过API更新视频链接
  // 记录更新操作日志
  const response = await fetch(`/api/admin/videos/${videoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: videoUrl })
  });
  return response.ok;
}
```

### 3. 答题系统 (quiz-system.js)

答题系统是应用的核心学习评估组件，负责测试用户的安全知识掌握程度：

- **题库管理**：从Cloudflare KV存储中随机抽取10道题目，确保每次测试内容新鲜
- **多题型支持**：支持单选题、多选题和判断题，全面测试安全知识
- **实时反馈**：答题后立即提供正确/错误反馈，增强学习效果
- **进度跟踪**：显示答题进度和剩余题目数量，提供清晰指引
- **计分系统**：智能记录用户得分，区分不同题型的分值
- **结果分析**：详细分析答题情况，提供针对性的安全知识建议
- **满分激励**：达到满分时提供特殊视觉和声音反馈，增强成就感

#### 函数设计

```javascript
/**
 * 初始化答题系统
 * @param {string} quizType - 答题类型（active_safety 或 unauthorized）
 * @param {Object} options - 配置选项（计时、难度等）
 * @returns {Object} - 初始化后的答题系统状态
 */
async function initQuiz(quizType, options = {}) {
  // 从API获取题目数据
  const questions = await fetchQuestions(quizType, options);
  // 验证题目数据完整性
  // 初始化题库和答题状态
  // 设置计时器（如果启用）
  // 随机打乱题目顺序（可选）
  // 创建答题进度跟踪
  // 渲染答题界面框架
  // 显示第一道题目
  // 返回初始化状态
}

/**
 * 从API获取题目
 * @param {string} quizType - 题目类型
 * @param {Object} options - 获取选项
 * @returns {Promise<Array>} - 题目数组
 */
async function fetchQuestions(quizType, options = {}) {
  const params = new URLSearchParams({
    type: quizType,
    count: options.count || 10,
    ...(options.difficulty && { difficulty: options.difficulty })
  });
  
  const response = await fetch(`/api/questions?${params}`);
  const data = await response.json();
  return data.questions;
}

/**
 * 渲染当前题目
 * @param {number} questionIndex - 题目索引
 * @returns {HTMLElement} - 渲染后的题目容器
 */
function renderQuestion(questionIndex) {
  // 获取当前题目数据
  // 确定题目类型（单选/多选/判断）
  // 构建题目标题和描述DOM
  // 创建选项列表，根据题型设置不同样式
  // 添加选项交互效果
  // 绑定选项点击事件处理器
  // 更新答题进度指示器
  // 返回题目容器元素
}

/**
 * 处理用户答题
 * @param {number} questionIndex - 题目索引
 * @param {number|Array} answerIndex - 用户选择的答案索引
 * @returns {Object} - 包含答案正确性和详细反馈的对象
 */
function handleAnswer(questionIndex, answerIndex) {
  // 获取当前题目和正确答案
  // 根据题型验证答案正确性
  // 计算本题得分
  // 更新用户答题记录和总分
  // 显示答案正确性反馈
  // 如果答错，显示正确答案和解释
  // 启用"下一题"按钮
  // 记录答题时间
  // 返回包含答题结果的对象
}

/**
 * 导航到下一题
 * @returns {Object} - 包含下一题状态的对象
 */
function nextQuestion() {
  // 保存当前题目的答题状态
  // 更新当前题目索引
  // 检查是否为最后一题
  // 如果还有题目，渲染下一题
  // 如果已完成所有题目，准备显示结果
  // 更新进度指示器
  // 返回包含下一题状态的对象
}

/**
 * 计算并显示最终得分
 * @returns {Object} - 包含详细得分数据和分析的对象
 */
function calculateAndShowResult() {
  // 计算总分和百分比
  // 分析答题情况（正确题数、错误题数、用时）
  // 生成针对性的反馈和建议
  // 渲染结果页面，显示详细得分
  // 检查是否达到满分
  // 如果满分，触发满分特效
  // 提供重新测试和查看错题选项
  // 保存答题记录到本地存储
  // 提交成绩到服务器（可选）
  // 返回包含详细结果的对象
}

/**
 * 重置答题状态
 * @param {boolean} newQuestions - 是否获取新题目
 * @returns {Promise<boolean>} - 重置是否成功
 */
async function resetQuiz(newQuestions = false) {
  // 清除当前答题记录和状态
  // 重置得分和计时器
  // 如果需要新题目，从服务器获取
  // 重新初始化答题系统
  // 返回第一题
  // 返回重置结果
}
```

### 4. 数据管理模块 (data-manager.js)

数据管理模块负责应用数据的存储、检索和同步：

- **本地数据管理**：使用localStorage和sessionStorage管理用户状态
- **API通信**：与Cloudflare Pages Functions进行数据交互
- **缓存策略**：实现智能缓存，减少网络请求
- **离线支持**：提供离线数据访问和同步功能
- **数据验证**：确保数据完整性和安全性

#### 函数设计

```javascript
/**
 * 初始化应用数据
 * @param {Object} options - 初始化选项
 * @returns {Object} - 初始化后的用户数据
 */
function initAppData(options = {}) {
  // 创建默认数据结构
  // 生成唯一会话ID（使用UUID v4）
  // 检测设备信息（类型、浏览器、操作系统）
  // 尝试从localStorage加载已有数据
  // 验证数据完整性和版本兼容性
  // 合并默认数据和已保存数据
  // 记录首次/最近访问时间
  // 增加访问计数
  // 初始化用户偏好设置
  // 返回完整的用户数据对象
}

/**
 * 保存应用数据到本地存储
 * @param {Object} data - 要保存的数据
 * @param {Object} options - 保存选项
 * @returns {boolean} - 保存是否成功
 */
function saveAppData(data, options = {}) {
  // 验证数据完整性
  // 选择性保存（可只更新部分数据）
  // 序列化数据（可选压缩）
  // 处理存储限制（分块存储大数据）
  // 设置数据过期时间
  // 保存到localStorage
  // 返回保存结果
}

/**
 * 从API获取随机题目
 * @param {string} questionType - 题库类型
 * @param {Object} options - 抽取选项
 * @returns {Promise<Array>} - 随机抽取的题目数组
 */
async function getRandomQuestions(questionType, options = {}) {
  // 设置默认选项（题目数量、难度范围等）
  // 构建API请求参数
  // 发送请求到Pages Functions
  // 处理响应和错误
  // 验证返回的题目数据
  // 记录已抽取题目ID，避免短期内重复
  // 返回格式化后的题目数组
}

/**
 * 记录用户行为数据
 * @param {string} action - 行为类型
 * @param {Object} data - 行为数据
 * @returns {Promise<boolean>} - 记录是否成功
 */
async function logUserAction(action, data = {}) {
  // 获取用户会话ID和设备信息
  // 创建行为记录对象
  // 添加时间戳和上下文信息
  // 发送到统计API
  // 处理响应和错误
  // 返回记录结果
}

/**
 * 更新用户进度
 * @param {string} type - 进度类型（video/quiz）
 * @param {string} id - 内容ID
 * @param {Object} progress - 进度数据
 * @returns {Object} - 更新后的进度
 */
function updateUserProgress(type, id, progress) {
  // 获取当前用户数据
  // 验证进度数据
  // 更新对应的进度记录
  // 检查是否完成学习目标
  // 更新成就和统计
  // 保存更新后的数据
  // 返回更新后的进度
}
```

### 5. UI组件系统 (ui-components.js)

UI组件系统提供可复用的界面组件，确保界面一致性和开发效率：

- **模态框组件**：用于显示重要信息和确认操作
- **进度条组件**：显示学习和答题进度
- **通知组件**：提供用户反馈和状态提示
- **加载组件**：显示数据加载状态
- **表单组件**：统一的表单输入和验证

#### 函数设计

```javascript
/**
 * 创建模态框
 * @param {Object} options - 模态框配置
 * @returns {Object} - 模态框控制对象
 */
function createModal(options = {}) {
  // 创建模态框DOM结构
  // 设置标题、内容和按钮
  // 添加动画效果
  // 绑定事件处理器
  // 返回控制对象（显示、隐藏、更新）
}

/**
 * 创建进度条
 * @param {HTMLElement} container - 容器元素
 * @param {Object} options - 进度条配置
 * @returns {Object} - 进度条控制对象
 */
function createProgressBar(container, options = {}) {
  // 创建进度条DOM结构
  // 设置样式和动画
  // 实现进度更新方法
  // 返回控制对象（更新进度、设置状态）
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型（success/error/warning/info）
 * @param {Object} options - 通知选项
 * @returns {Object} - 通知控制对象
 */
function showNotification(message, type = 'info', options = {}) {
  // 创建通知DOM元素
  // 设置消息内容和样式
  // 添加显示动画
  // 设置自动隐藏定时器
  // 绑定关闭事件
  // 返回控制对象（关闭、更新）
}

/**
 * 创建加载指示器
 * @param {HTMLElement} container - 容器元素
 * @param {Object} options - 加载器配置
 * @returns {Object} - 加载器控制对象
 */
function createLoader(container, options = {}) {
  // 创建加载器DOM结构
  // 设置加载动画
  // 添加加载文本（可选）
  // 返回控制对象（显示、隐藏、更新文本）
}
```

## Cloudflare Pages Functions API设计

### API路由结构

```
/api/
├── questions              # 题目相关API
│   ├── GET /api/questions # 获取题目列表
├── videos                 # 视频相关API
│   ├── GET /api/videos/:id # 获取视频信息
├── stats                  # 统计相关API
│   ├── GET /api/stats     # 获取公开统计
│   ├── POST /api/stats/action # 记录用户行为
└── admin/                 # 管理相关API（需要认证）
    ├── auth               # 认证API
    │   ├── POST /api/admin/auth/login
    │   └── POST /api/admin/auth/logout
    ├── questions          # 题目管理API
    │   ├── GET /api/admin/questions
    │   ├── POST /api/admin/questions
    │   ├── PUT /api/admin/questions/:id
    │   └── DELETE /api/admin/questions/:id
    ├── videos             # 视频管理API
    │   ├── GET /api/admin/videos
    │   ├── PUT /api/admin/videos/:id
    └── stats              # 统计管理API
        └── GET /api/admin/stats
```

### Functions实现示例

#### 题目API (functions/api/questions.js)

```javascript
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 获取查询参数
  const type = url.searchParams.get('type') || 'active_safety';
  const count = parseInt(url.searchParams.get('count') || '10');
  const difficulty = url.searchParams.get('difficulty');
  
  try {
    // 确定题库键名
    const questionBankKey = type === 'unauthorized'
      ? 'unauthorized_operation_questions'
      : 'active_safety_questions';
    
    // 从KV存储获取题库
    const questionBank = await env.SAFETY_CONTENT.get(questionBankKey, { type: 'json' });
    
    if (!questionBank) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Question bank not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 过滤题目（如果指定了难度）
    let filteredQuestions = questionBank;
    if (difficulty) {
      filteredQuestions = questionBank.filter(q => q.difficulty === parseInt(difficulty));
    }
    
    // 随机抽取题目
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, count);
    
    return new Response(JSON.stringify({
      success: true,
      questions: selectedQuestions
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

#### 视频API (functions/api/videos/[id].js)

```javascript
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const videoId = params.id;
  
  try {
    // 从KV存储获取视频信息
    const videoData = await env.SAFETY_CONTENT.get(`video_${videoId}`, { type: 'json' });
    
    if (!videoData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Video not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      video: videoData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

#### 统计API (functions/api/stats.js)

```javascript
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 获取公开统计数据
    const stats = await env.SAFETY_STATS.get('public_stats', { type: 'json' });
    
    return new Response(JSON.stringify({
      success: true,
      stats: stats || {
        totalVisits: 0,
        totalQuizzes: 0,
        averageScore: 0
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const actionData = await request.json();
    
    // 记录用户行为
    const timestamp = new Date().toISOString();
    const logEntry = {
      ...actionData,
      timestamp,
      ip: request.headers.get('CF-Connecting-IP'),
      userAgent: request.headers.get('User-Agent')
    };
    
    // 存储到KV（可以使用时间戳作为键名）
    await env.SAFETY_STATS.put(`action_${timestamp}`, JSON.stringify(logEntry));
    
    // 更新统计计数器
    await updateStatsCounters(env, actionData);
    
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateStatsCounters(env, actionData) {
  // 获取当前统计数据
  const stats = await env.SAFETY_STATS.get('public_stats', { type: 'json' }) || {
    totalVisits: 0,
    totalQuizzes: 0,
    averageScore: 0
  };
  
  // 根据行为类型更新计数器
  switch (actionData.action) {
    case 'page_visit':
      stats.totalVisits++;
      break;
    case 'quiz_completed':
      stats.totalQuizzes++;
      // 更新平均分数
      if (actionData.score !== undefined) {
        stats.averageScore = ((stats.averageScore * (stats.totalQuizzes - 1)) + actionData.score) / stats.totalQuizzes;
      }
      break;
  }
  
  // 保存更新后的统计数据
  await env.SAFETY_STATS.put('public_stats', JSON.stringify(stats));
}
```

## 部署配置

### wrangler.toml配置

```toml
name = "safety-training-app"
compatibility_date = "2024-01-01"

[env.production]
account_id = "your-account-id"
pages_build_output_dir = "public"

[[env.production.kv_namespaces]]
binding = "SAFETY_CONTENT"
id = "your-content-kv-namespace-id"

[[env.production.kv_namespaces]]
binding = "SAFETY_STATS"
id = "your-stats-kv-namespace-id"

[env.production.vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = "your-hashed-password"
```

### package.json配置

```json
{
  "name": "safety-training-app",
  "version": "1.0.0",
  "description": "安全管理交互页面应用",
  "scripts": {
    "dev": "wrangler pages dev public --kv SAFETY_CONTENT --kv SAFETY_STATS",
    "build": "node scripts/build.js",
    "deploy": "wrangler pages deploy public",
    "setup": "node scripts/setup-kv.js"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  }
}
```

### 部署流程

1. **环境准备**
   ```bash
   # 安装依赖
   npm install
   
   # 登录Cloudflare
   npx wrangler login
   
   # 创建KV命名空间
   npx wrangler kv:namespace create "SAFETY_CONTENT"
   npx wrangler kv:namespace create "SAFETY_STATS"
   ```

2. **初始化数据**
   ```bash
   # 运行数据初始化脚本
   npm run setup
   ```

3. **本地开发**
   ```bash
   # 启动开发服务器
   npm run dev
   ```

4. **构建和部署**
   ```bash
   # 构建项目
   npm run build
   
   # 部署到Cloudflare Pages
   npm run deploy
   ```

## 数据结构设计

### 题库数据结构

题库数据存储在Cloudflare KV空间中，使用以下键名进行组织：
- `active_safety_questions`: 主动安全意识题库
- `unauthorized_operation_questions`: 违规操作题库

每个题库采用JSON数组格式：

```javascript
const questions = [
  {
    id: 1,
    type: "single",                            // 题目类型：single(单选)、multiple(多选)、boolean(判断)
    difficulty: 2,                             // 难度级别：1-5
    category: "operation_safety",              // 题目分类
    question: "在进行高空作业时，以下哪项安全措施是必须的？",
    options: [
      "佩戴安全帽和安全带",
      "填写作业许可证",
      "通知周围人员",
      "以上都是"
    ],
    correctAnswer: 3,                          // 正确答案索引
    explanation: "高空作业必须同时采取这三项安全措施，确保作业安全",
    tags: ["高空作业", "个人防护", "作业许可"],
    createdAt: "2023-05-15T08:30:00Z",
    updatedAt: "2023-05-20T14:20:00Z"
  }
  // 更多题目...
];
```

### 视频数据结构

视频信息存储在KV中，键名格式为`video_{id}`：

```javascript
const videoData = {
  id: "video1",
  title: "你的选择决定安全分界-遵守规章制度-安全",
  description: "展示正确安全操作流程的教育视频",
  url: "https://example.com/safety-video-1.mp4",
  thumbnail: "https://example.com/thumbnails/video1.jpg",
  duration: 180,                               // 视频时长（秒）
  category: "safety_operation",
  tags: ["安全操作", "规章制度", "标准流程"],
  createdAt: "2023-05-15T08:30:00Z",
  updatedAt: "2023-05-20T14:20:00Z"
};
```

### 用户数据结构

用户数据主要存储在浏览器本地存储中：

```javascript
const userData = {
  sessionId: "user-1234-5678-abcd",
  deviceInfo: {
    type: "mobile",
    browser: "chrome",
    os: "android"
  },
  firstVisit: "2023-05-20T10:00:00Z",
  lastVisit: "2023-05-20T10:30:00Z",
  visitCount: 3,
  
  // 导航状态
  currentPage: "/quiz1",
  navigationHistory: ["/", "/video1", "/quiz1"],
  
  // 答题进度
  quizProgress: {
    quiz1: {
      currentQuestion: 3,
      questions: [1, 5, 8, 12, 15, 18, 22, 25, 28, 30],
      answers: [0, 2, 1],
      correctCount: 2,
      score: 20,
      startedAt: "2023-05-20T10:25:00Z",
      completedAt: null,
      timeSpent: 180
    },
    quiz2: {
      currentQuestion: 0,
      questions: [],
      answers: [],
      correctCount: 0,
      score: 0,
      startedAt: null,
      completedAt: null,
      timeSpent: 0
    }
  },
  
  // 视频观看进度
  videoProgress: {
    video1: {
      watched: true,
      progress: 100,
      lastPosition: 180,
      watchedAt: "2023-05-20T10:20:00Z",
      watchCount: 1
    },
    video2: {
      watched: false,
      progress: 0,
      lastPosition: 0,
      watchedAt: null,
      watchCount: 0
    }
  },
  
  // 成就和统计
  achievements: {
    perfectScore: false,
    allVideosWatched: false,
    allQuizzesCompleted: false,
    fastestCompletion: null
  }
};
```

## 管理系统设计

### 管理页面功能

管理系统位于`/admin`路径，提供以下功能：

1. **题库管理**
   - 查看、添加、编辑和删除题目
   - 按类型、难度和标签筛选题目
   - 批量导入和导出题目
   - 题目预览和测试

2. **视频内容管理**
   - 更新视频链接和元数据
   - 预览视频内容
   - 设置视频缩略图和描述

3. **数据分析与统计**
   - 实时访问数据展示
   - 学习效果分析
   - 用户行为分析
   - 数据可视化图表

### 认证中间件 (functions/_middleware.js)

```javascript
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  
  // 检查是否为管理路径
  if (url.pathname.startsWith('/api/admin/')) {
    // 验证认证
    const authResult = await authenticateAdmin(request, env);
    if (!authResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Basic realm="Admin Area"'
        }
      });
    }
    
    // 将用户信息添加到上下文
    context.user = authResult.user;
  }
  
  // 继续处理请求
  return next();
}

async function authenticateAdmin(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return { success: false };
  }
  
  try {
    const credentials = atob(authHeader.slice(6));
    const [username, password] = credentials.split(':');
    
    // 验证用户名和密码
    if (username === env.ADMIN_USERNAME && 
        await verifyPassword(password, env.ADMIN_PASSWORD_HASH)) {
      return {
        success: true,
        user: { username, role: 'admin' }
      };
    }
    
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}

async function verifyPassword(password, hash) {
  // 实现密码验证逻辑
  // 这里可以使用bcrypt或其他哈希算法
  return password === hash; // 简化示例
}
```

## PWA支持

### Service Worker (public/sw.js)

```javascript
const CACHE_NAME = 'safety-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/video1.html',
  '/video2.html',
  '/quiz1.html',
  '/quiz2.html',
  '/admin.html',
  '/assets/css/main.css',
  '/assets/js/app.js',
  '/assets/js/router.js',
  '/assets/js/video-player.js',
  '/assets/js/quiz-system.js',
  '/assets/js/data-manager.js',
  '/assets/js/ui-components.js'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 请求拦截
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存的资源
        if (response) {
          return response;
        }
        
        // 网络请求
        return fetch(event.request)
          .then(response => {
            // 检查是否为有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应
            const responseToCache = response.clone();
            
            // 缓存新资源
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        // 网络失败，返回离线页面
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});
```

### PWA配置 (public/manifest.json)

```json
{
  "name": "安全管理交互页面",
  "short_name": "安全培训",
  "description": "安全管理交互式学习和测试平台",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/assets/images/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/assets/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["education", "productivity"],
  "lang": "zh-CN"
}
```

## 部署与维护计划

### Cloudflare Pages部署流程

应用将部署在Cloudflare Pages平台上，利用其全球分布式网络提供低延迟访问：

1. **准备工作**
   - 创建Cloudflare账户并激活Pages服务
   - 设置自定义域名（可选）
   - 创建KV命名空间用于数据存储

2. **项目配置**
   - 配置wrangler.toml文件
   - 设置环境变量和KV绑定
   - 配置构建和部署脚本

3. **数据初始化**
   - 运行KV数据初始化脚本
   - 上传初始题库和视频数据
   - 设置管理员账户

4. **部署流程**
   - 连接Git仓库到Cloudflare Pages
   - 配置自动部署触发器
   - 设置构建命令和输出目录

5. **监控和维护**
   - 配置错误监控和日志记录
   - 设置性能监控和报警
   - 定期备份数据和配置

### 性能优化策略

1. **资源优化**
   - 压缩CSS和JavaScript文件
   - 优化图片格式和大小
   - 实现资源懒加载

2. **缓存策略**
   - 配置适当的缓存头
   - 实现Service Worker缓存
   - 使用CDN加速静态资源

3. **代码优化**
   - 实现代码分割和按需加载
   - 优化关键渲染路径
   - 减少DOM操作和重绘

### 安全措施

1. **数据安全**
   - 实现数据加密和安全传输
   - 配置适当的CORS策略
   - 实现输入验证和防护

2. **访问控制**
   - 实现强密码策略
   - 配置IP白名单（可选）
   - 实现会话管理和超时

3. **监控和审计**
   - 记录所有管理操作
   - 监控异常访问模式
   - 实现安全事件报警

## 未来发展规划

### 功能扩展计划

1. **内容丰富**
   - 扩充题库，增加更多安全知识领域
   - 添加更多高质量视频内容
   - 开发情景模拟测试

2. **用户体验增强**
   - 实现个性化学习路径
   - 添加游戏化元素
   - 优化移动端体验

3. **社交功能**
   - 实现团队学习模式
   - 添加讨论和评论功能
   - 开发安全知识竞赛

### 技术升级计划

1. **架构优化**
   - 考虑迁移到现代前端框架
   - 实现微前端架构
   - 优化API设计和性能

2. **数据分析**
   - 集成高级分析工具
   - 实现机器学习推荐
   - 开发预测性分析

3. **平台扩展**
   - 开发移动应用
   - 集成第三方系统
   - 支持多租户架构

这个修改后的项目计划完全适配了Cloudflare Pages平台的部署要求，采用了现代的前端架构和Pages Functions，提供了完整的开发、部署和维护指南。
