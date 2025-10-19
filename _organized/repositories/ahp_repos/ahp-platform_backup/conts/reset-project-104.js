// 프로젝트 104 완전 초기화 스크립트
const fetch = require('node-fetch');

async function resetProject104() {
  try {
    console.log('🔄 프로젝트 104 완전 초기화 시작...');
    
    // 1차: 기존 emergency API로 관련 데이터 정리 시도
    console.log('1️⃣ 기존 허수 데이터 정리...');
    const cleanupResponse = await fetch('https://ahp-platform.onrender.com/api/emergency/cleanup-phantom-projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirm: 'CLEANUP_PHANTOM_PROJECTS_EMERGENCY'
      })
    });
    
    const cleanupResult = await cleanupResponse.json();
    console.log('정리 결과:', cleanupResult);
    
    // 2차: 새로운 프로젝트 104 전용 API 시도 (배포 완료 후)
    console.log('2️⃣ 프로젝트 104 전용 초기화 시도...');
    const resetResponse = await fetch('https://ahp-platform.onrender.com/api/emergency/reset-project-104', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirm: 'RESET_PROJECT_104'
      })
    });
    
    const resetResult = await resetResponse.json();
    console.log('초기화 결과:', resetResult);
    
    if (resetResult.success) {
      console.log(`✅ 프로젝트 104 초기화 성공!`);
      console.log(`🗑️ 삭제된 데이터:`, resetResult.reset_summary);
      console.log('🎯 이제 모델 구축 페이지에서 새로 시작할 수 있습니다.');
    } else {
      console.log('❌ 초기화 실패:', resetResult.message);
      console.log('💡 브라우저 캐시 초기화(Ctrl+F5)를 시도해보세요.');
    }
    
  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error.message);
    console.log('💡 배포가 완료되지 않았을 수 있습니다. 잠시 후 다시 시도해주세요.');
  }
}

resetProject104();