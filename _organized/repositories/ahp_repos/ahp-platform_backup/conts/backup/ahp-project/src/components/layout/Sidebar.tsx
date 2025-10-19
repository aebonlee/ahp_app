import React from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  userRole: 'super_admin' | 'admin' | 'evaluator' | null;
  adminType?: 'super' | 'personal';
  activeTab: string;
  onTabChange: (tab: string) => void;
  canSwitchModes?: boolean;
  onModeSwitch?: (mode: 'super' | 'personal') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, userRole, adminType, activeTab, onTabChange, canSwitchModes, onModeSwitch }) => {
  const superAdminMenuItems = [
    { id: 'dashboard', label: '시스템 대시보드', icon: '📊' },
    { id: 'users', label: '사용자 관리', icon: '👥' },
    { id: 'projects', label: '전체 프로젝트', icon: '📋' },
    { id: 'monitoring', label: '시스템 모니터링', icon: '⚡' },
    { id: 'database', label: 'DB 관리', icon: '🗄️' },
    { id: 'audit', label: '감사 로그', icon: '📝' },
    { id: 'settings', label: '시스템 설정', icon: '⚙️' },
    { id: 'backup', label: '백업/복원', icon: '💾' },
    { id: 'system', label: '시스템 정보', icon: '🖥️' },
    ...(canSwitchModes ? [{ id: 'mode-switch-to-personal', label: '고객 서비스로 전환', icon: '👤' }] : [])
  ];

  const personalServiceMenuItems = [
    { id: 'personal-service', label: '내 대시보드', icon: '🏠' },
    { id: 'user-guide', label: '사용자 가이드', icon: '📚' },
    { id: 'demographic-survey', label: '인구통계학적 설문조사', icon: '📊' },
    { id: 'my-projects', label: '내 프로젝트', icon: '📂' },
    { id: 'project-creation', label: '새 프로젝트', icon: '➕' },
    { id: 'model-builder', label: '모델 구축', icon: '🏗️' },
    { id: 'evaluation-test', label: '평가 테스트', icon: '🧪' },
    { id: 'evaluator-management', label: '평가자 관리', icon: '👥' },
    { id: 'progress-monitoring', label: '진행률 모니터링', icon: '📈' },
    { id: 'results-analysis', label: '결과 분석', icon: '📊' },
    { id: 'paper-management', label: '논문 작성 관리', icon: '📝' },
    { id: 'export-reports', label: '보고서 내보내기', icon: '📤' },
    { id: 'workshop-management', label: '워크숍 관리', icon: '🎯' },
    { id: 'decision-support-system', label: '의사결정 지원', icon: '🧠' },
    { id: 'personal-settings', label: '개인 설정', icon: '⚙️' }
  ];

  const evaluatorMenuItems = [
    { id: 'evaluator-dashboard', label: '평가자 홈', icon: '🏠' },
    { id: 'assigned-projects', label: '할당된 프로젝트', icon: '📋' },
    { id: 'pairwise-evaluation', label: '쌍대비교 평가', icon: '⚖️' },
    { id: 'direct-evaluation', label: '직접입력 평가', icon: '📝' },
    { id: 'my-evaluations', label: '내 평가 현황', icon: '📊' },
    { id: 'evaluation-history', label: '평가 이력', icon: '📜' },
    { id: 'consistency-check', label: '일관성 검증', icon: '✅' },
    { id: 'evaluation-guide', label: '평가 가이드', icon: '📖' },
    { id: 'evaluator-settings', label: '평가자 설정', icon: '⚙️' }
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const viewerMenuItems = [
    { id: 'viewer-dashboard', label: '조회 대시보드', icon: '👁️' },
    { id: 'public-projects', label: '공개 프로젝트', icon: '🌐' },
    { id: 'completed-results', label: '완료된 결과', icon: '✅' },
    { id: 'statistics-view', label: '통계 조회', icon: '📊' },
    { id: 'download-reports', label: '보고서 다운로드', icon: '⬇️' },
    { id: 'help-support', label: '도움말', icon: '❓' }
  ];

  const getMenuItems = () => {
    if (userRole === 'admin') {
      if (adminType === 'super') {
        return superAdminMenuItems;
      } else if (adminType === 'personal') {
        return personalServiceMenuItems;
      } else {
        // 관리자 유형이 선택되지 않은 경우 모드 선택만 표시
        return [{ id: 'admin-type-selection', label: '모드 선택', icon: '🔄' }];
      }
    }
    return evaluatorMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`fixed left-0 h-full transition-luxury z-40 scrollbar-luxury overflow-y-auto ${
      isCollapsed ? 'w-16' : ''
    }`}
         style={{
           top: 'var(--header-height)',
           width: isCollapsed ? '4rem' : 'var(--sidebar-width)',
           backgroundColor: 'var(--bg-secondary)',
           borderRight: '1px solid var(--border-light)',
           boxShadow: 'var(--shadow-md)',
           fontFamily: 'Inter, Pretendard, system-ui, sans-serif',
           minHeight: 'calc(100vh - var(--header-height))'
         }}>
      <div style={{ padding: 'var(--space-6)' }}>
        {!isCollapsed && (
          <h2 className="font-bold mb-6"
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)',
                fontFamily: 'Inter, system-ui, sans-serif',
                borderBottom: '2px solid var(--gold-primary)',
                paddingBottom: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
              }}>
            {userRole === 'admin' 
              ? (adminType === 'super' ? '총괄 관리자' : adminType === 'personal' ? '개인 서비스' : '관리자')
              : '평가자'
            }
          </h2>
        )}
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {menuItems.map((item) => {
            const isModeSwitch = item.id.startsWith('mode-switch-');
            const isActive = activeTab === item.id;
            const handleClick = () => {
              if (isModeSwitch && onModeSwitch) {
                if (item.id === 'mode-switch-to-personal') {
                  onModeSwitch('personal');
                } else if (item.id === 'mode-switch-to-super') {
                  onModeSwitch('super');
                }
              } else {
                onTabChange(item.id);
              }
            };
            
            return (
              <button
                key={item.id}
                onClick={handleClick}
                className="w-full flex items-center text-left transition-luxury group hover:scale-105"
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive 
                    ? 'var(--gold-primary)' 
                    : isModeSwitch 
                    ? 'var(--bg-elevated)' 
                    : 'transparent',
                  color: isActive 
                    ? 'white' 
                    : isModeSwitch 
                    ? 'var(--color-warning)' 
                    : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isActive 
                    ? 'var(--gold-primary)' 
                    : isModeSwitch 
                    ? 'var(--color-warning)' 
                    : 'transparent',
                  fontWeight: 'var(--font-weight-medium)',
                  boxShadow: isActive ? 'var(--shadow-gold)' : 'var(--shadow-xs)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isModeSwitch 
                      ? 'var(--color-warning)' 
                      : 'var(--bg-elevated)';
                    e.currentTarget.style.color = isModeSwitch 
                      ? 'white' 
                      : 'var(--text-primary)';
                    e.currentTarget.style.borderColor = isModeSwitch 
                      ? 'var(--color-warning)' 
                      : 'var(--border-medium)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isModeSwitch 
                      ? 'var(--bg-elevated)' 
                      : 'transparent';
                    e.currentTarget.style.color = isModeSwitch 
                      ? 'var(--color-warning)' 
                      : 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = isModeSwitch 
                      ? 'var(--color-warning)' 
                      : 'transparent';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }
                }}
              >
                <span className="text-xl mr-3" style={{ fontSize: 'var(--font-size-lg)' }}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-semibold" 
                        style={{ 
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)'
                        }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;