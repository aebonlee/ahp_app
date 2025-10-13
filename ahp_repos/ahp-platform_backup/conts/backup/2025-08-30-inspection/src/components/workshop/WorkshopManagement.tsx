import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

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
  duration: number; // 분
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

const WorkshopManagement: React.FC<WorkshopManagementProps> = ({ className = '' }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'facilitation' | 'history'>('overview');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    projectId: '',
    scheduledDate: '',
    duration: 120,
    agenda: [] as AgendaItem[]
  });

  useEffect(() => {
    // 샘플 워크숍 데이터 로드
    const sampleWorkshops: Workshop[] = [
      {
        id: 'ws1',
        title: '신기술 도입 우선순위 결정 워크숍',
        description: '회사의 디지털 전환을 위한 신기술 도입 우선순위를 결정하는 협업 의사결정 워크숍',
        status: 'active',
        projectId: 'proj1',
        facilitator: '김진수',
        participants: [
          {
            id: 'p1',
            name: '김진수',
            email: 'kim@company.com',
            role: 'facilitator',
            status: 'confirmed',
            expertise: ['프로젝트 관리', 'AHP 방법론']
          },
          {
            id: 'p2',
            name: '이영희',
            email: 'lee@company.com',
            role: 'expert',
            status: 'confirmed',
            expertise: ['IT 기술', '시스템 아키텍처']
          },
          {
            id: 'p3',
            name: '박문수',
            email: 'park@company.com',
            role: 'stakeholder',
            status: 'confirmed',
            expertise: ['경영전략', '재무관리']
          }
        ],
        scheduledDate: '2025-01-20T14:00:00Z',
        duration: 180,
        agenda: [
          {
            id: 'a1',
            title: '워크숍 소개 및 목표 설정',
            description: '워크숍의 목적과 진행 방식 설명',
            duration: 30,
            type: 'presentation',
            responsible: '김진수'
          },
          {
            id: 'a2',
            title: '문제 정의 및 기준 설정',
            description: '의사결정 문제와 평가 기준 토론',
            duration: 60,
            type: 'discussion',
            responsible: '전체 참가자'
          },
          {
            id: 'a3',
            title: 'AHP 평가 수행',
            description: '쌍대비교를 통한 가중치 결정',
            duration: 90,
            type: 'evaluation',
            responsible: '전체 참가자'
          }
        ],
        decisions: [
          {
            id: 'd1',
            title: '평가 기준 최종 확정',
            description: '비용 효율성, 기술 성숙도, 구현 복잡도, 전략적 중요성을 평가 기준으로 확정',
            alternatives: ['비용 효율성', '기술 성숙도', '구현 복잡도', '전략적 중요성'],
            selectedAlternative: '모든 기준 채택',
            rationale: '포괄적 평가를 위해 모든 기준을 채택',
            timestamp: '2025-01-15T10:30:00Z',
            participants: ['p1', 'p2', 'p3']
          }
        ],
        createdAt: '2025-01-10T09:00:00Z'
      },
      {
        id: 'ws2',
        title: '마케팅 전략 수립 워크숍',
        description: '신제품 출시를 위한 마케팅 전략 수립 워크숍',
        status: 'planned',
        projectId: 'proj2',
        facilitator: '최민정',
        participants: [
          {
            id: 'p4',
            name: '최민정',
            email: 'choi@company.com',
            role: 'facilitator',
            status: 'confirmed',
            expertise: ['마케팅', '브랜딩']
          }
        ],
        scheduledDate: '2025-01-25T10:00:00Z',
        duration: 240,
        agenda: [],
        decisions: [],
        createdAt: '2025-01-12T11:00:00Z'
      }
    ];

    setWorkshops(sampleWorkshops);
  }, []);

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
    switch (status) {
      case 'planned': return '계획됨';
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소됨';
      default: return '알 수 없음';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 워크숍 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{workshops.filter(w => w.status === 'active').length}</div>
            <div className="text-sm text-gray-600">진행중인 워크숍</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{workshops.filter(w => w.status === 'completed').length}</div>
            <div className="text-sm text-gray-600">완료된 워크숍</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{workshops.filter(w => w.status === 'planned').length}</div>
            <div className="text-sm text-gray-600">계획된 워크숍</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{workshops.reduce((sum, w) => sum + w.participants.length, 0)}</div>
            <div className="text-sm text-gray-600">총 참가자 수</div>
          </div>
        </Card>
      </div>

      {/* 최근 워크숍 목록 */}
      <Card title="최근 워크숍" className="overflow-hidden">
        <div className="space-y-4">
          {workshops.slice(0, 5).map((workshop) => (
            <div key={workshop.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-gray-900">{workshop.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(workshop.status)}`}>
                    {getStatusLabel(workshop.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{workshop.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>👤 {workshop.facilitator}</span>
                  <span>👥 {workshop.participants.length}명</span>
                  <span>⏰ {new Date(workshop.scheduledDate).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedWorkshop(workshop)}
                >
                  상세보기
                </Button>
                {workshop.status === 'active' && (
                  <Button
                    variant="primary"
                    size="sm"
                  >
                    참가하기
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPlanning = () => (
    <div className="space-y-6">
      <Card title="새 워크숍 계획">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">워크숍 제목</label>
              <input
                type="text"
                value={newWorkshop.title}
                onChange={(e) => setNewWorkshop({...newWorkshop, title: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="예: 마케팅 전략 수립 워크숍"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">예상 소요시간 (분)</label>
              <input
                type="number"
                value={newWorkshop.duration}
                onChange={(e) => setNewWorkshop({...newWorkshop, duration: Number(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                min="60"
                max="480"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">워크숍 설명</label>
            <textarea
              value={newWorkshop.description}
              onChange={(e) => setNewWorkshop({...newWorkshop, description: e.target.value})}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="워크숍의 목적과 기대 결과를 설명하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">일정</label>
            <input
              type="datetime-local"
              value={newWorkshop.scheduledDate}
              onChange={(e) => setNewWorkshop({...newWorkshop, scheduledDate: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="primary">워크숍 생성</Button>
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
              agenda: ['문제 정의', 'AHP 평가', '결과 분석']
            },
            {
              title: '브레인스토밍 세션',
              description: '창의적 아이디어 발굴 및 평가',
              duration: 120,
              agenda: ['아이디어 발산', '아이디어 평가', '우선순위 결정']
            },
            {
              title: '전략 수립 워크숍',
              description: '조직 전략 수립 및 실행계획',
              duration: 240,
              agenda: ['현황 분석', '전략 수립', '실행계획 수립']
            }
          ].map((template, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <h4 className="font-medium mb-2">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="text-xs text-gray-500 mb-3">
                ⏰ {template.duration}분 예상
              </div>
              <div className="space-y-1">
                {template.agenda.map((item, idx) => (
                  <div key={idx} className="text-xs bg-gray-100 rounded px-2 py-1 inline-block mr-1">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderFacilitation = () => (
    <div className="space-y-6">
      <Card title="진행중인 워크숍">
        {workshops.filter(w => w.status === 'active').length > 0 ? (
          <div className="space-y-4">
            {workshops.filter(w => w.status === 'active').map((workshop) => (
              <div key={workshop.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{workshop.title}</h4>
                    <p className="text-sm text-gray-600">{workshop.description}</p>
                  </div>
                  <Button variant="primary">워크숍 입장</Button>
                </div>
                
                {/* 진행 상황 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>진행률</span>
                    <span>2/3 완료</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>

                {/* 참가자 상태 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {workshop.participants.map((participant) => (
                    <div key={participant.id} className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-sm ${
                        participant.status === 'attended' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {participant.name.charAt(0)}
                      </div>
                      <div className="text-xs">{participant.name}</div>
                      <div className="text-xs text-gray-500">{participant.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            현재 진행중인 워크숍이 없습니다.
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
            { icon: '📝', title: '회의록', desc: '자동 회의록 생성' }
          ].map((tool, index) => (
            <div key={index} className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="text-3xl mb-2">{tool.icon}</div>
              <div className="font-medium text-sm">{tool.title}</div>
              <div className="text-xs text-gray-600 mt-1">{tool.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderHistory = () => (
    <Card title="워크숍 이력">
      <div className="space-y-4">
        {workshops.filter(w => w.status === 'completed').map((workshop) => (
          <div key={workshop.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{workshop.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{workshop.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>📅 {new Date(workshop.scheduledDate).toLocaleDateString('ko-KR')}</span>
                  <span>⏰ {workshop.duration}분</span>
                  <span>👥 {workshop.participants.length}명 참가</span>
                  <span>✅ {workshop.decisions.length}개 결정사항</span>
                </div>
              </div>
              <Button variant="secondary" size="sm">결과 보기</Button>
            </div>
          </div>
        ))}
        
        {workshops.filter(w => w.status === 'completed').length === 0 && (
          <div className="text-center py-8 text-gray-500">
            완료된 워크숍이 없습니다.
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: '개요', icon: '📊' },
            { id: 'planning', name: '계획', icon: '📋' },
            { id: 'facilitation', name: '진행', icon: '🎯' },
            { id: 'history', name: '이력', icon: '📜' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
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