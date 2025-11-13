import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface EvaluationStep {
  id: string;
  type: 'criteria' | 'alternatives';
  level: number;
  parentId?: string;
  parentName?: string;
  items: Array<{ id: string; name: string }>;
  completed: boolean;
  consistencyRatio?: number;
  weights?: { [key: string]: number };
}

interface ProgressTrackerProps {
  steps: EvaluationStep[];
  currentStepIndex: number;
  projectId: string;
  evaluatorId?: string;
  onStepClick?: (stepIndex: number) => void;
}

interface ProgressMetrics {
  totalSteps: number;
  completedSteps: number;
  percentageComplete: number;
  averageConsistency: number;
  estimatedTimeRemaining: number;
  currentPhase: string;
}

interface WebSocketProgressMessage {
  type: 'PROGRESS_UPDATE';
  projectId: string;
  evaluatorId: string;
  timestamp: string;
  data: {
    stepId: string;
    completed: boolean;
    consistencyRatio?: number;
    timeSpent: number;
  };
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStepIndex,
  projectId,
  evaluatorId,
  onStepClick
}) => {
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    totalSteps: 0,
    completedSteps: 0,
    percentageComplete: 0,
    averageConsistency: 0,
    estimatedTimeRemaining: 0,
    currentPhase: ''
  });

  const [stepTimings, setStepTimings] = useState<Map<string, number>>(new Map());
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // WebSocket 연결 설정
  useEffect(() => {
    if (evaluatorId) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/evaluation/${evaluatorId}/`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Progress tracking WebSocket connected');
        setWebsocket(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const message: WebSocketProgressMessage = JSON.parse(event.data);
          if (message.type === 'PROGRESS_UPDATE') {
            handleProgressUpdate(message.data);
          }
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
      };
      
      ws.onclose = () => {
        console.log('Progress tracking WebSocket disconnected');
        setWebsocket(null);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [evaluatorId]);

  // 진행률 메트릭 계산
  useEffect(() => {
    calculateMetrics();
  }, [steps, currentStepIndex]);

  const calculateMetrics = () => {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.completed).length;
    const percentageComplete = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    // 일관성 평균 계산
    const completedStepsWithCR = steps.filter(step => 
      step.completed && step.consistencyRatio !== undefined
    );
    const averageConsistency = completedStepsWithCR.length > 0 
      ? completedStepsWithCR.reduce((sum, step) => sum + (step.consistencyRatio || 0), 0) / completedStepsWithCR.length
      : 0;
    
    // 예상 소요 시간 계산
    const avgTimePerStep = Array.from(stepTimings.values())
      .reduce((sum, time) => sum + time, 0) / Math.max(stepTimings.size, 1);
    const remainingSteps = totalSteps - completedSteps;
    const estimatedTimeRemaining = Math.round(avgTimePerStep * remainingSteps / 60); // 분 단위
    
    // 현재 단계 구분
    const currentStep = steps[currentStepIndex];
    let currentPhase = '';
    if (currentStep) {
      if (currentStep.level === 1) {
        currentPhase = '주기준 비교';
      } else if (currentStep.level > 1 && currentStep.level < 99) {
        currentPhase = '하위기준 비교';
      } else {
        currentPhase = '대안 평가';
      }
    }

    setMetrics({
      totalSteps,
      completedSteps,
      percentageComplete,
      averageConsistency,
      estimatedTimeRemaining,
      currentPhase
    });
  };

  const handleProgressUpdate = (data: any) => {
    // 실시간 진행률 업데이트 처리
    if (data.timeSpent) {
      setStepTimings(prev => new Map(prev.set(data.stepId, data.timeSpent)));
    }
  };

  const getStepIcon = (step: EvaluationStep, index: number) => {
    if (step.completed) {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else if (index === currentStepIndex) {
      return <ClockIcon className="w-5 h-5 text-blue-600 animate-pulse" />;
    } else {
      return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getConsistencyBadge = (cr?: number) => {
    if (cr === undefined) return null;
    
    let colorClass = '';
    let label = '';
    
    if (cr <= 0.05) {
      colorClass = 'bg-green-100 text-green-800';
      label = '우수';
    } else if (cr <= 0.08) {
      colorClass = 'bg-blue-100 text-blue-800';
      label = '양호';
    } else if (cr <= 0.10) {
      colorClass = 'bg-yellow-100 text-yellow-800';
      label = '허용';
    } else {
      colorClass = 'bg-red-100 text-red-800';
      label = '불량';
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        CR: {(cr * 100).toFixed(1)}% ({label})
      </span>
    );
  };

  const getCurrentPhaseSteps = () => {
    if (steps.length === 0) return { completed: 0, total: 0 };
    
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return { completed: 0, total: 0 };
    
    const phaseSteps = steps.filter(step => {
      if (currentStep.level === 1) {
        return step.level === 1;
      } else if (currentStep.level > 1 && currentStep.level < 99) {
        return step.level > 1 && step.level < 99;
      } else {
        return step.level === 99;
      }
    });
    
    return {
      completed: phaseSteps.filter(step => step.completed).length,
      total: phaseSteps.length
    };
  };

  const phaseProgress = getCurrentPhaseSteps();

  return (
    <div className="space-y-6">
      {/* 전체 진행률 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            평가 진행률
          </h3>
          <ChartBarIcon className="w-6 h-6 text-blue-600" />
        </div>
        
        {/* 메인 진행률 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>전체 진행률</span>
            <span>{metrics.completedSteps}/{metrics.totalSteps} 완료</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${metrics.percentageComplete}%` }}
            />
          </div>
          <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {metrics.percentageComplete.toFixed(1)}% 완료
          </div>
        </div>

        {/* 현재 단계 정보 */}
        {metrics.currentPhase && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
              현재 단계: {metrics.currentPhase}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {phaseProgress.completed}/{phaseProgress.total} 단계 완료
            </div>
          </div>
        )}

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(metrics.averageConsistency * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">평균 일관성 비율</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.estimatedTimeRemaining > 0 ? `${metrics.estimatedTimeRemaining}분` : '-'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">예상 잔여 시간</div>
          </div>
        </div>
      </div>

      {/* 단계별 상세 진행률 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          단계별 진행 상황
        </h4>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                index === currentStepIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                  : step.completed
                  ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => onStepClick?.(index)}
            >
              <div className="flex items-center space-x-3 flex-1">
                {getStepIcon(step, index)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {step.type === 'criteria' ? '기준 비교' : '대안 평가'}
                    {step.parentName && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        ({step.parentName})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    레벨 {step.level} • {step.items.length}개 요소
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getConsistencyBadge(step.consistencyRatio)}
                {index === currentStepIndex && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    진행 중
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 실시간 상태 */}
      {websocket && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-800 dark:text-green-200">
              실시간 진행률 추적 활성화
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;