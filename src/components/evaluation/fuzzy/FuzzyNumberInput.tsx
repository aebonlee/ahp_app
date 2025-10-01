/**
 * 삼각퍼지수 입력 컴포넌트
 * L (Lower), M (Modal), U (Upper) 값을 입력받는 UI
 */

import React, { useState, useEffect } from 'react';
import { TriangularFuzzyNumber } from '../../../types/fuzzy';

interface FuzzyNumberInputProps {
  value: TriangularFuzzyNumber;
  onChange: (value: TriangularFuzzyNumber) => void;
  label?: string;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  showVisual?: boolean;
  className?: string;
}

const FuzzyNumberInput: React.FC<FuzzyNumberInputProps> = ({
  value,
  onChange,
  label,
  readOnly = false,
  min = 0.111,
  max = 9,
  step = 0.001,
  showVisual = true,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState<TriangularFuzzyNumber>(value);
  const [errors, setErrors] = useState<{ L?: string; M?: string; U?: string }>({});

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 유효성 검사
  const validateFuzzyNumber = (fuzzy: TriangularFuzzyNumber): boolean => {
    const newErrors: { L?: string; M?: string; U?: string } = {};
    
    // L ≤ M ≤ U 조건 확인
    if (fuzzy.L > fuzzy.M) {
      newErrors.L = 'L은 M보다 작거나 같아야 합니다';
    }
    if (fuzzy.M > fuzzy.U) {
      newErrors.U = 'U는 M보다 크거나 같아야 합니다';
    }
    
    // 범위 확인
    if (fuzzy.L < min || fuzzy.L > max) {
      newErrors.L = `L은 ${min}과 ${max} 사이여야 합니다`;
    }
    if (fuzzy.M < min || fuzzy.M > max) {
      newErrors.M = `M은 ${min}과 ${max} 사이여야 합니다`;
    }
    if (fuzzy.U < min || fuzzy.U > max) {
      newErrors.U = `U는 ${min}과 ${max} 사이여야 합니다`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 값 변경 처리
  const handleChange = (field: 'L' | 'M' | 'U', inputValue: string) => {
    const numValue = parseFloat(inputValue);
    
    if (isNaN(numValue)) return;
    
    const newValue = { ...localValue, [field]: numValue };
    setLocalValue(newValue);
    
    // 자동 조정 옵션
    if (field === 'M') {
      // M이 변경되면 L과 U를 적절히 조정
      if (newValue.L > newValue.M) {
        newValue.L = newValue.M;
      }
      if (newValue.U < newValue.M) {
        newValue.U = newValue.M;
      }
    } else if (field === 'L' && newValue.L > newValue.M) {
      // L이 M보다 크면 M도 조정
      newValue.M = newValue.L;
      if (newValue.U < newValue.M) {
        newValue.U = newValue.M;
      }
    } else if (field === 'U' && newValue.U < newValue.M) {
      // U가 M보다 작으면 M도 조정
      newValue.M = newValue.U;
      if (newValue.L > newValue.M) {
        newValue.L = newValue.M;
      }
    }
    
    if (validateFuzzyNumber(newValue)) {
      onChange(newValue);
    }
  };

  // 시각적 표현 (삼각형 그래프)
  const renderTriangleVisualization = () => {
    if (!showVisual) return null;
    
    const width = 200;
    const height = 60;
    const padding = 10;
    
    // 값을 0-1 범위로 정규화
    const normalize = (val: number) => {
      const range = max - min;
      return ((val - min) / range) * (width - 2 * padding) + padding;
    };
    
    const lPos = normalize(localValue.L);
    const mPos = normalize(localValue.M);
    const uPos = normalize(localValue.U);
    
    const trianglePath = `M ${lPos},${height - padding} L ${mPos},${padding} L ${uPos},${height - padding}`;
    
    return (
      <svg width={width} height={height} className="mt-2">
        {/* 배경 그리드 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* 삼각형 */}
        <path
          d={trianglePath}
          fill="rgba(147, 51, 234, 0.2)"
          stroke="rgb(147, 51, 234)"
          strokeWidth="2"
        />
        
        {/* 점 표시 */}
        <circle cx={lPos} cy={height - padding} r="4" fill="#8b5cf6" />
        <circle cx={mPos} cy={padding} r="4" fill="#8b5cf6" />
        <circle cx={uPos} cy={height - padding} r="4" fill="#8b5cf6" />
        
        {/* 레이블 */}
        <text x={lPos} y={height - 2} textAnchor="middle" fontSize="10" fill="#666">
          L
        </text>
        <text x={mPos} y={8} textAnchor="middle" fontSize="10" fill="#666">
          M
        </text>
        <text x={uPos} y={height - 2} textAnchor="middle" fontSize="10" fill="#666">
          U
        </text>
      </svg>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="grid grid-cols-3 gap-3">
        {/* L 입력 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            L (Lower)
          </label>
          <input
            type="number"
            value={localValue.L}
            onChange={(e) => handleChange('L', e.target.value)}
            min={min}
            max={max}
            step={step}
            disabled={readOnly}
            className={`w-full px-2 py-1 border rounded ${
              errors.L ? 'border-red-300' : 'border-gray-300'
            } ${readOnly ? 'bg-gray-100' : ''}`}
          />
          {errors.L && (
            <p className="text-xs text-red-600 mt-1">{errors.L}</p>
          )}
        </div>
        
        {/* M 입력 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            M (Modal)
          </label>
          <input
            type="number"
            value={localValue.M}
            onChange={(e) => handleChange('M', e.target.value)}
            min={min}
            max={max}
            step={step}
            disabled={readOnly}
            className={`w-full px-2 py-1 border rounded ${
              errors.M ? 'border-red-300' : 'border-gray-300'
            } ${readOnly ? 'bg-gray-100' : ''}`}
          />
          {errors.M && (
            <p className="text-xs text-red-600 mt-1">{errors.M}</p>
          )}
        </div>
        
        {/* U 입력 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            U (Upper)
          </label>
          <input
            type="number"
            value={localValue.U}
            onChange={(e) => handleChange('U', e.target.value)}
            min={min}
            max={max}
            step={step}
            disabled={readOnly}
            className={`w-full px-2 py-1 border rounded ${
              errors.U ? 'border-red-300' : 'border-gray-300'
            } ${readOnly ? 'bg-gray-100' : ''}`}
          />
          {errors.U && (
            <p className="text-xs text-red-600 mt-1">{errors.U}</p>
          )}
        </div>
      </div>
      
      {/* 퍼지수 표기 */}
      <div className="text-sm text-gray-600 text-center">
        ({localValue.L.toFixed(3)}, {localValue.M.toFixed(3)}, {localValue.U.toFixed(3)})
      </div>
      
      {/* 시각화 */}
      <div className="flex justify-center">
        {renderTriangleVisualization()}
      </div>
    </div>
  );
};

export default FuzzyNumberInput;