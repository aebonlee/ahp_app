import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface EvaluatorSurveyPageProps {
  surveyId: string;
  token: string;
}

interface SurveyData {
  projectTitle: string;
  researcherName: string;
  description: string;
  questions: SurveyQuestion[];
  deadline?: Date;
}

interface SurveyQuestion {
  id: string;
  type: 'text' | 'radio' | 'checkbox' | 'scale' | 'matrix';
  question: string;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  matrixRows?: string[];
  matrixColumns?: string[];
}

const EvaluatorSurveyPage: React.FC<EvaluatorSurveyPageProps> = ({ surveyId, token }) => {
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 설문조사 데이터 로드
    loadSurveyData();
  }, [surveyId, token]);

  const loadSurveyData = async () => {
    // TODO: 실제 API 호출로 교체
    const mockData: SurveyData = {
      projectTitle: "AI 도입 효과성 평가 연구",
      researcherName: "김연구 교수",
      description: "본 설문조사는 AI 도입의 효과성을 평가하기 위한 전문가 의견 수집을 목적으로 합니다. 약 10-15분 정도 소요됩니다.",
      deadline: new Date('2025-09-30'),
      questions: [
        {
          id: 'q1',
          type: 'text',
          question: '귀하의 소속 기관을 입력해주세요.',
          required: true
        },
        {
          id: 'q2',
          type: 'radio',
          question: '귀하의 전문 분야는 무엇입니까?',
          required: true,
          options: ['AI/머신러닝', '데이터 사이언스', '소프트웨어 엔지니어링', '비즈니스 전략', '기타']
        },
        {
          id: 'q3',
          type: 'scale',
          question: 'AI 기술에 대한 귀하의 전문성 수준을 평가해주세요.',
          required: true,
          scaleMin: 1,
          scaleMax: 10,
          scaleLabels: { min: '초급', max: '전문가' }
        },
        {
          id: 'q4',
          type: 'checkbox',
          question: '귀하가 경험한 AI 활용 분야를 모두 선택해주세요.',
          required: false,
          options: ['자연어처리', '컴퓨터 비전', '추천시스템', '예측분석', '자동화', '의사결정지원']
        },
        {
          id: 'q5',
          type: 'matrix',
          question: '다음 AI 도입 요소들의 중요도를 평가해주세요.',
          required: true,
          matrixRows: ['기술적 성숙도', '비용 효율성', '구현 용이성', '확장 가능성'],
          matrixColumns: ['매우 낮음', '낮음', '보통', '높음', '매우 높음']
        },
        {
          id: 'q6',
          type: 'text',
          question: 'AI 도입 시 가장 중요하게 고려해야 할 사항은 무엇이라고 생각하십니까?',
          required: false
        }
      ]
    };
    setSurveyData(mockData);
  };

  const validateCurrentPage = () => {
    const newErrors: Record<string, string> = {};
    const questionsPerPage = 3;
    const startIdx = currentPage * questionsPerPage;
    const endIdx = Math.min(startIdx + questionsPerPage, surveyData?.questions.length || 0);
    
    surveyData?.questions.slice(startIdx, endIdx).forEach(question => {
      if (question.required && !responses[question.id]) {
        newErrors[question.id] = '필수 항목입니다.';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentPage(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateCurrentPage()) return;
    
    setIsSubmitting(true);
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsCompleted(true);
    } catch (error) {
      console.error('설문 제출 실패:', error);
      alert('설문 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <div>
            <textarea
              className="w-full px-3 py-2 border rounded-lg resize-none"
              rows={3}
              placeholder="답변을 입력해주세요..."
              value={responses[question.id] || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
              style={{
                borderColor: errors[question.id] ? 'var(--status-error-border)' : 'var(--border-default)',
                backgroundColor: 'var(--input-bg)'
              }}
            />
            {errors[question.id] && (
              <p className="text-sm mt-1" style={{ color: 'var(--status-error-text)' }}>
                {errors[question.id]}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
            {errors[question.id] && (
              <p className="text-sm" style={{ color: 'var(--status-error-text)' }}>
                {errors[question.id]}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={(responses[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const current = responses[question.id] || [];
                    if (e.target.checked) {
                      setResponses(prev => ({ ...prev, [question.id]: [...current, option] }));
                    } else {
                      setResponses(prev => ({ ...prev, [question.id]: current.filter((o: string) => o !== option) }));
                    }
                  }}
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {question.scaleLabels?.min}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {question.scaleLabels?.max}
              </span>
            </div>
            <div className="flex justify-between">
              {Array.from({ length: (question.scaleMax || 10) - (question.scaleMin || 1) + 1 }, (_, i) => {
                const value = (question.scaleMin || 1) + i;
                return (
                  <button
                    key={value}
                    onClick={() => setResponses(prev => ({ ...prev, [question.id]: value }))}
                    className={`w-10 h-10 rounded-full border-2 font-medium transition-all ${
                      responses[question.id] === value 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {errors[question.id] && (
              <p className="text-sm mt-2" style={{ color: 'var(--status-error-text)' }}>
                {errors[question.id]}
              </p>
            )}
          </div>
        );

      case 'matrix':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left"></th>
                  {question.matrixColumns?.map(col => (
                    <th key={col} className="px-4 py-2 text-center text-sm">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.matrixRows?.map(row => (
                  <tr key={row} className="border-t">
                    <td className="px-4 py-2 font-medium">{row}</td>
                    {question.matrixColumns?.map(col => (
                      <td key={col} className="px-4 py-2 text-center">
                        <input
                          type="radio"
                          name={`${question.id}_${row}`}
                          value={col}
                          checked={(responses[question.id] || {})[row] === col}
                          onChange={() => {
                            setResponses(prev => ({
                              ...prev,
                              [question.id]: {
                                ...(prev[question.id] || {}),
                                [row]: col
                              }
                            }));
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {errors[question.id] && (
              <p className="text-sm mt-2" style={{ color: 'var(--status-error-text)' }}>
                {errors[question.id]}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Card variant="elevated" className="max-w-2xl w-full mx-4 p-8 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            설문조사가 완료되었습니다!
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            귀중한 의견을 제공해주셔서 감사합니다.<br/>
            연구 결과는 완료 후 이메일로 공유됩니다.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              참여 ID: {surveyId}<br/>
              제출 시각: {new Date().toLocaleString()}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">설문조사를 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  const questionsPerPage = 3;
  const totalPages = Math.ceil(surveyData.questions.length / questionsPerPage);
  const startIdx = currentPage * questionsPerPage;
  const endIdx = Math.min(startIdx + questionsPerPage, surveyData.questions.length);
  const currentQuestions = surveyData.questions.slice(startIdx, endIdx);
  const progress = ((startIdx + Object.keys(responses).filter(key => 
    surveyData.questions.slice(0, startIdx).some(q => q.id === key)
  ).length) / surveyData.questions.length) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 survey-sm:px-6 py-4 survey-sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {surveyData.projectTitle}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                연구자: {surveyData.researcherName}
                {surveyData.deadline && ` | 마감: ${surveyData.deadline.toLocaleDateString()}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                페이지 {currentPage + 1} / {totalPages}
              </div>
            </div>
          </div>
          
          {/* 진행률 표시 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 설문 내용 */}
      <div className="max-w-4xl mx-auto px-4 survey-sm:px-6 py-6 survey-sm:py-8">
        {currentPage === 0 && (
          <Card variant="outlined" className="mb-6 p-6">
            <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              설문조사 안내
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {surveyData.description}
            </p>
          </Card>
        )}

        <div className="space-y-6">
          {currentQuestions.map((question, index) => (
            <Card key={question.id} variant="default" className="p-6">
              <div className="mb-4">
                <div className="flex items-start">
                  <span className="font-bold mr-2" style={{ color: 'var(--accent-primary)' }}>
                    Q{startIdx + index + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                      {question.question}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {renderQuestion(question)}
            </Card>
          ))}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 0}
          >
            ← 이전
          </Button>

          {currentPage < totalPages - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
            >
              다음 →
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : '설문 제출'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorSurveyPage;