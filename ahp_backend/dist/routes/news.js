"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = require("../database/connection");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// 뉴스 게시글 목록 조회
router.get('/posts', async (req, res) => {
    try {
        const { category = 'all', featured, limit = 20, offset = 0 } = req.query;
        let whereClause = 'WHERE published = true';
        let queryParams = [];
        let paramIndex = 1;
        if (category && category !== 'all') {
            whereClause += ` AND category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }
        if (featured === 'true') {
            whereClause += ` AND featured = true`;
        }
        const result = await (0, connection_1.query)(`
      SELECT * FROM news_posts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);
        res.json({
            success: true,
            posts: result.rows,
            total: result.rows.length
        });
    }
    catch (error) {
        console.error('Error fetching news posts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch news posts' });
    }
});
// 뉴스 게시글 상세 조회
router.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 조회수 증가
        await (0, connection_1.query)('UPDATE news_posts SET views = views + 1 WHERE id = $1', [id]);
        // 게시글 조회
        const result = await (0, connection_1.query)('SELECT * FROM news_posts WHERE id = $1 AND published = true', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json({
            success: true,
            post: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error fetching news post:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch news post' });
    }
});
// 뉴스 게시글 작성 (관리자만)
router.post('/posts', auth_1.authenticateToken, async (req, res) => {
    try {
        const { title, content, summary, category = 'platform', featured = false, image_url } = req.body;
        const user = req.user;
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }
        // 관리자만 뉴스 작성 가능
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        const result = await (0, connection_1.query)(`
      INSERT INTO news_posts (title, content, summary, author_name, category, featured, image_url, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `, [title, content, summary, `${user.first_name} ${user.last_name}`, category, featured, image_url]);
        res.json({
            success: true,
            post: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error creating news post:', error);
        res.status(500).json({ success: false, error: 'Failed to create news post' });
    }
});
// 뉴스 게시글 수정 (관리자만)
router.put('/posts/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, summary, category, featured, published, image_url } = req.body;
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        const result = await (0, connection_1.query)(`
      UPDATE news_posts 
      SET title = $1, content = $2, summary = $3, category = $4, 
          featured = $5, published = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [title, content, summary, category, featured, published, image_url, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        res.json({
            success: true,
            post: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error updating news post:', error);
        res.status(500).json({ success: false, error: 'Failed to update news post' });
    }
});
// 뉴스 게시글 삭제 (관리자만)
router.delete('/posts/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        await (0, connection_1.query)('DELETE FROM news_posts WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting news post:', error);
        res.status(500).json({ success: false, error: 'Failed to delete news post' });
    }
});
// 카테고리별 통계
router.get('/stats', async (req, res) => {
    try {
        const result = await (0, connection_1.query)(`
      SELECT 
        category,
        COUNT(*) as count
      FROM news_posts 
      WHERE published = true
      GROUP BY category
      ORDER BY count DESC
    `);
        const totalViews = await (0, connection_1.query)(`
      SELECT SUM(views) as total_views 
      FROM news_posts 
      WHERE published = true
    `);
        res.json({
            success: true,
            categories: result.rows,
            total_views: totalViews.rows[0]?.total_views || 0
        });
    }
    catch (error) {
        console.error('Error fetching news stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch news stats' });
    }
});
exports.default = router;
