import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import apiService from '../../services/api';

interface EvaluationProgress {
  evaluatorId: string;
  evaluatorName: string;
  completionRate: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  lastActivity: string;
}

interface ResultRanking {
  id: string;
  name: string;
  priority: number;
  rank: number;
  type: 'criterion' | 'alternative';
}

interface ConsistencyData {
  evaluatorId: string;
  evaluatorName: string;
  consistencyRatio: number;
  isConsistent: boolean;
}

interface ResultsAnalysisProps {
  projectId: string;
  evaluationMode: 'practical' | 'theoretical' | 'direct_input';
}

const ResultsAnalysis: React.FC<ResultsAnalysisProps> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'progress' | 'ranking' | 'consistency' | 'detailed'>('progress');
  const [viewMode, setViewMode] = useState<'distributive' | 'ideal'>('distributive');
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);
  const actionMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    if (actionMessageTimerRef.current) clearTimeout(actionMessageTimerRef.current);
    setActionMessage({type, text});
    actionMessageTimerRef.current = setTimeout(() => setActionMessage(null), 3000);
  };

  useEffect(() => {
    return () => { if (actionMessageTimerRef.current) clearTimeout(actionMessageTimerRef.current); };
  }, []);
  const [evaluationProgress, setEvaluationProgress] = useState<EvaluationProgress[]>([]);
  const [criteriaRanking, setCriteriaRanking] = useState<ResultRanking[]>([]);
  const [consistencyData, setConsistencyData] = useState<ConsistencyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [summaryReady, setSummaryReady] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [evalsRes, summaryRes] = await Promise.allSettled([
        apiService.get<unknown>(`/api/service/evaluations/evaluations/?project=${projectId}&page_size=100`),
        apiService.get<unknown>(`/api/service/analysis/project-summary/?project_id=${projectId}`),
      ]);

      type RawEval = {
        id: string;
        evaluator_name?: string;
        evaluator_username?: string;
        progress?: number;
        status?: string;
        updated_at?: string;
        consistency_ratio?: number | null;
        is_consistent?: boolean;
      };
      type RawWeight = { criteria_id: string; criteria_name: string; normalized_weight: number };
      type SummaryData = { is_ready_for_analysis?: boolean };
      type GroupData = { weights?: RawWeight[] };

      // 평가자 목록
      if (evalsRes.status === 'fulfilled' && evalsRes.value?.data) {
        const rawData = evalsRes.value.data as { results?: RawEval[] } | RawEval[];
        const evals: RawEval[] = (Array.isArray(rawData) ? rawData : (rawData as { results?: RawEval[] }).results) ?? [];
        const progress: EvaluationProgress[] = evals.map((ev) => ({
          evaluatorId: ev.id,
          evaluatorName: ev.evaluator_name || ev.evaluator_username || '평가자',
          completionRate: Math.round(ev.progress ?? 0),
          status: ev.status === 'in_progress' ? 'in_progress'
                : ev.status === 'completed' ? 'completed'
                : ev.status === 'expired' ? 'expired'
                : 'not_started',
          lastActivity: ev.updated_at ? new Date(ev.updated_at).toLocaleDateString('ko-KR') : '-',
        }));
        setEvaluationProgress(progress);

        // 일관성 데이터
        const crData: ConsistencyData[] = evals
          .filter((ev) => ev.consistency_ratio != null)
          .map((ev) => ({
            evaluatorId: ev.id,
            evaluatorName: ev.evaluator_name || ev.evaluator_username || '평가자',
            consistencyRatio: ev.consistency_ratio ?? 0,
            isConsistent: ev.is_consistent ?? false,
          }));
        setConsistencyData(crData);
      }

      // 완료 평가 있으면 기준 가중치 계산
      if (summaryRes.status === 'fulfilled' && (summaryRes.value?.data as SummaryData)?.is_ready_for_analysis) {
        setSummaryReady(true);
        const groupRes = await apiService.post<unknown>('/api/service/analysis/calculate/group/', { project_id: projectId });
        if ((groupRes?.data as GroupData)?.weights) {
          const weights: RawWeight[] = (groupRes.data as GroupData).weights!;
          const sorted = [...weights].sort((a, b) => b.normalized_weight - a.normalized_weight);
          const criteria: ResultRanking[] = sorted.map((w, idx) => ({
            id: w.criteria_id,
            name: w.criteria_name,
            priority: w.normalized_weight,
            rank: idx + 1,
            type: 'criterion',
          }));
          setCriteriaRanking(criteria);
        }
      } else {
        setSummaryReady(false);
      }
    } catch (_err) {
      showActionMessage('error', '분석 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      case 'not_started': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '평가완료';
      case 'in_progress': return '평가중';
      case 'not_started': return '시작안함';
      default: return '알수없음';
    }
  };

  const exportToCSV = () => {
    const rows = [
      ['평가자', '진행률', '상태', '마지막활동', 'CR', '일관성'],
      ...evaluationProgress.map(ep => {
        const cr = consistencyData.find(c => c.evaluatorId === ep.evaluatorId);
        return [
          ep.evaluatorName, `${ep.completionRate}%`, ep.status,
          ep.lastActivity,
          cr ? cr.consistencyRatio.toFixed(3) : '-',
          cr ? (cr.isConsistent ? '일관성있음' : '재검토필요') : '-',
        ];
      }),
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ahp_results_${projectId}.csv`;
    a.click();
    showActionMessage('success', 'CSV 파일로 저장되었습니다.');
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
      {/* 제어 패널 */}
      <Card title="결과 분석">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex space-x-2">
            <Button
              variant={activeView === 'progress' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('progress')}
              size="sm"
            >
              평가현황
            </Button>
            <Button
              variant={activeView === 'ranking' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('ranking')}
              size="sm"
            >
              통합결과
            </Button>
            <Button
              variant={activeView === 'consistency' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('consistency')}
              size="sm"
            >
              일관성 분석
            </Button>
            <Button
              variant={activeView === 'detailed' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('detailed')}
              size="sm"
            >
              세부내용
            </Button>
          </div>

          {activeView === 'ranking' && (
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'distributive' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('distributive')}
                size="sm"
              >
                분배적 모드
              </Button>
              <Button
                variant={viewMode === 'ideal' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('ideal')}
                size="sm"
              >
                이상적 모드
              </Button>
            </div>
          )}

          <Button
            onClick={exportToCSV}
            variant="secondary"
            size="sm"
          >
            CSV 저장
          </Button>
          <Button
            onClick={loadData}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            {loading ? '로딩...' : '새로고침'}
          </Button>
        </div>
      </Card>

      {/* 평가 진행 상황 */}
      {activeView === 'progress' && (
        <Card title="평가 진행 상황">
          {loading ? (
            <div className="text-center py-8 text-gray-500">데이터 로딩 중...</div>
          ) : evaluationProgress.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>배정된 평가자가 없습니다.</p>
              <p className="text-sm mt-2">평가자를 배정하면 진행 현황이 표시됩니다.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">평가자</th>
                  <th className="px-4 py-2 text-center">진행률</th>
                  <th className="px-4 py-2 text-center">상태</th>
                  <th className="px-4 py-2 text-center">마지막 활동</th>
                  <th className="px-4 py-2 text-center">진행도</th>
                </tr>
              </thead>
              <tbody>
                {evaluationProgress.map((evaluator) => (
                  <tr key={evaluator.evaluatorId} className="border-t">
                    <td className="px-4 py-2">{evaluator.evaluatorName}</td>
                    <td className="px-4 py-2 text-center">{evaluator.completionRate}%</td>
                    <td className={`px-4 py-2 text-center ${getStatusColor(evaluator.status)}`}>
                      {getStatusText(evaluator.status)}
                    </td>
                    <td className="px-4 py-2 text-center">{evaluator.lastActivity}</td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${evaluator.completionRate}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Card>
      )}

      {/* 통합 결과 순위 */}
      {activeView === 'ranking' && (
        <Card title={`기준 통합결과 순위 (${viewMode === 'distributive' ? '분배적' : '이상적'} 모드)`}>
          {!summaryReady ? (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium">완료된 평가가 없습니다.</p>
              <p className="text-sm mt-2">평가자가 평가를 완료하면 기준 가중치가 표시됩니다.</p>
            </div>
          ) : criteriaRanking.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>기준 가중치를 계산 중입니다...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {criteriaRanking.map((criterion) => {
                const maxPriority = criteriaRanking[0]?.priority ?? 1;
                return (
                  <div key={criterion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-8">#{criterion.rank}</span>
                      <span className="font-medium">{criterion.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(criterion.priority / maxPriority) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">
                        {(criterion.priority * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* 일관성 분석 */}
      {activeView === 'consistency' && (
        <Card title="일관성 비율 분석">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>일관성 비율(CR) 기준:</strong> 0.1 이하는 일관성 있음, 0.1 초과는 재검토 필요
            </p>
          </div>
          {consistencyData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>완료된 평가가 없어 일관성 데이터가 없습니다.</p>
            </div>
          ) : (
          <div className="space-y-3">
            {consistencyData.map((data) => (
              <div key={data.evaluatorId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{data.evaluatorName}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono">{data.consistencyRatio.toFixed(3)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    data.isConsistent
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {data.isConsistent ? '일관성 있음' : '재검토 필요'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}
        </Card>
      )}

      {/* 세부 내용 */}
      {activeView === 'detailed' && (
        <Card title="세부 분석 내용">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => showActionMessage('info', '기준별 세부 분석')}>
                기준별 평가값 및 중요도
              </Button>
              <Button variant="secondary" onClick={() => showActionMessage('info', '대안별 세부 분석')}>
                대안별 평가값 및 중요도
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => showActionMessage('info', '민감도 분석')}>
                민감도 분석
              </Button>
              <Button variant="secondary" onClick={() => showActionMessage('info', '파레토 최적화')}>
                파레토 최적화 결과
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 하단 알림 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">
          <strong>중요:</strong> 계정 및 프로젝트에 대한 모든 내용은 사용 종료 7일 후에 삭제됩니다. 
          저장을 원하시면 'Excel 저장' 버튼을 클릭하여 파일로 저장하여 보관하시기 바랍니다.
        </p>
      </div>
    </div>
  );
};

export default ResultsAnalysis;