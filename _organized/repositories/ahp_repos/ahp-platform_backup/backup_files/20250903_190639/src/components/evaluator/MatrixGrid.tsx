import React from 'react';

interface MatrixGridProps {
  items: string[];
  values: number[][];
  onUpdate: (newValues: number[][]) => void;
}

const MatrixGrid: React.FC<MatrixGridProps> = ({ items, values, onUpdate }) => {
  const scales = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleCellClick = (row: number, col: number, value: number) => {
    if (row === col) return; // 대각선은 항상 1

    const newValues = values.map(row => [...row]);
    newValues[row][col] = value;
    newValues[col][row] = 1 / value; // 역수 관계

    onUpdate(newValues);
  };

  const getCellValue = (row: number, col: number): number => {
    if (row === col) return 1;
    return values[row][col];
  };

  const formatValue = (value: number): string => {
    if (value === 1) return '1';
    if (value > 1) return value.toString();
    return `1/${Math.round(1/value)}`;
  };

  const getCellColor = (row: number, col: number, currentValue: number): string => {
    if (row === col) return 'bg-gray-100'; // 대각선
    if (row > col) return 'bg-gray-50'; // 하삼각 (비활성)
    
    // 상삼각 (활성 영역)
    if (currentValue === 1) return 'bg-white border-gray-300';
    return 'bg-blue-50 border-blue-300';
  };

  return (
    <div className="space-y-4">
      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-32 p-2 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-700">
                비교 항목
              </th>
              {items.map((item, index) => (
                <th key={index} className="p-2 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-700 min-w-[100px]">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((rowItem, row) => (
              <tr key={row}>
                <td className="p-2 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-700">
                  {rowItem}
                </td>
                {items.map((colItem, col) => (
                  <td key={col} className={`p-1 border border-gray-300 ${getCellColor(row, col, getCellValue(row, col))}`}>
                    {row === col ? (
                      // 대각선 - 항상 1
                      <div className="text-center p-2 font-semibold text-gray-700">1</div>
                    ) : row > col ? (
                      // 하삼각 - 자동 계산된 역수 표시
                      <div className="text-center p-2 text-gray-500 text-xs">
                        {formatValue(getCellValue(row, col))}
                      </div>
                    ) : (
                      // 상삼각 - 입력 가능한 영역
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">
                          {rowItem} vs {colItem}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {scales.map((scale) => (
                            <button
                              key={scale}
                              onClick={() => handleCellClick(row, col, scale)}
                              className={`w-6 h-6 text-xs rounded transition-all ${
                                getCellValue(row, col) === scale
                                  ? 'bg-sky-400 text-white border-sky-500 shadow-md' // 하늘색 활성
                                  : 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' // 파랑색 기본
                              } border`}
                            >
                              {scale}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          현재: <span className="font-semibold">{formatValue(getCellValue(row, col))}</span>
                        </div>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 쌍대비교 방법</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 상단 삼각형 영역의 <span className="font-semibold text-blue-800">파랑색 버튼</span>을 클릭하여 중요도를 선택하세요</li>
          <li>• 선택된 값은 <span className="font-semibold text-sky-600">하늘색</span>으로 표시됩니다</li>
          <li>• 대각선은 자동으로 1(동등)이며, 하단 삼각형은 자동으로 역수가 계산됩니다</li>
          <li>• 숫자가 클수록 행 항목이 열 항목보다 더 중요함을 의미합니다</li>
        </ul>
      </div>

      {/* Completion Status */}
      <div className="text-center">
        <div className="text-sm text-gray-600">
          입력 완료: <span className="font-semibold">
            {items.length > 1 ? 
              `${values.slice(0, -1).reduce((count, row, i) => 
                count + row.slice(i + 1).filter(val => val !== 1).length, 0
              )} / ${(items.length * (items.length - 1)) / 2}` 
              : '0 / 0'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatrixGrid;