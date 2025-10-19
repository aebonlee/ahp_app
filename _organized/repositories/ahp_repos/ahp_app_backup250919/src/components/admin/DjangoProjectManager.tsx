import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  criteria_count?: number;
  comparisons_count?: number;
}

interface DjangoProjectManagerProps {
  onProjectSelect?: (project: Project) => void;
  onProjectCreate?: (project: Project) => void;
}

const DjangoProjectManager: React.FC<DjangoProjectManagerProps> = ({
  onProjectSelect,
  onProjectCreate
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<string>('checking');

  // 새 프로젝트 생성 폼 데이터
  const [newProject, setNewProject] = useState<{
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed';
  }>({
    title: '',
    description: '',
    status: 'draft'
  });

  useEffect(() => {
    checkServiceAndLoadProjects();
  }, []);

  const checkServiceAndLoadProjects = async () => {
    try {
      // 서비스 상태 확인
      const statusResponse = await apiService.authAPI.status();
      
      if (statusResponse.error) {
        setServiceStatus('unavailable');
        setError('Django 백엔드에 연결할 수 없습니다.');
        return;
      }
      
      setServiceStatus('available');
      console.log('✅ Django 서비스 상태:', statusResponse);
      
      // 프로젝트 목록 로드
      await loadProjects();
      
    } catch (error) {
      console.error('서비스 확인 실패:', error);
      setServiceStatus('unavailable');
      setError('백엔드 서비스에 연결할 수 없습니다.');
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.projectAPI.fetch();
      
      if (response.error) {
        throw new Error(response.error);
      }

      // 프로젝트 데이터 추출 (Django pagination 구조 고려)
      let projectData: Project[] = [];
      if (response.results) {
        projectData = response.results as Project[];
      } else if (Array.isArray(response)) {
        projectData = response as Project[];
      } else if (response.data) {
        projectData = Array.isArray(response.data) ? response.data as Project[] : [response.data as Project];
      }

      console.log('✅ 프로젝트 로드 성공:', projectData);
      setProjects(projectData);
      setError(null);
      
    } catch (error: any) {
      console.error('❌ 프로젝트 로드 실패:', error);
      setError(error.message || '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.title.trim()) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.projectAPI.create({
        title: newProject.title,
        description: newProject.description,
        status: newProject.status
      });

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ 프로젝트 생성 성공:', response);
      
      // 새 프로젝트를 목록에 추가
      const createdProject = (response.data || response) as Project;
      setProjects(prev => [createdProject, ...prev]);
      
      // 폼 초기화
      setNewProject({
        title: '',
        description: '',
        status: 'draft'
      });
      setShowCreateForm(false);
      
      // 콜백 호출
      onProjectCreate?.(createdProject);
      
    } catch (error: any) {
      console.error('❌ 프로젝트 생성 실패:', error);
      setError(error.message || '프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    onProjectSelect?.(project);
  };

  const handleWeightCalculation = async (projectId: number) => {
    try {
      setLoading(true);
      const response = await apiService.projectAPI.calculateWeights(projectId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log('✅ 가중치 계산 성공:', response);
      alert(`가중치 계산이 완료되었습니다!\n${response.message || '계산이 성공적으로 완료되었습니다.'}`);
      
      // 프로젝트 목록 새로고침
      await loadProjects();
      
    } catch (error: any) {
      console.error('❌ 가중치 계산 실패:', error);
      alert(`가중치 계산 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (serviceStatus === 'checking') {
    return (
      <div className="django-project-manager">
        <div className="service-checking">
          <div className="loading-spinner"></div>
          <h3>Django 서비스 연결 확인 중...</h3>
          <p>백엔드 서비스 상태를 확인하고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (serviceStatus === 'unavailable') {
    return (
      <div className="django-project-manager">
        <div className="service-error">
          <div className="error-icon">⚠️</div>
          <h3>서비스에 연결할 수 없습니다</h3>
          <p>{error}</p>
          <button onClick={checkServiceAndLoadProjects} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="django-project-manager">
      <div className="header">
        <div className="header-content">
          <h2>AHP 프로젝트 관리</h2>
          <div className="service-status">
            <div className="status-indicator available"></div>
            <span>Django 연결됨</span>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-button"
          disabled={loading}
        >
          새 프로젝트 생성
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <h3>새 프로젝트 생성</h3>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="title">프로젝트 제목 *</label>
              <input
                type="text"
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="프로젝트 제목을 입력하세요"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">설명</label>
              <textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="프로젝트 설명을 입력하세요"
                disabled={loading}
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">상태</label>
              <select
                id="status"
                value={newProject.status}
                onChange={(e) => setNewProject(prev => ({ ...prev, status: e.target.value as 'draft' | 'active' | 'completed' }))}
                disabled={loading}
              >
                <option value="draft">초안</option>
                <option value="active">진행중</option>
                <option value="completed">완료</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-button">
                {loading ? '생성 중...' : '생성'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
                className="cancel-button"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <div className="projects-section">
        <h3>프로젝트 목록 ({projects.length}개)</h3>
        
        {loading && !showCreateForm ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>프로젝트 로딩 중...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>아직 프로젝트가 없습니다.</p>
            <p>새 프로젝트를 생성해보세요!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h4>{project.title}</h4>
                  <span className={`status-badge ${project.status}`}>
                    {project.status === 'draft' ? '초안' : 
                     project.status === 'active' ? '진행중' : '완료'}
                  </span>
                </div>
                
                <div className="project-description">
                  {project.description || '설명이 없습니다.'}
                </div>
                
                <div className="project-stats">
                  <div className="stat">
                    <span className="stat-label">평가기준:</span>
                    <span className="stat-value">{project.criteria_count || 0}개</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">쌍대비교:</span>
                    <span className="stat-value">{project.comparisons_count || 0}개</span>
                  </div>
                </div>
                
                <div className="project-meta">
                  <small>생성일: {new Date(project.created_at).toLocaleDateString()}</small>
                </div>
                
                <div className="project-actions">
                  <button 
                    onClick={() => handleProjectClick(project)}
                    className="action-button primary"
                    disabled={loading}
                  >
                    선택
                  </button>
                  <button 
                    onClick={() => handleWeightCalculation(project.id)}
                    className="action-button secondary"
                    disabled={loading}
                  >
                    가중치 계산
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .django-project-manager {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header-content h2 {
          margin: 0 0 8px 0;
          color: #333;
        }

        .service-status {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #666;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .status-indicator.available {
          background: #10b981;
        }

        .create-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .create-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .create-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .create-form {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .create-form h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .submit-button,
        .cancel-button {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-button {
          background: #10b981;
          color: white;
          border: none;
        }

        .submit-button:hover:not(:disabled) {
          background: #059669;
        }

        .cancel-button {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .cancel-button:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-error {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .projects-section h3 {
          margin-bottom: 20px;
          color: #333;
        }

        .loading-state,
        .service-checking {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          color: #666;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .service-error {
          text-align: center;
          padding: 40px;
          color: #dc2626;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .retry-button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 16px;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .project-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .project-header h4 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }

        .status-badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .status-badge.draft {
          background: #f3f4f6;
          color: #374151;
        }

        .status-badge.active {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status-badge.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .project-description {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .project-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .project-meta {
          margin-bottom: 16px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }

        .project-meta small {
          color: #888;
        }

        .project-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button.primary {
          background: #667eea;
          color: white;
          border: none;
        }

        .action-button.primary:hover:not(:disabled) {
          background: #5a67d8;
        }

        .action-button.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .action-button.secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default DjangoProjectManager;