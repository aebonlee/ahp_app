// 계층적 평가 오케스트레이터
// Opus 4.1 설계 문서 기반 - 전체 평가 프로세스 관리

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import HierarchyTreeVisualization from './HierarchyTreeVisualization';
import Card from '../../common/Card';
import Button from '../../common/Button';

import { HierarchicalEvaluationFlow, ConsistencyValidator } from '../../../utils/hierarchicalEvaluationEngine';
import { ProgressTracker } from '../../../utils/progressTracker';
import { GlobalWeightCalculator } from '../../../utils/globalWeightCalculator';

import type { 
  HierarchicalStructure,
  HierarchyNode,
  EvaluationSession,
  EvaluationResult,
  PairwiseComparison,
  ConsistencyResult,
  OverallProgress,
  NodeProgress,
  GlobalWeightResult
} from '../../../types/hierarchy';

interface HierarchicalEvaluationOrchestratorProps {
  projectId: string;
  evaluatorId: string;
  structure: HierarchicalStructure;
  websocket?: WebSocket;
  onEvaluationComplete?: (results: GlobalWeightResult) => void;
  onProgressUpdate?: (progress: OverallProgress) => void;
  className?: string;
}

const HierarchicalEvaluationOrchestrator: React.FC<HierarchicalEvaluationOrchestratorProps> = ({
  projectId,
  evaluatorId,
  structure,
  websocket,
  onEvaluationComplete,
  onProgressUpdate,
  className = ''
}) => {
  // 상태 관리
  const [evaluationEngine] = useState(() => new HierarchicalEvaluationFlow(structure, evaluatorId));
  const [progressTracker] = useState(() => new ProgressTracker(projectId, evaluatorId, websocket));
  const [weightCalculator] = useState(() => new GlobalWeightCalculator(structure));
  
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [currentNode, setCurrentNode] = useState<HierarchyNode | null>(null);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // 현재 쌍대비교 상태
  const [comparisons, setComparisons] = useState<PairwiseComparison[]>([]);
  const [currentComparison, setCurrentComparison] = useState<{i: number, j: number} | null>(null);
  const [consistencyResult, setConsistencyResult] = useState<ConsistencyResult | null>(null);
  
  // 최종 결과
  const [globalWeights, setGlobalWeights] = useState<GlobalWeightResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // 평가 초기화
  const initializeEvaluation = useCallback(async () => {
    try {
      // 평가 세션 시작
      const newSession = await evaluationEngine.initializeEvaluation();
      setSession(newSession);
      
      // 진행률 추적기 초기화
      await progressTracker.initialize(structure);
      
      // 첫 번째 평가 노드 설정
      const nextNode = evaluationEngine.getNextEvaluationNode();
      setCurrentNode(nextNode);
      
      // 진행률 콜백 등록
      progressTracker.onProgressUpdate((progress) => {
        setOverallProgress(progress);
        onProgressUpdate?.(progress);
      });
      
      setIsEvaluating(true);
      
    } catch (error) {
      console.error('평가 초기화 실패:', error);
    }
  }, [evaluationEngine, progressTracker, structure, onProgressUpdate]);

  // 쌍대비교 데이터 준비
  const prepareComparisons = useCallback((node: HierarchyNode) => {
    if (!node.children || node.children.length < 2) {
      return [];
    }

    const children = node.children;
    const newComparisons: PairwiseComparison[] = [];

    // 모든 쌍대비교 조합 생성
    for (let i = 0; i < children.length - 1; i++) {
      for (let j = i + 1; j < children.length; j++) {
        newComparisons.push({
          i,
          j,
          value: 1, // 초기값: 동일
          elementA: children[i].name,
          elementB: children[j].name
        });
      }
    }

    return newComparisons;
  }, []);

  // 현재 노드 변경 시 쌍대비교 준비
  useEffect(() => {
    if (currentNode) {
      const nodeComparisons = prepareComparisons(currentNode);
      setComparisons(nodeComparisons);
      setCurrentComparison(nodeComparisons.length > 0 ? { i: 0, j: 1 } : null);
      setConsistencyResult(null);
    }
  }, [currentNode, prepareComparisons]);

  // 쌍대비교 값 업데이트
  const updateComparison = useCallback((comparisonIndex: number, value: number) => {
    setComparisons(prev => {
      const updated = [...prev];
      updated[comparisonIndex] = { ...updated[comparisonIndex], value };
      return updated;
    });

    // 진행률 업데이트
    if (currentNode) {
      progressTracker.updateComparison(
        currentNode.id,
        comparisonIndex,
        comparisonIndex >= comparisons.length - 1
      );
    }
  }, [currentNode, progressTracker, comparisons.length]);

  // 다음 비교로 이동
  const moveToNextComparison = useCallback(() => {
    if (!currentComparison || !currentNode?.children) return;

    const nextIndex = comparisons.findIndex(
      comp => comp.i === currentComparison.i && comp.j === currentComparison.j
    ) + 1;

    if (nextIndex < comparisons.length) {
      const nextComp = comparisons[nextIndex];
      setCurrentComparison({ i: nextComp.i, j: nextComp.j });
    } else {
      // 모든 비교 완료 - 일관성 검증
      validateNodeConsistency();
    }
  }, [currentComparison, currentNode, comparisons]);

  // 노드 일관성 검증
  const validateNodeConsistency = useCallback(async () => {
    if (!currentNode || comparisons.length === 0) return;

    try {
      // 평가 수행
      const result = await evaluationEngine.performPairwiseComparison(currentNode, comparisons);
      setConsistencyResult(result.consistency);

      // 진행률 추적기에 일관성 결과 업데이트
      await progressTracker.updateConsistency(currentNode.id, result.consistency);

      if (result.consistency.isConsistent) {
        // 일관성 통과 - 다음 노드로 이동
        moveToNextNode();
      } else {
        // 일관성 실패 - 사용자 조정 필요
        console.log('일관성 검증 실패:', result.consistency);
      }

    } catch (error) {
      console.error('일관성 검증 오류:', error);
    }
  }, [currentNode, comparisons, evaluationEngine, progressTracker]);

  // 다음 노드로 이동
  const moveToNextNode = useCallback(() => {
    const nextNode = evaluationEngine.getNextEvaluationNode();
    
    if (nextNode) {
      setCurrentNode(nextNode);
    } else {
      // 모든 평가 완료
      completeEvaluation();
    }
  }, [evaluationEngine]);

  // 평가 완료 처리
  const completeEvaluation = useCallback(async () => {
    try {
      // 평가 세션 완료
      await evaluationEngine.completeEvaluation();
      
      // 글로벌 가중치 계산
      const matrices = evaluationEngine.getAllMatrices();
      
      // 매트릭스 데이터를 가중치 계산기에 설정
      for (const [nodeKey, matrix] of matrices) {
        if (matrix.eigenVector) {
          weightCalculator.setLocalWeights(nodeKey, matrix.eigenVector);
        }
      }
      
      const finalResults = await weightCalculator.calculateGlobalWeights();
      setGlobalWeights(finalResults);
      setIsComplete(true);
      
      // 완료 콜백 호출
      onEvaluationComplete?.(finalResults);
      
    } catch (error) {
      console.error('평가 완료 처리 오류:', error);
    } finally {
      setIsEvaluating(false);
    }
  }, [evaluationEngine, weightCalculator, onEvaluationComplete]);

  // 평가 일시정지/재개
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // 평가 재시작
  const restartEvaluation = useCallback(() => {
    progressTracker.resetProgress();
    setSession(null);
    setCurrentNode(null);
    setOverallProgress(null);
    setIsEvaluating(false);
    setIsPaused(false);
    setComparisons([]);
    setCurrentComparison(null);
    setConsistencyResult(null);
    setGlobalWeights(null);
    setIsComplete(false);
  }, [progressTracker]);

  // 현재 비교 쌍 정보
  const getCurrentComparisonInfo = () => {
    if (!currentNode?.children || !currentComparison) return null;
    
    const children = currentNode.children;
    return {
      elementA: children[currentComparison.i],
      elementB: children[currentComparison.j],
      currentIndex: comparisons.findIndex(
        comp => comp.i === currentComparison.i && comp.j === currentComparison.j
      ),
      totalComparisons: comparisons.length
    };
  };

  const comparisonInfo = getCurrentComparisonInfo();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 평가 상태 헤더 */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                계층적 평가 진행
              </h2>
              <p className="text-sm text-gray-600">
                {isComplete ? '평가 완료' : 
                 isPaused ? '일시 정지됨' : 
                 isEvaluating ? '평가 진행 중' : '평가 준비'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 상태 아이콘 */}
              <div className="flex items-center space-x-2">
                {isComplete ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : isPaused ? (
                  <PauseIcon className="w-6 h-6 text-yellow-500" />
                ) : isEvaluating ? (
                  <ClockIcon className="w-6 h-6 text-blue-500 animate-pulse" />
                ) : (
                  <PlayIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* 제어 버튼 */}
              <div className="flex space-x-2">
                {!session ? (
                  <Button onClick={initializeEvaluation} variant="primary">
                    평가 시작
                  </Button>
                ) : isComplete ? (
                  <Button onClick={restartEvaluation} variant="outline">
                    재시작
                  </Button>
                ) : (
                  <Button onClick={togglePause} variant="outline">
                    {isPaused ? '재개' : '일시정지'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 진행률 표시 */}
          {overallProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">전체 진행률</span>
                <span className="font-medium">
                  {overallProgress.percentage.toFixed(1)}% 
                  ({overallProgress.completedNodes}/{overallProgress.totalNodes} 노드)
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress.percentage}%` }}
                />
              </div>

              {overallProgress.estimatedTimeRemaining > 0 && (
                <div className="text-xs text-gray-500">
                  예상 남은 시간: {Math.round(overallProgress.estimatedTimeRemaining / 60)}분
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 계층 구조 시각화 */}
        <div>
          <HierarchyTreeVisualization
            hierarchyNodes={[
              structure.goal,
              ...structure.criteria,
              ...(structure.subcriteria?.flat() || []),
              ...structure.alternatives
            ]}
            selectedNodeId={currentNode?.id}
            showWeights={isComplete}
            showProgress={isEvaluating}
            onNodeSelect={(node) => {
              if (!isEvaluating || isPaused) {
                setCurrentNode(node);
              }
            }}
          />
        </div>

        {/* 현재 평가 노드 */}
        <div>
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                현재 평가 노드
              </h3>

              {currentNode ? (
                <div className="space-y-4">
                  {/* 노드 정보 */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">
                      {currentNode.name}
                    </div>
                    {currentNode.description && (
                      <div className="text-sm text-blue-700 mt-1">
                        {currentNode.description}
                      </div>
                    )}
                    <div className="text-xs text-blue-600 mt-2">
                      {currentNode.children?.length || 0}개 하위 항목 비교
                    </div>
                  </div>

                  {/* 현재 비교 */}
                  {comparisonInfo && !isPaused && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        비교 {comparisonInfo.currentIndex + 1} / {comparisonInfo.totalComparisons}
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="text-center space-y-3">
                          <div className="flex items-center justify-center space-x-4">
                            <div className="text-center">
                              <div className="font-medium">{comparisonInfo.elementA.name}</div>
                              <div className="text-xs text-gray-500">A</div>
                            </div>
                            <div className="text-2xl font-bold text-gray-400">VS</div>
                            <div className="text-center">
                              <div className="font-medium">{comparisonInfo.elementB.name}</div>
                              <div className="text-xs text-gray-500">B</div>
                            </div>
                          </div>
                          
                          {/* 비교 스케일 */}
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              A가 B보다 얼마나 중요합니까?
                            </div>
                            
                            {/* Saaty 9점 척도 */}
                            <div className="flex justify-center space-x-1">
                              {[1/9, 1/7, 1/5, 1/3, 1, 3, 5, 7, 9].map((value) => (
                                <button
                                  key={value}
                                  onClick={() => {
                                    updateComparison(comparisonInfo.currentIndex, value);
                                    setTimeout(moveToNextComparison, 300);
                                  }}
                                  className={`
                                    px-2 py-1 text-xs border rounded transition-colors
                                    ${value === 1 ? 'bg-gray-100 border-gray-300' : 
                                      value < 1 ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                                      'bg-blue-50 border-blue-200 hover:bg-blue-100'}
                                  `}
                                  disabled={isPaused}
                                >
                                  {value < 1 ? `1/${1/value}` : value}
                                </button>
                              ))}
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              1: 동일, 3: 약간 중요, 5: 중요, 7: 매우 중요, 9: 절대 중요
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 일관성 결과 */}
                  {consistencyResult && (
                    <div className={`
                      p-4 rounded-lg border
                      ${consistencyResult.isConsistent ? 
                        'bg-green-50 border-green-200' : 
                        'bg-red-50 border-red-200'}
                    `}>
                      <div className="flex items-center space-x-2">
                        {consistencyResult.isConsistent ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        )}
                        <div className="text-sm font-medium">
                          {consistencyResult.message}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mt-1">
                        일관성 비율: {(consistencyResult.ratio * 100).toFixed(2)}%
                      </div>

                      {!consistencyResult.isConsistent && consistencyResult.suggestedAdjustments && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-red-700 mb-1">
                            조정 제안:
                          </div>
                          {consistencyResult.suggestedAdjustments.map((adj, index) => (
                            <div key={index} className="text-xs text-red-600">
                              • {adj.position[0]}-{adj.position[1]}: {adj.currentValue} → {adj.suggestedValue}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {isComplete ? '평가가 완료되었습니다.' : '평가할 노드를 선택하세요.'}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 최종 결과 */}
      {isComplete && globalWeights && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              최종 평가 결과
            </h3>
            
            <div className="space-y-4">
              {/* 대안 순위 */}
              <div>
                <h4 className="font-medium mb-2">대안 순위</h4>
                <div className="space-y-2">
                  {globalWeights.rankings.map((ranking, index) => (
                    <div key={ranking.alternativeId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {ranking.rank}
                        </div>
                        <div className="font-medium">{ranking.name}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {ranking.percentage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HierarchicalEvaluationOrchestrator;