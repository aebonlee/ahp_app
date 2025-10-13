import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import ModelFinalization from './ModelFinalization';
import cleanDataService from '../../services/dataService_clean';
import { ProjectData } from '../../services/api';

interface ModelBuilderWorkflowProps {
  projectId: string;
  projectTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

interface WorkflowProgress {
  currentStep: 'criteria' | 'alternatives' | 'evaluators' | 'finalize' | 'evaluation';
  criteriaCount: number;
  alternativesCount: number;
  evaluatorsCount: number;
  isModelFinalized: boolean;
  evaluationStarted: boolean;
}

const ModelBuilderWorkflow: React.FC<ModelBuilderWorkflowProps> = ({ 
  projectId, 
  projectTitle, 
  onComplete, 
  onBack 
}) => {
  const [progress, setProgress] = useState<WorkflowProgress>({
    currentStep: 'criteria',
    criteriaCount: 0,
    alternativesCount: 0,
    evaluatorsCount: 0,
    isModelFinalized: false,
    evaluationStarted: false
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 프로젝트 데이터 로드
      const projectData = await cleanDataService.getProject(projectId);
      setProject(projectData);
      
      // 기준, 대안, 평가자 수 로드
      const [criteria, alternatives, evaluators] = await Promise.all([
        cleanDataService.getCriteria(projectId),
        cleanDataService.getAlternatives(projectId),
        cleanDataService.getEvaluators(projectId)
      ]);
      
      setProgress(prev => ({
        ...prev,
        criteriaCount: criteria.length,
        alternativesCount: alternatives.length,
        evaluatorsCount: evaluators.length,
        isModelFinalized: projectData?.workflow_stage === 'evaluating' || projectData?.workflow_stage === 'completed'
      }));
      
      // 현재 단계 자동 결정
      if (criteria.length === 0) {
        setProgress(prev => ({ ...prev, currentStep: 'criteria' }));
      } else if (alternatives.length === 0) {
        setProgress(prev => ({ ...prev, currentStep: 'alternatives' }));
      } else if (evaluators.length === 0) {
        setProgress(prev => ({ ...prev, currentStep: 'evaluators' }));
      } else if (!progress.isModelFinalized) {
        setProgress(prev => ({ ...prev, currentStep: 'finalize' }));
      } else {
        setProgress(prev => ({ ...prev, currentStep: 'evaluation' }));
      }
      
    } catch (error) {
      console.error('프로젝트 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, progress.isModelFinalized]);

  useEffect(() => {
    loadProjectData();
  }, [projectId, loadProjectData]);

  const handleStepChange = (step: WorkflowProgress['currentStep']) => {
    setProgress(prev => ({ ...prev, currentStep: step }));
  };

  const handleCriteriaChange = (count: number) => {
    setProgress(prev => ({ ...prev, criteriaCount: count }));
    if (count > 0 && progress.currentStep === 'criteria') {
      handleStepChange('alternatives');
    }
  };

  const handleAlternativesChange = (count: number) => {
    setProgress(prev => ({ ...prev, alternativesCount: count }));
    if (count > 0 && progress.currentStep === 'alternatives') {
      handleStepChange('evaluators');
    }
  };

  const handleEvaluatorsComplete = () => {
    loadProjectData(); // 데이터 새로고침
    handleStepChange('finalize');
  };

  const handleModelFinalize = async () => {
    try {
      // 프로젝트 상태를 'evaluating'으로 업데이트
      await cleanDataService.updateProject(projectId, {
        workflow_stage: 'evaluating',
        status: 'active'
      });
      
      setProgress(prev => ({ 
        ...prev, 
        isModelFinalized: true,
        currentStep: 'evaluation'
      }));
      
      alert('모델 구축이 완료되었습니다. 이제 평가를 시작할 수 있습니다.');
      
      // 완료 콜백 호출 - 평가자 관리 페이지로 이동
      onComplete();
    } catch (error) {
      console.error('모델 완료 처리 실패:', error);
      alert('모델 완료 처리 중 오류가 발생했습니다.');
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { key: 'criteria', label: '기준 설정', count: progress.criteriaCount },
      { key: 'alternatives', label: '대안 설정', count: progress.alternativesCount },
      { key: 'evaluators', label: '평가자 배정', count: progress.evaluatorsCount },
      { key: 'finalize', label: '모델 완료', count: progress.isModelFinalized ? 1 : 0 }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const isActive = step.key === progress.currentStep;
            const isCompleted = step.count > 0;
            const isPast = steps.findIndex(s => s.key === progress.currentStep) > index;
            
            return (
              <div key={step.key} className="flex-1 relative">
                {index > 0 && (
                  <div className={`absolute left-0 right-0 top-5 h-0.5 -translate-x-1/2 ${
                    isPast || isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} style={{ width: 'calc(100% - 2.5rem)' }} />
                )}
                
                <button
                  onClick={() => handleStepChange(step.key as any)}
                  disabled={step.key === 'finalize' && (!progress.criteriaCount || !progress.alternativesCount)}
                  className={`relative z-10 flex flex-col items-center cursor-pointer ${
                    (step.key === 'finalize' && (!progress.criteriaCount || !progress.alternativesCount)) 
                      ? 'cursor-not-allowed opacity-50' 
                      : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                    isActive ? 'bg-blue-500 ring-4 ring-blue-200' :
                    isCompleted || isPast ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {isCompleted || isPast ? '✓' : index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' :
                      isCompleted || isPast ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    {step.count > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {step.key === 'finalize' ? '완료' : `${step.count}개`}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (progress.currentStep) {
      case 'criteria':
        return (
          <CriteriaManagement
            projectId={projectId}
            projectTitle={projectTitle}
            onCriteriaChange={handleCriteriaChange}
            onComplete={() => handleStepChange('alternatives')}
          />
        );

      case 'alternatives':
        return (
          <AlternativeManagement
            projectId={projectId}
            onAlternativesChange={handleAlternativesChange}
            onComplete={() => handleStepChange('evaluators')}
          />
        );

      case 'evaluators':
        return (
          <EvaluatorAssignment
            projectId={projectId}
            onComplete={handleEvaluatorsComplete}
          />
        );

      case 'finalize':
        return (
          <ModelFinalization
            projectId={projectId}
            onFinalize={handleModelFinalize}
            isReadyToFinalize={progress.criteriaCount > 0 && progress.alternativesCount > 0}
          />
        );

      case 'evaluation':
        return (
          <Card title="평가 진행중">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                모델 구축 완료!
              </h3>
              <p className="text-gray-600 mb-6">
                평가자들이 평가를 진행할 수 있습니다.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-900 mb-2">평가 현황</h4>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{progress.criteriaCount}</div>
                    <div className="text-sm text-gray-500">평가 기준</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{progress.alternativesCount}</div>
                    <div className="text-sm text-gray-500">대안</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{progress.evaluatorsCount}</div>
                    <div className="text-sm text-gray-500">평가자</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => handleStepChange('evaluators')}
                >
                  평가자 관리
                </Button>
                <Button
                  variant="primary"
                  onClick={onComplete}
                >
                  대시보드로 돌아가기
                </Button>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="mr-2">←</span>
          프로젝트 목록으로
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{projectTitle}</h1>
        <p className="text-gray-600 mt-2">
          단계별로 모델을 구축하고 평가를 진행하세요.
        </p>
      </div>

      {renderProgressBar()}

      <div className="bg-white rounded-lg shadow-sm">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default ModelBuilderWorkflow;