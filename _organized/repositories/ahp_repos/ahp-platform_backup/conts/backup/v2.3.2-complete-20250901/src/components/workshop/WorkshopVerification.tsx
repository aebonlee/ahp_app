import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ScreenID from '../common/ScreenID';
import { SCREEN_IDS } from '../../constants/screenIds';

interface WorkshopState {
  isActive: boolean;
  currentStep: string;
  participantCount: number;
  adminControl: {
    canNavigate: boolean;
    canSync: boolean;
    currentScreen: string;
  };
  evaluatorView: {
    isBlocked: boolean;
    currentScreen: string;
    syncStatus: 'synced' | 'syncing' | 'disconnected';
  };
}

interface WorkshopVerificationProps {
  mode: 'admin' | 'evaluator';
  onStateChange?: (state: WorkshopState) => void;
}

const WorkshopVerification: React.FC<WorkshopVerificationProps> = ({ 
  mode, 
  onStateChange 
}) => {
  const [workshopState, setWorkshopState] = useState<WorkshopState>({
    isActive: false,
    currentStep: 'step1-criteria',
    participantCount: 0,
    adminControl: {
      canNavigate: true,
      canSync: true,
      currentScreen: 'ADMIN-STEP1-CRITERIA'
    },
    evaluatorView: {
      isBlocked: true,
      currentScreen: 'RATER-PROJ-SELECT',
      syncStatus: 'disconnected'
    }
  });

  const [verificationLog, setVerificationLog] = useState<string[]>([]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(workshopState);
    }
  }, [workshopState, onStateChange]);

  const logAction = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setVerificationLog(prev => [...prev, `${timestamp}: ${action}`]);
  };

  const toggleWorkshop = () => {
    setWorkshopState(prev => {
      const newState = {
        ...prev,
        isActive: !prev.isActive,
        evaluatorView: {
          ...prev.evaluatorView,
          isBlocked: prev.isActive, // 반전: 활성화되면 차단 해제
          syncStatus: (!prev.isActive ? 'synced' : 'disconnected') as 'synced' | 'syncing' | 'disconnected'
        }
      };
      
      logAction(`워크숍 ${newState.isActive ? '활성화' : '비활성화'}`);
      return newState;
    });
  };

  const navigateStep = (direction: 'prev' | 'next') => {
    if (!workshopState.isActive || mode !== 'admin') return;

    setWorkshopState(prev => {
      const steps = ['step1-criteria', 'step1-alternatives', 'step2-pairwise', 'step3-results'];
      const currentIndex = steps.indexOf(prev.currentStep);
      let newIndex = currentIndex;

      if (direction === 'next' && currentIndex < steps.length - 1) {
        newIndex = currentIndex + 1;
      } else if (direction === 'prev' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      const newStep = steps[newIndex];
      const newState = {
        ...prev,
        currentStep: newStep,
        adminControl: {
          ...prev.adminControl,
          currentScreen: `ADMIN-${newStep.toUpperCase().replace('-', '-')}`
        },
        evaluatorView: {
          ...prev.evaluatorView,
          currentScreen: `RATER-${newStep.split('-')[1].toUpperCase()}`,
          syncStatus: 'syncing' as 'synced' | 'syncing' | 'disconnected'
        }
      };

      logAction(`${direction === 'next' ? '다음' : '이전'} 단계로 이동: ${newStep}`);
      
      // 동기화 완료 시뮬레이션
      setTimeout(() => {
        setWorkshopState(current => ({
          ...current,
          evaluatorView: {
            ...current.evaluatorView,
            syncStatus: 'synced'
          }
        }));
        logAction('실시간 동기화 완료');
      }, 1500);

      return newState;
    });
  };

  const toggleSync = () => {
    if (mode !== 'admin') return;

    setWorkshopState(prev => {
      const newSyncEnabled = !prev.adminControl.canSync;
      const newState = {
        ...prev,
        adminControl: {
          ...prev.adminControl,
          canSync: newSyncEnabled
        },
        evaluatorView: {
          ...prev.evaluatorView,
          syncStatus: (newSyncEnabled ? 'synced' : 'disconnected') as 'synced' | 'syncing' | 'disconnected'
        }
      };

      logAction(`실시간 동기화 ${newSyncEnabled ? '활성화' : '비활성화'}`);
      return newState;
    });
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600';
      case 'syncing': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return '🟢';
      case 'syncing': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  if (mode === 'admin') {
    return (
      <div className="space-y-4">
        <ScreenID id={SCREEN_IDS.WORKSHOP.ADMIN_CONTROL} />
        
        <Card title="워크숍 관리자 제어판">
          <div className="space-y-6">
            {/* Workshop Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">워크숍 상태</h4>
                  <p className="text-sm text-blue-700">
                    {workshopState.isActive ? '진행 중' : '대기 중'} | 
                    참여자: {workshopState.participantCount}명
                  </p>
                </div>
                <Button
                  onClick={toggleWorkshop}
                  variant={workshopState.isActive ? 'error' : 'primary'}
                >
                  {workshopState.isActive ? '워크숍 종료' : '워크숍 시작'}
                </Button>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">진행 제어</h4>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigateStep('prev')}
                  disabled={!workshopState.isActive}
                  variant="secondary"
                  size="sm"
                >
                  ← 이전
                </Button>
                <div className="text-sm text-gray-600 flex-1 text-center">
                  현재: {workshopState.currentStep}
                </div>
                <Button
                  onClick={() => navigateStep('next')}
                  disabled={!workshopState.isActive}
                  variant="primary"
                  size="sm"
                >
                  다음 →
                </Button>
              </div>
            </div>

            {/* Sync Controls */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-purple-900">실시간 동기화</h4>
                  <p className="text-sm text-purple-700">
                    상태: {getSyncStatusIcon(workshopState.evaluatorView.syncStatus)} 
                    <span className={getSyncStatusColor(workshopState.evaluatorView.syncStatus)}>
                      {workshopState.evaluatorView.syncStatus}
                    </span>
                  </p>
                </div>
                <Button
                  onClick={toggleSync}
                  disabled={!workshopState.isActive}
                  variant={workshopState.adminControl.canSync ? 'error' : 'primary'}
                  size="sm"
                >
                  {workshopState.adminControl.canSync ? 'Sync OFF' : 'Sync ON'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Verification Log */}
        <Card title="검증 로그">
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs max-h-48 overflow-y-auto">
            {verificationLog.length === 0 ? (
              <div className="text-gray-500">로그가 없습니다...</div>
            ) : (
              verificationLog.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Evaluator View
  return (
    <div className="space-y-4">
      <ScreenID id={SCREEN_IDS.WORKSHOP.RATER_VIEW} />
      
      <Card title="평가자 워크숍 화면">
        <div className="space-y-4">
          {/* Access Status */}
          <div className={`border rounded-lg p-4 ${
            workshopState.evaluatorView.isBlocked 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {workshopState.evaluatorView.isBlocked ? '🚫' : '✅'}
              </span>
              <div>
                <h4 className={`font-medium ${
                  workshopState.evaluatorView.isBlocked 
                    ? 'text-red-900' 
                    : 'text-green-900'
                }`}>
                  {workshopState.evaluatorView.isBlocked ? '접근 차단' : '접근 허용'}
                </h4>
                <p className={`text-sm ${
                  workshopState.evaluatorView.isBlocked 
                    ? 'text-red-700' 
                    : 'text-green-700'
                }`}>
                  {workshopState.evaluatorView.isBlocked 
                    ? '관리자가 워크숍을 진행하는 중에만 접속할 수 있습니다.'
                    : '워크숍에 참여 중입니다.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Current Screen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">현재 화면</h4>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">
                {workshopState.evaluatorView.currentScreen}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">동기화:</span>
                <span className={getSyncStatusColor(workshopState.evaluatorView.syncStatus)}>
                  {getSyncStatusIcon(workshopState.evaluatorView.syncStatus)}
                  {workshopState.evaluatorView.syncStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Mock Content */}
          {!workshopState.evaluatorView.isBlocked && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-2">현재 단계 내용</h4>
              <div className="text-sm text-gray-600">
                {workshopState.currentStep === 'step1-criteria' && '기준 정의 단계입니다.'}
                {workshopState.currentStep === 'step1-alternatives' && '대안 정의 단계입니다.'}
                {workshopState.currentStep === 'step2-pairwise' && '쌍대비교 평가 단계입니다.'}
                {workshopState.currentStep === 'step3-results' && '결과 확인 단계입니다.'}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkshopVerification;