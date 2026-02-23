/**
 * 시스템 전체 연동 상태 점검 유틸리티
 * Frontend → Backend → Database 연결 테스트
 */

import { API_BASE_URL } from '../config/api';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'error';
  responseTime?: number;
  message?: string;
  details?: unknown;
}

interface HealthReport {
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'error';
  results: HealthCheckResult[];
  summary: { total: number; healthy: number; degraded: number; error: number };
}

// fetch with timeout helper
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

class SystemHealthChecker {
  private results: HealthCheckResult[] = [];

  // 1. 프론트엔드 상태 점검
  async checkFrontend(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
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
      const response = await fetchWithTimeout(`${API_BASE_URL}/health/`);

      if (response.ok) {
        const data = await response.json().catch(() => null);
        return {
          component: 'Backend Server (Django)',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          message: 'Django server is responding',
          details: data
        };
      } else {
        const data = await response.json().catch(() => null);
        return {
          component: 'Backend Server (Django)',
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: `Server returned status ${response.status}`,
          details: data
        };
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        component: 'Backend Server (Django)',
        status: 'error',
        message: `Cannot connect to backend: ${errMsg}`,
        details: {
          url: API_BASE_URL,
          error: errMsg
        }
      };
    }
  }

  // 3. 데이터베이스 연결 점검
  async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/db-status/`);

      if (response.ok) {
        const data = await response.json().catch(() => null);
        return {
          component: 'Database (PostgreSQL)',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          message: 'Database connection is active',
          details: data
        };
      } else {
        const data = await response.json().catch(() => null);
        return {
          component: 'Database (PostgreSQL)',
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: 'Database status check returned unexpected response',
          details: data
        };
      }
    } catch (error: unknown) {
      // 대체 방법: API를 통해 간접 확인
      try {
        const testResponse = await fetchWithTimeout(`${API_BASE_URL}/api/service/status/`);

        if (testResponse.ok) {
          return {
            component: 'Database (PostgreSQL)',
            status: 'degraded',
            message: 'Database likely connected (indirect check)',
            responseTime: Date.now() - startTime,
            details: { indirect: true }
          };
        }
      } catch {
        // 최종 실패
      }

      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        component: 'Database (PostgreSQL)',
        status: 'error',
        message: `Database check failed: ${errMsg}`
      };
    }
  }

  // 4. API 엔드포인트 점검
  async checkAPIEndpoints(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const endpoints = [
      '/api/service/projects/projects/',
      '/api/service/status/',
      '/api/service/auth/token/verify/'
    ];

    interface EndpointResult { endpoint: string; status: number; responseTime?: number; healthy: boolean; error?: string }
    const results: EndpointResult[] = [];
    let healthyCount = 0;

    for (const endpoint of endpoints) {
      try {
        const endpointStart = Date.now();
        const response = await fetchWithTimeout(
          `${API_BASE_URL}${endpoint}`,
          { headers: { 'Content-Type': 'application/json' } },
          3000
        );

        const responseTime = Date.now() - endpointStart;
        const isHealthy = response.status < 500;
        if (isHealthy) healthyCount++;

        results.push({
          endpoint,
          status: response.status,
          responseTime,
          healthy: isHealthy
        });
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        results.push({
          endpoint,
          status: 0,
          error: errMsg,
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
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/service/status/`,
        { method: 'OPTIONS' }
      );

      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      };

      const hasProperCORS = corsHeaders['access-control-allow-origin'] !== null;

      return {
        component: 'CORS Configuration',
        status: hasProperCORS ? 'healthy' : 'error',
        responseTime: Date.now() - startTime,
        message: hasProperCORS ? 'CORS properly configured' : 'CORS not configured',
        details: corsHeaders
      };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        component: 'CORS Configuration',
        status: 'error',
        message: `CORS check failed: ${errMsg}`
      };
    }
  }

  // 6. 인증 시스템 점검
  async checkAuthentication(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/auth/token/verify/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'test-token' })
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
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        component: 'Authentication System',
        status: 'error',
        message: `Auth check failed: ${errMsg}`
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
    console.log('Starting system health check...');

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
  private printReport(report: HealthReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('SYSTEM HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`\nSummary: Total=${report.summary.total} Healthy=${report.summary.healthy} Degraded=${report.summary.degraded} Error=${report.summary.error}`);

    report.results.forEach((result: HealthCheckResult) => {
      console.log(`\n[${result.status.toUpperCase()}] ${result.component}`);
      if (result.responseTime) {
        console.log(`  Response Time: ${result.responseTime}ms`);
      }
      if (result.message) {
        console.log(`  Message: ${result.message}`);
      }
    });

    console.log('\n' + '='.repeat(60));
  }
}

// Export singleton instance
const healthChecker = new SystemHealthChecker();

export default healthChecker;

// Export for direct use
export const runSystemHealthCheck = () => healthChecker.runFullHealthCheck();
