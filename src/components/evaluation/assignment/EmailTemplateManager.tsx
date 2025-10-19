import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../../services/api';

interface EmailTemplate {
  id: number;
  name: string;
  description: string;
  email_subject: string;
  email_body: string;
  is_default: boolean;
  is_active: boolean;
}

interface EmailTemplateManagerProps {
  projectId: number;
}

const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({ projectId }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/evaluations/templates/');
      setTemplates(response.data.results || response.data);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-xl font-bold mb-4">이메일 템플릿</h2>
          
          <div className="space-y-2">
            {templates.length > 0 ? (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'bg-gradient-to-r from-primary/10 to-tertiary/10 border-primary'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } border`}
                >
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {template.name}
                        {template.is_default && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            기본
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                템플릿이 없습니다.
              </p>
            )}
          </div>

          <button className="mt-4 w-full btn btn-primary">
            새 템플릿 만들기
          </button>
        </div>
      </div>

      {/* Template Preview */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">템플릿 미리보기</h2>
            {selectedTemplate && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-ghost"
              >
                <PencilIcon className="h-5 w-5" />
                편집
              </button>
            )}
          </div>

          {selectedTemplate ? (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedTemplate.email_subject}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    {selectedTemplate.email_subject}
                  </div>
                )}
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문
                </label>
                {isEditing ? (
                  <textarea
                    value={selectedTemplate.email_body}
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {selectedTemplate.email_body}
                  </div>
                )}
              </div>

              {/* Variables Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  사용 가능한 변수
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>• {'{{ evaluator_name }}'} - 평가자 이름</div>
                  <div>• {'{{ project_name }}'} - 프로젝트명</div>
                  <div>• {'{{ deadline }}'} - 평가 마감일</div>
                  <div>• {'{{ evaluation_link }}'} - 평가 링크</div>
                  <div>• {'{{ expiry_date }}'} - 초대 만료일</div>
                  <div>• {'{{ estimated_time }}'} - 예상 소요 시간</div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <button className="btn btn-primary">
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              템플릿을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;