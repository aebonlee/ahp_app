/**
 * 요청받은 주요 엔드포인트들의 상세 상태 체크
 * 1. /api/service/auth/profile/ - 사용자 프로필
 * 2. /api/service/projects/ - 프로젝트 목록
 * 3. /api/service/evaluators/ - 평가자 관리
 * 4. /api/service/alternatives/ - 대안 관리
 * 5. /api/service/criteria/ - 기준 관리
 */

const BASE_URL = 'https://ahp-django-backend.onrender.com';

const specificEndpoints = [
  {
    name: '사용자 프로필',
    url: '/api/service/auth/profile/',
    method: 'GET',
    description: '현재 사용자의 프로필 정보를 조회'
  },
  {
    name: '프로젝트 목록',
    url: '/api/service/projects/',
    method: 'GET',
    description: '사용자의 프로젝트 목록을 조회'
  },
  {
    name: '평가자 관리',
    url: '/api/service/evaluators/',
    method: 'GET',
    description: '프로젝트의 평가자 목록을 조회'
  },
  {
    name: '대안 관리',
    url: '/api/service/alternatives/',
    method: 'GET',
    description: '프로젝트의 대안 목록을 조회'
  },
  {
    name: '기준 관리',
    url: '/api/service/criteria/',
    method: 'GET',
    description: '프로젝트의 기준 목록을 조회'
  }
];

async function checkSpecificEndpoint(endpoint) {
  console.log(`\n📡 테스트: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.method} ${endpoint.url}`);
  console.log(`   설명: ${endpoint.description}`);
  console.log(`   ${'='.repeat(60)}`);
  
  const startTime = Date.now();
  
  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AHP-Frontend/1.0'
      }
    };

    const response = await fetch(`${BASE_URL}${endpoint.url}`, options);
    const duration = Date.now() - startTime;
    
    console.log(`   ⏱️  응답 시간: ${duration}ms`);
    console.log(`   📊 HTTP 상태: ${response.status} ${response.statusText}`);
    
    // 응답 헤더 분석
    const contentType = response.headers.get('content-type');
    const corsHeader = response.headers.get('access-control-allow-origin');
    
    console.log(`   📄 Content-Type: ${contentType || 'Not specified'}`);
    console.log(`   🌐 CORS: ${corsHeader || 'Not configured'}`);
    
    // 응답 본문 분석
    let responseData = null;
    let responseSize = 0;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const responseText = await response.text();
        responseSize = responseText.length;
        responseData = JSON.parse(responseText);
        console.log(`   📦 응답 크기: ${responseSize} bytes`);
      } catch (e) {
        console.log(`   ❌ JSON 파싱 오류: ${e.message}`);
        responseData = { error: 'Invalid JSON response' };
      }
    } else {
      const responseText = await response.text();
      responseSize = responseText.length;
      console.log(`   📦 응답 크기: ${responseSize} bytes`);
      responseData = { 
        message: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText 
      };
    }

    // 상태 분석
    if (response.ok) {
      console.log(`   ✅ 상태: 정상 동작`);
      
      if (responseData && typeof responseData === 'object') {
        if (Array.isArray(responseData)) {
          console.log(`   📋 데이터: 배열 형태, ${responseData.length}개 항목`);
          if (responseData.length > 0) {
            console.log(`   🔍 첫 번째 항목 구조:`, Object.keys(responseData[0]));
          }
        } else if (responseData.count !== undefined) {
          console.log(`   📋 데이터: 페이지네이션, 총 ${responseData.count}개 항목`);
          if (responseData.results) {
            console.log(`   📄 현재 페이지: ${responseData.results.length}개 항목`);
          }
        } else if (responseData.id || responseData.name || responseData.username) {
          console.log(`   👤 데이터: 사용자/객체 정보`);
          const keys = Object.keys(responseData);
          console.log(`   🔍 응답 필드: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
        } else {
          console.log(`   📋 데이터: 객체 형태`);
          console.log(`   🔍 응답 필드: ${Object.keys(responseData).slice(0, 5).join(', ')}`);
        }
      }
    } else {
      console.log(`   ❌ 상태: 오류 발생`);
      
      if (response.status === 401) {
        console.log(`   🔐 인증 필요: 로그인 토큰이 필요한 엔드포인트입니다.`);
      } else if (response.status === 403) {
        console.log(`   🚫 권한 없음: 접근 권한이 부족합니다.`);
      } else if (response.status === 404) {
        console.log(`   📭 엔드포인트 없음: URL이 존재하지 않습니다.`);
      } else if (response.status === 500) {
        console.log(`   🔥 서버 오류: 백엔드 내부 오류가 발생했습니다.`);
      }
      
      if (responseData && responseData.detail) {
        console.log(`   💬 서버 메시지: ${responseData.detail}`);
      } else if (responseData && responseData.error) {
        console.log(`   💬 오류 메시지: ${responseData.error}`);
      }
    }
    
    return {
      name: endpoint.name,
      url: endpoint.url,
      method: endpoint.method,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      duration: duration,
      responseSize: responseSize,
      contentType: contentType,
      cors: corsHeader,
      response: responseData
    };

  } catch (error) {
    console.log(`   ❌ 네트워크 오류: ${error.message}`);
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

async function checkAllSpecificEndpoints() {
  console.log('🎯 주요 백엔드 API 엔드포인트 상세 분석');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`⏰ 테스트 시간: ${new Date().toLocaleString()}\n`);
  
  const results = [];
  
  for (const endpoint of specificEndpoints) {
    const result = await checkSpecificEndpoint(endpoint);
    results.push(result);
    
    // 요청 간 간격
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 종합 분석
  console.log('\n' + '='.repeat(80));
  console.log('📊 종합 분석 결과');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`\n📈 전체 현황:`);
  console.log(`   ✅ 정상: ${successful}/${results.length} (${(successful/results.length*100).toFixed(1)}%)`);
  console.log(`   ❌ 실패: ${failed}/${results.length} (${(failed/results.length*100).toFixed(1)}%)`);
  console.log(`   ⏱️  평균 응답시간: ${avgDuration.toFixed(0)}ms`);
  
  // 각 엔드포인트별 요약
  console.log(`\n📋 엔드포인트별 상세:`);
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${result.name}: ${result.status} (${result.duration}ms)`);
  });
  
  // 문제점 및 권장사항
  console.log(`\n💡 분석 및 권장사항:`);
  
  if (successful === results.length) {
    console.log(`   🎉 모든 엔드포인트가 정상 작동합니다!`);
  } else {
    const authErrors = results.filter(r => r.status === 401).length;
    const notFoundErrors = results.filter(r => r.status === 404).length;
    const serverErrors = results.filter(r => r.status >= 500).length;
    
    if (authErrors > 0) {
      console.log(`   🔐 ${authErrors}개 엔드포인트에서 인증 오류 (401) 발생`);
      console.log(`      → JWT 토큰 기반 인증이 필요한 엔드포인트입니다.`);
      console.log(`      → 프론트엔드에서 로그인 후 Authorization 헤더에 토큰을 포함해야 합니다.`);
    }
    
    if (notFoundErrors > 0) {
      console.log(`   📭 ${notFoundErrors}개 엔드포인트가 존재하지 않음 (404)`);
      console.log(`      → 백엔드 URL 경로를 확인하거나 Django URL 설정을 점검해주세요.`);
    }
    
    if (serverErrors > 0) {
      console.log(`   🔥 ${serverErrors}개 엔드포인트에서 서버 오류 (500+) 발생`);
      console.log(`      → 백엔드 로그를 확인하여 내부 오류를 디버깅해야 합니다.`);
    }
  }
  
  // 개발 가이드
  console.log(`\n🛠️  개발 가이드:`);
  console.log(`   1. 인증이 필요한 엔드포인트는 다음과 같이 호출하세요:`);
  console.log(`      fetch('${BASE_URL}/api/service/auth/profile/', {`);
  console.log(`        headers: {`);
  console.log(`          'Authorization': 'Bearer ' + yourJWTToken,`);
  console.log(`          'Content-Type': 'application/json'`);
  console.log(`        }`);
  console.log(`      })`);
  console.log(`   2. 먼저 /api/service/auth/token/으로 로그인하여 토큰을 받으세요.`);
  console.log(`   3. 정상 작동하는 /api/service/projects/ 엔드포인트를 참조하여 다른 엔드포인트를 구현하세요.`);
  
  // JSON 보고서 저장
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
    detailedResults: results,
    recommendations: {
      authErrors: results.filter(r => r.status === 401).length,
      notFoundErrors: results.filter(r => r.status === 404).length,
      serverErrors: results.filter(r => r.status >= 500).length
    }
  };
  
  const fs = require('fs');
  const reportPath = 'specific_endpoint_analysis.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 상세 분석 보고서가 ${reportPath}에 저장되었습니다.`);
  
  return report;
}

// 스크립트 실행
if (require.main === module) {
  checkAllSpecificEndpoints().catch(console.error);
}

module.exports = { checkSpecificEndpoint, checkAllSpecificEndpoints };