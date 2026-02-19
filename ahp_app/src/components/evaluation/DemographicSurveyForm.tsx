import React, { useState } from 'react';
import {
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface DemographicData {
  age_group: string;
  gender: string;
  education_level: string;
  occupation: string;
  industry: string;
  experience_years: string;
  decision_role: string;
  custom_fields: { [key: string]: any };
}

interface DemographicSurveyFormProps {
  projectId: string;
  surveyConfig: any;
  onComplete: (data: DemographicData) => void;
}

const DemographicSurveyForm: React.FC<DemographicSurveyFormProps> = ({
  projectId,
  surveyConfig,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [formData, setFormData] = useState<DemographicData>({
    age_group: '',
    gender: '',
    education_level: '',
    occupation: '',
    industry: '',
    experience_years: '',
    decision_role: '',
    custom_fields: {},
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 설문 단계 정의
  const steps = [
    {
      id: 'basic',
      title: '기본 정보',
      icon: UserIcon,
      fields: ['age_group', 'gender'],
    },
    {
      id: 'education',
      title: '학력 및 경력',
      icon: AcademicCapIcon,
      fields: ['education_level', 'experience_years'],
    },
    {
      id: 'work',
      title: '직업 정보',
      icon: BriefcaseIcon,
      fields: ['occupation', 'industry'],
    },
    {
      id: 'role',
      title: '의사결정 역할',
      icon: ChartBarIcon,
      fields: ['decision_role'],
    },
  ];

  // 커스텀 질문이 있으면 추가 단계 생성
  if (surveyConfig?.customQuestions?.length > 0) {
    steps.push({
      id: 'custom',
      title: '추가 질문',
      icon: UserIcon,
      fields: surveyConfig.customQuestions.map((q: any) => q.id),
    });
  }

  const currentStepData = steps[currentStep];

  const handleFieldChange = (field: string, value: any) => {
    if (field.startsWith('custom_')) {
      setFormData({
        ...formData,
        custom_fields: {
          ...formData.custom_fields,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }

    // 에러 클리어
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateStep = () => {
    const stepErrors: { [key: string]: string } = {};
    const stepFields = currentStepData.fields;

    stepFields.forEach((field) => {
      const value = field.startsWith('custom_')
        ? formData.custom_fields[field]
        : formData[field as keyof DemographicData];

      if (surveyConfig[`use${field.charAt(0).toUpperCase() + field.slice(1).replace('_', '')}`] && !value) {
        stepErrors[field] = '이 항목은 필수입니다.';
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        // 마지막 단계 - 완료 처리
        const completionTime = Math.floor((Date.now() - startTime) / 1000);
        onComplete({
          ...formData,
          custom_fields: {
            ...formData.custom_fields,
            completion_time_seconds: completionTime,
          },
        });
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderFieldInput = (field: string) => {
    switch (field) {
      case 'age_group':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              귀하의 연령대를 선택해주세요
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['20대', '30대', '40대', '50대', '60대 이상'].map((age) => (
                <label
                  key={age}
                  className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.age_group === age
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="age_group"
                    value={age}
                    checked={formData.age_group === age}
                    onChange={(e) => handleFieldChange('age_group', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{age}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'gender':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              귀하의 성별을 선택해주세요
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: '남성', label: '남성' },
                { value: '여성', label: '여성' },
                { value: '기타', label: '기타' },
                { value: '응답거부', label: '응답하지 않음' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.gender === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={formData.gender === option.value}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'education_level':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              최종 학력을 선택해주세요
            </label>
            <select
              value={formData.education_level}
              onChange={(e) => handleFieldChange('education_level', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">선택하세요</option>
              <option value="고졸이하">고등학교 졸업 이하</option>
              <option value="대학재학">대학 재학</option>
              <option value="대졸">대학 졸업</option>
              <option value="석사재학">석사 재학</option>
              <option value="석사">석사 졸업</option>
              <option value="박사재학">박사 재학</option>
              <option value="박사">박사 졸업</option>
            </select>
          </div>
        );

      case 'experience_years':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              관련 분야 경력을 선택해주세요
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: '1년미만', label: '1년 미만' },
                { value: '1-3년', label: '1-3년' },
                { value: '3-5년', label: '3-5년' },
                { value: '5-10년', label: '5-10년' },
                { value: '10년이상', label: '10년 이상' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.experience_years === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="experience_years"
                    value={option.value}
                    checked={formData.experience_years === option.value}
                    onChange={(e) => handleFieldChange('experience_years', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'occupation':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              직업/직군을 입력해주세요
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleFieldChange('occupation', e.target.value)}
              placeholder="예: 소프트웨어 개발자, 마케팅 매니저, 연구원 등"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        );

      case 'industry':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              산업 분야를 선택해주세요
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleFieldChange('industry', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">선택하세요</option>
              <option value="IT/소프트웨어">IT/소프트웨어</option>
              <option value="제조업">제조업</option>
              <option value="금융/보험">금융/보험</option>
              <option value="의료/헬스케어">의료/헬스케어</option>
              <option value="교육">교육</option>
              <option value="유통/소매">유통/소매</option>
              <option value="건설/부동산">건설/부동산</option>
              <option value="미디어/엔터테인먼트">미디어/엔터테인먼트</option>
              <option value="공공/정부">공공/정부</option>
              <option value="연구/학계">연구/학계</option>
              <option value="기타">기타</option>
            </select>
          </div>
        );

      case 'decision_role':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              프로젝트에서의 귀하의 역할은 무엇입니까?
            </label>
            <div className="space-y-3">
              {[
                { value: '의사결정권자', label: '최종 의사결정권자', desc: '프로젝트의 최종 결정을 내리는 위치' },
                { value: '자문역할', label: '자문/조언자', desc: '전문 지식으로 조언을 제공하는 역할' },
                { value: '분석가', label: '분석가', desc: '데이터 분석 및 인사이트 제공' },
                { value: '실무자', label: '실무자/평가자', desc: '실제 업무를 수행하거나 평가하는 역할' },
                { value: '관찰자', label: '관찰자', desc: '프로젝트를 모니터링하는 역할' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.decision_role === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision_role"
                    value={option.value}
                    checked={formData.decision_role === option.value}
                    onChange={(e) => handleFieldChange('decision_role', e.target.value)}
                    className="sr-only"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        // 커스텀 필드 처리
        const customQuestion = surveyConfig?.customQuestions?.find((q: any) => q.id === field);
        if (customQuestion) {
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {customQuestion.question}
              </label>
              {customQuestion.type === 'text' && (
                <input
                  type="text"
                  value={formData.custom_fields[field] || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
              {(customQuestion.type === 'select' || customQuestion.type === 'radio') && (
                <select
                  value={formData.custom_fields[field] || ''}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">선택하세요</option>
                  {customQuestion.options?.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        }
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {surveyConfig?.surveyTitle || '인구통계학적 기본 정보 조사'}
          </h1>
          <p className="text-gray-600">
            {surveyConfig?.surveyDescription || '연구 참여자의 기본 정보를 수집합니다.'}
          </p>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              단계 {currentStep + 1} / {steps.length}
            </span>
            <span>{Math.round(progressPercentage)}% 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-tertiary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 설문 카드 */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* 단계 제목 */}
          <div className="flex items-center gap-3 mb-6">
            {React.createElement(currentStepData.icon, {
              className: 'h-6 w-6 text-primary',
            })}
            <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          </div>

          {/* 필드 렌더링 */}
          <div className="space-y-6">
            {currentStepData.fields.map((field) => (
              <div key={field}>
                {renderFieldInput(field)}
                {errors[field] && (
                  <p className="text-red-500 text-sm mt-2">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`btn btn-secondary ${
                currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              이전
            </button>

            <button
              onClick={handleNext}
              className="btn btn-primary flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  설문 완료
                  <ChevronRightIcon className="h-5 w-5" />
                </>
              ) : (
                <>
                  다음
                  <ChevronRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 예상 시간 안내 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          예상 소요 시간: 약 {surveyConfig?.estimatedTime || 2}분
        </div>
      </div>
    </div>
  );
};

export default DemographicSurveyForm;