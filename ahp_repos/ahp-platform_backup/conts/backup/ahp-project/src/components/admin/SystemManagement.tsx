import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface SystemConfiguration {
  id: string;
  category: 'general' | 'security' | 'performance' | 'notification' | 'backup';
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  sensitive?: boolean;
}

interface BackupStatus {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  size: string;
  duration: string;
  location: string;
}

interface SystemManagementProps {
  className?: string;
}

const SystemManagement: React.FC<SystemManagementProps> = ({
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<'config' | 'backup' | 'maintenance' | 'updates'>('config');
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [backups, setBackups] = useState<BackupStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    
    // 시스템 설정 (샘플 데이터)
    setConfigurations([
      {
        id: '1',
        category: 'general',
        key: 'system_name',
        value: 'AHP Decision System',
        description: '시스템 명칭',
        type: 'string'
      },
      {
        id: '2',
        category: 'general',
        key: 'max_users_per_project',
        value: '100',
        description: '프로젝트당 최대 사용자 수',
        type: 'number'
      },
      {
        id: '3',
        category: 'security',
        key: 'password_min_length',
        value: '8',
        description: '최소 비밀번호 길이',
        type: 'number'
      },
      {
        id: '4',
        category: 'security',
        key: 'login_attempts_limit',
        value: '5',
        description: '로그인 시도 제한 횟수',
        type: 'number'
      },
      {
        id: '5',
        category: 'security',
        key: 'session_timeout',
        value: '3600',
        description: '세션 타임아웃 (초)',
        type: 'number'
      },
      {
        id: '6',
        category: 'performance',
        key: 'api_rate_limit',
        value: '1000',
        description: '시간당 API 호출 제한',
        type: 'number'
      },
      {
        id: '7',
        category: 'notification',
        key: 'email_notifications',
        value: 'true',
        description: '이메일 알림 활성화',
        type: 'boolean'
      },
      {
        id: '8',
        category: 'backup',
        key: 'auto_backup_enabled',
        value: 'true',
        description: '자동 백업 활성화',
        type: 'boolean'
      },
      {
        id: '9',
        category: 'backup',
        key: 'backup_frequency',
        value: 'daily',
        description: '백업 주기',
        type: 'select',
        options: ['hourly', 'daily', 'weekly', 'monthly']
      }
    ]);

    // 백업 상태 (샘플 데이터)
    setBackups([
      {
        id: 'b1',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        type: 'full',
        status: 'completed',
        size: '2.3 GB',
        duration: '15분 32초',
        location: '/backup/full_2024_03_10.tar.gz'
      },
      {
        id: 'b2',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        type: 'incremental',
        status: 'completed',
        size: '156 MB',
        duration: '2분 18초',
        location: '/backup/inc_2024_03_10_12.tar.gz'
      },
      {
        id: 'b3',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'incremental',
        status: 'completed',
        size: '89 MB',
        duration: '1분 45초',
        location: '/backup/inc_2024_03_10_23.tar.gz'
      }
    ]);

    setLoading(false);
  };

  const handleConfigUpdate = (configId: string, newValue: string) => {
    setConfigurations(prev => prev.map(config => 
      config.id === configId ? { ...config, value: newValue } : config
    ));
    
    // 실제로는 API 호출
    console.log('Configuration updated:', configId, newValue);
  };

  const handleBackupCreate = (type: 'full' | 'incremental' | 'differential') => {
    // 실제로는 백업 API 호출
    console.log('Creating backup:', type);
    alert(`${type} 백업을 시작합니다.`);
  };

  const renderConfigurationSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">시스템 설정</h3>
        <Button variant="primary">설정 저장</Button>
      </div>

      {(['general', 'security', 'performance', 'notification', 'backup'] as const).map(category => {
        const categoryConfigs = configurations.filter(c => c.category === category);
        if (categoryConfigs.length === 0) return null;

        const categoryNames = {
          general: '일반',
          security: '보안',
          performance: '성능',
          notification: '알림',
          backup: '백업'
        };

        return (
          <Card key={category} title={`${categoryNames[category]} 설정`}>
            <div className="space-y-4">
              {categoryConfigs.map(config => (
                <div key={config.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded">
                  <div>
                    <div className="font-medium">{config.key}</div>
                    <div className="text-sm text-gray-600">{config.description}</div>
                  </div>
                  <div>
                    {config.type === 'boolean' ? (
                      <select
                        value={config.value}
                        onChange={(e) => handleConfigUpdate(config.id, e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                      >
                        <option value="true">활성화</option>
                        <option value="false">비활성화</option>
                      </select>
                    ) : config.type === 'select' ? (
                      <select
                        value={config.value}
                        onChange={(e) => handleConfigUpdate(config.id, e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                      >
                        {config.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : config.type === 'number' ? (
                      <input
                        type="number"
                        value={config.value}
                        onChange={(e) => handleConfigUpdate(config.id, e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                      />
                    ) : (
                      <input
                        type={config.sensitive ? 'password' : 'text'}
                        value={config.value}
                        onChange={(e) => handleConfigUpdate(config.id, e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                      />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    현재값: <code className="bg-gray-100 px-1 rounded">{config.value}</code>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderBackupSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">백업 관리</h3>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => handleBackupCreate('incremental')}>
            증분 백업
          </Button>
          <Button variant="primary" onClick={() => handleBackupCreate('full')}>
            전체 백업
          </Button>
        </div>
      </div>

      {/* 백업 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="총 백업 크기">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2.5 GB</div>
            <div className="text-sm text-gray-600">전체 백업 데이터</div>
          </div>
        </Card>
        <Card title="마지막 백업">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1시간 전</div>
            <div className="text-sm text-gray-600">증분 백업 완료</div>
          </div>
        </Card>
        <Card title="백업 성공률">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">99.8%</div>
            <div className="text-sm text-gray-600">지난 30일</div>
          </div>
        </Card>
      </div>

      {/* 백업 이력 */}
      <Card title="백업 이력">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">시간</th>
                <th className="px-4 py-2 text-left">유형</th>
                <th className="px-4 py-2 text-left">상태</th>
                <th className="px-4 py-2 text-left">크기</th>
                <th className="px-4 py-2 text-left">소요시간</th>
                <th className="px-4 py-2 text-left">위치</th>
                <th className="px-4 py-2 text-left">관리</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(backup => (
                <tr key={backup.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(backup.timestamp).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      backup.type === 'full' ? 'bg-blue-100 text-blue-800' :
                      backup.type === 'incremental' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                      backup.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                      backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono">{backup.size}</td>
                  <td className="px-4 py-2">{backup.duration}</td>
                  <td className="px-4 py-2 font-mono text-xs">{backup.location}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-1">
                      <button className="text-blue-600 hover:text-blue-800 text-xs">다운로드</button>
                      <button className="text-green-600 hover:text-green-800 text-xs">복원</button>
                      <button className="text-red-600 hover:text-red-800 text-xs">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderMaintenanceSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">시스템 유지보수</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="데이터베이스 관리">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>데이터베이스 최적화</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>인덱스 재구성</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>통계 업데이트</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>데이터 정리</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
          </div>
        </Card>

        <Card title="캐시 관리">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>애플리케이션 캐시 삭제</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>이미지 캐시 삭제</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>세션 캐시 삭제</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>전체 캐시 초기화</span>
              <Button variant="error" size="sm">실행</Button>
            </div>
          </div>
        </Card>

        <Card title="로그 관리">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>시스템 로그 아카이브</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>오류 로그 분석</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>30일 이전 로그 삭제</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>로그 압축</span>
              <Button variant="secondary" size="sm">실행</Button>
            </div>
          </div>
        </Card>

        <Card title="시스템 상태 확인">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>디스크 사용량 점검</span>
              <span className="text-green-600 text-sm">정상</span>
            </div>
            <div className="flex justify-between items-center">
              <span>메모리 사용량</span>
              <span className="text-yellow-600 text-sm">주의</span>
            </div>
            <div className="flex justify-between items-center">
              <span>네트워크 연결</span>
              <span className="text-green-600 text-sm">정상</span>
            </div>
            <div className="flex justify-between items-center">
              <span>외부 API 연결</span>
              <span className="text-green-600 text-sm">정상</span>
            </div>
            <Button variant="primary" className="w-full mt-4">
              전체 상태 점검 실행
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUpdatesSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">시스템 업데이트</h3>

      <Card title="현재 버전 정보">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">애플리케이션 버전</div>
            <div className="text-lg font-medium">v2.1.3</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">데이터베이스 스키마</div>
            <div className="text-lg font-medium">v1.8.2</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">마지막 업데이트</div>
            <div className="text-lg font-medium">2024-03-01</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">업데이트 상태</div>
            <div className="text-lg font-medium text-green-600">최신</div>
          </div>
        </div>
      </Card>

      <Card title="사용 가능한 업데이트">
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">v2.2.0 - 주요 업데이트</div>
                <div className="text-sm text-gray-600 mt-1">
                  • 새로운 AHP 알고리즘 추가<br/>
                  • 성능 개선 및 버그 수정<br/>
                  • 보안 강화
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  릴리즈 날짜: 2024-03-15
                </div>
              </div>
              <Button variant="primary" size="sm">설치</Button>
            </div>
          </div>

          <div className="p-4 border rounded bg-gray-50">
            <div className="text-center text-gray-600">
              다른 업데이트가 없습니다. 시스템이 최신 상태입니다.
            </div>
          </div>
        </div>
      </Card>

      <Card title="업데이트 기록">
        <div className="space-y-3">
          {[
            { version: 'v2.1.3', date: '2024-03-01', type: '패치', description: '보안 패치 및 버그 수정' },
            { version: 'v2.1.0', date: '2024-02-15', type: '마이너', description: '새로운 대시보드 기능 추가' },
            { version: 'v2.0.0', date: '2024-01-30', type: '메이저', description: '구독 시스템 및 고급 AHP 기능 출시' }
          ].map((update, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">{update.version}</div>
                <div className="text-sm text-gray-600">{update.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{update.date}</div>
                <div className={`text-xs px-2 py-1 rounded ${
                  update.type === '메이저' ? 'bg-red-100 text-red-800' :
                  update.type === '마이너' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {update.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 섹션 탭 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'config', name: '시스템 설정', icon: '⚙️' },
            { id: 'backup', name: '백업 관리', icon: '💾' },
            { id: 'maintenance', name: '유지보수', icon: '🔧' },
            { id: 'updates', name: '업데이트', icon: '🔄' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 섹션 콘텐츠 */}
      {activeSection === 'config' && renderConfigurationSection()}
      {activeSection === 'backup' && renderBackupSection()}
      {activeSection === 'maintenance' && renderMaintenanceSection()}
      {activeSection === 'updates' && renderUpdatesSection()}
    </div>
  );
};

export default SystemManagement;