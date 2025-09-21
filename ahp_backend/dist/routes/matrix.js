"use strict";
/**
 * 매트릭스 조회 API 라우터
 * 쌍대비교를 위한 비교 항목 라벨 조회
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const connection_1 = require("../database/connection");
const router = express_1.default.Router();
/**
 * 비교 항목 라벨 조회
 * GET /api/matrix/:projectId?type=criteria&level=1
 */
router.get('/:projectId', auth_1.authenticateToken, async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const { type = 'criteria', level = '1' } = req.query;
        const evaluatorId = req.user.userId;
        // 프로젝트 접근 권한 확인
        const projectCheck = await (0, connection_1.query)(`SELECT pe.* FROM project_evaluators pe 
       WHERE pe.project_id = $1 AND pe.evaluator_id = $2`, [projectId, evaluatorId]);
        if (projectCheck.rowCount === 0) {
            return res.status(403).json({ error: 'Access denied to this project' });
        }
        let elements = [];
        if (type === 'criteria') {
            // 기준 항목 조회
            const result = await (0, connection_1.query)(`SELECT id, name, description, level
         FROM criteria 
         WHERE project_id = $1 AND level = $2
         ORDER BY "order", id`, [projectId, parseInt(level)]);
            elements = result.rows;
        }
        else if (type === 'alternatives') {
            // 대안 항목 조회
            const result = await (0, connection_1.query)(`SELECT id, name, description
         FROM alternatives 
         WHERE project_id = $1
         ORDER BY "order", id`, [projectId]);
            elements = result.rows;
        }
        res.json({
            project_id: projectId,
            type,
            level: type === 'criteria' ? parseInt(level) : undefined,
            elements: elements.map(el => ({
                id: el.id,
                name: el.name,
                description: el.description || '',
                level: el.level
            }))
        });
    }
    catch (error) {
        console.error('Error fetching matrix elements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
