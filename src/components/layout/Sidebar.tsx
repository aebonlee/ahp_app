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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 슈퍼관리자 메뉴 구조
  const superAdminCategories: MenuCategory[] = [
    {
      id: 'system',
      title: '시스템 관리',
      icon: '🖥️',
      items: [
        { id: 'dashboard', label: '관리자 대시보드', icon: '👑' },
        { id: 'django-admin-integration', label: 'Django 관리자', icon: '🔧' },
        { id: 'system', label: '시스템 정보', icon: '💻' },
        { id: 'monitoring', label: '시스템 모니터링', icon: '⚡' },
        { id: 'database', label: 'DB 관리', icon: '🗄️' },
        { id: 'backup', label: '백업/복원', icon: '💾' }
      ]
    },
    {
      id: 'users',
      title: '사용자 관리',
      icon: '👥',
      items: [
        { id: 'users', label: '사용자 관리', icon: '👤' },
        { id: 'audit', label: '감사 로그', icon: '📝' },
        { id: 'settings', label: '시스템 설정', icon: '⚙️' }
      ]
    },
    {
      id: 'projects',
      title: '프로젝트 관리',
      icon: '📋',
      items: [
        { id: 'projects', label: '전체 프로젝트', icon: '📂' }
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
        { id: 'paper-management', label: '논문 작성' },
        { id: 'workshop-management', label: '워크숍 관리' },
        { id: 'decision-support-system', label: '의사결정 지원' },
        { id: 'user-guide', label: '사용자 가이드' },
        { id: 'personal-settings', label: '개인 설정' }
      ]
    },
    {
      id: 'ai',
      title: 'AI 지원',
      icon: '🤖',
      items: [
        { id: 'ai-paper-assistant', label: 'AI 논문 도우미' },
        { id: 'ai-ahp-methodology', label: 'AHP 방법론' },
        { id: 'ai-fuzzy-methodology', label: '퍼지 AHP' },
        { id: 'ai-paper-generation', label: '논문 작성' },
        { id: 'ai-results-interpretation', label: '결과 해석' },
        { id: 'ai-quality-validation', label: '품질 검증' },
        { id: 'ai-materials-generation', label: '학술 자료' },
        { id: 'ai-chatbot-assistant', label: 'AI 챗봇' }
      ]
    }
  ];

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
    if (userRole === 'super_admin') {
      return superAdminCategories;
    } else if (userRole === 'service_admin' || userRole === 'service_user') {
      if (viewMode === 'evaluator') {
        return evaluatorCategories;
      }
      return serviceAdminCategories;
    } else if (userRole === 'evaluator') {
      return evaluatorCategories;
    }
    return serviceAdminCategories;
  };

  const menuCategories = getMenuCategories();

  const handleItemClick = (itemId: string) => {
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
              ? (viewMode === 'evaluator' ? '개인 관리자 서비스' : '서비스 관리자')
              : userRole === 'service_user'
              ? (viewMode === 'evaluator' ? '개인 관리자 서비스' : '서비스 사용자')
              : '개인 관리자 서비스'
            }
          </h2>
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
                  {category.icon && (category.id === 'basic' || category.id === 'advanced' || category.id === 'ai') && (
                    <span className="mr-2" style={{ fontSize: '1.2rem' }}>
                      {category.icon}
                    </span>
                  )}
                  <span style={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    fontSize: category.id === 'basic' || category.id === 'advanced' || category.id === 'ai' ? '1rem' : '0.85rem',
                    fontWeight: category.id === 'basic' || category.id === 'advanced' || category.id === 'ai' ? 'bold' : 'semibold',
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