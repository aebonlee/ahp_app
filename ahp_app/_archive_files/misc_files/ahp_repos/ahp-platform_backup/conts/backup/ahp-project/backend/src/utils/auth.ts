import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../types';

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'evaluator';
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const generateRefreshToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' } as jwt.SignOptions);
};