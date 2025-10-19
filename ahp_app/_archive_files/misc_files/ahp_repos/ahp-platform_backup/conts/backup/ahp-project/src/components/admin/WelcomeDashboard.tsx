import React from 'react';
import UnifiedButton from '../common/UnifiedButton';

interface WelcomeDashboardProps {
  user: {
    first_name: string;
    last_name: string;
    role: 'super_admin' | 'admin' | 'evaluator';
    admin_type?: 'super' | 'personal';
  };
  onGetStarted: () => void;
  onAdminTypeSelect: (type: 'super' | 'personal') => void;
  onNavigate?: (tab: string) => void;
}

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ 
  user, 
  onGetStarted, 
  onAdminTypeSelect,
  onNavigate 
}) => {
  // 시스템 관리자는 모드 선택, 일반 사용자는 바로 서비스 시작
  const isSystemAdmin = user.role === 'super_admin';
  const needsModeSelection = isSystemAdmin && !user.admin_type;
  
  if (needsModeSelection) {
    return (
      <div className="page-container">
        <div className="page-content">
          {/* 헤더 */}
          <div className="page-header">
            <div className="inline-block p-4 rounded-lg shadow-sm" 
                 style={{ 
                   background: 'linear-gradient(135deg, var(--accent-light), var(--bg-elevated))',
                   border: '1px solid var(--accent-primary)'
                 }}>
              <h1 className="page-title">
                환영합니다, {user.first_name} {user.last_name}님! 👋
              </h1>
              <p className="font-medium" style={{ color: 'var(--accent-secondary)' }}>
                관리자 모드를 선택해주세요
              </p>
            </div>
            <p className="page-subtitle mt-4">
              시스템 관리와 고객 서비스 모드 중 선택하세요. 언제든지 전환 가능합니다.
            </p>
          </div>

          {/* 모드 선택 카드 */}
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* 시스템 관리자 모드 */}
            <div className="card-enhanced cursor-pointer group"
                 onClick={() => onAdminTypeSelect('super')}
                 style={{ borderColor: 'var(--accent-primary)' }}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  시스템 관리자
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  전체 시스템 관리, 사용자 관리, 운영 모니터링
                </p>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center space-x-2 justify-center">
                    <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                    <span>전체 사용자 관리</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                    <span>모든 프로젝트 모니터링</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                    <span>시스템 설정 및 성능 관리</span>
                  </div>
                </div>
                <UnifiedButton
                  variant="primary"
                  onClick={() => onAdminTypeSelect('super')}
                  className="w-full"
                >
                  시스템 관리자 시작
                </UnifiedButton>
              </div>
            </div>

            {/* 개인 서비스 모드 */}
            <div className="card-enhanced cursor-pointer group"
                 onClick={() => onAdminTypeSelect('personal')}
                 style={{ borderColor: 'var(--accent-secondary)' }}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}>
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  개인 서비스
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  개인 프로젝트 관리, AHP 분석, 평가자 관리
                </p>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center space-x-2 justify-center">
                    <span style={{ color: 'var(--accent-secondary)' }}>✓</span>
                    <span>개인 프로젝트 생성</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <span style={{ color: 'var(--accent-secondary)' }}>✓</span>
                    <span>AHP 분석 도구</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <span style={{ color: 'var(--accent-secondary)' }}>✓</span>
                    <span>평가자 초대 및 관리</span>
                  </div>
                </div>
                <UnifiedButton
                  variant="secondary"
                  onClick={() => onAdminTypeSelect('personal')}
                  className="w-full"
                >
                  개인 서비스 시작
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 일반 환영 화면 (모드 선택 후)
  return (
    <div className="page-container">
      <div className="page-content">
        {/* 환영 헤더 */}
        <div className="page-header">
          <h1 className="page-title">
            환영합니다, {user.first_name} {user.last_name}님! 🎉
          </h1>
          <p className="page-subtitle">
            {user.role === 'super_admin' ? '시스템 관리자' : 
             user.role === 'admin' ? '관리자' : '평가자'} 권한으로 로그인하셨습니다.
          </p>
        </div>

        {/* 시작하기 버튼 */}
        <div className="text-center space-y-6">
          <div className="inline-block p-8 rounded-lg"
               style={{ background: 'linear-gradient(135deg, var(--accent-light), transparent)' }}>
            <div className="w-24 h-24 mx-auto mb-4 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
              <span className="text-4xl">🚀</span>
            </div>
            <UnifiedButton
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              className="px-8"
            >
              시작하기
            </UnifiedButton>
          </div>
        </div>

        {/* 빠른 링크 */}
        {onNavigate && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
              빠른 접근
            </h3>
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {user.role === 'admin' && user.admin_type === 'personal' && (
                <>
                  <div className="card-enhanced cursor-pointer" onClick={() => onNavigate('project-creation')}>
                    <div className="text-center space-y-2">
                      <span className="text-2xl block">📋</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        새 프로젝트
                      </span>
                    </div>
                  </div>
                  <div className="card-enhanced cursor-pointer" onClick={() => onNavigate('my-projects')}>
                    <div className="text-center space-y-2">
                      <span className="text-2xl block">📊</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        내 프로젝트
                      </span>
                    </div>
                  </div>
                </>
              )}
              {user.role === 'super_admin' && (
                <>
                  <div className="card-enhanced cursor-pointer" onClick={() => onNavigate('users')}>
                    <div className="text-center space-y-2">
                      <span className="text-2xl block">👥</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        사용자 관리
                      </span>
                    </div>
                  </div>
                  <div className="card-enhanced cursor-pointer" onClick={() => onNavigate('monitoring')}>
                    <div className="text-center space-y-2">
                      <span className="text-2xl block">📈</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        시스템 모니터링
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeDashboard;