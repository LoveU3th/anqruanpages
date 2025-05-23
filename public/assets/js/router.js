/**
 * 安全管理交互页面 - 路由系统
 * 负责页面切换、状态管理和导航功能
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.isNavigating = false;
        this.pageStates = new Map();
        this.navigationHistory = [];

        // 初始化路由配置
        this.initRoutes();

        // 绑定浏览器历史事件
        this.bindEvents();

        // 初始化当前页面
        this.init();
    }

    /**
     * 初始化路由配置
     * 定义所有可用的页面路由
     */
    initRoutes() {
        this.routes.set('/', {
            name: 'home',
            title: '安全管理交互页面',
            component: 'index.html',
            requiresAuth: false
        });

        this.routes.set('/video1', {
            name: 'video1',
            title: '你的选择决定安全分界-遵守规章制度-安全',
            component: 'video1.html',
            requiresAuth: false
        });

        this.routes.set('/video2', {
            name: 'video2',
            title: '你的选择决定安全分界-违规操作-不安全',
            component: 'video2.html',
            requiresAuth: false
        });

        this.routes.set('/quiz1', {
            name: 'quiz1',
            title: '测测你的主动安全意识有多强-按章操作',
            component: 'quiz1.html',
            requiresAuth: false
        });

        this.routes.set('/quiz2', {
            name: 'quiz2',
            title: '测测你的主动安全意识有多强-违规操作',
            component: 'quiz2.html',
            requiresAuth: false
        });

        this.routes.set('/admin', {
            name: 'admin',
            title: '管理页面',
            component: 'admin.html',
            requiresAuth: true
        });
    }

    /**
     * 绑定浏览器事件
     */
    bindEvents() {
        // 监听浏览器前进/后退按钮
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });

        // 监听页面卸载事件，保存当前状态
        window.addEventListener('beforeunload', () => {
            this.saveCurrentPageState();
        });

        // 拦截所有链接点击事件
        document.addEventListener('click', (event) => {
            this.handleLinkClick(event);
        });
    }

    /**
     * 初始化路由系统
     * 解析URL参数并设置初始页面
     */
    init() {
        const currentPath = this.getCurrentPath();
        const route = this.routes.get(currentPath);

        if (route) {
            this.currentRoute = route;
            this.updatePageTitle(route.title);
            this.loadPageState(currentPath);
        } else {
            // 如果路由不存在，重定向到首页
            this.navigateTo('/');
        }
    }

    /**
     * 获取当前路径
     * @returns {string} 当前页面路径
     */
    getCurrentPath() {
        return window.location.pathname;
    }

    /**
     * 导航到指定页面
     * @param {string} path - 目标页面路径
     * @param {Object} state - 页面状态（可选）
     * @param {Object} options - 导航选项
     * @returns {Promise<boolean>} - 导航是否成功
     */
    async navigateTo(path, state = {}, options = {}) {
        // 防止重复导航
        if (this.isNavigating) {
            return false;
        }

        // 验证路径是否有效
        const route = this.routes.get(path);
        if (!route) {
            console.error(`Route not found: ${path}`);
            return false;
        }

        // 检查权限
        if (route.requiresAuth && !this.checkAuth()) {
            console.warn(`Access denied to ${path}: authentication required`);
            return false;
        }

        this.isNavigating = true;

        try {
            // 触发页面离开事件
            const canLeave = await this.triggerBeforeLeave();
            if (!canLeave) {
                this.isNavigating = false;
                return false;
            }

            // 保存当前页面状态
            this.saveCurrentPageState();

            // 更新浏览器历史
            if (!options.replace) {
                window.history.pushState(state, route.title, path);
            } else {
                window.history.replaceState(state, route.title, path);
            }

            // 更新当前路由
            this.currentRoute = route;

            // 更新页面标题
            this.updatePageTitle(route.title);

            // 添加到导航历史
            this.navigationHistory.push({
                path,
                timestamp: Date.now(),
                state
            });

            // 执行页面切换动画
            await this.performPageTransition(path, options);

            // 加载页面状态
            this.loadPageState(path);

            // 触发页面进入事件
            this.triggerPageEnter(path, state);

            return true;
        } catch (error) {
            console.error('Navigation failed:', error);
            return false;
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * 处理浏览器前进/后退事件
     * @param {PopStateEvent} event - 浏览器历史事件
     */
    handlePopState(event) {
        const currentPath = this.getCurrentPath();
        const route = this.routes.get(currentPath);

        if (route) {
            this.currentRoute = route;
            this.updatePageTitle(route.title);
            this.loadPageState(currentPath);
            this.triggerPageEnter(currentPath, event.state || {});
        }
    }

    /**
     * 处理链接点击事件
     * @param {Event} event - 点击事件
     */
    handleLinkClick(event) {
        const link = event.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');

        // 只处理内部链接
        if (href.startsWith('/') && !href.startsWith('//')) {
            event.preventDefault();
            this.navigateTo(href);
        }
    }

    /**
     * 执行页面切换动画
     * @param {string} path - 目标路径
     * @param {Object} options - 动画选项
     */
    async performPageTransition(path, options = {}) {
        const duration = options.duration || 300;
        const animation = options.animation || 'fade';

        // 获取页面容器
        const container = document.querySelector('#app-container') || document.body;

        // 添加切换动画类
        container.classList.add(`transition-${animation}`);

        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, duration));

        // 移除动画类
        container.classList.remove(`transition-${animation}`);
    }

    /**
     * 更新页面标题
     * @param {string} title - 页面标题
     */
    updatePageTitle(title) {
        document.title = title;

        // 更新页面标题元素（如果存在）
        const titleElement = document.querySelector('.page-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    /**
     * 保存页面状态到会话存储
     * @param {string} path - 页面路径（可选，默认当前路径）
     * @param {Object} state - 页面状态（可选，自动收集）
     */
    savePageState(path = null, state = null) {
        const currentPath = path || this.getCurrentPath();

        if (!state) {
            state = this.collectPageState();
        }

        // 保存到内存
        this.pageStates.set(currentPath, state);

        // 保存到sessionStorage
        try {
            const stateData = {
                ...state,
                timestamp: Date.now(),
                path: currentPath
            };
            sessionStorage.setItem(`pageState_${currentPath}`, JSON.stringify(stateData));
        } catch (error) {
            console.warn('Failed to save page state to sessionStorage:', error);
        }
    }

    /**
     * 保存当前页面状态
     */
    saveCurrentPageState() {
        this.savePageState();
    }

    /**
     * 从会话存储加载页面状态
     * @param {string} path - 页面路径
     * @returns {Object|null} - 页面状态或null
     */
    loadPageState(path) {
        // 先从内存中查找
        let state = this.pageStates.get(path);

        if (!state) {
            // 从sessionStorage加载
            try {
                const stateData = sessionStorage.getItem(`pageState_${path}`);
                if (stateData) {
                    const parsed = JSON.parse(stateData);
                    // 检查状态是否过期（24小时）
                    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                        state = parsed;
                        this.pageStates.set(path, state);
                    }
                }
            } catch (error) {
                console.warn('Failed to load page state from sessionStorage:', error);
            }
        }

        if (state) {
            this.restorePageState(state);
        }

        return state;
    }

    /**
     * 收集当前页面状态
     * @returns {Object} - 页面状态对象
     */
    collectPageState() {
        const state = {
            scrollPosition: {
                x: window.scrollX,
                y: window.scrollY
            },
            formData: {},
            customData: {}
        };

        // 收集表单数据
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            const formData = new FormData(form);
            state.formData[`form_${index}`] = Object.fromEntries(formData);
        });

        // 收集自定义数据（通过事件）
        const customEvent = new CustomEvent('collectPageState', {
            detail: { state }
        });
        document.dispatchEvent(customEvent);

        return state;
    }

    /**
     * 恢复页面状态
     * @param {Object} state - 页面状态
     */
    restorePageState(state) {
        // 恢复滚动位置
        if (state.scrollPosition) {
            window.scrollTo(state.scrollPosition.x, state.scrollPosition.y);
        }

        // 恢复表单数据
        if (state.formData) {
            Object.keys(state.formData).forEach(formKey => {
                const formIndex = parseInt(formKey.split('_')[1]);
                const form = document.querySelectorAll('form')[formIndex];
                if (form) {
                    const formData = state.formData[formKey];
                    Object.keys(formData).forEach(fieldName => {
                        const field = form.querySelector(`[name="${fieldName}"]`);
                        if (field) {
                            field.value = formData[fieldName];
                        }
                    });
                }
            });
        }

        // 恢复自定义数据（通过事件）
        const customEvent = new CustomEvent('restorePageState', {
            detail: { state }
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * 触发页面离开前事件
     * @returns {Promise<boolean>} - 是否允许离开
     */
    async triggerBeforeLeave() {
        const event = new CustomEvent('beforePageLeave', {
            detail: {
                currentRoute: this.currentRoute,
                canCancel: true
            },
            cancelable: true
        });

        document.dispatchEvent(event);

        // 如果事件被取消，则不允许离开
        return !event.defaultPrevented;
    }

    /**
     * 触发页面进入事件
     * @param {string} path - 页面路径
     * @param {Object} state - 页面状态
     */
    triggerPageEnter(path, state) {
        const event = new CustomEvent('pageEnter', {
            detail: {
                path,
                route: this.currentRoute,
                state
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * 检查用户认证状态
     * @returns {boolean} - 是否已认证
     */
    checkAuth() {
        // 简单的认证检查，实际项目中应该更复杂
        return sessionStorage.getItem('adminAuth') === 'true';
    }

    /**
     * 获取当前页面信息
     * @returns {Object} - 包含当前页面路径和状态的对象
     */
    getCurrentPageInfo() {
        return {
            path: this.getCurrentPath(),
            route: this.currentRoute,
            state: this.pageStates.get(this.getCurrentPath()) || {},
            navigationHistory: this.navigationHistory
        };
    }

    /**
     * 清除页面状态
     * @param {string} path - 页面路径（可选，默认所有）
     */
    clearPageState(path = null) {
        if (path) {
            this.pageStates.delete(path);
            sessionStorage.removeItem(`pageState_${path}`);
        } else {
            this.pageStates.clear();
            // 清除所有页面状态
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('pageState_')) {
                    sessionStorage.removeItem(key);
                }
            });
        }
    }

    /**
     * 重置路由系统
     */
    reset() {
        this.clearPageState();
        this.navigationHistory = [];
        this.currentRoute = null;
        this.navigateTo('/');
    }

    /**
     * 获取路由历史
     * @returns {Array} - 导航历史数组
     */
    getNavigationHistory() {
        return [...this.navigationHistory];
    }

    /**
     * 返回上一页
     * @returns {boolean} - 是否成功返回
     */
    goBack() {
        if (this.navigationHistory.length > 1) {
            window.history.back();
            return true;
        }
        return false;
    }

    /**
     * 前进到下一页
     * @returns {boolean} - 是否成功前进
     */
    goForward() {
        window.history.forward();
        return true;
    }
}

// 创建全局路由实例
let router = null;

/**
 * 初始化路由系统
 * @param {Object} options - 初始化选项
 * @returns {Router} - 路由实例
 */
function initRouter(options = {}) {
    if (!router) {
        router = new Router(options);
    }
    return router;
}

/**
 * 获取路由实例
 * @returns {Router|null} - 路由实例
 */
function getRouter() {
    return router;
}

/**
 * 导航到指定页面（便捷函数）
 * @param {string} path - 目标页面路径
 * @param {Object} state - 页面状态（可选）
 * @param {Object} options - 导航选项
 * @returns {Promise<boolean>} - 导航是否成功
 */
async function navigateTo(path, state = {}, options = {}) {
    if (router) {
        return await router.navigateTo(path, state, options);
    }
    console.error('Router not initialized');
    return false;
}

/**
 * 获取当前页面信息（便捷函数）
 * @returns {Object} - 当前页面信息
 */
function getCurrentPageInfo() {
    if (router) {
        return router.getCurrentPageInfo();
    }
    return null;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Router,
        initRouter,
        getRouter,
        navigateTo,
        getCurrentPageInfo
    };
} else {
    // 浏览器环境，添加到全局对象
    window.SafetyRouter = {
        Router,
        initRouter,
        getRouter,
        navigateTo,
        getCurrentPageInfo
    };
} 