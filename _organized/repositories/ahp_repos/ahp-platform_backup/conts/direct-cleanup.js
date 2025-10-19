// 직접 데이터베이스 정리 스크립트
const { Pool } = require('pg');

async function directCleanup() {
  // Render.com PostgreSQL 연결 (환경변수에서 가져와야 함)
  const pool = new Pool({
    connectionString: 'postgresql://ahp_platform_user:YOUR_DB_PASSWORD@dpg-XXXXX-a.frankfurt-postgres.render.com/ahp_platform_db',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🧹 직접 허수 프로젝트 정리 시작...');
    
    // 현재 프로젝트 목록 확인
    const projectsResult = await pool.query(`
      SELECT p.id, p.title, p.name, p.description, p.status, p.admin_id, p.created_at,
             u.email as admin_email,
             (SELECT COUNT(*) FROM criteria WHERE project_id = p.id) as criteria_count,
             (SELECT COUNT(*) FROM alternatives WHERE project_id = p.id) as alternatives_count,
             (SELECT COUNT(*) FROM project_evaluators WHERE project_id = p.id) as evaluators_count
      FROM projects p
      LEFT JOIN users u ON p.admin_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    console.log(`📊 현재 프로젝트 총 개수: ${projectsResult.rows.length}개`);
    
    // 허수/테스트 데이터 식별
    const phantomProjects = projectsResult.rows.filter((project) => {
      const title = (project.title || '').toLowerCase();
      const description = (project.description || '').toLowerCase();
      const name = (project.name || '').toLowerCase();
      
      // 테스트 관련 키워드
      const testKeywords = [
        '테스트', 'test', 'sample', 'demo', 'example', 'prototype',
        'ai 개발 활용', '스마트폰 선택', '직원 채용', '투자 포트폴리오',
        'artificial', 'smartphone', 'employee', 'investment', '중요도 분석'
      ];
      
      // 빈 프로젝트
      const isEmpty = project.criteria_count === 0 && 
                     project.alternatives_count === 0 && 
                     project.evaluators_count === 0;
      
      // 키워드 매칭
      const hasTestKeyword = testKeywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword) || name.includes(keyword)
      );
      
      // 테스트 계정
      const isTestAccount = project.admin_email === 'test@ahp.com';
      
      return hasTestKeyword || isEmpty || isTestAccount;
    });
    
    console.log(`🔍 발견된 허수/테스트 프로젝트: ${phantomProjects.length}개`);
    
    if (phantomProjects.length > 0) {
      console.log('삭제 대상 프로젝트:');
      phantomProjects.forEach(p => {
        console.log(`- ID ${p.id}: "${p.title}" (관리자: ${p.admin_email})`);
        console.log(`  기준: ${p.criteria_count}, 대안: ${p.alternatives_count}, 평가자: ${p.evaluators_count}`);
      });
      
      // 배치 삭제 실행
      const phantomProjectIds = phantomProjects.map(p => p.id);
      await pool.query('DELETE FROM projects WHERE id = ANY($1)', [phantomProjectIds]);
      
      console.log(`✅ ${phantomProjects.length}개 허수 프로젝트 삭제 완료`);
    } else {
      console.log('ℹ️ 삭제할 허수 프로젝트가 없습니다.');
    }
    
    // 최종 개수 확인
    const finalResult = await pool.query('SELECT COUNT(*) as count FROM projects');
    console.log(`📊 정리 후 프로젝트 개수: ${finalResult.rows[0].count}개`);
    
  } catch (error) {
    console.error('❌ 정리 중 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행하려면 아래 주석을 해제하고 실제 데이터베이스 연결 정보를 입력하세요
// directCleanup();

console.log('📝 이 스크립트는 실제 데이터베이스 연결 정보가 필요합니다.');
console.log('🚨 대신 웹 UI에서 관리자로 로그인 후 정리 기능을 사용하세요.');