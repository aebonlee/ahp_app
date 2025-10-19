/**
 * 워크숍 참가자 관리 컴포넌트
 * 다중 평가자 초대, 상태 추적, 권한 관리
 */

import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'facilitator' | 'expert' | 'stakeholder' | 'observer';
  department?: string;
  organization?: string;
  status: 'invited' | 'accepted' | 'declined' | 'in_progress' | 'completed';
  invitedAt: string;
  lastActivity?: string;
  completionRate: number;
  consistencyRatio?: number;
  accessToken?: string;
  permissions: {
    canViewResults: boolean;
    canEditHierarchy: boolean;
    canManageParticipants: boolean;
    canExportData: boolean;
  };
  workshopSessionId?: string;
  evaluationProgress: {
    completedCriteria: string[];
    totalCriteria: number;
    estimatedTimeRemaining: number;
  };
}

export interface WorkshopSession {
  id: string;
  title: string;
  description: string;
  facilitatorId: string;
  scheduledDate: string;
  duration: number; // minutes
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  participants: Participant[];
  settings: {
    allowLateJoin: boolean;
    requireAllComplete: boolean;
    showRealTimeResults: boolean;
    enableChat: boolean;
    maxParticipants: number;
  };
}

interface ParticipantManagerProps {
  projectId: string;
  onParticipantsChange?: (participants: Participant[]) => void;
  readOnly?: boolean;
  className?: string;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  projectId,
  onParticipantsChange,
  readOnly = false,
  className = ''
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    role: 'expert' as Participant['role'],
    department: '',
    organization: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'none' | 'invite' | 'remind' | 'remove'>('none');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | Participant['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 샘플 데이터 로드
  useEffect(() => {
    loadSampleParticipants();
  }, [projectId]);

  const loadSampleParticipants = () => {
    const sampleParticipants: Participant[] = [
      {
        id: 'p1',
        name: '김기술팀장',
        email: 'kim.tech@company.com',
        role: 'expert',
        department: '기술개발팀',
        organization: 'TechCorp',
        status: 'completed',
        invitedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        completionRate: 100,
        consistencyRatio: 0.09,
        permissions: {
          canViewResults: true,
          canEditHierarchy: false,
          canManageParticipants: false,
          canExportData: true
        },
        evaluationProgress: {
          completedCriteria: ['criterion-1', 'criterion-2', 'criterion-3'],
          totalCriteria: 3,
          estimatedTimeRemaining: 0
        }
      },
      {
        id: 'p2',
        name: '이개발자',
        email: 'lee.dev@company.com',
        role: 'expert',
        department: '소프트웨어개발팀',
        organization: 'TechCorp',
        status: 'in_progress',
        invitedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastActivity: new Date(Date.now() - 1800000).toISOString(),
        completionRate: 85,
        consistencyRatio: 0.12,
        permissions: {
          canViewResults: true,
          canEditHierarchy: false,
          canManageParticipants: false,
          canExportData: false
        },
        evaluationProgress: {
          completedCriteria: ['criterion-1', 'criterion-2'],
          totalCriteria: 3,
          estimatedTimeRemaining: 15
        }
      },
      {
        id: 'p3',
        name: '박분석가',
        email: 'park.analyst@company.com',
        role: 'stakeholder',
        department: '경영분석팀',
        organization: 'TechCorp',
        status: 'completed',
        invitedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        lastActivity: new Date(Date.now() - 7200000).toISOString(),
        completionRate: 100,
        consistencyRatio: 0.06,
        permissions: {
          canViewResults: true,
          canEditHierarchy: false,
          canManageParticipants: false,
          canExportData: true
        },
        evaluationProgress: {
          completedCriteria: ['criterion-1', 'criterion-2', 'criterion-3'],
          totalCriteria: 3,
          estimatedTimeRemaining: 0
        }
      },
      {
        id: 'p4',
        name: '최연구원',
        email: 'choi.researcher@company.com',
        role: 'expert',
        department: 'R&D센터',
        organization: 'TechCorp',
        status: 'in_progress',
        invitedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        lastActivity: new Date(Date.now() - 900000).toISOString(),
        completionRate: 70,
        consistencyRatio: 0.15,
        permissions: {
          canViewResults: false,
          canEditHierarchy: false,
          canManageParticipants: false,
          canExportData: false
        },
        evaluationProgress: {
          completedCriteria: ['criterion-1'],
          totalCriteria: 3,
          estimatedTimeRemaining: 25
        }
      }
    ];

    // 26명까지 확장
    for (let i = 5; i <= 26; i++) {
      const statuses: Participant['status'][] = ['invited', 'accepted', 'in_progress', 'completed'];
      const roles: Participant['role'][] = ['expert', 'stakeholder'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      sampleParticipants.push({
        id: `p${i}`,
        name: `평가자${i}`,
        email: `evaluator${i}@company.com`,
        role: randomRole,
        department: `부서${Math.floor(i / 5) + 1}`,
        organization: 'TechCorp',
        status: randomStatus,
        invitedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        lastActivity: randomStatus !== 'invited' ? new Date(Date.now() - Math.random() * 86400000 * 2).toISOString() : undefined,
        completionRate: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 80 + 20),
        consistencyRatio: Math.random() * 0.15 + 0.05,
        permissions: {
          canViewResults: true,
          canEditHierarchy: false,
          canManageParticipants: false,
          canExportData: randomRole === 'expert'
        },
        evaluationProgress: {
          completedCriteria: randomStatus === 'completed' ? ['criterion-1', 'criterion-2', 'criterion-3'] : 
                              randomStatus === 'in_progress' ? ['criterion-1'] : [],
          totalCriteria: 3,
          estimatedTimeRemaining: randomStatus === 'completed' ? 0 : Math.floor(Math.random() * 45 + 5)
        }
      });
    }

    setParticipants(sampleParticipants);
  };

  const addParticipant = async () => {
    if (!newParticipant.name || !newParticipant.email) {
      alert('이름과 이메일은 필수 입력 항목입니다.');
      return;
    }

    const participant: Participant = {
      id: `p${Date.now()}`,
      ...newParticipant,
      status: 'invited',
      invitedAt: new Date().toISOString(),
      completionRate: 0,
      permissions: {
        canViewResults: true,
        canEditHierarchy: false,
        canManageParticipants: false,
        canExportData: newParticipant.role === 'expert'
      },
      evaluationProgress: {
        completedCriteria: [],
        totalCriteria: 3,
        estimatedTimeRemaining: 0
      }
    };

    setParticipants([...participants, participant]);
    setNewParticipant({
      name: '',
      email: '',
      role: 'expert',
      department: '',
      organization: ''
    });
    setShowAddForm(false);

    // 초대 이메일 전송 시뮬레이션
    console.log(`초대 이메일이 ${participant.email}로 전송되었습니다.`);
  };

  const removeParticipant = (participantId: string) => {
    if (confirm('정말로 이 참가자를 제거하시겠습니까?')) {
      setParticipants(participants.filter(p => p.id !== participantId));
    }
  };

  const updateParticipantStatus = (participantId: string, status: Participant['status']) => {
    setParticipants(participants.map(p => 
      p.id === participantId 
        ? { ...p, status, lastActivity: new Date().toISOString() }
        : p
    ));
  };

  const sendReminder = async (participantIds: string[]) => {
    setIsLoading(true);
    // 실제로는 API 호출
    setTimeout(() => {
      alert(`${participantIds.length}명에게 알림 이메일을 전송했습니다.`);
      setIsLoading(false);
    }, 1000);
  };

  const bulkInvite = async (emails: string[]) => {
    // 대량 초대 기능
    console.log('대량 초대:', emails);
  };

  const exportParticipantData = () => {
    const csvContent = `이름,이메일,역할,부서,상태,완료율,일관성비율\n${
      participants.map(p => 
        `${p.name},${p.email},${p.role},${p.department || ''},${p.status},${p.completionRate}%,${p.consistencyRatio?.toFixed(3) || ''}`
      ).join('\n')
    }`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${projectId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 필터링된 참가자 목록
  const filteredParticipants = participants.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: Participant['status']) => {
    const colors = {
      invited: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      declined: 'bg-red-100 text-red-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  const getStatusText = (status: Participant['status']) => {
    const texts = {
      invited: '초대됨',
      accepted: '수락함',
      declined: '거절함',
      in_progress: '진행중',
      completed: '완료'
    };
    return texts[status];
  };

  const getRoleText = (role: Participant['role']) => {
    const texts = {
      facilitator: '진행자',
      expert: '전문가',
      stakeholder: '이해관계자',
      observer: '참관자'
    };
    return texts[role];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 및 통계 */}
      <Card title="참가자 관리">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
            <div className="text-sm text-blue-600">총 참가자</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {participants.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-green-600">완료</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {participants.filter(p => p.status === 'in_progress').length}
            </div>
            <div className="text-sm text-yellow-600">진행중</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {participants.filter(p => p.status === 'invited').length}
            </div>
            <div className="text-sm text-red-600">대기중</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(participants.reduce((sum, p) => sum + p.completionRate, 0) / participants.length)}%
            </div>
            <div className="text-sm text-purple-600">평균 진행률</div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-60">
            <input
              type="text"
              placeholder="이름, 이메일, 부서로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">모든 상태</option>
            <option value="invited">초대됨</option>
            <option value="accepted">수락함</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="declined">거절함</option>
          </select>
          {!readOnly && (
            <Button
              variant="primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              ➕ 참가자 추가
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={exportParticipantData}
          >
            📊 데이터 내보내기
          </Button>
        </div>

        {/* 참가자 추가 폼 */}
        {showAddForm && !readOnly && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3">새 참가자 추가</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="이름 *"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <input
                type="email"
                placeholder="이메일 *"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <select
                value={newParticipant.role}
                onChange={(e) => setNewParticipant({...newParticipant, role: e.target.value as any})}
                className="px-3 py-2 border rounded"
              >
                <option value="expert">전문가</option>
                <option value="stakeholder">이해관계자</option>
                <option value="observer">참관자</option>
              </select>
              <input
                type="text"
                placeholder="부서"
                value={newParticipant.department}
                onChange={(e) => setNewParticipant({...newParticipant, department: e.target.value})}
                className="px-3 py-2 border rounded"
              />
            </div>
            <div className="flex space-x-2 mt-3">
              <Button variant="primary" onClick={addParticipant}>
                추가
              </Button>
              <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                취소
              </Button>
            </div>
          </div>
        )}

        {/* 참가자 목록 */}
        <div className="space-y-3">
          {filteredParticipants.map(participant => (
            <div key={participant.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {participant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{participant.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(participant.status)}`}>
                        {getStatusText(participant.status)}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {getRoleText(participant.role)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {participant.email} | {participant.department} | {participant.organization}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      초대일: {new Date(participant.invitedAt).toLocaleDateString('ko-KR')}
                      {participant.lastActivity && (
                        <> | 마지막 활동: {new Date(participant.lastActivity).toLocaleString('ko-KR')}</>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* 진행률 */}
                  <div className="text-right">
                    <div className="text-sm font-medium">{participant.completionRate}%</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${participant.completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* 일관성 비율 */}
                  {participant.consistencyRatio && (
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        participant.consistencyRatio <= 0.1 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        CR: {participant.consistencyRatio.toFixed(3)}
                      </div>
                    </div>
                  )}
                  
                  {/* 액션 버튼 */}
                  {!readOnly && (
                    <div className="flex space-x-1">
                      {participant.status === 'invited' && (
                        <button
                          onClick={() => sendReminder([participant.id])}
                          className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="알림 전송"
                        >
                          📧
                        </button>
                      )}
                      <button
                        onClick={() => removeParticipant(participant.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="제거"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 상세 진행 정보 */}
              {participant.status === 'in_progress' && (
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <div className="text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span>평가 진행 상황:</span>
                      <span>{participant.evaluationProgress.completedCriteria.length} / {participant.evaluationProgress.totalCriteria} 기준 완료</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>예상 남은 시간:</span>
                      <span className="text-blue-600 font-medium">{participant.evaluationProgress.estimatedTimeRemaining}분</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            조건에 맞는 참가자가 없습니다.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ParticipantManager;