import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import HierarchyTreeVisualization from '../common/HierarchyTreeVisualization';
import api, { CriteriaData } from '../../services/api';

interface ModelFinalizationProps {
  projectId: string;
  onFinalize: () => void;
  isReadyToFinalize: boolean;
  onNavigateToEvaluators?: () => void;
}

const ModelFinalization: React.FC<ModelFinalizationProps> = ({ 
  projectId, 
  onFinalize, 
  isReadyToFinalize,
  onNavigateToEvaluators
}) => {
  const [workshopMode, setWorkshopMode] = useState<'individual' | 'workshop'>('individual');
  const [isConfirming, setIsConfirming] = useState(false);
  const [criteria, setCriteria] = useState<CriteriaData[]>([]);
  const [alternatives, setAlternatives] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [evaluators, setEvaluators] = useState<{ id?: string; name: string; email?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        
        // 실제 프로젝트 데이터 로드
        const [criteriaResponse, alternativesResponse, evaluatorsResponse] = await Promise.all([
          api.criteria.getCriteria(projectId),
          api.alternative.getAlternatives(projectId),
          api.evaluator.getEvaluators(projectId)
        ]);

        if (!criteriaResponse.success) {
          throw new Error(criteriaResponse.error || '기준 데이터를 불러오지 못했습니다.');
        }
        if (!alternativesResponse.success) {
          throw new Error(alternativesResponse.error || '대안 데이터를 불러오지 못했습니다.');
        }
        if (!evaluatorsResponse.success) {
          throw new Error(evaluatorsResponse.error || '평가자 데이터를 불러오지 못했습니다.');
        }

        const criteriaData = criteriaResponse.data;
        const alternativesData = (alternativesResponse.data as { results?: unknown[] } | null)?.results
          ?? (Array.isArray(alternativesResponse.data) ? alternativesResponse.data : []);
        const evaluatorsData = (evaluatorsResponse.data as { results?: unknown[] } | null)?.results
          ?? (Array.isArray(evaluatorsResponse.data) ? evaluatorsResponse.data : []);

        // 배열인지 확인하고 설정
        setCriteria(Array.isArray(criteriaData) ? criteriaData : []);
        setAlternatives(Array.isArray(alternativesData) ? alternativesData : []);
        setEvaluators(Array.isArray(evaluatorsData) ? evaluatorsData : []);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '프로젝트 데이터를 불러오는 중 오류가 발생했습니다.');
        setCriteria([]);
        setAlternatives([]);
        setEvaluators([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const handleFinalize = () => {
    if (isConfirming) {
      onFinalize();
      // 모델 확정 후 평가자 관리 페이지로 자동 이동
      if (onNavigateToEvaluators) {
        setTimeout(() => {
          onNavigateToEvaluators();
        }, 1000); // 1초 후 이동하여 사용자가 확정 완료를 인지할 수 있도록 함
      }
    } else {
      setIsConfirming(true);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  const getModelSummary = () => {
    // 배열 검증
    const safeCriteria = Array.isArray(criteria) ? criteria : [];
    const safeAlternatives = Array.isArray(alternatives) ? alternatives : [];
    const safeEvaluators = Array.isArray(evaluators) ? evaluators : [];
    
    const criteriaCount = safeCriteria.length;
    const alternativesCount = safeAlternatives.length;
    const evaluatorsCount = safeEvaluators.length;
    
    // 실제 데이터 기반으로 예상 비교 횟수 계산
    const criteriaComparisons = criteriaCount > 1 ? (criteriaCount * (criteriaCount - 1)) / 2 : 0;
    const alternativeComparisons = alternativesCount > 1 ? (alternativesCount * (alternativesCount - 1)) / 2 : 0;
    const estimatedComparisons = evaluatorsCount * (criteriaComparisons + (alternativeComparisons * criteriaCount));
    
    return {
      criteria: criteriaCount,
      subCriteria: safeCriteria.filter(c => c && typeof c === 'object' && (c.level ?? 1) > 1).length,
      alternatives: alternativesCount,
      evaluators: evaluatorsCount,
      estimatedComparisons: estimatedComparisons
    };
  };

  const summary = getModelSummary();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card title="모델 구축">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">프로젝트 데이터를 불러오는 중...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Card title="2-4단계 — 모델 구축">
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">🏗️ 모델 구축 완료 단계</h4>
            <p className="text-sm text-green-700">
              모든 설정을 확인하고 모델을 확정하여 평가 단계로 진행합니다.
            </p>
          </div>

          {/* Hierarchy Tree Visualization */}
          {!loading && criteria.length > 0 && (
            <div>
              <HierarchyTreeVisualization
                nodes={criteria.map(c => ({ id: c.id ?? '', name: c.name, description: c.description, level: c.level ?? 1, weight: c.weight, parent_id: c.parent_id }))}
                title="프로젝트 최종 계층구조"
                showWeights={true}
                interactive={false}
              />
            </div>
          )}

          {/* Model Summary */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">📋 모델 요약</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">{summary.criteria}</div>
                <div className="text-sm text-blue-700">상위 기준</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-900">{summary.subCriteria}</div>
                <div className="text-sm text-indigo-700">세부 기준</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-900">{summary.alternatives}</div>
                <div className="text-sm text-purple-700">평가 대안</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900">{summary.evaluators}</div>
                <div className="text-sm text-green-700">참여 평가자</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-900">{summary.estimatedComparisons}</div>
                <div className="text-sm text-orange-700">총 평가 수</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">⏱️</div>
                <div className="text-sm text-gray-700">약 45분</div>
              </div>
            </div>
          </div>

          {/* Alternatives Summary */}
          {!loading && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">🎯 평가 대안 목록</h4>
              {alternatives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {alternatives.map((alternative, index) => (
                    <div key={alternative.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{alternative.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{alternative.description || '설명 없음'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>등록된 대안이 없습니다.</p>
                  <p className="text-sm">2-2단계에서 대안을 추가해주세요.</p>
                </div>
              )}
            </div>
          )}

          {/* Evaluation Method Selection */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">⚖️ 평가 진행 방식 선택</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="individual"
                  value="individual"
                  checked={workshopMode === 'individual'}
                  onChange={(e) => setWorkshopMode(e.target.value as 'individual')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="individual" className="block font-medium text-gray-900">
                    개별 평가 진행
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    각 평가자가 개별적으로 온라인에서 평가를 진행합니다. 평가자들은 초대 링크를 통해 
                    언제든지 접속하여 평가를 완료할 수 있습니다.
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    • 비동기적 평가 가능 • 개별 일정에 맞춰 진행 • 자동 진행률 추적
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="workshop"
                  value="workshop"
                  checked={workshopMode === 'workshop'}
                  onChange={(e) => setWorkshopMode(e.target.value as 'workshop')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="workshop" className="block font-medium text-gray-900">
                    워크숍으로 진행하기
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    관리자가 주도하는 워크숍 형태로 진행합니다. 모든 평가자가 한 자리에 모여 
                    실시간으로 토론하며 합의된 평가를 수행합니다.
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    • 실시간 토론 및 합의 • 관리자 주도 진행 • 즉석 결과 확인
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Readiness Check */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">✅ 완료 상태 확인</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">기준 계층구조 설정</span>
                <span className="text-green-600">✓ 완료</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">대안 정의</span>
                <span className="text-green-600">✓ 완료</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">평가자 배정</span>
                <span className="text-green-600">✓ 완료</span>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          {!isReadyToFinalize && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="font-medium text-orange-900 mb-2">⚠️ 아직 완료되지 않은 단계가 있습니다</h5>
              <p className="text-sm text-orange-700">
                모든 설정 단계를 완료한 후 모델을 확정할 수 있습니다.
              </p>
            </div>
          )}

          {isConfirming && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-medium text-red-900 mb-2">🚨 모델 확정 확인</h5>
              <p className="text-sm text-red-700 mb-3">
                모델을 확정하면 기준, 대안, 평가자 구성을 변경할 수 없습니다. 
                정말로 진행하시겠습니까?
              </p>
              <div className="flex space-x-3">
                <Button variant="error" onClick={handleFinalize}>
                  확정하고 평가 시작
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                  취소
                </Button>
              </div>
            </div>
          )}

          {/* Next Steps Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">📋 다음 단계 미리보기</h5>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>모델 확정 후:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>평가자들에게 자동으로 알림 발송</li>
                <li>쌍대비교 평가 인터페이스 활성화</li>
                <li>실시간 진행률 모니터링 시작</li>
                <li>일관성 검증 및 결과 분석 준비</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              평가 방식: <strong>{workshopMode === 'workshop' ? '워크숍 진행' : '개별 평가'}</strong>
            </div>
            <div className="flex space-x-3">
              {!isConfirming ? (
                <>
                  <Button variant="secondary">
                    임시 저장
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleFinalize}
                    disabled={!isReadyToFinalize}
                  >
                    모델확정
                  </Button>
                </>
              ) : (
                <div className="text-sm text-gray-600">
                  위의 확인 버튼을 클릭하여 진행하세요.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModelFinalization;