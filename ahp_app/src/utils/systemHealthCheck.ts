/**
 * 시스템 전체 연동 상태 점검 유틸리티
 * Frontend → Backend → Database 연결 테스트
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'error';
  responseTime?: number;
  message?: string;
  details?: any;
}

class SystemHealthChecker {
  private results: HealthCheckResult[] = [];

  // 1. 프론트엔드 상태 점검
  async checkFrontend(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // React 앱 기본 상태 확인
      const _isReactApp = !!window.React || !!document.querySelector('#root');
      const buildInfo = {
        version: process.env.REACT_APP_VERSION || '1.0.0',
        buildTime: process.env.REACT_APP_BUILD_TIME || new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
      };

      return {
        component: 'Frontend (React)',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'React application is running',
        details: buildInfo
      };
    } catch (error) {
      return {
        component: 'Frontend (React)',
        status: 'error',
        message: `Frontend check failed: ${error}`
      };
    }
  }

  // 2. 백엔드 서버 상태 점검
  async checkBackendServer(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${API_BASE_URL}/health/`, {
        timeout: 5000,
        validateStatus: () => true
      });

      if (response.status === 200) {
        return {
          component: 'Backend Server (Django)',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          message: 'Django server is responding',
          details: response.data
        };
      } else {
        return {
          component: 'Backend Server (Django)',
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: `Server returned status ${response.status}`,
          details: response.data
        };
      }
    } catch (error: any) {
      return {
        component: 'Backend Server (Django)',
        status: 'error',
        message: `Cannot connect to backend: ${error.message}`,
        details: {
          url: API_BASE_URL,
          error: error.message
        }
      };
    }
  }

  // 3. 데이터베이스 연결 점검
  async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${API_BASE_URL}/db-status/`, {
        timeout: 5000,
        validateStatus: () => true
      });

      if (response.status === 200 && response.data) {
        return {
          component: 'Database (PostgreSQL)',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          message: 'Database connection is active',
          details: response.data
        };
      } else {
        return {
          component: 'Database (PostgreSQL)',
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: 'Database status check returned unexpected response',
          details: response.data
        };
      }
    } catch (error: any) {
      // 대체 방법: API를 통해 간접 확인
      try {
        const testResponse = await axios.get(`${API_BASE_URL}/api/v1/`, {
          timeout: 5000
        });
        
        if (testResponse.status === 200) {
          return {
            component: 'Database (PostgreSQL)',
            status: 'degraded',
            message: 'Database likely connected (indirect check)',
            responseTime: Date.now() - startTime,
            details: { indirect: true }
          };
        }
      } catch (innerError) {
        // 최종 실패
      }

      return {
        component: 'Database (PostgreSQL)',
        status: 'error',
        message: `Database check failed: ${error.message}`
      };
    }
  }

  // 4. API 엔드포인트 점검
  async checkAPIEndpoints(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const endpoints = [
      '/api/service/projects/',
      '/api/v1/',
      '/api/auth/token/verify/'
    ];

    const results: any[] = [];
    let healthyCount = 0;
    let _totalTime = 0;

    for (const endpoint of endpoints) {
      try {
        const endpointStart = Date.now();
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          timeout: 3000,
          validateStatus: () => true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const responseTime = Date.now() - endpointStart;
        _totalTime += responseTime;

        const isHealthy = response.status < 500;
        if (isHealthy) healthyCount++;

        results.push({
          endpoint,
          status: response.status,
          responseTime,
          healthy: isHealthy
        });
      } catch (error: any) {
        results.push({
          endpoint,
          status: 0,
          error: error.message,
          healthy: false
        });
      }
    }

    const overallHealth = healthyCount === endpoints.length ? 'healthy' :
                          healthyCount > 0 ? 'degraded' : 'error';

    return {
      component: 'API Endpoints',
      status: overallHealth,
      responseTime: Date.now() - startTime,
      message: `${healthyCount}/${endpoints.length} endpoints responding`,
      details: results
    };
  }

  // 5. CORS 설정 점검
  async checkCORS(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const response = await axios.options(`${API_BASE_URL}/api/v1/`, {
        timeout: 5000,
        validateStatus: () => true
      });

      const headers = response.headers;
      const corsHeaders = {
        'access-control-allow-origin': headers['access-control-allow-origin'],
        'access-control-allow-methods': headers['access-control-allow-methods'],
        'access-control-allow-headers': headers['access-control-allow-headers']
      };

      const hasProperCORS = corsHeaders['access-control-allow-origin'] !== undefined;

      return {
        component: 'CORS Configuration',
        status: hasProperCORS ? 'healthy' : 'error',
        responseTime: Date.now() - startTime,
        message: hasProperCORS ? 'CORS properly configured' : 'CORS not configured',
        details: corsHeaders
      };
    } catch (error: any) {
      return {
        component: 'CORS Configuration',
        status: 'error',
        message: `CORS check failed: ${error.message}`
      };
    }
  }

  // 6. 인증 시스템 점검
  async checkAuthentication(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // 토큰 검증 엔드포인트 테스트
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/token/verify/`,
        { token: 'test-token' },
        {
          timeout: 5000,
          validateStatus: () => true
        }
      );

      // 401은 정상 (잘못된 토큰), 500대 에러는 문제
      const isHealthy = response.status < 500;

      return {
        component: 'Authentication System',
        status: isHealthy ? 'healthy' : 'error',
        responseTime: Date.now() - startTime,
        message: isHealthy ? 'Auth system is operational' : 'Auth system error',
        details: {
          endpoint: '/api/auth/token/verify/',
          status: response.status
        }
      };
    } catch (error: any) {
      return {
        component: 'Authentication System',
        status: 'error',
        message: `Auth check failed: ${error.message}`
      };
    }
  }

  // 전체 시스템 점검 실행
  async runFullHealthCheck(): Promise<{
    timestamp: string;
    overallStatus: 'healthy' | 'degraded' | 'error';
    results: HealthCheckResult[];
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      error: number;
    };
  }> {
    console.log('🔍 Starting system health check...');
    
    this.results = [];

    // 모든 점검 실행
    const checks = [
      this.checkFrontend(),
      this.checkBackendServer(),
      this.checkDatabase(),
      this.checkAPIEndpoints(),
      this.checkCORS(),
      this.checkAuthentication()
    ];

    const results = await Promise.all(checks);
    this.results = results;

    // 결과 집계
    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      error: results.filter(r => r.status === 'error').length
    };

    // 전체 상태 결정
    let overallStatus: 'healthy' | 'degraded' | 'error';
    if (summary.error > 0) {
      overallStatus = 'error';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const report = {
      timestamp: new Date().toISOString(),
      overallStatus,
      results,
      summary
    };

    // 콘솔에 결과 출력
    this.printReport(report);

    return report;
  }

  // 보고서 출력
  private printReport(report: any): void {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 SYSTEM HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Timestamp: ${report.timestamp}`);
    console.log(`📊 Overall Status: ${this.getStatusEmoji(report.overallStatus)} ${report.overallStatus.toUpperCase()}`);
    console.log('\n📈 Summary:');
    console.log(`  Total Checks: ${report.summary.total}`);
    console.log(`  ✅ Healthy: ${report.summary.healthy}`);
    console.log(`  ⚠️  Degraded: ${report.summary.degraded}`);
    console.log(`  ❌ Error: ${report.summary.error}`);
    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(60));
    
    report.results.forEach((result: HealthCheckResult) => {
      console.log(`\n${this.getStatusEmoji(result.status)} ${result.component}`);
      console.log(`  Status: ${result.status}`);
      if (result.responseTime) {
        console.log(`  Response Time: ${result.responseTime}ms`);
      }
      if (result.message) {
        console.log(`  Message: ${result.message}`);
      }
      if (result.details) {
        console.log(`  Details:`, result.details);
      }
    });
    
    console.log('\n' + '='.repeat(60));
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  }
}

// Export singleton instance
const healthChecker = new SystemHealthChecker();

export default healthChecker;

// Export for direct use
export const runSystemHealthCheck = () => healthChecker.runFullHealthCheck();