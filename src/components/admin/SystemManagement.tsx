import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, CogIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { 
  systemManagementService, 
  systemUtils,
  SystemConfiguration, 
  BackupStatus, 
  SystemHealth,
  MaintenanceTask,
  SystemUpdate
} from '../../services/systemManagementService';

interface SystemManagementProps {
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

const SystemManagement: React.FC<SystemManagementProps> = ({
  className = '',
  onError,
  onSuccess
}) => {
  const [activeSection, setActiveSection] = useState<'config' | 'backup' | 'maintenance' | 'updates'>('config');
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [backups, setBackups] = useState<BackupStatus[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [availableUpdates, setAvailableUpdates] = useState<SystemUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: () => Promise<void>; message: string } | null>(null);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔧 시스템 데이터 로딩 시작');
      
      // Load configurations
      const configResponse = await systemManagementService.getConfigurations();
      if (configResponse.success && configResponse.data) {
        setConfigurations(configResponse.data);
        console.log('✅ 시스템 설정 로딩 완료:', configResponse.data.length, '개');
      } else {
        console.warn('⚠️ 시스템 설정 로딩 실패, 기본값 사용');
        // Fallback to default configurations
        setConfigurations(getDefaultConfigurations());
      }
      
      // Load backup status
      const backupResponse = await systemManagementService.getBackups();
      if (backupResponse.success && backupResponse.data) {
        setBackups(backupResponse.data);
        console.log('✅ 백업 상태 로딩 완료:', backupResponse.data.length, '개');
      } else {
        console.warn('⚠️ 백업 상태 로딩 실패');
        setBackups([]);
      }
      
      // Load system health
      const healthResponse = await systemManagementService.getSystemHealth();
      if (healthResponse.success && healthResponse.data) {
        setSystemHealth(healthResponse.data);
        console.log('✅ 시스템 상태 로딩 완료');
      }
      
      // Load maintenance tasks
      const tasksResponse = await systemManagementService.getMaintenanceTasks();
      if (tasksResponse.success && tasksResponse.data) {
        setMaintenanceTasks(tasksResponse.data);
        console.log('✅ 유지보수 작업 로딩 완료:', tasksResponse.data.length, '개');
      } else {
        // Fallback to default tasks
        setMaintenanceTasks(getDefaultMaintenanceTasks());
      }
      
    } catch (err: any) {
      console.error('❌ 시스템 데이터 로딩 오류:', err);
      const errorMessage = err.message || '시스템 데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Use fallback data
      setConfigurations(getDefaultConfigurations());
      setMaintenanceTasks(getDefaultMaintenanceTasks());
    } finally {
      setLoading(false);
    }
  };

  // Default configurations for fallback
  const getDefaultConfigurations = (): SystemConfiguration[] => [
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
  ];

  // Default maintenance tasks for fallback
  const getDefaultMaintenanceTasks = (): MaintenanceTask[] => [
    {
      id: 'db_optimize',
      name: '데이터베이스 최적화',
      category: 'database',
      description: '데이터베이스 성능 최적화 실행',
      status: 'idle'
    },
    {
      id: 'index_rebuild',
      name: '인덱스 재구성',
      category: 'database', 
      description: '데이터베이스 인덱스 재구성',
      status: 'idle'
    },
    {
      id: 'cache_clear',
      name: '캐시 정리',
      category: 'cache',
      description: '시스템 캐시 정리',
      status: 'idle'
    },
    {
      id: 'log_archive',
      name: '로그 아카이브',
      category: 'logs',
      description: '오래된 로그 파일 아카이브',
      status: 'idle'
    }
  ];

  const handleConfigUpdate = async (configId: string, newValue: string) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;
    
    // Validate value
    const validation = systemUtils.validateConfigValue(config, newValue);
    if (!validation.valid) {
      setError(validation.error || '잘못된 값입니다.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔧 설정 업데이트:', configId, newValue);
      
      const response = await systemManagementService.updateConfiguration(configId, newValue);
      
      if (response.success && response.data) {
        // Update local state
        setConfigurations(prev => prev.map(config => 
          config.id === configId ? { ...config, value: newValue } : config
        ));
        
        const successMessage = `설정이 업데이트되었습니다: ${config.key}`;
        setSuccess(successMessage);
        onSuccess?.(successMessage);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        
        if (response.data.restart_required) {
          setError('이 설정 변경사항을 적용하려면 시스템 재시작이 필요합니다.');
        }
        
      } else {
        throw new Error(response.error || '설정 업데이트에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('❌ 설정 업데이트 오류:', err);
      const errorMessage = err.message || '설정 업데이트 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCreate = async (type: 'full' | 'incremental' | 'differential') => {
    const confirmMessage = `${systemUtils.getBackupTypeDisplayName(type)}을(를) 시작하시겠습니까?`;
    
    setConfirmAction({
      action: async () => {
        setLoading(true);
        setError('');
        
        try {
          console.log('💾 백업 생성 시작:', type);
          
          const response = await systemManagementService.createBackup(type);
          
          if (response.success && response.data) {
            const successMessage = `${systemUtils.getBackupTypeDisplayName(type)}이(가) 시작되었습니다.`;
            setSuccess(successMessage);
            onSuccess?.(successMessage);
            
            // Monitor backup progress if task_id is provided
            if (response.data?.task_id) {
              setRunningTasks(prev => {
                const newSet = new Set(prev);
                newSet.add(response.data!.task_id);
                return newSet;
              });
              monitorTask(response.data?.task_id);
            }
            
            // Refresh backup list
            setTimeout(() => {
              loadSystemData();
            }, 1000);
            
          } else {
            throw new Error(response.error || '백업 생성에 실패했습니다.');
          }
          
        } catch (err: any) {
          console.error('❌ 백업 생성 오류:', err);
          const errorMessage = err.message || '백업 생성 중 오류가 발생했습니다.';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      message: confirmMessage
    });
    
    setShowConfirmModal(true);
  };

  // Monitor background tasks
  const monitorTask = async (taskId: string) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await systemManagementService.getTaskStatus(taskId);
        
        if (response.success && response.data) {
          const { status, progress, message } = response.data;
          
          if (status === 'completed') {
            clearInterval(checkInterval);
            setRunningTasks(prev => {
              const newTasks = new Set(prev);
              newTasks.delete(taskId);
              return newTasks;
            });
            
            setSuccess('작업이 완료되었습니다.');
            loadSystemData(); // Refresh data
            
          } else if (status === 'failed') {
            clearInterval(checkInterval);
            setRunningTasks(prev => {
              const newTasks = new Set(prev);
              newTasks.delete(taskId);
              return newTasks;
            });
            
            setError(message || '작업이 실패했습니다.');
          }
        }
      } catch (err) {
        console.error('Task monitoring error:', err);
        clearInterval(checkInterval);
      }
    }, 2000); // Check every 2 seconds
    
    // Stop monitoring after 10 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      setRunningTasks(prev => {
        const newTasks = new Set(prev);
        newTasks.delete(taskId);
        return newTasks;
      });
    }, 600000);
  };

  // Handle maintenance tasks
  const handleMaintenanceTask = async (taskId: string) => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (!task) return;
    
    setConfirmAction({
      action: async () => {
        setLoading(true);
        setError('');
        
        try {
          console.log('🔧 유지보수 작업 실행:', taskId);
          
          const response = await systemManagementService.runMaintenanceTask(taskId);
          
          if (response.success && response.data) {
            const successMessage = `유지보수 작업이 시작되었습니다: ${task.name}`;
            setSuccess(successMessage);
            onSuccess?.(successMessage);
            
            // Update task status locally
            setMaintenanceTasks(prev => prev.map(t => 
              t.id === taskId ? { ...t, status: 'running' } : t
            ));
            
            if (response.data?.task_id) {
              const taskId = response.data.task_id;
              setRunningTasks(prev => {
                const newSet = new Set(prev);
                newSet.add(taskId);
                return newSet;
              });
              monitorTask(taskId);
            }
            
          } else {
            throw new Error(response.error || '유지보수 작업 실행에 실패했습니다.');
          }
          
        } catch (err: any) {
          console.error('❌ 유지보수 작업 오류:', err);
          const errorMessage = err.message || '유지보수 작업 중 오류가 발생했습니다.';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      message: `'${task.name}' 작업을 실행하시겠습니까?`
    });
    
    setShowConfirmModal(true);
  };

  // Handle backup actions
  const handleBackupDownload = async (backupId: string) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('💾 백업 다운로드:', backupId);
      
      const response = await systemManagementService.downloadBackup(backupId);
      
      if (response.success) {
        // Handle file download
        setSuccess('백업 다운로드가 시작되었습니다.');
        onSuccess?.('백업 다운로드가 시작되었습니다.');
      } else {
        throw new Error(response.error || '백업 다운로드에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('❌ 백업 다운로드 오류:', err);
      const errorMessage = err.message || '백업 다운로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupRestore = async (backupId: string) => {
    setConfirmAction({
      action: async () => {
        setLoading(true);
        setError('');
        
        try {
          console.log('🔄 백업 복원:', backupId);
          
          const response = await systemManagementService.restoreBackup(backupId);
          
          if (response.success && response.data) {
            const successMessage = '백업 복원이 시작되었습니다.';
            setSuccess(successMessage);
            onSuccess?.(successMessage);
            
            if (response.data?.task_id) {
              const taskId = response.data.task_id;
              setRunningTasks(prev => {
                const newSet = new Set(prev);
                newSet.add(taskId);
                return newSet;
              });
              monitorTask(taskId);
            }
            
          } else {
            throw new Error(response.error || '백업 복원에 실패했습니다.');
          }
          
        } catch (err: any) {
          console.error('❌ 백업 복원 오류:', err);
          const errorMessage = err.message || '백업 복원 중 오류가 발생했습니다.';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      message: '이 백업을 복원하시겠습니까? 현재 데이터가 덮어씁어질 수 있습니다.'
    });
    
    setShowConfirmModal(true);
  };

  const handleBackupDelete = async (backupId: string) => {
    setConfirmAction({
      action: async () => {
        setLoading(true);
        setError('');
        
        try {
          console.log('🗑️ 백업 삭제:', backupId);
          
          const response = await systemManagementService.deleteBackup(backupId);
          
          if (response.success) {
            const successMessage = '백업이 삭제되었습니다.';
            setSuccess(successMessage);
            onSuccess?.(successMessage);
            
            // Remove from local state
            setBackups(prev => prev.filter(b => b.id !== backupId));
            
          } else {
            throw new Error(response.error || '백업 삭제에 실패했습니다.');
          }
          
        } catch (err: any) {
          console.error('❌ 백업 삭제 오류:', err);
          const errorMessage = err.message || '백업 삭제 중 오류가 발생했습니다.';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      message: '이 백업을 영구적으로 삭제하시겠습니까?'
    });
    
    setShowConfirmModal(true);
  };

  // Handle cache clearing
  const handleCacheClear = async (cacheType: 'application' | 'images' | 'sessions' | 'all') => {
    const typeNames = {
      application: '애플리케이션 캐시',
      images: '이미지 캐시',
      sessions: '세션 캐시',
      all: '전체 캐시'
    };
    
    setConfirmAction({
      action: async () => {
        setLoading(true);
        setError('');
        
        try {
          console.log('🗑️ 캐시 정리:', cacheType);
          
          const response = await systemManagementService.clearCache(cacheType);
          
          if (response.success) {
            const successMessage = `${typeNames[cacheType]}가 정리되었습니다.`;
            setSuccess(successMessage);
            onSuccess?.(successMessage);
          } else {
            throw new Error(response.error || '캐시 정리에 실패했습니다.');
          }
          
        } catch (err: any) {
          console.error('❌ 캐시 정리 오류:', err);
          const errorMessage = err.message || '캐시 정리 중 오류가 발생했습니다.';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      message: `${typeNames[cacheType]}를 정리하시겠습니까?`
    });
    
    setShowConfirmModal(true);
  };

  // Handle system health check
  const handleHealthCheck = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🌡️ 시스템 상태 점검 실행');
      
      const response = await systemManagementService.runHealthCheck();
      
      if (response.success && response.data) {
        setSystemHealth(response.data);
        setSuccess('시스템 상태 점검이 완료되었습니다.');
        onSuccess?.('시스템 상태 점검이 완료되었습니다.');
      } else {
        throw new Error(response.error || '시스템 상태 점검에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('❌ 시스템 상태 점검 오류:', err);
      const errorMessage = err.message || '시스템 상태 점검 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
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

        return (
          <Card key={category} title={`${systemUtils.getCategoryDisplayName(category)} 설정`}>
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
                        disabled={loading}
                        className="border rounded px-3 py-2 w-full disabled:opacity-50"
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
                        disabled={loading}
                        className="border rounded px-3 py-2 w-full disabled:opacity-50"
                      />
                    ) : (
                      <input
                        type={config.sensitive ? 'password' : 'text'}
                        value={config.value}
                        onChange={(e) => handleConfigUpdate(config.id, e.target.value)}
                        disabled={loading}
                        className="border rounded px-3 py-2 w-full disabled:opacity-50"
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
            <div className="text-2xl font-bold text-blue-600">
              {backups.length > 0 
                ? backups.reduce((total, backup) => {
                    const sizeInMB = backup.size.includes('GB') 
                      ? parseFloat(backup.size) * 1024 
                      : parseFloat(backup.size);
                    return total + sizeInMB;
                  }, 0).toFixed(1) + ' MB'
                : '0 MB'
              }
            </div>
            <div className="text-sm text-gray-600">전체 백업 데이터</div>
          </div>
        </Card>
        <Card title="마지막 백업">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {backups.length > 0 
                ? new Date(backups[0].timestamp).toLocaleString('ko-KR')
                : '백업 없음'
              }
            </div>
            <div className="text-sm text-gray-600">
              {backups.length > 0 ? systemUtils.getBackupTypeDisplayName(backups[0].type) : '-'}
            </div>
          </div>
        </Card>
        <Card title="백업 성공률">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {backups.length > 0 
                ? ((backups.filter(b => b.status === 'completed').length / backups.length) * 100).toFixed(1) + '%'
                : '0%'
              }
            </div>
            <div className="text-sm text-gray-600">전체 백업</div>
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
                      {systemUtils.getBackupTypeDisplayName(backup.type)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs bg-${systemUtils.getStatusColor(backup.status)}-100 text-${systemUtils.getStatusColor(backup.status)}-800`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono">{backup.size}</td>
                  <td className="px-4 py-2">{backup.duration}</td>
                  <td className="px-4 py-2 font-mono text-xs">{backup.location}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleBackupDownload(backup.id)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50"
                      >
                        다운로드
                      </button>
                      <button 
                        onClick={() => handleBackupRestore(backup.id)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-800 text-xs disabled:opacity-50"
                      >
                        복원
                      </button>
                      <button 
                        onClick={() => handleBackupDelete(backup.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                      >
                        삭제
                      </button>
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
            {maintenanceTasks.filter(task => task.category === 'database').map(task => (
              <div key={task.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{task.name}</span>
                  {task.status === 'running' && (
                    <span className="ml-2 text-xs text-yellow-600">실행 중...</span>
                  )}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleMaintenanceTask(task.id)}
                  disabled={loading || task.status === 'running'}
                >
                  실행
                </Button>
              </div>
            ))}
            {maintenanceTasks.filter(task => task.category === 'database').length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">데이터베이스 작업이 없습니다.</div>
            )}
          </div>
        </Card>

        <Card title="캐시 관리">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>애플리케이션 캐시 삭제</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleCacheClear('application')}
                disabled={loading}
              >
                실행
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>이미지 캐시 삭제</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleCacheClear('images')}
                disabled={loading}
              >
                실행
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>세션 캐시 삭제</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleCacheClear('sessions')}
                disabled={loading}
              >
                실행
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span>전체 캐시 초기화</span>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => handleCacheClear('all')}
                disabled={loading}
              >
                실행
              </Button>
            </div>
          </div>
        </Card>

        <Card title="로그 관리">
          <div className="space-y-4">
            {maintenanceTasks.filter(task => task.category === 'logs').map(task => (
              <div key={task.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{task.name}</span>
                  {task.status === 'running' && (
                    <span className="ml-2 text-xs text-yellow-600">실행 중...</span>
                  )}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleMaintenanceTask(task.id)}
                  disabled={loading || task.status === 'running'}
                >
                  실행
                </Button>
              </div>
            ))}
            {maintenanceTasks.filter(task => task.category === 'logs').length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">로그 작업이 없습니다.</div>
            )}
          </div>
        </Card>

        <Card title="시스템 상태 확인">
          <div className="space-y-4">
            {systemHealth ? (
              <>
                <div className="flex justify-between items-center">
                  <span>디스크 사용량</span>
                  <span className={`text-sm text-${systemUtils.getStatusColor(
                    systemHealth.disk_usage > 90 ? 'error' : 
                    systemHealth.disk_usage > 75 ? 'warning' : 'good'
                  )}-600`}>
                    {systemHealth.disk_usage}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>메모리 사용량</span>
                  <span className={`text-sm text-${systemUtils.getStatusColor(
                    systemHealth.memory_usage > 90 ? 'error' : 
                    systemHealth.memory_usage > 75 ? 'warning' : 'good'
                  )}-600`}>
                    {systemHealth.memory_usage}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>네트워크 연결</span>
                  <span className={`text-sm text-${systemUtils.getStatusColor(systemHealth.network_status)}-600`}>
                    {systemHealth.network_status === 'good' ? '정상' : 
                     systemHealth.network_status === 'warning' ? '주의' : '오류'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>데이터베이스</span>
                  <span className={`text-sm text-${systemUtils.getStatusColor(systemHealth.database_status)}-600`}>
                    {systemHealth.database_status === 'connected' ? '연결됨' : 
                     systemHealth.database_status === 'slow' ? '느림' : '연결 끊김'}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>시스템 상태</span>
                  <span className="text-gray-500 text-sm">확인 중...</span>
                </div>
              </div>
            )}
            <Button 
              variant="primary" 
              className="w-full mt-4"
              onClick={handleHealthCheck}
              disabled={loading}
            >
              {loading ? '점검 중...' : '전체 상태 점검 실행'}
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
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-2">
              <h4 className="text-sm font-medium text-red-800">오류</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-2">
              <h4 className="text-sm font-medium text-green-800">성공</h4>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="작업 확인"
      >
        <div className="space-y-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
            <p className="text-gray-700">{confirmAction?.message}</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (confirmAction) {
                  await confirmAction.action();
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }
              }}
              disabled={loading}
            >
              {loading ? '실행 중...' : '확인'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SystemManagement;