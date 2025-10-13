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