import React, { useState, useEffect } from 'react';
import { Info, RotateCcw, Save } from 'lucide-react';

interface PairwiseComparisonMatrixProps {
  items: string[];
  title: string;
  onMatrixChange: (matrix: number[][]) => void;
  initialMatrix?: number[][];
  disabled?: boolean;
}

const SCALE_VALUES = [
  { value: 9, label: '9', description: '절대적 중요' },
  { value: 8, label: '8', description: '매우 강한 중요' },
  { value: 7, label: '7', description: '강한 중요' },
  { value: 6, label: '6', description: '강한 중요' },
  { value: 5, label: '5', description: '중요' },
  { value: 4, label: '4', description: '중요' },
  { value: 3, label: '3', description: '조금 중요' },
  { value: 2, label: '2', description: '조금 중요' },
  { value: 1, label: '1', description: '동일한 중요도' },
  { value: 1/2, label: '1/2', description: '조금 덜 중요' },
  { value: 1/3, label: '1/3', description: '조금 덜 중요' },
  { value: 1/4, label: '1/4', description: '덜 중요' },
  { value: 1/5, label: '1/5', description: '덜 중요' },
  { value: 1/6, label: '1/6', description: '강하게 덜 중요' },
  { value: 1/7, label: '1/7', description: '강하게 덜 중요' },
  { value: 1/8, label: '1/8', description: '매우 강하게 덜 중요' },
  { value: 1/9, label: '1/9', description: '절대적으로 덜 중요' },
];

export const PairwiseComparisonMatrix: React.FC<PairwiseComparisonMatrixProps> = ({
  items,
  title,
  onMatrixChange,
  initialMatrix,
  disabled = false
}) => {
  const [matrix, setMatrix] = useState<number[][]>(() => {
    if (initialMatrix) return initialMatrix;
    
    const n = items.length;
    const newMatrix = Array(n).fill(null).map(() => Array(n).fill(1));
    return newMatrix;
  });

  const [showScaleGuide, setShowScaleGuide] = useState(false);

  useEffect(() => {
    onMatrixChange(matrix);
  }, [matrix, onMatrixChange]);

  const updateMatrixValue = (i: number, j: number, value: number) => {
    if (disabled) return;
    
    const newMatrix = matrix.map(row => [...row]);
    newMatrix[i][j] = value;
    newMatrix[j][i] = 1 / value; // 역수 관계 유지
    setMatrix(newMatrix);
  };

  const resetMatrix = () => {
    if (disabled) return;
    
    const n = items.length;
    const newMatrix = Array(n).fill(null).map(() => Array(n).fill(1));
    setMatrix(newMatrix);
  };

  const getCellClassName = (i: number, j: number) => {
    const baseClasses = "text-center border border-gray-300 h-12 w-20";
    
    if (i === j) {
      return `${baseClasses} bg-gray-100 text-gray-600 font-medium`;
    }
    
    if (i > j) {
      return `${baseClasses} bg-blue-50 text-blue-800 font-medium`;
    }
    
    return `${baseClasses} bg-white`;
  };

  const formatValue = (value: number) => {
    if (value === 1) return '1';
    if (value < 1) {
      const denominator = Math.round(1 / value);
      return `1/${denominator}`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowScaleGuide(!showScaleGuide)}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center space-x-1"
          >
            <Info className="w-4 h-4" />
            <span>척도 설명</span>
          </button>
          <button
            onClick={resetMatrix}
            disabled={disabled}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center space-x-1 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>초기화</span>
          </button>
        </div>
      </div>

      {showScaleGuide && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium mb-3">AHP 9점 척도</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-medium">중요도</div>
            <div className="font-medium">척도</div>
            <div className="font-medium">설명</div>
            
            <div>동일한 중요도</div>
            <div>1</div>
            <div>두 요소가 같은 중요도</div>
            
            <div>조금 중요</div>
            <div>3</div>
            <div>한 요소가 다른 요소보다 조금 중요</div>
            
            <div>중요</div>
            <div>5</div>
            <div>한 요소가 다른 요소보다 중요</div>
            
            <div>강한 중요</div>
            <div>7</div>
            <div>한 요소가 다른 요소보다 강하게 중요</div>
            
            <div>절대적 중요</div>
            <div>9</div>
            <div>한 요소가 다른 요소보다 절대적으로 중요</div>
            
            <div className="col-span-3 text-gray-600 mt-2">
              2, 4, 6, 8은 중간값이며, 역수는 반대 관계를 나타냅니다 (예: 1/3은 3의 역)
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-center min-w-[120px]"></th>
              {items.map((item, index) => (
                <th key={index} className="p-2 text-center min-w-[80px] text-sm font-medium">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((rowItem, i) => (
              <tr key={i}>
                <td className="p-2 text-right font-medium text-sm pr-4 min-w-[120px]">
                  {rowItem}
                </td>
                {items.map((colItem, j) => (
                  <td key={j} className="p-1">
                    {i === j ? (
                      <div className={getCellClassName(i, j)}>1</div>
                    ) : i < j ? (
                      <select
                        value={matrix[i][j]}
                        onChange={(e) => updateMatrixValue(i, j, parseFloat(e.target.value))}
                        disabled={disabled}
                        className={`${getCellClassName(i, j)} cursor-pointer hover:bg-blue-100 disabled:cursor-not-allowed`}
                      >
                        {SCALE_VALUES.map((scale) => (
                          <option key={scale.value} value={scale.value}>
                            {scale.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className={getCellClassName(i, j)}>
                        {formatValue(matrix[i][j])}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border border-gray-300"></div>
            <span>입력 영역</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-50 border border-gray-300"></div>
            <span>자동 계산 영역</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
            <span>대각선 (항상 1)</span>
          </div>
        </div>
        <p className="mt-2">
          상단 삼각형에서 값을 입력하면 하단 삼각형은 자동으로 역수가 계산됩니다.
        </p>
      </div>
    </div>
  );
};

export default PairwiseComparisonMatrix;