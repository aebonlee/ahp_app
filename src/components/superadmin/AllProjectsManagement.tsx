import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import UnifiedButton from '../common/UnifiedButton';
import apiService from '../../services/apiService';

interface Project {
  id: string;
  title: string;
  description: string;
  owner: {
    id: string;
    username: string;
    email: string;
  };
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  evaluators_count: number;
  completion_rate: number;
}

const AllProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'completed' | 'archived'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const pageSize = 10;

  // 프로젝트 목록 가져오기
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        search: searchTerm,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await apiService.get<any>(`/api/projects/?${params}`);
      
      if (response.data) {
        const data = response.data as any;
        setProjects(data.results || data);
        setTotalPages(Math.ceil((data.count || data.length) / pageSize));
      }
    } catch (error) {
      console.error('프로젝트 목록 로드 실패:', error);
      // 대체 데이터
      setProjects(getMockProjects());
    } finally {
      setLoading(false);
    }
  };

  // 목업 데이터
  const getMockProjects = (): Project[] => {
    return [
      {
        id: '1',
        title: '2025년 신제품 개발 우선순위 결정',
        description: '시장 조사를 바탕으로 한 신제품 개발 우선순위 AHP 분석',
        owner: { id: '1', username: 'admin', email: 'admin@ahp.com' },
        status: 'active',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-20T15:30:00Z',
        evaluators_count: 12,
        completion_rate: 75
      },
      {
        id: '2',
        title: '공급업체 선정 평가',
        description: '주요 부품 공급업체 선정을 위한 다기준 의사결정',
        owner: { id: '2', username: 'manager1', email: 'manager1@company.com' },
        status: 'completed',
        created_at: '2025-01-10T09:00:00Z',
        updated_at: '2025-01-18T17:00:00Z',
        evaluators_count: 8,
        completion_rate: 100
      },
      {
        id: '3',
        title: 'IT 인프라 투자 우선순위',
        description: 'IT 인프라 개선 프로젝트 우선순위 결정',
        owner: { id: '3', username: 'it_manager', email: 'it@company.com' },
        status: 'active',
        created_at: '2025-01-20T14:00:00Z',
        updated_at: '2025-01-22T11:00:00Z',
        evaluators_count: 5,
        completion_rate: 40
      }
    ];
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchTerm, statusFilter]);

  // 프로젝트 삭제
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
    
    try {
      await apiService.delete(`/api/projects/${projectId}/`);
      fetchProjects();
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  // 프로젝트 상태 변경
  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await apiService.patch(`/api/projects/${projectId}/`, { status: newStatus });
      fetchProjects();
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 상태별 레이블
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return '초안';
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'archived': return '보관';
      default: return status;
    }
  };

  // 필터링된 프로젝트
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          전체 프로젝트 관리
        </h1>
        <p className="text-gray-600">
          시스템에 등록된 모든 프로젝트를 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <div className="text-sm text-gray-600">전체 프로젝트</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">진행중</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">완료됨</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {projects.reduce((sum, p) => sum + p.evaluators_count, 0)}
            </div>
            <div className="text-sm text-gray-600">총 평가자</div>
          </div>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="프로젝트명 또는 소유자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 상태</option>
              <option value="draft">초안</option>
              <option value="active">진행중</option>
              <option value="completed">완료</option>
              <option value="archived">보관</option>
            </select>
            <UnifiedButton
              variant="secondary"
              onClick={fetchProjects}
              icon="🔄"
            >
              새로고침
            </UnifiedButton>
          </div>

          {/* 프로젝트 목록 */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              프로젝트가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">프로젝트</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">소유자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평가자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">진행률</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.title}</div>
                          <div className="text-xs text-gray-500">{project.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{project.owner.username}</div>
                          <div className="text-gray-500">{project.owner.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {project.evaluators_count}명
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.completion_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{project.completion_rate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <UnifiedButton
                          variant="info"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDetails(true);
                          }}
                          icon="👁️"
                        >
                          상세
                        </UnifiedButton>
                        <UnifiedButton
                          variant="warning"
                          size="sm"
                          onClick={() => handleStatusChange(project.id, 'archived')}
                          icon="📦"
                        >
                          보관
                        </UnifiedButton>
                        <UnifiedButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          icon="🗑️"
                        >
                          삭제
                        </UnifiedButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </UnifiedButton>
              
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <UnifiedButton
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </UnifiedButton>
                );
              })}
              
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </UnifiedButton>
            </div>
          )}
        </div>
      </Card>

      {/* 프로젝트 상세 모달 */}
      {showDetails && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">프로젝트 상세 정보</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <p className="mt-1 text-gray-900">{selectedProject.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <p className="mt-1 text-gray-900">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">소유자</label>
                  <p className="mt-1 text-gray-900">{selectedProject.owner.username} ({selectedProject.owner.email})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedProject.status)}`}>
                      {getStatusLabel(selectedProject.status)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">평가자 수</label>
                  <p className="mt-1 text-gray-900">{selectedProject.evaluators_count}명</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">완료율</label>
                  <p className="mt-1 text-gray-900">{selectedProject.completion_rate}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">생성일</label>
                  <p className="mt-1 text-gray-900">{new Date(selectedProject.created_at).toLocaleString('ko-KR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">최종 수정일</label>
                  <p className="mt-1 text-gray-900">{new Date(selectedProject.updated_at).toLocaleString('ko-KR')}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <UnifiedButton
                variant="secondary"
                onClick={() => setShowDetails(false)}
              >
                닫기
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProjectsManagement;