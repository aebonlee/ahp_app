import { User, CreateUserRequest } from '../types';
export declare class UserService {
    static createUser(userData: CreateUserRequest): Promise<User>;
    static findByEmail(email: string): Promise<User | null>;
    static findById(id: string): Promise<User | null>;
    static getAllUsers(role?: 'admin' | 'evaluator'): Promise<User[]>;
    static updateUser(id: string, updates: Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'is_active'>>): Promise<User>;
    static deleteUser(id: string): Promise<void>;
}
