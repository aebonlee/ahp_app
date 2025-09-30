/**
 * 간단한 기준 API 테스트 - 권한 문제 확인
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function testSimpleCriteria() {
  console.log('🔍 간단한 기준 API 테스트...\n');
  
  // 1. GET 요청 (조회) 테스트
  try {
    console.log('1. GET 테스트...');
    const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/`);
    console.log('상태 코드:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET 성공:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ GET 실패:', errorText);
    }
  } catch (error) {
    console.error('❌ GET 오류:', error.message);
  }
  
  // 2. 프로젝트별 기준 조회 테스트
  try {
    console.log('\n2. 프로젝트별 기준 조회 테스트...');
    const projectId = '1aabd1e2-e9ac-4297-90b1-64dfc04cc9c7'; // 기존 프로젝트 ID
    const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/?project=${projectId}`);
    console.log('상태 코드:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 프로젝트별 조회 성공:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ 프로젝트별 조회 실패:', errorText);
    }
  } catch (error) {
    console.error('❌ 프로젝트별 조회 오류:', error.message);
  }
  
  // 3. 다른 경로들도 테스트
  const alternatePaths = [
    '/api/projects/criteria/',
    '/api/criteria/',
    '/api/v1/criteria/'
  ];
  
  for (const path of alternatePaths) {
    try {
      console.log(`\n3. 대체 경로 테스트: ${path}`);
      const response = await fetch(`${API_BASE_URL}${path}`);
      console.log(`${path} 상태 코드:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${path} 성공:`, data);
      } else if (response.status !== 404) {
        const errorText = await response.text();
        console.log(`❌ ${path} 실패:`, errorText.substring(0, 100));
      }
    } catch (error) {
      console.log(`❌ ${path} 오류:`, error.message);
    }
  }
}

testSimpleCriteria();