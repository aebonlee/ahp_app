// 쌍대비교 매트릭스 컴포넌트
// Opus 4.1 설계 문서 기반

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { 
  HierarchyNode, 
  HierarchicalComparison,
  ConsistencyResult 
} from '../../../types/hierarchy';
import { 
  buildComparisonMatrix, 
  calculateConsistencyRatio, 
  calculateEigenvectorPowerMethod 
} from '../../../utils/hierarchyCalculations';

interface PairwiseComparisonMatrixProps {
  parentNode: HierarchyNode;
  childNodes: HierarchyNode[];
  sessionId: string;
  stepId: string;
  existingComparisons?: HierarchicalComparison[];
  onComparisonChange: (comparisons: HierarchicalComparison[]) => void;
  onStepComplete: (weights: Record<string, number>, consistency: ConsistencyResult) => void;
}

// AHP 평가 척도
const AHP_SCALE = {
  '1': { label: '동일 중요', description: '두 요소가 동일하게 중요' },
  '2': { label: '약간 더 중요', description: '경험과 판단에 의해 한 요소가 다른 요소보다 약간 더 중요' },
  '3': { label: '조금 중요', description: '한 요소가 다른 요소보다 조금 더 중요' },
  '4': { label: '조금 더 중요', description: '한 요소가 다른 요소보다 조금 더 중요' },
  '5': { label: '중요', description: '한 요소가 다른 요소보다 중요' },
  '6': { label: '매우 중요', description: '한 요소가 다른 요소보다 매우 중요' },
  '7': { label: '아주 중요', description: '한 요소가 다른 요소보다 아주 중요' },
  '8': { label: '극히 중요', description: '한 요소가 다른 요소보다 극히 중요' },
  '9': { label: '절대 중요', description: '한 요소가 다른 요소보다 절대적으로 중요' }
};

const PairwiseComparisonMatrix: React.FC<PairwiseComparisonMatrixProps> = ({
  parentNode,
  childNodes,
  sessionId,
  stepId,
  existingComparisons = [],
  onComparisonChange,
  onStepComplete
}) => {
  const [comparisons, setComparisons] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [consistency, setConsistency] = useState<ConsistencyResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<string | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // 기존 비교값 로드
  useEffect(() => {
    const comparisonMap: Record<string, number> = {};
    
    existingComparisons.forEach(comp => {
      const key = `${comp.elementAId}-${comp.elementBId}`;
      comparisonMap[key] = comp.value;
    });
    
    setComparisons(comparisonMap);
  }, [existingComparisons]);

  // 가중치 및 일관성 계산
  const calculateWeightsAndConsistency = useCallback(async () => {
    if (childNodes.length < 2) return;
    
    setIsCalculating(true);
    
    try {
      // 비교 매트릭스 구성
      const elementIds = childNodes.map(node => node.id);
      const matrix = buildComparisonMatrix(elementIds, comparisons);
      
      // 가중치 계산 (Power Method)
      const powerMethodResult = calculateEigenvectorPowerMethod(matrix);
      
      // 일관성 계산
      const consistencyResult = calculateConsistencyRatio(matrix);
      
      // 가중치 매핑
      const nodeWeights: Record<string, number> = {};
      elementIds.forEach((id, index) => {
        nodeWeights[id] = powerMethodResult.weights[index];
      });
      
      setWeights(nodeWeights);
      setConsistency(consistencyResult);
      
      // 부모 컴포넌트에 알림
      const comparisonObjects: HierarchicalComparison[] = Object.entries(comparisons).map(([key, value]) => {
        const [elementAId, elementBId] = key.split('-');
        return {
          id: `${sessionId}-${stepId}-${key}`,
          evaluationId: sessionId,
          nodeId: parentNode.id,
          elementAId,
          elementBId,
          value,
          isConsistent: consistencyResult.isConsistent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
      
      onComparisonChange(comparisonObjects);
      
    } catch (error) {
      console.error('계산 중 오류:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [childNodes, comparisons, sessionId, stepId, parentNode.id, onComparisonChange]);

  // 비교값 변경
  const handleComparisonChange = (elementAId: string, elementBId: string, value: number) => {
    const key = `${elementAId}-${elementBId}`;
    
    setComparisons(prev => ({
      ...prev,
      [key]: value
    }));
    
    setSelectedComparison(key);
  };

  // 단계 완료
  const handleStepComplete = () => {
    if (weights && consistency) {
      onStepComplete(weights, consistency);
    }
  };

  // 비교값 변경 시 계산 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateWeightsAndConsistency();
    }, 500); // 디바운스

    return () => clearTimeout(timer);
  }, [calculateWeightsAndConsistency]);

  // 필요한 비교 수 계산
  const totalComparisons = (childNodes.length * (childNodes.length - 1)) / 2;
  const completedComparisons = Object.keys(comparisons).length;
  const isComplete = completedComparisons === totalComparisons;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              쌍대비교: {parentNode.name}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelpDialog(true)}
            >
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              도움말
            </Button>
          </div>
          
          <p className="text-gray-600 mb-4">
            {parentNode.description || '각 기준들을 서로 비교하여 상대적 중요도를 평가해주세요.'}
          </p>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              진행률: {completedComparisons}/{totalComparisons}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedComparisons / totalComparisons) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 비교 매트릭스 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            쌍대비교 매트릭스
          </h3>
          
          <div className="space-y-4">
            {childNodes.map((nodeA, i) => 
              childNodes.slice(i + 1).map((nodeB, j) => {
                const key = `${nodeA.id}-${nodeB.id}`;
                const value = comparisons[key] || 1;
                const isSelected = selectedComparison === key;
                
                return (
                  <div 
                    key={key}
                    className={`
                      p-4 border rounded-lg transition-all
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                    `}
                  >
                    <div className="grid grid-cols-12 items-center gap-4">
                      {/* 첫 번째 요소 */}
                      <div className="col-span-4">
                        <div className="font-medium text-gray-900">
                          {nodeA.name}
                        </div>
                        {nodeA.description && (
                          <div className="text-sm text-gray-500">
                            {nodeA.description}
                          </div>
                        )}
                      </div>
                      
                      {/* 비교 척도 */}
                      <div className="col-span-4">
                        <div className="flex items-center space-x-2">
                          {/* 왼쪽 버튼들 */}
                          <div className="flex space-x-1">
                            {[9, 7, 5, 3].map(scale => (
                              <button
                                key={`left-${scale}`}
                                onClick={() => handleComparisonChange(nodeA.id, nodeB.id, scale)}
                                className={`
                                  w-8 h-8 text-xs rounded border transition-all
                                  ${value === scale 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                  }
                                `}
                                title={AHP_SCALE[scale.toString() as keyof typeof AHP_SCALE]?.label}
                              >
                                {scale}
                              </button>
                            ))}
                          </div>
                          
                          {/* 중앙 (동일) */}
                          <button
                            onClick={() => handleComparisonChange(nodeA.id, nodeB.id, 1)}
                            className={`
                              w-10 h-8 text-xs rounded border transition-all
                              ${value === 1 
                                ? 'bg-gray-600 text-white border-gray-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }
                            `}
                            title="동일 중요"
                          >
                            1
                          </button>
                          
                          {/* 오른쪽 버튼들 */}
                          <div className="flex space-x-1">
                            {[3, 5, 7, 9].map(scale => (
                              <button
                                key={`right-${scale}`}
                                onClick={() => handleComparisonChange(nodeA.id, nodeB.id, 1/scale)}
                                className={`
                                  w-8 h-8 text-xs rounded border transition-all
                                  ${value === 1/scale 
                                    ? 'bg-red-600 text-white border-red-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                                  }
                                `}
                                title={AHP_SCALE[scale.toString() as keyof typeof AHP_SCALE]?.label}
                              >
                                1/{scale}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-center text-xs text-gray-500 mt-1">
                          {value === 1 ? '동일 중요' :
                           value > 1 ? `${nodeA.name}이 ${value}배 중요` :
                           `${nodeB.name}이 ${(1/value).toFixed(1)}배 중요`}
                        </div>
                      </div>
                      
                      {/* 두 번째 요소 */}
                      <div className="col-span-4">
                        <div className="font-medium text-gray-900">
                          {nodeB.name}
                        </div>
                        {nodeB.description && (
                          <div className="text-sm text-gray-500">
                            {nodeB.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>

      {/* 계산 결과 */}
      {isComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 가중치 결과 */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                계산된 가중치
              </h3>
              
              <div className="space-y-3">
                {childNodes.map(node => {
                  const weight = weights[node.id] || 0;
                  return (
                    <div key={node.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {node.name}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-sm font-medium text-gray-900">
                        {(weight * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          
          {/* 일관성 결과 */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                일관성 검증
              </h3>
              
              {consistency && (
                <div className="space-y-4">
                  <div className={`
                    flex items-center p-3 rounded-lg
                    ${consistency.isConsistent ? 'bg-green-50' : 'bg-red-50'}
                  `}>
                    {consistency.isConsistent ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
                    )}
                    <div>
                      <div className={`
                        font-medium
                        ${consistency.isConsistent ? 'text-green-900' : 'text-red-900'}
                      `}>
                        {consistency.isConsistent ? '일관성 양호' : '일관성 개선 필요'}
                      </div>
                      <div className={`
                        text-sm
                        ${consistency.isConsistent ? 'text-green-700' : 'text-red-700'}
                      `}>
                        일관성 비율: {(consistency.consistencyRatio * 100).toFixed(2)}%
                        {!consistency.isConsistent && ' (10% 이하 권장)'}
                      </div>
                    </div>
                  </div>
                  
                  {!consistency.isConsistent && consistency.inconsistentPairs.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="font-medium text-yellow-900 mb-2">
                        개선 제안
                      </div>
                      <div className="space-y-2">
                        {consistency.inconsistentPairs.slice(0, 3).map((pair, index) => (
                          <div key={index} className="text-sm text-yellow-800">
                            • {pair.elementA} vs {pair.elementB}: 
                            현재 {pair.currentValue.toFixed(2)} → 
                            제안 {pair.suggestedValue.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {isCalculating && (
                <div className="text-center text-gray-500">
                  계산 중...
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 액션 버튼 */}
      {isComplete && (
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setComparisons({})}
          >
            다시 시작
          </Button>
          
          <Button
            variant="primary"
            onClick={handleStepComplete}
            disabled={!consistency?.isConsistent && (consistency?.consistencyRatio || 0) > 0.2}
          >
            다음 단계
          </Button>
        </div>
      )}

      {/* 도움말 다이얼로그 */}
      {showHelpDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                쌍대비교 도움말
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AHP 평가 척도</h4>
                  <div className="space-y-2">
                    {Object.entries(AHP_SCALE).map(([value, { label, description }]) => (
                      <div key={value} className="flex">
                        <div className="w-8 text-sm font-medium text-gray-900">
                          {value}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {label}
                          </div>
                          <div className="text-xs text-gray-600">
                            {description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">일관성 확인</h4>
                  <p className="text-sm text-gray-600">
                    일관성 비율(CR)이 10% 이하인 경우 판단의 일관성이 양호한 것으로 간주됩니다.
                    일관성이 부족한 경우, 제안된 수정값을 참고하여 판단을 조정해주세요.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  variant="primary"
                  onClick={() => setShowHelpDialog(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PairwiseComparisonMatrix;