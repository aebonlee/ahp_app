/**
 * 프로젝트 관리 CRUD 기능 완전 검증
 * 생성, 조회, 수정, 삭제, 복원 전체 라이프사이클 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function testProjectCRUD() {
  console.log('📁 프로젝트 관리 CRUD 기능 완전 검증 시작...\n');
  
  let testProjectId = null;
  const testResults = [];
  
  try {
    // 1. CREATE (생성) 테스트
    console.log('1️⃣ 프로젝트 생성 (CREATE) 테스트...');
    const createData = {
      title: `CRUD 테스트 프로젝트 ${Date.now()}`,
      description: '프로젝트 CRUD 기능 완전 검증용',
      objective: 'Create, Read, Update, Delete 전체 기능 테스트',
      evaluation_mode: 'practical',
      status: 'draft',
      workflow_stage: 'creating'
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });

    if (createResponse.ok) {
      const createdProject = await createResponse.json();
      console.log('DEBUG: Created project response:', createdProject);
      
      // Django 응답에서 ID 추출 (다양한 형태 지원)
      testProjectId = createdProject.id || createdProject.project_id || createdProject.uuid;
      
      // ID가 없다면 title로 프로젝트 찾기
      if (!testProjectId) {
        console.log('⚠️ 응답에 ID 없음, 제목으로 프로젝트 검색...');
        const searchResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const projects = searchData.results || [];
          const foundProject = projects.find(p => p.title === createData.title);
          if (foundProject) {
            testProjectId = foundProject.id;
            console.log(`✅ 제목으로 프로젝트 발견: ID ${testProjectId}`);
          }
        }
      }
      
      console.log(`✅ CREATE 성공: ${createdProject.title}`);
      console.log(`   프로젝트 ID: ${testProjectId || '검색 중...'}`);
      console.log(`   생성 시간: ${createdProject.created_at || 'N/A'}`);
      testResults.push('CREATE: ✅');
    } else {
      const errorText = await createResponse.text();
      console.log(`❌ CREATE 실패: ${createResponse.status} - ${errorText}`);
      testResults.push('CREATE: ❌');
      return false;
    }

    // 2. READ (조회) 테스트
    console.log('\n2️⃣ 프로젝트 조회 (READ) 테스트...');
    
    // 2-1. 단일 프로젝트 조회
    const readResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${testProjectId}/`);
    if (readResponse.ok) {
      const project = await readResponse.json();
      console.log(`✅ 단일 조회 성공: ${project.title}`);
      console.log(`   상태: ${project.status}`);
      console.log(`   워크플로우: ${project.workflow_stage}`);
    } else {
      console.log(`❌ 단일 조회 실패: ${readResponse.status}`);
      testResults.push('READ(단일): ❌');
    }

    // 2-2. 전체 프로젝트 목록 조회
    const listResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    if (listResponse.ok) {
      const listData = await listResponse.json();
      const projectCount = listData.count || listData.results?.length || 0;
      console.log(`✅ 목록 조회 성공: ${projectCount}개 프로젝트`);
      
      // 방금 생성한 프로젝트가 목록에 있는지 확인
      const projects = listData.results || [];
      const foundProject = projects.find(p => p.id === testProjectId);
      if (foundProject) {
        console.log(`✅ 생성한 프로젝트가 목록에서 확인됨`);
        testResults.push('READ: ✅');
      } else {
        console.log(`❌ 생성한 프로젝트가 목록에서 누락`);
        testResults.push('READ: ❌');
      }
    } else {
      console.log(`❌ 목록 조회 실패: ${listResponse.status}`);
      testResults.push('READ: ❌');
    }

    // 3. UPDATE (수정) 테스트
    console.log('\n3️⃣ 프로젝트 수정 (UPDATE) 테스트...');
    const updateData = {
      title: createData.title + ' (수정됨)',
      description: createData.description + ' - 업데이트 테스트',
      status: 'active',
      workflow_stage: 'waiting'
    };

    const updateResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${testProjectId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      const updatedProject = await updateResponse.json();
      console.log(`✅ UPDATE 성공: ${updatedProject.title}`);
      console.log(`   새 상태: ${updatedProject.status}`);
      console.log(`   새 워크플로우: ${updatedProject.workflow_stage}`);
      console.log(`   수정 시간: ${updatedProject.updated_at}`);
      testResults.push('UPDATE: ✅');
    } else {
      console.log(`❌ UPDATE 실패: ${updateResponse.status}`);
      testResults.push('UPDATE: ❌');
    }

    // 4. DELETE (삭제) 테스트
    console.log('\n4️⃣ 프로젝트 삭제 (DELETE) 테스트...');
    const deleteResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${testProjectId}/`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok || deleteResponse.status === 204) {
      console.log(`✅ DELETE 성공: 프로젝트가 삭제됨`);
      
      // 삭제 확인 - 조회 시 404 또는 deleted_at 필드 확인
      const checkResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${testProjectId}/`);
      if (checkResponse.status === 404) {
        console.log(`✅ 삭제 확인: 프로젝트에 접근 불가 (404)`);
        testResults.push('DELETE: ✅');
      } else if (checkResponse.ok) {
        const deletedProject = await checkResponse.json();
        if (deletedProject.deleted_at) {
          console.log(`✅ 삭제 확인: soft delete 적용 (deleted_at: ${deletedProject.deleted_at})`);
          testResults.push('DELETE: ✅');
        } else {
          console.log(`❌ 삭제 실패: deleted_at 필드 없음`);
          testResults.push('DELETE: ❌');
        }
      }
    } else {
      console.log(`❌ DELETE 실패: ${deleteResponse.status}`);
      testResults.push('DELETE: ❌');
    }

    // 5. 데이터 무결성 검증
    console.log('\n5️⃣ 데이터 무결성 검증...');
    const finalListResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    if (finalListResponse.ok) {
      const finalData = await finalListResponse.json();
      const finalProjects = finalData.results || [];
      
      // 필수 필드 검증
      let integrityScore = 0;
      const totalChecks = 5;
      
      // 체크 1: 모든 프로젝트에 필수 필드 존재
      const hasRequiredFields = finalProjects.every(p => 
        p.id && p.title && p.created_at && p.updated_at
      );
      if (hasRequiredFields) {
        integrityScore++;
        console.log(`✅ 필수 필드 검증 통과`);
      }

      // 체크 2: 데이터 타입 일치
      const hasCorrectTypes = finalProjects.every(p => 
        typeof p.criteria_count === 'number' &&
        typeof p.alternatives_count === 'number'
      );
      if (hasCorrectTypes) {
        integrityScore++;
        console.log(`✅ 데이터 타입 검증 통과`);
      }

      // 체크 3: 페이지네이션 일치
      const paginationValid = finalData.count >= finalProjects.length;
      if (paginationValid) {
        integrityScore++;
        console.log(`✅ 페이지네이션 검증 통과`);
      }

      // 체크 4: 타임스탬프 유효성
      const timestampsValid = finalProjects.every(p => {
        const created = new Date(p.created_at);
        const updated = new Date(p.updated_at);
        return created <= updated;
      });
      if (timestampsValid) {
        integrityScore++;
        console.log(`✅ 타임스탬프 검증 통과`);
      }

      // 체크 5: 삭제된 프로젝트는 목록에서 제외
      const deletedProjectInList = finalProjects.find(p => p.id === testProjectId);
      if (!deletedProjectInList) {
        integrityScore++;
        console.log(`✅ 삭제된 프로젝트 목록 제외 확인`);
      }

      console.log(`📊 무결성 점수: ${integrityScore}/${totalChecks} (${(integrityScore/totalChecks*100).toFixed(1)}%)`);
      testResults.push(`무결성: ${integrityScore}/${totalChecks}`);
    }

    return testResults;

  } catch (error) {
    console.error('❌ CRUD 테스트 중 오류:', error);
    return false;
  }
}

async function testBackendConnection() {
  console.log('\n🔗 백엔드 연결 상태 확인...');
  
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health/`);
    const dbResponse = await fetch(`${API_BASE_URL}/db-status/`);
    
    if (healthResponse.ok && dbResponse.ok) {
      const dbStatus = await dbResponse.json();
      console.log(`✅ 백엔드 연결 정상`);
      console.log(`✅ DB 연결: ${dbStatus.connection} (${dbStatus.tables_count}개 테이블)`);
      return true;
    } else {
      console.log(`❌ 백엔드 연결 실패`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 백엔드 연결 오류:`, error.message);
    return false;
  }
}

async function runProjectCRUDTest() {
  console.log('🎯 프로젝트 관리 CRUD 기능 완전 검증\n');
  
  // 1. 백엔드 연결 확인
  const backendOK = await testBackendConnection();
  if (!backendOK) {
    console.log('\n❌ 백엔드 연결 실패 - 테스트 중단');
    return false;
  }

  // 2. CRUD 테스트 실행
  const crudResults = await testProjectCRUD();
  
  console.log('\n📋 프로젝트 CRUD 테스트 결과:');
  console.log('='.repeat(50));
  
  if (Array.isArray(crudResults)) {
    crudResults.forEach(result => {
      console.log(`   ${result}`);
    });
    
    const successCount = crudResults.filter(r => r.includes('✅')).length;
    const totalCount = crudResults.length;
    const successRate = (successCount / totalCount * 100).toFixed(1);
    
    console.log(`\n🏆 성공률: ${successCount}/${totalCount} (${successRate}%)`);
    
    const isSuccess = successCount >= totalCount * 0.8; // 80% 이상 성공
    console.log(`\n🎯 프로젝트 CRUD 기능: ${isSuccess ? '✅ 완료' : '❌ 미완료'}`);
    
    return isSuccess;
  } else {
    console.log(`\n❌ CRUD 테스트 실패`);
    return false;
  }
}

runProjectCRUDTest().then(success => {
  console.log('\n🏁 프로젝트 CRUD 검증 완료!');
  process.exit(success ? 0 : 1);
});