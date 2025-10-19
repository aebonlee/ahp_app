/**
 * AI Settings Manager Component
 * AI 서비스 설정 관리 컴포넌트 (API 키, 모델 설정 등)
 */
import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { UIIcon } from '../../common/UIIcon';
import Tooltip from '../../common/Tooltip';

interface AIServiceSettings {
  id: number;
  name: string;
  provider: string;
  provider_display: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  hourly_limit: number;
  daily_limit: number;
  monthly_limit: number;
  system_prompt: string;
  endpoint_url: string;
  is_active: boolean;
  is_default: boolean;
  created_by_username: string;
  user_count: number;
  created_at: string;
  updated_at: string;
}

interface SettingsFormData {
  name: string;
  provider: string;
  api_key: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  hourly_limit: number;
  daily_limit: number;
  monthly_limit: number;
  system_prompt: string;
  endpoint_url: string;
  is_active: boolean;
  is_default: boolean;
}

const AISettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<AIServiceSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSettings, setEditingSettings] = useState<AIServiceSettings | null>(null);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<SettingsFormData>({
    name: '',
    provider: 'openai',
    api_key: '',
    model_name: 'gpt-3.5-turbo',
    max_tokens: 1000,
    temperature: 0.7,
    hourly_limit: 100,
    daily_limit: 1000,
    monthly_limit: 10000,
    system_prompt: '',
    endpoint_url: '',
    is_active: true,
    is_default: false
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';

  const providerOptions = [
    { value: 'openai', label: 'OpenAI', icon: '🤖' },
    { value: 'claude', label: 'Claude (Anthropic)', icon: '🧠' },
    { value: 'gemini', label: 'Google Gemini', icon: '💎' },
    { value: 'azure_openai', label: 'Azure OpenAI', icon: '☁️' }
  ];

  const modelOptions: Record<string, string[]> = {
    openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    claude: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
    gemini: ['gemini-pro', 'gemini-pro-vision'],
    azure_openai: ['gpt-35-turbo', 'gpt-4', 'gpt-4-32k']
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/ai-management/api/settings/`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettings = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/settings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSettings();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create settings:', error);
    }
  };

  const handleUpdateSettings = async () => {
    if (!editingSettings) return;

    try {
      // API 키가 변경되지 않았으면 제거
      const updateData = formData.api_key 
        ? { ...formData }
        : (() => {
            const { api_key, ...dataWithoutApiKey } = formData;
            return dataWithoutApiKey;
          })();

      const response = await fetch(`${apiBaseUrl}/ai-management/api/settings/${editingSettings.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await fetchSettings();
        setEditingSettings(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleDeleteSettings = async (settingsId: number) => {
    if (!window.confirm('정말로 이 AI 설정을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/settings/${settingsId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSettings();
      }
    } catch (error) {
      console.error('Failed to delete settings:', error);
    }
  };

  const handleTestConnection = async (settingsId: number) => {
    try {
      setTestingConnection(settingsId);
      const response = await fetch(`${apiBaseUrl}/ai-management/api/settings/${settingsId}/test_connection/`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('연결 테스트 성공!');
      } else {
        alert(`연결 테스트 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('연결 테스트 중 오류가 발생했습니다.');
    } finally {
      setTestingConnection(null);
    }
  };

  const handleMakeDefault = async (settingsId: number) => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/settings/${settingsId}/make_default/`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchSettings();
      }
    } catch (error) {
      console.error('Failed to make default:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'openai',
      api_key: '',
      model_name: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.7,
      hourly_limit: 100,
      daily_limit: 1000,
      monthly_limit: 10000,
      system_prompt: '',
      endpoint_url: '',
      is_active: true,
      is_default: false
    });
  };

  const openEditModal = (setting: AIServiceSettings) => {
    setEditingSettings(setting);
    setFormData({
      name: setting.name,
      provider: setting.provider,
      api_key: '', // 보안상 빈 값으로 설정
      model_name: setting.model_name,
      max_tokens: setting.max_tokens,
      temperature: setting.temperature,
      hourly_limit: setting.hourly_limit,
      daily_limit: setting.daily_limit,
      monthly_limit: setting.monthly_limit,
      system_prompt: setting.system_prompt,
      endpoint_url: setting.endpoint_url,
      is_active: setting.is_active,
      is_default: setting.is_default
    });
  };

  const getProviderIcon = (provider: string) => {
    const option = providerOptions.find(opt => opt.value === provider);
    return option?.icon || '🤖';
  };

  const renderSettingsCard = (setting: AIServiceSettings) => (
    <Card key={setting.id} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UIIcon emoji={getProviderIcon(setting.provider)} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{setting.name}</h3>
              {setting.is_default && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  기본
                </span>
              )}
              {!setting.is_active && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  비활성
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{setting.provider_display}</p>
            <p className="text-xs text-gray-500">모델: {setting.model_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip content="할당된 사용자 수">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
              <UIIcon emoji="👥" size="sm" />
              <span className="text-sm font-medium">{setting.user_count}</span>
            </div>
          </Tooltip>
          
          <Button
            onClick={() => handleTestConnection(setting.id)}
            variant="outline"
            size="sm"
            disabled={testingConnection === setting.id}
          >
            <UIIcon emoji={testingConnection === setting.id ? "⏳" : "🔍"} />
          </Button>
          
          <Button
            onClick={() => openEditModal(setting)}
            variant="outline"
            size="sm"
          >
            <UIIcon emoji="✏️" />
          </Button>
          
          <Button
            onClick={() => handleDeleteSettings(setting.id)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <UIIcon emoji="🗑️" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">최대 토큰</p>
          <p className="font-semibold">{setting.max_tokens.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">창의성</p>
          <p className="font-semibold">{setting.temperature}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">일간 한도</p>
          <p className="font-semibold">{setting.daily_limit.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">월간 한도</p>
          <p className="font-semibold">{setting.monthly_limit.toLocaleString()}</p>
        </div>
      </div>

      {setting.system_prompt && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">시스템 프롬프트:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
            {setting.system_prompt}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-gray-500">
          생성자: {setting.created_by_username} | 
          생성일: {new Date(setting.created_at).toLocaleDateString()}
        </div>
        
        <div className="flex gap-2">
          {!setting.is_default && (
            <Button
              onClick={() => handleMakeDefault(setting.id)}
              variant="outline"
              size="sm"
              className="text-blue-600"
            >
              기본값 설정
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  const renderSettingsForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">설정 이름</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="메인 OpenAI 설정"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">AI 제공자</label>
          <select
            value={formData.provider}
            onChange={(e) => {
              const provider = e.target.value;
              setFormData(prev => ({ 
                ...prev, 
                provider,
                model_name: modelOptions[provider]?.[0] || ''
              }));
            }}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {providerOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          API 키 {editingSettings && '(변경하려면 입력하세요)'}
        </label>
        <input
          type="password"
          value={formData.api_key}
          onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder={editingSettings ? "새 API 키 (선택사항)" : "API 키를 입력하세요"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">모델</label>
          <select
            value={formData.model_name}
            onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {(modelOptions[formData.provider] || []).map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">최대 토큰</label>
          <input
            type="number"
            value={formData.max_tokens}
            onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            max="4000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">창의성 (Temperature)</label>
          <input
            type="number"
            value={formData.temperature}
            onChange={(e) => setFormData(prev => ({ ...prev, temperature: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            max="2"
            step="0.1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">시간당 한도</label>
          <input
            type="number"
            value={formData.hourly_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, hourly_limit: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">일간 한도</label>
          <input
            type="number"
            value={formData.daily_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, daily_limit: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">월간 한도</label>
          <input
            type="number"
            value={formData.monthly_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, monthly_limit: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">시스템 프롬프트</label>
        <textarea
          value={formData.system_prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="AI가 항상 따라야 할 기본 지침을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">커스텀 엔드포인트 URL</label>
        <input
          type="url"
          value={formData.endpoint_url}
          onChange={(e) => setFormData(prev => ({ ...prev, endpoint_url: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://api.example.com/v1 (선택사항)"
        />
      </div>

      <div className="flex items-center gap-4">
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
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_default"
            checked={formData.is_default}
            onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="is_default" className="text-sm font-medium">
            기본 설정
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <UIIcon emoji="⏳" size="lg" />
        <span className="ml-2">AI 설정 정보를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">⚙️ AI 서비스 설정 관리</h2>
          <p className="text-gray-600">AI 모델 및 API 설정을 관리합니다</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <UIIcon emoji="➕" />
          새 설정 추가
        </Button>
      </div>

      {/* AI 설정 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settings.map(renderSettingsCard)}
      </div>

      {/* 설정 생성 모달 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="새 AI 설정 추가"
      >
        <div className="space-y-4">
          {renderSettingsForm()}
          
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
            <Button onClick={handleCreateSettings}>
              생성
            </Button>
          </div>
        </div>
      </Modal>

      {/* 설정 수정 모달 */}
      <Modal
        isOpen={!!editingSettings}
        onClose={() => {
          setEditingSettings(null);
          resetForm();
        }}
        title="AI 설정 수정"
      >
        <div className="space-y-4">
          {renderSettingsForm()}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setEditingSettings(null);
                resetForm();
              }}
              variant="outline"
            >
              취소
            </Button>
            <Button onClick={handleUpdateSettings}>
              수정
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AISettingsManager;