// 그룹 평가 통합 대시보드
// Opus 4.1 설계 기반 AIJ/AIP/Fuzzy 통합 시스템

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../../config/api';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type {
  EvaluationGroup,
  GroupMember,
  GroupEvaluationSession,
  GroupMonitoringData,
  ConsensusMetrics,
  GroupAPIResponse
} from '../../../types/group';

interface GroupEvaluationDashboardProps {
  projectId: string;
  currentUserId: string;
  onGroupCreate?: (group: EvaluationGroup) => void;
  onGroupJoin?: (groupId: string) => void;
}

const GroupEvaluationDashboard: React.FC<GroupEvaluationDashboardProps> = ({
  projectId,
  currentUserId,
  onGroupCreate,
  onGroupJoin
}) => {
  // State 관리
  const [groups, setGroups] = useState<EvaluationGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<EvaluationGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentSession, setCurrentSession] = useState<GroupEvaluationSession | null>(null);
  const [monitoringData, setMonitoringData] = useState<GroupMonitoringData | null>(null);
  const [consensusMetrics, setConsensusMetrics] = useState<ConsensusMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // 그룹 목록 로드
  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/evaluation-groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('그룹 목록을 불러올 수 없습니다.');
      }

      const data: GroupAPIResponse<EvaluationGroup[]> = await response.json();
      if (data.success && data.data) {
        setGroups(data.data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // 그룹 멤버 로드
  const loadGroupMembers = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-groups/${groupId}/members`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('그룹 멤버 정보를 불러올 수 없습니다.');
      }

      const data: GroupAPIResponse<GroupMember[]> = await response.json();
      if (data.success && data.data) {
        setGroupMembers(data.data);
      }
    } catch (error) {
      console.error('그룹 멤버 로드 실패:', error);
    }
  }, []);

  // 현재 세션 로드
  const loadCurrentSession = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-groups/${groupId}/current-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data: GroupAPIResponse<GroupEvaluationSession> = await response.json();
        if (data.success && data.data) {
          setCurrentSession(data.data);
        }
      }
    } catch (error) {
      console.error('세션 정보 로드 실패:', error);
    }
  }, []);

  // WebSocket 연결 설정
  const setupWebSocket = useCallback((groupId: string) => {
    if (wsConnection) {
      wsConnection.close();
    }

    const wsUrl = `ws://localhost:8000/ws/group/${groupId}/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('그룹 WebSocket 연결됨');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'group_progress':
            setMonitoringData(message.data as GroupMonitoringData);
            break;
          case 'consensus_update':
            setConsensusMetrics(message.data as ConsensusMetrics);
            break;
          case 'participant_joined':
          case 'participant_left':
            loadGroupMembers(groupId);
            break;
          default:
            console.log('알 수 없는 메시지 타입:', message.type);
        }
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
    };

    setWsConnection(ws);

    return () => {
      ws.close();
    };
  }, [wsConnection, loadGroupMembers]);

  // 그룹 선택
  const handleGroupSelect = useCallback(async (group: EvaluationGroup) => {
    setSelectedGroup(group);
    await Promise.all([
      loadGroupMembers(group.id),
      loadCurrentSession(group.id)
    ]);
    setupWebSocket(group.id);
  }, [loadGroupMembers, loadCurrentSession, setupWebSocket]);

  // 그룹 생성
  const handleCreateGroup = async (formData: {
    name: string;
    description: string;
    aggregationMethod: string;
    consensusThreshold: number;
    maxEvaluators: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          projectId,
          ...formData,
          minEvaluators: 2,
          createdBy: currentUserId
        })
      });

      if (!response.ok) {
        throw new Error('그룹 생성에 실패했습니다.');
      }

      const data: GroupAPIResponse<EvaluationGroup> = await response.json();
      if (data.success && data.data) {
        setGroups(prev => [...prev, data.data!]);
        setShowCreateForm(false);
        onGroupCreate?.(data.data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '그룹 생성 중 오류가 발생했습니다.');
    }
  };

  // 그룹 참여
  const handleJoinGroup = async (groupId: string, expertiseLevel: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluation-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          evaluatorId: currentUserId,
          expertiseLevel,
          role: 'member'
        })
      });

      if (!response.ok) {
        throw new Error('그룹 참여에 실패했습니다.');
      }

      await loadGroups();
      onGroupJoin?.(groupId);
    } catch (error) {
      setError(error instanceof Error ? error.message : '그룹 참여 중 오류가 발생했습니다.');
    }
  };

  // 평가 세션 시작
  const handleStartSession = async (sessionType: 'synchronous' | 'asynchronous' | 'delphi') => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/group-evaluation-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          sessionType,
          consensusThreshold: selectedGroup.consensusThreshold,
          maxRounds: sessionType === 'delphi' ? 5 : undefined
        })
      });

      if (!response.ok) {
        throw new Error('세션 시작에 실패했습니다.');
      }

      const data: GroupAPIResponse<GroupEvaluationSession> = await response.json();
      if (data.success && data.data) {
        setCurrentSession(data.data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '세션 시작 중 오류가 발생했습니다.');
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // 컴포넌트 언마운트 시 WebSocket 정리
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  // 그룹 생성 폼 컴포넌트
  const CreateGroupForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      aggregationMethod: 'geometric_mean',
      consensusThreshold: 0.7,
      maxEvaluators: 10
    });

    return (
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">새 그룹 생성</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">그룹 이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="그룹 이름을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">통합 방법</label>
              <select
                value={formData.aggregationMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, aggregationMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="geometric_mean">기하평균 (AIJ)</option>
                <option value="arithmetic_mean">산술평균 (AIP)</option>
                <option value="weighted_avg">가중평균</option>
                <option value="fuzzy">퍼지 통합</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">합의 임계값</label>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={formData.consensusThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, consensusThreshold: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{(formData.consensusThreshold * 100).toFixed(0)}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">최대 참여자 수</label>
              <input
                type="number"
                min="2"
                max="50"
                value={formData.maxEvaluators}
                onChange={(e) => setFormData(prev => ({ ...prev, maxEvaluators: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="그룹에 대한 설명을 입력하세요"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowCreateForm(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => handleCreateGroup(formData)}
              disabled={!formData.name.trim()}
            >
              그룹 생성
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">그룹 평가 시스템</h1>
          <p className="text-gray-600 mt-1">여러 평가자가 함께 의사결정을 진행하는 통합 시스템</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <UserGroupIcon className="h-5 w-5" />
          <span>새 그룹 생성</span>
        </Button>
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

      {/* 그룹 생성 폼 */}
      {showCreateForm && <CreateGroupForm />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 그룹 목록 */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">참여 가능한 그룹</h2>
              <div className="space-y-3">
                {groups.map(group => (
                  <div
                    key={group.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{group.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        group.status === 'active' ? 'bg-green-100 text-green-800' :
                        group.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {group.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>방법: {group.aggregationMethod}</span>
                      <span>합의: {(group.consensusThreshold * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
                {groups.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    참여 가능한 그룹이 없습니다.<br />
                    새 그룹을 생성해보세요.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 그룹 상세 정보 */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <div className="space-y-6">
              {/* 그룹 정보 */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{selectedGroup.name}</h2>
                    <div className="flex space-x-2">
                      {!currentSession && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => handleStartSession('asynchronous')}
                            className="flex items-center space-x-2"
                          >
                            <PlayIcon className="h-4 w-4" />
                            <span>비동기 시작</span>
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleStartSession('synchronous')}
                            className="flex items-center space-x-2"
                          >
                            <PlayIcon className="h-4 w-4" />
                            <span>실시간 시작</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* 참여자 목록 */}
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">참여자 ({groupMembers.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {groupMembers.map(member => (
                        <div key={member.id} className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            member.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span>{member.evaluatorId}</span>
                          {member.role === 'leader' && (
                            <span className="text-xs text-blue-600">(리더)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 현재 세션 정보 */}
                  {currentSession && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-900">
                            {currentSession.sessionType} 세션 진행 중
                          </p>
                          <p className="text-sm text-blue-600">
                            현재 합의도: {(currentSession.currentConsensus * 100).toFixed(1)}% 
                            (목표: {(currentSession.consensusThreshold * 100).toFixed(0)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* 실시간 모니터링 */}
              {monitoringData && (
                <Card>
                  <div className="p-6">
                    <h3 className="font-semibold mb-4">실시간 진행 상황</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {monitoringData.activeParticipants}
                        </p>
                        <p className="text-sm text-gray-600">활성 참여자</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {(monitoringData.completionRate * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-600">완료율</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {monitoringData.averageConsistency.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">평균 일관성</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {(monitoringData.currentConsensus * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-600">현재 합의도</p>
                      </div>
                    </div>

                    {/* 알림 */}
                    {monitoringData.alerts.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">알림</h4>
                        <div className="space-y-2">
                          {monitoringData.alerts.slice(0, 3).map((alert, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-md text-sm ${
                                alert.severity === 'high' ? 'bg-red-50 text-red-800' :
                                alert.severity === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                                'bg-blue-50 text-blue-800'
                              }`}
                            >
                              {alert.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <div className="p-12 text-center">
                <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  그룹을 선택하세요
                </h2>
                <p className="text-gray-600">
                  왼쪽에서 참여할 그룹을 선택하거나 새 그룹을 생성하세요.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupEvaluationDashboard;