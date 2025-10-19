/**
 * AI Management Dashboard Component
 * 슈퍼관리자가 AI 기능을 통합 관리할 수 있는 대시보드
 */
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { UIIcon } from '../common/UIIcon';
import Tooltip from '../common/Tooltip';
import AIServicePlanManager from './ai-management/AIServicePlanManager';
import AISettingsManager from './ai-management/AISettingsManager';
import UserAIAccessManager from './ai-management/UserAIAccessManager';
import AIUsageAnalytics from './ai-management/AIUsageAnalytics';
import PromptTemplateManager from './ai-management/PromptTemplateManager';

interface AIManagementDashboardProps {
  userRole?: string;
  onClose?: () => void;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  overLimitUsers: number;
}

const AIManagementDashboard: React.FC<AIManagementDashboardProps> = ({
  userRole = 'superadmin',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    overLimitUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // API 기본 설정
  const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // 병렬로 여러 통계 API 호출
      const [accessResponse, usageResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/ai-management/api/user-access/overview/`),
        fetch(`${apiBaseUrl}/ai-management/api/usage-logs/daily_stats/`)
      ]);

      if (accessResponse.ok && usageResponse.ok) {
        const accessData = await accessResponse.json();
        const usageData = await usageResponse.json();
        
        setStats({
          totalUsers: accessData.total_users || 0,
          activeUsers: accessData.active_users || 0,
          totalRequests: usageData.total_requests || 0,
          totalTokens: usageData.total_tokens || 0,
          totalCost: usageData.total_cost || 0,
          overLimitUsers: accessData.over_limit_users || 0
        });
      }
    } catch (error) {
      console.error('Dashboard stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'overview',
      label: '대시보드',
      icon: '📊',
      description: 'AI 서비스 전체 현황'
    },
    {
      id: 'plans',
      label: '요금제 관리',
      icon: '💳',
      description: 'AI 서비스 요금제 설정'
    },
    {
      id: 'settings',
      label: 'AI 설정',
      icon: '⚙️',
      description: 'AI 모델 및 API 설정'
    },
    {
      id: 'users',
      label: '사용자 권한',
      icon: '👥',
      description: '사용자별 AI 접근 권한 관리'
    },
    {
      id: 'analytics',
      label: '사용량 분석',
      icon: '📈',
      description: 'AI 사용량 및 비용 분석'
    },
    {
      id: 'templates',
      label: '프롬프트 템플릿',
      icon: '📝',
      description: 'AI 프롬프트 템플릿 관리'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 사용자</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <UIIcon emoji="👥" size="lg" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 사용자</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <UIIcon emoji="✅" size="lg" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">오늘 요청 수</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalRequests.toLocaleString()}
              </p>
            </div>
            <UIIcon emoji="🚀" size="lg" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">한도 초과</p>
              <p className="text-2xl font-bold text-red-600">{stats.overLimitUsers}</p>
            </div>
            <UIIcon emoji="⚠️" size="lg" />
          </div>
        </Card>
      </div>

      {/* 사용량 요약 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📈 오늘의 사용량</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {stats.totalTokens.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">총 토큰 사용량</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ${stats.totalCost.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">총 비용</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {stats.totalRequests > 0 ? (stats.totalCost / stats.totalRequests * 1000).toFixed(3) : '0.000'}
            </p>
            <p className="text-sm text-gray-600">요청당 평균 비용 ($)</p>
          </div>
        </div>
      </Card>

      {/* 빠른 액션 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">⚡ 빠른 액션</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => setActiveTab('users')}
            className="flex items-center justify-center gap-2 p-4"
          >
            <UIIcon emoji="👤" />
            새 사용자 권한 설정
          </Button>
          <Button
            onClick={() => setActiveTab('settings')}
            className="flex items-center justify-center gap-2 p-4"
            variant="secondary"
          >
            <UIIcon emoji="⚙️" />
            AI 설정 추가
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center justify-center gap-2 p-4"
            variant="outline"
          >
            <UIIcon emoji="📊" />
            상세 분석 보기
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'plans':
        return <AIServicePlanManager />;
      case 'settings':
        return <AISettingsManager />;
      case 'users':
        return <UserAIAccessManager />;
      case 'analytics':
        return <AIUsageAnalytics />;
      case 'templates':
        return <PromptTemplateManager />;
      default:
        return renderOverview();
    }
  };

  if (userRole !== 'superadmin') {
    return (
      <Card className="p-8 text-center">
        <UIIcon emoji="🔒" size="xl" />
        <h2 className="text-xl font-semibold mt-4 mb-2">접근 권한 없음</h2>
        <p className="text-gray-600">
          AI 관리 시스템은 슈퍼관리자만 접근할 수 있습니다.
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UIIcon emoji="🤖" size="lg" />
          <div>
            <h1 className="text-2xl font-bold">AI 관리 시스템</h1>
            <p className="text-gray-600">인공지능 서비스 통합 관리</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip content="새로고침">
            <Button
              onClick={fetchDashboardStats}
              variant="outline"
              disabled={loading}
            >
              <UIIcon emoji={loading ? "⏳" : "🔄"} />
            </Button>
          </Tooltip>
          
          {onClose && (
            <Button onClick={onClose} variant="outline">
              <UIIcon emoji="✕" />
            </Button>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {menuItems.map((item) => (
          <Tooltip key={item.id} content={item.description}>
            <Button
              onClick={() => setActiveTab(item.id)}
              variant={activeTab === item.id ? "primary" : "ghost"}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${
                activeTab === item.id 
                  ? 'border-b-2 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <UIIcon emoji={item.icon} />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Tooltip>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AIManagementDashboard;