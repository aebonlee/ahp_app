/**
 * API 테스트 페이지
 * 전체 AHP API 시퀀스를 테스트할 수 있는 통합 테스트 페이지
 */

import React, { useState, useEffect } from 'react';
import AHPApiService from '../../services/ahpApiService';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  duration?: number;
}

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [projectId, setProjectId] = useState<number>(1);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const testApiSequence = async () => {
    setIsRunning(true);
    setTestResults([]);

    const steps = [
      'Health Check',
      'Matrix Elements 조회',
      'Weight 계산',
      'Global Weight 계산',
      'Aggregation',
      'Export Test'
    ];

    // 단계별 테스트 초기화
    steps.forEach(step => {
      addTestResult({ step, status: 'pending' });
    });

    try {
      // 1. Health Check
      const startTime = Date.now();
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const healthData = await response.json();
        updateTestResult(0, {
          status: 'success',
          data: healthData,
          duration: Date.now() - startTime
        });
      } catch (error) {
        updateTestResult(0, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Health check failed',
          duration: Date.now() - startTime
        });
        return;
      }

      // 2. Matrix Elements 조회 테스트
      const step2Start = Date.now();
      try {
        const elements = await AHPApiService.getMatrixElements(projectId, 'criteria', 1);
        updateTestResult(1, {
          status: 'success',
          data: { elements, count: elements.length },
          duration: Date.now() - step2Start
        });
      } catch (error) {
        updateTestResult(1, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Matrix elements 조회 실패',
          duration: Date.now() - step2Start
        });
      }

      // 3. Weight 계산 테스트
      const step3Start = Date.now();
      try {
        const matrix = [
          [1, 3, 2],
          [1/3, 1, 1/2],
          [1/2, 2, 1]
        ];
        const weightResult = await AHPApiService.computeWeights(matrix, projectId, 'criteria:level1');
        updateTestResult(2, {
          status: 'success',
          data: weightResult,
          duration: Date.now() - step3Start
        });
      } catch (error) {
        updateTestResult(2, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Weight 계산 실패',
          duration: Date.now() - step3Start
        });
      }

      // 4. Global Weight 계산 테스트
      const step4Start = Date.now();
      try {
        const globalData = {
          projectId,
          criteriaWeights: { '1': 0.5, '2': 0.3, '3': 0.2 },
          alternativeWeights: {
            '1': { 'A1': 0.6, 'A2': 0.4 },
            '2': { 'A1': 0.3, 'A2': 0.7 },
            '3': { 'A1': 0.8, 'A2': 0.2 }
          }
        };
        const globalResult = await AHPApiService.computeGlobalWeights(globalData);
        updateTestResult(3, {
          status: 'success',
          data: globalResult,
          duration: Date.now() - step4Start
        });
      } catch (error) {
        updateTestResult(3, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Global weight 계산 실패',
          duration: Date.now() - step4Start
        });
      }

      // 5. Aggregation 테스트
      const step5Start = Date.now();
      try {
        const aggregationResult = await AHPApiService.aggregateResults(projectId, { '1': 1.0 });
        updateTestResult(4, {
          status: 'success',
          data: aggregationResult,
          duration: Date.now() - step5Start
        });
      } catch (error) {
        updateTestResult(4, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Aggregation 실패',
          duration: Date.now() - step5Start
        });
      }

      // 6. Export 테스트
      const step6Start = Date.now();
      try {
        const csvData = await AHPApiService.exportToCSV(projectId, 'ranking');
        updateTestResult(5, {
          status: 'success',
          data: { csvLength: csvData.length, preview: csvData.substring(0, 100) },
          duration: Date.now() - step6Start
        });
      } catch (error) {
        updateTestResult(5, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Export 실패',
          duration: Date.now() - step6Start
        });
      }

    } catch (error) {
      console.error('Test sequence failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullWorkflow = async () => {
    setIsRunning(true);
    try {
      const result = await AHPApiService.executeFullWorkflow(projectId);
      addTestResult({
        step: 'Full Workflow',
        status: 'success',
        data: result
      });
    } catch (error) {
      addTestResult({
        step: 'Full Workflow',
        status: 'error',
        error: error instanceof Error ? error.message : 'Workflow 실행 실패'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 AHP API 테스트 페이지</h1>
        <p className="text-gray-600 mb-6">
          전체 AHP API 시퀀스를 테스트하고 백엔드 연동을 확인합니다.
        </p>

        {/* 컨트롤 패널 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <input
                type="number"
                value={projectId}
                onChange={(e) => setProjectId(parseInt(e.target.value) || 1)}
                className="px-3 py-2 border border-gray-300 rounded-md w-24"
                min="1"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={testApiSequence}
                disabled={isRunning}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? '🔄 테스트 중...' : '🚀 API 시퀀스 테스트'}
              </button>
              <button
                onClick={runFullWorkflow}
                disabled={isRunning}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? '🔄 실행 중...' : '⚡ 전체 워크플로우'}
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <strong>참고:</strong> 백엔드 서버가 http://localhost:5000에서 실행 중이어야 합니다.
          </div>
        </div>

        {/* 테스트 결과 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📋 테스트 결과</h2>
          </div>
          
          <div className="p-6">
            {testResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                위의 버튼을 클릭하여 API 테스트를 시작하세요.
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      result.status === 'success' ? 'border-green-200' :
                      result.status === 'error' ? 'border-red-200' : 'border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getStatusIcon(result.status)}</span>
                        <span className="font-medium text-gray-900">{result.step}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                      {result.duration && (
                        <span className="text-sm text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                    
                    {result.error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="text-sm text-gray-700 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API 엔드포인트 정보 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📡 테스트되는 API 엔드포인트</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800">GET /api/health</div>
              <div className="text-blue-600">서버 상태 확인</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">GET /api/matrix/:projectId</div>
              <div className="text-blue-600">비교 항목 조회</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">POST /api/compute/weights</div>
              <div className="text-blue-600">가중치 계산</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">POST /api/compute/global</div>
              <div className="text-blue-600">글로벌 가중치</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">POST /api/aggregate</div>
              <div className="text-blue-600">결과 집계</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">GET /api/export/csv/:projectId</div>
              <div className="text-blue-600">CSV 내보내기</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;