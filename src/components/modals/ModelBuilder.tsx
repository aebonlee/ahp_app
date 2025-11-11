import React, { useState, useEffect } from 'react';
import { ProjectData } from '../../services/dataService';
import CriteriaManagement from '../admin/CriteriaManagement';
import AlternativeManagement from '../admin/AlternativeManagement';
import EvaluatorAssignment from '../admin/EvaluatorAssignment';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';
import { Criterion, Alternative, Evaluator } from '../../types/ahp';

type ModelStep = 'overview' | 'criteria' | 'alternatives' | 'evaluators' | 'review' | 'complete';

interface ModelBuilderProps {
  project: ProjectData;
  currentStep?: ModelStep;
  onStepChange?: (step: ModelStep) => void;
  onClose: () => void;
  onComplete?: () => void;
}

const ModelBuilder: React.FC<ModelBuilderProps> = ({ 
  project, 
  currentStep: initialStep = 'overview', 
  onStepChange, 
  onClose,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState<ModelStep>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<ModelStep>>(new Set());
  const [projectData, setProjectData] = useState<{
    criteria: Criterion[];
    alternatives: Alternative[];
    evaluators: Evaluator[];
  }>({
    criteria: [],
    alternatives: [],
    evaluators: []
  });
  const [loading, setLoading] = useState(false);

  const steps: { key: ModelStep; label: string; icon: string }[] = [
    { key: 'overview', label: '개요', icon: '📋' },
    { key: 'criteria', label: '평가 기준', icon: '📊' },
    { key: 'alternatives', label: '대안', icon: '🎯' },
    { key: 'evaluators', label: '평가자', icon: '👥' },
    { key: 'review', label: '검토', icon: '✅' },
    { key: 'complete', label: '완료', icon: '🎉' }
  ];

  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [criteriaRes, alternativesRes, evaluatorsRes] = await Promise.all([
        apiService.get(`/api/criteria/project/${project.id}/`),
        apiService.get(`/api/alternatives/project/${project.id}/`),
        apiService.get(`/api/evaluators/project/${project.id}/`)
      ]);

      setProjectData({
        criteria: criteriaRes.data || [],
        alternatives: alternativesRes.data || [],
        evaluators: evaluatorsRes.data || []
      });

      // 이미 데이터가 있는 단계는 완료로 표시
      const completed = new Set<ModelStep>();
      if (criteriaRes.data?.length > 0) completed.add('criteria');
      if (alternativesRes.data?.length > 0) completed.add('alternatives');
      if (evaluatorsRes.data?.length > 0) completed.add('evaluators');
      setCompletedSteps(completed);

    } catch (error) {
      console.error('프로젝트 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step: ModelStep) => {
    setCurrentStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  const handleStepComplete = (step: ModelStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    
    // 다음 단계로 자동 이동
    const stepIndex = steps.findIndex(s => s.key === step);
    if (stepIndex < steps.length - 1) {
      handleStepChange(steps[stepIndex + 1].key);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => handleStepChange(step.key)}
              className={`
                flex flex-col items-center p-3 rounded-lg transition-all
                ${currentStep === step.key 
                  ? 'bg-blue-100 text-blue-700' 
                  : completedSteps.has(step.key)
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
              `}
            >
              <span className="text-2xl mb-1">{step.icon}</span>
              <span className="text-xs font-medium">{step.label}</span>
              {completedSteps.has(step.key) && (
                <CheckCircleIcon className="w-4 h-4 mt-1 text-green-600" />
              )}
            </button>
            {index < steps.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2
                ${completedSteps.has(step.key) ? 'bg-green-400' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">프로젝트 개요</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                <strong>프로젝트:</strong> {project.title}
              </p>
              <p className="text-gray-600 mb-6">
                {project.description || '설명이 없습니다.'}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span>평가 기준</span>
                  <span className="font-medium">{projectData.criteria.length}개</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span>대안</span>
                  <span className="font-medium">{projectData.alternatives.length}개</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <span>평가자</span>
                  <span className="font-medium">{projectData.evaluators.length}명</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleStepChange('criteria')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              모델 구축 시작
            </button>
          </div>
        );

      case 'criteria':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">평가 기준 설정</h3>
            <CriteriaManagement 
              projectId={project.id}
              onComplete={() => handleStepComplete('criteria')}
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleStepChange('overview')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={() => handleStepChange('alternatives')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다음
              </button>
            </div>
          </div>
        );

      case 'alternatives':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">대안 설정</h3>
            <AlternativeManagement 
              projectId={project.id}
              onComplete={() => handleStepComplete('alternatives')}
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleStepChange('criteria')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={() => handleStepChange('evaluators')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다음
              </button>
            </div>
          </div>
        );

      case 'evaluators':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">평가자 배정</h3>
            <EvaluatorAssignment 
              projectId={project.id}
              onComplete={() => handleStepComplete('evaluators')}
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleStepChange('alternatives')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={() => handleStepChange('review')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다음
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">모델 검토</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">평가 기준 ({projectData.criteria.length}개)</h4>
                <div className="space-y-1">
                  {projectData.criteria.map((criterion) => (
                    <div key={criterion.id} className="text-sm text-gray-600">
                      • {criterion.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">대안 ({projectData.alternatives.length}개)</h4>
                <div className="space-y-1">
                  {projectData.alternatives.map((alt) => (
                    <div key={alt.id} className="text-sm text-gray-600">
                      • {alt.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">평가자 ({projectData.evaluators.length}명)</h4>
                <div className="space-y-1">
                  {projectData.evaluators.map((evaluator) => (
                    <div key={evaluator.id} className="text-sm text-gray-600">
                      • {evaluator.name || evaluator.email}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleStepChange('evaluators')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={() => handleStepChange('complete')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                모델 확정
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-4">
              모델 구축 완료!
            </h3>
            <p className="text-gray-600 mb-8">
              모든 설정이 완료되었습니다. 이제 평가를 시작할 수 있습니다.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                  onClose();
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                평가 시작하기
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">모델 구축 마법사</h2>
              <p className="text-blue-100 text-sm mt-1">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="border-b px-6 py-4 bg-gray-50">
          {renderStepIndicator()}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">데이터 로드 중...</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelBuilder;