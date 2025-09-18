import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import dataService from '../../services/dataService';
import type { EvaluatorData } from '../../services/dataService';

interface Evaluator {
  id: string;
  name: string;
  email: string;
  access_key?: string;
  status: 'pending' | 'active' | 'completed';
  progress?: number;
  invited_at?: string;
  completed_at?: string;
}

interface EvaluatorDataManagerProps {
  projectId: string;
  onEvaluatorsChange?: (count: number) => void;
}

const EvaluatorDataManager: React.FC<EvaluatorDataManagerProps> = ({ 
  projectId, 
  onEvaluatorsChange 
}) => {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingEvaluator, setIsAddingEvaluator] = useState(false);
  const [newEvaluator, setNewEvaluator] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    loadEvaluators();
  }, [projectId]);

  useEffect(() => {
    if (onEvaluatorsChange) {
      onEvaluatorsChange(evaluators.length);
    }
  }, [evaluators, onEvaluatorsChange]);

  const loadEvaluators = async () => {
    try {
      setLoading(true);
      console.log(`👥 프로젝트 ${projectId}의 평가자 로드`);
      
      const evaluatorsData = await dataService.getEvaluators(projectId);
      
      // EvaluatorData를 Evaluator로 변환
      const convertedEvaluators: Evaluator[] = evaluatorsData.map(data => ({
        id: data.id!,
        name: data.name,
        email: data.email,
        access_key: data.access_key,
        status: data.status,
        progress: 0, // TODO: 실제 진행률 계산
        invited_at: undefined, // TODO: 초대 날짜
        completed_at: undefined // TODO: 완료 날짜
      }));
      
      setEvaluators(convertedEvaluators);
      console.log(`✅ ${convertedEvaluators.length}명 평가자 로드 완료`);
    } catch (error) {
      console.error('Failed to load evaluators:', error);
      setError('평가자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const validateEvaluator = (name: string, email: string): boolean => {
    if (!name.trim()) {
      setError('평가자명을 입력해주세요.');
      return false;
    }
    
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    
    // 중복 이메일 검증
    if (evaluators.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      setError('이미 등록된 이메일입니다.');
      return false;
    }
    
    return true;
  };

  const handleAddEvaluator = async () => {
    if (!validateEvaluator(newEvaluator.name, newEvaluator.email)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const evaluatorData: Omit<EvaluatorData, 'id'> = {
        project_id: projectId,
        name: newEvaluator.name.trim(),
        email: newEvaluator.email.trim(),
        status: 'pending'
      };
      
      const createdEvaluator = await dataService.addEvaluator(evaluatorData);
      
      if (createdEvaluator) {
        const newEval: Evaluator = {
          id: createdEvaluator.id!,
          name: createdEvaluator.name,
          email: createdEvaluator.email,
          access_key: createdEvaluator.access_key,
          status: createdEvaluator.status,
          progress: 0
        };
        
        setEvaluators(prev => [...prev, newEval]);
        setNewEvaluator({ name: '', email: '' });
        setIsAddingEvaluator(false);
        console.log('✅ 평가자 추가 완료:', newEval);
      }
    } catch (error) {
      console.error('Failed to add evaluator:', error);
      setError('평가자 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEvaluator = async (evaluatorId: string) => {
    if (!window.confirm('이 평가자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 샘플 데이터가 아닌 경우에만 삭제
      if (!evaluatorId.startsWith('sample-') && !evaluatorId.startsWith('new-')) {
        await dataService.removeEvaluator(evaluatorId);
      }
      
      setEvaluators(prev => prev.filter(e => e.id !== evaluatorId));
      console.log('✅ 평가자 삭제 완료:', evaluatorId);
    } catch (error) {
      console.error('Failed to remove evaluator:', error);
      setError('평가자 삭제 중 오류가 발생했습니다.');
      // 오류 발생 시도 로컬에서는 삭제
      setEvaluators(prev => prev.filter(e => e.id !== evaluatorId));
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pendingEvaluators = evaluators.filter(e => e.status === 'pending');
      
      if (pendingEvaluators.length === 0) {
        setError('초대할 평가자가 없습니다.');
        return;
      }
      
      // TODO: 실제 이메일 발송 기능 구현
      console.log('📧 평가 초대 이메일 발송:', pendingEvaluators.map(e => e.email));
      
      // 상태를 active로 변경 (시뮬레이션)
      const updatedEvaluators = evaluators.map(e => 
        e.status === 'pending' ? { ...e, status: 'active' as const, invited_at: new Date().toISOString() } : e
      );
      
      setEvaluators(updatedEvaluators);
      console.log('✅ 초대 이메일 발송 완료');
    } catch (error) {
      console.error('Failed to send invitations:', error);
      setError('초대 이메일 발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleEvaluators = async () => {
    try {
      const sampleEvaluators: Evaluator[] = [
        {
          id: 'sample-eval1',
          name: '김평가',
          email: 'kim@example.com',
          access_key: 'EVAL001',
          status: 'active',
          progress: 65
        },
        {
          id: 'sample-eval2',
          name: '이평가',
          email: 'lee@example.com',
          access_key: 'EVAL002',
          status: 'pending',
          progress: 0
        },
        {
          id: 'sample-eval3',
          name: '박평가',
          email: 'park@example.com',
          access_key: 'EVAL003',
          status: 'completed',
          progress: 100
        }
      ];
      
      setEvaluators(sampleEvaluators);
      console.log('✅ 샘플 평가자 로드 완료');
    } catch (error) {
      console.error('Failed to load sample evaluators:', error);
    }
  };

  const clearAllEvaluators = async () => {
    if (!window.confirm('모든 평가자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ 모든 평가자 삭제...');
      
      // 데이터 서비스에서 모든 평가자 삭제
      for (const evaluator of evaluators) {
        if (!evaluator.id.startsWith('sample-') && !evaluator.id.startsWith('new-')) {
          await dataService.removeEvaluator(evaluator.id);
        }
      }
      
      setEvaluators([]);
      console.log('✅ 모든 평가자 삭제 완료');
    } catch (error) {
      console.error('Failed to clear all evaluators:', error);
      // 오류 발생 시도 로컬 상태만 초기화
      setEvaluators([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">대기중</span>;
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">진행중</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">완료</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Card title="평가자 관리">
        <div className="space-y-6">
          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">👥 평가자 관리 가이드</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 평가에 참여할 전문가들을 추가하세요</li>
              <li>• 각 평가자에게 고유한 접근 키가 자동 생성됩니다</li>
              <li>• 초대 이메일을 통해 평가 참여를 요청할 수 있습니다</li>
              <li>• 실시간으로 평가 진행 상황을 모니터링할 수 있습니다</li>
            </ul>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* 평가자 목록 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">등록된 평가자 ({evaluators.length}명)</h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSampleEvaluators}
                  disabled={loading}
                >
                  샘플 로드
                </Button>
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={clearAllEvaluators}
                  disabled={loading || evaluators.length === 0}
                >
                  전체 삭제
                </Button>
                <Button
                  onClick={handleSendInvitations}
                  disabled={loading || evaluators.filter(e => e.status === 'pending').length === 0}
                  size="sm"
                >
                  초대 발송
                </Button>
                <Button
                  onClick={() => setIsAddingEvaluator(true)}
                  disabled={loading}
                  size="sm"
                >
                  평가자 추가
                </Button>
              </div>
            </div>

            {evaluators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">👥</div>
                <p>아직 등록된 평가자가 없습니다.</p>
                <p className="text-sm">평가자를 추가하여 AHP 분석을 시작하세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluators.map((evaluator, index) => (
                  <div
                    key={evaluator.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 rounded-full font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{evaluator.name}</h5>
                        <p className="text-sm text-gray-600">{evaluator.email}</p>
                        {evaluator.access_key && (
                          <p className="text-xs text-gray-500">접근 키: {evaluator.access_key}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* 진행률 표시 */}
                      {evaluator.progress !== undefined && (
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${evaluator.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{evaluator.progress}%</span>
                          </div>
                        </div>
                      )}
                      
                      {/* 상태 배지 */}
                      {getStatusBadge(evaluator.status)}
                      
                      {/* 삭제 버튼 */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEvaluator(evaluator.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 평가자 추가 폼 */}
          {isAddingEvaluator && (
            <Card title="새 평가자 추가">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="evaluator-name"
                    label="평가자명"
                    placeholder="평가자의 이름을 입력하세요"
                    value={newEvaluator.name}
                    onChange={(value) => setNewEvaluator(prev => ({ ...prev, name: value }))}
                    required
                  />
                  <Input
                    id="evaluator-email"
                    label="이메일"
                    type="email"
                    placeholder="평가자의 이메일을 입력하세요"
                    value={newEvaluator.email}
                    onChange={(value) => setNewEvaluator(prev => ({ ...prev, email: value }))}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingEvaluator(false);
                      setNewEvaluator({ name: '', email: '' });
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleAddEvaluator}
                    disabled={loading || !newEvaluator.name.trim() || !newEvaluator.email.trim()}
                  >
                    {loading ? '추가 중...' : '추가'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 통계 정보 */}
          {evaluators.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{evaluators.length}</div>
                <div className="text-sm text-gray-600">총 평가자</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-800">{evaluators.filter(e => e.status === 'pending').length}</div>
                <div className="text-sm text-yellow-600">대기중</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-800">{evaluators.filter(e => e.status === 'active').length}</div>
                <div className="text-sm text-blue-600">진행중</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-800">{evaluators.filter(e => e.status === 'completed').length}</div>
                <div className="text-sm text-green-600">완료</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EvaluatorDataManager;