/**
 * Django Project Management Component
 * Django API와 연동된 프로젝트 관리 컴포넌트
 */
import React, { useState, useEffect } from 'react';
import djangoApiService from '../../services/djangoApiService';
import useDjangoAuth from '../../hooks/useDjangoAuth';

interface Project {
  id: string;
  title: string;
  description: string;
  objective: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  criteriaCount: number;
  alternativeCount: number;
  evaluatorCount: number;
  completionRate: number;
}

interface ProjectFormData {
  title: string;
  description: string;
  objective: string;
}

const DjangoProjectManagement: React.FC = () => {
  const { user, isAuthenticated } = useDjangoAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    objective: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, currentPage, searchTerm]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await djangoApiService.getProjects({
        page: currentPage,
        search: searchTerm,
      });

      if (response.success) {
        setProjects(response.projects || []);
      } else {
        setError(response.message || '프로젝트 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      console.error('Load projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await djangoApiService.createProject(formData);
      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        loadProjects();
      } else {
        setError(response.message || '프로젝트 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('프로젝트 생성 중 오류가 발생했습니다.');
      console.error('Create project error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setLoading(true);
    try {
      const response = await djangoApiService.updateProject(editingProject.id, formData);
      if (response.success) {
        setEditingProject(null);
        resetForm();
        loadProjects();
      } else {
        setError(response.message || '프로젝트 업데이트에 실패했습니다.');
      }
    } catch (err) {
      setError('프로젝트 업데이트 중 오류가 발생했습니다.');
      console.error('Update project error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      const response = await djangoApiService.deleteProject(projectId);
      if (response.success) {
        loadProjects();
      } else {
        setError(response.message || '프로젝트 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('프로젝트 삭제 중 오류가 발생했습니다.');
      console.error('Delete project error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      objective: '',
    });
  };

  const startEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      objective: project.objective,
    });
    setShowCreateForm(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">프로젝트 관리</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showCreateForm ? '취소' : '프로젝트 생성'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">
            {editingProject ? '프로젝트 수정' : '새 프로젝트 생성'}
          </h3>
          <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 목표
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingProject(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '처리중...' : editingProject ? '수정' : '생성'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">프로젝트가 없습니다.</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid gap-4 p-6">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    {project.objective && (
                      <p className="text-sm text-gray-500 mt-1">목표: {project.objective}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>기준: {project.criteriaCount}개</span>
                      <span>대안: {project.alternativeCount}개</span>
                      <span>평가자: {project.evaluatorCount}명</span>
                      <span>완료율: {project.completionRate}%</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => startEdit(project)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DjangoProjectManagement;