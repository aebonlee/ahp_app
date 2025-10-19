/**
 * GitHub Pages와 Django 백엔드 연동 테스트 유틸리티
 * 실제 배포된 환경에서 API 연동을 검증
 */

const BACKEND_URL = 'https://ahp-django-backend.onrender.com';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export class BackendIntegrationTest {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Django 백엔드 연동 테스트 시작');
    
    this.results = [];
    
    // 1. 백엔드 연결 테스트
    await this.testBackendConnection();
    
    // 2. 서비스 상태 테스트
    await this.testServiceStatus();
    
    // 3. 로그인 테스트
    await this.testLogin();
    
    // 4. 프로젝트 API 테스트
    await this.testProjectAPI();
    
    // 5. 데이터 저장 테스트
    await this.testDataStorage();
    
    console.log('📊 테스트 완료 결과:', this.results);
    return this.results;
  }

  private async testBackendConnection(): Promise<void> {
    try {
      const response = await fetch(BACKEND_URL);
      const data = await response.json();
      
      if (response.ok && data.status === 'SUCCESS') {
        this.addResult('백엔드 연결', 'success', '✅ Django 백엔드 연결 성공', data);
      } else {
        this.addResult('백엔드 연결', 'error', '❌ 백엔드 응답 오류', data);
      }
    } catch (error: any) {
      this.addResult('백엔드 연결', 'error', `❌ 연결 실패: ${error.message}`);
    }
  }

  private async testServiceStatus(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/service/status/`);
      const data = await response.json();
      
      if (response.ok && data.status === 'SUCCESS') {
        this.addResult('서비스 상태', 'success', '✅ 서비스 상태 정상', data);
      } else {
        this.addResult('서비스 상태', 'error', '❌ 서비스 상태 오류', data);
      }
    } catch (error: any) {
      this.addResult('서비스 상태', 'error', `❌ 상태 확인 실패: ${error.message}`);
    }
  }

  private async testLogin(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'ahp2025admin'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.addResult('로그인 테스트', 'success', '✅ 로그인 성공', data);
      } else {
        this.addResult('로그인 테스트', 'error', `❌ 로그인 실패: ${data.message}`, data);
      }
    } catch (error: any) {
      this.addResult('로그인 테스트', 'error', `❌ 로그인 요청 실패: ${error.message}`);
    }
  }

  private async testProjectAPI(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/service/projects/`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addResult('프로젝트 API', 'success', '✅ 프로젝트 API 접근 성공', {
          projectCount: data.length || 0,
          data: data
        });
      } else {
        this.addResult('프로젝트 API', 'error', `❌ 프로젝트 API 오류: ${response.status}`, {
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error: any) {
      this.addResult('프로젝트 API', 'error', `❌ 프로젝트 API 요청 실패: ${error.message}`);
    }
  }

  private async testDataStorage(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/service/data/`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addResult('데이터 저장 API', 'success', '✅ 데이터 저장 API 접근 성공', {
          dataCount: data.length || 0,
          data: data
        });
      } else {
        this.addResult('데이터 저장 API', 'error', `❌ 데이터 저장 API 오류: ${response.status}`, {
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error: any) {
      this.addResult('데이터 저장 API', 'error', `❌ 데이터 저장 API 요청 실패: ${error.message}`);
    }
  }

  private addResult(name: string, status: 'success' | 'error', message: string, data?: any): void {
    this.results.push({
      name,
      status,
      message,
      data
    });
  }

  getSuccessCount(): number {
    return this.results.filter(r => r.status === 'success').length;
  }

  getErrorCount(): number {
    return this.results.filter(r => r.status === 'error').length;
  }

  getTotalCount(): number {
    return this.results.length;
  }

  getSuccessRate(): number {
    return (this.getSuccessCount() / this.getTotalCount()) * 100;
  }

  generateReport(): string {
    const successCount = this.getSuccessCount();
    const errorCount = this.getErrorCount();
    const totalCount = this.getTotalCount();
    const successRate = this.getSuccessRate();

    let report = `
🔍 Django 백엔드 연동 테스트 결과 보고서
=========================================

📊 전체 결과:
- 총 테스트: ${totalCount}개
- 성공: ${successCount}개 ✅
- 실패: ${errorCount}개 ❌
- 성공률: ${successRate.toFixed(1)}%

📋 상세 결과:
`;

    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      report += `${icon} ${result.name}: ${result.message}\n`;
    });

    return report;
  }
}

// GitHub Pages에서 사용할 전역 테스트 함수
export const testBackendIntegration = async (): Promise<TestResult[]> => {
  const tester = new BackendIntegrationTest();
  const results = await tester.runAllTests();
  
  console.log('📋 테스트 보고서:');
  console.log(tester.generateReport());
  
  // GitHub Pages 콘솔에서 결과 확인 가능
  (window as any).backendTestResults = {
    results,
    report: tester.generateReport(),
    successRate: tester.getSuccessRate()
  };
  
  return results;
};

// 브라우저 콘솔에서 직접 호출 가능한 함수 등록
if (typeof window !== 'undefined') {
  (window as any).testBackend = testBackendIntegration;
}