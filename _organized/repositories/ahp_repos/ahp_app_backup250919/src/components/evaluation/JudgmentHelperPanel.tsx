/**
 * 판단 도우미 패널 컴포넌트
 * 비일관적인 판단을 개선하기 위한 제안 목록과 적용 기능 제공
 */

import React, { useState, useEffect } from 'react';
import { calculateAHP } from '../../utils/ahpCalculator';

interface JudgmentSuggestion {
  id: string;
  priority: number;
  element1Name: string;
  element2Name: string;
  element1Index: number;
  element2Index: number;
  currentValue: number;
  suggestedValue: number;
  errorMagnitude: number;
  impactScore: number;
  reasoning: string;
}

interface JudgmentHelperPanelProps {
  matrix: number[][];
  elementNames: string[];
  onSuggestionApply: (i: number, j: number, value: number) => void;
  onClose?: () => void;
  isVisible: boolean;
}

const JudgmentHelperPanel: React.FC<JudgmentHelperPanelProps> = ({
  matrix,
  elementNames,
  onSuggestionApply,
  onClose,
  isVisible
}) => {
  const [suggestions, setSuggestions] = useState<JudgmentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [estimatedCR, setEstimatedCR] = useState<number>(0);

  useEffect(() => {
    if (isVisible && matrix.length > 0) {
      generateSuggestions();
    }
  }, [isVisible, matrix]);

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      
      // 현재 CR 계산
      const currentResult = calculateAHP(matrix);
      const currentCR = currentResult.consistencyRatio || 0;
      
      if (currentCR <= 0.1) {
        setSuggestions([]);
        return;
      }

      // 일관성 개선 제안 생성
      const newSuggestions = await generateConsistencySuggestions(matrix, elementNames, currentCR);
      setSuggestions(newSuggestions);
      
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const generateConsistencySuggestions = async (
    matrix: number[][],
    names: string[],
    currentCR: number
  ): Promise<JudgmentSuggestion[]> => {
    const n = matrix.length;
    const suggestions: JudgmentSuggestion[] = [];
    
    try {
      // AHP 계산으로 우선순위 벡터 획득
      const ahpResult = calculateAHP(matrix);
      const priorities = ahpResult.priorities;
      
      // 각 상삼각 요소에 대해 개선 가능성 평가
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const currentValue = matrix[i][j];
          const consistentValue = priorities[i] / priorities[j];
          const errorMagnitude = Math.abs(Math.log(currentValue) - Math.log(consistentValue));
          
          if (errorMagnitude > 0.1) { // 유의미한 오차가 있는 경우만
            // 가장 가까운 Saaty 척도값 찾기
            const suggestedValue = findNearestSaatyValue(consistentValue);
            
            // 개선 효과 추정
            const testMatrix = matrix.map(row => [...row]);
            testMatrix[i][j] = suggestedValue;
            testMatrix[j][i] = 1 / suggestedValue;
            
            try {
              const testResult = calculateAHP(testMatrix);
              const newCR = testResult.consistencyRatio || 999;
              const impactScore = Math.max(0, currentCR - newCR);
              
              suggestions.push({
                id: `${i}-${j}`,
                priority: suggestions.length + 1,
                element1Name: names[i],
                element2Name: names[j],
                element1Index: i,
                element2Index: j,
                currentValue,
                suggestedValue,
                errorMagnitude,
                impactScore,
                reasoning: generateReasoning(currentValue, suggestedValue, consistentValue, impactScore)
              });
            } catch (testError) {
              // 테스트 계산이 실패한 경우 무시
            }
          }
        }
      }
      
      // 영향도 기준으로 정렬하고 상위 3개만 반환
      return suggestions
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 3)
        .map((s, index) => ({ ...s, priority: index + 1 }));
        
    } catch (error) {
      console.error('Error in generateConsistencySuggestions:', error);
      return [];
    }
  };

  const findNearestSaatyValue = (target: number): number => {
    const saatyValues = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return saatyValues.reduce((prev, curr) => 
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
  };

  const generateReasoning = (
    currentValue: number, 
    suggestedValue: number, 
    consistentValue: number, 
    impactScore: number
  ): string => {
    const improvement = impactScore > 0.01 ? '크게' : impactScore > 0.005 ? '어느 정도' : '약간';
    const direction = suggestedValue > currentValue ? '증가' : '감소';
    const magnitude = Math.abs(Math.log(suggestedValue) - Math.log(currentValue));
    
    let reason = `현재 판단 값을 ${formatSaatyValue(currentValue)}에서 ${formatSaatyValue(suggestedValue)}로 ${direction}시키면 `;
    reason += `일관성을 ${improvement} 개선할 수 있습니다. `;
    
    if (magnitude > 1) {
      reason += '비교적 큰 변경이지만 ';
    } else {
      reason += '적은 변경으로 ';
    }
    
    reason += `전체적인 판단의 논리적 일관성이 향상됩니다.`;
    
    return reason;
  };

  const formatSaatyValue = (value: number): string => {
    if (Math.abs(value - 1) < 0.001) return '1 (동등)';
    if (value > 1) return `${value} (좌측 우위)`;
    return `1/${Math.round(1/value)} (우측 우위)`;
  };

  const handleApplySuggestion = async (suggestion: JudgmentSuggestion) => {
    try {
      // 제안 적용
      onSuggestionApply(
        suggestion.element1Index, 
        suggestion.element2Index, 
        suggestion.suggestedValue
      );
      
      // 적용된 제안으로 표시
      setAppliedSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.add(suggestion.id);
        return newSet;
      });
      
      // 예상 CR 계산
      const testMatrix = matrix.map(row => [...row]);
      testMatrix[suggestion.element1Index][suggestion.element2Index] = suggestion.suggestedValue;
      testMatrix[suggestion.element2Index][suggestion.element1Index] = 1 / suggestion.suggestedValue;
      
      const testResult = calculateAHP(testMatrix);
      setEstimatedCR(testResult.consistencyRatio || 0);
      
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 border-red-300';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-300';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getImpactText = (impactScore: number): string => {
    if (impactScore > 0.02) return '큰 개선';
    if (impactScore > 0.01) return '중간 개선';
    if (impactScore > 0.005) return '작은 개선';
    return '미미한 개선';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-blue-50 border-b border-blue-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">📋 판단 도우미</h3>
              <p className="text-blue-700">
                일관성을 개선하기 위한 맞춤형 제안을 제공합니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">최적 개선 방안을 분석하고 있습니다...</p>
            </div>
          )}

          {/* 제안 없음 */}
          {!loading && suggestions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                판단이 이미 충분히 일관적입니다!
              </h4>
              <p className="text-gray-600">
                현재 일관성 비율이 허용 기준을 만족하거나 개선 제안을 생성할 수 없습니다.
              </p>
            </div>
          )}

          {/* 개선 제안 목록 */}
          {!loading && suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">🎯 일관성 개선 제안</h4>
                {estimatedCR > 0 && (
                  <div className="text-sm text-green-600">
                    예상 CR: {estimatedCR.toFixed(3)}
                  </div>
                )}
              </div>
              
              {suggestions.map((suggestion) => {
                const isApplied = appliedSuggestions.has(suggestion.id);
                
                return (
                  <div 
                    key={suggestion.id}
                    className={`border rounded-lg p-5 transition-all duration-300 ${
                      isApplied 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* 제안 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(suggestion.priority)}`}>
                          제안 {suggestion.priority}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {getImpactText(suggestion.impactScore)}
                        </span>
                        {isApplied && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✓ 적용됨
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 비교 요소 */}
                    <div className="mb-4">
                      <h5 className="font-medium text-lg text-gray-800 mb-2">
                        <span className="text-blue-600">{suggestion.element1Name}</span>
                        <span className="mx-2 text-gray-400">vs</span>
                        <span className="text-green-600">{suggestion.element2Name}</span>
                      </h5>
                    </div>

                    {/* 현재값 vs 제안값 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">현재 판단</div>
                        <div className="font-bold text-lg">
                          {formatSaatyValue(suggestion.currentValue)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          수치: {suggestion.currentValue.toFixed(3)}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">제안 수정값</div>
                        <div className="font-bold text-lg text-blue-700">
                          {formatSaatyValue(suggestion.suggestedValue)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          수치: {suggestion.suggestedValue.toFixed(3)}
                        </div>
                      </div>
                    </div>

                    {/* 개선 사유 */}
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
                      <div className="text-sm text-yellow-800">
                        <strong>개선 사유:</strong> {suggestion.reasoning}
                      </div>
                    </div>

                    {/* 기술적 정보 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>오차 크기: {suggestion.errorMagnitude.toFixed(3)}</span>
                      <span>개선 점수: {suggestion.impactScore.toFixed(3)}</span>
                    </div>

                    {/* 적용 버튼 */}
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      disabled={isApplied}
                      className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                        isApplied
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
                      }`}
                    >
                      {isApplied ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span>✓</span>
                          <span>제안이 적용되었습니다</span>
                        </span>
                      ) : (
                        '이 제안 적용하기'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 하단 안내 및 액션 버튼 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                💡 제안을 적용하면 자동으로 매트릭스가 업데이트되고 일관성이 재계산됩니다.
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setAppliedSuggestions(new Set());
                    generateSuggestions();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  🔄 새로 분석
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                  >
                    완료
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <h5 className="font-medium text-gray-800 mb-2">📋 판단 도우미 사용법</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>제안 1:</strong> 가장 큰 일관성 개선 효과를 기대할 수 있는 변경사항</p>
            <p>• <strong>제안 2-3:</strong> 추가적인 개선 방안으로 순차적으로 적용 가능</p>
            <p>• 제안을 적용해도 본인의 판단과 다르다면 원래 값으로 되돌릴 수 있습니다</p>
            <p>• 모든 제안을 수용할 필요는 없으며, 논리적으로 타당한 제안만 선택적으로 적용하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgmentHelperPanel;