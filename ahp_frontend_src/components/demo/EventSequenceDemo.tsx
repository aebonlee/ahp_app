import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: () => void;
  verification: string;
  completed?: boolean;
}

interface EventSequenceDemoProps {
  scenario: 'sensitivity' | 'pairwise' | 'directInput' | 'workshop';
  onComplete?: () => void;
}

const EventSequenceDemo: React.FC<EventSequenceDemoProps> = ({ 
  scenario, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DemoStep[]>([]);

  React.useEffect(() => {
    setSteps(getScenarioSteps(scenario));
  }, [scenario]);

  const getScenarioSteps = (scenario: string): DemoStep[] => {
    switch (scenario) {
      case 'sensitivity':
        return [
          {
            id: 'sens-1',
            title: '민감도 분석 진입',
            description: '단계 3 → 민감도 분석 탭 클릭',
            action: () => alert('민감도 분석 화면으로 이동'),
            verification: '화면 ID: ADMIN-STEP3-SENS 표시 확인'
          },
          {
            id: 'sens-2',
            title: '상위기준 선택',
            description: '변경하려는 기준의 상위기준 선택 (예: 디자인)',
            action: () => alert('상위기준 선택됨'),
            verification: '선택된 기준이 파란색으로 하이라이트'
          },
          {
            id: 'sens-3',
            title: '세부기준 선택',
            description: '변경할 세부 기준 클릭 (예: 실내디자인)',
            action: () => alert('세부기준 선택됨'),
            verification: '세부기준이 녹색으로 하이라이트, 입력값 칸 표시'
          },
          {
            id: 'sens-4',
            title: '변경값 입력',
            description: '새로운 가중치 값 입력 (0.0 ~ 1.0)',
            action: () => alert('값 입력됨'),
            verification: '입력값과 백분율 실시간 표시'
          },
          {
            id: 'sens-5',
            title: '분석 시작',
            description: '"④ 분석 시작" 버튼 클릭',
            action: () => alert('분석 시작됨'),
            verification: '로딩 표시 후 결과 차트 표시'
          },
          {
            id: 'sens-6',
            title: '결과 확인',
            description: '대안 최종 중요도 변화 확인',
            action: () => alert('결과 표시됨'),
            verification: '기존/변경후 비교 차트, 저장 안내 표시'
          }
        ];

      case 'pairwise':
        return [
          {
            id: 'pair-1',
            title: '쌍대비교 시작',
            description: '기준별 쌍대비교 화면 진입',
            action: () => alert('쌍대비교 화면 진입'),
            verification: '화면 ID: RATER-PAIRWISE 표시'
          },
          {
            id: 'pair-2',
            title: '비교값 선택',
            description: 'Saaty 1-9 척도에서 값 선택',
            action: () => alert('비교값 선택됨'),
            verification: '매트릭스에 값 반영, 다음 쌍으로 이동'
          },
          {
            id: 'pair-3',
            title: '일관성 검증',
            description: '모든 비교 완료 후 CR 계산',
            action: () => alert('일관성 계산됨'),
            verification: 'CR > 0.1시 경고 메시지 표시'
          },
          {
            id: 'pair-4',
            title: '판단 도우미',
            description: 'CR 경고 시 "판단 도우미 보기" 클릭',
            action: () => alert('판단 도우미 표시'),
            verification: '일관성 개선 가이드 표시'
          }
        ];

      case 'directInput':
        return [
          {
            id: 'direct-1',
            title: '직접입력 시작',
            description: '직접입력 평가 화면 진입',
            action: () => alert('직접입력 화면 진입'),
            verification: '화면 ID: RATER-DIRECT 표시'
          },
          {
            id: 'direct-2',
            title: '평가 유형 선택',
            description: '편익형/비용형 중 선택',
            action: () => alert('비용형 선택됨'),
            verification: '비용형 선택 시 경고 메시지 표시'
          },
          {
            id: 'direct-3',
            title: '역수 적용',
            description: '"여기를" 클릭하여 역수 값 적용',
            action: () => alert('역수 변환됨'),
            verification: '편익형으로 변경, 경고 메시지 사라짐'
          },
          {
            id: 'direct-4',
            title: '값 입력',
            description: '각 대안별 정량 값 입력',
            action: () => alert('값 입력됨'),
            verification: '실시간 가중치 계산 및 표시'
          }
        ];

      case 'workshop':
        return [
          {
            id: 'ws-1',
            title: '워크숍 활성화',
            description: '관리자가 워크숍 모드 활성화',
            action: () => alert('워크숍 활성화됨'),
            verification: '관리자 화면: WS-ADMIN, 평가자 접근 가능'
          },
          {
            id: 'ws-2',
            title: '실시간 동기화',
            description: '관리자 화면 변경사항 평가자에 반영',
            action: () => alert('동기화됨'),
            verification: '양쪽 화면 동시 업데이트'
          },
          {
            id: 'ws-3',
            title: '진행 제어',
            description: '관리자의 이전/다음 제어',
            action: () => alert('진행 제어됨'),
            verification: '평가자 화면도 동일하게 이동'
          },
          {
            id: 'ws-4',
            title: '워크숍 종료',
            description: '관리자가 워크숍 모드 비활성화',
            action: () => alert('워크숍 종료됨'),
            verification: '평가자 접근 차단, 대기 메시지 표시'
          }
        ];

      default:
        return [];
    }
  };

  const executeStep = (stepIndex: number) => {
    if (stepIndex < steps.length) {
      steps[stepIndex].action();
      setSteps(prev => prev.map((step, idx) => 
        idx === stepIndex ? { ...step, completed: true } : step
      ));
      
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      } else if (onComplete) {
        onComplete();
      }
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setSteps(prev => prev.map(step => ({ ...step, completed: false })));
  };

  const scenarioTitles = {
    sensitivity: '민감도 분석 시나리오',
    pairwise: '쌍대비교 시나리오', 
    directInput: '직접입력 시나리오',
    workshop: '워크숍 제어 시나리오'
  };

  return (
    <Card title={`데모 시나리오: ${scenarioTitles[scenario]}`}>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🎯 시나리오 검증</h4>
          <p className="text-sm text-blue-700">
            이벤트 시퀀스를 단계별로 실행하여 동작을 검증합니다.
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`border rounded-lg p-4 ${
                index === currentStep ? 'border-blue-500 bg-blue-50' :
                step.completed ? 'border-green-500 bg-green-50' :
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.completed ? 'bg-green-500 text-white' :
                      index === currentStep ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </span>
                    <h5 className="font-medium">{step.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-9">{step.description}</p>
                  <p className="text-xs text-purple-600 mt-1 ml-9">
                    <strong>검증:</strong> {step.verification}
                  </p>
                </div>
                
                <Button
                  onClick={() => executeStep(index)}
                  disabled={index !== currentStep || step.completed}
                  variant={step.completed ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {step.completed ? '완료' : '실행'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            진행: {steps.filter(s => s.completed).length} / {steps.length}
          </div>
          <div className="flex space-x-2">
            <Button onClick={resetDemo} variant="secondary" size="sm">
              처음부터
            </Button>
            {currentStep >= steps.length && (
              <Button onClick={onComplete} variant="primary" size="sm">
                검증 완료
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventSequenceDemo;