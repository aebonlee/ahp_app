"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireEvaluator = exports.requireAdmin = exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const authenticateToken = (req, res, next) => {
    // 쿠키에서 토큰 읽기
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            code: 'TOKEN_REQUIRED'
        });
    }
    try {
        const decoded = (0, auth_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin access required',
            code: 'INSUFFICIENT_PERMISSIONS'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireEvaluator = (req, res, next) => {
    const user = req.user;
    if (!user || (user.role !== 'evaluator' && user.role !== 'admin')) {
        return res.status(403).json({
            error: 'Evaluator access required',
            code: 'INSUFFICIENT_PERMISSIONS'
        });
    }
    next();
};
exports.requireEvaluator = requireEvaluator;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({
                error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
