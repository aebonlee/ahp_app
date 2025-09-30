/**
 * 올바른 API 경로 확인 및 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function testCorrectAPI() {
  console.log('🔍 올바른 API 경로 확인...\n');
  
  const testProjectId = 'e7c91314-9052-4cb0-86ce-5c5335bd89e9';
  
  try {
    // 1. 프로젝트 관련 API 확인
    console.log('1. 프로젝트 API 확인...');
    const projectsEndpoints = [
      '/api/projects/',
      `/api/projects/${testProjectId}/`,
      `/api/projects/${testProjectId}/criteria/`,
      `/api/projects/${testProjectId}/alternatives/`,
      `/api/projects/${testProjectId}/evaluators/`,
      `/api/projects/${testProjectId}/evaluations/`,
    ];
    
    for (const endpoint of projectsEndpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint} -> ${response.status}`);
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`   📄 응답: ${Array.isArray(data) ? `배열 (${data.length}개)` : typeof data}`);
            if (Array.isArray(data) && data.length > 0) {
              console.log(`   📋 첫번째 항목 키: ${Object.keys(data[0]).join(', ')}`);
            } else if (typeof data === 'object' && data !== null) {
              console.log(`   📋 응답 키: ${Object.keys(data).slice(0, 5).join(', ')}`);
            }
          } catch (e) {
            console.log(`   📄 응답: 텍스트/기타 형식`);
          }
        }
      } catch (error) {
        console.log(`❌ ${endpoint} -> 연결 실패`);
      }
    }
    
    // 2. 평가 API 확인
    console.log('\n2. 평가 API 확인...');
    const evaluationEndpoints = [
      '/api/evaluations/',
      `/api/evaluations/${testProjectId}/`,
      '/api/evaluations/results/',
    ];
    
    for (const endpoint of evaluationEndpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint} -> ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint} -> 연결 실패`);
      }
    }
    
    // 3. 분석 API 확인
    console.log('\n3. 분석 API 확인...');
    const analysisEndpoints = [
      '/api/analysis/',
      `/api/analysis/${testProjectId}/`,
      '/api/analysis/results/',
    ];
    
    for (const endpoint of analysisEndpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint} -> ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint} -> 연결 실패`);
      }
    }
    
    // 4. 계정 API 확인
    console.log('\n4. 계정 API 확인...');
    const accountEndpoints = [
      '/api/accounts/',
      '/api/accounts/profile/',
      '/api/accounts/users/',
    ];
    
    for (const endpoint of accountEndpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint} -> ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint} -> 연결 실패`);
      }
    }
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
  }
}

testCorrectAPI().then(() => {
  console.log('\n🏁 올바른 API 경로 확인 완료!');
});