import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

export type EvaluationMethod = 'pairwise-practical' | 'direct-input' | 'pairwise-theoretical';
export type ProjectStatus = 'creating' | 'waiting' | 'evaluating' | 'completed';

interface ProjectCreationFormProps {
  onSubmit: (projectData: ProjectFormData) => void;
  onCancel: () => void;
  initialData?: ProjectFormData;
  isEditing?: boolean;
}

export interface ProjectFormData {
  id?: string;
  name: string;
  description: string;
  evaluationMethod: EvaluationMethod;
  status?: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    evaluationMethod: initialData?.evaluationMethod || 'pairwise-practical',
    status: initialData?.status || 'creating'
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '프로젝트 이름을 입력해주세요.';
    } else if (formData.name.length < 3) {
      newErrors.name = '프로젝트 이름은 최소 3자 이상이어야 합니다.';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '프로젝트 설명을 입력해주세요.';
    } else if (formData.description.length < 10) {
      newErrors.description = '프로젝트 설명은 최소 10자 이상이어야 합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        ...formData,
        id: initialData?.id,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? '프로젝트 수정' : '새 프로젝트 생성'}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            프로젝트의 목적과 설명을 명확하게 작성해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            id="project-name"
            label="프로젝트 이름"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            error={errors.name}
            placeholder="예: 우리 회사에 가장 적합한 ERP 시스템 선정"
            required
          />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> 프로젝트 이름은 목적(목표)을 나타낼 수 있도록 구체적이고 명확하게 작성하세요.
            </p>
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
              프로젝트 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="project-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="프로젝트의 배경, 목적, 기대효과 등을 자세히 설명해주세요."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="evaluation-method" className="block text-sm font-medium text-gray-700 mb-1">
              평가 방법 선택 <span className="text-red-500">*</span>
            </label>
            <select
              id="evaluation-method"
              value={formData.evaluationMethod}
              onChange={(e) => handleInputChange('evaluationMethod', e.target.value as EvaluationMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pairwise-practical">쌍대비교-실용 (권장)</option>
              <option value="direct-input">직접입력</option>
              <option value="pairwise-theoretical">쌍대비교-이론</option>
            </select>
            
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {formData.evaluationMethod === 'pairwise-practical' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <strong className="text-green-800">쌍대비교-실용:</strong>
                  <p className="mt-1">필요한 최소한의 쌍대비교를 실시하여 상대적 중요도를 도출합니다.</p>
                  <p className="text-green-700 font-medium">✓ 실무 활용에 가장 적합 (추천)</p>
                </div>
              )}
              
              {formData.evaluationMethod === 'direct-input' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <strong className="text-yellow-800">직접입력:</strong>
                  <p className="mt-1">기존 데이터가 있는 경우 직접 입력하여 중요도를 도출합니다.</p>
                  <p className="text-yellow-700">※ 데이터가 있어도 쌍대비교가 더 적합할 수 있습니다.</p>
                </div>
              )}
              
              {formData.evaluationMethod === 'pairwise-theoretical' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <strong className="text-purple-800">쌍대비교-이론:</strong>
                  <p className="mt-1">이론상 필요한 모든 쌍대비교를 실시하여 상대적 중요도를 도출합니다.</p>
                  <p className="text-purple-700">✓ 논문 작성에 적합</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            {isEditing ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProjectCreationForm;