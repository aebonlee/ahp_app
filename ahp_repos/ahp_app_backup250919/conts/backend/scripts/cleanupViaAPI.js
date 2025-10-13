const { default: fetch } = require('node-fetch');

/**
 * API를 통해 테스트/허수 데이터를 정리하는 스크립트
 */

async function cleanupTestDataViaAPI() {
  try {
    console.log('🧹 API를 통한 테스트 데이터 정리 시작...');
    
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
    
    // 테스트 데이터 정리 API 호출
    const cleanupResponse = await fetch('https://ahp-platform.onrender.com/api/admin/cleanup-test-data', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    if (!cleanupResponse.ok) {
      const errorText = await cleanupResponse.text();
      throw new Error(`정리 API 호출 실패: ${cleanupResponse.status} - ${errorText}`);
    }
    
    const result = await cleanupResponse.json();
    
    console.log('🎉 정리 완료!');
    console.log(`삭제된 프로젝트: ${result.deleted_count}개`);
    console.log(`남은 프로젝트: ${result.remaining_count}개`);
    
    if (result.deleted_projects && result.deleted_projects.length > 0) {
      console.log('\n📋 삭제된 프로젝트 목록:');
      result.deleted_projects.forEach((project, index) => {
        console.log(`${index + 1}. [${project.id}] ${project.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 정리 중 오류:', error.message);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  cleanupTestDataViaAPI()
    .then(() => {
      console.log('✅ API를 통한 데이터 정리 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { cleanupTestDataViaAPI };