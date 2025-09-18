import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { UserService } from '../services/userService';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const users = await UserService.getAllUsers(role as 'admin' | 'evaluator');

    const usersResponse = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({ users: usersResponse });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
    body('role').isIn(['admin', 'evaluator']).withMessage('Role must be admin or evaluator')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await UserService.createUser(req.body);
      const { password_hash, ...userResponse } = user;

      res.status(201).json({ user: userResponse });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({ error: error.message });
      }
      console.error('User creation error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('email').optional().isEmail(),
    body('first_name').optional().trim().isLength({ min: 1, max: 50 }),
    body('last_name').optional().trim().isLength({ min: 1, max: 50 }),
    body('is_active').optional().isBoolean()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const user = await UserService.updateUser(id, req.body);
      const { password_hash, ...userResponse } = user;

      res.json({ user: userResponse });
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('User update error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// 사용자 본인 정보 조회
router.get('/profile',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.id;
      console.log('🔍 Profile fetch request for user:', userId);
      
      const user = await UserService.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { password_hash, ...userResponse } = user;
      
      res.json({ 
        success: true,
        user: userResponse 
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
);

// 사용자 본인 정보 업데이트 (일반 사용자용)
router.put('/profile',
  authenticateToken,
  [
    body('first_name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    body('last_name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    body('email').optional().isEmail().withMessage('Valid email is required')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
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
      
      const user = await UserService.updateUser(userId, req.body);
      const { password_hash, ...userResponse } = user;

      res.json({ 
        success: true,
        message: 'Profile updated successfully',
        user: userResponse 
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UserService.deleteUser(id);

    res.json({ message: 'User deactivated successfully' });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;