"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const userService_1 = require("../services/userService");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { role } = req.query;
        const users = await userService_1.UserService.getAllUsers(role);
        const usersResponse = users.map(user => {
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        res.json({ users: usersResponse });
    }
    catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('first_name').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
    (0, express_validator_1.body)('last_name').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('role').isIn(['admin', 'evaluator']).withMessage('Role must be admin or evaluator')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await userService_1.UserService.createUser(req.body);
        const { password_hash, ...userResponse } = user;
        res.status(201).json({ user: userResponse });
    }
    catch (error) {
        if (error.message === 'User with this email already exists') {
            return res.status(409).json({ error: error.message });
        }
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('first_name').optional().trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('last_name').optional().trim().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('is_active').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const user = await userService_1.UserService.updateUser(id, req.body);
        const { password_hash, ...userResponse } = user;
        res.json({ user: userResponse });
    }
    catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('User update error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});
// 사용자 본인 정보 조회
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('🔍 Profile fetch request for user:', userId);
        const user = await userService_1.UserService.getUser(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password_hash, ...userResponse } = user;
        res.json({
            success: true,
            user: userResponse
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
// 사용자 본인 정보 업데이트 (일반 사용자용)
router.put('/profile', auth_1.authenticateToken, [
    (0, express_validator_1.body)('first_name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    (0, express_validator_1.body)('last_name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        console.log('🔍 Profile update request:', {
            userId,
            userIdType: typeof userId,
            requestBody: req.body,
            userFromJWT: req.user
        });
        const user = await userService_1.UserService.updateUser(userId, req.body);
        const { password_hash, ...userResponse } = user;
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userResponse
        });
    }
    catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await userService_1.UserService.deleteUser(id);
        res.json({ message: 'User deactivated successfully' });
    }
    catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        console.error('User deletion error:', error);
        res.status(500).json({ error: 'Failed to deactivate user' });
    }
});
exports.default = router;
