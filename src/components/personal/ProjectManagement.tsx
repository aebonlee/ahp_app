import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  evaluators_count: number;
  completion_rate: number;
}

const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: '신제품 개발 우선순위 평가',
      description: '2024년 신제품 라인업 결정을 위한 AHP 분석',
      status: 'active',
      created_at: '2024-01-15',
      evaluators_count: 5,
      completion_rate: 75
    },
    {
      id: '2',
      name: '공급업체 선정 평가',
      description: '주요 부품 공급업체 선정을 위한 다기준 의사결정',
      status: 'active',
      created_at: '2024-01-10',
      evaluators_count: 3,
      completion_rate: 40
    },
    {
      id: '3',
      name: '마케팅 전략 우선순위',
      description: '2024년 마케팅 전략 수립을 위한 AHP 분석',
      status: 'completed',
      created_at: '2023-12-20',
      evaluators_count: 8,
      completion_rate: 100
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'paused': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행 중';
      case 'completed': return '완료됨';
      case 'paused': return '일시정지';
      default: return '알 수 없음';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            프로젝트 관리
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginTop: '0.5rem'
          }}>
            AHP 프로젝트를 생성하고 관리하세요
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/personal/projects/new')}
        >
          + 새 프로젝트
        </Button>
      </div>

      {/* 프로젝트 목록 */}
      <div style={{
        display: 'grid',
        gap: '1.5rem'
      }}>
        {projects.map(project => (
          <Card key={project.id} variant="elevated">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    {project.name}
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: `${getStatusColor(project.status)}20`,
                    color: getStatusColor(project.status),
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  {project.description}
                </p>

                {/* 프로젝트 정보 */}
                <div style={{
                  display: 'flex',
                  gap: '2rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>생성일:</span> {project.created_at}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>평가자:</span> {project.evaluators_count}명
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>완료율:</span> {project.completion_rate}%
                  </div>
                </div>

                {/* 진행률 바 */}
                <div style={{
                  marginTop: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '9999px',
                  height: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${project.completion_rate}%`,
                    height: '100%',
                    backgroundColor: project.status === 'completed' ? '#10b981' : '#3b82f6',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/personal/projects/${project.id}`)}
                >
                  상세보기
                </Button>
                {project.status === 'active' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/personal/projects/${project.id}/evaluate`)}
                  >
                    평가하기
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 빈 상태 */}
      {projects.length === 0 && (
        <Card variant="elevated">
          <div style={{
            textAlign: 'center',
            padding: '3rem'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              프로젝트가 없습니다
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem'
            }}>
              첫 번째 AHP 프로젝트를 생성해보세요
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/personal/projects/new')}
            >
              프로젝트 생성하기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectManagement;