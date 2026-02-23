import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import sessionService from '../services/sessionService';
import { setAPIKeyDirectly } from '../utils/aiInitializer';
import { SUPER_ADMIN_EMAIL } from '../config/api';
import type { User } from '../types';

interface UseBackendStatusReturn {
  backendStatus: 'checking' | 'available' | 'unavailable';
  showApiErrorModal: boolean;
  isNavigationReady: boolean;
  handleApiRetry: () => void;
  handleCloseApiError: () => void;
}

export function useBackendStatus(
  setUser: React.Dispatch<React.SetStateAction<User | null>>
): UseBackendStatusReturn {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('unavailable');
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(true);

  const checkApiConnection = useCallback(async () => {
    try {
      const response = await api.get('/api/');
      if (!response.success) {
        setBackendStatus('unavailable');
        setShowApiErrorModal(true);
      }
    } catch {
      // Background check fails silently
    }
  }, []);

  const validateSession = useCallback(async () => {
    try {
      let token = authService.getAccessToken();

      if (!token) {
        const refreshResult = await authService.refreshAccessToken();
        if (refreshResult.success) {
          token = authService.getAccessToken();
        } else {
          authService.clearTokens();
          setUser(null);
          localStorage.removeItem('ahp_user');
          return;
        }
      }

      if (!token) {
        setUser(null);
        localStorage.removeItem('ahp_user');
        return;
      }

      const response = await api.get('/api/service/accounts/me/');

      if (response.success && response.data) {
        const restoredUser = { ...response.data, admin_type: undefined };
        if (restoredUser.email === SUPER_ADMIN_EMAIL) {
          restoredUser.role = 'super_admin';
        }
        setUser(restoredUser);
        localStorage.setItem('ahp_user', JSON.stringify(restoredUser));
        sessionService.startSession();
      } else if (response.error?.includes('인증이 필요')) {
        const refreshResult = await authService.refreshAccessToken();
        if (refreshResult.success) {
          const newToken = authService.getAccessToken();
          if (newToken) {
            const retryRes = await api.get('/api/service/accounts/me/');
            if (retryRes.success && retryRes.data) {
              const retryUser = { ...retryRes.data, admin_type: undefined };
              if (retryUser.email === SUPER_ADMIN_EMAIL) retryUser.role = 'super_admin';
              setUser(retryUser);
              localStorage.setItem('ahp_user', JSON.stringify(retryUser));
              sessionService.startSession();
            } else {
              authService.clearTokens();
              setUser(null);
              localStorage.removeItem('ahp_user');
            }
          }
        } else {
          authService.clearTokens();
          setUser(null);
          localStorage.removeItem('ahp_user');
        }
      }
    } catch {
      // Session validation failure handled by outer logic
    }
  }, [setUser]);

  const checkBackendAndInitialize = useCallback(async () => {
    try {
      setBackendStatus('checking');
      const response = await api.get('/api/');

      if (response.success) {
        setBackendStatus('available');
        validateSession();

        try {
          const FIXED_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
          const aiService = FIXED_API_KEY ? setAPIKeyDirectly(FIXED_API_KEY, 'openai') : null;
          if (aiService) {
            try { await aiService.validateAPIKey(); } catch { /* non-critical */ }
          }
        } catch { /* AI init non-critical */ }
      } else {
        setBackendStatus('unavailable');
      }
    } catch {
      setBackendStatus('unavailable');
    } finally {
      setIsNavigationReady(true);
    }
  }, [validateSession]);

  // Auto-initialize on mount
  useEffect(() => {
    checkBackendAndInitialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backend monitoring interval
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
    isNavigationReady,
    handleApiRetry,
    handleCloseApiError,
  };
}
