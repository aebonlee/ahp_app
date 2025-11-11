// 실시간 모니터링 대시보드
// Opus 4.1 설계 기반

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import type {
  RealtimeMetrics,
  ActiveUser,
  ProjectProgress,
  MonitoringAlert,
  AnomalyDetection,
  PerformanceMetrics,
  MonitoringDashboardProps,
  RealtimeUpdate,
  DashboardFilter
} from '../../types/monitoring';

const RealtimeMonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  projectId,
  userRole,
  autoRefresh = true,
  initialFilter,
  onAlertAction
}) => {
  // State 관리
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<DashboardFilter>(
    initialFilter || {
      timeRange: { start: '', end: '', preset: 'last_hour' },
      includeResolved: false,
      severityLevel: 'warning+'
    }
  );

  // WebSocket 연결 관리
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // WebSocket 연결 설정
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = projectId 
      ? `ws://localhost:8000/ws/monitoring/${projectId}/`
      : `ws://localhost:8000/ws/monitoring/global/`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('모니터링 WebSocket 연결됨');
      setIsConnected(true);
      setReconnectAttempts(0);

      // 구독 메시지 전송
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'monitoring',
        projectId: projectId || 'global',
        timestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      try {
        const update: RealtimeUpdate = JSON.parse(event.data);
        handleRealtimeUpdate(update);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    };

    ws.onclose = () => {
      console.log('모니터링 WebSocket 연결 종료');
      setIsConnected(false);
      
      if (autoRefresh && reconnectAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
      setIsConnected(false);
    };
  }, [projectId, autoRefresh, reconnectAttempts]);

  // 실시간 업데이트 처리
  const handleRealtimeUpdate = useCallback((update: RealtimeUpdate) => {
    switch (update.type) {
      case 'metrics_update':
        if (update.data.metrics) {
          setMetrics(update.data.metrics);
        }
        break;
      
      case 'progress_update':
        if (update.data.progress) {
          setProjectProgress(update.data.progress);
        }
        break;
      
      case 'user_activity':
        if (update.data.activeUsers) {
          setActiveUsers(update.data.activeUsers);
        }
        break;
      
      case 'alert':
        if (update.data.alert) {
          setAlerts(prev => {
            const existing = prev.find(a => a.id === update.data.alert!.id);
            if (existing) {
              return prev.map(a => a.id === update.data.alert!.id ? update.data.alert! : a);
            } else {
              return [update.data.alert!, ...prev.slice(0, 99)]; // 최대 100개 유지
            }
          });
        }
        break;
      
      case 'system_status':
        if (update.data.anomaly) {
          setAnomalies(prev => {
            const existing = prev.find(a => a.id === update.data.anomaly!.id);
            if (existing) {
              return prev.map(a => a.id === update.data.anomaly!.id ? update.data.anomaly! : a);
            } else {
              return [update.data.anomaly!, ...prev.slice(0, 49)]; // 최대 50개 유지
            }
          });
        }
        if (update.data.performance) {
          setPerformance(update.data.performance);
        }
        break;
    }
  }, []);

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      const baseUrl = '/api/monitoring';
      const projectParam = projectId ? `?projectId=${projectId}` : '';

      // 병렬로 초기 데이터 로드
      const [metricsRes, usersRes, progressRes, alertsRes] = await Promise.all([
        fetch(`${baseUrl}/metrics${projectParam}`),
        fetch(`${baseUrl}/active-users${projectParam}`),
        projectId ? fetch(`${baseUrl}/progress/${projectId}`) : Promise.resolve(null),
        fetch(`${baseUrl}/alerts${projectParam}`)
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        if (metricsData.success && metricsData.data) {
          setMetrics(metricsData.data);
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success && usersData.data) {
          setActiveUsers(usersData.data);
        }
      }

      if (progressRes?.ok) {
        const progressData = await progressRes.json();
        if (progressData.success && progressData.data) {
          setProjectProgress(progressData.data);
        }
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success && alertsData.data) {
          setAlerts(alertsData.data);
        }
      }

    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    }
  }, [projectId]);

  // 알림 액션 처리
  const handleAlertAction = useCallback(async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                acknowledgedAt: action === 'acknowledge' ? new Date().toISOString() : alert.acknowledgedAt,
                resolvedAt: action === 'resolve' ? new Date().toISOString() : alert.resolvedAt
              }
            : alert
        ));
        
        onAlertAction?.(alerts.find(a => a.id === alertId)!, action);
      }
    } catch (error) {
      console.error(`알림 ${action} 실패:`, error);
    }
  }, [alerts, onAlertAction]);

  // 컴포넌트 마운트 및 정리
  useEffect(() => {
    loadInitialData();
    if (autoRefresh) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [loadInitialData, connectWebSocket, autoRefresh]);

  // 메트릭 카드 컴포넌트
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    className?: string;
  }> = ({ title, value, icon, trend, className = '' }) => (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="flex items-center space-x-2">
          {icon}
          {trend && (
            <span className={`text-xs px-2 py-1 rounded ${
              trend === 'up' ? 'bg-green-100 text-green-800' :
              trend === 'down' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  // 활성 사용자 리스트 컴포넌트
  const ActiveUsersList: React.FC = () => (
    <Card>
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          활성 사용자 ({activeUsers.length})
        </h3>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        {activeUsers.length > 0 ? (
          <div className="space-y-2">
            {activeUsers.map(user => (
              <div key={user.evaluatorId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.status === 'online' ? 'bg-green-500' :
                    user.status === 'evaluating' ? 'bg-blue-500' :
                    user.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{user.name || user.evaluatorId}</p>
                    <p className="text-xs text-gray-500">
                      {user.currentNodeId ? `작업 중: ${user.currentNodeId}` : user.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.progressPercentage.toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.lastActivity).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            활성 사용자가 없습니다
          </div>
        )}
      </div>
    </Card>
  );

  // 알림 패널 컴포넌트
  const AlertPanel: React.FC = () => (
    <Card>
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center">
          <BellIcon className="h-5 w-5 mr-2" />
          알림 ({alerts.filter(a => !a.resolvedAt).length})
        </h3>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        {alerts.filter(a => !a.resolvedAt).length > 0 ? (
          <div className="space-y-2">
            {alerts.filter(a => !a.resolvedAt).slice(0, 10).map(alert => (
              <div key={alert.id} className={`p-3 rounded border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'error' ? 'border-orange-500 bg-orange-50' :
                alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.triggeredAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    {!alert.acknowledgedAt && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                      >
                        <EyeIcon className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAlertAction(alert.id, 'resolve')}
                    >
                      <CheckCircleIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            활성 알림이 없습니다
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">실시간 모니터링 대시보드</h1>
          <p className="text-gray-600 mt-1">
            평가 진행 상황을 실시간으로 추적하고 분석합니다
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <SignalIcon className="h-4 w-4" />
            <span className="text-sm">
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* 주요 메트릭 카드들 */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="활성 평가자"
            value={metrics.counters.activeEvaluators}
            icon={<UserGroupIcon className="h-6 w-6 text-blue-500" />}
          />
          <MetricCard
            title="전체 진행률"
            value={`${metrics.gauges.overallProgress.toFixed(1)}%`}
            icon={<ChartBarIcon className="h-6 w-6 text-green-500" />}
          />
          <MetricCard
            title="평균 일관성"
            value={metrics.gauges.averageConsistency.toFixed(3)}
            icon={<CpuChipIcon className="h-6 w-6 text-purple-500" />}
          />
          <MetricCard
            title="응답시간"
            value={`${metrics.gauges.responseTime.toFixed(0)}ms`}
            icon={<ClockIcon className="h-6 w-6 text-orange-500" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 활성 사용자 */}
        <ActiveUsersList />

        {/* 알림 패널 */}
        <AlertPanel />
      </div>

      {/* 프로젝트 진행률 (프로젝트 특정 뷰에서만) */}
      {projectProgress && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold mb-4">프로젝트 진행률</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>전체 노드</span>
                  <span>{projectProgress.completedNodes}/{projectProgress.totalNodes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${projectProgress.progressPercentage}%` }}
                  />
                </div>
              </div>

              {projectProgress.nodeProgress.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectProgress.nodeProgress.slice(0, 6).map(node => (
                    <div key={node.nodeId} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{node.nodeName}</span>
                        <span className="text-xs text-gray-600">
                          {node.completedEvaluators}/{node.totalEvaluators}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full"
                          style={{ 
                            width: `${(node.completedEvaluators / node.totalEvaluators) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        평균 CR: {node.averageConsistency.toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 이상 탐지 */}
      {anomalies.filter(a => !a.resolvedAt).length > 0 && (
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center text-yellow-700">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              이상 탐지 ({anomalies.filter(a => !a.resolvedAt).length})
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {anomalies.filter(a => !a.resolvedAt).slice(0, 5).map(anomaly => (
                <div key={anomaly.id} className="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{anomaly.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{anomaly.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>유형: {anomaly.type}</span>
                        <span>심각도: {anomaly.severity}</span>
                        <span>신뢰도: {((anomaly.metadata.confidence || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                      anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 성능 메트릭 (관리자 권한만) */}
      {userRole === 'admin' && performance && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold mb-4">시스템 성능</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">CPU 사용률</p>
                <p className="text-xl font-bold">{performance.system.cpuUsage.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">메모리 사용률</p>
                <p className="text-xl font-bold">{performance.system.memoryUsage.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">WebSocket 연결</p>
                <p className="text-xl font-bold">{performance.websocket.totalConnections}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">요청/초</p>
                <p className="text-xl font-bold">{performance.application.requestsPerSecond.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RealtimeMonitoringDashboard;