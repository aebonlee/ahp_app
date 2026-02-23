/**
 * Invitation Service
 * API client for evaluator invitation management
 */
import api from './api';
import type {
  Invitation,
  InvitationBatch,
  InvitationAuditLog,
  InvitationStats,
  CreateInvitationRequest,
  TokenVerifyResponse,
  ReminderConfig,
  InvitationStatus,
} from '../types/invitation';

const BASE_URL = '/api/v1/invitations';

class InvitationService {
  // --- Admin Management ---

  async createInvitations(request: CreateInvitationRequest): Promise<InvitationBatch> {
    const response = await api.post(`${BASE_URL}/bulk/`, request);
    return response.data;
  }

  async getInvitations(projectId: number, status?: InvitationStatus): Promise<Invitation[]> {
    let url = `${BASE_URL}/?project=${projectId}`;
    if (status) url += `&status=${status}`;
    const response = await api.get(url);
    return response.data;
  }

  async getInvitation(invitationId: string): Promise<Invitation> {
    const response = await api.get(`${BASE_URL}/${invitationId}/`);
    return response.data;
  }

  async updateInvitation(invitationId: string, data: Partial<Pick<Invitation, 'custom_message' | 'expiry_date'>>): Promise<Invitation> {
    const response = await api.patch(`${BASE_URL}/${invitationId}/`, data);
    return response.data;
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await api.delete(`${BASE_URL}/${invitationId}/`);
  }

  async resendInvitation(invitationId: string): Promise<Invitation> {
    const response = await api.post(`${BASE_URL}/${invitationId}/resend/`);
    return response.data;
  }

  async extendInvitation(invitationId: string, additionalDays: number): Promise<Invitation> {
    const response = await api.post(`${BASE_URL}/${invitationId}/extend/`, {
      additional_days: additionalDays,
    });
    return response.data;
  }

  async getAuditLog(invitationId: string): Promise<InvitationAuditLog[]> {
    const response = await api.get(`${BASE_URL}/${invitationId}/audit-log/`);
    return response.data;
  }

  async getStats(projectId: number): Promise<InvitationStats> {
    const response = await api.get(`${BASE_URL}/stats/?project=${projectId}`);
    return response.data;
  }

  async configureReminder(config: ReminderConfig): Promise<void> {
    await api.post(`${BASE_URL}/${config.invitation_id}/reminder/`, config);
  }

  // --- Evaluator Access ---

  async verifyToken(token: string): Promise<TokenVerifyResponse> {
    const response = await api.post(`${BASE_URL}/verify-token/`, { token });
    return response.data;
  }

  async verifyAccessKey(key: string): Promise<TokenVerifyResponse> {
    const response = await api.post(`${BASE_URL}/verify-key/`, { key });
    return response.data;
  }

  async verifyPin(invitationId: string, pin: string): Promise<{ valid: boolean }> {
    const response = await api.post(`${BASE_URL}/verify-pin/`, {
      invitation_id: invitationId,
      pin,
    });
    return response.data;
  }

  // --- Utility ---

  /**
   * Parse invitation token or key from URL parameters.
   */
  parseUrlParams(): { token?: string; key?: string } {
    const params = new URLSearchParams(window.location.search);
    return {
      token: params.get('token') || undefined,
      key: params.get('key') || undefined,
    };
  }

  /**
   * Generate a display-friendly status label.
   */
  getStatusLabel(status: InvitationStatus): string {
    const labels: Record<InvitationStatus, string> = {
      pending: '대기 중',
      sent: '발송 완료',
      failed: '발송 실패',
      bounced: '반송됨',
      opened: '열람',
      in_progress: '평가 중',
      completed: '완료',
      expired: '만료',
      cancelled: '취소',
    };
    return labels[status];
  }

  /**
   * Get status badge color for UI rendering.
   */
  getStatusColor(status: InvitationStatus): string {
    const colors: Record<InvitationStatus, string> = {
      pending: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      bounced: 'bg-orange-100 text-orange-700',
      opened: 'bg-indigo-100 text-indigo-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-500',
      cancelled: 'bg-red-50 text-red-500',
    };
    return colors[status];
  }
}

const invitationService = new InvitationService();
export default invitationService;
