import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import apiService from '../../services/apiService';

// --- 백엔드 API 응답 타입 ---

interface ProjectSummaryResponse {
  project_id: string;
  project_title: string;
  status: string;
  criteria_count: number;
  total_evaluations: number;
  completed_evaluations: number;
  average_consistency_ratio: number | null;
  is_ready_for_analysis: boolean;
}

interface WeightItem {
  criteria_id: string;
  criteria_name: string;
  weight: number;
  normalized_weight: number;
  rank: number;
}

interface GroupWeightResponse {
  project_id: string;
  evaluation_count: number;
  weights: WeightItem[];
}

interface IndividualWeightResponse {
  evaluation_id: string;
  project_id: string;
  consistency_ratio: number | null;
  is_consistent: boolean;
  weights: WeightItem[];
}

interface EvaluationItem {
  id: string;
  evaluator?: { id: string; username: string; email: string; full_name?: string };
  status: string;
  consistency_ratio?: number | null;
  created_at?: string;
  completed_at?: string;
}

// --- 내부 상태 타입 ---

interface CriteriaRank {
  id: string;
  name: string;
  score: number;
  rank: number;
}

interface IndividualResult {
  name: string;
  consistencyRatio: number | null;
  isConsistent: boolean;
  completionDate: string;
  criteriaWeights: Record<string, number>;
}

interface AHPResults {
  criteriaWeights: Record<string, number>;   // criteria_id → normalized_weight
  criteriaRanking: CriteriaRank[];            // 기준 우선순위
  consistencyRatio: number | null;            // 평균 일관성 비율
  evaluationCount: number;
  completedEvaluations: number;
  isReadyForAnalysis: boolean;
  individualResults: Record<string, IndividualResult>; // evaluation_id → 개별 결과
}

// --- Props ---

interface ResultsDataManagerProps {
  projectId: string;
  criteria: Array<{ id: string; name: string }>;
  alternatives: Array<{ id: string; name: string }>;
  evaluators: Array<{ id: string; name: string; status: string }>;
}

// ─────────────────────────────────────────────

const ResultsDataManager: React.FC<ResultsDataManagerProps> = ({
  projectId,
  criteria,
  alternatives,
}) => {
  const [results, setResults] = useState<AHPResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    'summary' | 'criteria' | 'alternatives' | 'individual' | 'sensitivity'
  >('summary');

  useEffect(() => {
    if (projectId) loadResults();
  }, [projectId]);

  // ── API 호출 함수들 ──────────────────────────────

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) 프로젝트 요약 조회
      const summaryRes = await apiService.get<ProjectSummaryResponse>(
        `/api/service/analysis/project-summary/?project_id=${projectId}`
      );
      if (summaryRes.error) {
        setError(summaryRes.error);
        return;
      }
      const summary = summaryRes.data!;

      if (!summary.is_ready_for_analysis) {
        setError('완료된 평가가 없습니다. 평가를 완료한 후 결과를 확인해주세요.');
        setResults(null);
        return;
      }

      // 2) 그룹 가중치 계산
      const groupRes = await apiService.post<GroupWeightResponse>(
        '/api/service/analysis/calculate/group/',
        { project_id: projectId }
      );
      if (groupRes.error) {
        setError(groupRes.error);
        return;
      }
      const group = groupRes.data!;

      // 3) 기준 가중치 맵 생성
      const criteriaWeights = group.weights.reduce((acc, w) => {
        acc[w.criteria_id] = w.normalized_weight;
        return acc;
      }, {} as Record<string, number>);

      // 4) 기준 우선순위 리스트 (rank 순 정렬)
      const criteriaRanking: CriteriaRank[] = [...group.weights]
        .sort((a, b) => a.rank - b.rank)
        .map((w, i) => ({
          id: w.criteria_id,
          name: w.criteria_name,
          score: w.normalized_weight,
          rank: i + 1,
        }));

      // 5) 개별 평가자 결과 조회 (실패해도 전체 로드는 계속)
      const individualResults = await loadIndividualResults(projectId);

      setResults({
        criteriaWeights,
        criteriaRanking,
        consistencyRatio: summary.average_consistency_ratio,
        evaluationCount: summary.total_evaluations,
        completedEvaluations: summary.completed_evaluations,
        isReadyForAnalysis: true,
        individualResults,
      });
    } catch (err) {
      setError('결과를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadIndividualResults = async (
    projId: string
  ): Promise<Record<string, IndividualResult>> => {
    try {
      // 완료된 평가 목록 조회
      const evalListRes = await apiService.get<{ results?: EvaluationItem[] } | EvaluationItem[]>(
        `/api/service/evaluations/evaluations/?project=${projId}&status=completed`
      );
      if (evalListRes.error || !evalListRes.data) return {};

      const rawList = evalListRes.data;
      const evalList: EvaluationItem[] = Array.isArray(rawList)
        ? rawList
        : (rawList as any).results ?? [];

      if (evalList.length === 0) return {};

      // 개별 평가마다 calculate_individual 호출
      const individualMap: Record<string, IndividualResult> = {};
      await Promise.allSettled(
        evalList.slice(0, 10).map(async (ev) => { // 최대 10개
          const res = await apiService.post<IndividualWeightResponse>(
            '/api/service/analysis/calculate/individual/',
            { evaluation_id: ev.id, project_id: projId }
          );
          if (res.data) {
            const evalName =
              ev.evaluator?.full_name ||
              ev.evaluator?.username ||
              ev.evaluator?.email ||
              `평가자 ${ev.id.slice(0, 6)}`;
            individualMap[ev.id] = {
              name: evalName,
              consistencyRatio: res.data.consistency_ratio,
              isConsistent: res.data.is_consistent,
              completionDate: ev.completed_at || ev.created_at || new Date().toISOString(),
              criteriaWeights: res.data.weights.reduce((acc, w) => {
                acc[w.criteria_id] = w.normalized_weight;
                return acc;
              }, {} as Record<string, number>),
            };
          }
        })
      );
      return individualMap;
    } catch {
      return {};
    }
  };

  const handleCalculateResults = async () => {
    try {
      setCalculating(true);
      setError(null);

      const res = await apiService.post<GroupWeightResponse>(
        '/api/service/analysis/calculate/group/',
        { project_id: projectId }
      );
      if (res.error) {
        setError(res.error);
        return;
      }
      // 재계산 후 전체 결과 새로고침
      await loadResults();
    } catch {
      setError('결과 계산 중 오류가 발생했습니다.');
    } finally {
      setCalculating(false);
    }
  };

  // ── 내보내기 함수들 (로컬 처리 유지) ────────────────

  const handleExportToExcel = async () => {
    if (!results) return;
    try {
      // 백엔드 Excel 내보내기 우선 시도
      const exportRes = await apiService.get(
        `/api/service/export/excel/?project=${projectId}`
      );
      if (!exportRes.error && exportRes.data) {
        // 서버에서 받은 경우 처리 (향후 blob 응답 지원 시 활성화)
      }
    } catch { /* fallback to CSV */ }

    // CSV fallback
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AHP_Results_${projectId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateCSVContent = (): string => {
    if (!results) return '';
    let csv = 'AHP 분석 결과\n\n';
    csv += '기준 가중치\n기준,가중치,순위\n';
    results.criteriaRanking.forEach(item => {
      csv += `${item.name},${item.score.toFixed(4)},${item.rank}\n`;
    });
    csv += `\n일관성 비율,${results.consistencyRatio !== null ? (results.consistencyRatio * 100).toFixed(2) + '%' : 'N/A'}\n`;
    csv += `완료된 평가 수,${results.completedEvaluations}\n`;
    return csv;
  };

  const handleGenerateReport = () => {
    if (!results) return;
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(generateHTMLReport());
      reportWindow.document.close();
    }
  };

  const generateHTMLReport = (): string => {
    if (!results) return '';
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <title>AHP 분석 보고서</title>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    h2 { color: #1e40af; margin-top: 32px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #d1d5db; padding: 10px 14px; text-align: left; }
    th { background: #eff6ff; font-weight: 600; }
    tr:nth-child(even) { background: #f9fafb; }
    .badge-ok { background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-size: 0.85em; }
    .badge-warn { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 0.85em; }
    .footer { margin-top: 48px; color: #9ca3af; font-size: 0.85em; }
  </style>
</head>
<body>
  <h1>AHP 분석 보고서</h1>
  <p>생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

  <h2>1. 분석 개요</h2>
  <table>
    <tr><th>항목</th><th>값</th></tr>
    <tr><td>평가 기준 수</td><td>${results.criteriaRanking.length}개</td></tr>
    <tr><td>대안 수</td><td>${alternatives.length}개</td></tr>
    <tr><td>완료된 평가 수</td><td>${results.completedEvaluations}/${results.evaluationCount}</td></tr>
    <tr><td>평균 일관성 비율 (CR)</td><td>${results.consistencyRatio !== null ? (results.consistencyRatio * 100).toFixed(2) + '%' : 'N/A'}
      ${results.consistencyRatio !== null
        ? results.consistencyRatio <= 0.1
          ? ' <span class="badge-ok">양호</span>'
          : ' <span class="badge-warn">재검토 필요</span>'
        : ''}
    </td></tr>
  </table>

  <h2>2. 기준 우선순위</h2>
  <table>
    <tr><th>순위</th><th>기준</th><th>가중치</th><th>비율</th></tr>
    ${results.criteriaRanking.map(item => `
    <tr>
      <td>${item.rank}</td>
      <td>${item.name}</td>
      <td>${item.score.toFixed(4)}</td>
      <td>${(item.score * 100).toFixed(1)}%</td>
    </tr>`).join('')}
  </table>

  ${Object.keys(results.individualResults).length > 0 ? `
  <h2>3. 평가자별 일관성</h2>
  <table>
    <tr><th>평가자</th><th>일관성 비율</th><th>평가 상태</th></tr>
    ${Object.values(results.individualResults).map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.consistencyRatio !== null ? (r.consistencyRatio * 100).toFixed(2) + '%' : 'N/A'}</td>
      <td>${r.isConsistent ? '<span class="badge-ok">일관성 양호</span>' : '<span class="badge-warn">재검토 필요</span>'}</td>
    </tr>`).join('')}
  </table>` : ''}

  <div class="footer">
    <p>본 보고서는 AHP(Analytic Hierarchy Process) 분석 플랫폼에서 자동 생성되었습니다.</p>
  </div>
</body>
</html>`;
  };

  // ── 유틸 ────────────────────────────────────────

  const getConsistencyStatus = (cr: number | null) => {
    if (cr === null) return { color: 'text-gray-500', text: '데이터 없음', bg: 'bg-gray-50' };
    if (cr <= 0.05) return { color: 'text-green-600', text: '매우 양호', bg: 'bg-green-50' };
    if (cr <= 0.1)  return { color: 'text-blue-600',  text: '양호',      bg: 'bg-blue-50'  };
    if (cr <= 0.15) return { color: 'text-yellow-600', text: '보통',     bg: 'bg-yellow-50' };
    return { color: 'text-red-600', text: '재검토 필요', bg: 'bg-red-50' };
  };

  const crStatus = getConsistencyStatus(results?.consistencyRatio ?? null);

  // ── 렌더링 ──────────────────────────────────────

  if (loading && !results) {
    return (
      <Card title="결과 분석">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">결과를 로드하고 있습니다...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="결과 분석 및 보고서">
        <div className="space-y-6">

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: 'summary',      name: '요약',       icon: '📊' },
                { id: 'criteria',     name: '기준 분석',   icon: '📋' },
                { id: 'alternatives', name: '대안 분석',   icon: '🎯' },
                { id: 'individual',   name: '개별 결과',   icon: '👤' },
                { id: 'sensitivity',  name: '민감도 분석', icon: '📈' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as 'summary' | 'criteria' | 'alternatives' | 'individual' | 'sensitivity')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-between items-center">
            <Button onClick={handleCalculateResults} disabled={loading || calculating}>
              {calculating ? '계산 중...' : '결과 재계산'}
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleExportToExcel}
                disabled={loading || !results}
              >
                📊 CSV 내보내기
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateReport}
                disabled={loading || !results}
              >
                📄 보고서 생성
              </Button>
            </div>
          </div>

          {results ? (
            <div className="space-y-6">

              {/* ── 요약 탭 ── */}
              {selectedTab === 'summary' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">분석 요약</h3>

                  {/* 상태 카드 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`rounded-lg p-4 ${crStatus.bg}`}>
                      <div className="text-2xl font-bold">
                        {results.consistencyRatio !== null
                          ? `${(results.consistencyRatio * 100).toFixed(2)}%`
                          : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">평균 일관성 비율</div>
                      <div className={`text-sm font-medium ${crStatus.color}`}>{crStatus.text}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-800">{criteria.length}</div>
                      <div className="text-sm text-blue-600">평가 기준 수</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-800">
                        {results.completedEvaluations}/{results.evaluationCount}
                      </div>
                      <div className="text-sm text-purple-600">완료된 평가</div>
                    </div>
                  </div>

                  {/* 기준 우선순위 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🏆 기준 우선순위</h4>
                    <div className="space-y-2">
                      {results.criteriaRanking.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            index === 0
                              ? 'bg-yellow-50 border-2 border-yellow-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {item.rank}
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${item.score * 100}%` }}
                              />
                            </div>
                            <span className="text-lg font-semibold w-14 text-right">
                              {(item.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── 기준 분석 탭 ── */}
              {selectedTab === 'criteria' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">기준별 가중치 분석</h3>
                  <div className="space-y-3">
                    {results.criteriaRanking.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="ml-2 text-xs text-gray-400">순위 {item.rank}위</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-40 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${item.score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-14 text-right">
                            {(item.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * 가중치는 완료된 평가 {results.completedEvaluations}건의 기하 평균으로 집계됩니다.
                  </div>
                </div>
              )}

              {/* ── 대안 분석 탭 ── */}
              {selectedTab === 'alternatives' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">대안별 상세 분석</h3>
                  {alternatives.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-3">🎯</div>
                      <p>등록된 대안이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">ℹ️</span>
                        <div>
                          <h4 className="font-semibold text-blue-900">대안 비교 평가가 필요합니다</h4>
                          <p className="text-sm text-blue-800 mt-1">
                            대안의 최종 점수를 계산하려면 각 기준에 대해 대안들 간 쌍대비교 평가를 완료해야 합니다.
                          </p>
                          <div className="mt-3">
                            <p className="text-sm text-blue-700 font-medium">등록된 대안:</p>
                            <ul className="mt-1 space-y-1">
                              {alternatives.map(alt => (
                                <li key={alt.id} className="text-sm text-blue-800">
                                  • {alt.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 개별 결과 탭 ── */}
              {selectedTab === 'individual' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">평가자별 개별 결과</h3>
                  {Object.keys(results.individualResults).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-3">👤</div>
                      <p>개별 평가 결과가 없습니다.</p>
                      <p className="text-sm mt-1">평가자가 평가를 완료하면 여기에 표시됩니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(results.individualResults).map(([evalId, result]) => {
                        const indCrStatus = getConsistencyStatus(result.consistencyRatio);
                        return (
                          <div key={evalId} className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="font-semibold text-gray-900 mb-3">{result.name}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">일관성 비율:</span>
                                <span className={`font-medium ${indCrStatus.color}`}>
                                  {result.consistencyRatio !== null
                                    ? `${(result.consistencyRatio * 100).toFixed(2)}%`
                                    : 'N/A'}
                                  {' '}({indCrStatus.text})
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">완료일:</span>
                                <span>{new Date(result.completionDate).toLocaleDateString('ko-KR')}</span>
                              </div>
                              {Object.keys(result.criteriaWeights).length > 0 && (
                                <div className="mt-3">
                                  <p className="text-gray-600 mb-1">기준 가중치:</p>
                                  <div className="space-y-1">
                                    {criteria
                                      .filter(c => c.id in result.criteriaWeights)
                                      .map(c => (
                                        <div key={c.id} className="flex justify-between text-xs">
                                          <span className="text-gray-500">{c.name}</span>
                                          <span className="font-medium">
                                            {((result.criteriaWeights[c.id] ?? 0) * 100).toFixed(1)}%
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── 민감도 분석 탭 ── */}
              {selectedTab === 'sensitivity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">민감도 분석</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      민감도 분석은 기준의 가중치 변화에 따른 대안 순위의 변화를 분석합니다.
                      이 기능은 향후 업데이트에서 제공될 예정입니다.
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            !error && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 mb-4">분석 결과가 없습니다.</p>
                <p className="text-sm text-gray-500">평가가 완료된 후 결과를 확인할 수 있습니다.</p>
              </div>
            )
          )}

        </div>
      </Card>
    </div>
  );
};

export default ResultsDataManager;
