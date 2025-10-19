import React, { useState } from 'react';
// useEffect - 현재 미사용
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'evaluator';
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive';
}

interface UserManagementProps {
  users: User[];
  loading: boolean;
  onCreateUser: (userData: Omit<User, 'id' | 'created_at' | 'last_login'>) => Promise<void>;
  onUpdateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  loading,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onRefresh
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'evaluator'>('all');
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'evaluator' as 'super_admin' | 'admin' | 'evaluator',
    password: '',
    confirmPassword: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = '이름을 입력해주세요.';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = '성을 입력해주세요.';
    }

    if (!editingUser) {
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요.';
      } else if (formData.password.length < 6) {
        newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCreateLoading(true);
    
    try {
      if (editingUser) {
        // 수정
        await onUpdateUser(editingUser.id, {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          status: formData.status
        });
      } else {
        // 생성
        await onCreateUser({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          status: formData.status
        });
      }
      
      resetForm();
      setShowCreateForm(false);
      setEditingUser(null);
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : '사용자 처리에 실패했습니다.' 
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'evaluator',
      password: '',
      confirmPassword: '',
      status: 'active'
    });
    setErrors({});
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      password: '',
      confirmPassword: '',
      status: user.status
    });
    setShowCreateForm(true);
    setErrors({});
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`사용자 "${user.first_name} ${user.last_name}"를 정말 삭제하시겠습니까?`)) {
      try {
        await onDeleteUser(user.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : '사용자 삭제에 실패했습니다.');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingUser(null);
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          사용자 관리
        </h1>
        <p className="text-gray-600">
          시스템 사용자를 생성, 수정, 삭제할 수 있습니다.
        </p>
      </div>

      {/* 액션 버튼 및 필터 */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
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
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'super_admin' | 'admin' | 'evaluator')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 역할</option>
              <option value="super_admin">총괄 관리자</option>
              <option value="admin">관리자</option>
              <option value="evaluator">평가자</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={onRefresh}
              loading={loading}
            >
              새로고침
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
            >
              새 사용자 추가
            </Button>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{users.length}</div>
            <div className="text-sm text-blue-700">전체 사용자</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {users.filter(u => u.role === 'super_admin').length}
            </div>
            <div className="text-sm text-purple-700">총괄 관리자</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-900">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-red-700">관리자</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {users.filter(u => u.role === 'evaluator').length}
            </div>
            <div className="text-sm text-green-700">평가자</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-900">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-yellow-700">활성 사용자</div>
          </div>
        </div>

        {/* 사용자 목록 */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">마지막 로그인</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'super_admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'super_admin' ? '총괄 관리자' : user.role === 'admin' ? '관리자' : '평가자'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : '없음'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => handleDelete(user)}
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 사용자 생성/수정 폼 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingUser ? '사용자 수정' : '새 사용자 추가'}
            </h3>

            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                label="이메일"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                error={errors.email}
                required
              />

              <Input
                id="first_name"
                label="이름"
                placeholder="홍길동"
                value={formData.first_name}
                onChange={(value) => handleInputChange('first_name', value)}
                error={errors.first_name}
                required
              />

              <Input
                id="last_name"
                label="성"
                placeholder="홍"
                value={formData.last_name}
                onChange={(value) => handleInputChange('last_name', value)}
                error={errors.last_name}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="evaluator">평가자</option>
                  <option value="admin">관리자</option>
                  <option value="super_admin">총괄 관리자</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>

              {!editingUser && (
                <>
                  <Input
                    id="password"
                    label="비밀번호"
                    type="password"
                    placeholder="6자 이상 입력하세요"
                    value={formData.password}
                    onChange={(value) => handleInputChange('password', value)}
                    error={errors.password}
                    required
                  />

                  <Input
                    id="confirmPassword"
                    label="비밀번호 확인"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={(value) => handleInputChange('confirmPassword', value)}
                    error={errors.confirmPassword}
                    required
                  />
                </>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={createLoading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={createLoading}
                  disabled={createLoading}
                >
                  {editingUser ? '수정' : '생성'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;