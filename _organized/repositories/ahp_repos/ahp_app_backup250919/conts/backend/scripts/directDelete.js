const { default: fetch } = require('node-fetch');

/**
 * 직접 프로젝트 API를 통해 허수 데이터를 삭제하는 스크립트
 */

async function deleteTestProjects() {
  try {
    console.log('🧹 직접 API를 통한 허수 프로젝트 삭제 시작...');
    
    // 먼저 로그인
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
    const projects = projectsData.data || [];
    
    console.log(`📊 현재 프로젝트 총 개수: ${projects.length}개`);
    
    // 테스트/허수 데이터 식별
    const testProjects = projects.filter(project => {
      const title = project.title || '';
      const description = project.description || '';
      
      return title.includes('테스트') || 
             title.includes('Test') ||
             title.includes('test') ||
             title.includes('sample') ||
             title.includes('Sample') ||
             title.includes('demo') ||
             title.includes('Demo') ||
             title.includes('AI 개발 활용') ||
             title.includes('Sample Project') ||
             title.includes('예시') ||
             description.includes('테스트') ||
             description.includes('샘플') ||
             description.includes('인공지능 기술의 개발') ||
             description.includes('This is a sample') ||
             description.includes('example');
    });
    
    console.log(`🔍 발견된 테스트/허수 프로젝트: ${testProjects.length}개`);
    
    if (testProjects.length === 0) {
      console.log('✅ 삭제할 테스트 데이터가 없습니다.');
      return;
    }
    
    console.log('📋 삭제 예정 프로젝트 목록:');
    testProjects.forEach((project, index) => {
      console.log(`${index + 1}. [${project.id}] ${project.title}`);
    });
    
    // 각 프로젝트를 개별적으로 삭제
    let deletedCount = 0;
    for (const project of testProjects) {
      try {
        const deleteResponse = await fetch(`https://ahp-platform.onrender.com/api/projects/${project.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies
          }
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ 프로젝트 [${project.id}] ${project.title} 삭제 완료`);
          deletedCount++;
        } else {
          console.log(`❌ 프로젝트 [${project.id}] ${project.title} 삭제 실패: ${deleteResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ 프로젝트 [${project.id}] ${project.title} 삭제 중 오류:`, error.message);
      }
    }
    
    console.log(`\n🎉 ${deletedCount}개 프로젝트 삭제 완료!`);
    console.log(`📊 남은 프로젝트 개수: ${projects.length - deletedCount}개`);
    
  } catch (error) {
    console.error('❌ 삭제 중 오류:', error.message);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  deleteTestProjects()
    .then(() => {
      console.log('✅ 허수 데이터 삭제 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { deleteTestProjects };