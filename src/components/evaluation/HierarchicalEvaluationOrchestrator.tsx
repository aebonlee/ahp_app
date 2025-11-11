import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import PairwiseComparison from './PairwiseComparison';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiService } from '../../services/apiService';
import { ahpCalculator } from '../../utils/ahpCalculator';
import { consistencyHelper } from '../../utils/consistencyHelper';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level: number;
  order?: number;
  children?: Criterion[];
  weight?: number;
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
}

interface ComparisonMatrix {
  [key: string]: {
    [key: string]: number;
  };
}

interface EvaluationStep {
  id: string;
  type: 'criteria' | 'alternatives';
  level: number;
  parentId?: string;
  parentName?: string;
  items: (Criterion | Alternative)[];
  completed: boolean;
  matrix?: ComparisonMatrix;
  weights?: { [key: string]: number };
  cr?: number;
}

interface HierarchicalEvaluationOrchestratorProps {
  projectId: string;
  evaluatorId?: string;
  onComplete?: (results: any) => void;
}

const HierarchicalEvaluationOrchestrator: React.FC<HierarchicalEvaluationOrchestratorProps> = ({
  projectId,
  evaluatorId,
  onComplete
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [evaluationSteps, setEvaluationSteps] = useState<EvaluationStep[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  // 프로젝트 데이터 로드
  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // 평가 단계 생성
  useEffect(() => {
    if (criteria.length > 0 && alternatives.length > 0) {
      generateEvaluationSteps();
    }
  }, [criteria, alternatives]);

  const loadProjectData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 프로젝트 정보 로드
      const projectResponse = await apiService.get(`/api/projects/${projectId}/`);
      setProjectName(projectResponse.data.name);

      // 기준 로드
      const criteriaResponse = await apiService.get(`/api/criteria/project/${projectId}/`);
      const criteriaData = Array.isArray(criteriaResponse.data) 
        ? criteriaResponse.data 
        : criteriaResponse.data.results || [];
      
      // 계층 구조로 정리
      const hierarchicalCriteria = buildHierarchy(criteriaData);
      setCriteria(hierarchicalCriteria);

      // 대안 로드
      const alternativesResponse = await apiService.get(`/api/alternatives/project/${projectId}/`);
      const alternativesData = Array.isArray(alternativesResponse.data)
        ? alternativesResponse.data
        : alternativesResponse.data.results || [];
      setAlternatives(alternativesData);

    } catch (err: any) {
      console.error('프로젝트 데이터 로드 실패:', err);
      setError('프로젝트 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (flatCriteria: any[]): Criterion[] => {
    const criteriaMap = new Map<string, Criterion>();
    const rootCriteria: Criterion[] = [];

    // 모든 기준을 맵에 저장
    flatCriteria.forEach(criterion => {
      criteriaMap.set(criterion.id, {
        ...criterion,
        parentId: criterion.parent_id || criterion.parentId,
        children: []
      });
    });

    // 계층 구조 구성
    criteriaMap.forEach(criterion => {
      if (!criterion.parentId) {
        rootCriteria.push(criterion);
      } else {
        const parent = criteriaMap.get(criterion.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(criterion);
        }
      }
    });

    return rootCriteria;
  };

  const generateEvaluationSteps = () => {
    const steps: EvaluationStep[] = [];
    let stepId = 0;

    // 1단계: 최상위 기준 간 비교
    const topLevelCriteria = criteria.filter(c => !c.parentId);
    if (topLevelCriteria.length > 1) {
      steps.push({
        id: `step-${stepId++}`,
        type: 'criteria',
        level: 1,
        items: topLevelCriteria,
        completed: false
      });
    }

    // 2단계: 각 상위 기준별 하위 기준 비교
    const processSubCriteria = (parentCriterion: Criterion, level: number) => {
      if (parentCriterion.children && parentCriterion.children.length > 1) {
        steps.push({
          id: `step-${stepId++}`,
          type: 'criteria',
          level: level,
          parentId: parentCriterion.id,
          parentName: parentCriterion.name,
          items: parentCriterion.children,
          completed: false
        });

        // 재귀적으로 더 깊은 레벨 처리
        parentCriterion.children.forEach(child => {
          processSubCriteria(child, level + 1);
        });
      }
    };

    topLevelCriteria.forEach(criterion => {
      processSubCriteria(criterion, 2);
    });

    // 3단계: 각 최하위 기준별 대안 비교
    const getLeafCriteria = (criterion: Criterion): Criterion[] => {
      if (!criterion.children || criterion.children.length === 0) {
        return [criterion];
      }
      return criterion.children.flatMap(child => getLeafCriteria(child));
    };

    const leafCriteria = criteria.flatMap(c => getLeafCriteria(c));
    
    leafCriteria.forEach(criterion => {
      if (alternatives.length > 1) {
        steps.push({
          id: `step-${stepId++}`,
          type: 'alternatives',
          level: 99, // 대안 비교는 특별한 레벨로 표시
          parentId: criterion.id,
          parentName: criterion.name,
          items: alternatives,
          completed: false
        });
      }
    });

    setEvaluationSteps(steps);
  };

  const handleComparisonComplete = async (matrix: ComparisonMatrix, consistencyRatio: number) => {
    const currentStep = evaluationSteps[currentStepIndex];
    
    // 현재 단계 업데이트
    const updatedSteps = [...evaluationSteps];
    updatedSteps[currentStepIndex] = {
      ...currentStep,
      completed: true,
      matrix: matrix,
      cr: consistencyRatio,
      weights: calculateWeights(matrix, currentStep.items)
    };
    setEvaluationSteps(updatedSteps);

    // 다음 단계로 이동 또는 완료
    if (currentStepIndex < evaluationSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // 모든 평가 완료 - 최종 결과 계산
      await calculateFinalResults(updatedSteps);
    }
  };

  const calculateWeights = (matrix: ComparisonMatrix, items: any[]): { [key: string]: number } => {
    const weights: { [key: string]: number } = {};
    const calculatedWeights = ahpCalculator.calculateWeights(matrix);
    
    items.forEach((item, index) => {
      weights[item.id] = calculatedWeights[index] || 0;
    });
    
    return weights;
  };

  const calculateFinalResults = async (completedSteps: EvaluationStep[]) => {
    setIsCalculating(true);
    
    try {
      // 계층별 가중치 집계
      const globalWeights = aggregateHierarchicalWeights(completedSteps);
      
      // 대안별 최종 점수 계산
      const alternativeScores = calculateAlternativeScores(completedSteps, globalWeights);
      
      // 결과 저장
      const results = {
        projectId,
        evaluatorId,
        steps: completedSteps,
        globalWeights,
        alternativeScores,
        timestamp: new Date().toISOString()
      };

      // API로 결과 전송
      await apiService.post(`/api/evaluations/hierarchical/`, results);

      // 완료 콜백
      if (onComplete) {
        onComplete(results);
      } else {
        // 결과 페이지로 이동
        navigate(`/results/${projectId}`);
      }
    } catch (err) {
      console.error('결과 계산 실패:', err);
      setError('결과 계산 중 오류가 발생했습니다.');
    } finally {
      setIsCalculating(false);
    }
  };

  const aggregateHierarchicalWeights = (steps: EvaluationStep[]): { [key: string]: number } => {
    const globalWeights: { [key: string]: number } = {};
    
    // 상위 기준 가중치부터 시작
    const topLevelStep = steps.find(s => s.level === 1 && s.type === 'criteria');
    if (topLevelStep && topLevelStep.weights) {
      Object.assign(globalWeights, topLevelStep.weights);
    }
    
    // 하위 기준 가중치 계산 (부모 가중치 × 로컬 가중치)
    steps.filter(s => s.level > 1 && s.type === 'criteria').forEach(step => {
      if (step.weights && step.parentId) {
        const parentWeight = globalWeights[step.parentId] || 1;
        Object.entries(step.weights).forEach(([criterionId, localWeight]) => {
          globalWeights[criterionId] = parentWeight * localWeight;
        });
      }
    });
    
    return globalWeights;
  };

  const calculateAlternativeScores = (
    steps: EvaluationStep[],
    criteriaWeights: { [key: string]: number }
  ): { [key: string]: number } => {
    const scores: { [key: string]: number } = {};
    
    // 각 대안별 점수 초기화
    alternatives.forEach(alt => {
      scores[alt.id] = 0;
    });
    
    // 대안 비교 단계들을 처리
    steps.filter(s => s.type === 'alternatives').forEach(step => {
      if (step.weights && step.parentId) {
        const criterionWeight = criteriaWeights[step.parentId] || 0;
        Object.entries(step.weights).forEach(([altId, altWeight]) => {
          scores[altId] = (scores[altId] || 0) + (criterionWeight * altWeight);
        });
      }
    });
    
    return scores;
  };

  const renderCurrentStep = () => {
    if (evaluationSteps.length === 0) return null;
    
    const currentStep = evaluationSteps[currentStepIndex];
    
    return (
      <div className="space-y-6">
        {/* 단계 헤더 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentStep.type === 'criteria' ? '기준 비교' : '대안 비교'}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStepIndex + 1} / {evaluationSteps.length} 단계
            </span>
          </div>
          
          {currentStep.parentName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              상위 기준: <span className="font-medium">{currentStep.parentName}</span>
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {currentStep.items.map((item, index) => (
              <span
                key={item.id}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* 쌍대비교 컴포넌트 */}
        <PairwiseComparison
          items={currentStep.items}
          type={currentStep.type}
          onComplete={handleComparisonComplete}
          projectId={projectId}
          parentCriterion={currentStep.parentId}
        />
      </div>
    );
  };

  const renderProgress = () => {
    const completedSteps = evaluationSteps.filter(s => s.completed).length;
    const progressPercent = (completedSteps / evaluationSteps.length) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            전체 진행률
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedSteps} / {evaluationSteps.length} 완료
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* 단계별 상태 표시 */}
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {evaluationSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-2 rounded ${
                index === currentStepIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                {step.completed ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : index === currentStepIndex ? (
                  <ClockIcon className="w-5 h-5 text-blue-600 animate-pulse" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {step.parentName
                    ? `${step.parentName} 하위`
                    : step.type === 'criteria'
                    ? `레벨 ${step.level} 기준`
                    : `${step.parentName} 대안`}
                </span>
              </div>
              {step.cr !== undefined && (
                <span className={`text-xs ${
                  step.cr <= 0.1 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  CR: {step.cr.toFixed(3)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>
              돌아가기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          최종 결과를 계산하고 있습니다...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          계층적 평가 진행
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          프로젝트: {projectName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 평가 영역 */}
        <div className="lg:col-span-2">
          {renderCurrentStep()}
        </div>

        {/* 진행 상태 사이드바 */}
        <div className="lg:col-span-1">
          {renderProgress()}
        </div>
      </div>
    </div>
  );
};

export default HierarchicalEvaluationOrchestrator;