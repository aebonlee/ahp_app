import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CriteriaManagement from '../components/admin/CriteriaManagement';
import AlternativeManagement from '../components/admin/AlternativeManagement';
import EvaluatorAssignment from '../components/admin/EvaluatorAssignment';
import EnhancedEvaluatorManagement from '../components/admin/EnhancedEvaluatorManagement';
import SurveyLinkManager from '../components/admin/SurveyLinkManager';
import ModelFinalization from '../components/admin/ModelFinalization';
import WorkflowStageIndicator, { WorkflowStage } from '../components/workflow/WorkflowStageIndicator';
import { EvaluationMode } from '../components/evaluation/EvaluationModeSelector';
import PaymentSystem from '../components/payment/PaymentSystem';
import WorkshopManagement from '../components/workshop/WorkshopManagement';
import DecisionSupportSystem from '../components/decision/DecisionSupportSystem';
import PaperManagement from '../components/paper/PaperManagement';
import ProjectSelector from '../components/project/ProjectSelector';
import SurveyManagementSystem from '../components/survey/SurveyManagementSystem';
import PersonalSettings from '../components/settings/PersonalSettings';
import UsageManagement from '../components/admin/UsageManagement';
import ValidityCheck from '../components/validity/ValidityCheck';
import TrashBin from '../components/admin/TrashBin';
import dataService from '../services/dataService';
import type { ProjectData } from '../services/api';

// CSS Variables for Design System
const designVars = {
  // Colors
  brandGoldPrimary: '#C8A968',
  brandGoldSecondary: '#A98C4B', 
  brandGoldLight: '#E5D5AA',
  brandGrayPrimary: '#848484',
  brandIvory: '#F4F1EA',
  
  // Semantic Colors
  semanticInfo: '#3B82F6',
  semanticSuccess: '#10B981',
  semanticWarning: '#F59E0B',
  semanticDanger: '#EF4444',
  
  // Neutrals
  neutral0: '#ffffff',
  neutral50: '#f9fafb',
  neutral100: '#f3f4f6',
  neutral200: '#e5e7eb',
  neutral300: '#d1d5db',
  neutral400: '#9ca3af',
  neutral500: '#6b7280',
  neutral600: '#4b5563',
  neutral700: '#374151',
  neutral800: '#1f2937',
  neutral900: '#111827',
  
  // Spacing
  spacing1: '4px',
  spacing2: '8px',
  spacing3: '12px',
  spacing4: '16px',
  spacing6: '24px',
  spacing8: '32px',
  spacing12: '48px',
  spacing16: '64px',
  
  // Borders & Shadows
  borderRadius: '8px',
  borderRadiusLg: '12px',
  borderRadiusXl: '16px',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  shadowMd: '0 4px 6px rgba(0, 0, 0, 0.1)',
  shadowLg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  
  // Transitions
  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  transitionSlow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
};

// Reusable Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: designVars.neutral50,
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },
  header: {
    backgroundColor: designVars.neutral0,
    borderBottom: `1px solid ${designVars.neutral200}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: `${designVars.spacing6} ${designVars.spacing4}`,
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: designVars.neutral900,
    display: 'flex',
    alignItems: 'center',
    margin: 0,
  },
  headerSubtitle: {
    color: designVars.neutral600,
    marginTop: designVars.spacing2,
    fontSize: '1rem',
  },
  mainContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: `${designVars.spacing8} ${designVars.spacing4}`,
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: designVars.spacing6,
    marginBottom: designVars.spacing8,
  },
  statsCard: {
    backgroundColor: designVars.neutral0,
    border: `1px solid ${designVars.neutral200}`,
    borderRadius: designVars.borderRadius,
    padding: designVars.spacing4,
    boxShadow: designVars.shadow,
  },
  statsCardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: designVars.neutral900,
    margin: 0,
  },
  statsLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: designVars.neutral600,
    margin: 0,
  },
  statsIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: designVars.spacing4,
    marginBottom: designVars.spacing8,
  },
  featureCard: {
    backgroundColor: designVars.neutral0,
    border: `2px solid ${designVars.neutral200}`,
    borderRadius: designVars.borderRadiusLg,
    padding: designVars.spacing6,
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: designVars.transition,
    boxShadow: designVars.shadow,
  },
  featureCardHover: {
    borderColor: designVars.brandGoldPrimary,
    transform: 'translateY(-2px)',
    boxShadow: designVars.shadowMd,
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: designVars.spacing3,
    display: 'block',
  },
  featureTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: designVars.neutral900,
    margin: `0 0 ${designVars.spacing2} 0`,
  },
  featureDescription: {
    fontSize: '0.875rem',
    color: designVars.neutral600,
    margin: 0,
  },
  projectCard: {
    backgroundColor: designVars.neutral0,
    border: `1px solid ${designVars.neutral200}`,
    borderRadius: designVars.borderRadius,
    padding: designVars.spacing6,
    marginBottom: designVars.spacing4,
    boxShadow: designVars.shadow,
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: designVars.spacing4,
  },
  projectTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: designVars.neutral900,
    margin: 0,
  },
  projectStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${designVars.spacing1} ${designVars.spacing3}`,
    borderRadius: designVars.borderRadius,
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: designVars.neutral200,
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: designVars.spacing3,
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${designVars.spacing2} ${designVars.spacing4}`,
    backgroundColor: designVars.neutral0,
    border: `1px solid ${designVars.neutral300}`,
    borderRadius: designVars.borderRadius,
    fontSize: '0.875rem',
    fontWeight: '500',
    color: designVars.neutral700,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: designVars.transition,
    marginRight: designVars.spacing2,
  },
  primaryButton: {
    backgroundColor: designVars.brandGoldPrimary,
    borderColor: designVars.brandGoldPrimary,
    color: designVars.neutral0,
  },
  secondaryButton: {
    backgroundColor: designVars.semanticInfo,
    borderColor: designVars.semanticInfo,
    color: designVars.neutral0,
  },
  successButton: {
    backgroundColor: designVars.semanticSuccess,
    borderColor: designVars.semanticSuccess,
    color: designVars.neutral0,
  },
  dangerButton: {
    backgroundColor: designVars.semanticDanger,
    borderColor: designVars.semanticDanger,
    color: designVars.neutral0,
  },
  tabNavigation: {
    display: 'flex',
    backgroundColor: designVars.neutral0,
    borderRadius: designVars.borderRadius,
    padding: designVars.spacing1,
    marginBottom: designVars.spacing6,
    border: `1px solid ${designVars.neutral200}`,
  },
  tabButton: {
    flex: 1,
    padding: `${designVars.spacing3} ${designVars.spacing4}`,
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: designVars.borderRadius,
    fontSize: '0.875rem',
    fontWeight: '500',
    color: designVars.neutral600,
    cursor: 'pointer',
    transition: designVars.transition,
  },
  tabButtonActive: {
    backgroundColor: designVars.brandGoldPrimary,
    color: designVars.neutral0,
  },
};

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

// Feature Card Component
const FeatureCard: React.FC<{
  feature: { id: string; icon: string; title: string; desc: string };
  onFeatureClick: (id: string) => void;
}> = ({ feature, onFeatureClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        ...styles.featureCard,
        ...(isHovered ? styles.featureCardHover : {}),
      }}
      onClick={() => onFeatureClick(feature.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={styles.featureIcon}>{feature.icon}</span>
      <h3 style={styles.featureTitle}>{feature.title}</h3>
      <p style={styles.featureDescription}>{feature.desc}</p>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState(externalActiveTab || 'dashboard');
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(externalSelectedProjectId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab configuration with enhanced styling
  const tabConfig = [
    { id: 'dashboard', name: '대시보드', icon: '🏠', color: designVars.semanticInfo },
    { id: 'projects', name: '내 프로젝트', icon: '📊', color: designVars.brandGoldPrimary },
    { id: 'model-building', name: '모델 구성', icon: '🏗️', color: designVars.semanticSuccess },
    { id: 'evaluator-management', name: '평가자 관리', icon: '👥', color: designVars.semanticWarning },
    { id: 'survey-links', name: '설문 링크', icon: '🔗', color: designVars.semanticInfo },
    { id: 'results-analysis', name: '결과 분석', icon: '📈', color: designVars.semanticSuccess },
    { id: 'export-manager', name: '내보내기', icon: '📤', color: designVars.neutral600 },
    { id: 'settings', name: '개인 설정', icon: '⚙️', color: designVars.neutral700 },
    { id: 'trash-bin', name: '휴지통', icon: '🗑️', color: designVars.semanticDanger },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (externalOnTabChange) {
      externalOnTabChange(tab);
    }
  };

  const renderDashboard = () => (
    <div>
      {/* Welcome Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={styles.headerTitle}>
                <span style={{ fontSize: '2.5rem', marginRight: designVars.spacing3 }}>🎯</span>
                안녕하세요, {user.first_name}님!
              </h1>
              <p style={styles.headerSubtitle}>
                AHP 의사결정 분석 플랫폼에서 프로젝트를 관리하고 결과를 분석해보세요.
              </p>
            </div>
            <div style={{ display: 'flex', gap: designVars.spacing2 }}>
              <button
                style={{
                  ...styles.actionButton,
                  ...styles.primaryButton,
                }}
                onClick={() => handleTabChange('projects')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = designVars.shadowMd;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ marginRight: designVars.spacing2 }}>🚀</span>
                새 프로젝트
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Statistics Cards */}
        <div style={styles.dashboardGrid}>
          <div style={styles.statsCard}>
            <div style={styles.statsCardContent}>
              <div>
                <p style={styles.statsLabel}>프로젝트</p>
                <p style={styles.statsValue}>{projects.length}/3</p>
              </div>
              <div style={{ 
                ...styles.statsIcon, 
                backgroundColor: `${designVars.semanticInfo}20`,
                color: designVars.semanticInfo 
              }}>
                📊
              </div>
            </div>
          </div>
          
          <div style={styles.statsCard}>
            <div style={styles.statsCardContent}>
              <div>
                <p style={styles.statsLabel}>평가자</p>
                <p style={styles.statsValue}>12/30</p>
              </div>
              <div style={{ 
                ...styles.statsIcon, 
                backgroundColor: `${designVars.semanticSuccess}20`,
                color: designVars.semanticSuccess 
              }}>
                👥
              </div>
            </div>
          </div>

          <div style={styles.statsCard}>
            <div style={styles.statsCardContent}>
              <div>
                <p style={styles.statsLabel}>완료된 평가</p>
                <p style={styles.statsValue}>8</p>
              </div>
              <div style={{ 
                ...styles.statsIcon, 
                backgroundColor: `${designVars.brandGoldPrimary}20`,
                color: designVars.brandGoldPrimary 
              }}>
                ✅
              </div>
            </div>
          </div>

          <div style={styles.statsCard}>
            <div style={styles.statsCardContent}>
              <div>
                <p style={styles.statsLabel}>사용 가능</p>
                <p style={styles.statsValue}>22일</p>
              </div>
              <div style={{ 
                ...styles.statsIcon, 
                backgroundColor: `${designVars.semanticWarning}20`,
                color: designVars.semanticWarning 
              }}>
                ⏰
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: designVars.spacing8 }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: designVars.neutral900,
            marginBottom: designVars.spacing4,
          }}>
            빠른 작업
          </h2>
          
          <div style={styles.featureGrid}>
            {[
              { id: 'projects', icon: '📊', title: '프로젝트 관리', desc: '새 프로젝트를 생성하고 기존 프로젝트를 관리합니다' },
              { id: 'model-building', icon: '🏗️', title: '모델 구성', desc: '기준과 대안을 설정하여 의사결정 모델을 구성합니다' },
              { id: 'evaluator-management', icon: '👥', title: '평가자 관리', desc: '평가자를 초대하고 평가 진행 상황을 모니터링합니다' },
              { id: 'results-analysis', icon: '📈', title: '결과 분석', desc: 'AHP 분석 결과를 확인하고 시각화합니다' },
              { id: 'export-manager', icon: '📤', title: '내보내기', desc: '결과를 다양한 형식으로 내보냅니다' },
              { id: 'settings', icon: '⚙️', title: '개인 설정', desc: '계정 정보와 환경설정을 관리합니다' },
            ].map((feature) => (
              <FeatureCard 
                key={feature.id}
                feature={feature}
                onFeatureClick={handleTabChange}
              />
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: designVars.neutral900,
              marginBottom: designVars.spacing4,
            }}>
              최근 프로젝트
            </h2>
            
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  <span style={{
                    ...styles.projectStatus,
                    backgroundColor: project.status === 'active' ? `${designVars.semanticSuccess}20` : `${designVars.semanticWarning}20`,
                    color: project.status === 'active' ? designVars.semanticSuccess : designVars.semanticWarning,
                  }}>
                    {project.status === 'active' ? '진행중' : '대기중'}
                  </span>
                </div>
                
                <div style={{ marginBottom: designVars.spacing4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designVars.spacing2 }}>
                    <span style={{ fontSize: '0.875rem', color: designVars.neutral600 }}>진행률</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: designVars.neutral700 }}>
                      {project.completion_rate || 0}%
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${project.completion_rate || 0}%`,
                        backgroundColor: (project.completion_rate || 0) >= 75 ? designVars.semanticSuccess :
                                       (project.completion_rate || 0) >= 25 ? designVars.semanticWarning : 
                                       designVars.neutral400,
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: designVars.spacing2 }}>
                  <button
                    style={{ ...styles.actionButton, ...styles.primaryButton }}
                    onClick={() => {
                      setSelectedProjectId(project.id || '');
                      handleTabChange('model-building');
                    }}
                  >
                    모델 구성
                  </button>
                  <button
                    style={{ ...styles.actionButton, ...styles.secondaryButton }}
                    onClick={() => {
                      setSelectedProjectId(project.id || '');
                      handleTabChange('results-analysis');
                    }}
                  >
                    결과 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return renderDashboard();
    }
    
    // Other tab content would go here
    return (
      <div style={styles.mainContent}>
        <div style={{
          backgroundColor: designVars.neutral0,
          borderRadius: designVars.borderRadius,
          padding: designVars.spacing8,
          textAlign: 'center',
          border: `1px solid ${designVars.neutral200}`,
        }}>
          <h2 style={{ color: designVars.neutral700, marginBottom: designVars.spacing4 }}>
            {tabConfig.find(tab => tab.id === activeTab)?.name || '페이지'}
          </h2>
          <p style={{ color: designVars.neutral600 }}>
            이 기능은 현재 개발 중입니다.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Tab Navigation */}
      <div style={{ 
        backgroundColor: designVars.neutral0, 
        borderBottom: `1px solid ${designVars.neutral200}`,
        padding: `0 ${designVars.spacing4}`,
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          display: 'flex',
          gap: designVars.spacing1,
          paddingTop: designVars.spacing4,
        }}>
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id ? styles.tabButtonActive : {}),
                borderBottomColor: activeTab === tab.id ? tab.color : 'transparent',
                borderBottomWidth: '3px',
                borderBottomStyle: 'solid',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = designVars.neutral50;
                  e.currentTarget.style.color = tab.color;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = designVars.neutral600;
                }
              }}
            >
              <span style={{ marginRight: designVars.spacing2 }}>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default PersonalServicePage;