import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import UnifiedButton from '../common/UnifiedButton';
import Input from '../common/Input';
import apiService from '../../services/apiService';
import type { UserRole } from '../../types';

interface DjangoUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  groups?: number[];
  user_permissions?: number[];
}

interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

const RealUserManagement: React.FC = () => {
  const [users, setUsers] = useState<DjangoUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'superuser' | 'staff' | 'normal'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<DjangoUser | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    is_active: true,
    is_staff: false,
    is_superuser: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const pageSize = 10;

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        search: searchTerm,
        ...(roleFilter !== 'all' && { role: roleFilter })
      });

      const response = await apiService.get<any>(`/api/users/?${params}`);
      
      if (response.data) {
        const data = response.data as any;
        setUsers(data.results || data);
        setTotalCount(data.count || (Array.isArray(data) ? data.length : 0));
        setTotalPages(Math.ceil((data.count || (Array.isArray(data) ? data.length : 0)) / pageSize));
      } else {
        throw new Error('데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
      setErrorMessage('사용자 목록을 불러오는데 실패했습니다.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 3) {
      newErrors.username = '사용자명은 3자 이상이어야 합니다.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!editingUser) {
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요.';
      } else if (formData.password.length < 8) {
        newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 사용자 생성
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setFormLoading(true);
    setErrorMessage('');

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser
      };

      const response = await apiService.post('/api/users/', userData);
      
      if (response.data) {
        setSuccessMessage('사용자가 성공적으로 생성되었습니다.');
        setShowCreateForm(false);
        resetForm();
        fetchUsers();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.error || '사용자 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('사용자 생성 실패:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const fieldErrors: Record<string, string> = {};
          Object.keys(errorData).forEach(key => {
            fieldErrors[key] = Array.isArray(errorData[key]) 
              ? errorData[key].join(', ') 
              : errorData[key];
          });
          setErrors(fieldErrors);
        } else {
          setErrorMessage('사용자 생성에 실패했습니다.');
        }
      } else {
        setErrorMessage(error.message || '사용자 생성에 실패했습니다.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // 사용자 수정
  const handleUpdateUser = async () => {
    if (!editingUser || !validateForm()) return;

    setFormLoading(true);
    setErrorMessage('');

    try {
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser
      };

      // 비밀번호 변경이 있을 경우에만 포함
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await apiService.put(`/api/users/${editingUser.id}/`, updateData);
      
      if (response.data) {
        setSuccessMessage('사용자 정보가 성공적으로 수정되었습니다.');
        setShowCreateForm(false);
        setEditingUser(null);
        resetForm();
        fetchUsers();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.error || '사용자 수정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('사용자 수정 실패:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const fieldErrors: Record<string, string> = {};
          Object.keys(errorData).forEach(key => {
            fieldErrors[key] = Array.isArray(errorData[key]) 
              ? errorData[key].join(', ') 
              : errorData[key];
          });
          setErrors(fieldErrors);
        } else {
          setErrorMessage('사용자 수정에 실패했습니다.');
        }
      } else {
        setErrorMessage(error.message || '사용자 수정에 실패했습니다.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async (user: DjangoUser) => {
    if (!window.confirm(`정말 "${user.username}" 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await apiService.delete(`/api/users/${user.id}/`);
      
      if (!response.error) {
        setSuccessMessage('사용자가 성공적으로 삭제되었습니다.');
        fetchUsers();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      setErrorMessage('사용자 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 활성/비활성 토글
  const toggleUserStatus = async (user: DjangoUser) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await apiService.patch(`/api/users/${user.id}/`, {
        is_active: !user.is_active
      });
      
      if (response.data) {
        setSuccessMessage(`사용자가 ${!user.is_active ? '활성화' : '비활성화'}되었습니다.`);
        fetchUsers();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response.error || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 상태 변경 실패:', error);
      setErrorMessage('사용자 상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
      is_active: true,
      is_staff: false,
      is_superuser: false
    });
    setErrors({});
    setEditingUser(null);
  };

  // 수정 모드로 전환
  const handleEdit = (user: DjangoUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
      confirmPassword: '',
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser
    });
    setErrors({});
    setShowCreateForm(true);
  };

  // 역할 레이블 가져오기
  const getRoleLabel = (user: DjangoUser) => {
    if (user.is_superuser) return '슈퍼 관리자';
    if (user.is_staff) return '스태프';
    return '일반 사용자';
  };

  // 역할 색상 가져오기
  const getRoleColor = (user: DjangoUser) => {
    if (user.is_superuser) return 'bg-purple-100 text-purple-800';
    if (user.is_staff) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  // 필터링된 사용자 (프론트엔드 필터링 - 백엔드 필터링과 병행)
  const getFilteredUsers = () => {
    return users.filter(user => {
      if (roleFilter === 'superuser' && !user.is_superuser) return false;
      if (roleFilter === 'staff' && !user.is_staff) return false;
      if (roleFilter === 'normal' && (user.is_staff || user.is_superuser)) return false;
      return true;
    });
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          사용자 관리
        </h1>
        <p className="text-gray-600">
          Django 시스템에 등록된 실제 사용자를 관리합니다.
        </p>
      </div>

      {/* 성공/에러 메시지 */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* 액션 버튼 및 필터 */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Input
              id="search"
              placeholder="사용자명 또는 이메일로 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="min-w-[250px]"
            />
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 역할</option>
              <option value="superuser">슈퍼 관리자</option>
              <option value="staff">스태프</option>
              <option value="normal">일반 사용자</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <UnifiedButton
              variant="secondary"
              onClick={() => fetchUsers()}
              loading={loading}
              icon="🔄"
            >
              새로고침
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              icon="➕"
            >
              새 사용자 추가
            </UnifiedButton>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">{totalCount}</div>
            <div className="text-sm text-blue-700">전체 사용자</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {users.filter(u => u.is_superuser).length}
            </div>
            <div className="text-sm text-purple-700">슈퍼 관리자</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-900">
              {users.filter(u => u.is_staff && !u.is_superuser).length}
            </div>
            <div className="text-sm text-indigo-700">스태프</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(u => !u.is_staff && !u.is_superuser).length}
            </div>
            <div className="text-sm text-gray-700">일반 사용자</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {users.filter(u => u.is_active).length}
            </div>
            <div className="text-sm text-green-700">활성 사용자</div>
          </div>
        </div>

        {/* 사용자 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-gray-500 text-center py-12">
            <p className="text-lg mb-2">
              {searchTerm || roleFilter !== 'all' 
                ? '검색 조건에 맞는 사용자가 없습니다.' 
                : '등록된 사용자가 없습니다.'}
            </p>
            <p className="text-sm">새 사용자를 추가하거나 검색 조건을 변경해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">마지막 로그인</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.first_name || user.last_name 
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user)}`}>
                        {getRoleLabel(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString('ko-KR')
                        : '없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-1">
                      <UnifiedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        icon="✏️"
                      >
                        수정
                      </UnifiedButton>
                      <UnifiedButton
                        variant={user.is_active ? "warning" : "success"}
                        size="sm"
                        onClick={() => toggleUserStatus(user)}
                        icon={user.is_active ? "🔒" : "🔓"}
                      >
                        {user.is_active ? '비활성' : '활성'}
                      </UnifiedButton>
                      <UnifiedButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        icon="🗑️"
                      >
                        삭제
                      </UnifiedButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              총 {totalCount}명 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}명 표시
            </div>
            <div className="flex space-x-2">
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                icon="◀"
              >
                이전
              </UnifiedButton>
              
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (currentPage <= 3) {
                  pageNum = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }
                
                return (
                  <UnifiedButton
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </UnifiedButton>
                );
              })}
              
              <UnifiedButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                icon="▶"
              >
                다음
              </UnifiedButton>
            </div>
          </div>
        )}
      </Card>

      {/* 사용자 생성/수정 폼 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingUser ? '사용자 정보 수정' : '새 사용자 추가'}</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingUser) {
              handleUpdateUser();
            } else {
              handleCreateUser();
            }
          }} className="space-y-4">
            <Input
              id="username"
              label="사용자명"
              placeholder="사용자명을 입력하세요"
              value={formData.username}
              onChange={(value) => setFormData({...formData, username: value})}
              error={errors.username}
              required
              disabled={editingUser !== null}
            />

            <Input
              id="email"
              label="이메일"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(value) => setFormData({...formData, email: value})}
              error={errors.email}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="이름"
                placeholder="이름"
                value={formData.first_name}
                onChange={(value) => setFormData({...formData, first_name: value})}
                error={errors.first_name}
              />

              <Input
                id="last_name"
                label="성"
                placeholder="성"
                value={formData.last_name}
                onChange={(value) => setFormData({...formData, last_name: value})}
                error={errors.last_name}
              />
            </div>

            {(!editingUser || formData.password) && (
              <>
                <Input
                  id="password"
                  label={editingUser ? "새 비밀번호 (변경시에만 입력)" : "비밀번호"}
                  type="password"
                  placeholder="8자 이상 입력하세요"
                  value={formData.password}
                  onChange={(value) => setFormData({...formData, password: value})}
                  error={errors.password}
                  required={!editingUser}
                />

                <Input
                  id="confirmPassword"
                  label="비밀번호 확인"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(value) => setFormData({...formData, confirmPassword: value})}
                  error={errors.confirmPassword}
                  required={!editingUser || !!formData.password}
                />
              </>
            )}

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">활성 상태</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_staff}
                  onChange={(e) => setFormData({...formData, is_staff: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">스태프 권한</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_superuser}
                  onChange={(e) => setFormData({...formData, is_superuser: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">슈퍼유저 권한</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <UnifiedButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                disabled={formLoading}
              >
                취소
              </UnifiedButton>
              <UnifiedButton
                type="submit"
                variant="primary"
                loading={formLoading}
                disabled={formLoading}
              >
                {editingUser ? '수정' : '생성'}
              </UnifiedButton>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealUserManagement;