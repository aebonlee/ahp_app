import { query } from '../database/connection';
import { User, CreateUserRequest } from '../types';
import { hashPassword } from '../utils/auth';

export class UserService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const { email, password, first_name, last_name, role } = userData;
    
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const password_hash = await hashPassword(password);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, password_hash, first_name, last_name, role]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async getUser(id: string): Promise<User | null> {
    return this.findById(id);
  }

  static async getAllUsers(role?: 'admin' | 'evaluator'): Promise<User[]> {
    let queryText = 'SELECT * FROM users WHERE is_active = true';
    let params: any[] = [];
    
    if (role) {
      queryText += ' AND role = $1';
      params.push(role);
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return result.rows;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    console.log('🔍 UserService.updateUser 호출:', {
      id,
      idType: typeof id,
      updates,
      updateKeys: Object.keys(updates)
    });
    
    // 업데이트 가능한 필드 필터링
    const allowedFields = [
      'first_name', 'last_name', 'email', 'is_active',
      'phone', 'organization', 'department', 'profile_image',
      'theme', 'language', 'notifications'
    ];
    
    const filteredUpdates: any = {};
    for (const key of allowedFields) {
      if (key in updates) {
        // notifications은 JSON으로 변환
        if (key === 'notifications' && typeof updates[key] === 'object') {
          filteredUpdates[key] = JSON.stringify(updates[key]);
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      // 업데이트할 필드가 없으면 현재 사용자 정보 반환
      const currentUser = await this.findById(id);
      if (!currentUser) {
        throw new Error('User not found');
      }
      return currentUser;
    }
    
    const setClause = Object.keys(filteredUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(filteredUpdates)];
    console.log('📊 SQL 쿼리 정보:', {
      setClause,
      values,
      sqlQuery: `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`
    });
    
    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      values
    );
    
    console.log('📊 쿼리 결과:', {
      rowCount: result.rowCount,
      rowsLength: result.rows.length,
      firstRow: result.rows[0]
    });
    
    if (result.rows.length === 0) {
      console.error('❌ User not found for id:', id);
      throw new Error('User not found');
    }
    
    return result.rows[0];
  }

  static async deleteUser(id: string): Promise<void> {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }
}