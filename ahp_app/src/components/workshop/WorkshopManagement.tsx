import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import apiService from '../../services/apiService';

interface WorkshopSession {
  id: string;
  project: string;
  title: string;
  description: string;
  status: 'preparation' | 'in_progress' | 'analyzing' | 'completed' | 'cancelled';
  workshop_code: string;
  facilitator: number;
  max_participants: number;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number;
  is_anonymous: boolean;
  allow_late_join: boolean;
  participant_count: number;
  participants?: WorkshopParticipant[];
  created_at: string;
}

interface WorkshopParticipant {
  id: number;
  workshop: string;
  name: string;
  email: string;
  role: 'evaluator' | 'observer' | 'facilitator';
  status: 'invited' | 'registered' | 'active' | 'completed' | 'absent';
  organization: string;
  completion_rate: number;
  access_token: string;
}

interface Project {
  id: string;
  title: string;
}

interface WorkshopManagementProps {
  className?: string;
}

const WorkshopManagement: React.FC<WorkshopManagementProps> = ({ className = '' }) => {
  const [workshops, setWorkshops] = useState<WorkshopSession[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'facilitation' | 'history'>('overview');
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    project: '',
    scheduled_at: '',
    duration_minutes: 120,
    max_participants: 30,
    is_anonymous: false,
    allow_late_join: true,
  });

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    role: 'evaluator' as 'evaluator' | 'observer' | 'facilitator',
    organization: '',
  });

  const showActionMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const loadWorkshops = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.get('/api/service/workshops/sessions/');
      const data = res.data as any;
      setWorkshops(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      showActionMessage('error', '워크숍 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const res = await apiService.get('/api/service/projects/projects/?page_size=100');
      const data = res.data as any;
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setProjects(list.map((p: any) => ({ id: p.id, title: p.title })));
    } catch (err) {
      showActionMessage('error', '프로젝트 목록을 불러오는데 실패했습니다.');
    }
  }, []);

  useEffect(() => {
    loadWorkshops();
    loadProjects();
  }, [loadWorkshops, loadProjects]);

  const handleLoadWorkshopDetail = async (workshop: WorkshopSession) => {
    try {
      const res = await apiService.get(`/api/service/workshops/sessions/${workshop.id}/`);
      setSelectedWorkshop(res.data as WorkshopSession);
    } catch (err) {
      console.error('워크숍 상세 로딩 실패:', err);
      setSelectedWorkshop(workshop);
    }
  };

  const handleCreateWorkshop = async () => {
    if (!newWorkshop.title.trim()) {
      showActionMessage('error', '워크숍 제목을 입력해주세요.');
      return;
    }
    if (!newWorkshop.project) {
      showActionMessage('error', '프로젝트를 선택해주세요.');
      return;
    }
    if (!newWorkshop.scheduled_at) {
      showActionMessage('error', '일정을 선택해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiService.post('/api/service/workshops/sessions/', {
        title: newWorkshop.title,
        description: newWorkshop.description,
        project: newWorkshop.project,
        scheduled_at: new Date(newWorkshop.scheduled_at).toISOString(),
        duration_minutes: newWorkshop.duration_minutes,
        max_participants: newWorkshop.max_participants,
        is_anonymous: newWorkshop.is_anonymous,
        allow_late_join: newWorkshop.allow_late_join,
      });
      showActionMessage('success', '워크숍이 생성되었습니다.');
      setNewWorkshop({ title: '', description: '', project: '', scheduled_at: '', duration_minutes: 120, max_participants: 30, is_anonymous: false, allow_late_join: true });
      await loadWorkshops();
      setActiveTab('overview');
    } catch (err: any) {
      const msg = err?.response?.data?.title?.[0] ?? err?.response?.data?.non_field_errors?.[0] ?? '워크숍 생성에 실패했습니다.';
      showActionMessage('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWorkshop = async (workshop: WorkshopSession) => {
    try {
      const res = await apiService.post(`/api/service/workshops/sessions/${workshop.id}/start/`, {});
      showActionMessage('success', '워크숍이 시작되었습니다.');
      await loadWorkshops();
      if (selectedWorkshop?.id === workshop.id) setSelectedWorkshop(res.data as WorkshopSession);
    } catch (err: any) {
      showActionMessage('error', err?.response?.data?.error ?? '워크숍 시작에 실패했습니다.');
    }
  };

  const handleCompleteWorkshop = async (workshop: WorkshopSession) => {
    try {
      await apiService.post(`/api/service/workshops/sessions/${workshop.id}/complete/`, {});
      showActionMessage('success', '워크숍이 완료 처리되었습니다.');
      setSelectedWorkshop(null);
      await loadWorkshops();
    } catch (err: any) {
      showActionMessage('error', err?.response?.data?.error ?? '워크숍 완료 처리에 실패했습니다.');
    }
  };

  const handleCancelWorkshop = async (workshop: WorkshopSession) => {
    try {
      await apiService.post(`/api/service/workshops/sessions/${workshop.id}/cancel/`, {});
      showActionMessage('info', '워크숍이 취소되었습니다.');
      setSelectedWorkshop(null);
      await loadWorkshops();
    } catch (err: any) {
      showActionMessage('error', err?.response?.data?.error ?? '워크숍 취소에 실패했습니다.');
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedWorkshop) return;
    if (!newParticipant.name.trim() || !newParticipant.email.trim()) {
      showActionMessage('error', '이름과 이메일을 입력해주세요.');
      return;
    }
    setIsAddingParticipant(true);
    try {
      await apiService.post('/api/service/workshops/participants/', {
        workshop: selectedWorkshop.id,
        name: newParticipant.name,
        email: newParticipant.email,
        role: newParticipant.role,
        organization: newParticipant.organization,
      });
      showActionMessage('success', '참가자가 추가되었습니다.');
      setNewParticipant({ name: '', email: '', role: 'evaluator', organization: '' });
      await handleLoadWorkshopDetail(selectedWorkshop);
    } catch (err: any) {
      const msg =
        err?.response?.data?.email?.[0] ??
        err?.response?.data?.non_field_errors?.[0] ??
        '참가자 추가에 실패했습니다.';
      showActionMessage('error', msg);
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const getStatusColor = (status: WorkshopSession['status']) => {
    switch (status) {
      case 'preparation': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: WorkshopSession['status']) => {
    switch (status) {
      case 'preparation': return '준비중';
      case 'in_progress': return '진행중';
      case 'analyzing': return '분석중';
      case 'completed': return '완료';
      case 'cancelled': return '취소됨';
      default: return '알 수 없음';
    }
  };

  const getParticipantRoleLabel = (role: WorkshopParticipant['role']) => {
    switch (role) {
      case 'evaluator': return '평가자';
      case 'observer': return '관찰자';
      case 'facilitator': return '진행자';
    }
  };

  const getParticipantStatusLabel = (status: WorkshopParticipant['status']) => {
    switch (status) {
      case 'invited': return '초대됨';
      case 'registered': return '등록됨';
      case 'active': return '참여중';
      case 'completed': return '완료';
      case 'absent': return '불참';
    }
  };

  const applyTemplate = (template: { title: string; description: string; duration: number }) => {
    setNewWorkshop(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      duration_minutes: template.duration,
    }));
  };

  // ── 탭: 개요 ──────────────────────────────────────────────────────
  const renderOverview = () => {
    const active = workshops.filter(w => w.status === 'in_progress').length;
    const completed = workshops.filter(w => w.status === 'completed').length;
    const planned = workshops.filter(w => w.status === 'preparation').length;
    const totalParticipants = workshops.reduce((sum, w) => sum + (w.participant_count ?? 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '진행중', value: active, color: 'text-green-600' },
            { label: '완료', value: completed, color: 'text-gray-600' },
            { label: '계획됨', value: planned, color: 'text-blue-600' },
            { label: '총 참가자', value: totalParticipants, color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-sm text-gray-600 mt-1">{label}</div>
              </div>
            </Card>
          ))}
        </div>

        <Card title="워크숍 목록">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">불러오는 중...</div>
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
              {workshops.map((workshop) => (
                <div key={workshop.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900">{workshop.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(workshop.status)}`}>
                        {getStatusLabel(workshop.status)}
                      </span>
                      {workshop.workshop_code && (
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 font-mono">
                          {workshop.workshop_code}
                        </span>
                      )}
                    </div>
                    {workshop.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{workshop.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>👥 {workshop.participant_count}명</span>
                      <span>⏰ {new Date(workshop.scheduled_at).toLocaleString('ko-KR')}</span>
                      <span>🕐 {workshop.duration_minutes}분</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { handleLoadWorkshopDetail(workshop); setActiveTab('facilitation'); }}
                    >
                      상세보기
                    </Button>
                    {workshop.status === 'preparation' && (
                      <Button variant="primary" size="sm" onClick={() => handleStartWorkshop(workshop)}>
                        시작
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ── 탭: 계획 ──────────────────────────────────────────────────────
  const renderPlanning = () => (
    <div className="space-y-6">
      <Card title="새 워크숍 생성">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">워크숍 제목 *</label>
              <input
                type="text"
                value={newWorkshop.title}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="예: 마케팅 전략 수립 워크숍"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">프로젝트 *</label>
              <select
                value={newWorkshop.project}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, project: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">프로젝트 선택</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">워크숍 설명</label>
            <textarea
              value={newWorkshop.description}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm h-20"
              placeholder="워크숍의 목적과 기대 결과를 설명하세요"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">일정 *</label>
              <input
                type="datetime-local"
                value={newWorkshop.scheduled_at}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, scheduled_at: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">소요시간 (분)</label>
              <input
                type="number"
                value={newWorkshop.duration_minutes}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, duration_minutes: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2 text-sm"
                min="30"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">최대 참가자</label>
              <input
                type="number"
                value={newWorkshop.max_participants}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, max_participants: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2 text-sm"
                min="2"
                max="200"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newWorkshop.is_anonymous}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, is_anonymous: e.target.checked })}
              />
              <span className="text-sm">익명 평가</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newWorkshop.allow_late_join}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, allow_late_join: e.target.checked })}
              />
              <span className="text-sm">지각 참여 허용</span>
            </label>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleCreateWorkshop} disabled={isSubmitting}>
              {isSubmitting ? '생성 중...' : '워크숍 생성'}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="워크숍 템플릿">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: '의사결정 워크숍', description: 'AHP를 활용한 체계적 의사결정', duration: 180 },
            { title: '브레인스토밍 세션', description: '창의적 아이디어 발굴 및 평가', duration: 120 },
            { title: '전략 수립 워크숍', description: '조직 전략 수립 및 실행계획', duration: 240 },
          ].map((template, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => applyTemplate(template)}
            >
              <h4 className="font-medium mb-1">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              <div className="text-xs text-gray-500">⏰ {template.duration}분 예상</div>
              <div className="mt-2 text-xs text-blue-600">클릭하여 양식에 적용</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ── 탭: 진행 ──────────────────────────────────────────────────────
  const renderWorkshopDetail = (workshop: WorkshopSession) => {
    const participants = workshop.participants ?? [];
    const isActive = ['preparation', 'in_progress'].includes(workshop.status);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => setSelectedWorkshop(null)}>
            ← 목록으로
          </Button>
          <div className="flex gap-2">
            {workshop.status === 'preparation' && (
              <Button variant="primary" onClick={() => handleStartWorkshop(workshop)}>
                워크숍 시작
              </Button>
            )}
            {workshop.status === 'in_progress' && (
              <Button variant="primary" onClick={() => handleCompleteWorkshop(workshop)}>
                완료 처리
              </Button>
            )}
            {isActive && (
              <button
                onClick={() => handleCancelWorkshop(workshop)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                취소
              </button>
            )}
          </div>
        </div>

        {/* 워크숍 정보 */}
        <Card title={workshop.title}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-500 text-xs mb-1">참가 코드</div>
              <div className="font-mono font-bold text-xl text-purple-700 tracking-widest">
                {workshop.workshop_code}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">상태</div>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(workshop.status)}`}>
                {getStatusLabel(workshop.status)}
              </span>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">일정</div>
              <div>{new Date(workshop.scheduled_at).toLocaleString('ko-KR')}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">소요시간</div>
              <div>{workshop.duration_minutes}분</div>
            </div>
          </div>
          {workshop.description && (
            <p className="text-sm text-gray-600 border-t pt-3">{workshop.description}</p>
          )}
        </Card>

        {/* 참가자 관리 */}
        <Card title={`참가자 관리 (${participants.length}명)`}>
          {/* 참가자 추가 폼 */}
          {isActive && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">참가자 추가</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  placeholder="이름"
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  placeholder="이메일"
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={newParticipant.organization}
                  onChange={(e) => setNewParticipant({ ...newParticipant, organization: e.target.value })}
                  placeholder="소속 (선택)"
                  className="border rounded px-3 py-2 text-sm"
                />
                <select
                  value={newParticipant.role}
                  onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value as any })}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="evaluator">평가자</option>
                  <option value="observer">관찰자</option>
                  <option value="facilitator">진행자</option>
                </select>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddParticipant} disabled={isAddingParticipant}>
                {isAddingParticipant ? '추가 중...' : '참가자 추가'}
              </Button>
            </div>
          )}

          {/* 참가자 목록 */}
          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              등록된 참가자가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{p.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {getParticipantRoleLabel(p.role)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700' :
                        p.status === 'active' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getParticipantStatusLabel(p.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.email}{p.organization ? ` · ${p.organization}` : ''}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(p.completion_rate * 100)}% 완료
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderFacilitation = () => {
    if (selectedWorkshop) {
      return renderWorkshopDetail(selectedWorkshop);
    }

    const activeWorkshops = workshops.filter(w => ['preparation', 'in_progress'].includes(w.status));

    return (
      <Card title="진행중인 워크숍">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">불러오는 중...</div>
        ) : activeWorkshops.length === 0 ? (
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
            {activeWorkshops.map((workshop) => (
              <div key={workshop.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{workshop.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(workshop.status)}`}>
                      {getStatusLabel(workshop.status)}
                    </span>
                    <span className="font-mono text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {workshop.workshop_code}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>👥 {workshop.participant_count}명</span>
                    <span>⏰ {new Date(workshop.scheduled_at).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <Button variant="secondary" size="sm" onClick={() => handleLoadWorkshopDetail(workshop)}>
                    관리
                  </Button>
                  {workshop.status === 'preparation' && (
                    <Button variant="primary" size="sm" onClick={() => handleStartWorkshop(workshop)}>
                      시작
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  // ── 탭: 이력 ──────────────────────────────────────────────────────
  const renderHistory = () => {
    const doneWorkshops = workshops.filter(w => ['completed', 'cancelled'].includes(w.status));

    return (
      <Card title="워크숍 이력">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">불러오는 중...</div>
        ) : doneWorkshops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📜</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">완료된 워크숍이 없습니다</h4>
            <p className="text-gray-500 mb-4">워크숍을 완료하면 이곳에서 결과를 확인할 수 있습니다</p>
            <Button variant="outline" onClick={() => setActiveTab('overview')}>
              현재 워크숍 보기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {doneWorkshops.map((workshop) => (
              <div key={workshop.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-700">{workshop.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(workshop.status)}`}>
                      {getStatusLabel(workshop.status)}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>👥 {workshop.participant_count}명</span>
                    {workshop.started_at && <span>시작: {new Date(workshop.started_at).toLocaleDateString('ko-KR')}</span>}
                    {workshop.ended_at && <span>종료: {new Date(workshop.ended_at).toLocaleDateString('ko-KR')}</span>}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { handleLoadWorkshopDetail(workshop); setActiveTab('facilitation'); }}
                >
                  상세보기
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  // ── 메인 렌더 ─────────────────────────────────────────────────────
  return (
    <div className={`space-y-6 ${className}`}>
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          actionMessage.type === 'success' ? 'bg-green-100 text-green-800' :
          actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-4">
          {[
            { id: 'overview', name: '개요', icon: '📊', desc: '워크숍 현황 및 통계' },
            { id: 'planning', name: '계획', icon: '📋', desc: '새 워크숍 생성' },
            { id: 'facilitation', name: '진행', icon: '🎯', desc: '실시간 워크숍 관리' },
            { id: 'history', name: '이력', icon: '📜', desc: '완료된 워크숍 기록' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); if (tab.id !== 'facilitation') setSelectedWorkshop(null); }}
              className={`flex-1 min-w-0 py-6 px-6 border-b-2 font-semibold text-base rounded-t-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-700 bg-blue-50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-lg"><span className="mr-2">{tab.icon}</span>{tab.name}</div>
                <div className="text-sm text-gray-500 mt-1 font-normal">{tab.desc}</div>
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
