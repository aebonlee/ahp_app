/**
 * 백엔드 서버 및 데이터베이스 연결 테스트
 * Django REST API 및 PostgreSQL 연결 상태 확인
 */

const fetch = require('node-fetch');

// API 기본 URL (로컬 개발 환경)
const API_BASE_URL = 'http://localhost:8000';

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

// 로그 헬퍼 함수
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

// 테스트 시작 시간
const startTime = Date.now();

// 1. 백엔드 서버 상태 확인
async function checkServerStatus() {
  log.header('백엔드 서버 상태 확인');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health/`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      log.success(`서버 상태: 정상 (${response.status})`);
      
      if (data) {
        console.log('서버 정보:', data);
      }
      return true;
    } else {
      log.error(`서버 응답 오류: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    log.error(`서버 연결 실패: ${error.message}`);
    log.warning('Django 서버가 실행 중인지 확인하세요 (python manage.py runserver)');
    return false;
  }
}

// 2. 데이터베이스 연결 확인
async function checkDatabaseConnection() {
  log.header('데이터베이스 연결 확인');
  
  try {
    // DB 상태 확인 엔드포인트
    const response = await fetch(`${API_BASE_URL}/api/db-status/`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      log.success('데이터베이스 연결: 정상');
      
      if (data) {
        console.log('DB 정보:', data);
      }
      return true;
    } else {
      log.error(`DB 상태 확인 실패: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.warning('DB 상태 엔드포인트 없음 - 사용자 API로 간접 테스트');
    return await testDatabaseViaUsers();
  }
}

// 3. 사용자 API를 통한 DB 간접 테스트
async function testDatabaseViaUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/`, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      log.success(`DB 연결 확인 (사용자 API 응답 정상)`);
      
      const users = data.results || data;
      if (Array.isArray(users)) {
        log.info(`현재 등록된 사용자 수: ${users.length}명`);
        
        // 처음 3명의 사용자 정보 표시
        if (users.length > 0) {
          console.log('\n최근 사용자 (최대 3명):');
          users.slice(0, 3).forEach(user => {
            console.log(`  - ${user.username} (${user.email || '이메일 없음'})`);
          });
        }
      }
      return true;
    } else {
      log.error(`사용자 API 오류: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`DB 테스트 실패: ${error.message}`);
    return false;
  }
}

// 4. API 엔드포인트 테스트
async function testAPIEndpoints() {
  log.header('API 엔드포인트 테스트');
  
  const endpoints = [
    { path: '/api/', name: 'API Root' },
    { path: '/api/users/', name: '사용자 목록' },
    { path: '/api/projects/', name: '프로젝트 목록' },
    { path: '/api/evaluations/', name: '평가 목록' },
    { path: '/api/criteria/', name: '평가 기준 목록' },
    { path: '/admin/', name: 'Django Admin', checkOnly: true }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 3000
      });
      
      const status = response.status;
      let result = '';
      
      if (status === 200 || status === 201) {
        result = `${colors.green}✓${colors.reset} ${endpoint.name}: 정상 (${status})`;
      } else if (status === 401 || status === 403) {
        result = `${colors.yellow}⚠${colors.reset} ${endpoint.name}: 인증 필요 (${status})`;
      } else if (status === 404) {
        result = `${colors.red}✗${colors.reset} ${endpoint.name}: 엔드포인트 없음 (${status})`;
      } else if (status === 301 || status === 302) {
        result = `${colors.blue}→${colors.reset} ${endpoint.name}: 리다이렉트 (${status})`;
      } else {
        result = `${colors.red}✗${colors.reset} ${endpoint.name}: 오류 (${status})`;
      }
      
      console.log(result);
      results.push({ endpoint: endpoint.name, status, success: status < 400 });
      
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} ${endpoint.name}: 연결 실패`);
      results.push({ endpoint: endpoint.name, status: 0, success: false });
    }
  }
  
  return results;
}

// 5. 인증 테스트
async function testAuthentication() {
  log.header('인증 시스템 테스트');
  
  // 테스트용 로그인 시도
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'  // 기본 테스트 비밀번호
      }),
      timeout: 5000
    });
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      log.success('인증 시스템: 정상 작동');
      
      if (data.access || data.token) {
        log.info('JWT 토큰 발급 확인');
      }
    } else if (loginResponse.status === 401) {
      log.warning('인증 시스템: 작동 중 (테스트 계정 로그인 실패)');
    } else {
      log.error(`인증 시스템 오류: ${loginResponse.status}`);
    }
  } catch (error) {
    log.error(`인증 테스트 실패: ${error.message}`);
  }
}

// 6. PostgreSQL 직접 연결 테스트 (선택사항)
async function testPostgreSQLDirect() {
  log.header('PostgreSQL 직접 연결 테스트');
  
  try {
    const { Client } = require('pg');
    
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'ahp_db',
      user: 'ahp_user',
      password: 'Qudtls1!'
    });
    
    await client.connect();
    
    const result = await client.query('SELECT version()');
    log.success('PostgreSQL 연결: 정상');
    console.log('PostgreSQL 버전:', result.rows[0].version);
    
    // 테이블 목록 확인
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log('\n데이터베이스 테이블 목록:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
    // 사용자 수 확인
    const userCount = await client.query('SELECT COUNT(*) FROM auth_user');
    console.log(`\n총 사용자 수: ${userCount.rows[0].count}명`);
    
    await client.end();
    return true;
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      log.warning('pg 모듈이 설치되지 않음 - npm install pg 실행 필요');
    } else {
      log.error(`PostgreSQL 연결 실패: ${error.message}`);
    }
    return false;
  }
}

// 메인 테스트 실행
async function runAllTests() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     AHP 백엔드 & 데이터베이스 테스트      ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  const results = {
    server: false,
    database: false,
    endpoints: [],
    auth: false,
    postgresql: false
  };
  
  // 서버 상태 확인
  results.server = await checkServerStatus();
  
  if (results.server) {
    // DB 연결 확인
    results.database = await checkDatabaseConnection();
    
    // API 엔드포인트 테스트
    results.endpoints = await testAPIEndpoints();
    
    // 인증 테스트
    await testAuthentication();
    
    // PostgreSQL 직접 연결 테스트
    results.postgresql = await testPostgreSQLDirect();
  }
  
  // 최종 결과 요약
  log.header('테스트 결과 요약');
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`실행 시간: ${totalTime}초\n`);
  console.log('테스트 결과:');
  console.log(`  • 서버 상태: ${results.server ? '✓ 정상' : '✗ 실패'}`);
  console.log(`  • DB 연결: ${results.database ? '✓ 정상' : '✗ 실패'}`);
  console.log(`  • PostgreSQL: ${results.postgresql ? '✓ 정상' : '⚠ 확인 필요'}`);
  
  if (results.endpoints.length > 0) {
    const successCount = results.endpoints.filter(e => e.success).length;
    console.log(`  • API 엔드포인트: ${successCount}/${results.endpoints.length} 성공`);
  }
  
  if (results.server && results.database) {
    log.success('\n✨ 백엔드 시스템이 정상적으로 작동 중입니다!');
  } else {
    log.error('\n⚠️  일부 시스템에 문제가 있습니다. 위의 오류를 확인하세요.');
  }
}

// 테스트 실행
runAllTests().catch(error => {
  log.error(`테스트 실행 중 오류 발생: ${error.message}`);
  process.exit(1);
});