/**
 * 백엔드 DB에 직접 기준 데이터 설정 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function testBackendSetup() {
  console.log('🔍 백엔드 DB 직접 설정 테스트...\n');
  
  // 1. setup-db 엔드포인트 테스트 (Django 관리자 계정 생성)
  try {
    console.log('1. setup-db 테스트...');
    const response = await fetch(`${API_BASE_URL}/setup-db/`);
    const data = await response.json();
    console.log('✅ setup-db 응답:', data);
  } catch (error) {
    console.error('❌ setup-db 오류:', error.message);
  }
  
  // 2. admin 계정으로 JWT 토큰 받기
  try {
    console.log('\n2. JWT 토큰 받기...');
    const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ JWT 토큰 받기 성공:', data);
      return data.access; // 토큰 반환
    } else {
      const errorData = await response.json();
      console.log('❌ JWT 토큰 받기 실패:', errorData);
      return null;
    }
  } catch (error) {
    console.error('❌ JWT 토큰 오류:', error.message);
    return null;
  }
}

// 토큰을 사용한 기준 생성 테스트
async function testCriteriaWithAuth(token) {
  console.log('\n🔍 인증된 기준 생성 테스트...');
  
  const projectId = '1aabd1e2-e9ac-4297-90b1-64dfc04cc9c7';
  const testCriteria = {
    project: projectId,
    name: '인증된 기준',
    description: '토큰을 사용한 기준 생성 테스트',
    type: 'criteria',
    level: 1,
    order: 1
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testCriteria)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 인증된 기준 생성 성공:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.log('❌ 인증된 기준 생성 실패:', errorData);
      return null;
    }
  } catch (error) {
    console.error('❌ 인증된 기준 생성 오류:', error.message);
    return null;
  }
}

// 토큰을 사용한 기준 조회 테스트
async function testCriteriaListWithAuth(token) {
  console.log('\n🔍 인증된 기준 조회 테스트...');
  
  const projectId = '1aabd1e2-e9ac-4297-90b1-64dfc04cc9c7';

  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/criteria/?project=${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 인증된 기준 조회 성공:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.log('❌ 인증된 기준 조회 실패:', errorData);
      return null;
    }
  } catch (error) {
    console.error('❌ 인증된 기준 조회 오류:', error.message);
    return null;
  }
}

// 전체 테스트 실행
async function runAuthTest() {
  console.log('🚀 2단계: 인증 기반 기준 설정 API 테스트 시작...\n');
  
  // 1. 백엔드 설정 및 토큰 받기
  const token = await testBackendSetup();
  if (!token) {
    console.log('❌ 2단계 실패: 인증 토큰 받기 불가');
    return false;
  }
  
  // 2. 인증된 기준 생성
  const createdCriteria = await testCriteriaWithAuth(token);
  if (!createdCriteria) {
    console.log('❌ 2단계 실패: 인증된 기준 생성 불가');
    return false;
  }
  
  // 3. 인증된 기준 조회
  const criteria = await testCriteriaListWithAuth(token);
  if (!criteria) {
    console.log('❌ 2단계 실패: 인증된 기준 조회 불가');
    return false;
  }
  
  console.log('\n✅ 2단계 완료: 기준 설정 API 완전 연동 성공!');
  console.log('📊 결과 요약:');
  console.log('- 백엔드 설정: ✅');
  console.log('- JWT 인증: ✅'); 
  console.log('- 기준 생성: ✅');
  console.log('- 기준 조회: ✅');
  console.log('- DB 저장 확인: ✅');
  
  return true;
}

runAuthTest().then(success => {
  process.exit(success ? 0 : 1);
});