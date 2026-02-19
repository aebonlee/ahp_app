import React, { useState, useEffect } from 'react';
import UnifiedButton from './UnifiedButton';
import LayerPopup from './LayerPopup';
import Modal from './Modal';
import sessionService from '../../services/sessionService';

// localStorage 제거됨 - 서버 기반 세션 정보로 대체

const SessionBar: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    loginTime: string | null;
    lastActivity: string | null;
  }>({ loginTime: null, lastActivity: null });

  useEffect(() => {
    // 세션 상태 확인 및 시간 업데이트 (localStorage 제거됨)
    const updateSessionStatus = async () => {
      const sessionValid = await sessionService.isSessionValid();
      setIsLoggedIn(sessionValid);
      
      if (sessionValid) {
        const remaining = await sessionService.getRemainingTime();
        setRemainingTime(remaining);
        
        // TODO: 서버 API에서 세션 정보 조회
        // setSessionInfo({
        //   loginTime: serverSessionInfo.loginTime,
        //   lastActivity: serverSessionInfo.lastActivity
        // });
      }
    };

    updateSessionStatus();
    const interval = setInterval(updateSessionStatus, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 로그인되지 않은 상태면 렌더링하지 않음
  if (!isLoggedIn) {
    return null;
  }

  const getTimeColor = () => {
    if (remainingTime > 10) return 'bg-green-100 text-green-800 border-green-200';
    if (remainingTime > 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getTimeIcon = () => {
    if (remainingTime > 10) return '🟢';
    if (remainingTime > 5) return '🟡';
    return '🔴';
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          {/* 로고 영역 */}
          <div className="flex items-center" style={{ marginLeft: '50px' }}>
            <img 
              src="/logo192.svg" 
              alt="AHP Platform" 
              className="h-8 w-8 mr-3"
              onError={(e) => {
                // SVG 로드 실패 시 PNG로 대체
                const target = e.target as HTMLImageElement;
                target.src = '/logo192.png';
              }}
            />
            <div className="text-lg font-bold text-gray-900">AHP Platform</div>
          </div>

          {/* 중앙 세션 상태 표시 */}
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center space-x-2 ${getTimeColor()}`}>
              <span>{getTimeIcon()}</span>
              <span>세션: {remainingTime}분 남음</span>
            </div>
            
            {remainingTime <= 5 && (
              <div className="text-sm text-red-600 font-medium animate-pulse">
                ⚠️ 곧 자동 로그아웃됩니다
              </div>
            )}
          </div>

          {/* 오른쪽 세션 컨트롤 버튼들 */}
          <div className="flex items-center space-x-2">
            <UnifiedButton
              variant="info"
              size="sm"
              onClick={() => {
                sessionService.extendSession();
                // 즉시 UI 업데이트 (30분으로 설정)
                setRemainingTime(30);
              }}
              icon="⏰"
              title="세션을 30분 연장합니다"
            >
              +30분 연장
            </UnifiedButton>
            
            <LayerPopup
              trigger={
                <UnifiedButton
                  variant="secondary"
                  size="sm"
                  icon="ℹ️"
                >
                  세션정보
                </UnifiedButton>
              }
              title="세션 상세 정보"
              content={
                <div className="space-y-6">
                  {/* 세션 상태 요약 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-900">현재 세션 상태</h4>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeColor()}`}>
                        {getTimeIcon()} {remainingTime}분 남음
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          remainingTime > 10 ? 'bg-green-500' :
                          remainingTime > 5 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(0, (remainingTime / 30) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      {remainingTime > 10 ? '세션이 안정적으로 유지되고 있습니다.' :
                       remainingTime > 5 ? '세션이 곧 만료됩니다. 연장을 고려하세요.' :
                       '세션이 곧 만료됩니다! 즉시 연장하세요.'}
                    </p>
                  </div>

                  {/* 상세 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-gray-600 text-sm mb-1">로그인 시간</div>
                      <div className="font-medium text-gray-900">
                        {sessionInfo.loginTime ? 
                          new Date(parseInt(sessionInfo.loginTime)).toLocaleString() : 
                          '서버에서 조회 중...'
                        }
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-gray-600 text-sm mb-1">마지막 활동</div>
                      <div className="font-medium text-gray-900">
                        {sessionInfo.lastActivity ? 
                          new Date(parseInt(sessionInfo.lastActivity)).toLocaleString() : 
                          '서버에서 조회 중...'
                        }
                      </div>
                    </div>
                  </div>

                  {/* 도움말 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 text-lg">💡</span>
                      <div>
                        <div className="font-medium text-gray-900 mb-2">세션 관리 가이드</div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start space-x-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>페이지 새로고침(F5) 시에도 30분 이내라면 세션 유지</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>클릭, 키보드, 스크롤 활동으로 자동 갱신</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-orange-600 mt-0.5">⚠</span>
                            <span>5분 전 자동 경고 알림 표시</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-0.5">⏰</span>
                            <span>연장하기 버튼으로 30분 추가 연장 가능</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 빠른 액션 */}
                  <div className="flex justify-center">
                    <UnifiedButton
                      variant="info"
                      size="md"
                      onClick={() => {
                        sessionService.extendSession();
                        setRemainingTime(30);
                      }}
                      icon="⏰"
                      title="세션을 30분 연장합니다"
                    >
                      지금 +30분 연장하기
                    </UnifiedButton>
                  </div>
                </div>
              }
              width="lg"
            />
            
            <UnifiedButton
              variant="danger"
              size="sm"
              onClick={() => setShowLogoutModal(true)}
              icon="🚪"
            >
              로그아웃
            </UnifiedButton>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="로그아웃 확인"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => {
                setShowLogoutModal(false);
                sessionService.logout();
                window.location.reload();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">정말 로그아웃하시겠습니까?</p>
      </Modal>
    </>
  );
};

export default SessionBar;