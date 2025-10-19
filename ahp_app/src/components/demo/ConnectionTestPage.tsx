import React, { useState, useEffect } from 'react';
import connectionTester, { ConnectionTestResult } from '../../utils/connectionTest';
import { API_BASE_URL } from '../../config/api';

const ConnectionTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<boolean | null>(null);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    runQuickTest();
  }, []);

  const runQuickTest = async () => {
    setIsLoading(true);
    try {
      const basicResult = await connectionTester.testBasicConnection();
      setTestResults([basicResult]);
      setOverallStatus(basicResult.success);
      setSummary(basicResult.message);
    } catch (error) {
      console.error('연결 테스트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    try {
      const { overall, results, summary: testSummary } = await connectionTester.runFullTest();
      setTestResults(results);
      setOverallStatus(overall);
      setSummary(testSummary);
    } catch (error) {
      console.error('전체 테스트 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (success: boolean) => ({
    color: success ? '#10B981' : '#EF4444',
    backgroundColor: success ? '#ECFDF5' : '#FEF2F2',
    borderColor: success ? '#10B981' : '#EF4444'
  });

  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🔌 Frontend ↔ Backend 연동 테스트
        </h1>
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong>Frontend Repository:</strong> https://github.com/aebonlee/ahp_app<br/>
            <strong>Backend Repository:</strong> https://github.com/aebonlee/ahp-django-backend<br/>
            <strong>Backend URL:</strong> {API_BASE_URL}
          </p>
        </div>
      </div>

      {overallStatus !== null && (
        <div 
          className="p-6 rounded-lg mb-6 border-2"
          style={getStatusStyle(overallStatus)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon(overallStatus)}</span>
              <div>
                <h2 className="text-xl font-bold">연동 상태</h2>
                <p className="text-sm">{summary}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">
                마지막 테스트: {new Date().toLocaleTimeString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4 mb-6">
        <button
          onClick={runQuickTest}
          disabled={isLoading}
          className="px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '🔄 테스트 중...' : '⚡ 빠른 테스트'}
        </button>
        
        <button
          onClick={runFullTest}
          disabled={isLoading}
          className="px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--accent-secondary)',
            color: 'white',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '🔄 테스트 중...' : '🔍 전체 테스트'}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          📊 테스트 결과
        </h3>
        
        {testResults.length === 0 ? (
          <div 
            className="p-6 rounded-lg text-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <p style={{ color: 'var(--text-muted)' }}>
              테스트를 실행하면 결과가 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          testResults.map((result, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: result.success ? 'var(--bg-success)' : 'var(--bg-error)',
                borderColor: result.success ? 'var(--border-success)' : 'var(--border-error)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getStatusIcon(result.success)}</span>
                    <span className="font-medium">{result.message}</span>
                  </div>
                  
                  {result.details && (
                    <div 
                      className="p-3 rounded text-xs font-mono"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
                
                <div className="text-xs opacity-75 ml-4">
                  {new Date(result.timestamp).toLocaleTimeString('ko-KR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🔧 연동 문제 해결 가이드
        </h3>
        
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div>
            <strong>1. CORS 오류 발생 시:</strong><br/>
            Backend의 settings.py에서 CORS_ALLOWED_ORIGINS 확인
          </div>
          
          <div>
            <strong>2. 404 오류 발생 시:</strong><br/>
            Backend URL과 API 엔드포인트 경로 확인
          </div>
          
          <div>
            <strong>3. 네트워크 오류 발생 시:</strong><br/>
            Render.com Backend 서비스 상태 확인
          </div>
          
          <div>
            <strong>4. 인증 오류 발생 시:</strong><br/>
            JWT 토큰 설정 및 쿠키 정책 확인
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTestPage;