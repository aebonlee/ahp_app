import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import { ComparisonMatrix } from '../../types/ahp';

interface PairwiseComparisonProps {
  items: Array<{ id: string; name: string; description?: string }>;
  title: string;
  description?: string;
  onComplete: (matrix: ComparisonMatrix) => void;
  onBack?: () => void;
  savedMatrix?: ComparisonMatrix;
}

const PairwiseComparison: React.FC<PairwiseComparisonProps> = ({
  items,
  title,
  description,
  onComplete,
  onBack,
  savedMatrix
}) => {
  const n = items.length;
  const [matrix, setMatrix] = useState<number[][]>(() => {
    if (savedMatrix?.matrix) {
      return savedMatrix.matrix;
    }
    // Initialize with identity matrix
    return Array(n).fill(null).map((_, i) => 
      Array(n).fill(null).map((_, j) => i === j ? 1 : 0)
    );
  });

  const [currentPair, setCurrentPair] = useState<[number, number]>(() => {
    // Find first incomplete comparison
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix[i][j] === 0) {
          return [i, j];
        }
      }
    }
    return [0, 1];
  });

  const [completedComparisons, setCompletedComparisons] = useState(0);
  const totalComparisons = (n * (n - 1)) / 2;

  // Saaty scale values
  const scaleValues = [
    { value: 1/9, label: '극도로 덜 중요', color: 'bg-red-600' },
    { value: 1/7, label: '매우 덜 중요', color: 'bg-red-500' },
    { value: 1/5, label: '덜 중요', color: 'bg-red-400' },
    { value: 1/3, label: '약간 덜 중요', color: 'bg-red-300' },
    { value: 1, label: '동등', color: 'bg-gray-400' },
    { value: 3, label: '약간 중요', color: 'bg-blue-300' },
    { value: 5, label: '중요', color: 'bg-blue-400' },
    { value: 7, label: '매우 중요', color: 'bg-blue-500' },
    { value: 9, label: '극도로 중요', color: 'bg-blue-600' }
  ];

  useEffect(() => {
    // Count completed comparisons
    let count = 0;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix[i][j] !== 0) {
          count++;
        }
      }
    }
    setCompletedComparisons(count);
  }, [matrix, n]);

  const handleComparison = (value: number) => {
    const [i, j] = currentPair;
    const newMatrix = [...matrix.map(row => [...row])];
    newMatrix[i][j] = value;
    newMatrix[j][i] = 1 / value;
    setMatrix(newMatrix);

    // Find next pair
    let nextPair: [number, number] | null = null;
    for (let row = i; row < n - 1; row++) {
      const startCol = row === i ? j + 1 : row + 1;
      for (let col = startCol; col < n; col++) {
        if (newMatrix[row][col] === 0) {
          nextPair = [row, col];
          break;
        }
      }
      if (nextPair) break;
    }

    if (nextPair) {
      setCurrentPair(nextPair);
    } else {
      // All comparisons complete
      handleComplete(newMatrix);
    }
  };

  const handleComplete = (finalMatrix: number[][]) => {
    const comparisonMatrix: ComparisonMatrix = {
      size: finalMatrix.length,
      matrix: finalMatrix,
      rowLabels: items.map(item => item.name),
      columnLabels: items.map(item => item.name),
      consistencyRatio: calculateConsistencyRatio(finalMatrix)
    };
    onComplete(comparisonMatrix);
  };

  const calculateConsistencyRatio = (mat: number[][]): number => {
    // Simplified CR calculation
    // In production, use proper eigenvalue calculation
    return 0.05; // Placeholder
  };

  const goToPreviousPair = () => {
    for (let i = currentPair[0]; i >= 0; i--) {
      const endCol = i === currentPair[0] ? currentPair[1] - 1 : n - 1;
      for (let j = endCol; j > i; j--) {
        if (matrix[i][j] !== 0) {
          setCurrentPair([i, j]);
          return;
        }
      }
    }
  };

  const progress = (completedComparisons / totalComparisons) * 100;

  return (
    <div className="space-y-6">
      <Card title={title}>
        {description && (
          <p className="text-gray-600 mb-6">{description}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>진행률</span>
            <span>{completedComparisons} / {totalComparisons} 비교 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Comparison */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-center mb-6">
            다음 두 항목 중 어느 것이 더 중요합니까?
          </h3>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <h4 className="text-xl font-bold text-gray-900">
                  {items[currentPair[0]].name}
                </h4>
                {items[currentPair[0]].description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {items[currentPair[0]].description}
                  </p>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <h4 className="text-xl font-bold text-gray-900">
                  {items[currentPair[1]].name}
                </h4>
                {items[currentPair[1]].description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {items[currentPair[1]].description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scale Buttons */}
          <div className="space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                ← {items[currentPair[0]].name}
              </span>
              <span className="text-sm text-gray-500 mx-4">vs</span>
              <span className="text-sm font-medium text-gray-700">
                {items[currentPair[1]].name} →
              </span>
            </div>

            <div className="flex justify-center space-x-2">
              {scaleValues.map((scale, index) => (
                <button
                  key={index}
                  onClick={() => handleComparison(scale.value)}
                  className={`${scale.color} text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity`}
                  title={scale.label}
                >
                  {scale.value < 1 
                    ? `1/${Math.round(1/scale.value)}`
                    : scale.value === 1 
                    ? '='
                    : scale.value}
                </button>
              ))}
            </div>

            <div className="text-center text-xs text-gray-500">
              {scaleValues.map(s => s.label).join(' | ')}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={completedComparisons > 0 ? goToPreviousPair : onBack}
            disabled={!onBack && completedComparisons === 0}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            {completedComparisons > 0 ? '이전 비교' : '뒤로'}
          </Button>

          {completedComparisons === totalComparisons && (
            <Button
              variant="primary"
              onClick={() => handleComplete(matrix)}
            >
              완료
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Comparison Matrix Preview (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">비교 행렬 (개발용)</h4>
            <div className="overflow-x-auto">
              <table className="text-xs">
                <tbody>
                  {matrix.map((row, i) => (
                    <tr key={i}>
                      {row.map((val, j) => (
                        <td key={j} className="px-2 py-1 text-center border border-gray-300">
                          {val === 0 ? '-' : val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PairwiseComparison;