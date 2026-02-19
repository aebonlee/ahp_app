import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import apiService from '../../services/apiService';

interface SurveyLink {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorUsername: string;
  projectId: string;
  projectName: string;
  link: string;
  qrCode: string;
  createdAt: string;
  expiresAt?: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  invitationToken?: string;
}

interface SurveyLinkManagerProps {
  projectId?: string;
  projectName?: string;
  evaluators?: any[];
}

const SurveyLinkManager: React.FC<SurveyLinkManagerProps> = ({
  projectId,
  projectName,
}) => {
  const [surveyLinks, setSurveyLinks] = useState<SurveyLink[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'expired'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<SurveyLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };

  const generateQRCode = (link: string): string => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  const loadLinks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // 앱 base URL: GitHub Pages (/ahp_app/) 및 localhost 모두 지원
      const base = window.location.href.split('?')[0].replace(/\/$/, '');

      const [evalsRes, invitesRes, projectRes] = await Promise.allSettled([
        apiService.get<any>(`/api/service/evaluations/evaluations/?project=${projectId}&page_size=100`),
        apiService.get<any>(`/api/service/evaluations/invitations/?project=${projectId}&page_size=100`),
        apiService.get<any>(`/api/service/projects/projects/${projectId}/`),
      ]);

      const evals: any[] = evalsRes.status === 'fulfilled' && evalsRes.value?.data
        ? (evalsRes.value.data.results ?? evalsRes.value.data)
        : [];

      const invites: any[] = invitesRes.status === 'fulfilled' && invitesRes.value?.data
        ? (invitesRes.value.data.results ?? invitesRes.value.data)
        : [];

      const projectData: any = projectRes.status === 'fulfilled' ? projectRes.value?.data : null;
      const settingsEvaluators: any[] = projectData?.settings?.evaluators ?? [];

      // token map: evaluator id → invitation token
      const tokenMap: Record<string, string> = {};
      invites.forEach((inv: any) => {
        if (inv.evaluator && inv.token) {
          tokenMap[String(inv.evaluator)] = inv.token;
        }
      });

      // 1. Django Evaluation 레코드 기반 링크
      // URL: ?project=X&token=Y (토큰 있을 때) 또는 ?project=X&evaluation=Z
      // App.tsx evaluator-workflow 케이스가 project/token/key 파라미터를 모두 처리함
      const djangoLinks: SurveyLink[] = evals.map((ev: any) => {
        const token = tokenMap[String(ev.evaluator)];
        const link = token
          ? `${base}/?project=${projectId}&token=${token}`
          : `${base}/?project=${projectId}&evaluation=${ev.id}`;
        return {
          id: `eval-${ev.id}`,
          evaluatorId: String(ev.evaluator),
          evaluatorName: ev.evaluator_name || ev.evaluator_username || '평가자',
          evaluatorUsername: ev.evaluator_username || '',
          projectId: String(ev.project),
          projectName: projectName || projectData?.title || '',
          link,
          qrCode: generateQRCode(link),
          createdAt: ev.created_at,
          expiresAt: ev.expires_at || undefined,
          progress: ev.progress ?? 0,
          status: ev.status as SurveyLink['status'],
          invitationToken: token,
        };
      });

      // 2. project.settings.evaluators 기반 링크 (EvaluatorAssignment 방식)
      // URL: ?project=X&key=Y — App.tsx evaluator-workflow에서 urlParams.get('key')로 처리됨
      const djangoEmails = new Set(djangoLinks.map(l => l.evaluatorUsername.toLowerCase()));

      const settingsLinks: SurveyLink[] = settingsEvaluators
        .filter((ev: any) => ev.access_key)
        .filter((ev: any) => !djangoEmails.has((ev.email || '').toLowerCase()))
        .map((ev: any) => {
          const link = `${base}/?project=${projectId}&key=${ev.access_key}`;
          return {
            id: `settings-${ev.id || ev.access_key}`,
            evaluatorId: String(ev.id || ev.access_key),
            evaluatorName: ev.name || ev.email || '평가자',
            evaluatorUsername: ev.email || '',
            projectId: String(projectId),
            projectName: projectName || projectData?.title || '',
            link,
            qrCode: generateQRCode(link),
            createdAt: ev.created_at || new Date().toISOString(),
            expiresAt: ev.expires_at || undefined,
            progress: 0,
            status: (ev.status as SurveyLink['status']) || 'pending',
            invitationToken: ev.access_key,
          };
        });

      setSurveyLinks([...djangoLinks, ...settingsLinks]);
    } catch (err) {
      showActionMessage('error', '링크 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, projectName]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showActionMessage('success', '링크가 클립보드에 복사되었습니다.');
  };

  const handleSendEmail = (item: SurveyLink) => {
    const subject = encodeURIComponent(`[${item.projectName}] AHP 평가 참여 요청`);
    const body = encodeURIComponent(
`안녕하세요 ${item.evaluatorName}님,

${item.projectName} 프로젝트의 AHP 평가에 참여해 주시기 바랍니다.

평가 링크: ${item.link}

감사합니다.`.trim()
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSendSMS = (item: SurveyLink) => {
    const message = `[AHP평가] ${item.projectName}\n평가링크: ${item.link}`;
    showActionMessage('info', `SMS 발송 시뮬레이션: ${message}`);
  };

  const handleSendKakao = (item: SurveyLink) => {
    const text = encodeURIComponent(`[${item.projectName}] AHP 평가 링크\n${item.link}`);
    window.open(`https://talk-apps.kakao.com/scheme/kakaotalk://msg/text/${text}`);
  };

  const handleShowQR = (item: SurveyLink) => {
    setSelectedQR(item);
    setShowQRModal(true);
  };

  const handleBulkCopy = () => {
    const text = surveyLinks
      .filter(l => selectedLinks.includes(l.id))
      .map(l => `${l.evaluatorName}: ${l.link}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showActionMessage('success', `${selectedLinks.length}개의 링크가 복사되었습니다.`);
    setSelectedLinks([]);
  };

  const handleBulkEmail = () => {
    surveyLinks
      .filter(l => selectedLinks.includes(l.id))
      .forEach(l => handleSendEmail(l));
    setSelectedLinks([]);
  };

  const filteredLinks = surveyLinks
    .filter(link => {
      const matchesSearch =
        link.evaluatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.evaluatorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || link.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: surveyLinks.length,
    pending: surveyLinks.filter(l => l.status === 'pending').length,
    inProgress: surveyLinks.filter(l => l.status === 'in_progress').length,
    completed: surveyLinks.filter(l => l.status === 'completed').length,
  };

  const statusLabel = (s: SurveyLink['status']) => {
    const map: Record<string, string> = {
      pending: '대기중', in_progress: '진행중', completed: '완료', expired: '만료'
    };
    return map[s] || s;
  };

  const statusColor = (s: SurveyLink['status']) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
    };
    return map[s] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          actionMessage.type === 'success' ? 'bg-green-100 text-green-800' :
          actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">설문 링크 관리</h2>
          <p className="mt-1 text-sm text-gray-600">
            평가자별 설문 링크를 공유합니다. QR 코드, 이메일, 메시지 등 다양한 방법으로 전달하세요.
          </p>
        </div>
        <Button variant="secondary" onClick={loadLinks} disabled={loading}>
          {loading ? '로딩 중...' : '새로고침'}
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">전체 평가자</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-700">대기중</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.inProgress}</div>
            <div className="text-sm text-indigo-700">진행중</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-700">완료</div>
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              id="search"
              placeholder="평가자명, 사용자명, 프로젝트명으로 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="expired">만료</option>
          </select>
          <Button
            variant="secondary"
            onClick={() => setShowBulkActions(!showBulkActions)}
            disabled={selectedLinks.length === 0}
          >
            대량 작업 ({selectedLinks.length})
          </Button>
        </div>

        {showBulkActions && selectedLinks.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleBulkCopy}>
              일괄 복사
            </Button>
            <Button variant="secondary" size="sm" onClick={handleBulkEmail}>
              일괄 이메일
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedLinks([])}>
              선택 해제
            </Button>
          </div>
        )}
      </Card>

      {/* 링크 테이블 */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedLinks.length === filteredLinks.length && filteredLinks.length > 0}
                      onChange={(e) => {
                        setSelectedLinks(e.target.checked ? filteredLinks.map(l => l.id) : []);
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평가자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평가 링크
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    진행률
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    만료일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공유
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedLinks.includes(link.id)}
                        onChange={(e) => {
                          setSelectedLinks(e.target.checked
                            ? [...selectedLinks, link.id]
                            : selectedLinks.filter(id => id !== link.id)
                          );
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{link.evaluatorName}</div>
                        <div className="text-xs text-gray-500">@{link.evaluatorUsername}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded max-w-xs truncate block">
                          {link.link.replace(window.location.origin, '').substring(0, 50)}...
                        </code>
                        <button
                          onClick={() => handleCopyLink(link.link)}
                          className="text-blue-600 hover:text-blue-800 text-xs shrink-0"
                          title="링크 복사"
                        >
                          복사
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(link.status)}`}>
                        {statusLabel(link.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${link.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{Math.round(link.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('ko-KR') : '무제한'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSendEmail(link)}
                          className="text-gray-500 hover:text-blue-600 text-xs border border-gray-200 px-2 py-1 rounded hover:border-blue-300"
                          title="이메일"
                        >
                          이메일
                        </button>
                        <button
                          onClick={() => handleSendSMS(link)}
                          className="text-gray-500 hover:text-green-600 text-xs border border-gray-200 px-2 py-1 rounded hover:border-green-300"
                          title="SMS"
                        >
                          SMS
                        </button>
                        <button
                          onClick={() => handleSendKakao(link)}
                          className="text-gray-500 hover:text-yellow-600 text-xs border border-gray-200 px-2 py-1 rounded hover:border-yellow-300"
                          title="카카오톡"
                        >
                          카카오
                        </button>
                        <button
                          onClick={() => handleShowQR(link)}
                          className="text-gray-500 hover:text-purple-600 text-xs border border-gray-200 px-2 py-1 rounded hover:border-purple-300"
                          title="QR 코드"
                        >
                          QR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLinks.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {projectId
                    ? '이 프로젝트에 배정된 평가자가 없습니다.'
                    : '프로젝트를 선택하세요.'}
                </p>
                <p className="text-sm mt-2">평가자를 배정하면 링크가 자동으로 생성됩니다.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* QR 코드 모달 */}
      {showQRModal && selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">QR 코드 - {selectedQR.evaluatorName}</h3>
            <div className="text-center">
              <img
                src={selectedQR.qrCode}
                alt="QR Code"
                className="mx-auto mb-4"
              />
              <p className="text-sm text-gray-600 mb-1">{selectedQR.projectName}</p>
              <p className="text-xs text-gray-400 mb-2">@{selectedQR.evaluatorUsername}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-4 break-all">
                {selectedQR.link}
              </code>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = selectedQR.qrCode;
                    a.download = `qr-${selectedQR.evaluatorUsername}-${selectedQR.id}.png`;
                    a.click();
                  }}
                >
                  다운로드
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleCopyLink(selectedQR.link)}
                >
                  링크 복사
                </Button>
                <Button
                  variant="primary"
                  onClick={() => { setShowQRModal(false); setSelectedQR(null); }}
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 안내 */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">설문 링크 안내</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 평가자가 배정되면 고유 링크가 자동으로 생성됩니다.</li>
          <li>• 이메일, SMS, 카카오톡, QR 코드로 링크를 공유할 수 있습니다.</li>
          <li>• 초대장이 발송된 평가자는 토큰 기반 보안 링크가 제공됩니다.</li>
          <li>• 진행률과 상태는 평가자가 평가를 진행함에 따라 실시간으로 업데이트됩니다.</li>
        </ul>
      </Card>
    </div>
  );
};

export default SurveyLinkManager;
