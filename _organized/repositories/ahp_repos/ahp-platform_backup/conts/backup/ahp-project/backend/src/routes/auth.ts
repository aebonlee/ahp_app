import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { comparePassword, generateToken, generateRefreshToken, verifyToken } from '../utils/auth';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { LoginRequest, CreateUserRequest } from '../types';

const router = Router();

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  body('role')
    .isIn(['admin', 'evaluator'])
    .withMessage('Role must be either admin or evaluator')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', registerValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userData: CreateUserRequest = req.body;
    
    userData.first_name = userData.first_name.replace(/[,'"]/g, '');
    userData.last_name = userData.last_name.replace(/[,'"]/g, '');
    
    const user = await UserService.createUser(userData);
    
    const { password_hash, ...userResponse } = user;
    
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token,
      refreshToken
    });
    
  } catch (error) {
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

router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    console.log('Login attempt started');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password }: LoginRequest = req.body;
    console.log('Login attempt for email:', email);
    
    const user = await UserService.findByEmail(email);
    console.log('User found:', !!user);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    const { password_hash, ...userResponse } = user;
    
    console.log('Generating tokens...');
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    console.log('Login successful');
    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
      refreshToken
    });
    
  } catch (error) {
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
    
    const decoded = verifyToken(refreshToken);
    const user = await UserService.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
    
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { id } = (req as AuthenticatedRequest).user;
    
    const user = await UserService.findById(id);
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
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'PROFILE_FETCH_FAILED'
    });
  }
});

export default router;