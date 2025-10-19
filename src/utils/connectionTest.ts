/**
 * Frontend ↔ Backend 연동 테스트 유틸리티
 * 분리된 Repository 구조에서 API 연결 상태 확인
 */

import { API_BASE_URL } from '../config/api';

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

class ConnectionTester {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * 1. 백엔드 기본 연결 테스트
   */
  async testBasicConnection(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 백엔드 기본 연결 테스트 시작...');
      console.log('🎯 Target URL:', this.baseUrl);

      const response = await fetch(`${this.baseUrl}/health/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: '✅ 백엔드 연결 성공',
          details: { status: data.status, url: this.baseUrl },
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: `❌ 백엔드 응답 오류: ${response.status}`,
          details: { status: response.status, statusText: response.statusText },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ 백엔드 연결 실패',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 2. API 엔드포인트 테스트
   */
  async testApiEndpoints(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 API 엔드포인트 테스트 시작...');

      const endpoints = [
        '/api/v1/projects/',
        '/api/service/auth/profile/', 
        '/health/',
        '/api/service/auth/social/naver/',
        '/api/service/auth/social/google/',
        '/api/service/auth/social/kakao/',
        '/db-status/',
        '/test-deploy/'
      ];

      const results = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });

          results.push({
            endpoint,
            status: response.status,
            ok: response.ok,
            method: 'GET'
          });

        } catch (error) {
          results.push({
            endpoint,
            status: 'ERROR',
            error: error instanceof Error ? error.message : 'Unknown error',
            method: 'GET'
          });
        }
      }

      const successCount = results.filter(r => r.ok).length;
      
      return {
        success: successCount > 0,
        message: `📊 API 테스트 완료: ${successCount}/${results.length} 성공`,
        details: { results, baseUrl: this.baseUrl },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: '❌ API 엔드포인트 테스트 실패',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 3. 프로젝트 API 기본 테스트
   */
  async testProjectsApi(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 프로젝트 API 테스트 시작...');

      const response = await fetch(`${this.baseUrl}/api/v1/projects/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: '✅ 프로젝트 API 연동 성공',
          details: { 
            projectCount: Array.isArray(data) ? data.length : 0,
            sampleData: Array.isArray(data) ? data.slice(0, 2) : data
          },
          timestamp: new Date().toISOString()
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `❌ 프로젝트 API 오류: ${response.status}`,
          details: { status: response.status, error: errorText },
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      return {
        success: false,
        message: '❌ 프로젝트 API 연결 실패',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 4. 소셜 인증 엔드포인트 테스트
   */
  async testSocialAuthEndpoints(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 소셜 인증 엔드포인트 테스트 시작...');

      const socialEndpoints = [
        { name: 'Naver OAuth', endpoint: '/api/service/auth/social/naver/' },
        { name: 'Google OAuth', endpoint: '/api/service/auth/social/google/' },
        { name: 'Kakao OAuth', endpoint: '/api/service/auth/social/kakao/' }
      ];

      const results = [];

      for (const { name, endpoint } of socialEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });

          results.push({
            name,
            endpoint,
            status: response.status,
            ok: response.ok || response.status === 302, // OAuth는 리다이렉트 응답이 정상
            method: 'GET'
          });

        } catch (error) {
          results.push({
            name,
            endpoint,
            status: 'ERROR',
            error: error instanceof Error ? error.message : 'Unknown error',
            ok: false
          });
        }
      }

      const successCount = results.filter(r => r.ok).length;
      const totalCount = results.length;

      return {
        success: successCount > 0,
        message: `🔐 소셜 인증 테스트: ${successCount}/${totalCount} 성공`,
        details: { results, successRate: `${successCount}/${totalCount}` },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: '❌ 소셜 인증 테스트 실패',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 5. 데이터베이스 연결 테스트
   */
  async testDatabaseConnection(): Promise<ConnectionTestResult> {
    try {
      console.log('🔍 데이터베이스 연결 테스트 시작...');

      const response = await fetch(`${this.baseUrl}/db-status/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.connection === 'OK',
          message: data.connection === 'OK' ? '✅ 데이터베이스 연결 성공' : '❌ 데이터베이스 연결 실패',
          details: data,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: `❌ DB 상태 확인 오류: ${response.status}`,
          details: { status: response.status, statusText: response.statusText },
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      return {
        success: false,
        message: '❌ 데이터베이스 테스트 실패',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 4. 종합 연결 테스트 (모든 테스트 실행)
   */
  async runFullTest(): Promise<{
    overall: boolean;
    results: ConnectionTestResult[];
    summary: string;
  }> {
    console.log('🚀 Frontend ↔ Backend 종합 연동 테스트 시작...');
    console.log('=' .repeat(50));

    const results = [
      await this.testBasicConnection(),
      await this.testApiEndpoints(), 
      await this.testProjectsApi(),
      await this.testSocialAuthEndpoints(),
      await this.testDatabaseConnection()
    ];

    const successCount = results.filter(r => r.success).length;
    const overall = successCount === results.length;

    const summary = overall 
      ? `✅ 모든 테스트 통과 (${successCount}/${results.length})`
      : `⚠️ 일부 테스트 실패 (${successCount}/${results.length})`;

    console.log('=' .repeat(50));
    console.log('📊 연동 테스트 결과:', summary);

    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.message}`);
      if (result.details) {
        console.log('   세부사항:', result.details);
      }
    });

    return {
      overall,
      results,
      summary
    };
  }
}

// 싱글톤 인스턴스 생성
const connectionTester = new ConnectionTester();

export default connectionTester;
export { ConnectionTester };
export type { ConnectionTestResult };