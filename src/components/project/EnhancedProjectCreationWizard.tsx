import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import DemographicSurveyConfig, { DemographicConfig } from './DemographicSurveyConfig';
import api from '../../services/api';

interface ProjectData {
  // 기본 정보
  title: string;
  description: string;
  objective: string;
  evaluation_mode: 'practical' | 'theoretical' | 'direct_input' | 'fuzzy_ahp';
  workflow_stage: 'creating' | 'waiting' | 'evaluating' | 'completed';
  
  // 인구통계 설정
  demographic_survey_config: DemographicConfig;
  require_demographics: boolean;
  evaluation_flow_type: 'survey_first' | 'ahp_first' | 'parallel';
  
  // 기준 및 대안 (다음 단계에서 설정)
  criteria?: any[];
  alternatives?: any[];
  
  // 평가자 초대 설정
  evaluators?: any[];
  invitation_message?: string;
  deadline?: string;
}

const EnhancedProjectCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [shortLink, setShortLink] = useState<string>('');
  
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    objective: '',
    evaluation_mode: 'practical',
    workflow_stage: 'creating',
    demographic_survey_config: {
      enabled: true,
      useAge: true,
      useGender: true,
      useEducation: true,
      useOccupation: true,
      useIndustry: true,
      useExperience: true,
      customQuestions: [],
      surveyTitle: '인구통계학적 기본 정보 조사',
      surveyDescription: '본 설문은 연구 참여자의 기본 정보를 수집하기 위한 것입니다.',
      estimatedTime: 2,
    },
    require_demographics: true,
    evaluation_flow_type: 'survey_first',
  });

  const steps = [
    { id: 'basic', title: '기본 정보', icon: DocumentTextIcon },
    { id: 'demographic', title: '인구통계 설정', icon: UsersIcon },
    { id: 'model', title: 'AHP 모형', icon: ChartBarIcon },
    { id: 'invitation', title: '평가자 초대', icon: LinkIcon },
  ];

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // 마지막 단계: 프로젝트 생성 및 링크 생성
      await createProject();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const createProject = async () => {
    try {
      setLoading(true);
      
      // 1. 프로젝트 생성
      const response = await api.project.createProject({
        ...projectData,
        status: 'draft' as const
      });
      const createdProjectId = response.data.id;
      setProjectId(createdProjectId);
      
      // 2. QR코드 및 링크 생성
      const linkResponse = await api.post(`/projects/${createdProjectId}/generate_links/`);
      if (linkResponse.data) {
        setQrCodeUrl(linkResponse.data.qr_code);
        setShortLink(linkResponse.data.short_link);
      }
      
      // 다음 단계로 이동 (완료 화면)
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep data={projectData} onChange={setProjectData} />;
      case 1:
        return (
          <DemographicSurveyConfig
            config={projectData.demographic_survey_config}
            onChange={(config) =>
              setProjectData({
                ...projectData,
                demographic_survey_config: config,
                require_demographics: config.enabled,
              })
            }
          />
        );
      case 2:
        return <AHPModelStep data={projectData} onChange={setProjectData} />;
      case 3:
        return <InvitationStep data={projectData} onChange={setProjectData} />;
      case 4:
        return (
          <CompletionStep
            projectId={projectId}
            qrCodeUrl={qrCodeUrl}
            shortLink={shortLink}
            projectTitle={projectData.title}
            onNavigate={navigate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-sm font-medium flex-1 text-center ${
                  index === currentStep ? 'text-primary' : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {renderStepContent()}
        </div>

        {/* 네비게이션 버튼 */}
        {currentStep < steps.length && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`btn btn-secondary flex items-center gap-2 ${
                currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
              이전
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  처리중...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  프로젝트 생성
                  <CheckCircleIcon className="h-5 w-5" />
                </>
              ) : (
                <>
                  다음
                  <ChevronRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 기본 정보 입력 단계
const BasicInfoStep: React.FC<{
  data: ProjectData;
  onChange: (data: ProjectData) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">프로젝트 기본 정보</h2>
        <p className="text-gray-600">
          프로젝트의 기본 정보를 입력해주세요. 이 정보는 평가자에게 표시됩니다.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 제목 *
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="예: 신제품 개발 우선순위 결정"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 설명 *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="프로젝트의 배경과 목적을 설명해주세요."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연구 목표
          </label>
          <textarea
            value={data.objective}
            onChange={(e) => onChange({ ...data, objective: e.target.value })}
            placeholder="이 연구를 통해 달성하고자 하는 목표를 작성해주세요."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            평가 모드
          </label>
          <select
            value={data.evaluation_mode}
            onChange={(e) =>
              onChange({
                ...data,
                evaluation_mode: e.target.value as ProjectData['evaluation_mode'],
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="practical">실용적 평가 (슬라이더)</option>
            <option value="theoretical">이론적 평가 (9점 척도)</option>
            <option value="direct_input">직접 입력</option>
            <option value="fuzzy_ahp">퍼지 AHP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            평가 진행 순서
          </label>
          <select
            value={data.evaluation_flow_type}
            onChange={(e) =>
              onChange({
                ...data,
                evaluation_flow_type: e.target.value as ProjectData['evaluation_flow_type'],
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="survey_first">인구통계 설문 → AHP 평가</option>
            <option value="ahp_first">AHP 평가 → 인구통계 설문</option>
            <option value="parallel">병렬 진행 (순서 무관)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// AHP 모형 설정 단계
const AHPModelStep: React.FC<{
  data: ProjectData;
  onChange: (data: ProjectData) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AHP 모형 설계</h2>
        <p className="text-gray-600">
          평가 기준과 대안을 설정하세요. 나중에 상세 설정이 가능합니다.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 이 단계에서는 기본 구조만 설정합니다. 프로젝트 생성 후 상세 설정 페이지에서
          계층 구조와 세부 기준을 추가할 수 있습니다.
        </p>
      </div>

      {/* 기준 및 대안 설정 UI는 기존 컴포넌트 재사용 또는 새로 구현 */}
      <div className="text-center py-12 text-gray-500">
        [기준 및 대안 설정 UI - 구현 예정]
      </div>
    </div>
  );
};

// 평가자 초대 설정 단계
const InvitationStep: React.FC<{
  data: ProjectData;
  onChange: (data: ProjectData) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">평가자 초대 설정</h2>
        <p className="text-gray-600">평가자 초대 방법과 메시지를 설정하세요.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            초대 메시지
          </label>
          <textarea
            value={data.invitation_message || ''}
            onChange={(e) =>
              onChange({ ...data, invitation_message: e.target.value })
            }
            placeholder="평가자에게 전달할 초대 메시지를 작성하세요."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">마감일</label>
          <input
            type="datetime-local"
            value={data.deadline || ''}
            onChange={(e) => onChange({ ...data, deadline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            평가자 이메일 (선택)
          </label>
          <textarea
            placeholder="평가자 이메일을 입력하세요. (한 줄에 하나씩)"
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-sm text-gray-500 mt-1">
            나중에 평가자 관리 페이지에서도 추가할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

// 완료 단계
const CompletionStep: React.FC<{
  projectId: string | null;
  qrCodeUrl: string;
  shortLink: string;
  projectTitle: string;
  onNavigate: (path: string) => void;
}> = ({ projectId, qrCodeUrl, shortLink, projectTitle, onNavigate }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  };

  return (
    <div className="text-center py-12">
      <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        프로젝트 생성 완료!
      </h2>
      <p className="text-gray-600 mb-8">
        "{projectTitle}" 프로젝트가 성공적으로 생성되었습니다.
      </p>

      {shortLink && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">평가자 초대 링크</h3>
          <div className="flex items-center justify-center gap-2 mb-4">
            <input
              type="text"
              value={shortLink}
              readOnly
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            />
            <button
              onClick={() => copyToClipboard(shortLink)}
              className="btn btn-secondary"
            >
              복사
            </button>
          </div>
        </div>
      )}

      {qrCodeUrl && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">QR 코드</h3>
          <img
            src={qrCodeUrl}
            alt="평가자 초대 QR코드"
            className="mx-auto w-64 h-64"
          />
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            // 프로젝트 관리 대시보드로 이동
            if (projectId) {
              // 프로젝트가 생성되면 프로젝트 목록으로 이동
              onNavigate('/');
              // 실제로는 메인 대시보드의 프로젝트 관리 탭으로 이동해야 함
              window.location.reload();
            }
          }}
          className="btn btn-primary"
        >
          프로젝트 관리로 이동
        </button>
        <button onClick={() => window.location.reload()} className="btn btn-secondary">
          새 프로젝트 생성
        </button>
      </div>
    </div>
  );
};

export default EnhancedProjectCreationWizard;