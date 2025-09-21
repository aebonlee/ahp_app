"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};
exports.generateRefreshToken = generateRefreshToken;
