import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import type { 
  GroupMember, 
  EvaluationGroup,
  GroupAPIResponse 
} from '../../../types/group';

interface MultiEvaluatorManagerProps {
  groupId: string;
  group: EvaluationGroup;
  currentUserId: string;
  isGroupLeader: boolean;
  onMemberUpdate?: () => void;
}

interface InviteEvaluatorForm {
  email: string;
  name: string;
  expertiseLevel: number;
  role: 'member' | 'observer';
  weight: number;
  accessLevel: 'full' | 'limited' | 'view_only';
}

interface EvaluatorStats {
  totalEvaluators: number;
  activeEvaluators: number;
  completionRate: number;
  averageExpertise: number;
  participationRate: number;
}

const MultiEvaluatorManager: React.FC<MultiEvaluatorManagerProps> = ({
  groupId,
  group,
  currentUserId,
  isGroupLeader,
  onMemberUpdate
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [stats, setStats] = useState<EvaluatorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState<GroupMember | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);

  // 멤버 목록 로드
  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluation-groups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('멤버 목록을 불러올 수 없습니다.');
      }

      const data: GroupAPIResponse<GroupMember[]> = await response.json();
      if (data.success && data.data) {
        setMembers(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // 통계 계산
  const calculateStats = useCallback((memberList: GroupMember[]) => {
    const totalEvaluators = memberList.length;
    const activeEvaluators = memberList.filter(m => m.isActive).length;
    const completedEvaluators = memberList.filter(m => m.evaluationCompletedAt).length;
    const completionRate = totalEvaluators > 0 ? (completedEvaluators / totalEvaluators) * 100 : 0;
    
    const totalExpertise = memberList.reduce((sum, m) => sum + m.expertiseLevel, 0);
    const averageExpertise = totalEvaluators > 0 ? totalExpertise / totalEvaluators : 0;
    
    const participatedEvaluators = memberList.filter(m => m.evaluationStartedAt).length;
    const participationRate = totalEvaluators > 0 ? (participatedEvaluators / totalEvaluators) * 100 : 0;

    setStats({
      totalEvaluators,
      activeEvaluators,
      completionRate,
      averageExpertise,
      participationRate
    });
  }, []);

  // 평가자 초대
  const inviteEvaluator = async (inviteData: InviteEvaluatorForm) => {
    try {
      const response = await fetch(`/api/evaluation-groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...inviteData,
          groupId,
          invitedBy: currentUserId
        })
      });

      if (!response.ok) {
        throw new Error('평가자 초대에 실패했습니다.');
      }

      const data: GroupAPIResponse = await response.json();
      if (data.success) {
        setShowInviteModal(false);
        await loadMembers();
        onMemberUpdate?.();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '초대 중 오류가 발생했습니다.');
    }
  };

  // 멤버 제거
  const removeMember = async (memberId: string) => {
    if (!window.confirm('정말로 이 멤버를 제거하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/evaluation-groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('멤버 제거에 실패했습니다.');
      }

      await loadMembers();
      onMemberUpdate?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : '멤버 제거 중 오류가 발생했습니다.');
    }
  };

  // 멤버 권한 변경
  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/evaluation-groups/${groupId}/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('권한 변경에 실패했습니다.');
      }

      await loadMembers();
      onMemberUpdate?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : '권한 변경 중 오류가 발생했습니다.');
    }
  };

  // 멤버 가중치 업데이트
  const updateMemberWeight = async (memberId: string, weight: number) => {
    try {
      const response = await fetch(`/api/evaluation-groups/${groupId}/members/${memberId}/weight`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ weight })
      });

      if (!response.ok) {
        throw new Error('가중치 변경에 실패했습니다.');
      }

      await loadMembers();
      onMemberUpdate?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : '가중치 변경 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // 평가자 초대 모달
  const InviteModal = () => {
    const [formData, setFormData] = useState<InviteEvaluatorForm>({
      email: '',
      name: '',
      expertiseLevel: 5,
      role: 'member',
      weight: 1.0,
      accessLevel: 'full'
    });

    return (
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="평가자 초대"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="평가자의 이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="평가자의 이름을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">전문성 수준</label>
              <select
                value={formData.expertiseLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, expertiseLevel: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}점 {i + 1 <= 3 ? '(초급)' : i + 1 <= 7 ? '(중급)' : '(고급)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">역할</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'member' | 'observer' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">멤버</option>
                <option value="observer">옵저버</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">가중치</label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{formData.weight.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">접근 수준</label>
              <select
                value={formData.accessLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">전체 접근</option>
                <option value="limited">제한된 접근</option>
                <option value="view_only">보기만 가능</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowInviteModal(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => inviteEvaluator(formData)}
              disabled={!formData.email || !formData.name}
            >
              초대 보내기
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const getStatusColor = (member: GroupMember) => {
    if (member.evaluationCompletedAt) return 'bg-green-100 text-green-800';
    if (member.evaluationStartedAt) return 'bg-blue-100 text-blue-800';
    if (member.isActive) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (member: GroupMember) => {
    if (member.evaluationCompletedAt) return '완료';
    if (member.evaluationStartedAt) return '진행 중';
    if (member.isActive) return '대기 중';
    return '비활성';
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 통계 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">평가자 관리</h2>
          <p className="text-gray-600 mt-1">그룹 구성원을 관리하고 진행 상황을 모니터링합니다.</p>
        </div>
        
        {isGroupLeader && (
          <Button
            variant="primary"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2"
          >
            <UserPlusIcon className="h-4 w-4" />
            <span>평가자 초대</span>
          </Button>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 통계 대시보드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEvaluators}</div>
              <div className="text-sm text-gray-600">총 평가자</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeEvaluators}</div>
              <div className="text-sm text-gray-600">활성 평가자</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completionRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">완료율</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.averageExpertise.toFixed(1)}</div>
              <div className="text-sm text-gray-600">평균 전문성</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.participationRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">참여율</div>
            </div>
          </Card>
        </div>
      )}

      {/* 멤버 목록 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">그룹 멤버</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평가자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전문성
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가중치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    참여일
                  </th>
                  {isGroupLeader && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          member.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {member.evaluatorId}
                          </div>
                          {member.role === 'leader' && (
                            <div className="text-xs text-blue-600">그룹 리더</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.role === 'leader' ? 'bg-blue-100 text-blue-800' :
                        member.role === 'member' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role === 'leader' ? '리더' : 
                         member.role === 'member' ? '멤버' : '옵저버'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="text-sm font-medium">{member.expertiseLevel}/10</div>
                        <div className="ml-2 flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < (member.expertiseLevel / 2) ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isGroupLeader ? (
                        <input
                          type="number"
                          min="0.1"
                          max="3.0"
                          step="0.1"
                          value={member.weight}
                          onChange={(e) => updateMemberWeight(member.id, parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{member.weight.toFixed(1)}</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(member)
                      }`}>
                        {getStatusText(member)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    
                    {isGroupLeader && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <select
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            disabled={member.evaluatorId === currentUserId}
                          >
                            <option value="member">멤버</option>
                            <option value="observer">옵저버</option>
                            {member.role === 'leader' && (
                              <option value="leader">리더</option>
                            )}
                          </select>
                          
                          {member.evaluatorId !== currentUserId && (
                            <Button
                              variant="error"
                              size="sm"
                              onClick={() => removeMember(member.id)}
                              className="p-1"
                            >
                              <UserMinusIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {members.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                아직 그룹 멤버가 없습니다.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 평가자 초대 모달 */}
      <InviteModal />
    </div>
  );
};

export default MultiEvaluatorManager;