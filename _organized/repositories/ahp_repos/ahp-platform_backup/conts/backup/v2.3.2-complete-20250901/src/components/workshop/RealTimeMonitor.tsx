/**
 * 실시간 진행 현황 모니터링 컴포넌트
 * WebSocket 연결을 통한 실시간 업데이트 및 진행 상황 추적
 */

import React, { useState, useEffect, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Participant } from './ParticipantManager';

interface RealTimeUpdate {
  type: 'participant_joined' | 'participant_progress' | 'evaluation_completed' | 'consistency_updated' | 'chat_message';
  participantId: string;
  participantName: string;
  timestamp: string;
  data: any;
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
  className = ''
}) => {
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'progress' | 'issues' | 'completed'>('all');
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket 연결 초기화
  useEffect(() => {
    initializeWebSocket();
    loadSampleSession();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        refreshSessionData();
      }, refreshInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const initializeWebSocket = () => {
    // 실제 환경에서는 WebSocket 서버에 연결
    // const ws = new WebSocket(`ws://localhost:8080/monitor/${sessionId}`);
    
    // 시뮬레이션을 위한 가짜 WebSocket
    const simulateRealTimeUpdates = () => {
      setInterval(() => {
        const mockUpdate: RealTimeUpdate = {
          type: 'participant_progress',
          participantId: `p${Math.floor(Math.random() * 26) + 1}`,
          participantName: `평가자${Math.floor(Math.random() * 26) + 1}`,
          timestamp: new Date().toISOString(),
          data: {
            completionRate: Math.floor(Math.random() * 100),
            currentCriterion: `기준-${Math.floor(Math.random() * 3) + 1}`
          }
        };
        
        setUpdates(prev => [mockUpdate, ...prev.slice(0, 49)]); // 최근 50개만 유지
      }, 3000 + Math.random() * 5000); // 3-8초 간격
    };

    setIsConnected(true);
    simulateRealTimeUpdates();
  };

  const loadSampleSession = () => {
    const sampleSession: EvaluationSession = {
      id: sessionId,
      title: '신기술 도입 우선순위 결정 워크숍',
      status: 'active',
      startTime: new Date(Date.now() - 3600000).toISOString(), // 1시간 전 시작
      currentPhase: 'evaluation',
      totalSteps: 12,
      currentStep: 8,
      participants: [] // ParticipantManager에서 가져온 데이터 사용
    };

    setSession(sampleSession);
    
    // 샘플 알림 생성
    const sampleAlerts: SystemAlert[] = [
      {
        id: 'alert1',
        type: 'warning',
        title: '일관성 문제 감지',
        message: '3명의 참가자가 일관성 비율 0.1을 초과했습니다.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false
      },
      {
        id: 'alert2',
        type: 'info',
        title: '평가 단계 진행',
        message: '전체 참가자의 75%가 2단계를 완료했습니다.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: false
      },
      {
        id: 'alert3',
        type: 'success',
        title: '참가자 완료',
        message: '김기술팀장님이 모든 평가를 완료했습니다.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: true
      }
    ];

    setAlerts(sampleAlerts);
  };

  const refreshSessionData = () => {
    if (session) {
      // 진행률 업데이트 시뮬레이션
      const updatedSession = {
        ...session,
        currentStep: Math.min(session.totalSteps, session.currentStep + Math.random() * 0.5)
      };
      setSession(updatedSession);

      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }
    }
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const getStatusColor = (status: EvaluationSession['status']) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status];
  };

  const getStatusText = (status: EvaluationSession['status']) => {
    const texts = {
      waiting: '대기중',
      active: '진행중',
      paused: '일시정지',
      completed: '완료'
    };
    return texts[status];
  };

  const getPhaseText = (phase: EvaluationSession['currentPhase']) => {
    const texts = {
      preparation: '준비 단계',
      evaluation: '평가 단계',
      review: '검토 단계',
      discussion: '토론 단계'
    };
    return texts[phase];
  };

  const getUpdateTypeIcon = (type: RealTimeUpdate['type']) => {
    const icons = {
      participant_joined: '👋',
      participant_progress: '📈',
      evaluation_completed: '✅',
      consistency_updated: '⚖️',
      chat_message: '💬'
    };
    return icons[type];
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    };
    return icons[type];
  };

  const getAlertColor = (type: SystemAlert['type']) => {
    const colors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      success: 'bg-green-50 border-green-200 text-green-800'
    };
    return colors[type];
  };

  const filteredUpdates = updates.filter(update => {
    if (filterType === 'all') return true;
    if (filterType === 'progress') return ['participant_progress', 'participant_joined'].includes(update.type);
    if (filterType === 'issues') return update.type === 'consistency_updated';
    if (filterType === 'completed') return update.type === 'evaluation_completed';
    return false;
  });

  if (!session) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 연결 상태 및 세션 정보 */}
      <Card title="실시간 모니터링">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 연결 상태 */}
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? '연결됨' : '연결 끊어짐'}
            </span>
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
            <label className="flex items-center">
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

        {/* 진행률 표시 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">전체 진행률</h3>
            <span className="text-sm text-gray-600">
              {Math.round((session.currentStep / session.totalSteps) * 100)}% 
              ({session.currentStep}/{session.totalSteps} 단계)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(session.currentStep / session.totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            시작: {new Date(session.startTime).toLocaleString('ko-KR')}
            {session.endTime && (
              <> | 종료: {new Date(session.endTime).toLocaleString('ko-KR')}</>
            )}
          </div>
        </div>

        {/* 제어 버튼 */}
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => setShowDetailedView(!showDetailedView)}
          >
            {showDetailedView ? '간단히 보기' : '상세히 보기'}
          </Button>
          <Button variant="secondary" onClick={refreshSessionData}>
            수동 새로고침
          </Button>
          {session.status === 'active' && (
            <Button variant="warning">
              세션 일시정지
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 실시간 업데이트 */}
        <Card title="실시간 활동">
          <div className="space-y-4">
            {/* 필터 */}
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-sm border rounded px-3 py-1"
              >
                <option value="all">모든 활동</option>
                <option value="progress">진행 상황</option>
                <option value="issues">문제 상황</option>
                <option value="completed">완료 알림</option>
              </select>
              <span className="text-sm text-gray-600 flex items-center">
                {filteredUpdates.length}개 업데이트
              </span>
            </div>

            {/* 업데이트 목록 */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUpdates.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  아직 활동이 없습니다.
                </div>
              ) : (
                filteredUpdates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    <span className="text-lg">{getUpdateTypeIcon(update.type)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{update.participantName}</span>
                          {update.data && (
                            <div className="text-sm text-gray-600">
                              {update.type === 'participant_progress' && (
                                <>진행률: {update.data.completionRate}% | 현재: {update.data.currentCriterion}</>
                              )}
                              {update.type === 'evaluation_completed' && (
                                <>평가 완료 | 일관성: {update.data.consistencyRatio}</>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
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
        <Card title="시스템 알림">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                새로운 알림이 없습니다.
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-3 border rounded-lg ${getAlertColor(alert.type)} ${
                    alert.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{getAlertIcon(alert.type)}</span>
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <span className="text-xs opacity-75">
                          {new Date(alert.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    </div>
                    {!alert.read && (
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75"
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

      {/* 상세 정보 (옵션) */}
      {showDetailedView && (
        <Card title="상세 세션 정보">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">세션 설정</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>세션 ID:</span>
                  <span className="font-mono">{session.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>총 단계:</span>
                  <span>{session.totalSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span>현재 단계:</span>
                  <span>{Math.round(session.currentStep)}</span>
                </div>
                <div className="flex justify-between">
                  <span>진행 시간:</span>
                  <span>
                    {Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000)}분
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">시스템 상태</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>WebSocket:</span>
                  <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? '연결됨' : '연결 끊어짐'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>업데이트 수:</span>
                  <span>{updates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>읽지 않은 알림:</span>
                  <span>{alerts.filter(a => !a.read).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>새로고침 간격:</span>
                  <span>{refreshInterval}초</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RealTimeMonitor;