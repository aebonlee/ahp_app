import React, { useState } from 'react';
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
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">2단계: 인구통계 설문 설정</h2>
              <p className="text-gray-600">
                평가자의 인구통계학적 정보를 수집하여 더욱 심층적인 분석을 수행할 수 있습니다.
              </p>
            </div>

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

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* 상단 헤더 섹션 */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                {/* 뒤로가기 버튼 */}
                <button
                  onClick={() => onTabChange?.('personal-service')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="이전 페이지로"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* 페이지 경로 (Breadcrumb) */}
                <div className="flex items-center text-sm text-gray-500">
                  <span>홈</span>
                  <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>프로젝트 관리</span>
                  <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">프로젝트 생성 워크플로우</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                통합 프로젝트 생성 워크플로우
              </h1>
              <p className="text-gray-600">
                인구통계 설문과 AHP 평가를 통합한 체계적인 프로젝트 생성 과정입니다.
                각 단계를 순차적으로 진행하며 언제든 이전 단계로 돌아갈 수 있습니다.
              </p>
            </div>
            
            {/* 우측 액션 버튼들 */}
            <div className="flex space-x-2 ml-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                onClick={() => {
                  // 도움말 또는 가이드 표시
                  alert('워크플로우 가이드: 각 단계별로 필요한 정보를 입력해주세요.');
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                사용 가이드
              </button>
            </div>
          </div>
        </div>

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">1단계: 프로젝트 기본 정보</h2>
        <p className="text-gray-600">
          프로젝트의 기본 정보를 입력해주세요. 이 정보는 평가자에게 표시됩니다.
        </p>
      </div>

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">3단계: AHP 모형 설계</h2>
        <p className="text-gray-600">
          평가 기준과 대안을 설정하세요. 프로젝트 생성 후에도 상세 설정이 가능합니다.
        </p>
      </div>

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
      <div className="space-y-4">
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">4단계: 평가자 초대 설정</h2>
        <p className="text-gray-600">평가자 초대 방법과 메시지를 설정하세요.</p>
      </div>

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
  onNavigate?: (path: string) => void;
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