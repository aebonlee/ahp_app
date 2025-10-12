/**
 * 최종 백엔드 API 엔드포인트 종합 분석
 * 실제 백엔드 구조를 기반으로 한 완전한 상태 체크
 */

const BASE_URL = 'https://ahp-django-backend.onrender.com';

// 실제 확인된 엔드포인트들
const realEndpoints = [
  // 기본 정보 및 헬스체크
  { category: 'System', name: 'API 정보', url: '/api/', method: 'GET', requiresAuth: false },
  { category: 'System', name: '헬스체크', url: '/health/', method: 'GET', requiresAuth: false },
  { category: 'System', name: 'DB 상태', url: '/db-status/', method: 'GET', requiresAuth: false },
  
  // 서비스 프로젝트 관련 (확인됨)
  { category: 'Projects', name: '프로젝트 서비스 루트', url: '/api/service/projects/', method: 'GET', requiresAuth: false },
  { category: 'Projects', name: '프로젝트 목록', url: '/api/service/projects/projects/', method: 'GET', requiresAuth: true },
  { category: 'Projects', name: '기준 관리', url: '/api/service/projects/criteria/', method: 'GET', requiresAuth: true },
  { category: 'Projects', name: '템플릿 관리', url: '/api/service/projects/templates/', method: 'GET', requiresAuth: true },
  
  // 인증 관련
  { category: 'Auth', name: 'JWT 토큰 발급', url: '/api/service/auth/token/', method: 'POST', requiresAuth: false },
  { category: 'Auth', name: 'JWT 토큰 새로고침', url: '/api/service/auth/token/refresh/', method: 'POST', requiresAuth: false },
  { category: 'Auth', name: 'JWT 토큰 검증', url: '/api/service/auth/token/verify/', method: 'POST', requiresAuth: false },
  
  // 기타 서비스 앱들
  { category: 'Services', name: '계정 서비스', url: '/api/service/accounts/', method: 'GET', requiresAuth: true },
  { category: 'Services', name: '평가 서비스', url: '/api/service/evaluations/', method: 'GET', requiresAuth: true },
  { category: 'Services', name: '분석 서비스', url: '/api/service/analysis/', method: 'GET', requiresAuth: true },
  
  // 요청받은 엔드포인트들 (존재하지 않을 수 있음)
  { category: 'Requested', name: '사용자 프로필', url: '/api/service/auth/profile/', method: 'GET', requiresAuth: true },
  { category: 'Requested', name: '평가자 관리', url: '/api/service/evaluators/', method: 'GET', requiresAuth: true },
  { category: 'Requested', name: '대안 관리', url: '/api/service/alternatives/', method: 'GET', requiresAuth: true },
  { category: 'Requested', name: '기준 관리 (직접)', url: '/api/service/criteria/', method: 'GET', requiresAuth: true }
];

async function checkEndpointWithAuth(endpoint) {
  console.log(`\n🔍 ${endpoint.name} (${endpoint.category})`);
  console.log(`   ${endpoint.method} ${endpoint.url}`);
  
  const startTime = Date.now();
  
  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    // POST 요청의 경우 테스트 데이터 추가
    if (endpoint.method === 'POST' && endpoint.url.includes('token')) {
      if (endpoint.url.includes('refresh')) {
        options.body = JSON.stringify({ refresh: 'test_refresh_token' });
      } else if (endpoint.url.includes('verify')) {
        options.body = JSON.stringify({ token: 'test_token' });
      } else {
        options.body = JSON.stringify({ username: 'test', password: 'test' });
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
        responseData = { parseError: e.message };
      }
    } else {
      const text = await response.text();
      responseData = { textResponse: text.length > 200 ? text.substring(0, 200) + '...' : text };
    }

    // 결과 출력
    const statusIcon = response.ok ? '✅' : '❌';
    console.log(`   ${statusIcon} ${response.status} ${response.statusText} (${duration}ms)`);
    
    if (response.ok) {
      if (responseData && typeof responseData === 'object') {
        if (responseData.projects || responseData.criteria || responseData.templates) {
          console.log(`   📋 서비스 엔드포인트 목록 반환`);
        } else if (responseData.message) {
          console.log(`   💬 "${responseData.message}"`);
        } else if (responseData.status) {
          console.log(`   📊 상태: ${responseData.status}`);
        } else if (Array.isArray(responseData)) {
          console.log(`   📦 배열 데이터: ${responseData.length}개 항목`);
        } else {
          console.log(`   📄 객체 데이터: ${Object.keys(responseData).length}개 필드`);
        }
      }
    } else {
      if (response.status === 401) {
        console.log(`   🔐 인증 필요 (예상됨)`);
      } else if (response.status === 404) {
        console.log(`   📭 엔드포인트 없음`);
      } else if (response.status >= 500) {
        console.log(`   🔥 서버 오류`);
      }
      
      if (responseData && responseData.detail) {
        console.log(`   💬 "${responseData.detail}"`);
      }
    }

    return {
      category: endpoint.category,
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      status: response.status,
      success: response.ok,
      duration: duration,
      requiresAuth: endpoint.requiresAuth,
      response: responseData
    };

  } catch (error) {
    console.log(`   ❌ 네트워크 오류: ${error.message}`);
    return {
      category: endpoint.category,
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      status: 'ERROR',
      success: false,
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

async function runFinalAnalysis() {
  console.log('🎯 백엔드 API 엔드포인트 최종 종합 분석');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📅 분석 시간: ${new Date().toLocaleString()}`);
  console.log('='.repeat(80));
  
  const results = [];
  
  for (const endpoint of realEndpoints) {
    const result = await checkEndpointWithAuth(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 카테고리별 분석
  console.log('\n' + '='.repeat(80));
  console.log('📊 카테고리별 분석 결과');
  console.log('='.repeat(80));
  
  const categories = {};
  results.forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = [];
    }
    categories[result.category].push(result);
  });
  
  for (const [categoryName, categoryResults] of Object.entries(categories)) {
    const successful = categoryResults.filter(r => r.success).length;
    const total = categoryResults.length;
    const authRequired = categoryResults.filter(r => r.requiresAuth && r.status === 401).length;
    
    console.log(`\n📁 ${categoryName} (${successful}/${total} 성공)`);
    
    categoryResults.forEach(result => {
      const icon = result.success ? '✅' : 
                   (result.status === 401 && result.requiresAuth) ? '🔐' : '❌';
      console.log(`   ${icon} ${result.name}: ${result.status} (${result.duration}ms)`);
    });
    
    if (authRequired > 0) {
      console.log(`   ℹ️  ${authRequired}개 엔드포인트는 인증이 필요합니다.`);
    }
  }
  
  // 핵심 분석 결과
  console.log('\n' + '='.repeat(80));
  console.log('📋 핵심 분석 결과');
  console.log('='.repeat(80));
  
  const systemEndpoints = categories['System'] || [];
  const projectEndpoints = categories['Projects'] || [];
  const requestedEndpoints = categories['Requested'] || [];
  
  console.log(`\n🖥️  시스템 상태:`);
  systemEndpoints.forEach(result => {
    console.log(`   • ${result.name}: ${result.success ? '정상' : '오류'}`);
  });
  
  console.log(`\n📁 프로젝트 관리:`);
  projectEndpoints.forEach(result => {
    if (result.success) {
      console.log(`   ✅ ${result.name}: 정상 작동`);
    } else if (result.status === 401) {
      console.log(`   🔐 ${result.name}: 인증 필요 (정상)`);
    } else {
      console.log(`   ❌ ${result.name}: 오류 (${result.status})`);
    }
  });
  
  console.log(`\n❓ 요청받은 엔드포인트:`);
  requestedEndpoints.forEach(result => {
    if (result.status === 404) {
      console.log(`   📭 ${result.name}: 구현되지 않음`);
    } else if (result.status === 401) {
      console.log(`   🔐 ${result.name}: 존재하지만 인증 필요`);
    } else if (result.success) {
      console.log(`   ✅ ${result.name}: 정상 작동`);
    } else {
      console.log(`   ❌ ${result.name}: 오류 (${result.status})`);
    }
  });
  
  // 최종 권장사항
  console.log('\n' + '='.repeat(80));
  console.log('💡 최종 권장사항');
  console.log('='.repeat(80));
  
  const workingEndpoints = results.filter(r => r.success || (r.status === 401 && r.requiresAuth));
  const brokenEndpoints = results.filter(r => !r.success && !(r.status === 401 && r.requiresAuth));
  
  console.log(`\n📊 상태 요약:`);
  console.log(`   ✅ 정상 작동: ${workingEndpoints.length}/${results.length}`);
  console.log(`   ❌ 문제 있음: ${brokenEndpoints.length}/${results.length}`);
  
  console.log(`\n🔧 개발 가이드:`);
  
  if (systemEndpoints.every(r => r.success)) {
    console.log(`   ✅ 백엔드 서버는 정상 작동 중입니다.`);
  }
  
  if (projectEndpoints.some(r => r.success)) {
    console.log(`   ✅ 프로젝트 관리 기능의 일부가 구현되어 있습니다.`);
    console.log(`   🔗 사용 가능한 엔드포인트:`);
    projectEndpoints.filter(r => r.success).forEach(r => {
      console.log(`      • ${r.method} ${r.url}`);
    });
  }
  
  const missingEndpoints = requestedEndpoints.filter(r => r.status === 404);
  if (missingEndpoints.length > 0) {
    console.log(`\n🚧 구현 필요한 엔드포인트:`);
    missingEndpoints.forEach(r => {
      console.log(`   • ${r.name}: ${r.method} ${r.url}`);
    });
    console.log(`   📝 이들 엔드포인트를 Django 백엔드에 구현해야 합니다.`);
  }
  
  console.log(`\n🔐 인증 가이드:`);
  console.log(`   1. JWT 토큰 획득: POST /api/service/auth/token/`);
  console.log(`   2. 요청 헤더에 포함: Authorization: Bearer <your_token>`);
  console.log(`   3. 토큰 갱신: POST /api/service/auth/token/refresh/`);
  
  // 보고서 저장
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: results.length,
      working: workingEndpoints.length,
      broken: brokenEndpoints.length,
      categories: Object.keys(categories).length
    },
    categoryAnalysis: Object.entries(categories).map(([name, categoryResults]) => ({
      category: name,
      total: categoryResults.length,
      successful: categoryResults.filter(r => r.success).length,
      authRequired: categoryResults.filter(r => r.status === 401).length,
      notFound: categoryResults.filter(r => r.status === 404).length
    })),
    detailedResults: results,
    missingEndpoints: missingEndpoints.map(r => ({ name: r.name, url: r.url, method: r.method })),
    workingEndpoints: workingEndpoints.map(r => ({ name: r.name, url: r.url, method: r.method, status: r.status }))
  };
  
  const fs = require('fs');
  const reportPath = 'final_endpoint_analysis.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 최종 분석 보고서가 ${reportPath}에 저장되었습니다.`);
  
  return report;
}

// 스크립트 실행
if (require.main === module) {
  runFinalAnalysis().catch(console.error);
}

module.exports = { checkEndpointWithAuth, runFinalAnalysis };