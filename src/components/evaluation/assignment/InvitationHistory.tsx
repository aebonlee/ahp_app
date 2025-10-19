import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../../../services/api';

interface BulkInvitation {
  id: string;
  project_title: string;
  total_count: number;
  sent_count: number;
  failed_count: number;
  accepted_count: number;
  status: string;
  created_at: string;
  completed_at?: string;
  success_rate: number;
}

interface InvitationHistoryProps {
  projectId: number;
  refreshKey?: number;
}

const InvitationHistory: React.FC<InvitationHistoryProps> = ({ projectId, refreshKey = 0 }) => {
  const [invitations, setInvitations] = useState<BulkInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvitation, setSelectedInvitation] = useState<BulkInvitation | null>(null);

  useEffect(() => {
    loadInvitations();
  }, [projectId, refreshKey]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/evaluations/bulk-invitations/');
      const projectInvitations = (response.data.results || response.data).filter(
        (inv: any) => inv.project === projectId
      );
      setInvitations(projectInvitations);
    } catch (error) {
      console.error('초대 기록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-600 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };

    const statusText = {
      completed: '완료',
      processing: '처리중',
      pending: '대기중',
      failed: '실패'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const handleResendFailed = async (invitationId: string) => {
    try {
      const response = await api.post(`/evaluations/bulk-invitations/${invitationId}/resend_failed/`);
      alert(`${response.data.resent_count}개의 이메일을 재발송 대기열에 추가했습니다.`);
      loadInvitations();
    } catch (error) {
      console.error('재발송 실패:', error);
      alert('재발송에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">초대 발송 기록</h2>

      {invitations.length > 0 ? (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(invitation.status)}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {new Date(invitation.created_at).toLocaleString('ko-KR')}
                      </span>
                      {getStatusBadge(invitation.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">총 초대:</span>
                        <span className="ml-2 font-medium">{invitation.total_count}명</span>
                      </div>
                      <div>
                        <span className="text-gray-500">발송 성공:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {invitation.sent_count}명
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">발송 실패:</span>
                        <span className="ml-2 font-medium text-red-600">
                          {invitation.failed_count}명
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">수락:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {invitation.accepted_count}명
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">성공률:</span>
                        <div className="flex-1 max-w-[200px]">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${invitation.success_rate}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {invitation.success_rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {invitation.failed_count > 0 && invitation.status === 'completed' && (
                    <button
                      onClick={() => handleResendFailed(invitation.id)}
                      className="btn btn-sm btn-secondary"
                    >
                      실패 재발송
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedInvitation(invitation)}
                    className="btn btn-sm btn-ghost"
                  >
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">초대 발송 기록이 없습니다.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedInvitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">초대 상세 정보</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">ID:</span>
                <span className="ml-2 font-mono text-sm">{selectedInvitation.id}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">생성일:</span>
                <span className="ml-2">{new Date(selectedInvitation.created_at).toLocaleString('ko-KR')}</span>
              </div>
              {selectedInvitation.completed_at && (
                <div>
                  <span className="text-sm text-gray-500">완료일:</span>
                  <span className="ml-2">{new Date(selectedInvitation.completed_at).toLocaleString('ko-KR')}</span>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">상태:</span>
                <span className="ml-2">{getStatusBadge(selectedInvitation.status)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedInvitation(null)}
                className="btn btn-secondary"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationHistory;