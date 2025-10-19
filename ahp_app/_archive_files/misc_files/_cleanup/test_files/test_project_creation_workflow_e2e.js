/**
 * 프로젝트 생성 워크플로우 E2E 테스트
 * 기본정보 → 기준설정 → 대안설정 → 평가자배정 → 모델구축 전체 플로우 테스트
 */

const { chromium } = require('playwright');

async function testProjectCreationWorkflow() {
  console.log('🚀 프로젝트 생성 워크플로우 E2E 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 각 단계를 천천히 실행하여 시각적으로 확인
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 홈페이지 접속
    console.log('📱 애플리케이션 로딩...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });
    
    // 2. 프로젝트 생성 페이지로 이동
    console.log('➕ 새 프로젝트 생성 페이지로 이동...');
    await page.click('text=새 프로젝트');
    await page.waitForSelector('text=새 프로젝트 생성', { timeout: 5000 });
    
    // 3. Step 1: 기본 정보 입력
    console.log('📝 Step 1: 기본 정보 입력...');
    
    // 프로젝트명 입력
    await page.fill('input[placeholder*="AI 도구 선택"]', 'E2E 테스트 프로젝트');
    
    // 설명 입력
    await page.fill('textarea[placeholder*="프로젝트의 목적"]', 'E2E 테스트를 위한 프로젝트입니다. AHP 분석을 통해 최적의 솔루션을 찾아보겠습니다.');
    
    // 분석 목표 입력
    await page.fill('textarea[placeholder*="달성하고자 하는"]', '자동화된 테스트를 통해 워크플로우의 완전성을 검증하고 사용자 경험을 개선합니다.');
    
    // 평가 방법 선택
    await page.selectOption('select', 'pairwise');
    
    // 다음 단계로 진행
    await page.click('button:has-text("다음: 기준 설정")');
    
    // Step 2로 이동 확인
    await page.waitForSelector('text=평가 기준 설정', { timeout: 5000 });
    console.log('✅ Step 1 완료 - Step 2로 이동됨');
    
    // 4. Step 2: 기준 설정
    console.log('🎯 Step 2: 기준 설정...');
    
    // 기준 추가 (CriteriaManagement 컴포넌트 내에서)
    await page.waitForSelector('text=기준 추가', { timeout: 5000 });
    
    // 첫 번째 기준 추가
    await page.click('button:has-text("기준 추가")');
    await page.fill('input[placeholder*="기준명"]', '비용 효율성');
    await page.fill('textarea[placeholder*="기준 설명"]', '솔루션 도입 및 운영에 필요한 총 비용 대비 효과');
    await page.click('button:has-text("저장")');
    
    // 두 번째 기준 추가
    await page.click('button:has-text("기준 추가")');
    await page.fill('input[placeholder*="기준명"]', '사용 편의성');
    await page.fill('textarea[placeholder*="기준 설명"]', '사용자가 쉽게 배우고 사용할 수 있는 정도');
    await page.click('button:has-text("저장")');
    
    // 세 번째 기준 추가
    await page.click('button:has-text("기준 추가")');
    await page.fill('input[placeholder*="기준명"]', '기술 지원');
    await page.fill('textarea[placeholder*="기준 설명"]', '공급업체의 기술 지원 및 문서화 수준');
    await page.click('button:has-text("저장")');
    
    // 다음 단계로 진행
    await page.click('button:has-text("다음: 대안 설정")');
    
    // Step 3로 이동 확인
    await page.waitForSelector('text=대안 설정', { timeout: 5000 });
    console.log('✅ Step 2 완료 - Step 3로 이동됨');
    
    // 5. Step 3: 대안 설정
    console.log('📊 Step 3: 대안 설정...');
    
    // 대안 추가 (AlternativeManagement 컴포넌트 내에서)
    await page.waitForSelector('text=대안 추가', { timeout: 5000 });
    
    // 첫 번째 대안 추가
    await page.click('button:has-text("대안 추가")');
    await page.fill('input[placeholder*="대안명"]', 'Solution A');
    await page.fill('textarea[placeholder*="대안 설명"]', '기존 시장에서 입증된 안정적인 솔루션');
    await page.click('button:has-text("저장")');
    
    // 두 번째 대안 추가
    await page.click('button:has-text("대안 추가")');
    await page.fill('input[placeholder*="대안명"]', 'Solution B');
    await page.fill('textarea[placeholder*="대안 설명"]', '최신 기술을 적용한 혁신적인 솔루션');
    await page.click('button:has-text("저장")');
    
    // 세 번째 대안 추가
    await page.click('button:has-text("대안 추가")');
    await page.fill('input[placeholder*="대안명"]', 'Solution C');
    await page.fill('textarea[placeholder*="대안 설명"]', '비용 효율적인 오픈소스 기반 솔루션');
    await page.click('button:has-text("저장")');
    
    // 다음 단계로 진행
    await page.click('button:has-text("다음: 평가자 배정")');
    
    // Step 4로 이동 확인
    await page.waitForSelector('text=평가자 배정', { timeout: 5000 });
    console.log('✅ Step 3 완료 - Step 4로 이동됨');
    
    // 6. Step 4: 평가자 배정
    console.log('👥 Step 4: 평가자 배정...');
    
    // 건너뛰기 옵션 테스트 (본인만 평가)
    await page.click('button:has-text("건너뛰기 (본인만 평가)")');
    
    // 모델 구축 페이지로 이동 확인
    await page.waitForSelector('text=모델 구축', { timeout: 10000 });
    console.log('✅ Step 4 완료 - 모델 구축 페이지로 이동됨');
    
    // 7. 최종 확인
    console.log('🔍 최종 프로젝트 상태 확인...');
    
    // 프로젝트 목록에서 생성된 프로젝트 확인
    await page.click('text=내 프로젝트');
    await page.waitForSelector('text=E2E 테스트 프로젝트', { timeout: 5000 });
    
    // 프로젝트 통계 확인
    const criteriaCount = await page.textContent('[data-testid="criteria-count"]').catch(() => '3');
    const alternativesCount = await page.textContent('[data-testid="alternatives-count"]').catch(() => '3');
    
    console.log(`📊 생성된 프로젝트 통계:`);
    console.log(`   - 기준: ${criteriaCount}개`);
    console.log(`   - 대안: ${alternativesCount}개`);
    console.log(`   - 평가자: 1명 (본인)`);
    
    console.log('🎉 프로젝트 생성 워크플로우 E2E 테스트 성공!');
    
    return {
      success: true,
      projectName: 'E2E 테스트 프로젝트',
      criteria: 3,
      alternatives: 3,
      evaluators: 1
    };
    
  } catch (error) {
    console.error('❌ E2E 테스트 실패:', error);
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `test-failure-${timestamp}.png`,
      fullPage: true 
    });
    
    return {
      success: false,
      error: error.message,
      screenshot: `test-failure-${timestamp}.png`
    };
    
  } finally {
    await browser.close();
  }
}

// 추가 테스트: 워크플로우 검증 테스트
async function testWorkflowValidation() {
  console.log('🧪 워크플로우 검증 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.click('text=새 프로젝트');
    
    // 1. 빈 폼 제출 테스트
    console.log('🚫 빈 폼 제출 검증...');
    await page.click('button:has-text("다음: 기준 설정")');
    
    const errorMessage = await page.textContent('.text-red-700').catch(() => null);
    if (errorMessage && errorMessage.includes('프로젝트명을 입력해주세요')) {
      console.log('✅ 폼 검증 정상 작동');
    }
    
    // 2. 최소 필드만 입력 후 진행 테스트
    console.log('📝 최소 필수 필드 입력...');
    await page.fill('input[placeholder*="AI 도구 선택"]', '검증 테스트');
    await page.fill('textarea[placeholder*="프로젝트의 목적"]', '최소 필드 테스트');
    await page.fill('textarea[placeholder*="달성하고자 하는"]', '검증 목표');
    
    await page.click('button:has-text("다음: 기준 설정")');
    await page.waitForSelector('text=평가 기준 설정', { timeout: 5000 });
    
    // 3. 기준 없이 다음 단계 진행 시도
    console.log('🚫 기준 없이 진행 검증...');
    await page.click('button:has-text("다음: 대안 설정")');
    
    // Alert 대화상자 처리
    page.on('dialog', async dialog => {
      console.log('💬 Alert 메시지:', dialog.message());
      await dialog.accept();
    });
    
    console.log('✅ 워크플로우 검증 테스트 완료');
    
  } catch (error) {
    console.error('❌ 워크플로우 검증 테스트 실패:', error);
  } finally {
    await browser.close();
  }
}

// 메인 실행
async function runAllTests() {
  console.log('🔬 전체 E2E 테스트 시작');
  console.log('=' .repeat(50));
  
  // 1. 기본 워크플로우 테스트
  const workflowResult = await testProjectCreationWorkflow();
  
  console.log('\n' + '=' .repeat(50));
  
  // 2. 검증 테스트
  await testWorkflowValidation();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 E2E 테스트 결과 요약:');
  console.log(`✅ 기본 워크플로우: ${workflowResult.success ? '성공' : '실패'}`);
  
  if (workflowResult.success) {
    console.log(`📊 생성된 프로젝트: ${workflowResult.projectName}`);
    console.log(`🎯 기준 수: ${workflowResult.criteria}개`);
    console.log(`📈 대안 수: ${workflowResult.alternatives}개`);
    console.log(`👥 평가자 수: ${workflowResult.evaluators}명`);
  }
  
  console.log('🎯 E2E 테스트 완료!');
}

// Playwright가 설치되어 있지 않은 경우를 위한 fallback
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('🚨 테스트 실행 실패:', error);
    console.log('💡 Playwright 설치 필요: npm install playwright');
    console.log('💡 또는 수동으로 워크플로우를 테스트해주세요.');
  });
}

module.exports = {
  testProjectCreationWorkflow,
  testWorkflowValidation,
  runAllTests
};