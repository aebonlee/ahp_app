import React, { useState, useEffect } from 'react';
import dataService, { ProjectData } from '../../services/dataService';

interface MyProjectsProps {
  onProjectSelect?: (project: ProjectData) => void;
  onCreateNew?: () => void;
}

const MyProjects: React.FC<MyProjectsProps> = ({ onProjectSelect, onCreateNew }) => {
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="text-4xl mb-4">⏳</div>
          <p>프로젝트 로딩 중...</p>
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
            📂 내 프로젝트
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            총 {projects.length}개의 프로젝트
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>새 프로젝트</span>
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 프로젝트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex space-x-2">
          {(['all', 'active', 'completed', 'draft'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? '전체' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* 프로젝트 목록 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl font-medium mb-2">프로젝트가 없습니다</p>
          <p className="text-gray-500 mb-6">
            {searchTerm ? '검색 결과가 없습니다' : '첫 번째 프로젝트를 생성해보세요'}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              새 프로젝트 만들기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => onProjectSelect?.(project)}
              className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* 프로젝트 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-lg flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
                  {project.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status || 'draft')}`}>
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
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                    {project.criteria_count || 0}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>기준</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
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
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(project as any).completion_rate || 0}%` }}
                  />
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="mt-4 pt-4 border-t flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>생성: {new Date(project.created_at || Date.now()).toLocaleDateString('ko-KR')}</span>
                <span>수정: {new Date(project.updated_at || Date.now()).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;