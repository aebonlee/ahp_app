import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import DemographicSurveyForm from '../components/evaluation/DemographicSurveyForm';
import AnonymousEvaluator from '../components/evaluation/AnonymousEvaluator';
import api from '../services/api';

type FlowStep = 'landing' | 'demographic' | 'ahp' | 'completion';

interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  objective?: string;
  evaluation_flow_type: 'survey_first' | 'ahp_first' | 'parallel';
  demographic_survey_config: any;
  require_demographics: boolean;
  criteria_count: number;
  alternatives_count: number;
  deadline?: string;
}

const IntegratedEvaluationFlow: React.FC = () => {
  const { projectId, shortCode } = useParams<{ projectId?: string; shortCode?: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>('landing');
  const [sessionId, setSessionId] = useState<string>('');
  const [demographicData, setDemographicData] = useState<any>(null);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    loadProjectInfo();
  }, [projectId, shortCode]);

  const loadProjectInfo = async () => {
    try {
      setLoading(true);
      
      let actualProjectId = projectId;
      
      // 단축 코드로 접속한 경우 프로젝트 ID 조회
      if (shortCode && !projectId) {
        const linkResponse = await api.get(`/evaluation/resolve-link/${shortCode}`);
        actualProjectId = linkResponse.data.project_id;
      }

      // 프로젝트 정보 조회
      const response = await api.get(`/projects/${actualProjectId}/public-info/`);
      setProject(response.data);

      // 참여자 수 조회
      const statsResponse = await api.get(`/projects/${actualProjectId}/participant-stats/`);
      setParticipantCount(statsResponse.data.completed_count || 0);

      // 세션 시작
      const sessionResponse = await api.post('/evaluation/start/', {
        project_id: actualProjectId,
        access_method: shortCode ? 'qr' : 'link',
      });
      setSessionId(sessionResponse.data.session_id);
    } catch (error) {
      console.error('프로젝트 정보 로드 실패:', error);
      navigate('/error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemographicComplete = async (data: any) => {
    try {
      // 인구통계 데이터 제출
      await api.post('/evaluation/demographic/', {
        session_id: sessionId,
        responses: data,
      });

      setDemographicData(data);

      // 다음 단계로 이동
      if (project?.evaluation_flow_type === 'survey_first') {
        setCurrentStep('ahp');
      } else {
        setCurrentStep('completion');
      }
    } catch (error) {
      console.error('인구통계 제출 실패:', error);
    }
  };

  const handleAHPComplete = async () => {
    try {
      // AHP 평가 완료 처리
      await api.post('/evaluation/complete/', {
        session_id: sessionId,
      });

      setCurrentStep('completion');
    } catch (error) {
      console.error('AHP 평가 완료 처리 실패:', error);
    }
  };

  const startEvaluation = () => {
    if (project?.evaluation_flow_type === 'survey_first' && project.require_demographics) {
      setCurrentStep('demographic');
    } else {
      setCurrentStep('ahp');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">프로젝트 정보를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <p className="text-xl text-gray-600">프로젝트를 찾을 수 없습니다.</p>
          <button onClick={() => navigate('/')} className="mt-4 btn btn-primary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 랜딩 페이지
  if (currentStep === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-tertiary rounded-full mb-4">
                <ClipboardDocumentCheckIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              <p className="text-lg text-gray-600">{project.description}</p>
              {project.objective && (
                <p className="mt-4 text-gray-500">{project.objective}</p>
              )}
            </div>

            {/* 연구 정보 카드 */}
            <div className="bg-gradient-to-r from-primary/5 to-tertiary/5 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">연구 참여 안내</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>이 연구는 다음 두 부분으로 구성되어 있습니다:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  {project.require_demographics && (
                    <li>
                      인구통계학적 설문 (약{' '}
                      {project.demographic_survey_config?.estimatedTime || 2}분)
                    </li>
                  )}
                  <li>AHP 의사결정 평가 (약 10분)</li>
                </ol>
                <p className="mt-3">
                  <strong>총 예상 소요시간:</strong> 약{' '}
                  {project.require_demographics
                    ? (project.demographic_survey_config?.estimatedTime || 2) + 10
                    : 10}
                  분
                </p>
              </div>
            </div>

            {/* 통계 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {participantCount}명
                </div>
                <div className="text-sm text-gray-600">현재 참여자</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {project.criteria_count}개
                </div>
                <div className="text-sm text-gray-600">평가 기준</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {project.alternatives_count}개
                </div>
                <div className="text-sm text-gray-600">대안</div>
              </div>
            </div>

            {/* 마감일 정보 */}
            {project.deadline && (
              <div className="text-center mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-sm text-yellow-800">
                  마감일: {new Date(project.deadline).toLocaleDateString('ko-KR')}
                </span>
              </div>
            )}

            {/* 시작 버튼 */}
            <div className="text-center">
              <button
                onClick={startEvaluation}
                className="btn btn-primary btn-lg px-12 py-4 text-lg font-semibold"
              >
                평가 시작하기
              </button>
            </div>

            {/* 개인정보 안내 */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                * 수집된 모든 정보는 연구 목적으로만 사용되며, 개인을 식별할 수 없는
                형태로 안전하게 보호됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인구통계 설문
  if (currentStep === 'demographic') {
    return (
      <DemographicSurveyForm
        projectId={project.id}
        surveyConfig={project.demographic_survey_config}
        onComplete={handleDemographicComplete}
      />
    );
  }

  // AHP 평가
  if (currentStep === 'ahp') {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <AnonymousEvaluator />
        </div>
      </div>
    );
  }

  // 완료 페이지
  if (currentStep === 'completion') {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              평가를 완료해 주셔서 감사합니다!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              귀하의 소중한 의견이 성공적으로 제출되었습니다.
              <br />
              연구에 참여해 주셔서 진심으로 감사드립니다.
            </p>

            <div className="bg-gradient-to-r from-primary/5 to-tertiary/5 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">참여 요약</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>프로젝트:</span>
                  <span className="font-medium">{project.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>참여 일시:</span>
                  <span className="font-medium">
                    {new Date().toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>참여 번호:</span>
                  <span className="font-medium">#{participantCount + 1}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                홈으로 돌아가기
              </button>
              {project.id && (
                <button
                  onClick={() => navigate(`/projects/${project.id}/results`)}
                  className="btn btn-primary"
                >
                  결과 보기
                </button>
              )}
            </div>

            <div className="mt-8 text-sm text-gray-500">
              문의사항이 있으시면 연구자에게 직접 연락해주세요.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IntegratedEvaluationFlow;