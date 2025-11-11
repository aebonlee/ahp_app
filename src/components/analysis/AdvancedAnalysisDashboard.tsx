// 고급 분석 대시보드 메인 컴포넌트
// Opus 4.1 설계 기반

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import SensitivityAnalysisDashboard from './SensitivityAnalysisDashboard';
import ScenarioAnalysisTools from './ScenarioAnalysisTools';
import AIResultInterpretation from './AIResultInterpretation';
import type {
  ComprehensiveAnalysisResults,
  SensitivityAnalysisResult,
  MonteCarloResults,
  ScenarioSimulationResults,
  AnalysisStatus,
  AnalysisProgress,
  AnalysisConfig
} from '../../types/analysis';

interface AdvancedAnalysisDashboardProps {
  projectId: string;
  onAnalysisComplete?: (results: ComprehensiveAnalysisResults) => void;
  onError?: (error: string) => void;
  autoSave?: boolean;
}

const AdvancedAnalysisDashboard: React.FC<AdvancedAnalysisDashboardProps> = ({
  projectId,
  onAnalysisComplete,
  onError,
  autoSave = true
}) => {
  // State 관리
  const [activeTab, setActiveTab] = useState<'overview' | 'sensitivity' | 'monte_carlo' | 'scenarios' | 'ai_insights'>('overview');
  const [analysisResults, setAnalysisResults] = useState<ComprehensiveAnalysisResults | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  
  // 분석 설정
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    enableParallelProcessing: true,
    maxIterations: 10000,
    convergenceThreshold: 0.001,
    cacheResults: true,
    exportFormats: ['pdf', 'excel']
  });

  // 개별 분석 결과
  const [sensitivityResults, setSensitivityResults] = useState<SensitivityAnalysisResult | null>(null);
  const [monteCarloResults, setMonteCarloResults] = useState<MonteCarloResults | null>(null);
  const [scenarioResults, setScenarioResults] = useState<ScenarioSimulationResults | null>(null);
  
  // 분석 상태 추적
  const [analysisStates, setAnalysisStates] = useState({
    sensitivity: 'idle' as AnalysisStatus,
    monteCarlo: 'idle' as AnalysisStatus,
    scenarios: 'idle' as AnalysisStatus,
    robustness: 'idle' as AnalysisStatus
  });

  // 종합 분석 실행
  const runComprehensiveAnalysis = useCallback(async () => {
    setStatus('loading');
    setProgress({ phase: '종합 분석 시작', progress: 0, message: '분석 파이프라인을 초기화하고 있습니다...' });

    try {
      const response = await fetch('/api/analysis/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          projectId,
          config: analysisConfig
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 종합 분석 요청 실패`);
      }

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'progress') {
                  setProgress(data.progress);
                  
                  // 개별 분석 상태 업데이트
                  if (data.analysisType) {
                    setAnalysisStates(prev => ({
                      ...prev,
                      [data.analysisType]: data.status
                    }));
                  }
                } else if (data.type === 'partial_result') {
                  // 개별 분석 결과 저장
                  switch (data.analysisType) {
                    case 'sensitivity':
                      setSensitivityResults(data.result);
                      break;
                    case 'monte_carlo':
                      setMonteCarloResults(data.result);
                      break;
                    case 'scenarios':
                      setScenarioResults(data.result);
                      break;
                  }
                } else if (data.type === 'complete') {
                  setAnalysisResults(data.results);
                  setStatus('success');
                  onAnalysisComplete?.(data.results);
                }
              } catch (parseError) {
                console.warn('진행률 파싱 오류:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : '종합 분석 중 오류가 발생했습니다.';
      onError?.(errorMessage);
    } finally {
      setProgress(null);
    }
  }, [projectId, analysisConfig, onAnalysisComplete, onError]);

  // 결과 내보내기
  const exportResults = useCallback(async (format: 'pdf' | 'excel' | 'json') => {
    if (!analysisResults) {
      onError?.('내보낼 분석 결과가 없습니다.');
      return;
    }

    try {
      const response = await fetch('/api/analysis/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          results: analysisResults,
          format,
          options: {
            includeCharts: true,
            includeRawData: format === 'excel',
            template: 'comprehensive'
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis_report_${projectId}_${Date.now()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      onError?.('결과 내보내기 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    }
  }, [analysisResults, projectId, onError]);

  // 분석 완료도 계산
  const completionPercentage = useMemo(() => {
    const states = Object.values(analysisStates);
    const completedCount = states.filter(state => state === 'success').length;
    return Math.round((completedCount / states.length) * 100);
  }, [analysisStates]);

  // 탭별 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* 전체 상태 개요 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">민감도 분석</p>
                      <p className="text-lg font-semibold">
                        {analysisStates.sensitivity === 'success' ? '완료' :
                         analysisStates.sensitivity === 'loading' ? '진행중' :
                         analysisStates.sensitivity === 'error' ? '오류' : '대기'}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${
                      analysisStates.sensitivity === 'success' ? 'bg-green-100' :
                      analysisStates.sensitivity === 'loading' ? 'bg-blue-100' :
                      analysisStates.sensitivity === 'error' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {analysisStates.sensitivity === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : analysisStates.sensitivity === 'loading' ? (
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      ) : analysisStates.sensitivity === 'error' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                  {sensitivityResults && (
                    <div className="mt-2 text-xs text-gray-500">
                      {sensitivityResults.singleCriterion.length}개 기준 분석 완료
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">몬테카를로</p>
                      <p className="text-lg font-semibold">
                        {analysisStates.monteCarlo === 'success' ? '완료' :
                         analysisStates.monteCarlo === 'loading' ? '진행중' :
                         analysisStates.monteCarlo === 'error' ? '오류' : '대기'}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${
                      analysisStates.monteCarlo === 'success' ? 'bg-green-100' :
                      analysisStates.monteCarlo === 'loading' ? 'bg-blue-100' :
                      analysisStates.monteCarlo === 'error' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {analysisStates.monteCarlo === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : analysisStates.monteCarlo === 'loading' ? (
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      ) : analysisStates.monteCarlo === 'error' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                  {monteCarloResults && (
                    <div className="mt-2 text-xs text-gray-500">
                      {monteCarloResults.validIterations}회 유효 시뮬레이션
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">시나리오 분석</p>
                      <p className="text-lg font-semibold">
                        {analysisStates.scenarios === 'success' ? '완료' :
                         analysisStates.scenarios === 'loading' ? '진행중' :
                         analysisStates.scenarios === 'error' ? '오류' : '대기'}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${
                      analysisStates.scenarios === 'success' ? 'bg-green-100' :
                      analysisStates.scenarios === 'loading' ? 'bg-blue-100' :
                      analysisStates.scenarios === 'error' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {analysisStates.scenarios === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : analysisStates.scenarios === 'loading' ? (
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      ) : analysisStates.scenarios === 'error' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                  {scenarioResults && (
                    <div className="mt-2 text-xs text-gray-500">
                      {scenarioResults.scenarios.size}개 시나리오 분석 완료
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">로버스트성</p>
                      <p className="text-lg font-semibold">
                        {analysisStates.robustness === 'success' ? '완료' :
                         analysisStates.robustness === 'loading' ? '진행중' :
                         analysisStates.robustness === 'error' ? '오류' : '대기'}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${
                      analysisStates.robustness === 'success' ? 'bg-green-100' :
                      analysisStates.robustness === 'loading' ? 'bg-blue-100' :
                      analysisStates.robustness === 'error' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {analysisStates.robustness === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : analysisStates.robustness === 'loading' ? (
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                      ) : analysisStates.robustness === 'error' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 전체 진행률 */}
            {status === 'loading' && progress && (
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">분석 진행 상황</h3>
                    <span className="text-sm text-gray-600">{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{progress.phase}</span>
                    <span>{progress.message}</span>
                  </div>
                  {progress.estimatedTimeRemaining && (
                    <div className="mt-2 text-xs text-gray-500">
                      예상 남은 시간: {Math.round(progress.estimatedTimeRemaining / 1000)}초
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* 종합 분석 결과 요약 */}
            {analysisResults && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">종합 분석 결과 요약</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {completionPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">분석 완료도</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResults.metadata.duration ? 
                         Math.round(analysisResults.metadata.duration / 1000) : 0}초
                      </div>
                      <div className="text-sm text-gray-600">분석 소요 시간</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResults.metadata.analysisVersion}
                      </div>
                      <div className="text-sm text-gray-600">분석 버전</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 'sensitivity':
        return (
          <SensitivityAnalysisDashboard
            projectId={projectId}
            onAnalysisComplete={(result) => {
              setSensitivityResults(result);
              setAnalysisStates(prev => ({ ...prev, sensitivity: 'success' }));
            }}
            onError={onError}
            autoRefresh={false}
          />
        );

      case 'scenarios':
        return (
          <ScenarioAnalysisTools
            projectId={projectId}
            onScenarioComplete={(result) => {
              // 시나리오 결과 처리
            }}
            onError={onError}
          />
        );

      case 'ai_insights':
        return analysisResults ? (
          <AIResultInterpretation
            analysisResults={analysisResults}
            onInsightAction={(insight, action) => {
              console.log('인사이트 액션:', insight, action);
            }}
            onRecommendationAccept={(recommendation) => {
              console.log('권고사항 적용:', recommendation);
            }}
            showAdvancedInsights={true}
          />
        ) : (
          <Card>
            <div className="p-8 text-center text-gray-500">
              <InformationCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>AI 인사이트를 확인하려면 먼저 종합 분석을 실행해주세요.</p>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">고급 분석 대시보드</h1>
          <p className="text-gray-600 mt-1">
            종합적인 의사결정 분석과 AI 기반 인사이트를 제공합니다.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 분석 설정 */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700"
            title="분석 설정"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          
          {/* 내보내기 버튼 */}
          {analysisResults && (
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => exportResults('pdf')}
                className="flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>PDF 내보내기</span>
              </Button>
            </div>
          )}
          
          {/* 종합 분석 실행 버튼 */}
          <Button
            onClick={runComprehensiveAnalysis}
            disabled={status === 'loading'}
            className="flex items-center space-x-2"
          >
            {status === 'loading' ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>종합 분석 실행</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: '개요', icon: InformationCircleIcon },
            { id: 'sensitivity', name: '민감도 분석', icon: ChartBarIcon },
            { id: 'scenarios', name: '시나리오 분석', icon: Cog6ToothIcon },
            { id: 'ai_insights', name: 'AI 인사이트', icon: CheckCircleIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
              {tab.id !== 'overview' && analysisStates[tab.id as keyof typeof analysisStates] === 'success' && (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="min-h-screen">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdvancedAnalysisDashboard;