import React from 'react';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { DemographicConfig } from './DemographicSurveyConfig';

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  config: Partial<DemographicConfig>;
  recommendedFor: string[];
}

// 3가지 기본 템플릿 정의
export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'basic',
    name: '기본 설문',
    description: '일반적인 연구에 적합한 기본 인구통계 정보를 수집합니다.',
    icon: UserGroupIcon,
    recommendedFor: ['일반 연구', '소비자 조사', '시장 조사'],
    config: {
      enabled: true,
      useAge: true,
      useGender: true,
      useEducation: true,
      useOccupation: false,
      useIndustry: false,
      useExperience: false,
      surveyTitle: '기본 인구통계 조사',
      surveyDescription: '연구 참여자의 기본 정보를 수집합니다.',
      estimatedTime: 2,
      customQuestions: [],
    },
  },
  {
    id: 'professional',
    name: '전문가 설문',
    description: '전문가 대상 연구에 필요한 경력 및 전문성 정보를 포함합니다.',
    icon: BriefcaseIcon,
    recommendedFor: ['전문가 델파이', '업계 조사', 'B2B 연구'],
    config: {
      enabled: true,
      useAge: true,
      useGender: true,
      useEducation: true,
      useOccupation: true,
      useIndustry: true,
      useExperience: true,
      surveyTitle: '전문가 프로필 조사',
      surveyDescription: '전문가의 배경과 경력 정보를 수집합니다.',
      estimatedTime: 3,
      customQuestions: [
        {
          id: 'expertise_area',
          type: 'text',
          question: '주요 전문 분야를 입력해주세요',
          required: true,
        },
        {
          id: 'certifications',
          type: 'text',
          question: '보유 자격증이 있다면 입력해주세요',
          required: false,
        },
      ],
    },
  },
  {
    id: 'academic',
    name: '학술 연구 설문',
    description: '학술 연구에 필요한 상세한 인구통계 및 연구 경험 정보를 수집합니다.',
    icon: AcademicCapIcon,
    recommendedFor: ['학술 논문', '박사 연구', '종단 연구'],
    config: {
      enabled: true,
      useAge: true,
      useGender: true,
      useEducation: true,
      useOccupation: true,
      useIndustry: true,
      useExperience: true,
      surveyTitle: '학술 연구 참여자 정보',
      surveyDescription: '본 연구의 참여자 특성을 파악하기 위한 설문입니다.',
      estimatedTime: 4,
      customQuestions: [
        {
          id: 'research_experience',
          type: 'select',
          question: '이전 연구 참여 경험',
          options: ['없음', '1-2회', '3-5회', '6회 이상'],
          required: true,
        },
        {
          id: 'publication_count',
          type: 'select',
          question: '학술 논문 게재 경험',
          options: ['없음', '1-3편', '4-10편', '10편 이상'],
          required: false,
        },
        {
          id: 'research_field',
          type: 'text',
          question: '주요 연구 분야',
          required: true,
        },
      ],
    },
  },
];

interface DemographicSurveyTemplatesProps {
  onSelectTemplate: (template: SurveyTemplate | null) => void;
  selectedTemplateId?: string | null;
}

const DemographicSurveyTemplates: React.FC<DemographicSurveyTemplatesProps> = ({
  onSelectTemplate,
  selectedTemplateId,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          설문 템플릿 선택
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          연구 목적에 맞는 템플릿을 선택하거나 직접 만들어보세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 기본 템플릿 카드 */}
        {SURVEY_TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplateId === template.id;

          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  {/* 추천 용도 태그 */}
                  <div className="flex flex-wrap gap-1">
                    {template.recommendedFor.map((use, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {use}
                      </span>
                    ))}
                  </div>

                  {/* 포함 항목 미리보기 */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      포함 항목:{' '}
                      {[
                        template.config.useAge && '연령',
                        template.config.useGender && '성별',
                        template.config.useEducation && '학력',
                        template.config.useOccupation && '직업',
                        template.config.useIndustry && '산업',
                        template.config.useExperience && '경력',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                      {template.config.customQuestions &&
                        template.config.customQuestions.length > 0 &&
                        ` +${template.config.customQuestions.length}개 추가 질문`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 커스텀 템플릿 카드 */}
        <div
          onClick={() => onSelectTemplate(null)}
          className={`
            relative p-6 rounded-xl border-2 cursor-pointer transition-all
            ${
              selectedTemplateId === 'custom'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 hover:border-primary/50 hover:shadow-md border-dashed'
            }
          `}
        >
          {selectedTemplateId === 'custom' && (
            <div className="absolute top-3 right-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${
                    selectedTemplateId === 'custom'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                <PlusCircleIcon className="h-6 w-6" />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                직접 만들기
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                연구에 필요한 항목을 직접 선택하고 커스텀 질문을 추가하세요
              </p>

              <div className="flex flex-wrap gap-1">
                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  완전 맞춤형
                </span>
                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  자유로운 설정
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  모든 필드를 자유롭게 구성할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 템플릿 선택 후 안내 */}
      {selectedTemplateId && selectedTemplateId !== 'custom' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 템플릿을 선택한 후에도 필요에 따라 항목을 추가하거나 제거할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default DemographicSurveyTemplates;