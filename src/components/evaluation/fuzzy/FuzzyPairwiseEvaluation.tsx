/**
 * 퍼지 쌍대비교 평가 컴포넌트
 * 삼각퍼지수를 사용한 AHP 평가 인터페이스
 */

import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import FuzzyNumberInput from './FuzzyNumberInput';
import FuzzyScaleSelector from './FuzzyScaleSelector';
import FuzzyMatrixGrid from './FuzzyMatrixGrid';
import { TriangularFuzzyNumber, FuzzyComparison } from '../../../types/fuzzy';
import { calculateFuzzyWeights, checkFuzzyConsistency } from '../../../utils/fuzzyCalculations';

interface FuzzyPairwiseEvaluationProps {
  projectId: string;
  criterionId?: string;
  criterionName: string;
  items: Array<{ id: string; name: string; description?: string }>;
  evaluationType: 'criteria' | 'alternatives';
  participantId?: string;
  onComplete?: (data: FuzzyComparison[]) => void;
  onSave?: (data: FuzzyComparison[]) => void;
}

const FuzzyPairwiseEvaluation: React.FC<FuzzyPairwiseEvaluationProps> = ({
  projectId,
  criterionId,
  criterionName,
  items,
  evaluationType,
  participantId = 'current_user',
  onComplete,
  onSave
}) => {
  const n = items.length;
  
  // 퍼지 비교 행렬 초기화 (상삼각 행렬만 저장)
  const initializeMatrix = (): FuzzyComparison[] => {
    const comparisons: FuzzyComparison[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        comparisons.push({
          rowId: items[i].id,
          colId: items[j].id,
          fuzzyValue: { L: 1, M: 1, U: 1 }, // 초기값: 동등
          linguisticTerm: 'Equal'
        });
      }
    }
    return comparisons;
  };

  const [comparisons, setComparisons] = useState<FuzzyComparison[]>(initializeMatrix());
  const [currentPair, setCurrentPair] = useState<[number, number]>([0, 1]);
  const [weights, setWeights] = useState<TriangularFuzzyNumber[]>([]);
  const [consistencyIndex, setConsistencyIndex] = useState<number>(0);
  const [inputMode, setInputMode] = useState<'linguistic' | 'numeric'>('linguistic');
  const [progress, setProgress] = useState<number>(0);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  // 진행률 계산
  useEffect(() => {
    const totalComparisons = (n * (n - 1)) / 2;
    const completedComparisons = comparisons.filter(
      c => c.fuzzyValue.M !== 1 || c.linguisticTerm !== 'Equal'
    ).length;
    setProgress(Math.round((completedComparisons / totalComparisons) * 100));
  }, [comparisons, n]);

  // 비교값 업데이트
  const updateComparison = (
    rowId: string, 
    colId: string, 
    value: TriangularFuzzyNumber, 
    linguisticTerm?: string
  ) => {
    setComparisons(prev => {
      const newComparisons = [...prev];
      const index = newComparisons.findIndex(
        c => (c.rowId === rowId && c.colId === colId) || 
             (c.rowId === colId && c.colId === rowId)
      );
      
      if (index !== -1) {
        // 역수 처리: j<i인 경우
        if (newComparisons[index].rowId === colId) {
          newComparisons[index].fuzzyValue = {
            L: 1 / value.U,
            M: 1 / value.M,
            U: 1 / value.L
          };
        } else {
          newComparisons[index].fuzzyValue = value;
        }
        if (linguisticTerm) {
          newComparisons[index].linguisticTerm = linguisticTerm;
        }
      }
      
      return newComparisons;
    });
  };

  // 다음 비교쌍으로 이동
  const goToNextPair = () => {
    let [i, j] = currentPair;
    j++;
    if (j >= n) {
      i++;
      j = i + 1;
    }
    if (i < n - 1 && j < n) {
      setCurrentPair([i, j]);
    }
  };

  // 이전 비교쌍으로 이동
  const goToPreviousPair = () => {
    let [i, j] = currentPair;
    j--;
    if (j <= i) {
      i--;
      j = n - 1;
    }
    if (i >= 0) {
      setCurrentPair([i, j]);
    }
  };

  // 가중치 계산
  const calculateWeights = async () => {
    try {
      const fuzzyWeights = await calculateFuzzyWeights(items, comparisons);
      setWeights(fuzzyWeights);
      
      // 일관성 검사
      const ci = await checkFuzzyConsistency(comparisons, items.length);
      setConsistencyIndex(ci);
    } catch (error) {
      console.error('가중치 계산 오류:', error);
    }
  };

  // 평가 완료
  const handleComplete = () => {
    calculateWeights();
    if (onComplete) {
      onComplete(comparisons);
    }
  };

  // 임시 저장
  const handleSave = () => {
    if (onSave) {
      onSave(comparisons);
    }
  };

  const [i, j] = currentPair;
  const currentComparison = comparisons.find(
    c => (c.rowId === items[i].id && c.colId === items[j].id)
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">
              🔮 퍼지 AHP 평가
            </h3>
            <p className="text-sm text-purple-700 mt-1">
              {evaluationType === 'criteria' ? '기준' : '대안'} 평가: {criterionName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-900">{progress}%</div>
            <div className="text-xs text-purple-700">진행률</div>
          </div>
        </div>
      </Card>

      {/* 입력 모드 선택 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">입력 방식</h4>
          <div className="flex space-x-2">
            <Button
              variant={inputMode === 'linguistic' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setInputMode('linguistic')}
            >
              언어적 평가
            </Button>
            <Button
              variant={inputMode === 'numeric' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setInputMode('numeric')}
            >
              수치 입력
            </Button>
            <Button
              variant={showMatrix ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowMatrix(!showMatrix)}
            >
              행렬 보기
            </Button>
          </div>
        </div>
      </Card>

      {/* 현재 비교쌍 평가 */}
      {!showMatrix ? (
        <Card className="p-6">
          <div className="text-center mb-6">
            <h4 className="text-lg font-medium mb-2">
              다음 두 항목을 비교해주세요
            </h4>
            <p className="text-sm text-gray-600">
              "{items[i].name}"이(가) "{items[j].name}"보다 얼마나 중요한가요?
            </p>
          </div>

          {/* 항목 설명 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-1">{items[i].name}</h5>
              {items[i].description && (
                <p className="text-sm text-blue-700">{items[i].description}</p>
              )}
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-900 mb-1">{items[j].name}</h5>
              {items[j].description && (
                <p className="text-sm text-green-700">{items[j].description}</p>
              )}
            </div>
          </div>

          {/* 평가 입력 */}
          <div className="mb-6">
            {inputMode === 'linguistic' ? (
              <FuzzyScaleSelector
                value={currentComparison?.fuzzyValue || { L: 1, M: 1, U: 1 }}
                linguisticTerm={currentComparison?.linguisticTerm || 'Equal'}
                onChange={(value, term) => 
                  updateComparison(items[i].id, items[j].id, value, term)
                }
                leftLabel={items[i].name}
                rightLabel={items[j].name}
              />
            ) : (
              <FuzzyNumberInput
                value={currentComparison?.fuzzyValue || { L: 1, M: 1, U: 1 }}
                onChange={(value) => 
                  updateComparison(items[i].id, items[j].id, value)
                }
                label={`${items[i].name} vs ${items[j].name}`}
              />
            )}
          </div>

          {/* 네비게이션 */}
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={goToPreviousPair}
              disabled={i === 0 && j === 1}
            >
              이전
            </Button>
            <div className="text-sm text-gray-600">
              비교 {(i * n - (i * (i + 1)) / 2) + (j - i)} / {(n * (n - 1)) / 2}
            </div>
            <Button
              variant="primary"
              onClick={goToNextPair}
              disabled={i === n - 2 && j === n - 1}
            >
              다음
            </Button>
          </div>
        </Card>
      ) : (
        /* 행렬 뷰 */
        <FuzzyMatrixGrid
          items={items}
          comparisons={comparisons}
          onUpdate={updateComparison}
          readOnly={false}
        />
      )}

      {/* 가중치 및 일관성 */}
      {weights.length > 0 && (
        <Card className="bg-gray-50">
          <h4 className="font-medium mb-4">퍼지 가중치</h4>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <div className="text-sm">
                  L: {weights[idx].L.toFixed(3)}, 
                  M: {weights[idx].M.toFixed(3)}, 
                  U: {weights[idx].U.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
          {consistencyIndex > 0 && (
            <div className={`mt-4 p-3 rounded-lg ${
              consistencyIndex <= 0.1 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <p className="text-sm font-medium">
                일관성 지수: {consistencyIndex.toFixed(4)}
                {consistencyIndex <= 0.1 ? ' ✓ 적합' : ' ⚠️ 재검토 필요'}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={handleSave}>
          임시 저장
        </Button>
        <Button 
          variant="primary" 
          onClick={handleComplete}
          disabled={progress < 100}
        >
          평가 완료
        </Button>
      </div>
    </div>
  );
};

export default FuzzyPairwiseEvaluation;