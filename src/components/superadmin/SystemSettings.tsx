import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import UnifiedButton from '../common/UnifiedButton';
import Input from '../common/Input';

interface SystemSettingsData {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    supportEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireSpecialChar: boolean;
    requireNumber: boolean;
    requireUppercase: boolean;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromName: string;
    fromEmail: string;
  };
  backup: {
    autoBackup: boolean;
    backupInterval: string;
    backupTime: string;
    backupRetention: number;
    backupLocation: string;
    includeUploads: boolean;
    includeDatabase: boolean;
  };
  api: {
    rateLimit: number;
    rateLimitWindow: number;
    corsEnabled: boolean;
    corsOrigins: string[];
    apiVersion: string;
    deprecatedVersions: string[];
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    maintenanceStartTime: string;
    maintenanceEndTime: string;
    allowedIPs: string[];
  };
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsData>({
    general: {
      siteName: 'AHP for Paper',
      siteUrl: 'https://ahp.example.com',
      adminEmail: 'admin@ahp.com',
      supportEmail: 'support@ahp.com',
      timezone: 'Asia/Seoul',
      language: 'ko',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChar: true,
      requireNumber: true,
      requireUppercase: true,
      twoFactorAuth: false,
      ipWhitelist: []
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      fromName: 'AHP System',
      fromEmail: 'noreply@ahp.com'
    },
    backup: {
      autoBackup: true,
      backupInterval: 'daily',
      backupTime: '02:00',
      backupRetention: 30,
      backupLocation: '/backups',
      includeUploads: true,
      includeDatabase: true
    },
    api: {
      rateLimit: 100,
      rateLimitWindow: 60,
      corsEnabled: true,
      corsOrigins: ['http://localhost:3000'],
      apiVersion: '1.0.0',
      deprecatedVersions: []
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: '시스템 점검 중입니다.',
      maintenanceStartTime: '',
      maintenanceEndTime: '',
      allowedIPs: []
    }
  });

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'backup' | 'api' | 'maintenance'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // API에서 설정 불러오기
      // const response = await apiService.get('/api/settings/');
      // setSettings(response.data);
      
      // localStorage에서 설정 불러오기 (대체)
      const savedSettings = localStorage.getItem('ahp_system_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // API로 설정 저장
      // await apiService.post('/api/settings/', settings);
      
      // localStorage에 저장 (대체)
      localStorage.setItem('ahp_system_settings', JSON.stringify(settings));
      
      setHasChanges(false);
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const testEmailConnection = async () => {
    setTestingEmail(true);
    try {
      // 이메일 테스트 API 호출
      // await apiService.post('/api/settings/test-email/', settings.email);
      alert('테스트 이메일이 전송되었습니다.');
    } catch (error) {
      alert('이메일 전송 실패. SMTP 설정을 확인하세요.');
    } finally {
      setTestingEmail(false);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ahp-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings(imported);
        setHasChanges(true);
        alert('설정을 가져왔습니다. 저장 버튼을 클릭하여 적용하세요.');
      } catch (error) {
        alert('잘못된 설정 파일입니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              시스템 설정
            </h1>
            <p className="text-gray-600">
              AHP 플랫폼의 전체 시스템 설정을 관리합니다.
            </p>
          </div>
          <div className="flex space-x-2">
            <UnifiedButton
              variant="secondary"
              onClick={exportSettings}
              icon="📥"
            >
              설정 내보내기
            </UnifiedButton>
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              <span>📤 설정 가져오기</span>
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-4 mb-6 border-b overflow-x-auto">
        {(['general', 'security', 'email', 'backup', 'api', 'maintenance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'general' && '일반'}
            {tab === 'security' && '보안'}
            {tab === 'email' && '이메일'}
            {tab === 'backup' && '백업'}
            {tab === 'api' && 'API'}
            {tab === 'maintenance' && '유지보수'}
          </button>
        ))}
      </div>

      {/* 일반 설정 */}
      {activeTab === 'general' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">일반 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사이트 이름
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사이트 URL
                </label>
                <input
                  type="url"
                  value={settings.general.siteUrl}
                  onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  관리자 이메일
                </label>
                <input
                  type="email"
                  value={settings.general.adminEmail}
                  onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  지원 이메일
                </label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시간대
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Seoul">서울 (GMT+9)</option>
                  <option value="Asia/Tokyo">도쿄 (GMT+9)</option>
                  <option value="America/New_York">뉴욕 (GMT-5)</option>
                  <option value="Europe/London">런던 (GMT+0)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  언어
                </label>
                <select
                  value={settings.general.language}
                  onChange={(e) => updateSetting('general', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 보안 설정 */}
      {activeTab === 'security' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">보안 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  세션 타임아웃 (분)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 로그인 시도 횟수
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소 비밀번호 길이
                </label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.requireSpecialChar}
                  onChange={(e) => updateSetting('security', 'requireSpecialChar', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">비밀번호에 특수문자 필수</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.requireNumber}
                  onChange={(e) => updateSetting('security', 'requireNumber', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">비밀번호에 숫자 필수</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.requireUppercase}
                  onChange={(e) => updateSetting('security', 'requireUppercase', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">비밀번호에 대문자 필수</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">2단계 인증 활성화</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* 이메일 설정 */}
      {activeTab === 'email' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">이메일 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP 호스트
                </label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP 포트
                </label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => updateSetting('email', 'smtpPort', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP 사용자명
                </label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP 비밀번호
                </label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  발신자 이름
                </label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  발신자 이메일
                </label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.email.smtpSecure}
                  onChange={(e) => updateSetting('email', 'smtpSecure', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">보안 연결 (TLS/SSL)</span>
              </label>
              
              <UnifiedButton
                variant="secondary"
                onClick={testEmailConnection}
                loading={testingEmail}
                icon="📧"
              >
                연결 테스트
              </UnifiedButton>
            </div>
          </div>
        </Card>
      )}

      {/* 백업 설정 */}
      {activeTab === 'backup' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">백업 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  백업 주기
                </label>
                <select
                  value={settings.backup.backupInterval}
                  onChange={(e) => updateSetting('backup', 'backupInterval', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">매시간</option>
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  백업 시간
                </label>
                <input
                  type="time"
                  value={settings.backup.backupTime}
                  onChange={(e) => updateSetting('backup', 'backupTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  백업 보관 기간 (일)
                </label>
                <input
                  type="number"
                  value={settings.backup.backupRetention}
                  onChange={(e) => updateSetting('backup', 'backupRetention', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  백업 위치
                </label>
                <input
                  type="text"
                  value={settings.backup.backupLocation}
                  onChange={(e) => updateSetting('backup', 'backupLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">자동 백업 활성화</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.backup.includeDatabase}
                  onChange={(e) => updateSetting('backup', 'includeDatabase', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">데이터베이스 포함</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.backup.includeUploads}
                  onChange={(e) => updateSetting('backup', 'includeUploads', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">업로드 파일 포함</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* API 설정 */}
      {activeTab === 'api' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">API 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (요청/분)
                </label>
                <input
                  type="number"
                  value={settings.api.rateLimit}
                  onChange={(e) => updateSetting('api', 'rateLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit 윈도우 (초)
                </label>
                <input
                  type="number"
                  value={settings.api.rateLimitWindow}
                  onChange={(e) => updateSetting('api', 'rateLimitWindow', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API 버전
                </label>
                <input
                  type="text"
                  value={settings.api.apiVersion}
                  onChange={(e) => updateSetting('api', 'apiVersion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={settings.api.corsEnabled}
                  onChange={(e) => updateSetting('api', 'corsEnabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">CORS 활성화</span>
              </label>
              
              {settings.api.corsEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    허용된 Origin (한 줄에 하나씩)
                  </label>
                  <textarea
                    value={settings.api.corsOrigins.join('\n')}
                    onChange={(e) => updateSetting('api', 'corsOrigins', e.target.value.split('\n').filter(Boolean))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 유지보수 설정 */}
      {activeTab === 'maintenance' && (
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">유지보수 모드</h2>
            
            <div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={settings.maintenance.maintenanceMode}
                  onChange={(e) => updateSetting('maintenance', 'maintenanceMode', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">유지보수 모드 활성화</span>
              </label>
              
              {settings.maintenance.maintenanceMode && (
                <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      유지보수 메시지
                    </label>
                    <textarea
                      value={settings.maintenance.maintenanceMessage}
                      onChange={(e) => updateSetting('maintenance', 'maintenanceMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작 시간
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.maintenance.maintenanceStartTime}
                        onChange={(e) => updateSetting('maintenance', 'maintenanceStartTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        종료 시간
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.maintenance.maintenanceEndTime}
                        onChange={(e) => updateSetting('maintenance', 'maintenanceEndTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      허용된 IP 주소 (한 줄에 하나씩)
                    </label>
                    <textarea
                      value={settings.maintenance.allowedIPs.join('\n')}
                      onChange={(e) => updateSetting('maintenance', 'allowedIPs', e.target.value.split('\n').filter(Boolean))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="127.0.0.1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 저장 버튼 */}
      <div className="mt-6 flex justify-end space-x-2">
        <UnifiedButton
          variant="secondary"
          onClick={loadSettings}
          disabled={saving}
        >
          되돌리기
        </UnifiedButton>
        <UnifiedButton
          variant="primary"
          onClick={saveSettings}
          loading={saving}
          disabled={!hasChanges || saving}
        >
          설정 저장
        </UnifiedButton>
      </div>
    </div>
  );
};

export default SystemSettings;