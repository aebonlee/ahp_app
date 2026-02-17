/**
 * EvaluatorInvitationHandler - 초대 링크 수락/거절 UI (Phase 2a 리팩토링)
 * - react-router-dom 제거 (GitHub Pages 탭 네비게이션 호환)
 * - URL 쿼리 파라미터에서 token 추출
 * - 새 API 엔드포인트 연결 (/api/service/invitations/verify_token/)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import { useEvaluatorInvite, TokenVerificationResult } from '../../hooks/useEvaluatorInvite';

interface EvaluatorInvitationHandlerProps {
  onEvaluationStart?: (projectId: string, evaluatorId: string) => void;
}

const EvaluatorInvitationHandler: React.FC<EvaluatorInvitationHandlerProps> = ({
  onEvaluationStart,
}) => {
  const { verifyToken, acceptInvitation, declineInvitation, loading, error } = useEvaluatorInvite();

  const [token, setToken] = useState<string>('');
  const [manualToken, setManualToken] = useState('');
  const [invitationData, setInvitationData] = useState<TokenVerificationResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'accepted' | 'declined' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // URL 쿼리 파라미터에서 토큰 추출 (GitHub Pages 탭 방식 호환)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token') || params.get('code') || params.get('key');

    // Hash 라우팅 방식도 지원
    const hash = window.location.hash;
    const hashSearch = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashSearch);
    const tokenFromHash = hashParams.get('token');

    const resolvedToken = tokenFromUrl || tokenFromHash || '';
    if (resolvedToken) {
      setToken(resolvedToken);
      handleVerifyToken(resolvedToken);
    } else {
      setStatus('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerifyToken = useCallback(async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;
    setStatus('verifying');
    setErrorMsg('');

    const result = await verifyToken(tokenToVerify);

    if (result.valid) {
      setInvitationData(result);
      setStatus('verified');

      // 세션 스토리지에 평가자 정보 저장
      sessionStorage.setItem('evaluator_session', JSON.stringify({
        projectId: result.project_id,
        token: tokenToVerify,
        accessedAt: new Date().toISOString(),
      }));
    } else {
      setErrorMsg(result.error || '유효하지 않은 초대 링크입니다.');
      setStatus('error');
    }
  }, [verifyToken]);

  const handleAccept = useCallback(async () => {
    if (!invitationData?.invitation_id) return;
    const result = await acceptInvitation(invitationData.invitation_id, token);
    if (result) {
      setStatus('accepted');
      // 평가 시작 콜백 (3초 후)
      setTimeout(() => {
        if (onEvaluationStart && result.project_id && result.evaluator_id) {
          onEvaluationStart(result.project_id, result.evaluator_id);
        }
      }, 2000);
    } else {
      setErrorMsg('초대 수락 중 오류가 발생했습니다.');
      setStatus('error');
    }
  }, [invitationData, token, acceptInvitation, onEvaluationStart]);

  const handleDecline = useCallback(async () => {
    if (!invitationData?.invitation_id) return;
    const success = await declineInvitation(invitationData.invitation_id, token);
    if (success) {
      setStatus('declined');
    }
  }, [invitationData, token, declineInvitation]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setToken(manualToken.trim());
    handleVerifyToken(manualToken.trim());
  };

  // ── 수락 완료 ──
  if (status === 'accepted') {
    return (
      <Card title="초대 수락 완료">
        <div className="text-center py-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">초대를 수락했습니다!</h3>
          <p className="text-gray-600">잠시 후 평가 페이지로 이동합니다...</p>
          <div className="mt-4 animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto" />
        </div>
      </Card>
    );
  }

  // ── 거절 완료 ──
  if (status === 'declined') {
    return (
      <Card title="초대 거절">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">초대를 거절했습니다.</h3>
          <p className="text-gray-500 text-sm">참여를 원하시면 프로젝트 관리자에게 문의하세요.</p>
        </div>
      </Card>
    );
  }

  // ── 토큰 검증 완료 (수락/거절 선택) ──
  if (status === 'verified' && invitationData) {
    return (
      <Card title="평가 초대">
        <div className="py-4 space-y-6">
          {/* 프로젝트 정보 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 text-lg mb-1">
              {invitationData.project_title || '프로젝트 평가 초대'}
            </h3>
            {invitationData.invitee_name && (
              <p className="text-blue-700 text-sm">안녕하세요, {invitationData.invitee_name}님!</p>
            )}
            <p className="text-blue-600 text-sm mt-2">
              위 프로젝트의 AHP 평가자로 초대받으셨습니다.
            </p>
            {invitationData.expires_at && (
              <p className="text-blue-500 text-xs mt-2 flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                초대 만료: {new Date(invitationData.expires_at).toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>

          {/* 수락/거절 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              {loading ? '처리 중...' : '초대 수락 및 평가 시작'}
            </button>
            <button
              onClick={handleDecline}
              disabled={loading}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              거절
            </button>
          </div>

          {(error || errorMsg) && (
            <p className="text-red-600 text-sm text-center">{error || errorMsg}</p>
          )}
        </div>
      </Card>
    );
  }

  // ── 검증 중 ──
  if (status === 'verifying') {
    return (
      <Card title="초대 확인 중">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">초대 링크를 확인하고 있습니다...</p>
        </div>
      </Card>
    );
  }

  // ── 오류 또는 수동 입력 ──
  return (
    <Card title="평가자 초대 확인">
      <div className="py-4 space-y-6">
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">초대 링크 오류</span>
            </div>
            <p className="text-red-700 text-sm">{errorMsg}</p>
          </div>
        )}

        <div className="text-center">
          <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            이메일로 받은 초대 링크를 클릭하거나, 아래에 초대 코드를 직접 입력하세요.
          </p>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="초대 토큰 입력 (이메일의 링크에서 복사)"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!manualToken.trim() || loading}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            초대 확인
          </button>
        </form>
      </div>
    </Card>
  );
};

// 누락된 EnvelopeIcon import 처리
function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

export default EvaluatorInvitationHandler;
