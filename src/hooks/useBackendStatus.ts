/**
 * useBackendStatus.ts - 백엔드 연결 상태 커스텀 Hook
 *
 * Phase 1c 분리 대상 (CLAUDE.md 참조)
 * - 백엔드 서버 연결 상태 체크 (Render.com)
 * - API 오류 모달 표시 관리
 * - 주기적 헬스체크 (5분마다)
 * - AI 서비스 초기화 (OpenAI API 키)
 *
 * @담당 Claude Sonnet 4.6 (구현)
 */

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import { setAPIKeyDirectly } from '../utils/aiInitializer';

type BackendStatus = 'checking' | 'available' | 'unavailable';

interface UseBackendStatusReturn {
  backendStatus: BackendStatus;
  showApiErrorModal: boolean;
  setShowApiErrorModal: (show: boolean) => void;
  checkBackendAndInitialize: () => Promise<void>;
  handleApiRetry: () => void;
  handleCloseApiError: () => void;
}

/**
 * useBackendStatus - 백엔드 연결 상태를 관리하는 커스텀 Hook
 *
 * 초기화 시 백엔드 연결 확인 및 AI 서비스 초기화를 수행합니다.
 * 백엔드 연결 성공 시 5분마다 헬스체크를 반복합니다.
 *
 * @example
 * const { backendStatus, showApiErrorModal, handleApiRetry } = useBackendStatus();
 */
export function useBackendStatus(): UseBackendStatusReturn {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('unavailable');
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);

  // 백그라운드 API 연결 체크
  const checkApiConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(`${API_BASE_URL}/api/`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        setBackendStatus('unavailable');
        setShowApiErrorModal(true);
      }
    } catch {
      // 백그라운드 체크에서는 조용히 실패 처리
    }
  }, []);

  // 백엔드 연결 확인 및 초기화
  const checkBackendAndInitialize = useCallback(async () => {
    try {
      setBackendStatus('checking');

      const response = await fetch(`${API_BASE_URL}/api/`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        console.log('✅ 백엔드 연결 성공');
        setBackendStatus('available');

        // AI 서비스 초기화 (환경변수 기반 OpenAI API 키)
        try {
          const FIXED_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
          const aiService = FIXED_API_KEY ? setAPIKeyDirectly(FIXED_API_KEY, 'openai') : null;

          if (aiService) {
            console.log('✅ AI 서비스 초기화 성공');
            try {
              const isValid = await aiService.validateAPIKey();
              if (!isValid) {
                console.warn('⚠️ ChatGPT API 키 유효성 검증 실패');
              }
            } catch {
              // 키 검증 실패는 무시
            }
          } else {
            console.warn('⚠️ REACT_APP_OPENAI_API_KEY 환경변수가 없음');
          }
        } catch (error) {
          console.error('❌ AI 서비스 초기화 중 예외 발생:', error);
        }
      } else {
        setBackendStatus('unavailable');
      }
    } catch {
      console.log('⚠️ 백엔드 연결 실패 (오프라인 모드로 동작)');
      setBackendStatus('unavailable');
    }
  }, []);

  // 초기 로드 시 백엔드 연결 확인
  useEffect(() => {
    checkBackendAndInitialize();
  }, [checkBackendAndInitialize]);

  // 백엔드 연결 성공 시 5분마다 헬스체크
  useEffect(() => {
    if (backendStatus !== 'available') return;

    const intervalId = setInterval(checkApiConnection, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [backendStatus, checkApiConnection]);

  const handleApiRetry = useCallback(() => {
    setShowApiErrorModal(false);
    checkBackendAndInitialize();
  }, [checkBackendAndInitialize]);

  const handleCloseApiError = useCallback(() => {
    setShowApiErrorModal(false);
  }, []);

  return {
    backendStatus,
    showApiErrorModal,
    setShowApiErrorModal,
    checkBackendAndInitialize,
    handleApiRetry,
    handleCloseApiError,
  };
}

export default useBackendStatus;
