import React, { useState } from 'react';

interface Question {
  id: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'number' | 'date';
  question: string;
  options?: string[];
  required: boolean;
}

interface SurveyFormBuilderProps {
  onSave?: (questions: Question[], metadata?: { title: string; description: string }) => void;
  onCancel?: () => void;
  initialSurvey?: any; // 편집할 기존 설문조사 데이터
}

const SurveyFormBuilder: React.FC<SurveyFormBuilderProps> = ({ onSave, onCancel, initialSurvey }) => {
  const [surveyTitle, setSurveyTitle] = useState(initialSurvey?.title || '인구통계학적 설문조사');
  const [surveyDescription, setSurveyDescription] = useState(initialSurvey?.description || '');
  const [questions, setQuestions] = useState<Question[]>(initialSurvey?.questions || []);
  const [isPreview, setIsPreview] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(!initialSurvey); // 편집 모드면 템플릿 선택 스킵

  // 기본 허수 템플릿들
  const demographicTemplates = {
    standard: {
      name: '표준 인구통계 템플릿',
      description: '연구에서 가장 일반적으로 사용되는 기본 항목들',
      questions: [
        {
          id: '1',
          type: 'radio' as const,
          question: '연령대를 선택해주세요',
          options: ['20-29세', '30-39세', '40-49세', '50세 이상'],
          required: true
        },
        {
          id: '2',
          type: 'radio' as const,
          question: '성별을 선택해주세요',
          options: ['남성', '여성'],
          required: true
        },
        {
          id: '3',
          type: 'radio' as const,
          question: '최종 학력을 선택해주세요',
          options: ['고등학교 졸업', '전문대 졸업', '4년제 대학 졸업', '대학원 졸업 (석사)', '대학원 졸업 (박사)'],
          required: true
        },
        {
          id: '4',
          type: 'radio' as const,
          question: '현재 직업 분야를 선택해주세요',
          options: ['IT/소프트웨어', '제조업', '서비스업', '교육', '공공기관', '연구기관', '의료', '기타'],
          required: true
        },
        {
          id: '5',
          type: 'radio' as const,
          question: '해당 분야 경력을 선택해주세요',
          options: ['5년 미만', '5-10년', '10-15년', '15년 이상'],
          required: true
        },
        {
          id: '6',
          type: 'text' as const,
          question: 'AHP 평가 참여를 위한 이메일 주소를 입력해주세요',
          options: [],
          required: true
        }
      ]
    },
    academic: {
      name: '학술 연구용 템플릿',
      description: '학술 논문 및 연구 목적에 특화된 항목들',
      questions: [
        {
          id: '1',
          type: 'radio' as const,
          question: '연령대를 선택해주세요',
          options: ['20-29세', '30-39세', '40-49세', '50세 이상'],
          required: true
        },
        {
          id: '2',
          type: 'radio' as const,
          question: '성별을 선택해주세요',
          options: ['남성', '여성'],
          required: true
        },
        {
          id: '3',
          type: 'radio' as const,
          question: '최종 학력을 선택해주세요',
          options: ['학사', '석사', '박사'],
          required: true
        },
        {
          id: '4',
          type: 'radio' as const,
          question: '전공 분야를 선택해주세요',
          options: ['공학', '자연과학', '사회과학', '인문학', '예술', '의학', '경영학', '기타'],
          required: true
        },
        {
          id: '5',
          type: 'radio' as const,
          question: '현재 소속을 선택해주세요',
          options: ['대학생', '대학원생', '교수/연구원', '기업 연구직', '일반 직장인'],
          required: true
        },
        {
          id: '6',
          type: 'radio' as const,
          question: 'AHP 분석 경험을 선택해주세요',
          options: ['처음', '1-2회', '3-5회', '5회 이상'],
          required: true
        },
        {
          id: '7',
          type: 'text' as const,
          question: 'AHP 평가 참여를 위한 이메일 주소를 입력해주세요',
          options: [],
          required: true
        }
      ]
    },
    business: {
      name: '비즈니스 의사결정 템플릿',
      description: '기업 및 조직의 의사결정 과정에 특화된 항목들',
      questions: [
        {
          id: '1',
          type: 'radio' as const,
          question: '연령대를 선택해주세요',
          options: ['20-29세', '30-39세', '40-49세', '50세 이상'],
          required: true
        },
        {
          id: '2',
          type: 'radio' as const,
          question: '성별을 선택해주세요',
          options: ['남성', '여성'],
          required: true
        },
        {
          id: '3',
          type: 'radio' as const,
          question: '직급을 선택해주세요',
          options: ['사원급', '대리급', '과장급', '차장급', '부장급', '임원급'],
          required: true
        },
        {
          id: '4',
          type: 'radio' as const,
          question: '부서를 선택해주세요',
          options: ['경영기획', '마케팅', '영업', '개발', '생산', '인사', '재무', '기타'],
          required: true
        },
        {
          id: '5',
          type: 'radio' as const,
          question: '경력을 선택해주세요',
          options: ['3년 미만', '3-7년', '7-15년', '15년 이상'],
          required: true
        },
        {
          id: '6',
          type: 'radio' as const,
          question: '의사결정 경험을 선택해주세요',
          options: ['참여 경험 없음', '팀 단위 의사결정', '부서 단위 의사결정', '전사 단위 의사결정'],
          required: true
        },
        {
          id: '7',
          type: 'text' as const,
          question: 'AHP 평가 참여를 위한 이메일 주소를 입력해주세요',
          options: [],
          required: true
        }
      ]
    }
  };

  // 템플릿 적용
  const applyTemplate = (templateKey: keyof typeof demographicTemplates) => {
    const template = demographicTemplates[templateKey];
    setQuestions(template.questions);
    setSurveyTitle(template.name);
    setSurveyDescription(template.description);
    setShowTemplateSelection(false);
  };

  const questionTypes = [
    { value: 'text', label: '단답형 텍스트', icon: '📝' },
    { value: 'textarea', label: '장문형 텍스트', icon: '📄' },
    { value: 'select', label: '드롭다운', icon: '📋' },
    { value: 'radio', label: '객관식 (단일선택)', icon: '⭕' },
    { value: 'checkbox', label: '객관식 (복수선택)', icon: '☑️' },
    { value: 'number', label: '숫자', icon: '🔢' },
    { value: 'date', label: '날짜', icon: '📅' }
  ];

  // 템플릿 선택 화면
  const renderTemplateSelection = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          📊 설문조사 템플릿 선택
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          연구 목적에 맞는 기본 허수 템플릿을 선택하거나 새로 만드세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(demographicTemplates).map(([key, template]) => (
          <div 
            key={key}
            className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-all cursor-pointer hover:shadow-lg"
            onClick={() => applyTemplate(key as keyof typeof demographicTemplates)}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">
                {key === 'standard' ? '📋' : key === 'academic' ? '🎓' : '💼'}
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {template.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {template.description}
              </p>
            </div>
            
            <div className="text-left">
              <div className="text-sm font-medium mb-2 text-gray-600">포함된 질문 ({template.questions.length}개):</div>
              <ul className="text-xs text-gray-500 space-y-1">
                {template.questions.slice(0, 3).map((q, i) => (
                  <li key={i}>• {q.question}</li>
                ))}
                {template.questions.length > 3 && (
                  <li>• 외 {template.questions.length - 3}개 질문</li>
                )}
              </ul>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                이 템플릿 사용하기
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-block p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            빈 설문조사로 시작
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            처음부터 직접 질문을 만들어 설문조사를 구성합니다
          </p>
          <button 
            onClick={() => {
              setQuestions([]);
              setShowTemplateSelection(false);
            }}
            className="py-2 px-6 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
          >
            빈 설문으로 시작하기
          </button>
        </div>
      </div>
    </div>
  );

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: '새 질문',
      options: ['옵션 1', '옵션 2'],
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, `옵션 ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options && q.options.length > 1) {
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < questions.length - 1)) {
      const newQuestions = [...questions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        question: `${questionToDuplicate.question} (복사본)`
      };
      const index = questions.findIndex(q => q.id === id);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(questions, { title: surveyTitle, description: surveyDescription });
    }
    alert('설문이 저장되었습니다!');
  };

  const renderPreview = () => {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {surveyTitle}
          </h2>
          {surveyDescription && (
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              {surveyDescription}
            </p>
          )}
          
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-6 border rounded-lg bg-gray-50">
                <div className="mb-4">
                  <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {index + 1}. {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {question.type === 'text' && (
                    <input type="text" className="w-full p-3 border rounded-lg" placeholder="단답형 텍스트 입력" />
                  )}
                  
                  {question.type === 'textarea' && (
                    <textarea className="w-full p-3 border rounded-lg" rows={4} placeholder="장문형 텍스트 입력" />
                  )}
                  
                  {question.type === 'select' && question.options && (
                    <select className="w-full p-3 border rounded-lg">
                      <option value="">선택하세요</option>
                      {question.options.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {question.type === 'radio' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, i) => (
                        <label key={i} className="flex items-center">
                          <input type="radio" name={`question-${question.id}`} className="mr-2" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, i) => (
                        <label key={i} className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'number' && (
                    <input type="number" className="w-full p-3 border rounded-lg" placeholder="숫자 입력" />
                  )}
                  
                  {question.type === 'date' && (
                    <input type="date" className="w-full p-3 border rounded-lg" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => setIsPreview(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              편집으로 돌아가기
            </button>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              제출
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isPreview) {
    return renderPreview();
  }

  if (showTemplateSelection) {
    return renderTemplateSelection();
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="backdrop-blur-xl rounded-2xl p-8 shadow-lg" style={{ 
        backgroundColor: 'var(--card-bg)', 
        border: '1px solid var(--card-border)' 
      }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {initialSurvey ? '✏️ 설문조사 편집' : '📊 설문조사 폼 빌더'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {initialSurvey ? '기존 설문조사 내용을 수정하고 편집할 수 있습니다' : '구글 폼처럼 자유롭게 설문 항목을 추가하고 편집할 수 있습니다'}
            </p>
          </div>
          <div className="flex space-x-3">
            {!initialSurvey && (
              <button
                onClick={() => setShowTemplateSelection(true)}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{ 
                  borderColor: 'var(--border-default)', 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                📋 템플릿 변경
              </button>
            )}
            <button
              onClick={() => setIsPreview(true)}
              className="px-4 py-2 border rounded-lg transition-colors"
              style={{ 
                borderColor: 'var(--accent-primary)', 
                color: 'var(--accent-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              👁️ 미리보기
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                border: '1px solid var(--accent-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              💾 저장
            </button>
          </div>
        </div>

        {/* 설문 제목 및 설명 */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            className="w-full text-2xl font-bold p-3 mb-4 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
            placeholder="설문 제목"
          />
          <textarea
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
            className="w-full p-3 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
            placeholder="설문 설명 (선택사항)"
            rows={2}
          />
        </div>

        {/* 질문 목록 */}
        <div className="space-y-4 mb-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                질문이 없습니다
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                템플릿을 선택하거나 새 질문을 추가해서 설문조사를 시작하세요
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowTemplateSelection(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋 템플릿 선택하기
                </button>
                <button
                  onClick={addQuestion}
                  className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ➕ 직접 질문 추가
                </button>
              </div>
            </div>
          ) : (
            questions.map((question, index) => (
            <div key={question.id} className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              {/* 질문 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-4">
                  <div className="flex items-center mb-3">
                    <span className="text-lg font-semibold mr-3" style={{ color: 'var(--text-muted)' }}>
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                      className="flex-1 text-lg p-2 border-b focus:outline-none transition-colors"
                      style={{ 
                        borderColor: 'var(--border-default)', 
                        backgroundColor: 'transparent',
                        color: 'var(--text-primary)'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                      placeholder="질문을 입력하세요"
                    />
                  </div>
                  
                  {/* 질문 유형 선택 */}
                  <div className="flex items-center space-x-4">
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                      className="p-2 border rounded-lg focus:outline-none transition-colors"
                      style={{ 
                        borderColor: 'var(--border-default)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">필수 항목</span>
                    </label>
                  </div>
                </div>
                
                {/* 액션 버튼들 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveQuestion(question.id, 'up')}
                    disabled={index === 0}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                    title="위로 이동"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => moveQuestion(question.id, 'down')}
                    disabled={index === questions.length - 1}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                    title="아래로 이동"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => duplicateQuestion(question.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="복제"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-500"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* 옵션 관리 (select, radio, checkbox) */}
              {['select', 'radio', 'checkbox'].includes(question.type) && question.options && (
                <div className="mt-4 pl-8">
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <span className="text-gray-400">
                          {question.type === 'radio' ? '○' : question.type === 'checkbox' ? '☐' : '•'}
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className="flex-1 p-2 border-b border-gray-200 focus:border-blue-500 focus:outline-none"
                          placeholder="옵션 텍스트"
                        />
                        {question.options && question.options.length > 1 && (
                          <button
                            onClick={() => deleteOption(question.id, optionIndex)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addOption(question.id)}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + 옵션 추가
                  </button>
                </div>
              )}
            </div>
            ))
          )}
        </div>

        {/* 질문 추가 버튼 */}
        {questions.length > 0 && (
          <button
            onClick={addQuestion}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <span className="text-blue-600 font-medium">➕ 새 질문 추가</span>
          </button>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
          )}
          <button
            onClick={() => setIsPreview(true)}
            className="px-6 py-3 border rounded-lg transition-colors"
            style={{ 
              borderColor: 'var(--accent-primary)', 
              color: 'var(--accent-primary)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            미리보기
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: '1px solid var(--accent-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyFormBuilder;