import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import apiService from '../../services/apiService';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  level: number;
  parent_id?: string | null;
}

interface EvaluationItem {
  id: string;
  evaluator_name: string;
  evaluator_username: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  consistency_ratio: number | null;
  is_consistent: boolean | null;
}

interface ProjectCompletionProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
  onProjectStatusChange: (status: 'terminated' | 'completed') => void;
  criteriaCount?: number;
  alternativesCount?: number;
  evaluatorsCount?: number;
}

interface ProjectSummary {
  totalCriteria: number;
  totalEvaluators: number;
  completedEvaluators: number;
  activeEvaluators: number;
  pendingEvaluators: number;
  completionRate: number;
  avgConsistencyRatio: number | null;
  createdDate: string;
  lastModified: string;
}

const ProjectCompletion: React.FC<ProjectCompletionProps> = ({
  projectId,
  projectTitle,
  onBack,
  onProjectStatusChange,
  criteriaCount = 0,
  evaluatorsCount = 0,
}) => {
  const [selectedAction, setSelectedAction] = useState<
    'test' | 'sendEmail' | 'terminate' | 'complete' | 'lock' | 'export' | null
  >(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'both'>('both');
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [criteriaData, setCriteriaData] = useState<Criterion[]>([]);
  const [evaluationsData, setEvaluationsData] = useState<EvaluationItem[]>([]);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showActionMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const loadProjectSummary = useCallback(async () => {
    setLoading(true);
    try {
      const [projectRes, criteriaRes, evalsRes] = await Promise.allSettled([
        apiService.get(`/api/service/projects/projects/${projectId}/`),
        apiService.get(`/api/service/projects/criteria/?project=${projectId}&page_size=200`),
        apiService.get(`/api/service/evaluations/evaluations/?project=${projectId}&page_size=200`),
      ]);

      // 기준 처리
      if (criteriaRes.status === 'fulfilled') {
        const criteriaData = criteriaRes.value.data as Criterion[] | { results?: Criterion[]; count?: number };
        const list: Criterion[] = Array.isArray(criteriaData) ? criteriaData : (criteriaData.results ?? []);
        setCriteriaData(
          list.map((c) => ({
            id: String(c.id),
            name: c.name ?? '',
            description: c.description,
            level: c.level ?? 1,
            parent_id: c.parent_id ?? null,
          }))
        );
      }

      // 평가 처리
      let evals: EvaluationItem[] = [];
      if (evalsRes.status === 'fulfilled') {
        const evalsData = evalsRes.value.data as EvaluationItem[] | { results?: EvaluationItem[] };
        const list: EvaluationItem[] = Array.isArray(evalsData) ? evalsData : (evalsData.results ?? []);
        evals = list.map((e) => ({
          id: String(e.id),
          evaluator_name: e.evaluator_name || e.evaluator_username || '알 수 없음',
          evaluator_username: e.evaluator_username ?? '',
          status: e.status ?? 'pending',
          progress: e.progress ?? 0,
          consistency_ratio: e.consistency_ratio ?? null,
          is_consistent: e.is_consistent ?? null,
        }));
        setEvaluationsData(evals);
      }

      // 요약 계산
      const critCount =
        criteriaRes.status === 'fulfilled'
          ? (() => {
              const d = criteriaRes.value.data as Criterion[] | { count?: number; results?: Criterion[] };
              return Array.isArray(d) ? d.length : (d.count ?? d.results?.length ?? 0);
            })()
          : criteriaCount;

      const completed = evals.filter((e) => e.status === 'completed');
      const active = evals.filter((e) => e.status === 'in_progress');
      const pending = evals.filter((e) => e.status === 'pending' || e.status === 'cancelled');
      const completionRate =
        evals.length > 0 ? Math.round((completed.length / evals.length) * 100) : 0;

      const crs = completed
        .map((e) => e.consistency_ratio)
        .filter((cr): cr is number => cr !== null);
      const avgCR = crs.length > 0 ? crs.reduce((a, b) => a + b, 0) / crs.length : null;

      // 프로젝트 날짜
      let createdDate = new Date().toLocaleDateString('ko-KR');
      let lastModified = new Date().toLocaleDateString('ko-KR');
      if (projectRes.status === 'fulfilled') {
        const proj = projectRes.value.data as { created_at?: string; updated_at?: string };
        if (proj.created_at) createdDate = new Date(proj.created_at).toLocaleDateString('ko-KR');
        if (proj.updated_at) lastModified = new Date(proj.updated_at).toLocaleDateString('ko-KR');
      }

      setProjectSummary({
        totalCriteria: critCount,
        totalEvaluators: evals.length || evaluatorsCount,
        completedEvaluators: completed.length,
        activeEvaluators: active.length,
        pendingEvaluators: pending.length,
        completionRate,
        avgConsistencyRatio: avgCR,
        createdDate,
        lastModified,
      });
    } catch (error) {
      setProjectSummary({
        totalCriteria: criteriaCount,
        totalEvaluators: evaluatorsCount,
        completedEvaluators: 0,
        activeEvaluators: 0,
        pendingEvaluators: evaluatorsCount,
        completionRate: 0,
        avgConsistencyRatio: null,
        createdDate: new Date().toLocaleDateString('ko-KR'),
        lastModified: new Date().toLocaleDateString('ko-KR'),
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, criteriaCount, evaluatorsCount]);

  useEffect(() => {
    loadProjectSummary();
  }, [loadProjectSummary]);

  // ── 프로젝트 상태 업데이트 ───────────────────────────────────────
  const updateProjectStatus = async (status: 'completed' | 'archived') => {
    const payload: any = { status };
    if (status === 'completed') payload.workflow_stage = 'completed';
    const res = await apiService.patch(`/api/service/projects/projects/${projectId}/`, payload);
    return res;
  };

  // ── 평가 요청 발송 ───────────────────────────────────────────────
  const handleSendEmails = async () => {
    const pending = evaluationsData.filter((e) => e.status === 'pending');
    if (pending.length === 0) {
      showActionMessage('info', '대기 중인 평가자가 없습니다. 모든 평가자가 이미 평가를 시작했습니다.');
      return;
    }
    // 백엔드에 이메일 발송 API 미구현 → 안내 메시지
    showActionMessage(
      'info',
      `이메일 발송 기능은 백엔드 SMTP 설정 후 사용 가능합니다. 대기 중인 평가자: ${pending.length}명`
    );
  };

  // ── 내보내기 ─────────────────────────────────────────────────────
  const handleExport = async () => {
    // 로컬 CSV 생성 (백엔드 export API는 별도 연동 가능)
    const rows = [
      ['평가자', '상태', '진행률', '일관성비율', '일관성여부'],
      ...evaluationsData.map((e) => [
        e.evaluator_name,
        e.status === 'completed' ? '완료' : e.status === 'in_progress' ? '진행중' : '대기',
        `${Math.round(e.progress)}%`,
        e.consistency_ratio !== null ? e.consistency_ratio.toFixed(4) : '-',
        e.is_consistent === true ? '적합' : e.is_consistent === false ? '부적합' : '-',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle}_평가결과.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showActionMessage('success', 'CSV 파일 다운로드가 시작되었습니다.');
  };

  // ── 실행 ─────────────────────────────────────────────────────────
  const handleExecute = async () => {
    if (!selectedAction) return;
    setIsExecuting(true);
    try {
      switch (selectedAction) {
        case 'test': {
          const testLink = `${window.location.origin}/evaluator?project=${projectId}&test=true`;
          window.open(testLink, '_blank');
          showActionMessage('info', '테스트 모드로 평가 화면을 열었습니다. 테스트 데이터는 저장되지 않습니다.');
          break;
        }
        case 'sendEmail':
          await handleSendEmails();
          break;
        case 'terminate':
          await updateProjectStatus('archived');
          showActionMessage('info', '프로젝트가 보관(중단) 처리되었습니다.');
          onProjectStatusChange('terminated');
          break;
        case 'complete':
          await updateProjectStatus('completed');
          showActionMessage('success', '프로젝트가 완료 처리되었습니다.');
          onProjectStatusChange('completed');
          break;
        case 'lock':
          showActionMessage('success', '결과 잠금 기능은 추후 제공될 예정입니다.');
          break;
        case 'export':
          await handleExport();
          break;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.status?.[0] ??
        '작업 중 오류가 발생했습니다.';
      showActionMessage('error', msg);
    } finally {
      setIsExecuting(false);
      setSelectedAction(null);
      setIsConfirming(false);
    }
  };

  const actions = [
    {
      id: 'test',
      label: '평가 테스트',
      icon: '🧪',
      description: '연구자가 평가 화면을 미리 테스트해볼 수 있습니다.',
      warning: '테스트 데이터는 저장되지 않습니다.',
      danger: false,
    },
    {
      id: 'sendEmail',
      label: '평가 요청 발송',
      icon: '📧',
      description: '대기 중인 평가자에게 평가 요청을 알립니다.',
      warning: '백엔드 SMTP 설정 후 실제 이메일 발송이 가능합니다.',
      danger: false,
    },
    {
      id: 'complete',
      label: '프로젝트 완료',
      icon: '✅',
      description: '프로젝트를 성공적으로 완료 처리합니다.',
      warning: '완료된 프로젝트는 더 이상 수정할 수 없습니다.',
      danger: false,
    },
    {
      id: 'terminate',
      label: '프로젝트 중단',
      icon: '⏹️',
      description: '프로젝트를 보관(중단) 처리합니다.',
      warning: '중단된 프로젝트는 보관 상태로 전환됩니다.',
      danger: true,
    },
    {
      id: 'lock',
      label: '결과 잠금',
      icon: '🔒',
      description: '현재 결과를 잠금 처리하여 변경을 방지합니다.',
      warning: '잠금된 결과는 관리자만 해제할 수 있습니다.',
      danger: false,
    },
    {
      id: 'export',
      label: '결과 내보내기 (CSV)',
      icon: '📤',
      description: '평가자 현황과 결과를 CSV 파일로 내보냅니다.',
      warning: '내보내기 후에도 프로젝트는 계속 진행할 수 있습니다.',
      danger: false,
    },
  ];

  // ── 로딩 / 오류 ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">프로젝트 정보 로딩 중...</div>
      </div>
    );
  }

  if (!projectSummary) {
    return (
      <div className="text-center py-8 text-red-600">프로젝트 정보를 로드할 수 없습니다.</div>
    );
  }

  // ── 렌더 ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      {actionMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-sm ${
            actionMessage.type === 'success'
              ? 'bg-green-100 text-green-800'
              : actionMessage.type === 'info'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">단계 4 — 프로젝트 중단/완료</h1>
            <p className="text-gray-600">
              프로젝트: <span className="font-medium">{projectTitle}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadProjectSummary}>
              🔄 새로고침
            </Button>
            <Button variant="secondary" onClick={onBack}>
              이전 단계로
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 데이터 카드 3개 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 평가 기준 */}
          <Card title="📋 평가 기준 구조">
            {criteriaData.length === 0 ? (
              <div className="text-gray-500 text-center py-4 text-sm">평가 기준이 설정되지 않았습니다.</div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 mb-2">총 {criteriaData.length}개의 평가 기준</div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {criteriaData.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="py-1 text-sm"
                      style={{ paddingLeft: `${(criterion.level - 1) * 16}px` }}
                    >
                      <span className="text-gray-400 mr-1">
                        {criterion.level === 1 ? '📁' : criterion.level === 2 ? '📂' : '📄'}
                      </span>
                      <span className="font-medium">{criterion.name}</span>
                      {criterion.description && (
                        <span className="ml-1 text-gray-500 text-xs">({criterion.description})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* 평가자 현황 */}
          <Card title="👥 평가자 현황">
            {evaluationsData.length === 0 ? (
              <div className="text-gray-500 text-center py-4 text-sm">배정된 평가자가 없습니다.</div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 mb-2">총 {evaluationsData.length}명의 평가자</div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {evaluationsData.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm font-medium text-gray-700">{ev.evaluator_name}</span>
                      <div className="flex items-center gap-2">
                        {ev.status === 'completed' && (
                          <>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">완료</span>
                            {ev.consistency_ratio !== null && (
                              <span className={`text-xs ${ev.is_consistent ? 'text-green-600' : 'text-red-600'}`}>
                                CR={ev.consistency_ratio.toFixed(3)}
                              </span>
                            )}
                          </>
                        )}
                        {ev.status === 'in_progress' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            진행 {Math.round(ev.progress)}%
                          </span>
                        )}
                        {(ev.status === 'pending' || ev.status === 'cancelled') && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">대기</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 요약 통계 */}
        <Card title="📊 프로젝트 요약 현황">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '평가 기준', value: projectSummary.totalCriteria, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900', sub: 'text-blue-700' },
              { label: '총 평가자', value: projectSummary.totalEvaluators, bg: 'bg-purple-50 border-purple-200', text: 'text-purple-900', sub: 'text-purple-700' },
              { label: '완료', value: projectSummary.completedEvaluators, bg: 'bg-green-50 border-green-200', text: 'text-green-900', sub: 'text-green-700' },
              { label: '진행률', value: `${projectSummary.completionRate}%`, bg: 'bg-orange-50 border-orange-200', text: 'text-orange-900', sub: 'text-orange-700' },
            ].map(({ label, value, bg, text, sub }) => (
              <div key={label} className={`text-center p-4 ${bg} border rounded-lg`}>
                <div className={`text-2xl font-bold ${text}`}>{value}</div>
                <div className={`text-sm ${sub}`}>{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-900">{projectSummary.pendingEvaluators}</div>
              <div className="text-sm text-yellow-700">대기 중</div>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
              <div className="text-xl font-bold text-indigo-900">{projectSummary.activeEvaluators}</div>
              <div className="text-sm text-indigo-700">진행 중</div>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <div className="text-xl font-bold text-teal-900">{projectSummary.completedEvaluators}</div>
              <div className="text-sm text-teal-700">완료</div>
            </div>
          </div>

          {projectSummary.avgConsistencyRatio !== null && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">평균 일관성 비율 (CR)</h4>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">{projectSummary.avgConsistencyRatio.toFixed(3)}</div>
                {projectSummary.avgConsistencyRatio <= 0.1 ? (
                  <span className="text-green-600 text-sm">✅ 적합 (CR ≤ 0.1)</span>
                ) : (
                  <span className="text-red-600 text-sm">⚠️ 재검토 필요 (CR &gt; 0.1)</span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* 작업 선택 */}
        <Card title="🎯 작업 선택">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => { setSelectedAction(action.id as 'test' | 'sendEmail' | 'terminate' | 'complete' | 'lock' | 'export'); setIsConfirming(false); }}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedAction === action.id
                    ? action.danger
                      ? 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-medium ${action.danger ? 'text-red-800' : 'text-gray-900'}`}>
                      {action.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    {selectedAction === action.id && (
                      <p className="text-xs text-orange-600 mt-2">⚠️ {action.warning}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 이메일 발송 상세 */}
        {selectedAction === 'sendEmail' && (
          <Card title="📧 평가 요청 발송">
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">대기 중인 평가자 ({evaluationsData.filter(e => e.status === 'pending').length}명)</h4>
                {evaluationsData.filter(e => e.status === 'pending').length === 0 ? (
                  <p className="text-sm text-gray-600">모든 평가자가 이미 평가를 시작했습니다.</p>
                ) : (
                  <ul className="text-sm text-blue-700 space-y-1">
                    {evaluationsData.filter(e => e.status === 'pending').map(e => (
                      <li key={e.id}>• {e.evaluator_name} (@{e.evaluator_username})</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                ⚠️ 실제 이메일 발송은 백엔드 SMTP(SendGrid 등) 설정 후 활성화됩니다.
              </div>
            </div>
          </Card>
        )}

        {/* 내보내기 설정 */}
        {selectedAction === 'export' && (
          <Card title="📤 내보내기 설정">
            <div className="space-y-3">
              {[
                { value: 'excel', label: 'CSV 파일', description: '평가자 현황 및 CR 포함 (로컬 생성)' },
                { value: 'pdf', label: 'PDF 문서', description: '추후 제공 예정' },
                { value: 'both', label: 'CSV + PDF', description: '추후 제공 예정' },
              ].map((format) => (
                <label
                  key={format.value}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={format.value}
                    checked={exportFormat === format.value}
                    onChange={(e) => setExportFormat(e.target.value as 'excel' | 'pdf' | 'both')}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-sm">{format.label}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        )}

        {/* 실행 버튼 */}
        {selectedAction && !isConfirming && (
          <div className="text-center">
            <Button onClick={() => setIsConfirming(true)} variant="primary" size="lg">
              {actions.find((a) => a.id === selectedAction)?.label} 진행
            </Button>
          </div>
        )}

        {/* 최종 확인 */}
        {isConfirming && (
          <Card title="🚨 최종 확인">
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-1">
                  {actions.find((a) => a.id === selectedAction)?.label}을(를) 실행하시겠습니까?
                </h4>
                <p className="text-sm text-red-700">
                  {actions.find((a) => a.id === selectedAction)?.warning}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button onClick={handleExecute} variant="error" size="lg" disabled={isExecuting}>
                  {isExecuting ? '처리 중...' : '확인하고 실행'}
                </Button>
                <Button onClick={() => setIsConfirming(false)} variant="secondary" size="lg" disabled={isExecuting}>
                  취소
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 프로젝트 정보 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">📋 프로젝트 정보</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
            <div>생성일: {projectSummary.createdDate}</div>
            <div>최종 수정: {projectSummary.lastModified}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm border-t border-gray-300 pt-3">
            <div className="bg-white p-2 rounded text-center">
              <span className="font-medium">기준: </span>{projectSummary.totalCriteria}개
            </div>
            <div className="bg-white p-2 rounded text-center">
              <span className="font-medium">평가자: </span>{projectSummary.totalEvaluators}명
            </div>
            <div className="bg-white p-2 rounded text-center">
              <span className="font-medium">완료율: </span>{projectSummary.completionRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCompletion;
