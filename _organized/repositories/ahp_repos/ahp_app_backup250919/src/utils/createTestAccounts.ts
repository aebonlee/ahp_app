/**
 * 테스트 계정 생성 유틸리티
 * 개발 환경에서만 사용
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ahp-django-backend-new.onrender.com';

export interface TestAccount {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'admin' | 'personal_service_user' | 'evaluator';
  admin_role?: string;
  service_tier?: string;
}

export const testAccounts: TestAccount[] = [
  // AEBON 슈퍼 관리자
  {
    username: 'aebon',
    email: 'aebon@ahp-system.com',
    password: 'AebonAdmin2024!',
    first_name: 'Aebon',
    last_name: 'Super',
    user_type: 'admin',
    admin_role: 'super_admin'
  },
  // 시스템 관리자
  {
    username: 'system_admin',
    email: 'admin@ahp-system.com',
    password: 'SystemAdmin2024!',
    first_name: '시스템',
    last_name: '관리자',
    user_type: 'admin',
    admin_role: 'system_admin'
  },
  // 개인서비스 이용자
  {
    username: 'business_user',
    email: 'business@company.com',
    password: 'BusinessUser2024!',
    first_name: '비즈니스',
    last_name: '사용자',
    user_type: 'personal_service_user',
    service_tier: 'professional'
  },
  // 평가자
  {
    username: 'evaluator01',
    email: 'evaluator@email.com',
    password: 'Evaluator2024!',
    first_name: '평가자',
    last_name: '김',
    user_type: 'evaluator'
  }
];

/**
 * 개별 테스트 계정 생성
 */
export const createTestAccount = async (account: TestAccount): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`🔄 Creating test account: ${account.username}`);
    
    const response = await fetch(`${API_BASE_URL}/api/dev/create-test-user/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(account),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Test account created successfully: ${account.username}`);
      return { 
        success: true, 
        message: `${account.username} 계정이 생성되었습니다.` 
      };
    } else {
      const errorData = await response.json();
      console.error(`❌ Failed to create ${account.username}:`, errorData);
      return { 
        success: false, 
        message: errorData.error || `${account.username} 계정 생성에 실패했습니다.` 
      };
    }
  } catch (error) {
    console.error(`❌ Network error creating ${account.username}:`, error);
    return { 
      success: false, 
      message: `${account.username} 계정 생성 중 네트워크 오류가 발생했습니다.` 
    };
  }
};

/**
 * 모든 테스트 계정 생성
 */
export const createAllTestAccounts = async (): Promise<{ 
  success: boolean; 
  results: Array<{ account: string; success: boolean; message: string }> 
}> => {
  console.log('🚀 Starting test account creation...');
  
  const results = [];
  let allSuccess = true;
  
  for (const account of testAccounts) {
    const result = await createTestAccount(account);
    results.push({
      account: account.username,
      success: result.success,
      message: result.message
    });
    
    if (!result.success) {
      allSuccess = false;
    }
    
    // 각 계정 생성 사이에 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('✅ Test account creation completed');
  
  return {
    success: allSuccess,
    results
  };
};

/**
 * 테스트 로그인 확인
 */
export const testLogin = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`🔍 Testing login for: ${username}`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Login test successful for: ${username}`);
      return { 
        success: true, 
        message: `${username} 로그인 성공` 
      };
    } else {
      console.error(`❌ Login test failed for: ${username}`, data);
      return { 
        success: false, 
        message: data.error || `${username} 로그인 실패` 
      };
    }
  } catch (error) {
    console.error(`❌ Login test error for ${username}:`, error);
    return { 
      success: false, 
      message: `${username} 로그인 테스트 중 오류 발생` 
    };
  }
};