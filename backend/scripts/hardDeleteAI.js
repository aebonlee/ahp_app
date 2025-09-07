const { default: fetch } = require('node-fetch');

/**
 * 관리자 하드 삭제 API를 사용해서 AI 중복 프로젝트들을 삭제
 */

async function hardDeleteAIProjects() {
  try {
    console.log('🧹 관리자 하드 삭제 API로 AI 프로젝트 삭제 시작...');
    
    // 관리자 계정으로 로그인
    const loginResponse = await fetch('https://ahp-platform.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@ahp.com',
        password: 'test123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`로그인 실패: ${loginResponse.status}`);
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ 관리자 로그인 성공');
    
    // 프로젝트 목록 가져오기
    const projectsResponse = await fetch('https://ahp-platform.onrender.com/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    if (!projectsResponse.ok) {
      throw new Error(`프로젝트 목록 조회 실패: ${projectsResponse.status}`);
    }
    
    const projectsData = await projectsResponse.json();
    const projects = projectsData.projects || [];
    
    console.log(`📊 현재 프로젝트 총 개수: ${projects.length}개`);
    
    // "AI 개발 활용 방안 AHP 분석" 프로젝트들 찾기
    const aiProjects = projects.filter(project => {
      return project.title === 'AI 개발 활용 방안 AHP 분석';
    });
    
    console.log(`🔍 발견된 AI 중복 프로젝트: ${aiProjects.length}개`);
    
    if (aiProjects.length === 0) {
      console.log('✅ 삭제할 AI 중복 프로젝트가 없습니다.');
      return;
    }
    
    // 각 프로젝트를 관리자 하드 삭제 API로 삭제
    let deletedCount = 0;
    console.log('\n🗑️ 하드 삭제 시작...');
    
    for (const project of aiProjects) {
      try {
        const deleteResponse = await fetch(`https://ahp-platform.onrender.com/api/admin/projects/${project.id}/hard-delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies
          }
        });
        
        if (deleteResponse.ok) {
          const result = await deleteResponse.json();
          console.log(`✅ 프로젝트 ID ${project.id} 하드 삭제 완료`);
          deletedCount++;
        } else {
          const errorText = await deleteResponse.text();
          console.log(`❌ 프로젝트 ID ${project.id} 삭제 실패: ${deleteResponse.status} - ${errorText}`);
        }
        
        // 요청 간격 두기 (서버 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`❌ 프로젝트 ID ${project.id} 삭제 중 오류:`, error.message);
      }
    }
    
    console.log(`\n🎉 하드 삭제 완료! ${deletedCount}/${aiProjects.length}개 프로젝트 삭제됨`);
    
    // 최종 확인
    const finalProjectsResponse = await fetch('https://ahp-platform.onrender.com/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    if (finalProjectsResponse.ok) {
      const finalData = await finalProjectsResponse.json();
      const remainingProjects = finalData.projects || [];
      console.log(`📊 실제 남은 프로젝트 개수: ${remainingProjects.length}개`);
      
      if (remainingProjects.length > 0) {
        console.log('\n📋 남은 프로젝트 목록:');
        remainingProjects.forEach((project, index) => {
          console.log(`${index + 1}. [ID: ${project.id}] ${project.title}`);
        });
      } else {
        console.log('✅ 모든 프로젝트가 정리되었습니다!');
      }
    }
    
  } catch (error) {
    console.error('❌ 하드 삭제 중 오류:', error.message);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  hardDeleteAIProjects()
    .then(() => {
      console.log('✅ AI 프로젝트 하드 삭제 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { hardDeleteAIProjects };