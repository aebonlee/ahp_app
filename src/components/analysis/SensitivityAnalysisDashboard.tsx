// 민감도 분석 대시보드 컴포넌트
// Opus 4.1 설계 기반

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config/api';
import Card from '../common/Card';
import Button from '../common/Button';
import type {
  SensitivityAnalysisResult,
  SingleCriterionSensitivity,
  SensitivityDashboardProps,
  SensitivityAnalysisRequest,
  GradientSensitivity,
  CriticalPoint,
  AnalysisStatus,
  AnalysisProgress
} from '../../types/analysis';

const SensitivityAnalysisDashboard: React.FC<SensitivityDashboardProps> = ({
  projectId,
  onAnalysisComplete,
  onError,
  autoRefresh = false,
  refreshInterval = 60000
}) => {
  // State 관리
  const [analysisResult, setAnalysisResult] = useState<SensitivityAnalysisResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [selectedCriterion, setSelectedCriterion] = useState<string>('');
  const [selectedAlternative, setSelectedAlternative] = useState<string>('');
  const [analysisConfig, setAnalysisConfig] = useState<SensitivityAnalysisRequest>({
    projectId,
    analysisType: 'all',
    resolution: 100,
    includePerformanceSensitivity: true
  });

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh && analysisResult) {
      const interval = setInterval(() => {
        runAnalysis();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, analysisResult]);

  // 분석 실행
  const runAnalysis = useCallback(async () => {
    setStatus('loading');
    setProgress({ phase: '분석 초기화', progress: 0, message: '민감도 분석을 시작합니다...' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/sensitivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(analysisConfig)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 분석 요청 실패`);
      }

      // 스트리밍 응답 처리 (Server-Sent Events)
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
                } else if (data.type === 'result') {
                  setAnalysisResult(data.result);
                  setStatus('success');
                  onAnalysisComplete?.(data.result);
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
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      onError?.(errorMessage);
      console.error('민감도 분석 실패:', error);
    } finally {
      setProgress(null);
    }
  }, [analysisConfig, onAnalysisComplete, onError]);

  // 초기 분석 실행
  useEffect(() => {
    runAnalysis();
  }, [projectId]);

  // 대안 목록 추출
  const alternatives = useMemo(() => {
    if (!analysisResult?.singleCriterion?.[0]?.sensitivityPoints?.[0]) return [];
    return analysisResult.singleCriterion[0].sensitivityPoints[0].ranking.map(rank => ({
      id: rank.alternativeId,
      name: rank.alternativeName
    }));
  }, [analysisResult]);

  // 기준 목록 추출
  const criteria = useMemo(() => {
    if (!analysisResult?.singleCriterion) return [];
    return analysisResult.singleCriterion.map(sc => ({
      id: sc.criterionId,
      name: sc.criterionName,
      originalWeight: sc.originalWeight,
      stability: sc.stabilityRange.stabilityIndex
    }));
  }, [analysisResult]);

  // 가장 민감한 기준 찾기
  const mostSensitiveCriteria = useMemo(() => {
    if (!analysisResult?.gradient) return [];
    
    const sorted = Array.from(analysisResult.gradient.gradients.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return sorted.map(([criterionId, sensitivity]) => {
      const criterion = criteria.find(c => c.id === criterionId);
      return {
        id: criterionId,
        name: criterion?.name || criterionId,
        sensitivity,
        weight: criterion?.originalWeight || 0
      };
    });
  }, [analysisResult, criteria]);

  // 임계점 요약
  const criticalPointsSummary = useMemo(() => {
    if (!analysisResult?.singleCriterion) return [];
    
    const allCriticalPoints: Array<{
      criterionId: string;
      criterionName: string;
      point: CriticalPoint;
    }> = [];

    analysisResult.singleCriterion.forEach(sc => {
      sc.criticalPoints.forEach(point => {
        allCriticalPoints.push({
          criterionId: sc.criterionId,
          criterionName: sc.criterionName,
          point
        });
      });
    });

    // 민감도 기준으로 정렬
    return allCriticalPoints
      .sort((a, b) => b.point.sensitivity - a.point.sensitivity)
      .slice(0, 5);
  }, [analysisResult]);

  // 안정성 지표 계산
  const stabilityIndicator = useMemo(() => {
    if (!analysisResult?.singleCriterion) return { score: 0, level: 'unknown' as const };
    
    const avgStability = analysisResult.singleCriterion.reduce(
      (sum, sc) => sum + sc.stabilityRange.stabilityIndex,
      0
    ) / analysisResult.singleCriterion.length;

    let level: 'high' | 'medium' | 'low' = 'high';
    if (avgStability < 0.3) level = 'low';
    else if (avgStability < 0.7) level = 'medium';

    return { score: avgStability, level };
  }, [analysisResult]);

  // 토네이도 다이어그램 데이터 준비
  const tornadoData = useMemo(() => {
    if (!analysisResult?.singleCriterion || !selectedAlternative) return [];

    return analysisResult.singleCriterion.map(sc => {
      const baseScore = sc.sensitivityPoints[Math.floor(sc.sensitivityPoints.length / 2)]
        .scores.get(selectedAlternative) || 0;
      
      const minScore = Math.min(...sc.sensitivityPoints.map(p => p.scores.get(selectedAlternative) || 0));
      const maxScore = Math.max(...sc.sensitivityPoints.map(p => p.scores.get(selectedAlternative) || 0));
      
      return {
        criterionId: sc.criterionId,
        criterionName: sc.criterionName,
        baseScore,
        minScore,
        maxScore,
        range: maxScore - minScore,
        impact: Math.abs(maxScore - minScore) / baseScore
      };
    }).sort((a, b) => b.impact - a.impact);
  }, [analysisResult, selectedAlternative]);

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">민감도 분석 대시보드</h1>
          <p className="text-gray-600">
            기준 가중치 변화가 대안 순위에 미치는 영향을 분석합니다.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {status === 'loading' && progress && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">
                {progress.phase} ({progress.progress}%)
              </span>
            </div>
          )}
          <Button
            onClick={runAnalysis}
            disabled={status === 'loading'}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>분석 실행</span>
          </Button>
        </div>
      </div>

      {/* 진행률 표시 */}
      {status === 'loading' && progress && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{progress.phase}</span>
              <span className="text-sm text-gray-500">{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress.message}</p>
          </div>
        </Card>
      )}

      {/* 오류 표시 */}
      {status === 'error' && (
        <Card>
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 font-medium">분석 실행 중 오류가 발생했습니다.</span>
            </div>
          </div>
        </Card>
      )}

      {/* 분석 결과 */}
      {status === 'success' && analysisResult && (
        <>
          {/* 요약 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 전체 안정성 */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">전체 안정성</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stabilityIndicator.score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stabilityIndicator.level === 'high' ? 'bg-green-100' :
                    stabilityIndicator.level === 'medium' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <ChartBarIcon className={`h-6 w-6 ${
                      stabilityIndicator.level === 'high' ? 'text-green-600' :
                      stabilityIndicator.level === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stabilityIndicator.level === 'high' ? 'bg-green-100 text-green-800' :
                    stabilityIndicator.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stabilityIndicator.level === 'high' ? '높음' :
                     stabilityIndicator.level === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
              </div>
            </Card>

            {/* 분석된 기준 수 */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">분석 기준</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {criteria.length}개
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  해상도: {analysisConfig.resolution}단계
                </p>
              </div>
            </Card>

            {/* 임계점 수 */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">발견된 임계점</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {criticalPointsSummary.length}개
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  순위 변동 지점
                </p>
              </div>
            </Card>

            {/* 가장 민감한 기준 */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">최고 민감도</p>
                    <p className="text-lg font-bold text-gray-900">
                      {mostSensitiveCriteria[0]?.name || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                {mostSensitiveCriteria[0] && (
                  <p className="text-xs text-gray-500 mt-2">
                    민감도: {mostSensitiveCriteria[0].sensitivity.toFixed(3)}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* 필터 및 선택 */}
          <Card>
            <div className="p-4">
              <h3 className="font-semibold mb-4">분석 대상 선택</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대안 선택
                  </label>
                  <select
                    value={selectedAlternative}
                    onChange={(e) => setSelectedAlternative(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">대안을 선택하세요</option>
                    {alternatives.map(alt => (
                      <option key={alt.id} value={alt.id}>
                        {alt.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기준 선택
                  </label>
                  <select
                    value={selectedCriterion}
                    onChange={(e) => setSelectedCriterion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">기준을 선택하세요</option>
                    {criteria.map(criterion => (
                      <option key={criterion.id} value={criterion.id}>
                        {criterion.name} (가중치: {(criterion.originalWeight * 100).toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    분석 해상도
                  </label>
                  <select
                    value={analysisConfig.resolution}
                    onChange={(e) => setAnalysisConfig(prev => ({
                      ...prev,
                      resolution: parseInt(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="50">낮음 (50단계)</option>
                    <option value="100">보통 (100단계)</option>
                    <option value="200">높음 (200단계)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* 토네이도 다이어그램 */}
          {selectedAlternative && tornadoData.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  토네이도 다이어그램 - {alternatives.find(a => a.id === selectedAlternative)?.name}
                </h3>
                <div className="space-y-3">
                  {tornadoData.map((item, index) => (
                    <div key={item.criterionId} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {item.criterionName}
                        </span>
                        <span className="text-xs text-gray-500">
                          영향도: {(item.impact * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="relative bg-gray-200 h-8 rounded-md overflow-hidden">
                        {/* 기준선 (현재 값) */}
                        <div 
                          className="absolute top-0 w-0.5 h-full bg-gray-800 z-10"
                          style={{ 
                            left: `${((item.baseScore - item.minScore) / (item.maxScore - item.minScore)) * 100}%`
                          }}
                        />
                        
                        {/* 음의 영향 (왼쪽) */}
                        <div
                          className="absolute top-0 h-full bg-red-400"
                          style={{
                            left: '0%',
                            width: `${((item.baseScore - item.minScore) / (item.maxScore - item.minScore)) * 100}%`
                          }}
                        />
                        
                        {/* 양의 영향 (오른쪽) */}
                        <div
                          className="absolute top-0 h-full bg-green-400"
                          style={{
                            left: `${((item.baseScore - item.minScore) / (item.maxScore - item.minScore)) * 100}%`,
                            width: `${((item.maxScore - item.baseScore) / (item.maxScore - item.minScore)) * 100}%`
                          }}
                        />
                        
                        {/* 값 표시 */}
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          <span className="text-xs text-white font-medium">
                            {item.minScore.toFixed(3)}
                          </span>
                          <span className="text-xs text-white font-medium">
                            {item.maxScore.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* 민감도 상위 기준 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">민감도가 높은 기준</h3>
                <div className="space-y-3">
                  {mostSensitiveCriteria.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          현재 가중치: {(item.weight * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-purple-600">
                          {item.sensitivity.toFixed(3)}
                        </p>
                        <p className="text-xs text-gray-500">민감도 지수</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">주요 임계점</h3>
                <div className="space-y-3">
                  {criticalPointsSummary.map((item, index) => (
                    <div key={`${item.criterionId}-${index}`} 
                         className="p-3 border border-orange-200 rounded-md bg-orange-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.criterionName}</p>
                          <p className="text-sm text-gray-600">
                            가중치 {(item.point.weightRange[0] * 100).toFixed(1)}% ~ {(item.point.weightRange[1] * 100).toFixed(1)}%에서 순위 변동
                          </p>
                          <p className="text-xs text-orange-600">
                            영향받는 대안: {item.point.alternativesSwapped.join(' ↔ ')}
                          </p>
                        </div>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          순위 {item.point.rankPositions}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 권고사항 */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  권고사항
                </h3>
                <div className="space-y-4">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-md border-l-4 ${
                      rec.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                      rec.type === 'suggestion' ? 'border-blue-400 bg-blue-50' :
                      'border-green-400 bg-green-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority === 'high' ? '높음' :
                           rec.priority === 'medium' ? '보통' : '낮음'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                      {rec.affectedCriteria.length > 0 && (
                        <p className="text-xs text-gray-600">
                          관련 기준: {rec.affectedCriteria.join(', ')}
                        </p>
                      )}
                      {rec.actionItems && rec.actionItems.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">실행 항목:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {rec.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SensitivityAnalysisDashboard;