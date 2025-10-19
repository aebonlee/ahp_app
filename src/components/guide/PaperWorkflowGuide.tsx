import React, { useState } from 'react';
import Button from '../common/Button';

interface WorkflowStep {
  id: string;
  number: number;
  title: string;
  description: string;
  recommendation: string;
  icon: string;
  status: 'pending' | 'current' | 'completed';
  details: {
    pairwiseCount?: string;
    timeEstimate?: string;
    tips?: string[];
  };
}

interface PaperWorkflowGuideProps {
  currentStep?: number;
  criteriaCount?: number;
  alternativesCount?: number;
  onClose?: () => void;
}

const PaperWorkflowGuide: React.FC<PaperWorkflowGuideProps> = ({ 
  currentStep = 1, 
  criteriaCount = 0,
  alternativesCount = 0,
  onClose 
}) => {
  const [showDetails, setShowDetails] = useState(true);

  // 쌍대비교 횟수 계산
  const calculatePairwiseCount = (n: number) => {
    return n * (n - 1) / 2;
  };

  const criteriaComparisons = calculatePairwiseCount(criteriaCount || 3);
  const alternativeComparisons = (criteriaCount || 3) * calculatePairwiseCount(alternativesCount || 3);
  const totalComparisons = criteriaComparisons + alternativeComparisons;

  const steps: WorkflowStep[] = [
    {
      id: 'project-setup',
      number: 1,
      title: '프로젝트 생성',
      description: '연구 주제와 목표 설정',
      recommendation: '명확한 연구 목표 수립',
      icon: '📋',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending',
      details: {
        timeEstimate: '5-10분',
        tips: [
          '연구 목표를 구체적으로 작성',
          '평가 모드는 일반 AHP(쌍대비교) 권장',
          '퍼지 AHP는 일반 AHP 완료 후 추가 분석용'
        ]
      }
    },
    {
      id: 'criteria-setup',
      number: 2,
      title: '평가 기준 설정',
      description: '3개 기준으로 시작 (권장)',
      recommendation: '3개 기준 = 3회 쌍대비교',
      icon: '📊',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending',
      details: {
        pairwiseCount: `${criteriaComparisons}회 (현재 ${criteriaCount}개 기준)`,
        timeEstimate: '10-15분',
        tips: [
          '측정 가능하고 독립적인 기준 선택',
          '3-5개 기준이 일관성 검증에 유리',
          '7개 초과 시 일관성(CR) 저하 가능성'
        ]
      }
    },
    {
      id: 'alternatives-setup',
      number: 3,
      title: '대안 설정',
      description: '3개 대안으로 시작 (권장)',
      recommendation: `3개 대안 = 각 기준별 3회`,
      icon: '🎯',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending',
      details: {
        pairwiseCount: `${alternativeComparisons}회 (${criteriaCount}개 기준 × ${alternativesCount}개 대안)`,
        timeEstimate: '10-15분',
        tips: [
          '비교 가능한 대안 선택',
          '대안 간 차별성 확보',
          '3-4개 대안이 명확한 순위 결정에 적합'
        ]
      }
    },
    {
      id: 'pairwise-evaluation',
      number: 4,
      title: '쌍대비교 평가',
      description: '체계적 비교 수행',
      recommendation: `총 ${totalComparisons}회 비교 (3×3 구조)`,
      icon: '⚖️',
      status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending',
      details: {
        pairwiseCount: `기준 ${criteriaComparisons}회 + 대안 ${alternativeComparisons}회 = 총 ${totalComparisons}회`,
        timeEstimate: '20-30분',
        tips: [
          'Saaty 9점 척도 활용',
          '일관성 비율(CR) ≤ 0.1 목표',
          'CR > 0.1 시 재평가 필요'
        ]
      }
    },
    {
      id: 'results-analysis',
      number: 5,
      title: '결과 분석',
      description: '가중치 확인 및 검증',
      recommendation: 'CR, λmax 검증 필수',
      icon: '📈',
      status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'pending',
      details: {
        timeEstimate: '15-20분',
        tips: [
          '일관성 비율(CR) 확인',
          '가중치 분포 검토',
          '민감도 분석 수행'
        ]
      }
    },
    {
      id: 'fuzzy-ahp',
      number: 6,
      title: '퍼지 AHP 분석 (선택)',
      description: '불확실성 반영 분석',
      recommendation: '논문 깊이 향상',
      icon: '🔮',
      status: currentStep === 6 ? 'current' : currentStep > 6 ? 'completed' : 'pending',
      details: {
        pairwiseCount: `동일 구조 재사용 (${totalComparisons}회)`,
        timeEstimate: '30-40분',
        tips: [
          '삼각퍼지수(TFN) 활용',
          '일반 AHP와 결과 비교',
          '강건성(Robustness) 검증'
        ]
      }
    },
    {
      id: 'paper-writing',
      number: 7,
      title: '논문 작성',
      description: 'AI 지원 논문 생성',
      recommendation: 'AI 논문 지원 기능 활용',
      icon: '📝',
      status: currentStep === 7 ? 'current' : currentStep > 7 ? 'completed' : 'pending',
      details: {
        timeEstimate: '1-2시간',
        tips: [
          'AI 방법론 자동 생성',
          '결과 표/그림 생성',
          '참고문헌 자동 추천'
        ]
      }
    }
  ];

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-400 text-green-800';
      case 'current': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'pending': return 'bg-gray-100 border-gray-300 text-gray-600';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '▶️';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📚 AHP 논문 작성 워크플로우 가이드</h2>
              <p className="text-blue-100">3×3 구조 기반 체계적 연구 진행 가이드</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                title="닫기"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-b-2 border-yellow-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
              <div className="text-sm text-gray-600 mb-1">현재 구조</div>
              <div className="text-2xl font-bold text-gray-900">
                {criteriaCount || 3} × {alternativesCount || 3}
              </div>
              <div className="text-xs text-gray-500">기준 × 대안</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">쌍대비교 횟수</div>
              <div className="text-2xl font-bold text-gray-900">{totalComparisons}회</div>
              <div className="text-xs text-gray-500">기준 {criteriaComparisons} + 대안 {alternativeComparisons}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">예상 소요시간</div>
              <div className="text-2xl font-bold text-gray-900">2-3시간</div>
              <div className="text-xs text-gray-500">퍼지 AHP 제외</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">단계별 진행 가이드</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDetails ? '간략히 보기' : '상세히 보기'}
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`border-2 rounded-lg overflow-hidden transition-all ${getStepStatusColor(step.status)}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl">
                          {step.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getStepIcon(step.status)}</span>
                          <h4 className="text-lg font-bold">
                            {step.number}. {step.title}
                          </h4>
                        </div>
                        <p className="text-sm mb-2">{step.description}</p>
                        <div className="inline-block px-3 py-1 bg-white rounded-full text-xs font-semibold">
                          💡 {step.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>

                  {showDetails && (
                    <div className="mt-4 pl-16 space-y-2">
                      {step.details.pairwiseCount && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-semibold">⚖️ 비교 횟수:</span>
                          <span>{step.details.pairwiseCount}</span>
                        </div>
                      )}
                      {step.details.timeEstimate && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-semibold">⏱️ 예상 시간:</span>
                          <span>{step.details.timeEstimate}</span>
                        </div>
                      )}
                      {step.details.tips && (
                        <div className="mt-3 bg-white bg-opacity-60 rounded-lg p-3">
                          <div className="font-semibold text-sm mb-2">📌 핵심 팁</div>
                          <ul className="space-y-1">
                            {step.details.tips.map((tip, idx) => (
                              <li key={idx} className="text-xs flex items-start">
                                <span className="mr-2">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {step.status === 'current' && (
                  <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-semibold">
                    ▶️ 현재 진행 중인 단계
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-t-2 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-4">✨ 3×3 구조의 장점</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">효율성</div>
                  <div className="text-sm text-gray-600">
                    총 12회 비교로 완전한 AHP 분석 완료 (3개 기준 비교 + 9개 대안 비교)
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">정확성</div>
                  <div className="text-sm text-gray-600">
                    일관성 비율(CR ≤ 0.1) 충족 확률 향상, 명확한 우선순위 도출
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📊</div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">설명력</div>
                  <div className="text-sm text-gray-600">
                    간결한 구조로 논문 작성 및 결과 해석 용이
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔄</div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">확장성</div>
                  <div className="text-sm text-gray-600">
                    일반 AHP → 퍼지 AHP 순차 진행으로 분석 깊이 향상
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 <strong>TIP:</strong> 단계별로 진행하며 각 단계 완료 후 저장을 권장합니다.
            </div>
            {onClose && (
              <Button variant="primary" onClick={onClose}>
                가이드 닫기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperWorkflowGuide;