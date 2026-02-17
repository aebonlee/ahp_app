import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import authService from '../../services/authService';

interface Workshop {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  projectId: string;
  facilitator: string;
  participants: Participant[];
  scheduledDate: string;
  duration: number; // 분
  agenda: AgendaItem[];
  decisions: Decision[];
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'facilitator' | 'expert' | 'stakeholder' | 'observer';
  status: 'invited' | 'confirmed' | 'declined' | 'attended';
  expertise?: string[];
}

interface AgendaItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'presentation' | 'discussion' | 'evaluation' | 'decision';
  responsible: string;
  materials?: string[];
}

interface Decision {
  id: string;
  title: string;
  description: string;
  alternatives: string[];
  selectedAlternative?: string;
  rationale?: string;
  timestamp: string;
  participants: string[];
}

interface WorkshopManagementProps {
  className?: string;
}

type ActiveTab = 'overview' | 'planning' | 'facilitation' | 'history';

// ── API 헬퍼 ──────────────────────────────────────────────────────────────────

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = authService.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { credentials: 'include', headers, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// ─────────────────────────────────────────────────────────────────────────────

const WorkshopManagement: React.FC<WorkshopManagementProps> = ({ className = '' }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    projectId: '',
    scheduledDate: '',
    duration: 120,
  });

  const loadWorkshops = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.WORKSHOPS.LIST}`);
      setWorkshops(Array.isArray(data) ? data : (data?.results ?? []));
    } catch (err: any) {
      setError(err.message || '워크숍 목록을 불러오지 못했습니다.');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkshops();
  }, [loadWorkshops]);

  const handleCreateWorkshop = async () => {
    if (!newWorkshop.title.trim()) {
      setCreateError('워크숍 제목을 입력해주세요.');
      return;
    }
    if (!newWorkshop.scheduledDate) {
      setCreateError('일정을 선택해주세요.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess(false);

    try {
      const created = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.WORKSHOPS.CREATE}`, {
        method: 'POST',
        body: JSON.stringify({
          title: newWorkshop.title,
          description: newWorkshop.description,
          project_id: newWorkshop.projectId || undefined,
          scheduled_date: newWorkshop.scheduledDate,
          duration: newWorkshop.duration,
        }),
      });
      if (created) {
        setWorkshops(prev => [created, ...prev]);
      }
      setCreateSuccess(true);
      setNewWorkshop({ title: '', description: '', projectId: '', scheduledDate: '', duration: 120 });
      // 생성 성공 후 개요 탭으로 이동
      setTimeout(() => {
        setCreateSuccess(false);
        setActiveTab('overview');
      }, 1500);
    } catch (err: any) {
      setCreateError(err.message || '워크숍 생성에 실패했습니다.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (workshopId: string, action: 'start' | 'complete' | 'cancel') => {
    const endpointMap = {
      start: API_ENDPOINTS.WORKSHOPS.START(workshopId),
      complete: API_ENDPOINTS.WORKSHOPS.COMPLETE(workshopId),
      cancel: API_ENDPOINTS.WORKSHOPS.CANCEL(workshopId),
    };
    try {
      const updated = await apiFetch(`${API_BASE_URL}${endpointMap[action]}`, { method: 'POST' });
      if (updated) {
        setWorkshops(prev => prev.map(w => w.id === workshopId ? updated : w));
        if (selectedWorkshop?.id === workshopId) setSelectedWorkshop(updated);
      }
    } catch (err: any) {
      setError(err.message || `워크숍 상태 변경 실패: ${action}`);
    }
  };

  const applyTemplate = (template: { title: string; description: string; duration: number }) => {
    setNewWorkshop(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      duration: template.duration,
    }));
    setActiveTab('planning');
  };

  // ── 상태 헬퍼 ──────────────────────────────────────────────────────────────

  const getStatusColor = (status: Workshop['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Workshop['status']) => {
    const map: Record<Workshop['status'], string> = {
      planned: '계획됨', active: '진행중', completed: '완료', cancelled: '취소됨',
    };
    return map[status] ?? '알 수 없음';
  };

  // ── 탭 렌더러 ─────────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '진행중인 워크숍', value: workshops.filter(w => w.status === 'active').length, color: 'text-green-600' },
          { label: '완료된 워크숍', value: workshops.filter(w => w.status === 'completed').length, color: 'text-blue-600' },
          { label: '계획된 워크숍', value: workshops.filter(w => w.status === 'planned').length, color: 'text-orange-600' },
          { label: '총 참가자 수', value: workshops.reduce((s, w) => s + (w.participants?.length ?? 0), 0), color: 'text-purple-600' },
        ].map((stat, i) => (
          <Card key={i}>
            <div className="text-center py-2">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* 워크숍 목록 */}
      <Card title="최근 워크숍">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏛️</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 워크숍이 없습니다</h4>
            <p className="text-gray-500 mb-6">AHP 기반 의사결정을 위한 워크숍을 생성해보세요</p>
            <Button variant="primary" onClick={() => setActiveTab('planning')}>
              첫 번째 워크숍 만들기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {workshops.slice(0, 5).map((workshop) => (
              <div
                key={workshop.id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedWorkshop?.id === workshop.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedWorkshop(prev => prev?.id === workshop.id ? null : workshop)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-medium text-gray-900 truncate">{workshop.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs shrink-0 ${getStatusColor(workshop.status)}`}>
                      {getStatusLabel(workshop.status)}
                    </span>
                  </div>
                  {workshop.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{workshop.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                    {workshop.facilitator && <span>👤 {workshop.facilitator}</span>}
                    <span>👥 {workshop.participants?.length ?? 0}명</span>
                    {workshop.scheduledDate && (
                      <span>⏰ {new Date(workshop.scheduledDate).toLocaleDateString('ko-KR')}</span>
                    )}
                    <span>⏱ {workshop.duration}분</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-3 shrink-0">
                  {workshop.status === 'planned' && (
                    <Button variant="primary" size="sm" onClick={(e) => { e?.stopPropagation(); handleStatusChange(workshop.id, 'start'); }}>
                      시작
                    </Button>
                  )}
                  {workshop.status === 'active' && (
                    <Button variant="secondary" size="sm" onClick={(e) => { e?.stopPropagation(); handleStatusChange(workshop.id, 'complete'); }}>
                      완료
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 선택된 워크숍 상세 */}
      {selectedWorkshop && (
        <Card title={`상세: ${selectedWorkshop.title}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">상태</span><span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(selectedWorkshop.status)}`}>{getStatusLabel(selectedWorkshop.status)}</span></div>
              {selectedWorkshop.facilitator && <div className="flex justify-between"><span className="text-gray-500">진행자</span><span>{selectedWorkshop.facilitator}</span></div>}
              {selectedWorkshop.scheduledDate && <div className="flex justify-between"><span className="text-gray-500">일정</span><span>{new Date(selectedWorkshop.scheduledDate).toLocaleString('ko-KR')}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">소요 시간</span><span>{selectedWorkshop.duration}분</span></div>
              <div className="flex justify-between"><span className="text-gray-500">참가자</span><span>{selectedWorkshop.participants?.length ?? 0}명</span></div>
            </div>
            <div>
              {selectedWorkshop.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">설명</p>
                  <p className="text-sm text-gray-600">{selectedWorkshop.description}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {selectedWorkshop.status === 'planned' && (
                  <>
                    <Button variant="primary" size="sm" onClick={() => handleStatusChange(selectedWorkshop.id, 'start')}>시작하기</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleStatusChange(selectedWorkshop.id, 'cancel')}>취소</Button>
                  </>
                )}
                {selectedWorkshop.status === 'active' && (
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange(selectedWorkshop.id, 'complete')}>완료 처리</Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderPlanning = () => (
    <div className="space-y-6">
      <Card title="새 워크숍 계획">
        {createSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✅ 워크숍이 생성되었습니다!
          </div>
        )}
        {createError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {createError}
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">워크숍 제목 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newWorkshop.title}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 마케팅 전략 수립 워크숍"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">예상 소요시간 (분)</label>
              <input
                type="number"
                value={newWorkshop.duration}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, duration: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="30"
                max="480"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">워크숍 설명</label>
            <textarea
              value={newWorkshop.description}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="워크숍의 목적과 기대 결과를 설명하세요"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">일정 <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={newWorkshop.scheduledDate}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, scheduledDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">연결 프로젝트 ID (선택)</label>
              <input
                type="text"
                value={newWorkshop.projectId}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, projectId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="프로젝트 ID (없으면 빈칸)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setActiveTab('overview')}>취소</Button>
            <Button variant="primary" onClick={handleCreateWorkshop} disabled={createLoading}>
              {createLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  생성 중...
                </span>
              ) : '워크숍 생성'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 워크숍 템플릿 */}
      <Card title="워크숍 템플릿">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '의사결정 워크숍',
              description: 'AHP를 활용한 체계적 의사결정',
              duration: 180,
              agenda: ['문제 정의', 'AHP 평가', '결과 분석'],
            },
            {
              title: '브레인스토밍 세션',
              description: '창의적 아이디어 발굴 및 평가',
              duration: 120,
              agenda: ['아이디어 발산', '아이디어 평가', '우선순위 결정'],
            },
            {
              title: '전략 수립 워크숍',
              description: '조직 전략 수립 및 실행계획',
              duration: 240,
              agenda: ['현황 분석', '전략 수립', '실행계획 수립'],
            },
          ].map((template, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => applyTemplate(template)}
            >
              <h4 className="font-medium mb-1">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="text-xs text-gray-500 mb-3">⏰ {template.duration}분 예상</div>
              <div className="flex flex-wrap gap-1">
                {template.agenda.map((item, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 rounded px-2 py-0.5">{item}</span>
                ))}
              </div>
              <div className="mt-3 text-xs text-blue-600 font-medium">클릭하여 템플릿 적용 →</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderFacilitation = () => {
    const activeWorkshops = workshops.filter(w => w.status === 'active');
    return (
      <div className="space-y-6">
        <Card title="진행중인 워크숍">
          {activeWorkshops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">진행중인 워크숍이 없습니다</h4>
              <p className="text-gray-500 mb-6">새로운 워크숍을 계획하고 참가자들을 초대하세요</p>
              <Button variant="primary" onClick={() => setActiveTab('planning')}>
                워크숍 계획하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeWorkshops.map(workshop => (
                <div key={workshop.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{workshop.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        참가자 {workshop.participants?.length ?? 0}명 · {workshop.duration}분
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => handleStatusChange(workshop.id, 'complete')}>
                        완료 처리
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleStatusChange(workshop.id, 'cancel')}>
                        취소
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 워크숍 도구 */}
        <Card title="워크숍 도구">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '⚖️', title: '실시간 평가', desc: '참가자들과 함께 쌍대비교 진행' },
              { icon: '💬', title: '토론 관리', desc: '의견 수렴 및 합의 형성' },
              { icon: '📊', title: '실시간 결과', desc: '평가 결과 즉시 확인' },
              { icon: '📝', title: '회의록', desc: '자동 회의록 생성' },
            ].map((tool, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="text-3xl mb-2">{tool.icon}</div>
                <div className="font-medium text-sm">{tool.title}</div>
                <div className="text-xs text-gray-600 mt-1">{tool.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderHistory = () => {
    const completedWorkshops = workshops.filter(w => w.status === 'completed');
    return (
      <Card title="워크숍 이력">
        {completedWorkshops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📜</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">완료된 워크숍이 없습니다</h4>
            <p className="text-gray-500 mb-6">워크숍을 완료하면 이곳에서 결과와 의사결정 내용을 확인할 수 있습니다</p>
            <Button variant="outline" onClick={() => setActiveTab('overview')}>현재 워크숍 보기</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {completedWorkshops.map(workshop => (
              <div key={workshop.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{workshop.title}</h4>
                    {workshop.description && (
                      <p className="text-sm text-gray-600 mt-1">{workshop.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {workshop.scheduledDate && <span>📅 {new Date(workshop.scheduledDate).toLocaleDateString('ko-KR')}</span>}
                      <span>👥 {workshop.participants?.length ?? 0}명 참가</span>
                      <span>⏱ {workshop.duration}분</span>
                      <span>🗳 {workshop.decisions?.length ?? 0}건 결정</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(workshop.status)}`}>
                    {getStatusLabel(workshop.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const TABS: { id: ActiveTab; name: string; icon: string; desc: string }[] = [
    { id: 'overview', name: '개요', icon: '📊', desc: '워크숍 현황 및 통계' },
    { id: 'planning', name: '계획', icon: '📋', desc: '새 워크숍 생성' },
    { id: 'facilitation', name: '진행', icon: '🎯', desc: '실시간 워크숍 관리' },
    { id: 'history', name: '이력', icon: '📜', desc: '완료된 워크숍 기록' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 py-4 px-4 border-b-2 font-semibold text-sm rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-700 bg-blue-50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div><span className="mr-1">{tab.icon}</span>{tab.name}</div>
                <div className="text-xs text-gray-500 mt-1 font-normal">{tab.desc}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'planning' && renderPlanning()}
      {activeTab === 'facilitation' && renderFacilitation()}
      {activeTab === 'history' && renderHistory()}
    </div>
  );
};

export default WorkshopManagement;
