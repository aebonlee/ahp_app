import React, { useState, useEffect, useCallback } from 'react';
import { buildComparisonMatrix, calculateAHP, getConsistencyColor, getConsistencyLevel } from '../../utils/ahpCalculator';
import type { ComparisonInput } from '../../utils/ahpCalculator';

interface Element {
  id: string;
  name: string;
  description?: string;
}

interface PairwiseComparisonMatrixProps {
  elements: Element[];
  title: string;
  onComplete?: (results: any) => void;
  savedComparisons?: ComparisonInput[];
}

const SCALE_VALUES = [
  { value: 1/9, label: '1/9', description: 'Extremely less important' },
  { value: 1/7, label: '1/7', description: 'Very strongly less important' },
  { value: 1/5, label: '1/5', description: 'Strongly less important' },
  { value: 1/3, label: '1/3', description: 'Moderately less important' },
  { value: 1, label: '1', description: 'Equal importance' },
  { value: 3, label: '3', description: 'Moderately more important' },
  { value: 5, label: '5', description: 'Strongly more important' },
  { value: 7, label: '7', description: 'Very strongly more important' },
  { value: 9, label: '9', description: 'Extremely more important' },
];

const PairwiseComparisonMatrix: React.FC<PairwiseComparisonMatrixProps> = ({
  elements,
  title,
  onComplete,
  savedComparisons = []
}) => {
  const [comparisons, setComparisons] = useState<ComparisonInput[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [results, setResults] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize comparisons
  useEffect(() => {
    if (savedComparisons.length > 0) {
      setComparisons(savedComparisons);
      return;
    }

    // Create initial comparison pairs
    const initialComparisons: ComparisonInput[] = [];
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        initialComparisons.push({
          element1_id: elements[i].id,
          element2_id: elements[j].id,
          value: 1,
          i,
          j
        });
      }
    }
    setComparisons(initialComparisons);
  }, [elements, savedComparisons]);

  // Update matrix when comparisons change
  useEffect(() => {
    if (comparisons.length > 0) {
      const newMatrix = buildComparisonMatrix(elements, comparisons);
      setMatrix(newMatrix);
      
      // Calculate results
      const ahpResults = calculateAHP(newMatrix);
      setResults(ahpResults);
      
      // Check if all comparisons are done (no value = 1 except diagonal)
      const allCompleted = comparisons.every(comp => comp.value !== 1);
      setIsCompleted(allCompleted);
    }
  }, [comparisons, elements]);

  const updateComparison = useCallback((index: number, value: number) => {
    setComparisons(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  }, []);

  const handleComplete = useCallback(() => {
    if (results && onComplete) {
      onComplete({
        matrix,
        comparisons,
        results,
        elements
      });
    }
  }, [matrix, comparisons, results, elements, onComplete]);

  const getElementName = (id: string) => {
    return elements.find(e => e.id === id)?.name || id;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      
      {/* Pairwise Comparisons */}
      <div className="space-y-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-700">Pairwise Comparisons</h3>
        {comparisons.map((comp, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">
                {getElementName(comp.element1_id)}
              </span>
              <span className="text-gray-500 mx-4">vs</span>
              <span className="font-medium text-gray-700">
                {getElementName(comp.element2_id)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={SCALE_VALUES.findIndex(s => s.value === comp.value)}
                  onChange={(e) => {
                    const scaleIndex = parseInt(e.target.value);
                    updateComparison(index, SCALE_VALUES[scaleIndex].value);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>← {getElementName(comp.element1_id)}</span>
                  <span>Equal</span>
                  <span>{getElementName(comp.element2_id)} →</span>
                </div>
              </div>
              
              <div className="w-32 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {SCALE_VALUES.find(s => s.value === comp.value)?.label}
                </div>
                <div className="text-xs text-gray-500">
                  {SCALE_VALUES.find(s => s.value === comp.value)?.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Matrix Display */}
      {matrix.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Comparison Matrix</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100"></th>
                  {elements.map((element) => (
                    <th key={element.id} className="border border-gray-300 p-2 bg-gray-100 text-sm">
                      {element.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-2 bg-gray-100 font-medium text-sm">
                      {elements[i].name}
                    </td>
                    {row.map((value, j) => (
                      <td key={j} className={`border border-gray-300 p-2 text-center text-sm ${
                        i === j ? 'bg-gray-200' : ''
                      }`}>
                        {value < 1 ? `1/${Math.round(1/value)}` : Math.round(value * 100) / 100}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Results</h3>
          
          {/* Consistency Check */}
          <div className={`p-4 rounded-lg mb-4 ${
            results.isConsistent ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Consistency Ratio (CR): </span>
                <span className={`font-bold text-${getConsistencyColor(results.consistencyRatio)}-600`}>
                  {(results.consistencyRatio * 100).toFixed(2)}%
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                results.isConsistent 
                  ? 'bg-green-200 text-green-800' 
                  : 'bg-red-200 text-red-800'
              }`}>
                {getConsistencyLevel(results.consistencyRatio)}
              </div>
            </div>
            {!results.isConsistent && (
              <p className="text-red-600 text-sm mt-2">
                ⚠️ Inconsistent comparisons detected. Please review your judgments.
              </p>
            )}
          </div>

          {/* Priorities */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Priority Weights:</h4>
            <div className="space-y-2">
              {elements.map((element, index) => (
                <div key={element.id} className="flex items-center justify-between">
                  <span className="font-medium">{element.name}</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-4 mr-3">
                      <div 
                        className="bg-blue-500 h-4 rounded-full"
                        style={{ width: `${results.priorities[index] * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-blue-600 w-20 text-right">
                      {(results.priorities[index] * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lambda Max */}
          <div className="mt-4 text-sm text-gray-600">
            <span>λmax = {results.lambdaMax.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            // Reset comparisons
            const resetComparisons = comparisons.map(comp => ({
              ...comp,
              value: 1
            }));
            setComparisons(resetComparisons);
          }}
          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Reset
        </button>
        <button
          onClick={handleComplete}
          disabled={!isCompleted || !results?.isConsistent}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            isCompleted && results?.isConsistent
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Complete & Save
        </button>
      </div>
    </div>
  );
};

export default PairwiseComparisonMatrix;