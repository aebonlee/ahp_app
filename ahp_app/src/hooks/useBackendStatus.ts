import { useState, useCallback } from 'react';
import type { User } from '../types';

interface UseBackendStatusReturn {
  backendStatus: 'checking' | 'available' | 'unavailable';
  showApiErrorModal: boolean;
  isNavigationReady: boolean;
  handleApiRetry: () => void;
  handleCloseApiError: () => void;
}

/**
 * 프론트엔드 전용 모드 — 백엔드 체크 비활성화
 * 백엔드/DB가 삭제되었으므로 API 호출 없이 즉시 준비 완료 상태로 설정
 */
export function useBackendStatus(
  _setUser: React.Dispatch<React.SetStateAction<User | null>>
): UseBackendStatusReturn {
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);

  const handleApiRetry = useCallback(() => {
    setShowApiErrorModal(false);
  }, []);

  const handleCloseApiError = useCallback(() => {
    setShowApiErrorModal(false);
  }, []);

  return {
    backendStatus: 'unavailable',
    showApiErrorModal,
    isNavigationReady: true,
    handleApiRetry,
    handleCloseApiError,
  };
}
