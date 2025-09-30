/**
 * Phase 3: 프로젝트 생성 워크플로우 DB 연결 테스트
 * 테스트 날짜: 2025-09-30
 * 목적: ProjectCreation, CriteriaManagement, AlternativeManagement, 
 *       EvaluatorAssignment, ProjectCompletion 컴포넌트의 DB 연동 확인
 */

const BASE_URL = 'https://ahp-django-service.onrender.com/api';

// 테스트용 토큰 (실제 로그인 후 받은 토큰으로 교체 필요)
const AUTH_TOKEN = 'your_auth_token_here';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// API 요청 헬퍼 함수
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

// 테스트 시나리오
async function runPhase3Tests() {
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}Phase 3: 프로젝트 생성 워크플로우 테스트${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  let testProjectId = null;
  let criteriaIds = [];
  let alternativeIds = [];
  let evaluatorIds = [];

  try {
    // 1. 프로젝트 생성 (ProjectCreation)
    console.log(`${colors.blue}[TEST 1] 프로젝트 생성 (일반/퍼지 AHP 포함)${colors.reset}`);
    const projectData = {
      title: `Phase3 테스트 프로젝트 ${Date.now()}`,
      description: '프로젝트 생성 워크플로우 테스트',
      objective: '워크플로우 전체 과정 검증',
      ahp_type: 'fuzzy', // 퍼지 AHP 선택
      status: 'active'
    };
    
    const project = await apiRequest('/projects/', 'POST', projectData);
    testProjectId = project.id;
    console.log(`${colors.green}✓ 프로젝트 생성 성공: ID=${testProjectId}${colors.reset}`);
    console.log(`  - AHP 타입: ${project.ahp_type || 'general'}`);
    console.log(`  - 제목: ${project.title}\n`);

    // 2. 평가 기준 추가 (CriteriaManagement)
    console.log(`${colors.blue}[TEST 2] 평가 기준 설정 (논문 권장: 3개)${colors.reset}`);
    const criteriaList = [
      { name: '기술적 우수성', description: '기술적 측면 평가', level: 1 },
      { name: '경제적 효율성', description: '비용 대비 효과', level: 1 },
      { name: '사용자 만족도', description: '사용자 경험 평가', level: 1 }
    ];

    for (const criterion of criteriaList) {
      const created = await apiRequest('/criteria/', 'POST', {
        ...criterion,
        project_id: testProjectId,
        position: criteriaIds.length + 1
      });
      criteriaIds.push(created.id);
      console.log(`${colors.green}✓ 기준 추가: ${criterion.name}${colors.reset}`);
    }
    console.log(`  총 ${criteriaIds.length}개 기준 생성 완료\n`);

    // 3. 대안 추가 (AlternativeManagement)
    console.log(`${colors.blue}[TEST 3] 대안 설정 (논문 권장: 3개)${colors.reset}`);
    const alternativeList = [
      { name: '솔루션 A', description: '클라우드 기반 솔루션' },
      { name: '솔루션 B', description: '온프레미스 솔루션' },
      { name: '솔루션 C', description: '하이브리드 솔루션' }
    ];

    for (const alternative of alternativeList) {
      const created = await apiRequest('/alternatives/', 'POST', {
        ...alternative,
        project_id: testProjectId,
        position: alternativeIds.length + 1
      });
      alternativeIds.push(created.id);
      console.log(`${colors.green}✓ 대안 추가: ${alternative.name}${colors.reset}`);
    }
    console.log(`  총 ${alternativeIds.length}개 대안 생성 완료\n`);

    // 4. 평가자 배정 (EvaluatorAssignment)
    console.log(`${colors.blue}[TEST 4] 평가자 배정${colors.reset}`);
    const evaluatorList = [
      { name: '김전문가', email: 'expert1@test.com' },
      { name: '이분석가', email: 'analyst2@test.com' },
      { name: '박연구원', email: 'researcher3@test.com' }
    ];

    for (const evaluator of evaluatorList) {
      const created = await apiRequest('/evaluators/', 'POST', {
        ...evaluator,
        project_id: testProjectId,
        access_key: Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'pending'
      });
      evaluatorIds.push(created.id);
      console.log(`${colors.green}✓ 평가자 배정: ${evaluator.name}${colors.reset}`);
      console.log(`  - 이메일: ${evaluator.email}`);
      console.log(`  - 액세스 키: ${created.access_key}`);
    }
    console.log(`  총 ${evaluatorIds.length}명 평가자 배정 완료\n`);

    // 5. 프로젝트 현황 조회 (ProjectCompletion)
    console.log(`${colors.blue}[TEST 5] 프로젝트 완료 화면 데이터 조회${colors.reset}`);
    
    // 프로젝트 상세 정보 조회
    const projectDetail = await apiRequest(`/projects/${testProjectId}/`);
    console.log(`${colors.green}✓ 프로젝트 현황:${colors.reset}`);
    console.log(`  - 프로젝트 ID: ${projectDetail.id}`);
    console.log(`  - 제목: ${projectDetail.title}`);
    console.log(`  - 상태: ${projectDetail.status}`);
    console.log(`  - AHP 타입: ${projectDetail.ahp_type || 'general'}`);

    // 각 컴포넌트별 데이터 조회
    const [criteriaData, alternativesData, evaluatorsData] = await Promise.all([
      apiRequest(`/criteria/?project_id=${testProjectId}`),
      apiRequest(`/alternatives/?project_id=${testProjectId}`),
      apiRequest(`/evaluators/?project_id=${testProjectId}`)
    ]);

    console.log(`\n${colors.cyan}[프로젝트 요약]${colors.reset}`);
    console.log(`  - 평가 기준: ${criteriaData.length}개`);
    console.log(`  - 대안: ${alternativesData.length}개`);
    console.log(`  - 평가자: ${evaluatorsData.length}명`);
    console.log(`  - 대기 중: ${evaluatorsData.filter(e => e.status === 'pending').length}명`);
    console.log(`  - 진행 중: ${evaluatorsData.filter(e => e.status === 'active').length}명`);
    console.log(`  - 완료: ${evaluatorsData.filter(e => e.status === 'completed').length}명`);

    // 6. 프로젝트 상태 업데이트 테스트
    console.log(`\n${colors.blue}[TEST 6] 프로젝트 상태 변경${colors.reset}`);
    const updatedProject = await apiRequest(`/projects/${testProjectId}/`, 'PATCH', {
      status: 'completed'
    });
    console.log(`${colors.green}✓ 프로젝트 상태 변경: ${updatedProject.status}${colors.reset}`);

    // 테스트 성공
    console.log(`\n${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}✅ Phase 3 워크플로우 테스트 모두 성공!${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}`);

    // 정리: 테스트 데이터 삭제
    console.log(`\n${colors.yellow}[정리] 테스트 데이터 삭제 중...${colors.reset}`);
    
    // 평가자 삭제
    for (const id of evaluatorIds) {
      try {
        await apiRequest(`/evaluators/${id}/`, 'DELETE');
      } catch (e) {
        console.log(`${colors.yellow}평가자 ${id} 삭제 실패 (이미 삭제됨)${colors.reset}`);
      }
    }

    // 대안 삭제
    for (const id of alternativeIds) {
      try {
        await apiRequest(`/alternatives/${id}/`, 'DELETE');
      } catch (e) {
        console.log(`${colors.yellow}대안 ${id} 삭제 실패 (이미 삭제됨)${colors.reset}`);
      }
    }

    // 기준 삭제
    for (const id of criteriaIds) {
      try {
        await apiRequest(`/criteria/${id}/`, 'DELETE');
      } catch (e) {
        console.log(`${colors.yellow}기준 ${id} 삭제 실패 (이미 삭제됨)${colors.reset}`);
      }
    }

    // 프로젝트 삭제
    try {
      await apiRequest(`/projects/${testProjectId}/`, 'DELETE');
      console.log(`${colors.green}✓ 테스트 데이터 정리 완료${colors.reset}`);
    } catch (e) {
      console.log(`${colors.yellow}프로젝트 삭제 실패 (이미 삭제됨)${colors.reset}`);
    }

  } catch (error) {
    console.error(`\n${colors.red}❌ 테스트 실패:${colors.reset}`, error.message);
    
    // 에러 발생 시에도 정리 시도
    if (testProjectId) {
      try {
        await apiRequest(`/projects/${testProjectId}/`, 'DELETE');
        console.log(`${colors.yellow}테스트 프로젝트 정리됨${colors.reset}`);
      } catch (e) {
        // 무시
      }
    }
  }
}

// Node.js 환경에서 fetch 사용을 위한 처리
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// 테스트 실행
console.log(`${colors.magenta}테스트 환경: ${BASE_URL}${colors.reset}\n`);
runPhase3Tests().catch(error => {
  console.error(`${colors.red}테스트 실행 오류:${colors.reset}`, error);
  process.exit(1);
});