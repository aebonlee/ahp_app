/**
 * User AI Access Manager Component
 * 사용자별 AI 접근 권한 관리 컴포넌트
 */
import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { UIIcon } from '../../common/UIIcon';
import Tooltip from '../../common/Tooltip';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  has_ai_access: boolean;
  ai_plan_name?: string;
}

interface AIServicePlan {
  id: number;
  name: string;
  display_name: string;
  monthly_cost: number;
  monthly_token_limit: number;
}

interface AIServiceSettings {
  id: number;
  name: string;
  provider: string;
  provider_display: string;
  is_active: boolean;
}

interface UserAIAccess {
  id: number;
  user: number;
  user_info: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  ai_plan: number;
  ai_plan_name: string;
  ai_settings?: number;
  ai_settings_name?: string;
  tokens_used_today: number;
  tokens_used_month: number;
  requests_today: number;
  requests_month: number;
  is_enabled: boolean;
  can_use_advanced_features: boolean;
  can_export_conversations: boolean;
  usage_percentage: number;
  is_over_limit: boolean;
  assigned_at: string;
  expires_at?: string;
}

interface AccessFormData {
  user: number;
  ai_plan: number;
  ai_settings?: number;
  is_enabled: boolean;
  can_use_advanced_features: boolean;
  can_export_conversations: boolean;
  usage_alert_threshold: number;
  email_usage_alerts: boolean;
  expires_at?: string;
  notes: string;
}

const UserAIAccessManager: React.FC = () => {
  const [userAccesses, setUserAccesses] = useState<UserAIAccess[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<AIServicePlan[]>([]);
  const [settings, setSettings] = useState<AIServiceSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<UserAIAccess | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  const [formData, setFormData] = useState<AccessFormData>({
    user: 0,
    ai_plan: 0,
    ai_settings: undefined,
    is_enabled: true,
    can_use_advanced_features: false,
    can_export_conversations: true,
    usage_alert_threshold: 80,
    email_usage_alerts: true,
    expires_at: '',
    notes: ''
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accessResponse, usersResponse, plansResponse, settingsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/ai-management/api/user-access/`),
        fetch(`${apiBaseUrl}/ai-management/api/users/`),
        fetch(`${apiBaseUrl}/ai-management/api/plans/`),
        fetch(`${apiBaseUrl}/ai-management/api/settings/`)
      ]);

      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        setUserAccesses(accessData);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData);
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccess = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/user-access/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create access:', error);
    }
  };

  const handleUpdateAccess = async () => {
    if (!editingAccess) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/user-access/${editingAccess.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        setEditingAccess(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update access:', error);
    }
  };

  const handleBulkEnable = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/user-access/bulk_enable/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_ids: selectedUsers })
      });

      if (response.ok) {
        await fetchData();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Failed to bulk enable:', error);
    }
  };

  const handleBulkDisable = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/user-access/bulk_disable/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_ids: selectedUsers })
      });

      if (response.ok) {
        await fetchData();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Failed to bulk disable:', error);
    }
  };

  const handleResetUsage = async (accessId: number, type: 'daily' | 'monthly') => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/user-access/${accessId}/reset_usage/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to reset usage:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      user: 0,
      ai_plan: 0,
      ai_settings: undefined,
      is_enabled: true,
      can_use_advanced_features: false,
      can_export_conversations: true,
      usage_alert_threshold: 80,
      email_usage_alerts: true,
      expires_at: '',
      notes: ''
    });
  };

  const openEditModal = (access: UserAIAccess) => {
    setEditingAccess(access);
    setFormData({
      user: access.user,
      ai_plan: access.ai_plan,
      ai_settings: access.ai_settings,
      is_enabled: access.is_enabled,
      can_use_advanced_features: access.can_use_advanced_features,
      can_export_conversations: access.can_export_conversations,
      usage_alert_threshold: 80, // Default value as it's not in the response
      email_usage_alerts: true, // Default value
      expires_at: access.expires_at || '',
      notes: '' // Default value
    });
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const filteredAccesses = userAccesses.filter(access => {
    const matchesSearch = access.user_info.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         access.user_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         access.user_info.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = !filterPlan || access.ai_plan.toString() === filterPlan;
    
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'enabled' && access.is_enabled) ||
                         (filterStatus === 'disabled' && !access.is_enabled) ||
                         (filterStatus === 'overlimit' && access.is_over_limit);
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const renderAccessCard = (access: UserAIAccess) => (
    <Card key={access.id} className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedUsers.includes(access.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUsers(prev => [...prev, access.id]);
              } else {
                setSelectedUsers(prev => prev.filter(id => id !== access.id));
              }
            }}
            className="rounded"
          />
          
          <UIIcon 
            emoji={access.is_enabled ? "✅" : "⏸️"} 
            className={access.is_enabled ? "text-green-500" : "text-gray-400"}
          />
          
          <div>
            <h4 className="font-semibold">{access.user_info.full_name}</h4>
            <p className="text-sm text-gray-600">{access.user_info.email}</p>
            <p className="text-xs text-gray-500">@{access.user_info.username}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {access.is_over_limit && (
            <Tooltip content="한도 초과">
              <UIIcon emoji="⚠️" className="text-red-500" />
            </Tooltip>
          )}
          
          <Button
            onClick={() => openEditModal(access)}
            variant="outline"
            size="sm"
          >
            <UIIcon emoji="✏️" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">요금제</p>
          <p className="text-sm font-medium">{access.ai_plan_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">AI 설정</p>
          <p className="text-sm">{access.ai_settings_name || '미설정'}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">월간 사용률</span>
          <span className={`text-sm font-medium ${getUsageColor(access.usage_percentage)}`}>
            {access.usage_percentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              access.usage_percentage >= 90 ? 'bg-red-500' :
              access.usage_percentage >= 70 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(access.usage_percentage, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span>토큰: {access.tokens_used_month.toLocaleString()}</span>
          </div>
          <div>
            <span>요청: {access.requests_month.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex gap-1">
          {access.can_use_advanced_features && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              고급기능
            </span>
          )}
          {access.can_export_conversations && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              내보내기
            </span>
          )}
        </div>
        
        <div className="flex gap-1">
          <Tooltip content="일간 사용량 초기화">
            <Button
              onClick={() => handleResetUsage(access.id, 'daily')}
              variant="outline"
              size="sm"
            >
              📅
            </Button>
          </Tooltip>
          <Tooltip content="월간 사용량 초기화">
            <Button
              onClick={() => handleResetUsage(access.id, 'monthly')}
              variant="outline"
              size="sm"
            >
              📆
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <UIIcon emoji="⏳" size="lg" />
        <span className="ml-2">사용자 권한 정보를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">👥 사용자 AI 접근 권한 관리</h2>
          <p className="text-gray-600">사용자별 AI 기능 사용 권한을 관리합니다</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <UIIcon emoji="➕" />
          권한 추가
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">검색</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름, 이메일로 검색"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">요금제</label>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.display_name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="enabled">활성</option>
              <option value="disabled">비활성</option>
              <option value="overlimit">한도 초과</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            {selectedUsers.length > 0 && (
              <>
                <Button
                  onClick={handleBulkEnable}
                  variant="outline"
                  size="sm"
                  className="text-green-600"
                >
                  <UIIcon emoji="✅" />
                  활성화
                </Button>
                <Button
                  onClick={handleBulkDisable}
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                >
                  <UIIcon emoji="⏸️" />
                  비활성화
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          총 {filteredAccesses.length}명의 사용자 권한
          {selectedUsers.length > 0 && ` (${selectedUsers.length}개 선택됨)`}
        </div>
      </Card>

      {/* 사용자 권한 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccesses.map(renderAccessCard)}
      </div>

      {/* 권한 생성/수정 모달은 여기서 생략 - 실제 구현에서는 포함 */}
    </div>
  );
};

export default UserAIAccessManager;