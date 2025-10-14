/**
 * AI 설정 컴포넌트
 * OpenAI API 키 설정 및 AI 서비스 구성 관리
 */

import React, { useState, useEffect } from 'react';
import { initializeAIService } from '../../services/aiService';
import { saveAndInitializeAI, clearAISettings, getCurrentAISettings } from '../../utils/aiInitializer';

interface AIConfigurationProps {
  onClose?: () => void;
}

const AIConfiguration: React.FC<AIConfigurationProps> = ({ onClose }) => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    claude: ''
  });
  const [validationStatus, setValidationStatus] = useState({
    openai: 'none' as 'none' | 'validating' | 'valid' | 'invalid',
    claude: 'none' as 'none' | 'validating' | 'valid' | 'invalid'
  });
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude'>('openai');
  const [showApiKey, setShowApiKey] = useState({
    openai: false,
    claude: false
  });

  // 컴포넌트 마운트 시 현재 설정 로드
  useEffect(() => {
    const currentSettings = getCurrentAISettings();
    if (currentSettings.hasApiKey) {
      // API 키 마스킹 처리 (보안을 위해 뒷부분만 표시)
      const maskedKey = currentSettings.apiKey ? 
        currentSettings.apiKey.substring(0, 12) + '...' + currentSettings.apiKey.slice(-8) : '';
      
      setApiKeys(prev => ({
        ...prev,
        [currentSettings.provider]: maskedKey
      }));
      setSelectedProvider(currentSettings.provider as 'openai' | 'claude');
      setValidationStatus(prev => ({
        ...prev,
        [currentSettings.provider]: 'valid'
      }));
    }
  }, []);

  // API 키 유효성 검증
  const validateAPIKey = async (provider: 'openai' | 'claude', key: string) => {
    if (!key.trim()) return;

    setValidationStatus(prev => ({ ...prev, [provider]: 'validating' }));

    try {
      if (provider === 'openai') {
        const aiService = initializeAIService(key, 'openai');
        const isValid = await aiService.validateAPIKey();
        setValidationStatus(prev => ({ ...prev, openai: isValid ? 'valid' : 'invalid' }));
      } else {
        // Claude API 검증 로직 (향후 구현)
        setValidationStatus(prev => ({ ...prev, claude: 'invalid' }));
      }
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, [provider]: 'invalid' }));
    }
  };

  // API 키 입력 처리
  const handleApiKeyChange = (provider: 'openai' | 'claude', value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
    setValidationStatus(prev => ({ ...prev, [provider]: 'none' }));
  };

  // 설정 저장
  const handleSave = async () => {
    const currentKey = apiKeys[selectedProvider];
    if (!currentKey.trim()) {
      alert('API 키를 입력해주세요.');
      return;
    }

    try {
      const aiService = saveAndInitializeAI(currentKey, selectedProvider);
      const isValid = await aiService.validateAPIKey();
      
      if (isValid) {
        alert('AI 설정이 저장되었습니다.');
        setValidationStatus(prev => ({ ...prev, [selectedProvider]: 'valid' }));
        if (onClose) onClose();
      } else {
        alert('API 키가 유효하지 않습니다. 다시 확인해주세요.');
        setValidationStatus(prev => ({ ...prev, [selectedProvider]: 'invalid' }));
      }
    } catch (error) {
      alert('설정 저장 중 오류가 발생했습니다.');
      console.error('AI 설정 저장 실패:', error);
    }
  };

  // 설정 초기화
  const handleReset = () => {
    if (window.confirm('AI 설정을 모두 삭제하시겠습니까?')) {
      clearAISettings();
      setApiKeys({ openai: '', claude: '' });
      setValidationStatus({ openai: 'none', claude: 'none' });
      alert('AI 설정이 초기화되었습니다.');
    }
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'validating': return '⏳';
      case 'valid': return '✅';
      case 'invalid': return '❌';
      default: return '⚪';
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'valid': return 'var(--success-primary)';
      case 'invalid': return 'var(--error-primary)';
      case 'validating': return 'var(--warning-primary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          🤖 AI 서비스 설정
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          AI 기능을 사용하기 위한 API 키를 설정하세요.
        </p>
        {getCurrentAISettings().hasApiKey && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--success-pastel)' }}>
            <p style={{ color: 'var(--success-dark)' }}>
              ✅ <strong>ChatGPT API 키가 이미 설정되어 있습니다.</strong> AI 기능이 활성화되었습니다.
            </p>
          </div>
        )}
      </div>

      {/* 제공자 선택 */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          AI 제공자 선택
        </h3>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="provider"
              value="openai"
              checked={selectedProvider === 'openai'}
              onChange={(e) => setSelectedProvider(e.target.value as 'openai')}
              className="w-4 h-4"
            />
            <span style={{ color: 'var(--text-primary)' }}>OpenAI (ChatGPT)</span>
            <span className="text-sm" style={{ color: 'var(--success-primary)' }}>권장</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="provider"
              value="claude"
              checked={selectedProvider === 'claude'}
              onChange={(e) => setSelectedProvider(e.target.value as 'claude')}
              className="w-4 h-4"
              disabled
            />
            <span style={{ color: 'var(--text-muted)' }}>Claude (향후 지원)</span>
          </label>
        </div>
      </div>

      {/* OpenAI 설정 */}
      <div className="mb-6 p-4 rounded-lg border" style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: selectedProvider === 'openai' ? 'var(--accent-primary)' : 'var(--border-light)'
      }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            OpenAI API 설정
          </h3>
          <div className="flex items-center space-x-2">
            <span style={{ color: getValidationColor(validationStatus.openai) }}>
              {getValidationIcon(validationStatus.openai)}
            </span>
            <span className="text-sm" style={{ color: getValidationColor(validationStatus.openai) }}>
              {validationStatus.openai === 'validating' && '검증 중...'}
              {validationStatus.openai === 'valid' && '유효함'}
              {validationStatus.openai === 'invalid' && '유효하지 않음'}
              {validationStatus.openai === 'none' && '미검증'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              API 키
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey.openai ? 'text' : 'password'}
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  placeholder="sk-proj-... 형식의 OpenAI API 키를 입력하세요"
                  className="w-full p-3 border rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(prev => ({ ...prev, openai: !prev.openai }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showApiKey.openai ? '🙈' : '👁️'}
                </button>
              </div>
              <button
                onClick={() => validateAPIKey('openai', apiKeys.openai)}
                disabled={!apiKeys.openai.trim() || validationStatus.openai === 'validating'}
                className="px-4 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                검증
              </button>
            </div>
          </div>

          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>💡 OpenAI API 키는 <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)' }}
            >
              OpenAI 플랫폼
            </a>에서 발급받을 수 있습니다.</p>
            <p>🔒 API 키는 브라우저 로컬 스토리지에 안전하게 저장됩니다.</p>
          </div>
        </div>
      </div>

      {/* Claude 설정 (비활성화) */}
      <div className="mb-6 p-4 rounded-lg border opacity-50" style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-light)'
      }}>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
          Claude API 설정 (향후 지원 예정)
        </h3>
        <input
          type="password"
          placeholder="Claude API 키 (향후 지원)"
          disabled
          className="w-full p-3 border rounded-lg"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-light)',
            color: 'var(--text-muted)'
          }}
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-lg font-medium transition-colors"
          style={{ 
            backgroundColor: 'var(--error-pastel)',
            color: 'var(--error-dark)'
          }}
        >
          🗑️ 설정 초기화
        </button>
        
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              취소
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!apiKeys[selectedProvider].trim()}
            className="px-6 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--success-primary)' }}
          >
            💾 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConfiguration;