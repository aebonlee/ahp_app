import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  CogIcon, 
  UsersIcon,
  DocumentTextIcon,
  KeyIcon,
  TableCellsIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { 
  djangoAdminService, 
  djangoAdminUtils,
  DjangoAdminStatus, 
  DjangoModel, 
  DjangoLogEntry,
  DjangoUser,
  ModelStatistics
} from '../../services/djangoAdminService';
import { User } from '../../types';

interface DjangoAdminIntegrationProps {
  user: User;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

const DjangoAdminIntegration: React.FC<DjangoAdminIntegrationProps> = ({
  user,
  onError,
  onSuccess
}) => {
  const [adminStatus, setAdminStatus] = useState<DjangoAdminStatus | null>(null);
  const [availableModels, setAvailableModels] = useState<DjangoModel[]>([]);
  const [modelStatistics, setModelStatistics] = useState<ModelStatistics[]>([]);
  const [recentLogs, setRecentLogs] = useState<DjangoLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'users' | 'logs' | 'database'>('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DjangoUser | null>(null);
  const [djangoUsers, setDjangoUsers] = useState<DjangoUser[]>([]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔧 Django Admin 데이터 로딩 시작');

      // Load admin status
      const statusResponse = await djangoAdminService.getAdminStatus();
      if (statusResponse.success && statusResponse.data) {
        setAdminStatus(statusResponse.data);
        console.log('✅ Django Admin 상태 로딩 완료');
      } else {
        console.warn('⚠️ Django Admin 상태 로딩 실패, 접근 권한 확인');
      }

      // Load available models
      const modelsResponse = await djangoAdminService.getAvailableModels();
      if (modelsResponse.success && modelsResponse.data) {
        setAvailableModels(modelsResponse.data);
        console.log('✅ Django 모델 목록 로딩 완료:', modelsResponse.data.length, '개');
      }

      // Load model statistics
      const statsResponse = await djangoAdminService.getModelStatistics();
      if (statsResponse.success && statsResponse.data) {
        setModelStatistics(statsResponse.data);
        console.log('✅ Django 모델 통계 로딩 완료');
      }

      // Load recent logs
      const logsResponse = await djangoAdminService.getAdminLogs(1);
      if (logsResponse.success && logsResponse.data) {
        setRecentLogs(logsResponse.data.results.slice(0, 10));
        console.log('✅ Django Admin 로그 로딩 완료');
      }

      // Load Django users
      const usersResponse = await djangoAdminService.getDjangoUsers(1);
      if (usersResponse.success && usersResponse.data) {
        setDjangoUsers(usersResponse.data.results.slice(0, 10));
        console.log('✅ Django 사용자 목록 로딩 완료');
      }

    } catch (err: any) {
      console.error('❌ Django Admin 데이터 로딩 오류:', err);
      const errorMessage = err.message || 'Django Admin 데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleOpenDjangoAdmin = () => {
    const adminUrl = djangoAdminService.getDjangoAdminUrl();
    window.open(adminUrl, '_blank', 'noopener,noreferrer');
    
    setSuccess('Django 관리자 페이지가 새 탭에서 열렸습니다.');
    onSuccess?.('Django 관리자 페이지가 새 탭에서 열렸습니다.');
  };

  const handleOpenModelAdmin = (model: DjangoModel) => {
    const modelUrl = djangoAdminService.getModelAdminUrl(model.app_label, model.model_name);
    window.open(modelUrl, '_blank', 'noopener,noreferrer');
    
    setSuccess(`${model.verbose_name_plural} 관리 페이지가 열렸습니다.`);
    onSuccess?.(`${model.verbose_name_plural} 관리 페이지가 열렸습니다.`);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Admin Status Card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Django Admin 연결 상태</h2>
                <p className="text-gray-600">백엔드 관리 시스템 접근 상태</p>
              </div>
            </div>
            
            {adminStatus?.is_accessible && (
              <Button
                variant="primary"
                onClick={handleOpenDjangoAdmin}
                className="flex items-center"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                Django Admin 열기
              </Button>
            )}
          </div>

          <div className={`p-4 rounded-lg border ${
            adminStatus?.is_accessible 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {adminStatus?.is_accessible ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              )}
              <div>
                <h3 className={`font-medium ${
                  adminStatus?.is_accessible ? 'text-green-800' : 'text-red-800'
                }`}>
                  {adminStatus?.is_accessible ? '연결됨' : '연결 불가'}
                </h3>
                <p className={`text-sm ${
                  adminStatus?.is_accessible ? 'text-green-700' : 'text-red-700'
                }`}>
                  {adminStatus?.is_accessible 
                    ? `Django ${adminStatus.django_version} - 데이터베이스 ${adminStatus.database_status}`
                    : 'Django Admin에 접근할 수 없습니다. 관리자 권한을 확인하세요.'
                  }
                </p>
              </div>
            </div>
          </div>

          {adminStatus && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {adminStatus.available_models.length}
                </div>
                <div className="text-sm text-gray-600">사용 가능한 모델</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {adminStatus.user_permissions.length}
                </div>
                <div className="text-sm text-gray-600">권한</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {adminStatus.last_login ? '최근 로그인' : '첫 로그인'}
                </div>
                <div className="text-sm text-gray-600">
                  {adminStatus.last_login 
                    ? djangoAdminUtils.formatAdminDate(adminStatus.last_login)
                    : '기록 없음'
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="빠른 작업">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOpenModelAdmin({ app_label: 'auth', model_name: 'user', verbose_name: 'User', verbose_name_plural: 'Users', permissions: [], admin_url: '' })}
              className="flex flex-col items-center p-4 h-auto"
              disabled={!adminStatus?.is_accessible}
            >
              <UsersIcon className="h-8 w-8 mb-2 text-blue-600" />
              <span className="font-medium">사용자 관리</span>
              <span className="text-xs text-gray-500">User 모델</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleOpenModelAdmin({ app_label: 'projects', model_name: 'project', verbose_name: 'Project', verbose_name_plural: 'Projects', permissions: [], admin_url: '' })}
              className="flex flex-col items-center p-4 h-auto"
              disabled={!adminStatus?.is_accessible}
            >
              <DocumentTextIcon className="h-8 w-8 mb-2 text-green-600" />
              <span className="font-medium">프로젝트 관리</span>
              <span className="text-xs text-gray-500">Project 모델</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleOpenModelAdmin({ app_label: 'auth', model_name: 'group', verbose_name: 'Group', verbose_name_plural: 'Groups', permissions: [], admin_url: '' })}
              className="flex flex-col items-center p-4 h-auto"
              disabled={!adminStatus?.is_accessible}
            >
              <KeyIcon className="h-8 w-8 mb-2 text-purple-600" />
              <span className="font-medium">권한 관리</span>
              <span className="text-xs text-gray-500">Group 모델</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleOpenModelAdmin({ app_label: 'admin', model_name: 'logentry', verbose_name: 'Log Entry', verbose_name_plural: 'Log Entries', permissions: [], admin_url: '' })}
              className="flex flex-col items-center p-4 h-auto"
              disabled={!adminStatus?.is_accessible}
            >
              <ClockIcon className="h-8 w-8 mb-2 text-orange-600" />
              <span className="font-medium">시스템 로그</span>
              <span className="text-xs text-gray-500">LogEntry 모델</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="최근 활동">
        <div className="p-6">
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mr-3 bg-${djangoAdminUtils.getActionFlagColor(log.action_flag)}-500`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{log.user}</span>
                      <span className="text-sm text-gray-500">
                        {djangoAdminUtils.formatActionFlag(log.action_flag)}
                      </span>
                      <span className="text-sm text-gray-500">{log.content_type}</span>
                    </div>
                    <div className="text-sm text-gray-600">{log.object_repr}</div>
                    <div className="text-xs text-gray-500">
                      {djangoAdminUtils.formatAdminDate(log.action_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              최근 활동이 없습니다.
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Model Statistics */}
      <Card title="모델 통계">
        <div className="p-6">
          {modelStatistics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modelStatistics.slice(0, 6).map((stat) => (
                <div key={stat.model} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{stat.model}</h3>
                    <TableCellsIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">전체:</span>
                      <span className="font-medium">{stat.total_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">오늘 생성:</span>
                      <span className="text-green-600 font-medium">{stat.created_today}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">오늘 수정:</span>
                      <span className="text-blue-600 font-medium">{stat.modified_today}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              모델 통계를 불러올 수 없습니다.
            </div>
          )}
        </div>
      </Card>

      {/* Available Models */}
      <Card title="사용 가능한 모델">
        <div className="p-6">
          {availableModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModels.map((model) => (
                <div key={`${model.app_label}.${model.model_name}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{model.verbose_name_plural}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModelAdmin(model)}
                      className="flex items-center"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                      열기
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      앱: <span className="font-mono bg-gray-100 px-1 rounded">{model.app_label}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      모델: <span className="font-mono bg-gray-100 px-1 rounded">{model.model_name}</span>
                    </div>
                    {model.count && (
                      <div className="text-sm text-gray-600">
                        레코드 수: <span className="font-medium">{model.count.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              접근 가능한 모델이 없습니다.
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <Card title="Django 사용자 관리">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">사용자 목록</h3>
            <Button
              variant="primary"
              onClick={() => setShowUserModal(true)}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              새 사용자
            </Button>
          </div>

          {djangoUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">사용자명</th>
                    <th className="px-4 py-2 text-left">이메일</th>
                    <th className="px-4 py-2 text-left">이름</th>
                    <th className="px-4 py-2 text-left">상태</th>
                    <th className="px-4 py-2 text-left">권한</th>
                    <th className="px-4 py-2 text-left">마지막 로그인</th>
                    <th className="px-4 py-2 text-left">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {djangoUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{user.username}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{`${user.first_name} ${user.last_name}`.trim() || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-1">
                          {user.is_superuser && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">슈퍼유저</span>
                          )}
                          {user.is_staff && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">스태프</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {user.last_login 
                          ? djangoAdminUtils.formatAdminDate(user.last_login)
                          : '없음'
                        }
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              // Handle delete user
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              사용자 목록을 불러올 수 없습니다.
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Django Admin 통합</h1>
            <p className="text-gray-600 mt-1">백엔드 Django 관리 시스템과 직접 연동</p>
          </div>
        </div>
      </div>

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

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: '개요', icon: CogIcon },
            { id: 'models', name: '모델 관리', icon: TableCellsIcon },
            { id: 'users', name: '사용자 관리', icon: UsersIcon },
            { id: 'logs', name: '시스템 로그', icon: ClockIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'models' && renderModelsTab()}
      {activeTab === 'users' && renderUsersTab()}

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? '사용자 편집' : '새 사용자 생성'}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Django Admin을 통해 사용자를 직접 관리할 수 있습니다.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUserModal(false);
                setSelectedUser(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const userAdminUrl = djangoAdminService.getModelAdminUrl('auth', 'user', selectedUser ? 'change' : 'add', selectedUser?.id.toString());
                window.open(userAdminUrl, '_blank', 'noopener,noreferrer');
                setShowUserModal(false);
                setSelectedUser(null);
              }}
            >
              Django Admin에서 {selectedUser ? '편집' : '생성'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DjangoAdminIntegration;