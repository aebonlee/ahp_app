/**
 * 퍼지 평가 행렬 그리드 컴포넌트
 * 퍼지 쌍대비교 행렬을 표시하고 편집하는 UI
 */

import React, { useState } from 'react';
import FuzzyNumberInput from './FuzzyNumberInput';
import { TriangularFuzzyNumber, FuzzyComparison } from '../../../types/fuzzy';

interface FuzzyMatrixGridProps {
  items: Array<{ id: string; name: string; description?: string }>;
  comparisons: FuzzyComparison[];
  onUpdate: (rowId: string, colId: string, value: TriangularFuzzyNumber) => void;
  readOnly?: boolean;
  showWeights?: boolean;
  weights?: TriangularFuzzyNumber[];
  className?: string;
}

const FuzzyMatrixGrid: React.FC<FuzzyMatrixGridProps> = ({
  items,
  comparisons,
  onUpdate,
  readOnly = false,
  showWeights = false,
  weights = [],
  className = ''
}) => {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const n = items.length;

  // 비교값 조회
  const getComparisonValue = (i: number, j: number): TriangularFuzzyNumber => {
    if (i === j) {
      return { L: 1, M: 1, U: 1 };
    }
    
    const comparison = comparisons.find(
      c => (c.rowId === items[i].id && c.colId === items[j].id) ||
           (c.rowId === items[j].id && c.colId === items[i].id)
    );
    
    if (comparison) {
      if (comparison.rowId === items[i].id) {
        return comparison.fuzzyValue;
      } else {
        // 역수 처리
        return {
          L: 1 / comparison.fuzzyValue.U,
          M: 1 / comparison.fuzzyValue.M,
          U: 1 / comparison.fuzzyValue.L
        };
      }
    }
    
    return { L: 1, M: 1, U: 1 };
  };

  // 셀 편집 처리
  const handleCellEdit = (i: number, j: number, value: TriangularFuzzyNumber) => {
    if (i !== j && !readOnly) {
      onUpdate(items[i].id, items[j].id, value);
    }
  };

  // 퍼지수를 컴팩트하게 표시
  const formatFuzzyCompact = (fuzzy: TriangularFuzzyNumber): string => {
    if (fuzzy.L === fuzzy.M && fuzzy.M === fuzzy.U) {
      return fuzzy.M.toFixed(2);
    }
    return `(${fuzzy.L.toFixed(2)}, ${fuzzy.M.toFixed(2)}, ${fuzzy.U.toFixed(2)})`;
  };

  // 셀 색상 계산 (중요도에 따라)
  const getCellColor = (value: TriangularFuzzyNumber): string => {
    const m = value.M;
    if (m === 1) return 'bg-gray-50';
    if (m > 1) {
      // 파란색 계열 (좌측 우세)
      const intensity = Math.min((m - 1) / 8, 1);
      return `bg-blue-${Math.round(intensity * 200 + 50)}`;
    } else {
      // 녹색 계열 (우측 우세)
      const intensity = Math.min((1 - m) / 0.889, 1); // 1/9 = 0.111
      return `bg-green-${Math.round(intensity * 200 + 50)}`;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 컨트롤 */}
      <div className="flex justify-between items-center">
        <h4 className="font-medium">퍼지 비교 행렬</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('compact')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'compact' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            간단히
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'detailed' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            자세히
          </button>
        </div>
      </div>

      {/* 행렬 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100"></th>
              {items.map((item) => (
                <th 
                  key={item.id}
                  className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium"
                >
                  <div>{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-600 font-normal mt-1">
                      {item.description}
                    </div>
                  )}
                </th>
              ))}
              {showWeights && weights.length > 0 && (
                <th className="border border-gray-300 p-2 bg-purple-100 text-sm font-medium">
                  퍼지 가중치
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((rowItem, i) => (
              <tr key={rowItem.id}>
                <th className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium text-left">
                  <div>{rowItem.name}</div>
                  {rowItem.description && (
                    <div className="text-xs text-gray-600 font-normal mt-1">
                      {rowItem.description}
                    </div>
                  )}
                </th>
                {items.map((colItem, j) => {
                  const value = getComparisonValue(i, j);
                  const isSelected = selectedCell && selectedCell[0] === i && selectedCell[1] === j;
                  const isDiagonal = i === j;
                  
                  return (
                    <td
                      key={`${i}-${j}`}
                      className={`border border-gray-300 p-1 text-center cursor-pointer
                        ${isDiagonal ? 'bg-gray-200' : getCellColor(value)}
                        ${isSelected ? 'ring-2 ring-purple-500' : ''}
                      `}
                      onClick={() => !isDiagonal && setSelectedCell([i, j])}
                    >
                      {viewMode === 'compact' ? (
                        <div className="text-sm">
                          {formatFuzzyCompact(value)}
                        </div>
                      ) : (
                        <div className="p-1">
                          {isDiagonal ? (
                            <span className="text-gray-500">1.0</span>
                          ) : (
                            isSelected && !readOnly ? (
                              <FuzzyNumberInput
                                value={value}
                                onChange={(newValue) => handleCellEdit(i, j, newValue)}
                                readOnly={readOnly}
                                showVisual={false}
                                className="scale-75"
                              />
                            ) : (
                              <div className="text-xs">
                                <div>L: {value.L.toFixed(3)}</div>
                                <div>M: {value.M.toFixed(3)}</div>
                                <div>U: {value.U.toFixed(3)}</div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                {showWeights && weights.length > i && (
                  <td className="border border-gray-300 p-2 bg-purple-50 text-sm">
                    <div className="font-mono">
                      ({weights[i].L.toFixed(3)}, {weights[i].M.toFixed(3)}, {weights[i].U.toFixed(3)})
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div className="flex items-center space-x-4 text-xs">
        <span className="font-medium">범례:</span>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-300"></div>
          <span>동등 (1,1,1)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-blue-100 border border-gray-300"></div>
          <span>행 우세</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-green-100 border border-gray-300"></div>
          <span>열 우세</span>
        </div>
      </div>

      {/* 편집 안내 */}
      {!readOnly && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 셀을 클릭하여 퍼지수를 편집할 수 있습니다. 
            대각선 아래 셀은 자동으로 역수가 계산됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default FuzzyMatrixGrid;