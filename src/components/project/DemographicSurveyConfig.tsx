import React, { useState } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import DemographicSurveyTemplates, { SurveyTemplate, SURVEY_TEMPLATES } from './DemographicSurveyTemplates';

export interface DemographicConfig {
  enabled: boolean;
  useAge: boolean;
  useGender: boolean;
  useEducation: boolean;
  useOccupation: boolean;
  useIndustry: boolean;
  useExperience: boolean;
  customQuestions: CustomQuestion[];
  surveyTitle: string;
  surveyDescription: string;
  estimatedTime: number;
}

export interface CustomQuestion {
  id: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'scale';
  question: string;
  options?: string[];
  required: boolean;
}

interface DemographicSurveyConfigProps {
  config: DemographicConfig;
  onChange: (config: DemographicConfig) => void;
}

const DemographicSurveyConfig: React.FC<DemographicSurveyConfigProps> = ({
  config,
  onChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({
    id: '',
    type: 'text',
    question: '',
    options: [],
    required: false,
  });

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (template: SurveyTemplate | null) => {
    if (template) {
      // 기본 템플릿 적용
      setSelectedTemplateId(template.id);
      onChange({
        ...config,
        ...template.config,
        enabled: true,
      } as DemographicConfig);
      setShowTemplates(false);
    } else {
      // 직접 만들기
      setSelectedTemplateId('custom');
      onChange({
        ...config,
        enabled: true,
        surveyTitle: '맞춤형 설문조사',
        surveyDescription: '연구에 필요한 정보를 수집합니다.',
        estimatedTime: 3,
      });
      setShowTemplates(false);
    }
  };

  const handleBasicFieldChange = (field: keyof DemographicConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const addCustomQuestion = () => {
    if (newQuestion.question.trim()) {
      const question: CustomQuestion = {
        ...newQuestion,
        id: Date.now().toString(),
      };
      onChange({
        ...config,
        customQuestions: [...config.customQuestions, question],
      });
      setNewQuestion({
        id: '',
        type: 'text',
        question: '',
        options: [],
        required: false,
      });
    }
  };

  const removeCustomQuestion = (id: string) => {
    onChange({
      ...config,
      customQuestions: config.customQuestions.filter((q) => q.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* 인구통계 설문 활성화 */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">인구통계학적 설문조사</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleBasicFieldChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {config.enabled && showTemplates && (
          <DemographicSurveyTemplates
            onSelectTemplate={handleTemplateSelect}
            selectedTemplateId={selectedTemplateId}
          />
        )}

        {config.enabled && !showTemplates && (
          <>
            {/* 템플릿 변경 버튼 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                {selectedTemplateId && selectedTemplateId !== 'custom' && (
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {SURVEY_TEMPLATES.find(t => t.id === selectedTemplateId)?.name} 템플릿 적용됨
                    </span>
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowTemplates(true)}
                className="text-sm text-primary hover:text-primary/80"
              >
                템플릿 다시 선택
              </button>
            </div>

            {/* 설문 기본 정보 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설문 제목
                </label>
                <input
                  type="text"
                  value={config.surveyTitle}
                  onChange={(e) => handleBasicFieldChange('surveyTitle', e.target.value)}
                  placeholder="인구통계학적 기본 정보 조사"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설문 설명
                </label>
                <textarea
                  value={config.surveyDescription}
                  onChange={(e) =>
                    handleBasicFieldChange('surveyDescription', e.target.value)
                  }
                  placeholder="본 설문은 연구 참여자의 기본 정보를 수집하기 위한 것입니다."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예상 소요 시간 (분)
                </label>
                <input
                  type="number"
                  value={config.estimatedTime}
                  onChange={(e) =>
                    handleBasicFieldChange('estimatedTime', parseInt(e.target.value) || 0)
                  }
                  min="1"
                  max="30"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* 기본 필드 선택 */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                수집할 기본 정보 선택
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { field: 'useAge', label: '연령대' },
                  { field: 'useGender', label: '성별' },
                  { field: 'useEducation', label: '학력' },
                  { field: 'useOccupation', label: '직업' },
                  { field: 'useIndustry', label: '산업분야' },
                  { field: 'useExperience', label: '경력' },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config[field as keyof DemographicConfig] as boolean}
                      onChange={(e) =>
                        handleBasicFieldChange(field as keyof DemographicConfig, e.target.checked)
                      }
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 고급 설정 - 커스텀 질문 */}
            <div className="border-t pt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4"
              >
                {showAdvanced ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
                커스텀 질문 추가
              </button>

              {showAdvanced && (
                <div className="space-y-4">
                  {/* 새 질문 추가 폼 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          질문
                        </label>
                        <input
                          type="text"
                          value={newQuestion.question}
                          onChange={(e) =>
                            setNewQuestion({ ...newQuestion, question: e.target.value })
                          }
                          placeholder="추가 질문을 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          응답 유형
                        </label>
                        <select
                          value={newQuestion.type}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              type: e.target.value as CustomQuestion['type'],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="text">텍스트</option>
                          <option value="select">선택 (단일)</option>
                          <option value="radio">라디오 버튼</option>
                          <option value="checkbox">체크박스 (복수)</option>
                          <option value="scale">척도</option>
                        </select>
                      </div>
                    </div>

                    {['select', 'radio', 'checkbox'].includes(newQuestion.type) && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          선택 옵션 (쉼표로 구분)
                        </label>
                        <input
                          type="text"
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              options: e.target.value.split(',').map((s) => s.trim()),
                            })
                          }
                          placeholder="옵션1, 옵션2, 옵션3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newQuestion.required}
                          onChange={(e) =>
                            setNewQuestion({ ...newQuestion, required: e.target.checked })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">필수 응답</span>
                      </label>

                      <button
                        onClick={addCustomQuestion}
                        className="btn btn-primary btn-sm flex items-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        질문 추가
                      </button>
                    </div>
                  </div>

                  {/* 추가된 커스텀 질문 목록 */}
                  {config.customQuestions.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">추가된 질문</h5>
                      {config.customQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border"
                        >
                          <div>
                            <p className="text-sm font-medium">{q.question}</p>
                            <p className="text-xs text-gray-500">
                              {q.type} {q.required && '(필수)'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeCustomQuestion(q.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DemographicSurveyConfig;