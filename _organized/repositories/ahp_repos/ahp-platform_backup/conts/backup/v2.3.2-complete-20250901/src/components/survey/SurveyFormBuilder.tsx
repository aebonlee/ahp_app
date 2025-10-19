import React, { useState } from 'react';

interface Question {
  id: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'number' | 'date';
  question: string;
  options?: string[];
  required: boolean;
}

interface SurveyFormBuilderProps {
  onSave?: (questions: Question[]) => void;
  onCancel?: () => void;
}

const SurveyFormBuilder: React.FC<SurveyFormBuilderProps> = ({ onSave, onCancel }) => {
  const [surveyTitle, setSurveyTitle] = useState('인구통계학적 설문조사');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'select',
      question: '연령대를 선택해주세요',
      options: ['20대', '30대', '40대', '50대', '60대 이상'],
      required: true
    }
  ]);
  const [isPreview, setIsPreview] = useState(false);

  const questionTypes = [
    { value: 'text', label: '단답형 텍스트', icon: '📝' },
    { value: 'textarea', label: '장문형 텍스트', icon: '📄' },
    { value: 'select', label: '드롭다운', icon: '📋' },
    { value: 'radio', label: '객관식 (단일선택)', icon: '⭕' },
    { value: 'checkbox', label: '객관식 (복수선택)', icon: '☑️' },
    { value: 'number', label: '숫자', icon: '🔢' },
    { value: 'date', label: '날짜', icon: '📅' }
  ];

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
      onSave(questions);
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
              📊 설문조사 폼 빌더
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              구글 폼처럼 자유롭게 설문 항목을 추가하고 편집할 수 있습니다
            </p>
          </div>
          <div className="flex space-x-3">
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
          {questions.map((question, index) => (
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
          ))}
        </div>

        {/* 질문 추가 버튼 */}
        <button
          onClick={addQuestion}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <span className="text-blue-600 font-medium">➕ 새 질문 추가</span>
        </button>

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