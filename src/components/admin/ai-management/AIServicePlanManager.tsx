/**
 * AI Service Plan Manager Component
 * AI 서비스 요금제 관리 컴포넌트
 */
import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { UIIcon } from '../../common/UIIcon';
import Tooltip from '../../common/Tooltip';

interface AIServicePlan {
  id: number;
  name: string;
  display_name: string;
  monthly_cost: number;
  monthly_token_limit: number;
  daily_request_limit: number;
  features: Record<string, boolean>;
  description: string;
  is_active: boolean;
  user_count: number;
  created_at: string;
  updated_at: string;
}

interface PlanFormData {
  name: string;
  display_name: string;
  monthly_cost: number;
  monthly_token_limit: number;
  daily_request_limit: number;
  features: Record<string, boolean>;
  description: string;
  is_active: boolean;
}

const AIServicePlanManager: React.FC = () => {
  const [plans, setPlans] = useState<AIServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AIServicePlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    display_name: '',
    monthly_cost: 0,
    monthly_token_limit: 0,
    daily_request_limit: 0,
    features: {},
    description: '',
    is_active: true
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/ai-management/api/plans/`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/plans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchPlans();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/plans/${editingPlan.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchPlans();
        setEditingPlan(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!window.confirm('정말로 이 요금제를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${apiBaseUrl}/ai-management/api/plans/${planId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPlans();
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      monthly_cost: 0,
      monthly_token_limit: 0,
      daily_request_limit: 0,
      features: {},
      description: '',
      is_active: true
    });
  };

  const openEditModal = (plan: AIServicePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      display_name: plan.display_name,
      monthly_cost: plan.monthly_cost,
      monthly_token_limit: plan.monthly_token_limit,
      daily_request_limit: plan.daily_request_limit,
      features: plan.features,
      description: plan.description,
      is_active: plan.is_active
    });
  };

  const renderPlanCard = (plan: AIServicePlan) => (
    <Card key={plan.id} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UIIcon 
            emoji={plan.is_active ? "✅" : "⏸️"} 
            className={plan.is_active ? "text-green-500" : "text-gray-400"}
          />
          <div>
            <h3 className="text-lg font-semibold">{plan.display_name}</h3>
            <p className="text-sm text-gray-600">{plan.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip content="사용자 수">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
              <UIIcon emoji="👥" size="sm" />
              <span className="text-sm font-medium">{plan.user_count}</span>
            </div>
          </Tooltip>
          
          <Button
            onClick={() => openEditModal(plan)}
            variant="outline"
            size="sm"
          >
            <UIIcon emoji="✏️" />
          </Button>
          
          <Button
            onClick={() => handleDeletePlan(plan.id)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <UIIcon emoji="🗑️" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">월 요금</p>
          <p className="text-xl font-bold text-green-600">${plan.monthly_cost}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">월간 토큰 한도</p>
          <p className="text-lg font-semibold">{plan.monthly_token_limit.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">일간 요청 한도</p>
          <p className="text-lg font-semibold">{plan.daily_request_limit.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">활성 기능</p>
          <p className="text-sm">
            {Object.entries(plan.features).filter(([_, enabled]) => enabled).length}개
          </p>
        </div>
      </div>

      {plan.description && (
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
          {plan.description}
        </p>
      )}

      {/* 기능 목록 */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-2">포함된 기능:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(plan.features).map(([feature, enabled]) => (
            <span
              key={feature}
              className={`px-2 py-1 rounded-full text-xs ${
                enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {enabled ? '✅' : '❌'} {feature}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderPlanForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">요금제 코드</label>
          <select
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택하세요</option>
            <option value="free">free</option>
            <option value="basic">basic</option>
            <option value="premium">premium</option>
            <option value="enterprise">enterprise</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">표시명</label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="프리미엄 요금제"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">월 요금 ($)</label>
          <input
            type="number"
            value={formData.monthly_cost}
            onChange={(e) => setFormData(prev => ({ ...prev, monthly_cost: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">월간 토큰 한도</label>
          <input
            type="number"
            value={formData.monthly_token_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, monthly_token_limit: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">일간 요청 한도</label>
          <input
            type="number"
            value={formData.daily_request_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, daily_request_limit: Number(e.target.value) }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="요금제에 대한 설명을 입력하세요"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          className="rounded"
        />
        <label htmlFor="is_active" className="text-sm font-medium">
          활성 상태
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <UIIcon emoji="⏳" size="lg" />
        <span className="ml-2">요금제 정보를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">💳 AI 서비스 요금제 관리</h2>
          <p className="text-gray-600">AI 기능 사용을 위한 요금제를 관리합니다</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <UIIcon emoji="➕" />
          새 요금제 추가
        </Button>
      </div>

      {/* 요금제 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map(renderPlanCard)}
      </div>

      {/* 요금제 생성 모달 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="새 요금제 추가"
      >
        <div className="space-y-4">
          {renderPlanForm()}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              variant="outline"
            >
              취소
            </Button>
            <Button onClick={handleCreatePlan}>
              생성
            </Button>
          </div>
        </div>
      </Modal>

      {/* 요금제 수정 모달 */}
      <Modal
        isOpen={!!editingPlan}
        onClose={() => {
          setEditingPlan(null);
          resetForm();
        }}
        title="요금제 수정"
      >
        <div className="space-y-4">
          {renderPlanForm()}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setEditingPlan(null);
                resetForm();
              }}
              variant="outline"
            >
              취소
            </Button>
            <Button onClick={handleUpdatePlan}>
              수정
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AIServicePlanManager;