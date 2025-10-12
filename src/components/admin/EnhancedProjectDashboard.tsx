import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ProjectCreationForm, { ProjectFormData, ProjectStatus } from './ProjectCreationForm';
import ModelConfiguration from './ModelConfiguration';
import HelpModal from '../common/HelpModal';

interface Project extends ProjectFormData {
  id: string;
  evaluatorCount?: number;
  completionRate?: number;
  lastActivity?: string;
}

const EnhancedProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'manage'>('list');
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Load demo projects
  useEffect(() => {
    const demoProjects: Project[] = [
      {
        id: '1',
        name: 'ERP 시스템 선정 프로젝트',
        description: '우리 회사에 가장 적합한 ERP 시스템을 선정하기 위한 AHP 분석',
        evaluationMethod: 'pairwise-practical',
        status: 'evaluating',
        evaluatorCount: 5,
        completionRate: 60,
        createdAt: '2024-11-01T10:00:00Z',
        lastActivity: '2시간 전'
      },
      {
        id: '2',
        name: '신제품 개발 우선순위 결정',
        description: '2025년 신제품 개발 우선순위를 결정하기 위한 다기준 의사결정',
        evaluationMethod: 'direct-input',
        status: 'waiting',
        evaluatorCount: 0,
        completionRate: 0,
        createdAt: '2024-11-10T14:30:00Z',
        lastActivity: '1일 전'
      },
      {
        id: '3',
        name: '공급업체 평가 및 선정',
        description: '주요 부품 공급업체 평가 및 최적 파트너 선정',
        evaluationMethod: 'pairwise-theoretical',
        status: 'completed',
        evaluatorCount: 8,
        completionRate: 100,
        createdAt: '2024-10-15T09:00:00Z',
        lastActivity: '1주일 전'
      }
    ];
    setProjects(demoProjects);
  }, []);

  const handleCreateProject = (projectData: ProjectFormData) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      evaluatorCount: 0,
      completionRate: 0,
      lastActivity: '방금 전'
    };
    
    setProjects([newProject, ...projects]);
    setShowCreateForm(false);
    setActiveTab('list');
  };

  const handleEditProject = (projectData: ProjectFormData) => {
    setProjects(projects.map(p => 
      p.id === projectData.id 
        ? { ...p, ...projectData, lastActivity: '방금 전' } 
        : p
    ));
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('프로젝트를 삭제하시겠습니까? 모든 평가 데이터가 삭제됩니다.')) {
      setProjects(projects.filter(p => p.id !== projectId));
      setSelectedProject(null);
    }
  };

  const handleChangeStatus = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, status: newStatus, lastActivity: '방금 전' } 
        : p
    ));
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      name: `${project.name} (복사본)`,
      status: 'creating',
      evaluatorCount: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      lastActivity: '방금 전'
    };
    
    setProjects([duplicatedProject, ...projects]);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      creating: { label: '생성중', color: 'bg-gray-100 text-gray-800' },
      waiting: { label: '대기중', color: 'bg-yellow-100 text-yellow-800' },
      evaluating: { label: '평가중', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '완료', color: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getEvaluationMethodLabel = (method: string) => {
    const labels = {
      'pairwise-practical': '쌍대비교-실용',
      'direct-input': '직접입력',
      'pairwise-theoretical': '쌍대비교-이론'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const handleModelSave = (criteria: any[], alternatives: any[]) => {
    if (selectedProject) {
      // Update project status to waiting after model is configured
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, status: 'waiting' as ProjectStatus, lastActivity: '방금 전' }
          : p
      ));
      setShowModelConfig(false);
      setSelectedProject(null);
    }
  };

  if (showCreateForm || editingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProject ? '프로젝트 수정' : '새 프로젝트 생성'}
          </h2>
        </div>
        
        <ProjectCreationForm
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingProject(null);
          }}
          initialData={editingProject || undefined}
          isEditing={!!editingProject}
        />
      </div>
    );
  }

  if (showModelConfig && selectedProject && selectedProject.status !== undefined) {
    return (
      <ModelConfiguration
        project={selectedProject}
        onBack={() => {
          setShowModelConfig(false);
          setSelectedProject(null);
        }}
        onSave={handleModelSave}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">프로젝트 관리</h2>
          <p className="mt-1 text-sm text-gray-600">
            AHP 의사결정 프로젝트를 생성하고 관리합니다
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => setShowHelpModal(true)}
          >
            ❓ 시작하기
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
          >
            + 새 프로젝트 생성
          </Button>
        </div>
      </div>

      {/* Process Guide */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 관리 프로세스</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</span>
                <span className="ml-2">프로젝트 생성</span>
              </span>
              <span className="text-gray-400">→</span>
              <span className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">2</span>
                <span className="ml-2">모델 구축</span>
              </span>
              <span className="text-gray-400">→</span>
              <span className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">3</span>
                <span className="ml-2">평가자 배정</span>
              </span>
              <span className="text-gray-400">→</span>
              <span className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">4</span>
                <span className="ml-2">평가 진행</span>
              </span>
              <span className="text-gray-400">→</span>
              <span className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">5</span>
                <span className="ml-2">결과 분석</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">생성된 프로젝트가 없습니다</p>
              <p className="text-sm mt-2">새 프로젝트를 생성하여 시작하세요</p>
            </div>
          </Card>
        ) : (
          projects.map(project => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    {getStatusBadge(project.status || 'creating')}
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getEvaluationMethodLabel(project.evaluationMethod)}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">
                    {project.description}
                  </p>
                  
                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                    <span>평가자: {project.evaluatorCount || 0}명</span>
                    <span>진행률: {project.completionRate || 0}%</span>
                    <span>최근 활동: {project.lastActivity}</span>
                  </div>
                  
                  {project.status && project.status === 'evaluating' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowModelConfig(true);
                    }}
                  >
                    모델 구성
                  </Button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                      disabled={project.status === 'completed'}
                    >
                      수정
                    </button>
                    
                    <button
                      onClick={() => handleDuplicateProject(project)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      복사
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                  
                  {project.status && project.status === 'waiting' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleChangeStatus(project.id, 'evaluating')}
                    >
                      평가 시작
                    </Button>
                  )}
                  
                  {project.status && project.status === 'evaluating' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleChangeStatus(project.id, 'completed')}
                    >
                      평가 종료
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Status Legend */}
      <Card className="bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-3">프로젝트 상태 설명</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="flex items-center">
              {getStatusBadge('creating')}
              <span className="ml-2">모델 구성 중</span>
            </span>
          </div>
          <div>
            <span className="flex items-center">
              {getStatusBadge('waiting')}
              <span className="ml-2">평가자 배정 대기</span>
            </span>
          </div>
          <div>
            <span className="flex items-center">
              {getStatusBadge('evaluating')}
              <span className="ml-2">평가 진행 중</span>
            </span>
          </div>
          <div>
            <span className="flex items-center">
              {getStatusBadge('completed')}
              <span className="ml-2">평가 완료</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal
          isVisible={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          helpType="getting-started"
        />
      )}
    </div>
  );
};

export default EnhancedProjectDashboard;