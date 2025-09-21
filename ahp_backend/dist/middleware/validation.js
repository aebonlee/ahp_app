"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
const sanitizeInput = (text) => {
    return text.replace(/[,'"]/g, '').trim();
};
exports.sanitizeInput = sanitizeInput;
