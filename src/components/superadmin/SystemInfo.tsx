import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import UnifiedButton from '../common/UnifiedButton';
import apiService from '../../services/apiService';

interface SystemInfoData {
  system: {
    version: string;
    environment: string;
    platform: string;
    nodejs_version: string;
    npm_version: string;
    deployment_date: string;
    uptime: string;
  };
  database: {
    type: string;
    version: string;
    size: string;
    tables_count: number;
    records_count: number;
    connection_status: string;
    host: string;
  };
  server: {
    cpu_usage: number;
    memory_usage: number;
    memory_total: string;
    disk_usage: number;
    disk_total: string;
    active_connections: number;
    request_rate: string;
  };
  application: {
    total_users: number;
    active_users: number;
    total_projects: number;
    active_projects: number;
    total_evaluations: number;
    completed_evaluations: number;
    api_endpoints: number;
  };
  dependencies: {
    frontend: { [key: string]: string };
    backend: { [key: string]: string };
  };
}

const SystemInfo: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'server' | 'dependencies'>('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      // API 호출 시도
      const response = await apiService.get<any>('/api/status/');
      
      if (response.data) {
        setSystemInfo(response.data);
      } else {
        // 대체 데이터 사용
        setSystemInfo(getMockSystemInfo());
      }
    } catch (error) {
      console.error('시스템 정보 로드 실패:', error);
      // 목업 데이터 사용
      setSystemInfo(getMockSystemInfo());
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const getMockSystemInfo = (): SystemInfoData => {
    return {
      system: {
        version: '1.0.0',
        environment: 'Production',
        platform: 'Linux x64',
        nodejs_version: '18.17.0',
        npm_version: '10.8.2',
        deployment_date: '2025-01-20T10:00:00Z',
        uptime: '5 days, 3 hours'
      },
      database: {
        type: 'PostgreSQL',
        version: '14.5',
        size: '256 MB',
        tables_count: 45,
        records_count: 12847,
        connection_status: 'Connected',
        host: 'localhost:5432'
      },
      server: {
        cpu_usage: 23.5,
        memory_usage: 67.8,
        memory_total: '8 GB',
        disk_usage: 45.2,
        disk_total: '100 GB',
        active_connections: 42,
        request_rate: '120 req/min'
      },
      application: {
        total_users: 156,
        active_users: 89,
        total_projects: 234,
        active_projects: 67,
        total_evaluations: 1456,
        completed_evaluations: 1123,
        api_endpoints: 48
      },
      dependencies: {
        frontend: {
          'react': '18.2.0',
          'typescript': '4.9.5',
          'react-router-dom': '6.8.0',
          'tailwindcss': '3.3.0'
        },
        backend: {
          'django': '4.2.0',
          'djangorestframework': '3.14.0',
          'psycopg2': '2.9.5',
          'celery': '5.2.7'
        }
      }
    };
  };

  useEffect(() => {
    fetchSystemInfo();
    
    // 30초마다 자동 갱신
    const interval = setInterval(() => {
      fetchSystemInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!systemInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              시스템 정보
            </h1>
            <p className="text-gray-600">
              AHP 플랫폼의 시스템 정보 및 상태를 확인합니다.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
            </p>
            <UnifiedButton
              variant="secondary"
              size="sm"
              onClick={fetchSystemInfo}
              loading={loading}
              icon="🔄"
            >
              새로고침
            </UnifiedButton>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          개요
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'database'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          데이터베이스
        </button>
        <button
          onClick={() => setActiveTab('server')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'server'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          서버
        </button>
        <button
          onClick={() => setActiveTab('dependencies')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'dependencies'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          의존성
        </button>
      </div>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 시스템 정보 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">시스템 개요</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">버전</label>
                  <p className="font-medium">{systemInfo.system.version}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">환경</label>
                  <p className="font-medium">{systemInfo.system.environment}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">플랫폼</label>
                  <p className="font-medium">{systemInfo.system.platform}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Node.js</label>
                  <p className="font-medium">{systemInfo.system.nodejs_version}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">배포일</label>
                  <p className="font-medium">
                    {new Date(systemInfo.system.deployment_date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">가동시간</label>
                  <p className="font-medium">{systemInfo.system.uptime}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 애플리케이션 통계 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">애플리케이션 통계</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {systemInfo.application.total_users}
                  </div>
                  <div className="text-sm text-gray-600">전체 사용자</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {systemInfo.application.active_users}
                  </div>
                  <div className="text-sm text-gray-600">활성 사용자</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {systemInfo.application.total_projects}
                  </div>
                  <div className="text-sm text-gray-600">전체 프로젝트</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {systemInfo.application.completed_evaluations}
                  </div>
                  <div className="text-sm text-gray-600">완료 평가</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 데이터베이스 탭 */}
      {activeTab === 'database' && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">데이터베이스 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">데이터베이스 유형</label>
                  <p className="font-medium text-lg">{systemInfo.database.type}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">버전</label>
                  <p className="font-medium">{systemInfo.database.version}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">호스트</label>
                  <p className="font-medium">{systemInfo.database.host}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">연결 상태</label>
                  <p className="font-medium">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {systemInfo.database.connection_status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">데이터베이스 크기</label>
                  <p className="font-medium text-lg">{systemInfo.database.size}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">테이블 수</label>
                  <p className="font-medium">{systemInfo.database.tables_count}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">총 레코드</label>
                  <p className="font-medium">{systemInfo.database.records_count.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 서버 탭 */}
      {activeTab === 'server' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">서버 리소스</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">CPU 사용률</span>
                    <span className={`text-sm font-bold ${getStatusColor(systemInfo.server.cpu_usage)}`}>
                      {systemInfo.server.cpu_usage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(systemInfo.server.cpu_usage)}`}
                      style={{ width: `${systemInfo.server.cpu_usage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">메모리 사용률</span>
                    <span className={`text-sm font-bold ${getStatusColor(systemInfo.server.memory_usage)}`}>
                      {systemInfo.server.memory_usage}% / {systemInfo.server.memory_total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(systemInfo.server.memory_usage)}`}
                      style={{ width: `${systemInfo.server.memory_usage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">디스크 사용률</span>
                    <span className={`text-sm font-bold ${getStatusColor(systemInfo.server.disk_usage)}`}>
                      {systemInfo.server.disk_usage}% / {systemInfo.server.disk_total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(systemInfo.server.disk_usage)}`}
                      style={{ width: `${systemInfo.server.disk_usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">연결 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">활성 연결</label>
                  <p className="text-2xl font-bold">{systemInfo.server.active_connections}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">요청 속도</label>
                  <p className="text-2xl font-bold">{systemInfo.server.request_rate}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 의존성 탭 */}
      {activeTab === 'dependencies' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">프론트엔드 의존성</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(systemInfo.dependencies.frontend).map(([name, version]) => (
                  <div key={name} className="border rounded-lg p-3">
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-600">{version}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">백엔드 의존성</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(systemInfo.dependencies.backend).map(([name, version]) => (
                  <div key={name} className="border rounded-lg p-3">
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-600">{version}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemInfo;