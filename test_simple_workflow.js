/**
 * 간단한 워크플로우 테스트
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function simpleWorkflowTest() {
  console.log('🔍 간단한 워크플로우 테스트...\n');

  // 1. 기존 프로젝트 조회
  console.log('1. 기존 프로젝트 조회...');
  const listResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/`);
  const listData = await listResponse.json();
  
  if (listData.results && listData.results.length > 0) {
    const targetProject = listData.results[0];
    console.log(`✅ 대상 프로젝트: ${targetProject.title}`);
    console.log(`   현재 상태: ${targetProject.status || 'undefined'}`);
    console.log(`   워크플로우: ${targetProject.workflow_stage || 'undefined'}`);
    console.log(`   ID: ${targetProject.id}`);

    // 2. 프로젝트 상태 업데이트 테스트
    console.log('\n2. 프로젝트 상태 업데이트 테스트...');
    const updateData = {
      status: 'active',
      workflow_stage: 'evaluating',
      description: '이어서 작업 테스트 - 평가 단계로 이동'
    };

    const updateResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${targetProject.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    console.log('업데이트 응답 상태:', updateResponse.status);

    if (updateResponse.ok) {
      const updatedProject = await updateResponse.json();
      console.log('✅ 프로젝트 상태 업데이트 성공');
      console.log(`   새로운 상태: ${updatedProject.status || 'undefined'}`);
      console.log(`   새로운 워크플로우: ${updatedProject.workflow_stage || 'undefined'}`);
      console.log(`   설명: ${updatedProject.description}`);

      // 3. 업데이트된 상태 다시 조회
      console.log('\n3. 업데이트 확인...');
      const checkResponse = await fetch(`${API_BASE_URL}/api/service/projects/projects/${targetProject.id}/`);
      
      if (checkResponse.ok) {
        const checkedProject = await checkResponse.json();
        console.log('✅ 업데이트 확인 완료');
        console.log(`   확인된 상태: ${checkedProject.status || 'undefined'}`);
        console.log(`   확인된 워크플로우: ${checkedProject.workflow_stage || 'undefined'}`);
        
        // 이어서 작업 가능성 체크
        const canContinue = checkedProject.deleted_at === null && 
                           checkedProject.status !== 'archived';
        
        console.log(`   이어서 작업 가능: ${canContinue ? '✅' : '❌'}`);
      }

    } else {
      const errorText = await updateResponse.text();
      console.log('❌ 업데이트 실패:', errorText);
    }

    // 4. 프로젝트 메타데이터 확인
    console.log('\n4. 프로젝트 메타데이터 분석...');
    console.log('   지원되는 필드들:');
    Object.keys(targetProject).forEach(key => {
      console.log(`   - ${key}: ${targetProject[key]}`);
    });

  } else {
    console.log('❌ 테스트할 프로젝트가 없습니다');
  }

  console.log('\n✅ 워크플로우 테스트 완료');
  return true;
}

simpleWorkflowTest();