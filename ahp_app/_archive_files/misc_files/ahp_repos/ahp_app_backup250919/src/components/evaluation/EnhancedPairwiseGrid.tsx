/**
 * 고급 AHP 쌍대비교 격자 컴포넌트
 * n×n 매트릭스에서 상삼각만 활성화, 9점 척도 버튼 제공
 */

import React, { useState, useEffect } from 'react';

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

interface EnhancedPairwiseGridProps {
  elements: Element[];
  initialComparisons?: PairwiseComparison[];
  onComparisonChange: (comparisons: PairwiseComparison[]) => void;
  onConsistencyChange?: (cr: number, isConsistent: boolean) => void;
  disabled?: boolean;
  showProgress?: boolean;
  title?: string;
}

// Saaty 9점 척도
const SAATY_SCALE = [
  { value: 9, label: '9', description: '절대 우위', color: 'bg-red-600' },
  { value: 8, label: '8', description: '매우 강한 우위+', color: 'bg-red-500' },
  { value: 7, label: '7', description: '매우 강한 우위', color: 'bg-red-400' },
  { value: 6, label: '6', description: '강한 우위+', color: 'bg-orange-500' },
  { value: 5, label: '5', description: '강한 우위', color: 'bg-orange-400' },
  { value: 4, label: '4', description: '약간 강한 우위+', color: 'bg-yellow-500' },
  { value: 3, label: '3', description: '약간 우위', color: 'bg-yellow-400' },
  { value: 2, label: '2', description: '약간 우위-', color: 'bg-green-400' },
  { value: 1, label: '1', description: '동등', color: 'bg-gray-400' },
  { value: 1/2, label: '1/2', description: '약간 열위-', color: 'bg-green-400' },
  { value: 1/3, label: '1/3', description: '약간 열위', color: 'bg-yellow-400' },
  { value: 1/4, label: '1/4', description: '약간 강한 열위+', color: 'bg-yellow-500' },
  { value: 1/5, label: '1/5', description: '강한 열위', color: 'bg-orange-400' },
  { value: 1/6, label: '1/6', description: '강한 열위+', color: 'bg-orange-500' },
  { value: 1/7, label: '1/7', description: '매우 강한 열위', color: 'bg-red-400' },
  { value: 1/8, label: '1/8', description: '매우 강한 열위+', color: 'bg-red-500' },
  { value: 1/9, label: '1/9', description: '절대 열위', color: 'bg-red-600' }
];

const EnhancedPairwiseGrid: React.FC<EnhancedPairwiseGridProps> = ({
  elements,
  initialComparisons = [],
  onComparisonChange,
  onConsistencyChange,
  disabled = false,
  showProgress = true,
  title = "쌍대비교 평가"
}) => {
  const [comparisons, setComparisons] = useState<Map<string, number>>(new Map());
  const [selectedCell, setSelectedCell] = useState<{i: number, j: number} | null>(null);
  const [consistencyRatio, setConsistencyRatio] = useState<number>(0);

  useEffect(() => {
    // Initialize comparisons from props
    const comparisonMap = new Map<string, number>();
    initialComparisons.forEach(comp => {
      comparisonMap.set(`${comp.i}-${comp.j}`, comp.value);
    });
    setComparisons(comparisonMap);
  }, [initialComparisons]);

  const handleComparisonChange = (i: number, j: number, value: number) => {
    const newComparisons = new Map(comparisons);
    newComparisons.set(`${i}-${j}`, value);
    setComparisons(newComparisons);

    // Convert to array format for parent component
    const comparisonArray: PairwiseComparison[] = [];
    newComparisons.forEach((val, key) => {
      const [iStr, jStr] = key.split('-');
      comparisonArray.push({
        i: parseInt(iStr),
        j: parseInt(jStr),
        value: val
      });
    });

    onComparisonChange(comparisonArray);

    // Calculate consistency ratio (simplified)
    const cr = calculateConsistencyRatio(newComparisons, elements.length);
    setConsistencyRatio(cr);
    if (onConsistencyChange) {
      onConsistencyChange(cr, cr <= 0.1);
    }
  };

  const calculateConsistencyRatio = (compMap: Map<string, number>, n: number): number => {
    // Simplified CR calculation - in production, use proper eigenvalue method
    const totalComparisons = (n * (n - 1)) / 2;
    const madeComparisons = compMap.size;
    
    if (madeComparisons === 0) return 0;
    
    // Simple heuristic based on how many comparisons deviate from transitivity
    let inconsistencies = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          const aij = compMap.get(`${i}-${j}`) || 1;
          const ajk = compMap.get(`${j}-${k}`) || 1;
          const aik = compMap.get(`${i}-${k}`) || 1;
          
          const expected = aij * ajk;
          const actual = aik;
          
          if (Math.abs(Math.log(expected) - Math.log(actual)) > 0.5) {
            inconsistencies++;
          }
        }
      }
    }
    
    return Math.min(inconsistencies / totalComparisons, 1);
  };

  const getComparisonValue = (i: number, j: number): number => {
    if (i === j) return 1;
    if (i < j) {
      return comparisons.get(`${i}-${j}`) || 1;
    } else {
      const value = comparisons.get(`${j}-${i}`) || 1;
      return 1 / value;
    }
  };

  const getValueColor = (value: number): string => {
    const scale = SAATY_SCALE.find(s => s.value === value);
    return scale ? scale.color : 'bg-gray-300';
  };

  const getValueLabel = (value: number): string => {
    if (value === 1) return '1';
    if (value > 1) return value.toString();
    return `1/${(1/value).toString()}`;
  };

  const totalComparisons = (elements.length * (elements.length - 1)) / 2;
  const madeComparisons = comparisons.size;
  const progressPercentage = (madeComparisons / totalComparisons) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        
        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>진행도: {madeComparisons}/{totalComparisons} 비교 완료</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {madeComparisons > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">일관성 비율 (CR):</span>
              <span className={`font-bold ${
                consistencyRatio <= 0.1 ? 'text-green-600' : 
                consistencyRatio <= 0.2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(consistencyRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {consistencyRatio <= 0.1 ? '✓ 일관성이 양호합니다' :
               consistencyRatio <= 0.2 ? '⚠ 일관성을 검토해주세요' : '✗ 일관성이 부족합니다'}
            </div>
          </div>
        )}
      </div>

      {/* 쌍대비교 매트릭스 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-gray-100 text-center font-medium text-gray-700 border">
                기준
              </th>
              {elements.map((element, index) => (
                <th key={element.id} className="p-3 bg-gray-100 text-center font-medium text-gray-700 border min-w-[120px]">
                  <div className="text-xs truncate" title={element.name}>
                    {element.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map((rowElement, i) => (
              <tr key={rowElement.id}>
                <td className="p-3 bg-gray-100 font-medium text-gray-700 border text-center">
                  <div className="text-xs truncate" title={rowElement.name}>
                    {rowElement.name}
                  </div>
                </td>
                {elements.map((colElement, j) => {
                  const isUpperTriangle = i < j;
                  const isDiagonal = i === j;
                  const value = getComparisonValue(i, j);
                  
                  return (
                    <td key={`${i}-${j}`} className="border">
                      {isDiagonal ? (
                        <div className="p-3 text-center bg-gray-200 font-bold">1</div>
                      ) : isUpperTriangle && !disabled ? (
                        <button
                          onClick={() => setSelectedCell({i, j})}
                          className={`w-full p-3 text-center hover:bg-blue-50 transition-colors ${
                            selectedCell?.i === i && selectedCell?.j === j ? 'ring-2 ring-blue-500' : ''
                          } ${getValueColor(value)} text-white font-medium`}
                        >
                          {getValueLabel(value)}
                        </button>
                      ) : (
                        <div className={`p-3 text-center ${getValueColor(value)} text-white font-medium`}>
                          {getValueLabel(value)}
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

      {/* 평가 스케일 */}
      {selectedCell && !disabled && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">
            "{elements[selectedCell.i].name}" vs "{elements[selectedCell.j].name}" 비교
          </h4>
          <div className="grid grid-cols-5 md:grid-cols-9 gap-2">
            {SAATY_SCALE.filter(scale => scale.value >= 1).reverse().map((scale) => (
              <button
                key={scale.value}
                onClick={() => handleComparisonChange(selectedCell.i, selectedCell.j, scale.value)}
                className={`p-2 text-white text-sm rounded-lg hover:opacity-80 transition-opacity ${scale.color}`}
                title={scale.description}
              >
                {scale.label}
              </button>
            ))}
          </div>
          <div className="text-center my-2 text-gray-600 text-sm">
            ← {elements[selectedCell.j].name} 우위 | 동등 | {elements[selectedCell.i].name} 우위 →
          </div>
          <div className="grid grid-cols-5 md:grid-cols-8 gap-2">
            {SAATY_SCALE.filter(scale => scale.value < 1).map((scale) => (
              <button
                key={scale.value}
                onClick={() => handleComparisonChange(selectedCell.i, selectedCell.j, scale.value)}
                className={`p-2 text-white text-sm rounded-lg hover:opacity-80 transition-opacity ${scale.color}`}
                title={scale.description}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 평가 가이드</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 상위 삼각형 셀을 클릭하여 두 기준을 비교하세요</li>
          <li>• 1: 동등, 3: 약간 우위, 5: 강한 우위, 7: 매우 강한 우위, 9: 절대 우위</li>
          <li>• 일관성 비율(CR)이 10% 이하가 되도록 조정하세요</li>
          <li>• 하위 삼각형은 자동으로 역수로 채워집니다</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedPairwiseGrid;