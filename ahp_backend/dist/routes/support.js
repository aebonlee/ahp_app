"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = require("../database/connection");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// 고객지원 게시글 목록 조회
router.get('/posts', async (req, res) => {
    try {
        const { category = 'all', limit = 20, offset = 0 } = req.query;
        let whereClause = '';
        let queryParams = [];
        if (category && category !== 'all') {
            whereClause = 'WHERE category = $1';
            queryParams.push(category);
        }
        const result = await (0, connection_1.query)(`
      SELECT sp.*, 
             COUNT(sr.id) as reply_count
      FROM support_posts sp
      LEFT JOIN support_replies sr ON sp.id = sr.post_id
      ${whereClause}
      GROUP BY sp.id
      ORDER BY sp.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `, [...queryParams, limit, offset]);
        res.json({
            success: true,
            posts: result.rows,
            total: result.rows.length
        });
    }
    catch (error) {
        console.error('Error fetching support posts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch support posts' });
    }
});
// 고객지원 게시글 상세 조회
router.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 조회수 증가
        await (0, connection_1.query)('UPDATE support_posts SET views = views + 1 WHERE id = $1', [id]);
        // 게시글 조회
        const postResult = await (0, connection_1.query)(`
      SELECT sp.*, 
             COUNT(sr.id) as reply_count
      FROM support_posts sp
      LEFT JOIN support_replies sr ON sp.id = sr.post_id
      WHERE sp.id = $1
      GROUP BY sp.id
    `, [id]);
        if (postResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        // 답글 조회
        const repliesResult = await (0, connection_1.query)(`
      SELECT * FROM support_replies 
      WHERE post_id = $1 
      ORDER BY created_at ASC
    `, [id]);
        res.json({
            success: true,
            post: postResult.rows[0],
            replies: repliesResult.rows
        });
    }
    catch (error) {
        console.error('Error fetching support post:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch support post' });
    }
});
// 고객지원 게시글 작성
router.post('/posts', async (req, res) => {
    try {
        const { title, content, author_name, author_email, category = 'general' } = req.body;
        if (!title || !content || !author_name) {
            return res.status(400).json({
                success: false,
                error: 'Title, content, and author name are required'
            });
        }
        const result = await (0, connection_1.query)(`
      INSERT INTO support_posts (title, content, author_name, author_email, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, content, author_name, author_email, category]);
        res.json({
            success: true,
            post: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error creating support post:', error);
        res.status(500).json({ success: false, error: 'Failed to create support post' });
    }
});
// 고객지원 답글 작성
router.post('/posts/:id/replies', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, author_name, author_email, is_admin = false } = req.body;
        if (!content || !author_name) {
            return res.status(400).json({
                success: false,
                error: 'Content and author name are required'
            });
        }
        const result = await (0, connection_1.query)(`
      INSERT INTO support_replies (post_id, content, author_name, author_email, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, content, author_name, author_email, is_admin]);
        // 게시글 상태를 answered로 변경
        await (0, connection_1.query)(`
      UPDATE support_posts 
      SET status = 'answered', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [id]);
        res.json({
            success: true,
            reply: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error creating support reply:', error);
        res.status(500).json({ success: false, error: 'Failed to create support reply' });
    }
});
// 고객지원 게시글 상태 변경 (관리자만)
router.put('/posts/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['open', 'answered', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }
        await (0, connection_1.query)(`
      UPDATE support_posts 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [status, id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating support post status:', error);
        res.status(500).json({ success: false, error: 'Failed to update post status' });
    }
});
exports.default = router;
