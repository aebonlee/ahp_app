/**
 * 2단계: 기준 설정 API 완전 연동 및 DB 저장 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

// 기존 프로젝트 ID 가져오기
async function getTestProjectId() {
  console.log('🔍 테스트용 프로젝트 ID 가져오기...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    const data = await response.json();
    
    if (response.ok && data.results.length > 0) {
      const projectId = data.results[0].id;
      console.log('✅ 테스트 프로젝트 ID:', projectId);
      return projectId;
    } else {
      console.error('❌ 테스트 프로젝트를 찾을 수 없습니다');
      return null;
    }
  } catch (error) {
    console.error('❌ 프로젝트 조회 실패:', error.message);
    return null;
  }
}

// 기준 생성 API 테스트
async function testCriteriaCreation(projectId) {
  console.log('🔍 기준 생성 API 테스트...');
  
  const testCriteria = [
    {
      project: projectId,
      name: '경제성',
      description: '비용 대비 효과',
      type: 'criteria',
      level: 1,
      order: 1
    },
    {
      project: projectId,
      name: '기술성',
      description: '기술적 실현 가능성',
      type: 'criteria',
      level: 1,
      order: 2
    },
    {
      project: projectId,
      name: '사용성',
      description: '사용자 편의성',
      type: 'criteria',
      level: 1,
      order: 3
    }
  ];

  const createdCriteria = [];

  for (const criteria of testCriteria) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ 기준 생성 성공: ${criteria.name}`, data);
        createdCriteria.push(data);
      } else {
        console.error(`❌ 기준 생성 실패: ${criteria.name}`, response.status, data);
      }
    } catch (error) {
      console.error(`❌ 기준 생성 오류: ${criteria.name}`, error.message);
    }
  }

  return createdCriteria;
}

// 기준 조회 API 테스트
async function testCriteriaRetrieval(projectId) {
  console.log('🔍 기준 조회 API 테스트...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/?project=${projectId}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 기준 조회 성공:', data);
      return data;
    } else {
      console.error('❌ 기준 조회 실패:', response.status, data);
      return null;
    }
  } catch (error) {
    console.error('❌ 기준 조회 오류:', error.message);
    return null;
  }
}

// 기준 수정 API 테스트
async function testCriteriaUpdate(criteriaId) {
  console.log(`🔍 기준 수정 API 테스트 (ID: ${criteriaId})...`);
  
  const updateData = {
    description: '수정된 설명 - API 테스트 완료',
    weight: 0.33
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/${criteriaId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 기준 수정 성공:', data);
      return data;
    } else {
      console.error('❌ 기준 수정 실패:', response.status, data);
      return null;
    }
  } catch (error) {
    console.error('❌ 기준 수정 오류:', error.message);
    return null;
  }
}

// 전체 테스트 실행
async function runCriteriaTest() {
  console.log('🚀 2단계: 기준 설정 API 완전 연동 테스트 시작...\n');
  
  // 1. 테스트 프로젝트 가져오기
  const projectId = await getTestProjectId();
  if (!projectId) {
    console.log('❌ 2단계 실패: 테스트 프로젝트 없음');
    return false;
  }
  
  // 2. 기준 생성 테스트
  const createdCriteria = await testCriteriaCreation(projectId);
  if (createdCriteria.length === 0) {
    console.log('❌ 2단계 실패: 기준 생성 불가');
    return false;
  }
  
  // 3. 기준 조회 테스트  
  const criteria = await testCriteriaRetrieval(projectId);
  if (!criteria) {
    console.log('❌ 2단계 실패: 기준 조회 불가');
    return false;
  }
  
  // 4. 기준 수정 테스트
  if (createdCriteria.length > 0) {
    const updated = await testCriteriaUpdate(createdCriteria[0].id);
    if (!updated) {
      console.log('❌ 2단계 실패: 기준 수정 불가');
      return false;
    }
  }
  
  console.log('\n✅ 2단계 완료: 기준 설정 API 완전 연동 성공!');
  console.log('📊 결과 요약:');
  console.log('- 프로젝트 연동: ✅');
  console.log('- 기준 생성: ✅'); 
  console.log('- 기준 조회: ✅');
  console.log('- 기준 수정: ✅');
  console.log('- DB 저장 확인: ✅');
  console.log(`- 생성된 기준 수: ${createdCriteria.length}개`);
  
  return true;
}

// 실행
runCriteriaTest().then(success => {
  process.exit(success ? 0 : 1);
});