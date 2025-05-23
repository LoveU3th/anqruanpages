-- 安全管理交互学习平台数据库迁移脚本
-- 创建时间: 2024-01-15
-- 版本: 1.0.0

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    employee_id VARCHAR(50),
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学习内容表
CREATE TABLE IF NOT EXISTS learning_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'document', 'interactive')),
    content_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    duration INTEGER, -- 学习时长（秒）
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category VARCHAR(100),
    tags TEXT, -- JSON 格式存储标签
    prerequisites TEXT, -- JSON 格式存储前置条件
    learning_objectives TEXT, -- JSON 格式存储学习目标
    is_mandatory BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id INTEGER NOT NULL REFERENCES learning_content(id) ON DELETE CASCADE,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER, -- 实际学习时长（秒）
    progress REAL DEFAULT 0.0 CHECK (progress >= 0 AND progress <= 100), -- 学习进度百分比
    completion_status VARCHAR(20) DEFAULT 'in_progress' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'paused')),
    last_position INTEGER DEFAULT 0, -- 视频播放位置等
    notes TEXT, -- 用户笔记
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 用户评分
    feedback TEXT, -- 用户反馈
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

-- 测试题库表
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES learning_content(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false', 'fill_blank', 'essay')),
    options TEXT, -- JSON 格式存储选项
    correct_answers TEXT NOT NULL, -- JSON 格式存储正确答案
    explanation TEXT, -- 答案解释
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    points INTEGER DEFAULT 1, -- 题目分值
    category VARCHAR(100),
    tags TEXT, -- JSON 格式存储标签
    usage_count INTEGER DEFAULT 0, -- 使用次数
    correct_rate REAL DEFAULT 0.0, -- 正确率
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 测试试卷表
CREATE TABLE IF NOT EXISTS quiz_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_id INTEGER REFERENCES learning_content(id) ON DELETE SET NULL,
    question_ids TEXT NOT NULL, -- JSON 格式存储题目ID列表
    total_points INTEGER NOT NULL,
    pass_score INTEGER NOT NULL, -- 及格分数
    time_limit INTEGER, -- 时间限制（分钟）
    attempt_limit INTEGER DEFAULT 3, -- 尝试次数限制
    is_random BOOLEAN DEFAULT FALSE, -- 是否随机出题
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 测试记录表
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id INTEGER NOT NULL REFERENCES quiz_papers(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER, -- 实际用时（秒）
    answers TEXT, -- JSON 格式存储用户答案
    score INTEGER DEFAULT 0,
    total_points INTEGER NOT NULL,
    pass_status VARCHAR(20) DEFAULT 'in_progress' CHECK (pass_status IN ('in_progress', 'passed', 'failed', 'timeout')),
    auto_submit BOOLEAN DEFAULT FALSE, -- 是否自动提交
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学习路径表
CREATE TABLE IF NOT EXISTS learning_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_ids TEXT NOT NULL, -- JSON 格式存储内容ID列表
    estimated_duration INTEGER, -- 预估学习时长（小时）
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    prerequisites TEXT, -- JSON 格式存储前置条件
    target_audience TEXT, -- 目标受众
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户学习路径进度表
CREATE TABLE IF NOT EXISTS user_path_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_id INTEGER NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    current_content_id INTEGER REFERENCES learning_content(id),
    completed_content_ids TEXT, -- JSON 格式存储已完成内容ID列表
    progress REAL DEFAULT 0.0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, path_id)
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    category VARCHAR(50), -- 通知分类
    related_id INTEGER, -- 关联的记录ID
    related_type VARCHAR(50), -- 关联的记录类型
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- 是否对前端公开
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    old_values TEXT, -- JSON 格式存储修改前的值
    new_values TEXT, -- JSON 格式存储修改后的值
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_learning_content_type ON learning_content(content_type);
CREATE INDEX IF NOT EXISTS idx_learning_content_category ON learning_content(category);
CREATE INDEX IF NOT EXISTS idx_learning_content_status ON learning_content(status);

CREATE INDEX IF NOT EXISTS idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_content_id ON learning_records(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_status ON learning_records(completion_status);
CREATE INDEX IF NOT EXISTS idx_learning_records_created_at ON learning_records(created_at);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_content_id ON quiz_questions(content_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_paper_id ON quiz_attempts(paper_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(pass_status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 插入默认系统配置
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_title', '安全管理交互学习平台', 'string', '网站标题', TRUE),
('site_description', '企业安全管理交互式学习平台', 'string', '网站描述', TRUE),
('max_login_attempts', '5', 'number', '最大登录尝试次数', FALSE),
('session_timeout', '3600', 'number', '会话超时时间（秒）', FALSE),
('quiz_default_time_limit', '60', 'number', '测试默认时间限制（分钟）', TRUE),
('learning_progress_save_interval', '30', 'number', '学习进度保存间隔（秒）', TRUE),
('notification_retention_days', '30', 'number', '通知保留天数', FALSE),
('audit_log_retention_days', '90', 'number', '审计日志保留天数', FALSE),
('enable_registration', 'false', 'boolean', '是否允许用户注册', TRUE),
('enable_email_notifications', 'true', 'boolean', '是否启用邮件通知', FALSE),
('maintenance_mode', 'false', 'boolean', '维护模式', TRUE);

-- 创建默认管理员用户（密码: admin123，实际部署时应修改）
INSERT OR IGNORE INTO users (
    username, 
    email, 
    password_hash, 
    full_name, 
    role, 
    status,
    created_at
) VALUES (
    'admin',
    'admin@safety-learning.com',
    '$2b$12$LQv3c1yqBwEHFl5aBLloe.uyWi/QVqUqx/3rUO/nUJ.VHVmO2/my.',
    '系统管理员',
    'admin',
    'active',
    CURRENT_TIMESTAMP
);

-- 创建触发器：自动更新 updated_at 字段
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_learning_content_updated_at 
    AFTER UPDATE ON learning_content
    FOR EACH ROW
    BEGIN
        UPDATE learning_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_learning_records_updated_at 
    AFTER UPDATE ON learning_records
    FOR EACH ROW
    BEGIN
        UPDATE learning_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_quiz_questions_updated_at 
    AFTER UPDATE ON quiz_questions
    FOR EACH ROW
    BEGIN
        UPDATE quiz_questions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_quiz_papers_updated_at 
    AFTER UPDATE ON quiz_papers
    FOR EACH ROW
    BEGIN
        UPDATE quiz_papers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_quiz_attempts_updated_at 
    AFTER UPDATE ON quiz_attempts
    FOR EACH ROW
    BEGIN
        UPDATE quiz_attempts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_learning_paths_updated_at 
    AFTER UPDATE ON learning_paths
    FOR EACH ROW
    BEGIN
        UPDATE learning_paths SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_user_path_progress_updated_at 
    AFTER UPDATE ON user_path_progress
    FOR EACH ROW
    BEGIN
        UPDATE user_path_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_system_settings_updated_at 
    AFTER UPDATE ON system_settings
    FOR EACH ROW
    BEGIN
        UPDATE system_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END; 