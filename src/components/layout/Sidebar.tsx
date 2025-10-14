import React, { useState } from 'react';
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

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  isAiSubmenu?: boolean;
  onClick?: () => void;
}

interface MenuCategory {
  id: string;
  title: string;
  icon?: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  userRole, 
  viewMode, 
  activeTab, 
  onTabChange, 
  canSwitchModes, 
  onModeSwitch 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic']);
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(() => {
    const storedMode = localStorage.getItem('ahp_super_mode');
    return storedMode === 'true';
  });
  
  // userRole 확인 - 디버깅
  console.log('🔍 === Sidebar Debug ===');
  console.log('🔍 userRole:', userRole);
  console.log('🔍 userRole === "super_admin":', userRole === 'super_admin');
  console.log('🔍 isSuperAdminMode:', isSuperAdminMode);
  
  // localStorage 직접 확인
  const storedUser = localStorage.getItem('ahp_user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    console.log('🔍 localStorage user:', user);
    console.log('🔍 localStorage user.role:', user.role);
    console.log('🔍 localStorage user.email:', user.email);
  }
  console.log('🔍 ==================');

  const toggleCategory = (categoryId: string) => {
    // 모든 주요 카테고리 리스트 (슈퍼 관리자 메뉴 포함)
    const mainCategories = ['basic', 'advanced', 'research', 'ai', 'super-admin'];
    
    // 클릭한 카테고리가 주요 카테고리 중 하나인지 확인
    if (mainCategories.includes(categoryId)) {
      // 이미 열려있는 카테고리를 다시 클릭하면 닫기
      if (expandedCategories.includes(categoryId)) {
        setExpandedCategories([]);
      } else {
        // 다른 주요 카테고리는 모두 닫고, 클릭한 것만 열기
        setExpandedCategories([categoryId]);
      }
    } else {
      // 다른 카테고리들은 기존 토글 방식 유지
      setExpandedCategories(prev => 
        prev.includes(categoryId) 
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId]
      );
    }
  };

  // 슈퍼관리자 메뉴 구조 - 효율적인 시스템 관리 워크플로우
  const superAdminCategories: MenuCategory[] = [
    {
      id: 'basic',
      title: '핵심 시스템 관리',
      items: [
        { id: 'dashboard', label: '시스템 대시보드' },
        { id: 'users', label: '사용자 관리' },
        { id: 'all-projects', label: '전체 프로젝트 관리' },
        { id: 'system-monitoring', label: '실시간 시스템 모니터링' },
        { id: 'system-info', label: '시스템 정보' },
        { id: 'system-settings', label: '시스템 설정' }
      ]
    },
    {
      id: 'advanced', 
      title: '고급 시스템 도구',
      items: [
        { id: 'database', label: '데이터베이스 관리' },
        { id: 'backup', label: '백업 및 복원' },
        { id: 'audit', label: '감사 로그' },
        { id: 'connection-test', label: '연결 테스트' },
        { id: 'django-admin', label: 'Django 관리 콘솔' },
        { id: 'system-reset', label: '시스템 초기화' }
      ]
    },
    {
      id: 'ai',
      title: 'AI 시스템 관리',
      items: [
        { 
          id: 'openai-billing', 
          label: 'OpenAI 빌링 관리',
          onClick: () => window.open('https://platform.openai.com/settings/organization/billing/overview', '_blank')
        }
      ]
    },
    {
      id: 'super-admin',
      title: '관리자 역할 전환',
      items: [
        { id: 'super-admin-dashboard', label: '슈퍼 관리자 전용' },
        { id: 'role-switch-admin', label: '서비스 관리자 모드' },
        { id: 'role-switch-user', label: '서비스 사용자 모드' },
        { id: 'role-switch-evaluator', label: '평가자 모드' }
      ]
    }
  ];

  // 서비스 관리자/사용자 메뉴 구조 - 연구자 워크플로우 최적화
  const serviceAdminCategories: MenuCategory[] = [
    {
      id: 'basic',
      title: '핵심 연구 워크플로우',
      items: [
        { id: 'dashboard', label: '연구자 대시보드' },
        { id: 'my-projects', label: '내 연구 프로젝트' },
        { id: 'project-creation', label: '새 연구 시작' },
        { id: 'model-builder', label: 'AHP 모델 설계' },
        { id: 'evaluator-management', label: '평가자 관리' },
        { id: 'progress-monitoring', label: '데이터 수집 모니터링' },
        { id: 'results-analysis', label: '결과 분석' },
        { id: 'export-reports', label: '연구보고서 출력' }
      ]
    },
    {
      id: 'advanced',
      title: '고급 연구 도구',
      items: [
        { id: 'workshop-management', label: '전문가 워크숍' },
        { id: 'demographic-survey', label: '표본 특성 조사' },
        { id: 'decision-support-system', label: '의사결정 시뮬레이션' },
        { id: 'evaluation-test', label: '평가 도구 검증' },
        { id: 'personal-settings', label: '연구환경 설정' }
      ]
    },
    {
      id: 'research',
      title: '연구 방법론 가이드',
      items: [
        { id: 'ai-ahp-methodology', label: 'AHP 이론 및 절차' },
        { id: 'ai-fuzzy-methodology', label: '퍼지 AHP 방법론' },
        { id: 'researcher-guide', label: '연구자 실무 가이드' },
        { id: 'evaluator-guide', label: '평가자 참여 가이드' },
        { id: 'ai-research-guide', label: 'AI연구 지원 활용 가이드' }
      ]
    },
    {
      id: 'ai',
      title: 'AI 연구 지원',
      items: [
        { id: 'ai-paper-assistant', label: 'AI 논문 작성 도우미' },
        { id: 'ai-results-interpretation', label: '결과 해석 지원' },
        { id: 'ai-quality-validation', label: '연구 품질 검증' },
        { id: 'ai-materials-generation', label: '학술자료 생성' },
        { id: 'ai-chatbot-assistant', label: '연구 상담 챗봇' }
      ]
    }
  ];

  // 슈퍼관리자 메뉴는 이제 개인 관리자 서비스 메뉴에 추가하지 않음
  // 슈퍼 어드민 모드에서만 superAdminCategories를 사용
  
  // 슈퍼관리자가 아닌 경우 관리자 메뉴 추가
  if (userRole === 'service_admin') {
    serviceAdminCategories.push({
      id: 'admin',
      title: '관리 기능',
      items: [
        { id: 'connection-test', label: '연동 테스트' }
      ]
    });
  }
  
  // 임시 역할로 전환된 경우 원래 역할로 돌아가기 버튼 추가
  const tempRole = localStorage.getItem('ahp_temp_role');
  if (tempRole && tempRole !== 'super_admin') {
    serviceAdminCategories.unshift({
      id: 'back-to-super',
      title: '슈퍼관리자로 돌아가기',
      items: [
        { id: 'back-to-super-admin', label: '슈퍼관리자 모드로 복귀' }
      ]
    });
  }

  // 모드 전환 가능한 경우 메뉴 추가
  if (canSwitchModes) {
    serviceAdminCategories.push({
      id: 'mode',
      title: '모드 전환',
      items: [
        { id: 'mode-switch-to-evaluator', label: '평가자 모드로 전환' }
      ]
    });
  }

  // 평가자 메뉴 구조 - 평가 프로세스 중심
  const evaluatorCategories: MenuCategory[] = [
    {
      id: 'evaluation',
      title: '평가 수행',
      items: [
        { id: 'dashboard', label: '평가자 대시보드' },
        { id: 'assigned-projects', label: '참여 연구 프로젝트' },
        { id: 'pairwise-evaluation', label: '쌍대비교 평가' },
        { id: 'direct-evaluation', label: '직접입력 평가' },
        { id: 'consistency-check', label: '일관성 검증' }
      ]
    },
    {
      id: 'history',
      title: '평가 이력',
      items: [
        { id: 'my-evaluations', label: '내 평가 현황' },
        { id: 'evaluation-history', label: '평가 완료 이력' }
      ]
    },
    {
      id: 'support',
      title: '평가 지원',
      items: [
        { id: 'evaluation-guide', label: '평가 참여 가이드' },
        { id: 'evaluator-settings', label: '평가자 설정' }
      ]
    }
  ];

  // 평가자 모드 전환 가능한 경우
  if (canSwitchModes && viewMode === 'evaluator') {
    evaluatorCategories.push({
      id: 'mode',
      title: '모드 전환',
      items: [
        { id: 'mode-switch-to-service', label: '서비스 모드로 전환' }
      ]
    });
  }

  const getMenuCategories = (): MenuCategory[] => {
    // 슈퍼 어드민이고 슈퍼 어드민 모드일 때는 슈퍼 어드민 메뉴만 표시
    if (userRole === 'super_admin' && isSuperAdminMode) {
      return superAdminCategories;
    }
    
    // 평가자 모드
    if (viewMode === 'evaluator') {
      return evaluatorCategories;
    }
    
    // 일반 서비스 메뉴 (슈퍼 어드민도 일반 모드일 때는 서비스 메뉴 표시)
    if (userRole === 'service_user' || userRole === 'service_admin' || userRole === 'super_admin') {
      return serviceAdminCategories;
    }
    
    // 평가자 전용
    if (userRole === 'evaluator') {
      return evaluatorCategories;
    }
    
    return serviceAdminCategories;
  };

  const menuCategories = getMenuCategories();

  const handleItemClick = (itemId: string) => {
    // 메뉴 아이템의 onClick 처리
    const allItems = menuCategories.flatMap(category => category.items);
    const item = allItems.find(item => item.id === itemId);
    if (item?.onClick) {
      item.onClick();
      return;
    }

    // Django 관리자 링크 처리
    if (itemId === 'django-admin') {
      window.open('https://ahp-django-backend.onrender.com/admin/', '_blank');
      return;
    }
    
    // 슈퍼관리자로 복귀
    if (itemId === 'back-to-super-admin') {
      localStorage.removeItem('ahp_temp_role');
      window.location.reload();
      return;
    }
    
    // 슈퍼관리자 역할 전환 처리
    if (userRole === 'super_admin') {
      if (itemId === 'role-switch-admin') {
        // 서비스 관리자 역할로 전환
        if (onModeSwitch) onModeSwitch('service');
        // 실제로는 여기서 사용자 역할도 변경해야 함
        onTabChange('dashboard');
        return;
      } else if (itemId === 'role-switch-user') {
        // 서비스 사용자 역할로 전환  
        if (onModeSwitch) onModeSwitch('service');
        onTabChange('dashboard');
        return;
      } else if (itemId === 'role-switch-evaluator') {
        // 평가자 역할로 전환
        if (onModeSwitch) onModeSwitch('evaluator');
        onTabChange('dashboard');
        return;
      }
    }
    
    // 사이드바 "내 대시보드" 클릭 시 역할별 대시보드로 라우팅
    if (itemId === 'dashboard') {
      const storedUserStr = localStorage.getItem('ahp_user');
      const isSuperMode = localStorage.getItem('ahp_super_mode') === 'true';
      let isAdminEmail = false;
      
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          isAdminEmail = storedUser.email === 'admin@ahp.com';
        } catch (e) {
          console.error('Failed to parse user:', e);
        }
      }
      
      if ((userRole === 'super_admin' || isAdminEmail) && isSuperMode) {
        // 슈퍼 관리자 모드일 때 -> 슈퍼 관리자 대시보드
        onTabChange('super-admin-dashboard');
        return;
      } else if (userRole === 'evaluator') {
        // 평가자 -> 평가자 대시보드
        onTabChange('evaluator-dashboard');
        return;
      } else {
        // 개인 서비스 모드 (서비스 관리자, 서비스 사용자, 개인 모드의 슈퍼 관리자)
        onTabChange('personal-service');
        return;
      }
    }
    
    // 기존 모드 전환 처리
    if (itemId === 'mode-switch-to-evaluator' && onModeSwitch) {
      onModeSwitch('evaluator');
    } else if (itemId === 'mode-switch-to-service' && onModeSwitch) {
      onModeSwitch('service');
    } else {
      onTabChange(itemId);
    }
  };

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
          paddingBottom: 'var(--space-8)' // 하단 여백 추가하여 모든 메뉴가 보이도록
        }}
      >
        {!isCollapsed && (
          <>
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
              {isSuperAdminMode
                ? '시스템 관리 콘솔'
                : userRole === 'super_admin'
                ? 'AHP 연구 플랫폼'
                : userRole === 'service_admin'
                ? 'AHP 연구 플랫폼'
                : userRole === 'service_user'
                ? (viewMode === 'evaluator' ? '평가자 워크스페이스' : 'AHP 연구 플랫폼')
                : userRole === 'evaluator'
                ? '평가자 워크스페이스'
                : 'AHP 연구 플랫폼'
              }
            </h2>
            
          </>
        )}
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {menuCategories.map((category) => (
            <div key={category.id}>
              {/* 카테고리 헤더 */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between text-left transition-luxury"
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: expandedCategories.includes(category.id) ? 'var(--bg-elevated)' : 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--space-3)',
                  border: '1px solid',
                  borderColor: expandedCategories.includes(category.id) ? 'var(--gold-primary)' : 'var(--border-light)',
                  boxShadow: expandedCategories.includes(category.id) ? 'var(--shadow-sm)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!expandedCategories.includes(category.id)) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!expandedCategories.includes(category.id)) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }
                }}
              >
                <div className="flex items-center">
                  <span style={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    fontSize: ['basic', 'advanced', 'research', 'ai', 'super-admin'].includes(category.id) ? '1rem' : '0.85rem',
                    fontWeight: ['basic', 'advanced', 'research', 'ai', 'super-admin'].includes(category.id) ? 'bold' : 'semibold',
                    color: expandedCategories.includes(category.id) ? 'var(--gold-primary)' : 'var(--text-primary)' 
                  }}>
                    {category.title}
                  </span>
                </div>
                <svg 
                  className={`transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`}
                  style={{ width: '16px', height: '16px' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 카테고리 아이템들 */}
              {expandedCategories.includes(category.id) && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  {category.items.map((item) => {
                    const isModeSwitch = item.id.startsWith('mode-switch-');
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className="w-full flex items-center text-left transition-luxury group"
                        style={{
                          padding: 'var(--space-2) var(--space-4)',
                          paddingLeft: 'calc(var(--space-8) + var(--space-4))',
                          borderRadius: 'var(--radius-sm)',
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
                          fontWeight: 'var(--font-weight-medium)',
                          fontSize: 'var(--font-size-sm)',
                          marginBottom: 'var(--space-1)',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = isModeSwitch 
                              ? 'var(--color-warning)' 
                              : 'var(--bg-elevated)';
                            e.currentTarget.style.color = isModeSwitch 
                              ? 'white' 
                              : 'var(--text-primary)';
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
                          }
                        }}
                      >
                        <span style={{ 
                          position: 'absolute', 
                          left: 'var(--space-6)', 
                          color: isActive ? 'white' : 'var(--text-muted)',
                          fontSize: '0.6rem'
                        }}>
                          {category.items.indexOf(item) === category.items.length - 1 ? '└' : '├'}
                        </span>
                        {item.icon && (
                          <span className="mr-2" style={{ fontSize: 'var(--font-size-md)' }}>
                            {item.icon}
                          </span>
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {/* 하단 푸터 영역 */}
      {!isCollapsed && (
        <div 
          className="border-t"
          style={{
            borderColor: 'var(--border-light)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          {/* 슈퍼 어드민 토글 버튼 - 사이드바 하단에 위치 */}
          {(() => {
            const storedUserStr = localStorage.getItem('ahp_user');
            let isAdminEmail = false;
            
            if (storedUserStr) {
              try {
                const storedUserData = JSON.parse(storedUserStr);
                isAdminEmail = storedUserData.email === 'admin@ahp.com' || storedUserData.email?.toLowerCase() === 'admin@ahp.com';
              } catch (e) {
                console.error('Failed to parse user data:', e);
              }
            }
            
            const shouldShowToggle = isAdminEmail || userRole === 'super_admin';
            
            if (!shouldShowToggle) return null;
            
            return (
              <div style={{
                padding: 'var(--space-3)', 
                borderBottom: '1px solid var(--border-light)'
              }}>
                <button
                  onClick={() => {
                    const newMode = !isSuperAdminMode;
                    setIsSuperAdminMode(newMode);
                    localStorage.setItem('ahp_super_mode', newMode.toString());
                    console.log('🔄 토글 버튼 클릭! 새 상태:', newMode);
                  }}
                  className="w-full p-2 rounded-lg transition-all flex items-center justify-center"
                  style={{
                    backgroundColor: isSuperAdminMode ? 'var(--gold-primary)' : 'var(--accent-primary)',
                    color: 'white',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <span>{isSuperAdminMode ? '연구 플랫폼 모드' : '시스템 관리 모드'}</span>
                </button>
              </div>
            );
          })()}
          
          <div className="text-center space-y-2 p-4">
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
                문의하기
              </button>
              <button 
                className="hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                도움말
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;