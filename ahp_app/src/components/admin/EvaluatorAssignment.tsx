import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import cleanDataService from '../../services/dataService_clean';
import { EvaluatorData } from '../../services/api';
import { QRCodeSVG as QRCode } from 'qrcode.react';

interface Evaluator {
  id?: string;
  project_id: string;
  name: string;
  email: string;
  access_key?: string;
  status: 'pending' | 'active' | 'completed';
  inviteLink?: string;
  progress?: number;
  department?: string;
  experience?: string;
  code?: string;
  showQR?: boolean;
  completedAt?: string;
  totalComparisons?: number;
  completedComparisons?: number;
  demographicSurveyUrl?: string;
  demographicSurveyCompleted?: boolean;
  qrCodeData?: string;
}

interface EvaluatorAssignmentProps {
  projectId: string;
  onComplete: () => void;
  onEvaluatorsChange?: (count: number) => void;
  maxEvaluators?: number; // 최대 평가자 수 제한
  currentPlan?: string; // 현재 요금제
}

const EvaluatorAssignment: React.FC<EvaluatorAssignmentProps> = ({ 
  projectId, 
  onComplete,
  onEvaluatorsChange,
  maxEvaluators = 50, // 기본값: Standard Plan
  currentPlan = 'Standard Plan'
}) => {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };
  const [evaluationStats, setEvaluationStats] = useState<{
    total: number;
    pending: number;
    active: number;
    completed: number;
  }>({ total: 0, pending: 0, active: 0, completed: 0 });

  useEffect(() => {
    // 실제 DB에서 평가자 데이터 로드
    const loadProjectEvaluators = async () => {
      const base = window.location.href.split('?')[0].replace(/\/$/, '');
      try {
        const evaluatorsData = await cleanDataService.getEvaluators(projectId);

        // EvaluatorData를 Evaluator 인터페이스로 변환
        const convertedEvaluators: Evaluator[] = evaluatorsData.map((evaluator: EvaluatorData) => {
          const evalLink = evaluator.access_key
            ? `${base}/?project=${projectId}&key=${evaluator.access_key}`
            : undefined;

          return {
            id: evaluator.id,
            project_id: evaluator.project_id,
            name: evaluator.name,
            email: evaluator.email,
            access_key: evaluator.access_key,
            status: evaluator.status,
            progress: 0,
            code: evaluator.access_key || `EVL${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
            inviteLink: evalLink,
            demographicSurveyCompleted: false
          };
        });

        setEvaluators(convertedEvaluators);

        // 통계 업데이트
        updateEvaluationStats(convertedEvaluators);

        // 부모 컴포넌트에 평가자 수 전달
        if (onEvaluatorsChange) {
          onEvaluatorsChange(convertedEvaluators.length);
        }
      } catch (error) {
        setEvaluators([]);
        if (onEvaluatorsChange) {
          onEvaluatorsChange(0);
        }
      }
    };

    if (projectId) {
      loadProjectEvaluators();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const [newEvaluator, setNewEvaluator] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateAccessKey = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    const key = Array.from(array, byte => charset[byte % 36]).join('');
    return 'KEY_' + key;
  };

  const updateEvaluationStats = (evaluatorList: Evaluator[]) => {
    const stats = {
      total: evaluatorList.length,
      pending: evaluatorList.filter(e => e.status === 'pending').length,
      active: evaluatorList.filter(e => e.status === 'active').length,
      completed: evaluatorList.filter(e => e.status === 'completed').length
    };
    setEvaluationStats(stats);
    
    // 부모 컴포넌트에 평가자 수 업데이트
    if (onEvaluatorsChange) {
      onEvaluatorsChange(evaluatorList.length);
    }
  };

  const toggleQRCode = (evaluatorId: string) => {
    setEvaluators(prev => prev.map(e => 
      e.id === evaluatorId ? { ...e, showQR: !e.showQR } : e
    ));
  };

  const validateEvaluator = (evaluator: { name: string; email: string }): boolean => {
    const newErrors: Record<string, string> = {};

    if (!evaluator.name.trim()) {
      newErrors.name = '평가자 이름을 입력해주세요.';
    } else if (evaluator.name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다.';
    }

    if (!evaluator.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(evaluator.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    } else if (evaluators.some(e => e.email === evaluator.email)) {
      newErrors.email = '이미 등록된 이메일입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEvaluator = async () => {
    // 평가자 수 제한 체크
    if (evaluators.length >= maxEvaluators) {
      showActionMessage('error', `평가자 배정 한도(${maxEvaluators}명)에 도달했습니다. ${currentPlan}에서는 프로젝트당 최대 ${maxEvaluators}명까지 배정할 수 있습니다.`);
      return;
    }

    if (!validateEvaluator(newEvaluator)) {
      return;
    }

    try {
      const evaluatorData: Omit<EvaluatorData, 'id'> = {
        project_id: projectId,
        name: newEvaluator.name,
        email: newEvaluator.email,
        access_key: generateAccessKey(),
        status: 'pending'
      };

      const createdEvaluator = await cleanDataService.createEvaluator(evaluatorData);

      if (createdEvaluator) {
        const base = window.location.href.split('?')[0].replace(/\/$/, '');
        const evalLink = `${base}/?project=${projectId}&key=${createdEvaluator.access_key}`;

        const newEval: Evaluator = {
          id: createdEvaluator.id,
          project_id: createdEvaluator.project_id,
          name: createdEvaluator.name,
          email: createdEvaluator.email,
          access_key: createdEvaluator.access_key,
          status: createdEvaluator.status,
          progress: 0,
          code: createdEvaluator.access_key,
          inviteLink: evalLink,
          demographicSurveyCompleted: false
        };

        const updatedEvaluators = [...evaluators, newEval];
        setEvaluators(updatedEvaluators);
        setNewEvaluator({ name: '', email: '' });
        setErrors({});

        if (onEvaluatorsChange) {
          onEvaluatorsChange(updatedEvaluators.length);
        }
      } else {
        setErrors({ general: '평가자 생성에 실패했습니다.' });
      }
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : '평가자 추가 중 오류가 발생했습니다.' });
    }
  };

  const handleSendInvite = async (id: string) => {
    // 초대 상태 업데이트는 로컬에서만 처리 (백엔드에 상태 업데이트 API 없음)
    const updatedEvaluators = evaluators.map(evaluator => 
      evaluator.id === id 
        ? { ...evaluator, status: 'active' as const }
        : evaluator
    );
    setEvaluators(updatedEvaluators);
  };

  const handleDeleteEvaluator = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDeleteEvaluator = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      await cleanDataService.deleteEvaluator(id, projectId);

      const updatedEvaluators = evaluators.filter(e => e.id !== id);
      setEvaluators(updatedEvaluators);

      if (onEvaluatorsChange) {
        onEvaluatorsChange(updatedEvaluators.length);
      }
    } catch (error) {
      showActionMessage('error', '평가자 삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: Evaluator['status']) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800'
    };

    const labels = {
      pending: '대기',
      active: '진행중',
      completed: '완료'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getProgressBadge = (progress: number) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        progress === 0 ? 'bg-gray-100 text-gray-800' :
        progress < 50 ? 'bg-red-100 text-red-800' :
        progress < 100 ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {progress}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}

      <Modal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="평가자 삭제"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setPendingDeleteId(null)}>
              취소
            </Button>
            <Button variant="error" onClick={handleConfirmDeleteEvaluator}>
              삭제
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">정말로 이 평가자를 삭제하시겠습니까?</p>
      </Modal>

      <Card title="평가자 배정">
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">👥 평가자 배정 가이드</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 각 평가자에게 고유한 코드와 초대 링크가 부여됩니다</li>
              <li>• QR코드를 통해 모바일에서도 쉽게 평가에 참여할 수 있습니다</li>
              <li>• 인구통계학적 설문조사와 평가 링크가 함께 제공됩니다</li>
              <li>• 이메일을 통해 평가 참여 초대를 보낼 수 있습니다</li>
              <li>• 평가자별 진행률을 실시간으로 모니터링할 수 있습니다</li>
            </ul>
          </div>

          {/* 평가 진행 현황 통계 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{evaluationStats.total}</div>
              <div className="text-sm text-gray-500">전체 평가자</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-800">{evaluationStats.pending}</div>
              <div className="text-sm text-yellow-700">대기중</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-800">{evaluationStats.active}</div>
              <div className="text-sm text-blue-700">진행중</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-800">{evaluationStats.completed}</div>
              <div className="text-sm text-green-700">완료</div>
            </div>
          </div>

          {/* Current Evaluators List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">👤 배정된 평가자 목록</h4>

            {evaluators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 배정된 평가자가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {evaluators.map((evaluator) => (
                  <div
                    key={evaluator.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center flex-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mr-4">
                        {evaluator.code || evaluator.access_key?.substring(0, 3) || 'EVL'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="font-medium text-gray-900">{evaluator.name}</h5>
                          {getStatusBadge(evaluator.status)}
                          {getProgressBadge(evaluator.progress || 0)}
                        </div>
                        {evaluator.email && (
                          <p className="text-sm text-gray-600 mt-1">{evaluator.email}</p>
                        )}
                        {(evaluator.department || evaluator.experience) && (
                          <div className="flex items-center space-x-4 mt-1">
                            {evaluator.department && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {evaluator.department}
                              </span>
                            )}
                            {evaluator.experience && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                경력 {evaluator.experience}
                              </span>
                            )}
                          </div>
                        )}
                        {evaluator.inviteLink && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">평가 링크:</span>
                              <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                                {evaluator.inviteLink}
                              </code>
                            </div>
                            {evaluator.demographicSurveyUrl && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">설문조사:</span>
                                <code className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-200">
                                  {evaluator.demographicSurveyUrl}
                                </code>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => window.open(evaluator.inviteLink, '_blank')}
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                              >
                                🔗 평가 시작하기
                              </button>
                              <button
                                onClick={() => navigator.clipboard.writeText(evaluator.inviteLink || '')}
                                className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                              >
                                📋 링크 복사
                              </button>
                              <button
                                onClick={() => toggleQRCode(evaluator.id ?? '')}
                                className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors"
                              >
                                {evaluator.showQR ? '🔒 QR 숨기기' : '📱 QR 보기'}
                              </button>
                            </div>
                            {evaluator.showQR && evaluator.inviteLink && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">평가 정보 QR 코드</h5>
                                  <div className="inline-block p-2 bg-white rounded border border-gray-200">
                                    <QRCode 
                                      value={JSON.stringify({
                                        evaluationUrl: evaluator.inviteLink,
                                        surveyUrl: evaluator.demographicSurveyUrl,
                                        projectId: projectId,
                                        evaluatorId: evaluator.id,
                                        accessKey: evaluator.access_key
                                      })} 
                                      size={200}
                                      level="M"
                                      includeMargin={true}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    QR 코드를 스캔하여 설문조사 후 평가 시작
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs text-blue-600">1. 인구통계학적 설문조사</p>
                                    <p className="text-xs text-green-600">2. AHP 평가 진행</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {evaluator.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSendInvite(evaluator.id ?? '')}
                        >
                          📧 초대 발송
                        </Button>
                      )}
                      <button
                        onClick={() => handleDeleteEvaluator(evaluator.id ?? '')}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Evaluator */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">➕ 새 평가자 추가</h4>
            
            {/* 에러 메시지 표시 */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">❌</span>
                  <span className="text-red-800 text-sm">{errors.general}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="evaluatorName"
                label="평가자 이름"
                placeholder="이름을 입력하세요"
                value={newEvaluator.name}
                onChange={(value) => setNewEvaluator(prev => ({ ...prev, name: value }))}
                error={errors.name}
                required
              />

              <Input
                id="evaluatorEmail"
                label="이메일"
                placeholder="email@example.com"
                value={newEvaluator.email}
                onChange={(value) => setNewEvaluator(prev => ({ ...prev, email: value }))}
                error={errors.email}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddEvaluator} variant="primary">
                평가자 추가
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{evaluators.length}</div>
                <div className="text-sm text-gray-600">총 평가자</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {evaluators.filter(e => e.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">대기중</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {evaluators.filter(e => e.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">활성 참여</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {evaluators.filter(e => e.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">평가 완료</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              {evaluators.length === 0 && (
                <span className="text-blue-600">👥 평가자 없이 연구자가 직접 테스트할 수 있습니다.</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => showActionMessage('success', '평가자 목록이 저장되었습니다.')}
              >
                저장
              </Button>
              <Button
                variant="primary"
                onClick={onComplete}
                disabled={false}
              >
                다음 단계로
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EvaluatorAssignment;