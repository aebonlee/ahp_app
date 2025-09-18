import React, { useState } from 'react';
// useEffect - 현재 미사용
import Card from '../common/Card';
import Button from '../common/Button';
import ScreenID from '../common/ScreenID';
import { MESSAGES } from '../../constants/messages';
import { SCREEN_IDS } from '../../constants/screenIds';

interface AssignedProject {
  id: string;
  title: string;
  description: string;
  status: 'assigned' | 'in_progress' | 'completed';
  progress: number;
  deadline?: string;
  adminName: string;
  evaluationMethod: 'pairwise' | 'direct';
  workshopActive?: boolean;
}

interface ProjectSelectionProps {
  evaluatorId: string;
  onProjectSelect: (projectId: string, projectTitle: string, evaluationMethod: 'pairwise' | 'direct') => void;
}

const ProjectSelection: React.FC<ProjectSelectionProps> = ({ 
  evaluatorId, 
  onProjectSelect 
}) => {
  const [assignedProjects] = useState<AssignedProject[]>([
  // setAssignedProjects - 현재 미사용
    {
      id: '1',
      title: 'IT 시스템 선택 프로젝트',
      description: '회사의 새로운 IT 인프라 시스템을 선택하기 위한 AHP 분석 프로젝트입니다.',
      status: 'assigned',
      progress: 0,
      deadline: '2024-12-31',
      adminName: '김관리자',
      evaluationMethod: 'pairwise',
      workshopActive: true
    },
    {
      id: '2',
      title: '마케팅 전략 우선순위 분석',
      description: '2024년 마케팅 전략의 우선순위를 결정하기 위한 의사결정 분석입니다.',
      status: 'in_progress',
      progress: 65,
      deadline: '2024-11-15',
      adminName: '이매니저',
      evaluationMethod: 'direct',
      workshopActive: false
    },
    {
      id: '3',
      title: '공급업체 선정 평가',
      description: '주요 부품 공급업체 선정을 위한 다기준 의사결정 분석 프로젝트입니다.',
      status: 'completed',
      progress: 100,
      deadline: '2024-10-30',
      adminName: '박팀장',
      evaluationMethod: 'pairwise',
      workshopActive: false
    }
  ]);

  const getStatusBadge = (status: AssignedProject['status']) => {
    const styles = {
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };

    const labels = {
      assigned: '배정됨',
      in_progress: '진행중',
      completed: '완료'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-300';
    if (progress < 50) return 'bg-red-400';
    if (progress < 100) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getMethodBadge = (method: AssignedProject['evaluationMethod']) => {
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        method === 'pairwise' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-indigo-100 text-indigo-800'
      }`}>
        {method === 'pairwise' ? '쌍대비교' : '직접입력'}
      </span>
    );
  };

  const handleProjectEnter = (project: AssignedProject) => {
    if (project.status === 'completed') {
      return; // 완료된 프로젝트는 재입장 불가
    }
    
    // Workshop access restriction check
    if (!project.workshopActive) {
      alert(MESSAGES.WORKSHOP_ACCESS_RESTRICTED);
      return;
    }
    
    onProjectSelect(project.id, project.title, project.evaluationMethod);
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return '';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `마감 ${Math.abs(diffDays)}일 초과`;
    } else if (diffDays === 0) {
      return '오늘 마감';
    } else if (diffDays <= 7) {
      return `${diffDays}일 남음`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenID id={SCREEN_IDS.RATER.PROJECT_SELECT} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          단계 1 — 프로젝트 선택
        </h1>
        <p className="text-gray-600">
          배정받은 평가 프로젝트를 선택하여 평가를 시작하세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-900">{assignedProjects.length}</div>
            <div className="text-sm text-blue-700">총 배정 프로젝트</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-900">
              {assignedProjects.filter(p => p.status === 'in_progress').length}
            </div>
            <div className="text-sm text-yellow-700">진행중</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-900">
              {assignedProjects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">완료</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-900">
              {Math.round(assignedProjects.reduce((acc, p) => acc + p.progress, 0) / assignedProjects.length)}%
            </div>
            <div className="text-sm text-purple-700">평균 진행률</div>
          </div>
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">배정 프로젝트</h2>
          
          {assignedProjects.length === 0 ? (
            <Card title="배정된 프로젝트 없음">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">현재 배정받은 평가 프로젝트가 없습니다.</p>
                <p className="text-sm text-gray-400">
                  관리자가 새로운 프로젝트를 배정하면 여기에 표시됩니다.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignedProjects.map((project) => (
                <Card key={project.id}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                        {getStatusBadge(project.status)}
                        {getMethodBadge(project.evaluationMethod)}
                        {/* Workshop Status Badge */}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.workshopActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {project.workshopActive ? '워크숍 진행중' : '워크숍 대기중'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">관리자:</span>
                          <span className="ml-2 font-medium">{project.adminName}</span>
                        </div>
                        {project.deadline && (
                          <div>
                            <span className="text-gray-500">마감일:</span>
                            <span className={`ml-2 font-medium ${
                              formatDeadline(project.deadline).includes('초과') || formatDeadline(project.deadline).includes('오늘')
                                ? 'text-red-600'
                                : formatDeadline(project.deadline).includes('일 남음')
                                ? 'text-orange-600'
                                : 'text-gray-700'
                            }`}>
                              {formatDeadline(project.deadline)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">진행률</span>
                          <span className="text-xs font-medium text-gray-700">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="lg:ml-6">
                      <Button
                        onClick={() => handleProjectEnter(project)}
                        variant={project.status === 'completed' || !project.workshopActive ? 'secondary' : 'primary'}
                        size="lg"
                        disabled={project.status === 'completed' || !project.workshopActive}
                        className="w-full lg:w-auto"
                      >
                        {project.status === 'completed' ? '완료됨' : 
                         !project.workshopActive ? '워크숍 대기중' :
                         project.status === 'in_progress' ? '계속하기' : '입장'}
                      </Button>
                      
                      {/* Workshop restriction warning */}
                      {!project.workshopActive && project.status !== 'completed' && (
                        <div className="mt-2 text-xs text-red-600">
                          {MESSAGES.WORKSHOP_ACCESS_RESTRICTED}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Help Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 평가 안내</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>쌍대비교</strong>: 기준들을 두 개씩 비교하여 상대적 중요도를 평가합니다</li>
            <li>• <strong>직접입력</strong>: 각 항목에 대해 직접 수치를 입력하여 평가합니다</li>
            <li>• 평가를 중단하더라도 진행 상황이 자동으로 저장됩니다</li>
            <li>• 완료된 프로젝트는 결과를 확인할 수 있지만 수정할 수 없습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelection;