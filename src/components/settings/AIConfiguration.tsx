/**
 * AI 설정 컴포넌트
 * OpenAI API 키 설정 및 AI 서비스 구성 관리
 * 향상된 사용자 경험을 위한 풍선도움말과 단계별 가이드 제공
 */

import React, { useState, useEffect } from 'react';
import { initializeAIService } from '../../services/aiService';
import { saveAndInitializeAI, clearAISettings, getCurrentAISettings } from '../../utils/aiInitializer';
import Tooltip from '../common/Tooltip';
import APIKeyGuideModal from './APIKeyGuideModal';
import UIIcon from '../common/UIIcon';

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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showUsageInfo, setShowUsageInfo] = useState(false);

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

  // 가이드에서 API 키 받기
  const handleApiKeyFromGuide = (apiKey: string) => {
    setApiKeys(prev => ({ ...prev, openai: apiKey }));
    setSelectedProvider('openai');
    // 자동으로 검증 시작
    setTimeout(() => {
      validateAPIKey('openai', apiKey);
    }, 500);
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              🤖 AI 서비스 설정
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              AI 기능을 사용하기 위한 API 키를 설정하세요.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Tooltip content="단계별 가이드를 통해 쉽게 API 키를 설정할 수 있습니다">
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <UIIcon emoji="📖" size="sm" />
                <span>설정 가이드</span>
              </button>
            </Tooltip>
            
            <Tooltip content="API 요금, 사용량 한도, 보안 등에 대한 자세한 정보">
              <button
                onClick={() => setShowUsageInfo(!showUsageInfo)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: showUsageInfo ? 'var(--info-primary)' : 'var(--bg-secondary)',
                  color: showUsageInfo ? 'white' : 'var(--text-secondary)'
                }}
              >
                <UIIcon emoji="ℹ️" size="sm" />
                <span>사용 안내</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {getCurrentAISettings().hasApiKey && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--success-pastel)' }}>
            <p style={{ color: 'var(--success-dark)' }}>
              ✅ <strong>ChatGPT API 키가 이미 설정되어 있습니다.</strong> AI 기능이 활성화되었습니다.
            </p>
          </div>
        )}

        {/* 사용 안내 정보 */}
        {showUsageInfo && (
          <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--info-pastel)', borderColor: 'var(--info-primary)' }}>
            <div className="mb-3">
              <h4 className="font-semibold flex items-center space-x-2" style={{ color: 'var(--info-dark)' }}>
                <UIIcon emoji="💡" size="lg" />
                <span>AI 서비스 이용 안내</span>
              </h4>
            </div>
            
            <div className="space-y-3 text-sm" style={{ color: 'var(--info-dark)' }}>
              <div>
                <strong>💰 요금 정보:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• GPT-4: 입력 $0.03/1K토큰, 출력 $0.06/1K토큰</li>
                  <li>• GPT-3.5: 입력 $0.0015/1K토큰, 출력 $0.002/1K토큰</li>
                  <li>• 한 번의 채팅당 평균 $0.01-0.05 예상</li>
                </ul>
              </div>
              
              <div>
                <strong>🔒 보안 및 개인정보:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• API 키는 브라우저 로컬 스토리지에만 저장됩니다</li>
                  <li>• 서버로 전송되지 않으며 사용자만 접근 가능</li>
                  <li>• 대화 내용은 OpenAI 정책에 따라 처리됩니다</li>
                </ul>
              </div>
              
              <div>
                <strong>📊 사용량 관리:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• OpenAI 플랫폼에서 실시간 사용량 확인 가능</li>
                  <li>• 월 사용량 한도 설정 권장 ($10-50)</li>
                  <li>• 과도한 사용 시 자동 알림 설정 가능</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--info-primary)' }}>
              <p className="text-xs" style={{ color: 'var(--info-dark)' }}>
                💁‍♀️ <strong>팁:</strong> 처음 사용하신다면 $5-10 정도의 소액으로 시작해보세요. 
                대부분의 연구 목적으로는 충분합니다.
              </p>
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                API 키
              </label>
              <div className="flex items-center space-x-2">
                <Tooltip content="API 키 형식: sk-proj-로 시작하는 164자 길이의 문자열">
                  <UIIcon emoji="❓" size="sm" className="cursor-help" />
                </Tooltip>
                {!getCurrentAISettings().hasApiKey && (
                  <button
                    onClick={() => setShowGuideModal(true)}
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{ backgroundColor: 'var(--accent-pastel)', color: 'var(--accent-dark)' }}
                  >
                    📖 API 키 발급 방법
                  </button>
                )}
              </div>
            </div>
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
                    borderColor: validationStatus.openai === 'valid' ? 'var(--success-primary)' :
                                 validationStatus.openai === 'invalid' ? 'var(--error-primary)' : 'var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                />
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {validationStatus.openai !== 'none' && (
                    <Tooltip content={
                      validationStatus.openai === 'validating' ? '검증 중...' :
                      validationStatus.openai === 'valid' ? 'API 키가 유효합니다' :
                      'API 키가 유효하지 않습니다. 다시 확인해주세요.'
                    }>
                      <span style={{ color: getValidationColor(validationStatus.openai) }}>
                        {getValidationIcon(validationStatus.openai)}
                      </span>
                    </Tooltip>
                  )}
                </div>
                <Tooltip content={showApiKey.openai ? 'API 키 숨기기' : 'API 키 보기'}>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(prev => ({ ...prev, openai: !prev.openai }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showApiKey.openai ? '🙈' : '👁️'}
                  </button>
                </Tooltip>
              </div>
              <Tooltip content={
                !apiKeys.openai.trim() ? 'API 키를 먼저 입력해주세요' :
                validationStatus.openai === 'validating' ? '검증 중입니다...' :
                'API 키의 유효성을 검증합니다'
              }>
                <button
                  onClick={() => validateAPIKey('openai', apiKeys.openai)}
                  disabled={!apiKeys.openai.trim() || validationStatus.openai === 'validating'}
                  className="px-4 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  {validationStatus.openai === 'validating' ? '검증 중...' : '검증'}
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border" 
               style={{ backgroundColor: 'var(--accent-pastel)', borderColor: 'var(--accent-primary)' }}>
            <div className="flex items-start space-x-3">
              <UIIcon emoji="💡" size="lg" />
              <div className="text-sm space-y-2" style={{ color: 'var(--accent-dark)' }}>
                <p>
                  <strong>API 키 발급:</strong> OpenAI API 키는 <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    OpenAI 플랫폼
                  </a>에서 발급받을 수 있습니다.
                </p>
                <p>
                  <strong>보안:</strong> API 키는 브라우저 로컬 스토리지에만 저장되며, 서버로 전송되지 않습니다.
                </p>
                <p>
                  <strong>비용:</strong> 사용한 만큼만 과금되며, 월 한도 설정을 통해 예산을 관리할 수 있습니다.
                </p>
              </div>
            </div>
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
        <Tooltip content="모든 AI 설정을 삭제하고 초기 상태로 되돌립니다">
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
        </Tooltip>
        
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
          <Tooltip content={
            !apiKeys[selectedProvider].trim() ? 'API 키를 먼저 입력해주세요' :
            validationStatus[selectedProvider] === 'valid' ? 'API 키를 저장하고 AI 기능을 활성화합니다' :
            'API 키 검증을 먼저 완료해주세요'
          }>
            <button
              onClick={handleSave}
              disabled={!apiKeys[selectedProvider].trim()}
              className="px-6 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--success-primary)' }}
            >
              💾 저장
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 설정 가이드 모달 */}
      <APIKeyGuideModal 
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onApiKeyReceived={handleApiKeyFromGuide}
      />
    </div>
  );
};

export default AIConfiguration;