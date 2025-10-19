/**
 * Prompt Template Manager Component
 * AI 프롬프트 템플릿 관리 컴포넌트
 */
import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { UIIcon } from '../../common/UIIcon';
import Tooltip from '../../common/Tooltip';

interface PromptTemplate {
  id: number;
  name: string;
  category: string;
  category_display: string;
  description: string;
  template: string;
  variables: Array<{
    name: string;
    description: string;
    required: boolean;
    default?: string;
  }>;
  usage_count: number;
  average_rating: number;
  is_public: boolean;
  is_active: boolean;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  name: string;
  category: string;
  description: string;
  template: string;
  variables: Array<{
    name: string;
    description: string;
    required: boolean;
    default?: string;
  }>;
  is_public: boolean;
  is_active: boolean;
}

const PromptTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    category: 'general',
    description: '',
    template: '',
    variables: [],
    is_public: true,
    is_active: true
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';

  const categoryOptions = [
    { value: 'research', label: '연구 지원', icon: '🔬' },
    { value: 'analysis', label: '분석', icon: '📊' },
    { value: 'writing', label: '작성', icon: '✍️' },
    { value: 'evaluation', label: '평가', icon: '📝' },
    { value: 'general', label: '일반', icon: '💡' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/ai-management/api/templates/`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/templates/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchTemplates();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/templates/${editingTemplate.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchTemplates();
        setEditingTemplate(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/templates/${templateId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleUseTemplate = async (templateId: number) => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/templates/${templateId}/use_template/`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'general',
      description: '',
      template: '',
      variables: [],
      is_public: true,
      is_active: true
    });
  };

  const openEditModal = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      description: template.description,
      template: template.template,
      variables: template.variables,
      is_public: template.is_public,
      is_active: template.is_active
    });
  };

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        { name: '', description: '', required: true, default: '' }
      ]
    }));
  };

  const updateVariable = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const getCategoryIcon = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option?.icon || '💡';
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.template.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderTemplateCard = (template: PromptTemplate) => (
    <Card key={template.id} className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <UIIcon emoji={getCategoryIcon(template.category)} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{template.name}</h4>
              {template.is_public && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  공개
                </span>
              )}
              {!template.is_active && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  비활성
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{template.category_display}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip content="미리보기">
            <Button
              onClick={() => setPreviewTemplate(template)}
              variant="outline"
              size="sm"
            >
              <UIIcon emoji="👁️" />
            </Button>
          </Tooltip>
          
          <Button
            onClick={() => openEditModal(template)}
            variant="outline"
            size="sm"
          >
            <UIIcon emoji="✏️" />
          </Button>
          
          <Button
            onClick={() => handleDeleteTemplate(template.id)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <UIIcon emoji="🗑️" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{template.description}</p>

      <div className="text-xs bg-gray-50 p-2 rounded mb-3 max-h-20 overflow-y-auto">
        {template.template.length > 100 
          ? `${template.template.substring(0, 100)}...`
          : template.template
        }
      </div>

      {template.variables.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">변수:</p>
          <div className="flex flex-wrap gap-1">
            {template.variables.map((variable, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded ${
                  variable.required 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {variable.name}
                {variable.required && '*'}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <UIIcon emoji="📈" size="sm" />
            <span>{template.usage_count}</span>
          </div>
          {template.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <UIIcon emoji="⭐" size="sm" />
              <span>{template.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => handleUseTemplate(template.id)}
          variant="outline"
          size="sm"
          className="text-blue-600"
        >
          <UIIcon emoji="🚀" />
          사용
        </Button>
      </div>
    </Card>
  );

  const renderTemplateForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">템플릿 이름</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="연구 분석 템플릿"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">카테고리</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="이 템플릿의 용도와 특징을 설명하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">프롬프트 템플릿</label>
        <textarea
          value={formData.template}
          onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={6}
          placeholder="당신은 {role}입니다. {task}에 대해 {detail_level} 수준으로 분석해주세요."
        />
        <p className="text-xs text-gray-500 mt-1">
          변수는 {'{'}variable_name{'}'} 형식으로 사용하세요
        </p>
      </div>

      {/* 변수 관리 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">변수 설정</label>
          <Button
            onClick={addVariable}
            variant="outline"
            size="sm"
          >
            <UIIcon emoji="➕" />
            변수 추가
          </Button>
        </div>
        
        {formData.variables.map((variable, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-3 bg-gray-50 rounded">
            <input
              type="text"
              value={variable.name}
              onChange={(e) => updateVariable(index, 'name', e.target.value)}
              placeholder="변수명"
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="text"
              value={variable.description}
              onChange={(e) => updateVariable(index, 'description', e.target.value)}
              placeholder="설명"
              className="px-2 py-1 border rounded text-sm"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={variable.required}
                onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">필수</span>
            </div>
            <Button
              onClick={() => removeVariable(index)}
              variant="outline"
              size="sm"
              className="text-red-600"
            >
              <UIIcon emoji="🗑️" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_public"
            checked={formData.is_public}
            onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="is_public" className="text-sm font-medium">
            공개 템플릿
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            활성 상태
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <UIIcon emoji="⏳" size="lg" />
        <span className="ml-2">템플릿 정보를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">📝 AI 프롬프트 템플릿 관리</h2>
          <p className="text-gray-600">재사용 가능한 AI 프롬프트 템플릿을 관리합니다</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <UIIcon emoji="➕" />
          새 템플릿 추가
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">검색</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름, 설명으로 검색"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              총 {filteredTemplates.length}개의 템플릿
            </div>
          </div>
        </div>
      </Card>

      {/* 템플릿 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(renderTemplateCard)}
      </div>

      {/* 템플릿 생성 모달 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="새 프롬프트 템플릿 추가"
      >
        <div className="space-y-4">
          {renderTemplateForm()}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              variant="outline"
            >
              취소
            </Button>
            <Button onClick={handleCreateTemplate}>
              생성
            </Button>
          </div>
        </div>
      </Modal>

      {/* 템플릿 수정 모달 */}
      <Modal
        isOpen={!!editingTemplate}
        onClose={() => {
          setEditingTemplate(null);
          resetForm();
        }}
        title="프롬프트 템플릿 수정"
      >
        <div className="space-y-4">
          {renderTemplateForm()}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setEditingTemplate(null);
                resetForm();
              }}
              variant="outline"
            >
              취소
            </Button>
            <Button onClick={handleUpdateTemplate}>
              수정
            </Button>
          </div>
        </div>
      </Modal>

      {/* 템플릿 미리보기 모달 */}
      {previewTemplate && (
        <Modal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={`템플릿 미리보기: ${previewTemplate.name}`}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">설명</h4>
              <p className="text-gray-700">{previewTemplate.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">프롬프트 템플릿</h4>
              <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{previewTemplate.template}</pre>
              </div>
            </div>
            
            {previewTemplate.variables.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">변수 목록</h4>
                <div className="space-y-2">
                  {previewTemplate.variables.map((variable, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                        {'{' + variable.name + '}'}
                      </span>
                      <span className="text-gray-600">{variable.description}</span>
                      {variable.required && (
                        <span className="text-red-600 text-xs">필수</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button onClick={() => setPreviewTemplate(null)} variant="outline">
                닫기
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PromptTemplateManager;