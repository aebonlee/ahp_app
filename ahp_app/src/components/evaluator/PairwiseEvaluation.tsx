import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import MatrixGrid from './MatrixGrid';
import JudgmentHelper from './JudgmentHelper';
import apiService from '../../services/apiService';

interface CriterionItem {
  id: string;
  name: string;
}

interface ComparisonItem {
  id: string;
  criteriaAId: string;
  criteriaBId: string;
  value: number;
}

interface Matrix {
  id: string;
  name: string;
  items: string[];
  values: number[][];
  completed: boolean;
  consistencyRatio?: number;
}

interface PairwiseEvaluationProps {
  projectId: string;
  projectTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

const PairwiseEvaluation: React.FC<PairwiseEvaluationProps> = ({
  projectId,
  projectTitle,
  onComplete,
  onBack
}) => {
  const [criteria, setCriteria] = useState<CriterionItem[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [evaluationId, setEvaluationId] = useState<string>('');
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [showHelper, setShowHelper] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // criteria + comparisons → 대칭 행렬 생성
  const buildMatrix = useCallback((
    criteriaList: CriterionItem[],
    compList: ComparisonItem[]
  ): Matrix => {
    const n = criteriaList.length;
    const values: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (i === j) return 1;
        const cA = criteriaList[i].id;
        const cB = criteriaList[j].id;
        const comp = compList.find(c =>
          (c.criteriaAId === cA && c.criteriaBId === cB) ||
          (c.criteriaAId === cB && c.criteriaBId === cA)
        );
        if (!comp || comp.value == null) return 1;
        return comp.criteriaAId === cA ? comp.value : 1 / comp.value;
      })
    );
    return {
      id: 'criteria',
      name: '기준 쌍대비교',
      items: criteriaList.map(c => c.name),
      values,
      completed: false,
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(false);
    try {
      // 1. 현재 사용자의 평가 조회
      const evalsRes = await apiService.get<any>(
        `/api/service/evaluations/evaluations/?project=${projectId}&page_size=10`
      );
      const evalsList: any[] = evalsRes.data?.results ?? evalsRes.data ?? [];
      const evalItem = evalsList[0];
      if (!evalItem) {
        setLoadError(true);
        return;
      }
      const evalId = String(evalItem.id);
      setEvaluationId(evalId);

      // 2. 기준 + 비교쌍 병렬 로드
      const [criteriaRes, comparisonsRes] = await Promise.allSettled([
        apiService.get<any>(`/api/service/projects/criteria/?project=${projectId}&page_size=100`),
        apiService.get<any>(`/api/service/evaluations/comparisons/?evaluation=${evalId}&page_size=100`),
      ]);

      const criteriaList: CriterionItem[] =
        criteriaRes.status === 'fulfilled'
          ? (criteriaRes.value.data?.results ?? criteriaRes.value.data ?? []).map((c: any) => ({
              id: String(c.id),
              name: c.name || c.title || `기준 ${c.id}`,
            }))
          : [];

      const compList: ComparisonItem[] =
        comparisonsRes.status === 'fulfilled'
          ? (comparisonsRes.value.data?.results ?? comparisonsRes.value.data ?? []).map((c: any) => ({
              id: String(c.id),
              criteriaAId: String(c.criteria_a),
              criteriaBId: String(c.criteria_b),
              value: c.value ?? 1,
            }))
          : [];

      setCriteria(criteriaList);
      setComparisons(compList);

      if (criteriaList.length >= 2) {
        setMatrix(buildMatrix(criteriaList, compList));
      } else {
        setLoadError(true);
      }
    } catch (error) {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, buildMatrix]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 행렬 값 변경 → 로컬 상태만 업데이트 (저장은 완료 시)
  const handleMatrixUpdate = useCallback((newValues: number[][]) => {
    setMatrix(prev => prev ? { ...prev, values: newValues } : prev);
  }, []);

  // 입력된 셀 수 기반 진행률
  const getProgressPercentage = useCallback(() => {
    if (!matrix) return 0;
    const n = matrix.items.length;
    const total = (n * (n - 1)) / 2;
    if (total === 0) return 100;
    let filled = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix.values[i][j] !== 1) filled++;
      }
    }
    return Math.round((filled / total) * 100);
  }, [matrix]);

  // 완료: 비교값 저장 → CR 계산 → onComplete 호출
  const handleComplete = async () => {
    if (!evaluationId || !matrix) return;
    setIsSaving(true);
    try {
      // 상위 삼각 비교쌍 모두 PATCH
      const patchPromises: Promise<any>[] = [];
      for (let i = 0; i < criteria.length; i++) {
        for (let j = i + 1; j < criteria.length; j++) {
          const comp = comparisons.find(c =>
            (c.criteriaAId === criteria[i].id && c.criteriaBId === criteria[j].id) ||
            (c.criteriaAId === criteria[j].id && c.criteriaBId === criteria[i].id)
          );
          if (!comp) continue;
          // comp 방향에 맞게 값 결정
          const value = comp.criteriaAId === criteria[i].id
            ? matrix.values[i][j]
            : matrix.values[j][i];
          patchPromises.push(
            apiService.patch<any>(
              `/api/service/evaluations/comparisons/${comp.id}/`,
              { value }
            )
          );
        }
      }
      await Promise.allSettled(patchPromises);

      // CR 계산 (calculate/individual)
      try {
        const crRes = await apiService.post<any>(
          '/api/service/analysis/calculate/individual/',
          { evaluation_id: evaluationId }
        );
        const cr: number = crRes?.data?.consistency_ratio ?? 0;
        setMatrix(prev => prev ? { ...prev, consistencyRatio: cr, completed: true } : prev);

        if (cr > 0.1) {
          setShowHelper(true);
          showActionMessage('error', `일관성 비율 CR=${cr.toFixed(3)} > 0.1 — 비교값을 재검토해주세요.`);
          return;
        }
      } catch {
        // CR 계산 실패 시 경고만 출력하고 완료 진행
        console.warn('CR calculation failed, proceeding without CR check.');
      }

      showActionMessage('success', '평가가 저장되었습니다.');
      setTimeout(() => onComplete(), 1000);
    } catch (error) {
      showActionMessage('error', '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── 로딩 / 에러 상태 ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-evaluator">
        <div className="page-content content-width-evaluator flex items-center justify-center" style={{ minHeight: '16rem' }}>
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-lg">평가 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !matrix) {
    return (
      <div className="page-evaluator">
        <div className="page-content content-width-evaluator">
          <div className="page-header">
            <Button variant="secondary" onClick={onBack}>← 뒤로</Button>
          </div>
          <Card className="text-center p-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              평가 데이터를 불러올 수 없습니다
            </h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              이 프로젝트에 배정된 평가가 없거나 기준이 2개 미만입니다.
            </p>
            <Button variant="secondary" onClick={loadData}>다시 시도</Button>
          </Card>
        </div>
      </div>
    );
  }

  // ─── 메인 렌더 ─────────────────────────────────────────────────
  return (
    <div className="page-evaluator">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          actionMessage.type === 'success' ? 'bg-green-100 text-green-800' :
          actionMessage.type === 'info'    ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
        }`}>
          {actionMessage.text}
        </div>
      )}

      <div className="page-content content-width-evaluator">
        <div className="page-header">
          <h1 className="page-title">단계 2 — 평가하기 / 쌍대비교</h1>
          <p className="page-subtitle">
            프로젝트: <span className="font-medium">{projectTitle}</span>
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={onBack}>
              프로젝트 선택으로
            </Button>
          </div>
        </div>

        {/* 진행률 */}
        <div className="card-enhanced p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              전체 진행률
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isSaving ? '저장 중...' : `${getProgressPercentage()}% 완료`}
            </span>
          </div>
          <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{
                width: `${getProgressPercentage()}%`,
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 행렬 영역 */}
          <div className="lg:col-span-2">
            <Card title={matrix.name}>
              <div className="space-y-4">
                <MatrixGrid
                  items={matrix.items}
                  values={matrix.values}
                  onUpdate={handleMatrixUpdate}
                />

                {/* CR 표시 */}
                {matrix.items.length >= 3 && matrix.consistencyRatio !== undefined && (
                  <div className="mt-4">
                    <div
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: matrix.consistencyRatio <= 0.1
                          ? 'var(--status-success-light)'
                          : 'var(--status-warning-light)',
                        borderColor: matrix.consistencyRatio <= 0.1
                          ? 'var(--status-success-border)'
                          : 'var(--status-warning-border)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          비일관성비율 (CR)
                        </span>
                        <span
                          className="font-semibold"
                          style={{
                            color: matrix.consistencyRatio <= 0.1
                              ? 'var(--status-success-text)'
                              : 'var(--status-warning-text)'
                          }}
                        >
                          {matrix.consistencyRatio.toFixed(3)}
                        </span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {matrix.consistencyRatio <= 0.1
                          ? '✓ 일관성이 양호합니다'
                          : '⚠ 일관성을 개선해주세요 (기준: ≤ 0.1)'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 완료 버튼 */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleComplete}
                    variant="primary"
                    size="lg"
                    disabled={isSaving}
                  >
                    {isSaving ? '저장 중...' : '평가 완료'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* 사이드 패널 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* 판단 도우미 버튼 */}
              <Card>
                <div className="text-center">
                  <button
                    onClick={() => setShowHelper(!showHelper)}
                    className="w-full p-3 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--interactive-primary-light)',
                      color: 'var(--interactive-secondary)',
                      border: '1px solid var(--interactive-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--interactive-primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--interactive-primary-light)';
                      e.currentTarget.style.color = 'var(--interactive-secondary)';
                    }}
                  >
                    <span className="text-2xl">❓</span>
                    <div className="text-sm font-medium mt-1">판단 도우미</div>
                  </button>
                </div>
              </Card>

              {showHelper && (
                <JudgmentHelper
                  currentMatrix={matrix}
                  onClose={() => setShowHelper(false)}
                />
              )}

              {/* 척도 안내 */}
              <Card title="쌍대비교 척도">
                <div className="space-y-2 text-xs">
                  {([
                    [1, '동등하게 중요'],
                    [3, '약간 더 중요'],
                    [5, '중요'],
                    [7, '매우 중요'],
                    [9, '절대적으로 중요'],
                  ] as [number, string][]).map(([v, label]) => (
                    <div key={v} className="flex justify-between">
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {v}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                  ))}
                  <div className="text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                    2, 4, 6, 8은 중간값
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairwiseEvaluation;
