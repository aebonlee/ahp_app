import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
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

interface EnhancedProjectCreationWizardProps {
  onNavigate?: (path: string) => void;
  onTabChange?: (tab: string) => void;
}

const EnhancedProjectCreationWizard: React.FC<EnhancedProjectCreationWizardProps> = ({ 
  onNavigate,
  onTabChange 
}) => {
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
    { id: 'basic', title: '기본 정보', icon: '📝', emoji: '📝' },
    { id: 'demographic', title: '인구통계 설정', icon: '👥', emoji: '👥' },
    { id: 'model', title: 'AHP 모형', icon: '📊', emoji: '📊' },
    { id: 'invitation', title: '평가자 초대', icon: '✉️', emoji: '✉️' },
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
          <div className="space-y-6">

            {/* 단계 설명 카드 */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">📊 이 단계에서 설정하는 항목</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>기본 정보 항목</strong>: 나이, 성별, 학력, 직업, 산업, 경력 등</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>맞춤형 질문</strong>: 연구에 필요한 추가 설문 항목 설정</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>설문 템플릿</strong>: 사전 정의된 템플릿 선택 또는 직접 구성</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>설문 순서</strong>: 인구통계 → AHP 또는 AHP → 인구통계</span>
                </li>
              </ul>
              <div className="mt-3 p-3 bg-orange-100 rounded-md">
                <p className="text-xs text-orange-700">
                  💡 <strong>팁</strong>: 인구통계 정보를 수집하면 그룹별 비교 분석, 상관관계 분석 등 
                  더욱 풍부한 연구 결과를 얻을 수 있습니다. 필요없다면 건너뛸 수도 있습니다.
                </p>
              </div>
            </div>

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
          </div>
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
            onNavigate={onNavigate || (() => {})}
          />
        );
      default:
        return null;
    }
  };

  // 단계별 타이틀과 아이콘 매핑
  const getStepInfo = () => {
    switch (currentStep) {
      case 0:
        return {
          icon: '📝',
          title: '프로젝트 기본 정보',
          description: '프로젝트의 기본 정보와 평가 방식을 설정합니다'
        };
      case 1:
        return {
          icon: '👥',
          title: '인구통계 설문 설계',
          description: '평가자의 인구통계학적 정보를 수집할 설문을 설계합니다'
        };
      case 2:
        return {
          icon: '📊',
          title: 'AHP 모형 설계',
          description: '평가 기준과 대안을 설정하여 AHP 계층 구조를 만듭니다'
        };
      case 3:
        return {
          icon: '✉️',
          title: '평가자 초대',
          description: '프로젝트에 참여할 평가자를 초대하고 링크를 생성합니다'
        };
      case 4:
        return {
          icon: '✅',
          title: '프로젝트 생성 완료',
          description: '프로젝트가 성공적으로 생성되었습니다'
        };
      default:
        return {
          icon: '📝',
          title: '프로젝트 생성',
          description: '새로운 AHP 프로젝트를 생성합니다'
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={() => {
                    if (currentStep > 0) {
                      handlePrevious();
                    } else {
                      onTabChange?.('personal-service');
                    }
                  }}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">{stepInfo.icon}</span>
                    {stepInfo.title}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {stepInfo.description}
                  </p>
                  {/* 진행률 표시 */}
                  <div className="flex items-center space-x-3 mt-3">
                    <span className="text-sm text-gray-500">
                      단계 {currentStep + 1} / {steps.length}
                    </span>
                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 우측 액션 버튼 영역 (필요시 버튼 추가 가능) */}
              <div className="flex space-x-2">
                {/* 향후 필요시 버튼 추가 */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex justify-between relative">
            {/* 연결선 배경 */}
            <div className="absolute top-6 left-0 right-0 flex items-center" style={{ zIndex: 0 }}>
              <div className="flex-1 h-0.5 bg-gray-200"></div>
            </div>
            
            {/* 단계별 아이콘과 텍스트 */}
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1 relative">
                  {/* 아이콘 */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors mb-2 bg-white z-10 ${
                      isActive
                        ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="text-xl">✅</span>
                    ) : (
                      <span className="text-xl">{step.emoji}</span>
                    )}
                  </div>
                  {/* 텍스트 */}
                  <div
                    className={`text-sm font-medium text-center ${
                      isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              );
            })}
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
                  <span className="ml-1">✅</span>
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

      {/* 단계 설명 카드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📋 이 단계에서 설정하는 항목</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>프로젝트 제목</strong>: 평가자가 쉽게 이해할 수 있는 명확한 제목</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>프로젝트 설명</strong>: 연구의 배경과 목적을 구체적으로 설명</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>연구 목표</strong>: 이 분석을 통해 달성하고자 하는 구체적인 목표</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>평가 모드</strong>: 평가 방식 선택 (실용적/이론적/직접입력/퍼지)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>평가 진행 순서</strong>: 인구통계 설문과 AHP 평가의 순서 결정</span>
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
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

        <div className="lg:col-span-2">
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

        <div className="lg:col-span-2">
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

      {/* 단계 설명 카드 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">📊 이 단계에서 설정하는 항목</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>평가 기준</strong>: 의사결정을 위한 주요 평가 요소 (예: 비용, 품질, 시간)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>하위 기준</strong>: 각 주요 기준의 세부 평가 항목</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>대안 목록</strong>: 비교 평가할 선택지들 (예: 제품 A, B, C)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>계층 구조</strong>: 기준과 하위 기준의 관계 설정</span>
          </li>
        </ul>
        <div className="mt-3 p-3 bg-purple-100 rounded-md">
          <p className="text-xs text-purple-700">
            💡 <strong>팁</strong>: 논문 작성 시에는 3개 기준 × 3개 대안 구조를 권장합니다. 
            이는 일관성 검증(CR ≤ 0.1) 충족 확률이 높고 쌍대비교 횟수를 최소화할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 기준 및 대안 설정 UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">평가 기준 설정</h4>
          <p className="text-sm text-gray-600 mb-4">
            프로젝트 생성 후 상세 페이지에서 기준을 추가하고 계층 구조를 설정할 수 있습니다.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            → 기본 템플릿 사용하기
          </button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">대안 설정</h4>
          <p className="text-sm text-gray-600 mb-4">
            평가할 대안들을 나중에 추가할 수 있습니다.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            → 예시 대안 보기
          </button>
        </div>
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

      {/* 단계 설명 카드 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">👥 이 단계에서 설정하는 항목</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>초대 메시지</strong>: 평가자에게 전달될 연구 참여 안내 메시지</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>평가 마감일</strong>: 평가 완료 기한 설정</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>평가자 이메일</strong>: 초대할 평가자들의 이메일 주소 목록</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>초대 링크 생성</strong>: QR코드 및 단축 URL 자동 생성</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>알림 설정</strong>: 평가 진행 상황 알림 옵션</span>
          </li>
        </ul>
        <div className="mt-3 p-3 bg-green-100 rounded-md">
          <p className="text-xs text-green-700">
            💡 <strong>팁</strong>: 프로젝트 생성 후에도 평가자 관리 페이지에서 추가 초대가 가능합니다.
            QR코드는 오프라인 평가 수집에 유용하며, 링크는 온라인 배포에 적합합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
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
            평가 예상 시간
          </label>
          <input
            type="text"
            placeholder="예: 10-15분"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="lg:col-span-2">
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
  onNavigate?: (path: string) => void;
}> = ({ projectId, qrCodeUrl, shortLink, projectTitle, onNavigate }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <div className="text-6xl mx-auto mb-4">✅</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          프로젝트 생성 완료!
        </h2>
        <p className="text-gray-600">
          "{projectTitle}" 프로젝트가 성공적으로 생성되었습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {shortLink && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">평가자 초대 링크</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shortLink}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
              />
              <button
                onClick={() => copyToClipboard(shortLink)}
                className="btn btn-secondary whitespace-nowrap"
              >
                복사
              </button>
            </div>
            <p className="text-sm text-gray-600">
              이 링크를 평가자에게 공유하여 평가에 참여하도록 안내하세요.
            </p>
          </div>
        )}

        {qrCodeUrl && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">QR 코드</h3>
            <div className="flex justify-center mb-4">
              <img
                src={qrCodeUrl}
                alt="평가자 초대 QR코드"
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-gray-600">
              오프라인 평가나 모바일 기기에서 QR코드를 스캔하여 바로 평가를 시작할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => {
            // 프로젝트 관리 대시보드로 이동
            if (projectId && onNavigate) {
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