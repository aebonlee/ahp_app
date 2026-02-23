import { useState, useCallback } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface UseUsersReturn {
  users: User[];
  usersLoading: boolean;
  fetchUsers: () => Promise<void>;
  createUser: (userData: Record<string, unknown>) => Promise<void>;
  updateUser: (userId: string, userData: Record<string, unknown>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export function useUsers(showActionMessage?: (type: 'success' | 'error' | 'info', text: string) => void): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await api.get('/api/service/accounts/');
      if (response.success && response.data) {
        const data = response.data;
        setUsers(Array.isArray(data) ? (data as User[]) : ((data.results || data.users || []) as User[]));
      } else if (!response.success && showActionMessage) {
        showActionMessage('error', response.error || '사용자 목록을 불러오지 못했습니다.');
      }
    } catch {
      if (showActionMessage) {
        showActionMessage('error', '사용자 목록 조회 중 오류가 발생했습니다.');
      }
    } finally {
      setUsersLoading(false);
    }
  }, [showActionMessage]);

  const createUser = useCallback(async (userData: Record<string, unknown>) => {
    const response = await api.post('/api/service/accounts/', userData);
    if (!response.success) {
      throw new Error(response.error || '사용자 생성에 실패했습니다.');
    }
    await fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId: string, userData: Record<string, unknown>) => {
    const response = await api.patch(`/api/service/accounts/${userId}/`, userData);
    if (!response.success) {
      throw new Error(response.error || '사용자 수정에 실패했습니다.');
    }
    await fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    const response = await api.delete(`/api/service/accounts/${userId}/`);
    if (!response.success) {
      throw new Error(response.error || '사용자 삭제에 실패했습니다.');
    }
    await fetchUsers();
  }, [fetchUsers]);

  return { users, usersLoading, fetchUsers, createUser, updateUser, deleteUser };
}
