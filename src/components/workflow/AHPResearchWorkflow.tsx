import React, { useState, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  PlayIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ChartBarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import ProjectCreation from '../admin/ProjectCreation';
import ModelBuilder from '../model/ModelBuilder';
import EvaluatorAssignment from '../admin/EvaluatorAssignment';
import AHPResultsDashboard from '../results/AHPResultsDashboard';
import { 
  AHPResult, 
  GroupAggregationResult, 
  aggregateGroupDecision,
  calculateIndividualAHP,
  AHPNode
} from '../../utils/ahpCalculations';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'in_progress' | 'completed' | 'current';
  canSkip?: boolean;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  objective: string;
  evaluationMode: 'practical' | 'theoretical' | 'direct_input' | 'fuzzy_ahp';
  ahpType: 'general' | 'fuzzy';
  status: 'draft' | 'model_building' | 'evaluator_assignment' | 'evaluation_in_progress' | 'evaluation_complete' | 'results_available';
  created_at: string;
}

interface AHPResearchWorkflowProps {
  onWorkflowComplete?: (projectData: ProjectData) => void;
  onCancel?: () => void;
  initialProject?: ProjectData;
}

const AHPResearchWorkflow: React.FC<AHPResearchWorkflowProps> = ({
  onWorkflowComplete,
  onCancel,
  initialProject
}) => {
  // 워크플로우 상태
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData | null>(initialProject || null);
  const [modelData, setModelData] = useState<AHPNode[]>([]);
  const [evaluators, setEvaluators] = useState<any[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<AHPResult[]>([]);
  const [groupResult, setGroupResult] = useState<GroupAggregationResult | null>(null);

  // 워크플로우 단계 정의
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'project_creation',
      title: '프로젝트 생성',
      description: '연구 주제와 설명, 평가 방식을 설정합니다',
      icon: DocumentTextIcon,
      status: projectData ? 'completed' : 'current'
    },
    {
      id: 'model_building',
      title: '모델 구축',
      description: '3×3 기본 구조 또는 템플릿으로 계층구조를 설계합니다',
      icon: Squares2X2Icon,
      status: modelData.length > 0 ? 'completed' : 
               projectData ? 'current' : 'pending'
    },
    {
      id: 'evaluator_assignment',
      title: '평가자 배정',
      description: 'QR코드 또는 링크로 평가자를 초대합니다',
      icon: UserGroupIcon,
      status: evaluators.length > 0 ? 'completed' :
               modelData.length > 0 ? 'current' : 'pending'
    },
    {
      id: 'evaluation_progress',
      title: '평가 진행',
      description: '평가자들의 쌍대비교 진행 상황을 모니터링합니다',
      icon: ClockIcon,
      status: evaluationResults.length > 0 ? 'completed' :
               evaluators.length > 0 ? 'current' : 'pending'
    },
    {
      id: 'results_analysis',
      title: '결과 분석',
      description: 'AHP 계산 결과와 일관성을 분석합니다',
      icon: ChartBarIcon,
      status: groupResult ? 'completed' :
               evaluationResults.length > 0 ? 'current' : 'pending'
    }
  ];

  // 프로젝트 생성 완료
  const handleProjectCreated = useCallback((newProjectData: ProjectData) => {
    setProjectData(newProjectData);
    setCurrentStep(1); // 모델 구축 단계로 이동
    console.log('✅ 프로젝트 생성 완료:', newProjectData);
  }, []);

  // 모델 구축 완료
  const handleModelCompleted = useCallback((nodes: AHPNode[]) => {
    setModelData(nodes);
    if (projectData) {
      setProjectData(prev => prev ? { ...prev, status: 'evaluator_assignment' } : null);
    }
    setCurrentStep(2); // 평가자 배정 단계로 이동
    console.log('✅ 모델 구축 완료:', nodes);
  }, [projectData]);

  // 평가자 배정 완료
  const handleEvaluatorAssignmentCompleted = useCallback((assignedEvaluators: any[]) => {
    setEvaluators(assignedEvaluators);
    if (projectData) {
      setProjectData(prev => prev ? { ...prev, status: 'evaluation_in_progress' } : null);
    }
    setCurrentStep(3); // 평가 진행 단계로 이동
    console.log('✅ 평가자 배정 완료:', assignedEvaluators);
  }, [projectData]);

  // 평가 완료 (시뮬레이션)
  const simulateEvaluationCompletion = useCallback(() => {
    // 실제 구현에서는 평가자들의 실제 평가 데이터를 받아옴
    // 여기서는 시뮬레이션 데이터 생성
    const mockResults: AHPResult[] = evaluators.map((evaluator, index) => ({
      project_id: projectData?.id || 'project_1',
      evaluator_id: evaluator.id || `evaluator_${index}`,
      is_group_result: false,
      node_weights: {
        'criteria_1': 0.4 + Math.random() * 0.2,
        'criteria_2': 0.3 + Math.random() * 0.2,
        'criteria_3': 0.3 + Math.random() * 0.2
      },
      alternative_scores: {
        'alt_1': 0.3 + Math.random() * 0.3,
        'alt_2': 0.3 + Math.random() * 0.3,
        'alt_3': 0.4 + Math.random() * 0.3
      },
      alternative_rankings: [
        { id: 'alt_1', name: '대안 1', score: 0.35, rank: 2 },
        { id: 'alt_2', name: '대안 2', score: 0.25, rank: 3 },
        { id: 'alt_3', name: '대안 3', score: 0.40, rank: 1 }
      ],
      consistency_ratios: {
        'root': 0.05 + Math.random() * 0.05
      },
      overall_consistency: 0.05 + Math.random() * 0.05,
      calculation_timestamp: new Date().toISOString()
    }));

    setEvaluationResults(mockResults);
    
    // 그룹 결과 집계
    if (mockResults.length > 1) {
      const aggregated = aggregateGroupDecision(mockResults);
      setGroupResult(aggregated);
    }

    if (projectData) {
      setProjectData(prev => prev ? { ...prev, status: 'results_available' } : null);
    }
    setCurrentStep(4); // 결과 분석 단계로 이동
    console.log('✅ 평가 완료 및 결과 집계:', mockResults);
  }, [evaluators, projectData]);

  // 워크플로우 완료
  const handleWorkflowComplete = useCallback(() => {
    if (projectData) {
      onWorkflowComplete?.(projectData);
    }
  }, [projectData, onWorkflowComplete]);

  // 단계 이동
  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep || workflowSteps[stepIndex].status === 'completed') {
      setCurrentStep(stepIndex);
    }
  };

  // 워크플로우 진행률 계산
  const progressPercentage = ((currentStep + 1) / workflowSteps.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 및 진행 상황 */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AHP 연구 워크플로우</h1>
              <p className="text-gray-600">
                {projectData ? `프로젝트: ${projectData.title}` : '새로운 AHP 연구 프로젝트'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                진행률: {Math.round(progressPercentage)}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  취소
                </Button>
              )}
            </div>
          </div>

          {/* 단계 표시 */}
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => (
              <div 
                key={step.id} 
                className="flex items-center cursor-pointer"
                onClick={() => goToStep(index)}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  step.status === 'current' || index === currentStep ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    step.status === 'completed' || step.status === 'current' || index === currentStep
                      ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>

                {index < workflowSteps.length - 1 && (
                  <ArrowRightIcon className="h-4 w-4 text-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto">
        {/* 단계 1: 프로젝트 생성 */}
        {currentStep === 0 && (
          <div className="p-6">
            <ProjectCreation
              onProjectCreated={() => {
                // 실제 구현에서는 API 호출 결과를 받아옴
                const newProject: ProjectData = {
                  id: `project_${Date.now()}`,
                  title: '새로운 AHP 프로젝트',
                  description: '프로젝트 설명',
                  objective: '연구 목표',
                  evaluationMode: 'practical',
                  ahpType: 'general',
                  status: 'model_building',
                  created_at: new Date().toISOString()
                };
                handleProjectCreated(newProject);
              }}
              onCancel={onCancel || (() => {})}
              loading={false}
            />
          </div>
        )}

        {/* 단계 2: 모델 구축 */}
        {currentStep === 1 && projectData && (
          <div className="p-6">
            <ModelBuilder
              projectId={projectData.id}
              onComplete={() => {
                // 시뮬레이션 모델 데이터
                const mockModelData: AHPNode[] = [
                  {
                    id: 'goal_1',
                    name: projectData.title,
                    type: 'goal',
                    children: ['criteria_1', 'criteria_2', 'criteria_3'],
                    level: 0
                  },
                  {
                    id: 'criteria_1',
                    name: '주기준 1',
                    type: 'criteria',
                    parent_id: 'goal_1',
                    children: ['sub_1_1', 'sub_1_2', 'sub_1_3'],
                    level: 1
                  },
                  // ... 더 많은 노드들
                ];
                handleModelCompleted(mockModelData);
              }}
              demoMode={false}
            />
          </div>
        )}

        {/* 단계 3: 평가자 배정 */}
        {currentStep === 2 && projectData && (
          <div className="p-6">
            <EvaluatorAssignment
              projectId={projectData.id}
              onComplete={() => {
                // 시뮬레이션 평가자 데이터
                const mockEvaluators = [
                  { id: 'eval_1', name: '평가자 1', email: 'eval1@example.com', status: 'active' },
                  { id: 'eval_2', name: '평가자 2', email: 'eval2@example.com', status: 'active' },
                  { id: 'eval_3', name: '평가자 3', email: 'eval3@example.com', status: 'active' }
                ];
                handleEvaluatorAssignmentCompleted(mockEvaluators);
              }}
              maxEvaluators={50}
            />
          </div>
        )}

        {/* 단계 4: 평가 진행 */}
        {currentStep === 3 && (
          <div className="p-6">
            <Card title="평가 진행 모니터링">
              <div className="space-y-6">
                <div className="text-center">
                  <BeakerIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    평가자들이 쌍대비교를 진행 중입니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    각 평가자가 순서대로 평가를 완료하면 DB에 자동 저장됩니다
                  </p>
                </div>

                {/* 평가 진행 상황 */}
                <div className="space-y-3">
                  {evaluators.map((evaluator, index) => (
                    <div key={evaluator.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">{evaluator.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">완료</span>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button 
                    variant="primary" 
                    onClick={simulateEvaluationCompletion}
                    className="flex items-center"
                  >
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    결과 계산 및 분석하기
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 단계 5: 결과 분석 */}
        {currentStep === 4 && projectData && evaluationResults.length > 0 && (
          <AHPResultsDashboard
            projectId={projectData.id}
            projectTitle={projectData.title}
            individualResults={evaluationResults}
            groupResult={groupResult || undefined}
            nodes={modelData}
            onExportResults={() => {
              console.log('📊 결과 내보내기');
              // 실제 내보내기 로직
            }}
            onBackToEvaluation={() => {
              setCurrentStep(3);
            }}
          />
        )}
      </div>

      {/* 하단 네비게이션 */}
      {currentStep < 4 && (
        <div className="bg-white border-t p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              이전 단계
            </Button>

            <div className="text-sm text-gray-600">
              {currentStep + 1} / {workflowSteps.length} 단계
            </div>

            {currentStep === 4 ? (
              <Button
                variant="primary"
                onClick={handleWorkflowComplete}
                className="flex items-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                워크플로우 완료
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={workflowSteps[currentStep + 1]?.status === 'pending'}
                className="flex items-center"
              >
                다음 단계
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AHPResearchWorkflow;