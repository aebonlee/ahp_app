/**
 * 수정된 백엔드 API 엔드포인트 상태 체크 스크립트
 * 실제 백엔드 API 구조에 맞춘 엔드포인트 체크
 */

const BASE_URL = 'https://ahp-django-backend.onrender.com';

// 실제 백엔드에서 확인된 엔드포인트 목록
const endpoints = [
  // 기본 API 정보
  { name: 'API 정보', url: '/api/', method: 'GET', requiresAuth: false },
  
  // 헬스체크 엔드포인트
  { name: '헬스체크', url: '/health/', method: 'GET', requiresAuth: false },
  { name: 'DB 상태', url: '/db-status/', method: 'GET', requiresAuth: false },
  
  // 인증 관련 (JWT)
  { name: 'JWT 토큰 획득', url: '/api/auth/token/', method: 'POST', requiresAuth: false },
  { name: 'JWT 토큰 새로고침', url: '/api/auth/token/refresh/', method: 'POST', requiresAuth: false },
  { name: 'JWT 토큰 검증', url: '/api/auth/token/verify/', method: 'POST', requiresAuth: false },
  
  // 서비스 인증 (서비스 API)
  { name: '서비스 JWT 토큰', url: '/api/service/auth/token/', method: 'POST', requiresAuth: false },
  { name: '서비스 JWT 새로고침', url: '/api/service/auth/token/refresh/', method: 'POST', requiresAuth: false },
  { name: '서비스 JWT 검증', url: '/api/service/auth/token/verify/', method: 'POST', requiresAuth: false },
  
  // 앱별 엔드포인트
  { name: '계정 관리', url: '/api/accounts/', method: 'GET', requiresAuth: true },
  { name: '프로젝트 관리', url: '/api/projects/', method: 'GET', requiresAuth: true },
  { name: '평가 관리', url: '/api/evaluations/', method: 'GET', requiresAuth: true },
  { name: '분석 관리', url: '/api/analysis/', method: 'GET', requiresAuth: true },
  
  // 서비스 앱별 엔드포인트
  { name: '서비스 계정', url: '/api/service/accounts/', method: 'GET', requiresAuth: true },
  { name: '서비스 프로젝트', url: '/api/service/projects/', method: 'GET', requiresAuth: true },
  { name: '서비스 평가', url: '/api/service/evaluations/', method: 'GET', requiresAuth: true },
  { name: '서비스 분석', url: '/api/service/analysis/', method: 'GET', requiresAuth: true },
  
  // 관리자 페이지
  { name: '관리자 페이지', url: '/admin/', method: 'GET', requiresAuth: false }
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

    // POST 요청에 대한 테스트 데이터
    if (endpoint.method === 'POST') {
      if (endpoint.url.includes('token') && !endpoint.url.includes('refresh') && !endpoint.url.includes('verify')) {
        options.body = JSON.stringify({
          username: 'test_user',
          password: 'test_password'
        });
      } else if (endpoint.url.includes('refresh')) {
        options.body = JSON.stringify({
          refresh: 'dummy_refresh_token'
        });
      } else if (endpoint.url.includes('verify')) {
        options.body = JSON.stringify({
          token: 'dummy_token'
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
      const textResponse = await response.text();
      responseData = { 
        message: textResponse.length > 200 ? textResponse.substring(0, 200) + '...' : textResponse 
      };
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
  console.log('🔍 수정된 백엔드 API 엔드포인트 상태 체크 시작...\n');
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
      } else if (result.response.message && result.response.message.includes('AHP Platform API')) {
        console.log(`   Response: API 정보 확인됨`);
      } else if (result.response.status === 'healthy' || result.response.status === 'ok') {
        console.log(`   Response: ${result.response.status}`);
      } else if (Array.isArray(result.response)) {
        console.log(`   Response: Array with ${result.response.length} items`);
      } else if (result.response.count !== undefined) {
        console.log(`   Response: ${result.response.count} items`);
      } else if (result.response.detail) {
        console.log(`   Response: ${result.response.detail}`);
      }
    }
    
    console.log('');
    
    // 서버 부하를 줄이기 위해 요청 간 간격 추가
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // 요약 보고서
  console.log('\n📊 테스트 결과 요약');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`✅ 성공: ${successful}/${results.length} (${(successful/results.length*100).toFixed(1)}%)`);
  console.log(`❌ 실패: ${failed}/${results.length} (${(failed/results.length*100).toFixed(1)}%)`);
  console.log(`⏱️  평균 응답 시간: ${avgDuration.toFixed(2)}ms`);
  
  // 카테고리별 분석
  console.log('\n📋 카테고리별 상태:');
  const categories = {
    '헬스체크': results.filter(r => r.name.includes('헬스') || r.name.includes('DB') || r.name.includes('API 정보')),
    '인증': results.filter(r => r.name.includes('JWT') || r.name.includes('토큰')),
    '일반 API': results.filter(r => r.url.startsWith('/api/') && !r.url.includes('service') && !r.url.includes('auth')),
    '서비스 API': results.filter(r => r.url.includes('/api/service/')),
    '관리': results.filter(r => r.name.includes('관리자'))
  };
  
  for (const [category, categoryResults] of Object.entries(categories)) {
    if (categoryResults.length > 0) {
      const successCount = categoryResults.filter(r => r.success).length;
      console.log(`  ${category}: ${successCount}/${categoryResults.length} 성공`);
    }
  }
  
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
  
  // 권장사항
  console.log('\n💡 권장사항:');
  if (categories['헬스체크'].filter(r => r.success).length > 0) {
    console.log('✅ 기본 서버 상태는 정상입니다.');
  }
  if (categories['인증'].filter(r => r.success).length === 0) {
    console.log('⚠️  인증 관련 엔드포인트가 작동하지 않습니다. 로그인 기능에 문제가 있을 수 있습니다.');
  }
  if (categories['서비스 API'].filter(r => r.success).length < categories['서비스 API'].length / 2) {
    console.log('⚠️  서비스 API 엔드포인트 대부분이 실패했습니다. 백엔드 설정을 확인해주세요.');
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
    categoryAnalysis: Object.entries(categories).map(([name, categoryResults]) => ({
      category: name,
      total: categoryResults.length,
      successful: categoryResults.filter(r => r.success).length,
      successRate: categoryResults.length > 0 ? (categoryResults.filter(r => r.success).length / categoryResults.length * 100).toFixed(2) : 0
    })),
    results: results
  };
  
  // 보고서 저장
  const fs = require('fs');
  const reportPath = 'corrected_endpoint_status_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 상세 보고서가 ${reportPath}에 저장되었습니다.`);
  
  return report;
}

// 스크립트 실행
if (require.main === module) {
  checkAllEndpoints().catch(console.error);
}

module.exports = { checkEndpoint, checkAllEndpoints };