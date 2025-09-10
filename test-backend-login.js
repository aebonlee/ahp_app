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

// 다양한 로그인 엔드포인트 시도
const LOGIN_ENDPOINTS = [
  '/api/auth/login/',
  '/auth/login/',
  '/login/',
  '/api/login/',
  '/api/token/',
  '/token/',
  '/api/users/login/',
  '/users/login/'
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

// 사용법 출력
console.log(`
🔧 Django Backend Test Tool
===========================

사용 가능한 함수들:

1. runFullTest()
   - 전체 API 검사 및 로그인 테스트

2. testLogin('/endpoint', {username, password})
   - 특정 엔드포인트로 로그인 테스트

3. checkServerRoot()
   - 서버 루트 응답 확인

4. checkAPIInfo()
   - API 문서 엔드포인트 확인

테스트 시작하려면:
runFullTest()
`);

// 전역 함수로 노출
window.runFullTest = runFullTest;
window.testLogin = testLogin;
window.checkServerRoot = checkServerRoot;
window.checkAPIInfo = checkAPIInfo;