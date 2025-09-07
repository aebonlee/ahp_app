import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { projectAPI } from '../services/apiService';
import { API_BASE_URL } from '../config/api';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.fetch();
      if (response.data) {
        setProjects(response.data as Project[]);
      } else {
        setError('프로젝트를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '프로젝트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">프로젝트를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="error">오류: {error}</div>;
  }

  return (
    <div className="projects-container">
      <header className="projects-header">
        <h1>프로젝트 관리</h1>
        <button className="create-button">
          새 프로젝트 생성
        </button>
      </header>
      
      <div className="projects-list">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>생성된 프로젝트가 없습니다.</p>
            <p>새 프로젝트를 생성해보세요.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-meta">
                <span className={`status ${project.status}`}>
                  {project.status === 'draft' ? '작성중' : 
                   project.status === 'active' ? '진행중' : '완료'}
                </span>
                <span className="date">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="project-actions">
                <button className="edit-button">편집</button>
                <button className="view-button">보기</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;