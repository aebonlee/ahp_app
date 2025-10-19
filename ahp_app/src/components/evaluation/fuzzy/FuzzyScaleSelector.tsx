/**
 * 퍼지 척도 선택기 컴포넌트
 * 언어적 변수를 삼각퍼지수로 변환하는 UI
 */

import React, { useState } from 'react';
import { TriangularFuzzyNumber } from '../../../types/fuzzy';

interface FuzzyScaleSelectorProps {
  value: TriangularFuzzyNumber;
  linguisticTerm?: string;
  onChange: (value: TriangularFuzzyNumber, term: string) => void;
  leftLabel: string;
  rightLabel: string;
  readOnly?: boolean;
  className?: string;
}

// 표준 퍼지 AHP 척도 (Chang, 1996)
const FUZZY_SCALES = [
  { 
    term: 'Equal', 
    korean: '동등',
    value: { L: 1, M: 1, U: 1 },
    inverseValue: { L: 1, M: 1, U: 1 },
    description: '두 요소가 동등하게 중요'
  },
  { 
    term: 'Weakly Important', 
    korean: '약간 중요',
    value: { L: 1, M: 3, U: 5 },
    inverseValue: { L: 0.2, M: 0.333, U: 1 },
    description: '한 요소가 다른 요소보다 약간 중요'
  },
  { 
    term: 'Fairly Important', 
    korean: '꽤 중요',
    value: { L: 2, M: 4, U: 6 },
    inverseValue: { L: 0.167, M: 0.25, U: 0.5 },
    description: '한 요소가 다른 요소보다 꽤 중요'
  },
  { 
    term: 'Strongly Important', 
    korean: '상당히 중요',
    value: { L: 3, M: 5, U: 7 },
    inverseValue: { L: 0.143, M: 0.2, U: 0.333 },
    description: '한 요소가 다른 요소보다 상당히 중요'
  },
  { 
    term: 'Very Strongly Important', 
    korean: '매우 중요',
    value: { L: 4, M: 6, U: 8 },
    inverseValue: { L: 0.125, M: 0.167, U: 0.25 },
    description: '한 요소가 다른 요소보다 매우 중요'
  },
  { 
    term: 'Demonstrated Important', 
    korean: '명백히 중요',
    value: { L: 5, M: 7, U: 9 },
    inverseValue: { L: 0.111, M: 0.143, U: 0.2 },
    description: '한 요소가 다른 요소보다 명백히 중요'
  },
  { 
    term: 'Absolutely Important', 
    korean: '절대적으로 중요',
    value: { L: 6, M: 8, U: 9 },
    inverseValue: { L: 0.111, M: 0.125, U: 0.167 },
    description: '한 요소가 다른 요소보다 절대적으로 중요'
  },
  { 
    term: 'Extremely Important', 
    korean: '극도로 중요',
    value: { L: 7, M: 9, U: 9 },
    inverseValue: { L: 0.111, M: 0.111, U: 0.143 },
    description: '한 요소가 다른 요소보다 극도로 중요'
  }
];

const FuzzyScaleSelector: React.FC<FuzzyScaleSelectorProps> = ({
  value,
  linguisticTerm = 'Equal',
  onChange,
  leftLabel,
  rightLabel,
  readOnly = false,
  className = ''
}) => {
  const [selectedDirection, setSelectedDirection] = useState<'left' | 'equal' | 'right'>('equal');
  const [selectedScale, setSelectedScale] = useState(linguisticTerm);
  const [hoveredScale, setHoveredScale] = useState<string | null>(null);

  // 척도 선택 처리
  const handleScaleSelect = (scale: typeof FUZZY_SCALES[0], direction: 'left' | 'equal' | 'right') => {
    let fuzzyValue: TriangularFuzzyNumber;
    let term: string;
    
    if (direction === 'equal') {
      fuzzyValue = { L: 1, M: 1, U: 1 };
      term = 'Equal';
    } else if (direction === 'left') {
      fuzzyValue = scale.value;
      term = scale.term;
    } else { // right
      fuzzyValue = scale.inverseValue;
      term = `Inverse_${scale.term}`;
    }
    
    setSelectedDirection(direction);
    setSelectedScale(scale.term);
    onChange(fuzzyValue, term);
  };

  // 현재 선택된 척도 찾기
  const currentScale = FUZZY_SCALES.find(s => s.term === selectedScale) || FUZZY_SCALES[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 방향 선택 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className={`text-center flex-1 ${selectedDirection === 'left' ? 'font-bold' : ''}`}>
          <div className={`inline-block px-4 py-2 rounded-lg ${
            selectedDirection === 'left' ? 'bg-blue-500 text-white' : 'bg-white'
          }`}>
            {leftLabel}
          </div>
        </div>
        
        <div className="px-4">
          <span className="text-gray-500">vs</span>
        </div>
        
        <div className={`text-center flex-1 ${selectedDirection === 'right' ? 'font-bold' : ''}`}>
          <div className={`inline-block px-4 py-2 rounded-lg ${
            selectedDirection === 'right' ? 'bg-green-500 text-white' : 'bg-white'
          }`}>
            {rightLabel}
          </div>
        </div>
      </div>

      {/* 언어적 척도 선택 */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">중요도 선택</h5>
        
        {/* 동등 옵션 */}
        <button
          onClick={() => handleScaleSelect(FUZZY_SCALES[0], 'equal')}
          disabled={readOnly}
          className={`w-full text-left p-3 rounded-lg border transition-colors ${
            selectedDirection === 'equal' 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-gray-300'
          } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">동등</span>
              <span className="ml-2 text-sm text-gray-600">
                (1.0, 1.0, 1.0)
              </span>
            </div>
            {selectedDirection === 'equal' && (
              <span className="text-purple-600">✓</span>
            )}
          </div>
        </button>

        {/* 좌측 우세 옵션들 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mt-3">
            {leftLabel}이(가) 더 중요
          </p>
          {FUZZY_SCALES.slice(1).map((scale) => (
            <button
              key={`left-${scale.term}`}
              onClick={() => handleScaleSelect(scale, 'left')}
              onMouseEnter={() => setHoveredScale(`left-${scale.term}`)}
              onMouseLeave={() => setHoveredScale(null)}
              disabled={readOnly}
              className={`w-full text-left p-2 rounded-lg border transition-colors ${
                selectedDirection === 'left' && selectedScale === scale.term
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{scale.korean}</span>
                  <span className="ml-2 text-xs text-gray-600">
                    ({scale.value.L}, {scale.value.M}, {scale.value.U})
                  </span>
                </div>
                {selectedDirection === 'left' && selectedScale === scale.term && (
                  <span className="text-blue-600">✓</span>
                )}
              </div>
              {hoveredScale === `left-${scale.term}` && (
                <p className="text-xs text-gray-500 mt-1">{scale.description}</p>
              )}
            </button>
          ))}
        </div>

        {/* 우측 우세 옵션들 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mt-3">
            {rightLabel}이(가) 더 중요
          </p>
          {FUZZY_SCALES.slice(1).map((scale) => (
            <button
              key={`right-${scale.term}`}
              onClick={() => handleScaleSelect(scale, 'right')}
              onMouseEnter={() => setHoveredScale(`right-${scale.term}`)}
              onMouseLeave={() => setHoveredScale(null)}
              disabled={readOnly}
              className={`w-full text-left p-2 rounded-lg border transition-colors ${
                selectedDirection === 'right' && selectedScale === scale.term
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{scale.korean} (역)</span>
                  <span className="ml-2 text-xs text-gray-600">
                    ({scale.inverseValue.L.toFixed(3)}, {scale.inverseValue.M.toFixed(3)}, {scale.inverseValue.U.toFixed(3)})
                  </span>
                </div>
                {selectedDirection === 'right' && selectedScale === scale.term && (
                  <span className="text-green-600">✓</span>
                )}
              </div>
              {hoveredScale === `right-${scale.term}` && (
                <p className="text-xs text-gray-500 mt-1">
                  {scale.description.replace('한 요소', rightLabel).replace('다른 요소', leftLabel)}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 현재 선택된 퍼지수 표시 */}
      <div className="p-3 bg-purple-50 rounded-lg">
        <p className="text-sm font-medium text-purple-900">선택된 퍼지수</p>
        <p className="text-lg font-mono text-purple-700">
          ({value.L.toFixed(3)}, {value.M.toFixed(3)}, {value.U.toFixed(3)})
        </p>
      </div>
    </div>
  );
};

export default FuzzyScaleSelector;