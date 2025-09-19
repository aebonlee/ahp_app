import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConsistencyCheckProps {
  consistencyRatio: number;
  matrixSize: number;
  onImproveConsistency?: () => void;
  detailed?: boolean;
}

export const ConsistencyCheck: React.FC<ConsistencyCheckProps> = ({
  consistencyRatio,
  matrixSize,
  onImproveConsistency,
  detailed = false
}) => {
  const isConsistent = consistencyRatio <= 0.1;
  const severity = consistencyRatio <= 0.05 ? 'excellent' : 
                  consistencyRatio <= 0.1 ? 'acceptable' : 
                  consistencyRatio <= 0.2 ? 'poor' : 'critical';

  const getConsistencyMessage = () => {
    if (severity === 'excellent') {
      return '매우 일관성 있는 판단입니다.';
    } else if (severity === 'acceptable') {
      return '허용 가능한 수준의 일관성입니다.';
    } else if (severity === 'poor') {
      return '일관성이 부족합니다. 판단을 재검토해주세요.';
    } else {
      return '심각한 일관성 부족입니다. 판단을 크게 수정해야 합니다.';
    }
  };

  const getColorClasses = () => {
    switch (severity) {
      case 'excellent':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600'
        };
      case 'acceptable':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        };
      case 'poor':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        };
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600'
        };
    }
  };

  const colors = getColorClasses();
  const Icon = isConsistent ? CheckCircle : AlertTriangle;

  return (
    <div className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${colors.icon}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${colors.text}`}>
              일관성 검사
            </h4>
            <span className={`text-sm font-mono px-2 py-1 rounded ${colors.text}`}>
              CR = {consistencyRatio.toFixed(3)}
            </span>
          </div>
          
          <p className={`text-sm ${colors.text} mb-3`}>
            {getConsistencyMessage()}
          </p>

          {detailed && (
            <div className="space-y-2 text-xs text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">매트릭스 크기:</span> {matrixSize}×{matrixSize}
                </div>
                <div>
                  <span className="font-medium">허용 기준:</span> CR ≤ 0.10
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-white bg-opacity-50 rounded">
                <div className="flex items-center space-x-1 mb-1">
                  <Info className="w-3 h-3" />
                  <span className="font-medium">일관성 지표</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-green-600 font-medium">우수</div>
                    <div>≤ 0.05</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">양호</div>
                    <div>≤ 0.10</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-600 font-medium">부족</div>
                    <div>≤ 0.20</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-medium">심각</div>
                    <div>> 0.20</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isConsistent && onImproveConsistency && (
            <button
              onClick={onImproveConsistency}
              className="mt-3 px-4 py-2 bg-white text-gray-700 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              일관성 개선 도움말
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConsistencyImprovementTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsistencyImprovementTips: React.FC<ConsistencyImprovementTipsProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">일관성 개선 방법</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">1. 가장 큰 차이를 보이는 쌍 찾기</h4>
            <p className="text-gray-600">
              가장 큰 일관성 위반을 보이는 비교 쌍을 찾아 우선적으로 수정하세요.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">2. 전이성 원칙 확인</h4>
            <p className="text-gray-600">
              A가 B보다 중요하고, B가 C보다 중요하다면, A는 C보다 더 중요해야 합니다.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">3. 극단적 값 피하기</h4>
            <p className="text-gray-600">
              9점 또는 1/9점 같은 극단적 값은 신중하게 사용하세요.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">4. 단계적 조정</h4>
            <p className="text-gray-600">
              한 번에 큰 변화보다는 조금씩 값을 조정해가며 일관성을 개선하세요.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyCheck;