/**
 * AHP 쌍대비교 격자 컴포넌트
 * n×n 매트릭스에서 상삼각만 활성화, 9점 척도 버튼 제공
 */

import React, { useState, useEffect } from 'react';
import CRBadge from './CRBadge';
import { calculateAHP, buildComparisonMatrix } from '../../utils/ahpCalculator';

interface PairwiseComparison {
  i: number;
  j: number;
  value: number;
}

interface Element {
  id: string;
  name: string;
  description?: string;
}

interface PairwiseGridProps {
  elements: Element[];
  initialComparisons?: PairwiseComparison[];
  onComparisonChange: (comparisons: PairwiseComparison[]) => void;
  onConsistencyChange?: (cr: number, isConsistent: boolean) => void;
  disabled?: boolean;
  showProgress?: boolean;
}

// Saaty 9점 척도
const SAATY_SCALE = [
  { value: 9, label: '9', description: '절대 우위' },
  { value: 8, label: '8', description: '매우 강한 우위+' },
  { value: 7, label: '7', description: '매우 강한 우위' },
  { value: 6, label: '6', description: '강한 우위+' },
  { value: 5, label: '5', description: '강한 우위' },
  { value: 4, label: '4', description: '약간 강한 우위+' },
  { value: 3, label: '3', description: '약간 우위' },
  { value: 2, label: '2', description: '약간 우위-' },
  { value: 1, label: '1', description: '동등' },
  { value: 1/2, label: '1/2', description: '약간 열위-' },
  { value: 1/3, label: '1/3', description: '약간 열위' },
  { value: 1/4, label: '1/4', description: '약간 강한 열위+' },
  { value: 1/5, label: '1/5', description: '강한 열위' },
  { value: 1/6, label: '1/6', description: '강한 열위+' },
  { value: 1/7, label: '1/7', description: '매우 강한 열위' },
  { value: 1/8, label: '1/8', description: '매우 강한 열위+' },
  { value: 1/9, label: '1/9', description: '절대 열위' }
];

const PairwiseGrid: React.FC<PairwiseGridProps> = ({
  elements,
  initialComparisons = [],
  onComparisonChange,
  onConsistencyChange,
  disabled = false,
  showProgress = true
}) => {
  const [comparisons, setComparisons] = useState<PairwiseComparison[]>(initialComparisons);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [consistencyRatio, setConsistencyRatio] = useState<number>(0);
  const [activeCell, setActiveCell] = useState<{i: number, j: number} | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const n = elements.length;
  const totalComparisons = (n * (n - 1)) / 2; // 상삼각 비교 개수

  useEffect(() => {
    setComparisons(initialComparisons);
  }, [initialComparisons]);

  useEffect(() => {
    updateMatrix();
  }, [comparisons, elements]);

  const updateMatrix = () => {
    if (n === 0) return;

    // 매트릭스 초기화
    const newMatrix = Array(n).fill(null).map(() => Array(n).fill(1));
    
    // 대각선은 1
    for (let i = 0; i < n; i++) {
      newMatrix[i][i] = 1;
    }

    // 입력된 비교값 적용
    comparisons.forEach(comp => {
      if (comp.i < n && comp.j < n) {
        newMatrix[comp.i][comp.j] = comp.value;
        newMatrix[comp.j][comp.i] = 1 / comp.value; // 역수 관계
      }
    });

    setMatrix(newMatrix);
    setCompletedCount(comparisons.length);

    // 일관성 계산 (비교가 충분히 있을 때만)
    if (comparisons.length === totalComparisons) {
      try {
        const ahpResult = calculateAHP(newMatrix);
        const cr = ahpResult.consistencyRatio || 0;
        setConsistencyRatio(cr);
        
        if (onConsistencyChange) {
          onConsistencyChange(cr, cr <= 0.1);
        }
      } catch (error) {
        console.error('AHP calculation error:', error);
        setConsistencyRatio(999);
      }
    }
  };

  const handleComparisonChange = (i: number, j: number, value: number) => {
    if (disabled) return;

    const newComparisons = comparisons.filter(comp => 
      !(comp.i === i && comp.j === j)
    );
    
    if (value !== 1) { // 1이 아닌 경우만 저장
      newComparisons.push({ i, j, value });
    }

    setComparisons(newComparisons);
    onComparisonChange(newComparisons);
    setActiveCell(null);
  };

  const getValue = (i: number, j: number): number => {
    if (i === j) return 1;
    
    const comparison = comparisons.find(comp => comp.i === i && comp.j === j);
    return comparison ? comparison.value : 1;
  };

  const formatValue = (value: number): string => {
    if (value === 1) return '1';
    if (value > 1) return value.toString();
    return `1/${Math.round(1/value)}`;
  };

  const getValueDescription = (value: number): string => {
    const scale = SAATY_SCALE.find(s => Math.abs(s.value - value) < 0.001);
    return scale?.description || '';
  };

  const getCellColor = (i: number, j: number, value: number): string => {
    if (i === j) return 'bg-gray-100'; // 대각선
    if (i > j) return 'bg-gray-50'; // 하삼각 (비활성)
    
    // 상삼각 (활성) - 값에 따른 색상
    if (value === 1) return 'bg-white border-gray-300';
    if (value > 1) return 'bg-blue-50 border-blue-300';
    return 'bg-red-50 border-red-300';
  };

  const progress = totalComparisons > 0 ? (completedCount / totalComparisons) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* 헤더 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">
            쌍대비교 평가 ({n}×{n})
          </h3>
          <CRBadge 
            consistencyRatio={consistencyRatio}
            isComplete={completedCount === totalComparisons}
          />
        </div>
        
        {showProgress && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              진행률: {completedCount}/{totalComparisons}
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* 비교 매트릭스 그리드 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 bg-gray-100 border border-gray-300 text-xs font-medium">
                기준/대안
              </th>
              {elements.map((element, j) => (
                <th key={j} className="p-2 bg-gray-100 border border-gray-300 min-w-[100px]">
                  <div className="text-xs font-medium text-center">
                    <div className="truncate">{element.name}</div>
                    <div className="text-gray-500">#{j + 1}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map((element, i) => (
              <tr key={i}>
                <td className="p-2 bg-gray-100 border border-gray-300 font-medium">
                  <div className="text-sm">
                    <div className="truncate">{element.name}</div>
                    <div className="text-xs text-gray-500">#{i + 1}</div>
                  </div>
                </td>
                {elements.map((_, j) => {
                  const value = getValue(i, j);
                  const isActive = i < j; // 상삼각만 활성
                  const isSelected = activeCell?.i === i && activeCell?.j === j;
                  
                  return (
                    <td key={j} className={`p-1 border border-gray-300 ${getCellColor(i, j, value)}`}>
                      {i === j ? (
                        // 대각선 (자기 자신)
                        <div className="flex items-center justify-center h-12 text-gray-500 font-bold">
                          1
                        </div>
                      ) : i > j ? (
                        // 하삼각 (비활성, 역수 표시)
                        <div className="flex items-center justify-center h-12 text-gray-400 text-sm">
                          {formatValue(1 / getValue(j, i))}
                        </div>
                      ) : (
                        // 상삼각 (활성 비교 영역)
                        <div className="relative">
                          <button
                            onClick={() => setActiveCell({ i, j })}
                            disabled={disabled}
                            className={`w-full h-12 flex items-center justify-center text-sm font-medium border-2 transition-all
                              ${isSelected ? 'border-blue-500 bg-blue-100' : 'border-transparent hover:border-blue-300'}
                              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-blue-50'}
                            `}
                          >
                            <div className="text-center">
                              <div className="font-bold">{formatValue(value)}</div>
                              {value !== 1 && (
                                <div className="text-xs text-gray-500 truncate">
                                  {getValueDescription(value)}
                                </div>
                              )}
                            </div>
                          </button>
                          
                          {/* 척도 선택 드롭다운 */}
                          {isSelected && !disabled && (
                            <div className="absolute top-full left-0 z-50 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              <div className="p-2 border-b border-gray-200 bg-gray-50">
                                <div className="text-xs font-medium text-gray-700">
                                  {elements[i].name} vs {elements[j].name}
                                </div>
                              </div>
                              {SAATY_SCALE.map((scale) => (
                                <button
                                  key={scale.value}
                                  onClick={() => handleComparisonChange(i, j, scale.value)}
                                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0
                                    ${Math.abs(value - scale.value) < 0.001 ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{scale.label}</span>
                                    <span className="text-xs text-gray-500">{scale.description}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 범례 및 도움말 */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
          <span>좌측 우위</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
          <span>동등</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
          <span>우측 우위</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
          <span>자동계산 (역수)</span>
        </div>
      </div>

      {/* 척도 안내 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">📋 Saaty 9점 척도 안내</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div><span className="font-medium">1:</span> 동등한 중요도</div>
          <div><span className="font-medium">3:</span> 약간 더 중요</div>
          <div><span className="font-medium">5:</span> 강하게 중요</div>
          <div><span className="font-medium">7:</span> 매우 강하게 중요</div>
          <div><span className="font-medium">9:</span> 절대적으로 중요</div>
          <div><span className="font-medium">2,4,6,8:</span> 중간 값</div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          💡 역수 값(1/3, 1/5 등)은 우측이 좌측보다 중요할 때 사용됩니다.
        </div>
      </div>

      {/* 외부 클릭으로 드롭다운 닫기 */}
      {activeCell && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setActiveCell(null)}
        />
      )}
    </div>
  );
};

export default PairwiseGrid;