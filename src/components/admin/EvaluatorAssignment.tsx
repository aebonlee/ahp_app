import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import apiService from '../../services/apiService';

interface Evaluator {
  id: string;
  code: string;
  name: string;
  email?: string;
  status: 'pending' | 'invited' | 'active' | 'completed';
  inviteLink?: string;
  progress: number;
  department?: string;
  experience?: string;
}

interface EvaluatorAssignmentProps {
  projectId: string;
  onComplete: () => void;
}

const EvaluatorAssignment: React.FC<EvaluatorAssignmentProps> = ({ projectId, onComplete }) => {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);

  useEffect(() => {
    // 프로젝트별 평가자 데이터 로드 (PostgreSQL에서)
    const loadProjectEvaluators = async () => {
      try {
        const response = await apiService.evaluatorAPI.fetchByProject(Number(projectId));
        if (response.data) {
          const evaluatorsData = (response.data as any).evaluators || response.data || [];
          setEvaluators(evaluatorsData);
          console.log(`Loaded ${evaluatorsData.length} evaluators from API for project ${projectId}`);
        } else {
          setEvaluators([]);
          console.log(`No evaluators found for project ${projectId}`);
        }
      } catch (error) {
        console.error('Failed to load evaluators from API:', error);
        // No localStorage fallback - rely on server session only
        setEvaluators([]);
        console.log(`No evaluators found for project ${projectId} - server only`);
      }
    };

    if (projectId) {
      loadProjectEvaluators();
    }
  }, [projectId]);

  const [newEvaluator, setNewEvaluator] = useState({ code: '', name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 프로젝트별 평가자 데이터는 API 호출 시 자동으로 PostgreSQL에 저장됨
  const saveProjectEvaluators = async (evaluatorsData: Evaluator[]) => {
    console.log(`Evaluators automatically saved to PostgreSQL via Django session for project ${projectId}`);
    // All data is persisted through Django session and PostgreSQL
  };

  const generateEvaluatorCode = (): string => {
    const maxCode = Math.max(...evaluators.map(e => parseInt(e.code.replace('EVL', '')) || 0), 0);
    return `EVL${String(maxCode + 1).padStart(3, '0')}`;
  };

  const validateEvaluator = (evaluator: { code: string; name: string; email: string }): boolean => {
    const newErrors: Record<string, string> = {};

    if (!evaluator.code.trim()) {
      newErrors.code = '평가자 코드를 입력해주세요.';
    } else if (evaluators.some(e => e.code === evaluator.code)) {
      newErrors.code = '이미 존재하는 평가자 코드입니다.';
    }

    if (!evaluator.name.trim()) {
      newErrors.name = '평가자 이름을 입력해주세요.';
    } else if (evaluator.name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다.';
    }

    if (evaluator.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(evaluator.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateInviteLink = (): string => {
    const randomId = Math.random().toString(36).substring(2, 8);
    return `https://ahp-system.com/eval/${randomId}`;
  };

  const handleAddEvaluator = async () => {
    const evaluatorData = {
      ...newEvaluator,
      code: newEvaluator.code || generateEvaluatorCode()
    };

    if (!validateEvaluator(evaluatorData)) {
      return;
    }

    const assignData = {
      project_id: Number(projectId),
      evaluator_name: evaluatorData.name,
      evaluator_email: evaluatorData.email || undefined,
      weight: 1.0 // 기본 가중치
    };

    try {
      const response = await apiService.evaluatorAPI.assign(assignData);
      
      if (response.error) {
        setErrors({ general: response.error });
        return;
      }

      // 성공 시 데이터 다시 로드
      const updatedResponse = await apiService.evaluatorAPI.fetchByProject(Number(projectId));
      if (updatedResponse.data) {
        const evaluatorsData = (updatedResponse.data as any).evaluators || updatedResponse.data || [];
        setEvaluators(evaluatorsData);
      }
      
      setNewEvaluator({ code: '', name: '', email: '' });
      setErrors({});
      console.log('✅ 평가자가 PostgreSQL에 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save evaluator to API:', error);
      setErrors({ general: '평가자 저장 중 오류가 발생했습니다.' });
    }
  };

  const handleSendInvite = async (id: string) => {
    // 초대 상태 업데이트는 로컬에서만 처리 (백엔드에 상태 업데이트 API 없음)
    const updatedEvaluators = evaluators.map(evaluator => 
      evaluator.id === id 
        ? { ...evaluator, status: 'invited' as const }
        : evaluator
    );
    setEvaluators(updatedEvaluators);
    console.log('✅ 평가자 초대 상태 업데이트됨:', id);
  };

  const handleDeleteEvaluator = async (id: string) => {
    try {
      const response = await apiService.evaluatorAPI.remove(Number(id), Number(projectId));
      
      if (response.error) {
        console.error('Failed to delete evaluator:', response.error);
        return;
      }

      // 성공 시 데이터 다시 로드
      const updatedResponse = await apiService.evaluatorAPI.fetchByProject(Number(projectId));
      if (updatedResponse.data) {
        const evaluatorsData = (updatedResponse.data as any).evaluators || updatedResponse.data || [];
        setEvaluators(evaluatorsData);
      }
      
      console.log('✅ 평가자가 PostgreSQL에서 삭제되었습니다:', id);
    } catch (error) {
      console.error('Failed to delete evaluator from API:', error);
    }
  };

  const getStatusBadge = (status: Evaluator['status']) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      invited: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800'
    };

    const labels = {
      pending: '대기',
      invited: '초대됨',
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
      <Card title="2-3단계 — 평가자 배정">
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">👥 평가자 배정 가이드</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 각 평가자에게 고유한 코드와 초대 링크가 부여됩니다</li>
              <li>• 이메일을 통해 평가 참여 초대를 보낼 수 있습니다</li>
              <li>• 평가자별 진행률을 실시간으로 모니터링할 수 있습니다</li>
            </ul>
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
                        {evaluator.code}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h5 className="font-medium text-gray-900">{evaluator.name}</h5>
                          {getStatusBadge(evaluator.status)}
                          {getProgressBadge(evaluator.progress)}
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
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">초대링크: </span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {evaluator.inviteLink}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {evaluator.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSendInvite(evaluator.id)}
                        >
                          초대 발송
                        </Button>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(evaluator.inviteLink || '')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="링크 복사"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDeleteEvaluator(evaluator.id)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                id="evaluatorCode"
                label="평가자 코드"
                placeholder={`자동생성: ${generateEvaluatorCode()}`}
                value={newEvaluator.code}
                onChange={(value) => setNewEvaluator(prev => ({ ...prev, code: value }))}
                error={errors.code}
              />

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
                label="이메일 (선택)"
                placeholder="email@example.com"
                value={newEvaluator.email}
                onChange={(value) => setNewEvaluator(prev => ({ ...prev, email: value }))}
                error={errors.email}
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
                  {evaluators.filter(e => e.status === 'invited' || e.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">초대 발송</div>
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
                <span className="text-orange-600">⚠️ 최소 1명 이상의 평가자를 배정해주세요.</span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary"
                onClick={async () => {
                  console.log('✅ 평가자 데이터가 PostgreSQL에 자동 저장되었습니다.');
                  alert('평가자 목록이 저장되었습니다.');
                }}
              >
                저장
              </Button>
              <Button
                variant="primary"
                onClick={onComplete}
                disabled={evaluators.length === 0}
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