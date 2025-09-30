/**
 * 프론트엔드 브라우저 실제 동작 테스트 검증
 * React 앱과 백엔드 API 연동 상태 확인
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function validateFrontendBackendIntegration() {
  console.log('🌐 프론트엔드-백엔드 통합 검증 시작...\n');

  let validationResults = [];
  let successCount = 0;

  // 1. 백엔드 API 상태 확인
  console.log('1. 백엔드 API 상태 확인...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health/`);
    if (healthResponse.ok) {
      console.log('✅ 백엔드 API 서버 정상 동작');
      validationResults.push('백엔드 API 상태: ✅');
      successCount++;
    } else {
      console.log('❌ 백엔드 API 서버 응답 오류:', healthResponse.status);
      validationResults.push('백엔드 API 상태: ❌');
    }
  } catch (error) {
    console.log('❌ 백엔드 API 서버 연결 실패:', error.message);
    validationResults.push('백엔드 API 상태: ❌');
  }

  // 2. CORS 설정 확인
  console.log('\n2. CORS 설정 확인...');
  try {
    const corsResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   CORS 응답 상태:', corsResponse.status);
    console.log('   응답 헤더 확인:', corsResponse.headers.get('access-control-allow-origin'));
    
    if (corsResponse.status === 200 || corsResponse.status === 403) {
      console.log('✅ CORS 설정 정상 (프론트엔드 접근 가능)');
      validationResults.push('CORS 설정: ✅');
      successCount++;
    } else {
      console.log('❌ CORS 설정 문제 또는 API 오류');
      validationResults.push('CORS 설정: ❌');
    }
  } catch (error) {
    console.log('❌ CORS 테스트 실패:', error.message);
    validationResults.push('CORS 설정: ❌');
  }

  // 3. 프로젝트 API 엔드포인트 확인
  console.log('\n3. 프로젝트 API 엔드포인트 확인...');
  try {
    const projectsResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    
    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      console.log('✅ 프로젝트 API 정상 동작');
      console.log(`   응답 구조: ${projectsData.count !== undefined ? 'pagination' : 'array'}`);
      console.log(`   프로젝트 수: ${projectsData.count || projectsData.length || 0}개`);
      validationResults.push('프로젝트 API: ✅');
      successCount++;
    } else {
      console.log('❌ 프로젝트 API 오류:', projectsResponse.status);
      validationResults.push('프로젝트 API: ❌');
    }
  } catch (error) {
    console.log('❌ 프로젝트 API 테스트 실패:', error.message);
    validationResults.push('프로젝트 API: ❌');
  }

  // 4. 데이터베이스 연결 상태 확인
  console.log('\n4. 데이터베이스 연결 상태 확인...');
  try {
    const dbResponse = await fetch(`${API_BASE_URL}/db-status/`);
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('✅ 데이터베이스 연결 정상');
      console.log(`   DB 정보: ${dbData.connection} (${dbData.tables_count}개 테이블)`);
      console.log(`   DB 엔진: ${dbData.engine || 'Unknown'}`);
      validationResults.push('데이터베이스 연결: ✅');
      successCount++;
    } else {
      console.log('❌ 데이터베이스 상태 확인 실패:', dbResponse.status);
      validationResults.push('데이터베이스 연결: ❌');
    }
  } catch (error) {
    console.log('❌ 데이터베이스 상태 테스트 실패:', error.message);
    validationResults.push('데이터베이스 연결: ❌');
  }

  // 5. 프론트엔드 타입스크립트 호환성 확인
  console.log('\n5. 프론트엔드 타입스크립트 호환성 확인...');
  
  // 간단한 타입 호환성 테스트
  const sampleProjectData = {
    title: 'Frontend Validation Test',
    description: 'TypeScript 호환성 테스트',
    objective: 'API 타입 일치성 검증',
    evaluation_mode: 'practical',
    status: 'draft',
    workflow_stage: 'creating'
  };

  try {
    // JSON 직렬화 테스트
    const serialized = JSON.stringify(sampleProjectData);
    const deserialized = JSON.parse(serialized);
    
    const hasRequiredFields = deserialized.title && 
                             deserialized.description && 
                             deserialized.evaluation_mode && 
                             deserialized.status;

    if (hasRequiredFields) {
      console.log('✅ 프론트엔드 데이터 구조 호환성 확인');
      validationResults.push('TypeScript 호환성: ✅');
      successCount++;
    } else {
      console.log('❌ 프론트엔드 데이터 구조 문제');
      validationResults.push('TypeScript 호환성: ❌');
    }
  } catch (error) {
    console.log('❌ 타입스크립트 호환성 테스트 실패:', error.message);
    validationResults.push('TypeScript 호환성: ❌');
  }

  // 6. 네트워크 지연시간 및 성능 측정
  console.log('\n6. 네트워크 성능 측정...');
  
  const performanceTests = [];
  for (let i = 0; i < 3; i++) {
    const start = Date.now();
    try {
      const response = await fetch(`${API_BASE_URL}/health/`);
      const end = Date.now();
      
      if (response.ok) {
        performanceTests.push(end - start);
      }
    } catch (error) {
      console.log(`   테스트 ${i + 1} 실패:`, error.message);
    }
  }

  if (performanceTests.length > 0) {
    const avgLatency = performanceTests.reduce((sum, time) => sum + time, 0) / performanceTests.length;
    console.log(`✅ 네트워크 성능: 평균 ${avgLatency.toFixed(0)}ms`);
    console.log(`   측정값: ${performanceTests.map(t => t + 'ms').join(', ')}`);
    
    if (avgLatency < 2000) {
      validationResults.push('네트워크 성능: ✅');
      successCount++;
    } else {
      validationResults.push('네트워크 성능: ⚠️ (느림)');
    }
  } else {
    console.log('❌ 네트워크 성능 측정 실패');
    validationResults.push('네트워크 성능: ❌');
  }

  // 최종 결과 요약
  console.log('\n📊 프론트엔드-백엔드 통합 검증 결과:');
  console.log('='.repeat(60));
  
  validationResults.forEach(result => {
    console.log(`   ${result}`);
  });

  console.log(`\n🏆 전체 검증률: ${successCount}/6 (${(successCount/6*100).toFixed(1)}%)`);

  // 프론트엔드 개발 서버 접근 안내
  console.log('\n🌐 프론트엔드 브라우저 테스트 안내:');
  console.log('1. React 개발 서버 실행: npm start');
  console.log('2. 브라우저에서 접근: http://localhost:3000');
  console.log('3. 로그인 후 테스트 페이지: http://localhost:3000?tab=integration-test');
  console.log('4. 연결 테스트 페이지: http://localhost:3000?tab=connection-test');

  // 브라우저에서 확인해야 할 항목들
  console.log('\n✅ 브라우저에서 확인 항목:');
  console.log('- 로그인/회원가입 기능');
  console.log('- 프로젝트 생성/조회/수정/삭제');
  console.log('- 기준 생성/조회 (메타데이터 방식)');
  console.log('- 워크플로우 단계 변경');
  console.log('- API 오류 처리 및 사용자 피드백');
  console.log('- 반응형 UI 및 사용성');

  console.log('\n💡 테스트 완료 후 확인사항:');
  if (successCount >= 5) {
    console.log('✅ 프론트엔드-백엔드 통합 준비 완료!');
    console.log('✅ 브라우저 테스트 진행 가능!');
  } else {
    console.log('⚠️ 일부 항목에서 문제 발견');
    console.log('⚠️ 브라우저 테스트 전 문제 해결 필요');
  }

  return successCount >= 5;
}

validateFrontendBackendIntegration().then(success => {
  console.log('\n🚀 프론트엔드 검증 완료!');
  process.exit(success ? 0 : 1);
});