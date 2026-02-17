/**
 * useEvaluatorInvite - 평가자 초대 시스템 커스텀 훅 (Phase 2a)
 * 관리자 액션(초대 생성/관리)과 평가자 액션(토큰 검증/수락/거절)을 모두 처리
 */

import { useState, useCallback } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import authService from '../services/authService';

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

export interface InvitationData {
  id: string;
  project_id: string;
  project_title?: string;
  invitee_email: string;
  invitee_name?: string;
  role: string;
  status: InvitationStatus;
  invitation_url?: string;
  expires_at: string;
  created_at: string;
  reminder_count: number;
  last_reminder_at?: string;
  accepted_at?: string;
  declined_at?: string;
  revoked_at?: string;
}

export interface InvitationStats {
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
  revoked: number;
  total: number;
}

export interface CreateInvitationParams {
  project_id: string;
  invitee_email: string;
  invitee_name?: string;
  role?: string;
  custom_message?: string;
  expiry_days?: number;
}

export interface BulkInvitationParams {
  project_id: string;
  evaluator_emails: string[];
  custom_message?: string;
  expiry_days?: number;
}

export interface BulkInvitationResult {
  invitations_created: number;
  duplicates_skipped: number;
  errors: Array<{ email: string; reason: string }>;
}

export interface TokenVerificationResult {
  valid: boolean;
  invitation_id?: string;
  project_id?: string;
  project_title?: string;
  invitee_email?: string;
  invitee_name?: string;
  expires_at?: string;
  error?: string;
}

export interface UseEvaluatorInviteReturn {
  invitations: InvitationData[];
  stats: InvitationStats | null;
  loading: boolean;
  error: string | null;

  // 관리자 액션
  fetchInvitations: (projectId: string, statusFilter?: InvitationStatus) => Promise<void>;
  createInvitation: (params: CreateInvitationParams) => Promise<InvitationData | null>;
  createBulkInvitations: (params: BulkInvitationParams) => Promise<BulkInvitationResult | null>;
  resendInvitation: (invitationId: string) => Promise<boolean>;
  revokeInvitation: (invitationId: string, reason?: string) => Promise<boolean>;
  regenerateToken: (invitationId: string, expiryDays?: number) => Promise<boolean>;

  // 평가자 액션 (비인증)
  verifyToken: (token: string) => Promise<TokenVerificationResult>;
  acceptInvitation: (invitationId: string, token: string, name?: string) => Promise<{
    project_id: string;
    evaluator_id: string;
    evaluation_url: string;
  } | null>;
  declineInvitation: (invitationId: string, token: string, reason?: string) => Promise<boolean>;

  clearError: () => void;
}

// ─── 훅 구현 ──────────────────────────────────────────────────────────────────

export function useEvaluatorInvite(): UseEvaluatorInviteReturn {
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 인증된 요청 헬퍼
  const authenticatedRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = authService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  // 비인증 요청 헬퍼 (토큰 검증, 수락/거절)
  const publicRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.detail || `HTTP ${response.status}`);
    }

    return data;
  }, []);

  // ─── 관리자 액션 ────────────────────────────────────────────────────────────

  const fetchInvitations = useCallback(async (
    projectId: string,
    statusFilter?: InvitationStatus
  ) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_ENDPOINTS.INVITATIONS.LIST}?project_id=${projectId}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const data = await authenticatedRequest<{
        results: InvitationData[];
        stats: InvitationStats;
      }>(url);

      setInvitations(data.results || []);
      setStats(data.stats || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  const createInvitation = useCallback(async (
    params: CreateInvitationParams
  ): Promise<InvitationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authenticatedRequest<InvitationData>(
        API_ENDPOINTS.INVITATIONS.CREATE,
        { method: 'POST', body: JSON.stringify(params) }
      );
      setInvitations(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  const createBulkInvitations = useCallback(async (
    params: BulkInvitationParams
  ): Promise<BulkInvitationResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authenticatedRequest<BulkInvitationResult>(
        API_ENDPOINTS.INVITATIONS.BULK,
        { method: 'POST', body: JSON.stringify(params) }
      );
      await fetchInvitations(params.project_id);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest, fetchInvitations]);

  const resendInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    setError(null);
    try {
      await authenticatedRequest(
        API_ENDPOINTS.INVITATIONS.RESEND(invitationId),
        { method: 'POST' }
      );
      setInvitations(prev => prev.map(inv =>
        inv.id === invitationId
          ? { ...inv, reminder_count: inv.reminder_count + 1, last_reminder_at: new Date().toISOString() }
          : inv
      ));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [authenticatedRequest]);

  const revokeInvitation = useCallback(async (
    invitationId: string,
    reason?: string
  ): Promise<boolean> => {
    setError(null);
    try {
      await authenticatedRequest(
        API_ENDPOINTS.INVITATIONS.REVOKE(invitationId),
        { method: 'POST', body: JSON.stringify({ reason: reason || '' }) }
      );
      setInvitations(prev => prev.map(inv =>
        inv.id === invitationId ? { ...inv, status: 'revoked' as InvitationStatus } : inv
      ));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [authenticatedRequest]);

  const regenerateToken = useCallback(async (
    invitationId: string,
    expiryDays: number = 7
  ): Promise<boolean> => {
    setError(null);
    try {
      const data = await authenticatedRequest<{ expires_at: string }>(
        API_ENDPOINTS.INVITATIONS.REGENERATE(invitationId),
        { method: 'POST', body: JSON.stringify({ expiry_days: expiryDays }) }
      );
      setInvitations(prev => prev.map(inv =>
        inv.id === invitationId
          ? { ...inv, status: 'pending' as InvitationStatus, expires_at: data.expires_at, reminder_count: 0 }
          : inv
      ));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [authenticatedRequest]);

  // ─── 평가자 액션 (비인증) ────────────────────────────────────────────────────

  const verifyToken = useCallback(async (token: string): Promise<TokenVerificationResult> => {
    try {
      return await publicRequest<TokenVerificationResult>(
        API_ENDPOINTS.INVITATIONS.VERIFY_TOKEN,
        { method: 'POST', body: JSON.stringify({ token }) }
      );
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  }, [publicRequest]);

  const acceptInvitation = useCallback(async (
    invitationId: string,
    token: string,
    name?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      return await publicRequest<{
        project_id: string;
        evaluator_id: string;
        evaluation_url: string;
      }>(
        API_ENDPOINTS.INVITATIONS.ACCEPT(invitationId),
        { method: 'POST', body: JSON.stringify({ token, evaluator_name: name }) }
      );
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicRequest]);

  const declineInvitation = useCallback(async (
    invitationId: string,
    token: string,
    reason?: string
  ): Promise<boolean> => {
    setError(null);
    try {
      await publicRequest(
        API_ENDPOINTS.INVITATIONS.DECLINE(invitationId),
        { method: 'POST', body: JSON.stringify({ token, reason: reason || '' }) }
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [publicRequest]);

  const clearError = useCallback(() => setError(null), []);

  return {
    invitations,
    stats,
    loading,
    error,
    fetchInvitations,
    createInvitation,
    createBulkInvitations,
    resendInvitation,
    revokeInvitation,
    regenerateToken,
    verifyToken,
    acceptInvitation,
    declineInvitation,
    clearError,
  };
}
