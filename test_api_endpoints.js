/**
 * 백엔드 API 엔드포인트 확인 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function checkAPIEndpoints() {
  console.log('🔍 백엔드 API 엔드포인트 확인...\n');
  
  try {
    // 1. 백엔드 상태 확인
    console.log('1. 백엔드 상태 확인...');
    const healthResponse = await fetch(`${API_BASE_URL}/health/`);
    const dbResponse = await fetch(`${API_BASE_URL}/db-status/`);
    
    if (healthResponse.ok && dbResponse.ok) {
      console.log('✅ 백엔드 연결 정상');
      const dbStatus = await dbResponse.json();
      console.log(`✅ DB: ${dbStatus.connection} (${dbStatus.tables_count}개 테이블)`);
    }
    
    // 2. 프로젝트 API 확인
    console.log('\n2. 프로젝트 API 구조 확인...');
    const projectsResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      console.log(`✅ 프로젝트 목록: ${projectsData.results?.length || 0}개`);
      if (projectsData.results?.[0]) {
        const firstProject = projectsData.results[0];
        console.log(`📋 첫번째 프로젝트 ID: ${firstProject.id}`);
        console.log(`📋 프로젝트 제목: ${firstProject.title}`);
      }
    }
    
    // 3. 가능한 API 엔드포인트 테스트
    console.log('\n3. 기준/대안 API 엔드포인트 테스트...');
    const testProjectId = 'e7c91314-9052-4cb0-86ce-5c5335bd89e9';
    
    const endpoints = [
      `/api/service/projects/criteria/`,
      `/api/service/projects/alternatives/`,
      `/api/service/projects/evaluators/`,
      `/api/projects/${testProjectId}/criteria/`,
      `/api/projects/${testProjectId}/alternatives/`,
      `/api/projects/${testProjectId}/evaluators/`,
      `/api/service/criteria/`,
      `/api/service/alternatives/`,
      `/api/service/evaluators/`,
      `/api/criteria/`,
      `/api/alternatives/`,
      `/api/evaluators/`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint} -> ${response.status}`);
        
        // 성공한 엔드포인트의 응답 구조 확인
        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`   📄 응답 구조: ${Array.isArray(data) ? `배열 (${data.length}개)` : typeof data}`);
          } catch (e) {
            console.log(`   📄 응답: 텍스트 형식`);
          }
        }
      } catch (error) {
        console.log(`❌ ${endpoint} -> 연결 실패`);
      }
    }
    
    // 4. Django Admin API 확인
    console.log('\n4. Django 관리자 API 확인...');
    const adminEndpoints = [
      '/admin/',
      '/api/',
      '/api/admin/',
      '/api/service/',
      '/api/service/projects/',
      '/swagger/',
      '/docs/',
    ];
    
    for (const endpoint of adminEndpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint} -> ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint} -> 연결 실패`);
      }
    }
    
  } catch (error) {
    console.error('❌ API 확인 실패:', error.message);
  }
}

checkAPIEndpoints().then(() => {
  console.log('\n🏁 API 엔드포인트 확인 완료!');
});