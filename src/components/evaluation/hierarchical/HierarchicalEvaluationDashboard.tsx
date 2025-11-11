// 계층적 평가 시스템 메인 대시보드
// Opus 4.1 설계 문서 기반

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRightIcon, 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { 
  HierarchyNode, 
  EvaluationSession, 
  EvaluationProgress,
  HierarchyAPIResponse 
} from '../../../types/hierarchy';
import { buildHierarchyTree, validateHierarchyStructure } from '../../../utils/hierarchyCalculations';

interface HierarchicalEvaluationDashboardProps {
  projectId: string;
  evaluatorId: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionComplete?: (sessionId: string) => void;
}

const HierarchicalEvaluationDashboard: React.FC<HierarchicalEvaluationDashboardProps> = ({
  projectId,
  evaluatorId,
  onSessionStart,
  onSessionComplete
}) => {
  // State 관리
  const [hierarchyNodes, setHierarchyNodes] = useState<HierarchyNode[]>([]);
  const [currentSession, setCurrentSession] = useState<EvaluationSession | null>(null);
  const [evaluationProgress, setEvaluationProgress] = useState<EvaluationProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 계층 구조 로드
  const loadHierarchyStructure = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/hierarchy`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('계층 구조를 불러올 수 없습니다.');
      }

      const result: HierarchyAPIResponse<HierarchyNode[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '계층 구조 데이터가 없습니다.');
      }

      const nodes = result.data;
      setHierarchyNodes(nodes);

      // 계층 트리 구성
      const tree = buildHierarchyTree(nodes);
      setHierarchyTree(tree);

      // 계층 구조 검증
      const validation = validateHierarchyStructure(nodes);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setError('계층 구조에 문제가 있습니다.');
      } else {
        setValidationErrors([]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // 진행 중인 세션 확인
  const checkExistingSession = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/evaluation-sessions?projectId=${projectId}&evaluatorId=${evaluatorId}&status=in_progress`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result: HierarchyAPIResponse<EvaluationSession[]> = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setCurrentSession(result.data[0]);
          loadEvaluationProgress(result.data[0].id);
        }
      }
    } catch (err) {
      console.error('세션 확인 중 오류:', err);
    }
  }, [projectId, evaluatorId]);

  // 평가 진행률 로드
  const loadEvaluationProgress = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/evaluation-sessions/${sessionId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result: HierarchyAPIResponse<EvaluationProgress> = await response.json();
        if (result.success && result.data) {
          setEvaluationProgress(result.data);
        }
      }
    } catch (err) {
      console.error('진행률 로드 중 오류:', err);
    }
  };

  // 새로운 평가 세션 시작
  const startEvaluationSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluation-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          evaluatorId,
          sessionType: 'individual',
          evaluationMode: 'full'
        }),
      });

      if (!response.ok) {
        throw new Error('평가 세션을 시작할 수 없습니다.');
      }

      const result: HierarchyAPIResponse<EvaluationSession> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '세션 생성에 실패했습니다.');
      }

      const newSession = result.data;
      setCurrentSession(newSession);
      onSessionStart?.(newSession.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 세션 일시정지/재개
  const toggleSessionStatus = async () => {
    if (!currentSession) return;

    const newStatus = currentSession.status === 'in_progress' ? 'paused' : 'in_progress';

    try {
      const response = await fetch(`/api/evaluation-sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        const result: HierarchyAPIResponse<EvaluationSession> = await response.json();
        if (result.success && result.data) {
          setCurrentSession(result.data);
        }
      }
    } catch (err) {
      console.error('세션 상태 변경 중 오류:', err);
    }
  };

  // 계층 노드 렌더링
  const renderHierarchyNode = (node: HierarchyNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isCompleted = evaluationProgress?.completedNodes || 0;
    const nodeCompleted = false; // TODO: 실제 완료 상태 확인

    return (
      <div key={node.id} className="mb-2">
        <div 
          className={`
            flex items-center p-3 rounded-lg border-2 transition-all
            ${nodeCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}
            ${depth > 0 ? 'ml-6' : ''}
          `}
        >
          <div className="flex items-center flex-1">
            {hasChildren && (
              <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-400" />
            )}
            
            <div className="flex items-center space-x-3">
              {nodeCompleted ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
              
              <div>
                <div className="font-medium text-gray-900">
                  {node.name}
                </div>
                {node.description && (
                  <div className="text-sm text-gray-500">
                    {node.description}
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  레벨 {node.level} • {node.nodeType}
                  {node.code && ` • ${node.code}`}
                </div>
              </div>
            </div>
          </div>

          {node.globalWeight && (
            <div className="text-sm text-gray-600 mr-2">
              가중치: {(node.globalWeight * 100).toFixed(2)}%
            </div>
          )}
        </div>

        {hasChildren && (
          <div className="mt-2">
            {node.children?.map(child => 
              renderHierarchyNode(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadHierarchyStructure();
    checkExistingSession();
  }, [loadHierarchyStructure, checkExistingSession]);

  // WebSocket 연결 (실시간 업데이트)
  useEffect(() => {
    if (!currentSession) return;

    const wsUrl = `ws://localhost:8000/ws/evaluation/${currentSession.id}/`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'evaluation_progress') {
        setEvaluationProgress(data.data);
      } else if (data.type === 'session_update') {
        setCurrentSession(data.data);
        
        if (data.data.status === 'completed') {
          onSessionComplete?.(currentSession.id);
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [currentSession, onSessionComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">계층 구조를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          계층적 평가 시스템
        </h1>
        <p className="text-gray-600">
          AHP 방법론을 활용한 체계적인 의사결정 평가를 수행합니다.
        </p>
      </div>

      {/* 오류 표시 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <div>
              <div className="font-medium text-red-800">{error}</div>
              {validationErrors.length > 0 && (
                <ul className="mt-2 text-sm text-red-700">
                  {validationErrors.map((err, index) => (
                    <li key={index} className="list-disc ml-4">{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 계층 구조 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                계층 구조
              </h2>
              <p className="text-sm text-gray-600">
                총 {hierarchyNodes.length}개 노드
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {hierarchyTree.length > 0 ? (
                hierarchyTree.map(node => renderHierarchyNode(node))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  계층 구조가 정의되지 않았습니다.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 평가 컨트롤 */}
        <div className="space-y-4">
          {/* 세션 정보 */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                평가 세션
              </h3>
              
              {currentSession ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">상태</span>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${currentSession.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                      ${currentSession.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${currentSession.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {currentSession.status === 'in_progress' && '진행 중'}
                      {currentSession.status === 'paused' && '일시정지'}
                      {currentSession.status === 'completed' && '완료'}
                    </span>
                  </div>
                  
                  {evaluationProgress && (
                    <>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">전체 진행률</span>
                          <span className="font-medium">
                            {evaluationProgress.progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${evaluationProgress.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600">완료된 노드</div>
                          <div className="font-medium">
                            {evaluationProgress.completedNodes}/{evaluationProgress.totalNodes}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">완료된 비교</div>
                          <div className="font-medium">
                            {evaluationProgress.completedComparisons}/{evaluationProgress.totalComparisons}
                          </div>
                        </div>
                      </div>
                      
                      {evaluationProgress.currentStep && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-900">
                            현재 단계
                          </div>
                          <div className="text-sm text-blue-700">
                            {evaluationProgress.currentStep.nodeName}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Button
                      onClick={toggleSessionStatus}
                      variant="secondary"
                      className="w-full"
                      disabled={currentSession.status === 'completed'}
                    >
                      {currentSession.status === 'in_progress' ? (
                        <>
                          <PauseIcon className="w-4 h-4 mr-2" />
                          일시정지
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4 mr-2" />
                          재개
                        </>
                      )}
                    </Button>
                    
                    {currentSession.status !== 'completed' && (
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={() => {
                          // TODO: 평가 화면으로 이동
                          console.log('평가 화면으로 이동');
                        }}
                      >
                        평가 계속하기
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    계층적 평가를 시작하여 각 레벨에서 쌍대비교를 수행하세요.
                  </p>
                  
                  <Button
                    onClick={startEvaluationSession}
                    variant="primary"
                    className="w-full"
                    disabled={validationErrors.length > 0 || isLoading}
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    평가 시작
                  </Button>
                  
                  {validationErrors.length > 0 && (
                    <p className="text-xs text-red-600">
                      계층 구조의 문제를 해결한 후 평가를 시작할 수 있습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* 일관성 정보 */}
          {currentSession?.consistencyMetrics && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  일관성 지표
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">전체 일관성 비율</span>
                      <span className={`
                        font-medium
                        ${currentSession.consistencyMetrics.overallCR <= 0.1 ? 'text-green-600' : 'text-red-600'}
                      `}>
                        {(currentSession.consistencyMetrics.overallCR * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`
                          h-2 rounded-full transition-all
                          ${currentSession.consistencyMetrics.overallCR <= 0.1 ? 'bg-green-500' : 'bg-red-500'}
                        `}
                        style={{ width: `${Math.min(currentSession.consistencyMetrics.overallCR * 1000, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentSession.consistencyMetrics.overallCR <= 0.1 
                        ? '일관성이 양호합니다' 
                        : '일관성 개선이 필요합니다'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HierarchicalEvaluationDashboard;