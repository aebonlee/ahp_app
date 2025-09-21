import { User } from '../types';
export interface JWTPayload {
    id: string;
    email: string;
    role: 'admin' | 'evaluator';
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (user: Pick<User, "id" | "email" | "role">) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const generateRefreshToken: (user: Pick<User, "id" | "email" | "role">) => string;
