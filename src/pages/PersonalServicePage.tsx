import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import apiService from '../services/api';
import CriteriaManagement from '../components/criteria/CriteriaManagement';
import AlternativeManagement from '../components/alternatives/AlternativeManagement';
import PairwiseComparison from '../components/comparison/PairwiseComparison';

// Type definitions
interface Project {
  id: string;
  title: string;
  description: string;
  objective: string;
  status: 'draft' | 'active' | 'completed';
  evaluation_method: 'pairwise' | 'direct' | 'mixed';
  criteria_count: number;
  alternatives_count: number;
  evaluator_count: number;
  completion_rate: number;
  created_at: string;
  last_modified: string;
}

interface ProjectForm {
  title: string;
  description: string;
  objective: string;
  evaluation_method: 'pairwise' | 'direct' | 'mixed';
}

const PersonalServicePage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'projects' | 'model-builder' | 'analysis' | 'settings'>('dashboard');
  const [modelBuilderStep, setModelBuilderStep] = useState<'overview' | 'criteria' | 'alternatives' | 'comparison' | 'results'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Project management states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    title: '',
    description: '',
    objective: '',
    evaluation_method: 'pairwise'
  });

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      // API 호출 시뮬레이션 (실제로는 백엔드 연동 필요)
      const response = await apiService.get<Project[]>('/api/projects');
      setProjects(response || []);
    } catch (err) {
      console.error('프로젝트 로드 실패:', err);
      setError('프로젝트를 불러오는데 실패했습니다.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData: ProjectForm) => {
    try {
      const response = await apiService.post<Project>('/api/projects', formData);
      setProjects([...projects, response]);
      setShowProjectForm(false);
      resetProjectForm();
    } catch (err) {
      console.error('프로젝트 생성 실패:', err);
      setError('프로젝트 생성에 실패했습니다.');
    }
  };

  const handleEditProject = async (projectId: string, formData: ProjectForm) => {
    try {
      const response = await apiService.put<Project>(`/api/projects/${projectId}`, formData);
      setProjects(projects.map(p => p.id === projectId ? response : p));
      setEditingProject(null);
      setShowProjectForm(false);
      resetProjectForm();
    } catch (err) {
      console.error('프로젝트 수정 실패:', err);
      setError('프로젝트 수정에 실패했습니다.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('프로젝트를 삭제하시겠습니까?')) {
      try {
        await apiService.delete(`/api/projects/${projectId}`);
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
        }
      } catch (err) {
        console.error('프로젝트 삭제 실패:', err);
        setError('프로젝트 삭제에 실패했습니다.');
      }
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      objective: '',
      evaluation_method: 'pairwise'
    });
    setEditingProject(null);
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      objective: project.objective,
      evaluation_method: project.evaluation_method
    });
    setShowProjectForm(true);
  };

  const getProjectStats = () => {
    return {
      total: projects.length,
      draft: projects.filter(p => p.status === 'draft').length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      avgCompletion: projects.length > 0 ? 
        Math.round(projects.reduce((sum, p) => sum + p.completion_rate, 0) / projects.length) : 0
    };
  };

  const stats = getProjectStats();

  const renderDashboard = () => (
    <div className="dashboard-section">
      <h2>개인 서비스 대시보드</h2>
      
      {/* 사용자 정보 */}
      <div className="user-info-card">
        <div className="user-header">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <h3>{user?.email}</h3>
            <p>{user?.role === 'admin' ? '관리자' : '사용자'}</p>
          </div>
        </div>
      </div>

      {/* 프로젝트 통계 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">전체 프로젝트</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">활성 프로젝트</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">완료 프로젝트</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgCompletion}%</div>
          <div className="stat-label">평균 진행률</div>
        </div>
      </div>

      {/* 최근 프로젝트 */}
      <div className="recent-projects">
        <h3>최근 프로젝트</h3>
        {projects.slice(0, 3).map(project => (
          <div key={project.id} className="recent-project-item">
            <div className="project-title">{project.title}</div>
            <div className="project-status status-{project.status}">{project.status}</div>
            <div className="project-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${project.completion_rate}%` }}
                />
              </div>
              <span>{project.completion_rate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="projects-section">
      <div className="section-header">
        <h2>프로젝트 관리</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetProjectForm();
            setShowProjectForm(true);
          }}
        >
          새 프로젝트
        </button>
      </div>

      {/* 프로젝트 목록 */}
      <div className="projects-grid">
        {loading ? (
          <div className="loading">프로젝트를 불러오는 중...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>프로젝트가 없습니다</h3>
            <p>새 프로젝트를 만들어서 AHP 분석을 시작해보세요.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowProjectForm(true)}
            >
              첫 번째 프로젝트 만들기
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.title}</h3>
                <div className="project-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => openEditForm(project)}
                  >
                    수정
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
              
              <p className="project-description">{project.description}</p>
              
              <div className="project-stats">
                <div className="stat">
                  <span className="label">기준:</span>
                  <span className="value">{project.criteria_count}</span>
                </div>
                <div className="stat">
                  <span className="label">대안:</span>
                  <span className="value">{project.alternatives_count}</span>
                </div>
                <div className="stat">
                  <span className="label">평가자:</span>
                  <span className="value">{project.evaluator_count}</span>
                </div>
              </div>

              <div className="project-progress">
                <div className="progress-label">
                  <span>진행률</span>
                  <span>{project.completion_rate}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${project.completion_rate}%` }}
                  />
                </div>
              </div>

              <div className={`project-status status-${project.status}`}>
                {project.status === 'draft' && '초안'}
                {project.status === 'active' && '진행중'}
                {project.status === 'completed' && '완료'}
              </div>

              <button 
                className="btn btn-primary btn-full"
                onClick={() => {
                  setSelectedProject(project);
                  setActiveSection('model-builder');
                }}
              >
                AHP 모델 빌더로 이동
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderModelBuilder = () => (
    <div className="model-builder-section">
      <h2>AHP 모델 빌더</h2>
      
      {!selectedProject ? (
        <div className="no-project-selected">
          <div className="empty-icon">🔧</div>
          <h3>프로젝트를 선택해주세요</h3>
          <p>AHP 모델을 구축하려면 먼저 프로젝트를 선택해야 합니다.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveSection('projects')}
          >
            프로젝트 선택하기
          </button>
        </div>
      ) : (
        <div className="model-builder-content">
          <div className="selected-project-info">
            <h3>{selectedProject.title}</h3>
            <p>{selectedProject.description}</p>
          </div>

          {/* 모델 빌더 네비게이션 */}
          <div className="model-builder-nav">
            <button 
              className={`nav-step ${modelBuilderStep === 'overview' ? 'active' : ''}`}
              onClick={() => setModelBuilderStep('overview')}
            >
              개요
            </button>
            <button 
              className={`nav-step ${modelBuilderStep === 'criteria' ? 'active' : ''}`}
              onClick={() => setModelBuilderStep('criteria')}
            >
              기준 관리
            </button>
            <button 
              className={`nav-step ${modelBuilderStep === 'alternatives' ? 'active' : ''}`}
              onClick={() => setModelBuilderStep('alternatives')}
            >
              대안 관리
            </button>
            <button 
              className={`nav-step ${modelBuilderStep === 'comparison' ? 'active' : ''}`}
              onClick={() => setModelBuilderStep('comparison')}
            >
              쌍대비교
            </button>
            <button 
              className={`nav-step ${modelBuilderStep === 'results' ? 'active' : ''}`}
              onClick={() => setModelBuilderStep('results')}
            >
              결과
            </button>
          </div>

          {/* 모델 빌더 콘텐츠 */}
          <div className="model-builder-body">
            {modelBuilderStep === 'overview' && (
              <div className="workflow-steps">
                <div className="step active">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>기준 설정</h4>
                    <p>의사결정 기준을 정의합니다</p>
                    <div className="criteria-count">{selectedProject.criteria_count}개 기준</div>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setModelBuilderStep('criteria')}
                    >
                      기준 관리
                    </button>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>대안 설정</h4>
                    <p>비교할 대안들을 정의합니다</p>
                    <div className="alternatives-count">{selectedProject.alternatives_count}개 대안</div>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setModelBuilderStep('alternatives')}
                    >
                      대안 관리
                    </button>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>쌍대비교</h4>
                    <p>기준과 대안에 대한 쌍대비교를 수행합니다</p>
                    <div className="evaluation-method">{selectedProject.evaluation_method} 방법</div>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setModelBuilderStep('comparison')}
                    >
                      쌍대비교
                    </button>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>결과 분석</h4>
                    <p>AHP 분석 결과를 확인합니다</p>
                    <div className="completion-rate">{selectedProject.completion_rate}% 완료</div>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => setModelBuilderStep('results')}
                    >
                      결과 보기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modelBuilderStep === 'criteria' && (
              <CriteriaManagement 
                projectId={selectedProject.id}
                onCriteriaChange={(criteria) => {
                  setSelectedProject(prev => prev ? {
                    ...prev,
                    criteria_count: criteria.length
                  } : null);
                }}
              />
            )}

            {modelBuilderStep === 'alternatives' && (
              <AlternativeManagement 
                projectId={selectedProject.id}
                onAlternativesChange={(alternatives) => {
                  setSelectedProject(prev => prev ? {
                    ...prev,
                    alternatives_count: alternatives.length
                  } : null);
                }}
              />
            )}

            {modelBuilderStep === 'comparison' && (
              <PairwiseComparison
                projectId={selectedProject.id}
                items={[
                  { id: '1', name: '기준 A', description: '첫 번째 기준' },
                  { id: '2', name: '기준 B', description: '두 번째 기준' },
                  { id: '3', name: '기준 C', description: '세 번째 기준' }
                ]}
                type="criteria"
                onComparisonComplete={(comparisons) => {
                  console.log('쌍대비교 완료:', comparisons);
                  setSelectedProject(prev => prev ? {
                    ...prev,
                    completion_rate: Math.min(prev.completion_rate + 25, 100)
                  } : null);
                }}
              />
            )}

            {modelBuilderStep === 'results' && (
              <div className="results-section">
                <h3>분석 결과</h3>
                <div className="results-placeholder">
                  <div className="placeholder-icon">📊</div>
                  <h4>결과 분석 기능 개발 중</h4>
                  <p>쌍대비교 완료 후 결과를 표시할 예정입니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysis = () => (
    <div className="analysis-section">
      <h2>결과 분석</h2>
      
      {projects.filter(p => p.completion_rate > 0).length === 0 ? (
        <div className="no-results">
          <div className="empty-icon">📊</div>
          <h3>분석할 결과가 없습니다</h3>
          <p>먼저 프로젝트를 완료하여 분석 결과를 생성해주세요.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveSection('projects')}
          >
            프로젝트로 이동
          </button>
        </div>
      ) : (
        <div className="analysis-content">
          <div className="analysis-summary">
            <h3>분석 요약</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="label">분석 완료 프로젝트:</span>
                <span className="value">{projects.filter(p => p.completion_rate === 100).length}개</span>
              </div>
              <div className="summary-item">
                <span className="label">진행 중 프로젝트:</span>
                <span className="value">{projects.filter(p => p.completion_rate > 0 && p.completion_rate < 100).length}개</span>
              </div>
            </div>
          </div>

          <div className="analysis-projects">
            {projects.filter(p => p.completion_rate > 0).map(project => (
              <div key={project.id} className="analysis-project-card">
                <h4>{project.title}</h4>
                <div className="analysis-progress">
                  <span>분석 진행률: {project.completion_rate}%</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${project.completion_rate}%` }}
                    />
                  </div>
                </div>
                <div className="analysis-actions">
                  <button className="btn btn-sm btn-primary">상세 보기</button>
                  <button className="btn btn-sm btn-outline">보고서 내보내기</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <h2>개인 설정</h2>
      
      <div className="settings-content">
        <div className="setting-group">
          <h3>계정 정보</h3>
          <div className="setting-item">
            <label>이메일</label>
            <input type="email" value={user?.email || ''} readOnly />
          </div>
          <div className="setting-item">
            <label>역할</label>
            <input type="text" value={user?.role === 'admin' ? '관리자' : '사용자'} readOnly />
          </div>
        </div>

        <div className="setting-group">
          <h3>알림 설정</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              이메일 알림 받기
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              프로젝트 업데이트 알림
            </label>
          </div>
        </div>

        <div className="setting-group">
          <h3>데이터 관리</h3>
          <div className="setting-actions">
            <button className="btn btn-outline">데이터 내보내기</button>
            <button className="btn btn-outline">백업 다운로드</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectForm = () => (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowProjectForm(false);
        resetProjectForm();
      }
    }}>
      <div className="modal">
        <div className="modal-header">
          <h3>{editingProject ? '프로젝트 수정' : '새 프로젝트'}</h3>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => {
              setShowProjectForm(false);
              resetProjectForm();
            }}
          >
            ✕
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingProject) {
              handleEditProject(editingProject.id, projectForm);
            } else {
              handleCreateProject(projectForm);
            }
          }}>
            <div className="form-group">
              <label>프로젝트 제목</label>
              <input
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="프로젝트 제목을 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label>설명</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="프로젝트 설명을 입력하세요"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label>목적</label>
              <textarea
                value={projectForm.objective}
                onChange={(e) => setProjectForm(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="프로젝트의 목적을 입력하세요"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label>평가 방법</label>
              <select
                value={projectForm.evaluation_method}
                onChange={(e) => setProjectForm(prev => ({ 
                  ...prev, 
                  evaluation_method: e.target.value as 'pairwise' | 'direct' | 'mixed'
                }))}
              >
                <option value="pairwise">쌍대비교</option>
                <option value="direct">직접평가</option>
                <option value="mixed">혼합방법</option>
              </select>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  setShowProjectForm(false);
                  resetProjectForm();
                }}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary">
                {editingProject ? '수정' : '생성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="personal-service-page">
        <div className="auth-required">
          <h2>로그인이 필요합니다</h2>
          <p>개인 서비스를 이용하려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="personal-service-page">
      <div className="page-header">
        <h1>개인 서비스</h1>
        <p>AHP 의사결정 지원 도구를 활용하여 체계적인 분석을 수행하세요</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="page-content">
        {/* 네비게이션 */}
        <nav className="section-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            대시보드
          </button>
          <button 
            className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveSection('projects')}
          >
            <span className="nav-icon">📂</span>
            프로젝트
          </button>
          <button 
            className={`nav-item ${activeSection === 'model-builder' ? 'active' : ''}`}
            onClick={() => setActiveSection('model-builder')}
          >
            <span className="nav-icon">🔧</span>
            모델 빌더
          </button>
          <button 
            className={`nav-item ${activeSection === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveSection('analysis')}
          >
            <span className="nav-icon">📊</span>
            결과 분석
          </button>
          <button 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <span className="nav-icon">⚙️</span>
            설정
          </button>
        </nav>

        {/* 메인 콘텐츠 */}
        <main className="main-content">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'projects' && renderProjects()}
          {activeSection === 'model-builder' && renderModelBuilder()}
          {activeSection === 'analysis' && renderAnalysis()}
          {activeSection === 'settings' && renderSettings()}
        </main>
      </div>

      {/* 프로젝트 폼 모달 */}
      {showProjectForm && renderProjectForm()}
    </div>
  );
};

export default PersonalServicePage;