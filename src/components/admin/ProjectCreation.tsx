import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import EvaluationModeSelector, { EvaluationMode } from '../evaluation/EvaluationModeSelector';
import PaperWorkflowGuide from '../guide/PaperWorkflowGuide';

interface ProjectCreationProps {
  onProjectCreated: () => void;
  onCancel: () => void;
  loading?: boolean;
  createProject?: (projectData: { 
    title: string; 
    description: string; 
    objective: string; 
    evaluationMode: EvaluationMode;
    ahpType: 'general' | 'fuzzy';
  }) => Promise<any>;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({ 
  onProjectCreated, 
  onCancel, 
  loading = false,
  createProject
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    evaluationMode: 'practical' as EvaluationMode,
    ahpType: 'general' as 'general' | 'fuzzy'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '프로젝트명을 입력해주세요.';
    } else if (formData.title.length < 2) {
      newErrors.title = '프로젝트명은 2자 이상이어야 합니다.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '프로젝트 설명을 입력해주세요.';
    } else if (formData.description.length < 10) {
      newErrors.description = '설명은 10자 이상 입력해주세요.';
    }

    if (!formData.objective.trim()) {
      newErrors.objective = '프로젝트 목표를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (createProject) {
        // 실제 프로젝트 생성 함수 호출
        await createProject(formData);
        
        // 성공 시 폼 초기화
        setFormData({
          title: '',
          description: '',
          objective: '',
          evaluationMode: 'practical',
          ahpType: 'general'
        });
        
        onProjectCreated();
      } else {
        // Fallback: 시뮬레이션
        console.log('Creating project with data:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onProjectCreated();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      // 에러 메시지를 사용자에게 표시
      setErrors({ general: error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
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
      <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          단계 1 — 프로젝트 추가
        </h1>
        <p className="text-gray-600">
          새로운 AHP 의사결정 분석 프로젝트를 생성합니다.
        </p>
        
        {/* 논문 작성 권장 구조 안내 */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800">📄 논문 작성 권장 구조</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p className="mb-2">학술 논문 작성 시 <strong>3개 기준 × 3개 대안</strong> 구조를 권장합니다.</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>명확한 연구 설계와 결과 해석이 용이</li>
                  <li>일관성 검증(CR ≤ 0.1) 충족 확률 향상</li>
                  <li>쌍대비교 횟수 최소화 (기준 3회, 대안 9회)</li>
                  <li>추가 기준/대안은 다음 단계에서 선택 가능</li>
                </ul>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowWorkflowGuide(true)}
                    className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 underline"
                  >
                    📚 전체 워크플로우 가이드 보기 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Card className="p-8 shadow-lg">
        {errors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            id="title"
            label="프로젝트명"
            placeholder="프로젝트 이름을 입력하세요"
            value={formData.title}
            onChange={(value) => handleInputChange('title', value)}
            error={errors.title}
            required
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <Input
            id="objective"
            label="프로젝트 목표"
            placeholder="이 프로젝트로 달성하고자 하는 목표를 입력하세요"
            value={formData.objective}
            onChange={(value) => handleInputChange('objective', value)}
            error={errors.objective}
            required
          />

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                AHP 분석 유형 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => handleInputChange('ahpType', 'general')}
                  className={`p-6 rounded-lg border-2 transition-colors ${
                    formData.ahpType === 'general'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900 mb-1">📊 일반 AHP</div>
                    <div className="text-sm text-gray-600">
                      전통적인 쌍대비교 방법
                      <ul className="mt-1 text-xs space-y-1">
                        <li>• Saaty's 1-9 척도 사용</li>
                        <li>• 명확한 가중치 산출</li>
                        <li>• 일관성 검증 (CR ≤ 0.1)</li>
                      </ul>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('ahpType', 'fuzzy')}
                  className={`p-6 rounded-lg border-2 transition-colors ${
                    formData.ahpType === 'fuzzy'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900 mb-1">🔮 퍼지 AHP</div>
                    <div className="text-sm text-gray-600">
                      불확실성을 고려한 분석
                      <ul className="mt-1 text-xs space-y-1">
                        <li>• 삼각 퍼지수 활용</li>
                        <li>• 불확실성 범위 표현</li>
                        <li>• 민감도 분석 강화</li>
                      </ul>
                    </div>
                  </div>
                </button>
              </div>
              {formData.ahpType === 'fuzzy' && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700">
                    💡 <strong>퍼지 AHP 추천 상황:</strong> 평가자 간 의견 차이가 크거나, 
                    정성적 기준이 많은 경우, 불확실성이 높은 의사결정 문제에 적합합니다.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <EvaluationModeSelector
                selectedMode={formData.evaluationMode}
                onModeChange={(mode) => handleInputChange('evaluationMode', mode)}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
            <h4 className="font-medium text-blue-900 mb-4">📋 프로젝트 생성 후 진행 단계</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1️⃣ <strong>평가 기준 설정</strong> (기본 3개, 필요시 추가 가능)</li>
              <li>2️⃣ <strong>대안 설정</strong> (기본 3개, 필요시 추가 가능)</li>
              <li>3️⃣ <strong>평가자 배정</strong> (선택사항, 다중 평가자 지원)</li>
              <li>4️⃣ <strong>쌍대비교 평가</strong> ({formData.ahpType === 'general' ? '일반' : '퍼지'} AHP)</li>
              <li>5️⃣ <strong>결과 분석 및 검증</strong> (CR, 가중치, {formData.ahpType === 'fuzzy' ? '불확실성 범위' : '민감도'} 확인)</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                💡 <strong>선택된 분석 유형:</strong> {formData.ahpType === 'general' ? '일반 AHP - 명확한 가중치와 순위 결정' : '퍼지 AHP - 불확실성을 고려한 강건한 분석'}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-6 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              프로젝트 추가
            </Button>
          </div>
        </form>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          프로젝트 추가 성공 시 단계 2로 자동 이동됩니다.
        </p>
      </div>
    </div>
    </>
  );
};

export default ProjectCreation;