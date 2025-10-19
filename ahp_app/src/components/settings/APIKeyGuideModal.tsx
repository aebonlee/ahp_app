/**
 * OpenAI API 키 설정 가이드 모달
 * 사용자가 쉽게 API 키를 발급받고 설정할 수 있도록 단계별 안내 제공
 */

import React, { useState } from 'react';
import UIIcon from '../common/UIIcon';

interface APIKeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyReceived?: (apiKey: string) => void;
}

const APIKeyGuideModal: React.FC<APIKeyGuideModalProps> = ({ 
  isOpen, 
  onClose, 
  onApiKeyReceived 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userApiKey, setUserApiKey] = useState('');

  if (!isOpen) return null;

  const steps = [
    {
      title: '1단계: OpenAI 계정 생성',
      icon: '👤',
      content: (
        <div className="space-y-4">
          <p style={{ color: 'var(--text-primary)' }}>
            OpenAI 플랫폼에 계정을 생성하거나 로그인하세요.
          </p>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center space-x-3 mb-3">
              <UIIcon emoji="🌐" size="lg" />
              <strong style={{ color: 'var(--text-primary)' }}>OpenAI 플랫폼 방문</strong>
            </div>
            <a 
              href="https://platform.openai.com/signup" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <span>OpenAI 가입하기</span>
              <UIIcon emoji="🔗" size="sm" />
            </a>
          </div>
          <div className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <p>💡 <strong>팁:</strong> 이미 ChatGPT 계정이 있다면 동일한 계정으로 로그인할 수 있습니다.</p>
            <p>💳 <strong>주의:</strong> API 사용을 위해 결제 정보 등록이 필요할 수 있습니다.</p>
          </div>
        </div>
      )
    },
    {
      title: '2단계: API 키 발급',
      icon: '🔑',
      content: (
        <div className="space-y-4">
          <p style={{ color: 'var(--text-primary)' }}>
            OpenAI 플랫폼에서 API 키를 생성합니다.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" 
                   style={{ backgroundColor: 'var(--accent-primary)' }}>1</div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  API Keys 페이지로 이동
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  왼쪽 메뉴에서 "API Keys"를 클릭하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" 
                   style={{ backgroundColor: 'var(--accent-primary)' }}>2</div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  새 API 키 생성
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  "Create new secret key" 버튼을 클릭하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold" 
                   style={{ backgroundColor: 'var(--accent-primary)' }}>3</div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  키 복사
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  생성된 키를 안전한 곳에 복사해 두세요. (다시 볼 수 없습니다!)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--warning-pastel)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <UIIcon emoji="⚠️" size="lg" />
              <strong style={{ color: 'var(--warning-dark)' }}>중요한 보안 주의사항</strong>
            </div>
            <ul className="text-sm space-y-1" style={{ color: 'var(--warning-dark)' }}>
              <li>• API 키는 한 번만 표시되므로 안전한 곳에 보관하세요</li>
              <li>• API 키를 다른 사람과 공유하지 마세요</li>
              <li>• GitHub 등 공개 저장소에 업로드하지 마세요</li>
              <li>• 의심스러운 활동이 있다면 즉시 키를 재생성하세요</li>
            </ul>
          </div>

          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <span>API Keys 페이지 열기</span>
            <UIIcon emoji="🔗" size="sm" />
          </a>
        </div>
      )
    },
    {
      title: '3단계: API 키 입력 및 테스트',
      icon: '✅',
      content: (
        <div className="space-y-4">
          <p style={{ color: 'var(--text-primary)' }}>
            발급받은 API 키를 입력하고 정상 작동하는지 확인합니다.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                OpenAI API 키
              </label>
              <div className="space-y-2">
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="sk-proj-... 형식의 API 키를 입력하세요"
                  className="w-full p-3 border rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                />
                <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <p>✓ "sk-proj-"로 시작해야 합니다</p>
                  <p>✓ 전체 길이는 약 164자입니다</p>
                  <p>✓ 영문자, 숫자, 하이픈만 포함됩니다</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--success-pastel)' }}>
              <div className="flex items-center space-x-2 mb-3">
                <UIIcon emoji="💡" size="lg" />
                <strong style={{ color: 'var(--success-dark)' }}>API 키 형식 예시</strong>
              </div>
              <div className="font-mono text-sm p-2 rounded" 
                   style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                sk-proj-abcd1234ef5678gh9012ij3456kl7890mn...
              </div>
            </div>

            {userApiKey && (
              <button
                onClick={() => {
                  if (onApiKeyReceived) {
                    onApiKeyReceived(userApiKey);
                  }
                  onClose();
                }}
                className="w-full py-3 rounded-lg font-medium text-white"
                style={{ backgroundColor: 'var(--success-primary)' }}
              >
                <UIIcon emoji="🚀" size="sm" className="inline mr-2" />
                API 키 설정하고 테스트하기
              </button>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
           style={{ backgroundColor: 'var(--bg-primary)' }}>
        
        {/* 헤더 */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <UIIcon emoji="🤖" size="xl" className="inline mr-3" />
                OpenAI API 키 설정 가이드
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                AI 챗봇 기능을 사용하기 위한 단계별 설정 가이드
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <UIIcon emoji="✕" size="lg" />
            </button>
          </div>

          {/* 진행 바 */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep > index + 1 ? 'text-white' : 
                    currentStep === index + 1 ? 'text-white' : 'text-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: currentStep > index + 1 ? 'var(--success-primary)' :
                                   currentStep === index + 1 ? 'var(--accent-primary)' : 'var(--bg-muted)'
                  }}>
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              {currentStep}/{steps.length} 단계
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="mb-4">
            <h3 className="text-xl font-bold flex items-center space-x-3" 
                style={{ color: 'var(--text-primary)' }}>
              <UIIcon emoji={steps[currentStep - 1].icon} size="xl" />
              <span>{steps[currentStep - 1].title}</span>
            </h3>
          </div>
          
          <div className="min-h-64">
            {steps[currentStep - 1].content}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t flex justify-between" 
             style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
          >
            <UIIcon emoji="←" size="sm" className="inline mr-2" />
            이전
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              나중에 하기
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                className="px-6 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                다음
                <UIIcon emoji="→" size="sm" className="inline ml-2" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: 'var(--success-primary)' }}
              >
                <UIIcon emoji="✅" size="sm" className="inline mr-2" />
                완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeyGuideModal;