/**
 * 실시간 진행 현황 모니터링 컴포넌트 (Phase 3 업데이트)
 * - useCollaboration 훅을 통한 Django Channels WebSocket 연결
 * - WebSocket 미연결 시 시뮬레이션 폴백
 * - setInterval 메모리 누수 수정
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useCollaboration } from '../../hooks/useCollaboration';
import { Participant } from './ParticipantManager';

interface RealTimeUpdate {
  type: 'participant_joined' | 'participant_progress' | 'evaluation_completed' | 'consistency_updated' | 'chat_message';
  participantId: string;
  participantName: string;
  timestamp: string;
  data: Record<string, unknown>;
}

interface EvaluationSession {
  id: string;
  title: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  startTime: string;
  endTime?: string;
  currentPhase: 'preparation' | 'evaluation' | 'review' | 'discussion';
  totalSteps: number;
  currentStep: number;
  participants: Participant[];
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface RealTimeMonitorProps {
  sessionId: string;
  onSessionUpdate?: (session: EvaluationSession) => void;
  className?: string;
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  sessionId,
  onSessionUpdate,
  className = '',
}) => {
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'progress' | 'issues' | 'completed'>('all');

  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── useCollaboration WebSocket 연결 ───────────────────────────────────────

  const { status: wsStatus, onlineUsers } = useCollaboration({
    projectId: sessionId,
    autoConnect: true,
    onEvent: (event) => {
      // WebSocket 이벤트를 RealTimeUpdate로 변환
      const typeMap: Record<string, RealTimeUpdate['type']> = {
        user_join: 'participant_joined',
        evaluation_submit: 'evaluation_completed',
        criteria_update: 'consistency_updated',
        chat_message: 'chat_message',
      };
      const updateType = typeMap[event.type] ?? 'participant_progress';

      const update: RealTimeUpdate = {
        type: updateType,
        participantId: event.user_id ?? '',
        participantName: event.user_name ?? '참가자',
        timestamp: event.timestamp,
        data: event.data ?? {},
      };
      setUpdates(prev => [update, ...prev.slice(0, 49)]);

      // 평가 완료 이벤트 → 알림 추가
      if (event.type === 'evaluation_submit') {
        const newAlert: SystemAlert = {
          id: `ws-${Date.now()}`,
          type: 'success',
          title: '평가 완료',
          message: `${event.user_name ?? '참가자'}님이 평가를 완료했습니다.`,
          timestamp: event.timestamp,
          read: false,
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
      }
    },
    onError: (err) => {
      const errorAlert: SystemAlert = {
        id: `err-${Date.now()}`,
        type: 'error',
        title: 'WebSocket 오류',
        message: err.message,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setAlerts(prev => [errorAlert, ...prev.slice(0, 19)]);
    },
  });

  const isConnected = wsStatus === 'connected';

  // ── 세션 초기화 ──────────────────────────────────────────────────────────

  useEffect(() => {
    const sampleSession: EvaluationSession = {
      id: sessionId,
      title: '신기술 도입 우선순위 결정 워크숍',
      status: 'active',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      currentPhase: 'evaluation',
      totalSteps: 12,
      currentStep: 8,
      participants: [],
    };
    setSession(sampleSession);

    setAlerts([
      {
        id: 'alert1',
        type: 'warning',
        title: '일관성 문제 감지',
        message: '3명의 참가자가 일관성 비율 0.1을 초과했습니다.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
      },
      {
        id: 'alert2',
        type: 'info',
        title: '평가 단계 진행',
        message: '전체 참가자의 75%가 2단계를 완료했습니다.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: false,
      },
      {
        id: 'alert3',
        type: 'success',
        title: '참가자 완료',
        message: '김기술팀장님이 모든 평가를 완료했습니다.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: true,
      },
    ]);
  }, [sessionId]);

  // ── WebSocket 미연결 시 시뮬레이션 폴백 (메모리 누수 수정) ───────────────

  useEffect(() => {
    if (isConnected) {
      // WebSocket 연결됨 → 시뮬레이션 중단
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    // WebSocket 미연결 → 시뮬레이션 실행
    simulationIntervalRef.current = setInterval(() => {
      const mockUpdate: RealTimeUpdate = {
        type: 'participant_progress',
        participantId: `p${Math.floor(Math.random() * 26) + 1}`,
        participantName: `평가자${Math.floor(Math.random() * 26) + 1}`,
        timestamp: new Date().toISOString(),
        data: {
          completionRate: Math.floor(Math.random() * 100),
          currentCriterion: `기준-${Math.floor(Math.random() * 3) + 1}`,
        },
      };
      setUpdates(prev => [mockUpdate, ...prev.slice(0, 49)]);
    }, 4000 + Math.random() * 4000);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, [isConnected]);

  // ── 자동 새로고침 (세션 진행률 업데이트) ─────────────────────────────────

  const refreshSessionData = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        currentStep: Math.min(prev.totalSteps, prev.currentStep + Math.random() * 0.3),
      };
      onSessionUpdate?.(updated);
      return updated;
    });
  }, [onSessionUpdate]);

  useEffect(() => {
    if (!autoRefresh) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }
    refreshIntervalRef.current = setInterval(refreshSessionData, refreshInterval * 1000);
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refreshSessionData]);

  // ── 온라인 사용자 → 세션 참가자 동기화 ──────────────────────────────────

  useEffect(() => {
    if (!isConnected || onlineUsers.length === 0) return;
    setSession(prev => {
      if (!prev) return prev;
      const wsParticipants: Participant[] = onlineUsers.map(u => ({
        id: u.user_id,
        name: u.user_name,
        email: u.user_email,
        role: (u.role === 'owner' || u.role === 'admin' ? 'facilitator' : 'expert') as 'facilitator' | 'expert',
        status: 'accepted' as const,
        invitedAt: u.connected_at,
        completionRate: 0,
        permissions: {
          canViewResults: true,
          canEditHierarchy: false,
          canManageParticipants: false,
          canExportData: false,
        },
        evaluationProgress: {
          completedCriteria: [],
          totalCriteria: 0,
          estimatedTimeRemaining: 0,
        },
      }));
      return { ...prev, participants: wsParticipants };
    });
  }, [isConnected, onlineUsers]);

  // ── 헬퍼 ──────────────────────────────────────────────────────────────────

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const getStatusColor = (status: EvaluationSession['status']) => {
    const map = { waiting: 'bg-yellow-100 text-yellow-800', active: 'bg-green-100 text-green-800', paused: 'bg-orange-100 text-orange-800', completed: 'bg-blue-100 text-blue-800' };
    return map[status];
  };
  const getStatusText = (status: EvaluationSession['status']) => {
    const map = { waiting: '대기중', active: '진행중', paused: '일시정지', completed: '완료' };
    return map[status];
  };
  const getPhaseText = (phase: EvaluationSession['currentPhase']) => {
    const map = { preparation: '준비 단계', evaluation: '평가 단계', review: '검토 단계', discussion: '토론 단계' };
    return map[phase];
  };
  const getUpdateTypeIcon = (type: RealTimeUpdate['type']) => {
    const map = { participant_joined: '👋', participant_progress: '📈', evaluation_completed: '✅', consistency_updated: '⚖️', chat_message: '💬' };
    return map[type];
  };
  const getAlertColor = (type: SystemAlert['type']) => {
    const map = { info: 'bg-blue-50 border-blue-200 text-blue-800', warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', error: 'bg-red-50 border-red-200 text-red-800', success: 'bg-green-50 border-green-200 text-green-800' };
    return map[type];
  };
  const getAlertIcon = (type: SystemAlert['type']) => {
    const map = { info: 'ℹ️', warning: '⚠️', error: '❌', success: '✅' };
    return map[type];
  };

  const getWsStatusDisplay = () => {
    switch (wsStatus) {
      case 'connected': return { dot: 'bg-green-500', text: 'WebSocket 연결됨' };
      case 'connecting': return { dot: 'bg-yellow-500 animate-pulse', text: '연결 중...' };
      case 'reconnecting': return { dot: 'bg-orange-500 animate-pulse', text: '재연결 중...' };
      default: return { dot: 'bg-gray-400', text: '시뮬레이션 모드' };
    }
  };

  const filteredUpdates = updates.filter(u => {
    if (filterType === 'all') return true;
    if (filterType === 'progress') return ['participant_progress', 'participant_joined'].includes(u.type);
    if (filterType === 'issues') return u.type === 'consistency_updated';
    if (filterType === 'completed') return u.type === 'evaluation_completed';
    return false;
  });

  if (!session) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const { dot, text: wsText } = getWsStatusDisplay();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 연결 상태 및 세션 정보 */}
      <Card title="실시간 모니터링">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 연결 상태 */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${dot}`} />
            <span className="text-sm font-medium">{wsText}</span>
          </div>

          {/* 세션 상태 */}
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(session.status)}`}>
              {getStatusText(session.status)}
            </span>
            <span className="text-sm">{getPhaseText(session.currentPhase)}</span>
          </div>

          {/* 자동 새로고침 제어 */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">자동 새로고침</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="text-xs border rounded px-2 py-1"
              disabled={!autoRefresh}
            >
              <option value={5}>5초</option>
              <option value={10}>10초</option>
              <option value={30}>30초</option>
              <option value={60}>1분</option>
            </select>
          </div>
        </div>

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">전체 진행률</h3>
            <span className="text-sm text-gray-600">
              {Math.round((session.currentStep / session.totalSteps) * 100)}%
              ({Math.round(session.currentStep)}/{session.totalSteps} 단계)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(session.currentStep / session.totalSteps) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            시작: {new Date(session.startTime).toLocaleString('ko-KR')}
            {session.endTime && <> | 종료: {new Date(session.endTime).toLocaleString('ko-KR')}</>}
          </div>
        </div>

        {/* 제어 버튼 */}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setShowDetailedView(v => !v)}>
            {showDetailedView ? '간단히 보기' : '상세히 보기'}
          </Button>
          <Button variant="secondary" onClick={refreshSessionData}>
            수동 새로고침
          </Button>
          {session.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() => setSession(prev => prev ? { ...prev, status: 'paused' } : prev)}
            >
              세션 일시정지
            </Button>
          )}
          {session.status === 'paused' && (
            <Button
              variant="primary"
              onClick={() => setSession(prev => prev ? { ...prev, status: 'active' } : prev)}
            >
              세션 재개
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 실시간 업데이트 */}
        <Card title="실시간 활동">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="text-sm border rounded px-3 py-1"
              >
                <option value="all">모든 활동</option>
                <option value="progress">진행 상황</option>
                <option value="issues">문제 상황</option>
                <option value="completed">완료 알림</option>
              </select>
              <span className="text-sm text-gray-500">{filteredUpdates.length}개 업데이트</span>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUpdates.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {isConnected ? '실시간 활동을 기다리는 중...' : '시뮬레이션 데이터를 기다리는 중...'}
                </div>
              ) : (
                filteredUpdates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg shrink-0">{getUpdateTypeIcon(update.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="font-medium text-sm">{update.participantName}</span>
                          {update.type === 'participant_progress' && update.data.completionRate !== undefined && (
                            <div className="text-xs text-gray-600 mt-0.5">
                              {`진행률: ${update.data.completionRate}%${update.data.currentCriterion ? ` | 현재: ${update.data.currentCriterion}` : ''}`}
                            </div>
                          )}
                          {update.type === 'evaluation_completed' && (
                            <div className="text-xs text-gray-600 mt-0.5">
                              평가 완료{update.data.consistencyRatio !== undefined ? ` | 일관성: ${update.data.consistencyRatio}` : ''}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(update.timestamp).toLocaleTimeString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* 시스템 알림 */}
        <Card title={`시스템 알림 ${alerts.filter(a => !a.read).length > 0 ? `(${alerts.filter(a => !a.read).length})` : ''}`}>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">새로운 알림이 없습니다.</div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg ${getAlertColor(alert.type)} ${alert.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2 min-w-0">
                      <span className="text-base shrink-0">{getAlertIcon(alert.type)}</span>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs mt-0.5">{alert.message}</p>
                        <span className="text-xs opacity-75">
                          {new Date(alert.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>
                    {!alert.read && (
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="text-xs px-2 py-0.5 bg-white bg-opacity-60 rounded hover:bg-opacity-80 shrink-0"
                      >
                        읽음
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 상세 정보 */}
      {showDetailedView && (
        <Card title="상세 세션 정보">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-sm">세션 설정</h4>
              <div className="space-y-2 text-sm">
                {[
                  ['세션 ID', session.id],
                  ['총 단계', String(session.totalSteps)],
                  ['현재 단계', String(Math.round(session.currentStep))],
                  ['진행 시간', `${Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000)}분`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}:</span>
                    <span className="font-mono text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">시스템 상태</h4>
              <div className="space-y-2 text-sm">
                {[
                  ['WebSocket', wsText],
                  ['온라인 사용자', String(onlineUsers.length)],
                  ['업데이트 수', String(updates.length)],
                  ['읽지 않은 알림', String(alerts.filter(a => !a.read).length)],
                  ['새로고침 간격', `${refreshInterval}초`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}:</span>
                    <span className={label === 'WebSocket' ? (isConnected ? 'text-green-600' : 'text-gray-500') : ''}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RealTimeMonitor;
