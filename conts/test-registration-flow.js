/**
 * Django 백엔드 회원가입 → 로그인 플로우 테스트
 */

const https = require('https');

async function makeRequest(options, data = null) {
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

async function testRegistration(userData, description) {
  console.log(`📝 Testing Registration: ${description}`);
  console.log(`User: ${userData.username} / ${userData.email}`);
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/register/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options, userData);
    
    console.log(`Registration Status: ${response.status}`);
    console.log(`Registration Response:`, response.data);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ ${description} REGISTRATION SUCCESS!`);
      
      // 등록 성공 시 바로 로그인 테스트
      await testLoginAfterRegistration(userData.username, userData.password);
      
      return { success: true, data: response.data };
    } else {
      console.log(`❌ ${description} REGISTRATION FAILED`);
      
      // 이미 존재하는 계정이면 로그인 시도
      if (response.data?.message?.includes('이미 존재하는')) {
        console.log(`🔄 Account exists, trying login...`);
        await testLoginAfterRegistration(userData.username, userData.password);
      }
      
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`💥 ${description} REGISTRATION ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testLoginAfterRegistration(username, password) {
  console.log(`🔐 Testing Login: ${username}`);
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/login/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  const loginData = { username, password };
  
  try {
    const response = await makeRequest(options, loginData);
    
    console.log(`Login Status: ${response.status}`);
    console.log(`Login Response:`, response.data);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`🎉 LOGIN SUCCESS for ${username}!`);
      
      if (response.data.access) {
        console.log(`🔑 JWT Token received: ${response.data.access.substring(0, 50)}...`);
        await testUserInfo(response.data.access, username);
      }
      
      return { success: true, data: response.data };
    } else {
      console.log(`❌ LOGIN FAILED for ${username}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`💥 LOGIN ERROR for ${username}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testUserInfo(token, username) {
  console.log(`👤 Getting user info for ${username}...`);
  
  const options = {
    hostname: 'ahp-django-backend.onrender.com',
    port: 443,
    path: '/api/user/',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    console.log(`User Info Status: ${response.status}`);
    console.log(`User Data:`, JSON.stringify(response.data, null, 2));
    
    if (response.data.is_superuser) {
      console.log(`👑 ${username} is SUPERUSER!`);
    }
    if (response.data.is_staff) {
      console.log(`🛡️ ${username} is STAFF!`);
    }
    
  } catch (error) {
    console.log(`💥 User Info Error:`, error.message);
  }
  
  console.log('='.repeat(50) + '\n');
}

async function runCompleteRegistrationTest() {
  console.log('🚀 Starting Complete Registration → Login Test Flow');
  console.log('===================================================\n');
  
  // 테스트 계정들
  const testAccounts = [
    {
      username: 'testadmin',
      email: 'testadmin@ahp-system.com',
      password: 'TestAdmin2024!',
      first_name: 'Test',
      last_name: 'Admin'
    },
    {
      username: 'aebon_new',
      email: 'aebon_new@ahp-system.com', 
      password: 'AebonAdmin2024!',
      first_name: 'Aebon',
      last_name: 'Super'
    },
    {
      username: 'simpletest',
      email: 'simple@test.com',
      password: 'Simple123!',
      first_name: 'Simple',
      last_name: 'Test'
    }
  ];
  
  const results = [];
  
  for (const account of testAccounts) {
    const result = await testRegistration(account, `${account.username} Account`);
    results.push({
      username: account.username,
      success: result.success,
      error: result.error
    });
    
    // 요청 간 간격
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('📊 Final Registration Test Summary:');
  console.log('====================================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.username}`));
  
  console.log(`\n❌ Failed: ${failed.length}`);
  failed.forEach(r => console.log(`   - ${r.username}: ${r.error?.message || 'Unknown error'}`));
  
  return results;
}

// 실행
if (require.main === module) {
  runCompleteRegistrationTest();
}