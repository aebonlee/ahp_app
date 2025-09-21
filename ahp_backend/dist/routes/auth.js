"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userService_1 = require("../services/userService");
const auth_1 = require("../utils/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('first_name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name is required and must be less than 100 characters'),
    (0, express_validator_1.body)('last_name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name is required and must be less than 100 characters'),
    (0, express_validator_1.body)('role')
        .isIn(['admin', 'evaluator'])
        .withMessage('Role must be either admin or evaluator')
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const userData = req.body;
        userData.first_name = userData.first_name.replace(/[,'"]/g, '');
        userData.last_name = userData.last_name.replace(/[,'"]/g, '');
        const user = await userService_1.UserService.createUser(userData);
        const { password_hash, ...userResponse } = user;
        const token = (0, auth_1.generateToken)(user);
        const refreshToken = (0, auth_1.generateRefreshToken)(user);
        // httpOnly 쿠키로 토큰 설정
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24시간
            path: '/'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            path: '/'
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    error: 'Email already registered',
                    code: 'EMAIL_EXISTS'
                });
            }
        }
        res.status(500).json({
            error: 'Internal server error during registration',
            code: 'REGISTRATION_FAILED'
        });
    }
});
router.post('/login', loginValidation, async (req, res) => {
    try {
        console.log('Login attempt started');
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        const user = await userService_1.UserService.findByEmail(email);
        console.log('User found:', !!user);
        if (!user) {
            console.log('User not found');
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }
        const { password_hash, ...userResponse } = user;
        console.log('Generating tokens...');
        const token = (0, auth_1.generateToken)(user);
        const refreshToken = (0, auth_1.generateRefreshToken)(user);
        console.log('Login successful');
        // httpOnly 쿠키로 토큰 설정
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24시간
            path: '/'
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            path: '/'
        });
        res.json({
            message: 'Login successful',
            user: userResponse
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error during login: ' + error.message,
            code: 'LOGIN_FAILED'
        });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required',
                code: 'REFRESH_TOKEN_REQUIRED'
            });
        }
        const decoded = (0, auth_1.verifyToken)(refreshToken);
        const user = await userService_1.UserService.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        const newToken = (0, auth_1.generateToken)(user);
        const newRefreshToken = (0, auth_1.generateRefreshToken)(user);
        res.json({
            token: newToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        return res.status(403).json({
            error: 'Invalid refresh token',
            code: 'INVALID_REFRESH_TOKEN'
        });
    }
});
router.get('/profile', auth_2.authenticateToken, async (req, res) => {
    try {
        const { id } = req.user;
        const user = await userService_1.UserService.findById(id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        const { password_hash, ...userResponse } = user;
        res.json({
            user: userResponse
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            error: 'Internal server error',
            code: 'PROFILE_FETCH_FAILED'
        });
    }
});
// 로그아웃 엔드포인트 추가
router.post('/logout', (req, res) => {
    try {
        // 모든 인증 쿠키 제거
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });
        res.json({
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Failed to logout',
            code: 'LOGOUT_FAILED'
        });
    }
});
exports.default = router;
