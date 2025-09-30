/**
 * 간단한 프로젝트 삭제 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function simpleDeleteTest() {
  console.log('🔍 간단한 프로젝트 삭제 테스트...\n');
  
  // 1. 기존 프로젝트 조회
  console.log('1. 기존 프로젝트 목록 조회...');
  const response = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
  const data = await response.json();
  
  if (data.results && data.results.length > 0) {
    const firstProject = data.results[0];
    console.log(`✅ 대상 프로젝트: ${firstProject.title} (${firstProject.id})`);
    
    // 2. 프로젝트 삭제 시도
    console.log('\n2. 프로젝트 삭제 시도...');
    const deleteResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${firstProject.id}/`, {
      method: 'DELETE'
    });
    
    console.log('삭제 응답 상태:', deleteResponse.status);
    
    if (deleteResponse.ok || deleteResponse.status === 204) {
      console.log('✅ 삭제 성공!');
      
      // 3. 삭제 확인
      console.log('\n3. 삭제 확인...');
      const checkResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
      const checkData = await checkResponse.json();
      
      const stillExists = checkData.results.find(p => p.id === firstProject.id);
      if (!stillExists) {
        console.log('✅ 프로젝트가 목록에서 완전히 제거됨 (Hard Delete)');
      } else if (stillExists.deleted_at) {
        console.log('✅ 프로젝트가 소프트 삭제됨 (Soft Delete)');
      } else {
        console.log('❌ 프로젝트가 여전히 활성 상태');
      }
    } else {
      const errorText = await deleteResponse.text();
      console.log('❌ 삭제 실패:', errorText);
    }
    
  } else {
    console.log('❌ 삭제할 프로젝트가 없습니다');
  }
}

simpleDeleteTest();