import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateCSRFToken, validateCSRFToken } from '../../utils/security';

interface CSRFContextType {
  token: string | null;
  refreshToken: () => void;
  validateToken: (token: string) => boolean;
  isTokenValid: boolean;
}

const CSRFContext = createContext<CSRFContextType | null>(null);

interface CSRFProviderProps {
  children: React.ReactNode;
  tokenRefreshInterval?: number; // 밀리초, 기본값: 30분
}

export const CSRFProvider: React.FC<CSRFProviderProps> = ({ 
  children, 
  tokenRefreshInterval = 30 * 60 * 1000 // 30분
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

  const generateAndSetToken = () => {
    const newToken = generateCSRFToken();
    setToken(newToken);
    setIsTokenValid(true);
    
    // 세션 스토리지에 저장
    sessionStorage.setItem('csrf-token', newToken);
    
    return newToken;
  };

  const refreshToken = () => {
    generateAndSetToken();
  };

  const validateTokenFunc = (tokenToValidate: string) => {
    if (!token) return false;
    return validateCSRFToken(tokenToValidate, token);
  };

  useEffect(() => {
    // 초기 토큰 생성
    const existingToken = sessionStorage.getItem('csrf-token');
    if (existingToken) {
      setToken(existingToken);
      setIsTokenValid(true);
    } else {
      generateAndSetToken();
    }

    // 주기적 토큰 갱신
    const interval = setInterval(() => {
      generateAndSetToken();
    }, tokenRefreshInterval);

    return () => clearInterval(interval);
  }, [tokenRefreshInterval]);

  // 페이지 포커스 시 토큰 검증
  useEffect(() => {
    const handleFocus = () => {
      const sessionToken = sessionStorage.getItem('csrf-token');
      if (sessionToken !== token) {
        generateAndSetToken();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  // 토큰 만료 체크
  useEffect(() => {
    if (token) {
      const tokenAge = Date.now() - parseInt(token.slice(-8), 16);
      if (tokenAge > tokenRefreshInterval) {
        generateAndSetToken();
      }
    }
  }, [token, tokenRefreshInterval]);

  const contextValue: CSRFContextType = {
    token,
    refreshToken,
    validateToken: validateTokenFunc,
    isTokenValid
  };

  return (
    <CSRFContext.Provider value={contextValue}>
      {children}
    </CSRFContext.Provider>
  );
};

export const useCSRF = () => {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
};

// CSRF 보호된 폼 컴포넌트
interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, csrfToken: string) => void;
  className?: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({ 
  children, 
  onSubmit, 
  className = '' 
}) => {
  const { token, refreshToken } = useCSRF();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      console.error('CSRF token not available');
      return;
    }
    
    onSubmit(e, token);
  };

  // 폼 제출 전 토큰 갱신
  useEffect(() => {
    const form = document.querySelector('form');
    if (form) {
      const handleFormFocus = () => {
        refreshToken();
      };
      
      form.addEventListener('focusin', handleFormFocus);
      return () => form.removeEventListener('focusin', handleFormFocus);
    }
  }, [refreshToken]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Hidden CSRF token input */}
      <input 
        type="hidden" 
        name="_csrf" 
        value={token || ''} 
        readOnly 
      />
      {children}
    </form>
  );
};

// API 요청에 CSRF 토큰을 자동으로 포함시키는 훅
export const useSecureAPI = () => {
  const { token } = useCSRF();

  const secureRequest = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token || '',
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { secureRequest };
};