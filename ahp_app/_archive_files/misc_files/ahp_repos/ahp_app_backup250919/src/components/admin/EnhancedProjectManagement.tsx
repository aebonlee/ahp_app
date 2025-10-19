/**
 * 향상된 프로젝트 관리 시스템
 * 프로젝트 생성, 수정, 삭제, 상태 관리 및 워크플로우 통합
 */

import React, { useState, useEffect } from 'react';
import EnhancedProjectCreationForm, { ProjectFormData, EvaluationMethod, ProjectStatus } from './EnhancedProjectCreationForm';
import AHPWorkflowManager from '../workflow/AHPWorkflowManager';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  criteria_count?: number;
  alternatives_count?: number;
  evaluator_count?: number;
}

interface EnhancedProjectManagementProps {
  projects?: Project[];
  onCreateProject?: (projectData: ProjectFormData) => Promise<any>;
  onUpdateProject?: (projectId: string, projectData: ProjectFormData) => Promise<any>;
  onDeleteProject?: (projectId: string) => Promise<any>;
}

const EnhancedProjectManagement: React.FC<EnhancedProjectManagementProps> = ({
  projects = [],
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'workflow'>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'status'>('updated');

  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    'creating': { label: '생성중', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
    'waiting': { label: '대기중', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
    'evaluating': { label: '평가중', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
    'completed': { label: '완료', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
    'draft': { label: '초안', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' }
  };

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const handleCreateProject = async (projectData: ProjectFormData) => {
    try {
      if (onCreateProject) {
        await onCreateProject(projectData);
      }
      setCurrentView('list');
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    }
  };

  const handleUpdateProject = async (projectData: ProjectFormData) => {
    if (!selectedProject || !onUpdateProject) return;
    
    try {
      await onUpdateProject(selectedProject.id.toString(), projectData);
      setCurrentView('list');
      setSelectedProject(null);
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!onDeleteProject) return;
    
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await onDeleteProject(projectId.toString());
      } catch (error) {
        console.error('프로젝트 삭제 실패:', error);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (currentView === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            ← 프로젝트 목록으로 돌아가기
          </button>
        </div>
        
        <EnhancedProjectCreationForm
          onSubmit={handleCreateProject}
          onCancel={() => setCurrentView('list')}
        />
      </div>
    );
  }

  if (currentView === 'edit' && selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentView('list');
              setSelectedProject(null);
            }}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            ← 프로젝트 목록으로 돌아가기
          </button>
        </div>
        
        <EnhancedProjectCreationForm
          initialData={{
            id: selectedProject.id.toString(),
            title: selectedProject.title,
            description: selectedProject.description,
            evaluationMethod: 'pairwise-practical' as EvaluationMethod,
            status: selectedProject.status as ProjectStatus
          }}
          isEditing={true}
          onSubmit={handleUpdateProject}
          onCancel={() => {
            setCurrentView('list');
            setSelectedProject(null);
          }}
        />
      </div>
    );
  }

  if (currentView === 'workflow' && selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentView('list');
              setSelectedProject(null);
            }}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            ← 프로젝트 목록으로 돌아가기
          </button>
        </div>
        
        <AHPWorkflowManager
          projectId={selectedProject.id.toString()}
          onWorkflowComplete={(results) => {
            console.log('AHP 워크플로우 완료:', results);
            setCurrentView('list');
            setSelectedProject(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">프로젝트 관리</h2>
          <p className="text-gray-600">AHP 프로젝트를 생성하고 관리하세요</p>
        </div>
        <button
          onClick={() => setCurrentView('create')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          새 프로젝트 생성
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="프로젝트 이름 또는 설명 검색..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태 필터</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">모든 상태</option>
              <option value="draft">초안</option>
              <option value="creating">생성중</option>
              <option value="waiting">대기중</option>
              <option value="evaluating">평가중</option>
              <option value="completed">완료</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="updated">최근 수정</option>
              <option value="created">생성 일자</option>
              <option value="name">프로젝트 이름</option>
              <option value="status">상태</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              총 {filteredAndSortedProjects.length}개 프로젝트
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {projects.length === 0 ? '첫 번째 프로젝트를 생성해보세요!' : '검색 결과가 없습니다'}
          </h3>
          <p className="text-gray-600 mb-6">
            {projects.length === 0 
              ? 'AHP 분석을 통해 체계적이고 과학적인 의사결정을 시작하세요.' 
              : '다른 검색어나 필터 조건을 시도해보세요.'}
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setCurrentView('create')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              새 프로젝트 생성
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((project) => {
            const status = statusMap[project.status] || statusMap['draft'];
            
            return (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border">
                <div className="p-6">
                  {/* 상태 배지 */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mb-3 ${status.bgColor} ${status.color}`}>
                    {status.label}
                  </div>
                  
                  {/* 프로젝트 제목 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  
                  {/* 프로젝트 설명 */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  {/* 프로젝트 통계 */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{project.criteria_count || 0}</div>
                      <div className="text-xs text-gray-600">기준</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{project.alternatives_count || 0}</div>
                      <div className="text-xs text-gray-600">대안</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-600">{project.evaluator_count || 0}</div>
                      <div className="text-xs text-gray-600">평가자</div>
                    </div>
                  </div>
                  
                  {/* 날짜 정보 */}
                  <div className="text-xs text-gray-500 mb-4">
                    <div>생성: {formatDate(project.created_at)}</div>
                    <div>수정: {formatDate(project.updated_at)}</div>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setCurrentView('workflow');
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      AHP 분석
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setCurrentView('edit');
                      }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedProjectManagement;