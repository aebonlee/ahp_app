import { Request } from 'express';
import { JWTPayload } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}