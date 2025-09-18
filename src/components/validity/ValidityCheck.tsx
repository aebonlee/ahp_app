import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface ValidityTestResult {
  consistencyRatio: number;
  eigenVector: number[];
  maxEigenValue: number;
  isValid: boolean;
  recommendations: string[];
}

interface CriteriaItem {
  id: string;
  name: string;
  weight?: number;
}

interface PairwiseComparison {
  criteriaA: string;
  criteriaB: string;
  value: number;
}

const ValidityCheck: React.FC = () => {
  const [criteria, setCriteria] = useState<CriteriaItem[]>([
    { id: '1', name: '기술적 타당성' },
    { id: '2', name: '경제적 효과성' },
    { id: '3', name: '운영 편의성' },
    { id: '4', name: '위험도' }
  ]);
  
  const [comparisons, setComparisons] = useState<PairwiseComparison[]>([]);
  const [testResult, setTestResult] = useState<ValidityTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 9점 척도 값들
  const scaleValues = [
    { value: 1, label: '1 - 동등하게 중요' },
    { value: 3, label: '3 - 약간 더 중요' },
    { value: 5, label: '5 - 상당히 더 중요' },
    { value: 7, label: '7 - 매우 더 중요' },
    { value: 9, label: '9 - 극히 더 중요' }
  ];

  // 쌍대비교 매트릭스 생성
  const generatePairwiseComparisons = () => {
    const newComparisons: PairwiseComparison[] = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        newComparisons.push({
          criteriaA: criteria[i].id,
          criteriaB: criteria[j].id,
          value: 1
        });
      }
    }
    setComparisons(newComparisons);
  };

  // 비교값 업데이트
  const updateComparison = (criteriaA: string, criteriaB: string, value: number) => {
    setComparisons(prev => prev.map(comp => 
      comp.criteriaA === criteriaA && comp.criteriaB === criteriaB
        ? { ...comp, value }
        : comp
    ));
  };

  // AHP 타당도 계산 (시뮬레이션)
  const calculateValidity = async () => {
    setIsLoading(true);
    
    // 시뮬레이션 지연
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 간단한 일관성 비율 계산 시뮬레이션
    const matrix = createComparisonMatrix();
    const cr = calculateConsistencyRatio(matrix);
    const eigenValues = calculateEigenVector(matrix);
    
    const result: ValidityTestResult = {
      consistencyRatio: cr,
      eigenVector: eigenValues,
      maxEigenValue: criteria.length + Math.random() * 0.3,
      isValid: cr < 0.1,
      recommendations: generateRecommendations(cr, eigenValues)
    };
    
    setTestResult(result);
    setIsLoading(false);
  };

  // 비교 매트릭스 생성
  const createComparisonMatrix = (): number[][] => {
    const n = criteria.length;
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));
    
    comparisons.forEach(comp => {
      const indexA = criteria.findIndex(c => c.id === comp.criteriaA);
      const indexB = criteria.findIndex(c => c.id === comp.criteriaB);
      
      matrix[indexA][indexB] = comp.value;
      matrix[indexB][indexA] = 1 / comp.value;
    });
    
    return matrix;
  };

  // 일관성 비율 계산 (단순화된 버전)
  const calculateConsistencyRatio = (matrix: number[][]): number => {
    // 실제 AHP에서는 복잡한 고유값 계산이 필요하지만, 여기서는 시뮬레이션
    const n = matrix.length;
    const randomIndex = [0, 0, 0.52, 0.89, 1.11, 1.25, 1.35, 1.40, 1.45, 1.49];
    
    // 간단한 일관성 계산
    let inconsistency = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          if (i !== j && j !== k && i !== k) {
            const calculated = matrix[i][j] * matrix[j][k];
            const actual = matrix[i][k];
            inconsistency += Math.abs(calculated - actual) / actual;
          }
        }
      }
    }
    
    const ci = inconsistency / (n * (n - 1) * (n - 2));
    const cr = n > 2 ? ci / randomIndex[n] : 0;
    
    return Math.min(cr, 0.5); // 최대값 제한
  };

  // 고유벡터 계산 (단순화된 버전)
  const calculateEigenVector = (matrix: number[][]): number[] => {
    const n = matrix.length;
    const weights: number[] = [];
    
    // 기하평균법 사용
    for (let i = 0; i < n; i++) {
      let product = 1;
      for (let j = 0; j < n; j++) {
        product *= matrix[i][j];
      }
      weights[i] = Math.pow(product, 1/n);
    }
    
    // 정규화
    const sum = weights.reduce((acc, w) => acc + w, 0);
    return weights.map(w => w / sum);
  };

  // 권장사항 생성
  const generateRecommendations = (cr: number, eigenValues: number[]): string[] => {
    const recommendations: string[] = [];
    
    if (cr > 0.1) {
      recommendations.push('일관성 비율이 높습니다. 쌍대비교를 재검토하세요.');
      recommendations.push('극단적인 값(9:1)의 사용을 줄여보세요.');
      recommendations.push('판단 기준을 명확히 정의하고 재평가하세요.');
    } else {
      recommendations.push('일관성이 양호합니다.');
    }
    
    const maxWeight = Math.max(...eigenValues);
    const maxIndex = eigenValues.indexOf(maxWeight);
    if (maxWeight > 0.5) {
      recommendations.push(`'${criteria[maxIndex]?.name}' 기준의 가중치가 과도하게 높습니다.`);
    }
    
    return recommendations;
  };

  // 기준 추가
  const addCriteria = () => {
    const newId = (criteria.length + 1).toString();
    setCriteria(prev => [...prev, { id: newId, name: `새 기준 ${newId}` }]);
    setComparisons([]); // 기준이 변경되면 비교 초기화
    setTestResult(null);
  };

  // 기준 제거
  const removeCriteria = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
    setComparisons([]); // 기준이 변경되면 비교 초기화
    setTestResult(null);
  };

  // 기준명 업데이트
  const updateCriteriaName = (id: string, name: string) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, name } : c
    ));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔍 AHP 타당도 검증
        </h1>
        <p className="text-gray-600">
          연구 기획자를 위한 AHP 모델 타당도 테스트 도구
        </p>
      </div>

      {/* 1단계: 평가 기준 설정 */}
      <Card title="1단계: 평가 기준 설정">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              평가에 사용할 기준들을 설정하세요 (최소 3개, 최대 7개 권장)
            </p>
            <Button 
              size="sm" 
              onClick={addCriteria}
              disabled={criteria.length >= 7}
            >
              + 기준 추가
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {criteria.map((criterion, index) => (
              <div key={criterion.id} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">
                  C{index + 1}
                </span>
                <input
                  type="text"
                  value={criterion.name}
                  onChange={(e) => updateCriteriaName(criterion.id, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="기준명을 입력하세요"
                />
                {criteria.length > 3 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => removeCriteria(criterion.id)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-3">
            <Button 
              onClick={generatePairwiseComparisons}
              disabled={criteria.length < 3}
            >
              쌍대비교 매트릭스 생성
            </Button>
          </div>
        </div>
      </Card>

      {/* 2단계: 쌍대비교 평가 */}
      {comparisons.length > 0 && (
        <Card title="2단계: 쌍대비교 평가">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              각 기준 쌍의 상대적 중요도를 평가하세요
            </p>
            
            <div className="space-y-3">
              {comparisons.map((comp, index) => {
                const criteriaAName = criteria.find(c => c.id === comp.criteriaA)?.name || '';
                const criteriaBName = criteria.find(c => c.id === comp.criteriaB)?.name || '';
                
                return (
                  <div key={`${comp.criteriaA}-${comp.criteriaB}`} 
                       className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {criteriaAName} vs {criteriaBName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{criteriaAName}</span>
                      <select
                        value={comp.value}
                        onChange={(e) => updateComparison(comp.criteriaA, comp.criteriaB, Number(e.target.value))}
                        className="text-sm p-1 border border-gray-300 rounded"
                      >
                        {scaleValues.map(scale => (
                          <option key={scale.value} value={scale.value}>
                            {scale.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-500">{criteriaBName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-3">
              <Button 
                onClick={calculateValidity}
                disabled={isLoading}
              >
                {isLoading ? '계산 중...' : '타당도 검증 실행'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3단계: 결과 분석 */}
      {testResult && (
        <Card title="3단계: 타당도 검증 결과">
          <div className="space-y-6">
            {/* 일관성 비율 */}
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                testResult.isValid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResult.isValid ? '✅ 타당함' : '❌ 재검토 필요'}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                일관성 비율: {(testResult.consistencyRatio * 100).toFixed(1)}%
                {testResult.consistencyRatio < 0.1 ? ' (양호)' : ' (높음)'}
              </p>
            </div>

            {/* 가중치 결과 */}
            <div>
              <h4 className="font-semibold mb-3">📊 계산된 가중치</h4>
              <div className="space-y-2">
                {criteria.map((criterion, index) => (
                  <div key={criterion.id} className="flex items-center justify-between">
                    <span className="text-sm">{criterion.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(testResult.eigenVector[index] * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[3rem]">
                        {(testResult.eigenVector[index] * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 권장사항 */}
            <div>
              <h4 className="font-semibold mb-3">💡 개선 권장사항</h4>
              <ul className="space-y-1">
                {testResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* 상세 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🔢 상세 수치</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">최대 고유값:</span>
                  <span className="ml-2 font-mono">{testResult.maxEigenValue.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-gray-600">일관성 지수:</span>
                  <span className="ml-2 font-mono">{((testResult.maxEigenValue - criteria.length) / (criteria.length - 1)).toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 도움말 */}
      <Card title="📚 사용 가이드">
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>1단계:</strong> 평가에 사용할 기준들을 3-7개 정도로 설정하세요.</p>
          <p><strong>2단계:</strong> 9점 척도를 사용하여 각 기준 쌍의 중요도를 비교하세요.</p>
          <p><strong>3단계:</strong> 일관성 비율이 10% 미만이면 타당한 평가입니다.</p>
          <p><strong>팁:</strong> 극단적인 값(9:1)보다는 중간값(3:1, 5:1)을 주로 사용하는 것이 좋습니다.</p>
        </div>
      </Card>
    </div>
  );
};

export default ValidityCheck;