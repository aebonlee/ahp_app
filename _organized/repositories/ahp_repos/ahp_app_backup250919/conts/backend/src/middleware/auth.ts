import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';

declare global {
  namespace Express {
    interface Request {
      user: JWTPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 쿠키에서 토큰 읽기
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  
  next();
};

export const requireEvaluator = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user || (user.role !== 'evaluator' && user.role !== 'admin')) {
    return res.status(403).json({ 
      error: 'Evaluator access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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