import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiService } from '../../services/apiService';

interface InvitationData {
  projectId: string;
  projectName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorEmail: string;
  token: string;
  expiresAt: string;
  isUsed: boolean;
}

interface EvaluatorInvitationHandlerProps {
  onEvaluationStart?: (projectId: string, evaluatorId: string) => void;
}

const EvaluatorInvitationHandler: React.FC<EvaluatorInvitationHandlerProps> = ({
  onEvaluationStart
}) => {
  const { invitationCode } = useParams<{ invitationCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // URL에서 초대 코드 추출 (쿼리 파라미터 또는 경로 파라미터)
    const queryParams = new URLSearchParams(location.search);
    const codeFromQuery = queryParams.get('code');
    const tokenFromQuery = queryParams.get('token');
    
    const code = invitationCode || codeFromQuery || tokenFromQuery;
    
    if (code) {
      validateInvitation(code);
    } else {
      setLoading(false);
    }
  }, [invitationCode, location]);

  const validateInvitation = async (code: string) => {
    setLoading(true);
    setError('');
    setIsValidating(true);

    try {
      // 초대 코드 검증 API 호출
      const response = await apiService.post('/api/evaluators/validate-invitation/', {
        code: code
      });

      if (response.data.valid) {
        setInvitationData(response.data.invitation);
        
        // 세션 스토리지에 평가자 정보 저장
        sessionStorage.setItem('evaluator_session', JSON.stringify({
          projectId: response.data.invitation.projectId,
          evaluatorId: response.data.invitation.evaluatorId,
          token: response.data.invitation.token,
          expiresAt: response.data.invitation.expiresAt
        }));

        // 자동으로 평가 페이지로 이동 (3초 후)
        setTimeout(() => {
          startEvaluation(response.data.invitation);
        }, 3000);
      } else {
        setError(response.data.message || '유효하지 않은 초대 코드입니다.');
      }
    } catch (err: any) {
      console.error('초대 코드 검증 실패:', err);
      
      if (err.response?.status === 404) {
        setError('초대 코드를 찾을 수 없습니다.');
      } else if (err.response?.status === 410) {
        setError('만료된 초대 코드입니다.');
      } else if (err.response?.status === 409) {
        setError('이미 사용된 초대 코드입니다.');
      } else {
        setError('초대 코드 검증 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }

    // 초대 코드 형식 검증 (예: PRJ-2025-ABC123)
    const codePattern = /^[A-Z0-9-]+$/i;
    if (!codePattern.test(manualCode)) {
      setError('올바른 초대 코드 형식이 아닙니다.');
      return;
    }

    validateInvitation(manualCode);
  };

  const startEvaluation = (invitation: InvitationData) => {
    if (onEvaluationStart) {
      onEvaluationStart(invitation.projectId, invitation.evaluatorId);
    } else {
      // 평가 유형 선택 페이지로 이동
      navigate(`/evaluation/${invitation.projectId}`, {
        state: {
          evaluatorId: invitation.evaluatorId,
          evaluatorName: invitation.evaluatorName,
          projectName: invitation.projectName
        }
      });
    }
  };

  const handleStartNow = () => {
    if (invitationData) {
      startEvaluation(invitationData);
    }
  };

  const handleRetry = () => {
    setError('');
    setManualCode('');
    setInvitationData(null);
  };

  if (loading && !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">초대 코드 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              AHP 평가 시스템
            </h1>
            <p className="mt-2 text-gray-600">
              평가에 참여하신 것을 환영합니다
            </p>
          </div>

          {/* 초대 확인 성공 */}
          {invitationData && !error && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5" />
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      초대 확인 완료
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>프로젝트:</strong> {invitationData.projectName}</p>
                      <p><strong>평가자:</strong> {invitationData.evaluatorName}</p>
                      <p><strong>이메일:</strong> {invitationData.evaluatorEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  잠시 후 자동으로 평가 페이지로 이동합니다.
                  바로 시작하려면 아래 버튼을 클릭하세요.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleStartNow}
                  className="w-full"
                >
                  평가 시작하기
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  나중에 하기
                </Button>
              </div>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      초대 코드 오류
                    </h3>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleRetry}
                className="w-full"
              >
                다시 시도
              </Button>
            </div>
          )}

          {/* 수동 코드 입력 폼 */}
          {!invitationData && !error && !isValidating && (
            <form onSubmit={handleManualCodeSubmit} className="space-y-6">
              <div>
                <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-2">
                  초대 코드 입력
                </label>
                <Input
                  id="invitation-code"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="예: PRJ-2025-ABC123"
                  className="w-full"
                  autoComplete="off"
                />
                <p className="mt-2 text-sm text-gray-500">
                  프로젝트 관리자로부터 받은 초대 코드를 입력하세요.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!manualCode.trim()}
                >
                  코드 확인
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  취소
                </Button>
              </div>
            </form>
          )}

          {/* QR 코드 안내 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p>QR 코드가 있으신가요?</p>
              <p className="mt-1">
                모바일 기기의 카메라로 QR 코드를 스캔하면
                자동으로 평가 페이지로 이동합니다.
              </p>
            </div>
          </div>

          {/* 도움말 */}
          <div className="mt-6 text-center">
            <a
              href="/help/evaluator-guide"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              평가 방법 안내 →
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EvaluatorInvitationHandler;