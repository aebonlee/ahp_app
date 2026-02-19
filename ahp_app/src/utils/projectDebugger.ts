/**
 * 프로젝트 생성 디버깅 유틸리티
 * API 요청/응답 상세 로깅 및 문제 진단
 */

import { API_BASE_URL } from '../config/api';
import authService from '../services/authService';

interface DebugInfo {
  timestamp: string;
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

class ProjectCreationDebugger {
  private debugLog: DebugInfo[] = [];
  private isEnabled: boolean = true;

  enable() {
    this.isEnabled = true;
    console.log('🔍 프로젝트 생성 디버거 활성화됨');
  }

  disable() {
    this.isEnabled = false;
  }

  private log(step: string, status: DebugInfo['status'], message: string, data?: any) {
    if (!this.isEnabled) return;

    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      step,
      status,
      message,
      data
    };

    this.debugLog.push(info);

    // 콘솔에도 출력
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
    console.log(`${emoji} [${step}] ${message}`, data || '');
  }

  clearLog() {
    this.debugLog = [];
  }

  getLog() {
    return [...this.debugLog];
  }

  // 1. 인증 상태 확인
  async checkAuthStatus() {
    this.log('AUTH_CHECK', 'success', '인증 상태 확인 시작');

    try {
      const token = authService.getAccessToken();
      
      if (!token) {
        this.log('AUTH_CHECK', 'error', '인증 토큰이 없습니다');
        return { isAuthenticated: false, error: 'No token' };
      }

      this.log('AUTH_CHECK', 'success', '토큰 발견', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...'
      });

      // 토큰 유효성 검증
      const response = await fetch(`${API_BASE_URL}/api/auth/token/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        this.log('AUTH_CHECK', 'success', '토큰 유효성 확인됨');
        return { isAuthenticated: true, token };
      } else {
        this.log('AUTH_CHECK', 'error', '토큰이 유효하지 않음', {
          status: response.status,
          statusText: response.statusText
        });
        return { isAuthenticated: false, error: 'Invalid token' };
      }
    } catch (error) {
      this.log('AUTH_CHECK', 'error', '인증 확인 실패', error);
      return { isAuthenticated: false, error };
    }
  }

  // 2. API 연결 테스트
  async testAPIConnection() {
    this.log('API_TEST', 'success', 'API 연결 테스트 시작');

    try {
      const response = await fetch(`${API_BASE_URL}/api/service/status/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.log('API_TEST', 'success', 'API 연결 성공', {
          status: response.status,
          apiVersion: data.version || 'unknown'
        });
        return { connected: true, data };
      } else {
        this.log('API_TEST', 'error', 'API 응답 오류', {
          status: response.status,
          statusText: response.statusText
        });
        return { connected: false, status: response.status };
      }
    } catch (error) {
      this.log('API_TEST', 'error', 'API 연결 실패', error);
      return { connected: false, error };
    }
  }

  // 3. 프로젝트 생성 요청 디버깅
  async debugProjectCreation(projectData: any) {
    this.clearLog();
    this.log('START', 'success', '프로젝트 생성 디버깅 시작', projectData);

    // Step 1: 인증 확인
    const authResult = await this.checkAuthStatus();
    if (!authResult.isAuthenticated) {
      this.log('ABORT', 'error', '인증 실패로 중단됨');
      return this.generateReport();
    }

    // Step 2: API 연결 테스트
    const apiTest = await this.testAPIConnection();
    if (!apiTest.connected) {
      this.log('ABORT', 'error', 'API 연결 실패로 중단됨');
      return this.generateReport();
    }

    // Step 3: 실제 프로젝트 생성 시도
    this.log('CREATE_REQUEST', 'success', '프로젝트 생성 요청 준비');

    const requestBody = {
      title: projectData.title || 'Test Project',
      description: projectData.description || 'Test Description',
      objective: projectData.objective || 'Test Objective',
      status: 'draft', // Django 모델: draft, in_progress, completed, archived, deleted
      evaluation_mode: projectData.evaluation_mode || 'practical',
      workflow_stage: 'creating' // Django 모델: creating, waiting, evaluating, completed
    };

    this.log('CREATE_REQUEST', 'success', '요청 본문 준비됨', requestBody);

    try {
      const response = await fetch(`${API_BASE_URL}/api/service/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authResult.token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }

      if (response.ok) {
        this.log('CREATE_REQUEST', 'success', '프로젝트 생성 성공', {
          status: response.status,
          data: responseData
        });
      } else {
        this.log('CREATE_REQUEST', 'error', '프로젝트 생성 실패', {
          status: response.status,
          statusText: response.statusText,
          response: responseData
        });
      }

      return this.generateReport();
    } catch (error) {
      this.log('CREATE_REQUEST', 'error', '요청 중 예외 발생', error);
      return this.generateReport();
    }
  }

  // 4. CORS 헤더 확인
  async checkCORS() {
    this.log('CORS_CHECK', 'success', 'CORS 설정 확인 시작');

    try {
      const response = await fetch(`${API_BASE_URL}/api/service/projects/`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });

      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
        'access-control-allow-credentials': response.headers.get('access-control-allow-credentials')
      };

      this.log('CORS_CHECK', 'success', 'CORS 헤더 수신', corsHeaders);

      const isValid = corsHeaders['access-control-allow-origin'] !== null;
      
      if (isValid) {
        this.log('CORS_CHECK', 'success', 'CORS 설정 유효함');
      } else {
        this.log('CORS_CHECK', 'error', 'CORS 설정 문제 발견');
      }

      return corsHeaders;
    } catch (error) {
      this.log('CORS_CHECK', 'error', 'CORS 확인 실패', error);
      return null;
    }
  }

  // 보고서 생성
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.debugLog.length,
        success: this.debugLog.filter(l => l.status === 'success').length,
        error: this.debugLog.filter(l => l.status === 'error').length,
        warning: this.debugLog.filter(l => l.status === 'warning').length
      },
      log: this.debugLog
    };

    console.log('\n' + '='.repeat(60));
    console.log('📋 프로젝트 생성 디버그 보고서');
    console.log('='.repeat(60));
    console.log(`총 단계: ${report.summary.total}`);
    console.log(`✅ 성공: ${report.summary.success}`);
    console.log(`❌ 실패: ${report.summary.error}`);
    console.log(`⚠️  경고: ${report.summary.warning}`);
    console.log('-'.repeat(60));

    this.debugLog.forEach(entry => {
      const emoji = entry.status === 'success' ? '✅' : 
                   entry.status === 'error' ? '❌' : '⚠️';
      console.log(`${emoji} [${entry.step}] ${entry.message}`);
      if (entry.data) {
        console.log('   데이터:', entry.data);
      }
    });

    console.log('='.repeat(60));

    return report;
  }

  // 빠른 진단
  async quickDiagnose() {
    console.log('🔍 프로젝트 생성 문제 빠른 진단 시작...\n');

    // 1. 인증 확인
    const auth = await this.checkAuthStatus();
    console.log(`1. 인증 상태: ${auth.isAuthenticated ? '✅ 정상' : '❌ 문제'}`);

    // 2. API 연결
    const api = await this.testAPIConnection();
    console.log(`2. API 연결: ${api.connected ? '✅ 정상' : '❌ 문제'}`);

    // 3. CORS 설정
    const cors = await this.checkCORS();
    console.log(`3. CORS 설정: ${cors ? '✅ 정상' : '❌ 문제'}`);

    // 4. 테스트 프로젝트 생성
    const testProject = {
      title: `테스트 프로젝트 ${Date.now()}`,
      description: '디버깅용 테스트',
      objective: '문제 진단'
    };

    console.log('\n4. 테스트 프로젝트 생성 시도...');
    const result = await this.debugProjectCreation(testProject);

    // 진단 결과
    console.log('\n' + '='.repeat(60));
    console.log('🏥 진단 결과:');
    
    const problems = [];
    if (!auth.isAuthenticated) problems.push('인증 문제');
    if (!api.connected) problems.push('API 연결 문제');
    if (!cors) problems.push('CORS 설정 문제');

    if (problems.length === 0) {
      const hasError = result.summary.error > 0;
      if (hasError) {
        console.log('❌ 프로젝트 생성 로직에 문제가 있습니다.');
        console.log('상세 로그를 확인하세요.');
      } else {
        console.log('✅ 모든 시스템이 정상입니다.');
      }
    } else {
      console.log(`❌ 발견된 문제: ${problems.join(', ')}`);
    }

    console.log('='.repeat(60));

    return {
      auth: auth.isAuthenticated,
      api: api.connected,
      cors: !!cors,
      problems
    };
  }
}

// Singleton 인스턴스
const projectDebugger = new ProjectCreationDebugger();

// 개발 환경에서만 전역 객체에 등록 (브라우저 콘솔에서 사용 가능)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).projectDebugger = projectDebugger;
}

export default projectDebugger;