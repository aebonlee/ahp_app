import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import healthChecker from '../utils/systemHealthCheck';

interface HealthResult {
  component: string;
  status: 'healthy' | 'degraded' | 'error';
  responseTime?: number;
  message?: string;
  details?: any;
}

const SystemHealthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [healthReport, setHealthReport] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };

  useEffect(() => {
    // 초기 점검 실행
    runHealthCheck();
  }, []);

  useEffect(() => {
    if (autoRefresh && !loading) {
      const interval = setInterval(() => {
        runHealthCheck();
      }, 30000); // 30초마다 자동 점검

      return () => clearInterval(interval);
    }
  }, [autoRefresh, loading]);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const report = await healthChecker.runFullHealthCheck();
      setHealthReport(report);
    } catch (error) {
      showActionMessage('error', '시스템 점검에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 시스템 상태 점검
          </h1>
          <p className="text-gray-600">
            프론트엔드, 백엔드, 데이터베이스 연동 상태를 점검합니다.
          </p>
        </div>

        {/* Control Panel */}
        <Card title="제어판" className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={runHealthCheck}
                disabled={loading}
              >
                {loading ? '점검 중...' : '시스템 점검 실행'}
              </Button>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                30초마다 자동 점검
              </label>
            </div>
            {healthReport && (
              <div className="text-sm text-gray-600">
                마지막 점검: {new Date(healthReport.timestamp).toLocaleString('ko-KR')}
              </div>
            )}
          </div>
        </Card>

        {/* Overall Status */}
        {healthReport && (
          <Card title="전체 상태" className="mb-6">
            <div className={`text-center p-8 rounded-lg bg-${getStatusColor(healthReport.overallStatus)}-50 border-2 border-${getStatusColor(healthReport.overallStatus)}-200`}>
              <div className="text-5xl mb-4">
                {getStatusEmoji(healthReport.overallStatus)}
              </div>
              <div className={`text-2xl font-bold text-${getStatusColor(healthReport.overallStatus)}-700`}>
                {healthReport.overallStatus.toUpperCase()}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {healthReport.summary.healthy}
                  </div>
                  <div className="text-sm text-gray-600">정상</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {healthReport.summary.degraded}
                  </div>
                  <div className="text-sm text-gray-600">부분 장애</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {healthReport.summary.error}
                  </div>
                  <div className="text-sm text-gray-600">오류</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Results */}
        {healthReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthReport.results.map((result: HealthResult, index: number) => (
              <Card key={index} title={result.component}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getStatusEmoji(result.status)}
                      </span>
                      <span className={`font-bold text-${getStatusColor(result.status)}-600`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    {result.responseTime && (
                      <span className="text-sm text-gray-600">
                        {result.responseTime}ms
                      </span>
                    )}
                  </div>
                  
                  {result.message && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {result.message}
                    </div>
                  )}
                  
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        상세 정보 보기
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔄</div>
            <div className="text-lg text-gray-600">시스템 점검 중...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealthPage;