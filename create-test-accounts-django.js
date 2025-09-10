/**
 * Django 백엔드에서 테스트 계정 생성 스크립트
 * 브라우저 콘솔에서 실행하세요.
 */

const API_BASE_URL = 'https://ahp-django-backend-new.onrender.com';

// 테스트 계정 데이터
const testAccounts = [
  {
    username: 'aebon',
    email: 'aebon@ahp-system.com',
    password: 'AebonAdmin2024!',
    first_name: 'Aebon',
    last_name: 'Super',
    user_type: 'admin',
    admin_data: {
      admin_role: 'super_admin',
      organization: 'AHP System',
      purpose: 'System administration and management',
      permissions: ['ALL_PERMISSIONS']
    }
  },
  {
    username: 'system_admin',
    email: 'admin@ahp-system.com',
    password: 'SystemAdmin2024!',
    first_name: '시스템',
    last_name: '관리자',
    user_type: 'admin',
    admin_data: {
      admin_role: 'system_admin',
      organization: 'AHP System',
      purpose: 'System administration',
      permissions: ['USER_MANAGEMENT', 'SYSTEM_SETTINGS']
    }
  },
  {
    username: 'business_user',
    email: 'business@company.com',
    password: 'BusinessUser2024!',
    first_name: '비즈니스',
    last_name: '사용자',
    user_type: 'personal_service_user',
    service_data: {
      organization: 'ABC Company',
      expected_usage: 'Business analytics and decision making',
      preferred_tier: 'professional',
      trial_request: true,
      payment_ready: true
    }
  },
  {
    username: 'evaluator01',
    email: 'evaluator@email.com',
    password: 'Evaluator2024!',
    first_name: '평가자',
    last_name: '김',
    user_type: 'evaluator',
    evaluator_data: {
      invitation_code: 'EVAL2024',
      access_key: 'ak_eval_001',
      project_id: 'proj_001',
      invited_by: 'system_admin',
      profile_info: {
        expertise: 'Business Analysis',
        experience_years: 5
      }
    }
  }
];

// 단일 계정 생성 함수
async function createTestAccount(accountData) {
  try {
    console.log(`🔄 Creating account: ${accountData.username}`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/create-test-account/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Successfully created: ${accountData.username}`);
      return { success: true, username: accountData.username };
    } else {
      console.error(`❌ Failed to create ${accountData.username}:`, result.error);
      return { success: false, username: accountData.username, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Network error creating ${accountData.username}:`, error);
    return { success: false, username: accountData.username, error: error.message };
  }
}

// 모든 테스트 계정 생성
async function createAllTestAccounts() {
  console.log('🚀 Starting Django test account creation...\n');
  
  const results = [];
  
  for (const account of testAccounts) {
    const result = await createTestAccount(account);
    results.push(result);
    
    // 요청 간 간격 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Creation Summary:');
  console.log('===================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.username}`));
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`   - ${r.username}: ${r.error}`));
  }
  
  console.log('\n🔐 Test Account Credentials:');
  console.log('============================');
  console.log('aebon / AebonAdmin2024! (Super Admin)');
  console.log('system_admin / SystemAdmin2024! (System Admin)');
  console.log('business_user / BusinessUser2024! (Personal Service User)');
  console.log('evaluator01 / Evaluator2024! (Evaluator)');
  
  return results;
}

// 테스트 로그인 함수
async function testLogin(username, password) {
  try {
    console.log(`🔐 Testing login for: ${username}`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Login successful for: ${username}`);
      console.log('User data:', result.user);
      return { success: true, user: result.user };
    } else {
      console.error(`❌ Login failed for ${username}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Login network error for ${username}:`, error);
    return { success: false, error: error.message };
  }
}

// 계정 삭제 함수 (필요시)
async function deleteTestAccount(username) {
  try {
    console.log(`🗑️ Deleting account: ${username}`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/delete-test-account/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Successfully deleted: ${username}`);
      return { success: true };
    } else {
      console.error(`❌ Failed to delete ${username}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Network error deleting ${username}:`, error);
    return { success: false, error: error.message };
  }
}

// 사용법 출력
console.log(`
🔧 Django Backend Test Account Manager
=====================================

사용 가능한 함수들:

1. createAllTestAccounts()
   - 모든 테스트 계정을 Django 백엔드에서 생성

2. testLogin('username', 'password')
   - 특정 계정으로 로그인 테스트

3. deleteTestAccount('username')
   - 특정 테스트 계정 삭제

예제:
createAllTestAccounts()
testLogin('aebon', 'AebonAdmin2024!')
deleteTestAccount('old_username')

계정 생성을 시작하려면:
createAllTestAccounts()
`);

// 전역 함수로 노출
window.createAllTestAccounts = createAllTestAccounts;
window.testLogin = testLogin;
window.deleteTestAccount = deleteTestAccount;