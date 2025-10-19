/**
 * Django Evaluator Management Component
 * Compatible with existing evaluator-management tab
 */
import React, { useState, useEffect } from 'react';
import djangoApiService from '../../services/djangoApiService';
import useDjangoAuth from '../../hooks/useDjangoAuth';

interface Evaluator {
  id: number;
  username: string;
  email: string;
  fullName: string;
  organization: string;
  department: string;
  position: string;
  isActive: boolean;
  dateJoined: string;
  lastActivity: string;
  totalEvaluations: number;
  completedEvaluations: number;
  completionRate: number;
}

interface Statistics {
  totalEvaluators: number;
  activeEvaluators: number;
  inactiveEvaluators: number;
  activationRate: number;
  recentActivity: Array<{
    username: string;
    fullName: string;
    lastActivity: string;
    organization: string;
  }>;
}

const DjangoEvaluatorManagement: React.FC = () => {
  const { user, isAuthenticated } = useDjangoAuth();
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState<Evaluator | null>(null);

  // Form state for creating/editing evaluators
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    organization: '',
    department: '',
    position: '',
  });

  // Check permissions
  const canManageEvaluators = user?.isAdmin || user?.isProjectManager;

  useEffect(() => {
    if (isAuthenticated && canManageEvaluators) {
      loadEvaluators();
      loadStatistics();
    }
  }, [isAuthenticated, canManageEvaluators, currentPage, searchTerm, statusFilter]);

  const loadEvaluators = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await djangoApiService.getEvaluators({
        page: currentPage,
        search: searchTerm,
        status: statusFilter,
      });

      if (response.success) {
        setEvaluators(response.evaluators || []);
      } else {
        setError(response.message || '평가자 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      console.error('Load evaluators error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await djangoApiService.getEvaluatorStatistics();
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (err) {
      console.error('Load statistics error:', err);
    }
  };

  const handleCreateEvaluator = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await djangoApiService.createEvaluator(formData);
      if (response.success) {
        setShowCreateForm(false);
        resetForm();
        loadEvaluators();
        loadStatistics();
      } else {
        setError(response.message || '평가자 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('평가자 생성 중 오류가 발생했습니다.');
      console.error('Create evaluator error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvaluator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvaluator) return;

    setLoading(true);
    try {
      const response = await djangoApiService.updateEvaluator(editingEvaluator.id, formData);
      if (response.success) {
        setEditingEvaluator(null);
        resetForm();
        loadEvaluators();
      } else {
        setError(response.message || '평가자 업데이트에 실패했습니다.');
      }
    } catch (err) {
      setError('평가자 업데이트 중 오류가 발생했습니다.');
      console.error('Update evaluator error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluator = async (evaluatorId: number) => {
    if (!window.confirm('정말로 이 평가자를 비활성화하시겠습니까?')) return;

    setLoading(true);
    try {
      const response = await djangoApiService.deleteEvaluator(evaluatorId);
      if (response.success) {
        loadEvaluators();
        loadStatistics();
      } else {
        setError(response.message || '평가자 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('평가자 삭제 중 오류가 발생했습니다.');
      console.error('Delete evaluator error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      organization: '',
      department: '',
      position: '',
    });
  };

  const startEdit = (evaluator: Evaluator) => {
    setEditingEvaluator(evaluator);
    setFormData({
      username: evaluator.username,
      email: evaluator.email,
      password: '',
      fullName: evaluator.fullName,
      organization: evaluator.organization,
      department: evaluator.department,
      position: evaluator.position,
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

  if (!canManageEvaluators) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">평가자 관리 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">평가자 관리</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showCreateForm ? '취소' : '평가자 추가'}
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">전체 평가자</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalEvaluators}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">활성 평가자</h3>
            <p className="text-2xl font-bold text-green-600">{statistics.activeEvaluators}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">비활성 평가자</h3>
            <p className="text-2xl font-bold text-red-600">{statistics.inactiveEvaluators}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">활성화 비율</h3>
            <p className="text-2xl font-bold text-blue-600">{statistics.activationRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="평가자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">
            {editingEvaluator ? '평가자 수정' : '새 평가자 추가'}
          </h3>
          <form onSubmit={editingEvaluator ? handleUpdateEvaluator : handleCreateEvaluator}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자명 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingEvaluator}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingEvaluator ? '새 비밀번호' : '비밀번호 *'}
                </label>
                <input
                  type="password"
                  required={!editingEvaluator}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기관
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부서
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingEvaluator(null);
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
                {loading ? '처리중...' : editingEvaluator ? '수정' : '추가'}
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

      {/* Evaluators Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && evaluators.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">평가자가 없습니다.</p>
          </div>
        )}

        {!loading && evaluators.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평가자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기관
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평가 현황
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluators.map((evaluator) => (
                  <tr key={evaluator.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {evaluator.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {evaluator.username} • {evaluator.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{evaluator.organization}</div>
                      <div className="text-sm text-gray-500">{evaluator.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {evaluator.completedEvaluations}/{evaluator.totalEvaluations} 완료
                      </div>
                      <div className="text-sm text-gray-500">
                        {evaluator.completionRate.toFixed(1)}% 완료율
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        evaluator.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {evaluator.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startEdit(evaluator)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteEvaluator(evaluator.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        비활성화
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DjangoEvaluatorManagement;