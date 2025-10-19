/**
 * 기준 API 엔드포인트 확인
 */

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

async function checkCriteriaEndpoints() {
  console.log('🔍 기준 API 엔드포인트 확인...\n');
  
  // 가능한 기준 API 경로들
  const possiblePaths = [
    '/api/service/criteria/',
    '/api/service/projects/criteria/',
    '/api/criteria/',
    '/api/v1/criteria/',
    '/api/projects/criteria/'
  ];
  
  for (const path of possiblePaths) {
    try {
      console.log(`테스트 중: ${path}`);
      
      // OPTIONS 요청으로 허용된 메서드 확인
      const optionsResponse = await fetch(`${API_BASE_URL}${path}`, {
        method: 'OPTIONS'
      });
      
      if (optionsResponse.status !== 404) {
        console.log(`  ✅ OPTIONS: ${optionsResponse.status}, Allow: ${optionsResponse.headers.get('allow')}`);
        
        // GET 요청 테스트
        const getResponse = await fetch(`${API_BASE_URL}${path}`);
        console.log(`  📊 GET: ${getResponse.status}`);
        
        if (getResponse.ok) {
          const data = await getResponse.json();
          console.log(`  📋 데이터:`, data);
        } else if (getResponse.status !== 404) {
          const text = await getResponse.text();
          console.log(`  ⚠️ 응답:`, text.substring(0, 100));
        }
      } else {
        console.log(`  ❌ 404 Not Found`);
      }
    } catch (error) {
      console.log(`  ❌ 오류: ${error.message}`);
    }
    console.log('');
  }
}

checkCriteriaEndpoints();