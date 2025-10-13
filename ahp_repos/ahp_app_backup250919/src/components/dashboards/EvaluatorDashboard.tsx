import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { userManagementService } from '../../services/userManagementService';
import { EvaluatorUser, BaseUser } from '../../types/userTypes';

interface EvaluatorDashboardProps {
  user: EvaluatorUser | BaseUser;
}

interface ProjectAssignment {
  id: string;
  title: string;
  description: string;
  inviter: string;
  inviter_organization: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  deadline: string;
  progress: number;
  criteria_count: number;
  alternatives_count: number;
  total_evaluations: number;
  completed_evaluations: number;
}

const EvaluatorDashboard: React.FC<EvaluatorDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [evaluationStats, setEvaluationStats] = useState({
    totalAssignments: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0,
    averageRating: 0,
    totalRewards: 0
  });

  // 안전한 사용자 정보 접근을 위한 헬퍼
  const safeUser = React.useMemo(() => {
    const evaluatorUser = user as EvaluatorUser;
    return {
      id: user?.id || 'unknown',
      username: user?.username || 'evaluator',
      email: user?.email || 'evaluator@ahp-platform.com',
      first_name: user?.first_name || 'Evaluator',
      last_name: user?.last_name || 'User',
      user_type: user?.user_type || 'evaluator' as const,
      is_active: user?.is_active !== undefined ? user.is_active : true,
      profile: evaluatorUser?.profile || {
        display_name: '',
        organization: '',
        expertise_areas: [],
        bio: ''
      }
    };
  }, [user]);

  useEffect(() => {
    loadAssignments();
    loadEvaluationStats();
  }, []);

  const loadAssignments = async () => {
    // 실제로는 API 호출
    const mockAssignments: ProjectAssignment[] = [
      {
        id: 'proj_001',
        title: 'IT 시스템 선택을 위한 AHP 분석',
        description: '새로운 ERP 시스템 도입을 위한 의사결정 프로젝트입니다.',
        inviter: '김관리자',
        inviter_organization: 'ABC 컨설팅',
        status: 'in_progress',
        deadline: '2025-01-20',
        progress: 65,
        criteria_count: 8,
        alternatives_count: 5,
        total_evaluations: 40,
        completed_evaluations: 26
      },
      {
        id: 'proj_002',
        title: '마케팅 전략 우선순위 결정',
        description: '2024년 마케팅 전략의 우선순위를 결정하는 프로젝트입니다.',
        inviter: '박매니저',
        inviter_organization: 'XYZ 기업',
        status: 'pending',
        deadline: '2025-02-15',
        progress: 0,
        criteria_count: 6,
        alternatives_count: 4,
        total_evaluations: 24,
        completed_evaluations: 0
      },
      {
        id: 'proj_003',
        title: '공급업체 선정 평가',
        description: '원자재 공급업체 선정을 위한 다기준 의사결정 분석입니다.',
        inviter: '이부장',
        inviter_organization: '제조회사 DEF',
        status: 'completed',
        deadline: '2024-12-30',
        progress: 100,
        criteria_count: 10,
        alternatives_count: 7,
        total_evaluations: 70,
        completed_evaluations: 70
      }
    ];
    
    setAssignments(mockAssignments);
  };

  const loadEvaluationStats = async () => {
    // 실제로는 API 호출
    setEvaluationStats({
      totalAssignments: 3,
      completedEvaluations: 96,
      pendingEvaluations: 24,
      averageRating: 4.7,
      totalRewards: 150000
    });
  };

  const handleLogout = async () => {
    try {
      // Django 로그아웃 API 호출
      await fetch(`${process.env.REACT_APP_API_URL || 'https://ahp-django-backend.onrender.com'}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
    try {
      window.location.href = '/ahp_app/login';
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.reload();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'paused': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'in_progress': return '진행 중';
      case 'completed': return '완료';
      case 'paused': return '일시 정지';
      default: return '알 수 없음';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)',
      padding: '2rem' 
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#059669',
            margin: 0
          }}>
            📝 평가자 대시보드
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {safeUser.profile.display_name || `${safeUser.first_name} ${safeUser.last_name}`} • {safeUser.profile.organization || '평가자'}
            {safeUser.user_type === 'admin' && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                AEBON 개발자 모드
              </span>
            )}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#059669',
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            활성 평가자
          </div>
          
          {safeUser.user_type === 'admin' && (
            <div style={{ position: 'relative' }}>
              <select
                onChange={(e) => {
                  const mode = e.target.value;
                  if (mode === 'evaluator') return; // 현재 페이지
                  try {
                    window.location.href = `/ahp_app/${mode}`;
                  } catch (error) {
                    console.error('Navigation error:', error);
                    window.location.reload();
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                defaultValue="evaluator"
              >
                <option value="admin">📊 종합관리</option>
                <option value="personal">💼 개인서비스</option>
                <option value="evaluator">📝 평가자</option>
              </select>
            </div>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '2rem'
      }}>
        {[
          { id: 'overview', label: '개요', icon: '📊' },
          { id: 'assignments', label: '할당된 프로젝트', icon: '📋' },
          { id: 'history', label: '평가 이력', icon: '📚' },
          { id: 'profile', label: '프로필', icon: '👤' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #059669' : '2px solid transparent',
              color: activeTab === tab.id ? '#059669' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {activeTab === 'overview' && (
          <>
            {/* 통계 카드들 */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <Card title="총 배정 프로젝트" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '0.5rem'
                  }}>
                    {evaluationStats.totalAssignments}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    참여한 전체 프로젝트
                  </p>
                </div>
              </Card>
              
              <Card title="완료된 평가" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#3b82f6',
                    marginBottom: '0.5rem'
                  }}>
                    {evaluationStats.completedEvaluations}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    완료한 평가 항목
                  </p>
                </div>
              </Card>
              
              <Card title="대기 중인 평가" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                    marginBottom: '0.5rem'
                  }}>
                    {evaluationStats.pendingEvaluations}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    대기 중인 평가 항목
                  </p>
                </div>
              </Card>
              
              <Card title="평가 점수" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '0.5rem'
                  }}>
                    {evaluationStats.averageRating.toFixed(1)}★
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    평균 평가 품질
                  </p>
                </div>
              </Card>
            </div>

            {/* 긴급 알림 */}
            {assignments.some(a => getDaysUntilDeadline(a.deadline) <= 3 && a.status !== 'completed') && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>⚠️</span>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#92400e',
                    margin: 0
                  }}>
                    긴급: 마감일이 임박한 프로젝트가 있습니다!
                  </h4>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  {assignments
                    .filter(a => getDaysUntilDeadline(a.deadline) <= 3 && a.status !== 'completed')
                    .map(a => `"${a.title}" (${getDaysUntilDeadline(a.deadline)}일 남음)`)
                    .join(', ')
                  }
                </div>
              </div>
            )}

            {/* 최근 할당된 프로젝트 */}
            <Card title="최근 할당된 프로젝트" variant="bordered">
              <div style={{ display: 'grid', gap: '1rem' }}>
                {assignments.slice(0, 2).map((assignment) => (
                  <div
                    key={assignment.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '0.5rem',
                      backgroundColor: 'var(--bg-elevated)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {assignment.title}
                        </h4>
                        <p style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {assignment.inviter} • {assignment.inviter_organization}
                        </p>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: getStatusColor(assignment.status),
                        color: 'white',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {getStatusText(assignment.status)}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '1rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      <div>마감: {assignment.deadline}</div>
                      <div>진행률: {assignment.progress}%</div>
                      <div>기준: {assignment.criteria_count}개</div>
                      <div>대안: {assignment.alternatives_count}개</div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: '2px',
                        marginRight: '1rem'
                      }}>
                        <div style={{
                          width: `${assignment.progress}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(assignment.status),
                          borderRadius: '2px'
                        }} />
                      </div>
                      <Button variant="ghost" size="sm">
                        {assignment.status === 'pending' ? '평가 시작' : '계속하기'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 빠른 액션 */}
            <Card title="빠른 액션" variant="elevated">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <Button variant="primary" style={{ justifyContent: 'center' }}>
                  📝 대기 중인 평가 계속하기
                </Button>
                <Button variant="secondary" style={{ justifyContent: 'center' }}>
                  📊 완료된 프로젝트 결과 보기
                </Button>
                <Button variant="ghost" style={{ justifyContent: 'center' }}>
                  ⚙️ 알림 설정
                </Button>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'assignments' && (
          <Card title="할당된 프로젝트" variant="elevated">
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--card-bg)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {assignment.title}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        margin: '0 0 0.75rem 0',
                        lineHeight: '1.5'
                      }}>
                        {assignment.description}
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        margin: 0
                      }}>
                        초대자: <strong>{assignment.inviter}</strong> ({assignment.inviter_organization})
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: getStatusColor(assignment.status),
                        color: 'white',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        {getStatusText(assignment.status)}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: getDaysUntilDeadline(assignment.deadline) <= 3 ? '#dc2626' : 'var(--text-muted)'
                      }}>
                        {getDaysUntilDeadline(assignment.deadline) > 0 
                          ? `${getDaysUntilDeadline(assignment.deadline)}일 남음`
                          : '마감일 지남'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>마감일: </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        {assignment.deadline}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>평가 기준: </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        {assignment.criteria_count}개
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>평가 대안: </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        {assignment.alternatives_count}개
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>진행률: </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        {assignment.completed_evaluations}/{assignment.total_evaluations} ({assignment.progress}%)
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1, marginRight: '1rem' }}>
                      <div style={{
                        height: '6px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: '3px'
                      }}>
                        <div style={{
                          width: `${assignment.progress}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(assignment.status),
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                    <Button 
                      variant={assignment.status === 'pending' ? 'primary' : 'secondary'}
                      size="sm"
                    >
                      {assignment.status === 'pending' ? '평가 시작' : 
                       assignment.status === 'completed' ? '결과 보기' : '계속하기'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card title="평가 이력" variant="elevated">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                평가 이력 기능을 개발 중입니다.
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                과거 참여한 모든 프로젝트와 평가 결과를 확인할 수 있습니다.
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'profile' && (
          <Card title="프로필 정보" variant="elevated">
            <div style={{ padding: '1rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}>
                    기본 정보
                  </h4>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>표시 이름: </span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {safeUser.profile.display_name || `${safeUser.first_name} ${safeUser.last_name}`}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>이메일: </span>
                      <span style={{ color: 'var(--text-primary)' }}>{safeUser.email}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>소속: </span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {safeUser.profile.organization || '미설정'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}>
                    전문 분야
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {safeUser.profile.expertise_areas && safeUser.profile.expertise_areas.length > 0 ? (
                      safeUser.profile.expertise_areas.map((area, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #059669',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            color: '#059669'
                          }}
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)'
                      }}>
                        전문 분야가 설정되지 않았습니다.
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {safeUser.profile.bio && (
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}>
                    소개
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '0.5rem'
                  }}>
                    {safeUser.profile.bio}
                  </p>
                </div>
              )}
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Button variant="secondary">
                  프로필 수정
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EvaluatorDashboard;