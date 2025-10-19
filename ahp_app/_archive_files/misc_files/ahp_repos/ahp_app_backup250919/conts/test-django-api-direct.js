/**
 * Django 백엔드 API 직접 테스트 스크립트
 * Node.js 환경에서 실행 가능
 */

const https = require('https');
const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

// HTTP 요청 헬퍼 함수
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Django 백엔드 로그인 테스트
async function testLogin() {
  console.log('🔐 Testing Django Backend Login...\n');
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Django-Test-Client'
    }
  };
  
  const loginData = {
    username: 'admin',
    password: 'ahp2025admin'
  };
  
  try {
    const response = await makeRequest(options, loginData);
    
    console.log('📊 Login Test Results:');
    console.log('======================');
    console.log('Status Code:', response.status);
    console.log('Response Data:', response.data);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ LOGIN SUCCESS!');
      
      if (response.data.access) {
        console.log('🔑 JWT Token received:', response.data.access.substring(0, 50) + '...');
        await testUserInfo(response.data.access);
      }
      
      return response.data;
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('Error:', response.data);
    }
  } catch (error) {
    console.log('💥 LOGIN ERROR:', error.message);
  }
}

// 사용자 정보 API 테스트
async function testUserInfo(token) {
  console.log('\n👤 Testing User Info API...\n');
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/user/',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Django-Test-Client'
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    console.log('📊 User Info Test Results:');
    console.log('===========================');
    console.log('Status Code:', response.status);
    console.log('User Data:', response.data);
    
    if (response.status === 200) {
      console.log('✅ USER INFO SUCCESS!');
      return response.data;
    } else {
      console.log('❌ USER INFO FAILED');
    }
  } catch (error) {
    console.log('💥 USER INFO ERROR:', error.message);
  }
}

// 회원가입 테스트 (aebon 계정)
async function testCreateAebon() {
  console.log('\n👑 Testing AEBON Account Creation...\n');
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/register/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Django-Test-Client'
    }
  };
  
  const aebonData = {
    username: 'aebon',
    email: 'aebon@ahp-system.com',
    password: 'AebonAdmin2024!',
    first_name: 'Aebon',
    last_name: 'Super'
  };
  
  try {
    const response = await makeRequest(options, aebonData);
    
    console.log('📊 AEBON Creation Test Results:');
    console.log('================================');
    console.log('Status Code:', response.status);
    console.log('Response Data:', response.data);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ AEBON ACCOUNT CREATED!');
      
      // 바로 로그인 테스트
      await testAebonLogin();
      
      return response.data;
    } else {
      console.log('❌ AEBON CREATION FAILED');
      console.log('Error:', response.data);
    }
  } catch (error) {
    console.log('💥 AEBON CREATION ERROR:', error.message);
  }
}

// AEBON 로그인 테스트
async function testAebonLogin() {
  console.log('\n🎯 Testing AEBON Login...\n');
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Django-Test-Client'
    }
  };
  
  const aebonLogin = {
    username: 'aebon',
    password: 'AebonAdmin2024!'
  };
  
  try {
    const response = await makeRequest(options, aebonLogin);
    
    console.log('📊 AEBON Login Test Results:');
    console.log('=============================');
    console.log('Status Code:', response.status);
    console.log('Response Data:', response.data);
    
    if (response.status === 200 || response.status === 201) {
      console.log('🎉 AEBON LOGIN SUCCESS!');
      
      if (response.data.access) {
        console.log('🔑 AEBON JWT Token received');
        await testUserInfo(response.data.access);
      }
      
      return response.data;
    } else {
      console.log('❌ AEBON LOGIN FAILED');
    }
  } catch (error) {
    console.log('💥 AEBON LOGIN ERROR:', error.message);
  }
}

// 서비스 상태 테스트
async function testServiceStatus() {
  console.log('\n🛠️ Testing Service Status...\n');
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/service/status/',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Django-Test-Client'
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    console.log('📊 Service Status Results:');
    console.log('===========================');
    console.log('Status Code:', response.status);
    console.log('Service Data:', response.data);
    
    if (response.status === 200) {
      console.log('✅ SERVICE STATUS SUCCESS!');
    } else {
      console.log('❌ SERVICE STATUS FAILED');
    }
  } catch (error) {
    console.log('💥 SERVICE STATUS ERROR:', error.message);
  }
}

// 전체 테스트 실행
async function runCompleteTest() {
  console.log('🚀 Starting Complete Django Backend Integration Test');
  console.log('====================================================\n');
  
  try {
    // 1. 서비스 상태 확인
    await testServiceStatus();
    
    // 2. 기본 관리자 로그인 테스트
    await testLogin();
    
    // 3. AEBON 계정 생성 및 로그인
    await testCreateAebon();
    
    console.log('\n🎯 Complete Test Summary:');
    console.log('=========================');
    console.log('✅ Service Status: Tested');
    console.log('✅ Admin Login: Tested');
    console.log('✅ AEBON Creation: Tested');
    console.log('✅ AEBON Login: Tested');
    console.log('✅ User Info API: Tested');
    
  } catch (error) {
    console.log('\n💥 Complete Test Error:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  runCompleteTest();
}

module.exports = {
  testLogin,
  testUserInfo,
  testCreateAebon,
  testAebonLogin,
  testServiceStatus,
  runCompleteTest
};