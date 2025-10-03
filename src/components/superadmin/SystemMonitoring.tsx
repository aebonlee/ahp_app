import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import UnifiedButton from '../common/UnifiedButton';

interface MetricData {
  timestamp: Date;
  value: number;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const SystemMonitoring: React.FC = () => {
  const [cpuHistory, setCpuHistory] = useState<MetricData[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<MetricData[]>([]);
  const [requestHistory, setRequestHistory] = useState<MetricData[]>([]);
  const [errorHistory, setErrorHistory] = useState<MetricData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'requests' | 'errors'>('cpu');

  // 실시간 모니터링 데이터 생성 (시뮬레이션)
  const generateMetrics = () => {
    const now = new Date();
    
    // CPU 사용률
    setCpuHistory(prev => {
      const newValue = 20 + Math.random() * 40; // 20-60%
      const newData = [...prev, { timestamp: now, value: newValue }];
      return newData.slice(-20); // 최근 20개 데이터만 유지
    });

    // 메모리 사용률
    setMemoryHistory(prev => {
      const newValue = 50 + Math.random() * 30; // 50-80%
      const newData = [...prev, { timestamp: now, value: newValue }];
      return newData.slice(-20);
    });

    // 요청 수
    setRequestHistory(prev => {
      const newValue = 80 + Math.random() * 100; // 80-180 req/min
      const newData = [...prev, { timestamp: now, value: newValue }];
      return newData.slice(-20);
    });

    // 에러율
    setErrorHistory(prev => {
      const newValue = Math.random() * 5; // 0-5%
      const newData = [...prev, { timestamp: now, value: newValue }];
      return newData.slice(-20);
    });

    // 알림 생성 (랜덤하게)
    if (Math.random() > 0.9) {
      const alertTypes: Alert['type'][] = ['error', 'warning', 'info'];
      const alertMessages = {
        error: ['데이터베이스 연결 오류', 'API 응답 시간 초과', '메모리 사용률 임계치 도달'],
        warning: ['CPU 사용률 증가', '디스크 공간 부족 경고', '비정상적인 요청 패턴 감지'],
        info: ['백업 완료', '시스템 업데이트 가능', '새로운 사용자 등록']
      };
      
      const type = alertTypes[Math.floor(Math.random() * 3)];
      const messages = alertMessages[type];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      setAlerts(prev => [{
        id: Date.now().toString(),
        type,
        message,
        timestamp: now,
        resolved: false
      }, ...prev].slice(0, 10)); // 최대 10개 알림 유지
    }
  };

  useEffect(() => {
    if (!isMonitoring) return;

    // 초기 데이터 생성
    for (let i = 0; i < 10; i++) {
      generateMetrics();
    }

    // 주기적 업데이트
    const interval = setInterval(generateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
    }
  };

  const getAlertBgColor = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getLatestValue = (history: MetricData[]) => {
    if (history.length === 0) return 0;
    return history[history.length - 1].value;
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'cpu': return cpuHistory;
      case 'memory': return memoryHistory;
      case 'requests': return requestHistory;
      case 'errors': return errorHistory;
    }
  };

  const getMetricInfo = () => {
    switch (selectedMetric) {
      case 'cpu': 
        return { 
          title: 'CPU 사용률', 
          unit: '%', 
          color: 'blue',
          threshold: 80 
        };
      case 'memory': 
        return { 
          title: '메모리 사용률', 
          unit: '%', 
          color: 'green',
          threshold: 90 
        };
      case 'requests': 
        return { 
          title: '요청 수', 
          unit: 'req/min', 
          color: 'purple',
          threshold: 200 
        };
      case 'errors': 
        return { 
          title: '에러율', 
          unit: '%', 
          color: 'red',
          threshold: 5 
        };
    }
  };

  const metricInfo = getMetricInfo();
  const metricData = getMetricData();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              시스템 모니터링
            </h1>
            <p className="text-gray-600">
              실시간 시스템 성능 및 상태를 모니터링합니다.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1초</option>
              <option value={5000}>5초</option>
              <option value={10000}>10초</option>
              <option value={30000}>30초</option>
            </select>
            <UnifiedButton
              variant={isMonitoring ? "danger" : "success"}
              onClick={() => setIsMonitoring(!isMonitoring)}
              icon={isMonitoring ? "⏸️" : "▶️"}
            >
              {isMonitoring ? '일시정지' : '시작'}
            </UnifiedButton>
          </div>
        </div>
      </div>

      {/* 실시간 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div 
            className={`p-4 cursor-pointer ${selectedMetric === 'cpu' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedMetric('cpu')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">CPU 사용률</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getLatestValue(cpuHistory).toFixed(1)}%
                </p>
              </div>
              <span className="text-2xl">🖥️</span>
            </div>
            <div className="mt-2 h-8">
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  points={cpuHistory.map((d, i) => 
                    `${i * 5},${32 - (d.value / 100) * 32}`
                  ).join(' ')}
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div 
            className={`p-4 cursor-pointer ${selectedMetric === 'memory' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setSelectedMetric('memory')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">메모리 사용률</p>
                <p className="text-2xl font-bold text-green-600">
                  {getLatestValue(memoryHistory).toFixed(1)}%
                </p>
              </div>
              <span className="text-2xl">💾</span>
            </div>
            <div className="mt-2 h-8">
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  points={memoryHistory.map((d, i) => 
                    `${i * 5},${32 - (d.value / 100) * 32}`
                  ).join(' ')}
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div 
            className={`p-4 cursor-pointer ${selectedMetric === 'requests' ? 'ring-2 ring-purple-500' : ''}`}
            onClick={() => setSelectedMetric('requests')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">요청 수</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getLatestValue(requestHistory).toFixed(0)}
                </p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
            <div className="mt-2 h-8">
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#9333EA"
                  strokeWidth="2"
                  points={requestHistory.map((d, i) => 
                    `${i * 5},${32 - (d.value / 200) * 32}`
                  ).join(' ')}
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div 
            className={`p-4 cursor-pointer ${selectedMetric === 'errors' ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setSelectedMetric('errors')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">에러율</p>
                <p className="text-2xl font-bold text-red-600">
                  {getLatestValue(errorHistory).toFixed(2)}%
                </p>
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="mt-2 h-8">
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  points={errorHistory.map((d, i) => 
                    `${i * 5},${32 - (d.value / 10) * 32}`
                  ).join(' ')}
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 상세 그래프 */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">{metricInfo.title} 상세</h2>
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end">
                  {metricData.map((data, index) => (
                    <div
                      key={index}
                      className="flex-1 mx-0.5"
                      style={{
                        height: `${(data.value / (metricInfo.unit === '%' ? 100 : 200)) * 100}%`,
                        backgroundColor: data.value > metricInfo.threshold ? '#EF4444' : `var(--${metricInfo.color}-500)`
                      }}
                      title={`${formatTime(data.timestamp)}: ${data.value.toFixed(2)}${metricInfo.unit}`}
                    />
                  ))}
                </div>
                <div className="absolute top-0 left-0 text-sm text-gray-500">
                  {metricInfo.threshold}{metricInfo.unit}
                </div>
                <div className="absolute bottom-0 left-0 text-sm text-gray-500">
                  0{metricInfo.unit}
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>{metricData[0]?.timestamp ? formatTime(metricData[0].timestamp) : ''}</span>
                <span>현재</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 알림 패널 */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">시스템 알림</h2>
                <UnifiedButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setAlerts([])}
                  icon="🗑️"
                >
                  모두 삭제
                </UnifiedButton>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">알림이 없습니다</p>
                ) : (
                  alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3 border rounded-lg ${getAlertBgColor(alert.type)}`}
                    >
                      <div className="flex items-start">
                        <span className="mr-2">{getAlertIcon(alert.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(alert.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setAlerts(prev => prev.filter(a => a.id !== alert.id));
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 시스템 상태 요약 */}
      <Card className="mt-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">시스템 상태 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium">서버 상태</p>
                <p className="text-sm text-gray-600">정상 작동중</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium">데이터베이스</p>
                <p className="text-sm text-gray-600">연결됨</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium">API 상태</p>
                <p className="text-sm text-gray-600">응답 지연 (평균 250ms)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemMonitoring;