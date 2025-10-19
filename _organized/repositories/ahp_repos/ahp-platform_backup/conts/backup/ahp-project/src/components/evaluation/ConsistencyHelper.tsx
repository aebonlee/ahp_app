import React, { useState, useEffect } from 'react';
import { 
  calculateAHP,
  buildComparisonMatrix,
  type ComparisonInput
} from '../../utils/ahpCalculator';

interface InconsistencyAdvice {
  i: number;
  j: number;
  element1Name: string;
  element2Name: string;
  currentValue: number;
  recommendedValue: number;
  errorMagnitude: number;
  rank: number;
}

interface ConsistencyHelperProps {
  matrix: number[][];
  elements: Array<{id: string, name: string}>;
  consistencyRatio: number;
  onSuggestionApply: (i: number, j: number, value: number) => void;
  onClose: () => void;
  isVisible: boolean;
}

const ConsistencyHelper: React.FC<ConsistencyHelperProps> = ({ 
  matrix, 
  elements, 
  consistencyRatio,
  onSuggestionApply, 
  onClose,
  isVisible 
}) => {
  const [suggestions, setSuggestions] = useState<InconsistencyAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible && matrix.length > 0) {
      generateSuggestions();
    }
  }, [isVisible, matrix]);

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      
      // AHP 계산으로 현재 가중치 구하기
      const result = calculateAHP(matrix);
      const weights = result.priorities;
      
      // 일관 행렬 A^ 구성: a^_ij = w_i / w_j
      const consistentMatrix: number[][] = weights.map(wi => 
        weights.map(wj => wi / wj)
      );

      // 오차 계산: E_ij = |log(a_ij) - log(a^_ij)|
      const errors: Array<{i: number, j: number, error: number}> = [];
      
      for (let i = 0; i < matrix.length; i++) {
        for (let j = i + 1; j < matrix.length; j++) {  // 상삼각만
          const actualValue = matrix[i][j];
          const consistentValue = consistentMatrix[i][j];
          
          if (actualValue > 0 && consistentValue > 0) {
            const error = Math.abs(Math.log(actualValue) - Math.log(consistentValue));
            errors.push({ i, j, error });
          }
        }
      }

      // |E_ij| 상위 3개 선별
      const topErrors = errors
        .sort((a, b) => b.error - a.error)
        .slice(0, 3);

      const newSuggestions: InconsistencyAdvice[] = topErrors.map((item, index) => {
        const consistentValue = weights[item.i] / weights[item.j];
        const nearestSaatyValue = findNearestSaatyValue(consistentValue);
        
        return {
          i: item.i,
          j: item.j,
          element1Name: elements[item.i]?.name || `요소 ${item.i + 1}`,
          element2Name: elements[item.j]?.name || `요소 ${item.j + 1}`,
          currentValue: matrix[item.i][item.j],
          recommendedValue: nearestSaatyValue,
          errorMagnitude: item.error,
          rank: index + 1
        };
      });

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const findNearestSaatyValue = (target: number): number => {
    const saatyValues = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return saatyValues.reduce((prev, curr) => 
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
  };

  const formatSaatyValue = (value: number): string => {
    if (value === 1) return '1 (동등한 중요도)';
    if (value > 1) return `${value} (좌측이 더 중요)`;
    return `1/${Math.round(1/value)} (우측이 더 중요)`;
  };

  const getConsistencyLevel = (cr: number): string => {
    if (cr <= 0.05) return '매우 일관성 있음';
    if (cr <= 0.08) return '일관성 양호';
    if (cr <= 0.10) return '허용 가능한 수준';
    return '일관성 부족 (재검토 필요)';
  };

  const getConsistencyColor = (cr: number): string => {
    if (cr <= 0.05) return 'text-green-600';
    if (cr <= 0.08) return 'text-blue-600';
    if (cr <= 0.10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSuggestionApply = (suggestion: InconsistencyAdvice) => {
    setSelectedSuggestion(suggestion.rank);
    onSuggestionApply(suggestion.i, suggestion.j, suggestion.recommendedValue);
    
    // 적용 후 잠시 대기 후 닫기
    setTimeout(() => {
      setSelectedSuggestion(null);
      onClose();
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-red-50 border-b border-red-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-2">🚨 판단 도우미</h3>
              <p className="text-red-700">
                일관성 비율이 <span className="font-bold">{consistencyRatio.toFixed(3)}</span>로 
                허용 기준(0.1)을 초과했습니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 일관성 상태 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-800">현재 일관성 상태</h4>
                <p className="text-yellow-700 text-sm">
                  다음 제안을 검토하여 판단을 수정하면 일관성을 개선할 수 있습니다.
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getConsistencyColor(consistencyRatio)}`}>
                  {consistencyRatio.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">{getConsistencyLevel(consistencyRatio)}</div>
              </div>
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">개선 제안을 분석하고 있습니다...</p>
            </div>
          )}

          {/* 제안 목록 */}
          {!loading && suggestions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 mb-4">💡 개선 제안 (오차가 큰 순서)</h4>
              
              {suggestions.map(suggestion => (
                <div 
                  key={`${suggestion.i}-${suggestion.j}`} 
                  className={`border rounded-lg p-5 transition-all duration-300 ${
                    selectedSuggestion === suggestion.rank 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          suggestion.rank === 1 ? 'bg-red-100 text-red-700' :
                          suggestion.rank === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          제안 {suggestion.rank}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          오차: {suggestion.errorMagnitude.toFixed(3)}
                        </span>
                      </div>
                      <h5 className="font-medium text-lg text-gray-800">
                        <span className="text-blue-600">{suggestion.element1Name}</span>
                        <span className="mx-2 text-gray-400">vs</span>
                        <span className="text-green-600">{suggestion.element2Name}</span>
                      </h5>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* 현재 값 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">현재 입력값</div>
                      <div className="font-medium text-lg">
                        {formatSaatyValue(suggestion.currentValue)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        수치: {suggestion.currentValue.toFixed(3)}
                      </div>
                    </div>

                    {/* 권장 값 */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">권장 수정값</div>
                      <div className="font-medium text-lg text-green-700">
                        {formatSaatyValue(suggestion.recommendedValue)}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        수치: {suggestion.recommendedValue.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  {/* 변경 사유 */}
                  <div className="bg-blue-50 p-3 rounded mb-4">
                    <div className="text-sm text-blue-700">
                      <strong>수정 사유:</strong> 현재 전체 응답 패턴을 기반으로 계산했을 때, 
                      이 두 요소의 비교값이 예상되는 일관성 범위를 벗어났습니다.
                    </div>
                  </div>

                  {/* 적용 버튼 */}
                  <button
                    onClick={() => handleSuggestionApply(suggestion)}
                    disabled={selectedSuggestion === suggestion.rank}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                      selectedSuggestion === suggestion.rank
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {selectedSuggestion === suggestion.rank ? (
                      <span className="flex items-center justify-center space-x-2">
                        <span>✓ 적용되었습니다</span>
                      </span>
                    ) : (
                      '이 제안 적용하기'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 제안이 없는 경우 */}
          {!loading && suggestions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">개선 제안을 생성할 수 없습니다.</div>
              <div className="text-sm text-gray-400">
                현재 입력된 비교값을 직접 검토하여 수정해주세요.
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              💡 제안을 적용하면 자동으로 일관성이 재계산됩니다.
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                나중에 수정
              </button>
            </div>
          </div>
        </div>

        {/* 도움말 */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <h5 className="font-medium text-gray-800 mb-2">📋 판단 도우미 사용법</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>제안 1:</strong> 가장 큰 오차를 개선할 수 있는 수정사항</p>
            <p>• <strong>제안 2-3:</strong> 추가적인 일관성 개선 방안</p>
            <p>• 제안을 적용하면 해당 비교값이 자동으로 수정되고 일관성이 재계산됩니다</p>
            <p>• 모든 제안을 수용할 필요는 없으며, 본인의 판단을 우선시하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyHelper;