import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../../../services/api';

interface EvaluatorProgress {
  evaluator_id: number;
  evaluator_name: string;
  evaluator_email: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  progress: number;
  consistency_ratio?: number;
  started_at?: string;
  completed_at?: string;
}

interface ProgressData {
  project_id: number;
  total_evaluators: number;
  completed: number;
  in_progress: number;
  pending: number;
  overall_progress: number;
  evaluators: EvaluatorProgress[];
}

interface ProgressTrackerProps {
  projectId: number;
  refreshKey?: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ projectId, refreshKey = 0 }) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'pending'>('all');

  useEffect(() => {
    loadProgressData();
  }, [projectId, refreshKey]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/evaluations/progress/${projectId}/project_progress/`);
      setProgressData(response.data);
    } catch (error) {
      console.error('진행률 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-600 animate-spin" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800'
    };

    const statusText = {
      completed: '완료',
      in_progress: '진행중',
      pending: '대기중',
      expired: '만료'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status as keyof typeof statusConfig]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-gray-300';
  };

  const filteredEvaluators = progressData?.evaluators.filter(evaluator => {
    if (filter === 'all') return true;
    return evaluator.status === filter;
  }) || [];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <p className="text-center text-gray-500">진행률 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-bold mb-6">전체 진행 현황</h2>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">전체 진행률</span>
            <span className="text-sm font-bold text-gray-900">
              {progressData.overall_progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progressData.overall_progress)}`}
              style={{ width: `${progressData.overall_progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progressData.completed}
            </div>
            <div className="text-sm text-gray-500">완료</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {progressData.in_progress}
            </div>
            <div className="text-sm text-gray-500">진행중</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {progressData.pending}
            </div>
            <div className="text-sm text-gray-500">대기중</div>
          </div>
        </div>
      </div>

      {/* Individual Progress */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">평가자별 진행 상황</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              완료
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'in_progress'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              진행중
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              대기중
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평가자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  진행률
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  일관성 지수
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시작 시간
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  완료 시간
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvaluators.length > 0 ? (
                filteredEvaluators.map((evaluator) => (
                  <tr key={evaluator.evaluator_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {evaluator.evaluator_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {evaluator.evaluator_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(evaluator.status)}
                        {getStatusBadge(evaluator.status)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-full max-w-[150px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(evaluator.progress)}`}
                              style={{ width: `${evaluator.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {evaluator.progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {evaluator.consistency_ratio !== undefined ? (
                        <span className={`text-sm font-medium ${
                          evaluator.consistency_ratio <= 0.1 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {evaluator.consistency_ratio.toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluator.started_at
                        ? new Date(evaluator.started_at).toLocaleString('ko-KR')
                        : '-'
                      }
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluator.completed_at
                        ? new Date(evaluator.completed_at).toLocaleString('ko-KR')
                        : '-'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    평가자 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;