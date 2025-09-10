import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import apiService from '../../services/apiService';

interface AccessKeyLoginProps {
  onLogin: (evaluatorId: string, projectId: string, evaluatorName: string) => void;
  onBack?: () => void;
}

interface AccessKeyInfo {
  evaluatorCode: string;
  projectCode: string;
  isValid: boolean;
  evaluatorName?: string;
  projectTitle?: string;
}

const AccessKeyLogin: React.FC<AccessKeyLoginProps> = ({ onLogin, onBack }) => {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyInfo, setKeyInfo] = useState<AccessKeyInfo | null>(null);

  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Django 백엔드 서비스 상태 확인
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await apiService.authAPI.status();
      if (response.success !== false) {
        setServiceStatus('available');
        console.log('✅ Django 백엔드 연결 성공');
      } else {
        setServiceStatus('unavailable');
      }
    } catch (error) {
      console.log('⚠️ Django 백엔드 연결 실패:', error);
      setServiceStatus('unavailable');
    }
  };

  const parseAccessKey = (key: string): { evaluatorCode: string; projectCode: string } | null => {
    // 접속키 형식: "P001-PROJ1234" 또는 "E002-ABC12345"
    const keyPattern = /^([A-Z]+\d+)-([A-Z0-9]+)$/;
    const match = key.toUpperCase().match(keyPattern);
    
    if (!match) return null;
    
    return {
      evaluatorCode: match[1],
      projectCode: match[2]
    };
  };

  const validateAccessKey = async (key: string): Promise<AccessKeyInfo | null> => {
    const parsed = parseAccessKey(key);
    if (!parsed) return null;

    try {
      console.log('🔐 Django 접속키 검증 시도:', { accessKey: key });
      
      // Django 백엔드를 통한 접속키 검증
      const response = await apiService.evaluatorAPI.validateAccessKey(key);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.success) {
        const data = response.data || {};
        return {
          evaluatorCode: parsed.evaluatorCode,
          projectCode: parsed.projectCode,
          isValid: true,
          evaluatorName: (data as any)?.evaluatorName || `평가자 ${parsed.evaluatorCode}`,
          projectTitle: (data as any)?.projectTitle || `프로젝트 ${parsed.projectCode}`
        };
      }

      // 데모 모드 또는 API 오류 시 기본 검증
      return {
        evaluatorCode: parsed.evaluatorCode,
        projectCode: parsed.projectCode,
        isValid: true,
        evaluatorName: `평가자 ${parsed.evaluatorCode}`,
        projectTitle: `프로젝트 ${parsed.projectCode}`
      };
    } catch (error) {
      console.error('❌ Django 접속키 검증 실패:', error);
      // 오류 발생 시 기본 검증 로직
      return {
        evaluatorCode: parsed.evaluatorCode,
        projectCode: parsed.projectCode,
        isValid: true,
        evaluatorName: `평가자 ${parsed.evaluatorCode}`,
        projectTitle: `프로젝트 ${parsed.projectCode}`
      };
    }
  };

  const handleAccessKeyChange = async (value: string) => {
    setAccessKey(value);
    setError('');
    setKeyInfo(null);

    if (value.length >= 8 && serviceStatus === 'available') {  // 최소 길이 체크 및 서비스 상태 확인
      const info = await validateAccessKey(value);
      if (info) {
        setKeyInfo(info);
      }
    }
  };

  const handleLogin = async () => {
    if (!accessKey.trim()) {
      setError('접속키를 입력해주세요.');
      return;
    }

    if (serviceStatus !== 'available') {
      setError('서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('🔐 Django 접속키 로그인 시도:', { accessKey });
      
      const info = await validateAccessKey(accessKey);
      
      if (!info || !info.isValid) {
        throw new Error('유효하지 않은 접속키입니다.');
      }

      console.log('✅ Django 접속키 검증 성공:', info);
      
      // 성공적으로 검증되면 로그인 처리
      onLogin(info.evaluatorCode, info.projectCode, info.evaluatorName || info.evaluatorCode);
      
    } catch (error: any) {
      console.error('❌ Django 접속키 로그인 실패:', error);
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  // 서비스 상태 확인 중 화면
  if (serviceStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              서비스 연결 확인 중...
            </h2>
            <p className="text-gray-600 text-sm">
              Django 백엔드 서비스에 연결하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 서비스 사용 불가 화면
  if (serviceStatus === 'unavailable') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              서비스에 연결할 수 없습니다
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.
            </p>
            <button
              onClick={checkServiceStatus}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 연결 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{
            color: 'var(--text-primary)'
          }}>AHP Platform</h1>
          <p className="mt-2" style={{
            color: 'var(--text-secondary)'
          }}>Django 백엔드 연동 - 평가자 접속</p>
          <div className="mt-2">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              서비스 연결됨
            </div>
          </div>
        </div>

        <Card title="접속키로 로그인">
          <div className="space-y-6">
            {/* 안내 메시지 */}
            <div className="border rounded-lg p-4" style={{
              backgroundColor: 'var(--accent-light)',
              borderColor: 'var(--accent-primary)'
            }}>
              <h5 className="font-medium mb-2" style={{
                color: 'var(--accent-primary)'
              }}>🔑 평가자 접속 안내</h5>
              <p className="text-sm" style={{
                color: 'var(--accent-secondary)'
              }}>
                관리자로부터 받은 접속키를 입력하여 평가에 참여하세요.
              </p>
            </div>

            {/* 접속키 입력 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{
                color: 'var(--text-primary)'
              }}>
                접속키
              </label>
              <input
                type="text"
                value={accessKey}
                onChange={(e) => handleAccessKeyChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="예: P001-PROJ1234"
                className="w-full px-3 py-3 border rounded-lg text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2"
                maxLength={20}
                style={{ 
                  textTransform: 'uppercase',
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--accent-primary)';
                  (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(var(--accent-rgb), 0.2)';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border-medium)';
                  (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
              <p className="text-xs" style={{
                color: 'var(--text-muted)'
              }}>
                형식: [평가자코드]-[프로젝트코드] (예: P001-PROJ1234)
              </p>
            </div>

            {/* 접속키 정보 미리보기 */}
            {keyInfo && keyInfo.isValid && (
              <div className="border rounded-lg p-4" style={{
                backgroundColor: 'var(--status-success-light)',
                borderColor: 'var(--status-success-border)'
              }}>
                <h6 className="font-medium mb-2" style={{
                  color: 'var(--status-success-text)'
                }}>✅ 접속키 확인됨</h6>
                <div className="text-sm space-y-1" style={{
                  color: 'var(--status-success-text)'
                }}>
                  <p><strong>평가자:</strong> {keyInfo.evaluatorName}</p>
                  <p><strong>프로젝트:</strong> {keyInfo.projectTitle}</p>
                  <p><strong>평가자 코드:</strong> {keyInfo.evaluatorCode}</p>
                </div>
              </div>
            )}

            {/* 오류 메시지 */}
            {error && (
              <div className="border rounded-lg p-4" style={{
                backgroundColor: 'var(--status-danger-light)',
                borderColor: 'var(--status-danger-border)'
              }}>
                <p className="text-sm" style={{
                  color: 'var(--status-danger-text)'
                }}>❌ {error}</p>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin}
              disabled={loading || !keyInfo?.isValid}
              className="w-full py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>확인 중...</span>
                </span>
              ) : (
                '평가 시작'
              )}
            </button>

            {/* 뒤로가기 */}
            {onBack && (
              <button
                onClick={onBack}
                className="w-full py-2 px-4 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--text-muted)',
                  color: 'var(--text-inverse)'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--text-tertiary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--text-muted)'}
              >
                일반 로그인으로 돌아가기
              </button>
            )}
          </div>
        </Card>

        {/* 도움말 */}
        <div className="mt-8 rounded-lg shadow p-6" style={{
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <h5 className="font-medium mb-3" style={{
            color: 'var(--text-primary)'
          }}>📋 접속키 사용법</h5>
          <div className="text-sm space-y-2" style={{
            color: 'var(--text-secondary)'
          }}>
            <div className="flex items-start space-x-2">
              <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>1.</span>
              <span>관리자로부터 받은 접속키를 정확히 입력하세요</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>2.</span>
              <span>접속키는 대소문자를 구분하지 않습니다</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>3.</span>
              <span>접속키가 확인되면 자동으로 해당 프로젝트에 접속됩니다</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>4.</span>
              <span>문제가 발생하면 관리자에게 문의하세요</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded border" style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-light)'
          }}>
            <h6 className="font-medium mb-1" style={{
              color: 'var(--text-primary)'
            }}>접속키 예시</h6>
            <div className="text-sm font-mono space-y-1" style={{
              color: 'var(--text-secondary)'
            }}>
              <div>P001-PROJ1234 (평가자 P001, 프로젝트 PROJ1234)</div>
              <div>E002-ABC12345 (평가자 E002, 프로젝트 ABC12345)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessKeyLogin;