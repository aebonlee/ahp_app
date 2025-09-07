import React, { useState } from 'react';
import Card from '../common/Card';

export type EvaluationMode = 'practical' | 'theoretical' | 'direct_input';

interface EvaluationModeConfig {
  mode: EvaluationMode;
  name: string;
  description: string;
  features: string[];
  suitable_for: string[];
  icon: string;
  color: string;
}

const EVALUATION_MODES: EvaluationModeConfig[] = [
  {
    mode: 'practical',
    name: '쌍대비교 - 실용',
    description: '실무에 최적화된 최소한의 쌍대비교를 통해 효율적으로 중요도를 도출합니다.',
    features: [
      '최소한의 쌍대비교 실시',
      '빠른 평가 진행',
      '실무 중심 설계',
      '사용자 친화적 인터페이스'
    ],
    suitable_for: [
      '일반 업무용 의사결정',
      '빠른 결과가 필요한 경우',
      '평가자가 많은 프로젝트',
      '실무진 대상 평가'
    ],
    icon: '⚡',
    color: 'bg-blue-500'
  },
  {
    mode: 'theoretical',
    name: '쌍대비교 - 이론',
    description: '이론적으로 완전한 모든 쌍대비교를 실시하여 정확한 중요도를 도출합니다.',
    features: [
      '모든 쌍대비교 실시',
      '높은 정확도',
      '완전한 일관성 검증',
      '학술적 엄밀성'
    ],
    suitable_for: [
      '학술 연구 및 논문',
      '정밀한 분석이 필요한 경우',
      '소수 전문가 대상 평가',
      '이론적 검증이 중요한 프로젝트'
    ],
    icon: '🎓',
    color: 'bg-purple-500'
  },
  {
    mode: 'direct_input',
    name: '직접 입력',
    description: '기존 데이터나 전문가 판단을 직접 입력하여 중요도를 설정합니다.',
    features: [
      '데이터 직접 입력',
      '신속한 처리',
      '기존 자료 활용',
      '유연한 입력 방식'
    ],
    suitable_for: [
      '기존 데이터가 있는 경우',
      '전문가 사전 판단 활용',
      '정량적 지표 중심 평가',
      '시간이 제한된 프로젝트'
    ],
    icon: '📊',
    color: 'bg-green-500'
  }
];

interface EvaluationModeSelectorProps {
  selectedMode: EvaluationMode;
  onModeChange: (mode: EvaluationMode) => void;
  disabled?: boolean;
}

export const EvaluationModeSelector: React.FC<EvaluationModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  disabled = false
}) => {
  const [hoveredMode, setHoveredMode] = useState<EvaluationMode | null>(null);

  return (
    <Card title="평가 방법 선택" className="max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          프로젝트의 목적과 상황에 맞는 최적의 평가 방법을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {EVALUATION_MODES.map((config) => (
          <div
            key={config.mode}
            className={`relative bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedMode === config.mode
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : hoveredMode === config.mode
                ? 'border-blue-300 shadow-lg transform scale-105'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onMouseEnter={() => !disabled && setHoveredMode(config.mode)}
            onMouseLeave={() => setHoveredMode(null)}
            onClick={() => !disabled && onModeChange(config.mode)}
          >
            {/* 선택 표시 */}
            {selectedMode === config.mode && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className={`w-14 h-14 ${config.color} rounded-xl flex items-center justify-center text-white text-2xl mr-4 shadow-lg`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-1">
                    {config.name}
                  </h4>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      config.mode === 'practical' ? 'bg-blue-100 text-blue-800' :
                      config.mode === 'theoretical' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {config.mode === 'practical' ? '실용형' : 
                       config.mode === 'theoretical' ? '이론형' : '직접형'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                {config.description}
              </p>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    주요 특징
                  </h5>
                  <ul className="space-y-2">
                    {config.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    적합한 용도
                  </h5>
                  <ul className="space-y-2">
                    {config.suitable_for.slice(0, 2).map((use, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMode && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 text-lg mb-2">
                선택된 평가 방법: {EVALUATION_MODES.find(m => m.mode === selectedMode)?.name}
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-blue-700">
                  이 평가 방법은 프로젝트 생성 후에도 모델 구축 단계에서 변경할 수 있습니다.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  설정이 완료되었습니다. 다음 단계로 진행할 수 있습니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EvaluationModeSelector;