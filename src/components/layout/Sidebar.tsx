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
  
  // 디버깅: userRole 확인 - v3
  console.log('🔍 === Sidebar Debug v3 ===');
  console.log('🔍 userRole received:', userRole);
  console.log('🔍 userRole type:', typeof userRole);
  console.log('🔍 Is super_admin?:', userRole === 'super_admin');
  console.log('🔍 Is service_admin?:', userRole === 'service_admin');
  console.log('🔍 Should show super button?:', userRole === 'super_admin' || userRole === 'service_admin');
  console.log('🔍 isCollapsed:', isCollapsed);
  console.log('🔍 viewMode:', viewMode);
  console.log('🔍 timestamp:', new Date().toISOString());
  console.log('🔍 ===================')

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

  // 슈퍼관리자 메뉴 구조 - 서비스 메뉴와 동일하게 기본/고급/AI로 구분
  const superAdminCategories: MenuCategory[] = [
    {
      id: 'basic',
      title: '기본 기능',
      icon: '📌',
      items: [
        { id: 'dashboard', label: '관리자 대시보드' },
        { id: 'users', label: '사용자 관리' },
        { id: 'projects', label: '전체 프로젝트' },
        { id: 'system', label: '시스템 정보' },
        { id: 'monitoring', label: '시스템 모니터링' },
        { id: 'settings', label: '시스템 설정' }
      ]
    },
    {
      id: 'advanced', 
      title: '고급 기능',
      icon: '🚀',
      items: [
        { id: 'database', label: 'DB 관리' },
        { id: 'backup', label: '백업/복원' },
        { id: 'audit', label: '감사 로그' },
        { id: 'connection-test', label: '연결 테스트' },
        { id: 'django-admin', label: 'Django 관리자' },
        { id: 'mode-switch', label: '모드 전환' }
      ]
    },
    {
      id: 'ai',
      title: 'AI 지원',
      icon: '🤖',
      items: [
        { id: 'ai-system-monitor', label: 'AI 시스템 모니터' },
        { id: 'ai-usage-analytics', label: 'AI 사용 분석' },
        { id: 'ai-model-management', label: 'AI 모델 관리' },
        { id: 'ai-training-data', label: '학습 데이터 관리' }
      ]
    },
    {
      id: 'super-admin',
      title: '슈퍼 관리자',
      icon: '👑',
      items: [
        { id: 'super-admin-dashboard', label: '슈퍼 관리자 대시보드' },
        { id: 'role-switch-admin', label: '서비스 관리자로 전환' },
        { id: 'role-switch-user', label: '서비스 사용자로 전환' },
        { id: 'role-switch-evaluator', label: '평가자로 전환' },
        { id: 'system-reset', label: '시스템 초기화' }
      ]
    }
  ];

  // 서비스 관리자/사용자 메뉴 구조
  const serviceAdminCategories: MenuCategory[] = [
    {
      id: 'basic',
      title: '기본 기능',
      icon: '📌',
      items: [
        { id: 'dashboard', label: '내 대시보드' },
        { id: 'my-projects', label: '내 프로젝트' },
        { id: 'project-creation', label: '새 프로젝트' },
        { id: 'model-builder', label: '모델 구축' },
        { id: 'evaluator-management', label: '평가자 관리' },
        { id: 'results-analysis', label: '결과 분석' },
        { id: 'export-reports', label: '보고서 내보내기' }
      ]
    },
    {
      id: 'advanced',
      title: '고급 기능',
      icon: '🚀',
      items: [
        { id: 'demographic-survey', label: '인구통계 설문' },
        { id: 'evaluation-test', label: '평가 테스트' },
        { id: 'progress-monitoring', label: '진행률 모니터링' },
        { id: 'workshop-management', label: '워크숍 관리' },
        { id: 'decision-support-system', label: '의사결정 지원' },
        { id: 'personal-settings', label: '개인 설정' }
      ]
    },
    {
      id: 'research',
      title: '연구 논문을 위한 AHP분석',
      icon: '📚',
      items: [
        { id: 'user-guide', label: '사용자 가이드' },
        { id: 'ai-ahp-methodology', label: 'AHP 방법론' },
        { id: 'ai-fuzzy-methodology', label: '퍼지 AHP' }
      ]
    },
    {
      id: 'ai',
      title: 'AI 지원',
      icon: '🤖',
      items: [
        { id: 'ai-paper-assistant', label: 'AI 논문 도우미' },
        { id: 'ai-results-interpretation', label: '결과 해석' },
        { id: 'ai-quality-validation', label: '품질 검증' },
        { id: 'ai-materials-generation', label: 'AI활용 학술 자료' },
        { id: 'ai-chatbot-assistant', label: 'AI 챗봇' }
      ]
    }
  ];

  // 슈퍼관리자 메뉴 추가 (service_admin 역할일 때)
  if (userRole === 'service_admin' || userRole === 'super_admin') {
    serviceAdminCategories.push({
      id: 'super-admin',
      title: '👑 슈퍼관리자',
      items: [
        { id: 'super-admin-dashboard', label: '슈퍼 관리자 대시보드' },
        { id: 'role-switch-admin', label: '서비스 관리자로 전환' },
        { id: 'role-switch-user', label: '서비스 사용자로 전환' },
        { id: 'role-switch-evaluator', label: '평가자로 전환' },
        { id: 'system-reset', label: '시스템 초기화' }
      ]
    });
  }
  
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
      title: '🌟 슈퍼관리자로 돌아가기',
      items: [
        { id: 'back-to-super-admin', label: '👑 슈퍼관리자 모드로 복귀' }
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

  // 평가자 메뉴 구조
  const evaluatorCategories: MenuCategory[] = [
    {
      id: 'evaluation',
      title: '평가 작업',
      items: [
        { id: 'dashboard', label: '평가자 홈' },
        { id: 'assigned-projects', label: '할당된 프로젝트' },
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
        { id: 'evaluation-history', label: '평가 이력' }
      ]
    },
    {
      id: 'support',
      title: '지원',
      items: [
        { id: 'evaluation-guide', label: '평가 가이드' },
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
    console.log('📋 getMenuCategories - userRole:', userRole, 'viewMode:', viewMode);
    
    // super_admin 체크 - 임시로 service_admin도 슈퍼관리자 메뉴 보이도록
    // TODO: 실제 백엔드에서 super_admin 역할이 제대로 전달되면 수정 필요
    const isAdminWithSuperPowers = userRole === 'super_admin' || 
                                   userRole?.toLowerCase() === 'super_admin' ||
                                   userRole === 'service_admin'; // 임시 추가
    
    console.log('🔐 Admin check:', {
      userRole,
      isAdminWithSuperPowers
    });
    
    // 일반 메뉴 보기 모드
    if (userRole === 'service_user') {
      console.log('서비스 사용자 메뉴 로드');
      if (viewMode === 'evaluator') {
        return evaluatorCategories;
      }
      return serviceAdminCategories;
    } else if (userRole === 'evaluator') {
      console.log('평가자 메뉴 로드');
      return evaluatorCategories;
    }
    console.log('기본 메뉴 로드 (fallback)');
    return serviceAdminCategories;
  };

  const menuCategories = getMenuCategories();
  console.log('최종 메뉴 카테고리:', menuCategories.map(c => `${c.id}(${c.title})`));
  console.log('super-admin 카테고리 포함?:', menuCategories.some(c => c.id === 'super-admin'));

  const handleItemClick = (itemId: string) => {
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
              {showSuperAdminMenu
                ? '시스템 관리자'
                : userRole === 'super_admin'
                ? '개인 관리자 서비스'
                : userRole === 'service_admin'
                ? '개인 관리자 서비스'
                : userRole === 'service_user'
                ? (viewMode === 'evaluator' ? '평가자 모드' : '서비스 사용자')
                : userRole === 'evaluator'
                ? '평가자'
                : '개인 관리자 서비스'
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
                  {category.icon && (category.id === 'basic' || category.id === 'advanced' || category.id === 'research' || category.id === 'ai' || category.id === 'super-admin') && (
                    <span className="mr-2" style={{ fontSize: '1.2rem' }}>
                      {category.icon}
                    </span>
                  )}
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