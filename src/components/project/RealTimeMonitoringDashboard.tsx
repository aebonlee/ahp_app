import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ChartPieIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

interface MonitoringData {
  total_invited: number;
  total_completed: number;
  in_progress: number;
  demographic_only: number;
  by_age: { [key: string]: number };
  by_gender: { [key: string]: number };
  by_education: { [key: string]: number };
  by_industry: { [key: string]: number };
  completion_rate: number;
  average_time: number;
  recent_completions: Array<{
    evaluator_name: string;
    completed_at: string;
    time_taken: number;
  }>;
}

interface RealTimeMonitoringDashboardProps {
  projectId: string;
}

const RealTimeMonitoringDashboard: React.FC<RealTimeMonitoringDashboardProps> = ({ projectId }) => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    
    // 자동 새로고침 (30초마다)
    const interval = autoRefresh ? setInterval(fetchMonitoringData, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [projectId, autoRefresh]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/evaluation/progress/${projectId}`);
      setData(response.data);
    } catch (error) {
      console.error('모니터링 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const progressPercentage = (data.total_completed / data.total_invited) * 100;

  // 연령대별 차트 데이터
  const ageChartData = Object.entries(data.by_age).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  // 성별 차트 데이터
  const genderChartData = Object.entries(data.by_gender).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  // 파이 차트 색상
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ChartPieIcon className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">실시간 수집 현황</h2>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">자동 새로고침</span>
            </label>
            <button
              onClick={fetchMonitoringData}
              className="btn btn-ghost btn-sm flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {/* 전체 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>전체 진행률</span>
            <span>
              {data.total_completed} / {data.total_invited} (
              {progressPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">{data.total_invited}</p>
                <p className="text-sm text-blue-600">초대됨</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">{data.total_completed}</p>
                <p className="text-sm text-green-600">완료</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-900">{data.in_progress}</p>
                <p className="text-sm text-yellow-600">진행중</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <ChartPieIcon className="h-8 w-8 text-purple-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-900">
                  {data.average_time}분
                </p>
                <p className="text-sm text-purple-600">평균 소요시간</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 인구통계별 참여 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 연령대별 분포 */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold mb-4">연령대별 참여 현황</h3>
          {ageChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 데이터가 없습니다
            </div>
          )}
        </div>

        {/* 성별 분포 */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold mb-4">성별 참여 현황</h3>
          {genderChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}명`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 최근 완료 목록 */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="text-lg font-semibold mb-4">최근 평가 완료</h3>
        {data.recent_completions.length > 0 ? (
          <div className="space-y-3">
            {data.recent_completions.slice(0, 5).map((completion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-tertiary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {completion.evaluator_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{completion.evaluator_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(completion.completed_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">
                    소요시간: {completion.time_taken}분
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">
            아직 완료된 평가가 없습니다
          </p>
        )}
      </div>

      {/* 실시간 알림 영역 */}
      {data.in_progress > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-sm text-blue-800">
              현재 {data.in_progress}명이 평가를 진행 중입니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeMonitoringDashboard;