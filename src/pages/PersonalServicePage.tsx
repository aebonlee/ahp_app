import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import ProjectSelector from '../components/project/ProjectSelector';
import PersonalSettings from '../components/settings/PersonalSettings';
import type { ProjectData } from '../services/api';

interface PersonalServiceProps {
  user: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUserUpdate?: (updatedUser: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  }) => void;
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

interface UserProject extends Omit<ProjectData, 'evaluation_method'> {
  evaluator_count?: number;
  completion_rate?: number;
  criteria_count: number;
  alternatives_count: number;
  last_modified: string;
  evaluation_method: 'pairwise' | 'direct' | 'mixed';
}

const PLAN_QUOTAS = {
  'basic': { projects: 3, evaluators: 30 },
  'standard': { projects: 3, evaluators: 50 },
  'premium': { projects: 3, evaluators: 100 },
  'enterprise': { projects: 3, evaluators: 100 }
};

const PersonalServicePage: React.FC<PersonalServiceProps> = ({ 
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
  
  const userPlan = {
    planType: 'standard' as const,
    additionalEvaluators: 0,
    planName: 'Standard Plan'
  };

  useEffect(() => {
    if (user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name) {
      setUser(initialUser);
    }
  }, [initialUser.first_name, initialUser.last_name, user.first_name, user.last_name]);

  const handleUserUpdate = (updatedUser: typeof initialUser) => {
    const newUserObject = {
      ...updatedUser,
      _updated: Date.now()
    };
    
    setUser(newUserObject);
    if (onUserUpdate) {
      onUserUpdate(newUserObject);
    }
  };
  
  const projects = Array.isArray(externalProjects) ? externalProjects : [];
  
  const quotas = {
    currentProjects: projects.length,
    maxProjects: PLAN_QUOTAS[userPlan.planType].projects,
    currentEvaluators: 0,
    maxEvaluators: PLAN_QUOTAS[userPlan.planType].evaluators + (userPlan.additionalEvaluators * 10),
    remainingProjects: Math.max(0, PLAN_QUOTAS[userPlan.planType].projects - projects.length),
    remainingEvaluators: Math.max(0, PLAN_QUOTAS[userPlan.planType].evaluators + (userPlan.additionalEvaluators * 10) - 0)
  };

  const activeMenu = externalActiveTab === 'personal-service' ? 'dashboard' :
                     externalActiveTab === 'my-projects' ? 'projects' :
                     externalActiveTab === 'project-creation' ? 'creation' :
                     externalActiveTab === 'model-builder' ? 'model-builder' :
                     externalActiveTab === 'evaluator-management' ? 'evaluators' :
                     externalActiveTab === 'progress-monitoring' ? 'monitoring' :
                     externalActiveTab === 'results-analysis' ? 'analysis' :
                     externalActiveTab === 'export-reports' ? 'export' :
                     externalActiveTab === 'workshop-management' ? 'workshop' :
                     externalActiveTab === 'decision-support-system' ? 'decision-support' :
                     externalActiveTab === 'personal-settings' ? 'settings' :
                     externalActiveTab === 'evaluation-test' ? 'evaluation-test' :
                     externalActiveTab === 'user-guide' ? 'user-guide' :
                     externalActiveTab === 'demographic-survey' ? 'demographic-survey' :
                     externalActiveTab === 'paper-management' ? 'paper-management' :
                     externalActiveTab === 'survey-links' ? 'survey-links' :
                     'dashboard';

  const [selectedProjectId, setSelectedProjectId] = useState<string>(externalSelectedProjectId || '');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectSelectorConfig, setProjectSelectorConfig] = useState<{
    title: string;
    description: string;
    nextAction: string;
  } | null>(null);

  const handleTabChange = (tab: string) => {
    const projectRequiredMenus = ['model-builder', 'monitoring', 'analysis'];
    
    if (projectRequiredMenus.includes(tab)) {
      const menuConfigs = {
        'model-builder': {
          title: '모델 구축할 프로젝트 선택',
          description: 'AHP 모델을 구축하거나 수정할 프로젝트를 선택해주세요.',
          nextAction: 'model-builder'
        },
        'monitoring': {
          title: '진행률을 모니터링할 프로젝트 선택',
          description: '평가 진행 상황을 확인할 프로젝트를 선택해주세요.',
          nextAction: 'monitoring'
        },
        'analysis': {
          title: '결과를 분석할 프로젝트 선택',
          description: '평가 결과를 분석하고 보고서를 생성할 프로젝트를 선택해주세요.',
          nextAction: 'analysis'
        }
      };
      
      setProjectSelectorConfig(menuConfigs[tab as keyof typeof menuConfigs]);
      setShowProjectSelector(true);
      return;
    }
    
    if (externalOnTabChange) {
      const tabMap: Record<string, string> = {
        'dashboard': 'personal-service',
        'projects': 'my-projects',
        'creation': 'project-creation',
        'model-builder': 'model-builder',
        'evaluators': 'evaluator-management',
        'monitoring': 'progress-monitoring',
        'analysis': 'results-analysis',
        'export': 'export-reports',
        'workshop': 'workshop-management',
        'decision-support': 'decision-support-system',
        'settings': 'personal-settings'
      };
      const mappedTab = tabMap[tab] || 'personal-service';
      externalOnTabChange(mappedTab);
    }
  };

  const handleProjectSelect = (project: UserProject) => {
    const projectId = project.id || '';
    setSelectedProjectId(projectId);
    if (externalOnSelectProject) {
      externalOnSelectProject(projectId);
    }
    setShowProjectSelector(false);
    setProjectSelectorConfig(null);
  };

  const handleProjectSelectorCancel = () => {
    setShowProjectSelector(false);
    setProjectSelectorConfig(null);
  };

  // 원본의 고급 대시보드 디자인 적용 (DB 연결 부분 제거, Tailwind 최소화)
  const renderOverview = () => (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--spacing-4, 1rem) var(--spacing-4, 1rem) var(--spacing-6, 1.5rem)' }}>
        {/* 프로젝트 현황 대시보드 - 원본 디자인 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-4, 1rem)'
        }}>
          <div style={{
            borderRadius: 'var(--radius-lg, 0.5rem)',
            padding: 'var(--spacing-4, 1rem)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--status-info-text)' }}>프로젝트</p>
              <p style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold',
                color: projects.length >= quotas.maxProjects ? 'var(--status-error-text)' : 'var(--text-primary)',
                margin: 0
              }}>
                {projects.length}<span style={{ fontSize: '1.125rem', color: '#6b7280' }}>/{quotas.maxProjects}</span>
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{userPlan.planName}</p>
            </div>
            <div style={{ 
              padding: 'var(--spacing-3, 0.75rem)', 
              borderRadius: '9999px',
              backgroundColor: 'var(--status-info-text)'
            }}>
              <span style={{ color: 'white', fontSize: '2rem' }}>📊</span>
            </div>
          </div>

          <div style={{
            borderRadius: 'var(--radius-lg, 0.5rem)',
            padding: 'var(--spacing-4, 1rem)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--status-success-text)' }}>평가자</p>
              <p style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold',
                color: quotas.currentEvaluators >= quotas.maxEvaluators ? 'var(--status-error-text)' : 'var(--text-primary)',
                margin: 0
              }}>
                {quotas.currentEvaluators}<span style={{ fontSize: '1.125rem', color: '#6b7280' }}>/{quotas.maxEvaluators}</span>
              </p>
              {userPlan.additionalEvaluators > 0 && (
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>+{userPlan.additionalEvaluators * 10}명 추가</p>
              )}
            </div>
            <div style={{ 
              padding: 'var(--spacing-3, 0.75rem)', 
              borderRadius: '9999px',
              backgroundColor: 'var(--status-success-text)'
            }}>
              <span style={{ color: 'white', fontSize: '2rem' }}>👥</span>
            </div>
          </div>

          <div style={{
            borderRadius: 'var(--radius-lg, 0.5rem)',
            padding: 'var(--spacing-4, 1rem)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--accent-primary)' }}>진행중</p>
              <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div style={{ 
              padding: 'var(--spacing-3, 0.75rem)', 
              borderRadius: '9999px',
              backgroundColor: 'var(--accent-primary)'
            }}>
              <span style={{ color: 'white', fontSize: '2rem' }}>🚀</span>
            </div>
          </div>

          <div style={{
            borderRadius: 'var(--radius-lg, 0.5rem)',
            padding: 'var(--spacing-4, 1rem)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--status-warning-text)' }}>완료됨</p>
              <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div style={{ 
              padding: 'var(--spacing-3, 0.75rem)', 
              borderRadius: '9999px',
              backgroundColor: 'var(--status-warning-text)'
            }}>
              <span style={{ color: 'white', fontSize: '2rem' }}>✅</span>
            </div>
          </div>
        </div>

        {/* 주요 기능 6개 인라인 배치 - 원본 디자인 */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: 'var(--spacing-4, 1rem)',
          marginTop: 'var(--spacing-6, 1.5rem)'
        }}>
          {[
            { id: 'creation', label: '새 프로젝트', icon: '🚀', color: 'from-blue-500 to-blue-600' },
            { id: 'projects', label: '내 프로젝트', icon: '📂', color: 'from-green-500 to-green-600' },
            { id: 'trash', label: '휴지통', icon: '🗑️', color: 'from-red-500 to-red-600' },
            { id: 'evaluators', label: '평가자 관리', icon: '👥', color: 'from-purple-500 to-purple-600' },
            { id: 'analysis', label: '결과 분석', icon: '📊', color: 'from-orange-500 to-orange-600' },
            { id: 'export', label: '보고서', icon: '📤', color: 'from-indigo-500 to-indigo-600' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: 'var(--spacing-6, 1.5rem) var(--spacing-6, 1.5rem)',
                borderRadius: 'var(--radius-xl, 0.75rem)',
                border: '2px solid var(--border-light)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '2rem',
                height: '2rem',
                background: `linear-gradient(to right, ${item.color})`,
                borderRadius: 'var(--radius-lg, 0.5rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 'var(--spacing-3, 0.75rem)'
              }}>
                <span style={{ color: 'white', fontSize: '1.125rem' }}>{item.icon}</span>
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* 빠른 시작 및 빠른 접근 통합 - 원본 디자인 */}
        <div style={{
          padding: 'var(--spacing-8, 2rem)',
          borderRadius: 'var(--radius-xl, 0.75rem)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginTop: 'var(--spacing-6, 1.5rem)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8, 2rem)' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-2, 0.5rem)',
              color: 'var(--accent-secondary)'
            }}>
              ⚡ 빠른 시작 및 접근
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)'
            }}>
              AHP 분석의 모든 기능을 빠르고 쉽게 사용해보세요
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--spacing-4, 1rem)'
          }}>
            {[
              { id: 'user-guide', label: '사용자 가이드', icon: '📚', color: 'from-blue-500 to-blue-600' },
              { id: 'model-builder', label: '모델 구성', icon: '🏗️', color: 'from-green-500 to-green-600' },
              { id: 'validity-check', label: '평가문항 확인', icon: '🔍', color: 'from-teal-500 to-teal-600' },
              { id: 'monitoring', label: '진행률 확인', icon: '📈', color: 'from-purple-500 to-purple-600' },
              { id: 'survey-links', label: '설문 링크', icon: '🔗', color: 'from-orange-500 to-orange-600' },
              { id: 'workshop', label: '워크숍 관리', icon: '🎯', color: 'from-indigo-500 to-indigo-600' },
              { id: 'decision-support', label: '의사결정 지원', icon: '🧠', color: 'from-pink-500 to-pink-600' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 'var(--spacing-4, 1rem)',
                  borderRadius: 'var(--radius-xl, 0.75rem)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: `linear-gradient(to right, ${item.color})`,
                  borderRadius: 'var(--radius-lg, 0.5rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-3, 0.75rem)'
                }}>
                  <span style={{ color: 'white', fontSize: '2rem' }}>{item.icon}</span>
                </div>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.25',
                  color: 'var(--text-primary)'
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderOverview();
      case 'settings':
        return (
          <PersonalSettings
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        );
      default:
        return (
          <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--spacing-12, 3rem)' }}>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-20, 5rem) 0' }}>
                <h2 style={{ 
                  fontSize: '3rem', 
                  fontWeight: 'bold', 
                  color: 'var(--text-primary)', 
                  marginBottom: 'var(--spacing-4, 1rem)' 
                }}>
                  {activeMenu === 'projects' && '내 프로젝트'}
                  {activeMenu === 'creation' && '새 프로젝트 생성'}
                  {activeMenu === 'evaluators' && '평가자 관리'}
                  {activeMenu === 'monitoring' && '진행률 모니터링'}
                  {activeMenu === 'analysis' && '결과 분석'}
                  {activeMenu === 'export' && '보고서 내보내기'}
                  {activeMenu === 'workshop' && '워크샵 관리'}
                  {activeMenu === 'decision-support' && '의사결정 지원'}
                </h2>
                <p style={{ 
                  fontSize: '1.125rem', 
                  color: 'var(--text-secondary)', 
                  marginBottom: 'var(--spacing-8, 2rem)' 
                }}>
                  이 기능은 개발 중입니다. 빠른 시일 내에 완성하여 제공하겠습니다.
                </p>
                <Button variant="primary" onClick={() => handleTabChange('dashboard')}>
                  대시보드로 돌아가기
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderMenuContent()}
      {showProjectSelector && projectSelectorConfig && (
        <ProjectSelector
          onProjectSelect={handleProjectSelect}
          onCancel={handleProjectSelectorCancel}
          title={projectSelectorConfig.title}
          description={projectSelectorConfig.description}
        />
      )}
    </>
  );
};

export default PersonalServicePage;