/**
 * AI Usage Analytics Component
 * AI 사용량 분석 및 통계 컴포넌트
 */
import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { UIIcon } from '../../common/UIIcon';

interface UsageStats {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  average_response_time: number;
  unique_users: number;
  requests_by_type: Record<string, number>;
  daily_usage: Array<{
    date: string;
    requests: number;
    tokens: number;
  }>;
}

interface UserUsageData {
  user_id: number;
  username: string;
  total_requests: number;
  total_tokens: number;
  usage_percentage: number;
  plan_name: string;
  is_over_limit: boolean;
}

const AIUsageAnalytics: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<UsageStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<UsageStats | null>(null);
  const [userStats, setUserStats] = useState<UserUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'daily' | 'monthly' | 'users'>('daily');

  const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [dailyResponse, monthlyResponse, userResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/ai-management/api/usage-logs/daily_stats/`),
        fetch(`${apiBaseUrl}/ai-management/api/usage-logs/monthly_stats/`),
        fetch(`${apiBaseUrl}/ai-management/api/users/summary/`)
      ]);

      if (dailyResponse.ok) {
        const data = await dailyResponse.json();
        setDailyStats(data);
      }

      if (monthlyResponse.ok) {
        const data = await monthlyResponse.json();
        setMonthlyStats(data);
      }

      if (userResponse.ok) {
        const data = await userResponse.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDailyAnalytics = () => {
    if (!dailyStats) return null;

    return (
      <div className="space-y-6">
        {/* 오늘의 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 요청 수</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dailyStats.total_requests.toLocaleString()}
                </p>
              </div>
              <UIIcon emoji="🚀" size="lg" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 토큰</p>
                <p className="text-2xl font-bold text-green-600">
                  {dailyStats.total_tokens.toLocaleString()}
                </p>
              </div>
              <UIIcon emoji="🔢" size="lg" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 비용</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${dailyStats.total_cost.toFixed(2)}
                </p>
              </div>
              <UIIcon emoji="💰" size="lg" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 응답시간</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dailyStats.average_response_time?.toFixed(2) || 0}s
                </p>
              </div>
              <UIIcon emoji="⏱️" size="lg" />
            </div>
          </Card>
        </div>

        {/* 요청 유형별 분석 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📊 요청 유형별 분석</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(dailyStats.requests_by_type || {}).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderMonthlyAnalytics = () => {
    if (!monthlyStats) return null;

    return (
      <div className="space-y-6">
        {/* 월간 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {monthlyStats.total_requests.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">이번 달 총 요청</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {monthlyStats.total_tokens.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">이번 달 총 토큰</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                ${monthlyStats.total_cost.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">이번 달 총 비용</p>
            </div>
          </Card>
        </div>

        {/* 일별 사용량 차트 (간단한 막대 그래프) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📈 일별 사용량 추이 (최근 30일)</h3>
          <div className="space-y-2">
            {monthlyStats.daily_usage?.slice(0, 10).map((day, index) => {
              const maxRequests = Math.max(...monthlyStats.daily_usage.map(d => d.requests));
              const widthPercentage = maxRequests > 0 ? (day.requests / maxRequests) * 100 : 0;
              
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${widthPercentage}%` }}
                    >
                      {day.requests > 0 && (
                        <span className="text-white text-xs font-medium">
                          {day.requests}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-right">
                    {day.tokens.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  const renderUserAnalytics = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">👥 사용자별 사용량 분석</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">사용자</th>
              <th className="text-left py-2">요금제</th>
              <th className="text-right py-2">요청 수</th>
              <th className="text-right py-2">토큰 수</th>
              <th className="text-right py-2">사용률</th>
              <th className="text-center py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {userStats.map((user) => (
              <tr key={user.user_id} className="border-b hover:bg-gray-50">
                <td className="py-2">
                  <div className="font-medium">{user.username}</div>
                </td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {user.plan_name}
                  </span>
                </td>
                <td className="py-2 text-right">{user.total_requests.toLocaleString()}</td>
                <td className="py-2 text-right">{user.total_tokens.toLocaleString()}</td>
                <td className="py-2 text-right">
                  <span className={`font-medium ${
                    user.usage_percentage >= 90 ? 'text-red-600' :
                    user.usage_percentage >= 70 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {user.usage_percentage.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 text-center">
                  {user.is_over_limit ? (
                    <UIIcon emoji="⚠️" className="text-red-500" />
                  ) : (
                    <UIIcon emoji="✅" className="text-green-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <UIIcon emoji="⏳" size="lg" />
        <span className="ml-2">분석 데이터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">📈 AI 사용량 분석</h2>
          <p className="text-gray-600">AI 서비스 사용량 및 비용을 분석합니다</p>
        </div>
        
        <Button
          onClick={fetchAnalyticsData}
          variant="outline"
          className="flex items-center gap-2"
        >
          <UIIcon emoji="🔄" />
          새로고침
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b">
        <Button
          onClick={() => setActiveView('daily')}
          variant={activeView === 'daily' ? 'primary' : 'ghost'}
          className="px-4 py-2"
        >
          <UIIcon emoji="📅" />
          일간 분석
        </Button>
        <Button
          onClick={() => setActiveView('monthly')}
          variant={activeView === 'monthly' ? 'primary' : 'ghost'}
          className="px-4 py-2"
        >
          <UIIcon emoji="📆" />
          월간 분석
        </Button>
        <Button
          onClick={() => setActiveView('users')}
          variant={activeView === 'users' ? 'primary' : 'ghost'}
          className="px-4 py-2"
        >
          <UIIcon emoji="👥" />
          사용자 분석
        </Button>
      </div>

      {/* 컨텐츠 */}
      <div>
        {activeView === 'daily' && renderDailyAnalytics()}
        {activeView === 'monthly' && renderMonthlyAnalytics()}
        {activeView === 'users' && renderUserAnalytics()}
      </div>
    </div>
  );
};

export default AIUsageAnalytics;