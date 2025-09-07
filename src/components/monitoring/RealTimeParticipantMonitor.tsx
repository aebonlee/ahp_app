import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTranslation } from '../../i18n';

// 참가자 상태 인터페이스
interface ParticipantStatus {
  participantId: string;
  name: string;
  email: string;
  role: string;
  loginTime?: string;
  lastActivity: string;
  currentPage: string;
  completionRate: number;
  evaluationStatus: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  consistencyRatio: number;
  totalEvaluations: number;
  completedEvaluations: number;
  averageResponseTime: number; // 평균 응답 시간 (초)
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
  };
  connectionStatus: 'online' | 'offline' | 'idle';
}

// 프로젝트 진행 상태
interface ProjectProgress {
  projectId: string;
  projectTitle: string;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  overallProgress: number;
  averageConsistency: number;
  estimatedCompletion: string;
  phases: {
    criteriaEvaluation: number;
    alternativeEvaluation: number;
    subElementEvaluation: number;
  };
}

// 알림 인터페이스
interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  participantId: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface RealTimeParticipantMonitorProps {
  projectId: string;
  className?: string;
  onParticipantSelect?: (participantId: string) => void;
}

const RealTimeParticipantMonitor: React.FC<RealTimeParticipantMonitorProps> = ({
  projectId,
  className = '',
  onParticipantSelect
}) => {
  const { t } = useTranslation();
  
  // 상태 관리
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5초 간격
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastActivity' | 'consistency'>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const intervalId = setInterval(() => {
      fetchParticipantData();
      fetchProjectProgress();
      checkForNotifications();
    }, refreshInterval);

    // 초기 데이터 로드
    fetchParticipantData();
    fetchProjectProgress();

    return () => clearInterval(intervalId);
  }, [projectId, isRealTimeEnabled, refreshInterval]);

  // 참가자 데이터 가져오기
  const fetchParticipantData = useCallback(async () => {
    try {
      // 실제로는 API 호출
      const mockData: ParticipantStatus[] = [
        {
          participantId: 'p1',
          name: '김기술팀장',
          email: 'kim@example.com',
          role: 'evaluator',
          loginTime: new Date(Date.now() - 3600000).toISOString(),
          lastActivity: new Date(Date.now() - 300000).toISOString(),
          currentPage: '기준 쌍대비교 (3/5)',
          completionRate: 60,
          evaluationStatus: 'in_progress',
          consistencyRatio: 0.08,
          totalEvaluations: 15,
          completedEvaluations: 9,
          averageResponseTime: 45,
          deviceInfo: {
            userAgent: 'Chrome 119.0.0.0',
            platform: 'Windows',
            screenResolution: '1920x1080'
          },
          connectionStatus: 'online'
        },
        {
          participantId: 'p2',
          name: '이개발자',
          email: 'lee@example.com',
          role: 'evaluator',
          loginTime: new Date(Date.now() - 7200000).toISOString(),
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          currentPage: '대안 평가 완료',
          completionRate: 100,
          evaluationStatus: 'completed',
          consistencyRatio: 0.06,
          totalEvaluations: 15,
          completedEvaluations: 15,
          averageResponseTime: 32,
          deviceInfo: {
            userAgent: 'Firefox 118.0',
            platform: 'macOS',
            screenResolution: '2560x1440'
          },
          connectionStatus: 'offline'
        },
        {
          participantId: 'p3',
          name: '박분석가',
          email: 'park@example.com',
          role: 'evaluator',
          loginTime: new Date(Date.now() - 1800000).toISOString(),
          lastActivity: new Date(Date.now() - 120000).toISOString(),
          currentPage: '대안 쌍대비교 (2/8)',
          completionRate: 25,
          evaluationStatus: 'in_progress',
          consistencyRatio: 0.15,
          totalEvaluations: 15,
          completedEvaluations: 4,
          averageResponseTime: 78,
          deviceInfo: {
            userAgent: 'Safari 17.0',
            platform: 'iOS',
            screenResolution: '390x844'
          },
          connectionStatus: 'online'
        },
        {
          participantId: 'p4',
          name: '최연구원',
          email: 'choi@example.com',
          role: 'evaluator',
          lastActivity: new Date(Date.now() - 86400000).toISOString(),
          currentPage: '미시작',
          completionRate: 0,
          evaluationStatus: 'overdue',
          consistencyRatio: 0,
          totalEvaluations: 15,
          completedEvaluations: 0,
          averageResponseTime: 0,
          deviceInfo: {
            userAgent: 'Chrome 118.0.0.0',
            platform: 'Android',
            screenResolution: '360x640'
          },
          connectionStatus: 'offline'
        }
      ];

      setParticipants(mockData);
    } catch (error) {
      console.error('Failed to fetch participant data:', error);
    }
  }, [projectId]);

  // 프로젝트 진행 상태 가져오기
  const fetchProjectProgress = useCallback(async () => {
    try {
      // 실제로는 API 호출
      const mockProgress: ProjectProgress = {
        projectId,
        projectTitle: '신기술 도입 우선순위 결정',
        totalParticipants: 4,
        activeParticipants: 2,
        completedParticipants: 1,
        overallProgress: 46.25,
        averageConsistency: 0.097,
        estimatedCompletion: new Date(Date.now() + 86400000).toISOString(),
        phases: {
          criteriaEvaluation: 75,
          alternativeEvaluation: 50,
          subElementEvaluation: 25
        }
      };

      setProjectProgress(mockProgress);
    } catch (error) {
      console.error('Failed to fetch project progress:', error);
    }
  }, [projectId]);

  // 알림 확인
  const checkForNotifications = useCallback(async () => {
    try {
      // 실제로는 API 호출
      const mockNotifications: Notification[] = [
        {
          id: 'n1',
          type: 'warning',
          participantId: 'p3',
          message: '일관성 비율이 0.1을 초과했습니다 (CR: 0.15)',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          acknowledged: false
        },
        {
          id: 'n2',
          type: 'error',
          participantId: 'p4',
          message: '24시간 이상 비활성 상태입니다',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          acknowledged: false
        }
      ];

      setNotifications(prev => {
        const newNotifications = mockNotifications.filter(
          newNotif => !prev.some(existingNotif => existingNotif.id === newNotif.id)
        );
        return [...prev, ...newNotifications];
      });
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  }, []);

  // 참가자 필터링 및 정렬
  const filteredAndSortedParticipants = useCallback(() => {
    let filtered = participants;

    // 상태별 필터링
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.evaluationStatus === filterStatus);
    }

    // 정렬
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          comparison = a.completionRate - b.completionRate;
          break;
        case 'lastActivity':
          comparison = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
          break;
        case 'consistency':
          comparison = a.consistencyRatio - b.consistencyRatio;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [participants, filterStatus, sortBy, sortOrder]);

  // 알림 확인 처리
  const acknowledgeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, acknowledged: true } : notif
      )
    );
  };

  // 참가자 상태 색상 반환
  const getStatusColor = (status: ParticipantStatus['evaluationStatus']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 연결 상태 색상 반환
  const getConnectionColor = (status: ParticipantStatus['connectionStatus']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // 참가자 세부 정보 토글
  const toggleParticipantDetails = (participantId: string) => {
    setSelectedParticipant(prev => prev === participantId ? '' : participantId);
    if (onParticipantSelect) {
      onParticipantSelect(participantId);
    }
  };

  // 시간 포맷팅
  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 및 컨트롤 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">실시간 참가자 모니터링</h2>
          {projectProgress && (
            <p className="text-gray-600">
              {projectProgress.projectTitle} - 전체 진행률: {projectProgress.overallProgress.toFixed(1)}%
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">실시간 업데이트</span>
            <input
              type="checkbox"
              checked={isRealTimeEnabled}
              onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
              className="rounded"
            />
          </div>
          
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
            disabled={!isRealTimeEnabled}
          >
            <option value={1000}>1초</option>
            <option value={5000}>5초</option>
            <option value={10000}>10초</option>
            <option value={30000}>30초</option>
          </select>
        </div>
      </div>

      {/* 알림 패널 */}
      {notifications.filter(n => !n.acknowledged).length > 0 && (
        <Card title="🚨 실시간 알림">
          <div className="space-y-2">
            {notifications
              .filter(n => !n.acknowledged)
              .slice(0, 5)
              .map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded border-l-4 ${
                    notification.type === 'error' ? 'border-red-500 bg-red-50' :
                    notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    notification.type === 'success' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {participants.find(p => p.participantId === notification.participantId)?.name}
                      </p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => acknowledgeNotification(notification.id)}
                      className="text-xs"
                    >
                      확인
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* 프로젝트 진행 상황 요약 */}
      {projectProgress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="총 참가자">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {projectProgress.totalParticipants}
              </div>
              <div className="text-sm text-gray-600">명</div>
            </div>
          </Card>
          
          <Card title="현재 활성">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {projectProgress.activeParticipants}
              </div>
              <div className="text-sm text-gray-600">명 온라인</div>
            </div>
          </Card>
          
          <Card title="평가 완료">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {projectProgress.completedParticipants}
              </div>
              <div className="text-sm text-gray-600">명 완료</div>
            </div>
          </Card>
          
          <Card title="평균 일관성">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                projectProgress.averageConsistency <= 0.1 ? 'text-green-600' : 'text-red-600'
              }`}>
                {projectProgress.averageConsistency.toFixed(3)}
              </div>
              <div className="text-sm text-gray-600">CR</div>
            </div>
          </Card>
        </div>
      )}

      {/* 평가 단계별 진행률 */}
      {projectProgress && (
        <Card title="단계별 진행률">
          <div className="space-y-4">
            {Object.entries(projectProgress.phases).map(([phase, progress]) => (
              <div key={phase}>
                <div className="flex justify-between text-sm mb-1">
                  <span>
                    {phase === 'criteriaEvaluation' ? '기준 평가' :
                     phase === 'alternativeEvaluation' ? '대안 평가' : '하위요소 평가'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 필터 및 정렬 컨트롤 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="all">전체 참가자</option>
            <option value="in_progress">평가 중</option>
            <option value="completed">완료</option>
            <option value="overdue">지연</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="lastActivity">최근 활동</option>
            <option value="name">이름</option>
            <option value="progress">진행률</option>
            <option value="consistency">일관성</option>
          </select>
          
          <Button
            variant="secondary"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredAndSortedParticipants().length}명 표시 중
        </div>
      </div>

      {/* 참가자 목록 */}
      <Card title="참가자 상태">
        <div className="space-y-4">
          {filteredAndSortedParticipants().map(participant => (
            <div key={participant.participantId} className="border rounded-lg p-4">
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => toggleParticipantDetails(participant.participantId)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {participant.name.charAt(0)}
                    </div>
                    <div 
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        getConnectionColor(participant.connectionStatus)
                      }`}
                    ></div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{participant.name}</h4>
                    <p className="text-sm text-gray-600">{participant.currentPage}</p>
                    <p className="text-xs text-gray-500">
                      마지막 활동: {formatTimeAgo(participant.lastActivity)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(participant.evaluationStatus)}`}>
                    {participant.evaluationStatus === 'completed' ? '완료' :
                     participant.evaluationStatus === 'in_progress' ? '진행중' :
                     participant.evaluationStatus === 'overdue' ? '지연' : '미시작'}
                  </span>
                  <div className="mt-1 text-sm font-medium">
                    {participant.completionRate}%
                  </div>
                </div>
              </div>
              
              {/* 진행률 바 */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>진행률</span>
                  <span>{participant.completedEvaluations}/{participant.totalEvaluations} 완료</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      participant.evaluationStatus === 'completed' ? 'bg-green-500' :
                      participant.evaluationStatus === 'in_progress' ? 'bg-blue-500' :
                      participant.evaluationStatus === 'overdue' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${participant.completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              {/* 일관성 지표 */}
              <div className="mt-2 flex justify-between items-center text-sm">
                <span>일관성 비율 (CR):</span>
                <span className={`font-medium ${
                  participant.consistencyRatio <= 0.1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {participant.consistencyRatio.toFixed(3)}
                </span>
              </div>
              
              {/* 세부 정보 (토글) */}
              {selectedParticipant === participant.participantId && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">이메일:</span>
                      <span className="ml-2">{participant.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">평균 응답시간:</span>
                      <span className="ml-2">{participant.averageResponseTime}초</span>
                    </div>
                    <div>
                      <span className="text-gray-600">플랫폼:</span>
                      <span className="ml-2">{participant.deviceInfo.platform}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">해상도:</span>
                      <span className="ml-2">{participant.deviceInfo.screenResolution}</span>
                    </div>
                    {participant.loginTime && (
                      <div className="col-span-2">
                        <span className="text-gray-600">로그인 시간:</span>
                        <span className="ml-2">
                          {new Date(participant.loginTime).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button variant="secondary" className="text-xs">
                      메시지 보내기
                    </Button>
                    <Button variant="secondary" className="text-xs">
                      진행 상황 상세보기
                    </Button>
                    {participant.evaluationStatus === 'overdue' && (
                      <Button variant="primary" className="text-xs">
                        알림 재전송
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RealTimeParticipantMonitor;