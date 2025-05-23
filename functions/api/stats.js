// Cloudflare Pages Function for user statistics
// Path: /api/stats

export async function onRequestGet(context) {
    const { request, env, params } = context;

    try {
        // 设置CORS头
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        };

        // 从URL参数获取用户ID
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId') || 'anonymous';
        const timeRange = url.searchParams.get('range') || '7d';

        // 从KV存储获取用户统计数据
        const statsKey = `user_stats:${userId}`;
        const cachedStats = await env.SAFETY_KV.get(statsKey, 'json');

        if (cachedStats && isStatsValid(cachedStats, timeRange)) {
            return new Response(JSON.stringify({
                success: true,
                data: cachedStats,
                cached: true,
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

        // 生成或计算统计数据
        const stats = await generateUserStats(userId, timeRange, env);

        // 缓存统计数据（1小时过期）
        await env.SAFETY_KV.put(statsKey, JSON.stringify(stats), {
            expirationTtl: 3600
        });

        return new Response(JSON.stringify({
            success: true,
            data: stats,
            cached: false,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Stats API Error:', error);

        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        };

        // 解析请求体
        const body = await request.json();
        const { userId, action, data } = body;

        if (!userId || !action) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing required fields: userId, action'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // 更新用户统计数据
        await updateUserStats(userId, action, data, env);

        return new Response(JSON.stringify({
            success: true,
            message: 'Stats updated successfully',
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Stats Update Error:', error);

        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to update stats',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestOptions(context) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}

// 辅助函数：检查缓存的统计数据是否有效
function isStatsValid(stats, timeRange) {
    if (!stats || !stats.lastUpdated) return false;

    const lastUpdated = new Date(stats.lastUpdated);
    const now = new Date();
    const diffMinutes = (now - lastUpdated) / (1000 * 60);

    // 根据时间范围设置不同的缓存有效期
    const validityMinutes = timeRange === '1d' ? 30 : 60;

    return diffMinutes < validityMinutes;
}

// 辅助函数：生成用户统计数据
async function generateUserStats(userId, timeRange, env) {
    const now = new Date();
    const stats = {
        userId,
        timeRange,
        lastUpdated: now.toISOString(),
        overview: {
            totalVideosWatched: 0,
            totalQuizzesTaken: 0,
            totalLearningTime: 0,
            averageScore: 0,
            completionRate: 0
        },
        videos: {
            completed: [],
            inProgress: [],
            totalWatchTime: 0,
            averageWatchTime: 0
        },
        quizzes: {
            completed: [],
            scores: [],
            averageScore: 0,
            bestScore: 0,
            totalAttempts: 0
        },
        progress: {
            dailyActivity: [],
            weeklyProgress: [],
            achievements: []
        },
        trends: {
            learningStreak: 0,
            mostActiveDay: '',
            preferredLearningTime: '',
            improvementRate: 0
        }
    };

    try {
        // 从D1数据库获取用户活动数据
        if (env.SAFETY_DB) {
            const videoStats = await getVideoStats(userId, timeRange, env.SAFETY_DB);
            const quizStats = await getQuizStats(userId, timeRange, env.SAFETY_DB);
            const activityStats = await getActivityStats(userId, timeRange, env.SAFETY_DB);

            // 合并统计数据
            stats.videos = { ...stats.videos, ...videoStats };
            stats.quizzes = { ...stats.quizzes, ...quizStats };
            stats.progress = { ...stats.progress, ...activityStats };

            // 计算总览数据
            stats.overview.totalVideosWatched = stats.videos.completed.length;
            stats.overview.totalQuizzesTaken = stats.quizzes.completed.length;
            stats.overview.totalLearningTime = stats.videos.totalWatchTime;
            stats.overview.averageScore = stats.quizzes.averageScore;
            stats.overview.completionRate = calculateCompletionRate(stats);
        } else {
            // 如果没有数据库，返回模拟数据
            stats.overview = {
                totalVideosWatched: Math.floor(Math.random() * 10) + 1,
                totalQuizzesTaken: Math.floor(Math.random() * 8) + 1,
                totalLearningTime: Math.floor(Math.random() * 300) + 60,
                averageScore: Math.floor(Math.random() * 30) + 70,
                completionRate: Math.floor(Math.random() * 40) + 60
            };
        }

    } catch (error) {
        console.error('Error generating stats:', error);
        // 返回默认统计数据
    }

    return stats;
}

// 辅助函数：更新用户统计数据
async function updateUserStats(userId, action, data, env) {
    const timestamp = new Date().toISOString();

    // 记录用户活动到KV存储
    const activityKey = `activity:${userId}:${Date.now()}`;
    await env.SAFETY_KV.put(activityKey, JSON.stringify({
        userId,
        action,
        data,
        timestamp
    }), {
        expirationTtl: 86400 * 30 // 30天过期
    });

    // 如果有D1数据库，也记录到数据库
    if (env.SAFETY_DB) {
        try {
            await env.SAFETY_DB.prepare(`
        INSERT INTO user_activities (user_id, action, data, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(userId, action, JSON.stringify(data), timestamp).run();
        } catch (error) {
            console.error('Database insert error:', error);
        }
    }

    // 清除相关的缓存
    const statsKey = `user_stats:${userId}`;
    await env.SAFETY_KV.delete(statsKey);
}

// 数据库查询函数（如果使用D1数据库）
async function getVideoStats(userId, timeRange, db) {
    // 实现视频统计查询逻辑
    return {
        completed: [],
        inProgress: [],
        totalWatchTime: 0,
        averageWatchTime: 0
    };
}

async function getQuizStats(userId, timeRange, db) {
    // 实现测试统计查询逻辑
    return {
        completed: [],
        scores: [],
        averageScore: 0,
        bestScore: 0,
        totalAttempts: 0
    };
}

async function getActivityStats(userId, timeRange, db) {
    // 实现活动统计查询逻辑
    return {
        dailyActivity: [],
        weeklyProgress: [],
        achievements: []
    };
}

// 计算完成率
function calculateCompletionRate(stats) {
    const totalContent = 10; // 假设总共有10个学习内容
    const completed = stats.videos.completed.length + stats.quizzes.completed.length;
    return Math.round((completed / totalContent) * 100);
} 