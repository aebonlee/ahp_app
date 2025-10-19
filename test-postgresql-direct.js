/**
 * PostgreSQL 직접 연결 테스트
 * Django 서버 없이 데이터베이스만 테스트
 */

const { Client } = require('pg');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 로그 헬퍼
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

// PostgreSQL 연결 설정
const pgConfig = {
  host: 'localhost',
  port: 5432,
  database: 'ahp_db',
  user: 'ahp_user',
  password: 'Qudtls1!'
};

async function testPostgreSQL() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════╗');
  console.log('║       PostgreSQL 데이터베이스 테스트       ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  const client = new Client(pgConfig);
  
  try {
    log.header('1. 데이터베이스 연결');
    
    await client.connect();
    log.success('PostgreSQL 연결 성공!');
    
    // PostgreSQL 버전 확인
    log.header('2. PostgreSQL 버전 확인');
    const versionResult = await client.query('SELECT version()');
    console.log('버전:', versionResult.rows[0].version.split(',')[0]);
    
    // 데이터베이스 정보
    log.header('3. 데이터베이스 정보');
    const dbInfo = await client.query(`
      SELECT current_database() as database,
             current_user as user,
             pg_database_size(current_database()) as size
    `);
    const info = dbInfo.rows[0];
    console.log(`데이터베이스: ${info.database}`);
    console.log(`사용자: ${info.user}`);
    console.log(`크기: ${(parseInt(info.size) / 1024 / 1024).toFixed(2)} MB`);
    
    // 테이블 목록
    log.header('4. 테이블 목록');
    const tables = await client.query(`
      SELECT tablename, 
             pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log(`총 ${tables.rows.length}개 테이블:\n`);
    tables.rows.forEach((table, i) => {
      console.log(`  ${i+1}. ${table.tablename.padEnd(35)} (${table.size})`);
    });
    
    // Django 관련 주요 테이블 확인
    log.header('5. Django 주요 테이블 데이터 확인');
    
    // 사용자 수
    try {
      const userCount = await client.query('SELECT COUNT(*) FROM auth_user');
      log.info(`사용자 수: ${userCount.rows[0].count}명`);
      
      // 최근 사용자 5명
      const recentUsers = await client.query(`
        SELECT id, username, email, is_staff, is_superuser, date_joined
        FROM auth_user
        ORDER BY date_joined DESC
        LIMIT 5
      `);
      
      if (recentUsers.rows.length > 0) {
        console.log('\n최근 등록 사용자:');
        recentUsers.rows.forEach(user => {
          const role = user.is_superuser ? '슈퍼유저' : user.is_staff ? '스태프' : '일반';
          console.log(`  • ${user.username} (${user.email || '이메일 없음'}) - ${role}`);
        });
      }
    } catch (err) {
      log.warning('auth_user 테이블 없음');
    }
    
    // 프로젝트 수
    try {
      const projectCount = await client.query('SELECT COUNT(*) FROM projects_project');
      log.info(`프로젝트 수: ${projectCount.rows[0].count}개`);
    } catch (err) {
      log.warning('projects_project 테이블 없음');
    }
    
    // 평가 수
    try {
      const evalCount = await client.query('SELECT COUNT(*) FROM evaluations_evaluation');
      log.info(`평가 수: ${evalCount.rows[0].count}개`);
    } catch (err) {
      log.warning('evaluations_evaluation 테이블 없음');
    }
    
    // Django 마이그레이션 상태
    log.header('6. Django 마이그레이션 상태');
    try {
      const migrations = await client.query(`
        SELECT app, name, applied
        FROM django_migrations
        ORDER BY applied DESC
        LIMIT 5
      `);
      
      console.log('최근 마이그레이션:');
      migrations.rows.forEach(m => {
        const date = new Date(m.applied).toLocaleDateString('ko-KR');
        console.log(`  • [${m.app}] ${m.name} - ${date}`);
      });
    } catch (err) {
      log.warning('django_migrations 테이블 없음 - Django가 초기화되지 않음');
    }
    
    // 연결 통계
    log.header('7. 데이터베이스 연결 상태');
    const connections = await client.query(`
      SELECT COUNT(*) as active_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    console.log(`활성 연결 수: ${connections.rows[0].active_connections}개`);
    
    // 테스트 쿼리
    log.header('8. 테스트 쿼리 실행');
    const testQuery = await client.query('SELECT NOW() as current_time, 1+1 as calculation');
    log.success(`현재 시간: ${new Date(testQuery.rows[0].current_time).toLocaleString('ko-KR')}`);
    log.success(`계산 테스트 (1+1): ${testQuery.rows[0].calculation}`);
    
    log.header('테스트 완료');
    log.success('✨ PostgreSQL 데이터베이스가 정상적으로 작동합니다!');
    
  } catch (error) {
    log.error(`데이터베이스 연결 실패: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n해결 방법:');
      console.log('1. PostgreSQL 서비스가 실행 중인지 확인');
      console.log('   Windows: services.msc에서 postgresql 서비스 확인');
      console.log('2. PostgreSQL이 5432 포트에서 실행 중인지 확인');
    } else if (error.code === '28P01') {
      console.log('\n해결 방법:');
      console.log('1. 사용자 이름과 비밀번호 확인');
      console.log('2. PostgreSQL에서 ahp_user 계정 생성 확인');
    } else if (error.code === '3D000') {
      console.log('\n해결 방법:');
      console.log('1. ahp_db 데이터베이스 생성 확인');
      console.log('2. CREATE DATABASE ahp_db; 실행');
    }
  } finally {
    await client.end();
    log.info('데이터베이스 연결 종료');
  }
}

// 실행
testPostgreSQL().catch(console.error);