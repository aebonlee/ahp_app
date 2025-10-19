import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService_clean';
import { ProjectData } from '../../services/api';

interface MyProjectsProps {
  onProjectSelect?: (project: ProjectData) => void;
  onCreateNew?: () => void;
  onEditProject?: (project: ProjectData) => void;
  onDeleteProject?: (projectId: string) => void;
  onModelBuilder?: (project: ProjectData) => void;
  onAnalysis?: (project: ProjectData) => void;
}

const MyProjects: React.FC<MyProjectsProps> = ({ 
  onProjectSelect, 
  onCreateNew, 
  onEditProject, 
  onDeleteProject, 
  onModelBuilder, 
  onAnalysis 
}) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await dataService.getProjects();
      setProjects(data || []);
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter !== 'all' && project.status !== filter) return false;
    if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { backgroundColor: 'var(--accent-secondary-pastel)', color: 'var(--accent-secondary-dark)' };
      case 'completed': return { backgroundColor: 'var(--accent-primary-pastel)', color: 'var(--accent-primary-dark)' };
      case 'draft': return { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' };
      default: return { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'draft': return '초안';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4" style={{ color: 'var(--text-muted)' }}>•••</div>
          <p style={{ color: 'var(--text-secondary)' }}>프로젝트 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            내 프로젝트
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            총 {projects.length}개의 프로젝트
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          style={{ 
            backgroundColor: 'var(--accent-primary)', 
            color: 'white' 
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
        >
          <span>+</span>
          <span>새 프로젝트</span>
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none"
            style={{
              borderColor: 'var(--border-light)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
          />
        </div>
        <div className="flex space-x-2">
          {(['all', 'active', 'completed', 'draft'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="px-4 py-2 rounded-lg transition-colors"
              style={filter === status 
                ? { backgroundColor: 'var(--accent-primary)', color: 'white' }
                : { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }
              }
              onMouseEnter={(e) => {
                if (filter !== status) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== status) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                }
              }}
            >
              {status === 'all' ? '전체' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* 프로젝트 목록 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-6xl mb-4" style={{ color: 'var(--text-muted)' }}>□</div>
          <p className="text-xl font-medium mb-2">프로젝트가 없습니다</p>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            {searchTerm ? '검색 결과가 없습니다' : '첫 번째 프로젝트를 생성해보세요'}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateNew}
              className="px-6 py-3 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              새 프로젝트 만들기
            </button>
          )}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => onProjectSelect?.(project)}
              className="p-6 rounded-xl transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid var(--accent-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid var(--border-light)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* 프로젝트 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-lg flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
                  {project.title}
                </h3>
                <span className="px-2 py-1 text-xs rounded-full" style={getStatusColor(project.status || 'draft')}>
                  {getStatusText(project.status || 'draft')}
                </span>
              </div>

              {/* 프로젝트 설명 */}
              {project.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              )}

              {/* 프로젝트 통계 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {project.criteria_count || 0}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>기준</div>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {project.alternatives_count || 0}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>대안</div>
                </div>
              </div>

              {/* 진행 상황 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>진행률</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {(project as any).completion_rate || 0}%
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border-light)' }}>
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(project as any).completion_rate || 0}%`,
                      backgroundColor: 'var(--accent-primary)'
                    }}
                  />
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="mt-4 pt-4 flex justify-between text-xs" style={{ borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <span>생성: {new Date(project.created_at || Date.now()).toLocaleDateString('ko-KR')}</span>
                <span>수정: {new Date(project.updated_at || Date.now()).toLocaleDateString('ko-KR')}</span>
              </div>

              {/* 액션 버튼 */}
              <div className="mt-4 pt-4 flex justify-end space-x-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditProject?.(project);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="편집"
                  type="button"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onModelBuilder?.(project);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="모델 구축"
                  type="button"
                >
                  🏗️
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAnalysis?.(project);
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="결과 분석"
                  type="button"
                >
                  📊
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteProject?.(project.id || '');
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                  type="button"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;