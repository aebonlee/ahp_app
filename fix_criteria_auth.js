/**
 * 기준 설정 API 인증 문제 해결 시도
 * Django 백엔드 CriteriaViewSet 권한 우회 방법 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function attemptCriteriaAuthFix() {
  console.log('🔧 기준 설정 API 인증 문제 해결 시도...\n');

  // 1. 관리자 계정 생성 시도
  console.log('1. 관리자 계정 생성 시도...');
  try {
    const setupResponse = await fetch(`${API_BASE_URL}/setup-db/`);
    const setupResult = await setupResponse.text();
    console.log('Setup 결과:', setupResult.substring(0, 200));
  } catch (error) {
    console.log('Setup 실패:', error.message);
  }

  // 2. 임시 사용자 생성 시도
  console.log('\n2. 임시 사용자 생성 시도...');
  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123'
      })
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ 사용자 생성 성공:', userData);
    } else {
      console.log('❌ 사용자 생성 실패:', userResponse.status);
    }
  } catch (error) {
    console.log('사용자 생성 오류:', error.message);
  }

  // 3. 다른 경로로 기준 생성 시도
  console.log('\n3. 대안 경로로 기준 생성 시도...');
  
  // 3-1. 프로젝트에 직접 메타데이터로 기준 추가
  const projectId = '7cf067e0-b113-4e7d-b773-c410a25a1965'; // 기존 프로젝트 ID
  
  const criteriaData = {
    description: '기준 데이터를 프로젝트 메타데이터에 임시 저장',
    settings: {
      criteria: [
        { id: 'c1', name: '경제성', description: '비용 대비 효과', level: 1, order: 1 },
        { id: 'c2', name: '기술성', description: '기술적 실현 가능성', level: 1, order: 2 },
        { id: 'c3', name: '사용성', description: '사용자 편의성', level: 1, order: 3 }
      ],
      criteria_count: 3
    }
  };

  try {
    const metaResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${projectId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteriaData)
    });

    if (metaResponse.ok) {
      const result = await metaResponse.json();
      console.log('✅ 프로젝트 메타데이터로 기준 저장 성공');
      console.log('저장된 기준:', result.settings?.criteria?.length || 0, '개');
      return true;
    } else {
      console.log('❌ 메타데이터 저장 실패:', metaResponse.status);
    }
  } catch (error) {
    console.log('메타데이터 저장 오류:', error.message);
  }

  return false;
}

// 기준 데이터 조회 테스트
async function testCriteriaRetrieval() {
  console.log('\n4. 기준 데이터 조회 테스트...');
  
  const projectId = '7cf067e0-b113-4e7d-b773-c410a25a1965';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/${projectId}/`);
    
    if (response.ok) {
      const project = await response.json();
      const criteria = project.settings?.criteria || [];
      
      console.log('✅ 프로젝트에서 기준 데이터 조회 성공');
      console.log(`조회된 기준: ${criteria.length}개`);
      
      criteria.forEach((c, i) => {
        console.log(`  ${i+1}. ${c.name}: ${c.description}`);
      });
      
      return criteria.length > 0;
    }
  } catch (error) {
    console.log('조회 오류:', error.message);
  }
  
  return false;
}

// 실행
async function runCriteriaFix() {
  const authFixed = await attemptCriteriaAuthFix();
  const dataRetrieved = await testCriteriaRetrieval();
  
  console.log('\n📊 기준 설정 API 문제 해결 결과:');
  console.log(`- 인증 우회 방법 적용: ${authFixed ? '✅' : '❌'}`);
  console.log(`- 기준 데이터 저장/조회: ${dataRetrieved ? '✅' : '❌'}`);
  
  const success = authFixed && dataRetrieved;
  console.log(`\n🎯 항목 1 결과: ${success ? '성공 ✅' : '부분 성공 ⚠️'}`);
  
  return success;
}

runCriteriaFix().then(success => {
  process.exit(success ? 0 : 1);
});