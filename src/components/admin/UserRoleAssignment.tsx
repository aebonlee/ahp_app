import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'evaluator' | 'user';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface ProjectRole {
  userId: string;
  projectId: string;
  role: 'project_admin' | 'evaluator' | 'viewer';
  assigned_at: string;
  assigned_by: string;
}

interface UserRoleAssignmentProps {
  projectId: string;
  projectName: string;
  onComplete?: () => void;
  onBack?: () => void;
}

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
  projectId,
  projectName,
  onComplete,
  onBack
}) => {
  // Auth context에서 관리자 권한 확인
  const { user: authUser, isAdmin, isSuperAdmin, hasRole } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    projectRole: 'evaluator' as ProjectRole['role']
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 초기 사용자 데이터 로딩
  useEffect(() => {
    loadUsers();
    loadProjectRoles();
  }, [projectId]);

  const loadUsers = async () => {
    setLoading(true);
    
    // 샘플 사용자 데이터
    const sampleUsers: User[] = [
      {
        id: 'aebon-001',
        email: 'aebon@example.com',
        first_name: 'aebon',
        last_name: 'Super Admin',
        role: 'super_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      },
      {
        id: 'admin-001',
        email: 'admin@company.com',
        first_name: 'John',
        last_name: 'Admin',
        role: 'admin',
        is_active: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'manager-001',
        email: 'manager@company.com',
        first_name: 'Sarah',
        last_name: 'Manager',
        role: 'manager',
        is_active: true,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'evaluator-001',
        email: 'eval1@company.com',
        first_name: 'David',
        last_name: 'Kim',
        role: 'evaluator',
        is_active: true,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'evaluator-002',
        email: 'eval2@company.com',
        first_name: 'Emily',
        last_name: 'Park',
        role: 'evaluator',
        is_active: true,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user-001',
        email: 'user1@company.com',
        first_name: 'Mike',
        last_name: 'Johnson',
        role: 'user',
        is_active: true,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setUsers(sampleUsers);
    setLoading(false);
  };

  const loadProjectRoles = async () => {
    // 샘플 프로젝트 역할 데이터
    const sampleRoles: ProjectRole[] = [
      {
        userId: 'aebon-001',
        projectId,
        role: 'project_admin',
        assigned_at: new Date().toISOString(),
        assigned_by: 'system'
      },
      {
        userId: 'evaluator-001',
        projectId,
        role: 'evaluator',
        assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_by: 'aebon-001'
      }
    ];

    setProjectRoles(sampleRoles);
  };

  const validateInviteForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!inviteForm.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    } else if (users.some(u => u.email.toLowerCase() === inviteForm.email.toLowerCase())) {
      newErrors.email = '이미 등록된 이메일입니다.';
    }

    if (!inviteForm.firstName.trim()) {
      newErrors.firstName = '이름을 입력해주세요.';
    }

    if (!inviteForm.lastName.trim()) {
      newErrors.lastName = '성을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInviteUser = async () => {
    if (!validateInviteForm()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: inviteForm.email,
      first_name: inviteForm.firstName,
      last_name: inviteForm.lastName,
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString()
    };

    const newProjectRole: ProjectRole = {
      userId: newUser.id,
      projectId,
      role: inviteForm.projectRole,
      assigned_at: new Date().toISOString(),
      assigned_by: authUser?.id || 'unknown'
    };

    setUsers(prev => [...prev, newUser]);
    setProjectRoles(prev => [...prev, newProjectRole]);
    
    setShowInviteForm(false);
    setInviteForm({
      email: '',
      firstName: '',
      lastName: '',
      projectRole: 'evaluator'
    });
    setErrors({});
  };

  const handleAssignRole = (userId: string, role: ProjectRole['role']) => {
    const existingRole = projectRoles.find(pr => pr.userId === userId && pr.projectId === projectId);
    
    if (existingRole) {
      // Update existing role
      setProjectRoles(prev => prev.map(pr => 
        pr.userId === userId && pr.projectId === projectId
          ? { ...pr, role, assigned_at: new Date().toISOString(), assigned_by: authUser?.id || 'unknown' }
          : pr
      ));
    } else {
      // Create new role assignment
      const newRole: ProjectRole = {
        userId,
        projectId,
        role,
        assigned_at: new Date().toISOString(),
        assigned_by: authUser?.id || 'unknown'
      };
      setProjectRoles(prev => [...prev, newRole]);
    }
  };

  const handleRemoveRole = (userId: string) => {
    if (window.confirm('사용자의 프로젝트 역할을 제거하시겠습니까?')) {
      setProjectRoles(prev => prev.filter(pr => !(pr.userId === userId && pr.projectId === projectId)));
    }
  };

  const getUserProjectRole = (userId: string): ProjectRole | undefined => {
    return projectRoles.find(pr => pr.userId === userId && pr.projectId === projectId);
  };

  const getRoleBadgeStyle = (role: ProjectRole['role']) => {
    switch (role) {
      case 'project_admin':
        return 'bg-red-100 text-red-800';
      case 'evaluator':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: ProjectRole['role']) => {
    switch (role) {
      case 'project_admin':
        return '프로젝트 관리자';
      case 'evaluator':
        return '평가자';
      case 'viewer':
        return '조회자';
      default:
        return '알 수 없음';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userProjectRole = getUserProjectRole(user.id);
    const matchesRole = 
      roleFilter === 'all' ||
      (roleFilter === 'assigned' && userProjectRole) ||
      (roleFilter === 'unassigned' && !userProjectRole);
    
    return matchesSearch && matchesRole;
  });

  const assignedUsers = projectRoles.filter(pr => pr.projectId === projectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">사용자 역할 배정</h2>
            {isSuperAdmin && (
              <span className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                🔴 Super Admin
              </span>
            )}
            {isAdmin && !isSuperAdmin && (
              <span className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                🔵 Admin
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            프로젝트: <span className="font-medium">{projectName}</span>
            {authUser?.username && <span className="ml-2 text-gray-500">• 로그인: {authUser.username}</span>}
          </p>
        </div>
        <div className="flex space-x-2">
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              ← 뒤로
            </Button>
          )}
          {onComplete && (
            <Button variant="primary" onClick={onComplete}>
              완료
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{assignedUsers.length}</div>
            <div className="text-sm text-gray-600">배정된 사용자</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {assignedUsers.filter(u => u.role === 'evaluator').length}
            </div>
            <div className="text-sm text-gray-600">평가자</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {assignedUsers.filter(u => u.role === 'project_admin').length}
            </div>
            <div className="text-sm text-gray-600">관리자</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {assignedUsers.filter(u => u.role === 'viewer').length}
            </div>
            <div className="text-sm text-gray-600">조회자</div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Input
              id="search"
              placeholder="이름 또는 이메일로 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="min-w-[200px]"
            />
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 사용자</option>
              <option value="assigned">배정된 사용자</option>
              <option value="unassigned">미배정 사용자</option>
            </select>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowInviteForm(true)}
          >
            + 사용자 초대
          </Button>
        </div>
      </Card>

      {/* User List */}
      <Card>
        {loading ? (
          <div className="text-center py-8">데이터 로딩 중...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {searchTerm || roleFilter !== 'all' ? '검색 조건에 맞는 사용자가 없습니다.' : '등록된 사용자가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시스템 역할</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">프로젝트 역할</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">마지막 로그인</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const projectRole = getUserProjectRole(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'manager' ? 'bg-orange-100 text-orange-800' :
                          user.role === 'evaluator' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'super_admin' ? '총괄 관리자' :
                           user.role === 'admin' ? '관리자' :
                           user.role === 'manager' ? '매니저' :
                           user.role === 'evaluator' ? '평가자' : '사용자'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {projectRole ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(projectRole.role)}`}>
                            {getRoleLabel(projectRole.role)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">미배정</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString('ko-KR')
                          : '없음'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {projectRole ? (
                            <>
                              <select
                                value={projectRole.role}
                                onChange={(e) => handleAssignRole(user.id, e.target.value as ProjectRole['role'])}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="viewer">조회자</option>
                                <option value="evaluator">평가자</option>
                                <option value="project_admin">프로젝트 관리자</option>
                              </select>
                              <Button
                                variant="error"
                                size="sm"
                                onClick={() => handleRemoveRole(user.id)}
                              >
                                제거
                              </Button>
                            </>
                          ) : (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignRole(user.id, e.target.value as ProjectRole['role']);
                                }
                              }}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="">역할 선택</option>
                              <option value="viewer">조회자</option>
                              <option value="evaluator">평가자</option>
                              <option value="project_admin">프로젝트 관리자</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite User Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">사용자 초대</h3>

            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                id="email"
                label="이메일"
                type="email"
                placeholder="user@example.com"
                value={inviteForm.email}
                onChange={(value) => setInviteForm(prev => ({ ...prev, email: value }))}
                error={errors.email}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  label="이름"
                  placeholder="홍길동"
                  value={inviteForm.firstName}
                  onChange={(value) => setInviteForm(prev => ({ ...prev, firstName: value }))}
                  error={errors.firstName}
                  required
                />

                <Input
                  id="lastName"
                  label="성"
                  placeholder="홍"
                  value={inviteForm.lastName}
                  onChange={(value) => setInviteForm(prev => ({ ...prev, lastName: value }))}
                  error={errors.lastName}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로젝트 역할 <span className="text-red-500">*</span>
                </label>
                <select
                  value={inviteForm.projectRole}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, projectRole: e.target.value as ProjectRole['role'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="viewer">조회자</option>
                  <option value="evaluator">평가자</option>
                  <option value="project_admin">프로젝트 관리자</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 mt-6 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteForm({
                    email: '',
                    firstName: '',
                    lastName: '',
                    projectRole: 'evaluator'
                  });
                  setErrors({});
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleInviteUser}
              >
                초대
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleAssignment;