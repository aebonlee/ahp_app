import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import PairwiseEvaluation from './PairwiseEvaluation';
import DirectInputEvaluation from './DirectInputEvaluation';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import authService from '../../services/authService';

interface EvaluatorUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'evaluator';
}

interface EvaluatorDashboardProps {
  user: EvaluatorUser;
  onSwitchToAdmin?: () => void;
  onLogout?: () => void;
}

interface ProjectInvitation {
  id: string;
  title: string;
  description: string;
  invitedBy: string;
  invitedAt: Date;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  evaluationMethod: 'pairwise' | 'direct' | 'mixed';
  progress: number;
  totalComparisons: number;
  completedComparisons: number;
  surveyRequired: boolean;
  surveyCompleted: boolean;
}

const EvaluatorDashboard: React.FC<EvaluatorDashboardProps> = ({ 
  user, 
  onSwitchToAdmin,
  onLogout 
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'evaluation' | 'survey' | 'profile'>('dashboard');
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 초대받은 프로젝트 목록 조회
  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      try {
        const token = authService.getAccessToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.INVITATIONS.LIST}?role=evaluator`,
          { headers, credentials: 'include' }
        );

        if (res.ok) {
          const data = await res.json();
          const items: any[] = Array.isArray(data) ? data : (data.results ?? []);
          const mapped: ProjectInvitation[] = items.map((inv: any) => ({
            id: inv.project ?? inv.project_id ?? inv.id,
            title: inv.project_title ?? inv.title ?? '제목 없음',
            description: inv.project_description ?? inv.description ?? '',
            invitedBy: inv.invited_by_name ?? inv.invited_by ?? '',
            invitedAt: new Date(inv.invited_at ?? inv.created_at ?? Date.now()),
            dueDate: inv.due_date ? new Date(inv.due_date) : undefined,
            status: inv.status === 'accepted' ? 'pending' : (inv.status ?? 'pending'),
            evaluationMethod: inv.evaluation_method ?? 'pairwise',
            progress: inv.progress ?? 0,
            totalComparisons: inv.total_comparisons ?? 0,
            completedComparisons: inv.completed_comparisons ?? 0,
            surveyRequired: inv.survey_required ?? false,
            surveyCompleted: inv.survey_completed ?? false,
          }));
          setInvitations(mapped);
        }
      } catch (error) {
        console.error('초대 목록 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          안녕하세요, {user.firstName} {user.lastName}님! 👋
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          전문가로서 소중한 의견을 공유해주셔서 감사합니다.
        </p>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
            {invitations.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            총 초대 프로젝트
          </div>
        </Card>
        
        <Card variant="default" className="p-4 text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--status-warning-text)' }}>
            {invitations.filter(p => p.status === 'pending').length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            대기 중
          </div>
        </Card>
        
        <Card variant="default" className="p-4 text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--status-info-text)' }}>
            {invitations.filter(p => p.status === 'in_progress').length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            진행 중
          </div>
        </Card>
        
        <Card variant="default" className="p-4 text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--status-success-text)' }}>
            {invitations.filter(p => p.status === 'completed').length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            완료
          </div>
        </Card>
      </div>

      {/* 최근 초대 프로젝트들 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            📋 최근 초대 프로젝트
          </h2>
          <Button 
            variant="outline" 
            onClick={() => setActiveView('projects')}
          >
            전체 보기
          </Button>
        </div>
        
        <div className="space-y-4">
          {invitations.slice(0, 3).map(project => (
            <Card key={project.id} variant="outlined" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold mr-3" style={{ color: 'var(--text-primary)' }}>
                      {project.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'completed' ? '완료' :
                       project.status === 'in_progress' ? '진행중' : '대기'}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {project.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>👨‍🏫 {project.invitedBy}</span>
                    <span>📅 {project.invitedAt.toLocaleDateString()}</span>
                    {project.dueDate && (
                      <span>⏰ 마감: {project.dueDate.toLocaleDateString()}</span>
                    )}
                  </div>
                  {project.status !== 'pending' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        진행률: {project.progress}% ({project.completedComparisons}/{project.totalComparisons})
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  {project.status === 'pending' ? (
                    <Button 
                      variant="primary"
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveView('evaluation');
                      }}
                    >
                      평가 시작
                    </Button>
                  ) : project.status === 'in_progress' ? (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveView('evaluation');
                      }}
                    >
                      평가 계속
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveView('evaluation');
                      }}
                    >
                      결과 보기
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 도움말 및 가이드 */}
      <Card variant="gradient" className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            평가자 가이드
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            AHP 평가 방법과 시스템 사용법을 자세히 알아보세요
          </p>
          <Button variant="outline">
            📖 평가 가이드 보기
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          📋 모든 초대 프로젝트
        </h2>
        <Button variant="outline" onClick={() => setActiveView('dashboard')}>
          ← 대시보드로
        </Button>
      </div>

      {/* 필터링 및 정렬 옵션 */}
      <div className="flex space-x-4">
        <select 
          className="px-3 py-2 border rounded-lg"
          style={{ 
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="all">모든 상태</option>
          <option value="pending">대기 중</option>
          <option value="in_progress">진행 중</option>
          <option value="completed">완료</option>
        </select>
        
        <select 
          className="px-3 py-2 border rounded-lg"
          style={{ 
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="newest">최신 순</option>
          <option value="oldest">오래된 순</option>
          <option value="deadline">마감일 순</option>
          <option value="progress">진행률 순</option>
        </select>
      </div>

      {/* 프로젝트 목록 */}
      <div className="space-y-4">
        {invitations.map(project => (
          <Card key={project.id} variant="default" className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <h3 className="text-xl font-semibold mr-3" style={{ color: 'var(--text-primary)' }}>
                    {project.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status === 'completed' ? '✅ 완료' :
                     project.status === 'in_progress' ? '🔄 진행중' : '⏳ 대기'}
                  </span>
                </div>
                
                <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      📊 프로젝트 정보
                    </h4>
                    <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div>👨‍🏫 연구자: {project.invitedBy}</div>
                      <div>📅 초대일: {project.invitedAt.toLocaleDateString()}</div>
                      {project.dueDate && (
                        <div>⏰ 마감일: {project.dueDate.toLocaleDateString()}</div>
                      )}
                      <div>🔧 평가방법: {
                        project.evaluationMethod === 'pairwise' ? '쌍대비교' :
                        project.evaluationMethod === 'direct' ? '직접입력' :
                        '혼합방식'
                      }</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      📈 진행 현황
                    </h4>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span>진행률: {project.progress}%</span>
                        <span>{project.completedComparisons}/{project.totalComparisons} 완료</span>
                      </div>
                      {project.surveyRequired && (
                        <div className="text-sm">
                          📋 설문조사: {project.surveyCompleted ? '✅ 완료' : '⏳ 미완료'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                {project.status === 'pending' ? (
                  <Button 
                    variant="primary"
                    onClick={() => {
                      setSelectedProject(project);
                      setActiveView('evaluation');
                    }}
                  >
                    🚀 평가 시작
                  </Button>
                ) : project.status === 'in_progress' ? (
                  <>
                    <Button 
                      variant="primary"
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveView('evaluation');
                      }}
                    >
                      🔄 평가 계속
                    </Button>
                    {project.surveyRequired && !project.surveyCompleted && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(project);
                          setActiveView('survey');
                        }}
                      >
                        📋 설문조사
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveView('evaluation');
                      }}
                    >
                      📊 결과 보기
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                    >
                      📧 인증서 다운로드
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEvaluation = () => {
    if (!selectedProject) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-4">프로젝트를 선택해주세요</h3>
          <Button onClick={() => setActiveView('projects')}>
            프로젝트 목록으로
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedProject.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {selectedProject.description}
            </p>
          </div>
          <Button variant="outline" onClick={() => setActiveView('projects')}>
            ← 프로젝트 목록
          </Button>
        </div>

        {/* 평가 방법에 따른 컴포넌트 렌더링 */}
        {selectedProject.evaluationMethod === 'pairwise' || selectedProject.evaluationMethod === 'mixed' ? (
          <PairwiseEvaluation 
            projectId={selectedProject.id}
            projectTitle={selectedProject.title}
            onBack={() => setActiveView('projects')}
            onComplete={() => {
              // 프로젝트 상태 업데이트
              setInvitations(prev => 
                prev.map(p => 
                  p.id === selectedProject.id 
                    ? { ...p, status: 'completed', progress: 100, completedComparisons: p.totalComparisons }
                    : p
                )
              );
              setActiveView('projects');
            }}
          />
        ) : (
          <DirectInputEvaluation 
            projectId={selectedProject.id}
            projectTitle={selectedProject.title}
            onBack={() => setActiveView('projects')}
            onComplete={() => {
              setInvitations(prev => 
                prev.map(p => 
                  p.id === selectedProject.id 
                    ? { ...p, status: 'completed', progress: 100 }
                    : p
                )
              );
              setActiveView('projects');
            }}
          />
        )}
      </div>
    );
  };

  // 메인 렌더링
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">초대 프로젝트를 불러오는 중...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  switch (activeView) {
    case 'projects':
      return renderProjects();
    case 'evaluation':
      return renderEvaluation();
    default:
      return renderDashboard();
  }
};

export default EvaluatorDashboard;