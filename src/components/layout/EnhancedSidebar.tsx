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
  category?: 'basic' | 'advanced' | 'admin' | 'ai';
  children?: MenuItem[];
}

const EnhancedSidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  userRole, 
  viewMode, 
  activeTab, 
  onTabChange, 
  canSwitchModes, 
  onModeSwitch 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic']);
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 서비스 관리자/사용자 메뉴 - 카테고리별 분류
  const serviceMenuStructure = {
    basic: {
      title: '기본 기능',
      items: [
        { id: 'dashboard', label: '대시보드' },
        { id: 'user-guide', label: '사용자 가이드' },
        { id: 'my-projects', label: '내 프로젝트' },
        { id: 'project-creation', label: '새 프로젝트' },
        { id: 'model-builder', label: '모델 구축' },
        { id: 'evaluator-management', label: '평가자 관리' },
        { id: 'results-analysis', label: '결과 분석' },
        { id: 'export-reports', label: '보고서 내보내기' },
      ]
    },
    advanced: {
      title: '고급 기능',
      items: [
        { id: 'demographic-survey', label: '인구통계 설문' },
        { id: 'evaluation-test', label: '평가 테스트' },
        { id: 'progress-monitoring', label: '진행률 모니터링' },
        { id: 'ai-paper-assistant', label: '논문 작성 관리' },
        { id: 'workshop-management', label: '워크샵 관리' },
        { id: 'decision-support-system', label: '의사결정 지원' },
        { id: 'personal-settings', label: '개인 설정' },
      ]
    },
    ai: {
      title: 'AI 지원',
      items: [
        { id: 'ai-paper-assistant', label: 'AI 논문 지원' },
        { id: 'ai-ahp-methodology', label: 'AHP 방법론' },
        { id: 'ai-fuzzy-methodology', label: '퍼지 AHP' },
        { id: 'ai-paper-generation', label: '논문 작성' },
        { id: 'ai-results-interpretation', label: '결과 해석' },
        { id: 'ai-quality-validation', label: '품질 검증' },
        { id: 'ai-chatbot-assistant', label: 'AI 도우미' },
      ]
    }
  };

  // 슈퍼관리자 전용 메뉴
  const adminMenuStructure = {
    admin: {
      title: '관리자 기능',
      items: [
        { id: 'connection-test', label: '연동 테스트' },
        { id: 'django-admin-integration', label: 'Django 관리' },
        { id: 'users', label: '사용자 관리' },
        { id: 'projects', label: '전체 프로젝트' },
        { id: 'monitoring', label: '시스템 모니터링' },
        { id: 'database', label: 'DB 관리' },
        { id: 'audit', label: '감사 로그' },
        { id: 'settings', label: '시스템 설정' },
        { id: 'backup', label: '백업/복원' },
        { id: 'system', label: '시스템 정보' }
      ]
    }
  };

  // 평가자 메뉴
  const evaluatorMenuStructure = {
    evaluator: {
      title: '평가 기능',
      items: [
        { id: 'dashboard', label: '평가자 홈' },
        { id: 'assigned-projects', label: '할당된 프로젝트' },
        { id: 'pairwise-evaluation', label: '쌍대비교 평가' },
        { id: 'direct-evaluation', label: '직접입력 평가' },
        { id: 'my-evaluations', label: '내 평가 현황' },
        { id: 'evaluation-history', label: '평가 이력' },
        { id: 'consistency-check', label: '일관성 검증' },
        { id: 'evaluation-guide', label: '평가 가이드' },
        { id: 'evaluator-settings', label: '평가자 설정' }
      ]
    }
  };

  const getMenuStructure = () => {
    if (userRole === 'super_admin') {
      return { ...serviceMenuStructure, ...adminMenuStructure };
    } else if (userRole === 'service_admin' || userRole === 'service_user') {
      if (viewMode === 'evaluator') {
        return evaluatorMenuStructure;
      }
      // 서비스 관리자는 관리자 기능 중 일부만 표시
      if (userRole === 'service_admin') {
        return {
          ...serviceMenuStructure,
          admin: {
            title: '관리 기능',
            items: [
              { id: 'connection-test', label: '연동 테스트' },
              { id: 'users', label: '사용자 관리' },
              { id: 'monitoring', label: '모니터링' }
            ]
          }
        };
      }
      return serviceMenuStructure;
    } else if (userRole === 'evaluator') {
      return evaluatorMenuStructure;
    }
    return serviceMenuStructure;
  };

  const menuStructure = getMenuStructure();

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const isActive = activeTab === item.id;
    const isModeSwitch = item.id?.startsWith('mode-switch-');
    
    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className="w-full flex items-center text-left transition-all duration-200 group"
        style={{
          padding: `8px ${16 + depth * 16}px`,
          borderRadius: '6px',
          backgroundColor: isActive ? '#3B82F6' : 'transparent',
          color: isActive ? 'white' : '#6B7280',
          fontSize: depth > 0 ? '13px' : '14px',
          fontWeight: isActive ? '600' : '500',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.color = '#111827';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6B7280';
          }
        }}
      >
        {!isCollapsed && (
          <span className="truncate">{item.label}</span>
        )}
      </button>
    );
  };

  const renderCategory = (categoryKey: string, category: any) => {
    const isExpanded = expandedCategories.includes(categoryKey);
    const hasActiveItem = category.items.some((item: MenuItem) => activeTab === item.id);
    
    return (
      <div key={categoryKey} className="mb-2">
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="w-full flex items-center justify-between px-3 py-2 text-left transition-all duration-200 rounded-lg"
          style={{
            backgroundColor: hasActiveItem ? '#EBF5FF' : 'transparent',
            color: hasActiveItem ? '#1D4ED8' : '#374151',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!hasActiveItem) {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
            }
          }}
          onMouseLeave={(e) => {
            if (!hasActiveItem) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span>{category.title}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {category.items.map((item: MenuItem) => renderMenuItem(item, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className={`fixed left-0 transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        top: '60px',
        bottom: 0,
        backgroundColor: 'white',
        borderRight: '1px solid #E5E7EB',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
        height: 'calc(100vh - 60px)'
      }}
    >
      {/* 헤더 */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {userRole === 'super_admin' 
              ? '시스템 관리'
              : userRole === 'service_admin'
              ? (viewMode === 'evaluator' ? '평가자 모드' : '서비스 관리')
              : userRole === 'service_user'
              ? (viewMode === 'evaluator' ? '평가자 모드' : 'AHP 분석')
              : '평가 시스템'
            }
          </h2>
        </div>
      )}
      
      {/* 메뉴 영역 */}
      <div className="flex-1 overflow-y-auto p-3">
        {!isCollapsed ? (
          <nav className="space-y-2">
            {Object.entries(menuStructure).map(([key, category]) => 
              renderCategory(key, category)
            )}
            
            {/* 모드 전환 버튼 */}
            {canSwitchModes && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (onModeSwitch) {
                      onModeSwitch(viewMode === 'evaluator' ? 'service' : 'evaluator');
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
                  style={{
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {viewMode === 'evaluator' ? '서비스 모드로 전환' : '평가자 모드로 전환'}
                </button>
              </div>
            )}
          </nav>
        ) : (
          /* 축소된 상태에서는 아이콘만 표시 */
          <nav className="space-y-2">
            <button 
              onClick={() => onTabChange('dashboard')}
              className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100"
              title="대시보드"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <button 
              onClick={() => onTabChange('my-projects')}
              className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100"
              title="프로젝트"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
          </nav>
        )}
      </div>
      
      {/* 푸터 */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-700">
              AHP Platform
            </div>
            <div className="text-xs text-gray-500 mt-1">
              © 2025
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default EnhancedSidebar;