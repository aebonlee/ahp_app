// 시나리오 분석 도구 컴포넌트
// Opus 4.1 설계 기반

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import type {
  ScenarioDefinition,
  ScenarioChange,
  ScenarioExecutionResult,
  CompositeScenarioResult,
  GoalSeekingResult,
  ScenarioComparisonProps,
  AnalysisStatus,
  Objective,
  ParetoOptimalResult
} from '../../types/analysis';

interface ScenarioAnalysisToolsProps {
  projectId: string;
  onScenarioComplete?: (result: ScenarioExecutionResult) => void;
  onError?: (error: string) => void;
}

const ScenarioAnalysisTools: React.FC<ScenarioAnalysisToolsProps> = ({
  projectId,
  onScenarioComplete,
  onError
}) => {
  // State 관리
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [results, setResults] = useState<Map<string, ScenarioExecutionResult>>(new Map());
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [activeTab, setActiveTab] = useState<'create' | 'compare' | 'optimize'>('create');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  
  // 시나리오 생성 관련
  const [newScenario, setNewScenario] = useState<Partial<ScenarioDefinition>>({
    name: '',
    description: '',
    changes: [],
    type: 'what_if'
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // 목표 탐색 관련
  const [goalSeeking, setGoalSeeking] = useState<{
    targetAlternative: string;
    targetRank: number;
    isRunning: boolean;
    result?: GoalSeekingResult;
  }>({
    targetAlternative: '',
    targetRank: 1,
    isRunning: false
  });

  // 파레토 최적화 관련
  const [optimization, setOptimization] = useState<{
    objectives: Objective[];
    isRunning: boolean;
    result?: ParetoOptimalResult;
  }>({
    objectives: [
      {
        name: '대안 1 점수 최대화',
        type: 'maximize',
        weight: 1.0,
        evaluate: (result) => result.results.alternativeScores?.get('alt1') || 0
      }
    ],
    isRunning: false
  });

  // 기준과 대안 목록 (API에서 가져올 데이터)
  const [criteria, setCriteria] = useState<Array<{ id: string; name: string; weight: number }>>([]);
  const [alternatives, setAlternatives] = useState<Array<{ id: string; name: string }>>([]);

  // 프로젝트 데이터 로드
  const loadProjectData = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/structure`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCriteria(data.criteria || []);
        setAlternatives(data.alternatives || []);
      }
    } catch (error) {
      console.error('프로젝트 데이터 로드 실패:', error);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // 변경사항 추가
  const addScenarioChange = useCallback(() => {
    const newChange: ScenarioChange = {
      type: 'weight',
      target: '',
      oldValue: 0,
      newValue: 0,
      reason: ''
    };
    
    setNewScenario(prev => ({
      ...prev,
      changes: [...(prev.changes || []), newChange]
    }));
  }, []);

  // 변경사항 수정
  const updateScenarioChange = useCallback((index: number, change: Partial<ScenarioChange>) => {
    setNewScenario(prev => ({
      ...prev,
      changes: prev.changes?.map((c, i) => i === index ? { ...c, ...change } : c) || []
    }));
  }, []);

  // 변경사항 삭제
  const removeScenarioChange = useCallback((index: number) => {
    setNewScenario(prev => ({
      ...prev,
      changes: prev.changes?.filter((_, i) => i !== index) || []
    }));
  }, []);

  // 시나리오 생성
  const createScenario = useCallback(async () => {
    if (!newScenario.name || !newScenario.changes?.length) {
      onError?.('시나리오 이름과 변경사항을 입력해주세요.');
      return;
    }

    setIsCreating(true);
    try {
      const scenario: ScenarioDefinition = {
        id: `scenario_${Date.now()}`,
        name: newScenario.name,
        description: newScenario.description || '',
        changes: newScenario.changes,
        timestamp: new Date(),
        type: newScenario.type || 'what_if'
      };

      setScenarios(prev => [...prev, scenario]);
      setNewScenario({
        name: '',
        description: '',
        changes: [],
        type: 'what_if'
      });
      
      // 자동으로 실행
      await executeScenario(scenario);
      
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '시나리오 생성 실패');
    } finally {
      setIsCreating(false);
    }
  }, [newScenario, onError]);

  // 시나리오 실행
  const executeScenario = useCallback(async (scenario: ScenarioDefinition) => {
    setStatus('loading');
    try {
      const response = await fetch('/api/analysis/scenario/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ projectId, scenario })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 시나리오 실행 실패`);
      }

      const result: ScenarioExecutionResult = await response.json();
      setResults(prev => new Map(prev).set(scenario.id, result));
      setStatus('success');
      onScenarioComplete?.(result);

    } catch (error) {
      setStatus('error');
      onError?.(error instanceof Error ? error.message : '시나리오 실행 실패');
    }
  }, [projectId, onScenarioComplete, onError]);

  // 목표 탐색 실행
  const runGoalSeeking = useCallback(async () => {
    if (!goalSeeking.targetAlternative) {
      onError?.('목표 대안을 선택해주세요.');
      return;
    }

    setGoalSeeking(prev => ({ ...prev, isRunning: true }));
    try {
      const response = await fetch('/api/analysis/goal-seeking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          projectId,
          targetAlternative: goalSeeking.targetAlternative,
          targetRank: goalSeeking.targetRank
        })
      });

      if (!response.ok) {
        throw new Error('목표 탐색 실행 실패');
      }

      const result: GoalSeekingResult = await response.json();
      setGoalSeeking(prev => ({ ...prev, result, isRunning: false }));

    } catch (error) {
      setGoalSeeking(prev => ({ ...prev, isRunning: false }));
      onError?.(error instanceof Error ? error.message : '목표 탐색 실패');
    }
  }, [goalSeeking.targetAlternative, goalSeeking.targetRank, projectId, onError]);

  // 시나리오 비교
  const compareScenarios = useCallback(async () => {
    if (selectedScenarios.length < 2) {
      onError?.('비교할 시나리오를 2개 이상 선택해주세요.');
      return;
    }

    setStatus('loading');
    try {
      const selectedScenarioData = scenarios.filter(s => selectedScenarios.includes(s.id));
      
      const response = await fetch('/api/analysis/scenario/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          projectId,
          scenarios: selectedScenarioData
        })
      });

      if (!response.ok) {
        throw new Error('시나리오 비교 실행 실패');
      }

      const result: CompositeScenarioResult = await response.json();
      // 비교 결과 처리
      console.log('시나리오 비교 결과:', result);
      setStatus('success');

    } catch (error) {
      setStatus('error');
      onError?.(error instanceof Error ? error.message : '시나리오 비교 실패');
    }
  }, [selectedScenarios, scenarios, projectId, onError]);

  // 시나리오 결과 요약
  const getScenarioSummary = useCallback((scenarioId: string) => {
    const result = results.get(scenarioId);
    if (!result) return null;

    const rankChanges = result.impact.rankChanges.length;
    const majorChanges = result.impact.rankChanges.filter(rc => Math.abs(rc.rankDifference) > 1).length;
    
    return {
      rankChanges,
      majorChanges,
      impact: result.impact.overallImpact,
      confidence: result.confidence
    };
  }, [results]);

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시나리오 분석 도구</h1>
          <p className="text-gray-600">
            What-if 분석과 목표 탐색을 통해 다양한 상황을 시뮬레이션합니다.
          </p>
        </div>
        
        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            시나리오 생성
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'compare'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            시나리오 비교
          </button>
          <button
            onClick={() => setActiveTab('optimize')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'optimize'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            목표 최적화
          </button>
        </div>
      </div>

      {/* 시나리오 생성 탭 */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 새 시나리오 생성 */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">새 시나리오 생성</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시나리오 이름
                  </label>
                  <input
                    type="text"
                    value={newScenario.name || ''}
                    onChange={(e) => setNewScenario(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 경제 위기 상황"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    value={newScenario.description || ''}
                    onChange={(e) => setNewScenario(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="시나리오에 대한 상세 설명을 입력하세요..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시나리오 유형
                  </label>
                  <select
                    value={newScenario.type || 'what_if'}
                    onChange={(e) => setNewScenario(prev => ({ 
                      ...prev, 
                      type: e.target.value as ScenarioDefinition['type']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="what_if">What-if 분석</option>
                    <option value="stress_test">스트레스 테스트</option>
                    <option value="optimization">최적화</option>
                  </select>
                </div>
              </div>

              {/* 변경사항 목록 */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">변경사항</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={addScenarioChange}
                    className="flex items-center space-x-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>추가</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {newScenario.changes?.map((change, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            변경 유형
                          </label>
                          <select
                            value={change.type}
                            onChange={(e) => updateScenarioChange(index, { 
                              type: e.target.value as ScenarioChange['type']
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="weight">가중치</option>
                            <option value="score">성능 점수</option>
                            <option value="comparison">쌍대비교</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            대상 {change.type === 'weight' ? '기준' : '항목'}
                          </label>
                          <select
                            value={change.target}
                            onChange={(e) => updateScenarioChange(index, { target: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">선택하세요</option>
                            {change.type === 'weight' 
                              ? criteria.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))
                              : alternatives.map(a => (
                                  <option key={a.id} value={a.id}>{a.name}</option>
                                ))
                            }
                          </select>
                        </div>

                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              새 값
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={change.newValue}
                              onChange={(e) => updateScenarioChange(index, { 
                                newValue: parseFloat(e.target.value) || 0
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                          <button
                            onClick={() => removeScenarioChange(index)}
                            className="mt-4 p-1 text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          변경 이유
                        </label>
                        <input
                          type="text"
                          value={change.reason || ''}
                          onChange={(e) => updateScenarioChange(index, { reason: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="변경 사유를 입력하세요..."
                        />
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={createScenario}
                  disabled={isCreating || !newScenario.name || !newScenario.changes?.length}
                  className="flex items-center space-x-2"
                >
                  {isCreating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                  <span>{isCreating ? '생성 중...' : '시나리오 생성 및 실행'}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* 기존 시나리오 목록 */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">생성된 시나리오</h3>
              
              {scenarios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <InformationCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>생성된 시나리오가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.map(scenario => {
                    const summary = getScenarioSummary(scenario.id);
                    const isRunning = status === 'loading';
                    
                    return (
                      <div key={scenario.id} 
                           className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{scenario.changes.length}개 변경사항</span>
                              <span>{scenario.timestamp.toLocaleDateString()}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                scenario.type === 'what_if' ? 'bg-blue-100 text-blue-800' :
                                scenario.type === 'stress_test' ? 'bg-red-100 text-red-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {scenario.type === 'what_if' ? 'What-if' :
                                 scenario.type === 'stress_test' ? '스트레스' : '최적화'}
                              </span>
                            </div>
                            
                            {summary && (
                              <div className="mt-2 flex items-center space-x-3 text-xs">
                                <span className="text-gray-600">
                                  순위 변화: {summary.rankChanges}개
                                </span>
                                {summary.majorChanges > 0 && (
                                  <span className="text-orange-600">
                                    주요 변화: {summary.majorChanges}개
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded ${
                                  summary.impact === 'major' ? 'bg-red-100 text-red-800' :
                                  summary.impact === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  영향도: {
                                    summary.impact === 'major' ? '높음' :
                                    summary.impact === 'moderate' ? '보통' : '낮음'
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => executeScenario(scenario)}
                              disabled={isRunning}
                              className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                              title="다시 실행"
                            >
                              <PlayIcon className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="복사"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1 text-red-500 hover:text-red-700"
                              title="삭제"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 시나리오 비교 탭 */}
      {activeTab === 'compare' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">시나리오 비교 분석</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">비교할 시나리오 선택</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scenarios.map(scenario => (
                    <label key={scenario.id} 
                           className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScenarios(prev => [...prev, scenario.id]);
                          } else {
                            setSelectedScenarios(prev => prev.filter(id => id !== scenario.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{scenario.name}</p>
                        <p className="text-xs text-gray-500">{scenario.changes.length}개 변경사항</p>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Button
                    onClick={compareScenarios}
                    disabled={selectedScenarios.length < 2 || status === 'loading'}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <ArrowsRightLeftIcon className="h-4 w-4" />
                    <span>시나리오 비교 실행</span>
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">비교 결과</h4>
                <div className="bg-gray-50 rounded-md p-4 h-64">
                  <p className="text-center text-gray-500 mt-16">
                    비교할 시나리오를 선택하고 분석을 실행하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 목표 최적화 탭 */}
      {activeTab === 'optimize' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 목표 탐색 */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">목표 탐색</h3>
              <p className="text-sm text-gray-600 mb-4">
                특정 대안을 원하는 순위로 만들기 위한 조건을 찾습니다.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    목표 대안
                  </label>
                  <select
                    value={goalSeeking.targetAlternative}
                    onChange={(e) => setGoalSeeking(prev => ({ 
                      ...prev, 
                      targetAlternative: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">대안을 선택하세요</option>
                    {alternatives.map(alt => (
                      <option key={alt.id} value={alt.id}>{alt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    목표 순위
                  </label>
                  <select
                    value={goalSeeking.targetRank}
                    onChange={(e) => setGoalSeeking(prev => ({ 
                      ...prev, 
                      targetRank: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: alternatives.length }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}순위</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={runGoalSeeking}
                  disabled={goalSeeking.isRunning || !goalSeeking.targetAlternative}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {goalSeeking.isRunning ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <LightBulbIcon className="h-4 w-4" />
                  )}
                  <span>{goalSeeking.isRunning ? '탐색 중...' : '목표 탐색 실행'}</span>
                </Button>
              </div>

              {/* 목표 탐색 결과 */}
              {goalSeeking.result && (
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">탐색 결과</h4>
                  {goalSeeking.result.achieved ? (
                    <div className="text-green-700">
                      <p className="font-medium">목표 달성 가능!</p>
                      <p className="text-sm mt-1">
                        실현 가능성: {(goalSeeking.result.feasibility * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm">
                        필요한 변경사항: {goalSeeking.result.requiredChanges.length}개
                      </p>
                    </div>
                  ) : (
                    <div className="text-orange-700">
                      <p className="font-medium">목표 달성 어려움</p>
                      <p className="text-sm mt-1">
                        현재 순위: {goalSeeking.result.currentRank}, 
                        목표 순위: {goalSeeking.result.targetRank}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* 파레토 최적화 */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">다목적 최적화</h3>
              <p className="text-sm text-gray-600 mb-4">
                여러 목표를 동시에 고려한 최적 시나리오를 찾습니다.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">최적화 목표</h4>
                  <div className="space-y-2">
                    {optimization.objectives.map((obj, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          obj.type === 'maximize' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {obj.type === 'maximize' ? '최대화' : '최소화'}
                        </span>
                        <span className="flex-1">{obj.name}</span>
                        <span className="text-gray-500">가중치: {obj.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  disabled={optimization.isRunning}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  {optimization.isRunning ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Cog6ToothIcon className="h-4 w-4" />
                  )}
                  <span>{optimization.isRunning ? '최적화 중...' : '파레토 최적화 실행'}</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ScenarioAnalysisTools;