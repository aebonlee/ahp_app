/**
 * AHP 워크플로우 통합 관리자
 * 프로젝트 생성 → 기준 설정 → 대안 설정 → 평가 → 결과 분석의 전체 플로우 관리
 */

import React, { useState, useEffect } from 'react';
import EnhancedProjectCreationForm, { ProjectFormData } from '../admin/EnhancedProjectCreationForm';
import EnhancedCriteriaManagement from '../admin/EnhancedCriteriaManagement';
import EnhancedAlternativesManagement from '../admin/EnhancedAlternativesManagement';
import AHPResultsDashboard from '../results/AHPResultsDashboard';

type WorkflowStep = 'project' | 'criteria' | 'alternatives' | 'results';

interface WorkflowState {
  currentStep: WorkflowStep;
  projectData: ProjectFormData | null;
  criteriaData: Array<{
    id: string;
    name: string;
    description?: string;
    weight?: number;
  }>;
  alternativesData: Array<{
    id: string;
    name: string;
    description?: string;
    scores?: { [criterionId: string]: number };
  }>;
  evaluationData: {
    criteriaComparisons: Array<{i: number, j: number, value: number}>;
    alternativeComparisons: {[criterionId: string]: Array<{i: number, j: number, value: number}>};
  };
}

interface AHPWorkflowManagerProps {
  onWorkflowComplete?: (results: any) => void;
  initialStep?: WorkflowStep;
  projectId?: string;
}

const AHPWorkflowManager: React.FC<AHPWorkflowManagerProps> = ({
  onWorkflowComplete,
  initialStep = 'project',
  projectId
}) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: initialStep,
    projectData: null,
    criteriaData: [],
    alternativesData: [],
    evaluationData: {
      criteriaComparisons: [],
      alternativeComparisons: {}
    }
  });

  const [stepProgress, setStepProgress] = useState({
    project: false,
    criteria: false,
    alternatives: false,
    results: false
  });

  const steps: Array<{
    key: WorkflowStep;
    title: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      key: 'project',
      title: '프로젝트 정의',
      description: '목적과 평가방법 설정',
      icon: '🎯',
      color: 'blue'
    },
    {
      key: 'criteria',
      title: '평가기준 설정',
      description: '의사결정 기준 정의 및 중요도 설정',
      icon: '📊',
      color: 'green'
    },
    {
      key: 'alternatives',
      title: '대안 설정 및 평가',
      description: '선택지 정의 및 기준별 평가',
      icon: '⚖️',
      color: 'purple'
    },
    {
      key: 'results',
      title: '결과 분석',
      description: 'AHP 분석 결과 및 최종 의사결정',
      icon: '📈',
      color: 'orange'
    }
  ];

  const moveToStep = (step: WorkflowStep) => {
    setWorkflowState(prev => ({
      ...prev,
      currentStep: step
    }));
  };

  const handleProjectComplete = (projectData: ProjectFormData) => {
    setWorkflowState(prev => ({
      ...prev,
      projectData,
      currentStep: 'criteria'
    }));
    
    setStepProgress(prev => ({
      ...prev,
      project: true
    }));
  };

  const handleCriteriaComplete = () => {
    setStepProgress(prev => ({
      ...prev,
      criteria: true
    }));
    
    moveToStep('alternatives');
  };

  const handleAlternativesComplete = () => {
    setStepProgress(prev => ({
      ...prev,
      alternatives: true
    }));
    
    moveToStep('results');
  };

  const handleWorkflowComplete = (results: any) => {
    setStepProgress(prev => ({
      ...prev,
      results: true
    }));
    
    if (onWorkflowComplete) {
      onWorkflowComplete(results);
    }
  };

  const getStepStatus = (stepKey: WorkflowStep) => {
    if (workflowState.currentStep === stepKey) return 'current';
    if (stepProgress[stepKey]) return 'completed';
    
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    const currentStepIndex = steps.findIndex(s => s.key === workflowState.currentStep);
    
    return stepIndex < currentStepIndex ? 'available' : 'locked';
  };

  const canNavigateToStep = (stepKey: WorkflowStep) => {
    const status = getStepStatus(stepKey);
    return status === 'current' || status === 'completed' || status === 'available';
  };

  const renderProgressIndicator = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">AHP 분석 진행 상황</h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          const isClickable = canNavigateToStep(step.key);
          
          return (
            <div key={step.key} className="flex items-center">
              {/* Step indicator */}
              <button
                onClick={() => isClickable && moveToStep(step.key)}
                disabled={!isClickable}
                className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mr-4 transition-colors ${
                  status === 'current' 
                    ? `bg-${step.color}-600 text-white ring-4 ring-${step.color}-200`
                    : status === 'completed'
                    ? 'bg-green-600 text-white'
                    : status === 'available'
                    ? `bg-${step.color}-100 text-${step.color}-600 hover:bg-${step.color}-200 cursor-pointer`
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {status === 'completed' ? '✓' : step.icon}
              </button>
              
              {/* Step content */}
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  status === 'current' ? `text-${step.color}-600` : 
                  status === 'completed' ? 'text-green-600' :
                  status === 'available' ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-6 mt-12 w-0.5 h-8 ${
                  stepProgress[step.key] ? 'bg-green-600' : 'bg-gray-200'
                }`} style={{ marginLeft: '1.5rem' }} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Overall progress */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>전체 진행률</span>
          <span>{Math.round((Object.values(stepProgress).filter(Boolean).length / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(Object.values(stepProgress).filter(Boolean).length / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStepContent = () => {
    switch (workflowState.currentStep) {
      case 'project':
        return (
          <EnhancedProjectCreationForm
            onSubmit={handleProjectComplete}
            onCancel={() => {}}
            initialData={workflowState.projectData || undefined}
            isEditing={!!workflowState.projectData}
          />
        );
      
      case 'criteria':
        if (!workflowState.projectData) {
          return (
            <div className="text-center p-8">
              <p className="text-gray-600">프로젝트를 먼저 설정해주세요.</p>
              <button
                onClick={() => moveToStep('project')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                프로젝트 설정으로 이동
              </button>
            </div>
          );
        }
        
        return (
          <EnhancedCriteriaManagement
            projectId={projectId || workflowState.projectData.id || 'temp'}
            projectTitle={workflowState.projectData.title}
            onComplete={handleCriteriaComplete}
            onCriteriaChange={(count) => {
              console.log(`기준 개수 변경: ${count}`);
            }}
          />
        );
      
      case 'alternatives':
        if (!workflowState.projectData || workflowState.criteriaData.length === 0) {
          return (
            <div className="text-center p-8">
              <p className="text-gray-600">기준을 먼저 설정해주세요.</p>
              <button
                onClick={() => moveToStep('criteria')}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                기준 설정으로 이동
              </button>
            </div>
          );
        }
        
        return (
          <EnhancedAlternativesManagement
            projectId={projectId || workflowState.projectData.id || 'temp'}
            projectTitle={workflowState.projectData.title}
            criteria={workflowState.criteriaData}
            onComplete={handleAlternativesComplete}
            onAlternativesChange={(count) => {
              console.log(`대안 개수 변경: ${count}`);
            }}
          />
        );
      
      case 'results':
        return (
          <AHPResultsDashboard
            projectData={workflowState.projectData}
            criteriaData={workflowState.criteriaData}
            alternativesData={workflowState.alternativesData}
            evaluationData={workflowState.evaluationData}
            onComplete={handleWorkflowComplete}
          />
        );
      
      default:
        return <div>알 수 없는 단계입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        {renderProgressIndicator()}
        
        {/* Current Step Content */}
        <div className="relative">
          {renderCurrentStepContent()}
        </div>
        
        {/* Navigation Buttons */}
        {workflowState.currentStep !== 'project' && (
          <div className="fixed bottom-6 right-6 space-x-3">
            <button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.key === workflowState.currentStep);
                if (currentIndex > 0) {
                  moveToStep(steps[currentIndex - 1].key);
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            >
              ← 이전 단계
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AHPWorkflowManager;