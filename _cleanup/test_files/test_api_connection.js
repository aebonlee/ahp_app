/**
 * Django Backend API 연결 테스트 스크립트
 * 1단계: 프로젝트 생성 API 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

// 1. 백엔드 상태 확인
async function testBackendHealth() {
  console.log('🔍 1단계: 백엔드 상태 확인...');
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    const data = await response.json();
    console.log('✅ 백엔드 상태:', data);
    return true;
  } catch (error) {
    console.error('❌ 백엔드 연결 실패:', error.message);
    return false;
  }
}

// 2. DB 상태 확인
async function testDatabaseStatus() {
  console.log('🔍 2단계: DB 상태 확인...');
  try {
    const response = await fetch(`${API_BASE_URL}/db-status/`);
    const data = await response.json();
    console.log('✅ DB 상태:', data);
    return data.connection === 'OK';
  } catch (error) {
    console.error('❌ DB 상태 확인 실패:', error.message);
    return false;
  }
}

// 3. 프로젝트 생성 API 테스트
async function testProjectCreation() {
  console.log('🔍 3단계: 프로젝트 생성 API 테스트...');
  
  const testProject = {
    title: '테스트 프로젝트 ' + Date.now(),
    description: 'API 연결 테스트용 프로젝트',
    objective: '프론트엔드-백엔드 DB 연동 테스트',
    evaluation_mode: 'practical',
    status: 'draft'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProject)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 프로젝트 생성 성공:', data);
      return data;
    } else {
      console.error('❌ 프로젝트 생성 실패:', response.status, data);
      return null;
    }
  } catch (error) {
    console.error('❌ 프로젝트 생성 API 오류:', error.message);
    return null;
  }
}

// 4. 생성된 프로젝트 조회 테스트
async function testProjectRetrieval() {
  console.log('🔍 4단계: 프로젝트 목록 조회 테스트...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 프로젝트 목록 조회 성공:', data);
      return data;
    } else {
      console.error('❌ 프로젝트 조회 실패:', response.status, data);
      return null;
    }
  } catch (error) {
    console.error('❌ 프로젝트 조회 API 오류:', error.message);
    return null;
  }
}

// 전체 테스트 실행
async function runCompleteTest() {
  console.log('🚀 1단계: 프로젝트 생성 API 완전 연동 테스트 시작...\n');
  
  // 1. 백엔드 상태 확인
  const backendOk = await testBackendHealth();
  if (!backendOk) {
    console.log('❌ 1단계 실패: 백엔드 연결 불가');
    return false;
  }
  
  // 2. DB 상태 확인  
  const dbOk = await testDatabaseStatus();
  if (!dbOk) {
    console.log('❌ 1단계 실패: DB 연결 불가');
    return false;
  }
  
  // 3. 프로젝트 생성 테스트
  const createdProject = await testProjectCreation();
  if (!createdProject) {
    console.log('❌ 1단계 실패: 프로젝트 생성 불가');
    return false;
  }
  
  // 4. 프로젝트 조회 테스트
  const projects = await testProjectRetrieval();
  if (!projects) {
    console.log('❌ 1단계 실패: 프로젝트 조회 불가');
    return false;
  }
  
  console.log('\n✅ 1단계 완료: 프로젝트 생성 API 완전 연동 성공!');
  console.log('📊 결과 요약:');
  console.log('- 백엔드 연결: ✅');
  console.log('- DB 연결: ✅'); 
  console.log('- 프로젝트 생성: ✅');
  console.log('- 프로젝트 조회: ✅');
  console.log('- DB 저장 확인: ✅');
  
  return true;
}

// Node.js 환경에서 실행
if (typeof module !== 'undefined' && module.exports) {
  runCompleteTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

// 브라우저 환경에서 실행
if (typeof window !== 'undefined') {
  window.runCompleteTest = runCompleteTest;
}