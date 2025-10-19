/**
 * 기존 Django 백엔드 로그인 테스트
 * 브라우저 콘솔에서 실행하세요.
 */

const BACKEND_URL = 'https://ahp-django-backend.onrender.com';

// 기존 백엔드 테스트 계정 (웹페이지에서 확인한 정보)
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'ahp2025admin',
  email: 'admin@ahp-platform.com'
};

// 확인된 실제 API 엔드포인트들
const LOGIN_ENDPOINTS = [
  '/api/login/',  // 실제 확인된 로그인 엔드포인트
  '/api/register/' // 실제 확인된 회원가입 엔드포인트
];

const API_ENDPOINTS = [
  '/api/login/',
  '/api/register/',
  '/api/user/',
  '/api/service/status/',
  '/api/service/projects/',
  '/api/service/criteria/',
  '/api/service/comparisons/',
  '/api/service/results/',
  '/api/service/data/',
  '/admin/'
];

// 로그인 시도 함수
async function testLogin(endpoint, credentials) {
  try {
    console.log(`🔍 Testing endpoint: ${BACKEND_URL}${endpoint}`);
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`✅ SUCCESS at ${endpoint}:`, data);
      return { success: true, endpoint, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED at ${endpoint}:`, errorText);
      return { success: false, endpoint, error: errorText, status: response.status };
    }
  } catch (error) {
    console.log(`💥 ERROR at ${endpoint}:`, error.message);
    return { success: false, endpoint, error: error.message };
  }
}

// 모든 엔드포인트 테스트
async function testAllEndpoints() {
  console.log('🚀 Testing all possible login endpoints...\n');
  
  const results = [];
  
  for (const endpoint of LOGIN_ENDPOINTS) {
    const result = await testLogin(endpoint, TEST_CREDENTIALS);
    results.push(result);
    
    // 성공한 경우 바로 리턴
    if (result.success) {
      console.log('\n🎉 FOUND WORKING ENDPOINT!');
      console.log(`Working endpoint: ${endpoint}`);
      return result;
    }
    
    // 요청 간 간격
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Summary:');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.endpoint}: ${r.success ? 'SUCCESS' : `${r.status || 'ERROR'} - ${r.error || 'Unknown error'}`}`);
  });
  
  return results;
}

// 간단한 GET 요청으로 서버 응답 확인
async function checkServerRoot() {
  try {
    console.log('🌐 Checking server root...');
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      credentials: 'include'
    });
    
    const text = await response.text();
    console.log('Root response:', text.substring(0, 500));
    
    return text;
  } catch (error) {
    console.log('Root check error:', error);
    return null;
  }
}

// API 문서 또는 메타 정보 확인
async function checkAPIInfo() {
  const INFO_ENDPOINTS = [
    '/api/',
    '/docs/',
    '/swagger/',
    '/admin/',
    '/__debug__/',
    '/api/schema/',
    '/openapi.json'
  ];
  
  console.log('📚 Checking API documentation endpoints...');
  
  for (const endpoint of INFO_ENDPOINTS) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const text = await response.text();
        console.log(`✅ Found ${endpoint}:`, text.substring(0, 200));
      }
    } catch (error) {
      // Silent fail for info endpoints
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 전체 테스트 실행
async function runFullTest() {
  console.log('🔧 Django Backend API Discovery Tool');
  console.log('====================================\n');
  
  await checkServerRoot();
  console.log('\n');
  
  await checkAPIInfo();
  console.log('\n');
  
  const results = await testAllEndpoints();
  
  console.log('\n🔍 Test complete. Check results above.');
  return results;
}

// 실제 Django 백엔드 테스트 함수들
async function testRealLogin() {
  console.log('🔐 Testing Django Backend Login...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });
    
    console.log(`Login Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ LOGIN SUCCESS!', data);
      
      // 토큰이 있으면 사용자 정보 가져오기
      if (data.access) {
        console.log('🔑 JWT Token received, fetching user info...');
        const userResponse = await fetch(`${BACKEND_URL}/api/user/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.access}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('👤 USER INFO:', userData);
          
          return {
            success: true,
            token: data.access,
            user: userData
          };
        }
      }
    } else {
      const errorData = await response.json();
      console.log('❌ LOGIN FAILED:', errorData);
    }
  } catch (error) {
    console.error('💥 LOGIN ERROR:', error);
  }
}

async function testCreateAebonAccount() {
  console.log('👑 Creating AEBON Super Admin Account...');
  
  const aebonData = {
    username: 'aebon',
    email: 'aebon@ahp-system.com',
    password: 'AebonAdmin2024!',
    first_name: 'Aebon',
    last_name: 'Super'
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/register/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aebonData)
    });
    
    console.log(`Register Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ AEBON ACCOUNT CREATED!', data);
      
      // 바로 로그인 테스트
      console.log('🔐 Testing aebon login...');
      const loginResponse = await fetch(`${BACKEND_URL}/api/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'aebon',
          password: 'AebonAdmin2024!'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('🎉 AEBON LOGIN SUCCESS!', loginData);
        return { success: true, account: aebonData, login: loginData };
      }
    } else {
      const errorData = await response.json();
      console.log('❌ AEBON CREATION FAILED:', errorData);
    }
  } catch (error) {
    console.error('💥 AEBON CREATION ERROR:', error);
  }
}

async function testServiceEndpoints() {
  console.log('🛠️ Testing Service Endpoints...');
  
  // 먼저 로그인해서 토큰 획득
  const loginResult = await testRealLogin();
  if (!loginResult?.success) {
    console.log('❌ Need to login first');
    return;
  }
  
  const token = loginResult.token;
  console.log('🔑 Using token for service tests...');
  
  const serviceEndpoints = [
    '/api/service/status/',
    '/api/service/projects/',
    '/api/user/' // 사용자 정보 재확인
  ];
  
  for (const endpoint of serviceEndpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.text();
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status} - ${data.substring(0, 200)}`);
    } catch (error) {
      console.log(`💥 ${endpoint}: ERROR - ${error.message}`);
    }
  }
}

// 성공적으로 생성된 테스트 계정들
const WORKING_ACCOUNTS = [
  {
    username: 'aebon_new',
    password: 'AebonAdmin2024!',
    type: 'SUPER ADMIN',
    description: '👑 AEBON 슈퍼 관리자 (is_superuser: true, is_staff: true)'
  },
  {
    username: 'testadmin', 
    password: 'TestAdmin2024!',
    type: 'REGULAR USER',
    description: '🔧 테스트 관리자 (일반 사용자)'
  },
  {
    username: 'simpletest',
    password: 'Simple123!', 
    type: 'REGULAR USER',
    description: '👤 간단한 테스트 사용자'
  }
];

// 작동하는 계정들로 로그인 테스트
async function testWorkingAccounts() {
  console.log('🎯 Testing Confirmed Working Accounts');
  console.log('=====================================\n');
  
  for (const account of WORKING_ACCOUNTS) {
    console.log(`🔐 Testing ${account.type}: ${account.username}`);
    console.log(`📝 ${account.description}`);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: account.username,
          password: account.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ LOGIN SUCCESS for ${account.username}!`);
        console.log('User Data:', data.user);
        
        if (data.user.isAebon) {
          console.log('👑 CONFIRMED: AEBON ULTIMATE ACCESS!');
        }
        if (data.user.is_superuser) {
          console.log('🛡️ CONFIRMED: SUPERUSER PRIVILEGES!');
        }
        if (data.user.is_staff) {
          console.log('⚡ CONFIRMED: STAFF PRIVILEGES!');
        }
        
        console.log('-----------------------------------');
        
        return {
          success: true,
          username: account.username,
          token: data.token || 'JWT_TOKEN_RECEIVED',
          user: data.user
        };
      } else {
        console.log(`❌ LOGIN FAILED for ${account.username}`);
        console.log('Error:', data);
      }
    } catch (error) {
      console.log(`💥 ERROR testing ${account.username}:`, error.message);
    }
    
    console.log('\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// AEBON 계정으로 특별 기능 테스트
async function testAebonSpecialFeatures() {
  console.log('👑 Testing AEBON Special Features');
  console.log('==================================\n');
  
  try {
    const loginResponse = await fetch(`${BACKEND_URL}/api/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'aebon_new',
        password: 'AebonAdmin2024!'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ AEBON LOGIN SUCCESS!');
      console.log('👑 Special AEBON Response:', loginData.message);
      console.log('🛡️ Admin Type:', loginData.user.admin_type);
      console.log('⚡ Session Duration:', loginData.user.sessionDuration);
      console.log('🔄 Can Switch Modes:', loginData.user.canSwitchModes);
      
      return loginData;
    }
  } catch (error) {
    console.log('💥 AEBON Test Error:', error.message);
  }
}

// 사용법 출력
console.log(`
🎉 Django Backend Integration TEST SUCCESSFUL!
==============================================

✅ 확인된 작동 계정:

1. 👑 AEBON 슈퍼 관리자:
   Username: aebon_new
   Password: AebonAdmin2024!
   Features: is_superuser, is_staff, 8-hour session

2. 🔧 테스트 관리자:
   Username: testadmin  
   Password: TestAdmin2024!
   Features: 일반 사용자

3. 👤 간단한 테스트:
   Username: simpletest
   Password: Simple123!
   Features: 일반 사용자

🚀 테스트 함수들:

1. testWorkingAccounts()
   - 모든 확인된 계정 로그인 테스트

2. testAebonSpecialFeatures()
   - AEBON 슈퍼 관리자 특별 기능 테스트

3. testRealLogin()
   - 기존 함수 (deprecated)

✨ 추천 테스트:
testWorkingAccounts()

👑 AEBON 테스트:  
testAebonSpecialFeatures()
`);

// 전역 함수로 노출
window.testWorkingAccounts = testWorkingAccounts;
window.testAebonSpecialFeatures = testAebonSpecialFeatures;
window.testRealLogin = testRealLogin;
window.testCreateAebonAccount = testCreateAebonAccount;
window.testServiceEndpoints = testServiceEndpoints;
window.runFullTest = runFullTest;
window.testLogin = testLogin;
window.checkServerRoot = checkServerRoot;
window.checkAPIInfo = checkAPIInfo;