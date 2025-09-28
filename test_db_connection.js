// DB 연결 및 프로젝트 생성 테스트 스크립트
const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function testBackendConnection() {
  console.log('=== 백엔드 연결 테스트 시작 ===\n');
  
  // 1. 헬스 체크
  console.log('1️⃣ 헬스 체크 테스트');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ 헬스 체크 성공:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.error('❌ 헬스 체크 실패:', error.message);
    return;
  }
  
  console.log('\n2️⃣ 프로젝트 목록 조회 테스트');
  try {
    const projectsResponse = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('응답 상태:', projectsResponse.status, projectsResponse.statusText);
    console.log('응답 헤더:', [...projectsResponse.headers.entries()]);
    
    const contentType = projectsResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const projectsData = await projectsResponse.json();
      console.log('✅ 프로젝트 목록 조회 성공:', JSON.stringify(projectsData, null, 2));
    } else {
      const text = await projectsResponse.text();
      console.log('⚠️ JSON이 아닌 응답:', text.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ 프로젝트 목록 조회 실패:', error.message);
  }
  
  console.log('\n3️⃣ 프로젝트 생성 테스트');
  try {
    const testProject = {
      title: `테스트 프로젝트 ${new Date().toISOString()}`,
      description: 'DB 연결 테스트용 프로젝트',
      objective: 'DB 저장 테스트',
      status: 'draft',
      evaluation_mode: 'practical',
      workflow_stage: 'creating'
    };
    
    console.log('생성할 프로젝트:', JSON.stringify(testProject, null, 2));
    
    const createResponse = await fetch(`${API_BASE_URL}/api/v1/projects/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProject)
    });
    
    console.log('응답 상태:', createResponse.status, createResponse.statusText);
    
    const contentType = createResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const createData = await createResponse.json();
      console.log('✅ 프로젝트 생성 결과:', JSON.stringify(createData, null, 2));
      
      if (createData.id) {
        console.log(`\n🎉 성공! 프로젝트 ID: ${createData.id}`);
      }
    } else {
      const text = await createResponse.text();
      console.log('⚠️ JSON이 아닌 응답:', text.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ 프로젝트 생성 실패:', error.message);
  }
  
  console.log('\n=== 테스트 완료 ===');
}

// Node.js 환경에서 실행
testBackendConnection();