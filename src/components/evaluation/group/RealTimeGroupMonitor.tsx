import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WifiIcon,
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { 
  GroupMonitoringData,
  GroupMember,
  GroupWebSocketMessage,
  EvaluationGroup 
} from '../../../types/group';

interface RealTimeGroupMonitorProps {
  groupId: string;
  group: EvaluationGroup;
  members: GroupMember[];
  currentUserId: string;
  isGroupLeader: boolean;
}

interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastHeartbeat: Date | null;
  reconnectAttempts: number;
}

interface ActivityFeed {
  id: string;
  type: 'join' | 'leave' | 'submit' | 'update' | 'consensus_reached' | 'disagreement';
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface PerformanceMetrics {
  avgResponseTime: number;
  totalMessages: number;
  errorRate: number;
  activeConnections: number;
  dataUsage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RealTimeGroupMonitor: React.FC<RealTimeGroupMonitorProps> = ({
  groupId,
  group,
  members,
  currentUserId,
  isGroupLeader
}) => {
  const [monitoringData, setMonitoringData] = useState<GroupMonitoringData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    lastHeartbeat: null,
    reconnectAttempts: 0
  });
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    totalMessages: 0,
    errorRate: 0,
    activeConnections: 0,
    dataUsage: 0
  });
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageCountRef = useRef(0);
  const lastMessageTimeRef = useRef<Date | null>(null);

  // WebSocket 연결 설정
  const setupWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // 이미 연결됨
    }

    setConnectionStatus(prev => ({ 
      ...prev, 
      status: 'connecting',
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/group/${groupId}/monitor/`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('실시간 모니터링 WebSocket 연결됨');
      setConnectionStatus({
        status: 'connected',
        lastHeartbeat: new Date(),
        reconnectAttempts: 0
      });

      // 인증 메시지 전송
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId: currentUserId,
        groupId: groupId
      }));

      // 하트비트 시작
      startHeartbeat();
    };

    ws.onmessage = (event) => {
      handleWebSocketMessage(event.data);
      updatePerformanceMetrics();
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        status: 'error' 
      }));
    };

    ws.onclose = (event) => {
      console.log('WebSocket 연결 종료:', event.code, event.reason);
      setConnectionStatus(prev => ({ 
        ...prev, 
        status: 'disconnected' 
      }));
      
      stopHeartbeat();
      
      // 자동 재연결 (최대 10회)
      if (connectionStatus.reconnectAttempts < 10) {
        reconnectTimerRef.current = setTimeout(() => {
          setupWebSocket();
        }, Math.min(1000 * Math.pow(2, connectionStatus.reconnectAttempts), 30000));
      }
    };

    wsRef.current = ws;
  }, [groupId, currentUserId, connectionStatus.reconnectAttempts]);

  // 하트비트 시작
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        }));
        
        setConnectionStatus(prev => ({
          ...prev,
          lastHeartbeat: new Date()
        }));
      }
    }, 30000); // 30초마다
  }, []);

  // 하트비트 중지
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // WebSocket 메시지 처리
  const handleWebSocketMessage = useCallback((data: string) => {
    try {
      const message: GroupWebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'group_progress':
          setMonitoringData(message.data as GroupMonitoringData);
          addActivityFeedItem({
            type: 'update',
            userId: 'system',
            userName: 'System',
            message: '그룹 진행률이 업데이트되었습니다.',
            severity: 'info'
          });
          break;

        case 'participant_joined':
          const joinedMember = message.data as GroupMember;
          addActivityFeedItem({
            type: 'join',
            userId: joinedMember.evaluatorId,
            userName: joinedMember.evaluatorId,
            message: '그룹에 참여했습니다.',
            severity: 'success'
          });
          break;

        case 'participant_left':
          const leftMember = message.data as GroupMember;
          addActivityFeedItem({
            type: 'leave',
            userId: leftMember.evaluatorId,
            userName: leftMember.evaluatorId,
            message: '그룹에서 나갔습니다.',
            severity: 'warning'
          });
          break;

        case 'consensus_update':
          const consensusData = message.data as any;
          addActivityFeedItem({
            type: 'consensus_reached',
            userId: 'system',
            userName: 'System',
            message: `합의도가 ${(consensusData.level * 100).toFixed(1)}%로 업데이트되었습니다.`,
            severity: consensusData.level >= 0.7 ? 'success' : 'warning'
          });
          
          // 합의 임계값 달성 알림
          if (consensusData.level >= group.consensusThreshold) {
            addNotification({
              type: 'consensus_reached',
              message: '목표 합의도에 도달했습니다!',
              severity: 'success'
            });
          }
          break;

        case 'round_completed':
          addActivityFeedItem({
            type: 'update',
            userId: 'system',
            userName: 'System',
            message: '라운드가 완료되었습니다.',
            severity: 'success'
          });
          break;

        default:
          console.log('알 수 없는 메시지 타입:', message.type);
      }
    } catch (error) {
      console.error('WebSocket 메시지 파싱 오류:', error);
    }
  }, [group.consensusThreshold]);

  // 활동 피드 아이템 추가
  const addActivityFeedItem = useCallback((item: Omit<ActivityFeed, 'id' | 'timestamp'>) => {
    const newItem: ActivityFeed = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    setActivityFeed(prev => [newItem, ...prev].slice(0, 50)); // 최대 50개 유지
  }, []);

  // 알림 추가
  const addNotification = useCallback((notification: any) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  // 성능 메트릭 업데이트
  const updatePerformanceMetrics = useCallback(() => {
    messageCountRef.current++;
    const now = new Date();
    
    if (lastMessageTimeRef.current) {
      const responseTime = now.getTime() - lastMessageTimeRef.current.getTime();
      setPerformanceMetrics(prev => ({
        ...prev,
        avgResponseTime: (prev.avgResponseTime * (prev.totalMessages - 1) + responseTime) / prev.totalMessages,
        totalMessages: messageCountRef.current,
        activeConnections: connectionStatus.status === 'connected' ? 1 : 0,
        dataUsage: prev.dataUsage + 0.1 // KB 단위 추정
      }));
    }
    
    lastMessageTimeRef.current = now;
  }, [connectionStatus.status]);

  // 연결 상태 모니터링
  const checkConnectionHealth = useCallback(() => {
    const now = new Date();
    const lastHeartbeat = connectionStatus.lastHeartbeat;
    
    if (lastHeartbeat && now.getTime() - lastHeartbeat.getTime() > 60000) {
      // 1분 이상 하트비트 없음
      setConnectionStatus(prev => ({ 
        ...prev, 
        status: 'error' 
      }));
      
      addNotification({
        type: 'connection_warning',
        message: '연결 상태가 불안정합니다.',
        severity: 'warning'
      });
    }
  }, [connectionStatus.lastHeartbeat]);

  // 컴포넌트 마운트 시 WebSocket 연결
  useEffect(() => {
    setupWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      stopHeartbeat();
    };
  }, [setupWebSocket, stopHeartbeat]);

  // 연결 상태 모니터링
  useEffect(() => {
    const healthCheckInterval = setInterval(checkConnectionHealth, 30000);
    return () => clearInterval(healthCheckInterval);
  }, [checkConnectionHealth]);

  // 연결 상태 표시
  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon className="h-4 w-4" />;
      case 'connecting': return <ClockIcon className="h-4 w-4 animate-spin" />;
      case 'disconnected': return <XCircleIcon className="h-4 w-4" />;
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <XCircleIcon className="h-4 w-4" />;
    }
  };

  // 실시간 통계 차트 데이터
  const generateChartData = () => {
    if (!monitoringData) return [];

    return Array.from({ length: 10 }, (_, i) => ({
      time: `${i + 1}분 전`,
      participants: Math.max(1, monitoringData.activeParticipants + Math.floor(Math.random() * 3 - 1)),
      completion: Math.min(100, monitoringData.completionRate * 100 + Math.random() * 10),
      consensus: Math.min(100, monitoringData.currentConsensus * 100 + Math.random() * 5)
    }));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 및 연결 상태 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">실시간 그룹 모니터링</h2>
          <p className="text-gray-600 mt-1">그룹 활동 및 진행 상황 실시간 추적</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* 연결 상태 */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
            getConnectionStatusColor(connectionStatus.status)
          }`}>
            {getConnectionStatusIcon(connectionStatus.status)}
            <span>
              {connectionStatus.status === 'connected' ? '연결됨' :
               connectionStatus.status === 'connecting' ? '연결 중' :
               connectionStatus.status === 'disconnected' ? '연결 끊김' : '오류'}
            </span>
          </div>

          {/* 고급 메트릭 토글 */}
          {isGroupLeader && (
            <Button
              variant={showAdvancedMetrics ? "primary" : "secondary"}
              size="sm"
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            >
              <CogIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 알림 */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`flex items-center p-3 rounded-lg border ${
                notification.severity === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notification.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                notification.severity === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <BellIcon className="h-5 w-5 mr-3" />
              <span>{notification.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 실시간 통계 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주요 메트릭 */}
          {monitoringData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <div className="p-4 text-center">
                  <UsersIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {monitoringData.activeParticipants}
                  </div>
                  <div className="text-sm text-gray-600">활성 참여자</div>
                </div>
              </Card>

              <Card>
                <div className="p-4 text-center">
                  <ChartBarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {(monitoringData.completionRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">완료율</div>
                </div>
              </Card>

              <Card>
                <div className="p-4 text-center">
                  <WifiIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {(monitoringData.currentConsensus * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">합의도</div>
                </div>
              </Card>

              <Card>
                <div className="p-4 text-center">
                  <ClockIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {monitoringData.timeRemaining ? `${monitoringData.timeRemaining}분` : '-'}
                  </div>
                  <div className="text-sm text-gray-600">예상 잔여시간</div>
                </div>
              </Card>
            </div>
          )}

          {/* 실시간 차트 */}
          {monitoringData && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">실시간 활동 추이</h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="participants" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="활성 참여자"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="consensus" 
                        stroke="#7c3aed" 
                        strokeWidth={2}
                        name="합의도 (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}

          {/* 고급 메트릭 (리더만 표시) */}
          {showAdvancedMetrics && isGroupLeader && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">성능 메트릭</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {performanceMetrics.avgResponseTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-600">평균 응답시간</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {performanceMetrics.totalMessages}
                    </div>
                    <div className="text-sm text-gray-600">총 메시지</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {(performanceMetrics.errorRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">에러율</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {performanceMetrics.dataUsage.toFixed(1)}KB
                    </div>
                    <div className="text-sm text-gray-600">데이터 사용량</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* 활동 피드 */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">실시간 활동</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityFeed.map(activity => (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      activity.severity === 'success' ? 'border-green-500 bg-green-50' :
                      activity.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      activity.severity === 'error' ? 'border-red-500 bg-red-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.userName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {activity.message}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {activity.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activityFeed.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    아직 활동이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealTimeGroupMonitor;