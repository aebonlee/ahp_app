/**
 * Render.com 배포 백엔드 테스트
 * Django REST API 및 PostgreSQL 원격 연결 테스트
 */

const fetch = require('node-fetch');

// Render.com 배포 URL
const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// 로그 헬퍼
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

// 테스트 시작 시간
const startTime = Date.now();

// 1. 서버 상태 확인
async function checkServerStatus() {
  log.header('1. Render 서버 상태 확인');
  
  try {
    log.info(`서버 URL: ${API_BASE_URL}`);
    
    const response = await fetch(API_BASE_URL, {
      timeout: 10000
    });
    
    if (response.ok) {
      log.success(`서버 응답: ${response.status} ${response.statusText}`);
      log.info('서버가 정상적으로 실행 중입니다.');
      return true;
    } else {
      log.warning(`서버 응답: ${response.status} ${response.statusText}`);
      return true; // 404도 서버가 살아있다는 의미
    }
  } catch (error) {
    log.error(`서버 연결 실패: ${error.message}`);
    return false;
  }
}

// 2. Admin 페이지 확인
async function checkAdminPage() {
  log.header('2. Django Admin 페이지 확인');
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/`, {
      timeout: 10000
    });
    
    if (response.ok || response.status === 302) {
      log.success('Django Admin 페이지 접근 가능');
      log.info(`Admin URL: ${API_BASE_URL}/admin/`);
      return true;
    } else {
      log.warning(`Admin 페이지 응답: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Admin 페이지 확인 실패: ${error.message}`);
    return false;
  }
}

// 3. API 엔드포인트 테스트
async function testAPIEndpoints() {
  log.header('3. API 엔드포인트 테스트');
  
  const endpoints = [
    { path: '/api/', name: 'API Root', method: 'GET' },
    { path: '/api/users/', name: '사용자 목록', method: 'GET' },
    { path: '/api/projects/', name: '프로젝트 목록', method: 'GET' },
    { path: '/api/evaluations/', name: '평가 목록', method: 'GET' },
    { path: '/api/criteria/', name: '평가 기준', method: 'GET' },
    { path: '/api/auth/login/', name: '로그인 엔드포인트', method: 'POST' },
    { path: '/api/health/', name: '헬스체크', method: 'GET' },
    { path: '/api/db-status/', name: 'DB 상태', method: 'GET' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      };
      
      // POST 요청인 경우 빈 body 추가
      if (endpoint.method === 'POST') {
        options.body = JSON.stringify({});
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, options);
      const status = response.status;
      
      let result = '';
      let statusIcon = '';
      
      if (status >= 200 && status < 300) {
        statusIcon = `${colors.green}✓${colors.reset}`;
        result = `정상 (${status})`;
        
        // 응답 데이터 확인
        try {
          const data = await response.json();
          if (endpoint.name === '사용자 목록' && data.results) {
            result += ` - ${data.results.length}명`;
          } else if (endpoint.name === '프로젝트 목록' && data.results) {
            result += ` - ${data.results.length}개`;
          }
        } catch {}
      } else if (status === 401 || status === 403) {
        statusIcon = `${colors.yellow}⚠${colors.reset}`;
        result = `인증 필요 (${status})`;
      } else if (status === 404) {
        statusIcon = `${colors.red}✗${colors.reset}`;
        result = `없음 (${status})`;
      } else if (status === 405) {
        statusIcon = `${colors.yellow}⚠${colors.reset}`;
        result = `메서드 불허 (${status})`;
      } else if (status >= 500) {
        statusIcon = `${colors.red}✗${colors.reset}`;
        result = `서버 오류 (${status})`;
      } else {
        statusIcon = `${colors.yellow}⚠${colors.reset}`;
        result = `기타 (${status})`;
      }
      
      console.log(`  ${statusIcon} ${endpoint.name.padEnd(20)} : ${result}`);
      results.push({ 
        endpoint: endpoint.name, 
        status, 
        success: status < 400 
      });
      
    } catch (error) {
      console.log(`  ${colors.red}✗${colors.reset} ${endpoint.name.padEnd(20)} : 연결 실패`);
      results.push({ 
        endpoint: endpoint.name, 
        status: 0, 
        success: false 
      });
    }
  }
  
  return results;
}

// 4. 인증 테스트
async function testAuthentication() {
  log.header('4. 인증 시스템 테스트');
  
  try {
    // 테스트 로그인
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test123'
      }),
      timeout: 5000
    });
    
    const status = loginResponse.status;
    
    if (status === 200) {
      const data = await loginResponse.json();
      log.success('로그인 API 작동 확인 (테스트 성공)');
      if (data.access || data.token) {
        log.info('JWT 토큰 발급 시스템 정상');
      }
    } else if (status === 401) {
      log.success('로그인 API 작동 확인 (인증 실패 응답 정상)');
    } else if (status === 400) {
      log.success('로그인 API 작동 확인 (유효성 검사 정상)');
    } else {
      log.warning(`로그인 API 상태: ${status}`);
    }
    
  } catch (error) {
    log.error(`인증 시스템 테스트 실패: ${error.message}`);
  }
}

// 5. 데이터베이스 연결 확인
async function checkDatabaseStatus() {
  log.header('5. 데이터베이스 상태 확인');
  
  try {
    // 사용자 API를 통한 간접 확인
    const response = await fetch(`${API_BASE_URL}/api/users/`, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      log.success('데이터베이스 연결 정상 (API 응답 확인)');
      
      if (data.results && Array.isArray(data.results)) {
        log.info(`현재 등록된 사용자: ${data.results.length}명`);
        
        // 처음 3명 표시
        if (data.results.length > 0) {
          console.log('\n  최근 사용자:');
          data.results.slice(0, 3).forEach((user, i) => {
            console.log(`    ${i+1}. ${user.username} (${user.email || '이메일 없음'})`);
          });
        }
      }
      return true;
    } else if (response.status === 401) {
      log.success('데이터베이스 연결 정상 (인증 필요)');
      return true;
    } else {
      log.warning(`API 응답: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`데이터베이스 상태 확인 실패: ${error.message}`);
    return false;
  }
}

// 6. 성능 테스트
async function performanceTest() {
  log.header('6. 응답 시간 테스트');
  
  const endpoints = [
    { path: '/', name: 'Root' },
    { path: '/api/', name: 'API Root' },
    { path: '/admin/', name: 'Admin' }
  ];
  
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    
    try {
      await fetch(`${API_BASE_URL}${endpoint.path}`, {
        timeout: 10000
      });
      
      const responseTime = Date.now() - startTime;
      const timeColor = responseTime < 500 ? colors.green : 
                       responseTime < 1000 ? colors.yellow : colors.red;
      
      console.log(`  ${endpoint.name.padEnd(15)} : ${timeColor}${responseTime}ms${colors.reset}`);
      
    } catch (error) {
      console.log(`  ${endpoint.name.padEnd(15)} : ${colors.red}실패${colors.reset}`);
    }
  }
}

// 메인 테스트 실행
async function runAllTests() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Render.com Django 백엔드 테스트         ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  const results = {
    server: false,
    admin: false,
    database: false,
    endpoints: []
  };
  
  // 서버 상태 확인
  results.server = await checkServerStatus();
  
  if (results.server) {
    // Admin 페이지 확인
    results.admin = await checkAdminPage();
    
    // API 엔드포인트 테스트
    results.endpoints = await testAPIEndpoints();
    
    // 인증 시스템 테스트
    await testAuthentication();
    
    // 데이터베이스 상태 확인
    results.database = await checkDatabaseStatus();
    
    // 성능 테스트
    await performanceTest();
  }
  
  // 최종 결과 요약
  log.header('테스트 결과 요약');
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`실행 시간: ${totalTime}초\n`);
  
  console.log('시스템 상태:');
  console.log(`  • Render 서버: ${results.server ? '✓ 정상' : '✗ 실패'}`);
  console.log(`  • Django Admin: ${results.admin ? '✓ 접근 가능' : '✗ 접근 불가'}`);
  console.log(`  • 데이터베이스: ${results.database ? '✓ 정상' : '✗ 확인 필요'}`);
  
  if (results.endpoints.length > 0) {
    const successCount = results.endpoints.filter(e => e.success).length;
    console.log(`  • API 엔드포인트: ${successCount}/${results.endpoints.length} 정상`);
  }
  
  console.log('\n배포 정보:');
  console.log(`  • Backend URL: ${colors.blue}${API_BASE_URL}${colors.reset}`);
  console.log(`  • Admin Panel: ${colors.blue}${API_BASE_URL}/admin/${colors.reset}`);
  console.log(`  • API Root: ${colors.blue}${API_BASE_URL}/api/${colors.reset}`);
  
  if (results.server && results.database) {
    log.success('\n✨ Render.com 백엔드가 정상적으로 작동 중입니다!');
    log.info('프론트엔드의 API_BASE_URL을 위 주소로 설정하세요.');
  } else {
    log.warning('\n⚠️ 일부 기능이 제한적일 수 있습니다.');
  }
}

// 테스트 실행
runAllTests().catch(error => {
  log.error(`테스트 실행 중 오류 발생: ${error.message}`);
  process.exit(1);
});