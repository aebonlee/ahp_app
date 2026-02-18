import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import DemographicSurveyConfig, { DemographicConfig } from './DemographicSurveyConfig';
import DemographicSurvey from '../survey/DemographicSurvey';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import EvaluationModeSelector, {
  EvaluationMode,
} from '../evaluation/EvaluationModeSelector';
import PaperWorkflowGuide from '../guide/PaperWorkflowGuide';
import api from '../../services/api';
import dataService from '../../services/dataService_clean';

interface ProjectData {
  // 기본 정보
  title: string;
  description: string;
  objective: string;
  evaluation_mode: 'practical' | 'theoretical' | 'direct_input' | 'fuzzy_ahp';
  ahp_type: 'general' | 'fuzzy';
  workflow_stage: 'creating' | 'waiting' | 'evaluating' | 'completed';
  
  // 인구통계 설정
  demographic_survey_config: DemographicConfig;
  require_demographics: boolean;
  evaluation_flow_type: 'survey_first' | 'ahp_first' | 'parallel';
  
  // 인구통계 데이터
  demographic_data?: {
    age: string;
    gender: string;
    education: string;
    occupation: string;
    experience: string;
    department: string;
    position: string;
    projectExperience: string;
    decisionRole: string;
    additionalInfo: string;
  };
  
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
    ahp_type: 'general',
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
    demographic_data: {
      age: '',
      gender: '',
      education: '',
      occupation: '',
      experience: '',
      department: '',
      position: '',
      projectExperience: '',
      decisionRole: '',
      additionalInfo: ''
    }
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
      
      // 1. 프로젝트 생성 - ProjectWorkflow 방식 사용
      const createdProject = await dataService.createProject({
        title: projectData.title,
        description: projectData.description,
        objective: projectData.objective,
        ahp_type: projectData.ahp_type,
        status: 'active',
        evaluation_mode: projectData.evaluation_mode,
        workflow_stage: 'creating'
      });
      
      if (createdProject && createdProject.id) {
        const createdProjectId = createdProject.id;
        setProjectId(createdProjectId);
        
        // 2. QR코드 및 링크 생성
        try {
          const linkResponse = await api.post(`/projects/${createdProjectId}/generate_links/`);
          if (linkResponse.data) {
            setQrCodeUrl(linkResponse.data.qr_code);
            setShortLink(linkResponse.data.short_link);
          }
        } catch (linkError) {
          console.warn('링크 생성 실패, 프로젝트는 생성됨:', linkError);
        }
        
        // 다음 단계로 이동 (완료 화면)
        setCurrentStep(currentStep + 1);
      }
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
              <h3 className="font-semibold text-orange-900 mb-2">📊 인구통계 설문 미리보기</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>기본 정보</strong>: 연령대, 성별, 학력, 직업</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>전문 정보</strong>: 경력, 부서, 직급, AHP 경험</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>의사결정 역할</strong>: 프로젝트에서의 역할</span>
                </li>
              </ul>
              <div className="mt-3 p-3 bg-orange-100 rounded-md">
                <p className="text-xs text-orange-700">
                  💡 <strong>팁</strong>: 이 설문은 평가자가 실제로 응답할 양식입니다. 
                  필요 없다면 다음 단계에서 비활성화할 수 있습니다.
                </p>
              </div>
            </div>

            <DemographicSurveyStep 
              data={projectData.demographic_data || {
                age: '',
                gender: '',
                education: '',
                occupation: '',
                experience: '',
                department: '',
                position: '',
                projectExperience: '',
                decisionRole: '',
                additionalInfo: ''
              }}
              onChange={(demographicData) =>
                setProjectData({
                  ...projectData,
                  demographic_data: demographicData,
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
                </div>
              </div>
              
              {/* 우측 진행률 표시 */}
              <div className="flex items-center space-x-3">
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

// 기본 정보 입력 단계 - ProjectCreation 기반
const BasicInfoStep: React.FC<{
  data: ProjectData;
  onChange: (data: ProjectData) => void;
}> = ({ data, onChange }) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  // 예시 프로젝트 설정
  const loadExampleProject = () => {
    onChange({
      ...data,
      title: "대학원생의 연구 역량",
      description: "대학원생들의 연구 역량을 평가하기 위한 AHP 분석 프로젝트입니다. 연구 능력, 분석력, 창의성 등 주요 역량 요소를 체계적으로 평가합니다.",
      objective: "우수한 연구 역량을 갖춘 대학원생을 선발하고 육성하기 위한 객관적 평가 기준 수립",
      evaluation_mode: "theoretical",
      ahp_type: "general",
    });
    // 기준과 대안 정보 저장
    const templateData = {
      criteria: [
        { name: "연구 능력", description: "문헌 조사, 연구 설계, 방법론 적용 능력" },
        { name: "분석력", description: "데이터 분석, 통계 처리, 결과 해석 능력" },
        { name: "창의성", description: "독창적 아이디어, 문제 해결 능력, 혁신적 접근" }
      ],
      alternatives: [
        { name: "학생 A", description: "박사과정 2년차, 논문 3편 게재" },
        { name: "학생 B", description: "박사과정 1년차, 연구 프로젝트 2개 참여" },
        { name: "학생 C", description: "석사과정 2년차, 학회 발표 5회" }
      ]
    };
    sessionStorage.setItem('projectTemplate', JSON.stringify(templateData));
  };

  const handleInputChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <>
      {showWorkflowGuide && (
        <PaperWorkflowGuide
          currentStep={1}
          criteriaCount={3}
          alternativesCount={3}
          onClose={() => setShowWorkflowGuide(false)}
        />
      )}
      <div className="space-y-6">
        {/* 논문 작성 권장 구조 안내 */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">
                  📄 논문 작성 권장 구조
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">
                    학술 논문 작성 시 <strong>3개 기준 × 3개 대안</strong>{" "}
                    구조를 권장합니다.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>명확한 연구 설계와 결과 해석이 용이</li>
                    <li>일관성 검증(CR ≤ 0.1) 충족 확률 향상</li>
                    <li>쌍대비교 횟수 최소화 (기준 3회, 대안 9회)</li>
                    <li>추가 기준/대안은 다음 단계에서 선택 가능</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 워크플로우 가이드 버튼 */}
            <div className="ml-6 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowWorkflowGuide(true)}
                className="group relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-white font-bold text-sm rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                워크플로우 가이드
              </button>
              <button
                type="button"
                onClick={loadExampleProject}
                className="mt-2 w-full inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                예시 프로젝트
              </button>
            </div>
          </div>
        </div>

        {/* 프로젝트 기본 정보 폼 */}
        <div className="space-y-6">
          <Input
            id="title"
            label="프로젝트명"
            placeholder="프로젝트 이름을 입력하세요"
            value={data.title}
            onChange={(value) => handleInputChange("title", value)}
            error={formErrors.title}
            required
          />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              프로젝트 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
              value={data.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              required
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.description}
              </p>
            )}
          </div>

          <Input
            id="objective"
            label="프로젝트 목표"
            placeholder="이 프로젝트로 달성하고자 하는 목표를 입력하세요"
            value={data.objective}
            onChange={(value) => handleInputChange("objective", value)}
            error={formErrors.objective}
            required
          />

          {/* AHP 분석 유형 선택 */}
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                AHP 분석 유형 선택 <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-4">
                프로젝트에 적합한 분석 방법을 선택하세요
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 일반 AHP 카드 */}
              <button
                type="button"
                onClick={() => handleInputChange("ahp_type", "general")}
                className={`relative group transition-all duration-300 ${
                  data.ahp_type === "general"
                    ? "transform scale-[1.02]"
                    : "hover:transform hover:scale-[1.01]"
                }`}
              >
                <div
                  className={`p-6 rounded-2xl h-full transition-all duration-300 ${
                    data.ahp_type === "general"
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl"
                      : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl"
                  }`}
                >
                  {data.ahp_type === "general" && (
                    <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      선택됨
                    </div>
                  )}
                  <div className="text-left space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📊</span>
                      <h3 className={`font-bold text-lg ${data.ahp_type === "general" ? "text-white" : "text-gray-900"}`}>
                        일반 AHP
                      </h3>
                    </div>
                    <p className={`text-sm ${data.ahp_type === "general" ? "text-white/90" : "text-gray-600"}`}>
                      전통적인 쌍대비교 방법으로 명확한 의사결정을 지원합니다
                    </p>
                    <div className="space-y-2">
                      {["Saaty의 1-9 척도 사용", "명확한 가중치 산출", "일관성 검증 (CR ≤ 0.1)"].map((feature, idx) => (
                        <div key={idx} className={`flex items-center space-x-2 text-sm ${data.ahp_type === "general" ? "text-white/85" : "text-gray-600"}`}>
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${data.ahp_type === "general" ? "bg-white/25 text-white" : "bg-blue-50 text-blue-700"}`}>
                      👍 입문자 추천
                    </span>
                  </div>
                </div>
              </button>

              {/* 퍼지 AHP 카드 */}
              <button
                type="button"
                onClick={() => handleInputChange("ahp_type", "fuzzy")}
                className={`relative group transition-all duration-300 ${
                  data.ahp_type === "fuzzy"
                    ? "transform scale-[1.02]"
                    : "hover:transform hover:scale-[1.01]"
                }`}
              >
                <div
                  className={`p-6 rounded-2xl h-full transition-all duration-300 ${
                    data.ahp_type === "fuzzy"
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl"
                      : "bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl"
                  }`}
                >
                  {data.ahp_type === "fuzzy" && (
                    <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      선택됨
                    </div>
                  )}
                  <div className="text-left space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🔮</span>
                      <h3 className={`font-bold text-lg ${data.ahp_type === "fuzzy" ? "text-white" : "text-gray-900"}`}>
                        퍼지 AHP
                      </h3>
                    </div>
                    <p className={`text-sm ${data.ahp_type === "fuzzy" ? "text-white/90" : "text-gray-600"}`}>
                      불확실성과 애매모호함을 수학적으로 처리하는 고급 분석 방법입니다
                    </p>
                    <div className="space-y-2">
                      {["삼각 퍼지수 활용", "불확실성 범위 표현", "민감도 분석 강화"].map((feature, idx) => (
                        <div key={idx} className={`flex items-center space-x-2 text-sm ${data.ahp_type === "fuzzy" ? "text-white/85" : "text-gray-600"}`}>
                          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${data.ahp_type === "fuzzy" ? "bg-white/25 text-white" : "bg-purple-50 text-purple-700"}`}>
                      🎯 전문가용
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 평가 모드 선택 */}
          <div className="mt-8">
            <EvaluationModeSelector
              selectedMode={data.evaluation_mode as EvaluationMode}
              onModeChange={(mode) =>
                handleInputChange("evaluation_mode", mode)
              }
            />
          </div>

          {/* 평가 진행 순서 */}
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
    </>
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
    navigator.clipboard.writeText(text).catch(() => {});
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

// 인구통계 설문 단계 - DemographicSurvey 완전 통일
const DemographicSurveyStep: React.FC<{
  data: {
    age: string;
    gender: string;
    education: string;
    occupation: string;
    experience: string;
    department: string;
    position: string;
    projectExperience: string;
    decisionRole: string;
    additionalInfo: string;
  };
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/60 shadow-lg">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          📊 인구통계학적 설문조사
        </h2>
        
        <div className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  연령대
                </label>
                <select 
                  name="age"
                  value={data.age}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="20s">20대</option>
                  <option value="30s">30대</option>
                  <option value="40s">40대</option>
                  <option value="50s">50대</option>
                  <option value="60s">60대 이상</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  성별
                </label>
                <select 
                  name="gender"
                  value={data.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                  <option value="prefer-not">응답하지 않음</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  최종 학력
                </label>
                <select 
                  name="education"
                  value={data.education}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="high-school">고등학교 졸업</option>
                  <option value="bachelor">학사</option>
                  <option value="master">석사</option>
                  <option value="phd">박사</option>
                  <option value="other">기타</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  직업
                </label>
                <input 
                  type="text"
                  name="occupation"
                  value={data.occupation}
                  onChange={handleInputChange}
                  placeholder="예: 소프트웨어 엔지니어"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
            </div>
          </div>

          {/* 전문 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              전문 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  해당 분야 경력
                </label>
                <select 
                  name="experience"
                  value={data.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="less-1">1년 미만</option>
                  <option value="1-3">1-3년</option>
                  <option value="3-5">3-5년</option>
                  <option value="5-10">5-10년</option>
                  <option value="more-10">10년 이상</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  소속 부서
                </label>
                <input 
                  type="text"
                  name="department"
                  value={data.department}
                  onChange={handleInputChange}
                  placeholder="예: 연구개발부"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  직급/직책
                </label>
                <input 
                  type="text"
                  name="position"
                  value={data.position}
                  onChange={handleInputChange}
                  placeholder="예: 선임연구원"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  AHP 프로젝트 경험
                </label>
                <select 
                  name="projectExperience"
                  value={data.projectExperience}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="none">없음</option>
                  <option value="1-2">1-2회</option>
                  <option value="3-5">3-5회</option>
                  <option value="more-5">5회 이상</option>
                </select>
              </div>
            </div>
          </div>

          {/* 의사결정 역할 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              의사결정 역할
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                프로젝트에서의 역할
              </label>
              <select 
                name="decisionRole"
                value={data.decisionRole}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <option value="">선택하세요</option>
                <option value="decision-maker">최종 의사결정권자</option>
                <option value="advisor">자문/조언자</option>
                <option value="analyst">분석가</option>
                <option value="evaluator">평가자</option>
                <option value="observer">관찰자</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                추가 정보 (선택사항)
              </label>
              <textarea 
                name="additionalInfo"
                value={data.additionalInfo}
                onChange={handleInputChange}
                rows={4}
                placeholder="프로젝트와 관련된 추가 정보나 특별한 전문 분야가 있다면 입력해주세요."
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProjectCreationWizard;