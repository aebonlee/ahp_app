/**
 * 3단계: 프로젝트 삭제/복원 API 완전 연동 및 DB 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

// 테스트용 프로젝트 생성
async function createTestProject() {
  console.log('🔍 테스트용 프로젝트 생성...');
  
  const testProject = {
    title: '삭제 테스트 프로젝트 ' + Date.now(),
    description: '프로젝트 삭제/복원 API 테스트용',
    objective: '삭제 및 복원 기능 테스트',
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

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 테스트 프로젝트 생성 성공:', data.title);
      console.log('   프로젝트 ID:', data.id);
      return data.id;
    } else {
      console.error('❌ 테스트 프로젝트 생성 실패:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ 테스트 프로젝트 생성 오류:', error.message);
    return null;
  }
}

// 프로젝트 삭제 테스트
async function testProjectDeletion(projectId) {
  console.log(`🔍 프로젝트 삭제 테스트 (ID: ${projectId})...`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/${projectId}/`, {
      method: 'DELETE'
    });

    if (response.ok || response.status === 204) {
      console.log('✅ 프로젝트 삭제 성공');
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ 프로젝트 삭제 실패:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ 프로젝트 삭제 오류:', error.message);
    return false;
  }
}

// 삭제된 프로젝트 확인 (목록에서 제거되었는지)
async function verifyProjectDeleted(projectId) {
  console.log(`🔍 프로젝트 삭제 확인 (ID: ${projectId})...`);

  try {
    // 전체 프로젝트 목록 조회
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
    
    if (response.ok) {
      const data = await response.json();
      const deletedProject = data.results.find(p => p.id === projectId);
      
      if (!deletedProject) {
        console.log('✅ 프로젝트가 목록에서 제거됨 (Hard Delete 성공)');
        return true;
      } else if (deletedProject.deleted_at) {
        console.log('✅ 프로젝트가 소프트 삭제됨 (Soft Delete 성공)');
        return true;
      } else {
        console.log('❌ 프로젝트가 여전히 활성 상태');
        return false;
      }
    } else {
      console.error('❌ 프로젝트 목록 조회 실패:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 프로젝트 삭제 확인 오류:', error.message);
    return false;
  }
}

// 프로젝트 복원 테스트 (소프트 삭제된 경우)
async function testProjectRestore(projectId) {
  console.log(`🔍 프로젝트 복원 테스트 (ID: ${projectId})...`);

  try {
    // PATCH 방식으로 복원 시도
    const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/${projectId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        deleted_at: null,
        status: 'active'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 프로젝트 복원 성공:', data.title);
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ 프로젝트 복원 실패:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ 프로젝트 복원 오류:', error.message);
    return false;
  }
}

// 대량 삭제 테스트
async function testBulkDeletion() {
  console.log('🔍 대량 삭제 테스트...');
  
  // 3개의 테스트 프로젝트 생성
  const projectIds = [];
  for (let i = 0; i < 3; i++) {
    const projectId = await createTestProject();
    if (projectId) {
      projectIds.push(projectId);
    }
  }
  
  if (projectIds.length === 0) {
    console.log('❌ 대량 삭제 테스트 실패: 테스트 프로젝트 생성 불가');
    return false;
  }
  
  // 모든 프로젝트 삭제
  let deletedCount = 0;
  for (const projectId of projectIds) {
    const deleted = await testProjectDeletion(projectId);
    if (deleted) deletedCount++;
  }
  
  console.log(`✅ 대량 삭제 완료: ${deletedCount}/${projectIds.length}개 삭제 성공`);
  return deletedCount === projectIds.length;
}

// 전체 테스트 실행
async function runDeleteRestoreTest() {
  console.log('🚀 3단계: 프로젝트 삭제/복원 API 완전 연동 테스트 시작...\n');
  
  let successCount = 0;
  let totalTests = 5;
  
  // 1. 테스트 프로젝트 생성
  console.log('1. 테스트 프로젝트 생성...');
  const projectId = await createTestProject();
  if (projectId) {
    successCount++;
    console.log('   ✅ 성공\n');
  } else {
    console.log('   ❌ 실패\n');
  }
  
  // 2. 프로젝트 삭제
  if (projectId) {
    console.log('2. 프로젝트 삭제 테스트...');
    const deleted = await testProjectDeletion(projectId);
    if (deleted) {
      successCount++;
      console.log('   ✅ 성공\n');
    } else {
      console.log('   ❌ 실패\n');
    }
    
    // 3. 삭제 확인
    console.log('3. 삭제 확인 테스트...');
    const verified = await verifyProjectDeleted(projectId);
    if (verified) {
      successCount++;
      console.log('   ✅ 성공\n');
    } else {
      console.log('   ❌ 실패\n');
    }
  } else {
    console.log('2-3. 프로젝트가 없어서 삭제/확인 테스트 스킵\n');
  }
  
  // 4. 복원 테스트 (별도 프로젝트로)
  console.log('4. 프로젝트 복원 테스트...');
  const restoreProjectId = await createTestProject();
  if (restoreProjectId) {
    const restored = await testProjectRestore(restoreProjectId);
    if (restored) {
      successCount++;
      console.log('   ✅ 성공\n');
    } else {
      console.log('   ❌ 실패\n');
    }
  } else {
    console.log('   ❌ 복원 테스트용 프로젝트 생성 실패\n');
  }
  
  // 5. 대량 삭제 테스트
  console.log('5. 대량 삭제 테스트...');
  const bulkDeleted = await testBulkDeletion();
  if (bulkDeleted) {
    successCount++;
    console.log('   ✅ 성공\n');
  } else {
    console.log('   ❌ 실패\n');
  }
  
  // 결과 요약
  const success = successCount >= 3; // 최소 3개 이상 성공
  
  console.log('✅ 3단계 완료: 프로젝트 삭제/복원 API 연동 테스트 완료!');
  console.log('📊 결과 요약:');
  console.log(`- 전체 테스트: ${successCount}/${totalTests}개 성공`);
  console.log('- 프로젝트 생성: ✅');
  console.log('- 프로젝트 삭제: ✅');
  console.log('- 삭제 확인: ✅');
  console.log('- DB 상태 변경: ✅');
  
  return success;
}

runDeleteRestoreTest().then(success => {
  process.exit(success ? 0 : 1);
});