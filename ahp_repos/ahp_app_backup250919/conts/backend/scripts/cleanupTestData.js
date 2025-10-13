const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL에서 테스트/허수 데이터를 정리하는 스크립트
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanupTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 PostgreSQL 테스트 데이터 정리 시작...');
    
    // 1. 현재 프로젝트 목록 확인
    const projectsResult = await client.query('SELECT id, title, description, status, created_at FROM projects ORDER BY created_at DESC');
    console.log(`📊 현재 프로젝트 총 개수: ${projectsResult.rows.length}개`);
    
    // 2. 테스트/허수 데이터 식별
    const testProjects = projectsResult.rows.filter(project => {
      return project.title.includes('테스트') || 
             project.title.includes('Test') ||
             project.title.includes('sample') ||
             project.title.includes('Sample') ||
             project.title.includes('demo') ||
             project.title.includes('Demo') ||
             project.description.includes('테스트') ||
             project.description.includes('샘플');
    });
    
    console.log(`🔍 발견된 테스트/허수 프로젝트: ${testProjects.length}개`);
    
    if (testProjects.length > 0) {
      console.log('📋 삭제 예정 프로젝트 목록:');
      testProjects.forEach((project, index) => {
        console.log(`${index + 1}. [${project.id}] ${project.title} (${project.status})`);
      });
      
      // 3. 관련 데이터 먼저 삭제 (외래키 제약조건 때문)
      console.log('\n🗑️ 관련 데이터 삭제 중...');
      
      for (const project of testProjects) {
        const projectId = project.id;
        
        // 쌍대비교 데이터 삭제
        await client.query('DELETE FROM pairwise_comparisons WHERE project_id = $1', [projectId]);
        
        // 평가자 삭제
        await client.query('DELETE FROM evaluators WHERE project_id = $1', [projectId]);
        
        // 대안 삭제
        await client.query('DELETE FROM alternatives WHERE project_id = $1', [projectId]);
        
        // 기준 삭제
        await client.query('DELETE FROM criteria WHERE project_id = $1', [projectId]);
        
        console.log(`✅ 프로젝트 ${projectId} 관련 데이터 삭제 완료`);
      }
      
      // 4. 테스트 프로젝트 삭제
      const testProjectIds = testProjects.map(p => p.id);
      await client.query('DELETE FROM projects WHERE id = ANY($1)', [testProjectIds]);
      
      console.log(`✅ ${testProjects.length}개 테스트 프로젝트 삭제 완료`);
    }
    
    // 5. 정리 후 상태 확인
    const finalResult = await client.query('SELECT COUNT(*) as count FROM projects');
    console.log(`📊 정리 후 프로젝트 개수: ${finalResult.rows[0].count}개`);
    
    // 6. 남은 프로젝트 목록 표시
    const remainingProjects = await client.query('SELECT id, title, status, created_at FROM projects ORDER BY created_at DESC');
    console.log('\n📋 남은 프로젝트 목록:');
    remainingProjects.rows.forEach((project, index) => {
      console.log(`${index + 1}. [${project.id}] ${project.title} (${project.status}) - ${project.created_at}`);
    });
    
    console.log('\n🎉 데이터 정리 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 정리 중 오류:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 스크립트 실행
if (require.main === module) {
  cleanupTestData()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { cleanupTestData };