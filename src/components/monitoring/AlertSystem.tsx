// 실시간 알림 시스템
// Opus 4.1 설계 기반

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../../config/api';
import Card from '../common/Card';
import Button from '../common/Button';
import type {
  MonitoringAlert,
  AnomalyDetection,
  CreateAlertRuleRequest,
  MonitoringAPIResponse
} from '../../types/monitoring';

interface AlertSystemProps {
  projectId?: string;
  userRole: 'admin' | 'manager' | 'evaluator';
  onAlertAction?: (alertId: string, action: string) => void;
  maxDisplayAlerts?: number;
  autoAcknowledgeTimeout?: number; // minutes
}

const AlertSystem: React.FC<AlertSystemProps> = ({
  projectId,
  userRole,
  onAlertAction,
  maxDisplayAlerts = 10,
  autoAcknowledgeTimeout: initialAutoAcknowledgeTimeout = 30
}) => {
  // State 관리
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [autoAcknowledgeTimeout, setAutoAcknowledgeTimeout] = useState(initialAutoAcknowledgeTimeout);
  
  // WebSocket 및 타이머 관리
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 알림 소리 초기화
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  // 브라우저 알림 권한 확인
  useEffect(() => {
    setNotificationPermission(Notification.permission);
    
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // 알림 데이터 로드
  const loadAlerts = useCallback(async () => {
    try {
      const alertsResponse = await fetch(
        `${API_BASE_URL}/api/monitoring/alerts${projectId ? `?projectId=${projectId}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (alertsResponse.ok) {
        const alertsData: MonitoringAPIResponse<MonitoringAlert[]> = await alertsResponse.json();
        if (alertsData.success && alertsData.data) {
          setAlerts(alertsData.data);
        }
      }

      const anomaliesResponse = await fetch(
        `${API_BASE_URL}/api/monitoring/anomalies${projectId ? `?projectId=${projectId}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (anomaliesResponse.ok) {
        const anomaliesData: MonitoringAPIResponse<AnomalyDetection[]> = await anomaliesResponse.json();
        if (anomaliesData.success && anomaliesData.data) {
          setAnomalies(anomaliesData.data.filter(a => !a.resolvedAt));
        }
      }

    } catch (error) {
      console.error('알림 데이터 로드 실패:', error);
    }
  }, [projectId]);

  // 새 알림 처리
  const handleNewAlert = useCallback((alert: MonitoringAlert) => {
    setAlerts(prev => {
      const existing = prev.find(a => a.id === alert.id);
      if (existing) {
        return prev.map(a => a.id === alert.id ? alert : a);
      } else {
        // 소리 재생
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        // 브라우저 알림
        if (notificationPermission === 'granted') {
          new Notification(alert.title, {
            body: alert.message,
            icon: '/favicon.ico',
            tag: alert.id
          });
        }

        // 자동 확인 타이머 설정
        if (autoAcknowledgeTimeout > 0 && alert.severity !== 'critical') {
          const timeout = setTimeout(() => {
            handleAlertAction(alert.id, 'acknowledge');
          }, autoAcknowledgeTimeout * 60 * 1000);
          
          notificationTimeouts.current.set(alert.id, timeout);
        }

        return [alert, ...prev].slice(0, maxDisplayAlerts);
      }
    });
  }, [soundEnabled, notificationPermission, autoAcknowledgeTimeout, maxDisplayAlerts]);

  // 새 이상 상황 처리
  const handleNewAnomaly = useCallback((anomaly: AnomalyDetection) => {
    setAnomalies(prev => {
      const existing = prev.find(a => a.id === anomaly.id);
      if (existing) {
        return prev.map(a => a.id === anomaly.id ? anomaly : a);
      } else {
        return [anomaly, ...prev].slice(0, maxDisplayAlerts);
      }
    });
  }, [maxDisplayAlerts]);

  // 알림 액션 처리
  const handleAlertAction = useCallback(async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/alerts/${alertId}/${action}`, {
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

        // 타이머 정리
        const timeout = notificationTimeouts.current.get(alertId);
        if (timeout) {
          clearTimeout(timeout);
          notificationTimeouts.current.delete(alertId);
        }

        onAlertAction?.(alertId, action);
      }
    } catch (error) {
      console.error(`알림 ${action} 실패:`, error);
    }
  }, [onAlertAction]);

  // 이상 상황 해결 처리
  const handleAnomalyResolve = useCallback(async (anomalyId: string, resolution: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/anomalies/${anomalyId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ resolution })
      });

      if (response.ok) {
        setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
      }
    } catch (error) {
      console.error('이상 상황 해결 실패:', error);
    }
  }, []);

  // WebSocket 연결
  useEffect(() => {
    const wsUrl = projectId 
      ? `ws://localhost:8000/ws/alerts/${projectId}/`
      : `ws://localhost:8000/ws/alerts/global/`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('알림 WebSocket 연결됨');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'alert') {
          handleNewAlert(data.data);
        } else if (data.type === 'anomaly') {
          handleNewAnomaly(data.data);
        }
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    };

    ws.onclose = () => {
      console.log('알림 WebSocket 연결 종료');
    };

    return () => {
      ws.close();
      // 모든 타이머 정리
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeouts.current.clear();
    };
  }, [projectId, handleNewAlert, handleNewAnomaly]);

  // 초기 데이터 로드
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // 심각도에 따른 색상 스타일
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'error': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  // 심각도 아이콘
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  // 활성 알림 수 계산
  const activeAlertsCount = alerts.filter(a => !a.resolvedAt && !a.acknowledgedAt).length;
  const activeAnomaliesCount = anomalies.filter(a => !a.resolvedAt).length;
  const totalActive = activeAlertsCount + activeAnomaliesCount;

  // 알림 규칙 설정 컴포넌트
  const AlertRulesSettings = () => {
    const [newRule, setNewRule] = useState<Partial<CreateAlertRuleRequest>>({
      name: '',
      metric: 'response_time',
      operator: '>',
      threshold: 1000,
      duration: 300
    });

    const handleCreateRule = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/monitoring/alert-rules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            ...newRule,
            projectId,
            actions: [{ type: 'notify', target: 'dashboard' }]
          })
        });

        if (response.ok) {
          setNewRule({
            name: '',
            metric: 'response_time',
            operator: '>',
            threshold: 1000,
            duration: 300
          });
          // 규칙 목록 다시 로드
        }
      } catch (error) {
        console.error('알림 규칙 생성 실패:', error);
      }
    };

    return (
      <div className="space-y-4">
        <h4 className="font-medium">새 알림 규칙 생성</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">규칙 이름</label>
            <input
              type="text"
              value={newRule.name || ''}
              onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="예: High Response Time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">메트릭</label>
            <select
              value={newRule.metric || ''}
              onChange={(e) => setNewRule(prev => ({ ...prev, metric: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="response_time">응답 시간</option>
              <option value="error_rate">오류율</option>
              <option value="consistency_ratio">일관성 비율</option>
              <option value="active_users">활성 사용자</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">조건</label>
            <div className="flex space-x-2">
              <select
                value={newRule.operator || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, operator: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value=">">초과</option>
                <option value="<">미만</option>
                <option value=">=">이상</option>
                <option value="<=">이하</option>
              </select>
              <input
                type="number"
                value={newRule.threshold || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="임계값"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">지속 시간 (초)</label>
            <input
              type="number"
              value={newRule.duration || ''}
              onChange={(e) => setNewRule(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="300"
            />
          </div>
        </div>
        <Button
          onClick={handleCreateRule}
          disabled={!newRule.name || !newRule.metric}
          className="w-full"
        >
          규칙 생성
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* 알림 벨 아이콘 */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-full transition-colors ${
            totalActive > 0 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {totalActive > 0 ? (
            <BellSolidIcon className="h-6 w-6" />
          ) : (
            <BellIcon className="h-6 w-6" />
          )}
          {totalActive > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalActive > 9 ? '9+' : totalActive}
            </span>
          )}
        </button>

        {/* 설정 버튼 (관리자만) */}
        {userRole === 'admin' && (
          <button
            onClick={() => setShowSettings(true)}
            className="ml-2 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 알림 패널 */}
      {isExpanded && (
        <div className="absolute top-12 right-0 w-96 z-50">
          <Card className="shadow-xl">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">알림 ({totalActive})</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1 rounded ${soundEnabled ? 'text-blue-600' : 'text-gray-400'}`}
                    title="소리 알림 토글"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* 활성 알림 */}
              {alerts.filter(a => !a.resolvedAt).slice(0, 5).map(alert => (
                <div key={alert.id} className="p-4 border-b hover:bg-gray-50">
                  <div className={`flex items-start space-x-3 p-3 rounded border-l-4 ${getSeverityStyle(alert.severity)}`}>
                    <div className="flex-shrink-0">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                        <span className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {new Date(alert.triggeredAt).toLocaleTimeString()}
                        </span>
                        <span className="capitalize">{alert.severity}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {!alert.acknowledgedAt && (
                        <button
                          onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="확인"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="해결"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* 활성 이상 상황 */}
              {anomalies.filter(a => !a.resolvedAt).slice(0, 5).map(anomaly => (
                <div key={anomaly.id} className="p-4 border-b hover:bg-gray-50">
                  <div className="flex items-start space-x-3 p-3 rounded border-l-4 border-purple-500 bg-purple-50">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-purple-800">{anomaly.title}</h4>
                      <p className="text-sm text-purple-600 mt-1">{anomaly.description}</p>
                      <div className="flex items-center text-xs text-purple-500 mt-2 space-x-4">
                        <span>유형: {anomaly.type}</span>
                        <span>심각도: {anomaly.severity}</span>
                        {anomaly.metadata.confidence && (
                          <span>신뢰도: {(anomaly.metadata.confidence * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAnomalyResolve(anomaly.id, '사용자가 해결함')}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="해결"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {totalActive === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>활성 알림이 없습니다</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open('/monitoring/alerts', '_blank')}
                className="w-full"
              >
                모든 알림 보기
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 설정 모달 */}
      {showSettings && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">알림 설정</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 기본 설정 */}
              <div>
                <h3 className="font-medium mb-3">기본 설정</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="mr-2"
                    />
                    소리 알림 활성화
                  </label>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      자동 확인 시간 (분, 0은 비활성화)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={autoAcknowledgeTimeout}
                      onChange={(e) => setAutoAcknowledgeTimeout(parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 알림 규칙 설정 */}
              <div>
                <h3 className="font-medium mb-3">알림 규칙</h3>
                <AlertRulesSettings />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertSystem;