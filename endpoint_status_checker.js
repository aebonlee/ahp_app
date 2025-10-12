/**
 * 백엔드 API 엔드포인트 상태 체크 스크립트
 * 주요 API 엔드포인트들의 응답 상태를 확인합니다.
 */

const BASE_URL = 'https://ahp-django-backend.onrender.com';

// 테스트할 엔드포인트 목록
const endpoints = [
  // 인증 관련
  { name: '사용자 프로필', url: '/api/service/auth/profile/', method: 'GET', requiresAuth: true },
  { name: '로그인', url: '/api/service/auth/login/', method: 'POST', requiresAuth: false },
  
  // 프로젝트 관리
  { name: '프로젝트 목록', url: '/api/service/projects/', method: 'GET', requiresAuth: true },
  { name: '프로젝트 상세', url: '/api/service/projects/projects/1/', method: 'GET', requiresAuth: true },
  
  // 평가자 관리
  { name: '평가자 목록', url: '/api/service/evaluators/?project=1', method: 'GET', requiresAuth: true },
  { name: '평가자 추가', url: '/api/service/evaluators/', method: 'POST', requiresAuth: true },
  
  // 대안 관리
  { name: '대안 목록', url: '/api/v1/alternatives/?project=1', method: 'GET', requiresAuth: true },
  { name: '대안 생성', url: '/api/v1/alternatives/', method: 'POST', requiresAuth: true },
  
  // 기준 관리
  { name: '기준 목록', url: '/api/service/projects/projects/1/criteria/', method: 'GET', requiresAuth: true },
  { name: '기준 추가', url: '/api/service/projects/projects/1/add_criteria/', method: 'POST', requiresAuth: true },
  
  // 서비스 상태
  { name: '서비스 상태', url: '/api/service/status/', method: 'GET', requiresAuth: false },
  { name: '데이터 서비스', url: '/api/service/data/', method: 'GET', requiresAuth: false }
];

// HTTP 요청 함수
async function checkEndpoint(endpoint) {
  const startTime = Date.now();
  
  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    // POST 요청에 대한 간단한 테스트 데이터
    if (endpoint.method === 'POST') {
      if (endpoint.url.includes('login')) {
        options.body = JSON.stringify({
          username: 'test_user',
          password: 'test_password'
        });
      } else if (endpoint.url.includes('evaluators')) {
        options.body = JSON.stringify({
          name: 'Test Evaluator',
          email: 'test@example.com',
          project: 1
        });
      } else if (endpoint.url.includes('alternatives')) {
        options.body = JSON.stringify({
          name: 'Test Alternative',
          description: 'Test Description',
          project: 1
        });
      } else if (endpoint.url.includes('criteria')) {
        options.body = JSON.stringify({
          name: 'Test Criteria',
          description: 'Test Description'
        });
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint.url}`, options);
    const duration = Date.now() - startTime;
    
    let responseData = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Invalid JSON response' };
      }
    } else {
      responseData = { message: await response.text() };
    }

    return {
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      duration: duration,
      response: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };

  } catch (error) {
    return {
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      status: 'ERROR',
      statusText: error.message,
      success: false,
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

// 모든 엔드포인트 테스트
async function checkAllEndpoints() {
  console.log('🔍 백엔드 API 엔드포인트 상태 체크 시작...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`📡 Testing: ${endpoint.method} ${endpoint.url}`);
    const result = await checkEndpoint(endpoint);
    results.push(result);
    
    // 결과 출력
    const statusColor = result.success ? '✅' : '❌';
    console.log(`${statusColor} ${result.name}: ${result.status} (${result.duration}ms)`);
    
    if (!result.success) {
      console.log(`   Error: ${result.statusText || result.error}`);
    }
    
    // 응답 데이터가 있으면 요약 출력
    if (result.response && typeof result.response === 'object') {
      if (result.response.error) {
        console.log(`   Response Error: ${result.response.error}`);
      } else if (Array.isArray(result.response)) {
        console.log(`   Response: Array with ${result.response.length} items`);
      } else if (result.response.count !== undefined) {
        console.log(`   Response: ${result.response.count} items`);
      } else if (result.response.message) {
        console.log(`   Response: ${result.response.message}`);
      }
    }
    
    console.log('');
    
    // 서버 부하를 줄이기 위해 요청 간 간격 추가
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 요약 보고서
  console.log('\n📊 테스트 결과 요약');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`✅ 성공: ${successful}/${results.length}`);
  console.log(`❌ 실패: ${failed}/${results.length}`);
  console.log(`⏱️  평균 응답 시간: ${avgDuration.toFixed(2)}ms`);
  
  // 실패한 엔드포인트 상세 분석
  if (failed > 0) {
    console.log('\n❌ 실패한 엔드포인트 상세:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`\n• ${result.name} (${result.method} ${result.url})`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Error: ${result.statusText || result.error}`);
      if (result.response && result.response.detail) {
        console.log(`  Detail: ${result.response.detail}`);
      }
    });
  }
  
  // 성공한 엔드포인트 분석
  if (successful > 0) {
    console.log('\n✅ 성공한 엔드포인트:');
    results.filter(r => r.success).forEach(result => {
      console.log(`• ${result.name}: ${result.status} (${result.duration}ms)`);
    });
  }
  
  // JSON 보고서 생성
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: results.length,
      successful: successful,
      failed: failed,
      successRate: (successful / results.length * 100).toFixed(2),
      averageResponseTime: avgDuration.toFixed(2)
    },
    results: results
  };
  
  // 보고서 저장
  const fs = require('fs');
  const reportPath = 'endpoint_status_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 상세 보고서가 ${reportPath}에 저장되었습니다.`);
  
  return report;
}

// 스크립트 실행
if (require.main === module) {
  checkAllEndpoints().catch(console.error);
}

module.exports = { checkEndpoint, checkAllEndpoints };