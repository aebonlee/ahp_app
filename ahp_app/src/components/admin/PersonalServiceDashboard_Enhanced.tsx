/**
 * 개선된 PersonalServiceDashboard - 드롭다운 메뉴 구조
 * 기본기능/고급기능 분류 및 슈퍼관리자 전용 메뉴
 */
import React, { useState } from 'react';
import Card from '../common/Card';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Button from '../common/Button';
import MyProjects from './MyProjects';
import ProjectCreation from './ProjectCreation';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CriteriaManagement from './CriteriaManagement';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import AlternativeManagement from './AlternativeManagement';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import EvaluatorAssignment from './EvaluatorAssignment';
import EnhancedEvaluatorManagement from './EnhancedEvaluatorManagement';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SurveyLinkManager from './SurveyLinkManager';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ModelFinalization from './ModelFinalization';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import WorkflowStageIndicator from '../workflow/WorkflowStageIndicator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WorkflowStage } from '../workflow/WorkflowStageIndicator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EvaluationMode } from '../evaluation/EvaluationModeSelector';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PaymentSystem from '../payment/PaymentSystem';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import WorkshopManagement from '../workshop/WorkshopManagement';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DecisionSupportSystem from '../decision/DecisionSupportSystem';
// Removed unused imports to fix linting errors
import TrashBin from './TrashBin';
import dataService from '../../services/dataService_clean';
import type { ProjectData } from '../../services/api';
import type { User, UserProject } from '../../types';

interface PersonalServiceProps {
  user: User;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUserUpdate?: (updatedUser: User) => void;
  projects?: any[];
  onCreateProject?: (projectData: any) => Promise<any>;
  onDeleteProject?: (projectId: string) => Promise<any>;
  onFetchCriteria?: (projectId: string) => Promise<any[]>;
  onCreateCriteria?: (projectId: string, criteriaData: any) => Promise<any>;
  onFetchAlternatives?: (projectId: string) => Promise<any[]>;
  onCreateAlternative?: (projectId: string, alternativeData: any) => Promise<any>;
  onSaveEvaluation?: (projectId: string, evaluationData: any) => Promise<any>;
  onFetchTrashedProjects?: () => Promise<any[]>;
  onRestoreProject?: (projectId: string) => Promise<any>;
  onPermanentDeleteProject?: (projectId: string) => Promise<any>;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  category?: 'basic' | 'advanced' | 'admin' | 'ai';
  requiresAdmin?: boolean;
  requiresSuperAdmin?: boolean;
}

interface MenuCategory {
  id: string;
  title: string;
  items: MenuItem[];
  icon?: string;
}

const PersonalServiceDashboard_Enhanced: React.FC<PersonalServiceProps> = ({ 
  user: initialUser, 
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  onUserUpdate,
  projects: externalProjects = [],
  onCreateProject,
  onDeleteProject,
  onFetchCriteria,
  onCreateCriteria,
  onFetchAlternatives,
  onCreateAlternative,
  onSaveEvaluation,
  onFetchTrashedProjects,
  onRestoreProject,
  onPermanentDeleteProject,
  selectedProjectId: externalSelectedProjectId,
  onSelectProject: externalOnSelectProject
}) => {
  const [user, setUser] = useState(initialUser);
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const projects = Array.isArray(externalProjects) ? externalProjects : [];
  
  // 메뉴 구조 정의
  const menuCategories: MenuCategory[] = [
    {
      id: 'basic',
      title: '기본 기능',
      icon: '📌',
      items: [
        { id: 'dashboard', label: '대시보드' },
        { id: 'projects', label: '내 프로젝트' },
        { id: 'creation', label: '프로젝트 생성' },
        { id: 'model-builder', label: '모델 구축' },
        { id: 'evaluators', label: '평가자 관리' },
        { id: 'analysis', label: '결과 분석' },
        { id: 'export', label: '보고서' }
      ]
    },
    {
      id: 'advanced',
      title: '고급 기능',
      icon: '🚀',
      items: [
        { id: 'demographic-survey', label: '인구통계 설문' },
        { id: 'survey-links', label: '설문 링크 관리' },
        { id: 'evaluation-test', label: '평가 테스트' },
        { id: 'validity-check', label: '유효성 검증' },
        { id: 'monitoring', label: '진행률 모니터링' },
        { id: 'paper', label: '논문 작성' },
        { id: 'workshop', label: '워크샵 관리' },
        { id: 'decision-support', label: '의사결정 지원' },
        { id: 'usage-management', label: '사용량 관리' },
        { id: 'settings', label: '설정' }
      ]
    },
    {
      id: 'ai',
      title: 'AI 지원',
      icon: '🤖',
      items: [
        { id: 'ai-paper-assistant', label: 'AI 논문 도우미' },
        { id: 'ai-methodology', label: 'AHP 방법론' },
        { id: 'ai-fuzzy', label: '퍼지 AHP' },
        { id: 'ai-results', label: '결과 해석' },
        { id: 'ai-chatbot', label: 'AI 챗봇' }
      ]
    }
  ];

  // 슈퍼관리자 메뉴 추가
  if (user.role === 'super_admin') {
    menuCategories.push({
      id: 'admin',
      title: '관리자 기능',
      icon: '🔧',
      items: [
        { id: 'connection-test', label: '연동 테스트', requiresSuperAdmin: true },
        { id: 'django-admin', label: 'Django 관리', requiresSuperAdmin: true },
        { id: 'system-monitor', label: '시스템 모니터링', requiresSuperAdmin: true },
        { id: 'database', label: 'DB 관리', requiresSuperAdmin: true },
        { id: 'audit-log', label: '감사 로그', requiresSuperAdmin: true },
        { id: 'backup', label: '백업/복원', requiresSuperAdmin: true },
        { id: 'payment', label: '결제 관리', requiresAdmin: true },
        { id: 'trash', label: '휴지통', requiresAdmin: true }
      ]
    });
  } else if (user.role === 'service_admin') {
    menuCategories.push({
      id: 'admin',
      title: '관리 기능',
      icon: '⚙️',
      items: [
        { id: 'connection-test', label: '연동 테스트', requiresAdmin: true },
        { id: 'payment', label: '결제 관리', requiresAdmin: true },
        { id: 'trash', label: '휴지통', requiresAdmin: true }
      ]
    });
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleMenuClick = (itemId: string) => {
    setActiveMenu(itemId);
    if (externalOnTabChange) {
      externalOnTabChange(itemId);
    }
  };

  // 콘텐츠 렌더링 함수는 기존 PersonalServiceDashboard와 동일
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderDashboard();
      case 'projects':
        return renderProjects();
      case 'creation':
        return renderProjectCreation();
      case 'model-builder':
        return renderModelBuilder();
      case 'evaluators':
        return renderEvaluatorManagement();
      case 'analysis':
        return renderAnalysis();
      case 'export':
        return renderExport();
      case 'connection-test':
        return renderConnectionTest();
      case 'trash':
        return renderTrashBin();
      // ... 기타 케이스들
      default:
        return <div>선택된 메뉴: {activeMenu}</div>;
    }
  };

  // 기존 렌더링 함수들 (간단히 표시)
  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold">프로젝트</h3>
          <p className="text-3xl font-bold">{projects.length}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">진행중</h3>
          <p className="text-3xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">완료</h3>
          <p className="text-3xl font-bold">{projects.filter(p => p.status === 'completed').length}</p>
        </Card>
      </div>
    </div>
  );

  const renderProjects = () => (
    <MyProjects
      refreshTrigger={0}
      onCreateNew={() => handleMenuClick('creation')}
      onProjectSelect={(project) => console.log('프로젝트 선택:', project)}
      onEditProject={(project) => console.log('프로젝트 편집:', project)}
      onDeleteProject={onDeleteProject}
      onModelBuilder={(project) => handleMenuClick('model-builder')}
      onAnalysis={(project) => handleMenuClick('analysis')}
    />
  );

  const renderProjectCreation = () => (
    <ProjectCreation
      onProjectCreated={() => handleMenuClick('projects')}
      onCancel={() => handleMenuClick('projects')}
      createProject={onCreateProject}
    />
  );

  const renderModelBuilder = () => (
    <div>모델 구축 페이지</div>
  );

  const renderEvaluatorManagement = () => (
    <EnhancedEvaluatorManagement />
  );

  const renderAnalysis = () => (
    <div>결과 분석 페이지</div>
  );

  const renderExport = () => (
    <div>보고서 내보내기 페이지</div>
  );

  const renderConnectionTest = () => (
    <div>연동 테스트 페이지 (관리자 전용)</div>
  );

  const renderTrashBin = () => (
    <TrashBin
      onRestoreProject={onRestoreProject}
      onPermanentDeleteProject={onPermanentDeleteProject}
    />
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* 사이드바 헤더 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-bold text-gray-900">AHP 플랫폼</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* 메뉴 영역 */}
        <div className="flex-1 overflow-y-auto p-3">
          {!sidebarCollapsed ? (
            <nav className="space-y-2">
              {menuCategories.map((category) => (
                <div key={category.id} className="mb-2">
                  {/* 카테고리 헤더 */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">{category.icon}</span>
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        {category.title}
                      </span>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedCategories.includes(category.id) ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 카테고리 아이템 */}
                  {expandedCategories.includes(category.id) && (
                    <div className="mt-1 space-y-1 pl-7">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeMenu === item.id
                              ? 'bg-blue-500 text-white font-medium'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {item.label}
                          {item.requiresSuperAdmin && (
                            <span className="ml-2 text-xs opacity-75">👑</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          ) : (
            /* 축소된 사이드바 아이콘 */
            <nav className="space-y-2">
              <button 
                onClick={() => handleMenuClick('dashboard')}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                  activeMenu === 'dashboard' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
                title="대시보드"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <button 
                onClick={() => handleMenuClick('projects')}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                  activeMenu === 'projects' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
                title="프로젝트"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>
            </nav>
          )}
        </div>

        {/* 사이드바 푸터 */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div className="font-semibold">{user.first_name} {user.last_name}</div>
              <div>{user.role === 'super_admin' ? '슈퍼관리자' : user.role === 'service_admin' ? '서비스관리자' : '사용자'}</div>
            </div>
          </div>
        )}
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default PersonalServiceDashboard_Enhanced;