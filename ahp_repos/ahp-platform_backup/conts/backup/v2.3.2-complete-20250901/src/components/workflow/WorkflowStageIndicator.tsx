import React from 'react';

export type WorkflowStage = 'creating' | 'waiting' | 'evaluating' | 'completed';

interface WorkflowStageConfig {
  stage: WorkflowStage;
  name: string;
  description: string;
  icon: string;
  color: string;
  available_actions: string[];
}

const WORKFLOW_STAGES: WorkflowStageConfig[] = [
  {
    stage: 'creating',
    name: '생성중',
    description: '의사결정 모델 구성요소(기준, 대안) 및 평가자를 구성 중인 상태입니다.',
    icon: '🔧',
    color: 'bg-yellow-500',
    available_actions: ['모델 구축', '평가자 추가', '프로젝트 설정']
  },
  {
    stage: 'waiting',
    name: '대기중',
    description: '의사결정 모델을 완료한 상태로 평가자 배정을 할 수 있습니다. 평가가 시작되기 전 단계입니다.',
    icon: '⏳',
    color: 'bg-blue-500',
    available_actions: ['평가자 배정', '이메일 발송', '평가 시작']
  },
  {
    stage: 'evaluating',
    name: '평가중',
    description: '의사결정 모델이 완료된 후 평가가 진행 중인 상태입니다. 모델을 수정할 수도 있는데 이 경우 현재까지 평가된 데이터는 삭제됩니다.',
    icon: '📊',
    color: 'bg-green-500',
    available_actions: ['진행 상황 모니터링', '결과 확인', '평가 종료']
  },
  {
    stage: 'completed',
    name: '평가종료',
    description: '평가자들의 평가를 종료시킨 상태로 더이상 평가를 진행 할 수 없으며 결과 확인만 할 수 있습니다.',
    icon: '✅',
    color: 'bg-gray-500',
    available_actions: ['결과 보기', '보고서 생성', '데이터 내보내기']
  }
];

interface WorkflowStageIndicatorProps {
  currentStage: WorkflowStage;
  showActions?: boolean;
  onActionClick?: (action: string) => void;
  className?: string;
}

export const WorkflowStageIndicator: React.FC<WorkflowStageIndicatorProps> = ({
  currentStage,
  showActions = false,
  onActionClick,
  className = ''
}) => {
  const currentConfig = WORKFLOW_STAGES.find(stage => stage.stage === currentStage);
  const currentIndex = WORKFLOW_STAGES.findIndex(stage => stage.stage === currentStage);

  if (!currentConfig) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 단계 진행 표시 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">프로젝트 진행 상태</h3>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${currentConfig.color}`}>
            {currentConfig.icon} {currentConfig.name}
          </div>
        </div>

        {/* 진행 바 */}
        <div className="flex items-center space-x-2">
          {WORKFLOW_STAGES.map((stage, index) => (
            <React.Fragment key={stage.stage}>
              <div className={`flex items-center ${index <= currentIndex ? 'text-blue-600' : 'text-gray-300'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    index < currentIndex
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : index === currentIndex
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentIndex ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${index <= currentIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stage.name}
                </span>
              </div>
              {index < WORKFLOW_STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 ${index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 현재 단계 정보 */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${currentConfig.color} text-white`}>
            {currentConfig.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              현재 단계: {currentConfig.name}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {currentConfig.description}
            </p>

            {showActions && currentConfig.available_actions.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-800 mb-2">가능한 작업</h5>
                <div className="flex flex-wrap gap-2">
                  {currentConfig.available_actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => onActionClick?.(action)}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors duration-200"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 다음 단계 미리보기 */}
      {currentIndex < WORKFLOW_STAGES.length - 1 && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium mr-2">다음 단계:</span>
              <span className="text-gray-900">
                {WORKFLOW_STAGES[currentIndex + 1].name}
              </span>
              <span className="mx-2">-</span>
              <span>{WORKFLOW_STAGES[currentIndex + 1].description}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStageIndicator;