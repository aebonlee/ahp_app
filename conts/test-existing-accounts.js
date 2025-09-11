/**
 * 기존 계정들로 Django 로그인 테스트
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

async function testLogin(username, password, description) {
  console.log(`🔐 Testing ${description} (${username})...`);
  
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
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, response.data);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ ${description} LOGIN SUCCESS!`);
      
      if (response.data.access) {
        console.log(`🔑 JWT Token: ${response.data.access.substring(0, 50)}...`);
        await testUserInfo(response.data.access, username);
      }
      
      return { success: true, data: response.data };
    } else {
      console.log(`❌ ${description} LOGIN FAILED`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`💥 ${description} ERROR:`, error.message);
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
    console.log(`User Data:`, response.data);
    
    if (response.data.is_superuser || response.data.is_staff) {
      console.log(`🛡️ ${username} has admin privileges!`);
    }
    
    console.log('-----------------------------------\n');
    
  } catch (error) {
    console.log(`💥 User Info Error:`, error.message);
  }
}

async function testAllPossibleAccounts() {
  console.log('🎯 Testing All Possible Account Combinations');
  console.log('=============================================\n');
  
  // 가능한 계정 조합들
  const accounts = [
    { username: 'aebon', password: 'AebonAdmin2024!', desc: 'AEBON Super Admin' },
    { username: 'admin', password: 'ahp2025admin', desc: 'Default Admin' },
    { username: 'admin', password: 'admin', desc: 'Simple Admin' },
    { username: 'superuser', password: 'superuser', desc: 'Super User' },
    { username: 'root', password: 'root', desc: 'Root User' },
    { username: 'aebon', password: 'aebon', desc: 'AEBON Simple' },
    { username: 'aebon', password: 'admin', desc: 'AEBON with admin password' },
    { username: 'test', password: 'test', desc: 'Test User' }
  ];
  
  const results = [];
  
  for (const account of accounts) {
    const result = await testLogin(account.username, account.password, account.desc);
    results.push({
      username: account.username,
      password: account.password,
      success: result.success,
      error: result.error
    });
    
    // 요청 간 간격
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📊 Final Test Summary:');
  console.log('=======================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful Logins: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.username} / ${r.password}`));
  
  console.log(`\n❌ Failed Logins: ${failed.length}`);
  failed.forEach(r => console.log(`   - ${r.username} / ${r.password}: ${r.error?.message || 'Unknown error'}`));
  
  return results;
}

// 실행
if (require.main === module) {
  testAllPossibleAccounts();
}