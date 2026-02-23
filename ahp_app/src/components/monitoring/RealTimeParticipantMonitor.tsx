import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import apiService from '../../services/api';

interface EvaluationApiItem {
  id?: string;
  evaluator_name?: string;
  evaluator_role?: string;
  evaluator?: { name?: string };
  last_activity?: string;
  updated_at?: string;
  created_at?: string;
  progress?: number;
  status?: string;
  consistency_ratio?: number;
  total_evaluations?: number;
  completed_evaluations?: number;
  total_comparisons?: number;
  completed_comparisons?: number;
  evaluator_id?: string;
}

// 참가자 상태 인터페이스
interface ParticipantStatus {
  participantId: string;
  name: string;
  role: string;
  lastActivity: string;
  completionRate: number;
  evaluationStatus: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  consistencyRatio: number;
  totalEvaluations: number;
  completedEvaluations: number;
}

// 프로젝트 진행 상태
interface ProjectProgress {
  projectId: string;
  projectTitle: string;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  overallProgress: number;
  averageConsistency: number;
}

// 알림 인터페이스
interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  participantId: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface RealTimeParticipantMonitorProps {
  projectId: string;
  className?: string;
  onParticipantSelect?: (participantId: string) => void;
}

const RealTimeParticipantMonitor: React.FC<RealTimeParticipantMonitorProps> = ({
  projectId,
  className = '',
  onParticipantSelect
}) => {
  // 상태 관리
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5초 간격
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActivity' | 'consistency'>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 참가자 데이터 가져오기
  const fetchParticipantData = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await apiService.get<{ results?: EvaluationApiItem[] }>(
        `/api/service/evaluations/evaluations/?project=${projectId}&page_size=100`
      );
      if (res?.data) {
        const evals: EvaluationApiItem[] = (res.data as { results?: EvaluationApiItem[] }).results ?? (res.data as unknown as EvaluationApiItem[]);
        const mapped: ParticipantStatus[] = evals.map((ev: EvaluationApiItem) => {
          const apiStatus = ev.status ?? '';
          let evaluationStatus: ParticipantStatus['evaluationStatus'] = 'not_started';
          if (apiStatus === 'completed') evaluationStatus = 'completed';
          else if (apiStatus === 'in_progress') evaluationStatus = 'in_progress';
          else if (apiStatus === 'expired') evaluationStatus = 'overdue';
          else if ((ev.progress ?? 0) > 0) evaluationStatus = 'in_progress';

          return {
            participantId: String(ev.id),
            name: ev.evaluator_name || ev.evaluator?.name || `평가자 ${ev.id}`,
            role: 'evaluator',
            lastActivity: ev.updated_at || ev.created_at || new Date().toISOString(),
            completionRate: Math.round(ev.progress ?? 0),
            evaluationStatus,
            consistencyRatio: ev.consistency_ratio ?? 0,
            totalEvaluations: ev.total_comparisons ?? 0,
            completedEvaluations: ev.completed_comparisons ?? 0,
          };
        });
        setParticipants(mapped);
      }
    } catch (error) {
      showActionMessage('error', '참가자 데이터를 불러오는 데 실패했습니다.');
    }
  }, [projectId]);

  // 프로젝트 진행 상태 가져오기
  const fetchProjectProgress = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await apiService.get<any>(
        `/api/service/analysis/project-summary/?project_id=${projectId}`
      );
      if (res?.data) {
        const d = res.data;
        const total = d.total_evaluations ?? 0;
        const completed = d.completed_evaluations ?? 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        setProjectProgress(prev => ({
          projectId,
          projectTitle: d.project_title || prev?.projectTitle || '프로젝트',
          totalParticipants: total,
          activeParticipants: prev?.activeParticipants ?? 0, // participants 상태에서 파생
          completedParticipants: completed,
          overallProgress: progress,
          averageConsistency: d.average_consistency_ratio ?? 0,
        }));
      }
    } catch (error) {
      showActionMessage('error', '프로젝트 진행 상태를 불러오는 데 실패했습니다.');
    }
  }, [projectId]);

  // 알림 확인 (participants 데이터에서 파생)
  const checkForNotifications = useCallback((currentParticipants: ParticipantStatus[]) => {
    const newNotifications: Notification[] = [];
    const now = Date.now();

    currentParticipants.forEach(p => {
      // CR > 0.1 경고
      if (p.consistencyRatio > 0.1 && p.completedEvaluations > 0) {
        newNotifications.push({
          id: `cr-warning-${p.participantId}`,
          type: 'warning',
          participantId: p.participantId,
          message: `일관성 비율이 0.1을 초과했습니다 (CR: ${p.consistencyRatio.toFixed(3)})`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
      // 24시간 이상 비활성
      const lastActiveMs = new Date(p.lastActivity).getTime();
      if (!isNaN(lastActiveMs) && now - lastActiveMs > 86400000 && p.evaluationStatus !== 'completed') {
        newNotifications.push({
          id: `inactive-${p.participantId}`,
          type: 'error',
          participantId: p.participantId,
          message: '24시간 이상 비활성 상태입니다',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
        return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev;
      });
    }
  }, []);

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (!projectId) return;

    const loadAll = async () => {
      await fetchParticipantData();
      await fetchProjectProgress();
    };

    loadAll();

    if (!isRealTimeEnabled) return undefined;

    const intervalId = setInterval(loadAll, refreshInterval);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, isRealTimeEnabled, refreshInterval]);

  // participants 변경 시 알림 재계산 및 activeParticipants 업데이트
  useEffect(() => {
    if (participants.length === 0) return;
    checkForNotifications(participants);
    const active = participants.filter(p => p.evaluationStatus === 'in_progress').length;
    setProjectProgress(prev => prev ? { ...prev, activeParticipants: active } : prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  // 참가자 필터링 및 정렬
  const filteredAndSortedParticipants = useCallback(() => {
    let filtered = participants;

    // 상태별 필터링
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.evaluationStatus === filterStatus);
    }

    // 정렬
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          comparison = a.completionRate - b.completionRate;
          break;
        case 'lastActivity':
          comparison = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
          break;
        case 'consistency':
          comparison = a.consistencyRatio - b.consistencyRatio;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [participants, filterStatus, sortBy, sortOrder]);

  // 알림 확인 처리
  const acknowledgeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, acknowledged: true } : notif
      )
    );
  };

  // 참가자 상태 색상 반환
  const getStatusColor = (status: ParticipantStatus['evaluationStatus']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 참가자 세부 정보 토글
  const toggleParticipantDetails = (participantId: string) => {
    setSelectedParticipant(prev => prev === participantId ? '' : participantId);
    if (onParticipantSelect) {
      onParticipantSelect(participantId);
    }
  };

  // 시간 포맷팅
  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
      {/* 헤더 및 컨트롤 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">실시간 참가자 모니터링</h2>
          {projectProgress && (
            <p className="text-gray-600">
              {projectProgress.projectTitle} - 전체 진행률: {projectProgress.overallProgress.toFixed(1)}%
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">실시간 업데이트</span>
            <input
              type="checkbox"
              checked={isRealTimeEnabled}
              onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
              className="rounded"
            />
          </div>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
            disabled={!isRealTimeEnabled}
          >
            <option value={1000}>1초</option>
            <option value={5000}>5초</option>
            <option value={10000}>10초</option>
            <option value={30000}>30초</option>
          </select>
        </div>
      </div>

      {/* 알림 패널 */}
      {notifications.filter(n => !n.acknowledged).length > 0 && (
        <Card title="🚨 실시간 알림">
          <div className="space-y-2">
            {notifications
              .filter(n => !n.acknowledged)
              .slice(0, 5)
              .map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded border-l-4 ${
                    notification.type === 'error' ? 'border-red-500 bg-red-50' :
                    notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    notification.type === 'success' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {participants.find(p => p.participantId === notification.participantId)?.name}
                      </p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => acknowledgeNotification(notification.id)}
                      className="text-xs"
                    >
                      확인
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* 프로젝트 진행 상황 요약 */}
      {projectProgress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="총 참가자">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {projectProgress.totalParticipants}
              </div>
              <div className="text-sm text-gray-600">명</div>
            </div>
          </Card>

          <Card title="현재 활성">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {projectProgress.activeParticipants}
              </div>
              <div className="text-sm text-gray-600">명 진행중</div>
            </div>
          </Card>

          <Card title="평가 완료">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {projectProgress.completedParticipants}
              </div>
              <div className="text-sm text-gray-600">명 완료</div>
            </div>
          </Card>

          <Card title="평균 일관성">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                projectProgress.averageConsistency <= 0.1 ? 'text-green-600' : 'text-red-600'
              }`}>
                {projectProgress.averageConsistency.toFixed(3)}
              </div>
              <div className="text-sm text-gray-600">CR</div>
            </div>
          </Card>
        </div>
      )}

      {/* 전체 진행률 바 */}
      {projectProgress && (
        <Card title="전체 진행률">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>완료 ({projectProgress.completedParticipants}/{projectProgress.totalParticipants}명)</span>
              <span>{projectProgress.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${projectProgress.overallProgress}%` }}
              ></div>
            </div>
          </div>
        </Card>
      )}

      {/* 필터 및 정렬 컨트롤 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'in_progress' | 'completed' | 'overdue')}
            className="border rounded px-3 py-2"
          >
            <option value="all">전체 참가자</option>
            <option value="in_progress">평가 중</option>
            <option value="completed">완료</option>
            <option value="overdue">지연</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'progress' | 'lastActivity' | 'consistency')}
            className="border rounded px-3 py-2"
          >
            <option value="lastActivity">최근 활동</option>
            <option value="name">이름</option>
            <option value="progress">진행률</option>
            <option value="consistency">일관성</option>
          </select>

          <Button
            variant="secondary"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredAndSortedParticipants().length}명 표시 중
        </div>
      </div>

      {/* 참가자 목록 */}
      <Card title="참가자 상태">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            이 프로젝트에 배정된 평가자가 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedParticipants().map(participant => (
              <div key={participant.participantId} className="border rounded-lg p-4">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleParticipantDetails(participant.participantId)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {participant.name.charAt(0)}
                    </div>

                    <div>
                      <h4 className="font-medium">{participant.name}</h4>
                      <p className="text-xs text-gray-500">
                        마지막 활동: {formatTimeAgo(participant.lastActivity)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(participant.evaluationStatus)}`}>
                      {participant.evaluationStatus === 'completed' ? '완료' :
                       participant.evaluationStatus === 'in_progress' ? '진행중' :
                       participant.evaluationStatus === 'overdue' ? '지연' : '미시작'}
                    </span>
                    <div className="mt-1 text-sm font-medium">
                      {participant.completionRate}%
                    </div>
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>진행률</span>
                    <span>{participant.completedEvaluations}/{participant.totalEvaluations} 완료</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        participant.evaluationStatus === 'completed' ? 'bg-green-500' :
                        participant.evaluationStatus === 'in_progress' ? 'bg-blue-500' :
                        participant.evaluationStatus === 'overdue' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${participant.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* 일관성 지표 */}
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span>일관성 비율 (CR):</span>
                  <span className={`font-medium ${
                    participant.consistencyRatio <= 0.1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {participant.consistencyRatio > 0 ? participant.consistencyRatio.toFixed(3) : '-'}
                  </span>
                </div>

                {/* 세부 정보 (토글) */}
                {selectedParticipant === participant.participantId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">역할:</span>
                        <span className="ml-2">{participant.role}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">완료 비교:</span>
                        <span className="ml-2">
                          {participant.completedEvaluations} / {participant.totalEvaluations}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">마지막 활동:</span>
                        <span className="ml-2">
                          {new Date(participant.lastActivity).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-3">
                      <Button variant="secondary" className="text-xs">
                        진행 상황 상세보기
                      </Button>
                      {participant.evaluationStatus === 'overdue' && (
                        <Button variant="primary" className="text-xs">
                          알림 재전송
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RealTimeParticipantMonitor;
