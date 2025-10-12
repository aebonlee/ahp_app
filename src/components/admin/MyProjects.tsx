import React, { useState, useEffect, useCallback } from 'react';
import dataService from '../../services/dataService_clean';
import { ProjectData } from '../../services/api';


interface MyProjectsProps {
  onProjectSelect?: (project: ProjectData) => void;
  onCreateNew?: () => void;
  onEditProject?: (project: ProjectData) => void;
  onDeleteProject?: (projectId: string) => void;
  onModelBuilder?: (project: ProjectData) => void;
  onAnalysis?: (project: ProjectData) => void;
  refreshTrigger?: number; // 이 값이 변경되면 프로젝트 새로고침
}

const MyProjects: React.FC<MyProjectsProps> = ({ 
  onProjectSelect, 
  onCreateNew, 
  onEditProject, 
  onDeleteProject, 
  onModelBuilder, 
  onAnalysis,
  refreshTrigger
}) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'draft' | 'trash'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (filter === 'trash') {
        // 휴지통 프로젝트 조회
        data = await dataService.getTrashedProjects();
      } else {
        // 일반 프로젝트 조회
        data = await dataService.getProjects();
      }
      
      // 프로젝트별 통계 정보를 기본값으로 설정 (API 실패 시)
      if (data && Array.isArray(data)) {
        const projectsWithStats = data.map((project) => {
          // 진행률 계산 (기본 로직)
          let completionRate = 0;
          const criteriaCount = project.criteria_count || 0;
          const alternativesCount = project.alternatives_count || 0;
          
          if (project.status === 'completed') {
            completionRate = 100;
          } else if (project.status === 'active') {
            completionRate = Math.min(80, (criteriaCount * 20) + (alternativesCount * 15));
          } else if (criteriaCount > 0 || alternativesCount > 0) {
            completionRate = Math.min(50, (criteriaCount * 10) + (alternativesCount * 8));
          }
          
          return {
            ...project,
            criteria_count: criteriaCount,
            alternatives_count: alternativesCount,
            completionRate: completionRate
          };
        });
        setProjects(projectsWithStats);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // refreshTrigger가 변경되면 프로젝트 목록 새로고침
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchProjects();
    }
  }, [refreshTrigger, fetchProjects]);

  // filter가 변경되면 프로젝트 목록 새로고침
  useEffect(() => {
    fetchProjects();
  }, [filter, fetchProjects]);

  const filteredProjects = projects.filter(project => {
    // 휴지통 필터의 경우 별도 처리 (이미 fetchProjects에서 필터링됨)
    if (filter === 'trash') return true;
    
    // 일반 필터
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // green
    if (percentage >= 50) return '#F59E0B'; // yellow
    if (percentage >= 20) return '#3B82F6'; // blue
    return '#6B7280'; // gray
  };

  const getProgressText = (project: ProjectData) => {
    const criteriaCount = project.criteria_count || 0;
    const alternativesCount = project.alternatives_count || 0;
    const completionRate = project.completionRate || 0;

    if (completionRate === 0) {
      return '아직 시작하지 않음';
    } else if (completionRate === 100) {
      return '프로젝트 완료';
    } else if (criteriaCount === 0) {
      return '기준 설정 필요';
    } else if (alternativesCount === 0) {
      return '대안 추가 필요';
    } else if (completionRate < 50) {
      return '기본 설정 진행 중';
    } else if (completionRate < 80) {
      return '평가 준비 단계';
    } else {
      return '평가 진행 중';
    }
  };

  // 휴지통 프로젝트 복원
  const handleRestoreProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`"${projectTitle}" 프로젝트를 복원하시겠습니까?`)) {
      return;
    }

    try {
      const success = await dataService.restoreProject(projectId);
      if (success) {
        alert('프로젝트가 성공적으로 복원되었습니다.');
        fetchProjects(); // 목록 새로고침
      } else {
        alert('프로젝트 복원에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to restore project:', error);
      alert('프로젝트 복원 중 오류가 발생했습니다.');
    }
  };

  // 프로젝트 영구 삭제
  const handlePermanentDelete = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`"${projectTitle}" 프로젝트를 영구 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`)) {
      return;
    }

    // 한 번 더 확인
    if (!window.confirm(`정말로 "${projectTitle}"를 영구 삭제하시겠습니까?\n\n마지막 확인입니다.`)) {
      return;
    }

    try {
      const success = await dataService.permanentDeleteProject(projectId);
      if (success) {
        alert('프로젝트가 영구 삭제되었습니다.');
        fetchProjects(); // 목록 새로고침
      } else {
        alert('프로젝트 영구 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to permanently delete project:', error);
      alert('영구 삭제 중 오류가 발생했습니다.');
    }
  };

  // 일반 프로젝트 삭제 (휴지통으로 이동)
  const handleDeleteWithConfirm = async (project: ProjectData) => {
    const projectTitle = project.title || '프로젝트';
    
    // 한 번만 확인 (부모에서 추가 확인 방지)
    if (!window.confirm(`"${projectTitle}"를 휴지통으로 이동하시겠습니까?\n\n휴지통에서 복원하거나 영구 삭제할 수 있습니다.`)) {
      return;
    }

    try {
      if (onDeleteProject) {
        // 부모 컴포넌트의 삭제 함수 사용 (확인 없이)
        console.log('🗑️ 부모 컴포넌트 삭제 함수 호출:', project.id);
        await onDeleteProject(project.id || '');
        // 성공 메시지는 부모에서 처리하므로 여기서는 생략
        console.log('✅ 삭제 완료');
        fetchProjects(); // 목록 새로고침
      } else {
        // 직접 dataService 사용
        console.log('🗑️ dataService 직접 호출:', project.id);
        const success = await dataService.deleteProject(project.id || '');
        if (success) {
          alert(`"${projectTitle}"가 휴지통으로 이동되었습니다.`);
          fetchProjects(); // 목록 새로고침
        } else {
          alert('프로젝트 삭제에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다.');
    }
  };

  // 프로젝트 편집
  const handleEditProject = (project: ProjectData) => {
    console.log('✏️ 프로젝트 편집 시작:', project.title);
    if (onEditProject) {
      onEditProject(project);
    } else {
      console.log('⚠️ 편집 핸들러가 연결되지 않음');
      alert('편집 기능을 준비 중입니다.');
    }
  };

  // 모델 구축
  const handleModelBuilder = (project: ProjectData) => {
    console.log('🏗️ 모델 구축 시작:', project.title, project.id);
    if (onModelBuilder) {
      onModelBuilder(project);
    } else {
      console.log('⚠️ 모델 구축 핸들러가 연결되지 않음');
      alert('모델 구축 기능을 준비 중입니다.');
    }
  };

  // 결과 분석
  const handleAnalysis = (project: ProjectData) => {
    console.log('📊 결과 분석 시작:', project.title, project.id);
    if (onAnalysis) {
      onAnalysis(project);
    } else {
      console.log('⚠️ 결과 분석 핸들러가 연결되지 않음');
      alert('결과 분석 기능을 준비 중입니다.');
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
          onClick={() => {
            console.log('🔘 MyProjects 버튼 클릭됨');
            console.log('onCreateNew 함수 존재:', !!onCreateNew);
            if (onCreateNew) {
              onCreateNew();
            } else {
              console.log('❌ onCreateNew 함수가 없습니다');
            }
          }}
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
          {(['all', 'active', 'completed', 'draft', 'trash'] as const).map(status => (
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
              {status === 'all' ? '전체' : status === 'trash' ? '🗑️ 휴지통' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* 프로젝트 목록 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-6xl mb-4" style={{ color: 'var(--text-muted)' }}>□</div>
          <p className="text-xl font-medium mb-2">
            {filter === 'trash' ? '휴지통이 비어있습니다' : '프로젝트가 없습니다'}
          </p>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            {searchTerm ? '검색 결과가 없습니다' : 
             filter === 'trash' ? '삭제된 프로젝트가 없습니다' :
             '첫 번째 프로젝트를 생성해보세요'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                console.log('🔘 MyProjects 빈 상태 버튼 클릭됨');
                console.log('onCreateNew 함수 존재:', !!onCreateNew);
                if (onCreateNew) {
                  onCreateNew();
                } else {
                  console.log('❌ onCreateNew 함수가 없습니다');
                }
              }}
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

              {/* 평가 모드 표시 */}
              <div className="mb-3 px-3 py-2 rounded-lg" style={{ 
                backgroundColor: project.evaluation_mode === 'fuzzy_ahp' ? 'var(--color-purple-pastel-1)' : 'var(--color-gold-pastel-1)',
                border: `1px solid ${project.evaluation_mode === 'fuzzy_ahp' ? 'var(--color-purple-pastel-3)' : 'var(--color-gold-pastel-3)'}`
              }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    평가 방식
                  </span>
                  <span className="text-sm font-semibold" style={{ 
                    color: project.evaluation_mode === 'fuzzy_ahp' ? 'var(--color-purple-dark-1)' : 'var(--color-gold-dark-1)'
                  }}>
                    {project.evaluation_mode === 'fuzzy_ahp' ? '🔮 퍼지 AHP' : 
                     project.evaluation_mode === 'direct_input' ? '⌨️ 직접입력' :
                     project.evaluation_mode === 'theoretical' ? '📚 이론적' :
                     '⚖️ 쌍대비교(권장)'}
                  </span>
                </div>
              </div>

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
                    {project.completionRate || 0}%
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border-light)' }}>
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${project.completionRate || 0}%`,
                      backgroundColor: getProgressColor(project.completionRate || 0)
                    }}
                  />
                </div>
                {/* 진행 상태 텍스트 */}
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {getProgressText(project)}
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="mt-4 pt-4 flex justify-between text-xs" style={{ borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <span>생성: {new Date(project.created_at || Date.now()).toLocaleDateString('ko-KR')}</span>
                {filter === 'trash' && project.deleted_at ? (
                  <span style={{ color: 'var(--text-danger)' }}>삭제: {new Date(project.deleted_at).toLocaleDateString('ko-KR')}</span>
                ) : (
                  <span>수정: {new Date(project.updated_at || Date.now()).toLocaleDateString('ko-KR')}</span>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="mt-4 pt-4 flex justify-end space-x-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                {filter === 'trash' ? (
                  // 휴지통 버튼들
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRestoreProject(project.id || '', project.title);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="복원"
                      type="button"
                    >
                      ↩️
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePermanentDelete(project.id || '', project.title);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="영구삭제"
                      type="button"
                    >
                      🗑️
                    </button>
                  </>
                ) : (
                  // 일반 버튼들
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditProject(project);
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
                        handleModelBuilder(project);
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
                        handleAnalysis(project);
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
                        handleDeleteWithConfirm(project);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                      type="button"
                    >
                      🗑️
                    </button>
                  </>
                )}
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