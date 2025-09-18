import React, { useState, useEffect } from 'react';
import DjangoProjectManagement from '../components/admin/DjangoProjectManagement';
import EnhancedProjectManagement from '../components/admin/EnhancedProjectManagement';
import PersonalSettings from '../components/settings/PersonalSettings';
// Additional component imports for menu items
import DemographicSurvey from '../components/survey/DemographicSurvey';
import MyProjects from '../components/admin/MyProjects';
import ProjectCreation from '../components/admin/ProjectCreation';
import ModelBuilder from '../components/modeling/ModelBuilder';
import EvaluatorManagement from '../components/admin/EvaluatorManagement';
import TrashBin from '../components/admin/TrashBin';
import ResultsAnalysis from '../components/analysis/ResultsAnalysis';
import PaperManagement from '../components/paper/PaperManagement';
import ExportManager from '../components/export/ExportManager';
import WorkshopManagement from '../components/workshop/WorkshopManagement';
import DecisionSupportSystem from '../components/decision/DecisionSupportSystem';
import PersonalServiceDashboard from '../components/admin/PersonalServiceDashboard';
import RealTimeParticipantMonitor from '../components/monitoring/RealTimeParticipantMonitor';

interface PersonalServiceProps {
  user: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
    canSwitchModes?: boolean;
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUserUpdate?: (updatedUser: any) => void;
  projects?: any[];
  onCreateProject?: (projectData: any) => Promise<any>;
  onDeleteProject?: (projectId: string) => Promise<any>;
  onFetchCriteria?: (projectId: string) => Promise<any[]>;
  onCreateCriteria?: (projectId: string, criteriaData: any) => Promise<any>;
  onFetchAlternatives?: (projectId: string) => Promise<any[]>;
  onCreateAlternative?: (projectId: string, alternativeData: any) => Promise<any>;
  onSaveEvaluation?: (projectId: string, evaluationData: any) => Promise<any>;
  onFetchUsers?: () => Promise<void>;
  onCreateUser?: (userData: any) => Promise<void>;
  onUpdateUser?: (userId: string, userData: any) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onCreateSampleProject?: () => Promise<any>;
  onTrashOverflow?: (projectId: string, projectTitle: string) => void;
  onRestoreProject?: (projectId: string) => Promise<any>;
  onPermanentDeleteProject?: (projectId: string) => Promise<any>;
  onFetchTrashedProjects?: () => Promise<any[]>;
  onSelectProject?: any;
  // 추가로 필요한 props들을 모두 옵셔널로 추가
  [key: string]: any;
}

const ImprovedPersonalServicePage: React.FC<PersonalServiceProps> = ({
  user: initialUser,
  activeTab = 'dashboard',
  onTabChange,
  onUserUpdate,
  projects = [],
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onFetchCriteria
}) => {
  const [activeMenu, setActiveMenu] = useState(activeTab);
  const [user, setUser] = useState(initialUser);

  // 요금제 정보
  const quotas = {
    planName: 'Standard Plan',
    currentProjects: projects.length,
    maxProjects: 10,
    currentEvaluators: projects.reduce((acc, p) => acc + (p.evaluator_count || 0), 0),
    maxEvaluators: 50
  };

  // 탭 변경 처리
  const handleTabChange = (newTab: string) => {
    setActiveMenu(newTab);
    if (onTabChange) {
      onTabChange(newTab);
    }
  };

  // 사용자 정보 업데이트 처리
  const handleUserUpdate = (updatedUser: typeof initialUser) => {
    setUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  // 대시보드 개요 렌더링
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-2">안녕하세요, {user.first_name}님! 👋</h2>
        <p className="text-blue-100 text-lg">AHP 플랫폼에서 과학적이고 체계적인 의사결정을 시작해보세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">내 프로젝트</p>
              <p className="text-3xl font-bold text-gray-900">{quotas.currentProjects}</p>
              <p className="text-sm text-gray-500">최대 {quotas.maxProjects}개</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 평가자</p>
              <p className="text-3xl font-bold text-gray-900">{quotas.currentEvaluators}</p>
              <p className="text-sm text-gray-500">최대 {quotas.maxEvaluators}명</p>
            </div>
            <div className="p-4 bg-green-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">구독 플랜</p>
              <p className="text-lg font-bold text-gray-900">{quotas.planName}</p>
              <p className="text-sm text-green-600">활성</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-full">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">빠른 작업</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => handleTabChange('projects')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 text-left group"
          >
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">새 프로젝트</h4>
            <p className="text-sm text-gray-600">AHP 분석 시작하기</p>
          </button>

          <button 
            onClick={() => handleTabChange('projects')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-200 text-left group"
          >
            <div className="text-2xl mb-2">📂</div>
            <h4 className="font-semibold text-gray-900 group-hover:text-green-600">프로젝트 관리</h4>
            <p className="text-sm text-gray-600">기존 프로젝트 보기</p>
          </button>

          <button 
            onClick={() => handleTabChange('settings')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 text-left group"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h4 className="font-semibold text-gray-900 group-hover:text-purple-600">계정 설정</h4>
            <p className="text-sm text-gray-600">프로필 및 환경설정</p>
          </button>

          <button 
            onClick={() => window.open('https://docs.ahp-platform.com', '_blank')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-200 text-left group"
          >
            <div className="text-2xl mb-2">📚</div>
            <h4 className="font-semibold text-gray-900 group-hover:text-orange-600">사용 가이드</h4>
            <p className="text-sm text-gray-600">AHP 방법론 학습</p>
          </button>
        </div>
      </div>

      {/* 최근 프로젝트 */}
      {projects.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">최근 프로젝트</h3>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.description || '설명 없음'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'completed' ? '완료' :
                     project.status === 'in_progress' ? '진행중' : '준비'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {projects.length > 3 && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => handleTabChange('projects')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                모든 프로젝트 보기 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // 컨텐츠 렌더링
  const renderContent = () => {
    switch (activeMenu) {
      case 'personal-service':
        return (
          <PersonalServiceDashboard 
            user={user}
            onTabChange={handleTabChange}
          />
        );
      case 'demographic-survey':
        return <DemographicSurvey />;
      case 'my-projects':
        return <MyProjects />;
      case 'project-creation':
        return (
          <ProjectCreation 
            onProjectCreated={() => {
              handleTabChange('projects');
            }}
            onCancel={() => handleTabChange('dashboard')}
            createProject={onCreateProject}
          />
        );
      case 'model-builder':
        return <ModelBuilder />;
      case 'evaluator-management':
        return <EvaluatorManagement />;
      case 'trash':
        return <TrashBin />;
      case 'progress-monitoring':
        return (
          <RealTimeParticipantMonitor 
            projectId={projects.length > 0 ? projects[0].id?.toString() || 'demo-project' : 'demo-project'}
            onParticipantSelect={(participantId) => {
              console.log('Selected participant:', participantId);
            }}
          />
        );
      case 'results-analysis':
        return (
          <ResultsAnalysis 
            projectId={projects.length > 0 ? projects[0].id?.toString() || 'demo-project' : 'demo-project'}
            evaluationMode="practical"
          />
        );
      case 'paper-management':
        return <PaperManagement />;
      case 'export-reports':
        return (
          <ExportManager 
            projectId={projects.length > 0 ? projects[0].id?.toString() || 'demo-project' : 'demo-project'}
            projectData={projects.length > 0 ? projects[0] : { title: 'Demo Project', description: 'Demo project for export' }}
            onExportComplete={(result) => {
              if (result.success) {
                alert('Export completed successfully!');
              } else {
                alert('Export failed: ' + result.error);
              }
            }}
          />
        );
      case 'workshop-management':
        return <WorkshopManagement />;
      case 'decision-support-system':
        return <DecisionSupportSystem />;
      case 'personal-settings':
        return (
          <PersonalSettings 
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        );
      case 'projects':
        return (
          <EnhancedProjectManagement
            projects={projects}
            onCreateProject={onCreateProject}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
          />
        );
      case 'django-projects':
        return <DjangoProjectManagement />;
      case 'settings':
        return (
          <PersonalSettings 
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        );
      default:
        return renderDashboard();
    }
  };

  // 주요 메뉴 항목들 (핵심 기능만)
  // AEBON SPECIAL MENU - Only for aebon user
  const isAebon = user.first_name?.toLowerCase() === 'aebon' || user.role === 'super_admin';
  
  const mainMenuItems = [
    { id: 'dashboard', label: '대시보드', icon: '🏠', description: '현황 및 빠른 작업' },
    { id: 'projects', label: '프로젝트 관리', icon: '📊', description: '향상된 프로젝트 관리' },
    { id: 'django-projects', label: '기존 프로젝트', icon: '📂', description: '기존 Django 프로젝트' },
    { id: 'settings', label: '계정 설정', icon: '⚙️', description: '개인정보 및 환경설정' },
    // AEBON EXCLUSIVE MENU ITEM
    ...(isAebon ? [
      { id: 'super-admin', label: '👑 Super Admin', icon: '👑', description: 'AEBON 최고관리자 대시보드' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  {isAebon ? '👑 AEBON 개인 서비스' : 'AHP 개인 서비스'} 💼
                  {isAebon && (
                    <span className="ml-3 px-3 py-1 text-sm font-semibold text-white bg-purple-600 rounded-full animate-pulse">
                      ULTIMATE ACCESS
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isAebon 
                    ? '🎯 최고관리자 전용 - 모든 시스템 기능에 완전 접근 가능' 
                    : '체계적이고 과학적인 의사결정을 위한 AHP 플랫폼'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">안녕하세요!</div>
                  <div className="font-semibold text-gray-900 flex items-center">
                    {isAebon && <span className="mr-2">👑</span>}
                    {user.first_name} {user.last_name}
                    {isAebon && (
                      <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-purple-500 rounded">
                        ULTIMATE ADMIN
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {mainMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeMenu === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ImprovedPersonalServicePage;