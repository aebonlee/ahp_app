// 실시간 평가 진행률 추적 컴포넌트
// Opus 4.1 설계 문서 기반

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon 
} from '@heroicons/react/24/outline';
import Card from '../../common/Card';
import type { 
  EvaluationProgress, 
  EvaluationSession,
  HierarchyWebSocketMessage 
} from '../../../types/hierarchy';

interface EvaluationProgressTrackerProps {
  sessionId: string;
  onProgressUpdate?: (progress: EvaluationProgress) => void;
  onSessionUpdate?: (session: EvaluationSession) => void;
  className?: string;
}

const EvaluationProgressTracker: React.FC<EvaluationProgressTrackerProps> = ({
  sessionId,
  onProgressUpdate,
  onSessionUpdate,
  className = ''
}) => {
  const [progress, setProgress] = useState<EvaluationProgress | null>(null);
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // WebSocket 연결 및 실시간 업데이트
  useEffect(() => {
    if (!sessionId) return;

    const wsUrl = `ws://localhost:8000/ws/evaluation/${sessionId}/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsStatus('connected');
      console.log('평가 진행률 WebSocket 연결됨');
    };

    ws.onmessage = (event) => {
      const message: HierarchyWebSocketMessage = JSON.parse(event.data);
      setLastUpdate(new Date());
      
      switch (message.type) {
        case 'evaluation_progress':
          const progressData = message.data as EvaluationProgress;
          setProgress(progressData);
          onProgressUpdate?.(progressData);
          break;
          
        case 'session_update':
          const sessionData = message.data as EvaluationSession;
          setSession(sessionData);
          onSessionUpdate?.(sessionData);
          break;
          
        case 'step_completed':
        case 'consistency_update':
          // 진행률 다시 로드
          fetchProgress();
          break;
      }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      console.log('평가 진행률 WebSocket 연결 종료됨');
    };

    ws.onerror = (error) => {
      setWsStatus('disconnected');
      console.error('WebSocket 오류:', error);
    };

    // 초기 데이터 로드
    fetchProgress();
    fetchSession();

    return () => {
      ws.close();
    };
  }, [sessionId, onProgressUpdate, onSessionUpdate]);

  // 진행률 데이터 가져오기
  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/evaluation-sessions/${sessionId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProgress(result.data);
        }
      }
    } catch (error) {
      console.error('진행률 로드 오류:', error);
    }
  };

  // 세션 데이터 가져오기
  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/evaluation-sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSession(result.data);
        }
      }
    } catch (error) {
      console.error('세션 로드 오류:', error);
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    } else {
      return `${remainingSeconds}초`;
    }
  };

  // 완료 예상 시간 계산
  const getEstimatedCompletion = (): string => {
    if (!progress || progress.estimatedTimeRemaining <= 0) {
      return '계산 중...';
    }
    
    const completionTime = new Date(Date.now() + progress.estimatedTimeRemaining * 1000);
    return completionTime.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!progress || !session) {
    return (
      <Card className={className}>
        <div className="p-4 text-center">
          <div className="text-gray-500">진행률 로딩 중...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            평가 진행 상황
          </h3>
          
          <div className="flex items-center space-x-2">
            {/* WebSocket 연결 상태 */}
            <div className={`
              w-2 h-2 rounded-full
              ${wsStatus === 'connected' ? 'bg-green-500' : 
                wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}
            `} />
            
            {/* 세션 상태 */}
            <span className={`
              px-2 py-1 text-xs rounded-full font-medium
              ${session.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
              ${session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${session.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
            `}>
              {session.status === 'in_progress' && '진행 중'}
              {session.status === 'paused' && '일시정지'}
              {session.status === 'completed' && '완료'}
            </span>
          </div>
        </div>

        {/* 전체 진행률 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              전체 진행률
            </span>
            <span className="text-lg font-bold text-blue-600">
              {progress.progressPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress.progressPercentage}%` }}
            >
              {progress.progressPercentage > 10 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {progress.progressPercentage.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 현재 단계 */}
        {progress.currentStep && (
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {session.status === 'in_progress' ? (
                  <PlayIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <PauseIcon className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">
                  현재 단계: {progress.currentStep.stepType}
                </div>
                <div className="text-sm text-blue-700">
                  {progress.currentStep.nodeName}
                </div>
                
                {progress.currentStep.progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress.currentStep.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 상세 통계 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 노드 진행률 */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {progress.completedNodes}
            </div>
            <div className="text-xs text-gray-600">
              / {progress.totalNodes} 노드
            </div>
            <div className="mt-1">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mx-auto" />
            </div>
          </div>

          {/* 비교 진행률 */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {progress.completedComparisons}
            </div>
            <div className="text-xs text-gray-600">
              / {progress.totalComparisons} 비교
            </div>
            <div className="mt-1">
              <div className="w-4 h-4 bg-blue-500 rounded mx-auto" />
            </div>
          </div>
        </div>

        {/* 시간 정보 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              소요 시간
            </span>
            <span className="font-medium text-gray-900">
              {formatTime(progress.timeElapsed)}
            </span>
          </div>
          
          {progress.estimatedTimeRemaining > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">남은 시간</span>
                <span className="font-medium text-gray-900">
                  {formatTime(progress.estimatedTimeRemaining)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">완료 예상</span>
                <span className="font-medium text-gray-900">
                  {getEstimatedCompletion()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* 일관성 정보 */}
        {progress.averageConsistency !== undefined && (
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                평균 일관성
              </span>
              <div className="flex items-center space-x-2">
                {progress.averageConsistency <= 0.1 ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                )}
                <span className={`
                  text-sm font-medium
                  ${progress.averageConsistency <= 0.1 ? 'text-green-600' : 'text-yellow-600'}
                `}>
                  {(progress.averageConsistency * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              {progress.averageConsistency <= 0.1 
                ? '일관성이 양호합니다' 
                : '일부 비교에서 일관성 검토가 필요합니다'
              }
            </div>
          </div>
        )}

        {/* 마지막 업데이트 시간 */}
        {lastUpdate && (
          <div className="text-xs text-gray-500 text-center">
            마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EvaluationProgressTracker;