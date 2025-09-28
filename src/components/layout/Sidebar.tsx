import React from 'react';

import type { UserRole } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  userRole: UserRole | null;
  viewMode?: 'service' | 'evaluator';
  activeTab: string;
  onTabChange: (tab: string) => void;
  canSwitchModes?: boolean;
  onModeSwitch?: (mode: 'service' | 'evaluator') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, userRole, viewMode, activeTab, onTabChange, canSwitchModes, onModeSwitch }) => {
  const superAdminMenuItems = [
    { id: 'dashboard', label: '시스템 대시보드', icon: '📊' },
    { id: 'users', label: '사용자 관리', icon: '👥' },
    { id: 'projects', label: '전체 프로젝트', icon: '📋' },
    { id: 'monitoring', label: '시스템 모니터링', icon: '⚡' },
    { id: 'database', label: 'DB 관리', icon: '🗄️' },
    { id: 'audit', label: '감사 로그', icon: '📝' },
    { id: 'settings', label: '시스템 설정', icon: '⚙️' },
    { id: 'backup', label: '백업/복원', icon: '💾' },
    { id: 'system', label: '시스템 정보', icon: '🖥️' }
  ];

  const serviceAdminMenuItems = [
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
    
    // AI 논문 지원 시스템 메뉴
    { id: 'ai-paper-assistant', label: '🤖 AI 논문 지원', icon: '🤖', isAiMenu: true },
    { id: 'ai-ahp-methodology', label: '    AHP 방법론 설명', icon: '1️⃣', isAiSubmenu: true },
    { id: 'ai-fuzzy-methodology', label: '    퍼지 AHP 방법론', icon: '2️⃣', isAiSubmenu: true },
    { id: 'ai-paper-generation', label: '    내 프로젝트 논문 작성', icon: '3️⃣', isAiSubmenu: true },
    { id: 'ai-results-interpretation', label: '    AI 결과 분석 & 해석', icon: '4️⃣', isAiSubmenu: true },
    { id: 'ai-quality-validation', label: '    논문 품질 검증', icon: '5️⃣', isAiSubmenu: true },
    { id: 'ai-materials-generation', label: '    학술 자료 생성', icon: '6️⃣', isAiSubmenu: true },
    { id: 'ai-chatbot-assistant', label: '    AI 챗봇 도우미', icon: '7️⃣', isAiSubmenu: true },
    
    { id: 'export-reports', label: '보고서 내보내기', icon: '📤' },
    { id: 'workshop-management', label: '워크숍 관리', icon: '🎯' },
    { id: 'decision-support-system', label: '의사결정 지원', icon: '🧠' },
    { id: 'personal-settings', label: '개인 설정', icon: '⚙️' },
    ...(canSwitchModes ? [{ id: 'mode-switch-to-evaluator', label: '평가자 모드로 전환', icon: '⚖️' }] : [])
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
    { id: 'evaluator-settings', label: '평가자 설정', icon: '⚙️' },
    ...(canSwitchModes ? [{ id: 'mode-switch-to-service', label: '서비스 모드로 전환', icon: '🏠' }] : [])
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
    if (userRole === 'super_admin') {
      return superAdminMenuItems;
    } else if (userRole === 'service_admin' || userRole === 'service_user') {
      // 서비스 사용자는 viewMode에 따라 메뉴 전환
      if (viewMode === 'evaluator') {
        return evaluatorMenuItems;
      }
      return serviceAdminMenuItems;
    } else if (userRole === 'evaluator') {
      return evaluatorMenuItems;
    }
    return serviceAdminMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`fixed left-0 transition-luxury z-40 flex flex-col ${
      isCollapsed ? 'w-16' : ''
    }`}
         style={{
           top: 'var(--header-height)',
           bottom: 0,
           width: isCollapsed ? '4rem' : 'var(--sidebar-width)',
           backgroundColor: 'var(--bg-secondary)',
           borderRight: '1px solid var(--border-light)',
           boxShadow: 'var(--shadow-md)',
           fontFamily: 'Inter, Pretendard, system-ui, sans-serif',
           height: 'calc(100vh - var(--header-height))'
         }}>
      {/* 메뉴 영역 - 스크롤 가능 */}
      <div 
        className="flex-1 scrollbar-luxury overflow-y-auto"
        style={{ 
          padding: 'var(--space-6)',
          paddingBottom: 0
        }}
      >
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
            {userRole === 'super_admin' 
              ? '시스템 관리자'
              : userRole === 'service_admin'
              ? (viewMode === 'evaluator' ? '평가자 모드' : '서비스 관리자')
              : userRole === 'service_user'
              ? (viewMode === 'evaluator' ? '평가자 모드' : '서비스 사용자')
              : '평가자'
            }
          </h2>
        )}
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {menuItems.map((item: any) => {
            const isModeSwitch = item.id.startsWith('mode-switch-');
            const isAiMenu = item.isAiMenu;
            const isAiSubmenu = item.isAiSubmenu;
            const isActive = activeTab === item.id;
            
            const handleClick = () => {
              if (isModeSwitch && onModeSwitch) {
                if (item.id === 'mode-switch-to-evaluator') {
                  onModeSwitch('evaluator');
                } else if (item.id === 'mode-switch-to-service') {
                  onModeSwitch('service');
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
                  padding: isAiSubmenu 
                    ? 'var(--space-2) var(--space-6)' 
                    : 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive 
                    ? 'var(--gold-primary)' 
                    : isAiMenu
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : isAiSubmenu
                    ? 'var(--bg-elevated)'
                    : isModeSwitch 
                    ? 'var(--bg-elevated)' 
                    : 'transparent',
                  color: isActive 
                    ? 'white' 
                    : isAiMenu
                    ? 'white'
                    : isAiSubmenu
                    ? 'var(--accent-primary)'
                    : isModeSwitch 
                    ? 'var(--color-warning)' 
                    : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isActive 
                    ? 'var(--gold-primary)' 
                    : isAiMenu
                    ? '#667eea'
                    : isAiSubmenu
                    ? 'var(--accent-light)'
                    : isModeSwitch 
                    ? 'var(--color-warning)' 
                    : 'transparent',
                  fontWeight: isAiMenu 
                    ? 'var(--font-weight-bold)' 
                    : 'var(--font-weight-medium)',
                  boxShadow: isActive 
                    ? 'var(--shadow-gold)' 
                    : isAiMenu 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                    : 'var(--shadow-xs)',
                  marginLeft: isAiSubmenu ? 'var(--space-4)' : '0',
                  fontSize: isAiSubmenu ? 'var(--font-size-xs)' : 'var(--font-size-sm)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isAiMenu
                      ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                      : isAiSubmenu
                      ? 'var(--accent-light)'
                      : isModeSwitch 
                      ? 'var(--color-warning)' 
                      : 'var(--bg-elevated)';
                    e.currentTarget.style.color = isAiMenu || isAiSubmenu || isModeSwitch 
                      ? 'white' 
                      : 'var(--text-primary)';
                    e.currentTarget.style.boxShadow = isAiMenu 
                      ? '0 6px 16px rgba(102, 126, 234, 0.4)' 
                      : 'var(--shadow-sm)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isAiMenu
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : isAiSubmenu
                      ? 'var(--bg-elevated)'
                      : isModeSwitch 
                      ? 'var(--bg-elevated)' 
                      : 'transparent';
                    e.currentTarget.style.color = isAiMenu
                      ? 'white'
                      : isAiSubmenu
                      ? 'var(--accent-primary)'
                      : isModeSwitch 
                      ? 'var(--color-warning)' 
                      : 'var(--text-secondary)';
                    e.currentTarget.style.boxShadow = isAiMenu 
                      ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                      : 'var(--shadow-xs)';
                  }
                }}
              >
                <span className="text-xl mr-3" style={{ 
                  fontSize: isAiSubmenu ? 'var(--font-size-base)' : 'var(--font-size-lg)',
                  minWidth: isAiSubmenu ? '1.5rem' : '2rem'
                }}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-semibold" 
                        style={{ 
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: isAiSubmenu ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                          fontWeight: isAiMenu 
                            ? 'var(--font-weight-bold)' 
                            : 'var(--font-weight-semibold)'
                        }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* 하단 푸터 영역 */}
      {!isCollapsed && (
        <div 
          className="border-t p-4"
          style={{
            borderColor: 'var(--border-light)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div className="text-center space-y-2">
            <div 
              className="text-xs font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              AHP Research Platform
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              © 2025 All rights reserved
            </div>
            <div className="flex justify-center space-x-3 text-xs">
              <button 
                className="hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                📧 문의하기
              </button>
              <button 
                className="hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                📖 도움말
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;