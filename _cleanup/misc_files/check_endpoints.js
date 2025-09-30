/**
 * Django Backend 사용 가능한 엔드포인트 확인
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function checkAvailableEndpoints() {
  console.log('🔍 사용 가능한 API 엔드포인트 확인...\n');
  
  // 1. API 루트 확인
  try {
    const response = await fetch(`${API_BASE_URL}/api/`);
    const data = await response.json();
    console.log('✅ API 루트 정보:', data);
  } catch (error) {
    console.error('❌ API 루트 확인 실패:', error.message);
  }
  
  // 2. 프로젝트 엔드포인트 OPTIONS 확인
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/`, {
      method: 'OPTIONS'
    });
    console.log('✅ 프로젝트 API OPTIONS:', response.status, response.headers.get('allow'));
  } catch (error) {
    console.error('❌ 프로젝트 OPTIONS 확인 실패:', error.message);
  }
  
  // 3. 프로젝트 GET 테스트
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/`);
    const data = await response.json();
    console.log('✅ 프로젝트 GET 테스트:', response.status, data);
  } catch (error) {
    console.error('❌ 프로젝트 GET 실패:', error.message);
  }
  
  // 4. 다른 가능한 경로들 테스트
  const possiblePaths = [
    '/api/projects/',
    '/api/v1/projects/',
    '/api/service/projects/projects/'
  ];
  
  for (const path of possiblePaths) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`);
      if (response.status !== 404) {
        console.log(`✅ 경로 발견: ${path} - Status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          console.log('   데이터:', data);
        }
      }
    } catch (error) {
      console.log(`❌ 경로 실패: ${path} - ${error.message}`);
    }
  }
}

// 실행
checkAvailableEndpoints();