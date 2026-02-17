/**
 * EvaluatorInvitationManager - 관리자용 초대 관리 컴포넌트 (Phase 2a)
 * 초대 목록 조회, 필터링, 리마인더 발송, 철회, 토큰 재생성
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  NoSymbolIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import {
  useEvaluatorInvite,
  InvitationData,
  InvitationStatus,
} from '../../../hooks/useEvaluatorInvite';
import { INVITATION_STATUS_MAP } from './invitationStatusConfig';

interface EvaluatorInvitationManagerProps {
  projectId: string;
}

const EvaluatorInvitationManager: React.FC<EvaluatorInvitationManagerProps> = ({ projectId }) => {
  const {
    invitations,
    stats,
    loading,
    error,
    fetchInvitations,
    resendInvitation,
    revokeInvitation,
    regenerateToken,
    clearError,
  } = useEvaluatorInvite();

  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations(projectId, statusFilter === 'all' ? undefined : statusFilter);
  }, [projectId, statusFilter, fetchInvitations]);

  const handleResend = useCallback(async (invitationId: string, reminderCount: number) => {
    if (reminderCount >= 3) {
      alert('최대 재발송 횟수(3회)에 도달했습니다. 토큰을 재생성하세요.');
      return;
    }
    setActionLoading(invitationId);
    const success = await resendInvitation(invitationId);
    setActionLoading(null);
    if (success) alert('리마인더 이메일이 발송되었습니다.');
  }, [resendInvitation]);

  const handleRevoke = useCallback(async (invitationId: string) => {
    if (!window.confirm('이 초대를 철회하시겠습니까? 철회된 초대는 복구할 수 없습니다.')) return;
    setActionLoading(invitationId);
    await revokeInvitation(invitationId);
    setActionLoading(null);
  }, [revokeInvitation]);

  const handleRegenerate = useCallback(async (invitationId: string) => {
    if (!window.confirm('새 초대 링크를 생성하고 이메일을 재발송하시겠습니까?')) return;
    setActionLoading(invitationId);
    const success = await regenerateToken(invitationId, 7);
    setActionLoading(null);
    if (success) alert('새 초대 링크가 발송되었습니다.');
  }, [regenerateToken]);

  const getStatusIcon = (status: InvitationStatus) => {
    const icons: Record<InvitationStatus, React.ReactElement> = {
      pending: <ClockIcon className="h-4 w-4" />,
      accepted: <CheckCircleIcon className="h-4 w-4" />,
      declined: <XCircleIcon className="h-4 w-4" />,
      expired: <ExclamationCircleIcon className="h-4 w-4" />,
      revoked: <NoSymbolIcon className="h-4 w-4" />,
    };
    return icons[status];
  };

  const renderActions = (inv: InvitationData) => {
    const cfg = INVITATION_STATUS_MAP[inv.status];
    const isLoading = actionLoading === inv.id;

    return (
      <div className="flex gap-2 flex-wrap">
        {cfg.actions.includes('resend') && (
          <button
            onClick={() => handleResend(inv.id, inv.reminder_count)}
            disabled={isLoading}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-1"
            title={`재발송 (${inv.reminder_count}/3)`}
          >
            <PaperAirplaneIcon className="h-3 w-3" />
            재발송 ({inv.reminder_count}/3)
          </button>
        )}
        {cfg.actions.includes('revoke') && (
          <button
            onClick={() => handleRevoke(inv.id)}
            disabled={isLoading}
            className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            철회
          </button>
        )}
        {cfg.actions.includes('regenerate') && (
          <button
            onClick={() => handleRegenerate(inv.id)}
            disabled={isLoading}
            className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <ArrowPathIcon className="h-3 w-3" />
            링크 재생성
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <EnvelopeIcon className="h-5 w-5 text-blue-600" />
          초대 관리
        </h3>
        <button
          onClick={() => fetchInvitations(projectId, statusFilter === 'all' ? undefined : statusFilter)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <ArrowPathIcon className="h-4 w-4" />
          새로고침
        </button>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
          {(['pending', 'accepted', 'declined', 'expired', 'revoked'] as InvitationStatus[]).map((s) => {
            const cfg = INVITATION_STATUS_MAP[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                className={`p-3 rounded-xl text-center border-2 transition-all ${
                  statusFilter === s ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-200'
                } ${cfg.bgColor}`}
              >
                <div className={`text-xl font-bold ${cfg.color}`}>{stats[s]}</div>
                <div className={`text-xs mt-0.5 ${cfg.color}`}>{cfg.label}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex justify-between items-center">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearError} className="text-xs text-red-500 underline ml-2">닫기</button>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <EnvelopeIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">
            {statusFilter === 'all' ? '초대 기록이 없습니다.' : `${INVITATION_STATUS_MAP[statusFilter].label} 초대가 없습니다.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 text-xs">
                <th className="pb-2 font-medium">이메일</th>
                <th className="pb-2 font-medium">이름</th>
                <th className="pb-2 font-medium">상태</th>
                <th className="pb-2 font-medium">만료일</th>
                <th className="pb-2 font-medium">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invitations.map((inv) => {
                const cfg = INVITATION_STATUS_MAP[inv.status];
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-900">{inv.invitee_email}</td>
                    <td className="py-3 text-gray-500">{inv.invitee_name || '-'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
                        {getStatusIcon(inv.status)}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(inv.expires_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3">{renderActions(inv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EvaluatorInvitationManager;
