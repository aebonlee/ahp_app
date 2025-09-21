import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../utils/auth';
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
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireEvaluator: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireRole: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
