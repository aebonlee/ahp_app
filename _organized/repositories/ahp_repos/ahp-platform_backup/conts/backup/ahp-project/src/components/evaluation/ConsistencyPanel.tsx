import React, { useState, useEffect } from 'react';
import { analyzeConsistency, getRealtimeConsistencyFeedback, ConsistencyAnalysis } from '../../utils/consistencyHelper';
import { getConsistencyLevel } from '../../utils/ahpCalculator';

interface ConsistencyPanelProps {
  matrix: number[][];
  elementNames: string[];
  onSuggestionApply?: (i: number, j: number, newValue: number) => void;
  recentChange?: { i: number; j: number; oldValue: number; newValue: number };
  className?: string;
}

const ConsistencyPanel: React.FC<ConsistencyPanelProps> = ({
  matrix,
  elementNames,
  onSuggestionApply,
  recentChange,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<ConsistencyAnalysis | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (matrix.length >= 3) {
      setLoading(true);
      // Simulate analysis delay for better UX
      const timer = setTimeout(() => {
        const result = analyzeConsistency(matrix, elementNames);
        setAnalysis(result);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [matrix, elementNames]);

  const realtimeFeedback = getRealtimeConsistencyFeedback(matrix, elementNames, recentChange);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'acceptable': return '⚠️';
      case 'poor': return '🔴';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'acceptable': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatValue = (value: number): string => {
    if (value === 1) return '1';
    if (value > 1) return value.toFixed(2);
    return `1/${(1/value).toFixed(2)}`;
  };

  const handleApplySuggestion = (i: number, j: number, newValue: number) => {
    if (onSuggestionApply) {
      onSuggestionApply(i, j, newValue);
    }
  };

  if (matrix.length < 3) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-sm text-gray-600">
          ℹ️ 일관성 검사는 3개 이상의 요소가 필요합니다.
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Real-time Feedback */}
      <div className={`p-4 border rounded-lg ${getStatusColor(realtimeFeedback.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon(realtimeFeedback.status)}</span>
            <div>
              <div className="font-medium">
                일관성 비율: {(realtimeFeedback.currentCR * 100).toFixed(1)}% 
                <span className="ml-2 text-sm">
                  ({getConsistencyLevel(realtimeFeedback.currentCR)})
                </span>
              </div>
              <div className="text-sm mt-1">{realtimeFeedback.message}</div>
              {realtimeFeedback.impact && (
                <div className="text-xs mt-1 opacity-75">{realtimeFeedback.impact}</div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm border rounded hover:bg-white/50 transition-colors"
          >
            {showDetails ? '간단히' : '자세히'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>0%</span>
            <span className="font-medium">일관성 수준</span>
            <span>10%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                realtimeFeedback.currentCR <= 0.05 ? 'bg-green-500' :
                realtimeFeedback.currentCR <= 0.08 ? 'bg-blue-500' :
                realtimeFeedback.currentCR <= 0.10 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((realtimeFeedback.currentCR / 0.1) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      {showDetails && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">일관성 분석 중...</span>
              </div>
            </div>
          ) : analysis && (
            <>
              {/* Suggestions */}
              {analysis.worstPairs.length > 0 && (
                <div className="p-4 bg-white border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                    💡 개선 제안 
                    <span className="ml-2 text-sm text-orange-600">
                      (예상 개선: {((analysis.currentCR - analysis.improvementPotential) * 100).toFixed(1)}%p)
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {analysis.worstPairs.slice(0, 3).map((pair, index) => (
                      <div key={index} className="p-3 bg-orange-50 rounded border border-orange-100">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              "{pair.element1}" vs "{pair.element2}"
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              현재: {formatValue(pair.currentValue)} → 권장: {formatValue(pair.suggestedValue)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              신뢰도: {(pair.confidence * 100).toFixed(0)}% | 
                              개선 효과: {(pair.impactOnCR * 100).toFixed(1)}%p
                            </div>
                          </div>
                          {onSuggestionApply && (
                            <button
                              onClick={() => {
                                const i = elementNames.indexOf(pair.element1);
                                const j = elementNames.indexOf(pair.element2);
                                if (i >= 0 && j >= 0) {
                                  handleApplySuggestion(i, j, pair.suggestedValue);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                            >
                              적용
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {analysis.worstPairs.length > 3 && (
                    <div className="mt-3 text-sm text-gray-600">
                      그 외 {analysis.worstPairs.length - 3}개의 추가 개선점이 있습니다.
                    </div>
                  )}
                </div>
              )}

              {/* Text Suggestions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3">📋 상세 가이드</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className={suggestion.trim() === '' ? 'h-2' : ''}>
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>

              {/* Consistency Scale Reference */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">📏 일관성 척도 기준</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>0-5%: 훌륭함</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>5-8%: 양호함</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>8-10%: 허용 가능</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>10%+: 개선 필요</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  💡 10%를 초과하면 판단을 재검토하는 것이 좋습니다.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsistencyPanel;