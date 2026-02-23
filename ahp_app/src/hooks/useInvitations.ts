/**
 * useInvitations - Custom hook for evaluator invitation management
 */
import { useState, useCallback } from 'react';
import invitationService from '../services/invitationService';
import type {
  Invitation,
  InvitationStats,
  CreateInvitationRequest,
  InvitationStatus,
} from '../types/invitation';

interface UseInvitationsReturn {
  invitations: Invitation[];
  stats: InvitationStats | null;
  loading: boolean;
  error: string | null;
  fetchInvitations: (projectId: number, status?: InvitationStatus) => Promise<void>;
  fetchStats: (projectId: number) => Promise<void>;
  createInvitations: (request: CreateInvitationRequest) => Promise<boolean>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  resendInvitation: (invitationId: string) => Promise<boolean>;
  extendInvitation: (invitationId: string, days: number) => Promise<boolean>;
  clearError: () => void;
}

export function useInvitations(): UseInvitationsReturn {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async (projectId: number, status?: InvitationStatus) => {
    setLoading(true);
    setError(null);
    try {
      const data = await invitationService.getInvitations(projectId, status);
      setInvitations(data);
    } catch {
      setError('초대 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (projectId: number) => {
    try {
      const data = await invitationService.getStats(projectId);
      setStats(data);
    } catch {
      // Stats are non-critical, fail silently
    }
  }, []);

  const createInvitations = useCallback(async (request: CreateInvitationRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const batch = await invitationService.createInvitations(request);
      setInvitations(prev => [...prev, ...batch.invitations]);
      return true;
    } catch {
      setError('초대 생성에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    try {
      await invitationService.cancelInvitation(invitationId);
      setInvitations(prev =>
        prev.map(inv => inv.id === invitationId ? { ...inv, status: 'cancelled' as InvitationStatus } : inv)
      );
      return true;
    } catch {
      setError('초대 취소에 실패했습니다.');
      return false;
    }
  }, []);

  const resendInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    try {
      const updated = await invitationService.resendInvitation(invitationId);
      setInvitations(prev =>
        prev.map(inv => inv.id === invitationId ? updated : inv)
      );
      return true;
    } catch {
      setError('초대 재발송에 실패했습니다.');
      return false;
    }
  }, []);

  const extendInvitation = useCallback(async (invitationId: string, days: number): Promise<boolean> => {
    try {
      const updated = await invitationService.extendInvitation(invitationId, days);
      setInvitations(prev =>
        prev.map(inv => inv.id === invitationId ? updated : inv)
      );
      return true;
    } catch {
      setError('초대 기간 연장에 실패했습니다.');
      return false;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    invitations, stats, loading, error,
    fetchInvitations, fetchStats, createInvitations,
    cancelInvitation, resendInvitation, extendInvitation,
    clearError,
  };
}
