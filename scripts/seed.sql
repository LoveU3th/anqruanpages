-- 安全管理交互学习平台示例数据填充脚本
-- 创建时间: 2024-01-15
-- 版本: 1.0.0

-- 插入示例学习内容
INSERT OR IGNORE INTO learning_content (
    id, title, description, content_type, content_url, thumbnail_url, 
    duration, difficulty_level, category, tags, learning_objectives, 
    is_mandatory, sort_order, status, created_by
) VALUES 
(1, '工作场所安全基础', '介绍工作场所安全的基本概念和重要性', 'video', 
 '/videos/workplace-safety-basics.mp4', '/images/thumbnails/workplace-safety.jpg',
 1800, 'beginner', '基础安全', '["安全基础", "工作场所", "入门"]',
 '["了解工作场所安全的重要性", "掌握基本安全规则", "识别常见安全隐患"]',
 TRUE, 1, 'active', 1),

(2, '个人防护设备使用指南', '详细介绍各种个人防护设备的正确使用方法', 'video',
 '/videos/ppe-guide.mp4', '/images/thumbnails/ppe-guide.jpg',
 2400, 'beginner', '个人防护', '["PPE", "防护设备", "安全装备"]',
 '["正确选择防护设备", "掌握穿戴方法", "了解维护保养"]',
 TRUE, 2, 'active', 1),

(3, '化学品安全管理', '化学品的安全存储、使用和处置方法', 'video',
 '/videos/chemical-safety.mp4', '/images/thumbnails/chemical-safety.jpg',
 3000, 'intermediate', '化学安全', '["化学品", "危险品", "MSDS"]',
 '["识别化学品危险性", "掌握安全操作程序", "了解应急处理"]',
 TRUE, 3, 'active', 1),

(4, '消防安全与应急疏散', '消防安全知识和应急疏散程序', 'video',
 '/videos/fire-safety.mp4', '/images/thumbnails/fire-safety.jpg',
 2700, 'intermediate', '消防安全', '["消防", "疏散", "应急"]',
 '["掌握消防器材使用", "了解疏散路线", "学会应急响应"]',
 TRUE, 4, 'active', 1),

(5, '高空作业安全规范', '高空作业的安全要求和防护措施', 'video',
 '/videos/height-work-safety.mp4', '/images/thumbnails/height-work.jpg',
 3600, 'advanced', '特殊作业', '["高空作业", "安全带", "脚手架"]',
 '["掌握高空作业规范", "正确使用防坠设备", "识别高空风险"]',
 FALSE, 5, 'active', 1),

(6, '机械设备安全操作', '机械设备的安全操作和维护', 'video',
 '/videos/machinery-safety.mp4', '/images/thumbnails/machinery-safety.jpg',
 2100, 'intermediate', '设备安全', '["机械安全", "设备操作", "维护"]',
 '["掌握设备操作规程", "了解安全防护装置", "学会日常维护"]',
 FALSE, 6, 'active', 1);

-- 插入示例测试题目
INSERT OR IGNORE INTO quiz_questions (
    id, content_id, question_text, question_type, options, correct_answers,
    explanation, difficulty_level, points, category, tags, created_by
) VALUES 
-- 工作场所安全基础题目
(1, 1, '以下哪项不是工作场所安全的基本原则？', 'single_choice',
 '["预防为主", "安全第一", "效率优先", "综合治理"]', '["效率优先"]',
 '工作场所安全的基本原则是安全第一、预防为主、综合治理，效率不能优先于安全。',
 'easy', 2, '基础安全', '["安全原则"]', 1),

(2, 1, '发现安全隐患时应该怎么做？', 'single_choice',
 '["立即报告", "视而不见", "等别人处理", "下班后再说"]', '["立即报告"]',
 '发现安全隐患应立即报告相关部门或负责人，及时消除隐患。',
 'easy', 2, '基础安全', '["隐患处理"]', 1),

(3, 1, '以下哪些是常见的工作场所安全隐患？', 'multiple_choice',
 '["湿滑地面", "杂乱堆放", "照明不足", "通风良好"]', '["湿滑地面", "杂乱堆放", "照明不足"]',
 '湿滑地面、杂乱堆放、照明不足都是常见的安全隐患，通风良好是安全的条件。',
 'medium', 3, '基础安全', '["安全隐患"]', 1),

-- 个人防护设备题目
(4, 2, '安全帽的主要作用是什么？', 'single_choice',
 '["保暖", "防撞击", "装饰", "防雨"]', '["防撞击"]',
 '安全帽的主要作用是保护头部免受撞击、穿刺等伤害。',
 'easy', 2, '个人防护', '["安全帽"]', 1),

(5, 2, '使用安全带时需要注意什么？', 'multiple_choice',
 '["检查是否损坏", "正确佩戴", "定期更换", "可以借给他人"]', '["检查是否损坏", "正确佩戴", "定期更换"]',
 '使用安全带前要检查是否损坏，正确佩戴，定期更换。安全带属于个人防护用品，不应借给他人使用。',
 'medium', 3, '个人防护', '["安全带"]', 1),

(6, 2, '防护眼镜可以防护哪些危害？', 'true_false',
 '["化学飞溅", "强光刺激", "飞溅物体", "所有危害"]', '["化学飞溅", "强光刺激", "飞溅物体"]',
 '防护眼镜可以防护化学飞溅、强光刺激、飞溅物体等危害，但不能防护所有危害。',
 'medium', 2, '个人防护', '["防护眼镜"]', 1),

-- 化学品安全题目
(7, 3, 'MSDS是什么的缩写？', 'fill_blank',
 '[]', '["Material Safety Data Sheet", "物质安全数据表"]',
 'MSDS是Material Safety Data Sheet（物质安全数据表）的缩写。',
 'medium', 3, '化学安全', '["MSDS"]', 1),

(8, 3, '化学品泄漏时的正确处理步骤是什么？', 'single_choice',
 '["立即清理", "先疏散人员", "用水冲洗", "继续工作"]', '["先疏散人员"]',
 '化学品泄漏时应首先疏散人员，确保安全后再按照应急预案进行处理。',
 'hard', 4, '化学安全', '["泄漏处理"]', 1),

-- 消防安全题目
(9, 4, '火灾发生时应该怎么做？', 'multiple_choice',
 '["立即报警", "组织疏散", "扑救初期火灾", "乘坐电梯逃生"]', '["立即报警", "组织疏散", "扑救初期火灾"]',
 '火灾发生时应立即报警、组织疏散、扑救初期火灾。绝不能乘坐电梯逃生。',
 'medium', 3, '消防安全', '["火灾应急"]', 1),

(10, 4, '干粉灭火器适用于扑救哪类火灾？', 'single_choice',
 '["A类火灾", "B类火灾", "C类火灾", "A、B、C类火灾"]', '["A、B、C类火灾"]',
 '干粉灭火器是多用途灭火器，适用于扑救A、B、C类火灾。',
 'medium', 2, '消防安全', '["灭火器"]', 1);

-- 插入示例测试试卷
INSERT OR IGNORE INTO quiz_papers (
    id, title, description, content_id, question_ids, total_points,
    pass_score, time_limit, attempt_limit, is_random, created_by
) VALUES 
(1, '工作场所安全基础测试', '测试工作场所安全基础知识掌握情况', 1,
 '[1, 2, 3]', 7, 5, 15, 3, FALSE, 1),

(2, '个人防护设备知识测试', '测试个人防护设备相关知识', 2,
 '[4, 5, 6]', 7, 5, 20, 3, FALSE, 1),

(3, '化学品安全管理测试', '测试化学品安全管理知识', 3,
 '[7, 8]', 7, 5, 25, 2, FALSE, 1),

(4, '消防安全综合测试', '测试消防安全相关知识', 4,
 '[9, 10]', 5, 3, 20, 3, FALSE, 1),

(5, '安全知识综合测试', '综合测试各方面安全知识', NULL,
 '[1, 2, 4, 5, 7, 9, 10]', 16, 12, 30, 3, TRUE, 1);

-- 插入示例学习路径
INSERT OR IGNORE INTO learning_paths (
    id, title, description, content_ids, estimated_duration,
    difficulty_level, target_audience, is_mandatory, created_by
) VALUES 
(1, '新员工安全培训路径', '新员工必须完成的安全培训课程', 
 '[1, 2, 3, 4]', 4, 'beginner', '新入职员工', TRUE, 1),

(2, '特殊作业人员培训路径', '从事特殊作业人员的专项培训',
 '[5, 6]', 2, 'advanced', '特殊作业人员', TRUE, 1),

(3, '安全管理人员进阶路径', '安全管理人员的进阶培训课程',
 '[1, 2, 3, 4, 5, 6]', 6, 'intermediate', '安全管理人员', FALSE, 1);

-- 插入示例用户（测试用户）
INSERT OR IGNORE INTO users (
    id, username, email, password_hash, full_name, department, position, role, status
) VALUES 
(2, 'zhangsan', 'zhangsan@company.com', 
 '$2b$12$LQv3c1yqBwEHFl5aBLloe.uyWi/QVqUqx/3rUO/nUJ.VHVmO2/my.',
 '张三', '生产部', '操作员', 'user', 'active'),

(3, 'lisi', 'lisi@company.com',
 '$2b$12$LQv3c1yqBwEHFl5aBLloe.uyWi/QVqUqx/3rUO/nUJ.VHVmO2/my.',
 '李四', '安全部', '安全员', 'manager', 'active'),

(4, 'wangwu', 'wangwu@company.com',
 '$2b$12$LQv3c1yqBwEHFl5aBLloe.uyWi/QVqUqx/3rUO/nUJ.VHVmO2/my.',
 '王五', '维修部', '维修工', 'user', 'active'),

(5, 'zhaoliu', 'zhaoliu@company.com',
 '$2b$12$LQv3c1yqBwEHFl5aBLloe.uyWi/QVqUqx/3rUO/nUJ.VHVmO2/my.',
 '赵六', '质检部', '质检员', 'user', 'active');

-- 插入示例学习记录
INSERT OR IGNORE INTO learning_records (
    user_id, content_id, start_time, end_time, duration, progress,
    completion_status, rating, feedback
) VALUES 
(2, 1, '2024-01-10 09:00:00', '2024-01-10 09:30:00', 1800, 100.0, 'completed', 5, '内容很实用，讲解清晰'),
(2, 2, '2024-01-10 10:00:00', '2024-01-10 10:25:00', 1500, 75.0, 'in_progress', NULL, NULL),
(3, 1, '2024-01-08 14:00:00', '2024-01-08 14:30:00', 1800, 100.0, 'completed', 4, '基础内容，适合新员工'),
(3, 3, '2024-01-09 15:00:00', '2024-01-09 15:50:00', 3000, 100.0, 'completed', 5, '专业性强，很有帮助'),
(4, 1, '2024-01-11 08:30:00', '2024-01-11 09:00:00', 1800, 100.0, 'completed', 4, '学到了很多安全知识'),
(5, 2, '2024-01-12 13:00:00', NULL, 600, 25.0, 'in_progress', NULL, NULL);

-- 插入示例测试记录
INSERT OR IGNORE INTO quiz_attempts (
    user_id, paper_id, attempt_number, start_time, end_time, duration,
    answers, score, total_points, pass_status
) VALUES 
(2, 1, 1, '2024-01-10 09:35:00', '2024-01-10 09:45:00', 600,
 '{"1": ["效率优先"], "2": ["立即报告"], "3": ["湿滑地面", "杂乱堆放"]}', 5, 7, 'passed'),

(3, 1, 1, '2024-01-08 14:35:00', '2024-01-08 14:42:00', 420,
 '{"1": ["效率优先"], "2": ["立即报告"], "3": ["湿滑地面", "杂乱堆放", "照明不足"]}', 7, 7, 'passed'),

(3, 3, 1, '2024-01-09 16:00:00', '2024-01-09 16:15:00', 900,
 '{"7": ["Material Safety Data Sheet"], "8": ["先疏散人员"]}', 7, 7, 'passed'),

(4, 1, 1, '2024-01-11 09:05:00', '2024-01-11 09:12:00', 420,
 '{"1": ["安全第一"], "2": ["立即报告"], "3": ["湿滑地面"]}', 4, 7, 'failed'),

(4, 1, 2, '2024-01-11 09:20:00', '2024-01-11 09:28:00', 480,
 '{"1": ["效率优先"], "2": ["立即报告"], "3": ["湿滑地面", "杂乱堆放", "照明不足"]}', 7, 7, 'passed');

-- 插入示例用户学习路径进度
INSERT OR IGNORE INTO user_path_progress (
    user_id, path_id, current_content_id, completed_content_ids, progress,
    start_date, status
) VALUES 
(2, 1, 2, '[1]', 25.0, '2024-01-10', 'in_progress'),
(3, 3, 4, '[1, 3]', 33.3, '2024-01-08', 'in_progress'),
(4, 1, 2, '[1]', 25.0, '2024-01-11', 'in_progress'),
(5, 1, 2, '[]', 12.5, '2024-01-12', 'in_progress');

-- 插入示例通知
INSERT OR IGNORE INTO notifications (
    user_id, title, message, type, category, related_id, related_type
) VALUES 
(2, '学习提醒', '您有未完成的课程《个人防护设备使用指南》，请及时完成学习。', 'info', 'learning', 2, 'learning_content'),
(3, '测试通过', '恭喜您通过了《化学品安全管理测试》！', 'success', 'quiz', 3, 'quiz_paper'),
(4, '重新测试', '您的《工作场所安全基础测试》第一次尝试未通过，请重新学习后再次测试。', 'warning', 'quiz', 1, 'quiz_paper'),
(5, '欢迎加入', '欢迎加入安全学习平台！请先完成新员工安全培训路径。', 'info', 'welcome', 1, 'learning_path');

-- 更新统计数据
UPDATE quiz_questions SET usage_count = 3, correct_rate = 66.7 WHERE id = 1;
UPDATE quiz_questions SET usage_count = 4, correct_rate = 100.0 WHERE id = 2;
UPDATE quiz_questions SET usage_count = 3, correct_rate = 66.7 WHERE id = 3;
UPDATE quiz_questions SET usage_count = 1, correct_rate = 100.0 WHERE id = 7;
UPDATE quiz_questions SET usage_count = 1, correct_rate = 100.0 WHERE id = 8; 