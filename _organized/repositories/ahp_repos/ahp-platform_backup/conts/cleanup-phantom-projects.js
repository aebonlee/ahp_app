const fetch = require('node-fetch');

async function cleanupPhantomProjects() {
  try {
    console.log('🧹 허수 프로젝트 정리 시작...');
    
    const response = await fetch('https://ahp-platform.onrender.com/api/admin/public-cleanup-phantom-projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirm: 'CLEANUP_PHANTOM_PROJECTS'
      })
    });
    
    const result = await response.json();
    
    console.log('📊 정리 결과:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ ${result.deleted_count}개의 허수 프로젝트가 삭제되었습니다.`);
      console.log(`📈 남은 프로젝트 개수: ${result.remaining_count}개`);
      
      if (result.deleted_projects && result.deleted_projects.length > 0) {
        console.log('\n🗑️ 삭제된 프로젝트 목록:');
        result.deleted_projects.forEach(p => {
          console.log(`- ID ${p.id}: "${p.title}" (${p.admin_email})`);
          console.log(`  기준: ${p.criteria_count}, 대안: ${p.alternatives_count}, 평가자: ${p.evaluators_count}`);
        });
      }
    } else {
      console.log('❌ 정리 실패:', result.message);
    }
    
  } catch (error) {
    console.error('❌ API 호출 오류:', error.message);
  }
}

cleanupPhantomProjects();