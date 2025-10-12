import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon, KeyIcon, CogIcon } from '@heroicons/react/24/outline';
import TwoFactorAuth from '../auth/TwoFactorAuth';
import { twoFactorService, TwoFactorStatus } from '../../services/twoFactorService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface SecuritySettingsProps {
  userEmail: string;
  currentUser?: any;
  onSettingsUpdate?: (settings: any) => void;
}

interface SecurityConfig {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  passwordExpiry: number;
  requireStrongPassword: boolean;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  userEmail,
  currentUser,
  onSettingsUpdate
}) => {
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus>({
    is_enabled: false,
    last_used: null,
    backup_codes_count: 0
  });
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30, // minutes
    ipWhitelist: [],
    passwordExpiry: 90, // days
    requireStrongPassword: true
  });
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState<'setup' | 'manage'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  // Load security settings on component mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    setLoading(true);
    setError('');

    try {
      // Load 2FA status
      const statusResponse = await twoFactorService.getStatus();
      if (statusResponse.success && statusResponse.data) {
        setTwoFactorStatus(statusResponse.data);
        setSecurityConfig(prev => ({
          ...prev,
          twoFactorEnabled: statusResponse.data?.is_enabled || false
        }));
      }

      // Load other security settings (placeholder - would come from user preferences API)
      // const securityResponse = await userApi.getSecuritySettings();
      
    } catch (err: any) {
      console.error('보안 설정 로드 오류:', err);
      setError('보안 설정을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA setup completion
  const handle2FASetup = async (secret: string, backupCodes: string[]) => {
    setLoading(true);
    setError('');

    try {
      console.log('🔧 2FA 설정 완료 처리');
      
      // Update local state
      setTwoFactorStatus(prev => ({
        ...prev,
        is_enabled: true,
        backup_codes_count: backupCodes.length
      }));
      
      setSecurityConfig(prev => ({
        ...prev,
        twoFactorEnabled: true
      }));

      setNewBackupCodes(backupCodes);
      setShowBackupCodes(true);
      setShowTwoFactorModal(false);
      setSuccess('2단계 인증이 성공적으로 설정되었습니다!');
      
      // Notify parent component
      onSettingsUpdate?.({ twoFactorEnabled: true });
      
    } catch (err: any) {
      console.error('2FA 설정 오류:', err);
      setError('2FA 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA disable
  const handle2FADisable = async () => {
    const password = window.prompt('계정 비밀번호를 입력하여 2단계 인증 비활성화를 확인하세요:');
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const disableResponse = await twoFactorService.disable(password);
      
      if (!disableResponse.success) {
        throw new Error(disableResponse.error || '2FA 비활성화에 실패했습니다.');
      }

      setTwoFactorStatus(prev => ({
        ...prev,
        is_enabled: false,
        backup_codes_count: 0
      }));
      
      setSecurityConfig(prev => ({
        ...prev,
        twoFactorEnabled: false
      }));

      setSuccess('2단계 인증이 비활성화되었습니다.');
      
      // Notify parent component
      onSettingsUpdate?.({ twoFactorEnabled: false });
      
    } catch (err: any) {
      console.error('2FA 비활성화 오류:', err);
      setError(err.message || '2FA 비활성화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Generate new backup codes
  const generateNewBackupCodes = async () => {
    const password = window.prompt('새 백업 코드 생성을 위해 계정 비밀번호를 입력하세요:');
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const response = await twoFactorService.generateBackupCodes(password);
      
      if (!response.success) {
        throw new Error(response.error || '백업 코드 생성에 실패했습니다.');
      }

      setNewBackupCodes(response.data!.backup_codes);
      setShowBackupCodes(true);
      setSuccess('새로운 백업 코드가 생성되었습니다.');
      
    } catch (err: any) {
      console.error('백업 코드 생성 오류:', err);
      setError(err.message || '백업 코드 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Update security setting
  const updateSecuritySetting = (key: keyof SecurityConfig, value: any) => {
    setSecurityConfig(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to backend (placeholder)
    onSettingsUpdate?.({ [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">보안 설정</h1>
            <p className="text-gray-600 mt-1">계정 보안을 강화하고 접근을 제어하세요</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <p className="ml-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <p className="ml-2 text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <KeyIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">2단계 인증</h3>
                <p className="text-sm text-gray-600">추가 보안 계층으로 계정을 보호합니다</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {twoFactorStatus.is_enabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  활성화됨
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  비활성화됨
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {twoFactorStatus.is_enabled ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-green-900">2단계 인증이 활성화되어 있습니다</h4>
                    <p className="text-sm text-green-700 mt-1">
                      마지막 사용: {twoFactorStatus.last_used 
                        ? new Date(twoFactorStatus.last_used).toLocaleString('ko-KR') 
                        : '사용 기록 없음'}
                    </p>
                    <p className="text-sm text-green-700">
                      남은 백업 코드: {twoFactorStatus.backup_codes_count}개
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTwoFactorMode('manage');
                        setShowTwoFactorModal(true);
                      }}
                    >
                      관리
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateNewBackupCodes}
                      disabled={loading}
                    >
                      백업 코드 재생성
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="error"
                      onClick={handle2FADisable}
                      disabled={loading}
                    >
                      비활성화
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-yellow-900">2단계 인증을 설정하세요</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      계정 보안을 크게 향상시킬 수 있습니다. 로그인 시 휴대폰 앱에서 생성된 코드가 필요합니다.
                    </p>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={() => {
                      setTwoFactorMode('setup');
                      setShowTwoFactorModal(true);
                    }}
                    disabled={loading}
                  >
                    설정하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Login Security */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <CogIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">로그인 보안</h3>
              <p className="text-sm text-gray-600">로그인 관련 보안 설정을 관리합니다</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Login Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">로그인 알림</h4>
                <p className="text-sm text-gray-600">새로운 기기에서 로그인 시 이메일 알림</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={securityConfig.loginNotifications}
                  onChange={(e) => updateSecuritySetting('loginNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Session Timeout */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">세션 타임아웃</h4>
                <p className="text-sm text-gray-600">비활성 상태에서 자동 로그아웃까지의 시간</p>
              </div>
              <select
                value={securityConfig.sessionTimeout}
                onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15분</option>
                <option value={30}>30분</option>
                <option value={60}>1시간</option>
                <option value={120}>2시간</option>
                <option value={240}>4시간</option>
              </select>
            </div>

            {/* Strong Password Requirement */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium text-gray-900">강력한 비밀번호 요구</h4>
                <p className="text-sm text-gray-600">영문, 숫자, 특수문자를 포함한 8자리 이상</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={securityConfig.requireStrongPassword}
                  onChange={(e) => updateSecuritySetting('requireStrongPassword', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Two-Factor Auth Modal */}
      <Modal
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        title={twoFactorMode === 'setup' ? '2단계 인증 설정' : '2단계 인증 관리'}
        size="lg"
      >
        <TwoFactorAuth
          userEmail={userEmail}
          mode={twoFactorMode}
          onSetupComplete={handle2FASetup}
          onDisable={() => {
            setShowTwoFactorModal(false);
            handle2FADisable();
          }}
          loading={loading}
        />
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        title="백업 코드"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-2">
                <h4 className="text-sm font-medium text-yellow-800">중요!</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  이 백업 코드들을 안전한 곳에 저장하세요. 각 코드는 한 번만 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              {newBackupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  <span className="font-mono text-sm">{code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                const text = newBackupCodes.join('\n');
                navigator.clipboard.writeText(text);
                setSuccess('백업 코드가 클립보드에 복사되었습니다!');
              }}
              className="flex-1"
            >
              복사
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowBackupCodes(false)}
              className="flex-1"
            >
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SecuritySettings;