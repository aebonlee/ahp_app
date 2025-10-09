import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ProjectCreation from './ProjectCreation';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import ProjectCompletion from './ProjectCompletion';
import dataService from '../../services/dataService_clean';
import { ProjectData } from '../../services/api';

interface ProjectWorkflowProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface WorkflowState {
  currentStep: number;
  projectId: string | null;
  projectData: ProjectData | null;
  criteriaCount: number;
  alternativesCount: number;
  evaluatorsCount: number;
}

const ProjectWorkflow: React.FC<ProjectWorkflowProps> = ({ onComplete, onCancel }) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 1,
    projectId: null,
    projectData: null,
    criteriaCount: 0,
    alternativesCount: 0,
    evaluatorsCount: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 단계별 제목
  const stepTitles = [
    '프로젝트 생성',
    '평가 기준 설정',
    '대안 설정',
    '평가자 배정',
    '프로젝트 완료'
  ];

  // 프로젝트 생성 핸들러
  const handleProjectCreated = async (projectData: any) => {
    try {
      setLoading(true);
      console.log('🔄 프로젝트 생성 중...', projectData);
      
      const createdProject = await dataService.createProject({
        title: projectData.title,
        description: projectData.description,
        objective: projectData.objective,
        ahp_type: projectData.ahpType,
        status: 'active',
        evaluation_mode: projectData.evaluationMode || 'practical',
        workflow_stage: 'creating'
      });

      if (createdProject && createdProject.id) {
        console.log('✅ 프로젝트 생성 성공:', createdProject);
        setWorkflowState(prev => ({
          ...prev,
          currentStep: 2,
          projectId: createdProject.id || null,
          projectData: createdProject
        }));
      }
    } catch (error) {
      console.error('❌ 프로젝트 생성 실패:', error);
      setError('프로젝트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 기준 설정 완료 핸들러
  const handleCriteriaComplete = () => {
    console.log(`✅ 기준 설정 완료: ${workflowState.criteriaCount}개`);
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 3
    }));
  };

  // 대안 설정 완료 핸들러
  const handleAlternativesComplete = () => {
    console.log(`✅ 대안 설정 완료: ${workflowState.alternativesCount}개`);
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 4
    }));
  };

  // 평가자 배정 완료 핸들러
  const handleEvaluatorsComplete = () => {
    console.log(`✅ 평가자 배정 완료: ${workflowState.evaluatorsCount}명`);
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 5
    }));
  };

  // 프로젝트 상태 변경 핸들러
  const handleProjectStatusChange = async (status: 'terminated' | 'completed') => {
    try {
      if (workflowState.projectId) {
        // TODO: API를 통한 프로젝트 상태 업데이트
        console.log(`프로젝트 ${workflowState.projectId} 상태 변경: ${status}`);
        
        if (status === 'completed' && onComplete) {
          onComplete();
        } else if (status === 'terminated' && onCancel) {
          onCancel();
        }
      }
    } catch (error) {
      console.error('프로젝트 상태 변경 실패:', error);
    }
  };

  // 이전 단계로 이동
  const handleGoBack = () => {
    if (workflowState.currentStep > 1) {
      setWorkflowState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  // 워크플로우 취소
  const handleCancel = async () => {
    if (window.confirm('프로젝트 생성을 취소하시겠습니까? 입력한 모든 데이터가 삭제됩니다.')) {
      try {
        if (workflowState.projectId) {
          // 프로젝트 삭제
          await dataService.deleteProject(workflowState.projectId);
        }
        if (onCancel) {
          onCancel();
        }
      } catch (error) {
        console.error('프로젝트 취소 중 오류:', error);
      }
    }
  };

  // 진행 상황 표시
  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {stepTitles.map((title, index) => {
            const stepNum = index + 1;
            const isActive = workflowState.currentStep === stepNum;
            const isCompleted = workflowState.currentStep > stepNum;
            
            return (
              <div key={stepNum} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      isActive ? 'bg-blue-500 text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <span className={`mt-2 text-xs ${
                    isActive ? 'text-blue-600 font-semibold' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {title}
                  </span>
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${
                    workflowState.currentStep > stepNum ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 현재 단계 컴포넌트 렌더링
  const renderCurrentStep = () => {
    if (error) {
      return (
        <Card>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => setError(null)} variant="primary">
              다시 시도
            </Button>
          </div>
        </Card>
      );
    }

    switch (workflowState.currentStep) {
      case 1:
        return (
          <ProjectCreation
            onProjectCreated={() => {}} // 실제 로직은 createProject에서 처리
            onCancel={handleCancel}
            loading={loading}
            createProject={handleProjectCreated}
          />
        );
      
      case 2:
        return workflowState.projectId ? (
          <CriteriaManagement
            projectId={workflowState.projectId}
            projectTitle={workflowState.projectData?.title}
            onComplete={handleCriteriaComplete}
            onCriteriaChange={(count) => setWorkflowState(prev => ({
              ...prev,
              criteriaCount: count
            }))}
          />
        ) : null;
      
      case 3:
        return workflowState.projectId ? (
          <AlternativeManagement
            projectId={workflowState.projectId}
            onComplete={handleAlternativesComplete}
            onAlternativesChange={(count) => setWorkflowState(prev => ({
              ...prev,
              alternativesCount: count
            }))}
          />
        ) : null;
      
      case 4:
        return workflowState.projectId ? (
          <EvaluatorAssignment
            projectId={workflowState.projectId}
            onComplete={handleEvaluatorsComplete}
          />
        ) : null;
      
      case 5:
        return workflowState.projectId && workflowState.projectData ? (
          <ProjectCompletion
            projectId={workflowState.projectId}
            projectTitle={workflowState.projectData.title}
            onBack={handleGoBack}
            onProjectStatusChange={handleProjectStatusChange}
            criteriaCount={workflowState.criteriaCount}
            alternativesCount={workflowState.alternativesCount}
            evaluatorsCount={workflowState.evaluatorsCount}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          AHP 프로젝트 생성 워크플로우
        </h1>
        <p className="text-gray-600 mt-2">
          단계별로 프로젝트를 구성하고 평가를 준비합니다.
        </p>
      </div>

      {/* 진행 상황 바 */}
      {renderProgressBar()}

      {/* 현재 단계 정보 */}
      {workflowState.projectData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                프로젝트: {workflowState.projectData.title}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                ID: {workflowState.projectId} | 
                기준: {workflowState.criteriaCount}개 | 
                대안: {workflowState.alternativesCount}개 | 
                평가자: {workflowState.evaluatorsCount}명
              </p>
            </div>
            {workflowState.currentStep > 1 && workflowState.currentStep < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
              >
                ← 이전 단계
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 현재 단계 컴포넌트 */}
      {renderCurrentStep()}

      {/* 디버그 정보 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify(workflowState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkflow;