import React, { useState } from 'react';

interface SystemResetProps {
  onBack: () => void;
  onReset: (options: ResetOptions) => void;
}

interface ResetOptions {
  users: boolean;
  projects: boolean;
  evaluations: boolean;
  settings: boolean;
  logs: boolean;
  cache: boolean;
}

const SystemReset: React.FC<SystemResetProps> = ({ onBack, onReset }) => {
  const [resetOptions, setResetOptions] = useState<ResetOptions>({
    users: false,
    projects: false,
    evaluations: false,
    settings: false,
    logs: false,
    cache: true
  });

  const [confirmStep, setConfirmStep] = useState(0);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');

  const resetItems = [
    { 
      key: 'users', 
      label: '사용자 데이터', 
      icon: '👥',
      description: '모든 사용자 계정 (슈퍼 관리자 제외)',
      danger: true 
    },
    { 
      key: 'projects', 
      label: '프로젝트 데이터', 
      icon: '📋',
      description: '모든 프로젝트 및 관련 설정',
      danger: true 
    },
    { 
      key: 'evaluations', 
      label: '평가 데이터', 
      icon: '⚖️',
      description: '모든 평가 결과 및 분석 데이터',
      danger: true 
    },
    { 
      key: 'settings', 
      label: '시스템 설정', 
      icon: '⚙️',
      description: '사용자 정의 설정 및 구성',
      danger: false 
    },
    { 
      key: 'logs', 
      label: '시스템 로그', 
      icon: '📝',
      description: '모든 활동 로그 및 감사 기록',
      danger: false 
    },
    { 
      key: 'cache', 
      label: '캐시 데이터', 
      icon: '💾',
      description: '임시 파일 및 캐시된 데이터',
      danger: false 
    }
  ];

  const handleToggleOption = (key: keyof ResetOptions) => {
    setResetOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSelectedCount = () => {
    return Object.values(resetOptions).filter(v => v).length;
  };

  const handleStartReset = () => {
    if (getSelectedCount() === 0) {
      alert('초기화할 항목을 선택해주세요.');
      return;
    }
    setConfirmStep(1);
  };

  const handleConfirmReset = () => {
    if (confirmText !== 'DELETE') {
      alert('확인 텍스트가 일치하지 않습니다.');
      return;
    }
    setConfirmStep(2);
  };

  const handleFinalReset = () => {
    // 개발 환경에서는 임시로 모든 비밀번호 허용
    // TODO: 실제 배포 시 백엔드 API로 비밀번호 검증
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    
    // 초기화 실행
    onReset(resetOptions);
    alert('시스템 초기화가 시작되었습니다.');
    setConfirmStep(0);
    setConfirmText('');
    setPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            🔄 시스템 초기화
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            시스템 데이터를 선택적으로 초기화할 수 있습니다
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)'
          }}
        >
          ← 돌아가기
        </button>
      </div>

      {/* 경고 배너 */}
      <div className="p-6 rounded-xl bg-red-50 border-2 border-red-200">
        <div className="flex items-start space-x-4">
          <span className="text-4xl">⚠️</span>
          <div>
            <h2 className="text-xl font-bold text-red-900 mb-2">
              매우 위험한 작업입니다!
            </h2>
            <p className="text-red-800">
              시스템 초기화는 선택한 데이터를 완전히 삭제합니다. 
              이 작업은 되돌릴 수 없으며, 모든 관련 데이터가 영구적으로 손실됩니다.
              초기화 전 반드시 백업을 수행하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>

      {confirmStep === 0 ? (
        <>
          {/* 초기화 옵션 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              초기화할 항목 선택
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resetItems.map((item) => (
                <div
                  key={item.key}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    resetOptions[item.key as keyof ResetOptions]
                      ? item.danger 
                        ? 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                  onClick={() => handleToggleOption(item.key as keyof ResetOptions)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={resetOptions[item.key as keyof ResetOptions]}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{item.icon}</span>
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.label}
                        </h4>
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                      {item.danger && (
                        <p className="text-xs mt-2 text-red-600 font-semibold">
                          ⚠️ 복구 불가능
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 요약 */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>선택된 항목</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {getSelectedCount()}개
                </p>
              </div>
              <button
                onClick={handleStartReset}
                disabled={getSelectedCount() === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  getSelectedCount() > 0
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                초기화 시작
              </button>
            </div>
          </div>
        </>
      ) : confirmStep === 1 ? (
        /* 1단계 확인 */
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            1단계: 초기화 확인
          </h3>
          
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">다음 항목들이 초기화됩니다:</h4>
            <ul className="space-y-1">
              {resetItems.filter(item => resetOptions[item.key as keyof ResetOptions]).map((item) => (
                <li key={item.key} className="flex items-center space-x-2 text-sm text-yellow-800">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p style={{ color: 'var(--text-secondary)' }}>
              계속하려면 아래 입력란에 <strong className="text-red-600">DELETE</strong>를 입력하세요:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE 입력"
              className="w-full px-4 py-3 rounded-lg border text-lg font-mono"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: confirmText === 'DELETE' ? 'green' : 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmReset}
                disabled={confirmText !== 'DELETE'}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  confirmText === 'DELETE'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                다음 단계
              </button>
              <button
                onClick={() => {
                  setConfirmStep(0);
                  setConfirmText('');
                }}
                className="px-6 py-3 rounded-lg font-semibold"
                style={{ 
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2단계 - 비밀번호 확인 */
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            2단계: 최종 확인
          </h3>
          
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-300">
            <p className="text-red-900 font-semibold">
              🚨 마지막 경고: 이 작업은 되돌릴 수 없습니다!
            </p>
          </div>

          <div className="space-y-4">
            <p style={{ color: 'var(--text-secondary)' }}>
              초기화를 실행하려면 슈퍼 관리자 비밀번호를 입력하세요:
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-3 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={handleFinalReset}
                className="flex-1 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                🔄 시스템 초기화 실행
              </button>
              <button
                onClick={() => {
                  setConfirmStep(0);
                  setConfirmText('');
                  setPassword('');
                }}
                className="px-6 py-3 rounded-lg font-semibold"
                style={{ 
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemReset;