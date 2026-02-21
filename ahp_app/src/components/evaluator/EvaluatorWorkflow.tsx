import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import PairwiseComparison from '../comparison/PairwiseComparison';
import api from '../../services/api';

interface Project {
  id: string;
  title: string;
  description: string;
  criteria: Criterion[];
  alternatives: Alternative[];
}

interface Criterion {
  id: string;
  name: string;
  description?: string;
  level: number;
  children?: Criterion[];
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
}

interface EvaluatorWorkflowProps {
  projectId: string;
  evaluatorToken?: string;
}

const EvaluatorWorkflow: React.FC<EvaluatorWorkflowProps> = ({ 
  projectId, 
  evaluatorToken 
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'criteria' | 'alternatives' | 'complete'>('intro');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setNeedsLogin(false);

      const [projectResponse, criteriaResponse, alternativesResponse] = await Promise.all([
        api.project.getProject(projectId),
        api.criteria.getCriteria(projectId),
        api.alternative.getAlternatives(projectId),
      ]);

      if (!projectResponse.success) {
        // 인증 오류 메시지로 로그인 필요 판단
        const errMsg = projectResponse.error || '';
        if (errMsg.includes('인증') || errMsg.includes('권한') || errMsg.includes('로그인')) {
          setNeedsLogin(true);
          return;
        }
        throw new Error(errMsg || '프로젝트를 불러오지 못했습니다.');
      }

      const criteriaRaw = criteriaResponse.data;
      const alternativesRaw = alternativesResponse.data as Alternative[] | { results?: Alternative[] };

      const projectData: Project = {
        id: projectId,
        title: (projectResponse.data as { title?: string })?.title || '평가 프로젝트',
        description: (projectResponse.data as { description?: string })?.description || '',
        criteria: Array.isArray(criteriaRaw) ? (criteriaRaw as Criterion[]) : [],
        alternatives: Array.isArray(alternativesRaw) ? alternativesRaw : (alternativesRaw as { results?: Alternative[] })?.results ?? [],
      };

      setProject(projectData);
      calculateProgress();
    } catch (err: unknown) {
      const errMsg: string = err instanceof Error ? err.message : '';
      if (errMsg.includes('인증') || errMsg.includes('권한') || errMsg.includes('로그인')) {
        setNeedsLogin(true);
      } else {
        setError('프로젝트 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    // 간단한 진행률 계산 (추후 실제 평가 데이터 기반으로 개선)
    let completedSteps = 0;
    const totalSteps = 3; // intro, criteria, alternatives

    if (currentStep === 'criteria') completedSteps = 1;
    else if (currentStep === 'alternatives') completedSteps = 2;
    else if (currentStep === 'complete') completedSteps = 3;

    setProgress((completedSteps / totalSteps) * 100);
  };

  const handleStartEvaluation = () => {
    setCurrentStep('criteria');
    calculateProgress();
  };

  const handleCriteriaComplete = () => {
    if (project && project.alternatives.length > 0) {
      setCurrentStep('alternatives');
    } else {
      setCurrentStep('complete');
    }
    calculateProgress();
  };

  const handleAlternativesComplete = () => {
    setCurrentStep('complete');
    calculateProgress();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (needsLogin) {
    const loginUrl = `${window.location.pathname}?tab=home${evaluatorToken ? `&redirectAfterLogin=${encodeURIComponent(window.location.search)}` : ''}`;
    return (
      <Card>
        <div className="text-center py-8 space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold text-gray-800">로그인이 필요합니다</h2>
          <p className="text-gray-600">
            이 평가에 참여하려면 로그인이 필요합니다.<br/>
            평가자로 등록된 이메일로 계정을 만들어 로그인해주세요.
          </p>
          {evaluatorToken && (
            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
              귀하의 고유 접근 키: <code className="font-mono">{evaluatorToken}</code>
            </p>
          )}
          <Button
            onClick={() => { window.location.href = loginUrl; }}
            variant="primary"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="오류">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProjectData} variant="primary">
            다시 시도
          </Button>
        </div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card title="❌ 프로젝트를 찾을 수 없습니다">
        <div className="text-center py-8">
          <p className="text-gray-600">요청하신 프로젝트를 찾을 수 없습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 진행률 표시 */}
      <Card title="📊 평가 진행률">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className={currentStep === 'intro' ? 'font-bold text-blue-600' : ''}>시작</span>
            <span className={currentStep === 'criteria' ? 'font-bold text-blue-600' : ''}>기준 평가</span>
            <span className={currentStep === 'alternatives' ? 'font-bold text-blue-600' : ''}>대안 평가</span>
            <span className={currentStep === 'complete' ? 'font-bold text-blue-600' : ''}>완료</span>
          </div>
        </div>
      </Card>

      {/* 현재 단계별 컨텐츠 */}
      {currentStep === 'intro' && (
        <Card title="🎯 평가 프로젝트 소개">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{project.title}</h2>
              {project.description && (
                <p className="text-gray-600 mb-6">{project.description}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">📋 평가 개요</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>평가 기준:</strong> {project.criteria.length}개
                </div>
                <div>
                  <strong>평가 대안:</strong> {project.alternatives.length}개
                </div>
                <div>
                  <strong>예상 소요시간:</strong> 10-15분
                </div>
                <div>
                  <strong>평가 방법:</strong> 쌍대비교
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-2">✅ 평가 진행 방법</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
                <li>먼저 평가 기준들 간의 상대적 중요도를 비교합니다</li>
                {project.alternatives.length > 0 && (
                  <li>각 기준에 대해 대안들을 쌍대비교로 평가합니다</li>
                )}
                <li>모든 비교가 완료되면 일관성을 확인하고 결과를 제출합니다</li>
              </ol>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleStartEvaluation}
                variant="primary"
                className="px-8 py-3 text-lg"
              >
                평가 시작하기 🚀
              </Button>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 'criteria' && (
        <div>
          <Card title="🏷️ 기준 간 중요도 평가">
            <div className="mb-4">
              <p className="text-gray-600">
                다음 평가 기준들의 상대적 중요도를 쌍대비교로 평가해주세요.
                각 비교에서 어느 쪽이 더 중요한지, 그리고 얼마나 더 중요한지를 선택하세요.
              </p>
            </div>
          </Card>
          
          <PairwiseComparison
            projectId={projectId}
            elements={project.criteria}
            elementType="criteria"
            onComplete={handleCriteriaComplete}
          />
        </div>
      )}

      {currentStep === 'alternatives' && project.alternatives.length > 0 && (
        <div>
          <Card title="🔄 대안별 평가">
            <div className="mb-4">
              <p className="text-gray-600">
                이제 각 평가 기준에 대해 대안들을 비교평가해주세요.
                각 기준마다 어떤 대안이 더 우수한지 쌍대비교로 평가합니다.
              </p>
            </div>
          </Card>

          {project.criteria.map((criterion, index) => (
            <div key={criterion.id} className="mb-6">
              <Card title={`📊 "${criterion.name}" 기준에 대한 대안 평가`}>
                <div className="mb-4">
                  {criterion.description && (
                    <p className="text-gray-600 text-sm mb-2">{criterion.description}</p>
                  )}
                  <p className="text-blue-600 text-sm">
                    진행 상황: {index + 1} / {project.criteria.length}
                  </p>
                </div>
              </Card>
              
              <PairwiseComparison
                projectId={projectId}
                criterionId={criterion.id}
                criterionName={criterion.name}
                elements={project.alternatives}
                elementType="alternatives"
                onComplete={index === project.criteria.length - 1 ? handleAlternativesComplete : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {currentStep === 'complete' && (
        <Card title="🎉 평가 완료">
          <div className="text-center space-y-6">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold text-green-600">평가가 성공적으로 완료되었습니다!</h2>
            <p className="text-gray-600">
              귀하의 소중한 평가 의견이 성공적으로 제출되었습니다.<br/>
              제출된 평가 결과는 연구 분석에 활용될 예정입니다.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">📈 평가 요약</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong>평가한 기준:</strong> {project.criteria.length}개
                </div>
                <div>
                  <strong>평가한 대안:</strong> {project.alternatives.length}개
                </div>
                <div>
                  <strong>완료 시간:</strong> {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              평가에 참여해 주셔서 감사합니다. 창을 닫으셔도 됩니다.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EvaluatorWorkflow;