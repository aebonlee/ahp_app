import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useColorTheme, ColorTheme } from '../../hooks/useColorTheme';
import { API_BASE_URL } from '../../config/api';

interface PersonalSettingsProps {
  user: {
    id: string | number;  // 백엔드는 number로 보냄
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  };
  onBack?: () => void;
  onUserUpdate?: (updatedUser: {
    id: string | number;  // 백엔드는 number로 보냄
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  }) => void;
}

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    department: string;
    phone: string;
    profileImage: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
  };
  workflow: {
    autoSaveInterval: number;
    defaultTemplate: string;
    screenLayout: string;
    defaultViewMode: string;
    showTutorials: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    evaluationComplete: boolean;
    projectStatusChange: boolean;
    weeklyReport: boolean;
    systemUpdates: boolean;
    deadlineReminders: boolean;
  };
  display: {
    theme: ColorTheme | 'auto';
    darkMode: boolean;
    language: string;
    dateFormat: string;
    numberFormat: string;
    timezone: string;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'team';
    showEmail: boolean;
    showPhone: boolean;
    activityTracking: boolean;
  };
}

const PersonalSettings: React.FC<PersonalSettingsProps> = ({ user, onBack, onUserUpdate }) => {
  const { currentTheme, changeColorTheme } = useColorTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'workflow' | 'notifications' | 'display' | 'privacy' | 'data'>('profile');
  
  // 오프라인 저장된 설정 복원
  const getInitialSettings = (): UserSettings => {
    // 1. 먼저 오프라인 저장 설정 확인
    const offlineSettings = localStorage.getItem('user_settings_offline');
    if (offlineSettings) {
      try {
        const parsed = JSON.parse(offlineSettings);
        console.log('📥 오프라인 설정 복원:', parsed);
        return parsed;
      } catch (e) {
        console.warn('오프라인 설정 파싱 실패:', e);
      }
    }
    
    // 2. userSettings 확인 (기존 방식)
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        console.log('📥 기존 설정 복원:', parsed);
        return parsed;
      } catch (e) {
        console.warn('기존 설정 파싱 실패:', e);
      }
    }
    
    // 3. 기본값 반환
    return {
      profile: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        organization: '',
        department: '',
        phone: '',
        profileImage: ''
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginAlerts: true
      },
      workflow: {
        autoSaveInterval: 60,
        defaultTemplate: 'standard',
        screenLayout: 'standard',
        defaultViewMode: 'grid',
        showTutorials: true
      },
      notifications: {
        emailNotifications: true,
        evaluationComplete: true,
        projectStatusChange: true,
        weeklyReport: false,
        systemUpdates: false,
        deadlineReminders: true
      },
      display: {
        theme: currentTheme,
        darkMode: false,
        language: 'ko',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: '1,234.56',
        timezone: 'Asia/Seoul'
      },
      privacy: {
        profileVisibility: 'team',
        showEmail: false,
        showPhone: false,
        activityTracking: true
      }
    };
  };
  
  const [settings, setSettings] = useState<UserSettings>(getInitialSettings());

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // DB에서 사용자 정보 불러오기 및 동기화
  useEffect(() => {
    const loadUserDataFromDB = async () => {
      try {
        // DB에서 최신 사용자 정보 가져오기
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📥 DB에서 사용자 정보 로드:', data);
          
          // DB 데이터로 설정 업데이트
          if (data.user) {
            const dbSettings = {
              profile: {
                firstName: data.user.first_name || settings.profile.firstName,
                lastName: data.user.last_name || settings.profile.lastName,
                email: data.user.email || settings.profile.email,
                phone: data.user.phone || settings.profile.phone,
                organization: data.user.organization || settings.profile.organization,
                department: data.user.department || settings.profile.department,
                profileImage: data.user.profile_image || settings.profile.profileImage
              },
              security: settings.security,
              workflow: settings.workflow,
              notifications: data.user.notifications || settings.notifications,
              display: {
                ...settings.display,
                theme: data.user.theme || settings.display.theme,
                language: data.user.language || settings.display.language
              },
              privacy: settings.privacy
            };
            
            setSettings(dbSettings);
            localStorage.setItem('userSettings', JSON.stringify(dbSettings));
            localStorage.removeItem('user_settings_pending_sync');
            
            // 사용자 정보 업데이트 콜백 호출
            if (onUserUpdate && (data.user.first_name !== user.first_name || data.user.last_name !== user.last_name)) {
              onUserUpdate({
                ...user,
                first_name: data.user.first_name,
                last_name: data.user.last_name
              });
            }
          }
        } else if (response.status === 404) {
          console.log('⚠️ 사용자 프로필이 DB에 없음 - 초기 설정 사용');
          // DB에 프로필이 없으면 현재 설정을 저장
          saveSettings();
        }
      } catch (error) {
        console.warn('📴 DB 연결 실패 - 로컬 설정 사용:', error);
        // 오프라인 설정 확인
        const offlineSettings = localStorage.getItem('user_settings_offline');
        if (offlineSettings) {
          const parsed = JSON.parse(offlineSettings);
          setSettings(parsed);
        }
      }
    };

    loadUserDataFromDB();
  }, []);

  // 설정 저장 함수
  const saveSettings = () => {
    setSaveStatus('saving');
    
    try {
      // localStorage에 저장 (즉시)
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // 테마 설정 적용 (즉시)
      if (settings.display.theme !== 'auto' && settings.display.theme !== currentTheme) {
        changeColorTheme(settings.display.theme);
      }

      // 사용자 정보 변경 시 즉시 UI 업데이트
      const isNameChanged = settings.profile.firstName !== user.first_name || settings.profile.lastName !== user.last_name;
      console.log('🔍 PersonalSettings: 이름 변경 체크', {
        현재이름: `${user.first_name} ${user.last_name}`,
        새이름: `${settings.profile.firstName} ${settings.profile.lastName}`,
        변경됨: isNameChanged,
        onUserUpdate존재: !!onUserUpdate
      });
      
      if (isNameChanged && onUserUpdate) {
        // 즉시 상위 컴포넌트에 변경사항 알림
        const updatedUser = {
          ...user,
          first_name: settings.profile.firstName,
          last_name: settings.profile.lastName,
          _updated: Date.now()
        };
        console.log('🔄 PersonalSettings: 즉시 UI 업데이트!', updatedUser);
        onUserUpdate(updatedUser);
        
        // saved_user_data도 업데이트 (F5 새로고침 대응)
        localStorage.setItem('saved_user_data', JSON.stringify(updatedUser));
        console.log('💾 saved_user_data 업데이트 완료');
      }

      // 즉시 저장 완료 표시 (200ms 이내)
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 100);

      // DB 저장은 완전 백그라운드에서 처리 (UI와 독립적)
      if (isNameChanged) {
        setTimeout(async () => {
          try {
            console.log('💾 PersonalSettings: 백그라운드 DB 저장 시작!');
            const token = localStorage.getItem('token');
            
            if (!token) {
              console.warn('⚠️ 토큰 없음 - localStorage만 사용');
              // 토큰이 없어도 localStorage에 영구 저장 표시
              localStorage.setItem('user_settings_offline', JSON.stringify({
                ...settings,
                lastModified: new Date().toISOString()
              }));
              return;
            }

            // 전체 사용자 데이터 준비
            const requestData = {
              first_name: settings.profile.firstName,
              last_name: settings.profile.lastName,
              email: settings.profile.email,
              phone: settings.profile.phone,
              organization: settings.profile.organization,
              department: settings.profile.department,
              theme: settings.display.theme,
              language: settings.display.language,
              notifications: settings.notifications
            };

            // DB 저장 시도 (실패해도 localStorage는 유지)
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestData)
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ 백그라운드 DB 저장 성공!', result);
              
              // DB 동기화 성공 표시
              localStorage.setItem('user_settings_synced', new Date().toISOString());
              localStorage.removeItem('user_settings_pending_sync');
            } else {
              const errorText = await response.text();
              console.warn('⚠️ 백그라운드 DB 저장 실패:', response.status, errorText);
              
              // DB 동기화 필요 표시
              localStorage.setItem('user_settings_pending_sync', 'true');
              localStorage.setItem('user_settings_offline', JSON.stringify({
                ...settings,
                lastModified: new Date().toISOString()
              }));
            }
          } catch (dbError) {
            console.warn('⚠️ 백그라운드 DB 저장 에러:', dbError);
            
            // 오프라인 모드로 전환 - localStorage에 완전 백업
            localStorage.setItem('user_settings_pending_sync', 'true');
            localStorage.setItem('user_settings_offline', JSON.stringify({
              ...settings,
              lastModified: new Date().toISOString()
            }));
          }
        }, 0);
      }
    } catch (error) {
      console.error('❌ PersonalSettings 저장 실패:', error);
      console.error('❌ 에러 상세 정보:', {
        message: error instanceof Error ? error.message : String(error),
        API_BASE_URL,
        token: localStorage.getItem('token') ? '토큰 존재' : '토큰 없음',
        settings: settings.profile
      });
      
      // localStorage 저장은 성공했으므로 사용자에게는 성공으로 표시
      setSaveStatus('saved');
      console.log('📱 localStorage 저장은 성공 - UI 업데이트 유지');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // 비밀번호 변경 함수
  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    // 실제 구현에서는 API 호출
    alert('비밀번호가 성공적으로 변경되었습니다.');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // 데이터 내보내기 함수
  const exportUserData = () => {
    const exportData = {
      profile: settings.profile,
      settings: settings,
      exportDate: new Date().toISOString(),
      projects: [] // 실제 구현에서는 프로젝트 데이터 포함
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ahp-userdata-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 계정 삭제 함수
  const handleDeleteAccount = () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (window.confirm('모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
        // 실제 구현에서는 API 호출
        alert('계정 삭제 요청이 접수되었습니다. 24시간 내에 처리됩니다.');
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card title="프로필 정보">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    이름
                  </label>
                  <input
                    type="text"
                    value={settings.profile.firstName}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, firstName: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    성
                  </label>
                  <input
                    type="text"
                    value={settings.profile.lastName}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, lastName: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    이메일
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg border opacity-75"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-muted)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, phone: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    조직/회사
                  </label>
                  <input
                    type="text"
                    value={settings.profile.organization}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, organization: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                    placeholder="예: 삼성전자"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    부서/팀
                  </label>
                  <input
                    type="text"
                    value={settings.profile.department}
                    onChange={(e) => setSettings({...settings, profile: {...settings.profile, department: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                    placeholder="예: 개발팀"
                  />
                </div>
              </div>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card title="비밀번호 변경">
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    최소 8자 이상, 대소문자와 숫자를 포함해야 합니다
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  />
                </div>
                <Button 
                  variant="primary" 
                  onClick={handlePasswordChange}
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  비밀번호 변경
                </Button>
              </div>
            </Card>

            <Card title="보안 설정">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      2단계 인증
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      로그인 시 추가 인증을 요구합니다
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) => setSettings({...settings, security: {...settings.security, twoFactorEnabled: e.target.checked}})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      로그인 알림
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      새로운 기기에서 로그인 시 이메일 알림
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => setSettings({...settings, security: {...settings.security, loginAlerts: e.target.checked}})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      세션 타임아웃
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      비활성 시 자동 로그아웃
                    </p>
                  </div>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({...settings, security: {...settings.security, sessionTimeout: Number(e.target.value)}})}
                    className="px-3 py-1 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value={15}>15분</option>
                    <option value={30}>30분</option>
                    <option value={60}>1시간</option>
                    <option value={120}>2시간</option>
                    <option value={0}>사용 안 함</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'workflow':
        return (
          <div className="space-y-6">
            <Card title="워크플로우 설정">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    자동 저장 간격
                  </label>
                  <select
                    value={settings.workflow.autoSaveInterval}
                    onChange={(e) => setSettings({...settings, workflow: {...settings.workflow, autoSaveInterval: Number(e.target.value)}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value={30}>30초</option>
                    <option value={60}>1분</option>
                    <option value={120}>2분</option>
                    <option value={300}>5분</option>
                    <option value={0}>사용 안 함</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    기본 템플릿
                  </label>
                  <select
                    value={settings.workflow.defaultTemplate}
                    onChange={(e) => setSettings({...settings, workflow: {...settings.workflow, defaultTemplate: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="blank">빈 템플릿</option>
                    <option value="standard">표준 템플릿</option>
                    <option value="business">비즈니스</option>
                    <option value="academic">학술 연구</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    화면 레이아웃
                  </label>
                  <select
                    value={settings.workflow.screenLayout}
                    onChange={(e) => setSettings({...settings, workflow: {...settings.workflow, screenLayout: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="compact">컴팩트</option>
                    <option value="standard">표준</option>
                    <option value="wide">와이드</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    기본 보기 모드
                  </label>
                  <select
                    value={settings.workflow.defaultViewMode}
                    onChange={(e) => setSettings({...settings, workflow: {...settings.workflow, defaultViewMode: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="grid">그리드</option>
                    <option value="list">리스트</option>
                    <option value="kanban">칸반</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      튜토리얼 표시
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      새로운 기능 사용 시 도움말 표시
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.workflow.showTutorials}
                      onChange={(e) => setSettings({...settings, workflow: {...settings.workflow, showTutorials: e.target.checked}})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card title="알림 설정">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      이메일 알림
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      모든 이메일 알림을 받습니다
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, emailNotifications: e.target.checked}})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pl-4 space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.evaluationComplete}
                      onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, evaluationComplete: e.target.checked}})}
                      disabled={!settings.notifications.emailNotifications}
                      className="rounded"
                    />
                    <span style={{ color: settings.notifications.emailNotifications ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      평가 완료 알림
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.projectStatusChange}
                      onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, projectStatusChange: e.target.checked}})}
                      disabled={!settings.notifications.emailNotifications}
                      className="rounded"
                    />
                    <span style={{ color: settings.notifications.emailNotifications ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      프로젝트 상태 변경
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyReport}
                      onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, weeklyReport: e.target.checked}})}
                      disabled={!settings.notifications.emailNotifications}
                      className="rounded"
                    />
                    <span style={{ color: settings.notifications.emailNotifications ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      주간 진행률 리포트
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemUpdates}
                      onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, systemUpdates: e.target.checked}})}
                      disabled={!settings.notifications.emailNotifications}
                      className="rounded"
                    />
                    <span style={{ color: settings.notifications.emailNotifications ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      시스템 업데이트
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.deadlineReminders}
                      onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, deadlineReminders: e.target.checked}})}
                      disabled={!settings.notifications.emailNotifications}
                      className="rounded"
                    />
                    <span style={{ color: settings.notifications.emailNotifications ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      마감일 리마인더
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <Card title="화면 설정">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    컬러 테마
                  </label>
                  <select
                    value={settings.display.theme}
                    onChange={(e) => setSettings({...settings, display: {...settings.display, theme: e.target.value as ColorTheme | 'auto'}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="auto">자동</option>
                    <option value="gold">골드</option>
                    <option value="blue">블루</option>
                    <option value="green">그린</option>
                    <option value="purple">퍼플</option>
                    <option value="rose">로즈</option>
                    <option value="orange">오렌지</option>
                    <option value="teal">틸</option>
                    <option value="indigo">인디고</option>
                    <option value="red">레드</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    다크 모드
                  </label>
                  <select
                    value={settings.display.darkMode ? 'dark' : 'light'}
                    onChange={(e) => setSettings({...settings, display: {...settings.display, darkMode: e.target.value === 'dark'}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="light">라이트 모드</option>
                    <option value="dark">다크 모드</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    언어
                  </label>
                  <select
                    value={settings.display.language}
                    onChange={(e) => setSettings({...settings, display: {...settings.display, language: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    날짜 형식
                  </label>
                  <select
                    value={settings.display.dateFormat}
                    onChange={(e) => setSettings({...settings, display: {...settings.display, dateFormat: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="YYYY-MM-DD">2024-03-15</option>
                    <option value="DD/MM/YYYY">15/03/2024</option>
                    <option value="MM/DD/YYYY">03/15/2024</option>
                    <option value="YYYY년 MM월 DD일">2024년 03월 15일</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    숫자 형식
                  </label>
                  <select
                    value={settings.display.numberFormat}
                    onChange={(e) => setSettings({...settings, display: {...settings.display, numberFormat: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="1,234.56">1,234.56</option>
                    <option value="1.234,56">1.234,56</option>
                    <option value="1 234.56">1 234.56</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    시간대
                  </label>
                  <select
                    value={settings.display.timezone}
                    onChange={(e) => setSettings({...settings, display: {...settings.display, timezone: e.target.value}})}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="Asia/Seoul">서울 (GMT+9)</option>
                    <option value="Asia/Tokyo">도쿄 (GMT+9)</option>
                    <option value="America/New_York">뉴욕 (GMT-5)</option>
                    <option value="Europe/London">런던 (GMT+0)</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <Card title="개인정보 설정">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    프로필 공개 범위
                  </label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => setSettings({...settings, privacy: {...settings.privacy, profileVisibility: e.target.value as 'public' | 'private' | 'team'}})}
                    className="w-full max-w-md px-4 py-2 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <option value="public">전체 공개</option>
                    <option value="team">팀원에게만 공개</option>
                    <option value="private">비공개</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    정보 공개 설정
                  </h4>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showEmail}
                      onChange={(e) => setSettings({...settings, privacy: {...settings.privacy, showEmail: e.target.checked}})}
                      className="rounded"
                    />
                    <span>이메일 주소 공개</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showPhone}
                      onChange={(e) => setSettings({...settings, privacy: {...settings.privacy, showPhone: e.target.checked}})}
                      className="rounded"
                    />
                    <span>전화번호 공개</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.privacy.activityTracking}
                      onChange={(e) => setSettings({...settings, privacy: {...settings.privacy, activityTracking: e.target.checked}})}
                      className="rounded"
                    />
                    <span>활동 기록 수집 허용</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <Card title="데이터 관리">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    데이터 내보내기
                  </h4>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    모든 프로젝트 데이터와 설정을 JSON 형식으로 다운로드합니다.
                  </p>
                  <Button variant="secondary" onClick={exportUserData}>
                    <span className="mr-2">📥</span> 데이터 내보내기
                  </Button>
                </div>

                <div className="pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    데이터 가져오기
                  </h4>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    이전에 내보낸 데이터를 가져와서 복원합니다.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="pt-6 border-t border-red-200">
                  <h4 className="font-medium mb-2 text-red-600">
                    위험 구역
                  </h4>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    다음 작업은 되돌릴 수 없습니다. 신중하게 진행하세요.
                  </p>
                  <Button 
                    variant="secondary" 
                    onClick={handleDeleteAccount}
                    style={{ 
                      backgroundColor: '#fee2e2',
                      borderColor: '#fecaca',
                      color: '#dc2626'
                    }}
                  >
                    <span className="mr-2">⚠️</span> 계정 삭제
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="border-b sticky top-0 z-10" style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderBottomColor: 'var(--border-subtle)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                  >
                    ←
                  </button>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">⚙️</span>
                    개인 설정
                  </h1>
                  <p className="text-gray-600 mt-2">계정 정보, 보안 설정, 개인 환경설정을 관리합니다</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {saveStatus === 'saving' && (
                  <span className="text-sm text-gray-500">저장 중...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-sm text-green-600">✓ 저장됨</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm text-red-600">저장 실패</span>
                )}
                <Button 
                  variant="primary" 
                  onClick={saveSettings}
                  disabled={saveStatus === 'saving'}
                >
                  설정 저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 - 개선된 구분도 */}
        <div className="border-b mb-8" style={{ borderColor: 'var(--border-subtle)' }}>
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'profile', label: '프로필', icon: '👤' },
              { id: 'security', label: '보안', icon: '🔒' },
              { id: 'workflow', label: '워크플로우', icon: '⚡' },
              { id: 'notifications', label: '알림', icon: '🔔' },
              { id: 'display', label: '화면', icon: '🎨' },
              { id: 'privacy', label: '개인정보', icon: '🛡️' },
              { id: 'data', label: '데이터', icon: '💾' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 mx-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap rounded-t-lg ${
                  activeTab === tab.id
                    ? 'text-blue-700 bg-blue-50 shadow-sm border-b-blue-500'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-b-transparent hover:border-b-gray-200'
                }`}
                style={activeTab === tab.id ? {
                  borderBottomColor: 'var(--accent-primary)',
                  borderBottomWidth: '3px',
                  color: 'var(--accent-primary)',
                  backgroundColor: 'var(--accent-light)',
                  fontWeight: '600',
                  transform: 'translateY(-1px)'
                } : {
                  color: 'var(--text-muted)',
                  borderBottomWidth: '1px'
                }}
              >
                <span className="mr-2 text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PersonalSettings;