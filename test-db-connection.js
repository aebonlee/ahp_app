/**
 * PostgreSQL DB 연결 테스트 스크립트
 * 백엔드와 데이터베이스 연결 상태를 확인합니다.
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function testConnection() {
  console.log('='.repeat(60));
  console.log('🚀 AHP 플랫폼 백엔드 & DB 연결 테스트');
  console.log('='.repeat(60));
  console.log('백엔드 URL:', API_BASE_URL);
  console.log('테스트 시작 시간:', new Date().toLocaleString('ko-KR'));
  console.log('-'.repeat(60));

  // 1. 프로젝트 목록 조회 테스트
  console.log('\n📋 1. 프로젝트 목록 조회 테스트');
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    const data = await response.json();
    console.log('✅ 성공 - 프로젝트 개수:', data.count);
    if (data.results && data.results.length > 0) {
      console.log('   최근 프로젝트:');
      data.results.forEach(p => {
        console.log(`   - ${p.title} (ID: ${p.id})`);
      });
    }
  } catch (error) {
    console.error('❌ 실패:', error.message);
  }

  // 2. 새 프로젝트 생성 테스트
  console.log('\n📝 2. 새 프로젝트 생성 테스트');
  const testProject = {
    title: `Test Project ${Date.now()}`,
    description: 'DB Connection Test',
    objective: 'Testing Database Connection',
    status: 'draft',
    evaluation_mode: 'practical',
    workflow_stage: 'creating'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProject)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 성공 - 프로젝트 생성됨');
      console.log('   제목:', data.title);
      console.log('   설명:', data.description);
      return data; // 생성된 프로젝트 ID 반환
    } else {
      const error = await response.text();
      console.error('❌ 실패:', response.status, error);
    }
  } catch (error) {
    console.error('❌ 실패:', error.message);
  }

  // 3. DB 상태 확인 (프로젝트 수 확인)
  console.log('\n🗄️ 3. PostgreSQL DB 상태 확인');
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    const data = await response.json();
    console.log('✅ DB 연결 정상');
    console.log('   총 프로젝트 수:', data.count);
    console.log('   페이징 상태: next =', data.next || 'null', ', previous =', data.previous || 'null');
  } catch (error) {
    console.error('❌ DB 연결 실패:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('테스트 완료 시간:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(60));
}

// Node.js에서 실행
if (typeof window === 'undefined') {
  // Node.js 환경
  testConnection().catch(console.error);
} else {
  // 브라우저 환경
  console.log('브라우저에서 테스트를 실행하려면 testConnection() 함수를 호출하세요.');
}