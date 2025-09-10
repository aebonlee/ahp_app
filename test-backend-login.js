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

// 사용법 출력
console.log(`
🔧 Django Backend Integration Test Tool
=======================================

확인된 API 엔드포인트:
- POST /api/login/ (로그인)
- POST /api/register/ (회원가입)  
- GET /api/user/ (사용자 정보)
- GET /api/service/* (서비스 API들)

사용 가능한 함수들:

1. testRealLogin()
   - 실제 admin 계정으로 로그인 테스트

2. testCreateAebonAccount()
   - aebon 슈퍼 관리자 계정 생성 및 로그인

3. testServiceEndpoints()  
   - 서비스 API 엔드포인트들 테스트

4. runFullTest()
   - 전체 API 탐색 (이전 버전)

실제 연동 테스트 시작:
testRealLogin()

aebon 계정 생성:
testCreateAebonAccount()
`);

// 전역 함수로 노출
window.testRealLogin = testRealLogin;
window.testCreateAebonAccount = testCreateAebonAccount;
window.testServiceEndpoints = testServiceEndpoints;
window.runFullTest = runFullTest;
window.testLogin = testLogin;
window.checkServerRoot = checkServerRoot;
window.checkAPIInfo = checkAPIInfo;