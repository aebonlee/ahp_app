import bcrypt from 'bcryptjs';
import { query } from '../database/connection';

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('tester@', 10);
    
    // 테스트 관리자 계정 생성
    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        first_name = $3,
        last_name = $4,
        role = $5,
        is_active = $6
    `, ['test@ahp.com', hashedPassword, 'Test', 'Admin', 'admin', true]);
    
    console.log('✅ Test user created/updated: test@ahp.com / tester@');
    
    // 기존 관리자 계정도 확인
    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@ahp-system.com', await bcrypt.hash('password123', 10), 'Admin', 'User', 'admin', true]);
    
    console.log('✅ Admin user verified: admin@ahp-system.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// 환경변수 로드 후 실행
setTimeout(createTestUser, 1000);